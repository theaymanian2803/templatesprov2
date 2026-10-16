import { createFileRoute } from '@tanstack/react-router'
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
import { submitContact } from '@/server/functions/contact'
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
import { useTranslation } from 'react-i18next'
import { Link } from '@/lib/router'
import { seoHead } from '@/lib/site'

const LOCATION = {
  address_line1: '123 Design Street',
  address_line2: 'New York, NY 10001',
  lat: 40.7128,
  lng: -74.006,
  zoom: 15,
}

const Contact = () => {
  const { toast } = useToast()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const contactMethods = [
    {
      icon: Mail,
      title: t('contact.writeTitle'),
      description: t('contact.writeDesc'),
      value: 'hello@unccodestore.com',
      action: 'mailto:hello@unccodestore.com',
    },
    {
      icon: Phone,
      title: t('contact.callTitle'),
      description: t('contact.callDesc'),
      value: '+1 (555) 123-4567',
      action: 'tel:+15551234567',
    },
    {
      icon: MessageSquare,
      title: t('contact.chatTitle'),
      description: t('contact.chatDesc'),
      value: t('contact.chatValue'),
      action: '#',
    },
    {
      icon: MapPin,
      title: t('contact.visitTitle'),
      description: t('contact.visitDesc'),
      value: '123 Design Street, NYC',
      action: '#',
    },
  ]

  const quickLinks = [
    { icon: FileQuestion, title: t('contact.faqTitle'), description: t('contact.faqDesc'), href: '/faq' },
    {
      icon: Headphones,
      title: t('contact.helpCenterTitle'),
      description: t('contact.helpCenterDesc'),
      href: '/faq#support',
    },
  ]

  const businessHours = [
    { day: t('contact.hoursWeekdays'), hours: t('contact.hoursWeekdaysTime') },
    { day: t('contact.hoursSaturday'), hours: t('contact.hoursSaturdayTime') },
    { day: t('contact.hoursSunday'), hours: t('contact.hoursSundayTime') },
  ]

  const responseTimes = [
    { label: t('contact.responseEmail'), time: t('contact.responseEmailTime') },
    { label: t('contact.responseChat'), time: t('contact.responseChatTime') },
    { label: t('contact.responsePhone'), time: t('contact.responsePhoneTime') },
  ]

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

    let error: Error | null = null
    try {
      await submitContact({ data: { name: fullName, email, subject, message: finalMessage } })
    } catch (e: any) {
      error = e
    }

    setIsSubmitting(false)

    if (error) {
      toast({ title: t('contact.errorTitle'), description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: t('contact.sentTitle'), description: t('contact.sentDesc') })
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
              {t('contact.heroBadge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1]">
              {t('contact.heroHeadline')}{' '}
              <span className="text-orange-500">{t('contact.heroHighlight')}</span>
            </h1>
            <p className="text-lg text-gray-500 leading-[1.7]">{t('contact.heroSubheadline')}</p>
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
                  {t('contact.formTitle')}
                </h2>
                <p className="text-gray-500 mb-8 leading-[1.7]">{t('contact.formSubtitle')}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('contact.firstName')}</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder={t('contact.firstNamePlaceholder')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('contact.lastName')}</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder={t('contact.lastNamePlaceholder')}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.emailLabel')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('contact.emailPlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.subject')}</Label>
                    <Select name="subject" required>
                      <SelectTrigger>
                        <SelectValue placeholder={t('contact.subjectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t('contact.subjectGeneral')}</SelectItem>
                        <SelectItem value="support">{t('contact.subjectSupport')}</SelectItem>
                        <SelectItem value="sales">{t('contact.subjectSales')}</SelectItem>
                        <SelectItem value="licensing">{t('contact.subjectLicensing')}</SelectItem>
                        <SelectItem value="refund">{t('contact.subjectRefund')}</SelectItem>
                        <SelectItem value="partnership">{t('contact.subjectPartnership')}</SelectItem>
                        <SelectItem value="other">{t('contact.subjectOther')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">{t('contact.orderNumber')}</Label>
                    <Input
                      id="orderNumber"
                      name="orderNumber"
                      placeholder={t('contact.orderNumberPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.message')}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder={t('contact.messagePlaceholder')}
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
                      <>{t('contact.sending')}</>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t('contact.send')}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">{t('contact.quickLinksTitle')}</h3>
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
                  <h3 className="font-bold text-gray-900">{t('contact.businessHoursTitle')}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {businessHours.map((h, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-500">{h.day}</span>
                      <span className="text-gray-900">{h.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-orange-50 text-sm">
                  <span className="text-orange-500 font-medium">{t('contact.liveChatNote')}</span>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">{t('contact.responseTimesTitle')}</h3>
                <div className="space-y-3">
                  {responseTimes.map((r, i) => (
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
              {t('contact.locationTitle')}
            </h2>
            <p className="text-gray-500">{t('contact.locationSubtitle')}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl overflow-hidden border border-gray-200 h-[400px]">
              <iframe
                title={t('contact.mapTitle')}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${LOCATION.lng - 0.015},${LOCATION.lat - 0.01},${LOCATION.lng + 0.015},${LOCATION.lat + 0.01}&layer=mapnik&marker=${LOCATION.lat},${LOCATION.lng}`}
              />
            </div>
            <div className="flex flex-col justify-center bg-white p-8 rounded-xl border border-gray-200">
              <MapPin className="w-10 h-10 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.addressLabel')}</h3>
              <p className="text-gray-500 mb-1">{LOCATION.address_line1}</p>
              <p className="text-gray-500 mb-6">{LOCATION.address_line2}</p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${LOCATION.lat}&mlon=${LOCATION.lng}#map=${LOCATION.zoom}/${LOCATION.lat}/${LOCATION.lng}`}
                target="_blank"
                rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2 border-gray-300 text-gray-700 hover:border-orange-300">
                  <MapPin className="w-4 h-4" /> {t('contact.directions')}
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

export const Route = createFileRoute('/contact')({
  component: Contact,
  head: () =>
    seoHead({
      title: 'Contact',
      description: 'Contactez notre équipe pour toute question, feedback ou demande de support.',
      path: '/contact',
    }),
})
