"use strict";

// Cart page interactions
const $ = (selector, root = document) => root.querySelector(selector);
const Shop = window.Shop;

// Build normalized cart lines with pricing for checkout
function getCartLineItems() {
  const entries = Object.entries(Shop.getCart() || {});
  const items = [];
  let subtotal = 0;
  let quantity = 0;

  for (const [key, qty] of entries) {
    const [id, size, color] = key.split('_');
    const product = Shop.findProduct(id);
    if (!product || !qty) continue;
    const lineTotal = product.price * qty;
    subtotal += lineTotal;
    quantity += qty;
    items.push({
      id,
      name: product.name,
      price: product.price,
      qty,
      size,
      color,
      lineTotal
    });
  }

  const discount = quantity >= 3 ? subtotal * 0.15 : 0;
  const total = subtotal - discount;

  return { items, subtotal, discount, total, quantity };
}

// renderCart(): renders full cart list and summary
function renderCart() {
  const cartItems = $('#cart-items');
  const cartSummary = $('#cart-summary');
  const cartMessage = $('#cart-message');
  if (!cartItems || !cartSummary) return;

  const cart = Shop.getCart();
  const entries = Object.entries(cart);
  if (!entries.length) {
    cartItems.innerHTML = '<div class="cart-empty">Your cart is empty. Add a tee from the store to start your haul.</div>';
    cartSummary.innerHTML = '';
    if (cartMessage) cartMessage.textContent = '';
    Shop.renderMiniCart();
    Shop.updateCartCount();
    return;
  }

  let subtotal = 0;
  let quantity = 0;
  cartItems.innerHTML = entries.map(([key, qty]) => {
    const [id, size, color] = key.split('_');
    const product = Shop.findProduct(id);
    if (!product) return '';
    subtotal += product.price * qty;
    quantity += qty;
    return `
      <article class="cart-line" data-key="${key}">
        <img src="${product.img}" alt="${product.name}" loading="lazy" />
        <div>
          <h3>${product.name}</h3>
          <p class="cart-line__meta">Size ${size} - ${color}</p>
          <div class="cart-line__actions">
            <div class="qty-stepper" data-key="${key}">
              <button type="button" data-step="-1" aria-label="Decrease quantity">-</button>
              <input type="number" min="1" value="${qty}" aria-label="Quantity for ${product.name}" />
              <button type="button" data-step="1" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="btn ghost" data-remove="${key}">Remove</button>
          </div>
        </div>
        <div class="cart-line__price">${Shop.money(product.price * qty)}</div>
      </article>
    `;
  }).join('');

  const discount = quantity >= 3 ? subtotal * 0.15 : 0;
  const total = subtotal - discount;

  cartSummary.innerHTML = `
    <div class="cart-summary-card">
      <div class="summary-row"><span>Subtotal</span><span>${Shop.money(subtotal)}</span></div>
      <div class="summary-row"><span>Bundle savings</span><span>${discount ? '- ' + Shop.money(discount) : 'Add 3 tees for 15% off'}</span></div>
      <div class="summary-row"><span>Shipping</span><span>Free</span></div>
      <div class="summary-total"><span>Estimated total</span><span>${Shop.money(total)}</span></div>
      <p class="summary-note">Bundle savings unlock automatically once three tees are in your cart.</p>
      <form id="checkout-form" class="checkout-form">
        <label for="buyer-email">Email (optional, for your receipt)</label>
        <input type="email" id="buyer-email" name="buyer-email" placeholder="you@example.com" autocomplete="email" />
        <button type="submit" class="btn">Place order</button>
      </form>
    </div>
  `;

  const checkoutForm = $('#checkout-form', cartSummary);
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (event) => {
      event.preventDefault();
      onCheckout();
    });
  }

  if (cartMessage) cartMessage.textContent = '';
  Shop.renderMiniCart();
  Shop.updateCartCount();
}

// updateQuantity(): updates a line qty or removes it; toasts inline message
function updateQuantity(key, nextQty) {
  const [id] = key.split('_');
  const product = Shop.findProduct(id);
  Shop.updateCartQuantity(key, nextQty, { silent: true });
  renderCart();
  const cartMessage = $('#cart-message');
  if (!cartMessage) return;
  if (nextQty <= 0) {
    cartMessage.textContent = product ? `${product.name} removed from your cart.` : 'Item removed from your cart.';
  } else {
    cartMessage.textContent = product ? `${product.name} updated to ${nextQty} in your cart.` : 'Cart updated.';
  }
}

async function onCheckout(){
  const { items, subtotal, discount, total, quantity } = getCartLineItems();
  if (!items.length) { alert('Cart is empty'); return; }

  const email = $('#buyer-email')?.value.trim() || '';
  const cartMessage = $('#cart-message');

  // Save order in Firestore
  try {
    if (!window.FirebaseAPI || !window.FirebaseAPI.saveOrder) {
      throw new Error('Firebase not initialized');
    }
    await window.FirebaseAPI.saveOrder({
      items,
      subtotal,
      discount,
      total,
      coupon: quantity >= 3 ? 'ALUM15' : null,
      email: email || null
    });
    if (cartMessage) cartMessage.textContent = 'Order placed! We saved it to your Firebase collection.';
    // Clear cart after successful save
    Object.keys(Shop.getCart()).forEach((key) => Shop.updateCartQuantity(key, 0, { silent: true }));
    renderCart();
  } catch (e) {
    console.error('Failed to save order', e);
    const friendly = e?.message || 'Could not reach the database right now.';
    if (cartMessage) {
      cartMessage.textContent = `Order not placed: ${friendly}`;
    } else {
      alert(`Order not placed: ${friendly}`);
    }
  }

  // ...your existing confirmation UI, confetti, and localStorage cleanup
}

document.addEventListener('DOMContentLoaded', () => {
  const cartItems = $('#cart-items');
  if (!cartItems) return;

  cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const stepper = button.closest('.qty-stepper');
    if (stepper && button.dataset.step) {
      const input = stepper.querySelector('input');
      const current = Number(input.value) || 1;
      const next = Math.max(0, current + Number(button.dataset.step));
      input.value = Math.max(1, next);
      updateQuantity(stepper.dataset.key, next);
    }
    if (button.dataset.remove) {
      updateQuantity(button.dataset.remove, 0);
    }
  });

  cartItems.addEventListener('change', (event) => {
    if (event.target.matches('.qty-stepper input')) {
      const input = event.target;
      const next = Math.max(1, Number(input.value) || 1);
      input.value = next;
      updateQuantity(input.closest('.qty-stepper').dataset.key, next);
    }
  });

  renderCart();
});

