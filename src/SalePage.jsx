import { useCallback, useMemo, useState } from "react";
import { PRODUCTS } from "./data/catalog.js";
import {
  cloneFilters,
  emptyFilters,
  matchingProducts,
  priceVariant,
  removeAppliedToken,
  sortProducts,
} from "./filters.js";
import FilterBar from "./components/FilterBar.jsx";
import FilterSheet from "./components/FilterSheet.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import { CompactCard, LargeHeroBanner } from "../suit-quiz/src/components/entries/SuitFinderEntries.jsx";
import useDesktop from "./hooks/useDesktop.js";

function money(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

function suitIn(color) {
  return PRODUCTS
    .filter((product) => product.colors?.includes(color))
    .sort((a, b) => a.price - b.price)[0];
}

export default function SalePage({
  view = "sale",
  onNavigate,
  onTakeQuiz,
  onBackToQuiz,
  initialFilters,
  quizMatchIds,
  title = "Men's Clothing Sale",
  crumb = "Sale",
}) {
  const desktop = useDesktop();
  const variant = priceVariant();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [applied, setApplied] = useState(initialFilters ?? emptyFilters);
  const [draft, setDraft] = useState(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openFacet, setOpenFacet] = useState(null);

  const visible = useMemo(() => {
    const matched = sortProducts(matchingProducts(PRODUCTS, applied, search), sort);
    if (!quizMatchIds?.length) return matched;
    const pinned = quizMatchIds
      .map((id) => PRODUCTS.find((product) => product.id === id))
      .filter(Boolean);
    const rest = matched.filter((product) => !quizMatchIds.includes(product.id));
    return [...pinned, ...rest];
  }, [applied, quizMatchIds, search, sort]);

  function openSheet(facetId) {
    setDraft(cloneFilters(applied));
    setOpenFacet(facetId);
    setSheetOpen(true);
  }

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  function applySheet(next) {
    setApplied(cloneFilters(next));
    setSheetOpen(false);
  }

  function clearDraft() {
    setDraft(emptyFilters());
    if (desktop) setApplied(emptyFilters());
  }

  function clearApplied() {
    setApplied(emptyFilters());
    setSearch("");
  }

  return (
    <div className="page">
      <SiteHeader
        search={search}
        onSearch={setSearch}
        onNavigate={onNavigate}
        current={view === "home" ? undefined : view === "look" ? "Rental" : crumb === "Sale" ? "Sale" : "Suits"}
      />
      {view === "home" ? (
        <HomeScreen onTakeQuiz={onTakeQuiz} onNavigate={onNavigate} />
      ) : view === "look" ? (
        <RentalShop onTakeQuiz={onTakeQuiz} />
      ) : (
      <main id="sale">
        <div className="listing-head">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>Home</li>
              <li>Men&apos;s Clothing</li>
              <li className="here">{crumb}</li>
            </ol>
          </nav>
          <h1>
            {title}
            <span className="count" data-testid="result-count">
              ({visible.length})
            </span>
          </h1>
        </div>
        {onBackToQuiz && (
          <div className="quiz-matches-bar">
            <p>Showing suits that match your quiz. Your matches are marked.</p>
            <button type="button" onClick={onBackToQuiz}>Back to your results</button>
          </div>
        )}
        <FilterBar
          applied={applied}
          sheetOpen={sheetOpen}
          openFacet={openFacet}
          onOpen={openSheet}
          onRemove={(token) => setApplied((current) => removeAppliedToken(current, token))}
          onClear={() => setApplied(emptyFilters())}
          sort={sort}
          onSort={setSort}
        />
        <ProductGrid
          products={visible}
          quizMatchIds={quizMatchIds}
          onClear={clearApplied}
          entry={crumb === "Suits" ? <CompactCard entrypoint="pgp-suits" /> : null}
        />
      </main>
      )}
      <SiteFooter />
      {sheetOpen && (
        <FilterSheet
          key={openFacet ?? "all"}
          initialFacet={openFacet}
          draft={draft}
          products={PRODUCTS}
          search={search}
          desktop={desktop}
          variant={variant}
          onChange={setDraft}
          onApply={applySheet}
          onClear={clearDraft}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}

function HomeScreen({ onTakeQuiz, onNavigate }) {
  const shop = () => onNavigate?.("sale");
  const featured = PRODUCTS.slice(0, 4);
  const looks = PRODUCTS.slice(4, 8);
  const categories = [
    { label: "Suits", product: suitIn("navy") },
    { label: "Sport Coats", product: suitIn("black"), focus: "top" },
    { label: "Pants", product: suitIn("gray"), focus: "bottom" },
    { label: "Outerwear", product: suitIn("brown") },
    { label: "Shoes", image: "/outfit/black-dress-shoes.jpg" },
  ];
  const promos = [
    { label: "30% off", detail: "Suits", product: suitIn("navy") },
    { label: "30% off", detail: "Sport coats", product: suitIn("gray") },
    { label: "Buy 1, get 1 50% off", detail: "Dress shirts", product: suitIn("blue") },
    { label: "30% off", detail: "Shoes", image: "/outfit/black-dress-shoes.jpg" },
  ];
  const deals = [
    ["Suits & tuxedos", "149.99"],
    ["Sport coats", "99.99"],
    ["Dress shirts", "19.99"],
    ["Shoes", "59.99"],
  ];

  return (
    <main id="home">
      <div className="sf-hero-slot">
        <LargeHeroBanner entrypoint="home-hero" priority />
      </div>
      <section className="cat-row" aria-label="Departments">
        {categories.map((category) => (
          <button key={category.label} className="cat-card" type="button" onClick={shop}>
            <img
              src={category.image || category.product?.imageUrl}
              alt=""
              className={category.focus ? `is-${category.focus}` : undefined}
            />
            <strong>{category.label}</strong>
          </button>
        ))}
      </section>

      <section className="sale-hero" aria-labelledby="sale-hero-title">
        <div className="sale-hero-copy">
          <p className="sale-kicker">Veterans Day sale</p>
          <h1 id="sale-hero-title">Up to 30% off</h1>
          <button className="sale-hero-button" type="button" onClick={shop}>Shop now</button>
        </div>
        <div className="sale-hero-photo">
          <img src={suitIn("tan")?.imageUrl || "/suits/suit-tan.jpg"} alt="" />
        </div>
      </section>

      <section className="promo-row" aria-label="Promotions">
        {promos.map((promo) => (
          <button key={promo.detail} className="promo-card" type="button" onClick={shop}>
            <img src={promo.image || promo.product?.imageUrl} alt="" />
            <span>
              <strong>{promo.label}</strong>
              {promo.detail}
            </span>
          </button>
        ))}
      </section>

      <QuizEntry onTakeQuiz={onTakeQuiz} />

      <section className="deal-bar" aria-label="Everyday deals">
        <div className="deal-bar-title">
          <h2>Everyday deals</h2>
          <p>Online only</p>
        </div>
        <div className="deal-bar-prices">
          {deals.map(([label, price]) => (
            <button key={label} type="button" onClick={shop}>
              <span>{label}</span>
              {money(price)}
            </button>
          ))}
        </div>
      </section>

      <section className="clearance-bar" aria-label="Clearance">
        <strong>Clearance up to 70% off</strong>
        <span>Original prices</span>
        <button type="button" onClick={shop}>Shop now</button>
      </section>

      <section className="home-rail" aria-labelledby="featured-title">
        <h2 id="featured-title">Suits</h2>
        <div className="home-rail-track">
          {featured.map((product) => (
            <button key={product.id} className="home-card" type="button" onClick={shop}>
              <img src={product.imageUrl} alt="" />
              <p className="home-card-brand">{product.brandName}</p>
              <p className="home-card-name">{product.name}</p>
              <p className="home-card-price">{money(product.price)}</p>
              <p className="home-card-meta">{product.rating} ({product.reviews})</p>
            </button>
          ))}
        </div>
      </section>

      <section className="split-promos" aria-label="More to shop">
        <button className="split-promo" type="button" onClick={shop}>
          <img src={suitIn("navy")?.imageUrl} alt="" />
          <span>Shop suits</span>
        </button>
        <button className="split-promo" type="button" onClick={shop}>
          <img src={suitIn("blue")?.imageUrl} alt="" />
          <span>Shop sport coats</span>
        </button>
      </section>

      <section className="rental-band" aria-labelledby="rental-title">
        <div className="rental-band-copy">
          <h2 id="rental-title">Aisle-ready looks</h2>
          <p>Reserve a look for the wedding, the prom, or the party.</p>
          <button type="button" onClick={() => onNavigate?.("look")}>Shop tuxedos</button>
        </div>
        <div className="rental-looks">
          {looks.map((product) => (
            <button key={product.id} type="button" aria-label={product.name} onClick={() => onNavigate?.("look")}>
              <img src={product.imageUrl} alt="" />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function QuizEntry({ onTakeQuiz }) {
  return (
    <section className="quiz-entry" aria-labelledby="quiz-entry-title">
      <img className="quiz-entry-art" src="/quiz/style-expert.svg" alt="" />
      <div className="quiz-entry-copy">
        <p className="quiz-entry-badge">
          <span className="quiz-entry-mark" aria-hidden="true">MW</span>
          AI Style Expert
        </p>
        <h2 id="quiz-entry-title">Meet your personal style expert</h2>
        <p><strong>In under a minute</strong> get suit options matched to your event and needs.</p>
      </div>
      <button className="quiz-entry-button" type="button" onClick={onTakeQuiz}>
        <SparkleIcon />
        Find the suit
      </button>
    </section>
  );
}

function RentalShop({ onTakeQuiz }) {
  const lineup = ["black", "navy", "gray", "blue"].map(suitIn).filter(Boolean);

  return (
    <main className="rental-shop" id="rental-shop">
      <section className="rental-hero" aria-labelledby="rental-hero-title">
        <div className="rental-hero-copy">
          <p className="sale-kicker">Suit &amp; tux rentals</p>
          <h1 id="rental-hero-title">RSVP? We heard VIP.</h1>
          <p>Whether it&apos;s a wedding, work, or black-tie event, our rentals put you center stage.</p>
        </div>
        <div className="rental-hero-photo">
          <img src={suitIn("black")?.imageUrl || "/suits/suit-black.jpg"} alt="" />
        </div>
      </section>

      <section className="rental-match" aria-labelledby="rental-match-title">
        <div className="rental-match-copy">
          <h2 id="rental-match-title">Your wedding, our rentals—it&apos;s a match.</h2>
          <p>Welcome to the easiest part of your wedding plan. We&apos;ll outfit the whole party.</p>
        </div>
        <img src={suitIn("navy")?.imageUrl || "/suits/suit-navy.jpg"} alt="" />
      </section>

      <QuizEntry onTakeQuiz={onTakeQuiz} />

      <section className="home-rail rental-lineup" aria-labelledby="rental-lineup-title">
        <h2 id="rental-lineup-title">Our most-loved lineup</h2>
        <p className="rental-lineup-lede">Unforgettable entrances start here.</p>
        <div className="home-rail-track">
          {lineup.map((product) => (
            <article key={product.id} className="home-card">
              <img src={product.imageUrl} alt="" />
              <p className="home-card-brand">{product.brandName}</p>
              <p className="home-card-name">{product.name}</p>
              <p className="home-card-price">{money(product.price)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5l1.4 6.1L19.5 10 13.4 11.4 12 17.5 10.6 11.4 4.5 10l6.1-1.4L12 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

