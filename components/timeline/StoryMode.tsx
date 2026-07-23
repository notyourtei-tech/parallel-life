'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { UserInput, WorldTimeline } from '@/types';
import { BookOpen, RefreshCw } from 'lucide-react';
import { reportError } from '@/lib/logger';

interface StoryModeProps {
  userInput: UserInput;
  worldA: WorldTimeline;
  worldB: WorldTimeline;
}

export function StoryMode({ userInput, worldA, worldB }: StoryModeProps) {
  const [activeWorld, setActiveWorld] = useState<'A' | 'B'>('A');
  const [story, setStory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [retryNonce, setRetryNonce] = useState(0);
  const storyCache = useRef<Record<string, string>>({});
  const abortRef = useRef<AbortController | null>(null);
  const stableInput = useMemo(() => JSON.stringify(userInput), [userInput]);
  const currentTimeline = useMemo(() => JSON.stringify(activeWorld === 'A' ? worldA.timeline : worldB.timeline), [activeWorld, worldA.timeline, worldB.timeline]);
  const cacheKey = useMemo(() => `${activeWorld}-${stableInput}-${currentTimeline}`, [activeWorld, stableInput, currentTimeline]);

  useEffect(() => {
    if (storyCache.current[cacheKey]) {
      setStory(storyCache.current[cacheKey]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    async function generate() {
      setLoading(true);
      setError('');
      try {
        const timeline = activeWorld === 'A' ? worldA.timeline : worldB.timeline;

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: userInput,
            type: 'story',
            worldType: activeWorld,
            timeline,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('故事生成失败');
        }

        const data = await response.json();
        storyCache.current[cacheKey] = data.story;
        setStory(data.story);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        reportError('StoryMode.generate', err);
        setStory('');
        setError('故事生成失败，免费模型偶尔不稳定，请点击重试');
      } finally {
        setLoading(false);
      }
    }

    generate();

    return () => {
      controller.abort();
    };
    // activeWorld/userInput/worldA.timeline/worldB.timeline are encoded in cacheKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, retryNonce]);

  const handleRetry = () => {
    delete storyCache.current[cacheKey];
    setRetryNonce((n) => n + 1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 路线选择器 */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={activeWorld === 'A' ? 'primary' : 'secondary'}
          onClick={() => setActiveWorld('A')}
        >
          路线A: {worldA.title}
        </Button>
        <Button
          variant={activeWorld === 'B' ? 'primary' : 'secondary'}
          onClick={() => setActiveWorld('B')}
        >
          路线B: {worldB.title}
        </Button>
      </div>

      {/* 故事内容 */}
      <Card variant="glass" className="p-8 md:p-12">
        {loading ? (
          <Loading message="正在创作人生故事..." />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-red-400">{error}</p>
            <Button variant="secondary" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-invert max-w-none"
          >
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold m-0">
                {activeWorld === 'A' ? worldA.title : worldB.title}
              </h2>
            </div>

            <div className="space-y-6 text-gray-300 leading-relaxed whitespace-pre-wrap">
              {story || '正在为你创作人生故事...'}
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
