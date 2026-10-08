import { useEffect, useMemo, useState } from "react";
import { COLORS, FACETS, PRICE_RANGES } from "../data/catalog.js";
import {
  countOption,
  matchingProducts,
  readPrice,
  totalSelections,
} from "../filters.js";
import SizeFilterGuided from "./SizeFilter.jsx";
import SizeFilterLite from "./SizeFilterLite.jsx";
import SizeFilterMW from "./SizeFilterMW.jsx";

const SIZE_VARIANT = import.meta.env.VITE_SIZE_VARIANT;
const SIZE_VARIANTS = { mw: SizeFilterMW, lite: SizeFilterLite };
const SizeFilter = SIZE_VARIANTS[SIZE_VARIANT] ?? SizeFilterGuided;

export default function FilterSheet({
  initialFacet,
  draft,
  products,
  search,
  desktop,
  variant,
  onChange,
  onApply,
  onClear,
  onClose,
}) {
  // The clicked facet is expanded in this first render, not after the sheet opens.
  const [expanded, setExpanded] = useState(initialFacet ?? (SIZE_VARIANT === "mw" ? "size" : null));
  const [minInput, setMinInput] = useState(formatBound(draft.priceMin));
  const [maxInput, setMaxInput] = useState(formatBound(draft.priceMax));
  const [minTouched, setMinTouched] = useState(false);
  const [maxTouched, setMaxTouched] = useState(false);

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

  const price = readPrice(minInput, maxInput);
  const showMinError = minTouched && price.minError;
  const showMaxError = maxTouched && price.maxError;
  const showRangeError = (minTouched || maxTouched) && price.rangeError;

  const preview = useMemo(() => {
    if (!price.valid) return draft;
    const hasCustom = price.priceMin != null || price.priceMax != null;
    return {
      ...draft,
      priceMin: price.priceMin,
      priceMax: price.priceMax,
      selections: {
        ...draft.selections,
        price: hasCustom ? [] : [...(draft.selections.price ?? [])],
      },
    };
  }, [draft, price]);

  const previewCount = useMemo(
    () => matchingProducts(products, preview, search).length,
    [products, preview, search]
  );

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

  function editPrice(which, value) {
    if (which === "min") setMinInput(value);
    else setMaxInput(value);
    const hasGroupings = (draft.selections.price ?? []).length > 0;
    const hasCustom = draft.priceMin != null || draft.priceMax != null;
    if (!hasGroupings && !hasCustom) return;
    onChange({
      ...draft,
      priceMin: null,
      priceMax: null,
      selections: { ...draft.selections, price: [] },
    });
  }

  function togglePrice(optionId) {
    setMinInput("");
    setMaxInput("");
    setMinTouched(false);
    setMaxTouched(false);
    const current = draft.selections.price ?? [];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    onChange({
      ...draft,
      priceMin: null,
      priceMax: null,
      selections: { ...draft.selections, price: next },
    });
  }

  function applySheet() {
    if (!price.valid) {
      setMinTouched(true);
      setMaxTouched(true);
      setExpanded("price");
      return;
    }
    const hasCustom = price.priceMin != null || price.priceMax != null;
    const selections = { ...draft.selections };
    if (hasCustom) selections.price = [];
    onApply({
      ...draft,
      selections,
      priceMin: price.priceMin,
      priceMax: price.priceMax,
    });
  }

  function clearSheet() {
    setMinTouched(false);
    setMaxTouched(false);
    setMinInput("");
    setMaxInput("");
    onClear();
  }

  const ready =
    totalSelections(draft) > 0 || String(minInput).trim() !== "" || String(maxInput).trim() !== "";

  return (
    <>
      <button type="button" className="scrim" aria-label="Close filters" onClick={onClose} />
      <div
        className={SIZE_VARIANT === "mw" ? "sheet sheet-mw" : "sheet"}
        id="filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
      >
        <header className="sheet-header">
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
                    {facet.kind === "size" ? (
                      <SizeFilter
                        draft={draft}
                        search={search}
                        onChange={(ids) =>
                          onChange({
                            ...draft,
                            selections: { ...draft.selections, size: ids },
                          })
                        }
                      />
                    ) : facet.kind === "price" ? (
                      <PriceEditor
                        variant={variant}
                        draft={draft}
                        products={products}
                        search={search}
                        minInput={minInput}
                        maxInput={maxInput}
                        minError={showMinError}
                        maxError={showMaxError}
                        rangeError={showRangeError}
                        onMin={(value) => editPrice("min", value)}
                        onMax={(value) => editPrice("max", value)}
                        onMinBlur={() => setMinTouched(true)}
                        onMaxBlur={() => setMaxTouched(true)}
                        onToggle={togglePrice}
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
          <button
            type="button"
            className={ready ? "btn-clear is-ready" : "btn-clear"}
            data-testid="clear-filters"
            onClick={clearSheet}
          >
            {SIZE_VARIANT === "mw" && totalSelections(draft) > 0
              ? `Clear all (${totalSelections(draft)})`
              : "Clear all"}
          </button>
          <button
            type="button"
            className={ready && price.valid ? "btn-apply is-ready" : "btn-apply"}
            data-testid="apply-filters"
            disabled={!price.valid}
            onClick={applySheet}
          >
            {desktop ? "Apply" : `Show ${previewCount} ${previewCount === 1 ? "item" : "items"}`}
          </button>
        </footer>
      </div>
    </>
  );
}

function OptionList({ facet, draft, products, search, onToggle }) {
  const selected = draft.selections[facet.id] ?? [];
  const layout = facet.id === "color" ? "swatches" : "list";
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

function PriceFields({ minInput, maxInput, minError, maxError, rangeError, onMin, onMax, onMinBlur, onMaxBlur }) {
  return (
    <div className="price-fields">
      <div className="price-range">
        <div className="price-field">
          <label className={minError ? "money-field has-error" : "money-field"}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="$ Min"
              aria-label="Minimum price"
              data-testid="price-min"
              aria-invalid={minError ? "true" : "false"}
              value={minInput}
              onChange={(event) => onMin(event.target.value)}
              onBlur={onMinBlur}
            />
          </label>
          {minError && <p className="price-error">{minError}</p>}
        </div>
        <span className="price-to">to</span>
        <div className="price-field">
          <label className={maxError ? "money-field has-error" : "money-field"}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="$ Max"
              aria-label="Maximum price"
              data-testid="price-max"
              aria-invalid={maxError ? "true" : "false"}
              value={maxInput}
              onChange={(event) => onMax(event.target.value)}
              onBlur={onMaxBlur}
            />
          </label>
          {maxError && <p className="price-error">{maxError}</p>}
        </div>
      </div>
      {rangeError && <p className="price-error price-error-range">{rangeError}</p>}
    </div>
  );
}

function PriceEditor({
  variant,
  draft,
  products,
  search,
  minInput,
  maxInput,
  minError,
  maxError,
  rangeError,
  onMin,
  onMax,
  onMinBlur,
  onMaxBlur,
  onToggle,
}) {
  const selected = draft.selections.price ?? [];
  const fields = (
    <PriceFields
      minInput={minInput}
      maxInput={maxInput}
      minError={minError}
      maxError={maxError}
      rangeError={rangeError}
      onMin={onMin}
      onMax={onMax}
      onMinBlur={onMinBlur}
      onMaxBlur={onMaxBlur}
    />
  );

  if (variant === "minmax") return <div className="price-editor">{fields}</div>;

  return (
    <div className="price-editor">
      {fields}
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

function formatBound(value) {
  return value == null ? "" : String(value);
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
