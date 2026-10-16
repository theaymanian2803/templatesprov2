import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL } from '@/lib/site'

const STATIC_PATHS = [
  '/',
  '/templates',
  '/about',
  '/faq',
  '/contact',
  '/license',
  '/terms',
  '/privacy',
  '/cookies',
  '/refunds',
]

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { db } = await import('@/server/db/client')
          const { templates } = await import('@/server/db/schema')
          const rows = await db
            .select({ id: templates.id, updated_at: templates.updated_at })
            .from(templates)

          const urls = [
            ...STATIC_PATHS.map((p) => ({ loc: `${SITE_URL}${p}`, lastmod: null as string | null })),
            ...rows.map((r) => ({
              loc: `${SITE_URL}/template/${r.id}`,
              lastmod: new Date(r.updated_at).toISOString(),
            })),
          ]

          const body = urls
            .map(
              (u) =>
                `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
            )
            .join('\n')

          const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`

          return new Response(xml, {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
            },
          })
        } catch {
          return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
            headers: { 'Content-Type': 'application/xml; charset=utf-8' },
          })
        }
      },
    },
  },
})
