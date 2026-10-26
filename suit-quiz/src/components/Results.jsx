import { Fragment, useMemo, useState } from "react";
import {
  FIT_DESCRIPTIONS,
  OUTFIT_PAIRINGS,
  SWATCH_HEX,
  TAILORING_PERKS,
  TAILORING_TIERS,
  TAILORING_TURNAROUND,
} from "../data/products.js";
import { RENTAL_FEE, RENTAL_PIECES, RENTAL_STEPS, RENTAL_TYPE_NAMES } from "../data/rentals.js";
import {
  buildResultSummary,
  describeSize,
  formatDate,
  formatPrice,
  getRecommendations,
  getRentalRecommendations,
  rentalTotal,
} from "../lib/recommendation.js";
import TextInput from "./TextInput.jsx";

const outfitOptions = [
  { id: "shirt", summaryLabel: "Dress shirt", name: "Slim Fit White Dress Shirt", price: 59.99, image: "/outfit/white-dress-shirt.jpg" },
  { id: "tie", summaryLabel: "Tie", name: "Solid Navy Textured Tie", price: 49.99, image: "/outfit/navy-tie.jpg" },
  { id: "shoes", summaryLabel: "Dress shoes", name: "Black Cap-Toe Oxfords", price: 119.99, image: "/outfit/black-dress-shoes.jpg" },
];

const CHECK_PATH = "M6.3 12.2 1.8 7.7l1.2-1.2 3.3 3.3 6.7-6.7 1.2 1.2-7.9 7.9Z";

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

function SuitOption({ product, size, selected, onSelect, rank, shown, options, variantIndex, onVariant, avoided, rentPrice }) {
  const renting = rentPrice != null;
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
        {renting ? (
          <>
            <p className="product-price">
              <strong>{formatPrice(rentPrice)}</strong>
              <span className="rent-label">to rent</span>
            </p>
            <p className="product-meta">+{formatPrice(RENTAL_FEE)} damage and handling fee</p>
            <p className="product-fit">{RENTAL_TYPE_NAMES[product.type]}. Your sizes are set at the fitting.</p>
            <p className="product-meta">{shown.color}</p>
          </>
        ) : (
          <>
            <p className="product-price">
              <strong>{formatPrice(product.price)}</strong>
              {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
            </p>
            <p className="product-fit">{product.fitName}. {FIT_DESCRIPTIONS[product.fit]}</p>
            <p className="product-meta">{[shown.color, product.fabric].filter(Boolean).join(" · ")}</p>
            {describeSize(size) && <p className="product-meta">{describeSize(size)}</p>}
          </>
        )}
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
                <path fill="currentColor" d={CHECK_PATH} />
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

function EmailResults() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  }

  if (sent) {
    return <p className="success-note email-sent" role="status">Sent to {email}. Prototype: a real experience would email the results now.</p>;
  }

  return (
    <div className="email-results">
      <button
        className="button secondary button-block"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Email me my results
      </button>
      {open && (
        <form className="email-form" onSubmit={handleSubmit}>
          <p className="summary-note">Your picks, sizes, and prices, for you or someone helping you decide.</p>
          <TextInput
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            required
          />
          <button className="button button-block" type="submit">Send</button>
        </form>
      )}
    </div>
  );
}

function rentalStepDetail(stepId, dates) {
  const ready = dates && !dates.past ? formatDate(dates.ready) : null;
  const event = dates && !dates.past ? formatDate(dates.event) : null;
  const returnBy = dates && !dates.past ? formatDate(dates.returnBy) : null;
  switch (stepId) {
    case "reserve":
      return event ? `Check out today to hold this look for ${event}.` : "Check out to hold this look for your event.";
    case "fitted":
      return "Book a free fitting. We measure you and confirm every size.";
    case "pickup":
      return ready ? `Ready ${ready} for pickup in store, or delivered to your door.` : "Ready 3–4 days before your event, in store or delivered.";
    case "return":
      return returnBy ? `Return it ${returnBy}, in store or by mail.` : "Return it the day after your event, in store or by mail.";
    default:
      return "";
  }
}

