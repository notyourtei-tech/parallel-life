'use client';

import { useEffect } from 'react';

// 注册 Service Worker（仅生产环境），为应用提供离线兜底与静态资源缓存。
// 开发环境不注册，避免缓存干扰热更新。
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // 注册失败不影响主流程，静默忽略
      });
    };
    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
