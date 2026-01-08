# 🗄️ Database Integration - Complete Guide

## ✅ Implementation Complete

All website features are now fully connected to the Firebase Firestore database.

---

## 🎯 Features Implemented

### 1. **User Authentication & Profile**
- ✅ User registration with role (buyer/seller/admin)
- ✅ User login with database verification
- ✅ Profile management (name, email, phone, language, currency, shipping address)
- ✅ **Avatar upload** - Users can upload profile pictures (max 2MB)
- ✅ Avatar displayed across all pages automatically

### 2. **Product Management**
- ✅ **Seller Dashboard** (`seller-dashboard.html`) - For sellers/admins to:
  - Create new products
  - Edit existing products
  - Delete products
  - Upload product images
  - Manage inventory (stock quantity)
- ✅ Products loaded dynamically from database on shop page
- ✅ Product categories: textile, bag, wood, beads, other

### 3. **Shopping Features**
- ✅ Cart - Stored in database per user
- ✅ Wishlist - Stored in database per user
- ✅ Orders - Created and tracked in database
- ✅ Order tracking with order IDs

### 4. **Database Collections**

#### `users`
- `email` (string)
- `password` (string) - *Note: In production, hash with bcrypt*
- `name` (string)
- `role` (string) - "buyer", "seller", or "admin"
- `avatar` (string) - URL to uploaded image
- `phone` (string, optional)
- `language` (string, optional)
- `currency` (string, optional)
- `shippingAddress` (string, optional)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

#### `products`
- `name` (string)
- `price` (number)
- `category` (string)
- `description` (string, optional)
- `stock` (number)
- `image` (string) - URL to uploaded image
- `sellerId` (string, optional) - User ID of seller
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

#### `cart`
- `userId` (string)
- `productId` (string)
- `productName` (string)
- `productPrice` (number)
- `productImage` (string)
- `quantity` (number)
- `addedAt` (timestamp)

#### `wishlist`
- `userId` (string)
- `productId` (string)
- `productName` (string)
- `productPrice` (number)
- `productImage` (string)
- `addedAt` (timestamp)

#### `orders`
- `orderId` (string) - Format: "BOR-XXXX"
- `userId` (string)
- `items` (array)
- `total` (number)
- `shippingAddress` (object)
- `status` (string) - "pending", "processing", "shipped", "delivered"
- `createdAt` (timestamp)

---

## 📁 File Structure

### Backend Files
- `server.js` - Express server with all API endpoints
- `package.json` - Dependencies including multer for file uploads

### Frontend Files
- `app-backend.js` - API client for database operations
- `app.js` - UI interactions and event handlers
- `seller-dashboard.html` - Product management interface
- `profile.html` - User profile with avatar upload
- `shop.html` - Dynamic product loading from database

### Upload Directory
- `uploads/` - Stores uploaded avatars and product images

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Profile
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile
- `POST /api/users/:userId/avatar` - Upload avatar (multipart/form-data)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller/admin only, multipart/form-data)
- `PUT /api/products/:id` - Update product (seller/admin only, multipart/form-data)
- `DELETE /api/products/:id` - Delete product (seller/admin only)

### Cart
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart

### Wishlist
- `GET /api/wishlist/:userId` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:itemId` - Remove item from wishlist

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:userId` - Get user's orders
- `GET /api/orders/track/:orderId` - Track order by ID

---

## 🚀 Usage Guide

### For Buyers
1. **Register/Login** - Create account or login
2. **Browse Shop** - View products loaded from database
3. **Add to Cart/Wishlist** - Items saved to database
4. **Checkout** - Create order in database
5. **Track Orders** - View order status from database
6. **Update Profile** - Edit profile and upload avatar

### For Sellers/Admins
1. **Login** - Use seller/admin account
2. **Access Seller Dashboard** - Link appears in profile menu
3. **Add Products** - Fill form and upload image
4. **Manage Products** - Edit or delete existing products
5. **View Inventory** - See stock levels

---

## 📝 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
- Create `.env` file with Firebase credentials (see `env.example`)
- Or use mock mode (no database, for testing)

### 3. Start Server
```bash
npm start
```

### 4. Access Website
- Home: `http://localhost:3000`
- Shop: `http://localhost:3000/shop.html`
- Seller Dashboard: `http://localhost:3000/seller-dashboard.html` (seller/admin only)

---

## 🔒 Security Notes

⚠️ **Important for Production:**
1. **Password Hashing** - Currently passwords stored in plain text. Implement bcrypt hashing.
2. **File Upload Validation** - Add virus scanning for uploaded images.
3. **Authentication Middleware** - Add JWT tokens for secure API access.
4. **Role-Based Access Control** - Verify user roles on protected endpoints.
5. **Input Validation** - Add server-side validation for all inputs.
6. **Rate Limiting** - Prevent abuse of API endpoints.

---

## 🎨 Features Highlights

### Avatar Upload
- Supports: JPG, PNG, GIF, WebP
- Max size: 2MB
- Stored in `uploads/` directory
- Automatically displayed across all pages

### Product Management
- Image upload for products
- Category selection
- Stock management
- Price setting
- Description field

### Dynamic Product Loading
- Shop page loads products from database
- No hardcoded products
- Real-time updates when sellers add products

---

## 📊 Database Schema Summary

```
users
├── id (auto)
├── email
├── password
├── name
├── role
├── avatar
├── phone
├── language
├── currency
├── shippingAddress
├── createdAt
└── updatedAt

products
├── id (auto)
├── name
├── price
├── category
├── description
├── stock
├── image
├── sellerId
├── createdAt
└── updatedAt

cart
├── id (auto)
├── userId
├── productId
├── productName
├── productPrice
├── productImage
├── quantity
└── addedAt

wishlist
├── id (auto)
├── userId
├── productId
├── productName
├── productPrice
├── productImage
└── addedAt

orders
├── id (auto)
├── orderId
├── userId
├── items[]
├── total
├── shippingAddress
├── status
└── createdAt
```

---

## ✅ Testing Checklist

- [x] User registration works
- [x] User login works
- [x] Avatar upload works
- [x] Profile update works
- [x] Products load from database
- [x] Add to cart saves to database
- [x] Add to wishlist saves to database
- [x] Seller dashboard accessible
- [x] Product creation works
- [x] Product editing works
- [x] Product deletion works
- [x] Order creation works
- [x] Order tracking works

---

**Last Updated:** 2025
**Status:** ✅ Fully Integrated with Database

