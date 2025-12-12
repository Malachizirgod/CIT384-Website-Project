const $ = (selector, root = document) => root.querySelector(selector);
const state = {
  product: null,
  reviews: []
};

// Render simple ASCII star ratings to avoid encoding issues
const renderStars = (rating = 0) => {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return "*".repeat(Math.round(r)).padEnd(5, "-");
};

function renderReviews(listEl, emptyEl, reviews = []) {
  if (!listEl || !emptyEl) return;
  if (!reviews.length) {
    listEl.innerHTML = "";
    emptyEl.style.display = "";
    emptyEl.textContent = "No reviews yet. Be the first to share.";
    return;
  }
  emptyEl.style.display = "none";
  listEl.innerHTML = reviews
    .map((review) => {
      const date = review.createdAt?.toDate?.() ? review.createdAt.toDate() : null;
      const dateStr = date ? date.toLocaleDateString() : "";
      return `
      <article class="review-card">
        <div class="review-card__header">
          <div class="review-card__rating" aria-label="Rating ${review.rating || 0} out of 5">${renderStars(review.rating)}</div>
          <div class="review-card__meta">${review.name || "Guest"}${dateStr ? ` - ${dateStr}` : ""}</div>
        </div>
        <h4 class="review-card__title">${review.title || "Untitled review"}</h4>
        <p class="review-card__body">${review.body || ""}</p>
      </article>
    `;
    })
    .join("");
}

async function loadReviews(productId) {
  const listEl = $("#reviews-list");
  const emptyEl = $("#reviews-empty");
  if (!listEl || !emptyEl) return;
  emptyEl.textContent = "Loading reviews...";
  emptyEl.style.display = "";

  if (!window.FirebaseAPI?.fetchReviews) {
    emptyEl.textContent = "Reviews are unavailable right now.";
    return;
  }

  try {
    const docs = await window.FirebaseAPI.fetchReviews(productId, 10);
    state.reviews = docs;
    renderReviews(listEl, emptyEl, docs);
  } catch (err) {
    console.error("Failed to load reviews", err);
    emptyEl.textContent = "Could not load reviews right now.";
  }
}

function bindReviewForm(product) {
  const form = $("#review-form");
  const statusEl = $("#review-status");
  if (!form || !statusEl || !product) return;
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = form["reviewer-name"].value.trim();
    const rating = Number(form.rating.value);
    const title = form["review-title"].value.trim();
    const body = form["review-body"].value.trim();

    if (!rating || rating < 1 || rating > 5) {
      statusEl.textContent = "Please select a rating.";
      statusEl.className = "form-status error";
      return;
    }

    statusEl.textContent = "Sending review...";
    statusEl.className = "form-status pending";
    submitBtn?.setAttribute("disabled", "true");
    try {
      if (!window.FirebaseAPI?.saveReview) {
        throw new Error("Reviews service unavailable");
      }
      await window.FirebaseAPI.saveReview({
        productId: product.id,
        rating,
        title: title || null,
        body: body || null,
        name: name || "Guest"
      });
      statusEl.textContent = "Thanks for sharing your review!";
      statusEl.className = "form-status success";
      form.reset();
      const newReview = { productId: product.id, rating, title, body, name: name || "Guest" };
      state.reviews = [newReview, ...state.reviews];
      renderReviews($("#reviews-list"), $("#reviews-empty"), state.reviews);
    } catch (err) {
      console.error("Review submit error", err);
      statusEl.textContent = "Could not submit review. Please try again.";
      statusEl.className = "form-status error";
    } finally {
      submitBtn?.removeAttribute("disabled");
      setTimeout(() => {
        statusEl.textContent = "";
        statusEl.className = "form-status";
      }, 4000);
    }
  });
}

function renderRecommendations(currentId) {
  const rec = $("#recommendations");
  if (!rec) return;
  const catalog = Array.isArray(window.CATALOG) ? window.CATALOG : [];
  const picks = catalog.filter((p) => p.id !== currentId).slice(0, 3);
  if (!picks.length) {
    rec.style.display = "none";
    return;
  }
  rec.innerHTML = `
    <h2>You might also like</h2>
    <div class="recommend-grid">
      ${picks
        .map(
          (p) => `
        <a class="recommend-card" href="product.html?id=${p.id}">
          <img src="${p.img}" alt="${p.name}" loading="lazy" />
          <div class="recommend-card__info">
            <div class="recommend-card__name">${p.name}</div>
            <div class="recommend-card__price">${window.Shop.money(p.price)}</div>
          </div>
        </a>
      `
        )
        .join("")}
    </div>
  `;
}

