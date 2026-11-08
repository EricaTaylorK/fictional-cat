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
  onFindSuit,
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
      <div className="filter-toolbar">
        <div className="filter-controls">
          <button
            type="button"
            className="control-btn"
            data-testid="open-filter"
            aria-expanded={sheetOpen && openFacet == null}
            aria-controls="filter-sheet"
            onClick={() => onOpen(null)}
          >
            <span>Filter{total > 0 && ` (${total})`}</span>
            <FilterIcon />
          </button>
          <div className="sort-wrap" ref={sortRef}>
            <button
              type="button"
              className="control-btn"
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              onClick={() => setSortOpen((open) => !open)}
            >
              <span>
                Sort<span className="sort-label">: {sortLabel}</span>
              </span>
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
        </div>
        <label className="pickup">
          <span>Pick Up At Store</span>
          <input
            type="checkbox"
            role="switch"
            aria-checked={pickup}
            checked={pickup}
            onChange={(event) => setPickup(event.target.checked)}
          />
        </label>
      </div>
      <div className="facet-chips">
        {chips.map((facet) => {
          const count = selectionCount(applied, facet.id);
          return (
            <button
              key={facet.id}
              type="button"
              className="chip"
              aria-pressed={count > 0}
              data-testid={`chip-${facet.id}`}
              aria-expanded={sheetOpen && openFacet === facet.id}
              aria-controls="filter-sheet"
              onClick={() => onOpen(facet.id)}
            >
              {facet.label}
              {count > 0 && ` (${count})`}
            </button>
          );
        })}
        {onFindSuit && (
          <button type="button" className="chip chip-find-suit" onClick={onFindSuit}>
            <SparkleIcon />
            Find My Suit
          </button>
        )}
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

function SparkleIcon() {
  return (
    <svg className="chip-find-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M6.2 1.2 7.3 4.4 10.6 5.4 7.3 6.5 6.2 9.8 5.1 6.5 1.8 5.4 5.1 4.4 6.2 1.2Zm5.2 6.1.7 2 2.1.7-2.1.7-.7 2-.7-2-2.1-.7 2.1-.7.7-2Z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 7.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm-.95-.5H4v1h9.05a2.5 2.5 0 0 0 4.9 0H20V7h-2.05a2.5 2.5 0 0 0-4.9 0ZM20 13h-9.05a2.5 2.5 0 0 1-4.9 0H4v-1h2.05a2.5 2.5 0 0 1 4.9 0H20v1Zm-10-.5v.001a1.5 1.5 0 1 1 0-.002v.001Zm7.95 5.5H20v-1h-2.05a2.5 2.5 0 0 0-4.9 0H4v1h9.05a2.5 2.5 0 0 0 4.9 0ZM14 17.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z"
      />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 4v16M8 4 4.5 7.5M16 20V4M16 20l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
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
