import { useEffect, useLayoutEffect, useRef } from "react";

function IntroIllustration() {
  return (
    <img
      className="intro-illustration"
      src="/quiz/style-expert.svg"
      alt=""
      width="197"
      height="197"
    />
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M6.5 1.5 7.8 5.2l3.7 1.3-3.7 1.3-1.3 3.7-1.3-3.7L1.5 6.5l3.7-1.3zM12 9l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </svg>
  );
}

export default function IntroModal({ onStart, onClose, onBack, progress, stepLabel, children, labelledBy = "intro-title" }) {
  const dialogRef = useRef(null);
  const startRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const showingQuestion = Boolean(children);

  useLayoutEffect(() => {
    if (showingQuestion) {
      dialogRef.current?.focus({ preventScroll: true });
      return;
    }
    startRef.current?.focus({ preventScroll: true });
  }, [showingQuestion]);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    function handleKey(event) {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      const focusable = dialog?.querySelectorAll("button, input, select, textarea");
      if (!dialog || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const atStart = document.activeElement === first || document.activeElement === dialog;
      if (event.shiftKey && atStart) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="intro-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="intro-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} ref={dialogRef}>
        <header className="intro-header">
          {onBack ? (
            <button className="intro-back" type="button" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M14.5 5.5 8 12l6.5 6.5.7-.7L9.4 12l5.8-5.8-.7-.7Z" />
              </svg>
              Back
            </button>
          ) : <span />}
          <span className="intro-brand">
            <span className="intro-badge" aria-hidden="true">MW</span>
            <span className="intro-header-title">AI Style Expert</span>
          </span>
          <span className="intro-header-end">
            {stepLabel && <span className="intro-step">{stepLabel}</span>}
          <button className="intro-close" type="button" aria-label="Close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
          </button>
          </span>
          {progress != null && (
            <span className="intro-progress" aria-hidden="true">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </span>
          )}
        </header>
        {children ?? (
        <div className="intro-body">
          <div className="intro-main">
            <IntroIllustration />
            <h1 id="intro-title" className="intro-title">Tell us the occasion. We'll find the suit.</h1>
            <p className="intro-copy">
              Answer a few quick questions. You'll get matches right away, with the reasons behind each.
            </p>
          </div>
          <div className="quiz-dock">
            <button className="intro-start" type="button" ref={startRef} onClick={onStart}>
              <SparkleIcon />
              Start the quiz
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
