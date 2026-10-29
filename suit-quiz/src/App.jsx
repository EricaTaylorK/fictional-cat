import { useCallback, useEffect, useMemo, useState } from "react";
import IntroModal from "./components/IntroModal.jsx";
import ProductGridEntry from "./components/ProductGridEntry.jsx";
import Results from "./components/Results.jsx";
import TextInput from "./components/TextInput.jsx";
import { RENTAL_PACKAGES } from "./data/rentals.js";
import { colorThemes, getQuestionFlow, occasionOptions, questions } from "./data/quizConfig.js";
import { formatDate, quizCatalogIds, quizListingFilters, rentalDates } from "./lib/recommendation.js";

const STORAGE_KEY = "suit-quiz-wireframe-progress";

function stepAfterRetiredHeight(answers) {
  const flow = getQuestionFlow(answers ?? {});
  const fitIndex = flow.indexOf("fitIssues");
  return (fitIndex >= 0 ? flow[fitIndex + 1] : flow[0]) || "mode";
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.screen && saved?.answers) {
      if (saved.currentId === "height") {
        return { ...saved, currentId: stepAfterRetiredHeight(saved.answers) };
      }
      return saved;
    }
  } catch {
    // Ignore malformed or unavailable local storage.
  }
  return { screen: "start", currentId: "mode", answers: {} };
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
          {(option.swatches || option.icon) && (
            <span className="option-art">
              {option.swatches ? (
                <span className="option-palette" aria-hidden="true">
                  {option.swatches.map((swatch) => (
                    <span className={`option-swatch option-swatch-${swatch.key}`} key={swatch.key} style={{ background: swatch.hex }} />
                  ))}
                </span>
              ) : (
                <img className="option-icon" src={option.icon} alt="" />
              )}
            </span>
          )}
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

  function toggleMulti(optionValue) {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter((item) => item !== optionValue));
      return;
    }
    const option = question.options.find((item) => item.value === optionValue);
    if (option.exclusive) {
      onChange([optionValue]);
      return;
    }
    const exclusiveValues = question.options.filter((item) => item.exclusive).map((item) => item.value);
    const blocked = new Set([...exclusiveValues, ...(option.excludes ?? [])]);
    onChange([...selectedValues.filter((item) => !blocked.has(item)), optionValue]);
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
  const prefer = (value?.prefer ?? []).filter((item) => options.some((option) => option.value === item));

  return (
    <OptionCards
      label="Colors"
      options={options}
      isSelected={(theme) => prefer.includes(theme)}
      onPick={(theme) => onChange({
        prefer: prefer.includes(theme) ? prefer.filter((item) => item !== theme) : [...prefer, theme],
      })}
    />
  );
}

