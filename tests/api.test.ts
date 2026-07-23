import { describe, it, expect, vi, beforeEach } from 'vitest';

// 用 mock 替代真实的 AI 调用与配置读取，仅验证路由自身的
// 配置校验 / 输入校验 / 限流 / 正常分发逻辑。
vi.mock('@/lib/claude', () => ({
  isConfigured: vi.fn(),
  generateTimeline: vi.fn(),
  generateStory: vi.fn(),
}));

import { POST } from '@/app/api/generate/route';
import { isConfigured, generateTimeline, generateStory } from '@/lib/claude';
import { NextRequest } from 'next/server';

const validInput = {
  age: 28,
  gender: '男',
  country: '中国',
  occupation: '产品经理',
  status: '稳定',
  keyDecision: '如果当年去了深圳创业而不是留在大厂，现在会过着怎样的生活？',
};

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const mockConfigured = vi.mocked(isConfigured);
const mockGenerateTimeline = vi.mocked(generateTimeline);
const mockGenerateStory = vi.mocked(generateStory);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/generate', () => {
  it('未配置 API Key 时返回 503', async () => {
    mockConfigured.mockReturnValue(false);
    const res = await POST(makeReq({ input: validInput, type: 'timeline' }));
    expect(res.status).toBe(503);
  });

  it('缺少必要字段时返回 400', async () => {
    mockConfigured.mockReturnValue(true);
    const res = await POST(makeReq({ input: { age: 28 }, type: 'timeline' }));
    expect(res.status).toBe(400);
  });

  it('年龄超出 16-60 范围时返回 400', async () => {
    mockConfigured.mockReturnValue(true);
    const res = await POST(makeReq({ input: { ...validInput, age: 10 }, type: 'timeline' }));
    expect(res.status).toBe(400);
  });

  it('type 非法时返回 400', async () => {
    mockConfigured.mockReturnValue(true);
    const res = await POST(makeReq({ input: validInput, type: 'foobar' }));
    expect(res.status).toBe(400);
  });

  it('合法时间线请求返回 200 与 result / processingTime', async () => {
    mockConfigured.mockReturnValue(true);
    mockGenerateTimeline.mockResolvedValue({
      worldA: { title: 'A', timeline: [] },
      worldB: { title: 'B', timeline: [] },
    });
    const res = await POST(makeReq({ input: validInput, type: 'timeline' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result).toBeDefined();
    expect(typeof data.processingTime).toBe('number');
  });

  it('合法故事请求返回 200 与 story', async () => {
    mockConfigured.mockReturnValue(true);
    mockGenerateStory.mockResolvedValue('这是一段平行人生故事...');
    const res = await POST(
      makeReq({
        input: validInput,
        type: 'story',
        worldType: 'A',
        timeline: [
          { age: 20, year: 2018, event: 'e', description: 'd', emotion: 'neutral', milestone: 'm' },
        ],
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.story).toBe('这是一段平行人生故事...');
  });

  it('性别非法时返回 400', async () => {
    mockConfigured.mockReturnValue(true);
    const res = await POST(makeReq({ input: { ...validInput, gender: '外星人' }, type: 'timeline' }));
    expect(res.status).toBe(400);
  });

  it('国家/地区非法时返回 400', async () => {
    mockConfigured.mockReturnValue(true);
    const res = await POST(makeReq({ input: { ...validInput, country: '火星' }, type: 'timeline' }));
    expect(res.status).toBe(400);
  });

  it('请求体超大时返回 413（流式读取上限）', async () => {
    mockConfigured.mockReturnValue(true);
    const huge = { input: validInput, type: 'timeline', extra: 'x'.repeat(20000) };
    const res = await POST(makeReq(huge));
    expect(res.status).toBe(413);
  });
});
