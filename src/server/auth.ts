import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getRequest } from '@tanstack/react-start/server'
import { db } from './db/client'
import * as schema from './db/schema'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:8080',
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:8080'],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db
            .insert(schema.profiles)
            .values({ user_id: user.id, display_name: user.name || null })
            .onConflictDoNothing()
          const role = process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL ? 'admin' : 'user'
          await db
            .insert(schema.user_roles)
            .values({ user_id: user.id, role: role as 'admin' | 'user' })
            .onConflictDoNothing()
        },
      },
    },
  },
})

export async function getSession() {
  const request = getRequest()
  if (!request) return null
  return auth.api.getSession({ headers: request.headers })
}
