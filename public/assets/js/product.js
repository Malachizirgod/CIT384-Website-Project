const $ = (selector, root = document) => root.querySelector(selector);
const state = {
  product: null,
  reviews: []
};

const renderStars = (rating = 0) => {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return '★'.repeat(Math.round(r)).padEnd(5, '☆');
};

function renderReviews(listEl, emptyEl, reviews = []) {
  if (!listEl || !emptyEl) return;
  if (!reviews.length) {
    listEl.innerHTML = '';
    emptyEl.style.display = '';
    emptyEl.textContent = 'No reviews yet. Be the first to share.';
    return;
  }
  emptyEl.style.display = 'none';
  listEl.innerHTML = reviews.map((review) => {
    const date = review.createdAt?.toDate?.() ? review.createdAt.toDate() : null;
    const dateStr = date ? date.toLocaleDateString() : '';
    return `
      <article class="review-card">
        <div class="review-card__header">
          <div class="review-card__rating" aria-label="Rating ${review.rating || 0} out of 5">${renderStars(review.rating)}</div>
          <div class="review-card__meta">${review.name || 'Guest'} ${dateStr ? `· ${dateStr}` : ''}</div>
        </div>
        <h4 class="review-card__title">${review.title || 'Untitled review'}</h4>
        <p class="review-card__body">${review.body || ''}</p>
      </article>
    `;
  }).join('');
}

async function loadReviews(productId) {
  const listEl = $('#reviews-list');
  const emptyEl = $('#reviews-empty');
  if (!listEl || !emptyEl) return;
  emptyEl.textContent = 'Loading reviews...';
  emptyEl.style.display = '';

  if (!window.FirebaseAPI?.fetchReviews) {
    emptyEl.textContent = 'Reviews are unavailable right now.';
    return;
  }

  try {
    const docs = await window.FirebaseAPI.fetchReviews(productId, 10);
    state.reviews = docs;
    renderReviews(listEl, emptyEl, docs);
  } catch (err) {
    console.error('Failed to load reviews', err);
    emptyEl.textContent = 'Could not load reviews right now.';
  }
}

function bindReviewForm(product) {
  const form = $('#review-form');
  const statusEl = $('#review-status');
  if (!form || !statusEl || !product) return;
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = form['reviewer-name'].value.trim();
    const rating = Number(form.rating.value);
    const title = form['review-title'].value.trim();
    const body = form['review-body'].value.trim();

    if (!rating || rating < 1 || rating > 5) {
      statusEl.textContent = 'Please select a rating.';
      statusEl.className = 'form-status error';
      return;
    }

    statusEl.textContent = 'Sending review...';
    statusEl.className = 'form-status pending';
    submitBtn?.setAttribute('disabled', 'true');
    try {
      if (!window.FirebaseAPI?.saveReview) {
        throw new Error('Reviews service unavailable');
      }
      await window.FirebaseAPI.saveReview({
        productId: product.id,
        rating,
        title: title || null,
        body: body || null,
        name: name || 'Guest'
      });
      statusEl.textContent = 'Thanks for sharing your review!';
      statusEl.className = 'form-status success';
      form.reset();
      // Prepend the new review to the list locally
      const newReview = { productId: product.id, rating, title, body, name: name || 'Guest' };
      state.reviews = [newReview, ...state.reviews];
      renderReviews($('#reviews-list'), $('#reviews-empty'), state.reviews);
    } catch (err) {
      console.error('Review submit error', err);
      statusEl.textContent = 'Could not submit review. Please try again.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn?.removeAttribute('disabled');
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
      }, 4000);
    }
  });
}

function renderProductDetail() {
  const container = $('#product-detail');
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = window.Shop.findProduct(id);
  if (!product) {
    container.innerHTML = '<p class="cart-empty">We couldn\'t find that tee. Browse the store for more vintage finds.</p>';
    return;
  }

  state.product = product;

  // Mark this product as recently viewed so it appears on the homepage list
  window.Shop.addRecent(product.id);

  const galleryImages = product.imgs && product.imgs.length ? product.imgs : [product.img];

  container.innerHTML = `
    <div class="product-detail__gallery">
      ${galleryImages.map((src, index) => `<img src="${src}" alt="${product.name} vintage tee image ${index + 1}" />`).join('')}
    </div>
    <div class="product-detail__info">
      ${product.tag ? `<span class="product-detail__badge">${product.tag}</span>` : ''}
      <h1>${product.name}</h1>
      <p class="product-detail__price">${window.Shop.money(product.price)}</p>
      <p class="product-detail__desc">${product.desc || ''}</p>
      <ul class="support-faq" aria-label="Product details">
        <li><strong>Era:</strong> ${product.era || '1990s classic'}</li>
        <li><strong>Condition:</strong> ${product.condition || 'Excellent vintage'}</li>
        <li><strong>Material:</strong> ${product.material || 'Cotton blend'}</li>
        <li><strong>Fit:</strong> ${product.fit || 'Relaxed unisex'}</li>
      </ul>
      <form class="product-detail__form" id="product-form" novalidate>
        <fieldset class="option-group">
          <legend>Choose your size</legend>
          <div class="pill-options">
            ${(product.sizes || ['S','M','L']).map((size, index) => `
              <div>
                <input type="radio" name="size" id="size-${size}" value="${size}" ${index === 0 ? 'checked' : ''} required>
                <label for="size-${size}">${size}</label>
              </div>
            `).join('')}
          </div>
        </fieldset>
        <fieldset class="option-group">
          <legend>Pick a wash</legend>
          <div class="pill-options">
            ${(product.colors || ['Heritage Grey']).map((color, index) => `
              <div>
                <input type="radio" name="color" id="color-${index}" value="${color}" ${index === 0 ? 'checked' : ''} required>
                <label for="color-${index}">${color}</label>
              </div>
            `).join('')}
          </div>
        </fieldset>
        <div class="product-detail__quantity">
          <label for="quantity">Quantity</label>
          <input type="number" id="quantity" name="quantity" min="1" value="1" required>
        </div>
        <button type="submit" class="btn">Add to cart</button>
      </form>
    </div>
  `;

  const form = $('#product-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const size = data.get('size');
      const color = data.get('color');
      const quantity = Math.max(1, Number(data.get('quantity')) || 1);
      window.Shop.addItem(product, { size, color, qty: quantity });
      window.Shop.renderMiniCart();
    });
  }

  bindReviewForm(product);
  loadReviews(product.id);
}

document.addEventListener('DOMContentLoaded', renderProductDetail);
