import { ImageResponse } from 'next/og';

export const alt = 'Mobazha — the decentralized marketplace where sellers keep their store';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const HIGHLIGHTS = [
  'Self-hostable storefront on your own domain',
  'Settle in USDT, BTC, BNB and other crypto',
  'Buyer protection through marketplace moderators',
];

/**
 * Site-wide default social card.
 *
 * `layout.tsx` used to advertise `/og-default.png`, which was never shipped in
 * `public/`, so every page without a page-specific image (home, marketplace,
 * search, collections …) rendered an `og:image` that resolved to a 404 and
 * produced an empty link preview.
 *
 * Product and store pages already ship their own `opengraph-image.tsx`; this is
 * the matching default for the rest of the site. It is a static route with no
 * data fetching, so it is rendered at build time.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '30px',
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.12em',
            }}
          >
            MOBAZHA
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '18px',
              color: '#64748b',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid #334155',
            }}
          >
            Decentralized Marketplace
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: '62px',
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.15,
            maxWidth: '920px',
          }}
        >
          Your own storefront. Your customers. Your crypto.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {HIGHLIGHTS.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#38bdf8',
                }}
              />
              <div style={{ display: 'flex', fontSize: '26px', color: '#cbd5e1' }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
