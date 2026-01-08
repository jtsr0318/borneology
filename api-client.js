// API Client for Borneology Backend
// Replace localStorage calls with API calls

const API_BASE_URL = window.location.origin + '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ========== AUTHENTICATION ==========

async function registerUser(email, password, name, role = 'buyer') {
  return await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role })
  });
}

async function loginUser(email, password) {
  const result = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (result.success) {
    localStorage.setItem('userId', result.userId);
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('isLoggedIn', 'true');
  }
  
  return result;
}

function logoutUser() {
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
}

function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function getUserId() {
  return localStorage.getItem('userId');
}

// ========== PRODUCTS ==========

async function getProducts() {
  return await apiCall('/products');
}

async function getProduct(productId) {
  return await apiCall(`/products/${productId}`);
}

// ========== CART ==========

async function getCart(userId) {
  if (!userId) return [];
  return await apiCall(`/cart/${userId}`);
}

async function addToCart(userId, productId, quantity = 1) {
  return await apiCall('/cart', {
    method: 'POST',
    body: JSON.stringify({ userId, productId, quantity })
  });
}

async function updateCartQuantity(itemId, quantity) {
  return await apiCall(`/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
}

async function removeFromCart(itemId) {
  return await apiCall(`/cart/${itemId}`, {
    method: 'DELETE'
  });
}

// ========== WISHLIST ==========

async function getWishlist(userId) {
  if (!userId) return [];
  return await apiCall(`/wishlist/${userId}`);
}

async function addToWishlist(userId, productId) {
  return await apiCall('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ userId, productId })
  });
}

async function removeFromWishlist(itemId) {
  return await apiCall(`/wishlist/${itemId}`, {
    method: 'DELETE'
  });
}

// ========== ORDERS ==========

async function createOrder(userId, items, total, shippingAddress) {
  return await apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify({ userId, items, total, shippingAddress })
  });
}

async function getUserOrders(userId) {
  if (!userId) return [];
  return await apiCall(`/orders/${userId}`);
}

async function trackOrder(orderId) {
  return await apiCall(`/orders/track/${orderId}`);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getUserId,
    getProducts,
    getProduct,
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    createOrder,
    getUserOrders,
    trackOrder
  };
}

