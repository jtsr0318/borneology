# Database Setup Guide for Borneology

## Current Data Storage (localStorage)
Your website currently stores:
- **Cart items** - Product IDs, names, prices, images, quantities
- **Wishlist items** - Product IDs, names, prices, images
- **Login status** - Simple boolean flag
- **Recent orders** - Order IDs and dates

## Recommended Database Options

### Option 1: Firebase (Firestore) - EASIEST ⭐ Recommended
**Best for:** Quick setup, no backend needed, free tier available

**Pros:**
- No backend server required
- Real-time updates
- Free tier: 1GB storage, 50K reads/day
- Easy authentication
- Works with static hosting

**Setup Steps:**
1. Go to https://firebase.google.com
2. Create a new project
3. Enable Firestore Database
4. Get your Firebase config keys
5. Add Firebase SDK to your HTML files

**What you can store:**
- User accounts & profiles
- Products catalog
- User carts & wishlists (per user)
- Orders & order history
- Order tracking data

---

### Option 2: Supabase - MODERN & POWERFUL
**Best for:** PostgreSQL database, authentication, real-time features

**Pros:**
- PostgreSQL database (SQL)
- Built-in authentication
- Real-time subscriptions
- Free tier: 500MB database, 2GB bandwidth
- REST API auto-generated

**Setup Steps:**
1. Go to https://supabase.com
2. Create a new project
3. Get your API keys and URL
4. Add Supabase client library

**What you can store:**
- Same as Firebase but with SQL queries
- Better for complex relationships

---

### Option 3: Backend API (Node.js/Python/PHP)
**Best for:** Full control, custom logic

**Pros:**
- Complete control
- Custom business logic
- Can use any database (MySQL, PostgreSQL, MongoDB)

**Cons:**
- Need to host a server
- More complex setup
- Requires backend knowledge

---

## What Data Should Be in Database?

### 1. **Users Table**
```
- id (unique)
- email
- password (hashed)
- name
- avatar_url
- created_at
- role (buyer/seller)
```

### 2. **Products Table**
```
- id (unique)
- name
- description
- price
- image_url
- category
- stock_quantity
- created_at
```

### 3. **Cart Items Table**
```
- id
- user_id (foreign key)
- product_id (foreign key)
- quantity
- created_at
```

### 4. **Wishlist Items Table**
```
- id
- user_id (foreign key)
- product_id (foreign key)
- created_at
```

### 5. **Orders Table**
```
- id (order_id like BOR-1024)
- user_id (foreign key)
- total_amount
- status (pending/processing/shipped/delivered)
- shipping_address
- created_at
```

### 6. **Order Items Table**
```
- id
- order_id (foreign key)
- product_id (foreign key)
- quantity
- price_at_purchase
```

### 7. **Order Tracking Table**
```
- id
- order_id (foreign key)
- status
- location
- timestamp
- description
```

---

## Quick Start: Firebase Setup (Recommended)

### Step 1: Create Firebase Project
1. Visit https://console.firebase.google.com
2. Click "Add project"
3. Name it "Borneology"
4. Enable Google Analytics (optional)

### Step 2: Enable Firestore
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in "Test mode" (for development)
4. Choose a location (closest to your users)

### Step 3: Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon (</>)
4. Register app name: "Borneology Web"
5. Copy the config object

### Step 4: Add to Your Website
You'll need to add Firebase SDK and config to your HTML files.

---

## Which Option Do You Prefer?

**Tell me:**
1. Which database option you want (Firebase, Supabase, or custom backend)?
2. What data you want to store (users, products, orders, all)?
3. Do you have a Firebase/Supabase account already?

Once you decide, I can help you:
- Set up the database structure
- Create the integration code
- Update your app.js to use the database
- Add authentication
- Migrate existing localStorage data

---

## Current localStorage Data to Migrate

When you're ready, we'll need to:
1. Create user accounts in database
2. Migrate cart items to user-specific carts
3. Migrate wishlist items to user-specific wishlists
4. Store orders in database instead of localStorage
5. Set up real-time sync for cart/wishlist

