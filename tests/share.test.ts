import { describe, it, expect } from 'vitest';
import { encodeTimeline, decodeTimeline, isShareUrlTooLong } from '@/lib/share';
import { SHARE_URL_MAX_SAFE } from '@/lib/config';

describe('encodeTimeline / decodeTimeline', () => {
  // 构造一个最小可用的 LocalTimeline（仅用于编解码往返测试）
  const sampleTimeline = {
    id: 'secret-internal-id',
    createdAt: 123456,
    userInput: {
      age: 28,
      gender: '男',
      country: '中国',
      occupation: '工程师',
      status: '稳定',
      keyDecision: '如果当年去了深圳创业而不是留在大厂',
    },
    result: {
      worldA: {
        title: '路线A',
        timeline: [{ age: 25, year: 2024, event: 'e', description: 'd', emotion: 'neutral', milestone: 'm' }],
      },
      worldB: {
        title: '路线B',
        timeline: [{ age: 40, year: 2039, event: 'e2', description: 'd2', emotion: 'regretful', milestone: 'm2' }],
      },
    },
  } as const;

  it('只编码 userInput 与 result，丢弃内部 id/createdAt', () => {
    const decoded = decodeTimeline(encodeTimeline(sampleTimeline as never))!;
    expect(decoded.id).toBe('shared');
    expect(decoded.createdAt).toBe(0);
    expect(decoded.userInput).toEqual(sampleTimeline.userInput);
    expect(decoded.result).toEqual(sampleTimeline.result);
  });

  it('正确处理中文/表情等多字节字符', () => {
    const tl = {
      ...sampleTimeline,
      userInput: { ...sampleTimeline.userInput, keyDecision: '如果当年去了深圳创业🚀，人生会不同吗？' },
    } as const;
    const decoded = decodeTimeline(encodeTimeline(tl as never))!;
    expect(decoded.userInput.keyDecision).toBe('如果当年去了深圳创业🚀，人生会不同吗？');
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
    const tl = {
      ...sampleTimeline,
      userInput: { ...sampleTimeline.userInput, keyDecision: '如果'.repeat(5000) },
      result: {
        worldA: { title: 'A', timeline: [{ age: 25, year: 2024, event: 'e', description: '很长的故事。'.repeat(5000), emotion: 'neutral', milestone: 'm' }] },
        worldB: { title: 'B', timeline: [{ age: 40, year: 2039, event: 'e2', description: 'd2', emotion: 'regretful', milestone: 'm2' }] },
      },
    } as const;
    const decoded = decodeTimeline(encodeTimeline(tl as never))!;
    expect(decoded.userInput).toEqual(tl.userInput);
    expect(decoded.result).toEqual(tl.result);
  });

  it('旧版完整对象编码的链接仍可解码（忽略多余字段）', () => {
    const full = {
      id: 'old',
      createdAt: 1,
      processingTime: 500,
      userInput: sampleTimeline.userInput,
      result: sampleTimeline.result,
    };
    // 模拟旧版编码器：把整个 LocalTimeline 写进链接
    const bytes = new TextEncoder().encode(JSON.stringify(full));
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    const legacy = btoa(bin);
    const decoded = decodeTimeline(legacy)!;
    expect(decoded.userInput).toEqual(full.userInput);
    expect(decoded.result).toEqual(full.result);
    expect(decoded.id).toBe('shared');
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
