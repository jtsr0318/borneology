# 🔐 Website Access Control - Hybrid Model

## Overview
The Borneology website uses a **hybrid access model** that allows public browsing while requiring authentication for specific features.

---

## ✅ Publicly Accessible Pages (No Login Required)

Anyone can browse and explore these pages without logging in:

1. **Home Page** (`index.html`)
   - View hero section, culture cards, about section
   - Browse general information

2. **Shop Page** (`shop.html`)
   - View all products
   - See product details, images, prices
   - Filter and search products

3. **Contact Page** (`contact.html`)
   - View contact information
   - Submit contact forms

4. **Product Detail Pages**
   - View individual product pages
   - See product descriptions and images

5. **Login/Register Page** (`login.html`)
   - Access authentication forms

---

## 🔒 Protected Pages (Login Required)

These pages require users to be logged in. If not authenticated, users will be redirected to the login page:

1. **Checkout Page** (`checkout.html`)
   - View cart items
   - Complete purchases
   - Access payment forms

2. **Wishlist Page** (`wishlist.html`)
   - View saved items
   - Manage wishlist

3. **Profile Page** (`profile.html`)
   - View user profile
   - Edit account settings

4. **Track Order Page** (`track-order.html`)
   - Track order status
   - View order history

---

## 🛒 Protected Actions (Login Required)

Even on public pages, certain actions require login:

### Shop Page Actions:
- **Add to Cart** - Requires login
  - Shows prompt: "Please login to add items to your cart"
  - Redirects to login if user confirms

- **Add to Wishlist** - Requires login
  - Shows prompt: "Please login to add items to your wishlist"
  - Redirects to login if user confirms

### Navigation Actions:
- **Cart Icon** - Requires login
  - Shows prompt if not logged in
  - Redirects to login page

- **Wishlist Icon** - Requires login
  - Shows prompt if not logged in
  - Redirects to login page

---

## 🔄 Redirect Flow

### When User Tries to Access Protected Page:
1. User clicks on protected page (e.g., checkout, wishlist)
2. System checks `localStorage.getItem("isLoggedIn")`
3. If not logged in:
   - Shows alert: "Please login to access [page name]"
   - Redirects to: `login.html?redirect=[page-name].html`
4. After successful login:
   - User is redirected back to the original page they tried to access

### When User Tries Protected Action:
1. User clicks "Add to Cart" or "Add to Wishlist" on shop page
2. System checks login status
3. If not logged in:
   - Shows confirmation dialog
   - If confirmed, redirects to login with redirect parameter
4. After login, user can continue shopping

---

## 📝 Implementation Details

### Files Modified:

1. **`index.html`**
   - Removed login redirect
   - Now publicly accessible

2. **`checkout.html`**
   - Added login check at page load
   - Redirects to login if not authenticated

3. **`wishlist.html`**
   - Added login check at page load
   - Redirects to login if not authenticated

4. **`profile.html`**
   - Added login check at page load
   - Redirects to login if not authenticated

5. **`track-order.html`**
   - Added login check at page load
   - Redirects to login if not authenticated

6. **`app.js`**
   - Added login check before adding items to cart/wishlist
   - Added login check for cart/wishlist icon clicks
   - Shows user-friendly prompts

7. **`login.html`**
   - Handles redirect parameters
   - Redirects user back to original page after login

---

## 🎯 User Experience Flow

### Scenario 1: Public Browsing
1. User visits `index.html` → ✅ Access granted (public)
2. User browses `shop.html` → ✅ Access granted (public)
3. User views products → ✅ Access granted (public)
4. User clicks "Add to Cart" → ⚠️ Login prompt appears
5. User logs in → ✅ Redirected back to shop
6. User can now add items → ✅ Success

### Scenario 2: Direct Access to Protected Page
1. User tries to access `checkout.html` directly
2. System checks login → ❌ Not logged in
3. Alert shown: "Please login to access checkout"
4. Redirected to `login.html?redirect=checkout.html`
5. User logs in → ✅ Redirected to `checkout.html`

### Scenario 3: Logged-In User
1. User is logged in
2. All pages accessible → ✅ Full access
3. Can add to cart/wishlist → ✅ No prompts
4. Can checkout → ✅ Full functionality

---

## 🔍 Testing Checklist

- [ ] Home page accessible without login
- [ ] Shop page accessible without login
- [ ] Contact page accessible without login
- [ ] Cannot add to cart without login (shows prompt)
- [ ] Cannot add to wishlist without login (shows prompt)
- [ ] Cannot access checkout without login (redirects)
- [ ] Cannot access wishlist page without login (redirects)
- [ ] Cannot access profile without login (redirects)
- [ ] Cannot track orders without login (redirects)
- [ ] After login, redirects back to original page
- [ ] Logged-in users have full access to all features

---

## 💡 Benefits of Hybrid Model

1. **Better User Experience**
   - Users can explore products before committing to register
   - Reduces friction for first-time visitors

2. **SEO Friendly**
   - Public pages can be indexed by search engines
   - Better discoverability

3. **Conversion Optimization**
   - Users see value before being asked to register
   - Higher conversion rates

4. **Security**
   - Sensitive actions (purchases, personal data) still protected
   - Cart and wishlist tied to user accounts

---

**Last Updated:** 2025
**Status:** ✅ Implemented and Active

