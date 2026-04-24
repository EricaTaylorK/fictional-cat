import { useCallback, useMemo, useState } from "react";
import { BAGEL_TYPES, BUNDLE_BAGEL_TOTAL, BUNDLE_CREAM_PICKS, CREAM_FLAVORS } from "../siteContent.js";

function initialCounts() {
  return Object.fromEntries(BAGEL_TYPES.map((b) => [b.id, 0]));
}

export default function BundleBuilder() {
  const [counts, setCounts] = useState(initialCounts);
  const [creams, setCreams] = useState([]);

  const total = useMemo(() => BAGEL_TYPES.reduce((sum, b) => sum + (counts[b.id] ?? 0), 0), [counts]);

  const bagelComplete = total === BUNDLE_BAGEL_TOTAL;
  const creamComplete = creams.length === BUNDLE_CREAM_PICKS;
  const bundleReady = bagelComplete && creamComplete;

  const inc = useCallback((id) => {
    setCounts((c) => {
      const sum = BAGEL_TYPES.reduce((s, b) => s + (c[b.id] ?? 0), 0);
      if (sum >= BUNDLE_BAGEL_TOTAL) return c;
      return { ...c, [id]: (c[id] ?? 0) + 1 };
    });
  }, []);

  const dec = useCallback((id) => {
    setCounts((c) => {
      const n = c[id] ?? 0;
      if (n <= 0) return c;
      return { ...c, [id]: n - 1 };
    });
  }, []);

  const toggleCream = useCallback((id) => {
    setCreams((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= BUNDLE_CREAM_PICKS) return prev;
      return [...prev, id];
    });
  }, []);

  const reset = useCallback(() => {
    setCounts(initialCounts());
    setCreams([]);
  }, []);

  const progressPct = (total / BUNDLE_BAGEL_TOTAL) * 100;

  return (
    <section id="bundle" className="bundle section reveal" data-reveal aria-labelledby="bundle-title">
      <div className="bundle__wrap">
        <header className="bundle__intro section__head">
          <p className="section__label">The tin</p>
          <h2 id="bundle-title">Build your bundle</h2>
          <p className="section__deck">
            Choose any mix across eight kettle rings—exactly {BUNDLE_BAGEL_TOTAL} bagels—then pick {BUNDLE_CREAM_PICKS}{" "}
            schmears. We pack it like a prize.
          </p>
        </header>

        <div className="bundle__shell">
          <div className="bundle__meter" aria-hidden="true">
            <div className="bundle__meter-track">
              <div className="bundle__meter-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="bundle__meter-row">
              <span className="bundle__meter-label">Bagels in your tin</span>
              <span className="bundle__meter-value">
                <span className="tabular">{total}</span>
                <span className="bundle__meter-of"> / {BUNDLE_BAGEL_TOTAL}</span>
              </span>
            </div>
          </div>

          <p className="visually-hidden" aria-live="polite">
            {total} of {BUNDLE_BAGEL_TOTAL} bagels selected.
          </p>

          <ul className="bundle__bagels">
            {BAGEL_TYPES.map((b) => {
              const n = counts[b.id] ?? 0;
              const atCap = total >= BUNDLE_BAGEL_TOTAL;
              return (
                <li key={b.id} className={`bagel-card${n > 0 ? " bagel-card--active" : ""}`}>
                  <div className="bagel-card__top">
                    <h3 className="bagel-card__name">{b.name}</h3>
                    <p className="bagel-card__hint">{b.hint}</p>
                  </div>
                  <div className="stepper">
                    <button
                      type="button"
                      className="stepper__btn"
                      onClick={() => dec(b.id)}
                      disabled={n <= 0}
                      aria-label={`Remove one ${b.name}`}
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <span className="stepper__value tabular" aria-live="polite">
                      {n}
                    </span>
                    <button
                      type="button"
                      className="stepper__btn"
                      onClick={() => inc(b.id)}
                      disabled={atCap}
                      aria-label={`Add one ${b.name}`}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="bundle__cream-block">
            <div className="bundle__cream-head">
              <h3 className="bundle__cream-title">Two schmears</h3>
              <p className="bundle__cream-sub">
                Pick exactly {BUNDLE_CREAM_PICKS}. Tap to select or clear.
                <span className="tabular">
                  {" "}
                  ({creams.length}/{BUNDLE_CREAM_PICKS})
                </span>
              </p>
            </div>
            <div className="cream-grid" role="group" aria-label="Cream cheese flavors">
              {CREAM_FLAVORS.map((c) => {
                const on = creams.includes(c.id);
                const atCreamCap = creams.length >= BUNDLE_CREAM_PICKS && !on;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`cream-tile${on ? " cream-tile--selected" : ""}`}
                    onClick={() => toggleCream(c.id)}
                    disabled={atCreamCap}
                    aria-pressed={on}
                  >
                    <span className="cream-tile__name">{c.name}</span>
                    <span className="cream-tile__note">{c.note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <footer className="bundle__footer">
            <button type="button" className="btn btn--primary bundle__cta" disabled={!bundleReady}>
              Reserve bundle
            </button>
            <button type="button" className="btn btn--ghost bundle__reset" onClick={reset}>
              Clear all
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}
