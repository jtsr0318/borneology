# Vercel 部署完整指南

本指南将帮助您将 Borneology 项目部署到 Vercel。

## 前置要求

- GitHub 账户（如果没有，请访问 https://github.com 注册）
- Vercel 账户（如果没有，可以使用 GitHub 账户登录）
- Git 已安装在您的电脑上

## 步骤 1: 安装 Git（如果还没有安装）

### Windows
1. 访问 https://git-scm.com/download/win
2. 下载并安装 Git for Windows
3. 安装完成后，打开 PowerShell 或命令提示符
4. 验证安装：运行 `git --version`

## 步骤 2: 初始化 Git 仓库

1. **打开 PowerShell 或命令提示符**
2. **导航到项目目录**：
   ```powershell
   cd C:\Users\jason\Desktop\Borneology
   ```

3. **初始化 Git 仓库**：
   ```powershell
   git init
   ```

4. **创建 .gitignore 文件**（如果还没有）：
   ```powershell
   # 如果文件不存在，创建它
   if (!(Test-Path .gitignore)) {
       @"
   node_modules/
   .env
   .env.local
   uploads/*
   !uploads/.gitkeep
   *.log
   .DS_Store
   .vscode/
   .idea/
   "@ | Out-File -FilePath .gitignore -Encoding utf8
   }
   ```

5. **添加所有文件到 Git**：
   ```powershell
   git add .
   ```

6. **创建第一次提交**：
   ```powershell
   git commit -m "Initial commit: Borneology e-commerce website"
   ```

## 步骤 3: 创建 GitHub 仓库

1. **访问 GitHub**：https://github.com
2. **登录您的账户**
3. **点击右上角的 "+" 按钮**，选择 "New repository"
4. **填写仓库信息**：
   - Repository name: `borneology`（或您喜欢的名称）
   - Description: `Borneology - Sarawak Handicrafts E-commerce Platform`
   - 选择 **Public** 或 **Private**（建议先选择 Public，免费）
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

## 步骤 4: 将项目推送到 GitHub

在 PowerShell 中运行以下命令（将 `YOUR_USERNAME` 替换为您的 GitHub 用户名）：

```powershell
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/borneology.git

# 或者如果您使用 SSH（需要配置 SSH key）
# git remote add origin git@github.com:YOUR_USERNAME/borneology.git

# 重命名主分支为 main（如果还没有）
git branch -M main

# 推送到 GitHub
git push -u origin main
```

**注意**：第一次推送时，GitHub 可能会要求您输入用户名和密码。如果使用 HTTPS，您需要使用 Personal Access Token 而不是密码。

### 如果遇到认证问题：

1. **创建 GitHub Personal Access Token**：
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 输入名称：`Vercel Deployment`
   - 选择权限：至少勾选 `repo`
   - 点击 "Generate token"
   - **复制生成的 token**（只显示一次！）

2. **使用 token 推送**：
   ```powershell
   # 当提示输入密码时，使用 token 而不是密码
   git push -u origin main
   ```

## 步骤 5: 在 Vercel 中部署

### 5.1 注册/登录 Vercel

1. **访问 Vercel**：https://vercel.com
2. **点击 "Sign Up"** 或 "Log In"
3. **选择 "Continue with GitHub"**（使用 GitHub 账户登录）

### 5.2 导入项目

1. **登录后，点击 "Add New..." → "Project"**
2. **在 "Import Git Repository" 部分**：
   - 您应该能看到您的 GitHub 仓库列表
   - 找到 `borneology` 仓库
   - 点击 "Import"

### 5.3 配置项目

1. **项目设置**：
   - **Framework Preset**: 选择 "Other" 或 "Node.js"
   - **Root Directory**: 留空（如果项目在根目录）
   - **Build Command**: `npm install`（Vercel 会自动检测）
   - **Output Directory**: 留空（因为这是 Node.js 项目）

