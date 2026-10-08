import { useCallback, useEffect, useMemo, useState } from "react";
import RentalPdp from "./components/RentalPdp.jsx";
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
import "./style.css";

function readView() {
  return window.location.hash === "#look" ? "look" : "sale";
}

export default function App() {
  const [view, setView] = useState(readView);

  useEffect(() => {
    const sync = () => setView(readView());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function navigate(next) {
    const hash = next === "look" ? "#look" : "#sale";
    if (window.location.hash !== hash) window.location.hash = hash;
    else setView(next === "look" ? "look" : "sale");
  }

  if (view === "look") {
    return <RentalPdp onNavigate={navigate} />;
  }

  return <SalePage onNavigate={navigate} />;
}

function SalePage({ onNavigate }) {
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
              <li className="here">Sale</li>
            </ol>
          </nav>
          <h1>
            Men&apos;s Clothing Sale
            <span className="count" data-testid="result-count">
              ({visible.length})
            </span>
          </h1>
        </div>
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
