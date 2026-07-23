import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '平行人生 · 公开分享',
  robots: { index: false, follow: false },
};

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
