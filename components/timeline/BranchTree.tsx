'use client';

import { Card } from '@/components/ui/Card';
import { WorldTimeline } from '@/types';
import { GitBranch } from 'lucide-react';

interface BranchTreeProps {
  keyDecision: string;
  worldA: WorldTimeline;
  worldB: WorldTimeline;
}

export function BranchTree({ keyDecision, worldA, worldB }: BranchTreeProps) {
  const maxLen = Math.max(worldA.timeline.length, worldB.timeline.length);
  const height = Math.max(600, 220 + maxLen * 65 + 40);

  // 预先计算每个节点坐标，并把横向漂移限制在画布内，避免节点越界或连线错位。
  // 漂移量随节点数自适应，保证最后一个节点仍落在安全边界内。
  const driftA = maxLen > 1 ? Math.min(20, (150 - 60) / (maxLen - 1)) : 0;
  const driftB = maxLen > 1 ? Math.min(20, (740 - 650) / (maxLen - 1)) : 0;
  const aPos = worldA.timeline.map((node, i) => ({ node, x: 150 - i * driftA, y: 220 + i * 65 }));
  const bPos = worldB.timeline.map((node, i) => ({ node, x: 650 + i * driftB, y: 220 + i * 65 }));

  return (
    <div className="max-w-6xl mx-auto">
      <Card variant="glass" className="p-4 sm:p-8 overflow-x-auto branch-tree-scroll">
        <div className="w-full">
          {/* 标题 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold mb-4">
              <GitBranch className="w-5 h-5" />
              人生分支树
            </div>
            <p className="text-gray-400">关键决定: {keyDecision}</p>
          </div>

          {maxLen === 0 ? (
            <p className="text-center text-gray-500 py-12">暂无时间线数据</p>
          ) : (
            <svg width="100%" height={height} viewBox={`0 0 800 ${height}`} preserveAspectRatio="xMidYMin meet" className="mx-auto w-full h-auto" role="img" aria-label="人生分支树可视化">
              {/* 中心节点 - 关键决定 */}
              <circle cx="400" cy="80" r="40" fill="url(#gradientCenter)" className="branch-node" style={{ animationDelay: '0s' }} />
              <text x="400" y="80" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="12" fontWeight="bold">关键决定</text>

              {/* 路线A分支 */}
              <path d="M 400 120 Q 250 180 150 200" stroke="url(#gradientA)" strokeWidth="3" fill="none" className="branch-line" style={{ animationDelay: '0.3s' }} />

              {/* 路线B分支 */}
              <path d="M 400 120 Q 550 180 650 200" stroke="url(#gradientB)" strokeWidth="3" fill="none" className="branch-line" style={{ animationDelay: '0.3s' }} />

              {/* 路线A节点 */}
              {aPos.map((p, index) => {
                const next = aPos[index + 1];
                return (
                  <g key={`a-${p.node.age}-${index}`}>
                    {next && (
                      <line x1={p.x} y1={p.y + 25} x2={next.x} y2={next.y - 25} stroke="rgba(99, 102, 241, 0.5)" strokeWidth="2" />
                    )}
                    <circle cx={p.x} cy={p.y} r="25" fill="url(#gradientA)" className="branch-node" style={{ animationDelay: `${0.6 + index * 0.1}s` }} />
                    <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="bold">{p.node.age}岁</text>
                    <title>{`${p.node.age}岁 - ${p.node.event}`}</title>
                  </g>
                );
              })}

              {/* 路线B节点 */}
              {bPos.map((p, index) => {
                const next = bPos[index + 1];
                return (
                  <g key={`b-${p.node.age}-${index}`}>
                    {next && (
                      <line x1={p.x} y1={p.y + 25} x2={next.x} y2={next.y - 25} stroke="rgba(168, 85, 247, 0.5)" strokeWidth="2" />
                    )}
                    <circle cx={p.x} cy={p.y} r="25" fill="url(#gradientB)" className="branch-node" style={{ animationDelay: `${0.6 + index * 0.1}s` }} />
                    <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="bold">{p.node.age}岁</text>
                    <title>{`${p.node.age}岁 - ${p.node.event}`}</title>
                  </g>
                );
              })}

              {/* 渐变定义 */}
              <defs>
                <linearGradient id="gradientCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradientA" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="gradientB" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {/* 图例 */}
          {maxLen > 0 && (
            <div className="flex justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" />
                <span className="text-sm text-gray-300">路线A: {worldA.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                <span className="text-sm text-gray-300">路线B: {worldB.title}</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
