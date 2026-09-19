import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Wallet, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const perks = [
  { icon: Wallet, label: 'Keep up to 70% of every sale' },
  { icon: TrendingUp, label: 'Reach 50K+ active buyers' },
  { icon: Users, label: 'Join 2,400+ verified authors' },
]

const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.96, 1])

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Dark sophisticated background */}
      <div className="absolute inset-0 bg-foreground" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[130px]" />
      </div>


      <div className="container mx-auto relative z-10">
        <motion.div style={{ scale }} className="max-w-3xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold text-primary uppercase tracking-wider">
            For creators
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-background mt-4 mb-6 leading-[1.05] tracking-tight">
            Join our community of{' '}
            <span className="gradient-text-primary">creators.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="text-lg text-background/60 mb-10 max-w-2xl mx-auto">
            Turn your code and designs into income. Sell your templates and source code to a global
            audience of builders — we handle the payments, delivery, and quality reviews.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button
                size="xl"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary group w-full sm:w-auto">
                Become an Author
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="ghost"
                size="xl"
                className="text-background/80 hover:text-background hover:bg-background/10 border border-background/15 w-full sm:w-auto">
                Learn how it works
              </Button>
            </Link>
          </motion.div>

          {/* Perks row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.32 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12">
            {perks.map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-background/70">
                <p.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{p.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection