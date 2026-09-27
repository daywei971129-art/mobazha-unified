import type { MetadataRoute } from 'next';

import { getCanonicalSiteUrl, getSiteUrl, isNamedStorefrontRequest } from '@/lib/siteUrl';

/** Paths that must never be crawled, regardless of the user agent. */
const PRIVATE_PATHS = ['/checkout/', '/payment/', '/orders/', '/settings/', '/api/'];

/**
 * Generative-engine crawlers we explicitly admit. The generic `*` rule already
 * allows them, but naming them keeps the intent reviewable and lets a store
 * operator see exactly who is admitted without reading the whole file.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
];

/**
 * MS-Phase-2a · MS2a.3 — SEO de-duplication.
 *
 * Named storefront subdomains (e.g. alice-vip.sf.mymbz.org) serve the same
 * underlying products as the main store. To avoid duplicate-content penalties
 * we:
 *   - Return `Disallow: /` so crawlers skip the storefront entirely.
 *   - Point sitemap at the canonical host so the crawler still discovers
 *     the main catalogue.
 *
 * The main store (and verified custom domains) gets the normal robots rules
 * and its own sitemap.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const [namedStorefront, canonicalSiteUrl, currentSiteUrl] = await Promise.all([
    isNamedStorefrontRequest(),
    getCanonicalSiteUrl(),
    getSiteUrl(),
  ]);

  if (namedStorefront) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${canonicalSiteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      ...AI_CRAWLERS.map(userAgent => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${currentSiteUrl}/sitemap.xml`,
  };
}
