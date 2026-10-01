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
              <img src={SUIT_IMAGES[product.image]} alt="" />
              {product.promos[0] && <span className="badge">{PROMO_BADGES[product.promos[0]]}</span>}
            </div>
            <p className="brand">{product.brandName}</p>
            <h2 className="name">{product.name}</h2>
            <p className="price-line">
              <span className={product.compareAt ? "price sale" : "price"}>{money(product.price)}</span>
              {product.compareAt && <span className="compare">{money(product.compareAt)}</span>}
            </p>
            <Stars rating={product.rating} reviews={product.reviews} uid={product.id} />
            <div className="swatches">
              {product.colors.map((colorId) => (
                <span
                  key={colorId}
                  className="swatch"
                  style={{ background: COLORS[colorId].hex }}
                  title={COLORS[colorId].label}
                />
              ))}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

function Stars({ rating, reviews, uid }) {
  return (
    <p className="rating">
      <span className="stars" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((index) => {
          const fill = Math.max(0, Math.min(1, rating - (index - 1)));
          const id = `${uid}-star-${index}`;
          return (
            <svg key={index} viewBox="0 0 20 20" className="star" aria-hidden="true">
              <defs>
                <linearGradient id={id}>
                  <stop offset={`${fill * 100}%`} stopColor="#3A3A3A" />
                  <stop offset={`${fill * 100}%`} stopColor="#d5d5d5" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#${id})`}
                d="M10 1.6 12.5 7l5.9.6-4.4 3.9 1.3 5.8L10 14.6 4.7 17.3 6 11.5 1.6 7.6 7.5 7 10 1.6z"
              />
            </svg>
          );
        })}
      </span>
      <span className="reviews">({reviews})</span>
    </p>
  );
}
