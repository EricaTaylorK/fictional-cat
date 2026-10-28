import { describe, expect, it } from "vitest";
import { products, SWATCH_HEX, TAILORING_TIERS } from "../data/products.js";
import { colorThemes, colorsIn, getQuestionFlow } from "../data/quizConfig.js";
import { RENTAL_PIECES, rentals } from "../data/rentals.js";
import {
  buildResultSummary,
  describeSize,
  getFitSignals,
  getRecommendations,
  getRentalRecommendations,
  rentalDates,
  rentalTotal,
  getSizeEstimate,
  inferLength,
  inferLikelySize,
  isLowConfidence,
  parseHeight,
  parseJacket,
  recommendTailoring,
} from "./recommendation.js";

const baseAnswers = {
  occasion: "wedding",
  feel: "balanced",
  measurementKnowledge: "yes",
  measurements: { jacket: "40", waist: "34", heightFeet: "5", heightInches: "10" },
  wearIntent: "rewear",
  tailoring: "bundle",
  budget: "250-400",
};

describe("quiz routing", () => {
  it("routes known measurements through the short path", () => {
    expect(getQuestionFlow({ measurementKnowledge: "yes" })).toEqual([
      "mode",
      "occasion",
      "feel",
      "colors",
      "measurementKnowledge",
      "measurements",
      "fitIssues",
      "tailoring",
      "budget",
    ]);
  });

  it("asks where suits feel off on both measurement paths, and never a separate height step", () => {
    const some = getQuestionFlow({ measurementKnowledge: "some" });
    expect(some.indexOf("fitIssues")).toBe(some.indexOf("measurements") + 1);
    expect(some).not.toContain("height");
    const estimate = getQuestionFlow({ measurementKnowledge: "no" });
    expect(estimate).not.toContain("height");
    expect(estimate.indexOf("fitIssues")).toBe(estimate.indexOf("everydaySizes") + 1);
    expect(getQuestionFlow({ mode: "rent", measurementKnowledge: "no" })).not.toContain("height");
    expect(getQuestionFlow({ mode: "rent", measurementKnowledge: "yes" })).not.toContain("height");
  });

  it("routes unknown measurements through everyday sizes and fit issues", () => {
    expect(getQuestionFlow({ measurementKnowledge: "no" })).toEqual([
      "mode",
      "occasion",
      "feel",
      "colors",
      "measurementKnowledge",
      "everydaySizes",
      "fitIssues",
      "tailoring",
      "budget",
    ]);
  });

  it("sends renters through pieces and an event date, without tailoring or a buying budget", () => {
    const flow = getQuestionFlow({ mode: "rent", measurementKnowledge: "yes" });
    expect(flow[0]).toBe("mode");
    expect(flow).toContain("eventDate");
    expect(flow).toContain("pieces");
    expect(flow).toContain("rentalBudget");
    expect(flow).not.toContain("tailoring");
    expect(flow).not.toContain("budget");
  });
});

describe("rentals", () => {
  const rentAnswers = {
    mode: "rent",
    occasion: "formal",
    feel: "balanced",
    measurementKnowledge: "yes",
    measurements: { jacket: "40", waist: "34" },
    pieces: ["shirt", "neckwear", "shoes"],
    rentalBudget: "150-200",
  };

  it("prices each look with the pieces the renter picked", () => {
    const look = { price: 139.99 };
    const pieces = RENTAL_PIECES.filter((piece) => rentAnswers.pieces.includes(piece.id));
    expect(rentalTotal(look, pieces)).toBe(199.99);
  });

  it("keeps in-budget looks first once pieces are added", () => {
    const results = getRentalRecommendations(rentAnswers);
    const firstMiss = results.findIndex((look) => !look.inBudget);
    expect(results[0].inBudget).toBe(true);
    expect(results[0].total).toBeLessThanOrEqual(200);
    if (firstMiss >= 0) expect(results.slice(firstMiss).every((look) => !look.inBudget)).toBe(true);
  });

  it("favors a tuxedo over a suit for black tie", () => {
    const [best] = getRentalRecommendations({ ...rentAnswers, rentalBudget: "flexible" });
    expect(best.type).not.toBe("suit");
  });

  it("works out ready and return dates, and flags events that are too soon", () => {
    const today = new Date(2026, 9, 26);
    const dates = rentalDates("2026-11-14", today);
    expect(dates.ready).toEqual(new Date(2026, 10, 11));
    expect(dates.returnBy).toEqual(new Date(2026, 10, 15));
    expect(dates.tooSoon).toBe(false);
    expect(rentalDates("2026-10-28", today).tooSoon).toBe(true);
    expect(rentalDates("2026-10-20", today).past).toBe(true);
  });
});

