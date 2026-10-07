import { describe, it, expect } from 'vitest'
import { planKeyIssuance } from '@/server/functions/licenses-core'
import { mintKey } from '@/server/functions/licenses-core'

describe('planKeyIssuance', () => {
  const products = new Map<string, string | null>([
    ['t-petpaw', 'petpaw'],
    ['t-plain', null],
  ])

  it('plans only keyed templates', () => {
    const plan = planKeyIssuance(
      [{ template_id: 't-petpaw' }, { template_id: 't-plain' }],
      products,
      new Set(),
    )
    expect(plan).toEqual([{ template_id: 't-petpaw', product: 'petpaw' }])
  })

  it('skips templates that already have a key', () => {
    const plan = planKeyIssuance([{ template_id: 't-petpaw' }], products, new Set(['t-petpaw']))
    expect(plan).toEqual([])
  })

  it('de-duplicates repeated line items', () => {
    const plan = planKeyIssuance(
      [{ template_id: 't-petpaw' }, { template_id: 't-petpaw' }],
      products,
      new Set(),
    )
    expect(plan).toHaveLength(1)
  })
})

describe('mintKey', () => {
  it('returns the key on 200', async () => {
    process.env.LICENSE_SERVER_URL = 'https://lic.example.com'
    process.env.LICENSE_API_SECRET = 'pw'
    const fake = (async () => new Response(JSON.stringify({ key: 'PETPAW-AAAA-BBBB-CCCC' }), { status: 200 })) as unknown as typeof fetch
    expect(await mintKey('petpaw', 'order:1', fake)).toBe('PETPAW-AAAA-BBBB-CCCC')
  })

  it('sends the shared secret and product', async () => {
    process.env.LICENSE_SERVER_URL = 'https://lic.example.com'
    process.env.LICENSE_API_SECRET = 'pw'
    let seen: { url: string; init?: RequestInit } | null = null
    const fake = (async (url: string, init?: RequestInit) => {
      seen = { url, init }
      return new Response(JSON.stringify({ key: 'K' }), { status: 200 })
    }) as unknown as typeof fetch
    await mintKey('petpaw', 'order:9', fake)
    expect(seen!.url).toBe('https://lic.example.com/v1/keys')
    expect((seen!.init!.headers as Record<string, string>)['x-admin-password']).toBe('pw')
    expect(JSON.parse(String(seen!.init!.body))).toEqual({ product: 'petpaw', note: 'order:9' })
  })

  it('returns null on a non-200', async () => {
    process.env.LICENSE_SERVER_URL = 'https://lic.example.com'
    process.env.LICENSE_API_SECRET = 'pw'
    const fake = (async () => new Response('nope', { status: 500 })) as unknown as typeof fetch
    expect(await mintKey('petpaw', 'order:1', fake)).toBeNull()
  })

  it('returns null when env is missing', async () => {
    delete process.env.LICENSE_SERVER_URL
    delete process.env.LICENSE_API_SECRET
    expect(await mintKey('petpaw', 'order:1')).toBeNull()
  })
})