function HowToRent({ dates }) {
  return (
    <ol className="rent-steps">
      {RENTAL_STEPS.map((step, index) => (
        <li className="rent-step" key={step.id}>
          <img src={step.icon} alt="" />
          <span className="rent-step-number">Step {index + 1}</span>
          <strong>{step.title}</strong>
          <span className="rent-step-detail">{rentalStepDetail(step.id, dates)}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Results({ answers, moreMode = "toggle", onSeeAll, onEditAnswers, onRetake }) {
  const renting = answers.mode === "rent";
  const recommendations = useMemo(
    () => (renting ? getRentalRecommendations(answers) : getRecommendations(answers)),
    [answers, renting],
  );
  const summary = useMemo(() => buildResultSummary(answers), [answers]);
  const recommendedTailoring = TAILORING_TIERS.find((item) => item.id === summary.tailoring.id);
  const [selectedId, setSelectedId] = useState(recommendations[0].id);
  const [expanded, setExpanded] = useState(false);
  const [variantIndexes, setVariantIndexes] = useState({});
  const [tailoringId, setTailoringId] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [pieceIds, setPieceIds] = useState(answers.pieces ?? []);
  const [handoff, setHandoff] = useState("");

  const selected = recommendations.find((product) => product.id === selectedId);
  const size = summary.sizeEstimate;
  const dates = summary.dates;
  const pieces = RENTAL_PIECES.filter((piece) => pieceIds.includes(piece.id));
  const tailoring = TAILORING_TIERS.find((item) => item.id === tailoringId);
  const extras = outfitOptions.filter((item) => selectedExtras.includes(item.id));
  const savings = !renting && selected?.compareAt ? selected.compareAt - selected.price : 0;
  const rentSubtotal = renting && selected ? rentalTotal(selected, pieces) : 0;
  const subtotal = renting
    ? rentSubtotal + RENTAL_FEE
    : selected
      ? (selected.compareAt ?? selected.price) + (tailoring?.price ?? 0) + extras.reduce((sum, item) => sum + item.price, 0)
      : 0;
  const total = subtotal - savings;
  const itemCount = renting
    ? 2 + pieces.length
    : selected ? 2 + extras.length + (tailoring ? 1 : 0) : 0;
  const basedOn = [
    summary.occasion,
    renting && dates && !dates.past ? formatDate(dates.event) : null,
    summary.fitName,
    summary.colors?.join(", "),
    ...summary.fitNotes,
  ].filter(Boolean).join(" · ");
  const visibleCount = expanded ? Math.min(recommendations.length, 9) : Math.min(3, recommendations.length);
  const shownRecommendations = recommendations.slice(0, visibleCount);
  const missIndex = recommendations.budgetMiss
    ? shownRecommendations.findIndex((product) => !product.inBudget)
    : -1;
  const selectedOptions = selected ? variantOptions(selected) : [];
  const selectedVariant = selected
    ? selectedOptions[variantIndexes[selected.id] ?? defaultVariantIndex(selected, answers)]
    : null;
  const pairing = !renting && selectedVariant ? OUTFIT_PAIRINGS[selectedVariant.colorKey] : null;
  const pickCount = Math.min(3, recommendations.length);
  const noun = renting ? "look" : "suit";
  const countLabel = `${["One", "Two", "Three"][pickCount - 1]} ${pickCount === 1 ? noun : `${noun}s`}`;

  function toggleExtra(id) {
    setSelectedExtras((current) => (current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]));
  }

  function togglePiece(id) {
    setPieceIds((current) => (current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]));
  }

  return (
    <div className="results-layout">
      <section className="results-main" aria-labelledby="results-title">
        <div className="results-hero">
          <MatchRing percent={recommendations[0].matchPercent} />
          <div className="results-hero-copy">
            <h1 id="results-title">{renting ? "We found your look." : "We found your suit."}</h1>
            <p className="results-lede">
              {countLabel} to {renting ? "rent" : "buy"} for {summary.occasion}, in a {summary.fitName}. Your best match is selected.
            </p>
            <p className="based-on">Based on: {basedOn}</p>
          </div>
          <div className="hero-actions">
            <button className="button secondary retake-button" type="button" onClick={onRetake}>Retake quiz</button>
            <button className="button secondary" type="button" onClick={onEditAnswers}>Edit answers</button>
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
            {renting ? (
              <li className="fit-stat">
                <img src="/icons/mw/in-store-pickup.png" alt="" />
                <span className="fit-stat-label">Ready for pickup</span>
                <strong>{dates && !dates.past ? formatDate(dates.ready) : "3–4 days before"}</strong>
                {dates && !dates.past && <span className="fit-stat-hint">Return by {formatDate(dates.returnBy)}</span>}
              </li>
            ) : (
              <li className="fit-stat">
                <img src={recommendedTailoring?.icon ?? "/icons/product_hanger.svg"} alt="" />
                <span className="fit-stat-label">Suggested tailoring</span>
                <strong>{recommendedTailoring?.plain}</strong>
                {recommendedTailoring && <span className="fit-stat-hint">+{formatPrice(recommendedTailoring.price)}</span>}
              </li>
            )}
          </ul>
        </div>

        <div className="suit-options" role="radiogroup" aria-labelledby="results-title">
          {shownRecommendations.map((product, index) => {
            const options = renting ? [{ color: product.color, colorKey: product.colorKey, image: product.image }] : variantOptions(product);
            const variantIndex = renting ? 0 : variantIndexes[product.id] ?? defaultVariantIndex(product, answers);
            const shown = options[variantIndex] ?? options[0];
            const avoided = !renting && (answers.colors?.avoid ?? []).includes(shown.colorKey);
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
                  rentPrice={renting ? rentalTotal(product, pieces) : undefined}
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
        {moreMode === "link" && !renting && (
          <button className="button secondary more-matches" type="button" onClick={onSeeAll}>
            See all quiz matches
          </button>
        )}

        {selected && renting && (
          <div className="results-card">
            <section className="card-section" aria-labelledby="rent-steps-title">
              <h2 id="rent-steps-title" className="section-title">How to rent</h2>
              <HowToRent dates={dates} />
              {dates?.tooSoon && (
                <p className="date-warning">
                  Your event is less than 4 days away. Call or visit a store to make sure this look is ready in time.
                </p>
              )}
            </section>

            <section className="card-section" aria-labelledby="pieces-title">
              <h2 id="pieces-title" className="section-title">Included in this look</h2>
              <p className="section-copy">
                The jacket and pants come with every rental. Add or remove pieces, and the price updates.
              </p>
              <div className="piece-list">
                <label className="piece piece-locked">
                  <input type="checkbox" checked disabled />
                  <img src="/icons/mw/suits-bundle.png" alt="" />
                  <span className="piece-name">Jacket and pants</span>
                  <span className="piece-price">{formatPrice(selected.price)}</span>
                </label>
                {RENTAL_PIECES.map((piece) => (
                  <label className="piece" key={piece.id}>
                    <input type="checkbox" checked={pieceIds.includes(piece.id)} onChange={() => togglePiece(piece.id)} />
                    {piece.icon ? <img src={piece.icon} alt="" /> : <span className="piece-icon-blank" aria-hidden="true" />}
                    <span className="piece-name">{piece.label}</span>
                    <span className="piece-price">+{formatPrice(piece.price)}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="card-section fitting-section" aria-labelledby="fitting-title">
              <img className="fitting-icon" src="/icons/mw/measurement.png" alt="" />
              <div>
                <h2 id="fitting-title" className="section-title">Book your fitting</h2>
                <p className="section-copy">
                  Rentals aren't tailored. Instead, a free fitting confirms your jacket, pants, shirt, and shoe sizes,
                  so everything fits when you pick it up.
                </p>
                <button className="button secondary" type="button" onClick={() => setHandoff("fitting")}>
                  Book a fitting appointment
                </button>
                {handoff === "fitting" && (
                  <p className="handoff-inline" role="status">Prototype: this would open nearby stores and fitting times.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {selected && !renting && (
          <div className="results-card">
            <section className="card-section" aria-labelledby="tailoring-title">
              <h2 id="tailoring-title" className="section-title">
                <img src="/icons/mw/hemming.png" alt="" />
                Make it a perfect fit
              </h2>
              <p className="section-copy">
                For the {selected.brand} {selected.name}. {summary.tailoring.because}
              </p>
              <div className="tier-list" role="radiogroup" aria-labelledby="tailoring-title">
                {[...TAILORING_TIERS, {
                  id: "none",
                  name: "No tailoring for now",
                  price: 0,
                  items: [],
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
                        {option.icon && <img className="tier-icon" src={option.icon} alt="" />}
                        {option.name}
                        {option.id === summary.tailoring.id && <span className="tier-tag">Our pick for you</span>}
                      </span>
                      <span className="tier-detail">
                        {option.detail}
                        {TAILORING_TURNAROUND[option.id] ? ` Ready in about ${TAILORING_TURNAROUND[option.id]} days.` : ""}
                      </span>
                      {option.items.length > 0 && (
                        <span className="tier-items">
                          {option.items.map((item) => (
                            <span className="tier-item" key={item.id}>
                              <img src={item.icon} alt="" />
                              <span className="tier-item-label">{item.label}</span>
                              <span className="tier-item-price">{formatPrice(item.price)}</span>
                            </span>
                          ))}
                        </span>
                      )}
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
              <p className="tier-perks">{TAILORING_PERKS}</p>
              <button className="button secondary" type="button" onClick={() => setHandoff("tailor")}>
                Book a tailoring appointment
              </button>
              {handoff === "tailor" && (
                <p className="handoff-inline" role="status">
                  Prototype: this would open nearby stores and times for a tailor to pin your suit.
                </p>
              )}
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
        <h2 id="summary-title">{renting ? "Rental summary" : "Order summary"}</h2>
        {!selected && <p className="summary-empty">Select a {noun} to see your total.</p>}
        {selected && renting && (
          <>
            <p className="summary-suit">{selected.brand} {selected.name}</p>
            <ul className="summary-lines">
              <li><span>Jacket and pants</span><span className="summary-amount">{formatPrice(selected.price)}</span></li>
              {pieces.map((piece) => (
                <li key={piece.id}>
                  <span>{piece.label}</span>
                  <span className="summary-amount">{formatPrice(piece.price)}</span>
                </li>
              ))}
              <li><span>Damage and handling fee</span><span className="summary-amount">{formatPrice(RENTAL_FEE)}</span></li>
            </ul>
            <ul className="summary-lines summary-totals">
              <li className="summary-grand"><span>Total ({itemCount} pieces)</span><span className="summary-amount">{formatPrice(total)}</span></li>
            </ul>
          </>
        )}
        {selected && !renting && (
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
        <div className="summary-actions">
          <button className="button button-block" type="button" disabled={!selected} onClick={() => setHandoff("checkout")}>
            {renting ? "Reserve this look" : "Add to cart"}
          </button>
          {handoff === "checkout" && (
            <p className="handoff-inline" role="status">
              {renting
                ? "Prototype: this would reserve the look and its pieces for your event date."
                : `Prototype: this would add the suit in your sizes${tailoring ? ", the tailoring," : ""} and the add-ons to your bag.`}
            </p>
          )}
          <EmailResults />
        </div>
        {renting ? (
          <p className="summary-note">
            Sizes are confirmed at your fitting.
            {dates && !dates.past ? ` Ready ${formatDate(dates.ready)}, return by ${formatDate(dates.returnBy)}.` : ""}
          </p>
        ) : (
          <>
            <p className="summary-note">Shipping and tax calculated at checkout.</p>
            {tailoring && <p className="summary-note">Tailoring is finished in store after checkout.</p>}
            <button className="text-link try-on" type="button" onClick={() => setHandoff("tryon")}>
              Try it on at a store near you
            </button>
            {handoff === "tryon" && (
              <p className="handoff-inline" role="status">Prototype: this would open nearby stores with this suit in your size.</p>
            )}
          </>
        )}
      </aside>

      {!renting && summary.needsMeasurementHelp && (
        <div className="results-extra">
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
        </div>
      )}
    </div>
  );
}
