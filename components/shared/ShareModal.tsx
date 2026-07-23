'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getTimelineById } from '@/lib/storage';
import { encodeTimeline, isShareUrlTooLong } from '@/lib/share';
import { reportError } from '@/lib/logger';
import { X, Copy, Check, MessageCircle, Camera, Send, Globe, AlertTriangle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  timelineId: string;
  keyDecision: string;
}

export function ShareModal({ isOpen, onClose, timelineId, keyDecision }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const shareUrl = useMemo(
    () =>
      isOpen && typeof window !== 'undefined'
        ? `${window.location.origin}/timeline/${timelineId}`
        : '',
    [isOpen, timelineId],
  );

  // 把整条时间线编码进 URL，无需后端即可生成可公开访问的链接
  const publicUrl = useMemo(() => {
    if (!isOpen || typeof window === 'undefined') return '';
    const tl = getTimelineById(timelineId);
    if (!tl) return '';
    return `${window.location.origin}/shared?d=${encodeURIComponent(encodeTimeline(tl))}`;
  }, [isOpen, timelineId]);

  // 公开链接把整条时间线塞进 URL，过长时部分平台（微信/短信）会截断导致打不开
  const publicUrlTooLong = useMemo(() => Boolean(publicUrl) && isShareUrlTooLong(publicUrl), [publicUrl]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      modalRef.current?.querySelector<HTMLElement>('button')?.focus();
    }, 100);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [isOpen, handleKeyDown]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      reportError('ShareModal.handleCopy', error);
    }
  };

  const handleCopyPublic = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    } catch (error) {
      reportError('ShareModal.handleCopyPublic', error);
    }
  };

  const sharePlatforms = [
    {
      name: '复制链接',
      icon: Copy,
      action: handleCopy,
      color: 'from-gray-500 to-slate-600',
    },
    {
      name: '微信',
      icon: MessageCircle,
      action: () => alert('请截图后分享到微信'),
      color: 'from-green-500 to-emerald-600',
    },
    {
      name: '小红书',
      icon: Camera,
      action: () => alert('请截图后分享到小红书'),
      color: 'from-red-500 to-pink-600',
    },
    {
      name: 'Twitter',
      icon: Send,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent('看看我的平行人生!')}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'noopener,noreferrer',
        ),
      color: 'from-blue-400 to-cyan-500',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="share-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <Card
            ref={modalRef}
            variant="glass"
            role="dialog"
            aria-modal="true"
            aria-label="分享平行人生"
            className="w-full max-w-md pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="关闭"
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 pr-8">
              <h2 className="text-2xl font-bold mb-2 gradient-text">分享你的平行人生</h2>
              <p className="text-gray-400 text-sm">{keyDecision.substring(0, 50)}...</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                本机链接（仅本设备可打开）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300"
                />
                <Button variant={copied ? 'primary' : 'secondary'} size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </>
                  )}
                </Button>
              </div>
            </div>

            {publicUrl && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  公开链接（可发给任何人，无需登录）
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300"
                  />
                  <Button variant={copiedPublic ? 'primary' : 'secondary'} size="sm" onClick={handleCopyPublic}>
                    {copiedPublic ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-1" />
                        复制
                      </>
                    )}
                  </Button>
                </div>
                {publicUrlTooLong && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-yellow-300/90">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      此公开链接较长，在微信/短信中可能被截断而无法打开。建议改用「本机链接」，或直接截图分享。
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {sharePlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.name}
                    variant="secondary"
                    onClick={platform.action}
                    className="justify-start"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-r ${platform.color} flex items-center justify-center mr-2`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span>{platform.name}</span>
                  </Button>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-200">💡 小贴士：截图当前页面，配上精彩文案，效果更佳！</p>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
