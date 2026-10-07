import { useEffect, useMemo, useState } from "react";
import SiteFooter from "./SiteFooter.jsx";
import "../rental.css";

const ITEMS = [
  { id: "jacket", name: "Jacket", price: 159.99, group: "core" },
  { id: "pants", name: "Pants", price: 10, group: "core" },
  { id: "shirt", name: "Shirt", price: 20, group: "core" },
  { id: "neckwear", name: "Neckwear", price: 10, group: "core" },
  { id: "shoes", name: "Shoes", price: 30, group: "core" },
  { id: "vest", name: "Vest", price: 30, group: "accessory" },
  { id: "cufflinks", name: "Cufflinks", price: 8, group: "accessory" },
  { id: "pocketsilk", name: "Pocketsilk", price: 10, group: "accessory" },
];

const ITEM_MAP = Object.fromEntries(ITEMS.map((item) => [item.id, item]));

const PACKAGES = [
  {
    id: "full",
    name: "Full Look",
    price: 181.99,
    compareAt: 199.99,
    save: 18,
    bestFor: "Best for a head-to-toe look, with nothing to bring from home.",
    included: ["jacket", "pants", "shirt", "neckwear", "shoes", "vest", "cufflinks", "pocketsilk"],
  },
  {
    id: "essentials",
    name: "Essentials",
    price: 151.99,
    compareAt: 211.99,
    save: 60,
    bestFor: "Best for most weddings — dressed from jacket to shoes.",
    included: ["jacket", "pants", "shirt", "neckwear", "shoes"],
  },
  {
    id: "base",
    name: "Base",
    price: 129,
    from: true,
    compareAt: null,
    save: 0,
    bestFor: "Best if you already own a shirt, shoes, and neckwear.",
    included: ["jacket", "pants"],
  },
];

const NAV = [
  "Suits",
  "Sport Coats & Blazers",
  "Dress Shirts",
  "Pants",
  "Shoes",
  "Outerwear",
  "Accessories",
  "Casual",
  "Brands",
  "Wedding",
  "Featured",
  "Rental",
];