2. **环境变量**（重要！）：
   点击 "Environment Variables" 添加以下变量：
   
   ```
   NODE_ENV=production
   PORT=3000
   FIREBASE_PROJECT_ID=您的Firebase项目ID
   FIREBASE_PRIVATE_KEY=您的Firebase私钥
   FIREBASE_CLIENT_EMAIL=您的Firebase客户端邮箱
   ```
   
   **如何获取 Firebase 配置**：
   - 打开您的 `.env` 文件
   - 复制相应的值到 Vercel 环境变量中
   - 注意：`FIREBASE_PRIVATE_KEY` 需要包含完整的私钥（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）

3. **点击 "Deploy"**

### 5.4 等待部署完成

- Vercel 会自动：
  1. 安装依赖（`npm install`）
  2. 构建项目
  3. 部署到全球 CDN
- 部署完成后，您会看到一个 URL，例如：`borneology.vercel.app`

## 步骤 6: 配置自定义域名（可选）

### 6.1 在 Vercel 中添加域名

1. **在项目页面，点击 "Settings" → "Domains"**
2. **输入您的域名**：`borneology.com`
3. **按照 Vercel 的指示配置 DNS 记录**

### 6.2 配置 DNS 记录

在您的域名注册商（如 Namecheap、GoDaddy）处添加以下 DNS 记录：

**类型 A 记录**：
- 名称：`@`
- 值：`76.76.21.21`（Vercel 会提供具体 IP）

**或 CNAME 记录**（推荐）：
- 名称：`@`
- 值：`cname.vercel-dns.com.`

**WWW 子域名**：
- 类型：CNAME
- 名称：`www`
- 值：`cname.vercel-dns.com.`

### 6.3 等待 DNS 传播

- DNS 更改通常需要几分钟到几小时才能生效
- Vercel 会自动检测并配置 SSL 证书（HTTPS）

## 步骤 7: 配置服务器启动命令

由于这是一个 Node.js Express 服务器，需要确保 Vercel 知道如何启动服务器。

### 7.1 创建 `vercel.json` 配置文件

在项目根目录创建 `vercel.json` 文件：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### 7.2 更新 package.json

确保 `package.json` 中有启动脚本：

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}
```

## 步骤 8: 处理文件上传

Vercel 是无服务器平台，文件系统是只读的。您需要：

### 选项 A: 使用云存储（推荐）

将文件上传改为使用云存储服务：
- **Firebase Storage**（推荐，因为您已经在使用 Firebase）
- **AWS S3**
- **Cloudinary**

### 选项 B: 使用 Vercel Blob Storage

Vercel 提供 Blob Storage 用于文件存储。

### 选项 C: 临时方案

对于开发/测试，可以暂时保留本地存储，但需要注意：
- 上传的文件在每次部署后会被清除
- 不适合生产环境

## 步骤 9: 提交并推送更改

每次修改代码后：

```powershell
# 添加更改
git add .

# 提交更改
git commit -m "描述您的更改"

# 推送到 GitHub
git push

# Vercel 会自动检测更改并重新部署
```

## 常见问题

### Q: 部署失败怎么办？
A: 
1. 检查 Vercel 部署日志中的错误信息
2. 确保所有环境变量都已正确设置
3. 检查 `package.json` 中的依赖是否正确

### Q: 如何查看部署日志？
A: 在 Vercel 项目页面，点击 "Deployments" → 选择部署 → 查看 "Build Logs"

### Q: 如何回滚到之前的版本？
A: 在 Vercel 项目页面，点击 "Deployments" → 找到之前的部署 → 点击 "..." → "Promote to Production"

### Q: 环境变量在哪里设置？
A: 项目设置 → "Environment Variables" → 添加变量

## 快速命令参考

```powershell
# 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 连接到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/borneology.git
git branch -M main
git push -u origin main

# 后续更新
git add .
git commit -m "Update description"
git push
```

## 需要帮助？

如果遇到问题，请告诉我：
1. 错误信息
2. 您执行到哪一步
3. 截图（如果有）

我会帮您解决！

