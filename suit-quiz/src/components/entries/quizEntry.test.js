import { describe, expect, it } from "vitest";
import { ENTRYPOINTS, quizHref } from "./quizEntry.js";

describe("quizHref", () => {
  it("points every surface at the quiz root", () => {
    expect(ENTRYPOINTS).toEqual([
      "home-hero",
      "nav-mega",
      "pgp-suits",
      "pgp-tux",
      "pgp-separates",
      "lp-fit",
      "lp-wedding",
      "lp-custom",
    ]);
    for (const entrypoint of ENTRYPOINTS) {
      expect(quizHref(entrypoint)).toBe(`/?entrypoint=${entrypoint}`);
    }
  });
});
