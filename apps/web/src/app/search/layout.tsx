import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  // The root layout already applies the `%s | Mobazha` title template, so the
  // brand must not be repeated here ("Search — Mobazha | Mobazha").
  title: 'Search',
  description: 'Search products and stores on Mobazha decentralized marketplace.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