function money(value) {
  const amount = Math.round(value * 100) / 100;
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

function extrasTotal(ids) {
  return ids.reduce((sum, id) => sum + ITEM_MAP[id].price, 0);
}

function betterOffer(pkg, extraIds) {
  const have = new Set([...pkg.included, ...extraIds]);
  const currentTotal = pkg.price + extrasTotal(extraIds);
  let match = null;

  for (const other of PACKAGES) {
    if (other.id === pkg.id) continue;
    const covers = [...have].every((id) => other.included.includes(id));
    if (!covers) continue;
    const delta = Math.round((currentTotal - other.price) * 100) / 100;
    const extraPieces = other.included.filter((id) => !have.has(id)).length;
    if (delta < -0.009) continue;
    if (delta <= 0.009 && extraPieces === 0) continue;
    const candidate = { pkg: other, total: other.price, delta, extraPieces };
    if (
      !match ||
      other.price < match.total - 0.009 ||
      (Math.abs(other.price - match.total) < 0.02 && extraPieces > match.extraPieces)
    ) {
      match = candidate;
    }
  }

  return match;
}

function offerCopy(offer) {
  if (offer.delta > 0.009) {
    return `${offer.pkg.name} includes this for ${money(offer.total)} — ${money(offer.delta)} less.`;
  }
  const pieces = offer.extraPieces === 1 ? "1 more piece" : `${offer.extraPieces} more pieces`;
  return `${offer.pkg.name} adds ${pieces} at the same price.`;
}

export default function RentalPdp({ onNavigate }) {
  const [packageId, setPackageId] = useState("essentials");
  const [extras, setExtras] = useState({ full: [], essentials: [], base: [] });
  const [rented, setRented] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [partyStarted, setPartyStarted] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = "Black Notch Lapel Tux | Rental";
    return () => {
      document.title = previous;
    };
  }, []);

  const pkg = PACKAGES.find((item) => item.id === packageId);
  const extraIds = extras[packageId];
  const addOnSum = extrasTotal(extraIds);
  const total = pkg.price + addOnSum;
  const pieceCount = pkg.included.length + extraIds.length;
  const offer = useMemo(() => betterOffer(pkg, extraIds), [pkg, extraIds]);

  function selectPackage(id) {
    setPackageId(id);
    setRented(false);
  }

  function toggleExtra(ownerId, itemId) {
    setPackageId(ownerId);
    setRented(false);
    setExtras((current) => {
      const list = current[ownerId];
      const next = list.includes(itemId) ? list.filter((id) => id !== itemId) : [...list, itemId];
      return { ...current, [ownerId]: next };
    });
  }

  function takeOffer(id) {
    setPackageId(id);
    setExtras((current) => ({ ...current, [id]: [] }));
    setRented(false);
  }

  const chosenItems = [...pkg.included, ...extraIds].map((id) => ITEM_MAP[id]);

  return (
    <div className="page page-pdp">
      <PdpHeader onNavigate={onNavigate} />
      <main>
        <nav className="pdp-crumbs" aria-label="Breadcrumb">
          <button type="button" onClick={() => onNavigate("suits")}>
            Home
          </button>
          <span className="crumb-dot" aria-hidden="true" />
          <span>Rental</span>
          <span className="crumb-dot" aria-hidden="true" />
          <span>Tuxedos</span>
          <span className="crumb-dot" aria-hidden="true" />
          <span className="crumb-here">Black Notch Lapel Tux</span>
        </nav>

        <div className="pdp-content">
          <Gallery />
          <div className="product-id">
            <div className="brand-row">
              <button type="button" className="brand">
                Vera Wang
              </button>
              <span className="rent-badge">Rent</span>
            </div>
            <h1>Black Notch Lapel Tux</h1>
            <p className="rating">
              <Stars />
              <span>(4.6)</span>
            </p>
          </div>

          <section className="buy" aria-label="Outfit packages">

            <div className="outfit">
              <div className="packages" role="radiogroup" aria-label="Rental packages">
                {PACKAGES.map((item) => (
                  <PackageColumn
                    key={item.id}
                    pkg={item}
                    selected={item.id === packageId}
                    extraIds={extras[item.id]}
                    onSelect={() => selectPackage(item.id)}
                    onToggle={(itemId) => toggleExtra(item.id, itemId)}
                  />
                ))}
              </div>

              <p className="reassure">
                <span>Not sure?</span>{" "}
                <button type="button" className="text-link">
                  Book an In-Store Appointment
                </button>{" "}
                <span>with a stylist.</span>
              </p>
              <p className="legal">*$12 D&amp;H fee applied at checkout. Discounts require Perfect Fit member signup.</p>
            </div>

            <aside className="party">
              <PeopleIcon />
              <div>
                <h2>Planning Looks for a Wedding Party?</h2>
                <p>
                  Create a group to keep everyone&apos;s look coordinated and get $250 off with 6 paid rentals in your
                  party! See Terms
                </p>
                <button type="button" onClick={() => setPartyStarted(true)}>
                  {partyStarted ? "Group started" : "Get Started →"}
                </button>
              </div>
            </aside>

            <div className="details">
              <button
                type="button"
                className={detailsOpen ? "acc-head is-open" : "acc-head"}
                aria-expanded={detailsOpen}
                onClick={() => setDetailsOpen((open) => !open)}
              >
                Product Details &amp; Care
                <Chevron />
              </button>
              {detailsOpen && (
                <div className="acc-body">
                  <p>Black notch-lapel tuxedo. The package price is what you pay. Piece prices are separate rental values.</p>
                  <ul>
                    <li>Wool blend</li>
                    <li>Notch satin lapel</li>
                    <li>Flat-front pant</li>
                    <li>Professional cleaning included</li>
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
      <SummaryBar
        pkg={pkg}
        chosenItems={chosenItems}
        total={total}
        addOnSum={addOnSum}
        pieceCount={pieceCount}
        rented={rented}
        offer={offer}
        onOffer={() => takeOffer(offer.pkg.id)}
        onRent={() => setRented(true)}
      />
    </div>
  );
}

function PackageColumn({ pkg, selected, extraIds, onSelect, onToggle }) {
  const included = pkg.included.map((id) => ITEM_MAP[id]);
  const remaining = ITEMS.filter((item) => !pkg.included.includes(item.id) && !extraIds.includes(item.id));
  const added = extraIds.map((id) => ITEM_MAP[id]);
  const count = pkg.included.length + extraIds.length;
  const columnTotal = pkg.price + extrasTotal(extraIds);

  const coreIncluded = included.filter((item) => item.group === "core");
  const accessoryIncluded = included.filter((item) => item.group === "accessory");
  const coreAdded = added.filter((item) => item.group === "core");
  const accessoryAdded = added.filter((item) => item.group === "accessory");
  const coreAddons = remaining.filter((item) => item.group === "core");
  const accessoryAddons = remaining.filter((item) => item.group === "accessory");
  const hasAddons = coreAddons.length + accessoryAddons.length > 0;

  return (
    <article className={selected ? "package is-selected" : "package"} data-testid={`package-${pkg.id}`}>
      <label className="package-head">
        <input type="radio" name="rental-package" value={pkg.id} checked={selected} onChange={onSelect} />
        <span className="radio" aria-hidden="true" />
        <span className="package-copy">
          <span className="package-name">
            {pkg.name}
            <span className="package-pieces">
              {count} {count === 1 ? "piece" : "pieces"}
            </span>
          </span>
          <span className="best-for">{pkg.bestFor}</span>
        </span>
        <span className="package-offer">
          <span className="package-price">
            {pkg.from && extraIds.length === 0 ? `from ${money(pkg.price)}` : money(selected ? columnTotal : pkg.price)}
          </span>
          {pkg.save > 0 && <span className="save">Save ${pkg.save}</span>}
        </span>
      </label>

      <div className="package-body">
        <ItemGroup
          label="Included"
          entries={[
            ...coreIncluded.map((item) => ({ item, mode: "included" })),
            ...accessoryIncluded.map((item) => ({ item, mode: "included" })),
            ...coreAdded.map((item) => ({ item, mode: "added" })),
            ...accessoryAdded.map((item) => ({ item, mode: "added" })),
          ]}
          onToggle={onToggle}
        />
        {hasAddons && (
          <ItemGroup
            label="Add-ons"
            entries={[
              ...coreAddons.map((item) => ({ item, mode: "addon" })),
              ...accessoryAddons.map((item) => ({ item, mode: "addon" })),
            ]}
            onToggle={onToggle}
          />
        )}
      </div>
    </article>
  );
}

function ItemGroup({ label, entries, onToggle }) {
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

function ItemCard({ item, mode, onToggle }) {
  const pricedAsAddOn = mode === "addon" || mode === "added";
  const price = pricedAsAddOn ? `+${money(item.price)}` : money(item.price);
  const content = (
    <>
      <span className="item-visual">
        <ItemArt id={item.id} />
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

function SummaryBar({ pkg, chosenItems, total, addOnSum, pieceCount, rented, offer, onOffer, onRent }) {
  return (
    <div className="summary-bar">
      <div className="summary-copy">
        <p className="summary-name">
          {pkg.name}
          <span>
            {pieceCount} {pieceCount === 1 ? "piece" : "pieces"}
          </span>
        </p>
        <ul className="summary-icons" aria-label="Pieces in this look">
          {chosenItems.map((item) => (
            <li key={item.id} title={item.name}>
              <ItemArt id={item.id} />
            </li>
          ))}
        </ul>
        {offer && (
          <button type="button" className="summary-offer" onClick={onOffer}>
            {offerCopy(offer)}
          </button>
        )}
      </div>
      <div className="summary-buy">
        <p className="summary-price" aria-live="polite">
          <span className="now">
            {pkg.from && addOnSum === 0 ? "from " : ""}
            {money(total)}*
          </span>
          {pkg.save > 0 && <span className="save">Save ${pkg.save}</span>}
          {addOnSum > 0 && <span className="summary-addons">includes {money(addOnSum)} in add-ons</span>}
        </p>
        <button type="button" className="rent-btn" onClick={onRent}>
          {rented ? "Added to bag" : "Rent this look"}
        </button>
      </div>
    </div>
  );
}

function Gallery() {
  const shots = [
    { src: "/suits/suit-black.jpg", alt: "Front view of the black notch lapel tuxedo", position: "center 18%" },
    { src: "/suits/suit-black.jpg", alt: "Jacket and shirt detail", position: "center 42%" },
    { src: "/suits/suit-black.jpg", alt: "Side view of the tuxedo", position: "30% 70%" },
    { src: "/suits/suit-black.jpg", alt: "Lower half of the tuxedo", position: "70% 80%" },
  ];

  return (
    <div className="gallery" aria-label="Product photos">
      {shots.map((shot) => (
        <div key={shot.alt} className="shot">
          <img src={shot.src} alt={shot.alt} style={{ objectPosition: shot.position }} />
        </div>
      ))}
    </div>
  );
}

function PdpHeader({ onNavigate }) {
  return (
    <header className="pdp-header">
      <div className="pdp-promo">
        <p>
          Clearance up to 70% Off Original Prices |{" "}
          <button type="button" onClick={() => onNavigate("suits")}>
            Shop Now &gt;
          </button>
        </p>
      </div>
      <div className="pdp-utility">
        <button type="button" className="pdp-logo" onClick={() => onNavigate("suits")} aria-label="Men's Wearhouse">
          <img src="/mw-logo.svg" alt="" />
        </button>
        <form className="pdp-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <input type="search" placeholder="What are you looking for?" aria-label="Search" />
          <button type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>
        <div className="pdp-tools">
          <button type="button" className="tool">
            <PinIcon /> Find a Store
          </button>
          <button type="button" className="sign-in">
            <ProfileIcon /> Sign In <Chevron />
          </button>
          <button type="button" className="bag" aria-label="Bag">
            <BagIcon />
          </button>
        </div>
      </div>
      <nav className="pdp-nav" aria-label="Primary">
        {NAV.map((item) => (
          <button
            key={item}
            type="button"
            className={item === "Sale" ? "is-sale" : undefined}
            onClick={() => {
              if (item === "Suits") onNavigate("suits");
            }}
          >
            {item === "Sale" && <TagIcon />}
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}

function ItemArt({ id }) {
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

function Stars() {
  return (
    <span className="stars" aria-label="4.6 out of 5 stars">
      <Star />
      <Star />
      <Star />
      <Star />
      <Star half />
    </span>
  );
}

function Star({ half = false }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      {half ? (
        <>
          <path fill="rgba(0,0,0,0.1)" d="M8 1.4 9.9 5.8l4.7.4-3.6 3.1 1.1 4.6L8 11.6 3.9 13.9l1.1-4.6L1.4 6.2l4.7-.4L8 1.4Z" />
          <path fill="#3A3A3A" d="M8 1.4 9.9 5.8 8 6.2V11.6L3.9 13.9l1.1-4.6L1.4 6.2l4.7-.4L8 1.4Z" />
        </>
      ) : (
        <path fill="#3A3A3A" d="M8 1.4 9.9 5.8l4.7.4-3.6 3.1 1.1 4.6L8 11.6 3.9 13.9l1.1-4.6L1.4 6.2l4.7-.4L8 1.4Z" />
      )}
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="plus" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#fff" stroke="#232323" strokeWidth="1.4" />
      <path d="M12 8v8M8 12h8" fill="none" stroke="#232323" strokeWidth="1.4" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9.5 12 15.5 18 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" fill="none" stroke="#fff" strokeWidth="1.8" />
      <path d="M15.5 15.5 19 19" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" fill="none" stroke="#3A3A3A" strokeWidth="1.5" />
      <circle cx="12" cy="11" r="2" fill="none" stroke="#3A3A3A" strokeWidth="1.5" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="3.2" fill="none" stroke="#3A3A3A" strokeWidth="1.5" />
      <path d="M6 19.2c1.2-2.4 3.2-3.6 6-3.6s4.8 1.2 6 3.6" fill="none" stroke="#3A3A3A" strokeWidth="1.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 8h10l-.8 11H7.8L7 8Z" fill="none" stroke="#3A3A3A" strokeWidth="1.5" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" fill="none" stroke="#3A3A3A" strokeWidth="1.5" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.5 5.5 19 8l-2.2 6.2-6.3 2.3L5 14l2.2-6.2 5.3-2.3Z" fill="none" stroke="#DA3535" strokeWidth="1.4" />
      <circle cx="9.2" cy="10.2" r="1" fill="#DA3535" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg className="people" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="8" r="2.2" fill="none" stroke="#000C2C" strokeWidth="1.5" />
      <circle cx="16" cy="9" r="2" fill="none" stroke="#000C2C" strokeWidth="1.5" />
      <path d="M3.8 18.5c.8-2.4 2.4-3.6 4.2-3.6s3.4 1.2 4.2 3.6" fill="none" stroke="#000C2C" strokeWidth="1.5" />
      <path d="M13 18.5c.6-1.8 1.8-2.8 3.2-2.8 1.5 0 2.7 1 3.4 2.8" fill="none" stroke="#000C2C" strokeWidth="1.5" />
    </svg>
  );
}
