import { useMemo, useState } from "react";
import { buildResultSummary, formatPrice, getRecommendations } from "../lib/recommendation.js";
import TextInput from "./TextInput.jsx";

const tailoringPackages = [
  {
    id: "essentials",
    name: "Fit Essentials",
    price: 55,
    icon: "/icons/product_size.svg",
    detail: "We'll hem the pants and set the sleeve length for a clean, finished look.",
  },
  {
    id: "signature",
    name: "Signature Fit",
    price: 100,
    icon: "/icons/product_modernfit.svg",
    detail: "Everything in Essentials, plus we shape the jacket and waist so it looks sharper.",
  },
  {
    id: "custom",
    name: "Custom-Level Fit",
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

function cardDetails(product, size) {
  const jacket = size.jacket ? `Jacket ${size.jacket}` : size.length ? `Jacket ${size.length} (${size.lengthCode})` : null;
  const pants = size.pants ? `Pants ${size.pants}` : null;
  return [product.color, jacket, pants, product.fabric].filter(Boolean).join(" · ");
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

function SuitOption({ product, size, selected, onSelect }) {
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
        <img src={product.image} alt="" />
      </div>
      <div className="suit-option-body">
        <span className="match-score">{product.matchPercent}% match</span>
        <p className="product-brand">{product.brand}</p>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
        </p>
        <p className="product-meta">{cardDetails(product, size)}</p>
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
      </div>
    </label>
  );
}

export default function Results({ answers, onEditAnswers }) {
  const recommendations = useMemo(() => getRecommendations(answers), [answers]);
  const summary = useMemo(() => buildResultSummary(answers), [answers]);
  const recommendedTailoring = tailoringPackages.find((item) => item.id === summary.tailoring.id);
  const [selectedId, setSelectedId] = useState(recommendations[0].id);
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
  const basedOn = [summary.occasion, summary.fit, ...summary.fitNotes].join(" · ");

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
              Three suits for {summary.occasion}, in a fit that feels {summary.fit}. Your best match
              is selected.
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
            </li>
            <li className="fit-stat">
              <img src="/icons/product_size.svg" alt="" />
              <span className="fit-stat-label">Pants</span>
              <strong>{size.pants ?? "Measured in store"}</strong>
            </li>
            <li className="fit-stat">
              <img src="/icons/product_hanger.svg" alt="" />
              <span className="fit-stat-label">Tailoring</span>
              <strong>{recommendedTailoring.name}</strong>
            </li>
          </ul>
        </div>

        <div className="suit-options" role="radiogroup" aria-labelledby="results-title">
          {recommendations.map((product) => (
            <SuitOption
              key={product.id}
              product={product}
              size={size}
              selected={product.id === selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>

        {selected && (
          <div className="results-card">
            <section className="card-section" aria-labelledby="tailoring-title">
              <h2 id="tailoring-title" className="section-title">
                <img src="/icons/product_size.svg" alt="" />
                Make it a perfect fit
              </h2>
              <p className="section-copy">
                For the {selected.brand} {selected.name}. Our tailors measure you in store and fine-tune
                the fit, so it looks and feels made for you.
              </p>
              <div className="fit-pick">
                <p className="fit-pick-label">We recommend {recommendedTailoring.name}</p>
                <p>{summary.tailoring.because}</p>
              </div>
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
                      <span className="tier-detail">{option.detail}</span>
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
              <h2 id="outfit-title" className="section-title">Wear the suit with these</h2>
              <p className="section-copy">Optional. Each piece is picked to match this suit and the occasion.</p>
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
        {tailoring && <p className="summary-note">Tailoring is finished in store after checkout.</p>}
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
