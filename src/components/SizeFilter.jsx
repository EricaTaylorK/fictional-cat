import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS } from "../data/catalog.js";
import {
  CHEST_GROUPS,
  JACKET_LENGTHS,
  PANT_LENGTH_GROUPS,
  WAIST_GROUPS,
  jacketSizeId,
  pantSizeId,
  parseSizeId,
} from "../data/sizes.js";
import { matchingProducts } from "../filters.js";

export default function SizeFilter({ draft, search, onChange }) {
  const selected = draft.selections.size ?? [];
  const signature = [...selected].sort().join("|");
  const axes = useMemo(() => axesFromSelected(selected), [signature]);
  const [jacketLengths, setJacketLengths] = useState(axes.jacketLengths);
  const [jacketChests, setJacketChests] = useState(axes.jacketChests);
  const [waists, setWaists] = useState(axes.waists);
  const [inseams, setInseams] = useState(axes.inseams);
  const written = useRef(signature);

  useEffect(() => {
    if (signature === written.current) return;
    const next = axesFromSelected(selected);
    setJacketLengths(next.jacketLengths);
    setJacketChests(next.jacketChests);
    setWaists(next.waists);
    setInseams(next.inseams);
    written.current = signature;
  }, [signature, selected]);

  const stocked = useMemo(() => {
    const open = {
      ...draft,
      selections: { ...draft.selections, size: [] },
    };
    return matchingProducts(PRODUCTS, open, search);
  }, [draft, search]);

  const universe = useMemo(() => inventory(PRODUCTS), []);

  function commit(nextJacketLengths, nextJacketChests, nextWaists, nextInseams) {
    const jacket = [];
    for (const length of nextJacketLengths) {
      for (const chest of nextJacketChests) {
        const id = jacketSizeId(chest, length);
        if (universe.jacketIds.has(id)) jacket.push(id);
      }
    }
    const pants = [];
    for (const waist of nextWaists) {
      for (const inseam of nextInseams) {
        const id = pantSizeId(waist, inseam);
        if (universe.pantIds.has(id)) pants.push(id);
      }
    }
    const next = [...jacket, ...pants];
    written.current = [...next].sort().join("|");
    onChange(next);
  }

  function toggleJacketLength(id) {
    const next = toggleSet(jacketLengths, id);
    setJacketLengths(next);
    commit(next, jacketChests, waists, inseams);
  }

  function toggleChest(id) {
    const next = toggleSet(jacketChests, id);
    setJacketChests(next);
    commit(jacketLengths, next, waists, inseams);
  }

  function toggleWaist(id) {
    const next = toggleSet(waists, id);
    setWaists(next);
    commit(jacketLengths, jacketChests, next, inseams);
  }

  function toggleInseam(id) {
    const next = toggleSet(inseams, id);
    setInseams(next);
    commit(jacketLengths, jacketChests, waists, next);
  }

  const lengthColumnsJacket = JACKET_LENGTHS.filter((item) => universe.lengths.has(item.id)).map(
    (item) => ({
      ...item,
      values: [item.id],
    })
  );
  const chestColumns = groupNumbers(CHEST_GROUPS, universe.chests);
  const waistColumns = groupNumbers(WAIST_GROUPS, universe.waists);
  const lengthColumns = PANT_LENGTH_GROUPS.map((group) => ({
    ...group,
    values: group.inseams.filter((value) => universe.inseams.has(String(value))),
  })).filter((group) => group.values.length > 0);

  return (
    <div className="size-filter">
      {chestColumns.length > 0 && (
        <section className="size-block">
          <h3>Jacket</h3>
          <p className="size-axis">Jacket Length</p>
          <GuidedColumns
            columns={lengthColumnsJacket}
            selected={jacketLengths}
            isAvailable={(length) => lengthAvailable(length, jacketChests, stocked)}
            onToggle={toggleJacketLength}
            labelFor={(id) => JACKET_LENGTHS.find((item) => item.id === id)?.label ?? id}
          />
          <p className="size-axis">Chest Size</p>
          <GuidedColumns
            columns={chestColumns}
            selected={jacketChests}
            isAvailable={(chest) => chestAvailable(chest, jacketLengths, stocked)}
            onToggle={toggleChest}
          />
        </section>
      )}

      {waistColumns.length > 0 && (
        <section className="size-block">
          <h3>Pants</h3>
          <p className="size-axis">Waist Size</p>
          <GuidedColumns
            columns={waistColumns}
            selected={waists}
            isAvailable={(waist) => waistAvailable(waist, inseams, stocked)}
            onToggle={toggleWaist}
          />
          <p className="size-axis">Pant Length</p>
          <GuidedColumns
            columns={lengthColumns}
            selected={inseams}
            isAvailable={(inseam) => inseamAvailable(inseam, waists, stocked)}
            onToggle={toggleInseam}
          />
        </section>
      )}
    </div>
  );
}

