export function MatchBadge({ badge, className = "" }) {
  if (!badge) return null;
  return <span className={`match-score is-${badge.tier}${className ? ` ${className}` : ""}`}>{badge.label}</span>;
}

export function MatchChecks({ badge, id }) {
  if (!badge?.checks?.length) return null;
  return (
    <ul className="match-checks" id={id}>
      {badge.checks.map((check) => (
        <li className={check.pass ? "is-pass" : "is-miss"} key={check.id}>
          <span className="match-check-mark" aria-hidden="true">{check.pass ? "✓" : "–"}</span>
          <span className="visually-hidden">{check.pass ? "Matches: " : "Differs: "}</span>
          {check.line}
        </li>
      ))}
    </ul>
  );
}
