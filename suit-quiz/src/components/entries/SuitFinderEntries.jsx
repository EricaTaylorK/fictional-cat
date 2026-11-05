import { quizHref, trackEntryClick } from "./quizEntry.js";
import "./entries.css";

const COPY = {
  eyebrow: "MEET YOUR PERSONAL STYLIST",
  title: "SUIT FINDER",
  cta: "FIND THE SUIT",
};

function SuitFinderEntry({ variant, entrypoint, priority = false, onActivate }) {
  return (
    <a
      className={`sf-entry sf-entry--${variant}`}
      href={quizHref(entrypoint)}
      data-variant={variant}
      data-entrypoint={entrypoint}
      onClick={(event) => {
        trackEntryClick(entrypoint);
        if (!onActivate) return;
        event.preventDefault();
        onActivate(entrypoint);
      }}
    >
      <span className="sf-entry-body">
        <span className="sf-entry-mark">
          <img
            src="/quiz/style-expert.svg"
            alt=""
            width="197"
            height="197"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "low"}
            decoding={priority ? "sync" : "async"}
          />
        </span>
        <span className="sf-entry-copy">
          <span className="sf-entry-eyebrow">{COPY.eyebrow}</span>
          <span className="sf-entry-title">{COPY.title}</span>
        </span>
      </span>
      <span className="sf-entry-cta">{COPY.cta}</span>
    </a>
  );
}

export function CompactCard({ entrypoint, onActivate }) {
  return <SuitFinderEntry variant="card" entrypoint={entrypoint} onActivate={onActivate} />;
}

export function WideSlimBanner({ entrypoint, onActivate }) {
  return <SuitFinderEntry variant="slim" entrypoint={entrypoint} onActivate={onActivate} />;
}

export function LargeHeroBanner({ entrypoint, priority = false, onActivate }) {
  return <SuitFinderEntry variant="hero" entrypoint={entrypoint} priority={priority} onActivate={onActivate} />;
}
