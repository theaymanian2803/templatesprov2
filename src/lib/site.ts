const env = import.meta.env as unknown as Record<string, string | undefined>

/** Absolute site origin used for canonical + Open Graph URLs. */
export const SITE_URL = (env.VITE_SITE_URL || 'https://unccodestore.com').replace(/\/$/, '')

interface SeoInput {
  title: string
  description: string
  path?: string
  image?: string
}

/**
 * Builds a TanStack Router `head` result (meta tags + canonical link) for a page.
 */
export const seoHead = ({ title, description, path = '/', image }: SeoInput) => {
  const fullTitle = title.includes('Unccodestore') ? title : `${title} — Unccodestore`
  const url = `${SITE_URL}${path}`
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary_large_image' },
      ...(image ? [{ property: 'og:image', content: image }] : []),
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
