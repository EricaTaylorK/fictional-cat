import { formatHours, sumHours } from "../storage.js";
import { SplitCat } from "./CatPeek.jsx";

export default function TotalsBar({ entries }) {
  const { total, capex, opex } = sumHours(entries);
  const capexPct = total > 0 ? (capex / total) * 100 : 50;
  const catLeft = total === 0 ? 50 : Math.min(94, Math.max(6, capexPct));

  return (
    <footer className="totals-bar" aria-label="Hour totals">
      <div className="totals-bar__inner">
        <div className="totals-numbers">
          <p className="totals-total">
            <span>Total</span>
            <strong>{formatHours(total)}h</strong>
          </p>
          <p className="totals-split totals-split--capex">
            <span>CapEx</span>
            <strong>{formatHours(capex)}h</strong>
          </p>
          <p className="totals-split totals-split--opex">
            <span>OpEx</span>
            <strong>{formatHours(opex)}h</strong>
          </p>
        </div>
        <div
          className="split-track"
          role="img"
          aria-label={`CapEx ${formatHours(capex)} hours, OpEx ${formatHours(opex)} hours`}
        >
          <div className="split-track__capex" style={{ width: `${capexPct}%` }} />
          <div className="split-track__opex" />
          <span className="split-cat-wrap" style={{ left: `${catLeft}%` }}>
            <SplitCat />
          </span>
        </div>
      </div>
    </footer>
  );
}
