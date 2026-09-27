// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2026 fengzie and the respective contributors.

import type { Metadata } from 'next';
import Link from 'next/link';

import { buildGuideIndexJsonLd, guidePath, SEO_GUIDES } from '@/content/seoGuides';
import { getCanonicalSiteUrl } from '@/lib/siteUrl';

const DESCRIPTION =
  'Practical guides on running a self-hosted marketplace, accepting crypto payments and how escrow buyer protection works.';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getCanonicalSiteUrl();
  return {
    title: 'Guides',
    description: DESCRIPTION,
    alternates: { canonical: `${siteUrl}/help` },
    openGraph: { type: 'website', title: 'Guides', description: DESCRIPTION, url: `${siteUrl}/help` },
  };
}

export default async function HelpIndexPage() {
  const siteUrl = await getCanonicalSiteUrl();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildGuideIndexJsonLd(siteUrl)).replace(/<\//g, '<\\/'),
        }}
      />

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Guides</h1>
      <p className="text-muted-foreground leading-relaxed">
        How Mobazha handles self-hosting, crypto checkout and buyer protection — written for
        sellers who are deciding how to run their own store, and for buyers checking what
        protects an order.
      </p>

      <ul className="list-none p-0 mt-6 space-y-4">
        {SEO_GUIDES.map(guide => (
          <li key={guide.slug} className="rounded-lg border border-border p-4">
            <Link
              href={guidePath(guide.slug)}
              className="text-base font-semibold text-foreground hover:text-primary hover:underline"
            >
              {guide.title}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1 mb-0">
              {guide.description}
            </p>
          </li>
        ))}
        <li className="rounded-lg border border-border p-4">
          <Link
            href="/help/exchange-usdt-payment"
            className="text-base font-semibold text-foreground hover:text-primary hover:underline"
          >
            Pay with USDT from an exchange
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1 mb-0">
            Buying USDT on an exchange and withdrawing it on a network the store accepts.
          </p>
        </li>
      </ul>
    </>
  );
}
