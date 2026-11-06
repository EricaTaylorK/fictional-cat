import { quizHref, trackEntryClick } from "./quizEntry.js";
import "./entries.css";

const COPY = {
  badge: "AI Style Expert",
  headline: "Meet your personal style expert",
  cta: "Find the suit",
};

function SparkleIcon() {
  return (
    <svg className="sf-entry-sparkle" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.5 1.5 7.8 5.2l3.7 1.3-3.7 1.3-1.3 3.7-1.3-3.7L1.5 6.5l3.7-1.3zM12 9l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"
      />
    </svg>
  );
}

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
      <img
        className="sf-entry-art"
        src="/quiz/style-expert.svg"
        alt=""
        width="197"
        height="197"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding={priority ? "sync" : "async"}
      />
      <span className="sf-entry-copy">
        <span className="sf-entry-badge">
          <span className="sf-entry-mark" aria-hidden="true">
            M|W
          </span>
          {COPY.badge}
        </span>
        <span className="sf-entry-title">{COPY.headline}</span>
        <span className="sf-entry-lede">
          In <strong>under a minute</strong> we&apos;ll find the perfect suit for your event, for you.
        </span>
      </span>
      <span className="sf-entry-cta">
        <SparkleIcon />
        {COPY.cta}
      </span>
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
