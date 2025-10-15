"use strict";

// DOM helpers
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (str = "") => str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));

const Shop = window.Shop || {};
// Storage keys kept stable
Shop.CART_KEY = "vintage_college_cart_v1";
Shop.THEME_KEY = "vintage_college_theme_v1";
Shop.RECENT_KEY = "vintage_college_recent_v1";
Shop.COUPON_KEY = "vintage_college_coupon_v1";

/* Toasts: lightweight, auto-dismiss notifications */
// toast(): non-blocking, auto-dismissing message; conveys actions
Shop.toast = function toast(message) {
  const wrap = $('#toast-wrap');
  if (!wrap || !message) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2400);
};

/* Utilities */
// money(): formats numbers as USD (no i18n for simplicity)
Shop.money = (value) => `$${Number(value || 0).toFixed(2)}`;

// getCart(): safely read cart object from localStorage
Shop.getCart = function getCart() {
  try { return JSON.parse(localStorage.getItem(Shop.CART_KEY)) || {}; }
  catch (_) { return {}; }
};

// setCart(): persist cart, update UI, optionally toast
Shop.setCart = function setCart(cart, options = {}) {
  const { silent = false, message = '' } = options;
  localStorage.setItem(Shop.CART_KEY, JSON.stringify(cart));
  Shop.updateCartCount();
  Shop.renderMiniCart();
  if (!silent) Shop.toast(message || 'Cart updated');
};

// updateCartCount(): updates the badge in header
Shop.updateCartCount = function updateCartCount() {
  const cart = Shop.getCart();
  const total = Object.values(cart).reduce((sum, qty) => sum + (typeof qty === 'number' ? qty : 0), 0);
  const badge = $('#cart-count');
  if (badge) badge.textContent = total;
};

// findProduct(): returns product by id from global catalog
Shop.findProduct = function findProduct(id) {
  return (window.CATALOG || []).find((product) => product.id === id);
};

/* Cart core */
// addItem(): adds item with selected options to cart and toasts
Shop.addItem = function addItem(product, { size, color, qty = 1 } = {}) {
  if (!product) return;
  const chosenSize = size || (product.sizes && product.sizes[0]) || 'M';
  const chosenColor = color || (product.colors && product.colors[0]) || 'Heritage Grey';
  const key = `${product.id}_${chosenSize}_${chosenColor}`;
  const cart = Shop.getCart();
  cart[key] = (cart[key] || 0) + qty;
  Shop.setCart(cart, { message: `Added ${product.name} (${chosenSize}, ${chosenColor})` });
};

// removeItem(): removes cart line by key
Shop.removeItem = function removeItem(key, options = {}) {
  const cart = Shop.getCart();
  if (cart[key]) { delete cart[key]; Shop.setCart(cart, options); }
};

/* Catalog rendering */
// renderProducts(): creates product cards; wires add-to-cart and quick-view
Shop.renderProducts = function renderProducts(list = window.CATALOG, term = '') {
  const grid = $('#products');
  if (!grid || !Array.isArray(list)) return;
  if (!list.length) {
    grid.innerHTML = `<div class="card cart-empty">No tees match "${escapeHtml(term)}". Try another school or mascot.</div>`;
  } else {
    grid.innerHTML = list.map((product) => `
      <div class="product-card" data-id="${product.id}">
        <a href="product.html?id=${product.id}" class="product-link" aria-label="View details for ${escapeHtml(product.name)}">
          <img src="${product.img}" alt="${escapeHtml(product.name)} vintage tee" loading="lazy" />
          <h3>${escapeHtml(product.name)}</h3>
          <p class="price">${Shop.money(product.price)}</p>
        </a>
        <div class="card-actions">
          <button class="btn ghost quick-view" data-quick-view="${product.id}" aria-label="Quick view ${escapeHtml(product.name)}">Quick view</button>
          <button class="btn add-to-cart" data-id="${product.id}" aria-label="Add ${escapeHtml(product.name)} to cart">Add to cart</button>
        </div>
      </div>
    `).join('');
  }
  const status = $('#search-status');
  if (status) {
    const total = window.CATALOG ? window.CATALOG.length : list.length;
    status.textContent = term
      ? (list.length ? `Showing ${list.length} ${list.length === 1 ? 'tee' : 'tees'} for "${term}".` : `No tees found for "${term}".`)
      : `Showing ${list.length} of ${total} tees.`;
  }
  $$('.add-to-cart', grid).forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const product = Shop.findProduct(button.dataset.id);
      Shop.addItem(product, {});
    });
  });
  $$('.product-link', grid).forEach((link) => link.addEventListener('click', () => {
    const id = link.closest('[data-id]')?.dataset.id; if (id) Shop.addRecent(id);
  }));
  $$('.quick-view', grid).forEach((button) => button.addEventListener('click', (e) => {
    e.preventDefault(); Shop.openQuickView(button.dataset.quickView);
  }));
};

