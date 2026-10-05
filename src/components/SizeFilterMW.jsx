import { useMemo, useState } from "react";
import { PRODUCTS } from "../data/catalog.js";
import { parseSizeId } from "../data/sizes.js";
import { matchingProducts } from "../filters.js";

const LENGTH_ORDER = ["Short", "Regular", "Long", "Extra Long"];

const GROUPS = [
  {
    id: "pants",
    label: "Pants & Shorts",
    kind: "pant",
    image: "https://image.menswearhouse.com/is/image/TMW/PANTS_SIZE?impolicy=search-thumb",
  },
  {
    id: "suits",
    label: "Suits & Jackets",
    kind: "jacket",
    image: "https://image.menswearhouse.com/is/image/TMW/SUITS_SIZE?impolicy=search-thumb",
  },
];

export default function SizeFilterMW({ draft, search, onChange }) {
  const selected = draft.selections.size ?? [];
  const [open, setOpen] = useState(() => new Set(openGroups(selected)));

  const sizesByKind = useMemo(() => inventory(PRODUCTS), []);

  const stocked = useMemo(() => {
    const others = { ...draft, selections: { ...draft.selections, size: [] } };
    const ids = new Set();
    for (const product of matchingProducts(PRODUCTS, others, search)) {
      for (const id of product.sizes) ids.add(id);
    }
    return ids;
  }, [draft, search]);

  function toggleGroup(id) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSize(id) {
    onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  }

  return (
    <div className="mw-size">
      {GROUPS.map((group) => {
        const sizes = sizesByKind[group.kind];
        if (sizes.length === 0) return null;
        const expanded = open.has(group.id);
        const panelId = `mw-size-${group.id}`;
        return (
          <section key={group.id} className={expanded ? "mw-size-group is-open" : "mw-size-group"}>
            <button
              type="button"
              className="mw-size-head"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => toggleGroup(group.id)}
            >
              <span className="mw-size-thumb">
                <img src={group.image} alt="" width="40" height="40" loading="lazy" />
              </span>
              <span className="mw-size-title">{group.label}</span>
              <span className="mw-size-icon" aria-hidden="true" />
            </button>
            {expanded && (
              <div className="mw-size-grid" id={panelId} role="group" aria-label={group.label}>
                {sizes.map((id) => {
                  const checked = selected.includes(id);
                  return (
                    <label
                      key={id}
                      className={[
                        "mw-size-tile",
                        checked ? "is-selected" : "",
                        !checked && !stocked.has(id) ? "is-empty" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!checked && !stocked.has(id)}
                        onChange={() => toggleSize(id)}
                      />
                      <span>{id}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function openGroups(selected) {
  const kinds = new Set(selected.map((id) => parseSizeId(id)?.kind));
  return GROUPS.filter((group) => kinds.has(group.kind)).map((group) => group.id);
}

function inventory(products) {
  const jacket = new Set();
  const pant = new Set();
  for (const product of products) {
    for (const id of product.sizes) {
      const parsed = parseSizeId(id);
      if (parsed?.kind === "jacket") jacket.add(id);
      else if (parsed?.kind === "pant") pant.add(id);
    }
  }
  return {
    jacket: [...jacket].sort(compareJacket),
    pant: [...pant].sort(comparePant),
  };
}

function compareJacket(a, b) {
  const x = parseSizeId(a);
  const y = parseSizeId(b);
  return (
    Number(x.chest) - Number(y.chest) ||
    LENGTH_ORDER.indexOf(x.length) - LENGTH_ORDER.indexOf(y.length)
  );
}

function comparePant(a, b) {
  const x = parseSizeId(a);
  const y = parseSizeId(b);
  return Number(x.waist) - Number(y.waist) || Number(x.inseam) - Number(y.inseam);
}
