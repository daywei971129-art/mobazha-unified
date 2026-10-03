// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2026 fengzie and the respective contributors.

import { describe, expect, it, vi } from 'vitest';
import type { ResolvingMetadata } from 'next';
import { generateMetadata } from '@/app/marketplace/page';

vi.mock('@/lib/siteUrl', () => ({
  getCanonicalSiteUrl: async () => 'https://canonical.example.test',
}));
vi.mock('@/app/marketplace/MarketplacesPageClient', () => ({ default: () => null }));

function parentWith(images?: unknown[]): ResolvingMetadata {
  return Promise.resolve({
    openGraph: images ? { images } : undefined,
  }) as unknown as ResolvingMetadata;
}

describe('/marketplace metadata', () => {
  it('publishes its own title and a canonical on the canonical host', async () => {
    const metadata = await generateMetadata({}, parentWith());

    expect(metadata.title).toBe('Community marketplaces');
    expect(metadata.alternates?.canonical).toBe('https://canonical.example.test/marketplace');
    expect(metadata.openGraph?.url).toBe('https://canonical.example.test/marketplace');
  });

  it('carries the root segment images over, because a page openGraph replaces its parent wholesale', async () => {
    const image = { url: 'https://canonical.example.test/opengraph-image?v1' };

    const metadata = await generateMetadata({}, parentWith([image]));

    expect(metadata.openGraph?.images).toEqual([image]);
  });

  it('adds no images when the parent has none', async () => {
    const metadata = await generateMetadata({}, parentWith());

    expect(metadata.openGraph?.images).toEqual([]);
  });
});
