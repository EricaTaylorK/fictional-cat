import { useEffect, useLayoutEffect, useRef } from "react";

const INK = "#1b1c20";
const SOFT = "#c9d9f2";
const BLUE = "#1f5be6";

function IntroIllustration() {
  return (
    <svg className="intro-illustration" viewBox="0 0 130 118" aria-hidden="true">
      <defs>
        <pattern id="intro-dots" width="3.4" height="3.4" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="0.95" fill={INK} />
        </pattern>
      </defs>

      <path d="M14 88h104v8H14zM22 96h92v6H22zM34 102h50v4H34zM52 106h26v3H52z" fill="url(#intro-dots)" />

      <g stroke={INK} strokeLinecap="round" strokeWidth="2">
        <path d="M20 30 26 34M27 22l3 6M36 21l-1 6" />
      </g>

      <path
        d="M14 98V48c0-5 3-8 8-10l14-6h18l12 5c4 2 6 5 6 10v51z"
        fill="#fff"
        stroke={INK}
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path d="M16.5 50c0-4 2-7 6-8v54h-6z" fill={SOFT} />
      <path d="M36 33h18l-8 47z" fill={INK} />
      <path
        d="M36 33l-6 7 5 4-4 4 15 32M54 33l5 6-4 4 3 4-12 33"
        fill="#fff"
        stroke={INK}
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M48 87h3M48 93h3M57 80h10" stroke={INK} strokeLinecap="round" strokeWidth="2" />

      <path
        d="M52 10h34a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H64l-8 6 1-6h-5a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6z"
        fill="#fff"
        stroke={INK}
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path d="M50 16a3 3 0 0 1 3-3h3v36h-3a3 3 0 0 1-3-3z" fill={SOFT} />
      <path d="M61 21h16M61 28h20M61 35h14" stroke={INK} strokeLinecap="round" strokeWidth="2" />

      <rect x="86" y="32" width="36" height="10" rx="3" fill={SOFT} stroke={BLUE} strokeWidth="2" />
      <circle cx="83" cy="37" r="6.5" fill={BLUE} stroke="#fff" strokeWidth="1.5" />
      <path d="m80 37 2.2 2.2 4-4.4" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />

      {[55, 74].map((y) => (
        <g key={y}>
          <rect x="86" y={y - 5} width="36" height="10" rx="3" fill="#fff" stroke={INK} strokeWidth="2" />
          <path d={`M89 ${y + 1}h30v2.5H89z`} fill={SOFT} />
          <circle cx="83" cy={y} r="6.5" fill={INK} stroke="#fff" strokeWidth="1.5" />
          <path
            d={`m80.6 ${y - 2.4} 4.8 4.8m0-4.8-4.8 4.8`}
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </g>
      ))}
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M6.5 1.5 7.8 5.2l3.7 1.3-3.7 1.3-1.3 3.7-1.3-3.7L1.5 6.5l3.7-1.3zM12 9l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </svg>
  );
}

export default function IntroModal({ onStart, onResume, onClose, onBack, progress, stepLabel, children, labelledBy = "intro-title" }) {
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
            <span className="intro-header-title">Find the Right Suit for You</span>
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
          <IntroIllustration />
          <h1 id="intro-title" className="intro-title">Find a suit for the occasion</h1>
          <p className="intro-copy">
            A few questions about the event, how the suit should feel, and your size. We’ll narrow the options.
          </p>
          <button className="intro-start" type="button" ref={startRef} onClick={onStart}>
            <SparkleIcon />
            Start
          </button>
          <p className="intro-note">About a minute. Skip anything you’re not sure about.</p>
          {onResume && (
            <button className="text-link intro-resume" type="button" onClick={onResume}>
              Or pick up where you left off
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
