import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core'

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().unique(),
  display_name: text('display_name'),
  avatar_url: text('avatar_url'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const user_roles = sqliteTable('user_roles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  role: text('role', { enum: ['admin', 'moderator', 'user'] }).notNull().default('user'),
}, (t) => [uniqueIndex('user_roles_user_role_idx').on(t.user_id, t.role)])

export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  template_id: text('template_id').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => [uniqueIndex('favorites_user_template_idx').on(t.user_id, t.template_id)])

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  price: real('price').notNull().default(0),
  extended_price: real('extended_price'),
  image_url: text('image_url').notNull(),
  gallery_images: text('gallery_images', { mode: 'json' }).$type<string[]>().notNull().default([]),
  rating: real('rating').default(0),
  sales: integer('sales').default(0),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  tech_stack: text('tech_stack', { mode: 'json' }).$type<string[]>().notNull().default([]),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull().default([]),
  demo_url: text('demo_url'),
  youtube_id: text('youtube_id'),
  license_product: text('license_product'),
  review_count: integer('review_count').notNull().default(0),
  download_count: integer('download_count').notNull().default(0),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  user_email: text('user_email').notNull(),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'] }).notNull().default('pending'),
  total_amount: real('total_amount').notNull().default(0),
  paypal_order_id: text('paypal_order_id').unique(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const order_items = sqliteTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  order_id: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  template_id: text('template_id').notNull(),
  template_title: text('template_title').notNull(),
  license_type: text('license_type').notNull().default('regular'),
  price: real('price').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const all_access_passes = sqliteTable('all_access_passes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  order_id: text('order_id').references(() => orders.id),
  price: real('price').notNull().default(300),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  discount_type: text('discount_type', { enum: ['percentage', 'fixed'] }).notNull().default('percentage'),
  discount_value: real('discount_value').notNull().default(0),
  min_order_amount: real('min_order_amount').default(0),
  max_uses: integer('max_uses'),
  used_count: integer('used_count').notNull().default(0),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  expires_at: integer('expires_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  template_id: text('template_id').references(() => templates.id, { onDelete: 'set null' }),
  template_title: text('template_title'),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  template_id: text('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  status: text('status', { enum: ['pending', 'approved'] }).notNull().default('pending'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => [
  uniqueIndex('reviews_user_template_idx').on(t.user_id, t.template_id),
])

export const template_downloads = sqliteTable('template_downloads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  template_id: text('template_id').notNull().unique().references(() => templates.id, { onDelete: 'cascade' }),
  source_file_url: text('source_file_url').notNull(),
})

export const downloads = sqliteTable('downloads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  template_id: text('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => [
  index('downloads_template_idx').on(t.template_id),
  index('downloads_user_idx').on(t.user_id),
])

export const license_keys = sqliteTable('license_keys', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  template_id: text('template_id').notNull(),
  product: text('product').notNull(),
  key: text('key').notNull(),
  order_id: text('order_id'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => [uniqueIndex('license_keys_user_template_idx').on(t.user_id, t.template_id)])

export const refund_requests = sqliteTable('refund_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  order_id: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'),
  admin_notes: text('admin_notes'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>().notNull().default({}),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const site_settings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).$type<Record<string, unknown>>().notNull().default({}),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
