import { useMemo } from "react";
import { RENTAL_TYPE_NAMES } from "../data/rentals.js";
import {
  formatPrice,
  getRecommendations,
  getRentalRecommendations,
} from "../lib/recommendation.js";

function shownVariant(product, colorKey) {
  const options = product.variants?.length
    ? product.variants
    : [{ colorKey: product.colorKey, color: product.color, image: product.image }];
  return options.find((option) => option.colorKey === colorKey) ?? options[0] ?? null;
}

export default function ProductDetail({ answers, productId, colorKey, onBack }) {
  const renting = answers?.mode === "rent";
  const product = useMemo(() => {
    const recommendations = renting ? getRentalRecommendations(answers) : getRecommendations(answers);
    return recommendations.find((item) => item.id === productId) ?? null;
  }, [answers, productId, renting]);
  const shown = product ? shownVariant(product, colorKey) : null;
  const why = product?.evidence ?? [];
  const reason = product && product.matchPercent != null && product.matchPercent < 80
    ? (product.tradeoffs?.length
      ? product.tradeoffs.join(" ")
      : "A partial match. It lines up on some of your answers, not every one.")
    : "";

  return (
    <section className="product-detail" aria-labelledby="product-detail-title">
      <button className="text-link product-detail-back" type="button" onClick={onBack}>
        Back to results
      </button>
      {!product && (
        <>
          <h1 id="product-detail-title">Product details</h1>
          <p className="product-detail-missing">This recommendation is not in the current results.</p>
        </>
      )}
      {product && (
        <div className="product-detail-layout">
          <div className="product-detail-photo">
            <img src={shown?.image || product.image} alt="" />
          </div>
          <div className="product-detail-copy">
            <p className="product-brand">{product.brand}</p>
            <h1 id="product-detail-title">{product.name}</h1>
            <p className="product-detail-price">
              <strong>{formatPrice(product.price)}</strong>
              {product.compareAt ? <s>{formatPrice(product.compareAt)}</s> : null}
            </p>
            <p className="product-detail-color">{shown?.color || product.color}</p>
            {renting && RENTAL_TYPE_NAMES[product.type] && (
              <p className="product-detail-meta">{RENTAL_TYPE_NAMES[product.type]}</p>
            )}
            {product.rating != null && (
              <p className="product-rating">
                <svg className="star is-on" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 1.6 12.5 7l5.9.6-4.4 3.9 1.3 5.8L10 14.6 4.7 17.3 6 11.5 1.6 7.6 7.5 7 10 1.6z" />
                </svg>
                <span>{product.rating.toFixed(1)} ({product.reviews.toLocaleString("en-US")})</span>
              </p>
            )}
            {why.length > 0 && (
              <div className="match-why">
                <p className="why-label">{renting ? "Why this look" : "Why this suit"}</p>
                <ul className="why-list">
                  {why.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {reason && <p className="match-reason">{reason}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
