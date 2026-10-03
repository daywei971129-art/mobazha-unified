// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2026 fengzie and the respective contributors.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as CoreEnv from '@mobazha/core/config/env';
import sitemap from '@/app/sitemap';

const state = vi.hoisted(() => ({
  hosted: true,
  siteUrl: 'https://app.example.test',
  configuredSiteUrl: 'https://app.example.test',
}));
const fetchSearchListingCatalog = vi.hoisted(() => vi.fn());

vi.mock('@/lib/initPublicEnv', () => ({}));
vi.mock('@mobazha/core/config/env', async importOriginal => ({
  ...(await importOriginal<typeof CoreEnv>()),
  isHostedMode: () => state.hosted,
}));
vi.mock('@/lib/siteUrl', () => ({
  getSiteUrl: async () => state.siteUrl,
  getConfiguredSiteUrl: () => state.configuredSiteUrl,
  isNamedStorefrontRequest: async () => false,
}));
vi.mock('@/lib/ssrSearchBase', () => ({ SSR_SEARCH_BASE: 'https://info.example.test' }));
vi.mock('@/lib/ssrApiBase', () => ({ SSR_API_BASE: 'http://api.example.test' }));
vi.mock('@/lib/ssrSearchCatalog', () => ({ fetchSearchListingCatalog }));

async function sitemapUrls(): Promise<string[]> {
  return (await sitemap()).map(route => route.url);
}

describe('sitemap listing source', () => {
  beforeEach(() => {
    fetchSearchListingCatalog.mockReset();
    state.hosted = true;
    state.siteUrl = 'https://app.example.test';
    state.configuredSiteUrl = 'https://app.example.test';
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('hosted: falls back from the info host to the same-origin /info and lists the catalogue', async () => {
    fetchSearchListingCatalog
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ slug: 'lamp', peerID: 'peer1' }]);

    const urls = await sitemapUrls();

    expect(fetchSearchListingCatalog.mock.calls.map(([options]) => options)).toEqual([
      { base: 'https://info.example.test' },
      { base: 'https://app.example.test/info' },
    ]);
    expect(urls).toContain('https://app.example.test/store/peer1');
    expect(urls.some(url => url.startsWith('https://app.example.test/product/lamp'))).toBe(true);
  });

  it('hosted: the fallback base comes from configuration, never from the request host', async () => {
    // What getSiteUrl() echoes when a caller forges the Host / X-Forwarded-Host header.
    state.siteUrl = 'https://forged.example';
    fetchSearchListingCatalog.mockResolvedValue([]);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false }))
    );

    await sitemapUrls();

    const bases = fetchSearchListingCatalog.mock.calls.map(([options]) => String(options.base));
    expect(bases.length).toBeGreaterThan(0);
    expect(bases.some(base => base.includes('forged.example'))).toBe(false);
  });

  it('stand-alone: never asks for the network-wide catalogue and lists the node index', async () => {
    state.hosted = false;
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: [{ slug: 'vase' }] }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const urls = await sitemapUrls();

    expect(fetchSearchListingCatalog).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith('http://api.example.test/v1/listings/index', {
      next: { revalidate: 3600 },
    });
    expect(urls.some(url => url.startsWith('https://app.example.test/product/vase'))).toBe(true);
  });

  it('keeps only the two static routes when nothing can be listed', async () => {
    state.hosted = false;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false }))
    );

    expect(await sitemapUrls()).toEqual([
      'https://app.example.test',
      'https://app.example.test/marketplace',
    ]);
  });
});
