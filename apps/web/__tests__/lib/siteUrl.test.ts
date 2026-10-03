import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const headersMock = vi.fn();

vi.mock('next/headers', () => ({
  headers: () => headersMock(),
}));

function headersFrom(values: Record<string, string>): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(values)) {
    h.set(k, v);
  }
  return h;
}

// Load after mock so the module picks up the mocked `next/headers`.
async function loadSiteUrl() {
  vi.resetModules();
  return await import('@/lib/siteUrl');
}

describe('getSiteUrl', () => {
  beforeEach(() => {
    headersMock.mockReset();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('prefers x-store-domain when set', async () => {
    headersMock.mockResolvedValue(headersFrom({ 'x-store-domain': 'alice.mymbz.org' }));
    const { getSiteUrl } = await loadSiteUrl();
    expect(await getSiteUrl()).toBe('https://alice.mymbz.org');
  });

  it('falls back to NEXT_PUBLIC_SITE_URL when no x-store-domain', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.example.com';
    headersMock.mockResolvedValue(headersFrom({}));
    const { getSiteUrl } = await loadSiteUrl();
    expect(await getSiteUrl()).toBe('https://custom.example.com');
  });

  it('falls back to x-forwarded-host when env not set', async () => {
    headersMock.mockResolvedValue(
      headersFrom({
        'x-forwarded-host': 'store.example.com',
        'x-forwarded-proto': 'https',
      })
    );
    const { getSiteUrl } = await loadSiteUrl();
    expect(await getSiteUrl()).toBe('https://store.example.com');
  });

  it('returns hardcoded default as last resort', async () => {
    headersMock.mockResolvedValue(headersFrom({}));
    const { getSiteUrl } = await loadSiteUrl();
    expect(await getSiteUrl()).toBe('https://app.mobazha.org');
  });
});

describe('getCanonicalSiteUrl', () => {
  beforeEach(() => {
    headersMock.mockReset();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('uses x-store-canonical-domain when present', async () => {
    // Current host is a named storefront; canonical points at main store.
    headersMock.mockResolvedValue(
      headersFrom({
        'x-store-domain': 'alice-vip.sf.mymbz.org',
        'x-store-canonical-domain': 'alice.mymbz.org',
      })
    );
    const { getCanonicalSiteUrl } = await loadSiteUrl();
    expect(await getCanonicalSiteUrl()).toBe('https://alice.mymbz.org');
  });

  it('falls back to getSiteUrl when canonical header absent', async () => {
    // Main store request — current host is already canonical.
    headersMock.mockResolvedValue(headersFrom({ 'x-store-domain': 'alice.mymbz.org' }));
    const { getCanonicalSiteUrl } = await loadSiteUrl();
    expect(await getCanonicalSiteUrl()).toBe('https://alice.mymbz.org');
  });
});

describe('isNamedStorefrontRequest', () => {
  beforeEach(() => {
    headersMock.mockReset();
  });

  it('returns true when x-store-canonical-domain is set', async () => {
    headersMock.mockResolvedValue(headersFrom({ 'x-store-canonical-domain': 'alice.mymbz.org' }));
    const { isNamedStorefrontRequest } = await loadSiteUrl();
    expect(await isNamedStorefrontRequest()).toBe(true);
  });

  it('returns false when x-store-canonical-domain is absent', async () => {
    headersMock.mockResolvedValue(headersFrom({ 'x-store-domain': 'alice.mymbz.org' }));
    const { isNamedStorefrontRequest } = await loadSiteUrl();
    expect(await isNamedStorefrontRequest()).toBe(false);
  });

  it('returns false when headers() throws', async () => {
    headersMock.mockRejectedValue(new Error('headers unavailable'));
    const { isNamedStorefrontRequest } = await loadSiteUrl();
    expect(await isNamedStorefrontRequest()).toBe(false);
  });
});

describe('isOfficialSiteUrl', () => {
  it('matches the official host whatever scheme or port the proxy reports', async () => {
    const { isOfficialSiteUrl } = await loadSiteUrl();
    expect(isOfficialSiteUrl('https://app.mobazha.org')).toBe(true);
    // Next dev and TLS-terminating proxies hand the app `x-forwarded-proto: http`.
    expect(isOfficialSiteUrl('http://app.mobazha.org')).toBe(true);
    expect(isOfficialSiteUrl('http://app.mobazha.org:3000/search')).toBe(true);
  });

  it('rejects other hosts, including look-alikes and branded subdomains', async () => {
    const { isOfficialSiteUrl } = await loadSiteUrl();
    expect(isOfficialSiteUrl('https://shop.example.com')).toBe(false);
    expect(isOfficialSiteUrl('https://alice.mobazha.org')).toBe(false);
    expect(isOfficialSiteUrl('https://mobazha.org')).toBe(false);
    expect(isOfficialSiteUrl('https://app.mobazha.org.evil.example')).toBe(false);
    expect(isOfficialSiteUrl('https://evil-app.mobazha.org')).toBe(false);
    expect(isOfficialSiteUrl('not a url')).toBe(false);
    expect(isOfficialSiteUrl('')).toBe(false);
  });
});

describe('getConfiguredSiteUrl', () => {
  beforeEach(() => {
    headersMock.mockReset();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('never reads request headers, even when a Host header is forged', async () => {
    headersMock.mockResolvedValue(
      headersFrom({ host: 'evil.example', 'x-forwarded-host': 'evil.example' })
    );
    const { getConfiguredSiteUrl } = await loadSiteUrl();
    expect(getConfiguredSiteUrl()).toBe('https://app.mobazha.org');
    expect(headersMock).not.toHaveBeenCalled();
  });

  it('prefers NEXT_PUBLIC_SITE_URL', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.example.com';
    const { getConfiguredSiteUrl } = await loadSiteUrl();
    expect(getConfiguredSiteUrl()).toBe('https://custom.example.com');
  });
});

describe('buildSelfCanonical', () => {
  it('keeps the root slash and drops trailing slashes elsewhere', async () => {
    const { buildSelfCanonical } = await loadSiteUrl();
    expect(buildSelfCanonical('https://app.mobazha.org', '/')).toBe('https://app.mobazha.org/');
    expect(buildSelfCanonical('https://app.mobazha.org', '/search')).toBe(
      'https://app.mobazha.org/search'
    );
    expect(buildSelfCanonical('https://app.mobazha.org', '/search/')).toBe(
      'https://app.mobazha.org/search'
    );
    expect(buildSelfCanonical('https://app.mobazha.org', '/marketplace/foo//')).toBe(
      'https://app.mobazha.org/marketplace/foo'
    );
  });

  it('does not double the slash when the site URL ends with one', async () => {
    const { buildSelfCanonical } = await loadSiteUrl();
    expect(buildSelfCanonical('https://app.mobazha.org/', '/search')).toBe(
      'https://app.mobazha.org/search'
    );
    expect(buildSelfCanonical('https://app.mobazha.org/', '/')).toBe('https://app.mobazha.org/');
  });
});
