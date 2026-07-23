'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { TimelineNode, WorldTimeline } from '@/types';
import { CheckCircle2, TrendingUp, Heart } from 'lucide-react';

interface TimelineViewProps {
  worldA: WorldTimeline;
  worldB: WorldTimeline;
}

const emotionColors = {
  excited: 'from-yellow-400 to-orange-500',
  challenged: 'from-red-400 to-pink-500',
  peaceful: 'from-blue-400 to-cyan-500',
  successful: 'from-green-400 to-emerald-500',
  regretful: 'from-gray-400 to-slate-500',
  neutral: 'from-indigo-400 to-purple-500',
};

const emotionLabels = {
  excited: '兴奋',
  challenged: '挑战',
  peaceful: '平静',
  successful: '成功',
  regretful: '遗憾',
  neutral: '中性',
};

const TimelineNodeCard = memo(function TimelineNodeCard({ node, route }: { node: TimelineNode; route?: 'A' | 'B' }) {
  const colorClass = emotionColors[node.emotion] || emotionColors.neutral;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card variant="glass" className="hover:bg-white/10 transition-all">
        {/* 路线标识：移动端单列堆叠时用于区分 A/B */}
        {route && (
          <span className="md:hidden inline-block mb-2 px-2 py-0.5 rounded-md bg-white/10 text-xs text-gray-300">
            路线{route}
          </span>
        )}
        {/* 年龄标签 */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${colorClass} text-white text-sm font-semibold mb-3`}>
          <span>{node.age}岁</span>
          <span className="text-xs opacity-80">{node.year}年</span>
        </div>

        {/* 事件标题 */}
        <h3 className="text-lg font-bold mb-2 text-white">{node.event}</h3>

        {/* 描述 */}
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          {node.description}
        </p>

        {/* 情绪标签 */}
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-pink-400" />
          <span className="text-xs text-gray-400">
            情绪: {emotionLabels[node.emotion]}
          </span>
        </div>

        {/* 里程碑 */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-400 mb-1">关键成就</p>
            <p className="text-sm text-white">{node.milestone}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

export function TimelineView({ worldA, worldB }: TimelineViewProps) {
  return (
    <div className="space-y-12">
      {/* 路线标题 */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
            <TrendingUp className="w-5 h-5" />
            路线A: {worldA.title}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center md:text-right"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold">
            <TrendingUp className="w-5 h-5" />
            路线B: {worldB.title}
          </div>
        </motion.div>
      </div>

      {/* 时间线节点 */}
      <div className="space-y-8">
        {Array.from({ length: Math.max(worldA.timeline.length, worldB.timeline.length) }).map((_, index) => {
          const nodeA = worldA.timeline[index];
          const nodeB = worldB.timeline[index];
          const key = nodeA?.age ?? nodeB?.age ?? index;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* 路线A节点 */}
              {nodeA ? (
                <TimelineNodeCard node={nodeA} route="A" />
              ) : (
                <div className="hidden md:block" />
              )}

              {/* 路线B节点 */}
              {nodeB ? (
                <TimelineNodeCard node={nodeB} route="B" />
              ) : (
                <div className="hidden md:block" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
