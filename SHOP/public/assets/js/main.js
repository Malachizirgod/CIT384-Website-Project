const $ = (sel, root=document) => root.querySelector(sel);
function money(n){ return `$${n.toFixed(2)}`; }


function renderProducts(){
const grid = $('#products');
grid.innerHTML = '';
window.CATALOG.forEach(p => {
const card = document.createElement('article');
card.className = 'card';
card.innerHTML = `
<img src="${p.img}" alt="${p.name}" loading="lazy" />
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
const btn = e.target.closest('button[data-id]');
if(!btn) return;
const id = btn.dataset.id;
const p = window.CATALOG.find(x => x.id === id);
if (!p) return;
const cart = getCart();
cart[id] = cart[id] || { id, name: p.name, price: p.price, qty: 0 };
cart[id].qty++;
setCart(cart);
});
}


function boot(){
$('#year').textContent = new Date().getFullYear();
updateCartCount();
renderProducts();
}


document.addEventListener('DOMContentLoaded', boot);