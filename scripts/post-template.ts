/*
  post-template.ts — one command to publish a template to the catalog.

  What it does:
    1. Scans a build folder and auto-derives title / descriptions / tech stack / features.
    2. Safety-scans the buyer .zip (refuses to ship .env / .git / node_modules).
    3. Uploads the .zip to Cloudflare R2.
    4. Inserts the `templates` + `template_downloads` rows into Turso.

  Usage:
    npx tsx scripts/post-template.ts --dir <folder> --zip <file.zip> [--price 0] [--category E-commerce]
                                    [--meta fields.json] [--key custom.zip] [--dry-run] [--allow-unsafe]
    npm run post:template -- --dir <folder> --zip <file.zip>

  Never prints secret values.
*/

import { existsSync, readFileSync, statSync, readdirSync, openSync, readSync, closeSync } from 'node:fs'
import { join, basename, resolve } from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { templates, template_downloads } from '../src/server/db/schema'

/* ------------------------------------------------------------------ args */

type Args = {
  dir?: string
  zip?: string
  price: number
  category?: string
  meta?: string
  key?: string
  dryRun: boolean
  allowUnsafe: boolean
}

function parseArgs(argv: string[]): Args {
  const out: Args = { price: 0, dryRun: false, allowUnsafe: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    switch (a) {
      case '--dir': out.dir = next(); break
      case '--zip': out.zip = next(); break
      case '--price': out.price = Number(next()) || 0; break
      case '--category': out.category = next(); break
      case '--meta': out.meta = next(); break
      case '--key': out.key = next(); break
      case '--dry-run': out.dryRun = true; break
      case '--allow-unsafe': out.allowUnsafe = true; break
      default: break
    }
  }
  return out
}

/* ------------------------------------------------------------------- env */

function loadEnv(path: string) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = v
  }
}

/* --------------------------------------------------------------- zip scan */

