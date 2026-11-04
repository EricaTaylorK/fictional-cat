import { useEffect, useMemo, useRef, useState } from "react";
import {
  lookForColor,
  SWATCH_HEX,
  TAILORING_TIERS,
} from "../data/products.js";
import { colorsIn, occasionOptions, questions, resolvedOccasion } from "../data/quizConfig.js";
import { RENTAL_PACKAGES, RENTAL_STEPS, RENTAL_TYPE_NAMES } from "../data/rentals.js";
import {
  buildResultSummary,
  formatDate,
  formatPrice,
  getRecommendations,
  getRentalRecommendations,
  parseHeight,
  rentalDates,
} from "../lib/recommendation.js";
const NO_HEM = {
  id: "no-hem",
  name: "No tailoring",
  detail: "The suit as it is. You can add tailoring later.",
  price: 0,
};

const TAILORING_CHOICES = [NO_HEM, ...TAILORING_TIERS];

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

function quizOptionLabel(question, value, answers) {
  if (value == null || value === "") return null;
  const options = question.id === "occasion" ? occasionOptions(question, answers ?? {}) : (question.options ?? []);
  return options.find((option) => option.value === value)?.label ?? null;
}

function colorAnswerLabel(values) {
  const labels = (values ?? []).map((value) => (
    questions.colors.options.find((option) => option.value === value)?.label
  )).filter(Boolean);
  return labels.length ? labels.join(" · ") : null;
}

function fitProfileRows({ answers, renting, size, fitName }) {
  const height = heightLabel(answers.height);
  const everyday = answers.everydaySizes ?? {};
  const jacketValue = size?.jacket ? jacketFact(size, renting) : null;
  const waistNumber = size?.pants ? String(size.pants).replace(/W$/i, "") : null;
  const fit = fitName ? titleWords(fitName) : null;
  const personal = [
    height,
    jacketValue ? `Jacket ${jacketValue}` : null,
    waistNumber ? `Waist ${waistNumber}"` : null,
    !jacketValue && everyday.shirt ? `Shirt ${everyday.shirt}` : null,
    !waistNumber && everyday.waist ? `Waist ${everyday.waist}` : null,
  ].filter(Boolean);
  const usual = [
    everyday.shirt && !personal.some((part) => part.includes(`Shirt ${everyday.shirt}`)) ? `Shirt ${everyday.shirt}` : null,
    everyday.waist && !personal.some((part) => part.includes(String(everyday.waist))) ? `Waist ${everyday.waist}` : null,
  ].filter(Boolean);
  const notes = [
    ...selectedIssues(answers.fitIssues).map((issue) => FIT_NOTE_COPY[issue]),
    ...selectedIssues(answers.pantsFit).map((issue) => FIT_NOTE_COPY[issue]),
  ].filter(Boolean);
  const event = formatDate(rentalDates(answers.eventDate)?.event);
  const pack = RENTAL_PACKAGES.find((item) => item.id === Number(answers.pieces));
  return [
    personal.length ? { label: "Personal info", value: personal.join(" · ") } : null,
    usual.length ? { label: "Usual sizes", value: usual.join(" · ") } : null,
    fit ? { label: "Fit preference", value: fit } : null,
    notes.length ? { label: "Fit notes", value: `${notes.join(". ")}.` } : null,
    quizOptionLabel(questions.occasion, answers.occasion, answers) ? { label: "Occasion", value: quizOptionLabel(questions.occasion, answers.occasion, answers) } : null,
    colorAnswerLabel(answers.colors?.prefer) ? { label: "Colors", value: colorAnswerLabel(answers.colors.prefer) } : null,
    colorAnswerLabel(answers.colors?.avoid) ? { label: "Colors to avoid", value: colorAnswerLabel(answers.colors.avoid) } : null,
    quizOptionLabel(questions.budget, answers.budget) ? { label: "Budget", value: quizOptionLabel(questions.budget, answers.budget) } : null,
    quizOptionLabel(questions.tailoring, answers.tailoring) ? { label: "Tailoring", value: quizOptionLabel(questions.tailoring, answers.tailoring) } : null,
    event ? { label: "Event date", value: event } : null,
    renting && pack ? { label: "Package", value: pack.label } : null,
  ].filter(Boolean);
}

function heightLabel(height) {
  const parsed = parseHeight(height);
  if (!parsed) return null;
  return `${parsed.feet}'${parsed.inches}"`;
}

function PencilIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
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

