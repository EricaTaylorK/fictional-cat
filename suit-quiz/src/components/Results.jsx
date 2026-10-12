import { useMemo, useState } from "react";
import { buildResultSummary, getRecommendations } from "../lib/recommendation.js";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const tailoringPackages = [
  { id: "none", name: "No tailoring yet", price: 0, detail: "Take the suit as it is, and decide on adjustments later." },
  { id: "essentials", name: "Fit Essentials", price: 55, detail: "Hem the pants and set the sleeve length. The details people notice first." },
  { id: "signature", name: "Signature Fit", price: 100, detail: "Shape the jacket and refine the waist, sleeves, and pants." },
  { id: "custom", name: "Custom-Level Fit", price: 150, detail: "The fullest in-store plan, for when you want the fit finished." },
];

const outfitOptions = [
  { id: "shirt", name: "White dress shirt", price: 60 },
  { id: "tie", name: "Textured navy tie", price: 35 },
  { id: "shoes", name: "Black dress shoes", price: 110 },
];

export default function Results({ answers, onEditAnswers }) {
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
      <p className="eyebrow">Your plan</p>
      <h1 id="results-title">A suit you can walk in sure of.</h1>
      <p className="lede">
        You want something {summary.fit} for {summary.occasion}. This is the strongest
        starting point, and why it fits the moment.
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
          <p className="eyebrow">Fit confidence</p>
          <h2>A measurement will make this surer.</h2>
          <p>
            Your answers already point to a strong starting suit. A free in-store measurement
            catches the details a quiz can’t, so you leave knowing it fits.
          </p>
          <button className="button secondary" type="button" onClick={() => setHandoff("appointment")}>
            Book a free measurement
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
        <h3>Why this fits the moment</h3>
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

      <h2>Other ways to get it right</h2>
      <div className="alternatives">
        {alternatives.map((product, index) => (
          <article className="alternative" key={product.id}>
            <p className="eyebrow">{index === 0 ? "Close second" : "A different read of the room"}</p>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>{money.format(product.price)}</strong> · {product.matchPercent}% match</p>
            <button className="button secondary" type="button" onClick={() => setSelectedId(product.id)}>
              Use this suit instead
            </button>
          </article>
        ))}
      </div>

      <section className="result-section" aria-labelledby="tailoring-title">
        <p className="eyebrow">Dial in the fit</p>
        <h2 id="tailoring-title">Choose how the suit gets finished</h2>
        <p>
          Tailoring sits on its own line so you can see exactly what it adds to the plan.
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
                <strong>{option.name} · {option.price ? money.format(option.price) : "$0"}</strong>
                <span>{option.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="result-section" aria-labelledby="outfit-title">
        <p className="eyebrow">Finish the look</p>
        <h2 id="outfit-title">Pieces that belong with this suit</h2>
        <p>Add only what the moment calls for. Each piece follows the same occasion, so the outfit reads as one decision.</p>
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
                <span>{money.format(item.price)} · Add it if the moment calls for it</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="order-summary" aria-labelledby="summary-title">
        <p className="eyebrow">Before you go further</p>
        <h2 id="summary-title">Your plan</h2>
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
        <h2>Send this plan to yourself</h2>
        <p>Your results are already here. Use email only if you want a copy for later.</p>
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
    </section>
  );
}
