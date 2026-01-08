# 社交登录故障排除指南 (Social Login Troubleshooting)

## 🔍 常见问题和解决方案

### 问题1: "Firebase not configured" 错误

**症状**: 点击社交登录按钮后显示 "Firebase not configured"

**检查清单**:
1. ✅ 确认 `firebase-config.js` 文件存在且内容正确
2. ✅ 确认文件在 `login.html` 中正确加载（在Firebase SDK之前）
3. ✅ 打开浏览器控制台（F12），检查是否有错误
4. ✅ 确认配置值不是占位符（不包含 "YOUR_"）

**解决方案**:
```javascript
// firebase-config.js 应该是这样的格式：
window.FIREBASE_API_KEY = "AIzaSy...";  // 不能是 "YOUR_FIREBASE_API_KEY"
window.FIREBASE_AUTH_DOMAIN = "borneology-bcs2407.firebaseapp.com";
// ... 其他配置
```

### 问题2: "auth/unauthorized-domain" 错误

**症状**: 错误信息包含 "unauthorized-domain"

**原因**: Firebase Console 中没有授权 localhost 域名

**解决方案**:
1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 选择你的项目
3. 转到 **Authentication** > **Settings**（设置）
4. 向下滚动到 **Authorized domains**（授权域名）
5. 确认 `localhost` 在列表中（通常默认已包含）
6. 如果没有，点击 **Add domain**，输入 `localhost`
7. 保存更改
8. 刷新登录页面并重试

### 问题3: "auth/operation-not-allowed" 错误

**症状**: 错误信息包含 "operation-not-allowed"

**原因**: Firebase Console 中没有启用相应的登录提供商

**解决方案**:

**对于 Google**:
1. Firebase Console > Authentication > Sign-in method
2. 找到 "Google" 提供商
3. 点击编辑
4. 启用开关（Enable）
5. 选择支持邮箱（使用项目默认邮箱）
6. 点击保存

**对于 Facebook**:
1. Firebase Console > Authentication > Sign-in method
2. 找到 "Facebook" 提供商
3. 点击编辑
4. 启用开关
5. 需要配置：
   - **App ID**: 从 [Facebook Developers](https://developers.facebook.com/) 获取
   - **App Secret**: 从 Facebook Developers 获取
6. 如何获取 Facebook App ID 和 Secret：
   - 访问 https://developers.facebook.com/
   - 创建新应用或选择现有应用
   - 转到 Settings > Basic
   - 复制 App ID 和 App Secret
   - 在 Facebook Login 设置中添加 OAuth 重定向 URI: `https://borneology-bcs2407.firebaseapp.com/__/auth/handler`
7. 在 Firebase 中填入 App ID 和 App Secret
8. 保存

### 问题4: "Popup blocked" 错误

**症状**: 错误信息包含 "popup-blocked"

**原因**: 浏览器阻止了弹出窗口

**解决方案**:
1. 检查浏览器地址栏是否有弹出窗口阻止图标
2. 点击图标并选择"允许此网站的弹出窗口"
3. 或使用浏览器设置：
   - **Chrome**: 设置 > 隐私和安全 > 网站设置 > 弹出式窗口和重定向 > 允许
   - **Firefox**: 设置 > 隐私与安全 > 权限 > 弹出窗口阻止程序 > 例外
   - **Edge**: 设置 > Cookie 和网站权限 > 弹出窗口和重定向 > 允许

### 问题5: Firebase SDK 未加载

**症状**: 控制台显示 "Firebase SDK not loaded"

**检查**:
1. 打开浏览器开发者工具（F12）
2. 转到 Network（网络）标签
3. 刷新页面
4. 检查 Firebase SDK 脚本是否成功加载：
   - `firebase-app-compat.js`
   - `firebase-auth-compat.js`
5. 如果加载失败，检查网络连接
6. 如果被阻止，检查浏览器扩展（广告拦截器等）

### 问题6: Facebook "Invalid App ID" 错误

**原因**: Facebook App ID 配置错误或应用未正确设置

**解决方案**:
1. 确认 Facebook App ID 和 Secret 正确
2. 在 Facebook Developers Console:
   - Settings > Basic > 确认 App ID
   - Settings > Basic > 显示 App Secret
3. 在 Facebook Login 产品设置中：
   - Valid OAuth Redirect URIs 应包含:
     - `https://borneology-bcs2407.firebaseapp.com/__/auth/handler`
     - `http://localhost:3000` (开发环境)
4. 保存所有更改

### 问题7: 服务器连接失败

**症状**: 社交登录成功但无法连接到后端服务器

**检查**:
1. 确认服务器正在运行: `npm start` 或 `npm run dev`
2. 检查服务器是否在端口 3000: `http://localhost:3000`
3. 打开浏览器控制台，查看网络请求是否成功
4. 检查 `/api/auth/social` 端点是否响应

## 🔧 调试步骤

### 步骤1: 检查 Firebase 配置

打开浏览器控制台（F12），输入：
```javascript
console.log('API Key:', window.FIREBASE_API_KEY);
console.log('Project ID:', window.FIREBASE_PROJECT_ID);
console.log('Firebase loaded:', typeof firebase !== 'undefined');
```

应该看到：
- API Key: 你的实际API密钥（不是 "YOUR_FIREBASE_API_KEY"）
- Project ID: borneology-bcs2407
- Firebase loaded: true

### 步骤2: 检查 Firebase 初始化

在控制台输入：
```javascript
if (typeof firebase !== 'undefined') {
  console.log('Firebase apps:', firebase.apps);
  console.log('Firebase auth:', firebase.auth);
}
```

### 步骤3: 测试直接调用

在控制台尝试：
```javascript
const provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().signInWithPopup(provider)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error.code, error.message));
```

这将显示具体的错误信息。

## ✅ 快速检查清单

在尝试社交登录前，确认：

- [ ] `firebase-config.js` 文件存在且配置正确
- [ ] Firebase SDK 脚本已加载（检查 Network 标签）
- [ ] Firebase Console 中已启用相应的登录提供商（Google/Facebook）
- [ ] `localhost` 在 Firebase 授权域名列表中
- [ ] 浏览器允许弹出窗口
- [ ] 服务器正在运行（`npm start`）
- [ ] 浏览器控制台没有JavaScript错误

## 🆘 如果仍然无法工作

1. **清除浏览器缓存**并刷新页面
2. **尝试无痕/隐私模式**（排除扩展干扰）
3. **检查浏览器控制台**的完整错误信息
4. **确认 Firebase 项目设置**正确
5. **测试用邮箱/密码登录**确保服务器正常工作

## 📝 需要的信息

如果问题仍然存在，请提供：
- 浏览器控制台的完整错误信息
- Network 标签中失败的请求详情
- Firebase Console 中 Authentication > Sign-in method 的截图
- `firebase-config.js` 文件（隐藏API密钥，只显示格式）

