// Size values from the Men's Wearhouse suits listing, October 2026.
// A chest is not sold in every length. 36 stops at Long. Extra Long starts at 42.

export const MW_SUIT_SIZES = [
  "34 Short",
  "34 Regular",
  "35 Short",
  "35 Regular",
  "36 Short",
  "36 Regular",
  "36 Long",
  "37 Short",
  "37 Regular",
  "37 Long",
  "38 Short",
  "38 Regular",
  "38 Long",
  "39 Short",
  "39 Regular",
  "39 Long",
  "40 Short",
  "40 Regular",
  "40 Long",
  "41 Regular",
  "42 Short",
  "42 Regular",
  "42 Long",
  "42 Extra Long",
  "43 Regular",
  "43 Long",
  "44 Short",
  "44 Regular",
  "44 Long",
  "44 Extra Long",
  "45 Regular",
  "46 Short",
  "46 Regular",
  "46 Long",
  "46 Extra Long",
  "47 Regular",
  "48 Short",
  "48 Regular",
  "48 Long",
  "48 Extra Long",
  "50 Short",
  "50 Regular",
  "50 Long",
  "50 Extra Long",
  "52 Short",
  "52 Regular",
  "52 Long",
  "52 Extra Long",
  "54 Regular",
  "54 Long",
  "54 Extra Long",
  "56 Regular",
  "56 Long",
  "58 Regular",
  "58 Long",
  "60 Regular",
  "60 Long",
];

export const MW_PANT_SIZES = [
  "28W x 29L",
  "28W x 30L",
  "28W x 32L",
  "28W x 34L",
  "29W x 29L",
  "29W x 30L",
  "29W x 32L",
  "29W x 34L",
  "30W x 29L",
  "30W x 30L",
  "30W x 32L",
  "30W x 34L",
  "31W x 30L",
  "31W x 32L",
  "31W x 34L",
  "32",
  "32W x 29L",
  "32W x 30L",
  "32W x 32L",
  "32W x 34L",
  "33",
  "33W x 30L",
  "33W x 32L",
  "33W x 34L",
  "34",
  "34W x 29L",
  "34W x 30L",
  "34W x 32L",
  "34W x 34L",
  "34W x 36L",
  "35W x 30L",
  "35W x 32L",
  "35W x 34L",
  "36",
  "36W x 29L",
  "36W x 30L",
  "36W x 32L",
  "36W x 34L",
  "36W x 36L",
  "38",
  "38W x 29L",
  "38W x 30L",
  "38W x 32L",
  "38W x 34L",
  "38W x 36L",
  "39W x 30L",
  "39W x 32L",
  "39W x 34L",
  "40",
  "40W x 29L",
  "40W x 30L",
  "40W x 32L",
  "40W x 34L",
  "40W x 36L",
  "42",
  "42W x 29L",
  "42W x 30L",
  "42W x 32L",
  "42W x 34L",
  "42W x 36L",
  "44",
  "44W x 29L",
  "44W x 30L",
  "44W x 32L",
  "44W x 34L",
  "44W x 36L",
  "46",
  "46W x 30L",
  "46W x 32L",
  "46W x 34L",
  "48W x 30L",
  "48W x 32L",
  "48W x 34L",
  "50W x 30L",
  "50W x 32L",
  "50W x 34L",
  "52W x 30L",
  "52W x 32L",
  "52W x 34L",
  "54W x 30L",
  "54W x 32L",
  "54W x 34L",
  "56W x 30L",
  "56W x 32L",
  "56W x 34L",
  "58W x 32L",
];

const SUIT_SET = new Set(MW_SUIT_SIZES);
const PANT_SET = new Set(MW_PANT_SIZES);

export function sizesForChests(chests) {
  const numbers = chests.map(Number).filter((value) => Number.isFinite(value));
  const jacketChests = new Set();
  const waists = new Set();
  for (const chest of numbers) {
    jacketChests.add(chest - 1);
    jacketChests.add(chest);
    jacketChests.add(chest + 1);
    waists.add(chest - 8);
    waists.add(chest - 6);
    waists.add(chest - 4);
  }
  const jackets = MW_SUIT_SIZES.filter((id) => jacketChests.has(Number(id.split(" ")[0])));
  const waistValues = [...waists];
  const minWaist = waistValues.length ? Math.min(...waistValues) : Infinity;
  const maxWaist = waistValues.length ? Math.max(...waistValues) : -Infinity;
  const pants = MW_PANT_SIZES.filter((id) => {
    const waist = pantWaist(id);
    return waist >= minWaist && waist <= maxWaist;
  });
  return [...jackets, ...pants].filter((id, index, list) => list.indexOf(id) === index && (SUIT_SET.has(id) || PANT_SET.has(id)));
}

function pantWaist(id) {
  const measured = id.match(/^(\d+)W/);
  if (measured) return Number(measured[1]);
  const bare = id.match(/^(\d+)$/);
  return bare ? Number(bare[1]) : NaN;
}
