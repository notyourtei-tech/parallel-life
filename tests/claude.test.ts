import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  extractJson,
  validateTimeline,
  isConfigured,
  generateTimeline,
  withRetry,
  VALID_EMOTIONS,
} from '@/lib/claude';
import type { TimelineResult, UserInput } from '@/types';

function makeTimeline(overrides: Partial<TimelineResult> = {}): TimelineResult {
  const node = {
    age: 25,
    year: 2024,
    event: '做了决定',
    description: '描述',
    emotion: 'successful' as const,
    milestone: '成就',
  };
  const world = { title: '路线', timeline: [node] };
  return {
    worldA: overrides.worldA ?? world,
    worldB: overrides.worldB ?? { ...world, title: '另一条' },
  } as TimelineResult;
}

describe('extractJson', () => {
  it('从带噪声的文本中提取 JSON', () => {
    const text = '这是结果:\n{"a":1}\n感谢使用';
    expect(extractJson(text)).toEqual({ a: 1 });
  });

  it('文本中无 JSON 时抛错', () => {
    expect(() => extractJson('没有任何 JSON 内容')).toThrow();
  });

  it('去除 ```json 代码块围栏', () => {
    const text = '```json\n{"a":1}\n```';
    expect(extractJson(text)).toEqual({ a: 1 });
  });

  it('去除无语言标注的 ``` 代码块围栏', () => {
    const text = '```\n{"b":2}\n```';
    expect(extractJson(text)).toEqual({ b: 2 });
  });

  it('去除 <think> 思考过程标记', () => {
    const text = '<think>我先想想</think>\n{"c":3}';
    expect(extractJson(text)).toEqual({ c: 3 });
  });
});

describe('withRetry', () => {
  it('首次成功不重试', async () => {
    const fn = vi.fn(async () => 'ok');
    await expect(withRetry(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('瞬时失败后重试并最终成功', async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls += 1;
      if (calls < 2) throw new Error('瞬时错误');
      return 'ok';
    });
    await expect(withRetry(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('AbortError 不重试直接抛出', async () => {
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    const fn = vi.fn(async () => {
      throw abort;
    });
    await expect(withRetry(fn)).rejects.toThrow('aborted');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('持续失败最终抛出最后一个错误', async () => {
    const fn = vi.fn(async () => {
      throw new Error('一直失败');
    });
    await expect(withRetry(fn)).rejects.toThrow('一直失败');
    // 初次 + MAX_RETRIES(2) 次重试 = 3
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('VALID_EMOTIONS', () => {
  it('包含六种有效情绪', () => {
    expect(VALID_EMOTIONS.size).toBe(6);
    for (const e of [
      'excited',
      'challenged',
      'peaceful',
      'successful',
      'regretful',
      'neutral',
    ]) {
      expect(VALID_EMOTIONS.has(e)).toBe(true);
    }
  });
});

describe('validateTimeline', () => {
  it('合法结果通过校验', () => {
    expect(() => validateTimeline(makeTimeline())).not.toThrow();
  });

  it('缺少标题抛错', () => {
    const bad = makeTimeline({ worldA: { title: '', timeline: [] } });
    expect(() => validateTimeline(bad)).toThrow('时间线缺少标题');
  });

  it('空时间线抛错', () => {
    const bad = makeTimeline();
    bad.worldA.timeline = [];
    expect(() => validateTimeline(bad)).toThrow('时间线节点不能为空');
  });

  it('无效情绪抛错', () => {
    const bad = makeTimeline();
    const node = bad.worldA.timeline[0];
    (node as { emotion: string }).emotion = 'happy';
    expect(() => validateTimeline(bad)).toThrow('时间线节点结构不正确');
  });

  it('节点数超过上限抛错', () => {
    const bad = makeTimeline();
    const base = bad.worldA.timeline[0];
    bad.worldA.timeline = Array.from({ length: 11 }, () => ({ ...base }));
    expect(() => validateTimeline(bad)).toThrow('时间线节点不能超过');
  });
});

describe('isConfigured', () => {
  const original = process.env.OPENROUTER_API_KEY;
  afterEach(() => {
    if (original === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = original;
  });

  it('配置了密钥返回 true', () => {
    process.env.OPENROUTER_API_KEY = 'sk-test';
    expect(isConfigured()).toBe(true);
  });

  it('未配置返回 false', () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(isConfigured()).toBe(false);
  });
});

describe('上游错误映射', () => {
  const validInput: UserInput = {
    age: 28,
    gender: '男',
    country: '中国',
    occupation: '产品经理',
    status: '稳定',
    keyDecision: '如果当年去了深圳创业而不是留在大厂现在会过着怎样的生活？',
  };

  it('402 额度不足返回友好提示', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'sk-test');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 402,
        text: async () => JSON.stringify({ error: { message: 'Insufficient credits' } }),
      })),
    );
    await expect(generateTimeline(validInput)).rejects.toThrow('额度不足');
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('401 Key 无效返回友好提示', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'sk-test');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { message: 'Invalid key' } }),
      })),
    );
    await expect(generateTimeline(validInput)).rejects.toThrow('API Key 无效');
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
});
