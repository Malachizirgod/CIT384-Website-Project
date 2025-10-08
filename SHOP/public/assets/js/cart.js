// Utility functions (shared with main.js)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CART_KEY = 'vintage_college_cart_v1';

// Cart helpers
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}
function setCart(c) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
  updateCartCount();
}
function updateCartCount() {
  const c = getCart();
  const t = Object.values(c).reduce((s, i) => s + (typeof i === 'object' && i.qty ? i.qty : i), 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = t;
}
function money(n) {
  return `$${n.toFixed(2)}`;
}

// Render cart items
function renderCart() {
  const cart = getCart();
  const itemsDiv = $('#cart-items');
  const summaryDiv = $('#cart-summary');
  const messageDiv = $('#cart-message');
  if (!itemsDiv || !summaryDiv) return;

  let total = 0;
  let html = '';
  Object.entries(cart).forEach(([key, qty]) => {
    const [id, size, color] = key.split('_');
    const product = window.CATALOG.find(p => p.id === id);
    if (!product) return;
    total += product.price * qty;
    html += `
      <div class="product-card" style="flex-direction:row;align-items:center;gap:18px;margin-bottom:18px;">
        <img src="${product.img}" alt="${product.name}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;">
        <div style="flex:1;">
          <h3 style="margin:0 0 4px 0;">${product.name}</h3>
          <div style="font-size:0.95em;color:var(--muted);margin-bottom:4px;">
            Size: ${size} &nbsp;|&nbsp; Color: ${color}
          </div>
          <div style="font-size:1.1em;font-weight:700;">${money(product.price)} × ${qty}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
          <button class="btn ghost" aria-label="Increase quantity" onclick="updateQty('${key}', 1)">+</button>
          <button class="btn ghost" aria-label="Decrease quantity" onclick="updateQty('${key}', -1)">–</button>
          <button class="btn ghost" aria-label="Remove item" onclick="removeItem('${key}')">Remove</button>
        </div>
      </div>
    `;
  });
  itemsDiv.innerHTML = html || `<div style="text-align:center;padding:32px;"><span style="font-size:2em;">🛒</span><p>Your cart is empty.</p></div>`;
  summaryDiv.innerHTML = `<h3 style="margin-top:0;">Total: ${money(total)}</h3>`;
  messageDiv.textContent = '';
  updateCartCount();
}
window.updateQty = function (key, delta) {
  const cart = getCart();
  cart[key] = (cart[key] || 0) + delta;
  if (cart[key] <= 0) delete cart[key];
  setCart(cart);
  renderCart();
};
window.removeItem = function (key) {
  const cart = getCart();
  delete cart[key];
  setCart(cart);
  renderCart();
};

// --- Search Button Expand/Collapse (same as main.js) ---
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', () => {
    searchBtn.classList.add('expanded');
    searchInput.focus();
  });
  searchBtn.addEventListener('focus', () => {
    searchBtn.classList.add('expanded');
    searchInput.focus();
  });
  searchInput.addEventListener('blur', () => {
    setTimeout(() => searchBtn.classList.remove('expanded'), 100);
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchBtn.classList.remove('expanded');
      searchBtn.blur();
    }
    if (e.key === 'Enter') {
      searchBtn.classList.remove('expanded');
      searchBtn.blur();
    }
  });
}

// Contact form validation and success message
const contactForm = $('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    const successDiv = $('#form-success');
    let valid = true;
    if (!name) {
      $('#name').style.borderColor = 'var(--error)';
      valid = false;
    } else {
      $('#name').style.borderColor = '';
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      $('#email').style.borderColor = 'var(--error)';
      valid = false;
    } else {
      $('#email').style.borderColor = '';
    }
    if (!message) {
      $('#message').style.borderColor = 'var(--error)';
      valid = false;
    } else {
      $('#message').style.borderColor = '';
    }
    if (!valid) {
      successDiv.textContent = "Please fill out all fields correctly.";
      successDiv.style.color = "var(--error)";
      return;
    }
    contactForm.reset();
    successDiv.textContent = "Thank you! Your message has been sent.";
    successDiv.style.color = "var(--success)";
    setTimeout(() => { successDiv.textContent = ""; }, 4000);
  });
}

// Set year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();
});
