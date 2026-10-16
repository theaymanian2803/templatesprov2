import { ArrowRight } from 'lucide-react'
import { useNavigate } from '@/lib/router'
import { useCart } from '@/contexts/CartContext'
import { useTranslation } from 'react-i18next'

const ShopPromoBanner = () => {
  const { t } = useTranslation()
  const { setAllAccess } = useCart()
  const navigate = useNavigate()

  const handleGetAllTemplates = () => {
    setAllAccess(true)
    navigate('/checkout')
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-green-500 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-white blur-3xl" />
      </div>
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-5 p-6 md:px-8">
        <div className="max-w-xl">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
            {t('shopPromo.heading')}
          </h3>
          <p className="text-lg md:text-xl font-bold text-white mt-4">
            {t('shopPromo.priceLine')}<span className="text-yellow-300">{t('shopPromo.priceHighlight')}</span>
          </p>
        </div>
        <button
          onClick={handleGetAllTemplates}
          className="shrink-0 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors group whitespace-nowrap cursor-pointer">
          {t('shopPromo.cta')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export default ShopPromoBanner