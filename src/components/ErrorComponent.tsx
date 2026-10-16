import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@/lib/router'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

interface ErrorComponentProps {
  error: Error
  reset: () => void
}

/**
 * Route-level error boundary rendered by the router when a route throws.
 * Logs the error and offers recovery without a blank screen.
 */
const ErrorComponent = ({ error, reset }: ErrorComponentProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    logger.error('Route render error', { message: error?.message, stack: error?.stack })
  }, [error])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">{t('errors.title')}</h1>
        <p className="text-muted-foreground mb-6">{t('errors.desc')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            {t('errors.retry')}
          </Button>
          <Link to="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              {t('errors.home')}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default ErrorComponent
