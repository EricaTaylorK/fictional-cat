export const STORAGE_KEY = "pawledger.entries.v1";

export const CATEGORIES = ["capex", "opex"];

const HOUR_STEP = 0.25;
const MIN_HOURS = 0.25;
const MAX_HOURS = 24;

export function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function snapHours(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const snapped = Math.round(n / HOUR_STEP) * HOUR_STEP;
  if (snapped < MIN_HOURS || snapped > MAX_HOURS) return null;
  return Math.round(snapped * 100) / 100;
}

export function formatHours(hours) {
  const n = Number(hours);
  if (!Number.isFinite(n)) return "0";
  return Number.isInteger(n) ? String(n) : String(n);
}

function isValidEntry(row) {
  if (!row || typeof row !== "object") return false;
  if (typeof row.id !== "string" || !row.id) return false;
  if (typeof row.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) return false;
  if (snapHours(row.hours) === null) return false;
  if (typeof row.label !== "string" || !row.label.trim()) return false;
  if (!CATEGORIES.includes(row.category)) return false;
  return true;
}

export function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isValidEntry)
      .map((row) => ({
        id: row.id,
        date: row.date,
        hours: snapHours(row.hours),
        label: row.label.trim(),
        category: row.category,
      }));
  } catch {
    return [];
  }
}

export function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota or private mode — keep working in memory.
  }
}

export function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function groupByDate(entries) {
  const map = new Map();
  for (const entry of entries) {
    const list = map.get(entry.date) ?? [];
    list.push(entry);
    map.set(entry.date, list);
  }
  const dates = [...map.keys()].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  return dates.map((date) => ({
    date,
    entries: map.get(date),
  }));
}

export function formatDateHeading(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function sumHours(entries) {
  return entries.reduce(
    (acc, row) => {
      const h = Number(row.hours) || 0;
      acc.total += h;
      if (row.category === "capex") acc.capex += h;
      if (row.category === "opex") acc.opex += h;
      return acc;
    },
    { total: 0, capex: 0, opex: 0 }
  );
}