describe("tailoring tiers", () => {
  it("adds up the real alteration prices", () => {
    expect(TAILORING_TIERS.map((tier) => tier.price)).toEqual([55, 115, 199]);
  });
});

describe("fit confidence", () => {
  it("flags multiple fit issues for measurement help", () => {
    expect(isLowConfidence({
      measurementKnowledge: "no",
      fitIssues: ["broadShoulders", "seatThighs"],
      height: "regular",
    })).toBe(true);
  });

  it("does not overstate risk when standard sizes usually work", () => {
    expect(isLowConfidence({
      measurementKnowledge: "no",
      fitIssues: ["none"],
      height: "regular",
    })).toBe(false);
  });

  it("turns a known jacket size into a length-aware starting point", () => {
    expect(inferLikelySize(baseAnswers)).toBe("40R jacket, 34 waist pants");
  });

  it("shifts the length when sleeves and jackets usually run long or short", () => {
    const estimate = { measurementKnowledge: "no", height: "regular" };
    expect(inferLength({ ...estimate, fitIssues: ["runsLong"] })).toBe("S");
    expect(inferLength({ ...estimate, fitIssues: ["runsShort"] })).toBe("L");
    expect(inferLikelySize({ ...estimate, fitIssues: ["runsShort"] })).toContain("Long (L) length");
  });
});

describe("fit signals", () => {
  const estimate = {
    occasion: "work",
    feel: "balanced",
    measurementKnowledge: "no",
    height: "regular",
    wearIntent: "rewear",
    tailoring: "consider",
    budget: "flexible",
  };

  it("reads an athletic or fuller build from entered measurements", () => {
    expect(getFitSignals({ measurements: { jacket: "42", waist: "32" } }).has("athleticBuild")).toBe(true);
    expect(getFitSignals({ measurements: { jacket: "42", waist: "39" } }).has("fullerMidsection")).toBe(true);
    expect(getFitSignals({ measurements: { jacket: "42", waist: "36" } }).size).toBe(0);
  });

  it("keeps classic cuts out of the top match for an athletic build", () => {
    const [best] = getRecommendations({ ...estimate, fitIssues: ["athleticBuild"] });
    expect(best.fit).not.toBe("roomy");
    expect(best.evidence.join(" ")).toMatch(/waist/);
    expect(recommendTailoring({ fitIssues: ["athleticBuild"] }).id).toBe("signature");
  });

  it("moves a classic cut to the top for a fuller midsection", () => {
    const [best] = getRecommendations({ ...estimate, fitIssues: ["fullerMidsection"] });
    expect(best.fit).toBe("roomy");
  });

  it("favors room or stretch when pants are tight through the seat and thighs", () => {
    const [best] = getRecommendations({ ...estimate, fitIssues: ["seatThighs"] });
    expect(best.fit === "roomy" || best.stretch).toBe(true);
    expect(best.evidence.join(" ")).toMatch(/seat and thighs/);
  });

  it("changes the recommendation compared with standard sizes", () => {
    const standard = getRecommendations({ ...estimate, fitIssues: ["none"] })[0].id;
    const fuller = getRecommendations({ ...estimate, fitIssues: ["fullerMidsection"] })[0].id;
    expect(fuller).not.toBe(standard);
  });
});

