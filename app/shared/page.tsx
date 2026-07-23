'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { decodeTimeline } from '@/lib/share';
import { LocalTimeline } from '@/types';
import { Share2, AlertTriangle, Sparkles } from 'lucide-react';

const TimelineView = dynamic(
  () => import('@/components/timeline/TimelineView').then((m) => ({ default: m.TimelineView })),
  { ssr: false, loading: () => <Loading message="加载时间线..." /> },
);
const BranchTree = dynamic(
  () => import('@/components/timeline/BranchTree').then((m) => ({ default: m.BranchTree })),
  { ssr: false, loading: () => <Loading message="加载分支树..." /> },
);

type ViewMode = 'timeline' | 'tree';

// 校验单个世界对象：必须有标题，且 timeline 是非空数组，
// 每个节点至少包含 number 类型的 age 与 string 类型的 title。
// 否则 TimelineView 在访问 worldA.timeline.length / node.age 时会崩溃。
function isValidTimelineWorld(w: unknown): boolean {
  if (!w || typeof w !== 'object') return false;
  const world = w as { title?: unknown; timeline?: unknown };
  if (typeof world.title !== 'string' || !world.title) return false;
  if (!Array.isArray(world.timeline) || world.timeline.length === 0) return false;
  return world.timeline.every(
    (n) =>
      !!n &&
      typeof n === 'object' &&
      typeof (n as { age?: unknown }).age === 'number' &&
      typeof (n as { title?: unknown }).title === 'string',
  );
}

export function isValid(t: unknown): t is LocalTimeline {
  if (!t || typeof t !== 'object') return false;
  const tl = t as LocalTimeline;
  return Boolean(
    typeof tl.userInput?.keyDecision === 'string' &&
      tl.userInput.keyDecision.length > 0 &&
      isValidTimelineWorld(tl.result?.worldA) &&
      isValidTimelineWorld(tl.result?.worldB),
  );
}

export default function SharedPage() {
  const router = useRouter();
  const [timeline, setTimeline] = useState<LocalTimeline | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<ViewMode>('timeline');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('d');
    let cancelled = false;
    // 在微任务回调中 setState，避免在 effect 体内同步 setState 触发级联渲染告警
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (!d) {
        setError(true);
        return;
      }
      const decoded = decodeTimeline(d);
      if (!isValid(decoded)) {
        setError(true);
        return;
      }
      setTimeline(decoded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2 gradient-text">分享链接无效</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          该平行人生链接已损坏或已过期，无法加载。
        </p>
        <Button onClick={() => router.push('/')}>返回首页</Button>
      </div>
    );
  }

  if (!timeline) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold">Parallel Life AI · 公开分享</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => router.push('/generate')}>
            <Share2 className="w-4 h-4 mr-2" />
            创建我的平行人生
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8 print:mb-4">
          <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs mb-3 print:hidden">
            来自公开分享链接 · 只读
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">关键决定</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {timeline.userInput.keyDecision}
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-12 print:hidden">
          <Button
            variant={view === 'timeline' ? 'primary' : 'secondary'}
            onClick={() => setView('timeline')}
          >
            时间线
          </Button>
          <Button
            variant={view === 'tree' ? 'primary' : 'secondary'}
            onClick={() => setView('tree')}
          >
            分支树
          </Button>
        </div>

        {view === 'timeline' ? (
          <TimelineView
            worldA={timeline.result.worldA}
            worldB={timeline.result.worldB}
          />
        ) : (
          <BranchTree
            keyDecision={timeline.userInput.keyDecision}
            worldA={timeline.result.worldA}
            worldB={timeline.result.worldB}
          />
        )}
      </main>
    </div>
  );
}
