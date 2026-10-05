import { useEffect, useRef, useState } from "react";
import { FACETS, QUICK_FACETS, SORTS } from "../data/catalog.js";
import { selectionCount, totalSelections } from "../filters.js";

export default function FilterBar({ applied, sheetOpen, openFacet, onOpen, sort, onSort }) {
  const total = totalSelections(applied);
  const [sortOpen, setSortOpen] = useState(false);
  const [pickup, setPickup] = useState(false);
  const sortRef = useRef(null);
  const chips = QUICK_FACETS.map((id) => FACETS.find((facet) => facet.id === id)).filter(Boolean);

  useEffect(() => {
    if (!sortOpen) return undefined;
    function onPointer(event) {
      if (!sortRef.current?.contains(event.target)) setSortOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [sortOpen]);

  return (
    <div className="filter-bar">
      <div className="toolbar">
        <button
          type="button"
          className="tool"
          data-testid="open-filter"
          aria-expanded={sheetOpen && openFacet == null}
          aria-controls="filter-sheet"
          onClick={() => onOpen(null)}
        >
          Filter
          <FilterIcon />
          {total > 0 && <span className="tool-count">{total}</span>}
        </button>
        <div className="sort-wrap" ref={sortRef}>
          <button
            type="button"
            className="tool"
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
            onClick={() => setSortOpen((open) => !open)}
          >
            Sort
            <SortIcon />
          </button>
          {sortOpen && (
            <ul className="sort-menu" role="listbox" aria-label="Sort">
              {SORTS.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sort === option.id}
                    onClick={() => {
                      onSort(option.id);
                      setSortOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label className="pickup">
          <span>Pick Up (0)</span>
          <input
            type="checkbox"
            role="switch"
            checked={pickup}
            onChange={(event) => setPickup(event.target.checked)}
          />
        </label>
      </div>
      <div className="filter-scroller">
        {chips.map((facet) => {
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
      <path d="M4 7h16M7 12h10M10 17h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6v12M8 6 5.5 8.5M8 6l2.5 2.5M16 18V6M16 18l-2.5-2.5M16 18l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
