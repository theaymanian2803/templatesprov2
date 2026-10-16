import { createFileRoute } from '@tanstack/react-router'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import OrderHistory from '@/components/profile/OrderHistory'
import SupportCard from '@/components/profile/SupportCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { getMyProfile, updateProfile } from '@/server/functions/admin'
import { authClient } from '@/lib/auth-client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Save, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@/lib/router'
import { z } from 'zod'

type T = (key: string) => string

const makeProfileSchema = (t: T) =>
  z.object({
    displayName: z
      .string()
      .min(1, t('profile.displayNameRequired'))
      .max(50, t('profile.displayNameMax')),
    avatarUrl: z.string().url(t('profile.validUrl')).optional().or(z.literal('')),
  })

const makePasswordSchema = (t: T) =>
  z
    .object({
      currentPassword: z.string().min(6, t('profile.passwordMin')),
      newPassword: z.string().min(6, t('profile.passwordMin')),
      confirmPassword: z.string().min(6, t('profile.passwordMin')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('profile.passwordsMismatch'),
      path: ['confirmPassword'],
    })

type ProfileFormData = z.infer<ReturnType<typeof makeProfileSchema>>
type PasswordFormData = z.infer<ReturnType<typeof makePasswordSchema>>

const Profile = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()

  const profileSchema = useMemo(() => makeProfileSchema(t), [t])
  const passwordSchema = useMemo(() => makePasswordSchema(t), [t])

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      avatarUrl: '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const data = await getMyProfile()

        if (data) {
          profileForm.reset({
            displayName: data.display_name || '',
            avatarUrl: data.avatar_url || '',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user, profileForm])

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setIsSavingProfile(true)
    try {
      await updateProfile({ data: { displayName: data.displayName, avatarUrl: data.avatarUrl || null } })

      toast({
        title: t('profile.profileUpdated'),
        description: t('profile.profileUpdatedDesc'),
      })
    } catch (error: any) {
      toast({
        title: t('profile.error'),
        description: error.message || t('profile.profileUpdateFailed'),
        variant: 'destructive',
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    try {
      const { error } = await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
      })

      if (error) {
        throw new Error(error.message || t('profile.currentPasswordIncorrect'))
      }

      passwordForm.reset()
      toast({
        title: t('profile.passwordChanged'),
        description: t('profile.passwordChangedDesc'),
      })
    } catch (error: any) {
      toast({
        title: t('profile.error'),
        description: error.message || t('profile.passwordChangeFailed'),
        variant: 'destructive',
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-9 pb-16 container mx-auto max-w-2xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </main>
    )
  }

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profileForm.watch('avatarUrl')} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                {t('profile.title')}
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('profile.profileInfo')}
                </CardTitle>
                <CardDescription>{t('profile.profileInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProfile ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.displayName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('profile.displayNamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="avatarUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.avatarUrl')}</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/avatar.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isSavingProfile}>
                        {isSavingProfile ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {t('profile.save')}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {t('profile.emailTitle')}
                </CardTitle>
                <CardDescription>{t('profile.emailDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">{user?.email}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('profile.emailNote')}
                </p>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  {t('profile.changePassword')}
                </CardTitle>
                <CardDescription>{t('profile.changePasswordDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.currentPassword')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                              >
                                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.newPassword')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                              >
                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.confirmNewPassword')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                              >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" variant="secondary" disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      {t('profile.update')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            {/* Order History */}
            <OrderHistory />

            {/* Support */}
            <SupportCard />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export const Route = createFileRoute('/profile')({ component: Profile })
