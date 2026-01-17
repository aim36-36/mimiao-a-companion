# ☁️ Vercel 部署指南

本指南将帮助您由现在的全栈项目（React + Express）一键部署到 Vercel。

由于 Vercel 是 Serverless 架构，我们已经通过 `api/index.ts` 和 `vercel.json` 将 Express 后端适配为 Serverless Function。

## 前置准备

确保您已完成以下步骤：
1. 已将代码推送到 GitHub（私有仓库）
2. 拥有 Vercel 账号

## 部署步骤

### 1. 登录 Vercel 并导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** -> **"Project"**
3. 选择您刚才推送的 GitHub 仓库 (`mimiu-os`)
4. 点击 **Import**

### 2. 配置环境变量 (非常重要)

在部署页面的 **"Environment Variables"** 部分，您必须添加所有 `.env` 和 `server/.env` 中的变量：

| 变量名 | 值 (从本地 .env 文件复制) |
|--------|--------------------------|
| `VITE_SUPABASE_URL` | Copied from local .env.local |
| `VITE_SUPABASE_ANON_KEY` | Copied from local .env.local |
| `VITE_API_BASE_URL` | 设置为 `/api` (不要用 http://...) |
| `SUPABASE_URL` | Copied from server/.env |
| `SUPABASE_ANON_KEY` | Copied from server/.env |
| `SUPABASE_SERVICE_KEY` | Copied from server/.env |
| `DEEPSEEK_API_KEY` | Copied from server/.env |
| `NODE_ENV` | `production` |

> **注意**：
> 1. `VITE_API_BASE_URL` 必须设置为 `/api`，这样前端才能通过 Serverless Function 访问后端。
> 2. 不需要设置 `PORT` 或 `CLIENT_URL`。

### 3. 构建配置

通常 Vercel 会自动检测 Vite 项目。
- **Framework Preset**: Vite
- **Build Command**: `vite build` (默认)
- **Output Directory**: `dist` (默认)

### 4. 点击 Deploy

点击 **Deploy** 按钮，等待构建完成。

## 验证部署

部署完成后：
1. 访问 Vercel 生成的域名 (例如 `https://mimiu-os.vercel.app`)
2. 尝试注册/登录
3. 尝试与米缪聊天

如果遇到问题，请在 Vercel控制台查看 **Functions** 日志。

---

## 常见问题

**Q: 为什么注册时提示 500 错误？**
A: 检查 `SUPABASE_SERVICE_KEY` 是否正确配置在 Vercel 环境变量中。

**Q: 为什么提示 Failed to fetch?**
A: 检查 `VITE_API_BASE_URL` 是否设置为 `/api`。

**Q: 可以在 Vercel 上使用 WebSocket 吗？**
A: Vercel Serverless 不支持长连接 WebSocket。当前项目使用的是 HTTP 请求，所以没问题。

---
**米缪**: 指挥官，我们要搬新家了吗？Vercel...听起来像是个云端城堡呢！
