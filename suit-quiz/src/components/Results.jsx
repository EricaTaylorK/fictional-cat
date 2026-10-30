import { useEffect, useMemo, useRef, useState } from "react";
import {
  lookForColor,
  PAIRING_HEX,
  SWATCH_HEX,
  TAILORING_PERKS,
  TAILORING_TIERS,
  TAILORING_TURNAROUND,
} from "../data/products.js";
import { colorsIn, getQuestionFlow, questions, resolvedOccasion } from "../data/quizConfig.js";
import { RENTAL_PACKAGES, RENTAL_STEPS, RENTAL_TYPE_NAMES } from "../data/rentals.js";
import {
  buildResultSummary,
  formatDate,
  formatPrice,
  getRecommendations,
  getRentalRecommendations,
  parseHeight,
} from "../lib/recommendation.js";
import TextInput from "./TextInput.jsx";

const SUIT_ONLY = {
  id: "none",
  name: "Suit only",
  detail: "The suit as it is.",
  price: 0,
  items: [],
};

const BUY_OPTIONS = [SUIT_ONLY, ...TAILORING_TIERS];

const SUIT_FIT_NAMES = {
  close: "Slim",
  balanced: "Modern",
  roomy: "Classic",
};

const FIT_NOTE_COPY = {
  broadShoulders: "Jackets pull across the shoulders or back",
  fullerMidsection: "Jackets pull at the button",
  runsLong: "Sleeves and jackets usually run long",
  runsShort: "Sleeves and jackets usually run short",
  athleticBuild: "Pants gap at the waist",
  seatThighs: "Pants are tight through the seat or thighs",
};

function selectedIssues(values) {
  return (values ?? []).filter((issue) => issue && issue !== "none");
}

function fitNoteText(answers) {
  const notes = [...selectedIssues(answers.fitIssues), ...selectedIssues(answers.pantsFit)]
    .map((issue) => FIT_NOTE_COPY[issue])
    .filter(Boolean);
  if (notes.length === 0) return "No common fit problems selected";
  return `${notes.join(". ")}.`;
}

function heightLabel(height) {
  const parsed = parseHeight(height);
  if (!parsed) return null;
  return `${parsed.feet}'${parsed.inches}"`;
}

function estimateSources(answers) {
  if (answers.measurementKnowledge === "no") return { shirt: true, waist: true };
  if (answers.measurementKnowledge === "yes" || answers.measurementKnowledge === "some") {
    const unknown = answers.unknownSizes ?? {};
    return { shirt: Boolean(unknown.chest), waist: Boolean(unknown.waist) };
  }
  return { shirt: false, waist: false };
}

function sizeEditStep(answers, kind) {
  if (answers.measurementKnowledge === "no") return "everydaySizes";
  const unknown = answers.unknownSizes ?? {};
  if (kind === "jacket" && unknown.chest) return "everydaySizes";
  if (kind === "pants" && unknown.waist) return "everydaySizes";
  if (answers.measurementKnowledge === "yes" || answers.measurementKnowledge === "some") return "measurements";
  return null;
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 5V2L7 7l5 5V8c2.76 0 5 2.24 5 5a5 5 0 0 1-8.9 3.1l-1.46 1.46A7 7 0 0 0 19 13c0-3.87-3.13-7-7-7Z" />
    </svg>
  );
}

function variantOptions(product) {
  if (product.variants?.length) return product.variants;
  return [{ colorKey: product.colorKey, color: product.color, image: product.image }];
}

function defaultVariantIndex(product, answers) {
  const options = variantOptions(product);
  const prefer = colorsIn(answers.colors?.prefer ?? []);
  const avoid = colorsIn(answers.colors?.avoid ?? []);
  const preferred = options.findIndex((item) => prefer.includes(item.colorKey));
  if (preferred >= 0) return preferred;
  const open = options.findIndex((item) => !avoid.includes(item.colorKey));
  return Math.max(0, open);
}

function titleCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function jacketWords(size, renting) {
  if (size?.jacket) {
    const chest = String(size.jacket).replace(/[SRL]$/i, "");
    const length = (size.length || "Regular").toLowerCase();
    return `${chest} ${length}`;
  }
  if (size?.length) return `${size.length.toLowerCase()} length`;
  return renting ? "Confirmed at your fitting" : "Measured in store";
}

function pantsWords(size, renting) {
  if (size?.pants) return `${String(size.pants).replace(/W$/i, "")}-inch waist`;
  return renting ? "Confirmed at your fitting" : "Measured in store";
}

function compatibleLookIds(colorKey, ids) {
  const look = lookForColor(colorKey);
  const allowed = new Set((look?.items ?? []).map((item) => item.id));
  return ids.filter((id) => allowed.has(id));
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

function matchTone(percent) {
  return percent >= 90 ? "best" : "mid";
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

function OptionRow({ label, children, count }) {
  const scrollerRef = useRef(null);
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const update = () => {
      const overflow = el.scrollWidth > el.clientWidth + 4;
      setEdges({
        overflow,
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, [count]);

  function scrollBy(direction) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollerRef.current?.scrollBy({ left: direction * 280, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <div className="rate-layer">
      {edges.overflow && (
        <div className="rate-arrows">
          <button className="rate-arrow" type="button" aria-label="Previous options" disabled={!edges.left} onClick={() => scrollBy(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M14.5 5.5 8 12l6.5 6.5.7-.7L9.4 12l5.8-5.8-.7-.7Z" />
            </svg>
          </button>
          <button className="rate-arrow" type="button" aria-label="Next options" disabled={!edges.right} onClick={() => scrollBy(1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="m9.5 5.5.7.7L15.6 12l-5.4 5.8-.7-.7L14.2 12 9.5 5.5Z" />
            </svg>
          </button>
        </div>
      )}
      <div className="rate-row" ref={scrollerRef} role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

function BuyOptionCard({
  option,
  suitPrice,
  suggested,
  outlined,
  committed,
  detailsOpen,
  onToggleDetails,
  onSelect,
}) {
  const total = suitPrice + option.price;
  const days = TAILORING_TURNAROUND[option.id];
  return (
    <article className={`rate-card${outlined ? " is-selected" : ""}`}>
      <p className="rate-name">
        {option.name}
        {suggested && <span className="tier-tag">Suggested for you</span>}
      </p>
      <p className="rate-plain">{option.detail}</p>
      {days ? <p className="rate-turnaround">Ready in about {days} days.</p> : null}
      {option.items.length > 0 && (
        <button
          className="text-link rate-details"
          type="button"
          aria-expanded={detailsOpen}
          onClick={onToggleDetails}
        >
          {detailsOpen ? "Hide details" : "Details"}
        </button>
      )}
      {detailsOpen && (
        <ul className="rate-items">
          {option.items.map((item) => (
            <li key={item.id}>
              <span>{item.label}</span>
              <span>{formatPrice(item.price)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="rate-addon">{option.price ? `+${formatPrice(option.price)}` : "No tailoring added"}</p>
      <p className="rate-total">{formatPrice(total)} with this suit</p>
      <button
        className={`button rate-select${committed ? " secondary" : ""}`}
        type="button"
        aria-pressed={committed}
        onClick={onSelect}
      >
        {committed ? "Selected" : "Select"}
        <span className="visually-hidden"> {option.name}</span>
      </button>
    </article>
  );
}

function CompleteLook({ look, colorName, occasionLabel, addedIds, onToggle }) {
  const [shirt, tie, shoes] = look.items;
  const event = occasionLabel && occasionLabel !== "your event" ? ` for ${occasionLabel}` : "";
  const lead = `${shirt.color} ${shirt.name.toLowerCase()}, ${tie.color.toLowerCase()} ${tie.name.toLowerCase()}, and ${shoes.color.toLowerCase()} ${shoes.name.toLowerCase()} go with this ${colorName.toLowerCase()} suit${event}.`;
  return (
    <section className="complete-look" aria-labelledby="complete-look-title">
      <h4 id="complete-look-title" className="complete-look-title">Complete the look</h4>
      <p className="section-copy">{lead} {look.note}</p>
      <div className="look-grid">
        {look.items.map((item) => {
          const added = addedIds.includes(item.id);
          return (
            <article className={`look-card${added ? " is-added" : ""}`} key={item.id}>
              <div className="look-visual">
                {item.icon && <img src={item.icon} alt="" />}
                <span className="look-swatch" style={{ background: PAIRING_HEX[item.colorKey] ?? "#888" }} />
              </div>
              <p className="look-type">{item.type}</p>
              <p className="look-name">{item.name}</p>
              <p className="look-meta">{item.color}</p>
              <p className="look-price">{formatPrice(item.price)}</p>
              <button
                className={`button look-add${added ? " secondary" : ""}`}
                type="button"
                aria-pressed={added}
                onClick={() => onToggle(item.id)}
              >
                {added ? "Added" : "Add"}
                <span className="visually-hidden"> {item.name}</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FitProfile({ answers, renting, size, flow, onEditAnswers, onAccount, accountStatus }) {
  const sources = estimateSources(answers);
  const everyday = answers.everydaySizes ?? {};
  const height = heightLabel(answers.height);
  const suitFit = SUIT_FIT_NAMES[answers.feel];
  const jacketIssues = selectedIssues(answers.fitIssues);
  const pantsIssues = selectedIssues(answers.pantsFit);
  const notesStep = jacketIssues.length === 0 && pantsIssues.length > 0 ? "pantsFit" : "fitIssues";
  const rows = [
    suitFit ? { label: "Suit fit", value: suitFit, step: "feel" } : null,
    { label: "Jacket", value: jacketWords(size, renting), step: sizeEditStep(answers, "jacket") },
    { label: "Pants", value: pantsWords(size, renting), step: sizeEditStep(answers, "pants") },
    height ? { label: "Height", value: height, step: "height" } : null,
    sources.shirt && everyday.shirt ? { label: "Usual shirt", value: everyday.shirt, step: "everydaySizes" } : null,
    sources.waist && everyday.waist ? { label: "Usual waist", value: everyday.waist, step: "everydaySizes" } : null,
    { label: "Fit notes", value: fitNoteText(answers), step: notesStep },
  ].filter(Boolean);
  const benefits = renting
    ? [
      "Future suit and rental picks start in the right size.",
      "Fit preference is remembered.",
      "Sizing for the next rental stays with the profile.",
    ]
    : [
      "Future suit picks start in the right size.",
      "Fit preference is remembered.",
      "Tailoring guidance stays with the profile.",
    ];
  const saveCopy = renting
    ? "Saving keeps these sizes and fit preferences ready for future suit and rental recommendations."
    : "Saving keeps these sizes and fit preferences ready for future suit recommendations.";

  return (
    <section className="fit-profile" aria-labelledby="fit-profile-title">
      <div className="fit-profile-facts">
        <h2 id="fit-profile-title" className="section-title">Your fit profile</h2>
        <div className="fit-profile-rows">
          {rows.map((row) => {
            const onEdit = onEditAnswers && row.step && flow.includes(row.step)
              ? () => onEditAnswers(row.step)
              : null;
            return (
              <div className="fit-profile-row" key={row.label}>
                <div>
                  <p className="fit-profile-label">{row.label}</p>
                  <p className="fit-profile-value">{row.value}</p>
                </div>
                {onEdit && (
                  <button className="text-link" type="button" onClick={onEdit}>
                    Edit<span className="visually-hidden"> {row.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="fit-profile-save">
        <h2 className="section-title">Save your fit profile</h2>
        <p className="section-copy">{saveCopy}</p>
        <ul className="fit-profile-benefits">
          {benefits.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="fit-profile-actions">
          <button className="button" type="button" onClick={() => onAccount("create-account")}>Create an account</button>
          <button className="button secondary" type="button" onClick={() => onAccount("sign-in")}>Sign in</button>
        </div>
        {accountStatus && <p className="handoff-inline" role="status">{accountStatus}</p>}
      </div>
    </section>
  );
}

export default function Results({ answers, moreMode = "toggle", onSeeAll, onEditAnswers, onRestart }) {
  const renting = answers.mode === "rent";
  const recommendations = useMemo(
    () => (renting ? getRentalRecommendations(answers) : getRecommendations(answers)),
    [answers, renting],
  );
  const summary = useMemo(() => buildResultSummary(answers), [answers]);
  const firstId = recommendations[0]?.id ?? null;
  const [selectedId, setSelectedId] = useState(firstId);
  const [openId, setOpenId] = useState(firstId);
  const [expanded, setExpanded] = useState(false);
  const [variantIndexes, setVariantIndexes] = useState({});
  const [tailoringId, setTailoringId] = useState(SUIT_ONLY.id);
  const [lookCommitted, setLookCommitted] = useState(false);
  const [addedLookIds, setAddedLookIds] = useState([]);
  const [detailOpen, setDetailOpen] = useState({});
  const [handoff, setHandoff] = useState("");

  const selected = recommendations.find((product) => product.id === selectedId) ?? null;
  const size = summary.sizeEstimate;
  const dates = summary.dates;
  const pack = RENTAL_PACKAGES.find((item) => item.id === Number(answers.pieces));
  const pieces = summary.pieces;
  const tailoring = TAILORING_TIERS.find((item) => item.id === tailoringId);
  const visibleCount = expanded ? Math.min(recommendations.length, 9) : Math.min(3, recommendations.length);
  const visibleRecommendations = recommendations.slice(0, visibleCount);
  const shownRecommendations = selected && !visibleRecommendations.some((product) => product.id === selected.id)
    ? [...visibleRecommendations, selected]
    : visibleRecommendations;
  const flow = useMemo(() => getQuestionFlow(answers), [answers]);
  const occasion = resolvedOccasion(answers);
  const budgetText = questions.budget.options.find((option) => option.value === answers.budget)?.label ?? "Not set";
  const suggestTailoring = answers.tailoring !== "skip";
  const headline = answers.feel
    ? `Recommended for ${summary.occasion}, in a ${summary.fitName}.`
    : `Recommended for ${summary.occasion}.`;
  const lede = recommendations[0]?.evidence?.[0];

  const selectedOptions = selected ? variantOptions(selected) : [];
  const selectedVariant = selected
    ? selectedOptions[variantIndexes[selected.id] ?? defaultVariantIndex(selected, answers)]
    : null;
  const selectedLook = !renting && selectedVariant ? lookForColor(selectedVariant.colorKey, occasion) : null;
  const addedItems = selectedLook ? selectedLook.items.filter((item) => addedLookIds.includes(item.id)) : [];
  const accessoryTotal = addedItems.reduce((sum, item) => sum + item.price, 0);
  const savings = !renting && selected?.compareAt ? selected.compareAt - selected.price : 0;
  const subtotal = !renting && selected
    ? (selected.compareAt ?? selected.price) + (tailoring?.price ?? 0) + accessoryTotal
    : 0;
  const total = subtotal - savings;
  const itemCount = !renting && selected ? 2 + (tailoring ? 1 : 0) + addedItems.length : 0;

  function shownFor(product) {
    const options = renting
      ? [{ color: product.color, colorKey: product.colorKey, image: product.image }]
      : variantOptions(product);
    const variantIndex = renting ? 0 : variantIndexes[product.id] ?? defaultVariantIndex(product, answers);
    return { options, variantIndex, shown: options[variantIndex] ?? options[0] };
  }

  function toggleOpen(productId) {
    setOpenId((current) => (current === productId ? null : productId));
  }

  function chooseVariant(product, index) {
    setVariantIndexes((current) => ({ ...current, [product.id]: index }));
    if (renting || product.id !== selectedId) return;
    const options = variantOptions(product);
    const shown = options[index] ?? options[0];
    setAddedLookIds((current) => compatibleLookIds(shown?.colorKey, current));
  }

  function selectBuyOption(product, optionId) {
    const { shown } = shownFor(product);
    setSelectedId(product.id);
    setTailoringId(optionId);
    setOpenId(product.id);
    setLookCommitted(true);
    setAddedLookIds((current) => compatibleLookIds(shown?.colorKey, current));
  }

  function selectRental(productId) {
    setSelectedId(productId);
    setOpenId(productId);
  }

  function toggleLook(id) {
    setAddedLookIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  }

  function toggleDetails(productId, optionId) {
    const key = `${productId}:${optionId}`;
    setDetailOpen((current) => ({ ...current, [key]: !current[key] }));
  }

  const checkoutNote = renting
    ? "Prototype: this would reserve the look and its pieces for your event date."
    : `Prototype: this would add the suit in your sizes${
      [tailoring ? "the tailoring" : null, addedItems.length ? "the pieces you added" : null].filter(Boolean).length
        ? ` and ${[tailoring ? "the tailoring" : null, addedItems.length ? "the pieces you added" : null].filter(Boolean).join(" and ")}`
        : ""
    } to your bag.`;

  return (
    <div className="results-layout">
      <section className="results-main" aria-labelledby="results-title">
        <div className="results-hero">
          <div className="results-hero-top">
            <div className="results-expert">
              <span className="results-monogram" aria-hidden="true">M|W</span>
              <span className="results-expert-label">AI Style Expert</span>
            </div>
            <div className="results-hero-actions">
              <button className="results-hero-action" type="button" onClick={() => onEditAnswers?.()}>
                <PencilIcon />
                Edit answers
              </button>
              <button className="results-hero-action" type="button" onClick={() => onRestart?.()}>
                <RestartIcon />
                Restart quiz
              </button>
            </div>
          </div>
          <div className="results-hero-copy">
            <h1 id="results-title">{headline}</h1>
            {lede && <p className="results-lede">{lede}</p>}
          </div>
          <div className="answer-bar">
            <div className="answer-item">
              <span className="answer-label">Occasion</span>
              <strong>{titleCase(summary.occasion)}</strong>
            </div>
            <div className="answer-item">
              <span className="answer-label">Fit</span>
              <strong>{titleCase(summary.fitName)}</strong>
            </div>
            <div className="answer-item">
              <span className="answer-label">Jacket</span>
              <strong>{jacketWords(size, renting)}</strong>
            </div>
            <div className="answer-item">
              <span className="answer-label">Pants</span>
              <strong>{pantsWords(size, renting)}</strong>
            </div>
            {renting ? (
              <div className="answer-item">
                <span className="answer-label">Package</span>
                <strong>{pack?.label ?? "Rental"}</strong>
              </div>
            ) : (
              <div className="answer-item">
                <span className="answer-label">Budget</span>
                <strong>{budgetText}</strong>
              </div>
            )}
          </div>
        </div>

        {recommendations.budgetMiss && (
          <p className="budget-alert" role="status">
            <span className="budget-alert-mark" aria-hidden="true">!</span>
            <span>{recommendations.budgetMiss.label}</span>
          </p>
        )}

        <h2 className="section-title results-list-title">{renting ? "Select a look" : "Select a suit"}</h2>

        <div className="suit-list">
          {shownRecommendations.map((product, index) => {
            const { options, variantIndex, shown } = shownFor(product);
            const isOpen = product.id === openId;
            const isSummarySuit = product.id === selectedId;
            const showLook = !renting && lookCommitted && isSummarySuit;
            const cardLook = showLook ? lookForColor(shown.colorKey, occasion) : null;
            const checks = product.evidence?.slice(0, 3) ?? [];
            return (
              <article className="suit-card" key={product.id}>
                <div className="suit-card-main">
                  <div className="suit-card-media">
                    <div className="product-image">
                      <img src={shown.image} alt="" />
                    </div>
                    <div className="color-swatches" role="group" aria-label="Colors">
                      {options.map((option, optionIndex) => (
                        <button
                          key={option.color}
                          type="button"
                          className={optionIndex === variantIndex ? "color-swatch is-selected" : "color-swatch"}
                          aria-label={optionIndex === variantIndex ? `${option.color}, selected` : option.color}
                          aria-pressed={optionIndex === variantIndex}
                          onClick={() => chooseVariant(product, optionIndex)}
                        >
                          <span style={{ background: SWATCH_HEX[option.colorKey] ?? "#888" }} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="suit-card-copy">
                    <div className="suit-badges">
                      {index === 0 && <span className="match-tag">Best match</span>}
                      {product.matchPercent != null && (
                        <span className={`match-score match-score-${matchTone(product.matchPercent)}`}>
                          {product.matchPercent}% match
                        </span>
                      )}
                    </div>
                    <p className="product-brand">{product.brand}</p>
                    <h3 className="product-title">{product.name}</h3>
                    {renting && (
                      <p className="product-meta">{RENTAL_TYPE_NAMES[product.type]} · Sizes confirmed at your fitting</p>
                    )}
                    {product.rating != null && (
                      <p className="product-rating">
                        <Stars value={product.rating} />
                        <span>{product.rating.toFixed(1)} ({product.reviews.toLocaleString("en-US")})</span>
                      </p>
                    )}
                    {checks.length > 0 && (
                      <div className="match-why">
                        <p className="why-label">{renting ? "Why this look" : "Why this suit"}</p>
                        <ul className="why-list">
                          {checks.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product.matchPercent != null && product.matchPercent < 80 && (
                      <p className="match-reason">
                        {product.tradeoffs?.length
                          ? product.tradeoffs.join(" ")
                          : "A partial match. It lines up on some of your answers, not every one."}
                      </p>
                    )}
                    <button
                      className="button link try-on-link"
                      type="button"
                      onClick={() => setHandoff("tryon")}
                    >
                      Try it on
                    </button>
                    <div className="suit-card-foot">
                      <div className="suit-from">
                        <span className="suit-from-kicker">From</span>
                        <strong>{formatPrice(product.price)}</strong>
                        {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
                        <span className="suit-from-note">{renting ? "rental" : "suit only"}</span>
                        {product.compareAt && <span className="suit-from-sale">Sale price</span>}
                      </div>
                      <button
                        className={`button card-toggle${isOpen ? " secondary" : ""}`}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`options-${product.id}`}
                        onClick={() => toggleOpen(product.id)}
                      >
                        {isOpen ? "Hide options" : "View options"}
                      </button>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="suit-card-options" id={`options-${product.id}`}>
                    {renting ? (
                      <OptionRow label={`Rental package for ${product.brand} ${product.name}`} count={1}>
                        <article className={`rate-card${isSummarySuit ? " is-selected" : ""}`}>
                          <p className="rate-name">{pack?.label ?? "Rental package"}</p>
                          <p className="rate-plain">{pack?.detail ?? "Jacket and pants come with every rental."}</p>
                          <ul className="rate-includes">
                            <li>
                              <img src="/icons/mw/suits-bundle.png" alt="" />
                              <span>Jacket and pants</span>
                            </li>
                            {pieces.map((piece) => (
                              <li key={piece.id}>
                                {piece.icon ? <img src={piece.icon} alt="" /> : <span className="piece-icon-blank" aria-hidden="true" />}
                                <span>{piece.label}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="rate-total">{formatPrice(product.price)} for this rental</p>
                          <button
                            className={`button rate-select${isSummarySuit ? " secondary" : ""}`}
                            type="button"
                            aria-pressed={isSummarySuit}
                            onClick={() => selectRental(product.id)}
                          >
                            {isSummarySuit ? "Selected" : "Select"}
                            <span className="visually-hidden"> {pack?.label ?? "rental package"}</span>
                          </button>
                        </article>
                      </OptionRow>
                    ) : (
                      <>
                        <OptionRow label={`Tailoring for ${product.brand} ${product.name}`} count={BUY_OPTIONS.length}>
                          {BUY_OPTIONS.map((option) => {
                            const outlined = isSummarySuit && tailoringId === option.id;
                            return (
                              <BuyOptionCard
                                key={option.id}
                                option={option}
                                suitPrice={product.price}
                                suggested={suggestTailoring && option.id === summary.tailoring.id}
                                outlined={outlined}
                                committed={lookCommitted && outlined}
                                detailsOpen={Boolean(detailOpen[`${product.id}:${option.id}`])}
                                onToggleDetails={() => toggleDetails(product.id, option.id)}
                                onSelect={() => selectBuyOption(product, option.id)}
                              />
                            );
                          })}
                        </OptionRow>
                        <p className="tier-perks">{TAILORING_PERKS}</p>
                        <button className="button secondary" type="button" onClick={() => setHandoff("tailor")}>
                          Book a tailoring appointment
                        </button>
                        {handoff === "tailor" && isOpen && (
                          <p className="handoff-inline" role="status">
                            Prototype: this would open nearby stores and times for a tailor to pin your suit.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {cardLook && (
                  <CompleteLook
                    look={cardLook}
                    colorName={shown.color}
                    occasionLabel={summary.occasion}
                    addedIds={addedLookIds}
                    onToggle={toggleLook}
                  />
                )}
              </article>
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

        <FitProfile
          answers={answers}
          renting={renting}
          size={size}
          flow={flow}
          onEditAnswers={onEditAnswers}
          onAccount={setHandoff}
          accountStatus={
            handoff === "create-account"
              ? "Prototype: this would create an account and keep this fit profile for later recommendations."
              : handoff === "sign-in"
                ? "Prototype: this would sign you in and keep this fit profile for later recommendations."
                : ""
          }
        />

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
      </section>

      <aside className="order-summary" aria-labelledby="summary-title">
        <h2 id="summary-title">{renting ? "Rental summary" : "Order summary"}</h2>
        {!selected && (
          <p className="summary-empty">
            {renting ? "Select a look to see what's included." : "Select a suit to see your total."}
          </p>
        )}
        {selected && renting && (
          <>
            <p className="summary-suit">{selected.brand} {selected.name}</p>
            <ul className="summary-lines">
              <li><span>Jacket and pants</span></li>
              {pieces.map((piece) => (
                <li key={piece.id}>
                  <span>{piece.label}</span>
                </li>
              ))}
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
                <span>Jacket{size.jacket ? ` · ${String(size.jacket).replace(/[SRL]$/i, "")} ${(size.length || "Regular").toLowerCase()}` : size.length ? ` · ${size.length.toLowerCase()} length` : ""}</span>
                <span className="summary-amount">
                  {selected.jacket.compareAt && <s>{formatPrice(selected.jacket.compareAt)}</s>}
                  {formatPrice(selected.jacket.price)}
                </span>
              </li>
              <li>
                <span>Pants{size.pants ? ` · ${String(size.pants).replace(/W$/i, "")}-inch waist` : ""}</span>
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
              {addedItems.map((item) => (
                <li key={item.id}>
                  <span>{item.type} · {item.color}</span>
                  <span className="summary-line-actions">
                    <span className="summary-amount">{formatPrice(item.price)}</span>
                    <button className="text-link" type="button" onClick={() => toggleLook(item.id)}>
                      Remove<span className="visually-hidden"> {item.name}</span>
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <ul className="summary-lines summary-totals">
              <li><span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span><span className="summary-amount">{formatPrice(subtotal)}</span></li>
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
            <p className="handoff-inline" role="status">{checkoutNote}</p>
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
