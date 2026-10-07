import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const h = vi.hoisted(() => {
  const state = {
    selects: [] as unknown[][],
    inserts: [] as Record<string, unknown>[],
  }
  const makeSelect = () => {
    const rows = state.selects.shift() ?? []
    const result: any = Promise.resolve(rows)
    result.limit = () => Promise.resolve(rows)
    return { from: () => ({ where: () => result }) }
  }
  const db = {
    select: () => makeSelect(),
    insert: () => ({
      values: (v: Record<string, unknown>) => {
        state.inserts.push(v)
        return { onConflictDoNothing: () => Promise.resolve() }
      },
    }),
  }
  return { state, db }
})

vi.mock('@/server/db/client', () => ({ db: h.db, client: {} }))
vi.mock('@/server/admin', () => ({ requireUser: vi.fn() }))
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => ({ handler: (fn: unknown) => fn }) }))

import { issueKeysForOrder } from '@/server/functions/licenses'

const USER = 'user-1'
const ORDER = 'order-1'

function setFixtures(opts: { items: unknown[]; templates: unknown[]; existing?: unknown[] }) {
  h.state.selects = [
    [{ id: ORDER, user_id: USER }],
    opts.items,
    opts.templates,
    opts.existing ?? [],
  ]
}

beforeEach(() => {
  h.state.selects = []
  h.state.inserts = []
  process.env.LICENSE_SERVER_URL = 'https://lic.example.com'
  process.env.LICENSE_API_SECRET = 'pw'
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.LICENSE_SERVER_URL
  delete process.env.LICENSE_API_SECRET
})

describe('issueKeysForOrder', () => {
  it('does not throw when the license-server fetch rejects, and inserts no rows', async () => {
    setFixtures({
      items: [{ template_id: 't-petpaw' }],
      templates: [{ id: 't-petpaw', title: 'PetPaw', license_product: 'petpaw' }],
    })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('license server down')))

    await expect(issueKeysForOrder(ORDER)).resolves.toBeUndefined()
    expect(h.state.inserts).toHaveLength(0)
  })

  it('is idempotent: does not mint or insert when a key row already exists', async () => {
    setFixtures({
      items: [{ template_id: 't-petpaw' }],
      templates: [{ id: 't-petpaw', title: 'PetPaw', license_product: 'petpaw' }],
      existing: [{ template_id: 't-petpaw' }],
    })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    await issueKeysForOrder(ORDER)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(h.state.inserts).toHaveLength(0)
  })

  it('skips templates whose license_product is null', async () => {
    setFixtures({
      items: [{ template_id: 't-plain' }],
      templates: [{ id: 't-plain', title: 'Plain', license_product: null }],
    })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    await issueKeysForOrder(ORDER)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(h.state.inserts).toHaveLength(0)
  })

  it('mints and inserts one key per keyed item', async () => {
    setFixtures({
      items: [{ template_id: 't-petpaw' }],
      templates: [{ id: 't-petpaw', title: 'PetPaw', license_product: 'petpaw' }],
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ key: 'PETPAW-TEST-0001' }), { status: 200 })),
    )

    await issueKeysForOrder(ORDER)
    expect(h.state.inserts).toHaveLength(1)
    expect(h.state.inserts[0]).toMatchObject({
      user_id: USER,
      template_id: 't-petpaw',
      product: 'petpaw',
      key: 'PETPAW-TEST-0001',
      order_id: ORDER,
    })
  })
})
