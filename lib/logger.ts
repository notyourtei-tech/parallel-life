// 统一的错误/警告上报入口，替代散落各处的裸 console.error。
// 默认输出结构化日志；若配置了 SENTRY_DSN，可在此扩展接入 Sentry 等监控（此处保留钩子）。

type LogContext = Record<string, unknown> | undefined;

function serialize(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

// 是否启用了外部监控（预留：接 Sentry 时读取 SENTRY_DSN）
export function monitoringEnabled(): boolean {
  return Boolean(process.env.SENTRY_DSN);
}

export function reportError(scope: string, error: unknown, context?: LogContext): void {
  const info = serialize(error);
  // 结构化输出，便于日志采集与检索
  console.error(
    JSON.stringify({ level: 'error', scope, message: info.message, ...context }),
  );
  if (info.stack && process.env.NODE_ENV !== 'production') {
    console.error(info.stack);
  }
  // TODO(可选): monitoringEnabled() 时上报到 Sentry
}

export function reportWarn(scope: string, message: string, context?: LogContext): void {
  console.warn(JSON.stringify({ level: 'warn', scope, message, ...context }));
}
