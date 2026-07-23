'use client';

import { motion } from 'framer-motion';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = '加载中...', fullScreen = false }: LoadingProps) {
  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-[#0a0e27] z-50'
    : 'flex items-center justify-center py-12';
  
  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* 旋转的时间漩涡动画 */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-indigo-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-purple-500/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border-4 border-cyan-500/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full glow-sm"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
        
        {/* 加载文字 */}
        <motion.p
          className="text-lg text-gray-300"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
        
        {/* 进度点动画 */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
