import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/ad666'] },
    ],
    sitemap: `${site.replace(/\/$/, '')}/sitemap.xml`,
  };
}


