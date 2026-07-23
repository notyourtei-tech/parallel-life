# Parallel Life AI · 平行世界人生生成器

一个 AI 驱动的人生探索平台：输入你当年的一个关键决定，AI 为你生成两条平行人生时间线，并支持故事模式、分支树可视化与分享。

> 如果当初走了另一条路，人生会是什么样子？

---

## ✨ 功能

- 🎯 **双时间线生成**：基于你输入的关键决定，AI 生成 A / B 两条平行人生路线
- 📊 **可视化展示**：时间线视图、分支树视图、故事模式三种阅读方式
- 📖 **故事模式**：将时间线文学化为沉浸式叙事
- 🌳 **分支树**：动态 SVG 绘制的人生分叉图
- 🔗 **分享**：多平台分享卡片
- 💾 **本地存储**：历史记录自动保存在浏览器 `localStorage`，无需注册

---

## 🧱 技术栈

- **框架**：Next.js 16（App Router）+ React 19 + TypeScript
- **样式**：TailwindCSS 4 + Framer Motion
- **AI**：通过 [OpenRouter](https://openrouter.ai/) 调用 Claude / GPT 等模型（OpenAI 兼容接口）
- **图标**：Lucide React
- **测试**：Vitest + jsdom
- **存储**：`localStorage`（客户端）

> 说明：本项目把 AI 调用收敛到 Next.js 的 API Route（`/api/generate`），
> 密钥只在服务端读取，**永远不会出现在前端代码或发给浏览器的响应里**。

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（必须）

复制示例文件，填入你自己的 OpenRouter 密钥：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
# OpenRouter 注册地址：https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
# 可选：指定模型，默认使用免费模型（id 以 :free 结尾，无需充值）
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
# 站点地址：本地开发用默认，部署后改为你的域名
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

获取密钥：

1. 在 [OpenRouter](https://openrouter.ai/) 注册并登录
2. 进入 **Keys** 页面创建一个 API Key
3. 粘贴到 `.env.local` 的 `OPENROUTER_API_KEY`

> ✅ 默认模型 `nvidia/nemotron-3-super-120b-a12b:free` 是免费模型，**无需充值即可使用**（免费模型有速率/稳定性限制，程序已内置自动重试）。
> 想用更强的付费模型，改 `OPENROUTER_MODEL` 为对应 slug 并到 OpenRouter 充值即可（例如 `openai/gpt-4o`、`anthropic/claude-sonnet-4`）。
> 进阶：设置 `OPENROUTER_BASE_URL=http://localhost:11434/v1` 可接入本机 Ollama，完全离线零成本。

### 3. 运行开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

### 4. 生产构建（可选验证）

```bash
npm run build
npm run start
```

---

## 🔐 环境变量说明

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | ✅ | — | OpenRouter API 密钥，仅在服务端使用 |
| `OPENROUTER_MODEL` | ❌ | `nvidia/nemotron-3-super-120b-a12b:free` | 调用的模型（默认免费，id 以 `:free` 结尾） |
| `OPENROUTER_BASE_URL` | ❌ | `https://openrouter.ai/api/v1` | OpenAI 兼容网关地址，可指向本机 Ollama 等 |
| `NEXT_PUBLIC_SITE_URL` | ❌ | `http://localhost:3000` | 站点域名，用于 OG 分享图 / SEO |

---

## 📁 项目结构

```
parallel-life/
├── app/                      # Next.js App Router
│   ├── api/generate/        # AI 生成接口（服务端，密钥在此使用）
│   ├── generate/            # 输入表单页
│   ├── timeline/[id]/       # 结果展示页
│   ├── icon.svg             # 站点图标
│   ├── opengraph-image.tsx  # 动态 OG 分享图
│   ├── robots.ts            # 搜索引擎爬虫规则
│   ├── sitemap.ts           # 站点地图
│   ├── layout.tsx           # 根布局 / 全局 metadata
│   └── page.tsx             # 首页
├── components/              # React 组件
│   ├── ui/                  # 基础 UI（Button / Card / Input / Loading）
│   ├── home/                # 首页组件
│   ├── timeline/            # 时间线 / 分支树 / 故事模式
│   └── shared/              # 分享弹窗等共享组件
├── lib/                     # 工具库
│   ├── claude.ts            # OpenRouter 客户端封装
│   ├── storage.ts           # localStorage 封装
│   └── utils.ts             # 通用工具
├── types/                   # TypeScript 类型
├── prompts/                 # AI Prompt 模板
├── public/                  # 静态资源（图标 / manifest）
├── .env.local.example       # 环境变量模板（可提交）
└── .env.local              # 本地密钥（已被 .gitignore 忽略，切勿提交）
```

---

## 🔌 API 参考

`POST /api/generate`

请求体（生成时间线）：

```json
{
  "type": "timeline",
  "input": {
    "age": 25,
    "gender": "男",
    "country": "中国",
    "occupation": "软件工程师",
    "status": "工作 3 年，感觉遇到瓶颈",
    "keyDecision": "如果当初选择去日本留学而不是直接工作……"
  }
}
```

请求体（故事模式，需先生成时间线）：

```json
{
  "type": "story",
  "worldType": "A",
  "timeline": [ /* TimelineNode[] */ ],
  "input": { /* UserInput */ }
}
```

响应：`{ "result": TimelineResult, "processingTime": number }` 或 `{ "story": string }`。

接口内置：请求体大小限制、单 IP 限流、输入清洗与校验、JSON 容错解析。

---

## 🚢 部署

### Vercel（推荐）

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com/) 导入仓库
3. 在 **Environment Variables** 中添加 `OPENROUTER_API_KEY`（以及可选的 `OPENROUTER_MODEL`、`NEXT_PUBLIC_SITE_URL`）
4. 点击 Deploy

> 本项目含服务端 API Route，**必须部署到支持 Node.js 运行时的平台**。

### 其他支持 Next.js 的平台

- Netlify
- Railway
- Render
- 任意 Node.js 服务器（`npm run build && npm run start`）

### ⚠️ 关于 GitHub Pages

GitHub Pages 只能托管**静态站**，**无法运行** `/api/generate` 这类服务端接口。
若直接部署到 GitHub Pages，前端能打开，但「生成」功能会失败。请改用 Vercel / Netlify 等平台，
或使用 `output: 'standalone'` 的 Node 服务器自行托管。

---

## 🛡️ 密钥安全（重要）

- 真实密钥只写在 `.env.local`，该文件已在 `.gitignore` 中被 `.env*.local` 忽略，**不会被提交**。
- 对外只提交 `.env.local.example`（里面是占位符，无真实密钥）。
- 部署到 Vercel / Netlify 时，密钥请在平台后台的环境变量中填写，**不要写进代码或提交到 Git**。
- 提交前可用 `git status` 确认没有 `.env.local` 出现；**切勿**执行 `git add -f .env.local`。

---

## 🎨 自定义

### 修改 Prompt 模板

编辑 `prompts/templates.ts`，调整 AI 生成内容的风格与结构。

### 修改主题色

编辑 `app/globals.css`（玻璃态 / 渐变 / 配色等）。

### 新增视图模式

在 `app/timeline/[id]/page.tsx` 中增加 view 类型，并创建对应组件。

---

## 🧪 测试

本项目使用 [Vitest](https://vitest.dev/) 进行单元测试（jsdom 环境）：

```bash
npm test           # 单次运行
npm run test:watch # 监听模式
```

测试覆盖：

- `lib/claude.ts`：JSON 容错解析、时间线结构校验、配置状态
- `lib/storage.ts`：localStorage 读写、上限裁剪、删除、清空
- `lib/utils.ts`：`cn` 类名合并

> CI 会在每次 push / PR 时自动运行 `tsc` → `eslint` → `build` → `test`。

---

## 🤝 CI / CD

`.github/workflows/ci.yml` 提供 GitHub Actions 流水线：安装依赖 → 类型检查 → 代码检查 → 生产构建 → 单元测试。
提交前建议本地先跑一遍相同质量门（见上文命令）。

---

## 🧭 路线图

- [x] 单元测试（Vitest）
- [x] CI 流水线（GitHub Actions）
- [ ] 图片生成集成（Stable Diffusion / 文生图）
- [ ] 用户账户与云端同步
- [ ] 更多分享平台
- [ ] 国际化（i18n）

---

## 📄 许可证

MIT License
