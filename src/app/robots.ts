import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin-login', '/api/'],
    },
    sitemap: `${process.env.NEXTAUTH_URL || 'https://varodasiapp.com'}/sitemap.xml`,
  }
}