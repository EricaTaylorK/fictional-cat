export function Flourish({ variant = "scroll", className = "" }) {
  const classes = `flourish flourish-${variant}${className ? ` ${className}` : ""}`;

  if (variant === "sprig") {
    return (
      <svg className={classes} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
        <path
          d="M14 5.2c.4 2.2-.2 3.6-1.6 4.6 2 .2 3.4-.6 4.4-2.2-.2 2.2-1.4 3.6-3.4 4.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <path
          d="M14 12.2c-2.4 1.6-3.2 3.6-2.6 6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeLinecap="round"
        />
        <circle cx="14" cy="20.2" r="2.15" fill="none" stroke="currentColor" strokeWidth="1.15" />
        <path d="M12.7 20.2h2.6M14 18.9v2.6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={classes} viewBox="0 0 88 20" aria-hidden="true" focusable="false">
      <path
        d="M3 12.4c4.2-.6 6.4-5.6 11.2-5.2 3.6.3 4.2 4.8 8.4 4.4 4.6-.4 5.8-5.8 10.6-5.2 3.4.4 3.8 4.2 7.6 4.4 4.8.2 6.2-5.2 11.2-4.6 3.6.4 3.6 4.6 7.8 4.2 4.4-.4 5.6-5.4 10.2-4.8 3.2.4 4.6 3.6 8.2 3.2 2.6-.3 4.8-.2 6.6.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M42.6 6.4c.8-2.6 3.6-3.2 5.2-1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FlourishRule() {
  return (
    <div className="flourish-rule" aria-hidden="true">
      <span />
      <Flourish />
      <span />
    </div>
  );
}
