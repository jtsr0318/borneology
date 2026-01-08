# 快速开始：GitHub + Vercel 部署

## 🚀 5分钟快速部署指南

### 步骤 1: 准备 Git（一次性设置）

打开 PowerShell，运行：

```powershell
# 进入项目目录
cd C:\Users\jason\Desktop\Borneology

# 检查 Git 是否已安装
git --version

# 如果没有安装，访问 https://git-scm.com/download/win 下载安装
```

### 步骤 2: 初始化并提交代码

```powershell
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 创建第一次提交
git commit -m "Initial commit: Borneology website"
```

### 步骤 3: 创建 GitHub 仓库

1. 访问 https://github.com 并登录
2. 点击右上角 **"+"** → **"New repository"**
3. 仓库名称：`borneology`
4. 选择 **Public**
5. **不要**勾选任何初始化选项
6. 点击 **"Create repository"**

### 步骤 4: 连接到 GitHub

在 PowerShell 中运行（替换 `YOUR_USERNAME` 为您的 GitHub 用户名）：

```powershell
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/borneology.git

# 重命名分支为 main
git branch -M main

# 推送到 GitHub
git push -u origin main
```

**如果提示输入密码**：
- 用户名：您的 GitHub 用户名
- 密码：使用 **Personal Access Token**（不是密码）

**如何获取 Token**：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token
5. 使用 token 作为密码

### 步骤 5: 部署到 Vercel

1. **访问** https://vercel.com
2. **点击 "Sign Up"** → 选择 **"Continue with GitHub"**
3. **授权 Vercel 访问您的 GitHub**
4. **点击 "Add New..." → "Project"**
5. **找到 `borneology` 仓库** → 点击 **"Import"**
6. **配置项目**：
   - Framework Preset: **Other**
   - Root Directory: 留空
   - Build Command: 留空（Vercel 会自动处理）
   - Output Directory: 留空
7. **添加环境变量**（点击 "Environment Variables"）：
   ```
   NODE_ENV = production
   PORT = 3000
   FIREBASE_PROJECT_ID = 您的项目ID
   FIREBASE_PRIVATE_KEY = 您的私钥
   FIREBASE_CLIENT_EMAIL = 您的客户端邮箱
   ```
8. **点击 "Deploy"**
9. **等待部署完成**（约 1-2 分钟）

### 步骤 6: 完成！

部署完成后，您会得到一个 URL，例如：
- `borneology.vercel.app`
- 或 `borneology-xxx.vercel.app`

**访问您的网站**：点击 Vercel 提供的 URL

## 📝 后续更新代码

每次修改代码后：

```powershell
git add .
git commit -m "描述您的更改"
git push
```

Vercel 会自动检测更改并重新部署！

## ⚠️ 重要提示

1. **文件上传问题**：Vercel 是无服务器平台，本地文件系统是只读的。上传的文件在每次部署后会被清除。生产环境建议使用 Firebase Storage 或 AWS S3。

2. **环境变量**：确保在 Vercel 中设置了所有必要的环境变量。

3. **域名配置**：部署后可以在 Vercel 设置中添加自定义域名 `borneology.com`。

## 🆘 需要帮助？

如果遇到问题，请告诉我：
- 错误信息
- 执行到哪一步
- 截图（如果有）

