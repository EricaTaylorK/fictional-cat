import { useCallback, useEffect, useMemo, useState } from "react";
import Results from "./components/Results.jsx";
import TextInput from "./components/TextInput.jsx";
import { products } from "./data/products.js";
import { getQuestionFlow, questions } from "./data/quizConfig.js";
import { formatPrice } from "./lib/recommendation.js";

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
        helperText="The number on the tag before S, R, or L, like 40"
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
      <fieldset className="field-pair">
        <legend className="visually-hidden">Height</legend>
        <TextInput
          label="Height (ft)"
          value={value.heightFeet}
          onChange={(next) => update("heightFeet", next)}
        />
        <TextInput
          label="Height (in)"
          value={value.heightInches}
          onChange={(next) => update("heightInches", next)}
        />
      </fieldset>
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

function isAnswered(question, answer) {
  if (question.type === "multi") return Array.isArray(answer) && answer.length > 0;
  if (question.type === "measurements") {
    return Boolean(answer?.jacket || answer?.chest || answer?.waist);
  }
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
  const totalQuestions = answers.measurementKnowledge ? flow.length : 8;

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
    setState({ screen: "start", currentId: "occasion", answers: {} });
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
      <main className={`app-shell${screen === "results" || screen === "start" ? " app-shell-wide" : ""}`}>
        {screen === "start" && (
          <section className="suits-listing" aria-labelledby="suits-title">
            <nav className="crumbs" aria-label="Breadcrumb">
              <ol>
                <li>Home</li>
                <li>Clothing</li>
                <li aria-current="page">Suits</li>
              </ol>
            </nav>
            <h1 id="suits-title">Men's Suits</h1>
            <div className="quiz-banner">
              <div className="quiz-banner-photos" aria-hidden="true">
                {products.slice(0, 3).map((product, index) => (
                  <img
                    className={index === 1 ? "quiz-banner-photo-selected" : undefined}
                    src={product.image}
                    alt=""
                    key={product.id}
                  />
                ))}
              </div>
              <div className="quiz-banner-copy">
                <p className="quiz-banner-kicker">Want help choosing a suit?</p>
                <p className="quiz-banner-title">Get personalized recommendations in less than a minute.</p>
              </div>
              <button className="quiz-banner-button" type="button" onClick={hasSavedProgress ? resumeQuiz : startQuiz}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M8 1.2 9.1 5.4 13.4 6.2 9.1 7.3 8 11.5 6.9 7.3 2.6 6.2 6.9 5.4 8 1.2Zm4.2 8.1.6 2.1 2.2.6-2.2.7-.6 2.1-.6-2.1-2.1-.7 2.1-.6.6-2.1Z" />
                </svg>
                Take the Quiz
              </button>
            </div>
            <ul className="suits-grid">
              {products.slice(0, 4).map((product) => (
                <li key={product.id}>
                  <img src={product.image} alt="" />
                  <p className="suits-price">{formatPrice(product.price)}</p>
                  <p className="suits-brand">{product.brand}</p>
                  <p className="suits-name">{product.name}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

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

            {currentQuestion.type === "measurements" ? (
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
                disabled={!isAnswered(currentQuestion, answers[currentId])}
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
            onEditAnswers={() => setState((previous) => ({ ...previous, screen: "question", currentId: "occasion" }))}          />
        )}
      </main>
    </>
  );
}
