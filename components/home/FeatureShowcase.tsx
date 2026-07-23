'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Brain, GitBranch, BookOpen, Image as ImageIcon, Share2 } from 'lucide-react';

const features: {
  icon: typeof Brain;
  title: string;
  description: string;
  color: string;
  comingSoon?: boolean;
}[] = [
  {
    icon: Brain,
    title: 'AI双时间线生成',
    description: '基于你的关键决定,AI生成两条平行人生路线,看见不同选择的结果',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: GitBranch,
    title: '可视化时间轴',
    description: '18岁到50岁的人生节点清晰呈现,每个阶段的重要事件一目了然',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: BookOpen,
    title: '故事模式',
    description: '文学化叙事风格,第二人称沉浸式阅读体验,感受另一种人生的起伏',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: ImageIcon,
    title: '场景插图',
    description: 'AI为关键节点生成精美插图,让平行世界更加真实可感',
    color: 'from-yellow-500 to-orange-600',
    comingSoon: true,
  },
  {
    icon: Share2,
    title: '一键分享',
    description: '生成精美卡片,轻松分享到小红书、微信、Instagram等社交平台',
    color: 'from-green-500 to-emerald-600',
  },
];

export function FeatureShowcase() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            核心功能
          </h2>
          <p className="text-gray-400 text-lg">
            用科技探索人生的无限可能
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="glass" className="h-full hover:bg-white/10 transition-all group relative overflow-hidden">
                {feature.comingSoon && (
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    规划中
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
