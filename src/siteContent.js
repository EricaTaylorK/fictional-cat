/** Fishwife — site copy & bundle catalog (single source for the React app). */

export const BUNDLE_BAGEL_TOTAL = 24;
export const BUNDLE_CREAM_PICKS = 2;

export const BAGEL_TYPES = [
  { id: "plain", name: "Plain", hint: "Malt gloss, tight crumb" },
  { id: "everything", name: "Everything", hint: "Seeds, salt, allium chorus" },
  { id: "salt-malt", name: "Salt & malt", hint: "Subtle sweetness, snap" },
  { id: "cinnamon", name: "Cinnamon raisin", hint: "Warm spice, plump fruit" },
  { id: "sesame", name: "Sesame", hint: "Toasted gold, nutty edge" },
  { id: "poppy", name: "Poppy", hint: "Blue-black crunch" },
  { id: "onion", name: "Onion", hint: "Slow-roast depth" },
  { id: "egg", name: "Egg", hint: "Golden, sandwich-ready" },
];

export const CREAM_FLAVORS = [
  { id: "scallion", name: "Scallion", note: "Whipped, bright" },
  { id: "smoked-salmon", name: "Smoked salmon", note: "Silky, pepper" },
  { id: "honey-walnut", name: "Honey walnut", note: "Sweet-savory" },
  { id: "plain-whip", name: "Plain whipped", note: "Butter-forward" },
  { id: "veggie", name: "Garden veggie", note: "Herb & crunch" },
  { id: "jalapeno", name: "Jalapeño cheddar", note: "Slow heat" },
];

export const MARQUEE_PHRASES = [
  "Kettle-boiled",
  "Stone-finished",
  "Bundle your dozen",
  "Two schmears included",
  "Pickup in minutes",
];

export const HERO_CHIPS = ["24-bagel tins", "Two schmears", "Third-wave shots", "Same-day pickup"];

export const CRAFT_PILLARS = [
  {
    num: "01",
    title: "Patience, then heat",
    body: "Overnight cold ferment, kettle dip, stone deck finish—no conveyor belt theatrics.",
  },
  {
    num: "02",
    title: "Ingredients with opinions",
    body: "Flour we can trace, butter we can taste, schmears whipped in small batches like they matter.",
  },
  {
    num: "03",
    title: "Hospitality, measured",
    body: "Fast enough for the 9:02, slow enough to still feel like breakfast. Dogs at the rail, strollers inside.",
  },
];

export const MENU_ITEMS = [
  {
    id: "bundle",
    title: "The 24 + 2 bundle",
    description: "Eight kettle rings to mix any way you like—twenty-four bagels total—plus two cream cheeses. Our central offering.",
    price: "from $72",
    tag: "Signature",
  },
  {
    id: "lox",
    title: "Smoked fish board",
    description: "Scottish salmon, capers, shaved onion, dill—stack it on any bagel from your tin.",
    price: "$22",
  },
  {
    id: "sandwich",
    title: "Hot honey egg",
    description: "Folded egg, aged cheddar, arugula, Mike’s-style hot honey on salt & malt.",
    price: "$12",
    tag: "Weekend",
  },
  {
    id: "coffee",
    title: "Dial-in espresso",
    description: "Single-origin rotation, 18g in / 36g out when the machine is humming—black or velvet foam.",
    price: "$3.75",
  },
];
