import { products, TAILORING_ESTIMATE } from "../data/products.js";
import {
  RENTAL_MIN_LEAD_DAYS,
  RENTAL_PIECES,
  RENTAL_READY_DAYS,
  RENTAL_TYPE_NAMES,
  rentals,
} from "../data/rentals.js";

const occasionLabels = {
  wedding: "a wedding",
  funeral: "a funeral or memorial",
  work: "work or an interview",
  formal: "a black-tie or formal evening",
  milestone: "a graduation, prom, or milestone",
  versatile: "whatever comes up",
  prom: "prom or homecoming",
  special: "a special event",
};

const fitLabels = {
  close: "close and sharp",
  balanced: "polished, with room to move",
  roomy: "comfortable with room",
};

const fitNameLabels = {
  close: "slim fit",
  balanced: "modern fit",
  roomy: "classic fit",
};

const budgetPhrases = {
  "under-250": "under $250",
  "250-400": "in the $250–$400 range",
  "400-600": "in the $400–$600 range",
  "over-600": "at $600 or more",
  "under-150": "under $150",
  "150-200": "in the $150–$200 range",
  "200-250": "in the $200–$250 range",
  "over-250": "at $250 or more",
};

export function getBudgetRange(budget) {
  const ranges = {
    "under-250": [0, 249],
    "250-400": [250, 400],
    "400-600": [401, 600],
    "over-600": [601, Infinity],
    "under-150": [0, 149.99],
    "150-200": [150, 200],
    "200-250": [200.01, 250],
    "over-250": [250.01, Infinity],
    flexible: [0, Infinity],
  };
  return ranges[budget] ?? [0, Infinity];
}

export function isLowConfidence(answers) {
  const measurements = answers.measurements ?? {};
  const knownNumbers = [measurements.jacket, measurements.chest, measurements.waist].filter(Boolean);
  const issues = (answers.fitIssues ?? []).filter((issue) => issue !== "none");

  if (answers.measurementKnowledge === "yes" || answers.measurementKnowledge === "some") {
    return knownNumbers.length === 0;
  }
  if (answers.measurementKnowledge !== "no") return false;

  return (
    issues.length >= 2 ||
    answers.height === "short" ||
    answers.height === "extra-tall"
  );
}

const fitNoteLabels = {
  broadShoulders: "room through the shoulders",
  athleticBuild: "broad chest, trimmer waist",
  fullerMidsection: "room through the middle",
  seatThighs: "room through the seat and thighs",
  runsLong: "shorter sleeves and jacket",
  runsShort: "longer sleeves and jacket",
};

const LENGTHS = ["S", "R", "L"];
const LENGTH_NAMES = { S: "Short", R: "Regular", L: "Long" };
const LENGTH_WORDS = { short: "S", regular: "R", long: "L", s: "S", r: "R", l: "L" };
const STANDARD_DROP = 6;

const FIT_TO_CATALOG = { close: "slim", balanced: "modern", roomy: "classic" };

export function parseJacket(raw) {
  if (raw == null) return null;
  const text = String(raw).trim().toLowerCase();
  if (!text) return null;
  const match = text.match(/(\d{2,3})(?:\s*(short|regular|long|[srl]))?/);
  if (!match) return null;
  const chest = Number(match[1]);
  if (!chest || chest < 30 || chest > 70) return null;
  return { chest, length: match[2] ? LENGTH_WORDS[match[2]] : null };
}

