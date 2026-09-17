export default function CatPeek({ active }) {
  return (
    <span className={`cat-peek${active ? " is-active" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 72 36" width="72" height="36" fill="none">
        <path
          d="M14 34c0-12 8-22 22-22s22 10 22 22"
          fill="#f4c9a0"
          stroke="#3b2a22"
          strokeWidth="1.6"
        />
        <path d="M24 16l-8-12 12 6" fill="#f4c9a0" stroke="#3b2a22" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M48 16l8-12-12 6" fill="#f4c9a0" stroke="#3b2a22" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M24 16l-8-12 12 6" fill="#e8a57a" opacity="0.55" />
        <path d="M48 16l8-12-12 6" fill="#e8a57a" opacity="0.55" />
        <circle cx="28" cy="26" r="2.2" fill="#2b1c16" />
        <circle cx="44" cy="26" r="2.2" fill="#2b1c16" />
        <circle cx="28.7" cy="25.3" r="0.7" fill="#fff" />
        <circle cx="44.7" cy="25.3" r="0.7" fill="#fff" />
        <path d="M34 30h4" stroke="#3b2a22" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function SleepingCat() {
  return (
    <svg className="sleeping-cat" viewBox="0 0 160 72" width="160" height="72" aria-hidden="true">
      <ellipse cx="88" cy="50" rx="48" ry="16" fill="#f4c9a0" stroke="#3b2a22" strokeWidth="1.8" />
      <circle cx="48" cy="42" r="18" fill="#f4c9a0" stroke="#3b2a22" strokeWidth="1.8" />
      <path d="M34 32l-6-14 14 8" fill="#f4c9a0" stroke="#3b2a22" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M58 30l8-14-4 16" fill="#f4c9a0" stroke="#3b2a22" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M40 44c2 2 6 2 8 0" stroke="#3b2a22" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M52 44c2 2 6 2 8 0" stroke="#3b2a22" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="46" cy="48" r="1.4" fill="#c97b8a" />
      <path d="M128 42c10-8 18-4 22 6" stroke="#3b2a22" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <text x="18" y="18" fill="#c97b8a" fontSize="12" fontFamily="Georgia, serif">
        z
      </text>
      <text x="28" y="10" fill="#c97b8a" fontSize="10" fontFamily="Georgia, serif">
        z
      </text>
    </svg>
  );
}

export function SplitCat() {
  return (
    <svg className="split-cat" viewBox="0 0 28 20" width="28" height="20" aria-hidden="true">
      <ellipse cx="14" cy="14" rx="10" ry="5" fill="#3b2a22" />
      <circle cx="10" cy="10" r="5.5" fill="#3b2a22" />
      <path d="M6 7L4 2l6 3" fill="#3b2a22" />
      <path d="M13 6l3-5 1 6" fill="#3b2a22" />
      <circle cx="8.5" cy="9.5" r="0.9" fill="#f4c9a0" />
      <circle cx="12.2" cy="9.5" r="0.9" fill="#f4c9a0" />
      <path d="M22 12c4-2 6 1 5 4" stroke="#3b2a22" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
