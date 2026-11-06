import { useCallback, useEffect, useMemo, useState } from "react";
import HeightWeight from "./components/HeightWeight.jsx";
import IntroModal from "./components/IntroModal.jsx";
import ProductGridEntry from "./components/ProductGridEntry.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import Results from "./components/Results.jsx";
import SiteHeaderEntry from "./components/SiteHeaderEntry.jsx";
import TextInput from "./components/TextInput.jsx";
import { RENTAL_MIN_LEAD_DAYS, RENTAL_PACKAGES } from "./data/rentals.js";
import { colorThemes, getQuestionFlow, occasionOptions, PLACEHOLDER_ICON, questions } from "./data/quizConfig.js";
import { matchingSteps, matchingSubtext } from "./lib/matchingSteps.js";
import { formatDate, quizCatalogIds, quizListingFilters, rentalDates, sizeList } from "./lib/recommendation.js";

const STORAGE_KEY = "suit-quiz-wireframe-progress";

function linkedProduct(search = window.location.search) {
  const params = new URLSearchParams(search);
  const productId = params.get("product");
  if (!productId) return null;
  return {
    productId,
    productColorKey: params.get("color"),
  };
}

function openLinkedProduct(state, search) {
  const linked = linkedProduct(search);
  if (!linked) return state;
  return {
    ...state,
    screen: "product",
    productId: linked.productId,
    productColorKey: linked.productColorKey,
  };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.screen && saved?.answers) {
      const answers = { ...saved.answers };
      delete answers.rentalBudget;
      const next = { ...saved, answers };
      const place = next.place === "sale" || next.place === "home" || next.place === "look"
        ? next.place
        : (next.screen === "start" || next.screen === "matches" ? "sale" : next.screen === "look" ? "look" : "home");
      if (next.currentId === "rentalBudget" && next.screen === "question") {
        return openLinkedProduct({ ...next, place, screen: "matching" });
      }
      return openLinkedProduct({ ...next, place });
    }
  } catch {
    // Ignore malformed or unavailable local storage.
  }
  return openLinkedProduct({ screen: "home", currentId: "mode", answers: {}, place: "home" });
}

function leaveQuiz(previous) {
  const screen = previous.place === "sale" ? "start" : previous.place === "look" ? "look" : "home";
  return { ...previous, screen };
}

