# 🚀 Parallel Life AI - 快速启动

## 前置要求

- Node.js 18+ 
- npm 或 yarn
- 一个 OpenRouter API Key（免费注册，默认用免费模型无需充值）

## 安装步骤

### 1. 克隆项目 (如果还没有)

```bash
cd c:\Users\t\Desktop\parallel-life
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件:

```bash
# Windows PowerShell
Copy-Item .env.local.example .env.local

# 或使用命令
echo "" > .env.local
```

编辑 `.env.local`,添加你的 OpenRouter API Key:

```env
OPENROUTER_API_KEY=sk-or-v1-your_actual_api_key_here
# 默认即免费模型，无需充值；想用付费模型再改这里
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
```

**获取API密钥**: https://openrouter.ai/keys

### 4. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3000

## 📱 使用流程

1. **打开浏览器** 访问 http://localhost:3000
2. **点击"开始探索"** 按钮
3. **填写表单**:
   - 年龄: 25
   - 性别: 选择
   - 国家: 中国
   - 职业: 软件工程师
   - 状态: 工作3年,考虑是否辞职创业
   - 关键决定: 如果当初辞职创业而不是继续在大厂工作
4. **点击生成** 等待10-30秒
5. **查看结果** 切换三种视图模式
6. **分享** 点击右上角分享按钮

## 🔧 常用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## ⚠️ 注意事项

### API费用
- 默认使用 OpenRouter 免费模型（id 以 `:free` 结尾），**每次生成 0 成本**
- 免费模型有速率与稳定性限制，偶尔排队/波动属正常，程序会自动重试
- 若切换到付费模型，请在 OpenRouter 后台设置使用限额

### 浏览器兼容性
- ✅ Chrome/Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE不支持

### 数据存储
- 所有数据存储在浏览器localStorage
- 最多保存10条记录
- 清除浏览器数据会删除记录

## 🐛 常见问题

### Q: 构建失败?
A: 确保Node.js版本≥18,删除node_modules重新安装

### Q: API调用失败?
A: 检查 .env.local 是否存在、`OPENROUTER_API_KEY` 是否正确；若提示额度不足(402)，把 `OPENROUTER_MODEL` 换成以 `:free` 结尾的免费模型

### Q: 页面空白?
A: 打开浏览器控制台查看错误信息

### Q: 动画卡顿?
A: 关闭浏览器其他标签页,确保硬件加速开启

## 📚 相关文档

- [README.md](./README.md) - 项目完整说明
- [USAGE.md](./USAGE.md) - 详细使用指南
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 开发总结

## 🎉 开始体验

现在你已经准备好了,运行 `npm run dev` 开始探索平行人生吧!

---

如有问题,请查看控制台错误或提交Issue。
