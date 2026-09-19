import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'

const ShopPromoBanner = () => {
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
            Get unlimited downloads for all kinds of websites — SaaS, eCommerce, Blog &amp; more.
          </h3>
          <p className="text-lg md:text-xl font-bold text-white mt-4">
            All templates. One price. <span className="text-yellow-300">$300 USD — Build anything.</span>
          </p>
        </div>
        <button
          onClick={handleGetAllTemplates}
          className="shrink-0 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors group whitespace-nowrap cursor-pointer">
          Get all templates
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export default ShopPromoBanner