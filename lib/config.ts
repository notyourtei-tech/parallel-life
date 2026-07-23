// 全站集中配置：把散落在各处的模型名、限流阈值、输入上限、下拉选项等收敛到一处，
// 方便统一调整，也避免前后端硬编码不一致。

// ---- AI / OpenRouter ----
// 默认走 OpenRouter 免费模型（id 以 :free 结尾），无需充值。
// OPENROUTER_BASE_URL 可指向任意 OpenAI 兼容网关（如本地 Ollama: http://localhost:11434/v1）。
export const AI_BASE_URL = (process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1').replace(/\/$/, '');
export const AI_MODEL = process.env.OPENROUTER_MODEL ?? 'nvidia/nemotron-3-super-120b-a12b:free';
export const AI_TIMEOUT_MS = 120_000;
export const AI_MAX_RETRIES = 2;
export const SITE_NAME = 'Parallel Life AI';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// ---- API 限流 ----
export const RATE_LIMIT = {
  windowMs: 60_000,
  max: 12,
  cleanupIntervalMs: 10_000,
} as const;

// ---- 输入校验上限 ----
export const INPUT_LIMITS = {
  maxInput: 500,
  maxKeyDecision: 2000,
  minKeyDecision: 20,
  maxBodyBytes: 10_000,
  maxTimelineNodes: 10,
  minTimelineNodes: 4,
} as const;

// ---- 业务常量 ----
export const AGE_RANGE = { min: 16, max: 60 } as const;
export const MAX_TIMELINES = 10;

export const COUNTRIES = [
  '中国', '美国', '日本', '英国', '加拿大', '澳大利亚',
  '德国', '法国', '韩国', '新加坡', '其他',
] as const;

export const GENDERS = ['男', '女', '其他', '不愿透露'] as const;

// 分享链接（把整条时间线塞进 URL）超过此长度时，部分平台（微信/短信）可能截断导致打不开。
export const SHARE_URL_MAX_SAFE = 8000;
