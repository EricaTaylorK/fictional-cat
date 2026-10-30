import { describe, expect, it } from "vitest";
import { LOOK_PAIRINGS, PAIRING_HEX, SUIT_PAIRINGS, lookForColor } from "./products.js";

describe("look pairings", () => {
  it("gives every suit color a priced shirt, tie, and shoes", () => {
    const ids = [];
    for (const colorKey of Object.keys(SUIT_PAIRINGS)) {
      const look = lookForColor(colorKey, "wedding");
      expect(look.items.map((item) => item.type)).toEqual(["Shirt", "Tie", "Shoes"]);
      expect(SUIT_PAIRINGS[colorKey].shirts).toContain(look.items[0].colorKey);
      expect(SUIT_PAIRINGS[colorKey].ties).toContain(look.items[1].colorKey);
      for (const item of look.items) {
        expect(item.price).toBeGreaterThan(0);
        expect(item.name).toBeTruthy();
        expect(PAIRING_HEX[item.colorKey]).toBeTruthy();
        ids.push(item.id);
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(LOOK_PAIRINGS).sort()).toEqual(Object.keys(SUIT_PAIRINGS).sort());
  });

  it("marks a black suit as the black-tie pick only for a formal evening", () => {
    expect(lookForColor("black", "formal").note).toContain("black-tie");
    expect(lookForColor("navy", "formal").note).not.toContain("black-tie");
    expect(lookForColor("black", "wedding").note).not.toContain("black-tie");
  });
});
