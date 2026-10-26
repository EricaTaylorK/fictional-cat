import { Fragment, useMemo, useState } from "react";
import { FIT_DESCRIPTIONS, OUTFIT_PAIRINGS, SWATCH_HEX, TAILORING_TURNAROUND } from "../data/products.js";
import { buildResultSummary, describeSize, formatPrice, getRecommendations } from "../lib/recommendation.js";
import TextInput from "./TextInput.jsx";

const tailoringPackages = [
  {
    id: "essentials",
    name: "Fit Essentials",
    plain: "Hem and sleeves",
    price: 55,
    icon: "/icons/product_size.svg",
    detail: "We'll hem the pants and set the sleeve length for a clean, finished look.",
  },
  {
    id: "signature",
    name: "Signature Fit",
    plain: "Jacket and waist",
    price: 100,
    icon: "/icons/product_modernfit.svg",
    detail: "Everything in Essentials, plus we shape the jacket and waist so it looks sharper.",
  },
  {
    id: "custom",
    name: "Custom-Level Fit",
    plain: "A full reshape",
    price: 150,
    icon: "/icons/product_hanger.svg",
    detail: "Our most complete tailoring: refined lines, cleaner drape, and a made-for-you shape.",
  },
];

const outfitOptions = [
  { id: "shirt", summaryLabel: "Dress shirt", name: "Slim Fit White Dress Shirt", price: 59.99, image: "/outfit/white-dress-shirt.jpg" },
  { id: "tie", summaryLabel: "Tie", name: "Solid Navy Textured Tie", price: 49.99, image: "/outfit/navy-tie.jpg" },
  { id: "shoes", summaryLabel: "Dress shoes", name: "Black Cap-Toe Oxfords", price: 119.99, image: "/outfit/black-dress-shoes.jpg" },
];

function variantOptions(product) {
  if (product.variants?.length) return product.variants;
  return [{ colorKey: product.colorKey, color: product.color, image: product.image }];
}

function defaultVariantIndex(product, answers) {
  const options = variantOptions(product);
  const prefer = answers.colors?.prefer ?? [];
  const avoid = new Set(answers.colors?.avoid ?? []);
  const preferred = options.findIndex((item) => prefer.includes(item.colorKey));
  if (preferred >= 0) return preferred;
  const allowed = options.findIndex((item) => !avoid.has(item.colorKey));
  return Math.max(0, allowed);
}

function rankLabel(index) {
  if (index === 0) return "Best match";
  if (index === 1) return "2nd match";
  if (index === 2) return "3rd match";
  return `${index + 1}th match`;
}

function Stars({ value }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={star <= rounded ? "star is-on" : "star"} viewBox="0 0 20 20">
          <path d="M10 1.6 12.5 7l5.9.6-4.4 3.9 1.3 5.8L10 14.6 4.7 17.3 6 11.5 1.6 7.6 7.5 7 10 1.6z" />
        </svg>
      ))}
    </span>
  );
}

const RING_RADIUS = 34;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function MatchRing({ percent }) {
  return (
    <div className="match-ring" role="img" aria-label={`${percent}% match`}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle className="match-ring-track" cx="40" cy="40" r={RING_RADIUS} />
        <circle
          className="match-ring-fill"
          cx="40"
          cy="40"
          r={RING_RADIUS}
          strokeDasharray={RING_LENGTH}
          style={{ "--ring-offset": RING_LENGTH * (1 - percent / 100), "--ring-length": RING_LENGTH }}
        />
      </svg>
      <span className="match-ring-value" aria-hidden="true">
        <span className="match-ring-figure">{percent}<small>%</small></span>
        <span className="match-ring-label">match</span>
      </span>
    </div>
  );
}

function matchTone(percent) {
  return percent >= 90 ? "best" : "mid";
}

