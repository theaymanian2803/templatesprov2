import Footer from '@/components/Footer'
import HostingWizard from '@/components/HostingWizard'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/hooks/use-toast'
import { useValidateCoupon } from '@/hooks/useCoupons'
import { supabase } from '@/integrations/supabase/client'
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Rocket,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

declare global {
  interface Window {
    paypal?: any
  }
}

const Checkout = () => {
  const { items, totalPrice, clearCart, isAllAccess } = useCart()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  )
  const validateCoupon = useValidateCoupon()
  const [hostingOpen, setHostingOpen] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const finalTotal = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discount) : totalPrice
  const isFree = finalTotal <= 0 && !isAllAccess

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const result = await validateCoupon.mutateAsync({ code: couponCode, orderTotal: totalPrice })
      setAppliedCoupon({ code: result.coupon.code, discount: result.discount })
      toast({
        title: t('checkout.couponApplied'),
        description: t('checkout.couponSaved', { amount: result.discount }),
      })
    } catch (error: any) {
      toast({
        title: t('checkout.couponInvalid'),
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
  }

  const handleClaimFreeOrder = async () => {
    if (isAllAccess || items.length === 0) return
    setIsClaiming(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      const response = await supabase.functions.invoke('claim-free-order', {
        body: {
          items: items.map((i) => ({ id: i.id, license: i.license })),
          couponCode: appliedCoupon?.code,
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })

      if (response.error) {
        throw new Error(response.error.error || response.data?.error || t('checkout.orderFailed'))
      }
      if (response.data?.error) {
        throw new Error(response.data.error)
      }

      setOrderId(response.data.orderId)
      setOrderComplete(true)
      clearCart()

      queryClient.invalidateQueries({ queryKey: ['purchased-templates'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })

      toast({
        title: t('checkout.freeOrderConfirmed'),
        description: t('checkout.freeOrderConfirmedDesc'),
      })
    } catch (error: any) {
      console.error('Claim free order error:', error)
      toast({
        title: t('checkout.orderError'),
        description: error.message || t('checkout.orderValidationFailed'),
        variant: 'destructive',
      })
    } finally {
      setIsClaiming(false)
    }
  }

  useEffect(() => {
    if (loading) return

    if (!user) {
      toast({
        title: t('checkout.loginRequired'),
        description: t('checkout.loginRequiredDesc'),
        variant: 'destructive',
      })
      navigate('/auth?redirect=/checkout')
      return
    }

    if (items.length === 0 && !isAllAccess && !orderComplete) {
      navigate('/cart')
    }
  }, [user, loading, items, navigate, toast, orderComplete, t])

  const [paypalError, setPaypalError] = useState<string | null>(null)

  useEffect(() => {
    if (orderComplete || isFree) return

    const loadPayPalScript = async () => {
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID

      if (
        !clientId ||
        clientId === 'YOUR_PAYPAL_SANDBOX_CLIENT_ID' ||
        clientId.startsWith('YOUR_')
      ) {
        console.error('PayPal Client ID not configured properly')
        setPaypalError(t('checkout.paypalNotConfigured'))
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`
      script.async = true
      script.onload = () => {
        setPaypalLoaded(true)
        setPaypalError(null)
      }
      script.onerror = () => {
        console.error('Failed to load PayPal SDK')
        setPaypalError(t('checkout.paypalLoadFailed'))
        toast({
          title: t('checkout.paymentError'),
          description: t('checkout.paymentSystemLoadFailed'),
          variant: 'destructive',
        })
      }
      document.body.appendChild(script)

      return () => {
        const existingScript = document.querySelector(`script[src*="paypal.com/sdk"]`)
        if (existingScript) {
          document.body.removeChild(existingScript)
        }
      }
    }

    loadPayPalScript()
  }, [toast, orderComplete, isFree, t])

  useEffect(() => {
    if (!paypalLoaded || !window.paypal || orderComplete || isFree) return

    const container = document.getElementById('paypal-button-container')
    if (!container) return

    container.innerHTML = ''

    window.paypal
      .Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        },
        createOrder: async () => {
          setIsLoading(true)
          try {
            const { data: sessionData } = await supabase.auth.getSession()
            const accessToken = sessionData?.session?.access_token

            const response = await supabase.functions.invoke('create-paypal-order', {
              body: {
                items: isAllAccess ? [] : items.map((i) => ({ id: i.id, license: i.license })),
                isAllAccess,
                couponCode: appliedCoupon?.code,
              },
              headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            })

            if (response.error) {
              let errorMsg = response.error.message || t('checkout.orderCreationFailed')
              if (errorMsg.includes('non-2xx')) {
                errorMsg = t('checkout.paymentSystemUnavailable')
              }
              throw new Error(response.error.error || response.data?.error || errorMsg)
            }

            if (response.data?.error) {
              throw new Error(response.data.error)
            }

            return response.data.orderId
          } catch (error: any) {
            console.error('Create order error:', error)
            toast({
              title: t('checkout.orderError'),
              description: error.message || t('checkout.orderCreationFailedRetry'),
              variant: 'destructive',
            })
            throw error
          } finally {
            setIsLoading(false)
          }
        },
        onApprove: async (data: any) => {
          setIsLoading(true)
          try {
            const { data: sessionData } = await supabase.auth.getSession()
            const accessToken = sessionData?.session?.access_token

            const response = await supabase.functions.invoke('capture-paypal-order', {
              body: {
                paypalOrderId: data.orderID,
                items: isAllAccess ? [] : items.map((i) => ({ id: i.id, license: i.license })),
                isAllAccess,
                couponCode: appliedCoupon?.code,
              },
              headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            })

            if (response.error) {
              let errorMsg = response.error.message || t('checkout.paymentValidationFailed')
              if (errorMsg.includes('non-2xx')) {
                errorMsg = t('checkout.paymentDeclined')
              }
              throw new Error(response.error.error || response.data?.error || errorMsg)
            }

            if (response.data?.error) {
              throw new Error(response.data.error)
            }

            setOrderId(response.data.orderId)
            setOrderComplete(true)
            clearCart()

            toast({
              title: t('checkout.paymentSuccess'),
              description: t('checkout.orderPlacedSuccess'),
            })
          } catch (error: any) {
            console.error('Capture error:', error)
            toast({
              title: t('checkout.paymentError'),
              description: error.message || t('checkout.paymentProcessingFailed'),
              variant: 'destructive',
            })
          } finally {
            setIsLoading(false)
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err)
          toast({
            title: t('checkout.paymentError'),
            description: t('checkout.paypalGenericError'),
            variant: 'destructive',
          })
        },
        onCancel: () => {
          toast({
            title: t('checkout.paymentCancelled'),
            description: t('checkout.paymentCancelledDesc'),
          })
        },
      })
      .render('#paypal-button-container')
  }, [paypalLoaded, items, finalTotal, clearCart, toast, orderComplete, appliedCoupon, isAllAccess, isFree, t])

  if (orderComplete) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-9 pb-16">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-orange-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                {t('checkout.thanksTitle')}
              </h1>
              <p className="text-gray-500 mb-6 leading-[1.7]">
                {t('checkout.thanksDesc')}
              </p>
              {orderId && (
                <p className="text-sm text-gray-400 mb-8">
                  {t('checkout.orderIdLabel')}{' '}
                  <span className="font-mono text-gray-900">{orderId}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/downloads">
                  <Button className="bg-orange-500 text-white hover:bg-orange-600 font-semibold">{t('checkout.viewDownloads')}</Button>
                </Link>
                <Button variant="outline" className="gap-2 border-gray-300 text-gray-700 hover:border-orange-300" onClick={() => setHostingOpen(true)}>
                  <Rocket className="w-4 h-4" /> {t('checkout.host')}
                </Button>
                <Link to="/templates">
                  <Button variant="ghost" className="text-gray-600">{t('checkout.continue')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <HostingWizard open={hostingOpen} onOpenChange={setHostingOpen} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-9 pb-16">
        <div className="container mx-auto">
          <Link
            to="/cart"
            className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('checkout.backToCart')}
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">
            {t('checkout.title')}
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Payment */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  {t('checkout.paymentMethod')}
                </h2>

                <div className="mb-6">
                  <Label className="text-gray-500">{t('checkout.email')}</Label>
                  <Input value={user?.email || ''} disabled className="mt-1 bg-gray-50" />
                </div>

                {isFree ? (
                  <>
                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 mb-4">
                      <p className="text-sm text-gray-900 font-medium mb-1">
                        {t('checkout.freeOrder')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t('checkout.freeOrderDesc')}
                      </p>
                    </div>

                    {isClaiming && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        <span className="ml-2 text-gray-500">{t('checkout.processing')}</span>
                      </div>
                    )}

                    <Button
                      size="lg"
                      className="w-full bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                      onClick={handleClaimFreeOrder}
                      disabled={isClaiming || isLoading}>
                      {isClaiming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('checkout.validating')}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {t('checkout.getFree')}
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    {paypalError && (
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-4">
                        <p className="text-sm text-red-600 font-medium mb-2">
                          {t('checkout.configurationRequired')}
                        </p>
                        <p className="text-xs text-gray-500">{paypalError}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {t('checkout.getClientIdFrom')}{' '}
                          <a
                            href="https://developer.paypal.com/dashboard/applications/sandbox"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:underline">
                            PayPal Developer Dashboard
                          </a>
                        </p>
                      </div>
                    )}

                    {isLoading && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        <span className="ml-2 text-gray-500">{t('checkout.processing')}</span>
                      </div>
                    )}

                    <div
                      id="paypal-button-container"
                      className={isLoading || paypalError ? 'hidden' : ''}
                    />

                    {!paypalLoaded && !isLoading && !paypalError && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">{t('checkout.loadingPaymentOptions')}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                {isFree ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                    <span className="text-sm">
                      {t('checkout.noPaymentRequired')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-500">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                    <span className="text-sm">
                      {t('checkout.securePayment')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24">
                <h2 className="font-bold text-lg text-gray-900 mb-4">{t('checkout.orderSummary')}</h2>

                <div className="space-y-4 mb-6">
                  {isAllAccess ? (
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm">{t('checkout.allAccessPass')}</h3>
                        <p className="text-xs text-gray-500">{t('checkout.allAccessDesc')}</p>
                      </div>
                      <span className="font-bold text-gray-900">${totalPrice}</span>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 capitalize">
                            {t('checkout.license', { license: item.license })}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900">${item.price}</span>
                      </div>
                    ))
                  )}
                </div>

                <Separator className="my-4" />

                {/* Coupon Code */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">{t('checkout.couponLabel')}</Label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 border border-orange-200">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-orange-500" />
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-sm text-orange-500">-${appliedCoupon.discount}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleRemoveCoupon}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('checkout.couponPlaceholder')}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={validateCoupon.isPending || !couponCode.trim()}
                        className="border-gray-300 text-gray-700 hover:border-orange-300">
                        {validateCoupon.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t('checkout.apply')
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('checkout.subtotal')}</span>
                    <span className="text-gray-900">${totalPrice}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-500">{t('checkout.discount')}</span>
                      <span className="text-orange-500">-${appliedCoupon.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('checkout.tax')}</span>
                    <span className="text-gray-900">$0.00</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">{t('checkout.total')}</span>
                  <span className="font-extrabold text-2xl text-orange-500">${finalTotal}</span>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  {t('checkout.termsNote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default Checkout