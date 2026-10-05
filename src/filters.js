import { PRICE_RANGES } from "./data/catalog.js";

const FIELD = {
  promo: "promos",
  size: "sizes",
  color: "colors",
  fit: "fit",
  type: "type",
  brand: "brand",
  material: "material",
  pattern: "pattern",
  occasion: "occasions",
  jacket: "jacket",
  lining: "lining",
  lapel: "lapel",
};

export function emptyFilters() {
  return { selections: {}, priceMin: null, priceMax: null };
}

export function cloneFilters(filters) {
  return {
    selections: Object.fromEntries(
      Object.entries(filters.selections).map(([key, values]) => [key, [...values]])
    ),
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
  };
}

export function selectionCount(filters, facetId) {
  const selected = filters.selections[facetId]?.length ?? 0;
  if (facetId === "price" && (filters.priceMin != null || filters.priceMax != null)) {
    return selected + 1;
  }
  return selected;
}

export function totalSelections(filters) {
  const fromFacets = Object.values(filters.selections).reduce((sum, values) => sum + values.length, 0);
  const custom = filters.priceMin != null || filters.priceMax != null ? 1 : 0;
  return fromFacets + custom;
}

function hasValue(product, facetId, optionId) {
  const value = product[FIELD[facetId]];
  return Array.isArray(value) ? value.includes(optionId) : value === optionId;
}

function inBucket(price, rangeId) {
  const range = PRICE_RANGES.find((item) => item.id === rangeId);
  return price >= range.min && price <= range.max;
}

function matchesCustomRange(price, filters) {
  if (filters.priceMin == null && filters.priceMax == null) return true;
  if (filters.priceMin != null && price < filters.priceMin) return false;
  if (filters.priceMax != null && price > filters.priceMax) return false;
  return true;
}

function matchesPrice(price, filters) {
  const buckets = filters.selections.price ?? [];
  const hasBuckets = buckets.length > 0;
  const hasCustom = filters.priceMin != null || filters.priceMax != null;
  if (!hasBuckets && !hasCustom) return true;
  if (hasBuckets && buckets.some((id) => inBucket(price, id))) return true;
  if (hasCustom && matchesCustomRange(price, filters)) return true;
  return false;
}

function matchesSize(product, selected) {
  return selected.length === 0 || selected.some((id) => product.sizes.includes(id));
}

function matchesFacet(product, filters, facetId) {
  if (facetId === "price") return matchesPrice(product.price, filters);
  const selected = filters.selections[facetId] ?? [];
  if (selected.length === 0) return true;
  if (facetId === "size") return matchesSize(product, selected);
  return selected.some((optionId) => hasValue(product, facetId, optionId));
}

export function matchesSearch(product, search) {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return (
    product.name.toLowerCase().includes(query) ||
    product.brandName.toLowerCase().includes(query)
  );
}

function matchesFilters(product, filters, skipFacet) {
  const facetIds = Object.keys(FIELD).concat("price");
  return facetIds.every((facetId) => {
    if (facetId === skipFacet) return true;
    return matchesFacet(product, filters, facetId);
  });
}

export function matchingProducts(products, filters, search) {
  return products.filter(
    (product) => matchesSearch(product, search) && matchesFilters(product, filters)
  );
}

export function countOption(products, filters, search, facetId, optionId) {
  return products.filter((product) => {
    if (!matchesSearch(product, search)) return false;
    if (!matchesFilters(product, filters, facetId)) return false;
    if (facetId === "price") {
      return inBucket(product.price, optionId);
    }
    return hasValue(product, facetId, optionId);
  }).length;
}

export function sortProducts(products, sort) {
  const list = [...products];
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "newest") list.sort((a, b) => b.newest - a.newest);
  else if (sort === "rating") {
    list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  }
  return list;
}

export function parseBound(raw) {
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const value = Number(trimmed.replace(/[$,\s]/g, ""));
  if (!Number.isFinite(value) || value < 0) return undefined;
  return value;
}

export function commitPrice(filters, minInput, maxInput) {
  const priceMin = parseBound(minInput);
  const priceMax = parseBound(maxInput);
  if (priceMin === undefined || priceMax === undefined) {
    return { error: "Enter a valid price" };
  }
  if (priceMin != null && priceMax != null && priceMin > priceMax) {
    return { error: "Min must be less than or equal to max" };
  }
  return { filters: { ...filters, priceMin, priceMax } };
}

export function money(amount) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
