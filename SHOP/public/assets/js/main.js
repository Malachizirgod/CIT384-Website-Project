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

// Utility: Render products grid
function renderProducts() {
  const grid = document.getElementById('products');
  grid.innerHTML = window.CATALOG.map(product => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.img}" alt="${product.name} product image" />
      <h3>${product.name}</h3>
      <p>${product.desc || ''}</p>
      <p>$${product.price.toFixed(2)}</p>
      <button class="btn add-to-cart" data-id="${product.id}">Add to Cart</button>
    </div>
  `).join('');
  setupProductInteractivity();
}

// Interactive Product Preview (hover to cycle images)
function setupProductInteractivity() {
  document.querySelectorAll('.product-card img').forEach(img => {
    const productId = img.closest('.product-card').dataset.id;
    const product = window.CATALOG.find(p => p.id === productId);
    if (product && product.imgs && product.imgs.length > 1) {
      let idx = 0;
      img.addEventListener('mouseenter', function () {
        idx = (idx + 1) % product.imgs.length;
        img.src = product.imgs[idx];
      });
      img.addEventListener('mouseleave', function () {
        img.src = product.imgs[0];
        idx = 0;
      });
    }
  });

  // Quick View modal logic
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function () {
      openQuickView(card.dataset.id);
      addRecentlyViewed(card.dataset.id);
      renderRecentlyViewed();
    });
  });
}

// Product Quick View Modal
function openQuickView(productId) {
  const product = window.CATALOG.find(p => p.id === productId);
  if (!product) return;
  document.getElementById('quickview-title').textContent = product.name;
  document.getElementById('quickview-description').textContent = product.desc || '';
  document.getElementById('quickview-price').textContent = `$${product.price.toFixed(2)}`;
  document.getElementById('quickview-add').dataset.id = product.id;

  // Render images
  const imgDiv = document.getElementById('quickview-image');
  imgDiv.innerHTML = '';
  (product.imgs || [product.img]).forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = product.name;
    imgDiv.appendChild(img);
  });

  // Render size selector
  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  let sizeHtml = '<label for="quickview-size">Size:</label> <select id="quickview-size" aria-label="Select size">';
  sizes.forEach(size => {
    sizeHtml += `<option value="${size}">${size}</option>`;
  });
  sizeHtml += '</select>';
  document.getElementById('quickview-size-wrap').innerHTML = sizeHtml;

  document.getElementById('quickview').style.display = 'flex';
}

// Close Quick View modal
document.querySelectorAll('#quickview .close').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('quickview').style.display = 'none';
  });
});

// Modal Confetti Animation
function confettiBurst(target) {
  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;
    confetti.appendChild(dot);
  }
  target.appendChild(confetti);
  setTimeout(() => confetti.remove(), 1200);
}

// Add to cart from Quick View and show confetti
document.getElementById('quickview-add').addEventListener('click', function () {
  const productId = this.dataset.id;
  const size = document.getElementById('quickview-size').value;
  // Save productId and size to cart (update cart.js as well)
  showToast(`Added to cart! Size: ${size}`);
  confettiBurst(document.querySelector('#quickview .modal-content'));
});

// Toast notification utility
function showToast(msg) {
  const wrap = document.getElementById('toast-wrap');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Recently Viewed Items
function addRecentlyViewed(id) {
  let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  viewed = viewed.filter(pid => pid !== id);
  viewed.unshift(id);
  if (viewed.length > 5) viewed = viewed.slice(0, 5);
  localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
}

function renderRecentlyViewed() {
  const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  const container = document.getElementById('recently-viewed');
  if (!container) return;
  container.innerHTML = viewed.map(id => {
    const p = window.CATALOG.find(prod => prod.id === id);
    if (!p) return '';
    return `<img src="${p.img}" alt="${p.name}" title="${p.name}" style="width:48px;height:48px;margin:2px;border-radius:6px;">`;
  }).join('');
}

// Coupon Reveal Game (Scratch Card)
const couponCode = "CAMPUS10";
const scratch = document.getElementById('coupon-scratch');
if (scratch) {
  scratch.addEventListener('click', function revealCoupon() {
    scratch.innerHTML = `<strong>Your Coupon: ${couponCode}</strong>`;
    scratch.style.background = '#fffbe6';
    scratch.removeEventListener('click', revealCoupon);
  });
}

// Theme Customizer
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
document.getElementById('light-theme').onclick = () => setTheme('light');
document.getElementById('dark-theme').onclick = () => setTheme('dark');
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// Floating actions for modals
document.getElementById('quickview-toggle').onclick = () => {
  document.getElementById('quickview').style.display = 'flex';
};
document.getElementById('coupon-toggle').onclick = () => {
  document.getElementById('coupon-modal').style.display = 'flex';
};
document.querySelectorAll('.modal .close').forEach(btn => {
  btn.onclick = function () {
    btn.closest('.modal').style.display = 'none';
  };
});

// Set year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Initial render
renderProducts();
renderRecentlyViewed();

// Rotating testimonials data
const testimonials = [
  {
    text: "The quality is amazing and shipping was fast!",
    author: "Alex, CSUN Student"
  },
  {
    text: "Love the chapter tee. Super comfy!",
    author: "Jamie, CSUN Alumni"
  },
  {
    text: "The football hoodie is perfect for game day!",
    author: "Taylor, Ohio State University"
  },
  {
    text: "Great fit and awesome colors. Go Blue!",
    author: "Jordan, University of Michigan"
  },
  {
    text: "Best campus merch I’ve bought. Roll Tide!",
    author: "Casey, University of Alabama"
  }
];

let currentTestimonial = 0;
const carousel = document.getElementById('testimonial-carousel');

function showTestimonial(index) {
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
