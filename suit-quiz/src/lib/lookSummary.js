const PROMO_NAME = "Suit Bundle Offer";
const PROMO_CENTS = 10000;

function cents(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

function dollars(value) {
  return value / 100;
}

function isType(item, type) {
  return String(item?.type || "").toLowerCase() === type;
}

export function lookTotals({
  suitPrice = 0,
  tailoringPrice = 0,
  items = [],
  hasJacketSize = false,
  hasPantsSize = false,
} = {}) {
  const added = (items ?? []).filter((item) => item?.added);
  const suitCents = Math.max(0, cents(suitPrice));
  const tailoringCents = cents(tailoringPrice) > 0 ? cents(tailoringPrice) : 0;
  const pieceCents = added.reduce((sum, item) => sum + Math.max(0, cents(item.price)), 0);
  const subtotalCents = suitCents + tailoringCents + pieceCents;
  const hasShirt = added.some((item) => isType(item, "shirt"));
  const hasTie = added.some((item) => isType(item, "tie"));
  const promoEarned = hasShirt && hasTie;
  const missingLabels = [
    hasShirt ? null : "dress shirt",
    hasTie ? null : "tie",
  ].filter(Boolean);
  const discountCents = promoEarned ? Math.min(PROMO_CENTS, subtotalCents) : 0;
  let nudge = "Add a dress shirt + tie to save $100";
  if (promoEarned) nudge = `You're saving $100 with ${PROMO_NAME}`;
  else if (missingLabels.length === 1 && missingLabels[0] === "dress shirt") nudge = "Add a dress shirt to save $100";
  else if (missingLabels.length === 1 && missingLabels[0] === "tie") nudge = "Add a tie to save $100";

  return {
    itemCount: 1 + (tailoringCents > 0 ? 1 : 0) + added.length,
    subtotal: dollars(subtotalCents),
    discount: dollars(discountCents),
    total: dollars(subtotalCents - discountCents),
    promoEarned,
    promoName: PROMO_NAME,
    missingLabels,
    nudge,
    canAddToBag: Boolean(hasJacketSize && hasPantsSize),
  };
}
