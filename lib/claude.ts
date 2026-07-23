// OpenRouter 客户端（OpenAI 兼容接口）
// 密钥仅从 OPENROUTER_API_KEY 读取，永远不要写进源码或提交到 Git。
import { UserInput, TimelineNode, TimelineResult } from '@/types';
import { buildTimelinePrompt, buildStoryPrompt } from '@/prompts/templates';
import {
  AI_BASE_URL,
  AI_MODEL as MODEL,
  AI_TIMEOUT_MS as API_TIMEOUT_MS,
  AI_MAX_RETRIES as MAX_RETRIES,
  SITE_NAME,
  SITE_URL,
  INPUT_LIMITS,
} from '@/lib/config';
import { reportError } from '@/lib/logger';

// 默认走 OpenRouter 的免费模型（id 以 :free 结尾），无需充值即可使用。
// 想用更强模型时，在 .env.local 设置 OPENROUTER_MODEL 为付费 slug 并充值额度。
// OPENROUTER_BASE_URL 可指向任意 OpenAI 兼容网关（如本地 Ollama: http://localhost:11434/v1）。
const OPENROUTER_URL = `${AI_BASE_URL}/chat/completions`;

// 对瞬时错误（JSON 解析失败、模型输出异常、限流）自动重试；超时(AbortError)不重试以免长时间卡死。
// 导出以便单测覆盖重试/终止分支。
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (err instanceof Error && err.name === 'AbortError') break;
      if (attempt < MAX_RETRIES) continue;
    }
  }
  throw lastErr;
}

// 仅从环境变量读取密钥（确保 .env.local 未被提交）
export function isConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('AI 服务未配置：请在 .env.local 中设置 OPENROUTER_API_KEY（不要提交该文件）。');
  }
  return key;
}

// 把 OpenRouter 的上游错误码翻译成对中文用户友好的提示
function upstreamMessage(status: number, detail: string): string {
  if (status === 401) {
    return 'API Key 无效或已过期，请检查 OPENROUTER_API_KEY 环境变量';
  }
  if (status === 402) {
    return 'OpenRouter 账户额度不足。无需充值：把 OPENROUTER_MODEL 改为免费模型（如 nvidia/nemotron-3-super-120b-a12b:free，id 以 :free 结尾）即可免费使用';
  }
  if (status === 429) {
    return 'AI 服务调用过于频繁，请稍后再试';
  }
  if (status >= 500) {
    return 'AI 服务暂时不可用，请稍后重试';
  }
  return `生成失败（${status}）：${detail.slice(0, 120)}`;
}

// 调用 OpenRouter 的聊天补全接口，返回模型原始文本。
// opts.jsonMode 为 true 时要求模型输出严格 JSON（部分模型/网关不支持，会自动降级重试）。
async function chatCompletion(
  prompt: string,
  opts: { temperature: number; maxTokens: number; jsonMode?: boolean },
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const buildBody = (jsonMode: boolean) => ({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  });

  const doFetch = async (jsonMode: boolean): Promise<string> => {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
      },
      body: JSON.stringify(buildBody(jsonMode)),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      // 部分模型不支持 response_format，自动去掉后重试一次
      if (jsonMode && res.status === 400 && /response_format/i.test(detail)) {
        return doFetch(false);
      }
      throw new Error(upstreamMessage(res.status, detail));
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (data.error?.message) {
      throw new Error(`OpenRouter 错误: ${data.error.message}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter 返回内容为空');
    }
    return content;
  };

  try {
    return await doFetch(Boolean(opts.jsonMode));
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// 从模型输出中提取 JSON：兼容模型在 JSON 前后附加的说明文字、markdown 代码块、思考过程
export function extractJson(text: string): unknown {
  let cleaned = text.trim();

  // 去掉 ```json ... ``` 或 ``` ... ``` 代码块围栏
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  // 去掉可能混入的思考过程标记（如 <think>...</think>）
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI 返回的内容中未找到有效的 JSON 数据');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

// 与 prompts/templates.ts 中要求模型使用的情绪标签保持一致（单 l 拼写）
export const VALID_EMOTIONS = new Set([
  'excited',
  'challenged',
  'peaceful',
  'successful',
  'regretful',
  'neutral',
]);

export function validateTimeline(result: TimelineResult): void {
  if (!result.worldA?.title || !result.worldB?.title) {
    throw new Error('时间线缺少标题');
  }
  for (const world of [result.worldA, result.worldB]) {
    if (!Array.isArray(world.timeline) || world.timeline.length === 0) {
      throw new Error('时间线节点不能为空');
    }
    if (world.timeline.length > INPUT_LIMITS.maxTimelineNodes) {
      throw new Error(`时间线节点不能超过${INPUT_LIMITS.maxTimelineNodes}个`);
    }
    for (const node of world.timeline) {
      if (
        typeof node.age !== 'number' ||
        typeof node.year !== 'number' ||
        typeof node.event !== 'string' ||
        typeof node.description !== 'string' ||
        typeof node.milestone !== 'string' ||
        !VALID_EMOTIONS.has(node.emotion)
      ) {
        throw new Error('时间线节点结构不正确');
      }
    }
  }
}

// 生成时间线
export async function generateTimeline(input: UserInput): Promise<TimelineResult> {
  try {
    const prompt = buildTimelinePrompt(input);
    const text = await withRetry(() =>
      chatCompletion(prompt, { temperature: 0.8, maxTokens: 4000, jsonMode: true }),
    );
    const parsed = extractJson(text) as TimelineResult;
    validateTimeline(parsed);
    return parsed;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('时间线') || error.message.includes('JSON'))) {
      throw error;
    }
    reportError('generateTimeline', error);
    throw error;
  }
}

// 生成故事模式
export async function generateStory(
  input: UserInput,
  worldType: 'A' | 'B',
  timeline: TimelineNode[],
): Promise<string> {
  try {
    const prompt = buildStoryPrompt(input, worldType, timeline);
    const text = await withRetry(() =>
      chatCompletion(prompt, { temperature: 0.9, maxTokens: 3000 }),
    );
    return text.trim();
  } catch (error) {
    reportError('generateStory', error);
    throw error;
  }
}
