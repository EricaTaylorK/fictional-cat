import { useEffect, useState } from "react";
import { COLORS, FACETS, PRICE_RANGES } from "../data/catalog.js";
import { commitPrice, countOption } from "../filters.js";

export default function FilterSheet({
  initialFacet,
  draft,
  products,
  search,
  onChange,
  onApply,
  onClear,
  onClose,
}) {
  // The clicked facet is expanded in this first render, not after the sheet opens.
  const [expanded, setExpanded] = useState(initialFacet);
  const [minInput, setMinInput] = useState(draft.priceMin ?? "");
  const [maxInput, setMaxInput] = useState(draft.priceMax ?? "");
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    setMinInput(draft.priceMin ?? "");
    setMaxInput(draft.priceMax ?? "");
  }, [draft.priceMin, draft.priceMax]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function toggleFacet(facetId) {
    setExpanded((current) => (current === facetId ? null : facetId));
  }

  function toggleOption(facetId, optionId) {
    const current = draft.selections[facetId] ?? [];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    onChange({
      ...draft,
      selections: { ...draft.selections, [facetId]: next },
    });
  }

  function applyCustomPrice() {
    const result = commitPrice(draft, minInput, maxInput);
    if (result.error) {
      setPriceError(result.error);
      return;
    }
    setPriceError("");
    onChange(result.filters);
  }

  function applySheet() {
    const result = commitPrice(draft, minInput, maxInput);
    if (result.error) {
      setPriceError(result.error);
      setExpanded("price");
      return;
    }
    onApply(result.filters);
  }

  function clearSheet() {
    setPriceError("");
    setMinInput("");
    setMaxInput("");
    onClear();
  }

  return (
    <>
      <button type="button" className="scrim" aria-label="Close filters" onClick={onClose} />
      <div
        className="sheet"
        id="filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
      >
        <header className="sheet-header">
          <span className="sheet-header-spacer" aria-hidden="true" />
          <h2 id="filter-title">Filter by</h2>
          <button
            type="button"
            className="icon-btn close-btn"
            aria-label="Close filters"
            data-testid="close-filters"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>
        <div className="sheet-body">
          {FACETS.map((facet) => {
            const open = expanded === facet.id;
            return (
              <section
                key={facet.id}
                className={open ? "facet is-open" : "facet"}
                data-testid={`facet-${facet.id}`}
                data-expanded={open ? "true" : "false"}
              >
                <button
                  type="button"
                  className="facet-toggle"
                  aria-expanded={open}
                  onClick={() => toggleFacet(facet.id)}
                >
                  <span>{facet.label}</span>
                  <Chevron />
                </button>
                {open && (
                  <div className="facet-body">
                    {facet.kind === "price" ? (
                      <PriceEditor
                        draft={draft}
                        products={products}
                        search={search}
                        minInput={minInput}
                        maxInput={maxInput}
                        error={priceError}
                        onMin={setMinInput}
                        onMax={setMaxInput}
                        onApplyRange={applyCustomPrice}
                        onToggle={(optionId) => toggleOption("price", optionId)}
                      />
                    ) : (
                      <OptionList
                        facet={facet}
                        draft={draft}
                        products={products}
                        search={search}
                        onToggle={(optionId) => toggleOption(facet.id, optionId)}
                      />
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
        <footer className="sheet-actions">
          <button type="button" className="btn-clear" data-testid="clear-filters" onClick={clearSheet}>
            Clear all
          </button>
          <button type="button" className="btn-apply" data-testid="apply-filters" onClick={applySheet}>
            Apply
          </button>
        </footer>
      </div>
    </>
  );
}

function OptionList({ facet, draft, products, search, onToggle }) {
  const selected = draft.selections[facet.id] ?? [];
  const layout = facet.id === "color" ? "swatches" : facet.id === "size" ? "sizes" : "list";
  return (
    <div className={`options options-${layout}`}>
      {facet.options.map((option) => {
        const count = countOption(products, draft, search, facet.id, option.id);
        const checked = selected.includes(option.id);
        return (
          <label
            key={option.id}
            className={[
              "option",
              count === 0 ? "is-empty" : "",
              checked ? "is-checked" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {layout === "swatches" && (
              <span className="swatch-ring">
                <span className="swatch-disc" style={{ background: COLORS[option.id].hex }} />
              </span>
            )}
            <span className="option-copy">
              {option.label}
              {layout === "list" && <span className="option-count"> ({count})</span>}
            </span>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(option.id)}
            />
          </label>
        );
      })}
    </div>
  );
}

function PriceEditor({
  draft,
  products,
  search,
  minInput,
  maxInput,
  error,
  onMin,
  onMax,
  onApplyRange,
  onToggle,
}) {
  const selected = draft.selections.price ?? [];

  function onKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      onApplyRange();
    }
  }

  return (
    <div className="price-editor">
      <div className="price-range">
        <label className="money-field">
          <span aria-hidden="true">$</span>
          <input
            inputMode="decimal"
            placeholder="Min"
            aria-label="Minimum price"
            value={minInput}
            onChange={(event) => onMin(event.target.value)}
            onKeyDown={onKeyDown}
          />
        </label>
        <span className="price-to">to</span>
        <label className="money-field">
          <span aria-hidden="true">$</span>
          <input
            inputMode="decimal"
            placeholder="Max"
            aria-label="Maximum price"
            value={maxInput}
            onChange={(event) => onMax(event.target.value)}
            onKeyDown={onKeyDown}
          />
        </label>
        <button type="button" className="price-apply" onClick={onApplyRange}>
          Apply
        </button>
      </div>
      {error && <p className="price-error">{error}</p>}
      <div className="options">
        {PRICE_RANGES.map((range) => {
          const count = countOption(products, draft, search, "price", range.id);
          return (
            <label key={range.id} className={count === 0 ? "option is-empty" : "option"}>
              <span>
                {range.label} <span className="option-count">({count})</span>
              </span>
              <input
                type="checkbox"
                data-testid={`price-${range.id}`}
                checked={selected.includes(range.id)}
                onChange={() => onToggle(range.id)}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg className="chevron" viewBox="0 0 14 8" aria-hidden="true">
      <path d="M1 1.2 L7 6.8 L13 1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 3 L13 13 M13 3 L3 13" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
