import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const urls = [
    '',
    '/donate',
    '/report',
    '/multimodal',
  ];
  const now = new Date();
  return urls.map((path) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.7,
  }));
}


