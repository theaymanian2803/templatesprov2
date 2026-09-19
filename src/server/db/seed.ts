import { db } from './client'
import { templates, site_settings } from './schema'

export async function seed() {
  await db.insert(templates).values([
    { title: 'Starter - SaaS Dashboard Template', description: 'A complete SaaS dashboard solution with analytics, user management, and billing integration.', category: 'SaaS', price: 49, extended_price: 149, image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', rating: 4.9, sales: 2340, featured: true, tech_stack: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase'], features: ['Responsive Dashboard', 'User Analytics', 'Dark Mode Support', 'API Integration'] },
    { title: 'Storefront - E-Commerce Pro Kit', description: 'Professional e-commerce template with cart, checkout, and inventory management.', category: 'E-Commerce', price: 79, extended_price: 249, image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80', rating: 4.8, sales: 1856, featured: true, tech_stack: ['React', 'TypeScript', 'Stripe', 'Tailwind CSS'], features: ['Shopping Cart', 'Payment Integration', 'Product Gallery', 'Inventory System'] },
    { title: 'Portfolio Pro - Creative Showcase', description: 'Stunning portfolio template for designers and creatives.', category: 'Portfolio', price: 39, extended_price: 119, image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', rating: 4.9, sales: 3210, featured: true, tech_stack: ['React', 'Framer Motion', 'Tailwind CSS'], features: ['Animated Sections', 'Project Gallery', 'Contact Form', 'Blog Integration'] },
    { title: 'Corporate - Business Landing Page', description: 'Professional business landing page with team and services sections.', category: 'Business', price: 59, extended_price: 179, image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80', rating: 4.7, sales: 1542, featured: false, tech_stack: ['React', 'TypeScript', 'Tailwind CSS'], features: ['Team Section', 'Services Grid', 'Testimonials', 'Newsletter Signup'] },
    { title: 'Minimal - Blog & Magazine Theme', description: 'Clean and minimal blog template with rich text support.', category: 'Blog', price: 45, extended_price: 139, image_url: 'https://images.unsplash.com/photo-1522542550221-31fd8575f4ca?w=800&q=80', rating: 4.8, sales: 2890, featured: false, tech_stack: ['React', 'MDX', 'Tailwind CSS'], features: ['Rich Text Editor', 'Categories', 'Search', 'RSS Feed'] },
    { title: 'Agency Plus - Creative Studio Kit', description: 'Complete agency website template with portfolio and case studies.', category: 'Agency', price: 69, extended_price: 219, image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80', rating: 4.9, sales: 1987, featured: true, tech_stack: ['React', 'TypeScript', 'GSAP', 'Tailwind CSS'], features: ['Case Studies', 'Team Profiles', 'Service Pages', 'Client Portal'] },
  ])

  await db.insert(site_settings).values({
    key: 'hero_banner',
    value: {
      badge_text: '#1 Template Marketplace — 50K+ Creators',
      headline_line1_prefix: 'Build ',
      headline_line1_highlight: 'Stunning',
      headline_line2_prefix: 'Websites ',
      headline_line2_highlight: 'Instantly',
      subheadline: 'Premium, pixel-perfect templates that launch in minutes. Stop coding from scratch — start shipping faster.',
      cta_primary_text: 'Explore Templates',
      cta_primary_link: '/templates',
      cta_secondary_text: 'Watch Demo',
      cta_secondary_link: '/contact',
      stats: [
        { value: '12K+', label: 'Templates', icon: '' },
        { value: '50K+', label: 'Happy Creators', icon: '' },
        { value: '4.9★', label: 'Average Rating', icon: '' },
        { value: '24/7', label: 'Expert Support', icon: '' },
      ],
    },
  }).onConflictDoNothing()

  console.log('Seed complete.')
}

seed().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
