// 公开分享：把时间线编码进 URL，无需后端即可跨设备分享。
// 采用 UTF-8 安全的 base64，避免中文乱码。
// 只编码分享必需的 userInput 与 result，避免把内部 id / createdAt /
// processingTime 写进链接（既缩短 URL，也避免泄露创建时间）。
import { SHARE_URL_MAX_SAFE } from '@/lib/config';
import type { LocalTimeline } from '@/types';

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (ch) => ch.codePointAt(0) ?? 0);
  return new TextDecoder().decode(bytes);
}

// 只编码分享必需的 userInput 与 result
export function encodeTimeline(timeline: LocalTimeline): string {
  const payload = { userInput: timeline.userInput, result: timeline.result };
  return utf8ToBase64(JSON.stringify(payload));
}

// 解码；任何损坏/伪造的输入都返回 null（绝不抛错）。
// 用占位字段补齐 LocalTimeline 形状，分享页与 TimelineView 只消费 result。
// 旧的完整对象链接（含 id/createdAt）也能解码：只要 userInput/result 存在即可。
export function decodeTimeline(encoded: string): LocalTimeline | null {
  try {
    const parsed = JSON.parse(base64ToUtf8(encoded)) as Pick<LocalTimeline, 'userInput' | 'result'>;
    if (!parsed || !parsed.userInput || !parsed.result) return null;
    return {
      id: 'shared',
      createdAt: 0,
      userInput: parsed.userInput,
      result: parsed.result,
      images: [],
    };
  } catch {
    return null;
  }
}

// 分享链接是否过长：整条时间线（含故事全文）塞进 URL 后，超过阈值的链接
// 在微信/短信等场景可能被截断导致打不开，UI 据此给出提示。
export function isShareUrlTooLong(url: string): boolean {
  return url.length > SHARE_URL_MAX_SAFE;
}