/* Mini cart rendering */
// renderMiniCart(): updates mini-cart list and subtotal
Shop.renderMiniCart = function renderMiniCart() {
  const wrap = $('#mini-cart');
  const list = $('#mini-cart-items');
  const summary = $('#mini-cart-summary');
  if (!wrap || !list || !summary) return;
  const cart = Shop.getCart();
  const entries = Object.entries(cart);
  if (!entries.length) { list.innerHTML = '<p class="mini-cart__empty">Your cart is empty. Add a tee to start your vintage haul.</p>'; summary.textContent = ''; return; }
  let total = 0;
  list.innerHTML = entries.map(([key, qty]) => {
    const [id, size, color] = key.split('_');
    const product = Shop.findProduct(id);
    if (!product) return '';
    total += product.price * qty;
    return `
      <article class="cart-line" data-key="${key}">
        <img src="${product.img}" alt="${escapeHtml(product.name)}" loading="lazy" />
        <div>
          <h3>${escapeHtml(product.name)}</h3>
          <p class="cart-line__meta">Size ${escapeHtml(size)} • ${escapeHtml(color)}</p>
          <div class="cart-line__actions">
            <div class="qty-stepper" data-key="${key}">
              <button type="button" data-step="-1" aria-label="Decrease quantity">-</button>
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

/* Mini cart controls + focus management */
// openMiniCart(): opens mini-cart and traps focus
Shop.openMiniCart = function openMiniCart() { const wrap = $('#mini-cart'); if (!wrap) return; wrap.setAttribute('aria-hidden', 'false'); Shop.trapFocus(wrap); };
// closeMiniCart(): closes mini-cart and releases focus
Shop.closeMiniCart = function closeMiniCart() { const wrap = $('#mini-cart'); if (!wrap) return; wrap.setAttribute('aria-hidden', 'true'); };

// initMiniCart(): toggles, quantity changes, remove lines
Shop.initMiniCart = function initMiniCart() {
  const toggle = $('#mini-cart-toggle');
  const wrap = $('#mini-cart');
  if (!wrap) return;
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isHidden = wrap.getAttribute('aria-hidden') !== 'false';
      if (isHidden) { Shop.renderMiniCart(); Shop.openMiniCart(); } else { Shop.closeMiniCart(); }
    });
  }
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && wrap.getAttribute('aria-hidden') === 'false') Shop.closeMiniCart(); });
  wrap.addEventListener('click', (event) => {
    if (event.target.matches('[data-close-mini-cart]')) { Shop.closeMiniCart(); return; }
    const removeBtn = event.target.closest('[data-remove-mini-item]');
    if (removeBtn) { const key = removeBtn.dataset.removeMiniItem; Shop.removeItem(key, { silent: true }); Shop.renderMiniCart(); return; }
    const stepBtn = event.target.closest('[data-step]');
    if (stepBtn) { const stepper = stepBtn.closest('.qty-stepper'); const key = stepper.dataset.key; const input = $('input', stepper); const current = Number(input.value) || 1; const next = Math.max(1, current + Number(stepBtn.dataset.step)); input.value = next; Shop.updateCartQuantity(key, next, { silent: true }); Shop.renderMiniCart(); }
  });
  wrap.addEventListener('change', (event) => { const input = event.target; if (input.matches('.qty-stepper input')) { const key = input.closest('.qty-stepper').dataset.key; const next = Math.max(1, Number(input.value) || 1); input.value = next; Shop.updateCartQuantity(key, next, { silent: true }); Shop.renderMiniCart(); } });
};

// updateCartQuantity(): sets quantity or deletes line
Shop.updateCartQuantity = function updateCartQuantity(key, qty, options = {}) {
  const cart = Shop.getCart(); if (qty <= 0) { delete cart[key]; } else { cart[key] = qty; } Shop.setCart(cart, options);
};

/* Focus trap for accessible dialogs */
// trapFocus(): basic focus trap for elements with role="dialog"
Shop.trapFocus = function trapFocus(container) {
  if (!container) return;
  const focusable = $$('[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])', container).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
  const first = focusable[0]; const last = focusable[focusable.length - 1];
  first?.focus();
  const handler = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  };
  container.addEventListener('keydown', handler);
};

/* Theme toggle */
// initTheme(): load/save theme and swap icons
Shop.initTheme = function initTheme() {
  const themeToggle = $('#theme-toggle');
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(Shop.THEME_KEY, theme);
    if (themeToggle) {
      const icons = themeToggle.querySelectorAll('.theme-icon');
      icons.forEach((icon) => { const isDark = icon.alt.toLowerCase().includes('dark'); icon.style.display = (theme === 'dark' && isDark) || (theme === 'light' && !isDark) ? 'block' : 'none'; });
    }
  };
  const savedTheme = localStorage.getItem(Shop.THEME_KEY) || 'light';
  applyTheme(savedTheme);
  themeToggle?.addEventListener('click', () => { const current = document.documentElement.getAttribute('data-theme') || 'light'; applyTheme(current === 'light' ? 'dark' : 'light'); });
};

/* Search */
// initSearch(): expanding search with live filter
Shop.initSearch = function initSearch() {
  const searchBtn = $('#search-btn'); const searchInput = $('#search-input'); const grid = $('#products'); const status = $('#search-status'); const isCatalogPage = Boolean(grid);
  if (!searchBtn || !searchInput) return;
  const collapse = () => searchBtn.classList.remove('expanded');
  const filterProducts = (term) => {
    if (!isCatalogPage) { if (term) window.location.href = `index.html?search=${encodeURIComponent(term)}`; return; }
    const trimmed = term.trim().toLowerCase();
    if (!trimmed) { Shop.renderProducts(window.CATALOG, ''); return; }
    const results = (window.CATALOG || []).filter((product) => { const haystack = [product.name, product.desc, product.tag, product.era].join(' ').toLowerCase(); return haystack.includes(trimmed); });
    Shop.renderProducts(results, term);
  };
  searchBtn.addEventListener('click', () => { searchBtn.classList.add('expanded'); searchInput.focus(); });
  searchBtn.addEventListener('focus', () => { searchBtn.classList.add('expanded'); searchInput.focus(); });
  searchInput.addEventListener('blur', () => { setTimeout(collapse, 120); });
  searchInput.addEventListener('keydown', (event) => { if (event.key === 'Escape') { collapse(); searchBtn.blur(); } if (event.key === 'Enter') { event.preventDefault(); filterProducts(searchInput.value); } });
  if (isCatalogPage) {
    searchInput.addEventListener('input', () => filterProducts(searchInput.value));
    const params = new URLSearchParams(window.location.search); const initial = params.get('search');
    if (initial) { searchBtn.classList.add('expanded'); searchInput.value = initial; filterProducts(initial); }
    else { Shop.renderProducts(window.CATALOG, ''); if (status && status.textContent === '') { status.textContent = `Showing ${(window.CATALOG || []).length} tees.`; } }
  }
};

/* Recently viewed */
// addRecent(): stores recent product IDs (max 6) in localStorage
Shop.addRecent = function addRecent(id) { if (!id) return; try { const existing = JSON.parse(localStorage.getItem(Shop.RECENT_KEY)) || []; const next = [id, ...existing.filter((x) => x !== id)].slice(0, 6); localStorage.setItem(Shop.RECENT_KEY, JSON.stringify(next)); } catch (_) {} };
// renderRecent(): shows recently viewed products if present
Shop.renderRecent = function renderRecent() {
  const host = $('#recent'); if (!host) return; let recent = []; try { recent = JSON.parse(localStorage.getItem(Shop.RECENT_KEY)) || []; } catch (_) {}
  if (!recent.length) { host.innerHTML = ''; return; }
  const items = recent.map((id) => Shop.findProduct(id)).filter(Boolean); if (!items.length) { host.innerHTML = ''; return; }
  host.innerHTML = `
    <h2 class="recent-title">Recently viewed</h2>
    <div class="grid">${items.map((p) => `
      <div class="product-card" data-id="${p.id}">
        <a href="product.html?id=${p.id}" class="product-link" aria-label="View details for ${escapeHtml(p.name)}">
          <img src="${p.img}" alt="${escapeHtml(p.name)} vintage tee" loading="lazy" />
          <h3>${escapeHtml(p.name)}</h3>
          <p class="price">${Shop.money(p.price)}</p>
        </a>
        <div class="card-actions">
          <button class="btn ghost quick-view" data-quick-view="${p.id}" aria-label="Quick view ${escapeHtml(p.name)}">Quick view</button>
          <button class="btn add-to-cart" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    `).join('')}</div>
  `;
  $$('.add-to-cart', host).forEach((btn) => btn.addEventListener('click', () => Shop.addItem(Shop.findProduct(btn.dataset.id))));
  $$('.quick-view', host).forEach((btn) => btn.addEventListener('click', (e) => { e.preventDefault(); Shop.openQuickView(btn.dataset.quickView); }));
};

/* Quick View Modal */
// openQuickView(): opens product preview modal with focus trap
Shop.openQuickView = function openQuickView(id) {
  const product = Shop.findProduct(id); if (!product) return;
  let modal = $('#quick-view');
  if (!modal) {
    const wrap = document.createElement('div'); wrap.id = 'quick-view'; wrap.className = 'modal';
    wrap.innerHTML = `
      <div class="modal__overlay" data-close-modal></div>
      <section class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
        <header class="modal__header">
          <h2 id="quick-view-title">Quick View</h2>
          <button type="button" class="modal__close" data-close-modal aria-label="Close">×</button>
        </header>
        <div class="modal__body" id="quick-view-body"></div>
      </section>`;
    document.body.appendChild(wrap); modal = wrap;
    modal.addEventListener('click', (e) => { if (e.target.matches('[data-close-modal]')) Shop.closeModal(modal); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') Shop.closeModal(modal); });
  }
  const body = $('#quick-view-body', modal);
  if (body) {
    body.innerHTML = `
      <article class="product-detail">
        <div class="product-detail__gallery">
          <img src="${product.img}" alt="${escapeHtml(product.name)} image" loading="lazy" />
        </div>
        <div class="product-detail__info">
          ${product.tag ? `<span class="product-detail__badge">${escapeHtml(product.tag)}</span>` : ''}
          <h3>${escapeHtml(product.name)}</h3>
          <p class="product-detail__price">${Shop.money(product.price)}</p>
          <p class="product-detail__desc">${escapeHtml(product.desc || '')}</p>
          <div class="card-actions">
            <button class="btn" data-add="${product.id}">Add to cart</button>
          </div>
        </div>
      </article>`;
    body.querySelector('[data-add]')?.addEventListener('click', () => Shop.addItem(product));
  }
  modal.setAttribute('aria-hidden', 'false'); Shop.trapFocus(modal);
};
// closeModal(): hides a modal by aria-hidden
Shop.closeModal = function closeModal(modal) { if (!modal) return; modal.setAttribute('aria-hidden', 'true'); };

/* Coupon scratch + confetti */
// initCoupon(): installs scratch-to-reveal coupon modal on demand
Shop.initCoupon = function initCoupon() {
  const btn = $('#coupon-toggle'); if (!btn) return;
  const show = () => {
    let modal = $('#coupon-modal');
    if (!modal) {
      const wrap = document.createElement('div'); wrap.id = 'coupon-modal'; wrap.className = 'modal';
      wrap.innerHTML = `
        <div class="modal__overlay" data-close-modal></div>
        <section class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="coupon-title">
          <header class="modal__header">
            <h2 id="coupon-title">Scratch to reveal your code</h2>
            <button type="button" class="modal__close" data-close-modal aria-label="Close">×</button>
          </header>
          <div class="modal__body">
            <div class="coupon-card">
              <div class="coupon-code" id="coupon-code">VINTAGE15</div>
              <canvas id="coupon-canvas" width="320" height="100" aria-label="Scratch area"></canvas>
            </div>
          </div>
        </section>`;
      document.body.appendChild(wrap); modal = wrap;
      modal.addEventListener('click', (e) => { if (e.target.matches('[data-close-modal]')) Shop.closeModal(modal); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') Shop.closeModal(modal); });
    }
    modal.setAttribute('aria-hidden', 'false'); Shop.trapFocus(modal);
    const canvas = $('#coupon-canvas', modal); if (!canvas) return; const ctx = canvas.getContext('2d');
    // Paint scratch layer, then punch holes out as user scrubs
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#C9C9C9'; // light variation for texture
    for (let i = 0; i < 40; i++) { ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 8, 2); }
    ctx.globalCompositeOperation = 'destination-out';

    const brush = (x, y) => { ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); };
    let active = false; let strokes = 0;
    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : (e.pointerType ? e : e);
      return { x: (p.clientX - r.left), y: (p.clientY - r.top) };
    };
    const start = (e) => { active = true; const {x,y} = pos(e); brush(x,y); };
    const move = (e) => { if (!active) return; const {x,y} = pos(e); brush(x,y); strokes++; if (strokes > 60) { done(); } };
    const end = () => { active = false; };
    const done = () => {
      cleanup();
      try { localStorage.setItem(Shop.COUPON_KEY, 'revealed'); } catch(_) {}
      Shop.confetti();
    };
    const cleanup = () => {
      canvas.removeEventListener('pointerdown', start);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointerleave', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('mouseleave', end);
    };
    // Pointer events (wide support) + fallbacks
    canvas.addEventListener('pointerdown', start, { passive: true });
    canvas.addEventListener('pointermove', move, { passive: true });
    canvas.addEventListener('pointerup', end, { passive: true });
    canvas.addEventListener('pointerleave', end, { passive: true });
    canvas.addEventListener('touchstart', start, { passive: true });
    canvas.addEventListener('touchmove', move, { passive: true });
    canvas.addEventListener('touchend', end, { passive: true });
    canvas.addEventListener('mousedown', start, { passive: true });
    canvas.addEventListener('mousemove', move, { passive: true });
    canvas.addEventListener('mouseup', end, { passive: true });
    canvas.addEventListener('mouseleave', end, { passive: true });
  };
  btn.addEventListener('click', show);
};

// confetti(): lightweight celebration effect, reduced if prefers-reduced-motion
Shop.confetti = function confetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#76A09E', '#C1B49A', '#FFD166', '#EF476F', '#06D6A0']; const root = document.body; const count = Math.min(60, Math.max(30, Math.floor(window.innerWidth / 20)));
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('i'); dot.className = 'confetti';
    const size = Math.random() * 6 + 4; dot.style.width = `${size}px`; dot.style.height = `${size}px`; dot.style.left = `${Math.random() * 100}%`; dot.style.background = colors[i % colors.length]; dot.style.setProperty('--tx', `${(Math.random() - 0.5) * 100}px`); dot.style.setProperty('--ty', `${window.innerHeight + Math.random() * 200}px`);
    root.appendChild(dot); setTimeout(() => dot.remove(), 1800);
  }
};

/* Contact forms */
// initContactForms(): validates demo contact form and shows inline status
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
        if (success) { success.textContent = 'Please fill out all fields with a valid email address.'; success.style.color = 'var(--error)'; }
        return;
      }
      form.reset();
      if (success) { success.textContent = 'Thanks! A curator will reply within one business day.'; success.style.color = 'var(--success)'; setTimeout(() => { success.textContent = ''; }, 4000); }
    });
  });
};

/* App init */
Shop.initGlobal = function initGlobal() {
  Shop.initTheme(); Shop.initSearch(); Shop.initContactForms(); Shop.initMiniCart(); Shop.initCoupon();
  Shop.updateCartCount(); Shop.renderMiniCart();
  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();
  // Record recent from product page param if present
  const pid = new URLSearchParams(location.search).get('id'); if (pid) Shop.addRecent(pid);
  // Render recent section if available
  Shop.renderRecent();
  // Fallback: ensure products render if grid exists and is still empty
  const grid = document.getElementById('products');
  if (grid && !grid.children.length) { Shop.renderProducts(window.CATALOG || [], ''); }
};

document.addEventListener('DOMContentLoaded', Shop.initGlobal);

window.Shop = Shop;
