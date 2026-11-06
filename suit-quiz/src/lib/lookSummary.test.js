import { describe, expect, it } from "vitest";
import { lookTotals } from "./lookSummary.js";

const shirt = { type: "Shirt", price: 49.99, quantity: 1, added: true };
const tie = { type: "Tie", price: 39.99, quantity: 1, added: true };
const shoes = { type: "Shoes", price: 129.99, quantity: 1, added: true };

function totals(overrides = {}) {
  return lookTotals({
    suitPrice: 395,
    tailoringPrice: 0,
    items: [],
    hasJacketSize: true,
    hasPantsSize: true,
    ...overrides,
  });
}

describe("look totals", () => {
  it("earns $100 when the dress shirt and tie are both added", () => {
    const result = totals({
      tailoringPrice: 100,
      items: [shirt, tie, { ...shoes, added: false }],
    });
    expect(result.promoEarned).toBe(true);
    expect(result.promoName).toBe("Suit Bundle Offer");
    expect(result.discount).toBe(100);
    expect(result.subtotal).toBe(584.98);
    expect(result.total).toBe(484.98);
    expect(result.nudge).toBe("You're saving $100 with Suit Bundle Offer");
  });

  it("drops the offer when either required piece is removed and names what is missing", () => {
    const missingShirt = totals({ items: [{ ...shirt, added: false }, tie, shoes] });
    expect(missingShirt.promoEarned).toBe(false);
    expect(missingShirt.discount).toBe(0);
    expect(missingShirt.total).toBe(missingShirt.subtotal);
    expect(missingShirt.missingLabels).toEqual(["dress shirt"]);
    expect(missingShirt.nudge).toBe("Add a dress shirt to save $100");

    const missingTie = totals({ items: [shirt, { ...tie, added: false }] });
    expect(missingTie.promoEarned).toBe(false);
    expect(missingTie.discount).toBe(0);
    expect(missingTie.missingLabels).toEqual(["tie"]);
    expect(missingTie.nudge).toBe("Add a tie to save $100");
  });

  it("does not earn the offer from shoes alone", () => {
    const result = totals({ items: [{ ...shoes, quantity: 3 }] });
    expect(result.promoEarned).toBe(false);
    expect(result.discount).toBe(0);
    expect(result.missingLabels).toEqual(["dress shirt", "tie"]);
    expect(result.nudge).toBe("Add a dress shirt + tie to save $100");
    expect(result.subtotal).toBe(395 + 129.99);
  });

  it("blocks add to bag when the jacket or pants size is missing", () => {
    expect(totals({ hasJacketSize: false }).canAddToBag).toBe(false);
    expect(totals({ hasPantsSize: false }).canAddToBag).toBe(false);
    expect(totals({ hasJacketSize: false, hasPantsSize: false }).canAddToBag).toBe(false);
    expect(totals().canAddToBag).toBe(true);
  });

  it("counts jacket and pants as two and leaves tailoring out", () => {
    const result = totals({
      tailoringPrice: 55,
      items: [
        { ...shirt, quantity: 3 },
        { ...tie, added: false, quantity: 4 },
        { ...shoes, quantity: 2 },
      ],
    });
    expect(result.itemCount).toBe(4);
    expect(totals({ tailoringPrice: 0, items: [shirt] }).itemCount).toBe(3);
    expect(totals({ tailoringPrice: 0, items: [] }).itemCount).toBe(2);
    expect(totals({ tailoringPrice: 55, items: [] }).itemCount).toBe(2);
  });

  it("never lets the discount exceed the subtotal", () => {
    const result = lookTotals({
      suitPrice: 20,
      tailoringPrice: 0,
      items: [
        { type: "Shirt", price: 10, quantity: 5, added: true },
        { type: "Tie", price: 5, quantity: 4, added: true },
      ],
      hasJacketSize: true,
      hasPantsSize: true,
    });
    expect(result.subtotal).toBe(35);
    expect(result.discount).toBe(35);
    expect(result.total).toBe(0);
    expect(result.discount).toBeLessThanOrEqual(result.subtotal);
  });
});
