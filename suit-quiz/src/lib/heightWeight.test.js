import { describe, expect, it } from "vitest";
import { getQuestionFlow, questions } from "../data/quizConfig.js";
import { fitProfileRows } from "../components/Results.jsx";
import { answerFromDisplay, displayValues, weightLabel } from "./heightWeight.js";
import { inferLength } from "./recommendation.js";

describe("height and weight answers", () => {
  it("saves imperial entries as total inches and pounds", () => {
    expect(answerFromDisplay({ feet: "5", inches: "10", lb: "180" }, "imperial")).toEqual({ height: 70, weight: 180 });
  });

  it("converts metric entries to inches and pounds before saving", () => {
    expect(answerFromDisplay({ cm: "178", kg: "82" }, "metric")).toEqual({ height: 70, weight: 181 });
    expect(answerFromDisplay({ cm: "193", kg: "100" }, "metric")).toEqual({ height: 76, weight: 220 });
  });

  it("saves nothing for empty, partial, or out-of-range entries", () => {
    expect(answerFromDisplay({ feet: "", inches: "", lb: "" }, "imperial")).toEqual({ height: "", weight: "" });
    expect(answerFromDisplay({ feet: "5", inches: "", lb: "20" }, "imperial")).toEqual({ height: "", weight: "" });
    expect(answerFromDisplay({ feet: "9", inches: "2", lb: "900" }, "imperial")).toEqual({ height: "", weight: "" });
    expect(answerFromDisplay({ feet: "5", inches: "12", lb: "" }, "imperial")).toEqual({ height: "", weight: "" });
    expect(answerFromDisplay({ cm: "40", kg: "5" }, "metric")).toEqual({ height: "", weight: "" });
  });

  it("shows saved inches and pounds in either unit", () => {
    expect(displayValues(70, 180, "imperial")).toMatchObject({ feet: "5", inches: "10", lb: "180" });
    expect(displayValues(70, 180, "metric")).toMatchObject({ cm: "178", kg: "82" });
  });

  it("ignores older saved heights that are not a number of inches", () => {
    expect(displayValues("regular", undefined, "imperial")).toMatchObject({ feet: "", inches: "", lb: "" });
  });

  it("labels weight in pounds for the fit profile", () => {
    expect(weightLabel(180)).toBe("180 lb");
    expect(weightLabel("")).toBeNull();
    expect(weightLabel(undefined)).toBeNull();
  });
});

describe("height and weight in the quiz", () => {
  it("is one question that asks for both, right before the size question", () => {
    expect(questions.height.title).toMatch(/height and weight/i);
    expect(questions.height.help).toMatch(/jacket and pant length/i);
    expect(questions.height.help).toMatch(/size estimate/i);
    for (const mode of ["buy", "rent"]) {
      const flow = getQuestionFlow({ mode, measurementKnowledge: "no" });
      expect(flow.filter((id) => id === "height")).toHaveLength(1);
      expect(flow.indexOf("measurementKnowledge")).toBe(flow.indexOf("height") + 1);
    }
  });

  it("keeps the length estimate working from saved inches", () => {
    expect(inferLength({ height: 66, weight: 150, measurements: { jacket: "40", waist: "34" } })).toBe("S");
    expect(inferLength({ height: 74, weight: 210, measurements: { waist: "34" } })).toBe("L");
  });

  it("lists weight next to height in the suit profile", () => {
    const rows = fitProfileRows({ answers: { height: 70, weight: 180 }, renting: false, size: null, fitName: null });
    expect(rows[0]).toEqual({ label: "Personal info", value: `5'10" · 180 lb` });
    const heightOnly = fitProfileRows({ answers: { height: 70 }, renting: false, size: null, fitName: null });
    expect(heightOnly[0].value).toBe(`5'10"`);
  });
});
