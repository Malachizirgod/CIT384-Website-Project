const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const CART_KEY = 'campus_cart_v1';
const THEME_KEY = 'campus_theme_v1';

function getCart(){ return JSON.parse(localStorage.getItem('cart') || '{}'); }
function setCart(c){ localStorage.setItem('cart', JSON.stringify(c)); update(); }
function money(n){ return `$${n.toFixed(2)}`; }
function setTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem(THEME_KEY, t); $('#theme-toggle').textContent = t === 'light' ? '🌞' : '🌙'; }
function toggleTheme(){ const cur = localStorage.getItem(THEME_KEY) || 'dark'; setTheme(cur === 'dark' ? 'light' : 'dark'); }
function toast(msg){ const wrap = $('#toast-wrap'); if(!wrap) return; const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; wrap.appendChild(el); setTimeout(()=>el.remove(), 2200); }

function update(){
  $('#year').textContent = new Date().getFullYear();
  const cart = getCart(); const items = Object.values(cart);
  const count = items.reduce((s,i)=>s+i.qty,0); $('#cart-count').textContent = count;

  const list = $('#cart-items'); list.innerHTML = '';
  let subtotal = 0;
  if(items.length === 0){
    list.innerHTML = '<p>Your cart is empty. <a href="index.html">Go shopping →</a></p>';
    $('#checkout-btn').disabled = true;
  } else {
    $('#checkout-btn').disabled = false;
    items.forEach(i => {
      subtotal += i.price * i.qty;
      const el = document.createElement('div');
      el.className = 'cart-item fade-in is-visible';
      el.innerHTML = `
        <img src="assets/img/${i.id.includes('hoodie') ? 'hoodie' : i.id.includes('tee') ? 'tee' : 'notebook'}.jpg" alt="${i.name}">
        <div>
          <div class="row"><strong>${i.name}</strong><span>${money(i.price)}</span></div>
          <div class="quantity">
            <button data-act="dec" data-id="${i.id}">−</button>
            <span>Qty: ${i.qty}</span>
            <button data-act="inc" data-id="${i.id}">+</button>
            <button data-act="rm" data-id="${i.id}">Remove</button>
          </div>
        </div>
        <div><strong>${money(i.price * i.qty)}</strong></div>`;
      list.appendChild(el);
    });
  }
  $('#cart-subtotal').textContent = money(subtotal);
}

function onClick(e){
  const btn = e.target.closest('button[data-act]'); if(!btn) return;
  const id = btn.dataset.id; const act = btn.dataset.act;
  const cart = getCart(); if(!cart[id]) return;
  if(act === 'inc') cart[id].qty++;
  if(act === 'dec') cart[id].qty = Math.max(0, cart[id].qty - 1);
  if(act === 'rm') { delete cart[id]; toast('Removed from cart'); }
  if(cart[id] && cart[id].qty === 0) delete cart[id];
  setCart(cart);
}

function onCheckout(){
  toast('Checkout demo — server wiring next');
  // later: POST cart JSON to /checkout.php
}

document.addEventListener('DOMContentLoaded', () => {
  setTheme(localStorage.getItem(THEME_KEY) || 'dark');
  $('#theme-toggle')?.addEventListener('click', toggleTheme);
  update();
  $('#cart-items').addEventListener('click', onClick);
  $('#checkout-btn').addEventListener('click', onCheckout);
});


// Simple cart implementation using localStorage

// Cart structure: { [productId_size]: quantity }
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '{}');
}
function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}
function renderCart() {
  const cart = getCart();
  const itemsDiv = document.getElementById('cart-items');
  const summaryDiv = document.getElementById('cart-summary');
  if (!itemsDiv || !summaryDiv) return;

  let total = 0;
  let html = '';
  Object.entries(cart).forEach(([key, qty]) => {
    const [id, size] = key.split('_');
    const product = window.CATALOG.find(p => p.id === id);
    if (!product) return;
    total += product.price * qty;
    html += `
      <div class="cart-item">
        <img src="${product.img}" alt="${product.name}" style="width:60px;border-radius:8px;">
        <div>
          <h4>${product.name}</h4>
          <p>Size: ${size}</p>
          <p>$${product.price.toFixed(2)} × ${qty}</p>
        </div>
        <div>
          <button aria-label="Increase quantity" onclick="updateQty('${id}_${size}', 1)">+</button>
          <button aria-label="Decrease quantity" onclick="updateQty('${id}_${size}', -1)">-</button>
          <button aria-label="Remove item" onclick="removeItem('${id}_${size}')">Remove</button>
        </div>
      </div>
    `;
  });
  itemsDiv.innerHTML = html || '<p>Your cart is empty.</p>';
  summaryDiv.innerHTML = `<h3>Total: $${total.toFixed(2)}</h3>`;
  document.getElementById('cart-count').textContent = Object.values(cart).reduce((a, b) => a + b, 0);
}
window.updateQty = function(key, delta) {
  const cart = getCart();
  cart[key] = (cart[key] || 0) + delta;
  if (cart[key] <= 0) delete cart[key];
  setCart(cart);
};
window.removeItem = function(key) {
  const cart = getCart();
  delete cart[key];
  setCart(cart);
};
document.getElementById('year').textContent = new Date().getFullYear();
renderCart();

document.getElementById('quickview-add').addEventListener('click', function () {
  const productId = this.dataset.id;
  const size = document.getElementById('quickview-size').value;
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  const key = `${productId}_${size}`;
  cart[key] = (cart[key] || 0) + 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  document.getElementById('cart-count').textContent = Object.values(cart).reduce((a, b) => a + b, 0);
  showToast(`Added to cart! Size: ${size}`);
  confettiBurst(document.querySelector('#quickview .modal-content'));
});