function SuitOption({ product, size, selected, onSelect, rank, shown, options, variantIndex, onVariant, avoided }) {
  return (
    <label className={`suit-option${selected ? " suit-option-selected" : ""}`}>
      <input
        className="suit-radio"
        type="radio"
        name="recommended-suit"
        value={product.id}
        checked={selected}
        onChange={() => onSelect(product.id)}
      />
      <div className="product-image">
        <img src={shown.image} alt="" />
      </div>
      <div className="suit-option-body">
        <p className="rank-label">{rankLabel(rank)}</p>
        <span className={`match-score match-score-${matchTone(product.matchPercent)}`}>{product.matchPercent}% match</span>
        <p className="product-brand">{product.brand}</p>
        <h3 className="product-title">{product.name}</h3>
        {product.rating != null && (
          <p className="product-rating">
            <Stars value={product.rating} />
            <span>{product.rating.toFixed(1)} ({product.reviews.toLocaleString("en-US")})</span>
          </p>
        )}
        <p className="product-price">
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
        </p>
        <p className="product-fit">{product.fitName}. {FIT_DESCRIPTIONS[product.fit]}</p>
        <p className="product-meta">{[shown.color, product.fabric].filter(Boolean).join(" · ")}</p>
        {describeSize(size) && <p className="product-meta">{describeSize(size)}</p>}
        {options.length > 1 && (
          <div className="color-swatches" role="group" aria-label="Other colors">
            {options.map((option, index) => (
              <button
                key={option.color}
                type="button"
                className={index === variantIndex ? "color-swatch is-selected" : "color-swatch"}
                aria-label={option.color}
                aria-pressed={index === variantIndex}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onVariant(index);
                }}
              >
                <span style={{ background: SWATCH_HEX[option.colorKey] ?? "#888" }} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="suit-panel">
        <h4 className="reason-title">Why it's a strong pick</h4>
        <ul className="reason-list">
          {product.evidence.slice(0, 3).map((reason) => (
            <li key={reason}>
              <svg className="reason-check" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path fill="currentColor" d="M6.3 12.2 1.8 7.7l1.2-1.2 3.3 3.3 6.7-6.7 1.2 1.2-7.9 7.9Z" />
              </svg>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
        {(product.tradeoffs?.length > 0 || avoided) && (
          <>
            <h4 className="reason-title tradeoff-title">Trade-offs</h4>
            <ul className="tradeoff-list">
              {product.tradeoffs?.map((note) => <li key={note}>{note}</li>)}
              {avoided && <li>You asked to skip {shown.color.toLowerCase()}.</li>}
            </ul>
          </>
        )}
      </div>
    </label>
  );
}

export default function Results({ answers, moreMode = "toggle", onSeeAll, onEditAnswers }) {
  const recommendations = useMemo(() => getRecommendations(answers), [answers]);
  const summary = useMemo(() => buildResultSummary(answers), [answers]);
  const recommendedTailoring = tailoringPackages.find((item) => item.id === summary.tailoring.id);
  const [selectedId, setSelectedId] = useState(recommendations[0].id);
  const [expanded, setExpanded] = useState(false);
  const [variantIndexes, setVariantIndexes] = useState({});
  const [tailoringId, setTailoringId] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [handoff, setHandoff] = useState("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const selected = recommendations.find((product) => product.id === selectedId);
  const size = summary.sizeEstimate;
  const tailoring = tailoringPackages.find((item) => item.id === tailoringId);
  const extras = outfitOptions.filter((item) => selectedExtras.includes(item.id));
  const savings = selected?.compareAt ? selected.compareAt - selected.price : 0;
  const subtotal = selected
    ? (selected.compareAt ?? selected.price) + (tailoring?.price ?? 0) + extras.reduce((sum, item) => sum + item.price, 0)
    : 0;
  const total = subtotal - savings;
  const itemCount = selected ? 2 + extras.length + (tailoring ? 1 : 0) : 0;
  const basedOn = [summary.occasion, summary.fitName, summary.colors?.join(", "), ...summary.fitNotes].filter(Boolean).join(" · ");
  const visibleCount = expanded ? Math.min(recommendations.length, 9) : Math.min(3, recommendations.length);
  const shownRecommendations = recommendations.slice(0, visibleCount);
  const missIndex = recommendations.budgetMiss
    ? shownRecommendations.findIndex((product) => !product.inBudget)
    : -1;
  const selectedOptions = selected ? variantOptions(selected) : [];
  const selectedVariant = selected
    ? selectedOptions[variantIndexes[selected.id] ?? defaultVariantIndex(selected, answers)]
    : null;
  const pairing = selectedVariant ? OUTFIT_PAIRINGS[selectedVariant.colorKey] : null;
  const suitCount = Math.min(3, recommendations.length);
  const countLabel = suitCount === 1 ? "One suit" : suitCount === 2 ? "Two suits" : "Three suits";

  function toggleExtra(id) {
    setSelectedExtras((current) => (current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]));
  }

  function handleEmail(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setEmailSent(true);
  }

  return (
    <div className="results-layout">
      <section className="results-main" aria-labelledby="results-title">
        <div className="results-hero">
          <MatchRing percent={recommendations[0].matchPercent} />
          <div className="results-hero-copy">
            <h1 id="results-title">We found your suit.</h1>
            <p className="results-lede">
              {countLabel} for {summary.occasion}, in a {summary.fitName}. Your best match is selected.
            </p>
            <p className="based-on">
              Based on: {basedOn}{" "}
              <button className="text-link" type="button" onClick={onEditAnswers}>Edit answers</button>
            </p>
          </div>
          <ul className="fit-stats">
            <li className="fit-stat">
              <img src="/icons/product_modernfit.svg" alt="" />
              <span className="fit-stat-label">Jacket</span>
              <strong>{size.jacket ?? `${size.length} (${size.lengthCode})`}</strong>
              {size.jacket && (
                <span className="fit-stat-hint">{size.jacket.replace(/[SRL]$/i, "")} chest, {size.length.toLowerCase()} length</span>
              )}
            </li>
            <li className="fit-stat">
              <img src="/icons/product_size.svg" alt="" />
              <span className="fit-stat-label">Pants</span>
              <strong>{size.pants ?? "Measured in store"}</strong>
              {size.pants && <span className="fit-stat-hint">{size.pants.replace(/W$/i, "")}-inch waist</span>}
            </li>
            <li className="fit-stat">
              <img src="/icons/product_hanger.svg" alt="" />
              <span className="fit-stat-label">Suggested tailoring</span>
              <strong>{recommendedTailoring?.plain}</strong>
            </li>
          </ul>
        </div>

        <div className="suit-options" role="radiogroup" aria-labelledby="results-title">
          {shownRecommendations.map((product, index) => {
            const options = variantOptions(product);
            const variantIndex = variantIndexes[product.id] ?? defaultVariantIndex(product, answers);
            const shown = options[variantIndex] ?? options[0];
            const avoided = (answers.colors?.avoid ?? []).includes(shown.colorKey);
            return (
              <Fragment key={product.id}>
                {index === missIndex && (
                  <p className="budget-miss">{recommendations.budgetMiss.label}</p>
                )}
                <SuitOption
                  product={product}
                  size={size}
                  selected={product.id === selectedId}
                  onSelect={setSelectedId}
                  rank={index}
                  shown={shown}
                  options={options}
                  variantIndex={variantIndex}
                  avoided={avoided}
                  onVariant={(next) => setVariantIndexes((current) => ({ ...current, [product.id]: next }))}
                />
              </Fragment>
            );
          })}
        </div>
        {moreMode === "toggle" && recommendations.length > 3 && (
          <button className="button secondary more-matches" type="button" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "View less" : `View more matches (${Math.min(6, recommendations.length - 3)})`}
          </button>
        )}
        {moreMode === "link" && (
          <button className="button secondary more-matches" type="button" onClick={onSeeAll}>
            See all quiz matches
          </button>
        )}

        {selected && (
          <div className="results-card">
            <section className="card-section" aria-labelledby="tailoring-title">
              <h2 id="tailoring-title" className="section-title">
                <img src="/icons/product_size.svg" alt="" />
                Make it a perfect fit
              </h2>
              <p className="section-copy">
                For the {selected.brand} {selected.name}. {summary.tailoring.because}
              </p>
              <div className="tier-list" role="radiogroup" aria-labelledby="tailoring-title">
                {[...tailoringPackages, {
                  id: "none",
                  name: "No tailoring for now",
                  price: 0,
                  detail: "Take the suit as it is. You can add tailoring in store later.",
                }].map((option) => (
                  <label className="tier" key={option.id}>
                    <input
                      className="tier-radio"
                      type="radio"
                      name="tailoring-package"
                      value={option.id}
                      checked={tailoringId === option.id}
                      onChange={() => setTailoringId(option.id)}
                    />
                    <span className="tier-copy">
                      <span className="tier-name">
                        {option.name}
                        {option.id === summary.tailoring.id && <span className="tier-tag">Our pick for you</span>}
                      </span>
                      <span className="tier-detail">
                        {option.detail}
                        {TAILORING_TURNAROUND[option.id] ? ` Ready in about ${TAILORING_TURNAROUND[option.id]} days.` : ""}
                      </span>
                      <span className="tier-total">
                        {option.price
                          ? `${formatPrice(selected.price + option.price)} with this suit`
                          : `${formatPrice(selected.price)}, suit only`}
                      </span>
                    </span>
                    <span className="tier-price">{option.price ? `+${formatPrice(option.price)}` : "$0"}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="card-section" aria-labelledby="outfit-title">
              <h2 id="outfit-title" className="section-title">What to wear with it</h2>
              {pairing && (
                <p className="section-copy">
                  With this {selectedVariant.color.toLowerCase()} suit: a {pairing.shirt.toLowerCase()}, and a {pairing.tie.toLowerCase()}.
                </p>
              )}
              <p className="section-copy">Optional pieces, picked to match this suit and the occasion.</p>
              <div className="outfit-grid">
                {outfitOptions.map((item) => (
                  <label className="outfit-item" key={item.id}>
                    <span className="outfit-image">
                      <img src={item.image} alt="" />
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(item.id)}
                        onChange={() => toggleExtra(item.id)}
                      />
                    </span>
                    <span className="outfit-name">{item.name}</span>
                    <span className="outfit-price">{formatPrice(item.price)}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>

      <aside className="order-summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Order summary</h2>
        {!selected && <p className="summary-empty">Select a suit to see your total.</p>}
        {selected && (
          <>
            {savings > 0 && <p className="promo-strip">Sale price applied: you save {formatPrice(savings)}</p>}
            <p className="summary-suit">{selected.brand} {selected.name}</p>
            <ul className="summary-lines">
              <li>
                <span>Jacket{size.jacket ? ` · ${size.jacket}` : size.length ? ` · ${size.length} (${size.lengthCode})` : ""}</span>
                <span className="summary-amount">
                  {selected.jacket.compareAt && <s>{formatPrice(selected.jacket.compareAt)}</s>}
                  {formatPrice(selected.jacket.price)}
                </span>
              </li>
              <li>
                <span>Pants{size.pants ? ` · ${size.pants}` : ""}</span>
                <span className="summary-amount">
                  {selected.pants.compareAt && <s>{formatPrice(selected.pants.compareAt)}</s>}
                  {formatPrice(selected.pants.price)}
                </span>
              </li>
              {tailoring && (
                <li>
                  <span>{tailoring.name}</span>
                  <span className="summary-amount">{formatPrice(tailoring.price)}</span>
                </li>
              )}
              {extras.map((item) => (
                <li key={item.id}>
                  <span>{item.summaryLabel}</span>
                  <span className="summary-amount">{formatPrice(item.price)}</span>
                </li>
              ))}
            </ul>
            <ul className="summary-lines summary-totals">
              <li><span>Subtotal ({itemCount} items)</span><span className="summary-amount">{formatPrice(subtotal)}</span></li>
              {savings > 0 && (
                <li className="summary-promo"><span>Suit sale</span><span className="summary-amount">-{formatPrice(savings)}</span></li>
              )}
              <li className="summary-grand"><span>Grand total</span><span className="summary-amount">{formatPrice(total)}</span></li>
            </ul>
          </>
        )}
        <button className="button button-block" type="button" disabled={!selected} onClick={() => setHandoff("checkout")}>
          Checkout
        </button>
        {handoff === "checkout" && (
          <p className="handoff-inline" role="status">
            Prototype: this would add the suit in your sizes{tailoring ? ", the tailoring," : ""} and the add-ons to your bag.
          </p>
        )}
        <p className="summary-note">Shipping and tax calculated at checkout.</p>
        {tailoring && <p className="summary-note">Tailoring is finished in store after checkout.</p>}
        <button className="text-link try-on" type="button" onClick={() => setHandoff("tryon")}>
          Try it on at a store near you
        </button>
        {handoff === "tryon" && (
          <p className="handoff-inline" role="status">Prototype: this would open nearby stores with this suit in your size.</p>
        )}
      </aside>

      <div className="results-extra">
        {summary.needsMeasurementHelp && (
          <aside className="confidence-callout">
            <img src="/icons/content_store.svg" alt="" />
            <div>
              <h2>Want to be sure of the size?</h2>
              <p>
                Your answers point to a strong starting suit. A free in-store measurement catches the
                details a quiz can't, so you leave knowing it fits.
              </p>
              <button className="text-link" type="button" onClick={() => setHandoff("appointment")}>
                Book a free measurement
              </button>
              {handoff === "appointment" && (
                <p className="handoff-inline" role="status">Prototype: this would open nearby stores and times.</p>
              )}
            </div>
          </aside>
        )}

        <aside className="email-box">
          <h2>Send these results</h2>
          <p>Email your suits, sizes, and prices to yourself, or to someone helping you decide.</p>
          {emailSent ? (
            <p className="success-note" role="status">Sent to {email}. Prototype: a real experience would email the results now.</p>
          ) : (
            <form className="inline-form" onSubmit={handleEmail}>
              <TextInput
                label="Email address"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                required
              />
              <button className="button button-field" type="submit">Send</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
