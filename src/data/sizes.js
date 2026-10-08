export const JACKET_LENGTHS = [
  { id: "Short", label: "Short", hint: "5'6\"–5'8\"" },
  { id: "Regular", label: "Regular", hint: "5'8\"–6'1\"" },
  { id: "Long", label: "Long", hint: "6'0\"–6'3\"" },
  { id: "Extra Long", label: "X Tall", hint: "6'4\"–6'6\"" },
];

export const CHEST_GROUPS = [
  { id: "Small", label: "Small", hint: "Small", min: 36, max: 38 },
  { id: "Medium", label: "Medium", hint: "Medium", min: 40, max: 42 },
  { id: "Large", label: "Large", hint: "Large", min: 44, max: 46 },
  { id: "X Large", label: "X Large", hint: "X Large", min: 48, max: Infinity },
];

export const PANT_LENGTH_GROUPS = [
  { id: "Short", label: "Short", hint: "Under 5'7\"", inseams: [29] },
  { id: "Regular", label: "Regular", hint: "5'7\"–6'0\"", inseams: [30, 32] },
  { id: "Long", label: "Long", hint: "6'0\"–6'2\"", inseams: [34] },
  { id: "X Tall", label: "X Tall", hint: "6'2\"+", inseams: [36] },
];

export const WAIST_GROUPS = [
  { id: "Small", label: "Small", hint: "Small", min: 28, max: 30 },
  { id: "Medium", label: "Medium", hint: "Medium", min: 31, max: 34 },
  { id: "Large", label: "Large", hint: "Large", min: 35, max: 38 },
  { id: "X Large", label: "X Large", hint: "X Large", min: 39, max: Infinity },
];

const LENGTH_IDS = JACKET_LENGTHS.map((item) => item.id);
const INSEAMS = PANT_LENGTH_GROUPS.flatMap((group) => group.inseams);

export function jacketSizeId(chest, length) {
  return `${chest} ${length}`;
}

export function pantSizeId(waist, inseam) {
  return `${waist}W x ${inseam}L`;
}

export function parseSizeId(id) {
  const jacket = id.match(/^(\d+) (Short|Regular|Long|Extra Long)$/);
  if (jacket) return { kind: "jacket", chest: jacket[1], length: jacket[2] };
  const pant = id.match(/^(\d+)W x (\d+)L$/);
  if (pant) return { kind: "pant", waist: pant[1], inseam: pant[2] };
  const waistOnly = id.match(/^(\d+)$/);
  if (waistOnly) return { kind: "pant", waist: waistOnly[1], inseam: "" };
  return null;
}

function seedFromId(id) {
  return [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function expandSuitSizes(chests, productId) {
  const seed = seedFromId(productId);
  const ids = [];
  chests.forEach((chest, index) => {
    const first = LENGTH_IDS[(seed + index) % LENGTH_IDS.length];
    const second = LENGTH_IDS[(seed + index + 2) % LENGTH_IDS.length];
    ids.push(jacketSizeId(chest, first), jacketSizeId(chest, second));
    const waists = [Number(chest) - 8, Number(chest) - 4].filter(
      (waist) => waist >= 28 && waist <= 44
    );
    const inseams = [
      INSEAMS[seed % INSEAMS.length],
      INSEAMS[(seed + 2) % INSEAMS.length],
    ];
    for (const waist of waists) {
      for (const inseam of inseams) ids.push(pantSizeId(waist, inseam));
    }
  });
  return [...new Set(ids)];
}
