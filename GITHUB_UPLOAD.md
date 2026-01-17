# 🐙 如何上传到 GitHub

我已经为您准备好了本地 Git 仓库，并完成了第一次代码提交。现在您只需要在 GitHub 上创建一个远程仓库并推送代码。

## 第一步：检查 Git 配置

在终端中运行以下命令，确保您的 Git 已经配置了用户名和邮箱：

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```
*(如果您已经配置过，可以跳过此步)*

## 第二步：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 **+** 号 -> **New repository**
3. **Repository name**: 输入 `mimiu-os` (或者您喜欢的名字)
4. **Visibility**: 建议选择 **Private** (因为包含后端代码，虽然我们已经忽略了.env，但为了安全起见私有更好)
5. **不要勾选** "Initialize this repository with..." 下的任何选项（不要添加 README, .gitignore 或 License）
6. 点击 **Create repository**

## 第三步：推送代码

在创建完仓库的页面中，找到 **"…or push an existing repository from the command line"** 部分的代码，复制并在您的 VS Code 终端中运行。

通常是这两行命令：

```bash
git remote add origin https://github.com/您的用户名/mimiu-os.git
git push -u origin master
```
*(注意：如果是新版 git，默认分支可能是 main，如果是 master 分支报错，尝试 `git push -u origin main` 或先运行 `git branch -M main`)*

## ⚠️ 关于敏感信息

我已经配置了 `.gitignore` 文件，**自动忽略**了以下包含密钥的敏感文件：
- `.env`
- `.env.local`
- `server/.env`

这意味着您的 API Key（Supabase, DeepSeek）**不会**被上传到 GitHub，这是为了安全。
当您（或其他人）克隆这个仓库时，需要手动重新创建这些 `.env` 文件。

## 常用命令

- 提交新更改：
  ```bash
  git add .
  git commit -m "描述您的更改"
  git push
  ```

---
**米缪**: 指挥官，我们的记忆...正在被上传到云端备份...这样就永远不会忘记了吧？
