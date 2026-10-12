import { useEffect, useMemo, useState } from "react";
import Results from "./components/Results.jsx";
import { getQuestionFlow, questions } from "./data/quizConfig.js";

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
    if (optionValue === "none") {
      onChange(selectedValues.includes("none") ? [] : ["none"]);
      return;
    }
    const withoutNone = selectedValues.filter((item) => item !== "none");
    onChange(
      withoutNone.includes(optionValue)
        ? withoutNone.filter((item) => item !== optionValue)
        : [...withoutNone, optionValue],
    );
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
      <div className="field">
        <label htmlFor="jacket">Jacket size</label>
        <input id="jacket" inputMode="numeric" placeholder="e.g. 40" value={value.jacket ?? ""} onChange={(event) => update("jacket", event.target.value)} />
        <span className="field-hint">The number before S, R, or L</span>
      </div>
      <div className="field">
        <label htmlFor="chest">Chest in inches</label>
        <input id="chest" inputMode="numeric" placeholder="e.g. 40" value={value.chest ?? ""} onChange={(event) => update("chest", event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="waist">Waist in inches</label>
        <input id="waist" inputMode="numeric" placeholder="e.g. 34" value={value.waist ?? ""} onChange={(event) => update("waist", event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="height-feet">Height</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input id="height-feet" inputMode="numeric" aria-label="Height in feet" placeholder="ft" value={value.heightFeet ?? ""} onChange={(event) => update("heightFeet", event.target.value)} />
          <input inputMode="numeric" aria-label="Additional height in inches" placeholder="in" value={value.heightInches ?? ""} onChange={(event) => update("heightInches", event.target.value)} />
        </div>
      </div>
    </div>
  );
}

function isAnswered(question, answer) {
  if (question.type === "multi") return Array.isArray(answer) && answer.length > 0;
  if (question.type === "measurements") {
    return Boolean(answer?.jacket || answer?.chest || answer?.waist);
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
      setState((previous) => ({ ...previous, screen: "results" }));
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

  return (
    <>
      <header className="site-header">
        <p className="wordmark">Suit Finder</p>
        <span className="prototype-tag">Wireframe</span>
      </header>
      <main className="app-shell">
        {screen === "start" && (
          <section className="wire-panel" aria-labelledby="start-title">
            <p className="eyebrow">Fit-first suit finder</p>
            <h1 id="start-title">Find the suit that fits the moment—and you.</h1>
            <p className="lede">
              Answer a few plain-language questions. We’ll turn your occasion, fit needs, and
              budget into one clear recommendation.
            </p>
            <ul className="expectations">
              <li><strong>About 3 minutes</strong>7–8 quick questions</li>
              <li><strong>Instant results</strong>No email required</li>
              <li><strong>Saved here</strong>Come back on this device</li>
            </ul>
            <button className="button" type="button" onClick={startQuiz}>Find my suit</button>
          </section>
        )}

        {screen === "question" && currentQuestion && (
          <section className="wire-panel" aria-labelledby="question-title">
            <div className="progress-row">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              <span className="save-note">Progress saved on this device</span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
            </div>
            <p className="eyebrow">Your suit plan</p>
            <h2 id="question-title">{currentQuestion.title}</h2>
            <p className="helper">{currentQuestion.help}</p>

            {currentQuestion.type === "measurements" ? (
              <MeasurementsQuestion value={answers[currentId]} onChange={setAnswer} />
            ) : (
              <ChoiceQuestion question={currentQuestion} value={answers[currentId]} onChange={setAnswer} />
            )}

            <div className="actions">
              <button className="button secondary" type="button" onClick={goBack}>Back</button>
              <div className="actions-right">
                <button className="button link" type="button" onClick={restart}>Start over</button>
                <button
                  className="button"
                  type="button"
                  disabled={!isAnswered(currentQuestion, answers[currentId])}
                  onClick={continueQuiz}
                >
                  {currentIndex === flow.length - 1 ? "See my results" : "Continue"}
                </button>
              </div>
            </div>
          </section>
        )}

        {screen === "results" && (
          <Results
            answers={answers}
            onEditAnswers={() => setState((previous) => ({ ...previous, screen: "question", currentId: "occasion" }))}
            onRestart={restart}
          />
        )}
      </main>
    </>
  );
}
