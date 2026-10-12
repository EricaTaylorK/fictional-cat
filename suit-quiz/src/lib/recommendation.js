import { products, TAILORING_ESTIMATE } from "../data/products.js";

const occasionLabels = {
  wedding: "a wedding",
  funeral: "a funeral or memorial",
  work: "work and professional events",
  interview: "an interview",
  formal: "a formal celebration",
  other: "your upcoming event",
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
    issues.includes("unsure") ||
    answers.height === "short" ||
    answers.height === "extra-tall"
  );
}

function lengthFromHeight(answers) {
  if (answers.height === "short") return "S";
  if (answers.height === "tall" || answers.height === "extra-tall") return "L";

  const feet = Number(answers.measurements?.heightFeet);
  const inches = Number(answers.measurements?.heightInches);
  const total = feet * 12 + inches;
  if (!total) return "R";
  if (total < 67) return "S";
  if (total > 72) return "L";
  return "R";
}

export function inferLikelySize(answers) {
  const entered = Number(answers.measurements?.jacket || answers.measurements?.chest);
  if (!entered) return "Confirm your size with a fitting";
  const evenSize = Math.round(entered / 2) * 2;
  return `${evenSize}${lengthFromHeight(answers)} starting point`;
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

  const fitIssueCount = (answers.fitIssues ?? []).filter((issue) => issue !== "none").length;
  if (fitIssueCount >= 2 && product.id === "navy-value") {
    score += 8;
    evidence.push("Jacket and pants are sized separately, which helps with the fit issues you mentioned.");
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
    .sort((a, b) => b.score - a.score || a.price - b.price || a.originalIndex - b.originalIndex);

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
    needsMeasurementHelp: isLowConfidence(answers),
  };
}