function matchChips(product, shown, answers) {
  const options = [...(questions.occasion.options ?? []), ...(questions.occasion.rentOptions ?? [])];
  const occasion = options.find((option) => option.value === answers.occasion)?.label;
  return [...new Set([shown?.color || product.color, product.fitName, occasion].filter(Boolean))].slice(0, 3);
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

const SHIRT_SIZES = ["15 32/33", "15.5 32/33", "16 32/33", "16.5 33/34", "17 33/34"];
const TIE_SIZES = ["Regular", "Extra long"];
const SHOE_SIZES = ["8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"];
const SHIRT_SERVICES = [
  { id: "press", label: "Press" },
  { id: "shorten-sleeves", label: "Shorten sleeves" },
];

function lookKind(item) {
  return `${item?.type || ""} ${item?.name || ""}`.toLowerCase();
}

function preferredLookSize(item, answers) {
  const sizes = sizesForLookItem(item);
  const everyday = answers?.everydaySizes ?? {};
  const measurements = answers?.measurements ?? {};
  const candidates = [everyday.shirt, everyday.shoe, measurements.shirt, measurements.neck, measurements.shoe]
    .filter(Boolean)
    .map(String);
  return candidates.find((value) => sizes.includes(value)) || "";
}

function sizesForLookItem(item) {
  const kind = lookKind(item);
  if (kind.includes("shirt")) return SHIRT_SIZES;
  if (kind.includes("tie")) return TIE_SIZES;
  if (kind.includes("shoe")) return SHOE_SIZES;
  return ["One size"];
}

function servicesForLookItem(item) {
  return lookKind(item).includes("shirt") ? SHIRT_SERVICES : [];
}

function serviceLabels(item, ids) {
  const catalog = servicesForLookItem(item);
  return (ids ?? [])
    .map((id) => catalog.find((service) => service.id === id)?.label)
    .filter(Boolean);
}

function joinPhrases(phrases) {
  if (phrases.length <= 1) return phrases[0] || "";
  if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`;
  return `${phrases.slice(0, -1).join(", ")}, and ${phrases[phrases.length - 1]}`;
}

function stylistLookLine(suitColor, suitName, items) {
  if (!items?.length) return "";
  const color = String(suitColor || "suit").replace(/\s+/g, " ").trim().toLowerCase();
  const pieces = joinPhrases(items.map((item) => `${item.color} ${item.name}`.replace(/\s+/g, " ").trim().toLowerCase()));
  const lead = `Styled to finish this ${color} suit: a ${pieces}.`;
  return suitName ? `${lead} Chosen for the ${suitName}.` : lead;
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

function ShuffleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16.4 4.2 20 7.6l-3.6 3.4-1.1-1.2 1.2-1.1H14c-.8 0-1.6.4-2.1 1L9.7 12l2.2 2.3c.5.6 1.3 1 2.1 1h2.5l-1.2-1.1 1.1-1.2 3.6 3.4-3.6 3.4-1.1-1.2 1.2-1.1H14c-1.4 0-2.7-.7-3.5-1.8L8.6 13.4 7 15.1c-.5.6-1.3 1-2.1 1H3v-1.6h1.9c.3 0 .6-.2.8-.4l1.9-2.1-1.9-2.1c-.2-.2-.5-.4-.8-.4H3V7.4h1.9c.8 0 1.6.4 2.1 1l1.6 1.7 1.9-2c.8-1.1 2.1-1.7 3.5-1.7h2.5l-1.2-1.1 1.1-1.1Z" />
    </svg>
  );
}

function ChevronIcon({ open = false }) {
  return (
    <svg className={open ? "is-open" : undefined} width="14" height="8" viewBox="0 0 14 8" aria-hidden="true">
      <path fill="currentColor" d="M1.2 1.3 7 6.7l5.8-5.4-1.1-1.2L7 4.4 2.3.1 1.2 1.3Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="more-matches-plus" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="2" fill="#3A3A3A" />
      <rect x="11" y="5" width="2" height="14" fill="#3A3A3A" />
    </svg>
  );
}

const CARD_TAILORING = [
  {
    id: "essentials",
    name: "Fit Essentials",
    price: 55,
    body: "We'll hem the pants and adjust sleeve length for a clean, finished look.",
    icon: "hem",
  },
  {
    id: "signature",
    name: "Signature Fit",
    price: 100,
    recommended: true,
    body: "Everything in Essentials, plus we shape the jacket and waist so you look sharper.",
    icon: "jacket",
  },
  {
    id: "signature-shield",
    name: "Signature Fit",
    price: 100,
    body: "Everything in Essentials, plus we shape the jacket and waist so you look sharper.",
    icon: "shield",
  },
];

function TailorGlyph({ name }) {
  if (name === "jacket") {
    return (
      <svg className="tailor-glyph" viewBox="0 0 40 40" aria-hidden="true">
        <path fill="#B9CADD" d="M8 14 14 8h12l6 6-4 3-4-4v19H12V13l-4 4-0-3Z" />
        <path fill="none" stroke="#232323" strokeWidth="1.4" d="M14 8h12l6 6-4 3-4-4v19H12V13l-4 4-4-3 6-6Z" />
        <path fill="none" stroke="#046DE9" strokeDasharray="2 2" strokeWidth="1.2" d="M20 14v14M16 22h8" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg className="tailor-glyph" viewBox="0 0 40 40" aria-hidden="true">
        <path fill="#B9CADD" d="M20 6 32 11v9c0 7.2-5 12.4-12 15-7-2.6-12-7.8-12-15v-9L20 6Z" />
        <path fill="none" stroke="#232323" strokeWidth="1.4" d="M20 6 32 11v9c0 7.2-5 12.4-12 15-7-2.6-12-7.8-12-15v-9L20 6Z" />
        <path fill="none" stroke="#046DE9" strokeWidth="1.6" d="m15 20 3.2 3.2L25 16.5" />
      </svg>
    );
  }
  return (
    <svg className="tailor-glyph" viewBox="0 0 40 40" aria-hidden="true">
      <path fill="#B9CADD" d="M15 7h10l2 16-3 2v8H16v-8l-3-2 2-16Z" />
      <path fill="none" stroke="#232323" strokeWidth="1.4" d="M15 7h10l2 16-3 2v8H16v-8l-3-2 2-16Z" />
      <path fill="none" stroke="#046DE9" strokeWidth="1.4" d="M14 23h12M16 29h8" />
    </svg>
  );
}

function SuitOptions({ tailoringId, onTailoring, look, addedLooks, onToggleLook }) {
  const items = look?.items ?? [];
  return (
    <>
      <div className="expand-head">
        <h3>Add Tailoring</h3>
        <p>Optional Add Ons</p>
      </div>
      <div className="tailor-row">
        {CARD_TAILORING.map((option) => {
          const selected = tailoringId === option.id;
          return (
            <article className={`tailor-card${option.recommended ? " is-recommended" : ""}`} key={option.id}>
              {option.recommended && <span className="tailor-badge">Recommended</span>}
              <button
                className={`tailor-add${selected ? " is-on" : ""}`}
                type="button"
                aria-pressed={selected}
                aria-label={selected ? `Remove ${option.name}` : `Add ${option.name}`}
                onClick={() => onTailoring(option.id)}
              >
                {selected ? (
                  <svg viewBox="0 0 14 14" aria-hidden="true">
                    <path fill="currentColor" d="M5.2 10.4 2.1 7.3 1 8.4l4.2 4.2L13 4.8 11.9 3.7 5.2 10.4Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 14 14" aria-hidden="true">
                    <path fill="currentColor" d="M6 1h2v5h5v2H8v5H6V8H1V6h5V1Z" />
                  </svg>
                )}
              </button>
              <TailorGlyph name={option.icon} />
              <h4>{option.name}</h4>
              <p>{option.body}</p>
              <strong>{formatPrice(option.price)}</strong>
            </article>
          );
        })}
      </div>
      {items.length > 0 && (
        <>
          <div className="expand-divider" />
          <div className="pair-head">
            <h3>Your look, pulled together</h3>
            <p>We chose these pieces to complement this suit, based on your quiz answers.</p>
          </div>
          <div className="pair-row">
            {items.map((item) => {
              const checked = Boolean(addedLooks[item.id]);
              const title = `${item.color} ${item.name}`.replace(/\s+/g, " ").trim();
              return (
                <label className={`pair-card${checked ? " is-on" : ""}`} key={item.id}>
                  <img src={item.image} alt="" />
                  <span className="pair-copy">
                    <span className="pair-brand">Men's Wearhouse</span>
                    <span className="pair-name">{title}</span>
                    <span className="pair-price">{formatPrice(item.price)}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    aria-label={`${checked ? "Remove" : "Add"} ${title}`}
                    onChange={() => onToggleLook(item)}
                  />
                </label>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

function MatchRing({ percent }) {
  const scored = Number.isFinite(percent);
  const turn = scored ? Math.max(0, Math.min(100, percent)) : 0;
  // Centerline of the Figma 178 donut: outer radius ~84.7, inner ~60, stroke ~24.7.
  const cx = 89.21;
  const cy = 87.21;
  const radius = 72.32;
  const stroke = 24.71;
  const circumference = 2 * Math.PI * radius;
  const capPortion = stroke / circumference;
  const visual = turn / 100;
  const dashPortion = visual >= 1 ? 1 : Math.max(0, visual - capPortion);
  const dash = dashPortion >= 1 ? circumference + 1 : dashPortion * circumference;
  return (
    <div className="match-ring" aria-hidden="true">
      <svg className="match-ring-art" viewBox="0 0 178 178" width="178" height="178">
        <defs>
          <filter id="match-ring-shadow" x="-12" y="-12" width="202" height="206" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend in2="effect1" mode="normal" result="effect2" />
            <feBlend in="SourceGraphic" in2="effect2" mode="normal" />
          </filter>
        </defs>
        <g className="match-ring-track" opacity="0.8">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#D9D9D9" strokeWidth={stroke} />
        </g>
        {turn > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#046DE9"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            filter="url(#match-ring-shadow)"
          />
        )}
      </svg>
      <div className="match-ring-copy">
        {scored ? (
          <>
            <span className="match-ring-value">{percent}%</span>
            <span className="match-ring-label">Match</span>
          </>
        ) : (
          <span className="match-ring-label">Great match</span>
        )}
      </div>
    </div>
  );
}

const OCCASION_PHRASES = {
  wedding: "your upcoming wedding",
  funeral: "a funeral or memorial",
  work: "work",
  business: "work",
  formal: "a black-tie evening",
  milestone: "a graduation or prom",
  versatile: "all-purpose events",
  travel: "travel",
  prom: "prom",
  mixed: "all-purpose events",
  special: "a special event",
};

const FIT_WORDS = {
  close: "slim-fit",
  balanced: "modern-fit",
  roomy: "classic-fit",
};

const FEEL_PRIORITY = {
  roomy: "comfort",
  close: "a sharper shape",
  balanced: "room to move",
};

const ISSUE_PRIORITY = {
  broadShoulders: "your shoulders",
  fullerMidsection: "the waist",
  runsLong: "sleeve length",
  runsShort: "sleeve length",
  athleticBuild: "the waist",
  seatThighs: "the seat and thighs",
};

function preferredColorPhrase(answers) {
  const labels = (answers.colors?.prefer ?? []).slice(0, 2).map((value) => {
    const option = questions.colors.options.find((item) => item.value === value);
    return String(option?.label ?? value).toLowerCase();
  }).filter(Boolean);
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  return `${labels[0]} and ${labels[1]}`;
}

function priorityPhrase(answers) {
  const issues = [...selectedIssues(answers.fitIssues), ...selectedIssues(answers.pantsFit)];
  const fromIssue = issues.map((issue) => ISSUE_PRIORITY[issue]).find(Boolean);
  if (fromIssue) return fromIssue;
  return answers.feel ? FEEL_PRIORITY[answers.feel] ?? "" : "";
}

function matchLede(answers) {
  const occasionKey = resolvedOccasion(answers) || answers.occasion;
  const occasion = occasionKey ? OCCASION_PHRASES[occasionKey] : "";
  const fit = answers.feel ? FIT_WORDS[answers.feel] : "";
  const color = preferredColorPhrase(answers);
  const priority = color ? "" : priorityPhrase(answers);
  const suits = fit ? `${fit} suits` : "suits";
  let sentence = occasion ? `For ${occasion}, we found ${suits}` : `We found ${suits}`;
  if (color) sentence += ` in ${color}`;
  if (priority) sentence += ` that keep ${priority} in mind`;
  return `${sentence}.`;
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

function TailoringOptions({ suggestedId, suggestedReason, tailoringId, onSelect }) {
  return (
    <fieldset className="rail-block tailoring-set">
      <legend className="rail-section-title">Tailoring</legend>
      <div className="rate-row">
        {TAILORING_CHOICES.map((option) => {
          const suggested = option.id === suggestedId;
          const selected = option.id === tailoringId;
          return (
            <label className={`rate-card rate-choice${selected ? " is-selected" : ""}${suggested ? " is-suggested" : ""}`} key={option.id}>
              <input
                className="tier-radio"
                type="radio"
                name="tailoring-tier"
                value={option.id}
                checked={selected}
                onChange={() => onSelect(option.id)}
              />
              <span className="rate-choice-copy">
                <span className="rate-name">
                  {option.name}
                  {suggested && suggestedReason && <span className="tier-tag">{`Recommended · ${suggestedReason}`}</span>}
                </span>
                <span className="rate-plain">{option.detail}</span>
              </span>
              <span className="rate-choice-price">{option.price ? formatPrice(option.price) : "Included"}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
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

function QuickView({ item, initial, suggestedSize = "", onConfirm, onClose }) {
  const dialogRef = useRef(null);
  const sizes = sizesForLookItem(item);
  const services = servicesForLookItem(item);
  const colorChoices = Array.isArray(item.colors) && item.colors.length > 1 ? item.colors : null;
  const [size, setSize] = useState(initial?.size || suggestedSize || "");
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [serviceIds, setServiceIds] = useState(initial?.services ?? []);
  const [colorKey, setColorKey] = useState(initial?.colorKey ?? item.colorKey ?? "");
  const editing = Boolean(initial?.size);
  const shownColor = colorChoices?.find((choice) => choice.colorKey === colorKey)?.color || item.color;

  useEffect(() => {
    const node = dialogRef.current;
    node?.querySelector(".quick-view-close")?.focus();
  }, []);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...node.querySelectorAll("button, select, a[href], input")];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggleValue(current, value) {
    return current === value ? "" : value;
  }

  return (
    <div className="quick-view-backdrop" onClick={onClose}>
      <div
        className="quick-view"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        ref={dialogRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="quick-view-media">
          {item.image || item.icon ? <img src={item.image || item.icon} alt="" /> : <span className="quick-view-media-empty" aria-hidden="true" />}
        </div>
        <div className="quick-view-info">
          {item.brand ? <p className="quick-view-brand">{item.brand}</p> : null}
          <h2 id="quick-view-title">{item.name}</h2>
          {item.rating != null && (
            <p className="quick-view-rating">
              <span className="stars" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={star <= Math.round(item.rating) ? "star is-on" : "star"} viewBox="0 0 20 20">
                    <path d="M10 1.6 12.5 7l5.9.6-4.4 3.9 1.3 5.8L10 14.6 4.7 17.3 6 11.5 1.6 7.6 7.5 7 10 1.6z" />
                  </svg>
                ))}
              </span>
              <span>{Number(item.rating).toFixed(1)}{item.reviews ? ` (${Number(item.reviews).toLocaleString("en-US")})` : ""}</span>
            </p>
          )}
          <p className="quick-view-price">{formatPrice(item.price)}</p>
        </div>
        <div className="quick-view-field">
          <p className="quick-view-label" id="quick-view-color-label">Color</p>
          {colorChoices ? (
            <div className="color-swatches quick-view-swatches" role="group" aria-labelledby="quick-view-color-label">
              {colorChoices.map((choice) => {
                const selected = choice.colorKey === colorKey;
                return (
                  <button
                    key={choice.colorKey}
                    type="button"
                    className={selected ? "color-swatch is-selected" : "color-swatch"}
                    aria-pressed={selected}
                    aria-label={choice.color}
                    onClick={() => setColorKey((current) => toggleValue(current, choice.colorKey))}
                  >
                    <span style={{ background: SWATCH_HEX[choice.colorKey] ?? "#888" }} />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="quick-view-value">{item.color}</p>
          )}
        </div>
        <div className="quick-view-field">
          <p className="quick-view-label" id="quick-view-size-label">Size</p>
          <div className="quick-view-choices" role="group" aria-labelledby="quick-view-size-label">
            {sizes.map((option) => {
              const selected = option === size;
              return (
                <button
                  key={option}
                  type="button"
                  className={selected ? "quick-view-choice is-selected" : "quick-view-choice"}
                  aria-pressed={selected}
                  onClick={() => setSize((current) => toggleValue(current, option))}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        {services.length > 0 && (
          <div className="quick-view-field">
            <p className="quick-view-label" id="quick-view-service-label">Services</p>
            <div className="quick-view-choices" role="group" aria-labelledby="quick-view-service-label">
              {services.map((service) => {
                const selected = serviceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    className={selected ? "quick-view-choice is-selected" : "quick-view-choice"}
                    aria-pressed={selected}
                    onClick={() => setServiceIds((current) => (
                      current.includes(service.id)
                        ? current.filter((id) => id !== service.id)
                        : [...current, service.id]
                    ))}
                  >
                    {service.label}
                  </button>
                );
              })}
            </div>
            <p className="quick-view-note">Optional. No charge added here.</p>
          </div>
        )}
        <label className="quick-view-qty" htmlFor="quick-view-qty">
          <span className="quick-view-label">Quantity</span>
          <select
            id="quick-view-qty"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          >
            {[1, 2, 3].map((qty) => (
              <option key={qty} value={qty}>{qty}</option>
            ))}
          </select>
        </label>
        <button
          className="button quick-view-add"
          type="button"
          aria-disabled={!size}
          onClick={() => {
            if (!size) return;
            onConfirm({
              size,
              quantity,
              services: serviceIds,
              colorKey: colorKey || item.colorKey,
              color: shownColor,
            });
          }}
        >
          {editing ? "Update look" : "Add Product to Look"}
        </button>
        <button className="quick-view-close" type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}

function CompleteLook({ id, look, suitColor, suitName, addedLooks, onOpen, onRemove }) {
  const lede = stylistLookLine(suitColor, suitName, look.items);
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? look.items : look.items.slice(0, 3);
  const hiddenCount = look.items.length - visibleItems.length;
  return (
    <section className="complete-look" aria-labelledby={id}>
      <div className="look-head">
        <h3 id={id} className="complete-look-title">Complete the look</h3>
        <p className="look-optional">Optional add-ons</p>
      </div>
      {lede && <p className="look-lede">{lede}</p>}
      <ul className="look-list">
        {visibleItems.map((item) => {
          const selection = addedLooks[item.id];
          const added = Boolean(selection);
          const services = added ? serviceLabels(item, selection.services) : [];
          return (
            <li key={item.id}>
              <div
                className={`look-row${added ? " is-added" : ""}`}
                onClick={(event) => {
                  if (added) return;
                  if (event.target.closest(".look-check, .look-edit, .look-promo")) return;
                  onOpen(item, event);
                }}
              >
                {item.image || item.icon ? (
                  <img className="look-thumb" src={item.image || item.icon} alt="" />
                ) : (
                  <span className="look-thumb look-thumb-blank" aria-hidden="true" />
                )}
                <div className="look-copy">
                  <p className="look-name">{item.color} {item.name}</p>
                  <p className="look-price">{formatPrice(item.price)}</p>
                  {item.promo && (
                    <p className="look-promo" onClick={(event) => event.stopPropagation()}>{item.promo}</p>
                  )}
                  {added && (
                    <p className="look-meta">
                      Size {selection.size} · {selection.color || item.color}
                      {selection.quantity > 1 ? ` · Qty ${selection.quantity}` : ""}
                      {services.length > 0 ? ` · ${services.join(", ")}` : ""}
                      {" "}
                      <button
                        className="text-link look-edit"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpen(item, event);
                        }}
                      >
                        Edit
                      </button>
                    </p>
                  )}
                </div>
                <button
                  className={`look-check${added ? " is-on" : ""}`}
                  type="button"
                  aria-pressed={added}
                  aria-label={added ? `Remove ${item.name}` : `View ${item.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (added) onRemove(item.id);
                    else onOpen(item, event);
                  }}
                >
                  <span className="look-check-box" aria-hidden="true">{added && <CheckIcon />}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {hiddenCount > 0 && (
        <button className="text-link look-more" type="button" onClick={() => setShowAll(true)}>
          See more ({hiddenCount})
        </button>
      )}
    </section>
  );
}

