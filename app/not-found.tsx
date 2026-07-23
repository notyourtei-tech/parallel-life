'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🌀</div>
        <h1 className="text-2xl font-bold mb-4 gradient-text">平行宇宙不存在</h1>
        <p className="text-gray-400 mb-8">
          你要找的页面不在这个时间线上
        </p>
        <Button onClick={() => router.push('/')} size="lg">
          返回首页
        </Button>
      </div>
    </div>
  );
}