function GuidedColumns({ columns, selected, isAvailable, onToggle, labelFor = (id) => id }) {
  const rows = Math.max(0, ...columns.map((column) => column.values.length));
  return (
    <div
      className="size-guided"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
    >
      {columns.map((column) => (
        <div key={column.id} className="size-guided-head">
          <span className="size-guide-line">{column.hint}</span>
        </div>
      ))}
      {Array.from({ length: rows }, (_, row) =>
        columns.map((column) => {
          const value = column.values[row];
          if (value == null) return <div key={`${column.id}-${row}`} className="size-spacer" />;
          const id = String(value);
          const label = labelFor(id);
          const ariaLabel = `${column.hint}, ${label}`;
          return (
            <SizeTile
              key={`${column.id}-${id}`}
              selected={selected.has(id)}
              disabled={!isAvailable(id) && !selected.has(id)}
              label={label}
              ariaLabel={ariaLabel}
              onToggle={() => onToggle(id)}
            />
          );
        })
      )}
    </div>
  );
}

function SizeTile({ label, ariaLabel, selected, disabled, onToggle }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={ariaLabel}
      disabled={disabled}
      className={["size-tile", selected ? "is-selected" : ""].filter(Boolean).join(" ")}
      onClick={onToggle}
    >
      <span>{label}</span>
    </button>
  );
}

function groupNumbers(groups, values) {
  return groups
    .map((group) => ({
      ...group,
      values: [...values]
        .filter((value) => Number(value) >= group.min && Number(value) <= group.max)
        .sort((a, b) => Number(a) - Number(b)),
    }))
    .filter((group) => group.values.length > 0);
}

function lengthAvailable(length, chests, products) {
  const chestList = chests.size ? [...chests] : null;
  return products.some((product) =>
    product.sizes.some((id) => {
      const parsed = parseSizeId(id);
      return (
        parsed?.kind === "jacket" &&
        parsed.length === length &&
        (chestList == null || chestList.includes(parsed.chest))
      );
    })
  );
}

function chestAvailable(chest, lengths, products) {
  const lengthList = lengths.size ? [...lengths] : null;
  return products.some((product) =>
    product.sizes.some((id) => {
      const parsed = parseSizeId(id);
      return (
        parsed?.kind === "jacket" &&
        parsed.chest === chest &&
        (lengthList == null || lengthList.includes(parsed.length))
      );
    })
  );
}

function waistAvailable(waist, inseams, products) {
  const inseamList = inseams.size ? [...inseams] : null;
  return products.some((product) =>
    product.sizes.some((id) => {
      const parsed = parseSizeId(id);
      return (
        parsed?.kind === "pant" &&
        parsed.waist === waist &&
        (inseamList == null || inseamList.includes(parsed.inseam))
      );
    })
  );
}

function inseamAvailable(inseam, waists, products) {
  const waistList = waists.size ? [...waists] : null;
  return products.some((product) =>
    product.sizes.some((id) => {
      const parsed = parseSizeId(id);
      return (
        parsed?.kind === "pant" &&
        parsed.inseam === inseam &&
        (waistList == null || waistList.includes(parsed.waist))
      );
    })
  );
}

function inventory(products) {
  const lengths = new Set();
  const chests = new Set();
  const waists = new Set();
  const inseams = new Set();
  const jacketIds = new Set();
  const pantIds = new Set();
  for (const product of products) {
    for (const id of product.sizes) {
      const parsed = parseSizeId(id);
      if (!parsed) continue;
      if (parsed.kind === "jacket") {
        lengths.add(parsed.length);
        chests.add(parsed.chest);
        jacketIds.add(id);
      } else if (parsed.kind === "pant") {
        waists.add(parsed.waist);
        inseams.add(parsed.inseam);
        pantIds.add(id);
      }
    }
  }
  return { lengths, chests, waists, inseams, jacketIds, pantIds };
}

function axesFromSelected(ids) {
  const jacketLengths = new Set();
  const jacketChests = new Set();
  const waists = new Set();
  const inseams = new Set();
  for (const id of ids) {
    const parsed = parseSizeId(id);
    if (!parsed) continue;
    if (parsed.kind === "jacket") {
      jacketLengths.add(parsed.length);
      jacketChests.add(parsed.chest);
    } else if (parsed.kind === "pant") {
      waists.add(parsed.waist);
      inseams.add(parsed.inseam);
    }
  }
  return { jacketLengths, jacketChests, waists, inseams };
}

function toggleSet(current, id) {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
