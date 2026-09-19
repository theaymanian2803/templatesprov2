export function seededRandom(seed: string): () => number {
  let s = 0
  for (let i = 0; i < seed.length; i++) {
    s = ((s << 5) - s + seed.charCodeAt(i)) | 0
  }
  s = Math.abs(s) || 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const arr = [...items]
  const rand = seededRandom(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

export function getPlaceholderReviewCount(templateId: string): number {
  const rand = seededRandom(templateId + '_rc')
  return Math.floor(rand() * 4) + 3
}

export function getPlaceholderSales(templateId: string): number {
  const rand = seededRandom(templateId + '_sales')
  return Math.floor(rand() * 24) + 7
}

export function formatSales(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `${n}`
}

export function getDisplaySales(templateId: string, realSales?: number | null): number {
  return getPlaceholderSales(templateId) + (Number(realSales) || 0)
}

export function getDisplayReviewCount(templateId: string, realCount?: number | null): number {
  return getPlaceholderReviewCount(templateId) + (Number(realCount) || 0)
}

export function getPlaceholderRating(templateId: string): number {
  const rand = seededRandom(templateId)
  return rand() > 0.45 ? 5 : 4.5
}

export function getDisplayRating(templateId: string, realRating?: number | null): number {
  const r = Number(realRating) || 0
  return r > 0 ? r : getPlaceholderRating(templateId)
}