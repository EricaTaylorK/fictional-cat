import { describe, expect, it } from "vitest";
import { getQuestionFlow } from "../data/quizConfig.js";
import {
  buildResultSummary,
  getFitSignals,
  getRecommendations,
  inferLength,
  inferLikelySize,
  isLowConfidence,
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
      "occasion",
      "feel",
      "measurementKnowledge",
      "measurements",
      "wearIntent",
      "tailoring",
      "budget",
    ]);
  });

  it("routes unknown measurements through fit issues and height", () => {
    expect(getQuestionFlow({ measurementKnowledge: "no" })).toContain("fitIssues");
    expect(getQuestionFlow({ measurementKnowledge: "no" })).toContain("height");
    expect(getQuestionFlow({ measurementKnowledge: "no" })).not.toContain("measurements");
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

  it("moves separates to the top for an athletic build", () => {
    const [best] = getRecommendations({ ...estimate, fitIssues: ["athleticBuild"] });
    expect(best.separates).toBe(true);
    expect(recommendTailoring({ fitIssues: ["athleticBuild"] }).id).toBe("signature");
  });

  it("keeps slim cuts out of the top match for a fuller midsection", () => {
    const [best] = getRecommendations({ ...estimate, feel: "roomy", fitIssues: ["fullerMidsection"] });
    expect(best.fit).not.toBe("close");
  });

  it("favors stretch fabric when pants are tight through the seat and thighs", () => {
    const [best] = getRecommendations({ ...estimate, fitIssues: ["seatThighs"] });
    expect(best.stretch).toBe(true);
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
    expect(best.bundlePrice).toBe(best.price + 85);
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
    for (const occasion of ["wedding", "work", "versatile", "interview", "formal", "milestone", "funeral"]) {
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
});
