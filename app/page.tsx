import { Hero } from '@/components/home/Hero';
import { FeatureShowcase } from '@/components/home/FeatureShowcase';
import { RecentTimelines } from '@/components/home/RecentTimelines';

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      <Hero />
      <FeatureShowcase />
      <RecentTimelines />
    </main>
  );
}
