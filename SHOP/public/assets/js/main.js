const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const CART_KEY = 'campus_cart_v1';
const THEME_KEY = 'campus_theme_v1';

function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } }
function setCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartCount(); toast('Added to cart'); bump($('#cart-count')); }
function updateCartCount(){ const c = getCart(); const t = Object.values(c).reduce((s,i)=>s+i.qty,0); $('#cart-count').textContent = t; }
function money(n){ return `$${n.toFixed(2)}`; }

function setTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem(THEME_KEY, t); $('#theme-toggle').textContent = t === 'light' ? '🌞' : '🌙'; }
function toggleTheme(){ const cur = localStorage.getItem(THEME_KEY) || 'dark'; setTheme(cur === 'dark' ? 'light' : 'dark'); }

function toast(msg){
  const wrap = $('#toast-wrap'); if(!wrap) return;
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  wrap.appendChild(el); setTimeout(()=> el.remove(), 2200);
}
function bump(el){ if(!el) return; el.style.transform='scale(1.15)'; el.style.transition='transform .12s ease'; setTimeout(()=> el.style.transform='', 130); }

function renderProducts(list=window.CATALOG){
  const grid = $('#products'); grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card fade-in'; // for reveal
    card.innerHTML = `
      <img class="skel" style="aspect-ratio:1.2/1" src="${p.img}" alt="${p.name}" loading="lazy" onload="this.classList.remove('skel')" />
      <div class="pad stack">
        <div class="row">
          <h3>${p.name}</h3>
          <span class="price">${money(p.price)}</span>
        </div>
        <div class="row">
          <small class="muted">ID: ${p.id}</small>
          ${p.tag ? `<span class="badge">${p.tag}</span>` : ''}
        </div>
        <button class="btn" data-id="${p.id}">Add to Cart</button>
      </div>`;
    grid.appendChild(card);
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]'); if(!btn) return;
    const id = btn.dataset.id;
    const p = window.CATALOG.find(x => x.id === id); if(!p) return;
    const cart = getCart();
    cart[id] = cart[id] || { id, name: p.name, price: p.price, qty: 0 };
    cart[id].qty++;
    setCart(cart);
  });

  // Reveal on scroll
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(ent => ent.isIntersecting && ent.target.classList.add('is-visible'));
  }, { rootMargin: '0px 0px -10% 0px' });
  $$('.fade-in').forEach(el => io.observe(el));
}

function renderProduct(product) {
  return `
    <div class="product-card">
      <img src="${product.img}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.desc || ''}</p>
      <p>$${product.price.toFixed(2)}</p>
      <button class="btn add-to-cart" data-id="${product.id}">Add to Cart</button>
    </div>
  `;
}

function wireSearch(){
  const input = $('#search'); if(!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const filtered = !q ? window.CATALOG :
      window.CATALOG.filter(p => [p.name, p.id, p.tag].filter(Boolean).join(' ').toLowerCase().includes(q));
    renderProducts(filtered);
  });
}

function boot(){
  $('#year').textContent = new Date().getFullYear();
  updateCartCount();
  setTheme(localStorage.getItem(THEME_KEY) || 'dark');
  $('#theme-toggle')?.addEventListener('click', toggleTheme);
  renderProducts();
  wireSearch();

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

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function () {
      const productId = card.dataset.id;
      const product = window.CATALOG.find(p => p.id === productId);
      if (!product) return;
      document.getElementById('quickview-title').textContent = product.name;
      document.getElementById('quickview-description').textContent = product.desc || '';
      document.getElementById('quickview-price').textContent = `$${product.price.toFixed(2)}`;
      document.getElementById('quickview-add').dataset.id = product.id;
      // Images
      const imgDiv = document.getElementById('quickview-image');
      imgDiv.innerHTML = '';
      if (product.imgs && product.imgs.length) {
        product.imgs.forEach(src => {
          const img = document.createElement('img');
          img.src = src;
          img.alt = product.name;
          imgDiv.appendChild(img);
        });
      } else {
        const img = document.createElement('img');
        img.src = product.img;
        img.alt = product.name;
        imgDiv.appendChild(img);
      }
      document.getElementById('quickview').style.display = 'block';
    });
  });

  // Close modal
  document.querySelectorAll('#quickview .close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('quickview').style.display = 'none';
    });
  });

  document.getElementById('quickview-add').addEventListener('click', function () {
    const id = this.dataset.id;
    const p = window.CATALOG.find(x => x.id === id); if(!p) return;
    const cart = getCart();
    cart[id] = cart[id] || { id, name: p.name, price: p.price, qty: 0 };
    cart[id].qty++;
    setCart(cart);
    confettiBurst(document.querySelector('#quickview .modal-content'));
  });
}
document.addEventListener('DOMContentLoaded', boot);

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

// Add after Quick View logic

function addRecentlyViewed(id) {
  let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  viewed = viewed.filter(pid => pid !== id);
  viewed.unshift(id);
  if (viewed.length > 5) viewed = viewed.slice(0, 5);
  localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
}

document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('click', function () {
    addRecentlyViewed(card.dataset.id);
    renderRecentlyViewed();
  });
});

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

// On page load
document.addEventListener('DOMContentLoaded', renderRecentlyViewed);

// Add after DOMContentLoaded

const couponCode = "CAMPUS10";
const scratch = document.getElementById('coupon-scratch');
if (scratch) {
  scratch.addEventListener('click', function revealCoupon() {
    scratch.innerHTML = `<strong>Your Coupon: ${couponCode}</strong>`;
    scratch.style.background = '#fffbe6';
    scratch.removeEventListener('click', revealCoupon);
  });
}

// Add after DOMContentLoaded

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
document.getElementById('light-theme').onclick = () => setTheme('light');
document.getElementById('dark-theme').onclick = () => setTheme('dark');

// On load
const savedTheme = localStorage.getItem('theme');
if (savedTheme) setTheme(savedTheme);
