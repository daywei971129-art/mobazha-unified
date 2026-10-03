import type { MetadataRoute } from 'next';

import '@/lib/initPublicEnv';
import { isHostedMode } from '@mobazha/core/config/env';
import { buildProductHref, parseCompositeListingSlug } from '@mobazha/core/utils/productUrl';
import { fetchSearchListingCatalog, type SitemapListingItem } from '@/lib/ssrSearchCatalog';
import { SSR_SEARCH_BASE } from '@/lib/ssrSearchBase';
import { getConfiguredSiteUrl, getSiteUrl, isNamedStorefrontRequest } from '@/lib/siteUrl';
import { SSR_API_BASE } from '@/lib/ssrApiBase';

const API_BASE = SSR_API_BASE;

interface ListingIndexItem {
  slug: string;
  hash?: string;
}

function unwrapListingIndex(json: unknown): ListingIndexItem[] {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object' && 'data' in json) {
    const data = (json as { data: unknown }).data;
    if (Array.isArray(data)) return data;
  }
  return [];
}

async function fetchListingIndex(): Promise<ListingIndexItem[]> {
  try {
    const res = await fetch(`${API_BASE}/v1/listings/index`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return unwrapListingIndex(await res.json());
  } catch {
    return [];
  }
}

function mapIndexListings(listings: ListingIndexItem[]): SitemapListingItem[] {
  return listings.flatMap(listing => {
    const { slug, peerID } = parseCompositeListingSlug(listing.slug);
    return slug ? [{ slug, peerID }] : [];
  });
}

async function fetchSitemapListings(): Promise<SitemapListingItem[]> {
  /**
   * Hosted mode publishes the network-wide catalogue from the search index.
   * Stand-alone stores publish only their own node's listings: the network-wide
   * catalogue must never be listed under a store's own domain.
   *
   * The hosted catalogue used to resolve to nothing in production, leaving only
   * the two static routes: the info API is reached through a different entry
   * point than the API base (`INTERNAL_INFO_API_URL` / `NEXT_PUBLIC_INFO_API_URL`),
   * with a hard-coded `info.mobazha.org` fallback. That host is a *different*
   * product and answers with an HTML shell, so on a deployment where the
   * build-time variable is missing the catalogue silently came back empty. The
   * same-origin `/info/*` prefix is what the browser already uses
   * (`src/proxy.ts`) and it is verified to return JSON, so it is tried as a
   * second entry point before giving up. Its base must come from configuration
   * (`getConfiguredSiteUrl()`), never from the request: request headers are
   * caller-controlled, and this fetch runs server-side.
   */
  if (isHostedMode()) {
    const configured = getConfiguredSiteUrl().replace(/\/+$/, '');
    const searchBases = [SSR_SEARCH_BASE, ...(configured ? [`${configured}/info`] : [])];
    const tried = new Set<string>();

    for (const candidate of searchBases) {
      const base = candidate.replace(/\/+$/, '');
      if (tried.has(base)) continue;
      tried.add(base);

      const searchListings = await fetchSearchListingCatalog({ base });
      if (searchListings.length > 0) {
        return searchListings;
      }
    }
  }

  const indexListings = mapIndexListings(await fetchListingIndex());
  if (indexListings.length === 0) {
    console.warn(
      '[sitemap] no listings resolved from the search index or the node listing index; emitting static routes only'
    );
  }
  return indexListings;
}

/**
 * MS-Phase-2a · MS2a.3 — SEO de-duplication.
 *
 * On named storefront subdomains we return an empty sitemap — crawlers should
 * discover products through the canonical main-store sitemap (pointed at by
 * `robots.ts`). Emitting product URLs under multiple hostnames would forfeit
 * the SEO consolidation we achieve via rel=canonical.
 *
 * The main store / verified custom domain generates the full catalogue sitemap
 * rooted at its own host — URLs there are already canonical.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (await isNamedStorefrontRequest()) {
    return [];
  }

  // Current host is canonical here (main store or verified custom domain), so
  // we anchor sitemap URLs at getSiteUrl() to reflect whichever domain served
  // this request rather than a build-time constant.
  const siteUrl = await getSiteUrl();
  const listings = await fetchSitemapListings();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/marketplace`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  const productRoutes = listings.reduce<MetadataRoute.Sitemap>((routes, listing) => {
    if (!listing.slug) return routes;

    routes.push({
      url: buildProductHref(listing.slug, listing.peerID, { baseUrl: siteUrl }),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    });
    return routes;
  }, []);

  const peerIds = new Set<string>();
  for (const listing of listings) {
    if (listing.peerID) {
      peerIds.add(listing.peerID);
    }
  }
  const storeRoutes: MetadataRoute.Sitemap = Array.from(peerIds).map(peerId => ({
    url: `${siteUrl}/store/${peerId}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...storeRoutes];
}