function FitProfile({ answers, renting, size, fitName, onEditAnswers, onAccount, accountStatus }) {
  const rows = fitProfileRows({ answers, renting, size, fitName });
  const benefits = [
    "Find suits in your size and preferred fit.",
    "Explore styles for your occasion, colors, and budget.",
    "Get tailoring suggestions and coordinating pieces to complete the look.",
  ];
  const saveCopy = "Create an account to save your suit profile. We\u2019ll use your size, fit, occasion, color, and budget preferences to make suit recommendations more relevant\u2014and guide tailoring and styling suggestions for the full look.";

  return (
    <section className="fit-band" aria-labelledby="fit-profile-title">
      <div className="fit-card">
        <div className="fit-card-head">
          <h2 id="fit-profile-title" className="fit-card-title">Your suit profile</h2>
          {onEditAnswers && (
            <button className="results-hero-action" type="button" onClick={() => onEditAnswers()}>
              <PencilIcon />
              Edit answers
            </button>
          )}
        </div>
        {rows.map((row) => (
          <div className="fit-group" key={row.label}>
            <p className="fit-group-label">{row.label}</p>
            <p className="fit-group-line">{row.value}</p>
          </div>
        ))}
      </div>
      <div className="fit-save">
        <h2 className="fit-save-title">Save your suit profile</h2>
        <p className="fit-save-copy">{saveCopy}</p>
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

export default function Results({ answers, moreMode = "toggle", onSeeAll, onEditAnswers, onRestart, onViewDetails }) {
  const renting = answers.mode === "rent";
  const recommendations = useMemo(() => {
    const list = renting ? getRentalRecommendations(answers) : getRecommendations(answers);
    if (!list?.length) return list;
    let topIndex = 0;
    list.forEach((item, index) => {
      if ((item.matchPercent ?? -1) > (list[topIndex].matchPercent ?? -1)) topIndex = index;
    });
    if (topIndex === 0) return list;
    const next = [list[topIndex], ...list.filter((_, index) => index !== topIndex)];
    if (list.budgetMiss) next.budgetMiss = list.budgetMiss;
    return next;
  }, [answers, renting]);
  const summary = useMemo(() => buildResultSummary(answers), [answers]);
  const suggestedTierId = TAILORING_TIERS.some((tier) => tier.id === summary.tailoring?.id)
    ? summary.tailoring.id
    : NO_HEM.id;
  const defaultTierId = answers.tailoring === "bundle" && suggestedTierId !== NO_HEM.id ? suggestedTierId : NO_HEM.id;
  const [openId, setOpenId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [variantIndexes, setVariantIndexes] = useState({});
  const [tailoringId, setTailoringId] = useState(defaultTierId);
  const firstNewCardRef = useRef(null);
  const focusNewCard = useRef(false);
  const [addedLooks, setAddedLooks] = useState({});
  const [quickViewId, setQuickViewId] = useState(null);
  const quickViewTrigger = useRef(null);
  const [handoff, setHandoff] = useState("");
  const followedId = openId ?? recommendations[0]?.id ?? null;

  useEffect(() => {
    if (!expanded || !focusNewCard.current) return;
    focusNewCard.current = false;
    firstNewCardRef.current?.focus();
  }, [expanded]);

  useEffect(() => {
    setTailoringId(defaultTierId);
    setAddedLooks({});
    setQuickViewId(null);
  }, [followedId, defaultTierId]);

  const selected = recommendations.find((product) => product.id === followedId) ?? null;
  const size = summary.sizeEstimate;
  const dates = summary.dates;
  const pack = RENTAL_PACKAGES.find((item) => item.id === Number(answers.pieces));
  const pieces = summary.pieces;
  const tailoring = CARD_TAILORING.find((item) => item.id === tailoringId) ?? null;
  const visibleCount = expanded ? Math.min(recommendations.length, 9) : Math.min(3, recommendations.length);
  const visibleRecommendations = recommendations.slice(0, visibleCount);
  const shownRecommendations = selected && !visibleRecommendations.some((product) => product.id === selected.id)
    ? [...visibleRecommendations, selected]
    : visibleRecommendations;
  const occasion = resolvedOccasion(answers);
  const lede = matchLede(answers);
  const ringPercent = Number.isFinite(selected?.matchPercent) ? selected.matchPercent : null;

  const selectedOptions = selected ? variantOptions(selected) : [];
  const selectedVariant = selected
    ? selectedOptions[variantIndexes[selected.id] ?? defaultVariantIndex(selected, answers)]
    : null;
  const selectedLook = !renting && selectedVariant ? lookForColor(selectedVariant.colorKey, occasion) : null;
  const addedItems = selectedLook ? selectedLook.items.filter((item) => addedLooks[item.id]) : [];
  const accessoryTotal = addedItems.reduce((sum, item) => sum + item.price * (addedLooks[item.id]?.quantity || 1), 0);
  const savings = !renting && selected?.compareAt ? selected.compareAt - selected.price : 0;
  const subtotal = !renting && selected
    ? (selected.compareAt ?? selected.price) + (tailoring?.price ?? 0) + accessoryTotal
    : 0;
  const total = subtotal - savings;
  const addedQty = addedItems.reduce((sum, item) => sum + (addedLooks[item.id]?.quantity || 1), 0);
  const itemCount = !renting && selected ? 1 + (tailoring?.price ? 1 : 0) + addedQty : (renting && selected ? 1 : 0);
  const quickViewItem = selectedLook?.items.find((item) => item.id === quickViewId) ?? null;

  function shownFor(product) {
    const options = renting
      ? [{ color: product.color, colorKey: product.colorKey, image: product.image }]
      : variantOptions(product);
    const variantIndex = renting ? 0 : variantIndexes[product.id] ?? defaultVariantIndex(product, answers);
    return { options, variantIndex, shown: options[variantIndex] ?? options[0] };
  }

  function chooseVariant(product, index) {
    setVariantIndexes((current) => ({ ...current, [product.id]: index }));
    if (renting || product.id !== followedId) return;
    const options = variantOptions(product);
    const shown = options[index] ?? options[0];
    setAddedLooks((current) => {
      const allowed = new Set(compatibleLookIds(shown?.colorKey, Object.keys(current)));
      return Object.fromEntries(Object.entries(current).filter(([id]) => allowed.has(id)));
    });
    setQuickViewId(null);
  }

  function toggleCard(product) {
    setOpenId((current) => (current === product.id ? null : product.id));
  }

  function chooseTailoring(id) {
    setTailoringId((current) => (current === id ? NO_HEM.id : id));
  }

  function toggleLookPiece(item) {
    setAddedLooks((current) => {
      if (current[item.id]) {
        const next = { ...current };
        delete next[item.id];
        return next;
      }
      return { ...current, [item.id]: { quantity: 1 } };
    });
  }

  function openQuickView(item, event) {
    const current = event?.currentTarget;
    const trigger = current?.matches?.("button") ? current : current?.querySelector?.(".look-check");
    quickViewTrigger.current = trigger ?? null;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "quick_view_item", productId: item.id });
    setQuickViewId(item.id);
  }

  function closeQuickView() {
    setQuickViewId(null);
    const trigger = quickViewTrigger.current;
    window.requestAnimationFrame(() => {
      if (trigger && document.contains(trigger)) trigger.focus();
    });
  }

  function confirmQuickView(selection) {
    if (!quickViewId) return;
    const id = quickViewId;
    setAddedLooks((current) => ({ ...current, [id]: selection }));
    closeQuickView();
  }

  function removeLook(id) {
    setAddedLooks((current) => {
      if (!current[id]) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (quickViewId === id) closeQuickView();
  }

  const checkoutNote = renting
    ? "Prototype: this would reserve the look and its pieces for your event date."
    : `Prototype: this would add the suit in your sizes${
      [tailoring ? "the tailoring" : null, addedItems.length ? "the pieces you added" : null].filter(Boolean).length
        ? ` and ${[tailoring ? "the tailoring" : null, addedItems.length ? "the pieces you added" : null].filter(Boolean).join(" and ")}`
        : ""
    } to your bag.${tailoring ? " After checkout, the next step books your tailoring appointment." : ""}`;
  const orderSummary = (
    <aside className="order-summary" aria-label="Order summary">
      <h2 className="order-summary-title">Order summary</h2>
      {!renting && savings > 0 && <p className="order-promo">Look at the promo you're getting!</p>}
      {!selected && <p className="order-empty">Choose a suit to see your total.</p>}
      {selected && renting && (
        <ul className="order-lines">
          <li>
            <span>{selected.brand} {selected.name}</span>
            <span className="order-amount">{formatPrice(selected.price)}</span>
          </li>
          {pieces.map((piece) => (
            <li key={piece.id}><span>{piece.label}</span><span className="order-amount">Included</span></li>
          ))}
        </ul>
      )}
      {selected && !renting && (
        <ul className="order-lines">
          <li>
            <span>Suit</span>
            <span className="order-amount">
              {selected.compareAt ? <s>{formatPrice(selected.compareAt)}</s> : null}
              <span>{formatPrice(selected.price)}</span>
            </span>
          </li>
          {tailoring && (
            <li>
              <span>{tailoring.price ? tailoring.name : "Tailoring package"}</span>
              <span className="order-amount">{tailoring.price ? formatPrice(tailoring.price) : "Included"}</span>
            </li>
          )}
          {addedItems.map((item) => {
            const selection = addedLooks[item.id];
            const qty = selection?.quantity || 1;
            return (
              <li key={item.id}>
                <span>{item.name}{qty > 1 ? ` · Qty ${qty}` : ""}</span>
                <span className="order-amount">{formatPrice(item.price * qty)}</span>
              </li>
            );
          })}
        </ul>
      )}
      {selected && (
        <div className="order-totals">
          <div>
            <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
            <span>{formatPrice(renting ? selected.price : subtotal)}</span>
          </div>
          {!renting && savings > 0 && (
            <div className="order-promo-line">
              <span>Suit sale</span>
              <span>-{formatPrice(savings)}</span>
            </div>
          )}
          <div className="order-grand">
            <span>Grand total</span>
            <strong>{formatPrice(renting ? selected.price : total)}</strong>
          </div>
        </div>
      )}
      <button
        className="order-checkout"
        type="button"
        disabled={!selected}
        onClick={() => setHandoff("checkout")}
      >
        Checkout
      </button>
      {handoff === "checkout" && <p className="handoff-inline" role="status">{checkoutNote}</p>}
    </aside>
  );

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
              <button className="results-hero-action" type="button">
                <ShareIcon />
                Share results
              </button>
              <button className="results-hero-action" type="button" onClick={() => onRestart?.()}>
                <ShuffleIcon />
                Restart quiz
              </button>
            </div>
          </div>
          <div className="results-hero-headline">
            <MatchRing percent={ringPercent} />
            <div className="results-hero-copy">
              <h1 id="results-title">We found your best matches!</h1>
              <p className="results-lede">{lede}</p>
            </div>
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
                <p className="hero-fact-value">{answers.feel ? titleWords(summary.fitName) : "Not selected"}</p>
              </div>
            </div>
            <div className="hero-fact">
              <div>
                <p className="hero-fact-label">{renting ? "Package" : "Suggested tailoring"}</p>
                <p className="hero-fact-value">
                  {renting
                    ? (pack?.label ?? "Rental package")
                    : (TAILORING_TIERS.find((tier) => tier.id === summary.tailoring?.id)?.plain ?? "No tailoring")}
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

        <p className="visually-hidden" aria-live="polite">
          {selected ? `${renting ? "Selected look" : "Selected suit"}, ${selected.brand} ${selected.name}` : ""}
        </p>
        <div className="results-stage">
          <div className="results-list">
          <h2 className="section-title results-list-title">Your matches are in</h2>
          {shownRecommendations.map((product, index) => {
            const { options, variantIndex, shown } = shownFor(product);
            const open = product.id === openId;
            const scored = Number.isFinite(product.matchPercent);
            return (
              <article
                className={`suit-card${open ? " is-open" : ""}`}
                key={product.id}
                tabIndex={index === 3 ? -1 : undefined}
                ref={index === 3 ? firstNewCardRef : undefined}
              >
                <div className="suit-card-face">
                  <div className="suit-row">
                    <div className="suit-card-media">
                      <div className="product-image">
                        <img src={shown.image} alt="" />
                      </div>
                    </div>
                    <div className="suit-card-body">
                      <div className="suit-card-topbar">
                        <div className="suit-badges">
                          <span className="match-score">
                            {scored ? `${product.matchPercent}% match` : "Great match"}
                          </span>
                        </div>
                        <button
                          className="suit-details-link"
                          type="button"
                          onClick={() => onViewDetails?.(product.id, shown?.colorKey)}
                        >
                          View More Details
                        </button>
                      </div>
                      <div className="suit-card-info">
                        <div className="suit-card-copy">
                          {options.length > 0 && (
                            <div className="color-swatches" role="group" aria-label="Colors">
                              {options.map((option, optionIndex) => (
                                <button
                                  key={`${option.colorKey}-${optionIndex}`}
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
                          <div className="suit-card-names">
                            <p className="product-brand">{product.brand}</p>
                            <h3 className="product-title">{product.name}</h3>
                          </div>
                          {renting && (
                            <p className="product-meta">{RENTAL_TYPE_NAMES[product.type]} · Sizes confirmed at your fitting</p>
                          )}
                          {product.rating != null && (
                            <p className="product-rating suit-rating">
                              <svg className="star is-on" viewBox="0 0 20 20" aria-hidden="true">
                                <path d="M10 1.6 12.5 7l5.9.6-4.4 3.9 1.3 5.8L10 14.6 4.7 17.3 6 11.5 1.6 7.6 7.5 7 10 1.6z" />
                              </svg>
                              <span>{product.rating.toFixed(1)} ({product.reviews.toLocaleString("en-US")})</span>
                            </p>
                          )}
                        </div>
                        <div className="suit-price-col">
                          <div className="suit-price-stack">
                            <p className="suit-price">
                              <strong>{formatPrice(product.price)}</strong>
                              {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
                            </p>
                            {product.compareAt && <p className="suit-clearance">Clearance</p>}
                          </div>
                          <button
                            className="suit-expand-toggle"
                            type="button"
                            aria-expanded={open}
                            aria-controls={`suit-expand-${product.id}`}
                            aria-label={open ? `Hide options for ${product.name}` : `Show options for ${product.name}`}
                            onClick={() => toggleCard(product)}
                          >
                            <ChevronIcon open={open} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div className="suit-expand" id={`suit-expand-${product.id}`}>
                      {renting ? (
                        <p className="expand-rent-note">Sizes for this look are confirmed at your fitting.</p>
                      ) : (
                        <SuitOptions
                          tailoringId={tailoringId}
                          onTailoring={chooseTailoring}
                          look={lookForColor(shown?.colorKey, occasion)}
                          addedLooks={addedLooks}
                          onToggleLook={toggleLookPiece}
                        />
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}

            {moreMode === "toggle" && recommendations.length > 3 && (
              <div className="more-matches-row">
                <button
                  className={`more-matches${expanded ? " is-less" : ""}`}
                  type="button"
                  onClick={() => {
                    if (expanded) {
                      setExpanded(false);
                      return;
                    }
                    focusNewCard.current = true;
                    setExpanded(true);
                  }}
                >
                  <span className="more-matches-label">{expanded ? "View less" : "View more products"}</span>
                  {!expanded && <PlusIcon />}
                </button>
              </div>
            )}
            {moreMode === "link" && !renting && (
              <button className="more-matches" type="button" onClick={onSeeAll}>
                See all quiz matches
              </button>
            )}
          </div>
          {orderSummary}
        </div>

        <FitProfile
          answers={answers}
          renting={renting}
          size={size}
          fitName={summary.fitName}
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

      {quickViewItem && (
        <QuickView
          key={quickViewItem.id}
          item={quickViewItem}
          suggestedSize={preferredLookSize(quickViewItem, answers)}
          initial={addedLooks[quickViewItem.id] || null}
          onConfirm={confirmQuickView}
          onClose={closeQuickView}
        />
      )}
    </div>
  );
}
