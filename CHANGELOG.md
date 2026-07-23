# 更新日志

本文件记录项目的重大变更。

## [0.1.0] - 2026-07-23

### 新增
- AI 调用接入 [OpenRouter](https://openrouter.ai/)（OpenAI 兼容接口），密钥仅服务端读取。
- 单元测试（Vitest + jsdom）：覆盖 `lib/claude.ts`、`lib/storage.ts`、`lib/utils.ts`。
- GitHub Actions CI 流水线（类型检查 → Lint → 构建 → 测试）。
- `robots.txt` / `sitemap.xml` 与动态 OG 分享图。
- 生产级 `Content-Security-Policy` 与若干安全响应头。
- `output: 'standalone'` 支持自托管 Node 服务器。
- 项目元文件：`LICENSE`（MIT）、`CONTRIBUTING.md`、`CHANGELOG.md`、`.nvmrc`。

### 安全
- `.gitignore` 收紧：忽略 `.env` 与 `.env*.local`（含 `.env.local`），仅放行 `.env.local.example` 模板。
- 移除未使用的 `@anthropic-ai/sdk` 依赖。

### 体验
- 生成表单新增「填充示例」按钮，降低首次使用门槛。
- 时间线 / 生成页增加 `noindex` metadata，避免动态内容被搜索引擎收录。

## [0.2.0] - 2026-07-23

本轮为「全面修复与完善」里程碑（两轮累计 63 个文件，+7898 / -760），聚焦健壮性、安全、无障碍与可维护性。

### 安全
- `/api/generate` 新增 **gender / country 服务端白名单校验**：非白名单值直接返回 `400`，杜绝任意字符串被拼进 AI 提示词（空值仍允许，随后默认「未指定」）。
- `lib/claude.ts` 的 `validateTimeline` 新增 **时间线节点数上限**（`maxTimelineNodes = 10`），防止模型偶发返回超长结果撑爆 `localStorage`。
- `.gitignore` 补全 `e2e-pid.txt` 运行残留；真实密钥 `.env.local` 始终不入库（仅提交 `.env.local.example`）。

### 健壮性
- **存储写入回滚**：`lib/storage.ts` 写入失败时回退到旧数据，避免首页/时间线页出现空壳。
- **API 限流防泄漏**：限流状态仅在成功响应后写入，失败/异常路径不消耗配额。
- **记录不存在页**：`/timeline/[id]` 在未找到记录时给出友好引导，而非白屏。
- **PWA 离线兜底**：新增 `public/sw.js` + `offline.html`，安装预缓存改用 `Promise.allSettled`，单条资源缺失（如 icon 路径变动）不再导致整个 Service Worker 安装失败。

### 可维护性
- 常量集中到 `lib/config.ts`，新增结构化日志 `lib/logger.ts`，清理死配置与死代码。
- 类型系统补充（性别/国家白名单常量 `GENDERS` / `COUNTRIES`、输入限制 `INPUT_LIMITS`）。

### 无障碍与移动端
- 关键交互补充 `aria-*` 属性；`BranchTree` 分支树响应式适配；故事模式新增失败重试。

### 分享
- 分享弹窗新增**超长链接警告**（URL 超过阈值时提示改用「公开链接」）；`lib/share.ts` 编解码往返测试覆盖。

### 体验优化
- 生成页年龄**空值提示「请输入年龄」**（此前统一显示范围提示）；年龄输入框补充 `inputMode="numeric"`，移动端弹出数字键盘。

### 测试
- 测试补全至 **44 例**（`tests/api.test.ts` 性别/国家非法 → 400；`tests/claude.test.ts` 节点数超上限抛错；分享编解码、storage 写入回滚等），`tsc` / `eslint` 干净。

---

## [0.1.1] - 2026-07-23

### 新增
- **公开分享页** `/shared`：把整条时间线编码进 URL（UTF-8 安全 base64，无后端、可跨设备），分享弹窗新增「公开链接（可发给任何人）」。
- **导出 / 打印 PDF**：时间线页新增导出按钮，并配套打印样式（渐变文字强制深色、关闭动画、分支树取消横向裁剪）。
- **收藏 / 置顶**：`LocalTimeline` 增加 `pinned` 字段，首页最近列表支持一键置顶，置顶项排在最前。
- **键盘快捷键**：时间线页 `1/2/3` 切换视图、`E` 导出。
- `/api/generate` 路由单元测试（mock AI 调用），覆盖 503 / 400 / 200 路径。

### 修复
- 首页「最近生成」空状态改为友好引导（含「开始探索」CTA），不再一片空白。
- 功能页「场景插图」卡片标注「规划中」徽章，消除已实现宣传与未落地功能之间的落差。
- API 限流由 5 次/60s 放宽至 12 次/60s，本地反复测试更友好，仍能挡刷。
- 依赖核查：`lucide-react@1.21.0` 为真实版本、`npm audit` 无高危漏洞（无需改动）。
