import { useEffect, useMemo, useState } from "react";
import { COLORS, FACETS, PRICE_RANGES } from "../data/catalog.js";
import {
  commitPrice,
  countOption,
  matchingProducts,
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
  onChange,
  onLivePrice,
  onApply,
  onClear,
  onClose,
}) {
  // The clicked facet is expanded in this first render, not after the sheet opens.
  const [expanded, setExpanded] = useState(initialFacet ?? (SIZE_VARIANT === "mw" ? "size" : null));
  const [minInput, setMinInput] = useState(formatBound(draft.priceMin));
  const [maxInput, setMaxInput] = useState(formatBound(draft.priceMax));
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    setMinInput(formatBound(draft.priceMin));
    setMaxInput(formatBound(draft.priceMax));
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

  const preview = useMemo(() => {
    const result = commitPrice(draft, minInput, maxInput);
    return result.filters ?? draft;
  }, [draft, minInput, maxInput]);

  const previewCount = useMemo(
    () => matchingProducts(products, preview, search).length,
    [products, preview, search]
  );

  function toggleFacet(facetId) {
    setExpanded((current) => (current === facetId ? null : facetId));
  }

  function pushDraft(next) {
    if (desktop) onLivePrice(next);
    else onChange(next);
  }

  function toggleOption(facetId, optionId) {
    const current = draft.selections[facetId] ?? [];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    const nextDraft = {
      ...draft,
      selections: { ...draft.selections, [facetId]: next },
    };
    if (desktop && facetId === "price") pushDraft(nextDraft);
    else onChange(nextDraft);
  }

  function commitCustomPrice() {
    const result = commitPrice(draft, minInput, maxInput);
    if (result.error) {
      setPriceError(result.error);
      return false;
    }
    setPriceError("");
    setMinInput(formatBound(result.filters.priceMin));
    setMaxInput(formatBound(result.filters.priceMax));
    if (desktop) onLivePrice(result.filters);
    else onChange(result.filters);
    return true;
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
                        draft={draft}
                        products={products}
                        search={search}
                        minInput={minInput}
                        maxInput={maxInput}
                        error={priceError}
                        onMin={(value) => {
                          setPriceError("");
                          setMinInput(value);
                        }}
                        onMax={(value) => {
                          setPriceError("");
                          setMaxInput(value);
                        }}
                        onCommitRange={commitCustomPrice}
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
            className={ready ? "btn-apply is-ready" : "btn-apply"}
            data-testid="apply-filters"
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

function PriceEditor({
  draft,
  products,
  search,
  minInput,
  maxInput,
  error,
  onMin,
  onMax,
  onCommitRange,
  onToggle,
}) {
  const selected = draft.selections.price ?? [];

  function onKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      onCommitRange();
    }
  }

  function onRangeFocusOut(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    onCommitRange();
  }

  return (
    <div className="price-editor">
      <div className="price-range" onBlur={onRangeFocusOut}>
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
