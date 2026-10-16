const PAYPAL_API =
  process.env.PAYPAL_ENVIRONMENT === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

export async function paypalAccessToken(): Promise<string> {
  const clientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET
  if (!clientId || !secret) throw new Error('PayPal credentials not configured')
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`PayPal Auth Error: ${data.error_description || data.error}`)
  return data.access_token
}

export { PAYPAL_API }

/**
 * Refund the captured payment for a PayPal order (full refund). Looks up the
 * capture id from the order, then refunds it. Idempotent: an already-refunded
 * capture is treated as success.
 */
export async function refundPayPalOrder(paypalOrderId: string): Promise<{ refunded: boolean; captureId: string }> {
  const token = await paypalAccessToken()

  const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const orderData = await orderRes.json()
  if (!orderRes.ok) {
    throw new Error(`PayPal order lookup failed: ${orderData.message || orderRes.status}`)
  }
  const capture = orderData.purchase_units?.[0]?.payments?.captures?.[0]
  if (!capture?.id) throw new Error('No PayPal capture found for this order')
  if (capture.status === 'REFUNDED' || capture.status === 'PARTIALLY_REFUNDED') {
    return { refunded: true, captureId: capture.id }
  }

  const refundRes = await fetch(`${PAYPAL_API}/v2/payments/captures/${capture.id}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })
  const refundData = await refundRes.json()
  if (!refundRes.ok) {
    if (refundData?.details?.[0]?.issue === 'CAPTURE_FULLY_REFUNDED') {
      return { refunded: true, captureId: capture.id }
    }
    throw new Error(`PayPal refund failed: ${refundData.message || refundRes.status}`)
  }
  return { refunded: true, captureId: capture.id }
}
