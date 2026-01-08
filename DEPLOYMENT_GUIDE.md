# 网站部署和域名配置指南

## 当前状态

您的网站目前运行在本地开发环境：
- **本地地址**: `http://localhost:3000`
- **状态**: 开发模式，未发布到互联网

## 发布网站到互联网

要将网站发布到互联网并使用 `borneology.com` 域名，您需要完成以下步骤：

### 选项 1: 使用云托管服务（推荐）

#### 1.1 使用 Vercel（免费，简单）

1. **注册 Vercel 账户**
   - 访问 https://vercel.com
   - 使用 GitHub 账户注册（推荐）

2. **部署网站**
   - 将代码推送到 GitHub
   - 在 Vercel 中导入项目
   - Vercel 会自动检测 Node.js 项目并部署

3. **配置域名**
   - 在 Vercel 项目设置中添加自定义域名 `borneology.com`
   - 按照 Vercel 的指示配置 DNS 记录

#### 1.2 使用 Netlify（免费，简单）

1. **注册 Netlify 账户**
   - 访问 https://netlify.com
   - 使用 GitHub 账户注册

2. **部署网站**
   - 将代码推送到 GitHub
   - 在 Netlify 中导入项目
   - 配置构建命令：`npm install && npm start`

3. **配置域名**
   - 在 Netlify 项目设置中添加自定义域名 `borneology.com`
   - 按照 Netlify 的指示配置 DNS 记录

#### 1.3 使用 Heroku（付费，但功能强大）

1. **注册 Heroku 账户**
   - 访问 https://heroku.com
   - 创建账户

2. **部署网站**
   - 安装 Heroku CLI
   - 使用 `heroku create` 创建应用
   - 使用 `git push heroku main` 部署

3. **配置域名**
   - 在 Heroku 设置中添加自定义域名
   - 配置 DNS 记录

### 选项 2: 使用 VPS（虚拟专用服务器）

如果您想完全控制服务器，可以使用：

- **DigitalOcean** (https://digitalocean.com)
- **AWS EC2** (https://aws.amazon.com/ec2)
- **Linode** (https://linode.com)
- **Vultr** (https://vultr.com)

步骤：
1. 购买 VPS
2. 安装 Node.js 和 PM2
3. 上传代码
4. 配置 Nginx 反向代理
5. 配置 SSL 证书（Let's Encrypt）

### 选项 3: 使用传统虚拟主机

如果您的虚拟主机支持 Node.js：
1. 上传代码到服务器
2. 配置 Node.js 环境
3. 启动服务器

## 购买域名 `borneology.com`

### 域名注册商

1. **Namecheap** (https://namecheap.com) - 推荐，价格合理
2. **GoDaddy** (https://godaddy.com) - 全球最大
3. **Google Domains** (https://domains.google) - 简单易用
4. **Cloudflare** (https://cloudflare.com) - 价格透明

### 购买步骤

1. 访问域名注册商网站
2. 搜索 `borneology.com`
3. 如果可用，添加到购物车并购买
4. 完成注册流程

## 配置 DNS 记录

购买域名后，需要配置 DNS 记录指向您的托管服务：

### 对于 Vercel/Netlify

添加以下 DNS 记录（在域名注册商处）：
- **类型**: A 或 CNAME
- **名称**: @ 或 www
- **值**: 按照 Vercel/Netlify 提供的值

### 对于 VPS

添加以下 DNS 记录：
- **类型**: A
- **名称**: @
- **值**: 您的服务器 IP 地址

## 配置 SSL 证书（HTTPS）

大多数现代托管服务（Vercel、Netlify、Heroku）会自动提供免费的 SSL 证书。

对于 VPS，可以使用 Let's Encrypt 免费证书：
```bash
sudo certbot --nginx -d borneology.com -d www.borneology.com
```

## 环境变量配置

部署到生产环境时，确保设置以下环境变量：

```env
PORT=3000
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## 数据库配置

确保 Firebase Firestore 数据库已正确配置，并且生产环境可以访问。

## 文件上传配置

确保 `uploads/` 目录在生产环境中可写，或者考虑使用云存储服务（如 AWS S3、Google Cloud Storage）。

## 测试清单

部署后，请测试以下功能：

- [ ] 网站可以正常访问
- [ ] 用户注册和登录
- [ ] 产品显示和购买流程
- [ ] 卖家仪表板
- [ ] 管理员仪表板
- [ ] 文件上传功能
- [ ] 支付功能（如果已实现）

## 需要帮助？

如果您需要帮助部署网站，请告诉我：
1. 您选择的托管服务
2. 您是否已购买域名
3. 您遇到的具体问题

我可以为您提供更详细的步骤指导。

