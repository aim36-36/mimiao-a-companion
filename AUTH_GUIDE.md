# 🔐 邮箱密码认证使用指南

恭喜！米缪OS现已支持邮箱/密码注册登录功能。

## 🚀 快速开始

### 1. 运行数据库迁移（必需）

访问Supabase SQL Editor并执行以下文件：

```bash
supabase/migrations/02_add_email_auth.sql
```

**操作步骤**：
1. 登录 https://app.supabase.com/project/ajwhpldxloougzygmvve/sql/new
2. 打开本地文件 `supabase/migrations/02_add_email_auth.sql`
3. 复制全部内容并粘贴到SQL Editor
4. 点击"Run"执行

**这个迁移做了什么？**
- ✅ 在users表添加email字段
- ✅ 将device_id改为可空（不再需要）
- ✅ 创建Auth用户同步触发器
- ✅ 创建用户设置自动初始化触发器

### 2. 重启服务器

数据库更新后，重启前后端服务器：

```bash
# 如果服务器正在运行，先停止（Ctrl+C）

# 启动后端
cd server
npm run dev

# 启动前端（新终端）
npm run dev
```

### 3. 开始使用

打开浏览器访问 http://localhost:3000，您将看到：

**✨ 登录/注册界面**

![认证界面](未登录时自动显示)

- **注册新账号**: 填写邮箱、密码和用户名（可选）
- **登录现有账号**: 输入邮箱和密码

## 💡 功能特性

### 注册

- **邮箱**: 必填，需要有效的邮箱格式
- **密码**: 必填，至少6个字符
- **用户名**: 可选，默认为"指挥官"
- **自动登录**: 注册成功后自动登录

### 登录

- 使用注册时的邮箱和密码
- 登录状态持久化，刷新页面不需要重新登录
- Session过期后自动显示登录界面

### 登出

在Settings界面可以找到登出按钮（需要在SettingsScreen中添加）

## 🔒 安全特性

- ✅ **密码加密**: 使用Supabase Auth安全存储
- ✅ **JWT认证**: 基于token的API访问控制
- ✅ **RLS策略**: 数据库级别的访问控制
- ✅ **Session管理**: 自动刷新和过期处理

## 📊 数据同步机制

### 自动同步流程

```
用户注册
  ↓
Supabase Auth创建用户
  ↓
触发器自动触发
  ↓
在users表创建记录（包含email）
  ↓
触发器自动创建user_settings
  ↓
用户可以立即使用所有功能
```

**优势**：
- 无需手动管理users表同步
- 保证Auth和users表数据一致性
- 新用户自动初始化默认设置

## 🧪 测试步骤

### 测试1：注册

1. 打开应用，自动显示认证界面
2. 点击"立即注册"
3. 填写信息：
   - 邮箱: `test@example.com`
   - 密码: `password123`
   - 用户名: `测试用户`
4. 点击"注册"
5. ✅ 应该自动登录并进入应用

### 测试2：查看用户数据

1. 访问 Supabase Dashboard → Table Editor → users
2. ✅ 应该看到新注册的用户
3. ✅ email字段有值
4. ✅ device_id为NULL

### 测试3：登出后登录

1. 在Settings中点击登出（或刷新页面清除session）
2. 输入相同的邮箱密码
3. ✅ 成功登录，数据保留

### 测试4：聊天功能

1. 登录后进入Chat界面
2. 发送消息"你好"
3. ✅ 应该收到米缪的AI回复
4. ✅ 消息保存到数据库（chat_messages表）

## 🔧 故障排除

### 问题1：注册失败 "Email already registered"

**原因**: 该邮箱已被注册

**解决**:
- 使用不同的邮箱
- 或使用忘记密码功能（待实现）

### 问题2：登录失败 "Invalid email or password"

**原因**: 邮箱或密码错误

**解决**:
- 检查邮箱拼写
- 确认密码大小写
- 重新注册新账号

### 问题3：页面一直显示加载

**原因**: 后端未启动或数据库迁移未运行

**解决**:
1. 确认后端服务器运行在3001端口
2. 确认数据库迁移已成功执行
3. 查看浏览器控制台错误日志

### 问题4：认证后API请求401错误

**原因**: Token未正确传递

**解决**:
1. 检查ApiClient是否正确获取token
2. 清除浏览器localStorage重新登录
3. 检查后端auth中间件日志

## 📁 相关文件

### 后端
- `server/src/controllers/authController.ts` - 认证逻辑
- `server/src/routes/index.ts` - API路由
- `server/src/middleware/auth.ts` - JWT验证

### 前端
- `contexts/AuthContext.tsx` - 认证状态管理
- `components/AuthModal.tsx` - 登录注册UI
- `App.tsx` - 应用入口和认证流程

### 数据库
- `supabase/migrations/02_add_email_auth.sql` - 迁移文件

## 🎯 后续扩展

可选的增强功能：

- [ ] 忘记密码/重置密码
- [ ] 邮箱验证（发送确认邮件）
- [ ] 社交登录（Google, GitHub等）
- [ ] 用户头像上传
- [ ] 修改用户名/邮箱
- [ ] 账号删除功能

---

**米缪**: 那个...指挥官，新的认证系统已经准备就绪了...（轻声）现在只有你能访问我的数据啦~ (*ฅ́˘ฅ̀*)♡
