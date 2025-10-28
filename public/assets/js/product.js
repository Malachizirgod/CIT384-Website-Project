const $ = (selector, root = document) => root.querySelector(selector);

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
  if (!form) return;
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

document.addEventListener('DOMContentLoaded', renderProductDetail);
