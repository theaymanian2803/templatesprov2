import { motion } from 'framer-motion'
import { useTemplates } from '@/hooks/useTemplates'

const MarketplaceStats = () => {
  const { data: templates } = useTemplates({ limit: 6 })

  const stats = [
    { icon: '🏠', label: 'Home of the most popular themes in the world', color: 'bg-orange-50 border-orange-100' },
    { icon: '📋', label: 'Clear documentation and theme support available', color: 'bg-blue-50 border-blue-100' },
    { icon: '✅', label: 'Quality reviewed creators and items', color: 'bg-green-50 border-green-100' },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
          {/* Left: Thumbnail collage */}
          <div className="flex-1 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-3">
              {templates?.slice(0, 6).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                  <img src={t.image_url || '/placeholder.svg'} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
              {!templates && Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </motion.div>
          </div>

          {/* Right: Text + Stats */}
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-8">
              We're the largest theme marketplace in the world
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-5 rounded-lg border ${stat.color}`}>
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <p className="text-sm text-gray-700 leading-snug">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MarketplaceStats
