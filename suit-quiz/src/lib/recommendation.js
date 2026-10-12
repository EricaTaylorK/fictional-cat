import { products, TAILORING_ESTIMATE } from "../data/products.js";

const occasionLabels = {
  wedding: "a wedding",
  funeral: "a funeral or memorial",
  work: "work and professional events",
  interview: "an interview",
  formal: "a black-tie or formal evening",
  milestone: "a graduation, prom, or milestone",
  versatile: "whatever comes up",
};

const fitLabels = {
  close: "close and sharp",
  balanced: "polished, with room to move",
  roomy: "comfortable with room",
};

export function getBudgetRange(budget) {
  const ranges = {
    "under-250": [0, 249],
    "250-400": [250, 400],
    "400-600": [401, 600],
    "over-600": [601, Infinity],
    flexible: [0, Infinity],
  };
  return ranges[budget] ?? [0, Infinity];
}

export function isLowConfidence(answers) {
  const measurements = answers.measurements ?? {};
  const knownNumbers = [measurements.jacket, measurements.chest, measurements.waist].filter(Boolean);
  const issues = (answers.fitIssues ?? []).filter((issue) => issue !== "none");

  if (answers.measurementKnowledge === "some" && knownNumbers.length === 0) return true;
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
const STANDARD_DROP = 6;

export function getFitSignals(answers) {
  const signals = new Set((answers.fitIssues ?? []).filter((issue) => issue !== "none"));
  const chest = Number(answers.measurements?.jacket || answers.measurements?.chest);
  const waist = Number(answers.measurements?.waist);
  if (chest && waist) {
    const drop = chest - waist;
    if (drop >= 8) signals.add("athleticBuild");
    if (drop <= 4) signals.add("fullerMidsection");
  }
  return signals;
}

function heightLength(answers) {
  if (answers.height === "short") return "S";
  if (answers.height === "regular") return "R";
  if (answers.height === "tall" || answers.height === "extra-tall") return "L";

  const feet = Number(answers.measurements?.heightFeet);
  const inches = Number(answers.measurements?.heightInches);
  const total = feet * 12 + inches;
  if (!total) return null;
  if (total < 67) return "S";
  if (total > 72) return "L";
  return "R";
}

export function inferLength(answers) {
  const base = heightLength(answers);
  if (!base) return null;
  const signals = getFitSignals(answers);
  let index = LENGTHS.indexOf(base);
  if (signals.has("runsLong")) index = Math.max(0, index - 1);
  if (signals.has("runsShort")) index = Math.min(LENGTHS.length - 1, index + 1);
  return LENGTHS[index];
}

function inferPantWaist(answers, jacketSize) {
  const waist = Number(answers.measurements?.waist);
  if (waist) return waist;
  const signals = getFitSignals(answers);
  if (signals.has("athleticBuild")) return jacketSize - 8;
  if (signals.has("fullerMidsection")) return jacketSize - 4;
  return jacketSize - STANDARD_DROP;
}

export function inferLikelySize(answers) {
  const length = inferLength(answers);
  const entered = Number(answers.measurements?.jacket || answers.measurements?.chest);
  if (!entered) {
    return length
      ? `${LENGTH_NAMES[length]} (${length}) length; confirm chest size at a fitting`
      : "Confirm your size with a fitting";
  }
  const jacketSize = Math.round(entered / 2) * 2;
  return `${jacketSize}${length ?? "R"} jacket, ${inferPantWaist(answers, jacketSize)} waist pants`;
}

export function recommendTailoring(answers) {
  const signals = getFitSignals(answers);
  if (signals.has("athleticBuild")) {
    return { id: "signature", reason: "Shapes the jacket waist to your trimmer build and sets the pants waist." };
  }
  if (signals.has("fullerMidsection")) {
    return { id: "signature", reason: "Adjusts the jacket button point and pants waist so nothing pulls." };
  }
  if (signals.has("runsLong") || signals.has("runsShort")) {
    return { id: "essentials", reason: "Sets the sleeves to your arm length and hems the pants." };
  }
  return { id: "essentials", reason: "Every suit needs a hem and a sleeve check." };
}

function scoreFitSignals(product, answers, evidence) {
  const signals = getFitSignals(answers);
  let score = 0;

  if (signals.has("broadShoulders")) {
    if (product.fit === "roomy") score += 8;
    if (product.fit === "balanced") score += 4;
    if (product.fit === "close") score -= 8;
    if (product.stretch) score += 6;
    if (product.fit !== "close" || product.stretch) {
      evidence.push("Extra room through the shoulders and back, where tailoring can't add it later.");
    }
  }

  if (signals.has("athleticBuild")) {
    if (product.fit === "close") score += 12;
    if (product.fit === "balanced") score += 6;
    if (product.fit === "roomy") score -= 10;
    if (product.separates) {
      score += 12;
      evidence.push("Jacket and pants are sized separately, so the pants can fit your trimmer waist.");
    } else if (product.fit === "close") {
      evidence.push("A tapered cut that follows a broad chest down to a trimmer waist.");
    }
  }

  if (signals.has("fullerMidsection")) {
    if (product.fit === "roomy") score += 14;
    if (product.fit === "balanced") score += 4;
    if (product.fit === "close") score -= 16;
    if (product.separates) {
      score += 12;
      evidence.push("Jacket and pants are sized separately, so you get room at the waist without a bigger jacket.");
    } else if (product.fit === "roomy") {
      evidence.push("A classic cut with room at the button and waist.");
    }
  }

  if (signals.has("seatThighs")) {
    if (product.stretch) {
      score += 18;
      evidence.push("Stretch fabric gives through the seat and thighs when you sit or move.");
    } else {
      score -= 8;
    }
    if (product.fit === "roomy") score += 8;
    if (product.fit === "close") score -= 12;
  }

  return score;
}

function scoreProduct(product, answers, index) {
  let score = 0;
  const evidence = [];
  const [budgetMin, budgetMax] = getBudgetRange(answers.budget);

  if (product.formality.includes(answers.occasion)) {
    score += 32;
    evidence.push(`It reads correctly for ${occasionLabels[answers.occasion]}.`);
  } else {
    score -= 18;
  }

  score += scoreFitSignals(product, answers, evidence);

  if (product.fit === answers.feel) {
    score += 26;
    evidence.push(`The fit matches how you want it to feel: ${fitLabels[answers.feel]}.`);
  } else if (product.fit === "balanced") {
    score += 9;
  }

  if (product.price >= budgetMin && product.price <= budgetMax) {
    score += 18;
    evidence.push(answers.budget === "flexible" ? "Chosen for the moment and the fit, with room in the budget." : "It sits inside the budget you set.");
  } else if (answers.budget !== "flexible") {
    score -= Math.min(18, Math.ceil(Math.abs(product.price - Math.min(Math.max(product.price, budgetMin), budgetMax)) / 20));
  }

  if (answers.wearIntent === "rewear" || answers.wearIntent === "often") {
    score += product.versatility * 4;
    if (product.versatility >= 4) evidence.push("The color and formality travel well past this one occasion.");
  } else if (product.formality.includes(answers.occasion)) {
    score += 8;
  }

  if (answers.feel === "roomy") score += product.comfort * 2;
  if (answers.tailoring !== "skip") {
    score += product.tailoringEase * 2;
    if (product.tailoringEase >= 4) evidence.push("There's room for a tailor to finish the fit.");
  }
  return {
    ...product,
    score,
    evidence: evidence.slice(0, 4),
    originalIndex: index,
  };
}

export function getRecommendations(answers, assortment = products) {
  const ranked = assortment
    .map((product, index) => scoreProduct(product, answers, index))
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex);

  const highest = ranked[0]?.score || 1;
  return ranked.slice(0, 3).map((product, index) => ({
    ...product,
    matchPercent: Math.max(72, Math.min(98, Math.round(98 - (highest - product.score) * 1.25 - index * 2))),
    bundlePrice: product.price + (answers.tailoring === "bundle" ? TAILORING_ESTIMATE : 0),
  }));
}

export function buildResultSummary(answers) {
  return {
    occasion: occasionLabels[answers.occasion] ?? "your event",
    fit: fitLabels[answers.feel] ?? "a balanced fit",
    size: inferLikelySize(answers),
    tailoring: recommendTailoring(answers),
    fitNotes: [...getFitSignals(answers)].map((signal) => fitNoteLabels[signal]),
    needsMeasurementHelp: isLowConfidence(answers),
  };
}
