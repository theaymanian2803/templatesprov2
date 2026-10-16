const env = import.meta.env as unknown as Record<string, string | undefined>

/** Display currency for prices. PayPal settlement is USD today; override via VITE_CURRENCY. */
export const CURRENCY = env.VITE_CURRENCY || 'USD'

/**
 * Format a price for display using Intl. Strips decimals for whole amounts
 * (e.g. $59) and keeps two for fractional ones (e.g. $59.50).
 */
export function formatPrice(
  amount: number | string,
  opts?: { currency?: string; locale?: string },
): string {
  const value = Number(amount) || 0
  const currency = opts?.currency ?? CURRENCY
  try {
    return new Intl.NumberFormat(opts?.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value)
  } catch {
    return `$${value}`
  }
}
