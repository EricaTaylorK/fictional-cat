import "../add-on-items.css";

function money(value) {
  const amount = Math.round(value * 100) / 100;
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

export function ItemGroup({ label, entries, onToggle }) {
  if (!entries.length) return null;
  return (
    <div className="item-group">
      <p className="section-label">{label}</p>
      <ul className="item-grid">
        {entries.map(({ item, mode }) => (
          <li key={`${mode}-${item.id}`}>
            <ItemCard item={item} mode={mode} onToggle={onToggle ? () => onToggle(item.id) : undefined} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ItemCard({ item, mode, art, onToggle }) {
  const pricedAsAddOn = mode === "addon" || mode === "added";
  const price = pricedAsAddOn ? `+${money(item.price)}` : money(item.price);
  const content = (
    <>
      <span className="item-visual">
        <ItemArt id={art ?? item.id} />
        {mode === "addon" && <PlusIcon />}
      </span>
      <span className="item-meta">
        <span className="item-name">{item.name}</span>
        <span className="item-price">{price}</span>
      </span>
    </>
  );

  if (mode === "included") {
    return <div className="item-card">{content}</div>;
  }

  return (
    <button
      type="button"
      className={mode === "added" ? "item-card is-added" : "item-card is-addon"}
      aria-pressed={mode === "added"}
      onClick={onToggle}
    >
      {content}
    </button>
  );
}

export function ItemArt({ id }) {
  return (
    <svg className="item-art" viewBox="0 0 80 96" aria-hidden="true">
      {id === "jacket" && (
        <path
          fill="#232323"
          fillRule="evenodd"
          d="M14 36 26 16l14 12 14-12 12 20 10 8-12 6-4-8-2 50H24l-2-50-4 8-12-6 8-8Zm20-6 6 12 6-12-4-3-2 3-2-3-4 3Z"
        />
      )}
      {id === "pants" && <path fill="#232323" d="M22 10h36l4 78H46L40 46 34 88H18L22 10Z" />}
      {id === "shirt" && (
        <>
          <path fill="#f7f7f7" stroke="#232323" strokeWidth="2" d="M24 24 33 12h14l9 12 8 8-10 6v52H26V38l-10-6 8-8Z" />
          <path stroke="#232323" strokeWidth="1.6" d="M40 34v48" />
          <circle cx="40" cy="42" r="1.3" fill="#232323" />
          <circle cx="40" cy="52" r="1.3" fill="#232323" />
          <circle cx="40" cy="62" r="1.3" fill="#232323" />
        </>
      )}
      {id === "neckwear" && (
        <path fill="#232323" d="M40 46 16 30v28L40 50 64 58V30L40 46Zm-6-2h12v12H34V44Z" />
      )}
      {id === "shoes" && (
        <path
          fill="#232323"
          d="M10 58c8-10 16-10 22-4 2 8 6 10 10 10h22v8H14c-6 0-10-4-4-14Zm6 18h48v6H16v-6Z"
        />
      )}
      {id === "vest" && (
        <>
          <path fill="#232323" d="M22 18 40 30 58 18l8 10-6 58H20L14 28l8-10Z" />
          <path fill="#fff" d="M34 32 40 42 46 32v46H34V32Z" />
          <circle cx="40" cy="48" r="1.4" fill="#232323" />
          <circle cx="40" cy="58" r="1.4" fill="#232323" />
        </>
      )}
      {id === "cufflinks" && (
        <>
          <circle cx="28" cy="46" r="10" fill="none" stroke="#232323" strokeWidth="3" />
          <circle cx="52" cy="50" r="10" fill="none" stroke="#232323" strokeWidth="3" />
          <path stroke="#232323" strokeWidth="2" d="M36 48h8" />
        </>
      )}
      {id === "pocketsilk" && <path fill="#232323" d="M18 28h44l-8 10 14 30H22L36 38 18 28Z" />}
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg className="plus" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#fff" stroke="#232323" strokeWidth="1.4" />
      <path d="M12 8v8M8 12h8" fill="none" stroke="#232323" strokeWidth="1.4" />
    </svg>
  );
}
