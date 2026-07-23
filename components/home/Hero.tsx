'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

const particleKeys = Array.from({ length: 20 }, (_, i) => i);

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-purple-900/20 to-[#0a0e27]" />
        {particleKeys.map((i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full particle"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              '--particle-opacity': 0.2 + (i % 5) * 0.1,
              '--particle-distance': `-${50 + (i % 7) * 30}px`,
              '--particle-duration': `${3 + (i % 4)}s`,
              '--particle-delay': `${(i % 5) * 0.4}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">AI驱动的人生探索</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="gradient-text">探索你的平行人生</span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          如果当初做了不同选择，现在会在哪里？
          <br />
          AI生成你的平行世界时间线，看见另一种可能
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={() => router.push('/generate')}
            className="group"
          >
            <span className="flex items-center gap-2">
              开始探索
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </motion.div>

        {/* 示例卡片 */}
        <motion.div
          className="mt-16 grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { title: '职业转折', desc: '如果辞职创业 vs 继续工作' },
            { title: '城市迁移', desc: '如果去北上广 vs 留在家乡' },
            { title: '留学选择', desc: '如果去日本留学 vs 留在国内' },
          ].map((item, index) => (
            <div
              key={index}
              className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => router.push('/generate')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push('/generate'); }}
            >
              <h3 className="text-lg font-semibold mb-2 text-indigo-300">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
