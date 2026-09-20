import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authClient } from '@/lib/auth-client'
import type { Session } from 'better-auth'

export interface AuthUser {
  id: string
  email: string
  name: string
  image: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  user_metadata?: Record<string, unknown>
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function toAuthUser(u: { id: string; email: string; name: string; image?: string | null; emailVerified: boolean; createdAt: Date; updatedAt: Date } | null | undefined): AuthUser | null {
  if (!u) return null
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    image: u.image ?? null,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    user_metadata: { display_name: u.name },
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setSession(data?.session ?? null)
      setUser(toAuthUser(data?.user))
      setLoading(false)
    })
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await authClient.signUp.email({ email, password, name: displayName ?? '' })
    return { error: error ? new Error(error.message ?? 'Sign up failed') : null }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (!error && data) {
      setSession(data.session)
      setUser(toAuthUser(data.user))
    }
    return { error: error ? new Error(error.message ?? 'Sign in failed') : null }
  }

  const signInWithGoogle = async () => {
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    })
    return { error: error ? new Error(error.message ?? 'Google sign in failed') : null }
  }

  const signOut = async () => {
    await authClient.signOut()
    setUser(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await authClient.forgetPassword({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error ? new Error(error.message ?? 'Reset failed') : null }
  }

  const updatePassword = async (newPassword: string) => {
    const token = new URLSearchParams(window.location.search).get('token') ?? undefined
    const { error } = await authClient.resetPassword({ newPassword, token })
    return { error: error ? new Error(error.message ?? 'Update failed') : null }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
