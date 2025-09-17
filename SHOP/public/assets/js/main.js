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
}
document.addEventListener('DOMContentLoaded', boot);
