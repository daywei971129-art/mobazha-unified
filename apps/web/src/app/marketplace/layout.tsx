// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2026 fengzie and the respective contributors.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RuntimeCapabilityBoundary } from '@/components/RuntimeCapabilityBoundary';
import { getCanonicalSiteUrl } from '@/lib/siteUrl';

/**
 * The marketplace hub is a public landing page, so it needs its own title,
 * description and canonical instead of inheriting the app-wide defaults.
 * `RuntimeCapabilityBoundary` stays in charge of rendering — it is a client
 * component, which server layouts may render.
 */
export async function generateMetadata(): Promise<Metadata> {
  const canonicalSiteUrl = await getCanonicalSiteUrl();
  const canonical = `${canonicalSiteUrl}/marketplace`;
  const title = 'Community marketplaces';
  const description =
    'Browse independent, community-run marketplaces on Mobazha. Discover curated stores and seller collectives, with cryptocurrency checkout and buyer protection.';

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: 'website', title, description, url: canonical },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <RuntimeCapabilityBoundary capability="marketplace.discovery">
      {children}
    </RuntimeCapabilityBoundary>
  );
}
