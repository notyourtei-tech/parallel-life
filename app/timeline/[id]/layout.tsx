import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "平行人生结果 · Parallel Life AI",
  description: "查看 AI 为你生成的两条平行人生时间线与故事。",
  robots: { index: false, follow: false },
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