function renderProductDetail() {
  const container = $("#product-detail");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = window.Shop.findProduct(id);
  if (!product) {
    container.innerHTML = "<p class=\"cart-empty\">We couldn't find that tee. Browse the store for more vintage finds.</p>";
    return;
  }

  state.product = product;
  window.Shop.addRecent(product.id);

  const galleryImages = product.imgs && product.imgs.length ? product.imgs : [product.img];

  container.innerHTML = `
    <div class="product-page">
      <div class="product-gallery">
        <div class="product-hero">
          <img id="hero-image" src="${galleryImages[0]}" alt="${product.name}" />
        </div>
      </div>
      <div class="product-info-card">
        ${product.tag ? `<span class="product-detail__badge">${product.tag}</span>` : ""}
        <h1>${product.name}</h1>
        <div class="product-price-row">
          <p class="product-detail__price">${window.Shop.money(product.price)}</p>
          <span class="price-note">4 payments with Klarna (demo)</span>
        </div>
        <p class="product-detail__desc">${product.desc || ""}</p>
        <form class="product-detail__form" id="product-form" novalidate>
          <fieldset class="option-group">
            <legend>Select size</legend>
            <div class="size-grid" role="group" aria-label="Size options">
              ${(product.sizes || ["S", "M", "L"])
                .map(
                  (size, index) => `
                <label class="size-pill">
                  <input type="radio" name="size" value="${size}" ${index === 0 ? "checked" : ""} required>
                  <span>${size}</span>
                </label>
              `
                )
                .join("")}
            </div>
          </fieldset>

          <fieldset class="option-group">
            <legend>Color</legend>
            <div class="pill-options">
              ${(product.colors || ["Heritage Grey"])
                .map(
                  (color, index) => `
                <label class="pill">
                  <input type="radio" name="color" value="${color}" ${index === 0 ? "checked" : ""} required>
                  <span>${color}</span>
                </label>
              `
                )
                .join("")}
            </div>
          </fieldset>

          <div class="product-detail__quantity">
            <label for="quantity">Quantity</label>
            <input type="number" id="quantity" name="quantity" min="1" value="1" required>
          </div>
          <div class="product-actions">
            <button type="submit" class="btn btn-primary">Add to bag</button>
            <button type="button" class="btn ghost" id="favorite-btn">Favorite</button>
          </div>
        </form>

        <ul class="product-perks">
          <li>Free pickup options</li>
          <li>Ships free in the U.S.</li>
          <li>Easy returns within 30 days</li>
        </ul>
      </div>
    </div>

    <div class="product-accordions">
      <details open>
        <summary>Story and materials</summary>
        <p>This ${product.era || "90s-inspired"} tee is restored for modern wear, using ${product.material || "cotton blend"} with a broken-in feel.</p>
        <ul>
          <li>Condition: ${product.condition || "Excellent vintage"}</li>
          <li>Fit: ${product.fit || "Relaxed unisex"}</li>
          <li>Style code: ${product.id}</li>
        </ul>
      </details>
      <details>
        <summary>Size and fit</summary>
        <p>True to size with room through the shoulders. Size up for a slouchy alumni look.</p>
      </details>
      <details>
        <summary>Shipping and returns</summary>
        <p>Ships within 2 business days. Returns accepted within 30 days; buyer covers return shipping.</p>
      </details>
      <details>
        <summary>Care</summary>
        <p>Wash cold, inside-out. Hang dry to preserve graphics.</p>
      </details>
    </div>
  `;

  const form = $("#product-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const size = data.get("size");
      const color = data.get("color");
      const quantity = Math.max(1, Number(data.get("quantity")) || 1);
      window.Shop.addItem(product, { size, color, qty: quantity });
      window.Shop.renderMiniCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const favoriteBtn = $("#favorite-btn");
  favoriteBtn?.addEventListener("click", () => {
    if (window.Shop?.addRecent) window.Shop.addRecent(product.id);
    alert("Saved to favorites (demo).");
  });

  bindReviewForm(product);
  loadReviews(product.id);
  renderRecommendations(product.id);
}

document.addEventListener("DOMContentLoaded", renderProductDetail);
