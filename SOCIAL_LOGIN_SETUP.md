# 社交登录设置指南 (Social Login Setup Guide)

## 概述
社交登录功能已添加到登录页面，但需要配置才能使用。以下是设置步骤。

## 当前状态
- ✅ UI界面已添加（Google、Facebook、Apple按钮）
- ⚠️ 需要配置Firebase Authentication或OAuth提供商

## 设置步骤

### 方法1: 使用Firebase Authentication（推荐）

1. **在Firebase Console中启用Authentication**
   - 访问 https://console.firebase.google.com
   - 选择你的项目
   - 转到 Authentication > Sign-in method
   - 启用以下提供商：
     - Google
     - Facebook
     - Apple

2. **安装Firebase Auth SDK**
   ```bash
   npm install firebase
   ```

3. ✅ **在login.html中添加Firebase配置** - 已完成！
   - Firebase Auth SDK已添加到login.html
   - 需要配置Firebase凭据（见下文）

4. ✅ **实现社交登录函数** - 已完成！
   - Google登录：已实现
   - Facebook登录：已实现
   - Apple登录：已实现
   - 所有社交登录都会检查卖家验证状态

5. ✅ **更新server.js处理社交登录token** - 已完成！
   - `/api/auth/social` 端点已添加
   - 自动创建或更新用户账户
   - 与现有用户系统集成

## 🔧 配置步骤（步骤3之后）

### 步骤4: 获取Firebase Web App配置

1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 选择你的项目
3. 点击齿轮图标 ⚙️ > **Project Settings**
4. 向下滚动到 **"Your apps"** 部分
5. 如果没有Web应用，点击 **</>** 图标创建新的Web应用
6. 复制配置值：
   ```javascript
   apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   authDomain: "your-project-id.firebaseapp.com"
   projectId: "your-project-id"
   storageBucket: "your-project-id.appspot.com"
   messagingSenderId: "123456789012"
   appId: "1:123456789012:web:abcdefghijklmnop"
   ```

### 步骤5: 配置login.html

**方法1（推荐）**: 创建独立的配置文件
1. 复制 `firebase-config.example.js` 为 `firebase-config.js`
2. 填入你的Firebase配置值
3. 在 `login.html` 中，确保以下行在Firebase SDK之前：
   ```html
   <script src="firebase-config.js"></script>
   ```

**方法2**: 直接修改login.html
1. 打开 `login.html`
2. 找到配置脚本部分（在文件末尾）
3. 替换所有的 `"YOUR_XXX"` 为实际值：
   ```javascript
   window.FIREBASE_API_KEY = "你的实际API密钥";
   window.FIREBASE_AUTH_DOMAIN = "你的项目.firebaseapp.com";
   // ... 等等
   ```

### 步骤6: 启用Authentication提供商

1. 在Firebase Console，转到 **Authentication** > **Sign-in method**
2. 启用每个提供商：

   **Google**:
   - 点击 "Google"
   - 切换启用开关
   - 选择支持邮箱（使用项目默认邮箱或设置自定义）
   - 保存

   **Facebook**:
   - 点击 "Facebook"
   - 切换启用开关
   - 需要从 [Facebook Developers](https://developers.facebook.com/) 获取：
     - App ID
     - App Secret
   - 输入并保存

   **Apple**:
   - 点击 "Apple"
   - 切换启用开关
   - 需要Apple Developer账户配置
   - 输入Service ID和其他信息
   - 保存

### 步骤7: 配置授权域名

1. 在Firebase Console > Authentication > Settings
2. 在 **Authorized domains** 部分
3. 添加你的域名：
   - `localhost` (开发环境，已默认包含)
   - 你的生产域名 (例如: `borneology.com`)
4. 保存

### 步骤8: 测试

1. 启动服务器：`npm start`
2. 访问 `http://localhost:3000/login.html`
3. 点击社交登录按钮
4. 应该弹出OAuth授权窗口
5. 完成授权后，应该自动登录并跳转

## ✅ 已完成的工作

- ✅ Firebase Auth SDK已添加
- ✅ 社交登录函数已实现（Google、Facebook、Apple）
- ✅ 后端API端点已创建
- ✅ 用户创建/更新逻辑已实现
- ✅ 卖家验证检查已集成
- ✅ 配置文件示例已创建

### 方法2: 使用OAuth2直接集成

1. **Google OAuth**
   - 在Google Cloud Console创建OAuth 2.0客户端ID
   - 添加授权重定向URI
   - 使用Google Sign-In JavaScript库

2. **Facebook Login**
   - 在Facebook Developers创建应用
   - 获取App ID和App Secret
   - 使用Facebook SDK

3. **Apple Sign In**
   - 在Apple Developer配置Sign in with Apple
   - 设置Service ID和域名
   - 实现Apple JS库

## 管理员账户创建

已创建脚本 `create-admin.js` 用于创建管理员账户：

```bash
node create-admin.js
```

然后输入：
- Admin Email: admin@borneology.com
- Admin Password: [设置安全密码]
- Admin Name: Borneology Admin

## 注意事项

- 社交登录需要HTTPS（生产环境）
- 需要在Firebase Console或各提供商平台配置授权域名
- 建议先完成基本功能测试，再添加社交登录
- 社交登录用户需要与现有用户系统集成

## 当前实现

目前社交登录按钮显示，但点击后会提示"coming soon"。用户可以使用传统的邮箱/密码登录。

