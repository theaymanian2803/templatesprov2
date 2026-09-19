import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import {
  Clock,
  FileQuestion,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const methodIcons = [Mail, Phone, MessageSquare, MapPin]

const quickLinks = [
  { icon: FileQuestion, title: 'FAQ', description: 'Réponses rapides', href: '/faq' },
  {
    icon: Headphones,
    title: 'Centre d\'aide',
    description: 'Aide technique',
    href: '/faq#support',
  },
]

const contactData = {
  hero_badge: 'Contactez-nous',
  hero_headline: 'Nous serions ravis de',
  hero_highlight: 'vous entendre',
  hero_subheadline: 'Une question, un feedback ou besoin d\'aide ? Notre équipe est là pour vous.',
  contact_methods: [
    { title: 'Nous écrire', description: 'Envoyez-nous un email à tout moment', value: 'hello@unccodestore.com', action: 'mailto:hello@unccodestore.com' },
    { title: 'Nous appeler', description: 'Lun-Ven, 9h-18h (heure EST)', value: '+1 (555) 123-4567', action: 'tel:+15551234567' },
    { title: 'Chat en direct', description: 'Discutez avec notre équipe', value: 'Disponible 24h/24', action: '#' },
    { title: 'Nous rendre visite', description: 'Notre siège social', value: '123 Design Street, NYC', action: '#' },
  ],
  form_title: 'Envoyez-nous un message',
  form_subtitle: 'Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.',
  business_hours: [
    { day: 'Lundi - Vendredi', hours: '9h00 - 18h00 (EST)' },
    { day: 'Samedi', hours: '10h00 - 16h00 (EST)' },
    { day: 'Dimanche', hours: 'Fermé' },
  ],
  live_chat_note: '💬 Chat en direct disponible 24h/24',
  response_times: [
    { label: 'Email', time: 'Sous 24 heures' },
    { label: 'Chat en direct', time: 'Instantané' },
    { label: 'Téléphone', time: 'Pendant les heures d\'ouverture' },
  ],
  location_title: 'Notre adresse',
  location_subtitle: 'Rendez-nous visite à notre siège social',
  location_address_line1: '123 Design Street',
  location_address_line2: 'New York, NY 10001',
  location_lat: 40.7128,
  location_lng: -74.006,
  location_zoom: 15,
}

const Contact = () => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const s = contactData

  const contactMethods = s.contact_methods.map((m, i) => ({
    ...m,
    icon: methodIcons[i % methodIcons.length],
  }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const orderNumber = formData.get('orderNumber') as string
    const rawMessage = formData.get('message') as string

    const fullName = `${firstName} ${lastName}`.trim()
    const finalMessage = orderNumber ? `Order Number: ${orderNumber}\n\n${rawMessage}` : rawMessage

    const { error } = await supabase.from('contacts').insert([
      {
        name: fullName,
        email: email,
        subject: subject,
        message: finalMessage,
      },
    ])

    setIsSubmitting(false)

    if (error) {
      toast({ title: 'Erreur lors de l\'envoi', description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: 'Message envoyé !', description: 'Nous vous répondrons sous 24 heures.' })
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-5 pb-16 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-100 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl" />

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-500 font-medium text-sm mb-6">
              <Mail className="w-4 h-4" />
              {s?.hero_badge || 'Contactez-nous'}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1]">
              {s?.hero_headline || "Nous serions ravis de"}{' '}
              <span className="text-orange-500">
                {s?.hero_highlight || 'vous entendre'}
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-[1.7]">
              {s?.hero_subheadline ||
                'Une question, un feedback ou besoin d\'aide ? Notre équipe est là pour vous.'}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                  <method.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{method.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{method.description}</p>
                <p className="text-sm font-medium text-orange-500">{method.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white p-8 rounded-xl border border-gray-200">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                  {s?.form_title || 'Envoyez-nous un message'}
                </h2>
                <p className="text-gray-500 mb-8 leading-[1.7]">
                  {s?.form_subtitle ||
                    "Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" name="firstName" placeholder="Jean" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" name="lastName" placeholder="Dupont" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jean@exemple.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Select name="subject" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un sujet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Demande générale</SelectItem>
                        <SelectItem value="support">Support technique</SelectItem>
                        <SelectItem value="sales">Question commerciale</SelectItem>
                        <SelectItem value="licensing">Aide licence</SelectItem>
                        <SelectItem value="refund">Demande de remboursement</SelectItem>
                        <SelectItem value="partnership">Partenariat</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Numéro de commande (optionnel)</Label>
                    <Input id="orderNumber" name="orderNumber" placeholder="TP-XXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Dites-nous comment nous pouvons vous aider..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Liens rapides</h3>
                <div className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <link.icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{link.title}</div>
                        <div className="text-sm text-gray-500">{link.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-gray-900">Horaires d'ouverture</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {(s?.business_hours || []).map((h, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-500">{h.day}</span>
                      <span className="text-gray-900">{h.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-orange-50 text-sm">
                  <span className="text-orange-500 font-medium">
                    {s?.live_chat_note || '💬 Chat en direct disponible 24h/24 et 7j/7'}
                  </span>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Délai de réponse estimé</h3>
                <div className="space-y-3">
                  {(s?.response_times || []).map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-orange-500' : i === 1 ? 'bg-amber-500' : 'bg-gray-300'}`}
                      />
                      <span className="text-sm text-gray-500">
                        {r.label}: {r.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              {s?.location_title || 'Notre adresse'}
            </h2>
            <p className="text-gray-500">
              {s?.location_subtitle || 'Rendez-nous visite'}
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl overflow-hidden border border-gray-200 h-[400px]">
              <iframe
                title="Our location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(s?.location_lng ?? -74.006) - 0.015},${(s?.location_lat ?? 40.7128) - 0.01},${(s?.location_lng ?? -74.006) + 0.015},${(s?.location_lat ?? 40.7128) + 0.01}&layer=mapnik&marker=${s?.location_lat ?? 40.7128},${s?.location_lng ?? -74.006}`}
              />
            </div>
            <div className="flex flex-col justify-center bg-white p-8 rounded-xl border border-gray-200">
              <MapPin className="w-10 h-10 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Adresse</h3>
              <p className="text-gray-500 mb-1">
                {s?.location_address_line1 || '123 Design Street'}
              </p>
              <p className="text-gray-500 mb-6">
                {s?.location_address_line2 || 'New York, NY 10001'}
              </p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${s?.location_lat ?? 40.7128}&mlon=${s?.location_lng ?? -74.006}#map=${s?.location_zoom ?? 15}/${s?.location_lat ?? 40.7128}/${s?.location_lng ?? -74.006}`}
                target="_blank"
                rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2 border-gray-300 text-gray-700 hover:border-orange-300">
                  <MapPin className="w-4 h-4" /> Itinéraire
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default Contact