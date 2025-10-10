// DOM helpers
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (str = '') => str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

const Shop = window.Shop || {};
Shop.CART_KEY = 'vintage_college_cart_v1';
Shop.THEME_KEY = 'vintage_college_theme_v1';

Shop.toast = function toast(message) {
  const wrap = $('#toast-wrap');
  if (!wrap || !message) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2400);
};

Shop.money = (value) => `$${value.toFixed(2)}`;

Shop.getCart = function getCart() {
  try {
    return JSON.parse(localStorage.getItem(Shop.CART_KEY)) || {};
  } catch (error) {
    console.warn('Unable to read cart data', error);
    return {};
  }
};

Shop.setCart = function setCart(cart, options = {}) {
  const { silent = false, message = '' } = options;
  localStorage.setItem(Shop.CART_KEY, JSON.stringify(cart));
  Shop.updateCartCount();
  Shop.renderMiniCart();
  if (!silent) {
    Shop.toast(message || 'Cart updated');
  }
};

Shop.updateCartCount = function updateCartCount() {
  const cart = Shop.getCart();
  const total = Object.values(cart).reduce((sum, qty) => sum + (typeof qty === 'number' ? qty : 0), 0);
  const badge = $('#cart-count');
  if (badge) badge.textContent = total;
};

Shop.findProduct = function findProduct(id) {
  return (window.CATALOG || []).find((product) => product.id === id);
};

Shop.addItem = function addItem(product, { size, color, qty = 1 } = {}) {
  if (!product) return;
  const chosenSize = size || (product.sizes && product.sizes[0]) || 'M';
  const chosenColor = color || (product.colors && product.colors[0]) || 'Heritage Grey';
  const key = `${product.id}_${chosenSize}_${chosenColor}`;
  const cart = Shop.getCart();
  cart[key] = (cart[key] || 0) + qty;
  Shop.setCart(cart, { message: `Added ${product.name} (${chosenSize}, ${chosenColor})` });
};

Shop.removeItem = function removeItem(key, options = {}) {
  const cart = Shop.getCart();
  if (cart[key]) {
    delete cart[key];
    Shop.setCart(cart, options);
  }
};

Shop.renderProducts = function renderProducts(list = window.CATALOG, term = '') {
  const grid = $('#products');
  if (!grid || !Array.isArray(list)) return;
  if (!list.length) {
    grid.innerHTML = `<div class="card cart-empty">No tees match “${escapeHtml(term)}”. Try another school or mascot.</div>`;
  } else {
    grid.innerHTML = list.map((product) => `
      <div class="product-card" data-id="${product.id}">
        <a href="product.html?id=${product.id}" class="product-link" aria-label="View details for ${escapeHtml(product.name)}">
          <img src="${product.img}" alt="${escapeHtml(product.name)} vintage tee" />
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.desc || '')}</p>
          <p class="price">${Shop.money(product.price)}</p>
        </a>
        <button class="btn add-to-cart" data-id="${product.id}" aria-label="Add ${escapeHtml(product.name)} to cart">Add to cart</button>
      </div>
    `).join('');
  }
  const status = $('#search-status');
  if (status) {
    const total = window.CATALOG ? window.CATALOG.length : list.length;
    if (term) {
      status.textContent = list.length
        ? `Showing ${list.length} ${list.length === 1 ? 'tee' : 'tees'} for “${term}”.`
        : `No tees found for “${term}”.`;
    } else {
      status.textContent = `Showing ${list.length} of ${total} tees.`;
    }
  }
  $$('.add-to-cart', grid).forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const product = Shop.findProduct(button.dataset.id);
      Shop.addItem(product, {});
    });
  });
};

Shop.renderMiniCart = function renderMiniCart() {
  const wrap = $('#mini-cart');
  const list = $('#mini-cart-items');
  const summary = $('#mini-cart-summary');
  if (!wrap || !list || !summary) return;
  const cart = Shop.getCart();
  const entries = Object.entries(cart);
  if (!entries.length) {
    list.innerHTML = '<p class="mini-cart__empty">Your cart is empty. Add a tee to start your vintage haul.</p>';
    summary.textContent = '';
    return;
  }
  let total = 0;
  list.innerHTML = entries.map(([key, qty]) => {
    const [id, size, color] = key.split('_');
    const product = Shop.findProduct(id);
    if (!product) return '';
    total += product.price * qty;
    return `
      <article class="cart-line" data-key="${key}">
        <img src="${product.img}" alt="${escapeHtml(product.name)}" />
        <div>
          <h3>${escapeHtml(product.name)}</h3>
          <p class="cart-line__meta">Size ${escapeHtml(size)} · ${escapeHtml(color)}</p>
          <div class="cart-line__actions">
            <div class="qty-stepper" data-key="${key}">
              <button type="button" data-step="-1" aria-label="Decrease quantity">−</button>
              <input type="number" min="1" value="${qty}" aria-label="Quantity for ${escapeHtml(product.name)}" />
              <button type="button" data-step="1" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="btn ghost" data-remove-mini-item="${key}">Remove</button>
          </div>
        </div>
        <div class="cart-line__price">${Shop.money(product.price * qty)}</div>
      </article>
    `;
  }).join('');
  summary.textContent = `Subtotal: ${Shop.money(total)}`;
};

Shop.openMiniCart = function openMiniCart() {
  const wrap = $('#mini-cart');
  if (wrap) wrap.setAttribute('aria-hidden', 'false');
};

