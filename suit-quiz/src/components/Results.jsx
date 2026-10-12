import { useMemo, useState } from "react";
import { buildResultSummary, getRecommendations } from "../lib/recommendation.js";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const tailoringPackages = [
  { id: "none", name: "No tailoring yet", price: 0, detail: "Keep the suit as-is for now." },
  { id: "essentials", name: "Fit Essentials", price: 55, detail: "Hem pants and adjust sleeve length." },
  { id: "signature", name: "Signature Fit", price: 100, detail: "Shape the jacket and refine waist, sleeves, and pants." },
  { id: "custom", name: "Custom-Level Fit", price: 150, detail: "Our most complete in-store tailoring plan." },
];

const outfitOptions = [
  { id: "shirt", name: "White dress shirt", price: 60 },
  { id: "tie", name: "Textured navy tie", price: 35 },
  { id: "shoes", name: "Black dress shoes", price: 110 },
];

export default function Results({ answers, onEditAnswers, onRestart }) {
  const recommendations = useMemo(() => getRecommendations(answers), [answers]);
  const summary = useMemo(() => buildResultSummary(answers), [answers]);
  const [selectedId, setSelectedId] = useState(recommendations[0].id);
  const [tailoringId, setTailoringId] = useState(
    answers.tailoring === "bundle" ? "signature" : answers.tailoring === "consider" ? "essentials" : "none",
  );
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [handoff, setHandoff] = useState("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const selected = recommendations.find((product) => product.id === selectedId) ?? recommendations[0];
  const alternatives = recommendations.filter((product) => product.id !== selected.id);
  const tailoring = tailoringPackages.find((item) => item.id === tailoringId) ?? tailoringPackages[0];
  const extras = outfitOptions.filter((item) => selectedExtras.includes(item.id));
  const planTotal = selected.price + tailoring.price + extras.reduce((sum, item) => sum + item.price, 0);

  function handleEmail(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setEmailSent(true);
  }

  function toggleExtra(id) {
    setSelectedExtras((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  return (
    <section className="wire-panel" aria-labelledby="results-title">
      <p className="eyebrow">Your suit plan</p>
      <h1 id="results-title">Built around fit, not guesswork.</h1>
      <p className="lede">
        You asked for something {summary.fit} for {summary.occasion}. Here is the strongest
        starting point and the evidence behind it.
      </p>

      <div className="result-summary">
        <h2>What we used</h2>
        <ul className="proof-list">
          <li><strong>Occasion</strong>{summary.occasion}</li>
          <li><strong>Fit target</strong>{summary.fit}</li>
          <li><strong>Likely size</strong>{summary.size}</li>
        </ul>
        <button className="button link" type="button" onClick={onEditAnswers}>Edit my answers</button>
      </div>

      {summary.needsMeasurementHelp && (
        <aside className="confidence-callout">
          <p className="eyebrow">Fit confidence: needs a check</p>
          <h2>A free measurement is the smarter next step.</h2>
          <p>
            Your height or usual fit issues suggest that an in-store measurement could prevent
            avoidable alterations. Your recommendation is still ready below.
          </p>
          <button className="button secondary" type="button" onClick={() => setHandoff("appointment")}>
            Find a store and book a measurement
          </button>
        </aside>
      )}

      <article className="recommendation">
        <div className="recommendation-head">
          <div>
            <p className="eyebrow">Best match</p>
            <h2>{selected.name}</h2>
          </div>
          <span className="score">{selected.matchPercent}% match</span>
        </div>
        <p>{selected.description}</p>
        <h3>Why this is right for you</h3>
        <ul className="evidence-list">
          {selected.evidence.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
        <div className="price-row">
          <div>
            <span>Suit price</span>
            <div className="price">{money.format(selected.price)}</div>
          </div>
          <div className="actions-right">
            <button className="button secondary" type="button" onClick={() => setHandoff("appointment")}>
              Get help in store
            </button>
          </div>
        </div>
        {handoff && (
          <div className="handoff-note" role="status">
            <strong>Wireframe handoff:</strong>{" "}
            {handoff === "purchase"
              ? "This would open the configured product and size step."
              : "This would open nearby stores and appointment times."}
          </div>
        )}
      </article>

      <h2>Two purposeful alternatives</h2>
      <div className="alternatives">
        {alternatives.map((product, index) => (
          <article className="alternative" key={product.id}>
            <p className="eyebrow">{index === 0 ? "Next-best match" : "Another route"}</p>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>{money.format(product.price)}</strong> · {product.matchPercent}% match</p>
            <button className="button secondary" type="button" onClick={() => setSelectedId(product.id)}>
              Swap to this suit
            </button>
          </article>
        ))}
      </div>

      <section className="result-section" aria-labelledby="tailoring-title">
        <p className="eyebrow">Make it fit</p>
        <h2 id="tailoring-title">Choose your tailoring plan</h2>
        <p>
          Tailoring is selected separately so you can see exactly how it changes your complete plan.
        </p>
        <div className="choice-grid">
          {tailoringPackages.map((option) => (
            <label className="choice" key={option.id}>
              <input
                type="radio"
                name="tailoring-package"
                value={option.id}
                checked={tailoringId === option.id}
                onChange={() => setTailoringId(option.id)}
              />
              <span className="choice-copy">
                <strong>{option.name} · {option.price ? money.format(option.price) : "Included later"}</strong>
                <span>{option.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="result-section" aria-labelledby="outfit-title">
        <p className="eyebrow">Optional outfit builder</p>
        <h2 id="outfit-title">Wear the suit with these</h2>
        <p>Add only what helps. These suggestions follow the same occasion and versatility signals.</p>
        <div className="alternatives">
          {outfitOptions.map((item) => (
            <label className="choice" key={item.id}>
              <input
                type="checkbox"
                checked={selectedExtras.includes(item.id)}
                onChange={() => toggleExtra(item.id)}
              />
              <span className="choice-copy">
                <strong>{item.name}</strong>
                <span>{money.format(item.price)} · Add or remove from your plan</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="order-summary" aria-labelledby="summary-title">
        <p className="eyebrow">Your complete plan</p>
        <h2 id="summary-title">Review before the next step</h2>
        <ul className="summary-lines">
          <li><span>{selected.name}</span><strong>{money.format(selected.price)}</strong></li>
          <li><span>{tailoring.name}</span><strong>{money.format(tailoring.price)}</strong></li>
          {extras.map((item) => (
            <li key={item.id}><span>{item.name}</span><strong>{money.format(item.price)}</strong></li>
          ))}
          <li className="summary-total"><span>Estimated total</span><strong>{money.format(planTotal)}</strong></li>
        </ul>
        <button className="button" type="button" onClick={() => setHandoff("purchase")}>
          Continue with this plan
        </button>
        {handoff === "purchase" && (
          <div className="handoff-note" role="status">
            <strong>Wireframe handoff:</strong> This would confirm sizes, store availability, and checkout.
          </div>
        )}
      </section>

      <aside className="email-box">
        <p className="eyebrow">Optional</p>
        <h2>Email me my results</h2>
        <p>Your result is already visible. Use this only if you want a copy for later.</p>
        {emailSent ? (
          <p className="success-note" role="status">Prototype complete — a real experience would send the plan now.</p>
        ) : (
          <form className="inline-form" onSubmit={handleEmail}>
            <label className="field" style={{ flex: 1 }}>
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <button className="button secondary" type="submit">Send results</button>
          </form>
        )}
      </aside>

      <div className="actions">
        <button className="button link" type="button" onClick={onRestart}>Start over</button>
      </div>
    </section>
  );
}
