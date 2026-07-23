'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { reportError } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError('app/error-boundary', error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">😵</div>
        <h1 className="text-2xl font-bold mb-4 gradient-text">出错了</h1>
        <p className="text-gray-400 mb-8">
          发生了未知错误,请稍后重试
        </p>
        <Button onClick={reset} size="lg">
          重试
        </Button>
      </div>
    </div>
  );
}
