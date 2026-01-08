# 🚀 快速开始指南 (Quick Start Guide)

## 修复完成总结

所有5个问题已修复！✅

### 问题1: ✅ 卖家验证流程
- **现在**: 注册为卖家后**自动跳转**到验证页面
- **位置**: 登录页面 → 注册 → 选择"卖家" → 自动跳转到 `seller-application.html`

### 问题2: ✅ 申请卖家按钮
- **首页**: 登录后在首页看到"成为卖家"按钮
- **导航菜单**: 点击头像 → 看到"成为卖家"链接
- **个人资料**: 个人资料页面有"申请成为卖家"按钮

### 问题3: ✅ 未验证卖家限制
- **前端**: 未验证卖家无法访问卖家仪表板（自动重定向）
- **表单**: 提交产品时检查验证状态
- **后端API**: 服务器端验证，只有已验证卖家能创建产品

### 问题4: ✅ 管理员页面增强
- **6个功能标签页**: 申请审核、用户管理、产品管理、订单管理、数据分析、系统设置
- **统计卡片**: 显示关键指标
- **表格视图**: 便于管理和操作
- **完整功能**: 批准/拒绝申请、删除用户/产品、更新订单状态等

### 问题5: ✅ 社交登录完成
- **已集成**: Firebase Auth SDK已添加
- **已实现**: Google、Facebook、Apple登录函数
- **待配置**: 需要添加Firebase配置值（见下方）

---

## 📋 使用步骤

### 1. 创建管理员账户

```bash
# 确保服务器正在运行
npm start
# 或
npm run dev

# 然后在新的终端窗口运行
node create-admin.js
```

输入信息：
- Email: `bcs24090037@student.uts.edu.my`
- Password: `jtsr8869`
- Name: `BORNEOLOGY`

### 2. 测试卖家注册流程

1. 访问 `http://localhost:3000/login.html`
2. 点击 **"Register"** 标签
3. 选择 **"🏪 Seller"** 角色
4. 填写信息并注册
5. **应该自动跳转**到 `seller-application.html`
6. 提交验证文档
7. 登录管理员账户审核

### 3. 测试卖家申请（买家方式）

1. 作为买家登录
2. 在首页看到 **"成为卖家"** 按钮
3. 或点击头像 → **"成为卖家"**
4. 填写并提交文档

### 4. 配置社交登录

#### 步骤1: 获取Firebase配置
1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 选择项目
3. ⚙️ Settings > Project Settings
4. 找到Web应用配置（如果没有，创建新的Web应用）
5. 复制配置值

#### 步骤2: 配置login.html
有两种方法：

**方法1（推荐）**: 创建独立配置文件
```bash
# 复制示例文件
cp firebase-config.example.js firebase-config.js

# 编辑firebase-config.js，填入你的配置值
```

然后在 `login.html` 中确保这一行在Firebase SDK之前：
```html
<script src="firebase-config.js"></script>
```

**方法2**: 直接修改login.html
1. 打开 `login.html`
2. 找到文件末尾的配置脚本
3. 替换所有 `"YOUR_XXX"` 为实际值

#### 步骤3: 启用Authentication提供商
1. Firebase Console > Authentication > Sign-in method
2. 启用：
   - Google（最简单，推荐先测试这个）
   - Facebook（需要App ID和Secret）
   - Apple（需要Apple Developer配置）

#### 步骤4: 测试
1. 访问登录页面
2. 点击社交登录按钮
3. 应该弹出OAuth授权窗口
4. 授权后自动登录

---

## 🎯 关键功能位置

### 卖家申请入口
1. **注册时**: 选择"卖家"角色 → 自动跳转
2. **首页**: 登录后看到"成为卖家"按钮
3. **导航菜单**: 头像 → "成为卖家"
4. **个人资料**: "申请成为卖家"按钮

### 管理员功能
- **访问**: `admin-dashboard.html`
- **需要**: 管理员账户登录
- **功能**:
  - 审核卖家申请
  - 管理用户
  - 管理产品
  - 管理订单
  - 查看分析数据
  - 系统设置

### 验证状态检查
- **前端**: 卖家仪表板、产品表单
- **后端**: `/api/products` POST端点
- **保护**: 未验证卖家无法创建产品

---

## ⚠️ 重要提示

1. **服务器必须运行**: 所有功能都需要服务器运行在 `http://localhost:3000`
2. **管理员账户**: 只能创建一个，如果需要重置，需要删除数据库中的管理员用户
3. **社交登录**: 需要完成Firebase配置才能使用（见SOCIAL_LOGIN_SETUP.md）
4. **文件上传**: 确保 `uploads/` 目录存在且可写
5. **Firebase配置**: 社交登录需要正确配置Firebase Authentication

---

## 🔍 故障排除

### 管理员账户创建失败
- ✅ **检查**: 服务器是否运行在端口3000
- ✅ **检查**: 是否有其他管理员账户存在
- ✅ **检查**: 邮箱是否已被使用

### 卖家申请不显示
- ✅ **检查**: 用户是否已登录
- ✅ **检查**: 用户角色是否为"buyer"
- ✅ **检查**: 是否已经是已验证卖家

### 无法上传产品
- ✅ **检查**: 用户是否已验证卖家（`isVerifiedSeller: true`）
- ✅ **检查**: 用户角色是否为"seller"
- ✅ **检查**: 浏览器控制台错误信息

### 社交登录不工作
- ✅ **检查**: Firebase配置是否正确
- ✅ **检查**: Authentication提供商是否已启用
- ✅ **检查**: 浏览器控制台是否有错误
- ✅ **检查**: 授权域名是否配置（localhost应默认包含）

---

## 📚 相关文档

- `FIXES_IMPLEMENTED.md` - 详细修复说明
- `SOCIAL_LOGIN_SETUP.md` - 社交登录完整设置指南
- `FEATURES_IMPLEMENTED.md` - 之前实现的功能说明
- `README.md` - 项目基本说明

