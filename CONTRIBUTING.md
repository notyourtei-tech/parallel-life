# 贡献指南

感谢你考虑为 Parallel Life AI 做出贡献！

## 开发流程

1. Fork 并克隆仓库
2. 安装依赖：`npm install`
3. 复制环境变量：`cp .env.local.example .env.local`，填入你自己的 `OPENROUTER_API_KEY`
4. 启动开发服务器：`npm run dev`

## 代码规范

- 提交前请确保通过本地质量门：
  ```bash
  npx tsc --noEmit   # 类型检查
  npx eslint .         # 代码检查
  npm test             # 单元测试
  npm run build        # 生产构建
  ```
- 所有改动都会由 GitHub Actions 自动运行以上检查，**不通过的 PR 不会被合并**。

## 安全红线

- **严禁提交任何真实 API 密钥**。`OPENROUTER_API_KEY` 只存在于本地 `.env.local`（已被 `.gitignore` 忽略）。
- 若需要密钥做测试，请使用 `.env.local.example` 中的占位符。

## 提交约定

- 提交信息使用简洁的中文或英文描述「做了什么 / 为什么」。
- 关联 issue 时请注明编号。

## 添加测试

本项目使用 Vitest。新增逻辑（尤其是 `lib/` 下的纯函数）请配套单元测试，放在 `tests/` 目录。
