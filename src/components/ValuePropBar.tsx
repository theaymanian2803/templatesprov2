import { motion } from 'framer-motion'
import { CheckCircle2, Layers, ShieldCheck } from 'lucide-react'

const benefits = [
  {
    icon: CheckCircle2,
    title: 'Quality checked',
    desc: 'Every asset is reviewed by professionals before it goes live.',
  },
  {
    icon: Layers,
    title: 'Future-proof stacks',
    desc: 'Modern tech you can trust: React, Next.js, MERN, Tailwind and more.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    desc: 'Encrypted checkout and a money-back guarantee on every purchase.',
  },
]

const ValuePropBar = () => {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-start gap-3 md:px-4">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm leading-tight">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-snug mt-0.5">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ValuePropBar