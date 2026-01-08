// Global initialization flags to prevent duplicate declarations
// This file should be loaded first before app.js and app-backend.js

(function() {
  'use strict';
  
  // Initialize global flags if they don't exist
  if (typeof window.initFlags === 'undefined') {
    window.initFlags = {
      cartBtn: false,
      wishlistBtn: false,
      profileTrigger: false,
      menuToggle: false,
      navDrawer: false,
      productGrid: false,
      toast: false
    };
  }
  
  // Helper function to safely initialize elements
  window.safeInit = function(flagName, initFunction) {
    if (!window.initFlags[flagName]) {
      initFunction();
      window.initFlags[flagName] = true;
    }
  };
})();

