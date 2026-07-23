import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "探索平行人生 · Parallel Life AI",
  description: "输入一个关键决定,让 AI 为你生成两条平行人生时间线。",
  robots: { index: false, follow: false },
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
