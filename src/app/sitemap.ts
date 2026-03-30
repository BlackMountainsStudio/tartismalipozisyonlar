import { type MetadataRoute } from 'next'
import { prisma } from '@/database/db'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://varodasai.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/pozisyonlar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/hakemler`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/yorumcular`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/commentators`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/analiz/hakemler`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/analiz/takimlar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/superlig-tartismali-pozisyonlar-2025`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/giris`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/oneri`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/rehber`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  try {
    // Get all matches
    const matches = await prisma.match.findMany({
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
    })

    // Get all incidents
    const incidents = await prisma.incident.findMany({
      select: {
        id: true,
        slug: true,
        matchId: true,
        updatedAt: true,
        match: {
          select: {
            id: true,
            slug: true,
          }
        }
      },
    })

    // Get all commentators
    const commentators = await prisma.commentator.findMany({
      select: {
        slug: true,
        createdAt: true,
      },
    })

    // Get all referees
    const referees = await prisma.referee.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // Generate match URLs
    const matchUrls: MetadataRoute.Sitemap = []

    matches.forEach((match: { id: string; slug: string | null; updatedAt: Date }) => {
      // Add slug-based match URL (legacy format)
      if (match.slug) {
        matchUrls.push({
          url: `${BASE_URL}/${match.slug}`,
          lastModified: match.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }

      // Add ID-based match URL (new format)
      matchUrls.push({
        url: `${BASE_URL}/matches/${match.id}`,
        lastModified: match.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    })

    // Generate incident URLs
    const incidentUrls: MetadataRoute.Sitemap = []

    incidents.forEach((incident: {
      id: string;
      slug: string | null;
      matchId: string;
      updatedAt: Date;
      match: { id: string; slug: string | null }
    }) => {
      // Add standalone incident URL
      incidentUrls.push({
        url: `${BASE_URL}/incidents/${incident.id}`,
        lastModified: incident.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      })

      // Add match-incident URLs (new format)
      incidentUrls.push({
        url: `${BASE_URL}/matches/${incident.match.id}/${incident.slug || incident.id}`,
        lastModified: incident.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      })

      // Add legacy match-incident URLs if match has slug and incident has slug
      if (incident.match.slug && incident.slug) {
        incidentUrls.push({
          url: `${BASE_URL}/${incident.match.slug}/${incident.slug}`,
          lastModified: incident.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      }
    })

    // Generate commentator URLs (both Turkish and English routes)
    const commentatorUrls: MetadataRoute.Sitemap = []

    commentators.forEach((commentator: { slug: string; createdAt: Date }) => {
      // Turkish route
      commentatorUrls.push({
        url: `${BASE_URL}/yorumcular/${commentator.slug}`,
        lastModified: commentator.createdAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })

      // English route
      commentatorUrls.push({
        url: `${BASE_URL}/commentators/${commentator.slug}`,
        lastModified: commentator.createdAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })

    // Generate referee URLs
    const refereeUrls: MetadataRoute.Sitemap = []

    referees.forEach((referee: { slug: string; updatedAt: Date }) => {
      refereeUrls.push({
        url: `${BASE_URL}/hakemler/${referee.slug}`,
        lastModified: referee.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    })

    // Combine all URLs
    return [
      ...staticPages,
      ...matchUrls,
      ...incidentUrls,
      ...commentatorUrls,
      ...refereeUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return only static pages if database query fails
    return staticPages
  }
}