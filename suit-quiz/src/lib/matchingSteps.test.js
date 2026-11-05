import { describe, expect, it } from "vitest";
import { matchingSteps, matchingSubtext } from "./matchingSteps.js";

const ids = (steps) => steps.map((step) => step.id);

describe("matching steps", () => {
  it("lists rent steps in order and only adds the package step when a package was picked", () => {
    const withPackage = matchingSteps({ mode: "rent", pieces: 6, measurementKnowledge: "no" });
    expect(ids(withPackage)).toEqual(["occasion", "suit", "package", "sizes"]);
    const withoutPackage = matchingSteps({ mode: "rent", measurementKnowledge: "no" });
    expect(ids(withoutPackage)).toEqual(["occasion", "suit", "sizes"]);
  });

  it("uses the buy fit step and adds the color step only when colors were picked", () => {
    expect(ids(matchingSteps({ mode: "buy", measurementKnowledge: "no" }))).toEqual(["occasion", "fit", "sizes"]);
    const withColor = matchingSteps({
      mode: "buy",
      measurementKnowledge: "no",
      colors: { prefer: ["navy"], avoid: [] },
    });
    expect(ids(withColor)).toEqual(["occasion", "fit", "color", "sizes"]);
  });

  it("never adds an availability step for the event date", () => {
    const steps = matchingSteps({ mode: "rent", eventDate: "2026-12-09", pieces: 2, measurementKnowledge: "no" });
    expect(JSON.stringify(steps)).not.toMatch(/availab/i);
  });

  it("words the sizes step by the path the shopper took", () => {
    expect(matchingSteps({ mode: "buy", measurementKnowledge: "no" }).at(-1).active)
      .toBe("Estimating your sizes from your answers…");
    expect(matchingSteps({ mode: "buy", measurementKnowledge: "some", measurements: { jacket: "40R" } }).at(-1).active)
      .toBe("Checking your sizes…");
    expect(matchingSteps({ mode: "buy", measurementKnowledge: "some", measurements: {} }).at(-1).active)
      .toBe("Choosing a starting size…");
    expect(matchingSteps({ mode: "rent" }).at(-1).active).toBe("Working out your sizes…");
  });

  it("gives every step a past-tense done label", () => {
    for (const step of matchingSteps({ mode: "rent", pieces: 6, colors: { prefer: ["navy"] }, measurementKnowledge: "no" })) {
      expect(step.done).toBeTruthy();
      expect(step.done).not.toMatch(/…$/);
      expect(step.active).toMatch(/…$/);
    }
  });

  it("uses lane-specific subtext", () => {
    expect(matchingSubtext("rent")).toBe("Matching rental looks to your answers. This only takes a moment.");
    expect(matchingSubtext("buy")).toBe("Matching suits to your answers. This only takes a moment.");
  });
});
