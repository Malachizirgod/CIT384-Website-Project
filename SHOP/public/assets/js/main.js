// Utility functions
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Cart and theme keys
const CART_KEY = 'vintage_college_cart_v1';
const THEME_KEY = 'vintage_college_theme_v1';

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
  toast('Added to cart');
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

// Theme logic
const themeToggle = $('#theme-toggle');
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  if (themeToggle) {
    const darkIcon = themeToggle.querySelector('img[alt="Dark Theme"]');
    const lightIcon = themeToggle.querySelector('img[alt="Light Theme"]');
    if (darkIcon && lightIcon) {
      if (theme === 'dark') {
        darkIcon.style.display = '';
        lightIcon.style.display = 'none';
      } else {
        darkIcon.style.display = 'none';
        lightIcon.style.display = '';
      }
    }
  }
}
if (themeToggle) {
  themeToggle.onclick = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
  };
}
const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
setTheme(savedTheme);

// Toast notifications
function toast(msg) {
  const wrap = $('#toast-wrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// Product grid rendering
function renderProducts() {
  const grid = $('#products');
  if (!grid || !window.CATALOG) return;
  grid.innerHTML = window.CATALOG.map(product => `
    <div class="product-card" data-id="${product.id}">
      <a href="product.html?id=${product.id}" class="product-link" aria-label="View details for ${product.name}">
        <img src="${product.img}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.desc || ''}</p>
        <p class="price">$${product.price.toFixed(2)}</p>
      </a>
      <button class="btn add-to-cart" data-id="${product.id}" aria-label="Add ${product.name} to cart">Add to Cart</button>
    </div>
  `).join('');
  $$('.add-to-cart').forEach(btn => {
    btn.onclick = function (e) {
      e.preventDefault();
      const productId = this.dataset.id;
      const product = window.CATALOG.find(p => p.id === productId);
      if (!product) return;
      // Default to first size/color
      const size = (product.sizes && product.sizes[0]) || 'M';
      const color = (product.colors && product.colors[0]) || 'Default';
      const cart = getCart();
      const key = `${product.id}_${size}_${color}`;
      cart[key] = (cart[key] || 0) + 1;
      setCart(cart);
    };
  });
}

// --- Search Button Expand/Collapse ---
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
      // Implement your search logic here
      // Example: filter products or redirect
      // alert('Searching for: ' + searchInput.value);
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
      $('#name').style.borderColor = 'var(--accent)';
      valid = false;
    } else {
      $('#name').style.borderColor = '';
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      $('#email').style.borderColor = 'var(--accent)';
      valid = false;
    } else {
      $('#email').style.borderColor = '';
    }
    if (!message) {
      $('#message').style.borderColor = 'var(--accent)';
      valid = false;
    } else {
      $('#message').style.borderColor = '';
    }
    if (!valid) {
      successDiv.textContent = "Please fill out all fields correctly.";
      successDiv.style.color = "var(--accent)";
      return;
    }
    // Simulate success
    contactForm.reset();
    successDiv.textContent = "Thank you! Your message has been sent.";
    successDiv.style.color = "var(--brand)";
    setTimeout(() => { successDiv.textContent = ""; }, 4000);
  });
}

// Set year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Initial render
renderProducts();
updateCartCount();
