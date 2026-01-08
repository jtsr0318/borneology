// Check if user is logged in
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

// Local storage for cart/wishlist (backward compatibility)
const localCartWishlist = {
  wishlist: isLoggedIn ? JSON.parse(localStorage.getItem("wishlist") || "[]") : [],
  cart: isLoggedIn ? JSON.parse(localStorage.getItem("cart") || "[]") : [],
};

function saveState() {
  // Only save if logged in
  if (localStorage.getItem("isLoggedIn") === "true") {
    localStorage.setItem("wishlist", JSON.stringify(localCartWishlist.wishlist));
    localStorage.setItem("cart", JSON.stringify(localCartWishlist.cart));
  } else {
    // Clear cart/wishlist when logged out
    localStorage.removeItem("wishlist");
    localStorage.removeItem("cart");
    localCartWishlist.wishlist = [];
    localCartWishlist.cart = [];
  }
}

function updateCounters() {
  // Only show counters if logged in
  const loggedIn = localStorage.getItem("isLoggedIn") === "true";
  const wishlistCount = loggedIn ? localCartWishlist.wishlist.length : 0;
  const cartCount = loggedIn ? localCartWishlist.cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
  
  document.querySelectorAll('[data-counter="wishlist"] span').forEach((el) => {
    el.textContent = wishlistCount;
  });
  document.querySelectorAll('[data-counter="cart"] span').forEach((el) => {
    el.textContent = cartCount;
  });
}
updateCounters();

/* Toast - check if already exists to avoid duplicate declaration */
let toastElement = document.getElementById("toast-notification");
if (!toastElement) {
  toastElement = document.createElement("div");
  toastElement.id = "toast-notification";
  toastElement.className = "toast";
  document.body.appendChild(toastElement);
}

function showToast(message) {
  const toast = document.getElementById("toast-notification") || toastElement;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

/* Quantity selector handlers */
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

/* Add-to-cart / wishlist with animations and quantity */
document.querySelectorAll("[data-product]").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn || isLoggedIn !== "true") {
      const action = btn.dataset.action;
      const actionName = action === "cart" ? "cart" : "wishlist";
      if (confirm(`Please login to add items to your ${actionName}. Would you like to go to the login page?`)) {
        window.location.href = `login.html?redirect=${window.location.pathname}`;
      }
      return;
    }

    const { action, id, name, price, image } = btn.dataset;
    const target = localCartWishlist[action];
    
    // Get quantity from input if it exists
    const quantityInput = document.querySelector(`.quantity-input[data-product-id="${id}"]`);
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    const exists = target.find((item) => item.id === id);
    
    if (!exists) {
      // Add animation class
      btn.classList.add("added");
      setTimeout(() => btn.classList.remove("added"), 600);
      
      target.push({ id, name, price, image, quantity });
      saveState();
      updateCounters();
      showToast(`${name} (${quantity}x) added to ${action}`);
    } else {
      // Update quantity if item already exists
      exists.quantity = (exists.quantity || 1) + quantity;
      saveState();
      updateCounters();
      showToast(`${name} quantity updated in ${action}`);
    }
  });
});

/* Cart & wishlist shortcuts - only initialize if not already done */
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

/* Profile dropdown - only initialize if not already done */
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

/* Nav drawer (mobile) - only initialize if not already done */
if (!window.navDrawerInitialized) {
  const menuToggle = document.getElementById("menuToggle");
  const navDrawer = document.getElementById("navDrawer");
  if (menuToggle && navDrawer) {
    menuToggle.addEventListener("click", () => navDrawer.classList.toggle("show"));
  }
  window.navDrawerInitialized = true;
}

/* Shop filters (sidebar) - only initialize if not already done */
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