function todayIso() {
  const now = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function DateQuestion({ value, onChange }) {
  const dates = rentalDates(value);
  return (
    <div className="date-question">
      <label className="date-field">
        <span className="date-label">Event date</span>
        <input type="date" min={todayIso()} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
      </label>
      {dates && !dates.past && (
        <div className="date-plan">
          <p className="date-plan-lead">This date sets the timing: when your look is ready, and when it has to be back.</p>
          <ol>
            <li>
              <span className="date-plan-mark">
                <img src="/icons/mw/in-store-pickup.png" alt="" />
              </span>
              <span className="date-plan-copy">
                <strong>Ready {formatDate(dates.ready)}</strong>
                <span>Your look is ready before the event, for pickup or delivered to you.</span>
              </span>
            </li>
            <li>
              <span className="date-plan-mark">
                <img src="/icons/mw/special-event.png" alt="" />
              </span>
              <span className="date-plan-copy">
                <strong>Event {formatDate(dates.event)}</strong>
                <span>The day you wear it.</span>
              </span>
            </li>
            <li>
              <span className="date-plan-mark">
                <img src="/icons/mw/shipping.png" alt="" />
              </span>
              <span className="date-plan-copy">
                <strong>Return {formatDate(dates.returnBy)}</strong>
                <span>It comes back the day after, in store or by mail.</span>
              </span>
            </li>
          </ol>
        </div>
      )}
      {dates?.tooSoon && (
        <p className="date-warning" role="status">
          That's less than 4 days away. You can still reserve, but call or visit a store to make sure your look is ready in time.
        </p>
      )}
      {dates?.past && <p className="date-warning" role="status">That date has passed. Choose an upcoming date.</p>}
    </div>
  );
}

function PiecesQuestion({ value, onChange }) {
  return (
    <OptionCards
      label="What should the look include?"
      options={RENTAL_PACKAGES.map((pack) => ({
        value: pack.id,
        label: pack.label,
        detail: pack.detail,
        icon: "/icons/mw/suits-bundle.png",
      }))}
      isSelected={(id) => Number(value) === id}
      onPick={onChange}
    />
  );
}

const CHEST_SIZES = [36, 38, 40, 42, 44, 46, 48, 50, 52, 54];
const WAIST_SIZES = [28, 29, 30, 31, 32, 33, 34, 36, 38, 40, 42, 44, 46, 48];
const HEIGHT_MIN = 58;
const HEIGHT_MAX = 84;

function SizeChips({ label, name, options, value, onChange }) {
  return (
    <fieldset className="size-group">
      <legend>{label}</legend>
      <div className="size-chips">
        {options.map((option) => (
          <label className="size-chip" key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onClick={() => {
                if (value === option.value) onChange("");
              }}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const MEASUREMENT_FIELDS = [
  { id: "chest", label: "Jacket chest", sizes: CHEST_SIZES, estimateId: "shirt" },
  { id: "waist", label: "Pants waist", sizes: WAIST_SIZES, estimateId: "waist" },
];

function MeasurementsQuestion({
  value = {},
  onChange,
  everydaySizes = {},
  onEverydaySizes,
  unknownSizes = {},
  onUnknownSizes,
  heightValue,
  onHeightChange,
}) {
  const estimateGroups = Object.fromEntries(
    questions.everydaySizes.groups.map((group) => [group.id, group]),
  );

  function writeMeasurements(next) {
    const chest = next.chest ? String(next.chest) : "";
    onChange({
      chest,
      waist: next.waist ? String(next.waist) : "",
      jacket: chest,
    });
  }

  function selectKnown(id, nextValue) {
    const field = MEASUREMENT_FIELDS.find((item) => item.id === id);
    writeMeasurements({ ...value, [id]: nextValue });
    if (unknownSizes[id]) onUnknownSizes({ ...unknownSizes, [id]: false });
    if (everydaySizes[field.estimateId]) {
      onEverydaySizes({ ...everydaySizes, [field.estimateId]: "" });
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
    if (everydaySizes[field.estimateId]) {
      onEverydaySizes({ ...everydaySizes, [field.estimateId]: "" });
    }
  }

  return (
    <div className="size-groups">
      {MEASUREMENT_FIELDS.map((field) => {
        const unknown = Boolean(unknownSizes[field.id]);
        const estimate = estimateGroups[field.estimateId];
        const known = value[field.id] ? String(value[field.id]) : "";
        return (
          <fieldset className="size-group" key={field.id}>
            <legend>{field.label}</legend>
            <div className="size-chips">
              {field.sizes.map((size) => {
                const sizeValue = String(size);
                const selected = known === sizeValue;
                return (
                  <label className="size-chip" key={sizeValue}>
                    <input
                      type="radio"
                      name={field.id}
                      value={sizeValue}
                      checked={selected}
                      onClick={() => {
                        if (selected) selectKnown(field.id, "");
                      }}
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
              aria-expanded={unknown}
              aria-controls={`${field.id}-estimate`}
              onClick={() => toggleUnknown(field.id)}
            >
              I don't know this
            </button>
            {unknown && (
              <div className="size-estimate" id={`${field.id}-estimate`}>
                <SizeChips
                  label={estimate.label}
                  name={`estimate-${field.estimateId}`}
                  value={everydaySizes[field.estimateId] ? String(everydaySizes[field.estimateId]) : ""}
                  options={estimate.options}
                  onChange={(next) => onEverydaySizes({ ...everydaySizes, [field.estimateId]: next })}
                />
              </div>
            )}
          </fieldset>
        );
      })}
      <fieldset className="size-group">
        <legend>Height</legend>
        <HeightQuestion value={heightValue} onChange={onHeightChange} />
      </fieldset>
    </div>
  );
}

function HeightQuestion({ value, onChange }) {
  const total = Number(value);
  const valid = Number.isFinite(total) && total >= HEIGHT_MIN && total <= HEIGHT_MAX;
  const [feet, setFeet] = useState(valid ? String(Math.floor(total / 12)) : "");
  const [inches, setInches] = useState(valid ? String(total % 12) : "");

  function commit(nextFeet, nextInches) {
    setFeet(nextFeet);
    setInches(nextInches);
    if (nextFeet === "" || nextInches === "") {
      if (value !== "" && value != null) onChange("");
      return;
    }
    const combined = Number(nextFeet) * 12 + Number(nextInches);
    if (!Number.isInteger(combined) || combined < HEIGHT_MIN || combined > HEIGHT_MAX) {
      if (value !== "" && value != null) onChange("");
      return;
    }
    if (combined !== total) onChange(combined);
  }

  return (
    <div className="height-question">
      <div className="height-inputs">
        <label>
          <span>Feet</span>
          <input
            type="number"
            inputMode="numeric"
            min="4"
            max="7"
            value={feet}
            onChange={(event) => commit(event.target.value, inches)}
          />
        </label>
        <label>
          <span>Inches</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="11"
            value={inches}
            onChange={(event) => commit(feet, event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

function SizesQuestion({ question, value = {}, onChange, heightValue, onHeightChange }) {
  return (
    <div className="size-groups">
      {question.groups.map((group) => (
        <fieldset className="size-group" key={group.id}>
          <legend>{group.label}</legend>
          <div className="size-chips">
            {group.options.map((option) => (
              <label className="size-chip" key={option.value}>
                <input
                  type="radio"
                  name={`${question.id}-${group.id}`}
                  value={option.value}
                  checked={value[group.id] === option.value}
                  onChange={() => onChange({ ...value, [group.id]: option.value })}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <fieldset className="size-group">
        <legend>Height</legend>
        <HeightQuestion value={heightValue} onChange={onHeightChange} />
      </fieldset>
    </div>
  );
}

const MATCHING_STEPS = {
  buy: [
    "Reading your occasion",
    "Working out your jacket and pants sizes",
    "Comparing cuts against how you want it to feel",
    "Checking prices against your budget",
  ],
  rent: [
    "Reading your occasion",
    "Choosing suits or tuxedos for the room",
    "Pricing your rental package",
    "Working out your sizes for the fitting",
  ],
};
const MATCHING_STEP_MS = 750;

function MatchingScreen({ mode, onDone }) {
  const steps = MATCHING_STEPS[mode] ?? MATCHING_STEPS.buy;
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

  return (
    <section className="matching" aria-labelledby="matching-title" aria-live="polite">
      <div className="matching-scan" aria-hidden="true">
        <img src="/icons/mw/ai-quiz.png" alt="" />
      </div>
      <h1 id="matching-title">{mode === "rent" ? "Finding your look" : "Finding your best fit"}</h1>
      <p className="matching-copy">
        {mode === "rent" ? "Checking every rental look against your answers." : "Checking every suit against your answers."}
      </p>
      <ol className="matching-steps">
        {steps.map((label, index) => {
          const state = index < step ? "done" : index === step ? "active" : "pending";
          return (
            <li className={`matching-step matching-step-${state}`} key={label}>
              <span className="matching-dot" aria-hidden="true" />
              {label}
              {state === "done" && <span className="visually-hidden"> (done)</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d="M9.5 5.5 3 12l6.5 6.5.707-.707L4.914 12.5H21v-1H4.913l5.294-5.293L9.5 5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function isAnswered(question, answers) {
  const answer = answers[question.id];
  if (question.type === "occasionPlus") {
    return Boolean(answers.occasion);
  }
  if (question.type === "colors" || question.type === "measurements" || question.type === "sizes") return true;
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
    if (screen !== "question" || currentId !== "height") return;
    const nextId = stepAfterRetiredHeight(answers);
    setState((previous) => (
      previous.currentId === "height" ? { ...previous, currentId: nextId } : previous
    ));
  }, [screen, currentId, answers]);

  useEffect(() => {
    const lightPage = screen === "start" || screen === "results";
    document.documentElement.classList.toggle("page-white", lightPage);
    return () => document.documentElement.classList.remove("page-white");
  }, [screen]);

  function startQuiz() {
    setState({ screen: "question", currentId: "mode", answers: {} });
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
      setState((previous) => ({ ...previous, screen: "start" }));
      return;
    }
    setState((previous) => ({ ...previous, currentId: flow[currentIndex - 1] }));
  }

  function restart() {
    localStorage.removeItem(STORAGE_KEY);
    setState({ screen: "question", currentId: "mode", answers: {} });
  }

  function saveAndExit() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setState((previous) => ({ ...previous, screen: "start" }));
  }

  function resumeQuiz() {
    setState((previous) => ({ ...previous, screen: "question" }));
  }

  const showResults = useCallback(() => {
    setState((previous) => ({ ...previous, screen: "results" }));
  }, []);

  const hasSavedProgress = Object.keys(answers).length > 0;

  function openIntro() {
    setState((previous) => ({ ...previous, screen: "intro" }));
  }

  const closeIntro = useCallback(() => {
    setState((previous) => ({ ...previous, screen: "start" }));
  }, []);

  const questionSlide = currentQuestion && (
    <section className="quiz-slide" aria-labelledby="question-title">
      <div className="question-head">
        {currentQuestion.icon && <img className="question-icon" src={currentQuestion.icon} alt="" />}
        <div>
          <h2 id="question-title">{currentQuestion.title}</h2>
          <p className="helper">
            {answers.mode === "rent" && currentQuestion.rentHelp ? currentQuestion.rentHelp : currentQuestion.help}
          </p>
        </div>
      </div>

      {currentQuestion.type === "occasionPlus" ? (
        <OccasionQuestion
          question={currentQuestion}
          answers={answers}
          onChange={mergeAnswers}
        />
      ) : currentQuestion.type === "colors" ? (
        <ColorQuestion mode={answers.mode} value={answers.colors} onChange={setAnswer} />
      ) : currentQuestion.type === "date" ? (
        <DateQuestion value={answers.eventDate} onChange={setAnswer} />
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
          heightValue={answers.height}
          onHeightChange={(height) => mergeAnswers({ height })}
        />
      ) : currentQuestion.type === "sizes" ? (
        <SizesQuestion
          question={currentQuestion}
          value={answers[currentId]}
          onChange={setAnswer}
          heightValue={answers.height}
          onHeightChange={(height) => mergeAnswers({ height })}
        />
      ) : (
        <ChoiceQuestion
          question={currentQuestion}
          value={answers[currentId]}
          onChange={setAnswer}
        />
      )}

      <div className="actions actions-pair">
        {currentQuestion.skippable && (
          <button className="button secondary skip-button" type="button" onClick={continueQuiz}>
            I'm Not Sure, Skip It
          </button>
        )}
        <button
          className="button"
          type="button"
          disabled={!isAnswered(currentQuestion, answers)}
          onClick={continueQuiz}
        >
          {currentIndex === flow.length - 1 ? "See my results" : "Continue"}
        </button>
      </div>
    </section>
  );

  if (screen === "start" || screen === "intro" || screen === "matches" || screen === "question" || screen === "matching") {
    return (
      <>
        <ProductGridEntry
          key={screen === "matches" ? "matches" : "start"}
          title={screen === "matches" ? "Quiz matches" : "All Suits"}
          crumb={screen === "matches" ? "Quiz matches" : "Suits"}
          initialFilters={screen === "matches" ? listingFilters : undefined}
          quizMatchIds={screen === "matches" ? quizMatchIds : undefined}
          onTakeQuiz={openIntro}
          onBackToQuiz={screen === "matches"
            ? () => setState((previous) => ({ ...previous, screen: "results" }))
            : undefined}
        />
        {(screen === "intro" || screen === "question" || screen === "matching") && (
          <IntroModal
            key="quiz-modal"
            onStart={startQuiz}
            onResume={screen === "intro" && hasSavedProgress ? resumeQuiz : undefined}
            onBack={screen === "question" ? goBack : undefined}
            onClose={screen === "question" || screen === "matching" ? saveAndExit : closeIntro}
            progress={screen === "matching" ? 1 : screen === "question" && totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : undefined}
            labelledBy={screen === "matching" ? "matching-title" : screen === "question" ? "question-title" : "intro-title"}
          >
            {screen === "matching" ? (
              <MatchingScreen mode={answers.mode} onDone={showResults} />
            ) : screen === "question" ? questionSlide : undefined}
          </IntroModal>
        )}
      </>
    );
  }

  return (
    <>
      <p className="promo-banner">
        {screen === "results"
          ? "Your sizes and today's prices are in your plan below."
          : screen === "start"
            ? "Suits are on sale now."
            : "Suits are on sale now. Finish the quiz to see your size and your price."}
      </p>
      <header className="site-header">
        <div className="header-slot header-slot-start">
          {screen === "results" && (
            <button
              className="nav-control"
              type="button"
              onClick={() => setState((previous) => ({ ...previous, screen: "question", currentId: "mode" }))}
              aria-label="Edit answers"
            >
              <ArrowLeftIcon />
              <span className="nav-label">Edit answers</span>
            </button>
          )}
        </div>
        <a className="logo" href="/" aria-label="Men's Wearhouse">
          <img src="/mw-logo.svg" alt="" />
        </a>
        <div className="header-slot header-slot-end">
          {screen === "results" && (
            <button className="nav-control" type="button" onClick={restart}>Retake quiz</button>
          )}
        </div>
      </header>
      <main className={`app-shell${screen === "results" ? " app-shell-wide" : ""}`}>
        {screen === "results" && (
          <Results
            answers={answers}
            moreMode={moreMode}
            onSeeAll={() => setState((previous) => ({ ...previous, screen: "matches" }))}
          />
        )}
      </main>
    </>
  );
}
