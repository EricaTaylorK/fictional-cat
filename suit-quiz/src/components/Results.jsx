import { Fragment, useMemo, useState } from "react";
import {
  PAIRING_HEX,
  PAIRING_LABELS,
  SUIT_PAIRINGS,
  SWATCH_HEX,
  TAILORING_PERKS,
  TAILORING_TIERS,
  TAILORING_TURNAROUND,
} from "../data/products.js";
import { colorsIn, resolvedOccasion } from "../data/quizConfig.js";
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

function variantOptions(product) {
  if (product.variants?.length) return product.variants;
  return [{ colorKey: product.colorKey, color: product.color, image: product.image }];
}

function defaultVariantIndex(product, answers) {
  const options = variantOptions(product);
  const prefer = colorsIn(answers.colors?.prefer ?? []);
  const preferred = options.findIndex((item) => prefer.includes(item.colorKey));
  return Math.max(0, preferred);
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

function SuitOption({ product, size, isBest, selected, onSelect, shown, options, variantIndex, onVariant, rentPrice, onTryOn }) {
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
        {isBest && <span className="match-tag">Best match</span>}
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
            <p className="product-meta">{RENTAL_TYPE_NAMES[product.type]} · Sizes confirmed at your fitting</p>
          </>
        ) : (
          <>
            <p className="product-price">
              <strong>{formatPrice(product.price)}</strong>
              {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
            </p>
            {describeSize(size) && <p className="product-meta">{describeSize(size)}</p>}
          </>
        )}
        {options.length > 1 && (
          <div className="color-swatches" role="group" aria-label="Colors">
            {options.map((option, index) => (
              <button
                key={option.color}
                type="button"
                className={index === variantIndex ? "color-swatch is-selected" : "color-swatch"}
                aria-label={index === variantIndex ? `${option.color}, selected` : option.color}
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
        <div className="option-actions">
          <button
            className="button link"
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onTryOn(product.id);
            }}
          >
            Try it on
          </button>
        </div>
      </div>
    </label>
  );
}

function PairingSwatches({ colorKeys }) {
  return (
    <span className="pairing-swatches">
      {colorKeys.map((key) => (
        <span className="pairing-swatch" key={key} title={PAIRING_LABELS[key]}>
          <span style={{ background: PAIRING_HEX[key] }} />
        </span>
      ))}
    </span>
  );
}

function PairingPanel({ product, shown, occasion }) {
  const pairing = SUIT_PAIRINGS[shown.colorKey];
  if (!pairing) return null;
  const note = occasion === "formal" && shown.colorKey === "black" ? `${pairing.note} This is the black-tie pick.` : pairing.note;
  return (
    <section className="pairing-panel" aria-labelledby="pairing-title">
      <h2 id="pairing-title" className="section-title">What to wear with your {shown.color.toLowerCase()} suit</h2>
      <p className="section-copy">{note}</p>
      <div className="pairing-row">
        <div className="pairing-group">
          <span className="pairing-label">Shirt</span>
          <PairingSwatches colorKeys={pairing.shirts} />
          <span className="pairing-names">{pairing.shirts.map((key) => PAIRING_LABELS[key]).join(" or ")}</span>
        </div>
        <div className="pairing-group">
          <span className="pairing-label">Tie</span>
          <PairingSwatches colorKeys={pairing.ties} />
          <span className="pairing-names">{pairing.ties.map((key) => PAIRING_LABELS[key]).join(", ")}</span>
        </div>
        <div className="pairing-group">
          <span className="pairing-label">Shoes</span>
          <span className="pairing-names pairing-shoes">{pairing.shoes}</span>
        </div>
      </div>
    </section>
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

export default function Results({ answers, moreMode = "toggle", onSeeAll }) {
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
  const [pieceIds, setPieceIds] = useState(answers.pieces ?? []);
  const [handoff, setHandoff] = useState("");

  const selected = recommendations.find((product) => product.id === selectedId);
  const size = summary.sizeEstimate;
  const dates = summary.dates;
  const pieces = RENTAL_PIECES.filter((piece) => pieceIds.includes(piece.id));
  const tailoring = TAILORING_TIERS.find((item) => item.id === tailoringId);
  const savings = !renting && selected?.compareAt ? selected.compareAt - selected.price : 0;
  const rentSubtotal = renting && selected ? rentalTotal(selected, pieces) : 0;
  const subtotal = renting
    ? rentSubtotal + RENTAL_FEE
    : selected
      ? (selected.compareAt ?? selected.price) + (tailoring?.price ?? 0)
      : 0;
  const total = subtotal - savings;
  const itemCount = renting
    ? 2 + pieces.length
    : selected ? 2 + (tailoring ? 1 : 0) : 0;
  const visibleCount = expanded ? Math.min(recommendations.length, 9) : Math.min(3, recommendations.length);
  const shownRecommendations = recommendations.slice(0, visibleCount);
  const missIndex = recommendations.budgetMiss
    ? shownRecommendations.findIndex((product) => !product.inBudget)
    : -1;
  const selectedOptions = selected ? variantOptions(selected) : [];
  const selectedVariant = selected
    ? selectedOptions[variantIndexes[selected.id] ?? defaultVariantIndex(selected, answers)]
    : null;
  const occasion = resolvedOccasion(answers);
  const noun = renting ? "look" : "suit";
  const headline = renting
    ? `A ${RENTAL_TYPE_NAMES[recommendations[0].type].toLowerCase()} for ${summary.occasion}`
    : `A ${summary.fitName} for ${summary.occasion}`;
  const lede = recommendations[0]?.evidence?.[0];

  function togglePiece(id) {
    setPieceIds((current) => (current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]));
  }

  function tryOnSuit() {
    setHandoff("tryon");
  }

  return (
    <div className="results-layout">
      <section className="results-main" aria-labelledby="results-title">
        <div className="results-hero">
          <div className="results-hero-copy">
            <h1 id="results-title">{headline}</h1>
            {lede && <p className="results-lede">{lede}</p>}
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
            ) : answers.tailoring === "skip" ? (
              <li className="fit-stat">
                <img src="/icons/product_hanger.svg" alt="" />
                <span className="fit-stat-label">Tailoring</span>
                <strong>Not added</strong>
                <span className="fit-stat-hint">You can add it in store</span>
              </li>
            ) : (
              <li className="fit-stat">
                <img src={recommendedTailoring?.icon ?? "/icons/product_hanger.svg"} alt="" />
                <span className="fit-stat-label">If you add tailoring</span>
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
            return (
              <Fragment key={product.id}>
                {index === missIndex && (
                  <p className="budget-miss">{recommendations.budgetMiss.label}</p>
                )}
                <SuitOption
                  product={product}
                  size={size}
                  isBest={index === 0}
                  selected={product.id === selectedId}
                  onSelect={setSelectedId}
                  shown={shown}
                  options={options}
                  variantIndex={variantIndex}
                  rentPrice={renting ? rentalTotal(product, pieces) : undefined}
                  onVariant={(next) => setVariantIndexes((current) => ({ ...current, [product.id]: next }))}
                  onTryOn={tryOnSuit}
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
        {handoff === "tryon" && (
          <p className="handoff-inline" role="status">Prototype: this would open nearby stores with this suit in your size.</p>
        )}

        {!renting && selected && (
          <PairingPanel product={selected} shown={selectedVariant} occasion={occasion} />
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
                Tailoring, if you want it
              </h2>
              <p className="section-copy">
                {answers.tailoring === "skip"
                  ? `Optional for the ${selected.brand} ${selected.name}. These are the in-store prices if you add it later.`
                  : `For the ${selected.brand} ${selected.name}. ${summary.tailoring.because}`}
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
                        {option.id === summary.tailoring.id && answers.tailoring !== "skip" && <span className="tier-tag">Our pick for you</span>}
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
            <p className="summary-note summary-price-note">
              Sizes are confirmed at your fitting.
              {dates && !dates.past ? ` Ready ${formatDate(dates.ready)}, return by ${formatDate(dates.returnBy)}.` : ""}
            </p>
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
            </ul>
            <ul className="summary-lines summary-totals">
              <li><span>Subtotal ({itemCount} items)</span><span className="summary-amount">{formatPrice(subtotal)}</span></li>
              {savings > 0 && (
                <li className="summary-promo"><span>Suit sale</span><span className="summary-amount">-{formatPrice(savings)}</span></li>
              )}
              <li className="summary-grand"><span>Grand total</span><span className="summary-amount">{formatPrice(total)}</span></li>
            </ul>
            <p className="summary-note summary-price-note">Shipping and tax calculated at checkout.</p>
            {tailoring && <p className="summary-note summary-price-note">Tailoring is finished in store after checkout.</p>}
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
                : `Prototype: this would add the suit in your sizes${tailoring ? " and the tailoring" : ""} to your bag.`}
            </p>
          )}
          <EmailResults />
        </div>
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