// Minimal ZIP central-directory reader — dependency free. Lists entry names only.
function listZipEntries(zipPath: string): string[] {
  const fd = openSync(zipPath, 'r')
  try {
    const size = statSync(zipPath).size
    const back = Math.min(size, 65557)
    const tail = Buffer.alloc(back)
    readSync(fd, tail, 0, back, size - back)

    let eocd = -1
    for (let i = tail.length - 22; i >= 0; i--) {
      if (tail.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
    }
    if (eocd < 0) throw new Error('Not a valid zip archive (no end-of-central-directory record).')

    const count = tail.readUInt16LE(eocd + 10)
    const cdOffset = tail.readUInt32LE(eocd + 16)
    if (cdOffset === 0xffffffff) throw new Error('Zip64 archives are not supported.')

    const cd = Buffer.alloc(size - cdOffset)
    readSync(fd, cd, 0, cd.length, cdOffset)

    const names: string[] = []
    let p = 0
    for (let i = 0; i < count; i++) {
      if (cd.readUInt32LE(p) !== 0x02014b50) break
      const fnLen = cd.readUInt16LE(p + 28)
      const exLen = cd.readUInt16LE(p + 30)
      const cmLen = cd.readUInt16LE(p + 32)
      names.push(cd.toString('utf8', p + 46, p + 46 + fnLen))
      p += 46 + fnLen + exLen + cmLen
    }
    return names
  } finally {
    closeSync(fd)
  }
}

function unsafeEntries(names: string[]): string[] {
  return names.filter((n) => {
    const norm = n.replace(/\\/g, '/')
    const isEnv = /(^|\/)\.env(\.[a-z0-9]+)?$/i.test(norm) && !/\.env\.example$/i.test(norm)
    const isGit = /(^|\/)\.git\//.test(norm)
    const isModules = /(^|\/)node_modules\//.test(norm)
    return isEnv || isGit || isModules
  })
}

/* ------------------------------------------------- folder metadata scan */

const readIf = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

function mdSection(md: string, heading: string): string {
  const re = new RegExp(`^##\\s+${heading}\\s*$`, 'im')
  const idx = md.search(re)
  if (idx < 0) return ''
  const rest = md.slice(idx).replace(/^[^\n]*\n/, '')
  const end = rest.search(/^##\s+/m)
  return (end < 0 ? rest : rest.slice(0, end)).trim()
}

function firstSentences(text: string, n: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  const parts = clean.match(/[^.!?]+[.!?]+/g) || [clean]
  return parts.slice(0, n).join(' ').replace(/\s+/g, ' ').trim()
}

function trimWords(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')).trim()
}

function humanize(name: string): string {
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim()
}

function major(v?: string): string {
  const m = (v || '').match(/\d+/)
  return m ? m[0] : ''
}

function findNamed(dir: string, re: RegExp, depth = 4): boolean {
  if (depth < 0) return false
  let entries: string[] = []
  try { entries = readdirSync(dir) } catch { return false }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.git' || e === 'dist') continue
    const full = join(dir, e)
    let isDir = false
    try { isDir = statSync(full).isDirectory() } catch { continue }
    if (re.test(e)) return true
    if (isDir && findNamed(full, re, depth - 1)) return true
  }
  return false
}

type Meta = {
  title: string
  category: string
  description: string
  admin_description: string
  tech_stack: string[]
  features: string[]
}

function deriveMeta(dir: string, args: Args): Meta {
  const pkg = JSON.parse(readIf(join(dir, 'package.json')) || '{}')
  const deps: Record<string, string> = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
  const product = readIf(join(dir, 'PRODUCT.md'))
  const instructions = readIf(join(dir, 'INSTRUCTIONS.md'))

  /* tech stack */
  const stack: string[] = []
  const has = (k: string) => !!deps[k]
  if (has('react')) stack.push(`React ${major(deps.react)}`.trim())
  if (has('typescript')) stack.push('TypeScript')
  if (has('vite')) stack.push(`Vite ${major(deps.vite)}`.trim())
  if (has('tailwindcss')) stack.push(`Tailwind CSS v${major(deps.tailwindcss)}`)
  if (existsSync(join(dir, 'components.json')) || Object.keys(deps).some((d) => d.startsWith('@radix-ui/'))) {
    stack.push('shadcn/ui')
  }
  if (has('@libsql/client')) stack.push('Turso (libSQL)')
  if (has('react-router-dom') || has('react-router')) stack.push('React Router')
  if (has('recharts')) stack.push('Recharts')
  if (has('@tanstack/react-start')) stack.push('TanStack Start')
  if (has('framer-motion')) stack.push('Framer Motion')
  if (has('i18next') || has('react-i18next')) stack.push('i18n')

  /* features — filesystem probes */
  const isStore = /store|commerce|shop|cart/i.test(product + instructions + pkg.name)
  const hasAdmin = findNamed(dir, /^admin$/i) || findNamed(dir, /Admin/i)

  const features: string[] = []
  if (isStore) features.push('Storefront, catalog & cart')
  if (hasAdmin) features.push('Admin dashboard')
  if (findNamed(dir, /Cart/i) || findNamed(dir, /Checkout/i)) features.push('Cart & checkout flow')
  if (findNamed(dir, /i18n/i)) features.push('Multilingual (i18n)')
  if (findNamed(dir, /^scripts$/i)) features.push('Seed scripts included')
  if (has('recharts')) features.push('Analytics charts')
  if (instructions) features.push('Step-by-step deploy guide')
  if (findNamed(dir, /Sections?Manager|Section/i)) features.push('Editable homepage sections')

  /* copy */
  const brandHeading = instructions.match(/^#\s+(.+)$/m)?.[1] ?? ''
  const brand = brandHeading.split(/\s[—–-]\s/)[0].trim() || humanize(basename(resolve(dir)))
  const purpose = firstSentences(mdSection(product, 'Product Purpose'), 2)
  const adminSource = mdSection(product, 'Operating Context') || mdSection(product, 'Capabilities and Constraints')

  const category =
    args.category ||
    (/commerce|e-commerce|store|shop/i.test(product + instructions) ? 'E-commerce' : 'Other')

  const kind = isStore && hasAdmin
    ? 'Store & Admin Dashboard'
    : isStore
      ? 'E-commerce Store'
      : hasAdmin
        ? 'Admin Dashboard'
        : 'Web Template'
  const title = trimWords(brand ? `${brand} — ${kind}` : humanize(basename(resolve(dir))), 100)

  const derived: Meta = {
    title,
    category,
    description: purpose || `${brand} — a modern, ready-to-ship web template.`,
    admin_description: firstSentences(adminSource, 3) || '',
    tech_stack: [...new Set(stack)],
    features: [...new Set(features)],
  }

  if (args.meta) {
    const override = JSON.parse(readIf(resolve(args.meta)) || '{}')
    return { ...derived, ...override }
  }
  return derived
}

/* ------------------------------------------------------------------- main */

async function main() {
  loadEnv(resolve('.env'))

  const args = parseArgs(process.argv.slice(2))
  if (!args.dir) throw new Error('Missing --dir <build folder>')
  if (!existsSync(args.dir)) throw new Error(`--dir not found: ${args.dir}`)
  if (!args.zip) throw new Error('Missing --zip <buyer .zip>')
  if (!existsSync(args.zip)) throw new Error(`--zip not found: ${args.zip}`)

  const zipPath = resolve(args.zip)
  const dir = resolve(args.dir)

  /* safety scan */
  const names = listZipEntries(zipPath)
  const unsafe = unsafeEntries(names)
  if (unsafe.length && !args.allowUnsafe) {
    throw new Error(
      `Refusing to publish: zip contains ${unsafe.length} unsafe entr(ies):\n  ` +
        unsafe.slice(0, 10).join('\n  ') +
        '\nRe-package without secrets, or pass --allow-unsafe to override.'
    )
  }

  const meta = deriveMeta(dir, args)
  const key = args.key || `${basename(dir)}-${Date.now()}.zip`
  const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`

  const row = {
    title: meta.title,
    description: meta.description,
    admin_description: meta.admin_description || null,
    category: meta.category,
    price: args.price,
    image_url: '',
    gallery_images: [],
    tech_stack: meta.tech_stack,
    features: meta.features,
    featured: false,
  }

  if (args.dryRun) {
    console.log('\n=== DRY RUN — nothing written ===')
    console.log('zip entries :', names.length, `(${(statSync(zipPath).size / 1024 / 1024).toFixed(2)} MB)`)
    console.log('r2 key      :', key)
    console.log('public url  :', publicUrl)
    console.log('templates row:')
    console.log(JSON.stringify(row, null, 2))
    return
  }

  for (const k of ['TURSO_URL', 'TURSO_AUTH_TOKEN', 'R2_ACCOUNT_ID', 'R2_BUCKET_NAME', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_DOMAIN']) {
    if (!process.env[k]) throw new Error(`Missing required env var: ${k} (check .env)`)
  }

  /* upload to R2 */
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  })
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: 'application/zip',
      Body: readFileSync(zipPath),
    })
  )
  console.log('uploaded zip →', publicUrl)

  /* insert rows */
  const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! })
  const db = drizzle(client, { schema: { templates, template_downloads } })

  const [created] = await db.insert(templates).values(row).returning()
  await db.insert(template_downloads).values({ template_id: created.id, source_file_url: publicUrl })

  console.log('\n=== PUBLISHED ===')
  console.log('template id :', created.id)
  console.log('title       :', created.title)
  console.log('category    :', created.category)
  console.log('price       :', created.price)
  console.log('source file :', publicUrl)
  console.log('edit at     : /admin (add the image + price when ready)')

  await client.close()
}

main().catch((e) => {
  console.error('\nFailed:', e instanceof Error ? e.message : e)
  process.exit(1)
})
