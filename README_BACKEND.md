# 米缪OS - 后端开发与部署指南

## 📋 目录
- [项目架构](#项目架构)
- [快速开始](#快速开始)
- [Supabase配置](#supabase配置)
- [本地开发](#本地开发)
- [API文档](#api文档)
- [部署指南](#部署指南)
- [故障排除](#故障排除)

---

## 项目架构

```
mimiu-os/
├── client/                    # 前端应用 (React + Vite)
├── server/                    # 后端API (Node.js + Express)
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── controllers/      # 业务逻辑控制器
│   │   ├── middleware/       # 中间件
│   │   ├── routes/           # API路由
│   │   └── index.ts          # 服务器入口
│   └── package.json
└── supabase/                 # 数据库迁移
    └── migrations/
        └── 01_initial_schema.sql
```

**技术栈:**
- **前端**: React 19, TypeScript, Vite
- **后端**: Node.js, Express, TypeScript
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth (基于设备ID)

---

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 2. 配置Supabase

1. 访问 [supabase.com](https://supabase.com) 并创建新项目
2. 等待数据库初始化完成
3. 从项目设置中获取以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) Key**: `eyJhbGc...`
   - **Service Role Key**: `eyJhbGc...` (保密!)

### 3. 运行数据库迁移

在Supabase Dashboard中:
1. 进入 **SQL Editor**
2. 创建新查询
3. 复制 `supabase/migrations/01_initial_schema.sql` 的内容
4. 运行查询

或使用Supabase CLI:
```bash
npx supabase db push
```

### 4. 配置环境变量

**前端** - 复制`.env.example`到`.env.local`:
```bash
cp .env.example .env.local
```

编辑`.env.local`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3001/api
GEMINI_API_KEY=your_gemini_key (可选)
```

**后端** - 在`server/`目录创建`.env`:
```bash
cd server
cp .env.example .env
```

编辑`server/.env`:
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
CLIENT_URL=http://localhost:5173
```

### 5. 启动开发服务器

**方法一: 分别启动**
```bash
# 终端1: 启动后端
cd server
npm run dev

# 终端2: 启动前端
npm run dev
```

**方法二: 使用并发运行** (推荐)
```bash
# 在根目录添加启动脚本到package.json
npm run dev:all
```

访问 `http://localhost:5173` 查看应用

---

## Supabase配置

### 数据库表结构

- **users** - 用户信息
- **chat_messages** - 聊天消息
- **moments** - 动态内容
- **moment_comments** - 动态评论
- **moment_likes** - 动态点赞
- **comment_likes** - 评论点赞
- **story_saves** - 故事存档
- **cg_gallery** - CG画廊
- **user_settings** - 用户设置
- **game_states** - 游戏状态

### Row Level Security (RLS)

所有表都启用了RLS策略，确保:
- 用户只能访问自己的私有数据（聊天、存档、设置）
- 公共内容（动态）任何人可见
- 用户只能修改/删除自己的内容

### Storage配置 (可选)

如需图片上传功能:
1. 在Supabase Dashboard创建Storage Bucket: `moments-images`
2. 设置Public访问策略
3. 实现图片上传API端点

---

## 本地开发

### 开发工作流

1. **修改代码** - 前后端都支持热重载
2. **测试API** - 使用Thunder Client或Postman
3. **查看数据库** - Supabase Dashboard → Table Editor

### 常用命令

```bash
# 前端
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建

# 后端
cd server
npm run dev          # 启动开发服务器 (带热重载)
npm run build        # 编译TypeScript
npm start            # 运行编译后的代码
npm run type-check   # 类型检查
```

### 数据库迁移

添加新迁移:
```bash
# 创建新迁移文件
touch supabase/migrations/02_add_new_feature.sql

# 在Supabase Dashboard运行或使用CLI
npx supabase db push
```

---

## API文档

### Base URL
- **开发**: `http://localhost:3001/api`
- **生产**: `https://your-domain.com/api`

### 认证

大部分API需要在请求头中包含JWT token:
```
Authorization: Bearer <access_token>
```

### 端点列表

#### 认证
- `POST /auth/device-login` - 设备ID登录
- `GET /auth/me` - 获取当前用户

#### 聊天
- `GET /chat/history` - 获取聊天历史
- `POST /chat/message` - 发送消息
- `DELETE /chat/history` - 清空历史

#### 动态
- `GET /moments` - 获取动态列表
- `POST /moments` - 创建动态
- `POST /moments/:id/like` - 点赞/取消点赞
- `POST /moments/:id/comments` - 添加评论
- `DELETE /moments/comments/:id` - 删除评论
- `POST /moments/comments/:id/like` - 点赞评论

#### 故事
- `GET /story/saves` - 获取存档
- `POST /story/saves` - 保存进度
- `GET /story/cg` - 获取CG画廊
- `POST /story/cg/:id/unlock` - 解锁CG
- `GET /story/settings` - 获取设置
- `PUT /story/settings` - 更新设置

#### 游戏
- `GET /game/:type/state` - 获取游戏状态
- `PUT /game/:type/state` - 保存游戏状态

---

## 部署指南

### 后端部署 (Railway/Render/Vercel)

**Railway示例:**
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
cd server
railway init

# 连接Supabase并部署
railway up
```

设置环境变量:
- `PORT` (自动)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `CLIENT_URL` (前端域名)

### 前端部署 (Vercel/Netlify)

**Vercel示例:**
```bash
# 安装Vercel CLI
npm install -g vercel

# 部署
vercel
```

设置环境变量:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (后端API地址)

---

## 故障排除

### 常见问题

**Q: 登录失败 "Failed to create auth user"**
- 检查Supabase Service Key是否正确
- 确认Supabase Auth已启用

**Q: API返回401 Unauthorized**
- 检查JWT token是否正确传递
- 验证Supabase URL和Key

**Q: CORS错误**
- 检查后端`CLIENT_URL`环境变量
- 确认前端域名在CORS允许列表

**Q: 数据库查询失败**
- 检查RLS策略是否正确
- 验证数据库迁移是否完整

### 性能优化

- 启用数据库索引（已在迁移中配置）
- 使用分页减少数据传输
- 实施Redis缓存 (高级)
- CDN加速静态资源

### 监控与日志

**开发环境:**
- 后端日志: 控制台输出
- 前端日志: 浏览器DevTools

**生产环境:**
- 使用Logger服务 (LogRocket, Sentry)
- Supabase Dashboard → Logs
- 服务器日志管理工具

---

## 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

---

## 许可证

MIT License

---

## 联系方式

有问题？欢迎提Issue或联系开发团队！
