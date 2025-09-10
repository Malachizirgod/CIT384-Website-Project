const $ = (sel, root=document) => root.querySelector(sel);
function update(){
$('#year').textContent = new Date().getFullYear();
const cart = getCart();
const items = Object.values(cart);
const count = items.reduce((s, i) => s + i.qty, 0);
$('#cart-count').textContent = count;


const list = $('#cart-items');
list.innerHTML = '';
let subtotal = 0;
if(items.length === 0){
list.innerHTML = '<p>Your cart is empty. <a href="index.html">Go shopping →</a></p>';
} else {
items.forEach(i => {
subtotal += i.price * i.qty;
const el = document.createElement('div');
el.className = 'cart-item';
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
const btn = e.target.closest('button[data-act]');
if(!btn) return;
const id = btn.dataset.id;
const act = btn.dataset.act;
const cart = getCart();
if(!cart[id]) return;
if(act === 'inc') cart[id].qty++;
if(act === 'dec') cart[id].qty = Math.max(0, cart[id].qty - 1);
if(act === 'rm') delete cart[id];
if(cart[id] && cart[id].qty === 0) delete cart[id];
setCart(cart);
}


function onCheckout(){
// Placeholder: later we will POST to PHP endpoint
alert('Checkout demo — next step is wiring to PHP backend.');
}


document.addEventListener('DOMContentLoaded', () => {
update();
$('#cart-items').addEventListener('click', onClick);
$('#checkout-btn').addEventListener('click', onCheckout);
});