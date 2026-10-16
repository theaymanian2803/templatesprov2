/**
 * Registry of the landing page sections that can be controlled from the admin
 * ("Landing page" tab). The order here is the default order used when the
 * database has not been seeded yet, and the `label` is shown in the admin.
 *
 * Keep `key` values in sync with the renderer in `src/routes/index.tsx`.
 */
export interface LandingSectionDefinition {
  key: string
  label: string
}

export const LANDING_SECTIONS: LandingSectionDefinition[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'promo', label: 'All-Access promo' },
  { key: 'categories', label: 'Categories' },
  { key: 'unique', label: 'Unique themes banner' },
  { key: 'featured', label: 'Featured themes' },
  { key: 'showcase', label: 'Website & app showcase' },
  { key: 'templates', label: 'New arrivals' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'spa', label: 'Spa & wellness' },
]

export const LANDING_SECTION_KEYS = LANDING_SECTIONS.map((s) => s.key)

export const landingSectionLabel = (key: string): string =>
  LANDING_SECTIONS.find((s) => s.key === key)?.label ?? key

/** Section types that an admin can add on top of the built-in sections. */
export interface AddableSectionType {
  type: string
  label: string
}

export const ADDABLE_SECTION_TYPES: AddableSectionType[] = [
  { type: 'custom_banner', label: 'Custom banner' },
  { type: 'logos', label: 'Logos strip' },
]

export const sectionTypeLabel = (type: string): string =>
  ADDABLE_SECTION_TYPES.find((t) => t.type === type)?.label ?? type

/** A logo entry inside a `logos` section's config. */
export interface LandingLogo {
  image: string
  alt?: string
  link?: string
}

