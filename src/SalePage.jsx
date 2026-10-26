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

export default function SalePage({
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
