export type KeyPlanItem = { template_id: string; product: string }

/** Which keyed templates still need a key minted for this order. Pure. */
export function planKeyIssuance(
  items: { template_id: string }[],
  productByTemplate: Map<string, string | null>,
  existingTemplateIds: Set<string>,
): KeyPlanItem[] {
  const plan: KeyPlanItem[] = []
  const queued = new Set<string>()
  for (const item of items) {
    const product = productByTemplate.get(item.template_id)
    if (!product) continue
    if (existingTemplateIds.has(item.template_id)) continue
    if (queued.has(item.template_id)) continue
    queued.add(item.template_id)
    plan.push({ template_id: item.template_id, product })
  }
  return plan
}

/** Calls the license server to mint a key. Never throws; null means "try again later". */
export async function mintKey(
  product: string,
  note: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const url = process.env.LICENSE_SERVER_URL
  const secret = process.env.LICENSE_API_SECRET
  if (!url || !secret) {
    console.warn('[licenses] LICENSE_SERVER_URL / LICENSE_API_SECRET not set; skipping key mint')
    return null
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetchImpl(`${url.replace(/\/$/, '')}/v1/keys`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-password': secret },
      body: JSON.stringify({ product, note }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const data = (await res.json()) as { key?: string }
    return data.key ?? null
  } catch {
    return null
  }
}