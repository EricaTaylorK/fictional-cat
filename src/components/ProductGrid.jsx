import { COLORS, PROMO_BADGES, SUIT_IMAGES } from "../data/catalog.js";
import { money } from "../filters.js";

export default function ProductGrid({ products, onClear }) {
  if (products.length === 0) {
    return (
      <div className="empty">
        <p>No suits match these filters.</p>
        <button type="button" onClick={onClear}>
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <ul className="grid">
      {products.map((product) => (
        <li key={product.id}>
          <article className="card" data-testid="product-card">
            <div className="card-media">
              <img
                src={product.imageUrl || SUIT_IMAGES[product.image] || SUIT_IMAGES.navy}
                alt=""
                loading="lazy"
              />
              {product.promos[0] && <span className="badge">{PROMO_BADGES[product.promos[0]]}</span>}
            </div>
            <div className="card-copy">
              <p className="price-line">
                <span className="price">{money(product.price)}</span>
                {product.compareAt && <span className="compare">{money(product.compareAt)}</span>}
              </p>
              <div className="swatches">
                {product.colors.map((colorId, index) => (
                  <span
                    key={colorId}
                    className={index === 0 ? "swatch is-selected" : "swatch"}
                    title={COLORS[colorId].label}
                  >
                    <span style={{ background: COLORS[colorId].hex }} />
                  </span>
                ))}
              </div>
              <h2 className="brand">{product.brandName}</h2>
              <p className="name">{product.name}</p>
              <p className="rating">
                <Star />
                <span>
                  {product.rating.toFixed(1)} ({product.reviews})
                </span>
              </p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

function Star() {
  return (
    <svg className="star" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="#747474"
        d="M10 1.6 12.5 7l5.9.6-4.4 3.9 1.3 5.8L10 14.6 4.7 17.3 6 11.5 1.6 7.6 7.5 7 10 1.6z"
      />
    </svg>
  );
}
