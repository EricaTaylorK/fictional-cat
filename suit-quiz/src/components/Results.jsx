import { useEffect, useMemo, useState } from "react";
import {
  lookForColor,
  SWATCH_HEX,
  TAILORING_PERKS,
  TAILORING_TIERS,
} from "../data/products.js";
import { colorsIn, getQuestionFlow, resolvedOccasion } from "../data/quizConfig.js";
import { RENTAL_PACKAGES, RENTAL_STEPS, RENTAL_TYPE_NAMES } from "../data/rentals.js";
import {
  buildResultSummary,
  formatDate,
  formatPrice,
  getRecommendations,
  getRentalRecommendations,
  parseHeight,
} from "../lib/recommendation.js";
const SUIT_ONLY = {
  id: "none",
  name: "Suit only",
  detail: "The suit as it is, with no tailoring added.",
  price: 0,
  items: [],
  icon: "/icons/mw/suits-bundle.png",
};

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

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
    </svg>
  );
}

function useNarrowStage() {
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return narrow;
}

function isInnerControl(event) {
  return event.target !== event.currentTarget && Boolean(event.target.closest("button, a, input, label, select, textarea"));
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

function titleWords(value) {
  if (!value) return "";
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function jacketFact(size, renting) {
  if (size?.jacket) {
    const chest = String(size.jacket).replace(/[SRL]$/i, "");
    return `${chest} ${titleWords(size.length || "Regular")}`;
  }
  if (size?.length) return `${titleWords(size.length)} length`;
  return renting ? "Confirmed at your fitting" : "Measured in store";
}

function pantsFact(size, renting) {
  if (size?.pants) return `${String(size.pants).replace(/W$/i, "")}-inch waist`;
  return renting ? "Confirmed at your fitting" : "Measured in store";
}

function jacketWords(size, renting) {
  return jacketFact(size, renting);
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

function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 3.2 6.8 8.4h3.2V15h4V8.4h3.2L12 3.2ZM5 14v6h14v-6h2v8H3v-8h2Z" />
    </svg>
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

function TailoringOptions({ suggestedId, tailoringId, suitOnly, onSelect }) {
  return (
    <div className="rail-block">
      {suitOnly && (
        <p className="rail-note">Suit only until you choose a tailoring option.</p>
      )}
      <div className="rate-row" role="radiogroup" aria-label="Tailoring options">
        {TAILORING_TIERS.map((option) => {
          const suggested = option.id === suggestedId;
          const selected = option.id === tailoringId;
          return (
            <label className={`rate-card rate-choice${selected ? " is-selected" : ""}${suggested ? " is-suggested" : ""}`} key={option.id}>
              <input
                className="visually-hidden"
                type="radio"
                name="tailoring-tier"
                value={option.id}
                checked={selected}
                onChange={() => onSelect(option.id)}
              />
              {suggested && <span className="tier-tag">Best value</span>}
              <img className="rate-choice-icon" src={option.icon} alt="" />
              <span className="rate-choice-copy">
                <span className="rate-name">{option.name}</span>
                <span className="rate-plain">{option.detail}</span>
              </span>
              <span className="rate-choice-price">{formatPrice(option.price)}</span>
            </label>
          );
        })}
      </div>
      <p className="tier-perks">{TAILORING_PERKS}</p>
    </div>
  );
}

function RentalPackage({ pack, pieces, price }) {
  return (
    <div className="rail-block">
      <article className="rate-card rental-package">
        <h3 className="rate-name">{pack?.label ?? "Rental package"}</h3>
        <p className="rate-plain">{pack?.detail ?? "Jacket and pants come with every rental."}</p>
        <ul className="rate-includes">
          <li className="rate-include">
            <img src="/icons/mw/suits-bundle.png" alt="" />
            <span>Jacket and pants</span>
          </li>
          {pieces.map((piece) => (
            <li className="rate-include" key={piece.id}>
              {piece.icon ? <img src={piece.icon} alt="" /> : <span className="piece-icon-blank" aria-hidden="true" />}
              <span>{piece.label}</span>
            </li>
          ))}
        </ul>
        <p className="rate-total">{formatPrice(price)} for this rental</p>
      </article>
    </div>
  );
}

function CompleteLook({ id, look, addedIds, onToggle }) {
  return (
    <section className="complete-look" aria-labelledby={id}>
      <div className="look-head">
        <h3 id={id} className="complete-look-title">Complete the look</h3>
        <p className="look-optional">Optional add-ons</p>
      </div>
      <ul className="look-list">
        {look.items.map((item) => {
          const added = addedIds.includes(item.id);
          return (
            <li key={item.id}>
              <div className={`look-row${added ? " is-added" : ""}`}>
                {item.icon ? (
                  <img className="look-thumb" src={item.icon} alt="" />
                ) : (
                  <span className="look-thumb look-thumb-blank" aria-hidden="true" />
                )}
                <div className="look-copy">
                  <p className="look-color">{item.color}</p>
                  <p className="look-name">{item.name}</p>
                  <p className="look-price">{formatPrice(item.price)}</p>
                  {added && (
                    <p className="look-meta">
                      Qty: 1 · {item.color}{" "}
                      <button className="text-link look-edit" type="button">Edit</button>
                    </p>
                  )}
                </div>
                <button
                  className={`look-check${added ? " is-on" : ""}`}
                  type="button"
                  aria-pressed={added}
                  aria-label={added ? `Remove ${item.name}` : `Add ${item.name}`}
                  onClick={() => onToggle(item.id)}
                >
                  {added && <CheckIcon />}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
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
  const personal = [
    height ? { key: "Height", value: height } : null,
    sources.shirt && everyday.shirt ? { key: "Usual shirt", value: everyday.shirt } : null,
    sources.waist && everyday.waist ? { key: "Usual waist", value: everyday.waist } : null,
  ].filter(Boolean);
  const groups = [
    personal.length
      ? { label: "Personal info", lines: personal, step: height ? "height" : "everydaySizes" }
      : null,
    {
      label: "Size",
      lines: [
        { key: "Jacket", value: jacketWords(size, renting) },
        { key: "Pants", value: pantsWords(size, renting) },
      ],
      step: sizeEditStep(answers, "jacket") ?? sizeEditStep(answers, "pants"),
    },
    suitFit ? { label: "Fit preference", lines: [{ key: "Suit fit", value: suitFit }], step: "feel" } : null,
    { label: "Fit notes", text: fitNoteText(answers), step: notesStep },
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
    <section className="fit-band" aria-labelledby="fit-profile-title">
      <div className="fit-card">
        <h2 id="fit-profile-title" className="fit-card-title">Your fit profile</h2>
        {groups.map((group) => {
          const onEdit = onEditAnswers && group.step && flow.includes(group.step)
            ? () => onEditAnswers(group.step)
            : null;
          return (
            <div className="fit-group" key={group.label}>
              <div className="fit-group-body">
                <p className="fit-group-label">{group.label}</p>
                {group.lines ? (
                  group.lines.map((line) => (
                    <p className="fit-group-line" key={line.key}>
                      <strong>{line.key}:</strong> {line.value}
                    </p>
                  ))
                ) : (
                  <p className="fit-group-line">{group.text}</p>
                )}
              </div>
              {onEdit && (
                <button className="fit-edit" type="button" onClick={onEdit} aria-label={`Edit ${group.label.toLowerCase()}`}>
                  <PencilIcon />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="fit-save">
        <h2 className="fit-save-title">Save your fit profile</h2>
        <p className="fit-save-copy">{saveCopy}</p>
        <ul className="fit-profile-benefits">
          {benefits.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="fit-profile-actions">
          <button className="button button-charcoal" type="button" onClick={() => onAccount("create-account")}>Create an account</button>
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
  const skipTailoring = answers.tailoring === "skip";
  const suggestedTierId = TAILORING_TIERS.some((tier) => tier.id === summary.tailoring?.id)
    ? summary.tailoring.id
    : SUIT_ONLY.id;
  const [selectedId, setSelectedId] = useState(() => recommendations[0]?.id ?? null);
  const [detailsId, setDetailsId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [variantIndexes, setVariantIndexes] = useState({});
  const [tailoringId, setTailoringId] = useState(skipTailoring ? SUIT_ONLY.id : suggestedTierId);
  const [addedLookIds, setAddedLookIds] = useState([]);
  const [handoff, setHandoff] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const narrow = useNarrowStage();

  useEffect(() => {
    if (!summaryOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setSummaryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [summaryOpen]);

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

  function chooseVariant(product, index) {
    setVariantIndexes((current) => ({ ...current, [product.id]: index }));
    if (renting || product.id !== selectedId) return;
    const options = variantOptions(product);
    const shown = options[index] ?? options[0];
    setAddedLookIds((current) => compatibleLookIds(shown?.colorKey, current));
  }

  function selectSuit(product) {
    if (product.id === selectedId) return;
    if (renting) {
      setSelectedId(product.id);
      return;
    }
    const { shown } = shownFor(product);
    setSelectedId(product.id);
    setTailoringId(skipTailoring ? SUIT_ONLY.id : suggestedTierId);
    setAddedLookIds(compatibleLookIds(shown?.colorKey, []));
  }

  function onCardClick(event, product) {
    if (isInnerControl(event)) return;
    selectSuit(product);
  }

  function toggleLook(id) {
    setAddedLookIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  }

  const checkoutNote = renting
    ? "Prototype: this would reserve the look and its pieces for your event date."
    : `Prototype: this would add the suit in your sizes${
      [tailoring ? "the tailoring" : null, addedItems.length ? "the pieces you added" : null].filter(Boolean).length
        ? ` and ${[tailoring ? "the tailoring" : null, addedItems.length ? "the pieces you added" : null].filter(Boolean).join(" and ")}`
        : ""
    } to your bag.${tailoring ? " After checkout, the next step books your tailoring appointment." : ""}`;
  const barTotal = selected ? (renting ? selected.price : total) : null;
  const optionsRail = selected ? (
    <aside className="results-rail" aria-label={`Options for ${selected.brand} ${selected.name}`}>
      {renting ? (
        <RentalPackage pack={pack} pieces={pieces} price={selected.price} />
      ) : (
        <>
          <TailoringOptions
            suggestedId={skipTailoring ? null : suggestedTierId}
            tailoringId={tailoringId}
            suitOnly={skipTailoring && tailoringId === SUIT_ONLY.id}
            onSelect={setTailoringId}
          />
          {selectedLook && (
            <CompleteLook
              id={`complete-look-${selected.id}`}
              look={selectedLook}
              addedIds={addedLookIds}
              onToggle={toggleLook}
            />
          )}
        </>
      )}
    </aside>
  ) : null;

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
              <button className="results-hero-action" type="button">
                <ShareIcon />
                Share results
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
          <div className="hero-facts">
            <div className="hero-fact">
              <div>
                <p className="hero-fact-label">Your sizes</p>
                <p className="hero-fact-value">Jacket: {jacketFact(size, renting)} · Pants: {pantsFact(size, renting)}</p>
              </div>
            </div>
            <div className="hero-fact">
              <div>
                <p className="hero-fact-label">Your fit</p>
                <p className="hero-fact-value">{titleWords(summary.fitName)}</p>
              </div>
            </div>
            <div className="hero-fact">
              <div>
                <p className="hero-fact-label">{renting ? "Package" : "Suggested tailoring"}</p>
                <p className="hero-fact-value">
                  {renting
                    ? (pack?.label ?? "Rental package")
                    : (answers.tailoring === "skip"
                      ? "Suit only"
                      : (TAILORING_TIERS.find((tier) => tier.id === summary.tailoring?.id)?.plain ?? "Suit only"))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {recommendations.budgetMiss && (
          <p className="budget-alert" role="status">
            <span className="budget-alert-mark" aria-hidden="true">!</span>
            <span>{recommendations.budgetMiss.label}</span>
          </p>
        )}

        <div className="results-stage">
          <div className="results-list">
          <h2 className="section-title results-list-title">Your matches are in</h2>
          {shownRecommendations.map((product, index) => {
            const { options, variantIndex, shown } = shownFor(product);
            const isSummarySuit = product.id === selectedId;
            const detailsOpen = product.id === detailsId;
            const checks = product.evidence?.slice(0, 3) ?? [];
            return (
              <article className={`suit-card${isSummarySuit ? " is-selected" : ""}`} key={product.id}>
                <div className="suit-card-face">
                <div className="suit-card-main" onClick={(event) => onCardClick(event, product)}>
                  <div className="suit-card-media">
                    <div className="product-image">
                      <img src={shown.image} alt="" />
                    </div>
                  </div>
                  <div className="suit-card-copy">
                    <div className="suit-card-top">
                      <div className="suit-badges">
                        {product.matchPercent != null ? (
                          <span className={`match-score match-score-${matchTone(product.matchPercent)}`}>
                            {product.matchPercent}% match
                          </span>
                        ) : index === 0 ? (
                          <span className="match-tag">Best match</span>
                        ) : null}
                      </div>
                      <button
                        className="text-link suit-details-toggle"
                        type="button"
                        aria-expanded={detailsOpen}
                        aria-controls={`details-${product.id}`}
                        onClick={() => setDetailsId(detailsOpen ? null : product.id)}
                      >
                        {detailsOpen ? "Hide details" : "View more details"}
                      </button>
                    </div>
                    {options.length > 1 && (
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
                    )}
                    <p className="product-brand">{product.brand}</p>
                    <h3 className="product-title">
                      <button
                        className="product-choose"
                        type="button"
                        aria-pressed={isSummarySuit}
                        onClick={() => selectSuit(product)}
                      >
                        {product.name}
                      </button>
                    </h3>
                    <p className="suit-price">
                      <strong>{formatPrice(product.price)}</strong>
                      {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
                    </p>
                    {product.compareAt && <p className="suit-clearance">Clearance</p>}
                    {renting && (
                      <p className="product-meta">{RENTAL_TYPE_NAMES[product.type]} · Sizes confirmed at your fitting</p>
                    )}
                    {product.rating != null && (
                      <p className="product-rating">
                        <Stars value={product.rating} />
                        <span>{product.rating.toFixed(1)} ({product.reviews.toLocaleString("en-US")})</span>
                      </p>
                    )}
                    <button className="button suit-options" type="button" onClick={() => selectSuit(product)}>
                      {renting ? "Choose this look" : "Choose suit options"}
                    </button>
                    {detailsOpen && (
                      <div className="suit-details" id={`details-${product.id}`}>
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
                          onClick={() => setHandoff(`tryon:${product.id}`)}
                        >
                          Try it on
                        </button>
                        {handoff === `tryon:${product.id}` && (
                          <p className="handoff-inline" role="status">Prototype: this would open nearby stores with this suit in your size.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                </div>
                {narrow && isSummarySuit && optionsRail}
              </article>
            );
          })}

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
          </div>
          {!narrow && optionsRail}
        </div>

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

      <div className="summary-dock">
        {summaryOpen && (
          <div className="summary-panel" id="summary-panel" role="region" aria-labelledby="summary-title">
            <div className="summary-panel-head">
              <h2 id="summary-title">{renting ? "Rental summary" : "Order summary"}</h2>
              <button className="text-link" type="button" onClick={() => setSummaryOpen(false)}>Close</button>
            </div>
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
            {handoff === "checkout" && (
              <p className="handoff-inline" role="status">{checkoutNote}</p>
            )}
          </div>
        )}
        <div className="summary-bar">
          <div className="summary-bar-info">
            <p className="summary-bar-name">{selected ? `${selected.brand} ${selected.name}` : renting ? "Select a look" : "Select a suit"}</p>
            <button
              className="text-link summary-bar-toggle"
              type="button"
              aria-expanded={summaryOpen}
              aria-controls="summary-panel"
              onClick={() => setSummaryOpen((value) => !value)}
            >
              {summaryOpen ? "Hide summary" : "View summary"}
            </button>
          </div>
          {barTotal != null && (
            <p className="summary-bar-total" aria-live="polite">
              <span>Total</span>
              <strong>{formatPrice(barTotal)}</strong>
            </p>
          )}
          <button
            className="button summary-bar-cta"
            type="button"
            disabled={!selected}
            onClick={() => {
              setHandoff("checkout");
              setSummaryOpen(true);
            }}
          >
            {renting ? "Reserve this look" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
