// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2026 fengzie and the respective contributors.

import type { Metadata, ResolvingMetadata } from 'next';
import { getCanonicalSiteUrl } from '@/lib/siteUrl';
import MarketplacesPageClient from './MarketplacesPageClient';

/**
 * Metadata lives on the page, not the layout: a layout's metadata would also
 * apply to the client-only /marketplace/[slug] routes beneath it.
 * openGraph replaces the parent's wholesale, so the site-wide generated image
 * is carried over explicitly from `parent`.
 */
export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const canonical = `${await getCanonicalSiteUrl()}/marketplace`;
  const title = 'Community marketplaces';
  const description =
    'Browse independent, community-run marketplaces on Mobazha. Discover curated stores and seller collectives, with cryptocurrency checkout and buyer protection.';

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      images: (await parent).openGraph?.images ?? [],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function MarketplacesPage() {
  return <MarketplacesPageClient />;
}