Shop.closeMiniCart = function closeMiniCart() {
  const wrap = $('#mini-cart');
  if (wrap) wrap.setAttribute('aria-hidden', 'true');
};

Shop.initMiniCart = function initMiniCart() {
  const toggle = $('#mini-cart-toggle');
  const wrap = $('#mini-cart');
  if (!wrap) return;
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isHidden = wrap.getAttribute('aria-hidden') !== 'false';
      if (isHidden) {
        Shop.renderMiniCart();
        Shop.openMiniCart();
      } else {
        Shop.closeMiniCart();
      }
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && wrap.getAttribute('aria-hidden') === 'false') {
      Shop.closeMiniCart();
    }
  });
  wrap.addEventListener('click', (event) => {
    if (event.target.matches('[data-close-mini-cart]')) {
      Shop.closeMiniCart();
      return;
    }
    const removeBtn = event.target.closest('[data-remove-mini-item]');
    if (removeBtn) {
      const key = removeBtn.dataset.removeMiniItem;
      Shop.removeItem(key, { silent: true });
      Shop.renderMiniCart();
      return;
    }
    const stepBtn = event.target.closest('[data-step]');
    if (stepBtn) {
      const stepper = stepBtn.closest('.qty-stepper');
      const key = stepper.dataset.key;
      const input = $('input', stepper);
      const current = Number(input.value) || 1;
      const next = Math.max(1, current + Number(stepBtn.dataset.step));
      input.value = next;
      Shop.updateCartQuantity(key, next, { silent: true });
      Shop.renderMiniCart();
    }
  });
  wrap.addEventListener('change', (event) => {
    const input = event.target;
    if (input.matches('.qty-stepper input')) {
      const key = input.closest('.qty-stepper').dataset.key;
      const next = Math.max(1, Number(input.value) || 1);
      input.value = next;
      Shop.updateCartQuantity(key, next, { silent: true });
      Shop.renderMiniCart();
    }
  });
};

Shop.updateCartQuantity = function updateCartQuantity(key, qty, options = {}) {
  const cart = Shop.getCart();
  if (qty <= 0) {
    delete cart[key];
  } else {
    cart[key] = qty;
  }
  Shop.setCart(cart, options);
};

Shop.initTheme = function initTheme() {
  const themeToggle = $('#theme-toggle');
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(Shop.THEME_KEY, theme);
    if (themeToggle) {
      const icons = themeToggle.querySelectorAll('.theme-icon');
      icons.forEach((icon) => {
        const isDark = icon.alt.toLowerCase().includes('dark');
        icon.style.display = (theme === 'dark' && isDark) || (theme === 'light' && !isDark) ? 'block' : 'none';
      });
    }
  };
  const savedTheme = localStorage.getItem(Shop.THEME_KEY) || 'light';
  applyTheme(savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }
};

Shop.initSearch = function initSearch() {
  const searchBtn = $('#search-btn');
  const searchInput = $('#search-input');
  const grid = $('#products');
  const status = $('#search-status');
  const isCatalogPage = Boolean(grid);

  if (!searchBtn || !searchInput) return;

  const collapse = () => searchBtn.classList.remove('expanded');

  const filterProducts = (term) => {
    if (!isCatalogPage) {
      if (term) {
        window.location.href = `index.html?search=${encodeURIComponent(term)}`;
      }
      return;
    }
    const trimmed = term.trim().toLowerCase();
    if (!trimmed) {
      Shop.renderProducts(window.CATALOG, '');
      return;
    }
    const results = (window.CATALOG || []).filter((product) => {
      const haystack = [product.name, product.desc, product.tag, product.era].join(' ').toLowerCase();
      return haystack.includes(trimmed);
    });
    Shop.renderProducts(results, term);
  };

  searchBtn.addEventListener('click', () => {
    searchBtn.classList.add('expanded');
    searchInput.focus();
  });

  searchBtn.addEventListener('focus', () => {
    searchBtn.classList.add('expanded');
    searchInput.focus();
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(collapse, 120);
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      collapse();
      searchBtn.blur();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      filterProducts(searchInput.value);
    }
  });

  if (isCatalogPage) {
    searchInput.addEventListener('input', () => filterProducts(searchInput.value));
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('search');
    if (initial) {
      searchBtn.classList.add('expanded');
      searchInput.value = initial;
      filterProducts(initial);
    } else {
      Shop.renderProducts(window.CATALOG, '');
      if (status && status.textContent === '') {
        status.textContent = `Showing ${(window.CATALOG || []).length} tees.`;
      }
    }
  }
};

Shop.initContactForms = function initContactForms() {
  $$('form[data-contact-form]').forEach((form) => {
    const success = form.querySelector('.form-success');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = (formData.get('name') || '').trim();
      const email = (formData.get('email') || '').trim();
      const message = (formData.get('message') || '').trim();
      if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        if (success) {
          success.textContent = 'Please fill out all fields with a valid email address.';
          success.style.color = 'var(--error)';
        }
        return;
      }
      form.reset();
      if (success) {
        success.textContent = 'Thanks! A curator will reply within one business day.';
        success.style.color = 'var(--success)';
        setTimeout(() => { success.textContent = ''; }, 4000);
      }
    });
  });
};

Shop.initGlobal = function initGlobal() {
  Shop.initTheme();
  Shop.initSearch();
  Shop.initContactForms();
  Shop.initMiniCart();
  Shop.updateCartCount();
  Shop.renderMiniCart();
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
};

document.addEventListener('DOMContentLoaded', Shop.initGlobal);

window.Shop = Shop;
