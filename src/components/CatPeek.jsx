export default function CatPeek({ active }) {
  return (
    <span className={`cat-peek${active ? " is-active" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 72 36" width="72" height="36" fill="none">
        <path
          d="M14 34c0-12 8-22 22-22s22 10 22 22"
          fill="var(--fur)"
          stroke="var(--fur-line)"
          strokeWidth="1.6"
        />
        <path d="M24 16l-8-12 12 6" fill="var(--fur)" stroke="var(--fur-line)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M48 16l8-12-12 6" fill="var(--fur)" stroke="var(--fur-line)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M24 16l-8-12 12 6" fill="var(--fur-inner)" opacity="0.7" />
        <path d="M48 16l8-12-12 6" fill="var(--fur-inner)" opacity="0.7" />
        <ellipse cx="22" cy="29" rx="3" ry="2" fill="var(--fur-blush)" opacity="0.5" />
        <ellipse cx="50" cy="29" rx="3" ry="2" fill="var(--fur-blush)" opacity="0.5" />
        <circle cx="28" cy="26" r="2.4" fill="var(--fur-line)" />
        <circle cx="44" cy="26" r="2.4" fill="var(--fur-line)" />
        <circle cx="28.8" cy="25.2" r="0.8" fill="#fff" />
        <circle cx="44.8" cy="25.2" r="0.8" fill="#fff" />
        <path d="M34 30h4" stroke="var(--fur-line)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function MastheadCat() {
  return (
    <svg className="masthead__mark" viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M10 16L7.5 4.5 18.5 10Z"
        fill="var(--fur)"
        stroke="var(--fur-line)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M30 16L32.5 4.5 21.5 10Z"
        fill="var(--fur)"
        stroke="var(--fur-line)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M11.6 13.4L10.2 7.6 16.4 10.7Z" fill="var(--fur-inner)" />
      <path d="M28.4 13.4L29.8 7.6 23.6 10.7Z" fill="var(--fur-inner)" />
      <circle cx="20" cy="24" r="12.5" fill="var(--fur)" stroke="var(--fur-line)" strokeWidth="1.6" />
      <ellipse cx="11.6" cy="26.4" rx="2.6" ry="1.9" fill="var(--fur-blush)" opacity="0.55" />
      <ellipse cx="28.4" cy="26.4" rx="2.6" ry="1.9" fill="var(--fur-blush)" opacity="0.55" />
      <circle cx="15.4" cy="22.4" r="1.9" fill="var(--fur-line)" />
      <circle cx="24.6" cy="22.4" r="1.9" fill="var(--fur-line)" />
      <circle cx="16" cy="21.6" r="0.6" fill="#fff" />
      <circle cx="25.2" cy="21.6" r="0.6" fill="#fff" />
      <path d="M20 26.6L18.6 25.4h2.8Z" fill="var(--fur-blush)" />
      <path
        d="M20 27.2c-.9 1.3-2.7 1.2-3.4-.2M20 27.2c.9 1.3 2.7 1.2 3.4-.2"
        stroke="var(--fur-line)"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M11.8 23.4L6.4 22.2M11.8 26L6.6 26.4M28.2 23.4L33.6 22.2M28.2 26L33.4 26.4"
        stroke="var(--fur-line)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SleepingCat() {
  return (
    <svg className="sleeping-cat" viewBox="0 0 160 72" width="160" height="72" aria-hidden="true">
      <ellipse cx="88" cy="50" rx="48" ry="16" fill="var(--fur)" stroke="var(--fur-line)" strokeWidth="1.8" />
      <circle cx="48" cy="42" r="18" fill="var(--fur)" stroke="var(--fur-line)" strokeWidth="1.8" />
      <path d="M34 32l-6-14 14 8" fill="var(--fur)" stroke="var(--fur-line)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M58 30l8-14-4 16" fill="var(--fur)" stroke="var(--fur-line)" strokeWidth="1.8" strokeLinejoin="round" />
      <ellipse cx="38" cy="47" rx="3.4" ry="2.4" fill="var(--fur-blush)" opacity="0.55" />
      <ellipse cx="58" cy="47" rx="3.4" ry="2.4" fill="var(--fur-blush)" opacity="0.55" />
      <path d="M40 44c2 2 6 2 8 0" stroke="var(--fur-line)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M52 44c2 2 6 2 8 0" stroke="var(--fur-line)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M48 49l-1.6-1.4h3.2Z" fill="var(--fur-blush)" />
      <path d="M128 42c10-8 18-4 22 6" stroke="var(--fur-line)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path
        d="M14 20h8l-8 8h8M26 10h6l-6 6h6"
        stroke="var(--fur-blush)"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SplitCat() {
  return (
    <svg className="split-cat" viewBox="0 0 28 20" width="28" height="20" aria-hidden="true">
      <ellipse cx="14" cy="14" rx="10" ry="5" fill="var(--fur-line)" />
      <circle cx="10" cy="10" r="5.5" fill="var(--fur-line)" />
      <path d="M6 7L4 2l6 3" fill="var(--fur-line)" />
      <path d="M13 6l3-5 1 6" fill="var(--fur-line)" />
      <circle cx="8.5" cy="9.5" r="0.9" fill="var(--fur)" />
      <circle cx="12.2" cy="9.5" r="0.9" fill="var(--fur)" />
      <path d="M22 12c4-2 6 1 5 4" stroke="var(--fur-line)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
