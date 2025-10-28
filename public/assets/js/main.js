
"use strict";

/**
 * main.js
 *
 * This file contains the core application logic for the Campus Shop.
 * It handles state management, UI rendering, event handling, and accessibility.
 *
 * - Shop: A global namespace for all application methods.
 * - State Management: Functions for cart, theme, and recently viewed items using localStorage.
 * - UI Rendering: Functions to render product grids, the mini-cart, and other dynamic components.
 * - Event Handling: Centralized event listeners for user interactions.
 * - Accessibility: Focus trapping for modals, ARIA attribute management, and keyboard navigation.
 * - Initialization: Sets up the entire application on DOMContentLoaded.
 */

(function(window) {
  // Strict mode helps catch common coding errors and "unsafe" actions.

  // Establish a global namespace for the application to avoid polluting the global scope.
  const Shop = window.Shop || {};

  /*
   * ===================================================================
   *  1. DOM & UTILITY HELPERS
   * ===================================================================
   * Reusable functions for common tasks like DOM selection and string formatting.
   */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (str = "") =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));

  /*
   * ===================================================================
   *  2. STATE MANAGEMENT
   * ===================================================================
   * Functions for getting and setting data in localStorage (cart, theme, etc.).
   * This provides a persistent experience for users across sessions.
   */

  const State = {
    cart: {},
    theme: 'light',
    recent: [],
    couponRevealed: false
  };

  const STORAGE_KEYS = {
    CART: "campus_shop_cart",
    THEME: "campus_shop_theme",
    RECENT: "campus_shop_recent",
    COUPON: "campus_shop_coupon"
  };

  // Safely parse JSON from localStorage, with a fallback to a default value.
  const getStored = (key, fallback) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.error(`Error reading from localStorage: ${key}`, e);
      return fallback;
    }
  };

  // Safely stringify and set JSON data to localStorage.
  const setStored = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing to localStorage: ${key}`, e);
    }
  };

  // Load all state from localStorage on application start.
  const loadState = () => {
    State.cart = getStored(STORAGE_KEYS.CART, {});
    State.theme = getStored(STORAGE_KEYS.THEME, 'light');
    State.recent = getStored(STORAGE_KEYS.RECENT, []);
    State.couponRevealed = getStored(STORAGE_KEYS.COUPON, false);
  };

  /*
   * ===================================================================
   *  3. UI COMPONENTS & RENDERING
   * ===================================================================
   * Functions that create and update the HTML for different parts of the UI.
   */

  // --- Toasts (Notifications) ---
  const toast = (message) => {
    const container = $('#toast-container');
    if (!container || !message) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.addEventListener('transitionend', () => el.remove());
    }, 2800);
  };

  // --- Product Card ---
  const createProductCard = (product) => {
    if (!product) return '';
    return `
      <div class="product-card" data-id="${product.id}">
        <a href="product.html?id=${product.id}" class="product-link">
          <div class="product-card-img-wrapper">
            <img src="${product.img}" alt="${escapeHtml(product.name)}" class="product-card-img" loading="lazy" />
          </div>
          <div class="product-card-info">
            <h3 class="product-card-name">${escapeHtml(product.name)}</h3>
            <p class="product-card-price">$${product.price.toFixed(2)}</p>
          </div>
        </a>
      </div>
    `;
  };

  // --- Product Grid ---
  const renderProductGrid = (products, container, term = '') => {
    const statusEl = $('#search-status');
    if (!products.length) {
      container.innerHTML = `<p class="search-status">No tees match "${escapeHtml(term)}".</p>`;
      if (statusEl) statusEl.textContent = '';
      return;
    }
    container.innerHTML = products.map(createProductCard).join('');
    if (statusEl) {
      const total = window.CATALOG?.length || 0;
      statusEl.textContent = term ?
        `Showing ${products.length} result(s) for "${escapeHtml(term)}".` :
        `Showing ${products.length} of ${total} tees.`;
    }
  };

  // --- Mini-Cart ---
  const renderMiniCart = () => {
    const itemsContainer = $('#mini-cart-items');
    const summaryContainer = $('#mini-cart-summary');
    const cartEntries = Object.entries(State.cart);

    if (!cartEntries.length) {
      itemsContainer.innerHTML = '<p class="mini-cart-empty">Your cart is empty.</p>';
      summaryContainer.innerHTML = '';
      return;
    }

    let subtotal = 0;
    itemsContainer.innerHTML = cartEntries.map(([key, qty]) => {
      const [id, size, color] = key.split('_');
      const product = window.CATALOG.find(p => p.id === id);
      if (!product) return '';
      subtotal += product.price * qty;
      return `
        <div class="mini-cart-item" data-key="${key}">
          <img src="${product.img}" alt="" />
          <div class="mini-cart-item-info">
            <div class="mini-cart-item-name">${escapeHtml(product.name)}</div>
            <div class="mini-cart-item-price">$${product.price.toFixed(2)}</div>
            <a href="#" class="mini-cart-item-remove" data-remove-key="${key}">Remove</a>
          </div>
          <span>x${qty}</span>
        </div>
      `;
    }).join('');

    summaryContainer.innerHTML = `<span>Subtotal</span> <span>$${subtotal.toFixed(2)}</span>`;
  };

  // Helper to format money consistently
  const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  /*
   * ===================================================================
   *  4. CART & PRODUCT LOGIC
   * ===================================================================
   * Functions for adding/removing items from the cart and managing recently viewed products.
   */

  const updateCartCount = () => {
    const count = Object.values(State.cart).reduce((sum, qty) => sum + qty, 0);
    const cartCountEl = $('#cart-count');
    if (cartCountEl) {
      cartCountEl.textContent = count;
      cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    }
  };

  const saveCart = () => {
    setStored(STORAGE_KEYS.CART, State.cart);
    updateCartCount();
    renderMiniCart();
  };

  const addItemToCart = (productId, qty = 1, options = {}) => {
    const product = window.CATALOG.find(p => p.id === productId);
    if (!product) return;

    const size = options.size || product.sizes[0];
    const color = options.color || product.colors[0];
    const key = `${productId}_${size}_${color}`;

    State.cart[key] = (State.cart[key] || 0) + qty;
    saveCart();
    toast(`Added ${product.name} to cart`);
  };

  const removeItemFromCart = (key) => {
    const productName = State.cart[key] ? window.CATALOG.find(p => p.id === key.split('_')[0])?.name : '';
    delete State.cart[key];
    saveCart();
    if (productName) toast(`Removed ${productName} from cart`);
  };

  // Update or remove a specific cart line by composite key
  const updateCartQuantity = (key, nextQty, { silent } = {}) => {
    if (!key) return;
    if (nextQty <= 0) {
      delete State.cart[key];
      saveCart();
      if (!silent) toast('Removed item from cart');
      return;
    }
    State.cart[key] = nextQty;
    saveCart();
    if (!silent) toast('Updated cart');
  };

  const addRecent = (productId) => {
    if (!productId) return;
    State.recent = [productId, ...State.recent.filter(id => id !== productId)].slice(0, 4);
    setStored(STORAGE_KEYS.RECENT, State.recent);
  };

  // Product helpers
  const findProduct = (id) => window.CATALOG?.find(p => p.id === id);

  /*
   * ===================================================================
   *  5. UI BEHAVIORS & EVENT HANDLING
   * ===================================================================
   * Functions that manage user interactions, modals, and other dynamic UI elements.
   */

  // --- Focus Trap --- (Essential for a11y in modals/sidebars)
  const trapFocus = (container) => {
    const focusableElements = $$('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])', container);
    if (!focusableElements.length) return;
    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          lastEl.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastEl) {
          firstEl.focus();
          e.preventDefault();
        }
      }
    };

    firstEl.focus();
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown); // Return a cleanup function
  };

  // --- Theme Toggle ---
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    State.theme = theme;
    setStored(STORAGE_KEYS.THEME, theme);
  };

  const initThemeToggle = () => {
    applyTheme(State.theme);
    $('#theme-toggle')?.addEventListener('click', () => {
      const newTheme = State.theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  };

  // --- Mini-Cart Sidebar ---
  const initMiniCart = () => {
    const miniCart = $('#mini-cart');
    const toggleButton = $('#mini-cart-toggle');
    const closeElements = $$('[data-close-mini-cart]', miniCart);
    let cleanupFocusTrap = () => {};

    const openCart = () => {
      renderMiniCart();
      miniCart.classList.add('is-open');
      miniCart.setAttribute('aria-hidden', 'false');
      const panel = $('#mini-cart .mini-cart-panel') || $('#mini-cart .mini-cart__panel') || miniCart;
      cleanupFocusTrap = trapFocus(panel);
    };

    const closeCart = () => {
      miniCart.classList.remove('is-open');
      miniCart.setAttribute('aria-hidden', 'true');
      cleanupFocusTrap();
      toggleButton.focus();
    };

    toggleButton?.addEventListener('click', openCart);
    closeElements.forEach(el => el.addEventListener('click', closeCart));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && miniCart.classList.contains('is-open')) closeCart();
    });

    // Handle remove clicks inside the mini-cart
    miniCart.addEventListener('click', (e) => {
      const removeLink = e.target.closest('.mini-cart-item-remove');
      if (removeLink) {
        e.preventDefault();
        const key = removeLink.dataset.removeKey;
        removeItemFromCart(key);
      }
    });
  };

  // --- Mobile Navigation ---
  const initMobileNav = () => {
    const menuToggle = $('#menu-toggle');
    const mainNav = $('#main-nav');
    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
  };

  // --- Search ---
  const initSearch = () => {
    const container = $('.search-container');
    const toggle = $('#search-toggle');
    const input = $('#search-input');
    const productGrid = $('#products');

    if (!toggle || !input) return;

    toggle.addEventListener('click', () => {
      container.classList.toggle('active');
      const isActive = container.classList.contains('active');
      toggle.setAttribute('aria-expanded', isActive);
      if (isActive) input.focus();
    });

    input.addEventListener('input', () => {
      const term = input.value.toLowerCase();
      if (productGrid) {
        const filtered = window.CATALOG.filter(p => p.name.toLowerCase().includes(term));
        renderProductGrid(filtered, productGrid, input.value);
      }
    });
  };

  // --- Contact Form ---
  const initContactForm = () => {
    const form = $('#contact-form');
    const statusEl = $('#form-status');
    if (!form || !statusEl) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      statusEl.textContent = 'Thanks! We'll be in touch soon.';
      statusEl.className = 'form-status success';
      form.reset();
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
      }, 4000);
    });
  };
  
  /*
   * ===================================================================
   *  6. PAGE-SPECIFIC INITIALIZATION
   * ===================================================================
   */

  const initHomePage = () => {
    const productsContainer = $('#products');
    if (productsContainer) {
      renderProductGrid(window.CATALOG, productsContainer);
    }

    const recentContainer = $('#recent');
    if (recentContainer && State.recent.length > 0) {
      const recentProducts = State.recent.map(id => window.CATALOG.find(p => p.id === id)).filter(Boolean);
      if (recentProducts.length > 0) {
        recentContainer.innerHTML = `<h2>Recently Viewed</h2><div class="grid">${recentProducts.map(createProductCard).join('')}</div>`;
      }
    }

    // Add to cart from product grid (event delegation)
    document.body.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card) {
            const id = card.dataset.id;
            addRecent(id);
        }
    });
  };
  
  /*
   * ===================================================================
   *  7. APP INITIALIZATION
   * ===================================================================
   */

  const initApp = () => {
    loadState(); // Load data from localStorage first

    // Global initializers
    initThemeToggle();
    initMiniCart();
    initMobileNav();
    initSearch();
    initContactForm();
    updateCartCount();

    // Page-specific initializers
    if ($('#products')) {
      initHomePage();
    }
    
    // Set current year in footer
    $('#year').textContent = new Date().getFullYear();

    console.log("Campus Shop initialized!");
  };

  // Defer initialization until the DOM is fully loaded.
  document.addEventListener('DOMContentLoaded', initApp);

  // Expose necessary functions to the global scope.
  Shop.addItemToCart = addItemToCart;
  // API expected by product.js and cart.html scripts
  Shop.addItem = (product, { size, color, qty } = {}) => {
    if (!product) return;
    addItemToCart(product.id, qty || 1, { size, color });
  };
  Shop.findProduct = findProduct;
  Shop.getCart = () => ({ ...State.cart });
  Shop.renderMiniCart = renderMiniCart;
  Shop.updateCartCount = updateCartCount;
  Shop.updateCartQuantity = updateCartQuantity;
  Shop.money = money;
  // Expose recently-viewed helper so product pages can register views
  Shop.addRecent = addRecent;
  window.Shop = Shop;

})(window);
