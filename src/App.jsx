import { useCallback, useMemo, useState } from "react";
import { PRODUCTS, SORTS } from "./data/catalog.js";
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
import "./style.css";

export default function App() {
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
  }

  function clearApplied() {
    setApplied(emptyFilters());
    setSearch("");
  }

  const countLabel = `${visible.length} ${visible.length === 1 ? "item" : "items"}`;

  return (
    <div className="page">
      <SiteHeader search={search} onSearch={setSearch} />
      <main id="suits">
        <div className="listing-head">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>Home</li>
              <li className="crumb-dot" aria-hidden="true" />
              <li>Men&apos;s Clothing</li>
              <li className="crumb-dot" aria-hidden="true" />
              <li className="here">Men&apos;s Suits</li>
            </ol>
          </nav>
          <div className="title-row">
            <div>
              <h1>Men&apos;s Suits</h1>
              <p className="count" data-testid="result-count">
                {countLabel}
              </p>
            </div>
            <label className="sort">
              <span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort">
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <FilterBar
          applied={applied}
          sheetOpen={sheetOpen}
          openFacet={openFacet}
          onOpen={openSheet}
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
          onChange={setDraft}
          onApply={applySheet}
          onClear={clearDraft}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
