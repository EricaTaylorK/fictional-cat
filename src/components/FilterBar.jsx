import { FACETS } from "../data/catalog.js";
import { selectionCount, totalSelections } from "../filters.js";

export default function FilterBar({ applied, sheetOpen, openFacet, onOpen }) {
  const total = totalSelections(applied);

  return (
    <div className="filter-bar">
      <div className="filter-scroller">
        <button
          type="button"
          className="chip chip-filter"
          data-testid="open-filter"
          aria-expanded={sheetOpen && openFacet == null}
          aria-controls="filter-sheet"
          onClick={() => onOpen(null)}
        >
          <FilterIcon />
          Filter
          {total > 0 && <span className="chip-count">{total}</span>}
        </button>
        {FACETS.map((facet) => {
          const count = selectionCount(applied, facet.id);
          return (
            <button
              key={facet.id}
              type="button"
              className={count > 0 ? "chip has-selection" : "chip"}
              aria-pressed={count > 0}
              data-testid={`chip-${facet.id}`}
              aria-expanded={sheetOpen && openFacet === facet.id}
              aria-controls="filter-sheet"
              onClick={() => onOpen(facet.id)}
            >
              {facet.label}
              {count > 0 && <span className="chip-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
