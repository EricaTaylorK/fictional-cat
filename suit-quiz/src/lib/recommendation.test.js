import { describe, expect, it } from "vitest";
import { getQuestionFlow } from "../data/quizConfig.js";
import {
  buildResultSummary,
  getRecommendations,
  inferLikelySize,
  isLowConfidence,
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
      fitIssues: ["shoulders", "seat"],
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
    expect(inferLikelySize(baseAnswers)).toBe("40R starting point");
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

  it("reflects the shopper inputs in the result summary", () => {
    expect(buildResultSummary(baseAnswers)).toMatchObject({
      occasion: "a wedding",
      fit: "polished, with room to move",
      size: "40R starting point",
      needsMeasurementHelp: false,
    });
  });
});
