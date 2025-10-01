const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const CART_KEY = 'campus_cart_v1';
const THEME_KEY = 'campus_theme_v1';

function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } }
function setCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartCount(); toast('Added to cart'); bump($('#cart-count')); }
function updateCartCount(){ const c = getCart(); const t = Object.values(c).reduce((s,i)=>s+i.qty,0); $('#cart-count').textContent = t; }
function money(n){ return `$${n.toFixed(2)}`; }

function setTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem(THEME_KEY, t); }
function toggleTheme(){ const cur = localStorage.getItem(THEME_KEY) || 'dark'; setTheme(cur === 'dark' ? 'light' : 'dark'); }

function toast(msg){
  const wrap = $('#toast-wrap'); if(!wrap) return;
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  wrap.appendChild(el); setTimeout(()=> el.remove(), 2200);
}
function bump(el){ if(!el) return; el.style.transform='scale(1.15)'; el.style.transition='transform .12s ease'; setTimeout(()=> el.style.transform='', 130); }

// Theme toggle logic
const themeToggle = document.getElementById('theme-toggle');
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeToggle) themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '🌙' : '🌞';
}
if (themeToggle) {
  themeToggle.onclick = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
  };
}
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// Sticky header shadow on scroll
window.addEventListener('scroll', () => {
  document.querySelector('.header').classList.toggle('scrolled', window.scrollY > 10);
  document.getElementById('back-to-top').style.display = window.scrollY > 200 ? 'block' : 'none';
});

// Mobile nav drawer
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
  navToggle.onclick = () => {
    document.querySelector('.header').classList.toggle('nav-open');
  };
}

// Back to top
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  backToTop.onclick = () => window.scrollTo({top:0,behavior:'smooth'});
}

// Toast notifications
function showToast(msg) {
  const wrap = document.getElementById('toast-wrap');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Product grid rendering
function renderProducts() {
  const grid = document.getElementById('products');
  if (!grid) return;
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
    btn.onclick = function(e) {
      e.preventDefault();
      const productId = this.dataset.id;
      const product = window.CATALOG.find(p => p.id === productId);
      if (!product) return;
      // Default to first size/color
      const size = (product.sizes && product.sizes[0]) || 'M';
      const color = (product.colors && product.colors[0]) || 'Default';
      const cart = JSON.parse(localStorage.getItem('cart') || '{}');
      const key = `${product.id}_${size}_${color}`;
      cart[key] = (cart[key] || 0) + 1;
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      showToast(`Added to cart!`);
    };
  });
}
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const el1 = document.getElementById('cart-count');
  const el2 = document.getElementById('cart-count-drawer');
  if (el1) el1.textContent = count;
  if (el2) el2.textContent = count;
}
function $$(s, r=document) { return [...r.querySelectorAll(s)]; }

// Slide-out cart drawer
const cartDrawer = document.getElementById('cart-drawer');
const cartIcon = document.getElementById('cart-icon');
if (cartIcon && cartDrawer) {
  cartIcon.onclick = () => { cartDrawer.classList.add('open'); renderCartDrawer(); };
  cartDrawer.querySelector('.close-cart').onclick = () => cartDrawer.classList.remove('open');
}
function renderCartDrawer() {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  const itemsDiv = document.getElementById('cart-items');
  const summaryDiv = document.getElementById('cart-summary');
  if (!itemsDiv || !summaryDiv) return;
  let total = 0;
  let html = '';
  Object.entries(cart).forEach(([key, qty]) => {
    const [id, size, color] = key.split('_');
    const product = window.CATALOG.find(p => p.id === id);
    if (!product) return;
    total += product.price * qty;
    html += `
      <div class="cart-item">
        <img src="${product.img}" alt="${product.name}" style="width:60px;border-radius:8px;">
        <div>
          <h4>${product.name}</h4>
          <p>Size: ${size}</p>
          <p>Color: ${color}</p>
          <p>$${product.price.toFixed(2)} × ${qty}</p>
        </div>
        <div>
          <button aria-label="Increase quantity" onclick="updateQty('${id}_${size}_${color}', 1)">+</button>
          <button aria-label="Decrease quantity" onclick="updateQty('${id}_${size}_${color}', -1)">-</button>
          <button aria-label="Remove item" onclick="removeItem('${id}_${size}_${color}')">Remove</button>
        </div>
      </div>
    `;
  });
  itemsDiv.innerHTML = html || `<div style="text-align:center;padding:32px;"><span style="font-size:2em;">🛒</span><p>Your cart is empty.</p></div>`;
  summaryDiv.innerHTML = `<h3>Total: $${total.toFixed(2)}</h3>`;
  updateCartCount();
}
window.updateQty = function(key, delta) {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  cart[key] = (cart[key] || 0) + delta;
  if (cart[key] <= 0) delete cart[key];
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartDrawer();
};
window.removeItem = function(key) {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  delete cart[key];
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartDrawer();
};

// Testimonials carousel
const testimonials = [
  { text: "The quality is amazing and shipping was fast!", author: "Alex, CSUN Student" },
  { text: "Love the chapter tee. Super comfy!", author: "Jamie, CSUN Alumni" },
  { text: "The football hoodie is perfect for game day!", author: "Taylor, Ohio State University" },
  { text: "Great fit and awesome colors. Go Blue!", author: "Jordan, University of Michigan" },
  { text: "Best campus merch I’ve bought. Roll Tide!", author: "Casey, University of Alabama" }
];
let currentTestimonial = 0;
const carousel = document.getElementById('testimonial-carousel');
function showTestimonial(index) {
  if (!carousel) return;
  const oldSlide = carousel.querySelector('.testimonial-slide.active');
  if (oldSlide) {
    oldSlide.classList.remove('active');
    oldSlide.classList.add('exit-left');
    setTimeout(() => oldSlide.remove(), 500);
  }
  const testimonial = testimonials[index];
  const slide = document.createElement('blockquote');
  slide.className = 'testimonial-slide active';
  slide.innerHTML = `<p>“${testimonial.text}”</p><footer>– ${testimonial.author}</footer>`;
  carousel.appendChild(slide);
}
if (carousel) {
  showTestimonial(currentTestimonial);
  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
  }, 4000);
}

// Set year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Initial render
renderProducts();
updateCartCount();
