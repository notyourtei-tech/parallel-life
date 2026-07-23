'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getTimelines, deleteTimeline, togglePinTimeline } from '@/lib/storage';
import { LocalTimeline } from '@/types';
import { Trash2, ExternalLink, Star, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EMPTY: LocalTimeline[] = [];

export function RecentTimelines() {
  const router = useRouter();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // 用普通 state + effect 读取 localStorage，并监听 storage 派发的更新事件。
  // 不能用 useSyncExternalStore(getTimelines)：getTimelines() 每次返回新数组，
  // 会触发 React “getSnapshot should be cached” 的无限渲染告警。
  const [timelines, setTimelines] = useState<LocalTimeline[]>(EMPTY);

  useEffect(() => {
    const update = () => setTimelines(getTimelines());
    update();
    window.addEventListener('parallel-life-update', update);
    return () => window.removeEventListener('parallel-life-update', update);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setConfirmDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (confirmDeleteId) {
      deleteTimeline(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId]);

  const handleTogglePin = useCallback((id: string) => {
    togglePinTimeline(id);
  }, []);

  // 空状态：引导用户开始第一次探索
  if (timelines.length === 0) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 mb-6">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">
            开启你的第一段平行人生
          </h2>
          <p className="text-gray-400 mb-8">
            还没有生成记录。填写一个「如果当初……」的关键决定，看看 AI 会为你展开怎样的另一种可能。
          </p>
          <Button size="lg" onClick={() => router.push('/generate')}>
            <Compass className="w-5 h-5 mr-2" />
            开始探索
          </Button>
        </div>
      </section>
    );
  }

  // 置顶的排在最前，其余按时间倒序
  const sorted = [...timelines].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned),
  );

  return (
    <section className="py-20 px-4 bg-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            最近生成
          </h2>
          <p className="text-gray-400">
            继续探索你之前的平行人生
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.slice(0, 6).map((timeline, index) => (
            <motion.div
              key={timeline.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" className="hover:bg-white/10 transition-all group">
                <div className="mb-4">
                  <div className="flex items-start gap-2">
                    {timeline.pinned && (
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0 mt-1" />
                    )}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {timeline.userInput.keyDecision}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(timeline.createdAt).toLocaleDateString('zh-CN')}{' '}
                    {new Date(timeline.createdAt).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-indigo-400">路线A:</span>
                    <span className="text-gray-300 truncate">{timeline.result.worldA.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-400">路线B:</span>
                    <span className="text-gray-300 truncate">{timeline.result.worldB.title}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="flex-1"
                    onClick={() => router.push(`/timeline/${timeline.id}`)}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    查看
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePin(timeline.id)}
                    className={
                      timeline.pinned
                        ? 'text-yellow-400 hover:text-yellow-300'
                        : 'text-gray-400 hover:text-yellow-300'
                    }
                    aria-label={timeline.pinned ? '取消置顶' : '置顶'}
                  >
                    <Star className={`w-4 h-4 ${timeline.pinned ? 'fill-yellow-400' : ''}`} />
                  </Button>
                  {confirmDeleteId === timeline.id ? (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={confirmDelete}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        确认
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-gray-400 text-xs"
                      >
                        取消
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(timeline.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
