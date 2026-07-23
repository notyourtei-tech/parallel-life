import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: "Parallel Life AI - 探索你的平行人生",
    template: "%s | Parallel Life AI",
  },
  description: "如果当初做了不同选择，现在会在哪里？AI驱动的平行世界时间线生成器,探索人生的无限可能。",
  keywords: ["平行人生", "AI", "时间线", "人生选择", "平行宇宙", "parallel life"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Parallel Life AI",
    title: "Parallel Life AI - 探索你的平行人生",
    description: "如果当初做了不同选择，现在会在哪里？AI生成你的平行世界时间线。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parallel Life AI - 探索你的平行人生",
    description: "如果当初做了不同选择，现在会在哪里？AI生成你的平行世界时间线。",
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#0a0e27',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0e27] text-white">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
