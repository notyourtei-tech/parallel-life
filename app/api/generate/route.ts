import { NextRequest, NextResponse } from 'next/server';
import { generateTimeline, generateStory, isConfigured } from '@/lib/claude';
import { UserInput, TimelineNode } from '@/types';
import { RATE_LIMIT, INPUT_LIMITS, GENDERS, COUNTRIES } from '@/lib/config';
import { reportError } from '@/lib/logger';

const MAX_INPUT_LENGTH = INPUT_LIMITS.maxInput;
const MAX_KEY_DECISION_LENGTH = INPUT_LIMITS.maxKeyDecision;
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT.windowMs;
const RATE_LIMIT_MAX = RATE_LIMIT.max;
const RATE_LIMIT_CLEANUP_INTERVAL = RATE_LIMIT.cleanupIntervalMs;

// 进程内存限流：仅在「单实例」部署下有效。部署到 Vercel/多实例等无状态环境时，
// 各实例内存独立，限流会被绕过 —— 生产多实例请改用 Upstash Redis 等共享存储。
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
let lastCleanupAt = Date.now();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // 定期清理过期条目，防止内存泄漏
  if (now - lastCleanupAt > RATE_LIMIT_CLEANUP_INTERVAL) {
    lastCleanupAt = now;
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function sanitizeInput(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLength).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim();
}

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: '服务未配置：请在环境变量中设置 OPENROUTER_API_KEY' },
      { status: 503 },
    );
  }

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: '请求过于频繁,请稍后再试' },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      const rawText = await request.text();
      if (rawText.length > INPUT_LIMITS.maxBodyBytes) {
        return NextResponse.json(
          { error: '请求体过大' },
          { status: 413 }
        );
      }
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: '请求体格式不正确' },
        { status: 400 }
      );
    }

    const { input, type = 'timeline', worldType, timeline } = body as {
      input?: Record<string, unknown>;
      type?: string;
      worldType?: string;
      timeline?: TimelineNode[];
    };

    if (type !== 'timeline' && type !== 'story') {
      return NextResponse.json(
        { error: 'type 必须是 "timeline" 或 "story"' },
        { status: 400 }
      );
    }

    if (!input || !input.age || !input.keyDecision) {
      return NextResponse.json(
        { error: '缺少必要的输入信息' },
        { status: 400 }
      );
    }

    const age = Number(input.age);
    if (!Number.isInteger(age) || age < 16 || age > 60) {
      return NextResponse.json({ error: '年龄必须是16-60之间的整数' }, { status: 400 });
    }

    const keyDecision = sanitizeInput(input.keyDecision, MAX_KEY_DECISION_LENGTH);
    if (keyDecision.length < 20) {
      return NextResponse.json({ error: '关键决定至少需要20个字符' }, { status: 400 });
    }

    // 服务端对性别/国家做白名单校验：前端只发送合法值，拒绝伪造/越权输入，
    // 避免任意字符串被拼进 AI 提示词。空值允许（随后默认「未指定」）。
    const genderRaw = input.gender;
    if (typeof genderRaw === 'string' && genderRaw && !(GENDERS as readonly string[]).includes(genderRaw)) {
      return NextResponse.json({ error: '性别参数不合法' }, { status: 400 });
    }
    const countryRaw = input.country;
    if (typeof countryRaw === 'string' && countryRaw && !(COUNTRIES as readonly string[]).includes(countryRaw)) {
      return NextResponse.json({ error: '国家/地区参数不合法' }, { status: 400 });
    }

    const userInput: UserInput = {
      age,
      gender: sanitizeInput(input.gender, 20) || '未指定',
      country: sanitizeInput(input.country, 50) || '未指定',
      occupation: sanitizeInput(input.occupation, MAX_INPUT_LENGTH) || '未指定',
      status: sanitizeInput(input.status, MAX_INPUT_LENGTH) || '未指定',
      keyDecision,
    };

    // 根据类型调用不同的生成函数
    if (type === 'story') {
      if (!worldType || (worldType !== 'A' && worldType !== 'B')) {
        return NextResponse.json(
          { error: 'worldType 必须是 "A" 或 "B"' },
          { status: 400 }
        );
      }
      if (!timeline || !Array.isArray(timeline) || timeline.length === 0) {
        return NextResponse.json(
          { error: '生成故事需要提供非空的timeline数组' },
          { status: 400 }
        );
      }
      if (timeline.length > INPUT_LIMITS.maxTimelineNodes) {
        return NextResponse.json(
          { error: `timeline数组最多包含${INPUT_LIMITS.maxTimelineNodes}个节点` },
          { status: 400 }
        );
      }
      
      const story = await generateStory(userInput, worldType, timeline);
      return NextResponse.json({ story });
    } else {
      // 默认生成时间线
      const startTime = Date.now();
      const result = await generateTimeline(userInput);
      const processingTime = Date.now() - startTime;
      
      return NextResponse.json({
        result,
        processingTime,
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '服务器内部错误,请稍后重试';
    reportError('api/generate', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
