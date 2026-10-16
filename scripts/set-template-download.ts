/*
  set-template-download.ts — repoint an existing template's download file.

  Uploads a new .zip to Cloudflare R2 and updates the matching row's
  `template_downloads.source_file_url`. Does NOT change any other template field.

  Usage:
    tsx scripts/set-template-download.ts --zip <file.zip> --title "<unique title substring>" [--key <key>] [--dry-run] [--allow-unsafe]
    tsx scripts/set-template-download.ts --zip <file.zip> --id <template-id> [--dry-run] [--allow-unsafe]

  Never prints secret values.
*/

import { existsSync, readFileSync, statSync, openSync, readSync, closeSync } from 'node:fs'
import { basename } from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { eq, like } from 'drizzle-orm'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { templates, template_downloads } from '../src/server/db/schema'

function loadEnv(path: string) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (process.env[m[1]] === undefined) process.env[m[1]] = v
  }
}

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
    if (eocd < 0) throw new Error('Not a valid zip archive.')
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

function parseArgs(argv: string[]) {
  const out: { zip?: string; title?: string; id?: string; key?: string; dryRun: boolean; allowUnsafe: boolean } = { dryRun: false, allowUnsafe: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    switch (a) {
      case '--zip': out.zip = next(); break
      case '--title': out.title = next(); break
      case '--id': out.id = next(); break
      case '--key': out.key = next(); break
      case '--dry-run': out.dryRun = true; break
      case '--allow-unsafe': out.allowUnsafe = true; break
    }
  }
  return out
}

async function main() {
  loadEnv('.env')
  const args = parseArgs(process.argv.slice(2))
  if (!args.zip) throw new Error('Missing --zip <file.zip>')
  if (!existsSync(args.zip)) throw new Error(`--zip not found: ${args.zip}`)
  if (!args.id && !args.title) throw new Error('Provide --id <template-id> or --title "<substring>"')

  const names = listZipEntries(args.zip)
  const unsafe = unsafeEntries(names)
  if (unsafe.length && !args.allowUnsafe) {
    throw new Error(
      `Refusing: zip contains ${unsafe.length} unsafe entr(ies):\n  ` +
        unsafe.slice(0, 10).join('\n  ') +
        '\nPass --allow-unsafe to override.'
    )
  }

  const key = args.key || `${basename(args.zip).replace(/\.zip$/i, '')}-${Date.now()}.zip`
  const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`

  const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_TOKEN! })
  const db = drizzle(client, { schema: { templates, template_downloads } })

  const rows = args.id
    ? await db.select().from(templates).where(eq(templates.id, args.id))
    : await db.select().from(templates).where(like(templates.title, `%${args.title}%`))

  if (rows.length === 0) throw new Error('No matching template row.')
  if (rows.length > 1) {
    console.log('Multiple matches — narrow with --id or a more specific --title:')
    for (const r of rows) console.log(`  ${r.id}  ${r.title}`)
    throw new Error('Ambiguous match.')
  }
  const tpl = rows[0]
  const existing = await db.select().from(template_downloads).where(eq(template_downloads.template_id, tpl.id))
  const oldUrl = existing[0]?.source_file_url ?? '(none)'

  if (args.dryRun) {
    console.log('\n=== DRY RUN — nothing written ===')
    console.log('match       :', tpl.id, '|', tpl.title)
    console.log('zip         :', args.zip, `(${(statSync(args.zip).size / 1024 / 1024).toFixed(2)} MB, ${names.length} entries)`)
    console.log('unsafe      :', unsafe.length ? unsafe.slice(0, 10).join(', ') : 'none')
    console.log('old url     :', oldUrl)
    console.log('new r2 key  :', key)
    console.log('new url     :', publicUrl)
    await client.close()
    return
  }

  for (const k of ['TURSO_URL', 'TURSO_AUTH_TOKEN', 'R2_ACCOUNT_ID', 'R2_BUCKET_NAME', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_DOMAIN']) {
    if (!process.env[k]) throw new Error(`Missing required env var: ${k} (check .env)`)
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
    forcePathStyle: true,
  })
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: 'application/zip',
    Body: readFileSync(args.zip),
  }))
  console.log('uploaded zip →', publicUrl)

  if (existing.length) {
    await db.update(template_downloads).set({ source_file_url: publicUrl }).where(eq(template_downloads.template_id, tpl.id))
  } else {
    await db.insert(template_downloads).values({ template_id: tpl.id, source_file_url: publicUrl })
  }

  console.log('\n=== UPDATED ===')
  console.log('template id :', tpl.id)
  console.log('title       :', tpl.title)
  console.log('old url     :', oldUrl)
  console.log('new url     :', publicUrl)
  await client.close()
}

main().catch((e) => {
  console.error('\nFailed:', e instanceof Error ? e.message : e)
  process.exit(1)
})
