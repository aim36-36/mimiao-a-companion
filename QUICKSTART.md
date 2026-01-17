# 🚀 米缪OS - 快速启动指南

欢迎使用米缪OS！这是一个完整的前后端一体化应用。

## 📦 第一步：安装依赖

```bash
# 1. 安装前端依赖
npm install

# 2. 安装后端依赖
cd server
npm install
cd ..
```

## 🔧 第二步：配置Supabase

### 2.1 创建Supabase项目

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写项目信息并等待初始化完成（约2分钟）

### 2.2 运行数据库迁移

1. 在Supabase Dashboard，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 打开 `supabase/migrations/01_initial_schema.sql` 文件
4. 复制全部内容并粘贴到SQL编辑器
5. 点击 "Run" 执行迁移

### 2.3 获取API密钥

在Supabase Dashboard：
1. 点击左侧菜单的 "Settings" → "API"
2. 复制以下三个值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public (公开密钥)**: `eyJhbGc...`
   - **service_role (服务密钥)**: `eyJhbGc...` ⚠️ 保密！

## ⚙️ 第三步：配置环境变量

### 3.1 前端环境变量

在项目根目录，复制环境变量模板：
```bash
copy .env.example .env.local
```

编辑 `.env.local`，填入您的Supabase信息：
```env
VITE_SUPABASE_URL=你的_Project_URL
VITE_SUPABASE_ANON_KEY=你的_anon_public_密钥
VITE_API_BASE_URL=http://localhost:3001/api
GEMINI_API_KEY=你的_Gemini_Key（可选，AI对话需要）
```

### 3.2 后端环境变量

进入server目录，创建 `.env` 文件：
```bash
cd server
copy .env.example .env
```

编辑 `server/.env`，填入Supabase信息：
```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=你的_Project_URL
SUPABASE_ANON_KEY=你的_anon_public_密钥
SUPABASE_SERVICE_KEY=你的_service_role_密钥

CLIENT_URL=http://localhost:5173
```

## 🎯 第四步：启动应用

### 方式一：分别启动（推荐新手）

打开两个终端窗口：

**终端1 - 启动后端：**
```bash
cd server
npm run dev
```
看到 "米缪OS API Server is running" 表示成功

**终端2 - 启动前端：**
```bash
npm run dev
```
看到 "Local: http://localhost:5173" 表示成功

### 方式二：使用命令并发启动（高级）

安装并发工具：
```bash
npm install -g concurrently
```

在根目录的 `package.json` 添加脚本：
```json
{
  "scripts": {
    "dev:server": "cd server && npm run dev",
    "dev:client": "npm run dev",
    "dev:all": "concurrently \"npm run dev:server\" \"npm run dev:client\""
  }
}
```

然后运行：
```bash
npm run dev:all
```

## ✅ 第五步：验证安装

1. **打开浏览器** 访问 `http://localhost:5173`
2. **首次加载** 会自动创建用户账号
3. **测试聊天功能**：
   - 点击底部 "聊天" 图标
   - 发送消息 "你好"
   - 应该收到米缪的回复
4. **验证数据持久化**：
   - 刷新页面
   - 聊天历史应该保留

**成功标志：**
- ✓ 页面正常加载
- ✓ 可以发送聊天消息
- ✓ 刷新后数据保留
- ✓ 后端控制台无错误

## 🐛 常见问题

### Q1: 前端无法连接后端
**错误信息**: "Network Error" 或 "Failed to fetch"

**解决方案**:
1. 检查后端是否正在运行（端口3001）
2. 确认 `.env.local` 中的 `VITE_API_BASE_URL` 是 `http://localhost:3001/api`
3. 查看浏览器控制台的详细错误信息

### Q2: 数据库查询失败
**错误信息**: "PGRST..." 或 "Failed to fetch"

**解决方案**:
1. 确认数据库迁移已完整运行
2. 在Supabase Dashboard → Table Editor 检查表是否存在
3. 验证环境变量中的 Supabase URL 和 Key 是否正确

### Q3: 登录失败
**错误信息**: "Failed to create auth user"

**解决方案**:
1. 检查 `server/.env` 中的 `SUPABASE_SERVICE_KEY` 是否正确
2. 在Supabase Dashboard → Authentication 确认Auth已启用
3. 查看后端控制台的详细错误日志

### Q4: 依赖安装失败
**错误信息**: "npm ERR!" 相关错误

**解决方案**:
```bash
# 清除缓存并重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 下一步

✅ **已完成启动！** 现在您可以：
- 📖 阅读 `README_BACKEND.md` 了解完整API文档
- 🎨 自定义前端界面
- 🔧 扩展新功能
- 🚀 部署到生产环境

## 🆘 需要帮助？

如遇到其他问题：
1. 检查浏览器控制台 (F12) 的错误信息
2. 查看后端终端的日志输出
3. 访问 Supabase Dashboard → Logs 查看数据库日志
4. 查阅 `README_BACKEND.md` 中的故障排除章节

---

**祝您使用愉快！** 🎉

米缪：那个...指挥官，欢迎回来~ (*ฅ́˘ฅ̀*)
