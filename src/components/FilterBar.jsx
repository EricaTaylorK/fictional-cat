import { useEffect, useRef, useState } from "react";
import { FACETS, QUICK_FACETS, SORTS } from "../data/catalog.js";
import { appliedTokens, selectionCount, totalSelections } from "../filters.js";

export default function FilterBar({
  applied,
  sheetOpen,
  openFacet,
  onOpen,
  onRemove,
  onClear,
  sort,
  onSort,
}) {
  const total = totalSelections(applied);
  const selected = appliedTokens(applied);
  const [sortOpen, setSortOpen] = useState(false);
  const [pickup, setPickup] = useState(false);
  const sortRef = useRef(null);
  const chips = QUICK_FACETS.map((id) => FACETS.find((facet) => facet.id === id)).filter(Boolean);
  const sortLabel = SORTS.find((option) => option.id === sort)?.label ?? "Featured";

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
      <div className="filter-row">
        <div className="filter-scroller">
          <div className="sort-wrap" ref={sortRef}>
            <button
              type="button"
              className="chip chip-action"
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              onClick={() => setSortOpen((open) => !open)}
            >
              <span>Sort: {sortLabel}</span>
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
          <button
            type="button"
            className={total > 0 ? "chip chip-action has-selection" : "chip chip-action"}
            data-testid="open-filter"
            aria-expanded={sheetOpen && openFacet == null}
            aria-controls="filter-sheet"
            onClick={() => onOpen(null)}
          >
            <span>Filter</span>
            <FilterIcon />
            {total > 0 && <span className="chip-count">{total}</span>}
          </button>
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
      {selected.length > 0 && (
        <div className="selected-filters" data-testid="selected-filters">
          <ul className="selected-list" aria-label="Selected filters">
            {selected.map((token) => (
              <li key={token.key}>
                <span className="selected-chip">
                  <span>{token.label}</span>
                  <button
                    type="button"
                    className="selected-remove"
                    aria-label={`Remove ${token.label}`}
                    data-testid={`remove-${token.key}`}
                    onClick={() => onRemove(token)}
                  >
                    <CloseIcon />
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="selected-clear"
            data-testid="clear-selected"
            onClick={onClear}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7h16M7 12h10M10 17h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 7v10M8 7l-2.2 2.2M8 7l2.2 2.2M16 17V7M16 17l-2.2-2.2M16 17l2.2-2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3.2 3.2 L8.8 8.8 M8.8 3.2 L3.2 8.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