export function parseHeight(raw) {
  if (raw == null) return null;
  const text = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[“”″]/g, "\"")
    .replace(/[‘’′]/g, "'");
  if (!text) return null;

  let feet;
  let inches;
  let match = text.match(/(\d+)\s*(?:ft|feet|')\s*(\d{1,2})?/);
  if (match) {
    feet = Number(match[1]);
    inches = Number(match[2] || 0);
  } else if ((match = text.match(/^(\d+)\s+(\d{1,2})$/))) {
    feet = Number(match[1]);
    inches = Number(match[2]);
  } else if ((match = text.match(/^(\d+)$/))) {
    const total = Number(match[1]);
    if (total >= 48 && total <= 96) {
      feet = Math.floor(total / 12);
      inches = total % 12;
    } else if (total >= 4 && total <= 7) {
      feet = total;
      inches = 0;
    } else {
      return null;
    }
  } else {
    return null;
  }

  if (inches >= 12) {
    feet += Math.floor(inches / 12);
    inches %= 12;
  }
  if (feet < 4 || feet > 8) return null;
  return { feet, inches, total: feet * 12 + inches };
}

export function getFitSignals(answers) {
  const signals = new Set((answers.fitIssues ?? []).filter((issue) => issue !== "none"));
  const chest = parseJacket(answers.measurements?.jacket)?.chest || Number(answers.measurements?.chest);
  const waist = Number(answers.measurements?.waist);
  if (chest && waist) {
    const drop = chest - waist;
    if (drop >= 8) signals.add("athleticBuild");
    if (drop <= 4) signals.add("fullerMidsection");
  }
  return signals;
}

function heightFromMeasurements(answers) {
  const parsed = parseHeight(answers.measurements?.height);
  if (parsed) return parsed;
  const feet = Number(answers.measurements?.heightFeet);
  if (!feet) return null;
  const inches = Number(answers.measurements?.heightInches) || 0;
  return { feet, inches, total: feet * 12 + inches };
}

function heightLength(answers) {
  if (answers.height === "short") return "S";
  if (answers.height === "regular") return "R";
  if (answers.height === "tall" || answers.height === "extra-tall") return "L";

  const parsed = heightFromMeasurements(answers);
  if (!parsed?.total) return null;
  if (parsed.total < 67) return "S";
  if (parsed.total > 72) return "L";
  return "R";
}

export function inferLength(answers) {
  const fromJacket = parseJacket(answers.measurements?.jacket)?.length;
  if (fromJacket) return fromJacket;

  const base = heightLength(answers);
  if (!base) return null;
  const signals = getFitSignals(answers);
  let index = LENGTHS.indexOf(base);
  if (signals.has("runsLong")) index = Math.max(0, index - 1);
  if (signals.has("runsShort")) index = Math.min(LENGTHS.length - 1, index + 1);
  return LENGTHS[index];
}

export const SHIRT_SIZE_CHEST = { XS: 36, S: 38, M: 40, L: 42, XL: 46, XXL: 48, "3XL": 52 };

function buildDrop(answers) {
  const signals = getFitSignals(answers);
  if (signals.has("athleticBuild")) return 8;
  if (signals.has("fullerMidsection")) return 4;
  return STANDARD_DROP;
}

function knownChest(answers) {
  return parseJacket(answers.measurements?.jacket)?.chest
    || Number(answers.measurements?.chest)
    || SHIRT_SIZE_CHEST[answers.everydaySizes?.shirt]
    || null;
}

function knownWaist(answers) {
  return Number(answers.measurements?.waist || answers.everydaySizes?.waist) || null;
}

export function getSizeEstimate(answers) {
  const parsedJacket = parseJacket(answers.measurements?.jacket);
  const lengthCode = parsedJacket?.length || inferLength(answers) || "R";
  const chest = knownChest(answers);
  const waist = knownWaist(answers);
  if (!chest && !waist) {
    return { jacket: null, pants: null, length: LENGTH_NAMES[lengthCode], lengthCode };
  }
  const jacketSize = Math.round((parsedJacket?.chest ?? chest ?? waist + buildDrop(answers)) / 2) * 2;
  return {
    jacket: `${jacketSize}${lengthCode}`,
    pants: `${waist ?? jacketSize - buildDrop(answers)}W`,
    length: LENGTH_NAMES[lengthCode],
    lengthCode,
  };
}

export function describeSize(size) {
  const parts = [];
  if (size?.jacket) {
    const chest = String(size.jacket).replace(/[SRL]$/i, "");
    const length = (size.length || "regular").toLowerCase();
    parts.push(`Jacket ${size.jacket} (${chest} chest, ${length} length)`);
  } else if (size?.length) {
    parts.push(`Jacket ${size.length} (${size.lengthCode})`);
  }
  if (size?.pants) {
    const waist = String(size.pants).replace(/W$/i, "");
    parts.push(`Pants ${size.pants} (${waist}-inch waist)`);
  }
  return parts.join(" · ");
}

export function inferLikelySize(answers) {
  const length = inferLength(answers);
  const estimate = getSizeEstimate(answers);
  if (!estimate.jacket) {
    return length ? `${LENGTH_NAMES[length]} (${length}) length` : "Regular (R) length";
  }
  return `${estimate.jacket} jacket, ${estimate.pants.replace("W", "")} waist pants`;
}

export function recommendTailoring(answers) {
  const signals = getFitSignals(answers);
  if (signals.has("athleticBuild")) {
    return {
      id: "signature",
      reason: "Shapes the jacket waist to your trimmer build and sets the pants waist.",
      because: "Your chest and waist point to an athletic build, so we'll take in the jacket and pants waist to match.",
    };
  }
  if (signals.has("fullerMidsection")) {
    return {
      id: "signature",
      reason: "Adjusts the jacket button point and pants waist so nothing pulls.",
      because: "You said jackets pull at the button or pants pinch at the waist, so we'll adjust both so nothing pulls.",
    };
  }
  if (signals.has("runsLong")) {
    return {
      id: "essentials",
      reason: "Sets the sleeves to your arm length and hems the pants.",
      because: "You said sleeves and jackets usually run long, so we'll set the sleeves to your arms and hem the pants.",
    };
  }
  if (signals.has("runsShort")) {
    return {
      id: "essentials",
      reason: "Sets the sleeves to your arm length and hems the pants.",
      because: "You said sleeves and jackets usually run short, so we'll start in a longer length and finish the sleeves and hem.",
    };
  }
  return {
    id: "essentials",
    reason: "Every suit needs a hem and a sleeve check.",
    because: "Your size usually fits off the rack, so a hem and a sleeve check is all this suit needs.",
  };
}

const budgetLabels = {
  "under-250": "under-$250 budget",
  "250-400": "$250–$400 budget",
  "400-600": "$400–$600 budget",
  "over-600": "$600+ budget",
  "under-150": "under-$150 budget",
  "150-200": "$150–$200 budget",
  "200-250": "$200–$250 budget",
  "over-250": "$250+ budget",
};

const priceFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(price) {
  return priceFormat.format(price).replace(/\.00$/, "");
}

function scoreFitSignals(product, answers, evidence) {
  const signals = getFitSignals(answers);
  const fitName = (product.fitName || "This cut").toLowerCase();
  let score = 0;

  if (signals.has("broadShoulders")) {
    if (product.fit === "roomy") score += 8;
    if (product.fit === "balanced") score += 4;
    if (product.fit === "close") score -= 8;
    if (product.stretch) score += 6;
    if (product.fit !== "close") {
      evidence.push(`The ${fitName} leaves room through the shoulders and back, which a tailor can't add later.`);
    } else if (product.stretch) {
      evidence.push("Stretch in the fabric gives across the shoulders and back when you reach.");
    }
  }

  if (signals.has("athleticBuild")) {
    if (product.fit === "close") score += 12;
    if (product.fit === "balanced") score += 6;
    if (product.fit === "roomy") score -= 10;
    if (product.stretch) score += 4;
    if (product.fit === "close") {
      evidence.push(`The ${fitName} tapers from a broad chest down to a trimmer waist.`);
    } else if (product.fit === "balanced") {
      evidence.push("Fits a broad chest, and a tailor can take in the jacket and pants waist.");
    }
  }

  if (signals.has("fullerMidsection")) {
    if (product.fit === "roomy") score += 28;
    if (product.fit === "close") score -= 20;
    if (product.fit === "roomy") {
      evidence.push(`The ${fitName} gives room at the button and waist, so nothing pulls.`);
    }
  }

  if (signals.has("seatThighs")) {
    if (product.fit === "roomy") score += 20;
    if (product.stretch) score += 10;
    if (product.fit === "close" && !product.stretch) score -= 14;
    if (product.stretch) {
      evidence.push("Stretch in the fabric gives through the seat and thighs when you sit or move.");
    } else if (product.fit === "roomy") {
      evidence.push(`The ${fitName} cuts the pants fuller through the seat and thighs.`);
    }
  }

  return score;
}

function isAdjacentFit(fit, feel) {
  return fit === "balanced" || feel === "balanced";
}

function productColors(product) {
  return [product.colorKey, ...(product.variants ?? []).map((item) => item.colorKey)].filter(Boolean);
}

function matchedColor(product, prefer) {
  if (!prefer.length) return null;
  if (prefer.includes(product.colorKey)) return product.color;
  return product.variants?.find((item) => prefer.includes(item.colorKey))?.color ?? null;
}

function scoreProduct(product, answers, index) {
  let score = 0;
  const evidence = [];
  const [budgetMin, budgetMax] = getBudgetRange(answers.budget);
  const formality = product.formality ?? [];
  const prefer = answers.colors?.prefer ?? [];

  if (answers.occasion && formality.includes(answers.occasion)) {
    score += 32;
    evidence.push(product.occasionNotes?.[answers.occasion] ?? `It reads correctly for ${occasionLabels[answers.occasion]}.`);
  } else if (answers.occasion) {
    score -= 18;
  }

  score += scoreFitSignals(product, answers, evidence);

  if (product.fit === answers.feel) {
    score += 26;
    evidence.push(product.cutNote ?? `The fit matches how you want it to feel: ${fitLabels[answers.feel]}.`);
  } else if (isAdjacentFit(product.fit, answers.feel)) {
    score += 9;
  }

  const inBudget = product.price >= budgetMin && product.price <= budgetMax;
  if (inBudget) {
    score += 18;
    if (budgetLabels[answers.budget]) {
      evidence.push(product.compareAt
        ? `On sale at ${formatPrice(product.price)} (was ${formatPrice(product.compareAt)}), inside your ${budgetLabels[answers.budget]}.`
        : `${formatPrice(product.price)}, inside your ${budgetLabels[answers.budget]}.`);
    }
  } else if (answers.budget && answers.budget !== "flexible") {
    const edge = Math.min(Math.max(product.price, budgetMin), budgetMax);
    score -= Math.min(18, Math.ceil(Math.abs(product.price - edge) / 20));
  }

  if (answers.wearIntent === "rewear" || answers.wearIntent === "often") {
    score += (product.versatility ?? 0) * 4;
    if ((product.versatility ?? 0) >= 4 && product.rewearNote) evidence.push(product.rewearNote);
  } else if (answers.occasion && formality.includes(answers.occasion)) {
    score += 8;
  }

  if (answers.feel === "roomy") score += (product.comfort ?? 0) * 2;
  if (answers.tailoring !== "skip") {
    score += (product.tailoringEase ?? 0) * 2;
  }

  const colorName = matchedColor(product, prefer);
  if (colorName) {
    score += 20;
    evidence.push(`In ${colorName.toLowerCase()}, a color you picked.`);
  }

  return {
    ...product,
    score,
    evidence: evidence.slice(0, 4),
    inBudget: !answers.budget || answers.budget === "flexible" || inBudget,
    originalIndex: index,
  };
}

function budgetMissLabel(budget, count, item = "suit") {
  const phrase = budgetPhrases[budget] ?? "in your budget";
  if (count === 0) return `Nothing ${phrase} matched. Closest options:`;
  const noun = count === 1 ? item : `${item}s`;
  return `Only ${count} ${noun} ${phrase} matched. Closest options:`;
}

function buildTradeoffs(product, answers, forcedAvoid) {
  const notes = [];
  const [budgetMin, budgetMax] = getBudgetRange(answers.budget);
  if (answers.occasion && product.formality && !product.formality.includes(answers.occasion)) {
    notes.push(`Not the usual choice for ${occasionLabels[answers.occasion]}.`);
  }
  if (answers.feel && product.fit && product.fit !== answers.feel && product.fitName) {
    notes.push(`${product.fitName} isn't the ${fitNameLabels[answers.feel]} you asked for.`);
  }
  if (answers.budget && answers.budget !== "flexible" && !product.inBudget) {
    if (product.price > budgetMax) {
      notes.push(`Over your budget by ${formatPrice(product.price - budgetMax)}.`);
    } else if (product.price < budgetMin) {
      notes.push(`Below your ${budgetLabels[answers.budget] ?? "budget"}.`);
    }
  }
  const prefer = answers.colors?.prefer ?? [];
  const avoid = answers.colors?.avoid ?? [];
  const colors = productColors(product);
  const fullyAvoided = colors.length > 0 && colors.every((key) => avoid.includes(key));
  if (forcedAvoid || fullyAvoided) {
    notes.push(`You asked to skip ${product.color.toLowerCase()}.`);
  } else if (prefer.length && !matchedColor(product, prefer)) {
    notes.push(`${product.color} wasn't a color you picked.`);
  }
  return notes;
}

function maxPossibleScore(answers) {
  const prefer = answers.colors?.prefer?.[0];
  const [budgetMin, budgetMax] = getBudgetRange(answers.budget);
  const price = budgetMax === Infinity ? Math.max(budgetMin, 700) : (budgetMin + budgetMax) / 2;
  let best = 0;
  for (const fit of ["close", "balanced", "roomy"]) {
    for (const stretch of [false, true]) {
      const candidate = {
        fit,
        stretch,
        fitName: "Suit",
        formality: answers.occasion ? [answers.occasion] : [],
        versatility: 5,
        comfort: 5,
        tailoringEase: 5,
        price,
        colorKey: prefer,
        color: "Navy",
        cutNote: "cut",
        rewearNote: "rewear",
      };
      const scored = scoreProduct(candidate, answers, 0);
      if (scored.score > best) best = scored.score;
    }
  }
  return best || 1;
}

function honestPercent(score, maxScore) {
  const percent = Math.round((score / maxScore) * 98);
  return Math.max(35, Math.min(98, percent));
}

export function getRecommendations(answers, assortment = products) {
  const scored = assortment.map((product, index) => scoreProduct(product, answers, index));
  const avoid = new Set(answers.colors?.avoid ?? []);
  let pool = scored;
  let forcedAvoid = false;
  if (avoid.size) {
    const allowed = scored.filter((product) => {
      const colors = productColors(product);
      return colors.length === 0 || colors.some((key) => !avoid.has(key));
    });
    if (allowed.length) pool = allowed;
    else forcedAvoid = true;
  }

  const byScore = (a, b) => b.score - a.score || a.originalIndex - b.originalIndex;
  const inBudget = pool.filter((product) => product.inBudget).sort(byScore);
  const overBudget = pool.filter((product) => !product.inBudget).sort(byScore);
  const ranked = [...inBudget, ...overBudget];
  const maxScore = maxPossibleScore(answers);
  const limitedBudget = answers.budget && answers.budget !== "flexible";
  const budgetMiss = limitedBudget && inBudget.length < 3
    ? { label: budgetMissLabel(answers.budget, inBudget.length), count: inBudget.length }
    : null;

  const result = ranked.map((product) => {
    const [budgetMin, budgetMax] = getBudgetRange(answers.budget);
    return {
      ...product,
      matchPercent: honestPercent(product.score, maxScore),
      bundlePrice: product.price + (answers.tailoring === "bundle" ? TAILORING_ESTIMATE : 0),
      budgetOver: limitedBudget && product.price > budgetMax ? product.price - budgetMax : null,
      belowBudget: limitedBudget && product.price < budgetMin,
      tradeoffs: buildTradeoffs(product, answers, forcedAvoid),
    };
  });
  result.budgetMiss = budgetMiss;
  return result;
}

export function quizCatalogIds(answers, limit = 9) {
  const prefer = new Set(answers.colors?.prefer ?? []);
  const avoid = new Set(answers.colors?.avoid ?? []);
  const ids = [];
  for (const product of getRecommendations(answers).slice(0, limit)) {
    const options = product.variants?.length
      ? product.variants
      : [{ colorKey: product.colorKey, catalogId: product.catalogId }];
    const chosen = options.filter((option) => {
      if (!option.catalogId || avoid.has(option.colorKey)) return false;
      if (prefer.size && !prefer.has(option.colorKey)) return false;
      return true;
    });
    for (const option of (chosen.length ? chosen : options)) {
      if (option.catalogId) ids.push(option.catalogId);
    }
  }
  return [...new Set(ids)];
}

export function quizListingFilters(answers) {
  const selections = {};
  const prefer = answers.colors?.prefer ?? [];
  if (prefer.length) selections.color = [...prefer];
  if (FIT_TO_CATALOG[answers.feel]) selections.fit = [FIT_TO_CATALOG[answers.feel]];

  const filters = { selections, priceMin: null, priceMax: null };
  if (answers.budget === "under-250") filters.priceMax = 250;
  if (answers.budget === "250-400") {
    filters.priceMin = 250;
    filters.priceMax = 400;
  }
  if (answers.budget === "400-600") {
    filters.priceMin = 400;
    filters.priceMax = 600;
  }
  if (answers.budget === "over-600") filters.priceMin = 600;
  return filters;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(value) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

const dateFormat = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

export function formatDate(date) {
  return date ? dateFormat.format(date) : "";
}

export function rentalDates(eventDate, today = new Date()) {
  const event = parseIsoDate(eventDate);
  if (!event) return null;
  const daysAway = Math.round((event - startOfDay(today)) / DAY_MS);
  return {
    event,
    ready: addDays(event, -RENTAL_READY_DAYS),
    returnBy: addDays(event, 1),
    daysAway,
    past: daysAway < 0,
    tooSoon: daysAway >= 0 && daysAway < RENTAL_MIN_LEAD_DAYS,
  };
}

export function rentalPieces(answers) {
  const ids = new Set(answers.pieces ?? []);
  return RENTAL_PIECES.filter((piece) => ids.has(piece.id));
}

export function rentalTotal(look, pieces) {
  return Math.round((look.price + pieces.reduce((sum, piece) => sum + piece.price, 0)) * 100) / 100;
}

const RENTAL_TYPE_SCORES = {
  formal: { tux: 16, dinner: 12, tailcoat: 14, suit: -12 },
  wedding: { tux: 6, dinner: 4, tailcoat: 0, suit: 6 },
  prom: { tux: 8, dinner: 10, tailcoat: -20, suit: 2 },
  special: { tux: 4, dinner: 6, tailcoat: -20, suit: 6 },
};

const RENTAL_TYPE_NOTES = {
  formal: {
    tux: "A true tuxedo, with the satin details black tie calls for.",
    dinner: "A dinner jacket reads as black tie, with more personality.",
    tailcoat: "A full-dress tailcoat, for the most formal invitations.",
  },
  wedding: {
    tux: "A tuxedo looks right for the groom, the wedding party, or an evening wedding.",
    suit: "A suit fits most ceremonies, from daytime to evening.",
    dinner: "A dinner jacket stands out at an evening reception.",
    tailcoat: "A tailcoat suits the most formal ceremonies.",
  },
  prom: {
    tux: "A tuxedo is the classic prom pick.",
    dinner: "A dinner jacket stands out in photos.",
    suit: "A suit keeps it sharp and simple.",
  },
  special: {
    tux: "A tuxedo dresses up any celebration.",
    dinner: "A dinner jacket feels festive without going overboard.",
    suit: "A suit is easy to wear at most celebrations.",
  },
};

function scoreRental(look, answers, pieces, index) {
  let score = 0;
  const evidence = [];
  const [budgetMin, budgetMax] = getBudgetRange(answers.rentalBudget);
  const prefer = answers.colors?.prefer ?? [];
  const total = rentalTotal(look, pieces);

  if (answers.occasion && look.formality.includes(answers.occasion)) {
    score += 32;
    const note = RENTAL_TYPE_NOTES[answers.occasion]?.[look.type];
    if (note) evidence.push(note);
  } else if (answers.occasion) {
    score -= 18;
  }
  score += RENTAL_TYPE_SCORES[answers.occasion]?.[look.type] ?? 0;

  const inBudget = total >= budgetMin && total <= budgetMax;
  if (inBudget) {
    score += 18;
    if (budgetLabels[answers.rentalBudget]) {
      evidence.push(`${formatPrice(total)} with your pieces, inside your ${budgetLabels[answers.rentalBudget]}.`);
    }
  } else if (answers.rentalBudget && answers.rentalBudget !== "flexible") {
    const edge = Math.min(Math.max(total, budgetMin), budgetMax);
    score -= Math.min(18, Math.ceil(Math.abs(total - edge) / 10));
  }

  if (prefer.includes(look.colorKey)) {
    score += 20;
    evidence.push(`In ${look.color.toLowerCase()}, a color you picked.`);
  }

  if (look.rating != null && look.reviews >= 20) {
    score += Math.max(0, Math.round((look.rating - 4) * 10));
    if (look.rating >= 4.3) {
      evidence.push(`Rated ${look.rating.toFixed(1)} out of 5 by ${look.reviews.toLocaleString("en-US")} renters.`);
    }
  }

  return {
    ...look,
    score,
    total,
    evidence: evidence.slice(0, 4),
    inBudget: !answers.rentalBudget || answers.rentalBudget === "flexible" || inBudget,
    originalIndex: index,
  };
}

function rentalTradeoffs(look, answers, forcedAvoid) {
  const notes = [];
  const [budgetMin, budgetMax] = getBudgetRange(answers.rentalBudget);
  if (answers.occasion && !look.formality.includes(answers.occasion)) {
    notes.push(`Not the usual choice for ${occasionLabels[answers.occasion]}.`);
  } else if (answers.occasion === "formal" && look.type === "suit") {
    notes.push("A suit, not a tuxedo. Some black-tie invitations expect a tux.");
  }
  if (answers.rentalBudget && answers.rentalBudget !== "flexible" && !look.inBudget) {
    if (look.total > budgetMax) notes.push(`Over your budget by ${formatPrice(look.total - budgetMax)}.`);
    else if (look.total < budgetMin) notes.push(`Below your ${budgetLabels[answers.rentalBudget]}.`);
  }
  const prefer = answers.colors?.prefer ?? [];
  if (forcedAvoid) notes.push(`You asked to skip ${look.color.toLowerCase()}.`);
  else if (prefer.length && !prefer.includes(look.colorKey)) notes.push(`${look.color} wasn't a color you picked.`);
  if (look.reviews < 20) notes.push(look.reviews ? `Only ${look.reviews} reviews so far.` : "No reviews yet.");
  return notes;
}

function maxRentalScore(answers, pieces) {
  const [budgetMin, budgetMax] = getBudgetRange(answers.rentalBudget);
  const pieceTotal = pieces.reduce((sum, piece) => sum + piece.price, 0);
  const price = (budgetMax === Infinity ? Math.max(budgetMin, 300) : (budgetMin + budgetMax) / 2) - pieceTotal;
  let best = 0;
  for (const type of Object.keys(RENTAL_TYPE_NAMES)) {
    const candidate = {
      type,
      price,
      colorKey: answers.colors?.prefer?.[0],
      color: "Black",
      rating: 5,
      reviews: 1000,
      formality: answers.occasion ? [answers.occasion] : [],
    };
    best = Math.max(best, scoreRental(candidate, answers, pieces, 0).score);
  }
  return best || 1;
}

export function getRentalRecommendations(answers, assortment = rentals) {
  const pieces = rentalPieces(answers);
  const scored = assortment.map((look, index) => scoreRental(look, answers, pieces, index));
  const avoid = new Set(answers.colors?.avoid ?? []);
  let pool = scored.filter((look) => !avoid.has(look.colorKey));
  const forcedAvoid = pool.length === 0;
  if (forcedAvoid) pool = scored;

  const byScore = (a, b) => b.score - a.score || a.originalIndex - b.originalIndex;
  const inBudget = pool.filter((look) => look.inBudget).sort(byScore);
  const overBudget = pool.filter((look) => !look.inBudget).sort(byScore);
  const maxScore = maxRentalScore(answers, pieces);
  const limitedBudget = answers.rentalBudget && answers.rentalBudget !== "flexible";
  const budgetMiss = limitedBudget && inBudget.length < 3
    ? { label: budgetMissLabel(answers.rentalBudget, inBudget.length, "look"), count: inBudget.length }
    : null;

  const result = [...inBudget, ...overBudget].map((look) => ({
    ...look,
    matchPercent: honestPercent(look.score, maxScore),
    tradeoffs: rentalTradeoffs(look, answers, forcedAvoid),
  }));
  result.budgetMiss = budgetMiss;
  return result;
}

export function buildResultSummary(answers) {
  const prefer = answers.colors?.prefer ?? [];
  return {
    mode: answers.mode === "rent" ? "rent" : "buy",
    dates: rentalDates(answers.eventDate),
    pieces: rentalPieces(answers),
    occasion: occasionLabels[answers.occasion] ?? "your event",
    fit: fitLabels[answers.feel] ?? "a balanced fit",
    fitName: fitNameLabels[answers.feel] ?? "balanced fit",
    size: inferLikelySize(answers),
    sizeEstimate: getSizeEstimate(answers),
    tailoring: recommendTailoring(answers),
    fitNotes: [...getFitSignals(answers)].map((signal) => fitNoteLabels[signal]),
    colors: prefer,
    needsMeasurementHelp: isLowConfidence(answers),
  };
}
