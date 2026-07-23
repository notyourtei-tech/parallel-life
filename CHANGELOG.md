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
