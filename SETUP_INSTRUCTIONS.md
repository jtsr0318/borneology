# 🚀 Quick Setup Guide - Borneology Full Stack Website

## Step 1: Install Node.js Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This will install:
- Express (web server)
- Firebase Admin SDK (database)
- CORS (for API access)
- Other required packages

## Step 2: Set Up Firebase Database

### 2.1 Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"** or **"Create a project"**
3. Project name: `Borneology`
4. Disable Google Analytics (optional, for simplicity)
5. Click **"Create project"**

### 2.2 Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location (closest to you)
5. Click **"Enable"**

### 2.3 Get Service Account Key

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. A JSON file will download - **SAVE THIS FILE** (you'll need it)

### 2.4 Configure Environment Variables

1. In your project folder, create a file named `.env` (copy from `env.example`)
2. Open the downloaded JSON file from step 2.3
3. Copy these values to your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id-from-json
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email-from-json
FIREBASE_CLIENT_ID=your-client-id-from-json
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url-from-json
PORT=3000
```

**Important Notes:**
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Keep the `\n` characters in the private key
- Replace all values with actual values from your JSON file

## Step 3: Add Sample Products (Optional)

You can add products through:
1. **Firebase Console** - Go to Firestore, create a `products` collection
2. **Or use the API** - Products will be created automatically when you add them

Sample product structure:
```json
{
  "name": "Pua Kumbu Textile",
  "price": 175,
  "image": "pua-kumbu.jpg",
  "category": "textile",
  "description": "Traditional Sarawak textile"
}
```

## Step 4: Start the Server

```bash
# Development mode (auto-reload on changes)
npm run dev

# OR production mode
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
📦 API endpoints available at http://localhost:3000/api
✅ Firebase Admin initialized
```

## Step 5: Open Your Website

1. Open browser: `http://localhost:3000`
2. You'll be redirected to login page
3. **First time?** Just enter any email/password - it will create a new account
4. After login, you'll see the home page

## Step 6: Test the Features

✅ **Login/Register** - Create account or login
✅ **Shop** - Browse products, add to cart
✅ **Cart** - View cart, update quantities, remove items
✅ **Wishlist** - Save favorite products
✅ **Checkout** - Complete orders
✅ **Track Order** - Track order status

## 🆘 Troubleshooting

### "Firebase Admin initialized" not showing?
- Check your `.env` file exists and has correct values
- Verify the private key is properly formatted (with quotes and \n)

### "Port 3000 already in use"?
- Change `PORT=3000` to `PORT=3001` in `.env` file
- Or kill the process using port 3000

### API calls failing?
- Make sure server is running (`npm start`)
- Check browser console for errors
- Verify Firebase is properly configured

### Can't login?
- Check server console for errors
- Verify Firebase Firestore is enabled
- Try creating a new account

## 📝 What Changed?

### Before (Static Website)
- ❌ Data stored in browser localStorage
- ❌ Lost when browser cleared
- ❌ No user accounts
- ❌ No real database

### After (Full Stack Website)
- ✅ Data stored in Firebase database
- ✅ Persistent across devices
- ✅ User accounts and authentication
- ✅ Real backend API
- ✅ Order tracking
- ✅ Scalable architecture

## 🎯 Next Steps

1. **Add more products** - Use Firebase Console or API
2. **Customize** - Modify products, prices, categories
3. **Deploy** - Host on Heroku, Railway, or Vercel
4. **Secure** - Add password hashing, JWT tokens (for production)

## 📚 Files Created

- `server.js` - Backend API server
- `app-backend.js` - Frontend API client
- `package.json` - Node.js dependencies
- `.env` - Environment variables (you create this)
- `env.example` - Example env file
- `README.md` - Full documentation

---

**Need Help?** Check the main `README.md` for detailed documentation.