function OptionCards({ options, isSelected, onPick, label, compact = false, className = "" }) {
  const classes = ["option-cards", compact && "option-cards-compact", className].filter(Boolean).join(" ");
  return (
    <div className={classes} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          className="option-card"
          type="button"
          key={option.value}
          aria-pressed={option.locked ? true : isSelected(option.value)}
          aria-disabled={option.locked || undefined}
          onClick={() => {
            if (option.locked) return;
            onPick(option.value);
          }}
        >
          <span className="option-art">
            {option.swatches ? (
              <span className="option-palette" aria-hidden="true">
                {option.swatches.map((swatch) => (
                  <span className={`option-swatch option-swatch-${swatch.key}`} key={swatch.key} style={{ background: swatch.hex }} />
                ))}
              </span>
            ) : (
              <img className="option-icon" src={option.icon || PLACEHOLDER_ICON} alt="" />
            )}
          </span>
          <span className="option-copy">
            <strong>{option.label}</strong>
            {option.detail && <span>{option.detail}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

function ChoiceQuestion({ question, value, onChange }) {
  const isMulti = question.type === "multi";
  const selectedValues = isMulti ? value ?? [] : [];

  if (!isMulti) {
    return (
      <OptionCards
        label={question.title}
        options={question.options}
        isSelected={(optionValue) => value === optionValue}
        onPick={onChange}
      />
    );
  }

  // "none" means "usually feel fine". Picking a card replaces it.
  function toggleMulti(optionValue) {
    const current = selectedValues.filter((item) => item !== "none");
    if (current.includes(optionValue)) {
      onChange(current.filter((item) => item !== optionValue));
      return;
    }
    const option = question.options.find((item) => item.value === optionValue);
    if (option.exclusive) {
      onChange([optionValue]);
      return;
    }
    const exclusiveValues = question.options.filter((item) => item.exclusive).map((item) => item.value);
    const blocked = new Set([...exclusiveValues, ...(option.excludes ?? [])]);
    onChange([...current.filter((item) => !blocked.has(item)), optionValue]);
  }

  return (
    <OptionCards
      label={question.title}
      compact
      options={question.options}
      isSelected={(optionValue) => selectedValues.includes(optionValue)}
      onPick={toggleMulti}
    />
  );
}

function OccasionQuestion({ question, answers, onChange }) {
  const options = occasionOptions(question, answers);
  return (
    <ChoiceQuestion
      question={{ ...question, options }}
      value={answers.occasion}
      onChange={(occasion) => onChange({ occasion })}
    />
  );
}

function ColorQuestion({ mode, value, onChange }) {
  const options = colorThemes(mode);
  const known = new Set(options.map((option) => option.value));
  const prefer = (value?.prefer ?? []).filter((item) => known.has(item));

  return (
    <ColorCards
      options={options}
      isSelected={(theme) => prefer.includes(theme)}
      onPick={(theme) => onChange((current) => {
        const wearing = current?.prefer ?? [];
        return {
          prefer: wearing.includes(theme) ? wearing.filter((item) => item !== theme) : [...wearing, theme],
          avoid: [],
        };
      })}
    />
  );
}

// Four cards, same shape as the other option cards. The art is overlapping dots, one per catalog color.
function ColorCards({ options, isSelected, onPick }) {
  return (
    <div className="option-cards color-cards" role="group" aria-label="Colors you'd wear">
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <button
            className="option-card color-card"
            type="button"
            key={option.value}
            aria-pressed={selected}
            onClick={() => onPick(option.value)}
          >
            <span className="option-art">
              <span className="color-dots" aria-hidden="true">
                {option.swatches.map((swatch) => (
                  <span className="color-dot" key={swatch.key} style={{ background: swatch.hex }} />
                ))}
              </span>
            </span>
            <span className="option-copy">
              <strong>{option.label}</strong>
              {option.detail && <span>{option.detail}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function todayIso() {
  const now = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function DateQuestion({ value, onChange, onUnsure }) {
  const dates = rentalDates(value);
  const today = new Date();
  const earliest = new Date(today.getFullYear(), today.getMonth(), today.getDate() + RENTAL_MIN_LEAD_DAYS);
  return (
    <div className="date-question">
      <label className="date-field">
        <span className="date-label">
          Event date
          <span className="date-hint">MM/DD/YYYY</span>
        </span>
        <input type="date" min={todayIso()} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
      </label>
      <button className="button secondary date-unsure" type="button" onClick={onUnsure}>
        Not sure of the date yet?
      </button>
      {dates?.past && <p className="date-warning" role="status">That date has passed. Pick an upcoming date.</p>}
      {dates && !dates.past && (
        <ol className="date-timeline" aria-label="Your timing">
          <li className="date-stop">
            <span className="date-dot" aria-hidden="true" />
            <span className="date-plan-label">Ready</span>
            <strong>{formatDate(dates.ready)}</strong>
            <span className="date-stop-copy">Pick it up in store or have it delivered.</span>
          </li>
          <li className="date-stop is-event">
            <span className="date-dot" aria-hidden="true" />
            <span className="date-plan-label">Event</span>
            <strong>{formatDate(dates.event)}</strong>
          </li>
          <li className="date-stop">
            <span className="date-dot" aria-hidden="true" />
            <span className="date-plan-label">Due back</span>
            <strong>{formatDate(dates.returnBy)}</strong>
            <span className="date-stop-copy">Return it in store or by mail.</span>
          </li>
        </ol>
      )}
      {!dates && <p className="date-prompt">Pick a date to see your timing.</p>}
      {dates?.tooSoon && (
        <p className="date-warning" role="status">
          The earliest event date we can cover is {formatDate(earliest)}. You can still continue, but call or visit a store to make sure your look is ready in time.
        </p>
      )}
    </div>
  );
}

function PiecesQuestion({ value, onChange }) {
  return (
    <OptionCards
      label="What should the look include?"
      options={RENTAL_PACKAGES.map((pack) => ({
        value: pack.id,
        label: pack.optionLabel,
        detail: pack.optionDetail,
        icon: "/icons/mw/suits-bundle.png",
      }))}
      isSelected={(id) => Number(value) === id}
      onPick={onChange}
    />
  );
}

const CHEST_SIZES = [36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70];
const WAIST_SIZES = [28, 29, 30, 31, 32, 33, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60];

function sizeIsUnavailable(size) {
  return Boolean(size && typeof size === "object" && (size.unavailable || size.disabled));
}

function estimateGroups(answers) {
  if (answers.measurementKnowledge === "no") return questions.everydaySizes.groups;
  const unknown = answers.unknownSizes ?? {};
  return questions.everydaySizes.groups.filter((group) => (
    (group.id === "shirt" && unknown.chest) || (group.id === "waist" && unknown.waist)
  ));
}

function questionHelp(question, answers) {
  if (question.id === "everydaySizes" && answers.measurementKnowledge !== "no") {
    const unknown = answers.unknownSizes ?? {};
    if (unknown.chest && !unknown.waist) return "We'll use this to estimate your jacket size.";
    if (unknown.waist && !unknown.chest) return "We'll use this to estimate your pant size.";
    return "We'll use these to estimate your jacket and pant size.";
  }
  return answers.mode === "rent" && question.rentHelp ? question.rentHelp : question.help;
}

const MEASUREMENT_FIELDS = [
  { id: "chest", label: "Jacket size", sizes: CHEST_SIZES, estimateId: "shirt" },
  { id: "waist", label: "Pant size", sizes: WAIST_SIZES, estimateId: "waist" },
];

function MeasurementsQuestion({
  value = {},
  onChange,
  everydaySizes = {},
  onEverydaySizes,
  unknownSizes = {},
  onUnknownSizes,
}) {
  function writeMeasurements(next) {
    const chest = sizeList(next.chest);
    const waist = sizeList(next.waist);
    const largestChest = chest.map(Number).filter(Number.isFinite).sort((a, b) => a - b).at(-1);
    onChange({
      chest,
      waist,
      jacket: largestChest ? String(largestChest) : "",
    });
  }

  function selectKnown(id, sizeValue) {
    const field = MEASUREMENT_FIELDS.find((item) => item.id === id);
    const current = sizeList(value[id]);
    const next = current.includes(sizeValue)
      ? current.filter((item) => item !== sizeValue)
      : [...current, sizeValue];
    writeMeasurements({ ...value, [id]: next });
    if (unknownSizes[id]) onUnknownSizes({ ...unknownSizes, [id]: false });
    if (sizeList(everydaySizes[field.estimateId]).length) {
      onEverydaySizes({ ...everydaySizes, [field.estimateId]: [] });
    }
  }

  function toggleUnknown(id) {
    const field = MEASUREMENT_FIELDS.find((item) => item.id === id);
    const nextUnknown = !unknownSizes[id];
    onUnknownSizes({ ...unknownSizes, [id]: nextUnknown });
    if (nextUnknown) {
      writeMeasurements({ ...value, [id]: "" });
      return;
    }
    if (sizeList(everydaySizes[field.estimateId]).length) {
      onEverydaySizes({ ...everydaySizes, [field.estimateId]: [] });
    }
  }

  return (
    <div className="size-groups">
      <div className="size-pair">
        {MEASUREMENT_FIELDS.map((field) => {
          const unknown = Boolean(unknownSizes[field.id]);
          const known = sizeList(value[field.id]);
          return (
            <fieldset className="size-group" key={field.id}>
              <legend>{field.label}</legend>
              <div className="size-chips">
                {field.sizes.map((size) => {
                  const sizeValue = String(size?.value ?? size);
                  const unavailable = sizeIsUnavailable(size);
                  const selected = known.includes(sizeValue);
                  return (
                    <label className={unavailable ? "size-chip is-unavailable" : "size-chip"} key={sizeValue}>
                      <input
                        type="checkbox"
                        name={field.id}
                        value={sizeValue}
                        checked={selected}
                        disabled={unavailable}
                        onChange={() => selectKnown(field.id, sizeValue)}
                      />
                      <span>{sizeValue}</span>
                    </label>
                  );
                })}
              </div>
              <button
                className={`unknown-size${unknown ? " is-on" : ""}`}
                type="button"
                aria-pressed={unknown}
                onClick={() => toggleUnknown(field.id)}
              >
                Not sure
              </button>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}

function SizesQuestion({ question, value = {}, onChange }) {
  return (
    <div className="size-groups">
      {question.groups.map((group) => {
        const flag = `${group.id}Unknown`;
        const unknown = Boolean(value[flag]);
        // Usual sizes can be more than one (people fluctuate), so each group is a set of checkboxes.
        const selected = sizeList(value[group.id]);
        return (
          <fieldset className="size-group" key={group.id}>
            <legend>{group.label}</legend>
            <div className="size-chips">
              {group.options.map((option) => {
                const unavailable = sizeIsUnavailable(option);
                return (
                  <label className={unavailable ? "size-chip is-unavailable" : "size-chip"} key={option.value}>
                    <input
                      type="checkbox"
                      name={`${question.id}-${group.id}`}
                      value={option.value}
                      checked={selected.includes(option.value)}
                      disabled={unavailable}
                      onChange={() => {
                        const next = selected.includes(option.value)
                          ? selected.filter((item) => item !== option.value)
                          : [...selected, option.value];
                        onChange({ ...value, [group.id]: next, [flag]: false });
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
            <button
              className={`unknown-size${unknown ? " is-on" : ""}`}
              type="button"
              aria-pressed={unknown}
              onClick={() => onChange({ ...value, [group.id]: [], [flag]: !unknown })}
            >
              Not sure
            </button>
          </fieldset>
        );
      })}
    </div>
  );
}

const MATCHING_STEP_MS = 750;

function MatchingScreen({ mode, answers, onDone }) {
  const steps = useMemo(() => matchingSteps(answers), [answers]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 250 : MATCHING_STEP_MS;
    if (step >= steps.length) {
      const done = setTimeout(onDone, reduceMotion ? 0 : 400);
      return () => clearTimeout(done);
    }
    const next = setTimeout(() => setStep((current) => current + 1), delay);
    return () => clearTimeout(next);
  }, [step, steps.length, onDone]);

  const heading = mode === "rent" ? "Finding your look" : "Finding your best fit";
  const sizesLine = steps.at(-1)?.active.replace("…", ".") ?? "";

  return (
    <section className="matching" aria-labelledby="matching-title">
      <div className="matching-scan" aria-hidden="true">
        <img src="/icons/mw/ai-quiz.png" alt="" />
      </div>
      <p className="visually-hidden" role="status">{`${heading}. ${sizesLine}`}</p>
      <h1 id="matching-title">{heading}</h1>
      <p className="matching-copy">{matchingSubtext(mode)}</p>
      <ol className="matching-steps">
        {steps.map((item, index) => {
          const state = index < step ? "done" : index === step ? "active" : "pending";
          return (
            <li className={`matching-step matching-step-${state}`} key={item.id}>
              <span className="matching-dot" aria-hidden="true" />
              {state === "done" ? item.done : item.active}
              {state === "done" && <span className="visually-hidden"> (done)</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function isAnswered(question, answers) {
  const answer = answers[question.id];
  if (question.type === "occasionPlus") {
    return Boolean(answers.occasion);
  }
  if (question.type === "colors" || question.type === "measurements" || question.type === "sizes" || question.type === "height") return true;
  if (question.type === "date") {
    const dates = rentalDates(answer);
    return Boolean(dates && !dates.past);
  }
  if (question.type === "multi") return Array.isArray(answer) && answer.length > 0;
  return Boolean(answer);
}

export default function App() {
  const [state, setState] = useState(loadProgress);
  const { screen, currentId, answers } = state;
  const flow = useMemo(() => getQuestionFlow(answers), [answers]);
  const currentQuestion = questions[currentId];
  const currentIndex = Math.max(0, flow.indexOf(currentId));
  const totalQuestions = answers.measurementKnowledge
    ? flow.length
    : getQuestionFlow({ ...answers, measurementKnowledge: "no" }).length;
  const moreMode = new URLSearchParams(window.location.search).get("more") === "link" ? "link" : "toggle";
  const listingFilters = useMemo(() => quizListingFilters(answers), [answers]);
  const quizMatchIds = useMemo(() => quizCatalogIds(answers), [answers]);

  useEffect(() => {
    if (screen === "start" || screen === "intro") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, screen]);

  useEffect(() => {
    if (screen !== "question") return;
    if (currentId === "rentalBudget") {
      setState((previous) => (
        previous.currentId === "rentalBudget" ? { ...previous, screen: "matching" } : previous
      ));
    }
  }, [screen, currentId]);

  useEffect(() => {
    const lightPage = screen === "start" || screen === "home" || screen === "look" || screen === "results" || screen === "product";
    document.documentElement.classList.toggle("page-white", lightPage);
    return () => document.documentElement.classList.remove("page-white");
  }, [screen]);

  function startQuiz() {
    setState((previous) => ({ ...previous, screen: "question", currentId: "mode", answers: {} }));
  }

  function setAnswer(value) {
    setState((previous) => {
      if (previous.currentId === "mode" && previous.answers.mode !== value) {
        return { ...previous, answers: { mode: value } };
      }
      return { ...previous, answers: { ...previous.answers, [previous.currentId]: value } };
    });
  }

  function mergeAnswers(partial) {
    setState((previous) => ({
      ...previous,
      answers: { ...previous.answers, ...partial },
    }));
  }

  function continueQuiz() {
    const nextFlow = getQuestionFlow(answers);
    const index = nextFlow.indexOf(currentId);
    if (index === nextFlow.length - 1) {
      setState((previous) => ({ ...previous, screen: "matching" }));
      return;
    }
    setState((previous) => ({ ...previous, currentId: nextFlow[index + 1] }));
  }

  function goBack() {
    if (currentIndex <= 0) {
      setState(leaveQuiz);
      return;
    }
    setState((previous) => ({ ...previous, currentId: flow[currentIndex - 1] }));
  }

  function restart() {
    localStorage.removeItem(STORAGE_KEY);
    setState((previous) => ({ screen: "question", currentId: "mode", answers: {}, place: previous.place }));
  }

  function editAnswers(questionId) {
    setState((previous) => {
      const nextFlow = getQuestionFlow(previous.answers);
      const currentId = typeof questionId === "string" && nextFlow.includes(questionId) ? questionId : "mode";
      return { ...previous, screen: "question", currentId };
    });
  }

  function saveAndExit() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setState(leaveQuiz);
  }

  const showResults = useCallback(() => {
    setState((previous) => ({ ...previous, screen: "results" }));
  }, []);

  function openProduct(productId, colorKey) {
    const url = new URL(window.location.href);
    url.searchParams.set("product", productId);
    if (colorKey) url.searchParams.set("color", colorKey);
    else url.searchParams.delete("color");
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function backToResults() {
    setState((previous) => ({ ...previous, screen: "results" }));
  }

  function openIntro() {
    setState((previous) => ({ ...previous, screen: "intro" }));
  }

  const closeIntro = useCallback(() => {
    setState(leaveQuiz);
  }, []);

  function goHome() {
    setState((previous) => ({ ...previous, screen: "home", place: "home" }));
  }

  function goSale() {
    setState((previous) => ({ ...previous, screen: "start", place: "sale" }));
  }

  function goLook() {
    setState((previous) => ({ ...previous, screen: "look", place: "look" }));
  }

  const usuallyFine = currentQuestion?.type === "multi"
    && Array.isArray(answers[currentId])
    && answers[currentId].includes("none");
  const stepLabel = screen === "question" && totalQuestions > 0
    ? `Step ${currentIndex + 1} of ${totalQuestions}`
    : undefined;

  const questionSlide = currentQuestion && (
    <section className="quiz-slide" aria-labelledby="question-title">
      <div className="question-head">
        {currentQuestion.icon && <img className="question-icon" src={currentQuestion.icon} alt="" />}
        <div>
          {stepLabel && (
            <p className="question-eyebrow">
              <span className="question-step-count">{stepLabel}</span>
              {!currentQuestion.skippable && <span className="question-required">Required</span>}
            </p>
          )}
          <h2 id="question-title">{currentQuestion.title}</h2>
          {questionHelp(currentQuestion, answers) && (
            <p className="helper">{questionHelp(currentQuestion, answers)}</p>
          )}
          {currentQuestion.note && <p className="question-note">{currentQuestion.note}</p>}
        </div>
      </div>

      {currentQuestion.type === "occasionPlus" ? (
        <OccasionQuestion
          question={currentQuestion}
          answers={answers}
          onChange={mergeAnswers}
        />
      ) : currentQuestion.type === "colors" ? (
        <ColorQuestion
          mode={answers.mode}
          value={answers.colors}
          onChange={(updater) => setState((previous) => ({
            ...previous,
            answers: {
              ...previous.answers,
              colors: typeof updater === "function" ? updater(previous.answers.colors) : updater,
            },
          }))}
        />
      ) : currentQuestion.type === "date" ? (
        <DateQuestion value={answers.eventDate} onChange={setAnswer} onUnsure={continueQuiz} />
      ) : currentQuestion.type === "pieces" ? (
        <PiecesQuestion value={answers.pieces} onChange={setAnswer} />
      ) : currentQuestion.type === "measurements" ? (
        <MeasurementsQuestion
          value={answers[currentId]}
          onChange={setAnswer}
          everydaySizes={answers.everydaySizes}
          onEverydaySizes={(everydaySizes) => mergeAnswers({ everydaySizes })}
          unknownSizes={answers.unknownSizes}
          onUnknownSizes={(unknownSizes) => mergeAnswers({ unknownSizes })}
        />
      ) : currentQuestion.type === "height" ? (
        <HeightWeight
          height={answers.height}
          weight={answers.weight}
          unit={answers.heightWeightUnit}
          onChange={mergeAnswers}
        />
      ) : currentQuestion.type === "sizes" ? (
        <SizesQuestion
          question={{ ...currentQuestion, groups: estimateGroups(answers) }}
          value={answers[currentId]}
          onChange={setAnswer}
        />
      ) : (
        <ChoiceQuestion
          question={currentQuestion}
          value={answers[currentId]}
          onChange={setAnswer}
        />
      )}

      <div className="actions actions-pair">
        {currentQuestion.skippable && (currentQuestion.type === "multi" ? (
          <button
            className="button secondary skip-button"
            type="button"
            aria-pressed={usuallyFine}
            onClick={() => {
              setAnswer(["none"]);
              continueQuiz();
            }}
          >
            {currentQuestion.skipLabel ?? "Skip"}
          </button>
        ) : (
          <button
            className="button secondary skip-button"
            type="button"
            onClick={() => {
              if (currentQuestion.type === "height") mergeAnswers({ height: "", weight: "" });
              continueQuiz();
            }}
          >
            {currentQuestion.skipLabel ?? "Skip"}
          </button>
        ))}
        <button
          className="button"
          type="button"
          disabled={!isAnswered(currentQuestion, answers)}
          onClick={continueQuiz}
        >
          {currentIndex === flow.length - 1 ? "See recommendations" : "Next"}
        </button>
      </div>
    </section>
  );

  const view = screen === "home"
    ? "home"
    : screen === "look" || (state.place === "look" && screen !== "start" && screen !== "matches")
      ? "look"
      : (screen === "start" || screen === "matches" || state.place === "sale")
        ? "sale"
        : "home";

  function handleSiteNavigate(next) {
    if (next === "home") goHome();
    else if (next === "look") goLook();
    else if (next === "sale") goSale();
  }

  if (screen === "home" || screen === "look" || screen === "start" || screen === "intro" || screen === "matches" || screen === "question" || screen === "matching") {
    return (
      <>
        <ProductGridEntry
          key={screen === "matches" ? "matches" : view}
          view={view}
          title={screen === "matches" ? "Quiz matches" : "All Suits"}
          crumb={screen === "matches" ? "Quiz matches" : "Suits"}
          initialFilters={screen === "matches" ? listingFilters : undefined}
          quizMatchIds={screen === "matches" ? quizMatchIds : undefined}
          onTakeQuiz={openIntro}
          onNavigate={handleSiteNavigate}
          onBackToQuiz={screen === "matches"
            ? () => setState((previous) => ({ ...previous, screen: "results" }))
            : undefined}
        />
        {(screen === "intro" || screen === "question" || screen === "matching") && (
          <IntroModal
            key="quiz-modal"
            onStart={startQuiz}
            onBack={screen === "question" ? goBack : undefined}
            onClose={screen === "question" || screen === "matching" ? saveAndExit : closeIntro}
            progress={screen === "matching" ? 1 : screen === "question" && totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : undefined}
            stepLabel={stepLabel}
            labelledBy={screen === "matching" ? "matching-title" : screen === "question" ? "question-title" : "intro-title"}
          >
            {screen === "matching" ? (
              <MatchingScreen mode={answers.mode} answers={answers} onDone={showResults} />
            ) : screen === "question" ? questionSlide : undefined}
          </IntroModal>
        )}
      </>
    );
  }

  return (
    <>
      <SiteHeaderEntry onNavigate={handleSiteNavigate} onFindSuit={openIntro} />
      <main className={`app-shell${screen === "results" || screen === "product" ? " app-shell-wide" : ""}`}>
        {screen === "product" ? (
          <ProductDetail
            answers={answers}
            productId={state.productId}
            colorKey={state.productColorKey}
            onBack={backToResults}
          />
        ) : (
          <Results
            answers={answers}
            moreMode={moreMode}
            onEditAnswers={editAnswers}
            onRestart={restart}
            onViewDetails={openProduct}
            onSeeAll={() => setState((previous) => ({ ...previous, screen: "matches" }))}
          />
        )}
      </main>
    </>
  );
}
