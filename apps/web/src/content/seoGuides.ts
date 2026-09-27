// SPDX-License-Identifier: MPL-2.0
// Copyright (c) 2026 fengzie and the respective contributors.

/**
 * Public help/guide articles.
 *
 * The copy lives here rather than inside the page components so the rendered
 * article and the structured data can never drift apart: `buildGuideJsonLd()`
 * reads exactly the text the reader sees. Facts about how checkout and buyer
 * protection behave are taken from the product's own policy and help copy
 * (`packages/core/i18n/locales/en.ts`), not invented here.
 */

export interface GuideTable {
  columns: string[];
  rows: string[][];
}

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: GuideTable;
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface SeoGuide {
  slug: string;
  title: string;
  description: string;
  /** One-paragraph answer, written to be quotable on its own. */
  lead: string;
  sections: GuideSection[];
  faq: GuideFaq[];
}

export const SEO_GUIDES: SeoGuide[] = [
  {
    slug: 'self-hosted-marketplace',
    title: 'Self-hosted marketplace software: what it is and why sellers switch',
    description:
      'A self-hosted marketplace runs on infrastructure you control, so the storefront, catalogue and customer records stay yours. What that changes, and what to check before you move.',
    lead:
      'A self-hosted marketplace is marketplace software you run on your own server and domain instead of renting from a platform. The storefront, the product catalogue, the order history and the customer records live in a database you control, and the store stays reachable at your own address even if a third-party service changes its rules or shuts down.',
    sections: [
      {
        heading: 'What "self-hosted" actually means',
        paragraphs: [
          'Self-hosting is about who operates the software, not about what the software can do. You install it on a server you rent or own, point a domain at it, and keep the database. The marketplace is then online under your name rather than under a platform account.',
          'In practice three things change: you decide when to upgrade, your customer list never leaves your database, and your storefront URL is a domain you can keep for as long as you want.',
        ],
      },
      {
        heading: 'Self-hosted marketplace vs. hosted marketplace SaaS',
        table: {
          columns: ['', 'Self-hosted', 'Hosted SaaS'],
          rows: [
            ['Who runs the server', 'You (or your hosting account)', 'The vendor'],
            ['Where customer data lives', 'Your database', "The vendor's database"],
            ['Storefront address', 'Your own domain', 'A subdomain or vendor path'],
            ['Who can suspend the store', 'You', 'The vendor, under its terms'],
            ['Effect of stopping payment', 'Nothing shuts down', 'The store usually goes offline'],
            ['Upgrade timing', 'You choose', 'The vendor chooses'],
          ],
        },
      },
      {
        heading: 'Why sellers move to self-hosted marketplaces',
        bullets: [
          'The customer relationship stays with you: email lists, order history and repeat buyers are in your database, not in a platform export.',
          'Search visibility accrues to your domain, so the links and rankings you earn keep working.',
          'No third party sits between you and your settlement: payments go to wallets you control.',
          'Nothing about your catalogue is locked behind an account that can be closed.',
        ],
      },
      {
        heading: 'What to check before you self-host',
        bullets: [
          'A deploy path you can actually follow: look for a container image or a one-command deploy, not a wiki page full of manual steps.',
          'Backups and restore: know where the database lives and how to take a copy before you upgrade.',
          'Upgrade path: an actively maintained project should publish releases you can follow.',
          'Domain and TLS: the store must be reachable over HTTPS on a domain you own.',
          'Settlement and dispute handling: decide up front which wallets receive payments and how disputes are resolved.',
        ],
      },
      {
        heading: 'How Mobazha fits this model',
        paragraphs: [
          'Mobazha Unified is open source under the MPL-2.0 licence and ships both a hosted platform and a stand-alone deployment, so the same interface can run as a self-hosted storefront. A stand-alone node keeps the catalogue, orders and customer records in its own database, and buyers can pay in crypto at checkout.',
          'Because a self-hosted store is still a marketplace rather than a single-seller shop, it also carries the parts a plain storefront does not: multiple sellers, listing moderation and buyer protection on each order.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is a self-hosted marketplace the same thing as a self-hosted store?',
        answer:
          'No. A self-hosted store has one seller and sells that seller\'s own products. A self-hosted marketplace runs the same way technically but supports multiple sellers, so it also needs listing moderation, per-seller payouts and a dispute process.',
      },
      {
        question: 'Do I need blockchain experience to run a self-hosted marketplace?',
        answer:
          'No. Running the node is ordinary web hosting work: a server, a domain and a database. You do need at least one wallet address for the networks you accept, and you should understand which network each payment arrives on.',
      },
      {
        question: 'Can a self-hosted marketplace use my own domain?',
        answer:
          'Yes — that is the point of hosting it yourself. The marketplace is served from your domain, which is also why links to it accumulate authority on your site instead of someone else\'s.',
      },
      {
        question: 'What happens to the marketplace if I stop hosting it?',
        answer:
          'There is no subscription to lapse, so nothing is switched off remotely, but the store does go offline when the server stops. Keep database backups and, if continuity matters, keep the ability to restore the node somewhere else.',
      },
      {
        question: 'Is open-source marketplace software really free?',
        answer:
          'The licence costs nothing for the software itself. You still pay for the server and the domain, and crypto payments carry network fees. Budget for hosting and for the time it takes to keep the node updated.',
      },
    ],
  },
  {
    slug: 'accept-crypto-payments',
    title: 'How to accept crypto payments on your store',
    description:
      'Custodial processor, hosted checkout, or self-hosted checkout: the three ways to accept crypto payments, what each one changes, and the mistakes that cause lost orders.',
    lead:
      'There are three practical ways to accept crypto payments in a store: route payments through a custodial payment processor, hand the customer off to a hosted checkout page, or run the checkout yourself and settle directly to wallets you control. The choice decides who holds the funds before the order completes, who handles refunds, and how much of the payment you actually keep.',
    sections: [
      {
        heading: 'The three ways to accept crypto',
        table: {
          columns: ['Approach', 'Who holds funds mid-order', 'Refund handling', 'Main trade-off'],
          rows: [
            ['Custodial processor', 'The processor', 'Processor issues refunds', 'Easiest to set up; you depend on the processor'],
            ['Hosted checkout page', 'Your wallet, or the provider', 'Manual or provider-assisted', 'Fast to launch; the buyer leaves your site'],
            ['Self-hosted checkout', 'Your marketplace or your wallet', 'Your own policy and disputes', 'Most control; you own refunds and support'],
          ],
        },
      },
      {
        heading: 'What you need in place first',
        bullets: [
          'At least one wallet per network you intend to accept, and a written record of which address belongs to which network.',
          'A displayed price in a currency your buyers understand, and a rule for how that price converts at checkout.',
          'A refund policy that says what happens if the buyer pays on the wrong network or the order is cancelled.',
          'A confirmation step, so the buyer knows the order was recorded rather than only that a transfer was broadcast.',
        ],
      },
      {
        heading: 'Network choice is a customer-support decision',
        paragraphs: [
          'Every network has its own fees and confirmation behaviour, and a payment sent on the wrong one is usually unrecoverable. That makes network selection part of checkout design: the network the buyer picks has to match the network they withdraw to, and the store has to say so before the transfer rather than after.',
          'Mobazha checkout is explicit about this. It accepts USDT on BSC (BEP20), Solana, Base, Polygon and Ethereum mainnet, and marks BSC and Solana as the recommended options. It does not accept TRON (TRC20), which is a common default on exchange C2C flows, so the checkout warns buyers not to withdraw on TRC20.',
        ],
      },
      {
        heading: 'If your buyers do not hold crypto yet',
        paragraphs: [
          'Most stores take some orders from buyers who own no crypto. The usual bridge is an exchange: the buyer verifies their identity, buys a stablecoin such as USDT in a C2C or P2P flow, then withdraws it to a wallet and pays.',
          'A store cannot do that conversion for the buyer. Mobazha, for example, does not provide fiat-to-USDT conversion; it publishes step-by-step guidance that walks a buyer through buying USDT on an exchange and withdrawing it on a supported network.',
        ],
      },
      {
        heading: 'The mistakes that cause lost orders',
        bullets: [
          'Accepting a network you do not document, so buyers guess and send funds to an address you cannot spend from.',
          'Assuming a payment can be reversed. A confirmed on-chain transfer cannot be clawed back, so protection has to be built around holding funds before release.',
          'Pricing in crypto only. Volatility makes the price stale between order and payment; quote in a stable unit and settle in crypto.',
          'No written refund path for cancelled or unshipped orders, which turns every dispute into a manual negotiation.',
        ],
      },
    ],
    faq: [
      {
        question: 'Do I need a bank account to accept crypto payments?',
        answer:
          'Not to receive the payments themselves — crypto settles to a wallet address. You still need a wallet you control per network, and you should keep records for tax and accounting in the same way you would for card payments.',
      },
      {
        question: 'Which network should a store start with?',
        answer:
          'Start with the one or two networks your buyers actually use and that their exchange supports. On Mobazha checkout, BSC (BEP20) and Solana are marked as recommended; Ethereum mainnet is accepted but usually carries higher fees.',
      },
      {
        question: 'What if the buyer sends the payment on the wrong network?',
        answer:
          'Assume it is not recoverable. That is why the network is chosen at checkout and why the store should warn before the transfer: Mobazha, for instance, does not accept TRON (TRC20) and says so in its payment guidance.',
      },
      {
        question: 'Are crypto payments reversible?',
        answer:
          'No. Once a transfer is confirmed it cannot be reversed by the recipient, which is why marketplaces hold the funds and release them after the order completes instead of paying sellers immediately.',
      },
      {
        question: 'Do customers need their own wallet?',
        answer:
          'Either a wallet or an exchange account works. A customer using an exchange buys the stablecoin there and withdraws it on the matching network; Mobazha supports that route explicitly and documents it for buyers.',
      },
    ],
  },
  {
    slug: 'crypto-escrow-buyer-protection',
    title: 'Crypto escrow and buyer protection, explained',
    description:
      'How escrow protects crypto orders: funds are held before release, protection periods run 14 days for physical goods, 3 for digital and 7 for services, and disputes go to an independent mediator.',
    lead:
      'Escrow means a neutral holding step between payment and payout: the buyer pays, the marketplace holds the funds, and the seller only receives them once the order is confirmed or the protection period ends. It exists because a confirmed crypto transfer cannot be reversed — without escrow, the buyer carries all the risk of a seller who never ships.',
    sections: [
      {
        heading: 'Why crypto orders need an escrow step',
        paragraphs: [
          'Card payments can be charged back; on-chain transfers cannot. That asymmetry is the whole problem: a buyer sending crypto to a stranger is trusting the seller with funds that cannot be recalled, and a seller shipping first is trusting a buyer who could disappear.',
          'Escrow moves the trust to a third party for the short window where it matters, and gives both sides a defined process with deadlines instead of a negotiation.',
        ],
      },
      {
        heading: 'How an escrow-protected order runs',
        bullets: [
          'The buyer pays at checkout, and the funds are held in a secure account rather than passed to the seller.',
          'The seller fulfils the order inside the shipping window.',
          'The buyer confirms receipt and the funds are released, or the order completes automatically when the protection period ends with no issue raised.',
          'If something goes wrong, the buyer reports it during the protection period and the dispute process takes over.',
        ],
      },
      {
        heading: 'Protection periods on Mobazha',
        table: {
          columns: ['Product type', 'Protection period', 'Auto-cancel if not shipped'],
          rows: [
            ['Physical goods', '14 days', '7 days'],
            ['Digital products', '3 days', '3 days'],
            ['Services', '7 days', '3 days'],
          ],
        },
        paragraphs: [
          'Orders settle automatically when the protection period ends, so a buyer who does nothing still gets the order completed without having to confirm anything. If the seller does not ship within the required window, the order is cancelled automatically and the funds are returned.',
          'For physical goods with a delayed shipment, the buyer can request a single 14-day extension of the protection period.',
        ],
      },
      {
        heading: 'What happens in a dispute',
        paragraphs: [
          'A buyer reports the problem during the protection period, and the first seven days are reserved for resolving it directly with the seller. If that fails, an independent mediator steps in and issues a decision within seven days.',
          'There is also a seven-day after-sale window: issues reported after the order completes are still handled, which covers the gap between a parcel arriving and its contents being checked.',
        ],
      },
      {
        heading: 'Who actually holds the money',
        paragraphs: [
          'This is the question worth asking any marketplace, because "escrow" is sometimes used loosely. On Mobazha the payment is held in a secure account and released to the seller only after the protection period ends or the buyer confirms receipt, and the deadlines above are what make the process predictable.',
          'The practical difference between escrow models is who can move the funds and under what rules. Read the buyer protection policy of any marketplace before you buy and check three things: when funds are released, what happens if the seller never ships, and who decides a dispute.',
        ],
      },
    ],
    faq: [
      {
        question: 'What is escrow in crypto?',
        answer:
          'Escrow in crypto means holding a payment between the buyer and the seller until the order is fulfilled. It replaces the chargeback protection that card payments have, because a confirmed on-chain transfer cannot be reversed.',
      },
      {
        question: 'How long does buyer protection last?',
        answer:
          'On Mobazha the protection period is 14 days for physical goods, 3 days for digital products and 7 days for services, measured from the payment. Once it ends, the order completes automatically.',
      },
      {
        question: 'What happens if the seller never ships?',
        answer:
          'The order is cancelled automatically and the funds are returned: after 7 days for physical goods, after 3 days for digital products and services. For a delayed physical shipment the buyer can ask for a single 14-day extension instead.',
      },
      {
        question: 'Who decides a dispute?',
        answer:
          'The buyer and seller get seven days to resolve it between themselves. If they cannot, an independent mediator makes the decision within seven days.',
      },
      {
        question: 'Does buyer protection cover the whole order?',
        answer:
          'The funds for the order are held until release, and issues can be reported during the protection period and for seven days after the order completes. Check the buyer protection policy for the exceptions that apply to a specific item.',
      },
    ],
  },
];

export function findGuide(slug: string): SeoGuide | undefined {
  return SEO_GUIDES.find(guide => guide.slug === slug);
}

export function guidePath(slug: string): string {
  return `/help/${slug}`;
}

/**
 * `BreadcrumbList` plus `FAQPage` for one guide.
 *
 * The breadcrumb mirrors the visible navigation (`Help` → article) so the
 * structured data describes the page rather than an invented hierarchy. The FAQ
 * node is what generative engines quote, so its answers are the same sentences
 * the reader sees.
 */
export function buildGuideJsonLd(guide: SeoGuide, siteUrl: string): unknown[] {
  const url = `${siteUrl}${guidePath(guide.slug)}`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Help', item: `${siteUrl}/help` },
        { '@type': 'ListItem', position: 2, name: guide.title, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ];
}

/** `ItemList` for the help index so the guides are discoverable as a set. */
export function buildGuideIndexJsonLd(siteUrl: string): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Mobazha guides',
    itemListElement: SEO_GUIDES.map((guide, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: guide.title,
      url: `${siteUrl}${guidePath(guide.slug)}`,
    })),
  };
}
