import { useTranslation } from 'react-i18next'

type Section = { heading: string; body?: string; intro?: string; items?: string[] }
type PageKey = 'terms' | 'privacy' | 'cookies' | 'license' | 'refunds'

const LegalPage = ({ pageKey }: { pageKey: PageKey }) => {
  const { t } = useTranslation()
  const sections = t(`legal.${pageKey}.sections`, { returnObjects: true }) as unknown as Section[]

  return (
    <>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
        {t(`legal.${pageKey}.title`)}
      </h1>
      <p className="text-muted-foreground mb-12">{t('legal.updated')}</p>

      <div className="prose prose-lg max-w-none space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">{s.heading}</h2>
            {s.intro && <p className="text-muted-foreground leading-relaxed">{s.intro}</p>}
            {s.body && <p className="text-muted-foreground leading-relaxed">{s.body}</p>}
            {s.items && (
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                {s.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  )
}

export default LegalPage
