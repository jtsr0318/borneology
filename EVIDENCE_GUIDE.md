# 📸 Evidence Guide - Database Connection Progress

## Files and Screenshots to Submit

### 1. **Backend Server File** (Most Important)
**File:** `server.js`
- Shows Firebase Admin SDK integration
- Shows database connection code
- Shows API endpoints using Firestore
- **Screenshot:** Lines 1-45 (Firebase initialization and database setup)

### 2. **Package Dependencies**
**File:** `package.json`
- Shows Firebase Admin and Express dependencies
- Proves you installed database packages
- **Screenshot:** The entire file showing dependencies

### 3. **API Client Integration**
**File:** `app-backend.js`
- Shows frontend connecting to backend API
- Shows database operations (cart, wishlist, orders)
- **Screenshot:** Lines 1-100 (API client setup)

### 4. **Server Running with Database Connected**
**Terminal/PowerShell:**
- Run: `npm start`
- **Screenshot:** Terminal showing:
  ```
  ✅ Firebase Admin initialized
  🚀 Server running on http://localhost:3000
  📦 API endpoints available at http://localhost:3000/api
  ```

### 5. **Environment Configuration** (Optional - hide sensitive data)
**File:** `.env` (or `env.example`)
- Shows database configuration structure
- **Screenshot:** Can blur/cover actual keys, just show structure exists

### 6. **Database API Endpoints**
**File:** `server.js`
- **Screenshot:** Show one or more API endpoints:
  - Registration endpoint (lines 45-80)
  - Cart endpoint (lines 150-200)
  - Orders endpoint (lines 250-300)

### 7. **Frontend Using Database**
**File:** `login.html` or `checkout.html`
- Shows frontend calling API endpoints
- **Screenshot:** JavaScript code making API calls (fetch to `/api/...`)

### 8. **Firebase Console** (If Available)
**Browser Screenshot:**
- Firebase Console > Firestore Database
- Shows collections: users, products, cart, wishlist, orders
- **Screenshot:** Database structure in Firebase Console

---

## 📋 Recommended Screenshot Order

### Minimum Evidence (Must Have):
1. ✅ `server.js` - Database connection code
2. ✅ `package.json` - Dependencies
3. ✅ Terminal - Server running with "Firebase Admin initialized"
4. ✅ `app-backend.js` - Frontend API integration

### Complete Evidence (Recommended):
1. ✅ `server.js` - Full database setup
2. ✅ `package.json` - All dependencies
3. ✅ Terminal - Server running successfully
4. ✅ `app-backend.js` - API client code
5. ✅ `login.html` - Registration/login using API
6. ✅ `checkout.html` - Cart/orders using API
7. ✅ Firebase Console - Database collections (if configured)

---

## 🎯 Quick Screenshot Checklist

- [ ] **server.js** - Lines showing Firebase initialization
- [ ] **package.json** - Dependencies section
- [ ] **Terminal** - Server running message
- [ ] **app-backend.js** - API client code
- [ ] **One HTML file** - Showing API calls (login.html or checkout.html)
- [ ] **Firebase Console** - Database collections (optional)

---

## 📝 What Each Screenshot Proves

| Screenshot | Evidence |
|------------|----------|
| `server.js` | Database connection code implemented |
| `package.json` | Required packages installed |
| Terminal output | Database successfully connected |
| `app-backend.js` | Frontend integrated with backend API |
| HTML files | User interface connected to database |
| Firebase Console | Database structure created |

---

## 💡 Tips for Screenshots

1. **Highlight important lines** - Use your editor's line numbers
2. **Show file names** - Make sure tab/header shows filename
3. **Clear terminal** - Run `npm start` in a clean terminal
4. **Full screen** - Capture entire code blocks, not partial
5. **Good quality** - Use high resolution, readable text

---

## 🚀 Quick Test Before Screenshot

Run these commands to verify everything works:

```bash
# 1. Check server starts
npm start

# 2. In browser, test registration
# Go to http://localhost:3000/login.html
# Click Register tab, fill form, submit

# 3. Check terminal for success messages
```

If you see "✅ Firebase Admin initialized" - you're good to screenshot!

---

## 📄 Suggested Document Structure

Create a document with:

1. **Title:** "Database Integration Evidence"
2. **Screenshot 1:** server.js (database connection)
3. **Screenshot 2:** package.json (dependencies)
4. **Screenshot 3:** Terminal (server running)
5. **Screenshot 4:** app-backend.js (API integration)
6. **Screenshot 5:** login.html (registration form)
7. **Brief explanation** of each screenshot

---

**Good luck with your submission!** 🎓


