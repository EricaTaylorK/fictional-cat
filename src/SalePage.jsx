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
        onTakeQuiz={onTakeQuiz}
        current={view === "home" ? undefined : crumb === "Sale" ? "Sale" : "Suits"}
      />
      {view === "home" ? (
        <HomeScreen onTakeQuiz={onTakeQuiz} onNavigate={onNavigate} />
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
        {onTakeQuiz && <QuizBanner onTakeQuiz={onTakeQuiz} />}
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
        <ProductGrid products={visible} quizMatchIds={quizMatchIds} onClear={clearApplied} />
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
  const deals = [149.99, 299.99, 399.99, 499.99];

  return (
    <main id="home">
      <section className="sale-hero" aria-labelledby="sale-hero-title">
        <div className="sale-hero-copy">
          <p className="sale-kicker">Limited time only</p>
          <h1 id="sale-hero-title">Weekend sale up to 30% off</h1>
          <button className="sale-hero-button" type="button" onClick={shop}>Shop now</button>
        </div>
        <div className="sale-hero-photo">
          <img src={suitIn("tan")?.imageUrl || "/suits/suit-tan.jpg"} alt="" />
        </div>
      </section>

      <section className="cat-row" aria-label="Departments">
        {categories.map((category) => (
          <button key={category.label} className="cat-card" type="button" onClick={shop}>
            <img
              src={category.image || category.product?.imageUrl}
              alt=""
              className={category.focus ? `is-${category.focus}` : undefined}
            />
            <strong>{category.label}</strong>
            {category.product && <span>From {money(category.product.price)}</span>}
          </button>
        ))}
      </section>

      <section className="clearance-bar" aria-label="Clearance">
        <strong>Clearance</strong>
        <span>Extra 60% off</span>
        <span className="clearance-code">Use code: EXTRA60</span>
        <button type="button" onClick={shop}>Details</button>
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

      <section className="finder-hero" aria-labelledby="finder-title">
        <div className="finder-hero-photo">
          <img src="/quiz/suit-finder-hero.jpg" alt="" />
          <img className="finder-hero-inset" src="/quiz/suit-finder-inset.jpg" alt="" />
        </div>
        <div className="finder-hero-copy">
          <p className="finder-eyebrow">
            <span className="finder-mark" aria-hidden="true">MW</span>
            AI Style Expert
          </p>
          <h2 id="finder-title">What&apos;s the occasion? We&apos;ll find the suit.</h2>
          <p>Answer a few questions and get suit picks in under a minute.</p>
          <button className="finder-hero-button" type="button" onClick={onTakeQuiz}>
            <SparkleIcon />
            Take the suit quiz
          </button>
        </div>
      </section>

      <section className="deal-bar" aria-label="Everyday deals">
        <h2>Everyday deals</h2>
        <div>
          {deals.map((price) => (
            <button key={price} type="button" onClick={shop}>{money(price)}</button>
          ))}
        </div>
      </section>

      <section className="split-promos" aria-label="More to shop">
        <button className="split-promo" type="button" onClick={shop}>
          <img src={suitIn("navy")?.imageUrl} alt="" />
          <span>Shop suits</span>
        </button>
        <button className="split-promo" type="button" onClick={onTakeQuiz}>
          <img src={suitIn("blue")?.imageUrl} alt="" />
          <span>Find your suit</span>
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

function QuizBanner({ onTakeQuiz }) {
  return (
    <div className="quiz-banner">
      <div>
        <p className="quiz-banner-kicker">Suit Finder</p>
        <p className="quiz-banner-title">Not sure which suit? Answer a few questions and get 3 suit picks in under a minute.</p>
      </div>
      <button className="quiz-banner-button" type="button" onClick={onTakeQuiz}>
        Take the quiz
      </button>
    </div>
  );
}
