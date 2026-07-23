'use client';

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ShareModal } from '@/components/shared/ShareModal';
import { getTimelineById } from '@/lib/storage';
import { LocalTimeline } from '@/types';
import { ArrowLeft, Share2, Sparkles, ArrowUp, Printer } from 'lucide-react';

const TimelineView = dynamic(
  () => import('@/components/timeline/TimelineView').then(m => ({ default: m.TimelineView })),
  { ssr: false, loading: () => <Loading message="加载时间线..." /> }
);
const StoryMode = dynamic(
  () => import('@/components/timeline/StoryMode').then(m => ({ default: m.StoryMode })),
  { ssr: false, loading: () => <Loading message="加载故事模式..." /> }
);
const BranchTree = dynamic(
  () => import('@/components/timeline/BranchTree').then(m => ({ default: m.BranchTree })),
  { ssr: false, loading: () => <Loading message="加载分支树..." /> }
);

type ViewMode = 'timeline' | 'story' | 'tree';

function useTimelineData(id: string): LocalTimeline | null {
  const subscribe = useCallback((callback: () => void) => {
    const onStorage = () => callback();
    const onCustom = () => callback();
    window.addEventListener('storage', onStorage);
    window.addEventListener('parallel-life-update', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('parallel-life-update', onCustom);
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => getTimelineById(id),
    () => null,
  );
}

export default function TimelinePage() {
  const params = useParams();
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewMode>('timeline');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const id = params.id as string;
  const timeline = useTimelineData(id);

  // 是否已在客户端完成 hydration：服务端渲染时为 false，客户端挂载后为 true。
  // 用 useSyncExternalStore 实现，避免在 effect 里 setState（触发 lint 与级联渲染）。
  // 只有 hydrated 后 timeline 仍为空，才能确定记录确实不存在。
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleExport = useCallback(() => window.print(), []);

  // 键盘快捷键：1/2/3 切换视图，E 导出 PDF
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === '1') setActiveView('timeline');
      else if (e.key === '2') setActiveView('story');
      else if (e.key === '3') setActiveView('tree');
      else if (e.key.toLowerCase() === 'e') handleExport();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleExport]);

  if (!timeline) {
    // 挂载前无法判断，先显示加载；挂载后仍为空说明记录确实不存在
    if (!mounted) {
      return <Loading fullScreen />;
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
        <Sparkles className="w-12 h-12 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold mb-2">记录不存在</h1>
          <p className="text-gray-400 max-w-md">
            这条平行人生记录可能已被删除，或链接无效。记录只保存在生成它的那台设备上。
          </p>
        </div>
        <Button variant="primary" onClick={() => router.push('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>
      </div>
    );
  }

  const views: { id: ViewMode; label: string }[] = [
    { id: 'timeline', label: '时间线' },
    { id: 'story', label: '故事模式' },
    { id: 'tree', label: '分支树' },
  ];

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 glass border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>

          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold hidden md:inline">Parallel Life AI</span>
          </button>

          <div className="flex items-center gap-2 print:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              aria-label="导出 / 打印为 PDF"
            >
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 关键决定标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            关键决定
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {timeline.userInput.keyDecision}
          </p>
          {timeline.processingTime && (
            <p className="text-sm text-gray-500 mt-2">
              生成耗时 {(timeline.processingTime / 1000).toFixed(1)}秒
            </p>
          )}
        </motion.div>

        {/* 视图切换 */}
        <div className="flex flex-col items-center gap-3 mb-12 print:hidden">
          <div className="flex justify-center gap-3">
            {views.map((view) => (
              <Button
                key={view.id}
                variant={activeView === view.id ? 'primary' : 'secondary'}
                onClick={() => setActiveView(view.id)}
              >
                {view.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            快捷键：1 时间线 · 2 故事 · 3 分支树 · E 导出 PDF
          </p>
        </div>

        {/* 视图内容 */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'timeline' && (
            <TimelineView
              worldA={timeline.result.worldA}
              worldB={timeline.result.worldB}
            />
          )}

          {activeView === 'story' && (
            <StoryMode
              userInput={timeline.userInput}
              worldA={timeline.result.worldA}
              worldB={timeline.result.worldB}
            />
          )}

          {activeView === 'tree' && (
            <BranchTree
              keyDecision={timeline.userInput.keyDecision}
              worldA={timeline.result.worldA}
              worldB={timeline.result.worldB}
            />
          )}
        </motion.div>
      </main>

      {/* 分享模态框 */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        timelineId={timeline.id}
        keyDecision={timeline.userInput.keyDecision}
      />

      {/* 滚动到顶部 */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow print:hidden"
          aria-label="滚动到顶部"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
