import { useCallback, useMemo, useState } from "react";
import { PRODUCTS } from "./data/catalog.js";
import {
  cloneFilters,
  emptyFilters,
  matchingProducts,
  sortProducts,
} from "./filters.js";
import FilterBar from "./components/FilterBar.jsx";
import FilterSheet from "./components/FilterSheet.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import useDesktop from "./hooks/useDesktop.js";
import "./style.css";

export default function App() {
  const desktop = useDesktop();
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

  function livePrice(nextDraft) {
    setDraft(nextDraft);
    setApplied((current) => ({
      ...current,
      selections: {
        ...current.selections,
        price: [...(nextDraft.selections.price ?? [])],
      },
      priceMin: nextDraft.priceMin,
      priceMax: nextDraft.priceMax,
    }));
  }

  return (
    <div className="page">
      <SiteHeader search={search} onSearch={setSearch} />
      <main id="suits">
        <div className="listing-head">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>Home</li>
              <li>Mens Clothing</li>
              <li className="here">Mens Suits</li>
            </ol>
          </nav>
          <h1>
            Men&apos;s Suits
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
          onChange={setDraft}
          onLivePrice={livePrice}
          onApply={applySheet}
          onClear={clearDraft}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
