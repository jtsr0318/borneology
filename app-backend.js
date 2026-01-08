// Updated app.js to work with backend API
// This replaces localStorage with API calls

// Load API client
const API = {
  // Auth
  register: async (email, password, name, role) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role })
    });
    return res.json();
  },
  
  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    if (result.success) {
      localStorage.setItem('userId', result.userId);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('isLoggedIn', 'true');
    }
    return result;
  },
  
  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  },
  
  getUserId: () => localStorage.getItem('userId'),
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Products
  getProducts: async () => {
    const res = await fetch('/api/products');
    return res.json();
  },
  
  // Cart
  getCart: async (userId) => {
    if (!userId) return [];
    const res = await fetch(`/api/cart/${userId}`);
    return res.json();
  },
  
  addToCart: async (userId, productId, quantity = 1) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, quantity })
    });
    return res.json();
  },
  
  updateCartQuantity: async (itemId, quantity) => {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    return res.json();
  },
  
  removeFromCart: async (itemId) => {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  
  // Wishlist
  getWishlist: async (userId) => {
    if (!userId) return [];
    const res = await fetch(`/api/wishlist/${userId}`);
    return res.json();
  },
  
  addToWishlist: async (userId, productId) => {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId })
    });
    return res.json();
  },
  
  removeFromWishlist: async (itemId) => {
    const res = await fetch(`/api/wishlist/${itemId}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  
  // Orders
  createOrder: async (userId, items, total, shippingAddress) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, items, total, shippingAddress })
    });
    return res.json();
  },
  
  getUserOrders: async (userId) => {
    if (!userId) return [];
    const res = await fetch(`/api/orders/${userId}`);
    return res.json();
  },
  
  trackOrder: async (orderId) => {
    const res = await fetch(`/api/orders/track/${orderId}`);
    return res.json();
  },
  
  // User Profile
  getUser: async (userId) => {
    if (!userId) return null;
    const res = await fetch(`/api/users/${userId}`);
    return res.json();
  },
  
  updateUser: async (userId, data) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`/api/users/${userId}/avatar`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  
  // Product Management (Seller/Admin)
  createProduct: async (productData, imageFile) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const res = await fetch('/api/products', {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  
  updateProduct: async (productId, productData, imageFile) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      body: formData
    });
    return res.json();
  },
  
  deleteProduct: async (productId) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

// Legacy storage object for backward compatibility (will sync with API)
const storage = {
  wishlist: [],
  cart: [],
  _initialized: false
};

// Initialize and sync with API
async function initializeStorage() {
  const userId = API.getUserId();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  if (userId && isLoggedIn) {
    try {
      storage.cart = await API.getCart(userId);
      storage.wishlist = await API.getWishlist(userId);
      storage._initialized = true;
      updateCounters();
    } catch (error) {
      console.error('Failed to load cart/wishlist:', error);
      // Fallback to localStorage only if logged in
      if (isLoggedIn) {
        storage.cart = JSON.parse(localStorage.getItem("cart") || "[]");
        storage.wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      } else {
        storage.cart = [];
        storage.wishlist = [];
      }
    }
  } else {
    // No user logged in - clear cart/wishlist
    storage.cart = [];
    storage.wishlist = [];
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    updateCounters();
  }
}

async function saveState() {
  const userId = API.getUserId();
  if (userId) {
    // Sync with API - cart and wishlist are managed through API calls
    // No need to save here as API handles persistence
  } else {
    // Fallback to localStorage
    localStorage.setItem("wishlist", JSON.stringify(storage.wishlist));
    localStorage.setItem("cart", JSON.stringify(storage.cart));
  }
}

function updateCounters() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const wishlistCount = isLoggedIn ? storage.wishlist.length : 0;
  const cartCount = isLoggedIn ? storage.cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
  
  document.querySelectorAll('[data-counter="wishlist"] span').forEach((el) => {
    el.textContent = wishlistCount;
  });
  document.querySelectorAll('[data-counter="cart"] span').forEach((el) => {
    el.textContent = cartCount;
  });
}

// Toast notifications - use global toast if exists, otherwise create one
function getToastElement() {
  let toast = document.getElementById("toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  return toast;
}

function showToast(message) {
  const toast = getToastElement();
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

// Quantity selector handlers
document.querySelectorAll(".quantity-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const productId = btn.dataset.productId;
    const action = btn.dataset.action;
    const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
    if (!input) return;
    
    let value = parseInt(input.value) || 1;
    if (action === "increase") {
      value = Math.min(99, value + 1);
    } else if (action === "decrease") {
      value = Math.max(1, value - 1);
    }
    input.value = value;
  });
});

// Add-to-cart / wishlist with API integration
document.querySelectorAll("[data-product]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const { action, id, name, price, image } = btn.dataset;
    const userId = API.getUserId();
    
    // Get quantity from input if it exists
    const quantityInput = document.querySelector(`.quantity-input[data-product-id="${id}"]`);
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    try {
      if (userId) {
        // Use API
        if (action === 'cart') {
          await API.addToCart(userId, id, quantity);
          await initializeStorage(); // Refresh local storage
        } else if (action === 'wishlist') {
          await API.addToWishlist(userId, id);
          await initializeStorage();
        }
      } else {
        // Fallback to localStorage
        const target = storage[action];
        const exists = target.find((item) => item.id === id);
        
        if (!exists) {
          target.push({ id, name, price, image, quantity });
        } else {
          exists.quantity = (exists.quantity || 1) + quantity;
        }
        saveState();
      }
      
      // Add animation
      btn.classList.add("added");
      setTimeout(() => btn.classList.remove("added"), 600);
      
      updateCounters();
      showToast(`${name} (${quantity}x) added to ${action}`);
    } catch (error) {
      console.error('Error adding to', action, error);
      showToast(`Failed to add ${name} to ${action}`);
    }
  });
});

// Cart & wishlist shortcuts - check if already initialized
if (!window.cartBtnInitialized) {
  const cartBtn = document.getElementById("cartBtn");
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (!isLoggedIn || isLoggedIn !== "true") {
        if (confirm("Please login to view your cart. Would you like to go to the login page?")) {
          window.location.href = "login.html?redirect=checkout.html";
        }
        return;
      }
      window.location.href = "checkout.html";
    });
  }

  const wishlistBtn = document.getElementById("wishlistBtn");
  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (!isLoggedIn || isLoggedIn !== "true") {
        if (confirm("Please login to view your wishlist. Would you like to go to the login page?")) {
          window.location.href = "login.html?redirect=wishlist.html";
        }
        return;
      }
      window.location.href = "wishlist.html";
    });
  }
  
  window.cartBtnInitialized = true;
}

// Profile dropdown - only initialize if not already done
if (!window.profileTriggerInitialized) {
  const profileTrigger = document.getElementById("profileTrigger");
  const profileMenu = document.getElementById("profileMenu");

  if (profileTrigger && profileMenu) {
    profileTrigger.addEventListener("click", () => profileMenu.classList.toggle("show"));
    document.addEventListener("click", (e) => {
      if (!profileTrigger.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove("show");
      }
    });
  }
  window.profileTriggerInitialized = true;
}

// Nav drawer (mobile) - only initialize if not already done
if (!window.navDrawerInitialized) {
  const menuToggle = document.getElementById("menuToggle");
  const navDrawer = document.getElementById("navDrawer");
  if (menuToggle && navDrawer) {
    menuToggle.addEventListener("click", () => navDrawer.classList.toggle("show"));
  }
  window.navDrawerInitialized = true;
}

// Shop filters (sidebar) - only initialize if not already done
if (!window.productGridInitialized) {
  const productGrid = document.getElementById("productGrid");
  if (productGrid) {
    const cards = Array.from(productGrid.children);
    const categorySelect = document.getElementById("filterCategory");
    const priceRange = document.getElementById("filterPrice");
    const priceLabel = document.getElementById("filterPriceLabel");

    function applyFilters() {
      const category = categorySelect ? categorySelect.value : "all";
      const maxPrice = priceRange ? Number(priceRange.value) : Infinity;
      cards.forEach((card) => {
        const cardCategory = card.dataset.category;
        const price = Number(card.dataset.price);
        const matchCategory = category === "all" || cardCategory === category;
        const matchPrice = price <= maxPrice;
        card.style.display = matchCategory && matchPrice ? "flex" : "none";
      });
      if (priceLabel && priceRange) priceLabel.textContent = `RM${priceRange.value}`;
    }

    if (categorySelect) categorySelect.addEventListener("change", applyFilters);
    if (priceRange) priceRange.addEventListener("input", applyFilters);
    applyFilters();
  }
  window.productGridInitialized = true;
}

// Initialize on page load
initializeStorage();

// Generate default avatar icon (SVG)
function getDefaultAvatarIcon(name = 'User') {
  const initial = name.charAt(0).toUpperCase();
  const colors = ['#b87a4a', '#3c2619', '#d4a874', '#7b6352'];
  const colorIndex = initial.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="${bgColor}"/>
      <text x="20" y="20" font-family="Inter, sans-serif" font-size="16" font-weight="600" fill="#fff7eb" text-anchor="middle" dominant-baseline="central">${initial}</text>
    </svg>
  `)}`;
}

// Load user avatar on all pages (except login page)
async function loadUserAvatar() {
  // Don't load avatar on login page
  if (window.location.pathname.includes('login.html')) {
    return;
  }
  
  const userId = API.getUserId();
  if (userId) {
    try {
      const userData = await API.getUser(userId);
      const userName = userData?.name || 'User';
      const defaultIcon = getDefaultAvatarIcon(userName);
      
      // Update all avatar images
      document.querySelectorAll('#profileTrigger img, .profile-trigger img, #navAvatar').forEach(img => {
        if (userData && userData.avatar && userData.avatar.trim() !== '') {
          // User has uploaded avatar
          img.src = userData.avatar;
          img.style.display = 'block';
        } else {
          // Use default icon
          img.src = defaultIcon;
          img.style.display = 'block';
        }
      });
      
      // Update profile trigger with progress ring based on seller verification status
      updateProfileProgressRing(userData);
      
      // Add verified badge to profile trigger if user is verified seller
      if (userData && userData.isVerifiedSeller && profileTrigger) {
        // Remove existing badge if any
        const existingBadge = profileTrigger.querySelector('.verified-badge-nav');
        if (!existingBadge) {
          const verifiedBadge = document.createElement('span');
          verifiedBadge.className = 'verified-badge-nav';
          verifiedBadge.style.cssText = 'display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; background:linear-gradient(135deg, #3b82f6, #2563eb); color:white; border-radius:50%; font-size:0.7rem; margin-left:0.4rem; font-weight:700; box-shadow:0 2px 6px rgba(59,130,246,0.4); flex-shrink:0;';
          verifiedBadge.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
          const profileSpan = profileTrigger.querySelector('span');
          if (profileSpan) {
            profileSpan.appendChild(verifiedBadge);
          } else {
            profileTrigger.appendChild(verifiedBadge);
          }
        }
      }
      
      // Add seller dashboard link if user is verified seller/admin
      if (userData && userData.isVerifiedSeller) {
        const profileMenu = document.getElementById('profileMenu');
        if (profileMenu) {
          // Check if link already exists
          const existingLink = profileMenu.querySelector('a[href="seller-dashboard.html"]');
          if (!existingLink) {
            const sellerLink = document.createElement('a');
            sellerLink.href = 'seller-dashboard.html';
            sellerLink.textContent = '📦 Seller Dashboard';
            sellerLink.style.fontWeight = '600';
            sellerLink.style.color = 'var(--tone-mid)';
            // Insert after profile link
            const profileLink = profileMenu.querySelector('a[href="profile.html"]');
            if (profileLink) {
              profileLink.insertAdjacentElement('afterend', sellerLink);
            } else {
              profileMenu.insertBefore(sellerLink, profileMenu.firstChild);
            }
          }
        }
      } else if (userData && userData.role === 'buyer') {
        // Add "Become a Seller" link for buyers
        const profileMenu = document.getElementById('profileMenu');
        if (profileMenu) {
          const existingLink = profileMenu.querySelector('a[href="seller-application.html"]');
          if (!existingLink) {
            const sellerLink = document.createElement('a');
            sellerLink.href = 'seller-application.html';
            sellerLink.textContent = '🏪 Become a Seller';
            sellerLink.style.fontWeight = '600';
            sellerLink.style.color = 'var(--tone-mid)';
            sellerLink.style.background = 'rgba(184,122,74,0.1)';
            sellerLink.style.padding = '0.5rem 1rem';
            sellerLink.style.borderRadius = '8px';
            sellerLink.style.margin = '0.5rem 0';
            sellerLink.style.display = 'block';
            // Insert after profile link
            const profileLink = profileMenu.querySelector('a[href="profile.html"]');
            if (profileLink) {
              profileLink.insertAdjacentElement('afterend', sellerLink);
            } else {
              profileMenu.insertBefore(sellerLink, profileMenu.firstChild);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user avatar:', error);
    }
  }
  
  // Function to update profile progress ring based on seller verification status
  async function updateProfileProgressRing(userData) {
    const profileTrigger = document.getElementById('profileTrigger');
    if (!profileTrigger) return;
    
    // Remove all progress classes
    profileTrigger.classList.remove('progress-red', 'progress-yellow', 'progress-orange', 'progress-green', 'progress-gradient');
    
    // Check seller verification status
    if (userData && userData.role === 'seller') {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const response = await fetch(`/api/seller/status/${userId}`);
          const statusData = await response.json();
          
          if (statusData.isVerifiedSeller) {
            // Verified seller - Green ring
            profileTrigger.classList.add('progress-green');
          } else if (statusData.status === 'pending') {
            // Pending - Orange/Yellow gradient (animating)
            profileTrigger.classList.add('progress-orange');
          } else if (statusData.status === 'rejected') {
            // Rejected - Red ring
            profileTrigger.classList.add('progress-red');
          } else if (statusData.status === 'not_applied') {
            // Not applied yet - Yellow ring
            profileTrigger.classList.add('progress-yellow');
          }
        } catch (error) {
          console.error('Error checking seller status for progress ring:', error);
        }
      }
    } else if (userData && userData.role === 'admin') {
      // Admin - Green ring
      profileTrigger.classList.add('progress-green');
    }
  }
}

// Load avatar when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadUserAvatar);
} else {
  loadUserAvatar();
}

// Export API for use in other scripts
window.API = API;

