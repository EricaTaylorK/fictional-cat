import { useCallback, useEffect, useMemo, useState } from "react";
import ProductGridEntry from "./components/ProductGridEntry.jsx";
import Results from "./components/Results.jsx";
import TextInput from "./components/TextInput.jsx";
import { getQuestionFlow, questions } from "./data/quizConfig.js";
import { quizCatalogIds, quizListingFilters } from "./lib/recommendation.js";

const STORAGE_KEY = "suit-quiz-wireframe-progress";

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.screen && saved?.answers) return saved;
  } catch {
    // Ignore malformed or unavailable local storage.
  }
  return { screen: "start", currentId: "occasion", answers: {} };
}

function ChoiceQuestion({ question, value, onChange }) {
  const isMulti = question.type === "multi";
  const selectedValues = isMulti ? value ?? [] : [];

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
    <div className="choice-grid">
      {question.options.map((option) => {
        const checked = isMulti ? selectedValues.includes(option.value) : value === option.value;
        return (
          <label className="choice" key={option.value}>
            <input
              type={isMulti ? "checkbox" : "radio"}
              name={question.id}
              value={option.value}
              checked={checked}
              onChange={() => isMulti ? toggleMulti(option.value) : onChange(option.value)}
            />
            <span className="choice-copy">
              <strong>{option.label}</strong>
              {option.detail && <span>{option.detail}</span>}
            </span>
            <span className={`choice-mark${isMulti ? " choice-mark-multi" : ""}`} aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path fill="currentColor" d="M6.3 12.2 1.8 7.7l1.2-1.2 3.3 3.3 6.7-6.7 1.2 1.2-7.9 7.9Z" />
              </svg>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function OccasionQuestion({ question, answers, onChange }) {
  return (
    <div className="occasion-groups">
      <ChoiceQuestion question={question} value={answers.occasion} onChange={(occasion) => onChange({ occasion })} />
      <fieldset className="size-group wear-group">
        <legend>{question.wear.title}</legend>
        <p className="helper wear-help">{question.wear.help}</p>
        <ChoiceQuestion
          question={{ ...question, id: "wearIntent", options: question.wear.options }}
          value={answers.wearIntent}
          onChange={(wearIntent) => onChange({ wearIntent })}
        />
      </fieldset>
    </div>
  );
}

function ColorQuestion({ question, value = { prefer: [], avoid: [] }, onChange }) {
  const prefer = value.prefer ?? [];
  const avoid = value.avoid ?? [];
  const noPreference = prefer.length === 0 && avoid.length === 0;

  function toggle(list, color) {
    return list.includes(color) ? list.filter((item) => item !== color) : [...list, color];
  }

  return (
    <div className="size-groups">
      <fieldset className="size-group">
        <legend>Colors you like</legend>
        <div className="size-chips">
          {question.options.map((option) => (
            <label className="size-chip" key={`prefer-${option.value}`}>
              <input
                type="checkbox"
                name="colors-prefer"
                value={option.value}
                checked={prefer.includes(option.value)}
                onChange={() => onChange({
                  prefer: toggle(prefer, option.value),
                  avoid: avoid.filter((item) => item !== option.value),
                })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="size-group">
        <legend>Colors to skip</legend>
        <div className="size-chips">
          {question.options.map((option) => (
            <label className="size-chip" key={`avoid-${option.value}`}>
              <input
                type="checkbox"
                name="colors-avoid"
                value={option.value}
                checked={avoid.includes(option.value)}
                onChange={() => onChange({
                  avoid: toggle(avoid, option.value),
                  prefer: prefer.filter((item) => item !== option.value),
                })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="size-chip">
        <input
          type="checkbox"
          checked={noPreference}
          onChange={() => onChange({ prefer: [], avoid: [] })}
        />
        <span>No preference</span>
      </label>
    </div>
  );
}

function MeasurementsQuestion({ value = {}, onChange }) {
  function update(field, nextValue) {
    onChange({ ...value, [field]: nextValue });
  }

  return (
    <div className="field-grid">
      <TextInput
        label="Jacket size"
        value={value.jacket}
        onChange={(next) => update("jacket", next)}
        inputMode="text"
        autoComplete="off"
        helperText="A number like 40, or with a length like 44L. S = short, R = regular, L = long."
      />
      <TextInput
        label="Chest (inches)"
        value={value.chest}
        onChange={(next) => update("chest", next)}
        helperText="Around the fullest part of your chest"
      />
      <TextInput
        label="Waist (inches)"
        value={value.waist}
        onChange={(next) => update("waist", next)}
        helperText="Where your dress pants usually sit"
      />
      <TextInput
        label="Height"
        value={value.height}
        onChange={(next) => update("height", next)}
        inputMode="text"
        autoComplete="off"
        helperText="Feet and inches, like 6'5&quot;, or total inches, like 77."
      />
    </div>
  );
}

function SizesQuestion({ question, value = {}, onChange }) {
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
    </div>
  );
}

const MATCHING_STEPS = [
  "Reading your occasion",
  "Working out your jacket and pants sizes",
  "Comparing cuts against how you want it to feel",
  "Choosing your tailoring",
];
const MATCHING_STEP_MS = 750;

function MatchingScreen({ onDone }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 250 : MATCHING_STEP_MS;
    if (step >= MATCHING_STEPS.length) {
      const done = setTimeout(onDone, reduceMotion ? 0 : 400);
      return () => clearTimeout(done);
    }
    const next = setTimeout(() => setStep((current) => current + 1), delay);
    return () => clearTimeout(next);
  }, [step, onDone]);

  return (
    <section className="matching" aria-labelledby="matching-title" aria-live="polite">
      <div className="matching-scan" aria-hidden="true">
        <img src="/icons/product_hanger.svg" alt="" />
      </div>
      <h1 id="matching-title">Finding your best fit</h1>
      <p className="matching-copy">Checking every suit against your answers.</p>
      <ol className="matching-steps">
        {MATCHING_STEPS.map((label, index) => {
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
  if (question.type === "occasionPlus") return Boolean(answers.occasion && answers.wearIntent);
  if (question.type === "colors" || question.type === "measurements") return true;
  if (question.type === "multi") return Array.isArray(answer) && answer.length > 0;
  if (question.type === "sizes") {
    return question.groups.every((group) => Boolean(answer?.[group.id]));
  }
  return Boolean(answer);
}

export default function App() {
  const [state, setState] = useState(loadProgress);
  const { screen, currentId, answers } = state;
  const flow = useMemo(() => getQuestionFlow(answers), [answers]);
  const currentQuestion = questions[currentId];
  const currentIndex = Math.max(0, flow.indexOf(currentId));
  const totalQuestions = answers.measurementKnowledge ? flow.length : 9;
  const moreMode = new URLSearchParams(window.location.search).get("more") === "link" ? "link" : "toggle";
  const listingFilters = useMemo(() => quizListingFilters(answers), [answers]);
  const quizMatchIds = useMemo(() => quizCatalogIds(answers), [answers]);

  useEffect(() => {
    if (screen === "start") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, screen]);

  useEffect(() => {
    const lightPage = screen === "start" || screen === "matching" || screen === "results";
    document.documentElement.classList.toggle("page-white", lightPage);
    return () => document.documentElement.classList.remove("page-white");
  }, [screen]);

  function startQuiz() {
    setState({ screen: "question", currentId: "occasion", answers: {} });
  }

  function setAnswer(value) {
    setState((previous) => ({
      ...previous,
      answers: { ...previous.answers, [previous.currentId]: value },
    }));
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
    setState({ screen: "question", currentId: "occasion", answers: {} });
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

  if (screen === "start" || screen === "matches") {
    return (
      <ProductGridEntry
        key={screen}
        title={screen === "matches" ? "Quiz matches" : "All Suits"}
        crumb={screen === "matches" ? "Quiz matches" : "Suits"}
        initialFilters={screen === "matches" ? listingFilters : undefined}
        quizMatchIds={screen === "matches" ? quizMatchIds : undefined}
        onTakeQuiz={hasSavedProgress ? resumeQuiz : startQuiz}
        onBackToQuiz={screen === "matches"
          ? () => setState((previous) => ({ ...previous, screen: "results" }))
          : undefined}
      />
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
          {screen === "question" && (
            <button className="nav-control" type="button" onClick={goBack} aria-label="Back">
              <ArrowLeftIcon />
              <span className="nav-label">Back</span>
            </button>
          )}
          {screen === "results" && (
            <button
              className="nav-control"
              type="button"
              onClick={() => setState((previous) => ({ ...previous, screen: "question", currentId: "occasion" }))}
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
          {screen === "question" && (
            <button className="nav-control" type="button" onClick={saveAndExit}>Save and exit</button>
          )}
          {screen === "results" && (
            <button className="nav-control" type="button" onClick={restart}>Start over</button>
          )}
        </div>
      </header>
      <main className={`app-shell${screen === "results" ? " app-shell-wide" : ""}`}>
        {screen === "question" && currentQuestion && (
          <section className="wire-panel" aria-labelledby="question-title">
            <ol className="quiz-steps" aria-hidden="true">
              {Array.from({ length: totalQuestions }, (_, index) => (
                <li className={index <= currentIndex ? "quiz-step-done" : undefined} key={index} />
              ))}
            </ol>
            <div className="progress-row">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              <span className="save-note">Progress saved on this device</span>
            </div>
            <h2 id="question-title">{currentQuestion.title}</h2>
            <p className="helper">{currentQuestion.help}</p>

            {currentQuestion.type === "occasionPlus" ? (
              <OccasionQuestion question={currentQuestion} answers={answers} onChange={mergeAnswers} />
            ) : currentQuestion.type === "colors" ? (
              <ColorQuestion question={currentQuestion} value={answers.colors} onChange={setAnswer} />
            ) : currentQuestion.type === "measurements" ? (
              <MeasurementsQuestion value={answers[currentId]} onChange={setAnswer} />
            ) : currentQuestion.type === "sizes" ? (
              <SizesQuestion question={currentQuestion} value={answers[currentId]} onChange={setAnswer} />
            ) : (
              <ChoiceQuestion question={currentQuestion} value={answers[currentId]} onChange={setAnswer} />
            )}

            <div className="actions actions-end">
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
        )}

        {screen === "matching" && <MatchingScreen onDone={showResults} />}

        {screen === "results" && (
          <Results
            answers={answers}
            moreMode={moreMode}
            onSeeAll={() => setState((previous) => ({ ...previous, screen: "matches" }))}
            onEditAnswers={() => setState((previous) => ({ ...previous, screen: "question", currentId: "occasion" }))}
          />
        )}
      </main>
    </>
  );
}