describe("recommendations", () => {
  it("prioritizes a relevant match and explains the choice", () => {
    const [best] = getRecommendations(baseAnswers);
    expect(best.formality).toContain("wedding");
    expect(best.fit).toBe("balanced");
    expect(best.evidence.length).toBeGreaterThanOrEqual(3);
    expect(best.evidence).toContain(best.occasionNotes.wedding);
    expect(best.evidence.some((reason) => reason.includes("$250–$400 budget"))).toBe(true);
    expect(best.bundlePrice).toBe(best.price + 85);
  });

  it("splits the size into jacket and pants for the product card", () => {
    expect(getSizeEstimate(baseAnswers)).toEqual({ jacket: "40R", pants: "34W", length: "Regular", lengthCode: "R" });
  });

  it("always gives a jacket and a pants size from everyday sizes", () => {
    expect(getSizeEstimate({
      measurementKnowledge: "no",
      height: "short",
      everydaySizes: { shirt: "L", waist: "36" },
    })).toEqual({ jacket: "42S", pants: "36W", length: "Short", lengthCode: "S" });
  });

  it("fills in the missing size when only one measurement is known", () => {
    expect(getSizeEstimate({ measurements: { waist: "34" } })).toMatchObject({ jacket: "40R", pants: "34W" });
    expect(getSizeEstimate({ measurements: { jacket: "42" } })).toMatchObject({ jacket: "42R", pants: "36W" });
  });

  it("breaks exact ties by original assortment order", () => {
    const same = {
      fit: "balanced",
      price: 300,
      formality: ["wedding"],
      versatility: 4,
      comfort: 4,
      tailoringEase: 4,
      description: "Test",
    };
    const ranked = getRecommendations(baseAnswers, [
      { ...same, id: "first", name: "First" },
      { ...same, id: "second", name: "Second" },
    ]);
    expect(ranked[0].id).toBe("first");
  });

  it("matches every occasion option to at least two suits", () => {
    for (const occasion of ["wedding", "work", "versatile", "formal", "milestone", "funeral"]) {
      const relevant = getRecommendations({ ...baseAnswers, occasion })
        .filter((product) => product.formality.includes(occasion));
      expect(relevant.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("reflects the shopper inputs in the result summary", () => {
    expect(buildResultSummary(baseAnswers)).toMatchObject({
      occasion: "a wedding",
      fit: "polished, with room to move",
      size: "40R jacket, 34 waist pants",
      needsMeasurementHelp: false,
    });
  });

  it("reads a jacket length and a height written the way people say it", () => {
    expect(parseJacket("44L")).toEqual({ chest: 44, length: "L" });
    expect(parseJacket("44 long")).toEqual({ chest: 44, length: "L" });
    expect(parseHeight("6'5\"")).toEqual({ feet: 6, inches: 5, total: 77 });
    expect(parseHeight("6 5")).toEqual({ feet: 6, inches: 5, total: 77 });
    expect(parseHeight("6ft 5")).toEqual({ feet: 6, inches: 5, total: 77 });
    expect(parseHeight("77")).toEqual({ feet: 6, inches: 5, total: 77 });
    expect(getSizeEstimate({ measurements: { jacket: "44L", height: "6'5\"" } })).toMatchObject({
      jacket: "44L",
      lengthCode: "L",
      length: "Long",
    });
    expect(describeSize(getSizeEstimate(baseAnswers))).toBe(
      "Jacket 40R (40 chest, regular length) · Pants 34W (34-inch waist)",
    );
  });

  it("ranks suits in a picked palette first", () => {
    const navy = {
      id: "navy",
      fit: "balanced",
      fitName: "Modern fit",
      color: "Navy",
      colorKey: "navy",
      price: 300,
      formality: ["wedding"],
      versatility: 4,
      comfort: 4,
      tailoringEase: 4,
    };
    const tan = { ...navy, id: "tan", color: "Tan", colorKey: "tan" };
    const brownTan = getRecommendations({ ...baseAnswers, colors: { prefer: ["brownTan"] } }, [navy, tan]);
    expect(brownTan.map((product) => product.id)).toEqual(["tan", "navy"]);
    expect(brownTan[0].evidence.join(" ")).toMatch(/tan, a color you picked/);
    expect(brownTan[1].tradeoffs.join(" ")).toMatch(/wasn't a color you picked/);

    const navyPick = getRecommendations({ ...baseAnswers, colors: { prefer: ["navy"] } }, [tan, navy]);
    expect(navyPick[0].id).toBe("navy");

    const warm = getRecommendations({ ...baseAnswers, colors: { prefer: ["warm"] } }, [navy, tan]);
    expect(warm[0].id).toBe("tan");
    const darks = getRecommendations({ ...baseAnswers, colors: { prefer: ["darks"] } }, [tan, navy]);
    expect(darks[0].id).toBe("navy");
  });

  it("ignores colors to skip from older saved answers", () => {
    const black = {
      id: "black",
      fit: "balanced",
      fitName: "Modern fit",
      color: "Black",
      colorKey: "black",
      price: 300,
      formality: ["wedding"],
    };
    const ranked = getRecommendations({ ...baseAnswers, colors: { prefer: [], avoid: ["black"] } }, [black]);
    expect(ranked[0].id).toBe("black");
    expect(ranked[0].tradeoffs.join(" ")).not.toMatch(/skip/i);
    expect(getRentalRecommendations({ mode: "rent", colors: { avoid: ["darks"] } }).length).toBe(rentals.length);
  });

  it("builds every color theme from colors the catalog actually carries", () => {
    const buyKeys = new Set(products.flatMap((product) => [product, ...(product.variants ?? [])]).map((item) => item.colorKey));
    const rentKeys = new Set(rentals.map((look) => look.colorKey));
    for (const [mode, keys] of [["buy", buyKeys], ["rent", rentKeys]]) {
      const themes = colorThemes(mode);
      expect(themes.length).toBeGreaterThan(0);
      for (const theme of themes) {
        for (const swatch of theme.swatches) {
          expect(keys.has(swatch.key)).toBe(true);
          expect(swatch.hex).toBe(SWATCH_HEX[swatch.key]);
        }
      }
      const listed = themes.flatMap((theme) => theme.colors);
      expect(new Set(listed).size).toBe(listed.length);
      expect(new Set(listed)).toEqual(keys);
    }
    const buyThemes = colorThemes("buy");
    const rentThemes = colorThemes("rent");
    expect(buyThemes.map((theme) => theme.value)).toEqual(["navy", "blue", "gray", "black", "brownTan", "burgundy", "green"]);
    expect(rentThemes.map((theme) => theme.value)).toEqual(["navy", "blue", "gray", "black", "brownTan", "green", "white"]);
    expect(buyThemes.map((theme) => theme.value)).not.toContain("white");
    expect(buyThemes.map((theme) => theme.value)).not.toContain("light");
    expect(rentThemes.map((theme) => theme.value)).toContain("white");
    expect(rentThemes.map((theme) => theme.value)).not.toContain("light");
    expect(buyThemes.find((theme) => theme.value === "brownTan").colors).toEqual(["brown", "tan"]);
    expect(rentThemes.find((theme) => theme.value === "brownTan").colors).toEqual(["tan"]);
    expect(rentThemes.find((theme) => theme.value === "brownTan").label).toBe("Tan");
    expect(colorsIn(["darks"])).toEqual(["navy", "blue", "gray", "black"]);
    expect(colorsIn(["warm"])).toEqual(["tan", "brown", "burgundy", "green"]);
    expect(colorsIn(["light"])).toEqual(["white"]);
    expect(colorsIn(["navy", "brownTan"])).toEqual(["navy", "brown", "tan"]);
  });

  it("puts in-budget suits first and says when the budget misses", () => {
    const suit = {
      fit: "balanced",
      fitName: "Modern fit",
      color: "Navy",
      colorKey: "navy",
      formality: ["wedding"],
      versatility: 4,
      comfort: 4,
      tailoringEase: 4,
    };
    const ranked = getRecommendations(
      { ...baseAnswers, budget: "under-250" },
      [
        { ...suit, id: "over", price: 400 },
        { ...suit, id: "under", price: 180 },
      ],
    );
    expect(ranked.map((product) => product.id)).toEqual(["under", "over"]);
    expect(ranked.budgetMiss.label).toBe("Only 1 suit under $250 matched. Closest options:");
    expect(ranked[1].tradeoffs.join(" ")).toMatch(/Over your budget/);

    const none = getRecommendations(
      { ...baseAnswers, budget: "under-250" },
      [{ ...suit, id: "over", price: 400 }],
    );
    expect(none.budgetMiss.label).toBe("Nothing under $250 matched. Closest options:");
  });

  it("lets a weak match fall below 72 and explains why", () => {
    const strong = {
      id: "strong",
      fit: "balanced",
      fitName: "Modern fit",
      color: "Navy",
      colorKey: "navy",
      price: 300,
      formality: ["wedding"],
      versatility: 5,
      comfort: 4,
      tailoringEase: 5,
    };
    const weak = {
      id: "weak",
      fit: "roomy",
      fitName: "Classic fit",
      color: "Tan",
      colorKey: "tan",
      price: 900,
      formality: ["formal"],
      versatility: 1,
      comfort: 1,
      tailoringEase: 1,
    };
    const ranked = getRecommendations(baseAnswers, [strong, weak]);
    expect(ranked[0].id).toBe("strong");
    expect(ranked[1].matchPercent).toBeLessThan(72);
    expect(ranked[1].tradeoffs.length).toBeGreaterThan(0);
  });
});
