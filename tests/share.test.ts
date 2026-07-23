import { describe, it, expect } from 'vitest';
import { encodeTimeline, decodeTimeline, isShareUrlTooLong } from '@/lib/share';
import { SHARE_URL_MAX_SAFE } from '@/lib/config';

describe('encodeTimeline / decodeTimeline', () => {
  it('往返编解码保持数据一致', () => {
    const data = { id: 'x', title: '路线A', nodes: [{ age: 25, event: '决定' }] };
    const encoded = encodeTimeline(data);
    expect(typeof encoded).toBe('string');
    expect(decodeTimeline(encoded)).toEqual(data);
  });

  it('正确处理中文/表情等多字节字符', () => {
    const data = { text: '如果当年去了深圳创业🚀，人生会不同吗？' };
    expect(decodeTimeline(encodeTimeline(data))).toEqual(data);
  });

  it('损坏的 base64 返回 null 而不抛错', () => {
    expect(decodeTimeline('!!!not-base64!!!')).toBeNull();
  });

  it('合法 base64 但非 JSON 返回 null', () => {
    const notJson = btoa('not valid json at all');
    expect(decodeTimeline(notJson)).toBeNull();
  });

  it('空字符串返回 null', () => {
    expect(decodeTimeline('')).toBeNull();
  });

  it('超长内容仍可正确往返', () => {
    const data = { story: '很长的故事。'.repeat(5000) };
    expect(decodeTimeline(encodeTimeline(data))).toEqual(data);
  });
});

describe('isShareUrlTooLong', () => {
  it('短链接判定为不超长', () => {
    expect(isShareUrlTooLong('https://x.com/a')).toBe(false);
  });

  it('超过阈值的链接判定为超长', () => {
    const long = 'https://x.com/?d=' + 'a'.repeat(SHARE_URL_MAX_SAFE);
    expect(isShareUrlTooLong(long)).toBe(true);
  });

  it('恰好等于阈值不算超长', () => {
    expect(isShareUrlTooLong('a'.repeat(SHARE_URL_MAX_SAFE))).toBe(false);
  });
});
