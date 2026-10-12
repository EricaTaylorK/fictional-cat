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

const steps = ["Choose your suit", "Finish your plan"];

function SizeLines({ size }) {
  if (size.jacket) {
    return (
      <dl className="size-lines">
        <div><dt>Jacket</dt><dd>{size.jacket}</dd></div>
        <div><dt>Pants</dt><dd>{size.pants}</dd></div>
      </dl>
    );
  }
  return (
    <dl className="size-lines">
      {size.length && <div><dt>Jacket length</dt><dd>{size.length}</dd></div>}
      <div><dt>Chest and waist</dt><dd>Measured free in store</dd></div>
    </dl>
  );
}

function ProductHeading({ product }) {
  return (
    <>
      <p className="product-brand">{product.brand}</p>
      <h3 className="product-title">{product.name}</h3>
      <p className="product-meta">
        {product.color} · {product.fabric}
        {product.reviews >= 100 && (
          <span className="product-rating">
            <img src="/icons/content_starfilled.svg" alt="" />
            {product.rating} ({product.reviews.toLocaleString("en-US")})
          </span>
        )}
      </p>
    </>
  );
}

function Stepper({ step, onStep }) {
  return (
    <ol className="stepper">
      {steps.map((label, index) => {
        const state = index === step ? "current" : index < step ? "done" : "upcoming";
        return (
          <li key={label} className={`stepper-item stepper-${state}`} aria-current={state === "current" ? "step" : undefined}>
            {state === "done" ? (
              <button className="stepper-button" type="button" onClick={() => onStep(index)}>
                <span className="stepper-number">{index + 1}</span>{label}
              </button>
            ) : (
              <span className="stepper-button">
                <span className="stepper-number">{index + 1}</span>{label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SuitOption({ product, size, label, recommendedTailoring, onChoose }) {
  const suitOnly = product.price;
  const withTailoring = product.price + recommendedTailoring.price;
  return (
    <article className="suit-option">
      <span className={label === "Best match" ? "match-tag" : "option-label"}>{label}</span>
      <div className="product-image">
        <img src={product.image} alt={`${product.brand} ${product.name} in ${product.color.toLowerCase()}`} />
      </div>
      <div className="suit-option-body">
        <ProductHeading product={product} />
        <SizeLines size={size} />
        <h4 className="reason-title">Why it's a strong pick</h4>
        <ul className="reason-list">
          {product.evidence.slice(0, 3).map((reason) => (
            <li key={reason}>
              <img src="/icons/content_checkcircle.svg" alt="" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="price-choices">
        <button className="price-choice price-choice-recommended" type="button" onClick={() => onChoose(product.id, recommendedTailoring.id)}>
          <span className="price-choice-tag">Recommended for your fit</span>
          <span className="price-choice-row">
            <span>With {recommendedTailoring.name}</span>
            <strong>{formatPrice(withTailoring)}</strong>
          </span>
          <span className="price-choice-detail">Suit {formatPrice(suitOnly)} + tailoring {formatPrice(recommendedTailoring.price)}</span>
        </button>
        <button className="price-choice" type="button" onClick={() => onChoose(product.id, "none")}>
          <span className="price-choice-row">
            <span>Suit only</span>
            <span className="price-choice-amount">
              {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
              <strong>{formatPrice(suitOnly)}</strong>
            </span>
          </span>
          <span className="price-choice-detail">Tailoring can be added later</span>
        </button>
      </div>
    </article>
  );
}

export default function Results({ answers, onEditAnswers }) {
  const recommendations = useMemo(() => getRecommendations(answers), [answers]);
  const summary = useMemo(() => buildResultSummary(answers), [answers]);
  const recommendedTailoring = tailoringPackages.find((item) => item.id === summary.tailoring.id);
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState(recommendations[0].id);
  const [tailoringId, setTailoringId] = useState(summary.tailoring.id);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [handoff, setHandoff] = useState("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const selected = recommendations.find((product) => product.id === selectedId) ?? recommendations[0];
  const size = summary.sizeEstimate;
  const tailoring = tailoringPackages.find((item) => item.id === tailoringId);
  const extras = outfitOptions.filter((item) => selectedExtras.includes(item.id));
  const savings = selected.compareAt ? selected.compareAt - selected.price : 0;
  const subtotal = (selected.compareAt ?? selected.price)
    + (tailoring?.price ?? 0)
    + extras.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal - savings;
  const itemCount = 2 + extras.length + (tailoring ? 1 : 0);
  const basedOn = [summary.occasion, summary.fit, ...summary.fitNotes].join(" · ");

  function goToStep(index) {
    setStep(index);
    setHandoff("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseSuit(productId, packageId) {
    setSelectedId(productId);
    setTailoringId(packageId);
    goToStep(1);
  }

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

  const emailBox = (
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
  );

  const confidenceCallout = summary.needsMeasurementHelp && (
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
  );

  if (step === 0) {
    return (
      <section className="results-step" aria-labelledby="results-title">
        <Stepper step={step} onStep={goToStep} />
        <h1 id="results-title">Your recommendations</h1>
        <p className="results-lede">
          Three suits that fit {summary.occasion}, in a fit that feels {summary.fit}. Each one is
          sized from your answers. Pick the suit, and decide whether to add the tailoring we suggest
          for your fit.
        </p>
        <p className="based-on">
          Based on: {basedOn}{" "}
          <button className="text-link" type="button" onClick={onEditAnswers}>Edit answers</button>
        </p>

        <div className="suit-options">
          {recommendations.map((product, index) => (
            <SuitOption
              key={product.id}
              product={product}
              size={size}
              label={index === 0 ? "Best match" : index === 1 ? "Also a strong fit" : "Another way to go"}
              recommendedTailoring={recommendedTailoring}
              onChoose={chooseSuit}
            />
          ))}
        </div>

        <p className="tailoring-why">
          <img src="/icons/product_size.svg" alt="" />
          <span>
            <strong>Why {recommendedTailoring.name}?</strong> {summary.tailoring.reason}
          </span>
        </p>

        <div className="results-extra">
          {confidenceCallout}
          {emailBox}
        </div>
      </section>
    );
  }

  return (
    <div className="results-layout">
      <section className="results-main" aria-labelledby="plan-title">
        <Stepper step={step} onStep={goToStep} />
        <h1 id="plan-title">Finish your plan</h1>
        <p className="results-lede">Adjust the tailoring and add what the moment calls for. Checkout when you're ready.</p>

        <div className="results-card">
          <div className="chosen-suit">
            <div className="chosen-suit-image">
              <img src={selected.image} alt={`${selected.brand} ${selected.name} in ${selected.color.toLowerCase()}`} />
            </div>
            <div className="chosen-suit-info">
              <ProductHeading product={selected} />
              <SizeLines size={size} />
              <button className="text-link" type="button" onClick={() => goToStep(0)}>Change suit</button>
            </div>
          </div>

          <section className="card-section" aria-labelledby="tailoring-title">
            <h2 id="tailoring-title" className="section-title">
              <img src="/icons/product_size.svg" alt="" />
              Make it a perfect fit
            </h2>
            <p className="section-copy">
              Our Men's Wearhouse tailors will measure you and fine-tune the fit for your body, so it
              looks and feels made for you.
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
      </section>

      <aside className="order-summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Order summary</h2>
        {savings > 0 && <p className="promo-strip">Sale price applied: you save {formatPrice(savings)}</p>}
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
        <button className="button button-block" type="button" onClick={() => setHandoff("checkout")}>
          Checkout
        </button>
        {handoff === "checkout" && (
          <p className="handoff-inline" role="status">
            Prototype: this would add the suit in your sizes, the tailoring, and the add-ons to your bag.
          </p>
        )}
        <p className="summary-note">Tailoring is finished in store after checkout.</p>
      </aside>

      <div className="results-extra">
        {confidenceCallout}
        {emailBox}
      </div>
    </div>
  );
}
