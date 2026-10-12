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

const optionLabels = ["Best match", "Also a strong fit", "Another way to go"];

function sizeDetail(size) {
  if (size.jacket) return `${size.jacket} jacket · ${size.pants} pants`;
  if (size.length) return `${size.length} length · size confirmed in store`;
  return "Size confirmed in store";
}

function SuitOption({ product, size, label, recommendedTailoring, selected, onSelect }) {
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
        <p className={label === "Best match" ? "option-kicker option-kicker-best" : "option-kicker"}>{label}</p>
        <p className="product-brand">{product.brand}</p>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
        </p>
        <p className="product-meta">
          {product.color} · {product.fabric} · {sizeDetail(size)}
          {product.reviews >= 100 && (
            <span className="product-rating">
              <img src="/icons/content_starfilled.svg" alt="" />
              {product.rating} ({product.reviews.toLocaleString("en-US")})
            </span>
          )}
        </p>
        <div className="suit-panel">
          <h4 className="reason-title">Why it's a strong pick</h4>
          <ul className="reason-list">
            {product.evidence.slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <p className="panel-prices">
            <span>Suit only <strong>{formatPrice(product.price)}</strong></span>
            <span>With {recommendedTailoring.name} <strong>{formatPrice(product.price + recommendedTailoring.price)}</strong></span>
          </p>
        </div>
      </div>
    </label>
  );
}

export default function Results({ answers, onEditAnswers }) {
  const recommendations = useMemo(() => getRecommendations(answers), [answers]);
  const summary = useMemo(() => buildResultSummary(answers), [answers]);
  const recommendedTailoring = tailoringPackages.find((item) => item.id === summary.tailoring.id);
  const [selectedId, setSelectedId] = useState(null);
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
        <h1 id="results-title">Your recommendations</h1>
        <p className="results-lede">
          Three suits that fit {summary.occasion}, in a fit that feels {summary.fit}. Each one is
          sized from your answers. Select a suit to build your plan.
        </p>
        <p className="based-on">
          Based on: {basedOn}{" "}
          <button className="text-link" type="button" onClick={onEditAnswers}>Edit answers</button>
        </p>

        <div className="suit-options" role="radiogroup" aria-labelledby="results-title">
          {recommendations.map((product, index) => (
            <SuitOption
              key={product.id}
              product={product}
              size={size}
              label={optionLabels[index]}
              recommendedTailoring={recommendedTailoring}
              selected={product.id === selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>

        <p className="tailoring-why">
          <img src="/icons/product_size.svg" alt="" />
          <span>
            <strong>Why {recommendedTailoring.name}?</strong> {summary.tailoring.reason} You can choose it, or skip it, once you've picked a suit.
          </span>
        </p>

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
              <div className="tier-list" role="radiogroup" aria-labelledby="tailoring-title">
                {tailoringPackages.map((option) => {
                  const recommended = option.id === summary.tailoring.id;
                  return (
                    <label className={`tier${recommended ? " tier-recommended" : ""}`} key={option.id}>
                      {recommended && <span className="tier-tag">Recommended for your fit</span>}
                      <input
                        className="visually-hidden"
                        type="radio"
                        name="tailoring-package"
                        value={option.id}
                        checked={tailoringId === option.id}
                        onChange={() => setTailoringId(option.id)}
                      />
                      <img className="tier-icon" src={option.icon} alt="" />
                      <span className="tier-copy">
                        <span className="tier-name">{option.name}</span>
                        <span className="tier-detail">{recommended ? summary.tailoring.reason : option.detail}</span>
                      </span>
                      <span className="tier-price">+{formatPrice(option.price)}</span>
                    </label>
                  );
                })}
                <label className="tier tier-none">
                  <input
                    className="visually-hidden"
                    type="radio"
                    name="tailoring-package"
                    value="none"
                    checked={tailoringId === "none"}
                    onChange={() => setTailoringId("none")}
                  />
                  <span className="tier-copy">
                    <span className="tier-name">No tailoring for now</span>
                    <span className="tier-detail">Take the suit as it is. You can add tailoring in store later.</span>
                  </span>
                  <span className="tier-price">$0</span>
                </label>
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
                <span>Jacket{size.jacket ? ` · ${size.jacket}` : ""}</span>
                <span className="summary-amount">
                  {selected.compareAt && <s>{formatPrice(selected.compareAt)}</s>}
                  {formatPrice(selected.price)}
                </span>
              </li>
              <li>
                <span>Pants{size.pants ? ` · ${size.pants}` : ""}</span>
                <span className="summary-amount">Included</span>
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
        <p className="summary-note">
          {selected && !tailoringId
            ? `${recommendedTailoring.name} would bring this to ${formatPrice(selected.price + recommendedTailoring.price)}.`
            : "Tailoring is finished in store after checkout."}
        </p>
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
