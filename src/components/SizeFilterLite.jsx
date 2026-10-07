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

  function carried(id) {
    return stocked.has(id) || selected.includes(id);
  }

  const jacketGroups = JACKET_LENGTHS.map((length) => ({
    id: length.id,
    name: length.label,
    height: length.hint,
    sizes: new Set(
      MW_SUIT_SIZES.filter((id) => parseSizeId(id)?.length === length.id && carried(id))
    ),
  })).filter((group) => group.sizes.size > 0);

  const chests = [
    ...new Set(
      jacketGroups.flatMap((group) => [...group.sizes].map((id) => parseSizeId(id).chest))
    ),
  ].sort((a, b) => Number(a) - Number(b));

  const pantSizes = MW_PANT_SIZES.filter(carried);

  return (
    <div className="lite-size">
      <section className="lite-size-section">
        <h3>Jacket</h3>
        <div className="lite-matrix" role="grid" aria-label="Jacket size by height">
          {jacketGroups.map((group) => (
            <div key={group.id} className="lite-matrix-head" role="columnheader">
              <span className="lite-matrix-name">{group.name}</span>
              <span className="lite-matrix-height">{group.height}</span>
            </div>
          ))}
          {chests.map((chest) =>
            jacketGroups.map((group) => {
              const id = `${chest} ${group.id}`;
              if (!group.sizes.has(id)) {
                return <span key={id} className="lite-matrix-gap" />;
              }
              return (
                <SizeTile
                  key={id}
                  id={id}
                  label={chest}
                  selected={selected.includes(id)}
                  onToggle={toggleSize}
                />
              );
            })
          )}
        </div>
      </section>
      <section className="lite-size-section">
        <h3>Pants</h3>
        <p className="lite-matrix-height lite-pant-note">Waist × inseam</p>
        <div className="lite-size-grid" role="group" aria-label="Pants, waist and inseam">
          {pantSizes.map((id) => (
            <SizeTile
              key={id}
              id={id}
              label={id}
              selected={selected.includes(id)}
              onToggle={toggleSize}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SizeTile({ id, label, selected, onToggle }) {
  return (
    <label className={selected ? "lite-size-tile is-selected" : "lite-size-tile"}>
      <input type="checkbox" checked={selected} onChange={() => onToggle(id)} />
      <span>{label}</span>
    </label>
  );
}
