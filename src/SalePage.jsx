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

export default function SalePage({ onNavigate, onTakeQuiz, title = "Men's Clothing Sale", crumb = "Sale" }) {
  const desktop = useDesktop();
  const variant = priceVariant();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [applied, setApplied] = useState(emptyFilters);
  const [draft, setDraft] = useState(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openFacet, setOpenFacet] = useState(null);

  const visible = useMemo(
    () => sortProducts(matchingProducts(PRODUCTS, applied, search), sort),
    [applied, search, sort]
  );

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
      <SiteHeader search={search} onSearch={setSearch} onNavigate={onNavigate} />
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
        <ProductGrid products={visible} onClear={clearApplied} />
      </main>
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

function QuizBanner({ onTakeQuiz }) {
  const photos = PRODUCTS.slice(0, 3);

  return (
    <div className="quiz-banner">
      <div className="quiz-banner-photos" aria-hidden="true">
        {photos.map((product, index) => (
          <img
            key={product.id}
            src={product.imageUrl}
            alt=""
            className={index === 1 ? "is-selected" : undefined}
          />
        ))}
      </div>
      <div>
        <p className="quiz-banner-kicker">Want help choosing a suit?</p>
        <p className="quiz-banner-title">Get personalized recommendations in less than a minute.</p>
      </div>
      <button className="quiz-banner-button" type="button" onClick={onTakeQuiz}>
        Take the Quiz
      </button>
    </div>
  );
}
