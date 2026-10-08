import { useMemo, useState } from "react";
import { PRODUCTS } from "../data/catalog.js";
import { MW_PANT_SIZES, MW_SUIT_SIZES } from "../data/mwSizes.js";
import { parseSizeId } from "../data/sizes.js";
import { matchingProducts } from "../filters.js";

const GROUPS = [
  {
    id: "suits",
    label: "Jacket Size",
    kind: "jacket",
  },
  {
    id: "pants",
    label: "Pants Size",
    kind: "pant",
  },
];

export default function SizeFilterMW({ draft, search, onChange }) {
  const selected = draft.selections.size ?? [];
  const [sizeQuery, setSizeQuery] = useState("");

  const sizesByKind = useMemo(() => inventory(PRODUCTS), []);

  const stocked = useMemo(() => {
    const others = { ...draft, selections: { ...draft.selections, size: [] } };
    const ids = new Set();
    for (const product of matchingProducts(PRODUCTS, others, search)) {
      for (const id of product.sizes) ids.add(id);
    }
    return ids;
  }, [draft, search]);

  function toggleSize(id) {
    onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  }

  const query = sizeQuery.trim();
  const groups = GROUPS.map((group) => {
    const sizes = sizesByKind[group.kind];
    const matches = query ? sizes.filter((id) => matchesSizeQuery(id, query)) : sizes;
    const visible = sizes.filter((id) => matches.includes(id) || selected.includes(id));
    return { ...group, matches, visible };
  });
  const hasMatches = !query || groups.some((group) => group.matches.length > 0);

  return (
    <div className="mw-size">
      <label className="mw-size-search">
        <SearchIcon />
        <span className="mw-size-search-field">
          <input
            type="text"
            value={sizeQuery}
            placeholder="Search sizes"
            aria-label="Search sizes"
            autoComplete="off"
            onChange={(event) => setSizeQuery(event.target.value)}
          />
          <span className="mw-size-search-label" aria-hidden="true">
            Search sizes
          </span>
        </span>
      </label>

      {!hasMatches && (
        <p className="mw-size-empty" role="status">
          No matching sizes.
        </p>
      )}

      {groups.map((group) => {
        if (group.visible.length === 0) return null;
        return (
          <section key={group.id} className="mw-size-group">
            <h3 className="mw-size-title">{group.label}</h3>
            <div className="mw-size-grid" role="group" aria-label={group.label}>
              {group.visible.map((id) => {
                const checked = selected.includes(id);
                const unavailable = !checked && !stocked.has(id);
                return (
                  <label
                    key={id}
                    className={[
                      "mw-size-tile",
                      checked ? "is-selected" : "",
                      unavailable ? "is-empty" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={unavailable}
                      aria-label={`${checked ? "Deselect" : "Select"} ${id}`}
                      onChange={() => toggleSize(id)}
                    />
                    <span>{id}</span>
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="mw-size-search-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M13.563 6.472a4.98 4.98 0 0 0-3.546-1.47 4.978 4.978 0 0 0-3.545 1.47 4.98 4.98 0 0 0-1.47 3.545c0 1.34.522 2.599 1.47 3.546a4.98 4.98 0 0 0 3.545 1.469c1.34 0 2.599-.522 3.546-1.469a4.98 4.98 0 0 0 1.469-3.546 4.981 4.981 0 0 0-1.469-3.545ZM4 10.017a6.017 6.017 0 1 1 10.612 3.886L20 19.291l-.71.709-5.387-5.388A6.017 6.017 0 0 1 4 10.017Z"
      />
    </svg>
  );
}

function matchesSizeQuery(id, rawQuery) {
  const queries = [normalizeText(rawQuery), normalizeDimension(rawQuery)].filter(Boolean);
  const terms = searchableTerms(id);
  return queries.some((query) => terms.some((term) => term.includes(query)));
}

function searchableTerms(id) {
  const parsed = parseSizeId(id);
  const terms = [normalizeText(id)];
  const dimension = normalizeDimension(id);
  if (dimension) terms.push(dimension);

  if (parsed?.kind === "jacket") {
    const length = parsed.length.toLowerCase();
    const abbreviation = length === "extra long" ? "xl" : length[0];
    terms.push(
      normalizeText(`${parsed.chest}${abbreviation}`),
      normalizeText(`${parsed.chest} ${abbreviation}`),
      normalizeText(length),
      normalizeText(abbreviation)
    );
  }

  return [...new Set(terms)];
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/(\d+)\s+1\/2/g, "$1.5")
    .replace(/\s+/g, " ");
}

function normalizeDimension(value) {
  const normalized = normalizeText(value);
  const match = normalized.match(
    /(\d+(?:\.\d+)?)\s*w?\s*(?:x|\/|\s)\s*(\d+(?:\.\d+)?)\s*l?/
  );
  return match ? `${match[1]}x${match[2]}` : "";
}

function inventory(products) {
  const carried = new Set();
  for (const product of products) {
    for (const id of product.sizes) carried.add(id);
  }
  return {
    jacket: MW_SUIT_SIZES.filter((id) => carried.has(id)),
    pant: MW_PANT_SIZES.filter((id) => carried.has(id)),
  };
}
