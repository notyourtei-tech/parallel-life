// 公开分享：把整条 LocalTimeline 编码进 URL，无需后端即可跨设备分享。
// 采用 UTF-8 安全的 base64，避免中文乱码。
import { SHARE_URL_MAX_SAFE } from '@/lib/config';

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

// 将任意可序列化对象编码为 URL 安全的 base64 字符串
export function encodeTimeline(timeline: unknown): string {
  return utf8ToBase64(JSON.stringify(timeline));
}

// 解码；任何损坏/伪造的输入都返回 null（绝不抛错）
export function decodeTimeline(encoded: string): unknown | null {
  try {
    return JSON.parse(base64ToUtf8(encoded));
  } catch {
    return null;
  }
}

// 分享链接是否过长：整条时间线（含故事全文）塞进 URL 后，超过阈值的链接
// 在微信/短信等场景可能被截断导致打不开，UI 据此给出提示。
export function isShareUrlTooLong(url: string): boolean {
  return url.length > SHARE_URL_MAX_SAFE;
}
