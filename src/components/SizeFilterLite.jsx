import { useMemo } from "react";
import { PRODUCTS } from "../data/catalog.js";
import { MW_PANT_SIZES, MW_SUIT_SIZES } from "../data/mwSizes.js";
import { JACKET_LENGTHS, parseSizeId } from "../data/sizes.js";
import { matchingProducts } from "../filters.js";

export default function SizeFilterLite({ draft, search, onChange }) {
  const selected = draft.selections.size ?? [];

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

  const jacketGroups = JACKET_LENGTHS.map((length) => ({
    id: length.id,
    name: length.id,
    height: length.hint,
    sizes: MW_SUIT_SIZES.filter((id) => parseSizeId(id)?.length === length.id),
  })).filter((group) => group.sizes.length > 0);

  return (
    <div className="lite-size">
      <section className="lite-size-section">
        <h3>Jacket</h3>
        <p className="lite-size-lead">Pick the height first. The number is the chest size.</p>
        {jacketGroups.map((group) => (
          <div key={group.id} className="lite-size-group">
            <div className="lite-guide">
              <p className="lite-guide-height">{group.height}</p>
              <p className="lite-guide-name">{group.name}</p>
            </div>
            <div className="lite-size-grid" role="group" aria-label={`${group.name}, ${group.height}`}>
              {group.sizes.map((id) => (
                <SizeTile
                  key={id}
                  id={id}
                  label={id.split(" ")[0]}
                  selected={selected.includes(id)}
                  unavailable={!selected.includes(id) && !stocked.has(id)}
                  onToggle={toggleSize}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
      <section className="lite-size-section">
        <h3>Pants</h3>
        <div className="lite-guide">
          <p className="lite-guide-height">Waist × inseam</p>
          <p className="lite-guide-name">32W × 30L is a 32-inch waist and a 30-inch inseam.</p>
        </div>
        <div className="lite-size-grid" role="group" aria-label="Pants, waist and inseam">
          {MW_PANT_SIZES.map((id) => (
            <SizeTile
              key={id}
              id={id}
              label={id}
              selected={selected.includes(id)}
              unavailable={!selected.includes(id) && !stocked.has(id)}
              onToggle={toggleSize}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SizeTile({ id, label, selected, unavailable, onToggle }) {
  return (
    <label
      className={["lite-size-tile", selected ? "is-selected" : "", unavailable ? "is-empty" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <input type="checkbox" checked={selected} disabled={unavailable} onChange={() => onToggle(id)} />
      <span>{label}</span>
    </label>
  );
}
