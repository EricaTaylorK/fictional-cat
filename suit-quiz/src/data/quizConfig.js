import { products, SWATCH_HEX } from "./products.js";
import { rentals } from "./rentals.js";

// Stand-in for answer cards that do not have a finished icon yet.
export const PLACEHOLDER_ICON = "/icons/mw/placeholder-hammer.svg";

export const questions = {
  mode: {
    id: "mode",
    title: "Are you buying or renting?",
    help: "Not sure? Think about how many times you'll wear it.",
    type: "single",
    options: [
      { value: "buy", label: "Buy a suit", detail: "Yours to keep and wear again.", icon: "/icons/mw/shop.png" },
      { value: "rent", label: "Rent a suit or tux", detail: "A suit or tux for one event.", icon: "/icons/mw/suits-bundle.png" },
    ],
  },
  occasion: {
    id: "occasion",
    title: "What's the occasion?",
    help: "Pick one. The event tells us how formal the suit should be.",
    type: "occasionPlus",
    skippable: true,
    rentHelp: "Pick one. The event helps us decide between a suit and a tux.",
    rentOptions: [
      { value: "wedding", label: "Wedding", detail: "Getting married, or going as a guest.", icon: "/icons/mw/wedding.png" },
      { value: "formal", label: "Black tie", detail: "Galas, formal dinners, and any invite that says black tie.", icon: "/icons/mw/special-event.png" },
      { value: "prom", label: "Prom", detail: "For you, or a prom-goer you're shopping for.", icon: "/icons/mw/school-event.png" },
      { value: "special", label: "Special event", detail: "A quinceañera, anniversary, or other celebration.", icon: "/icons/mw/quinceanera.png" },
    ],
    options: [
      { value: "business", label: "Work", detail: "Office days, big meetings, and interviews.", icon: "/icons/mw/suits-bundle.png" },
      { value: "wedding", label: "Wedding", detail: "Getting married, or going as a guest.", icon: "/icons/mw/wedding.png" },
      { value: "funeral", label: "Funeral", detail: "A funeral or memorial service.", icon: "/icons/mw/invitation.png" },
      { value: "prom", label: "Prom", detail: "For you, or a prom-goer you're shopping for.", icon: "/icons/mw/school-event.png" },
      { value: "mixed", label: "A bit of everything", detail: "One suit for work, weddings, and whatever comes up.", icon: "/icons/mw/special-event.png" },
    ],
  },
  feel: {
    id: "feel",
    title: "How do you like a suit to fit?",
    help: "Pick the one that sounds most like you. The fit name is in parentheses.",
    type: "single",
    skippable: true,
    options: [
      { value: "skinny", label: "As close as it gets (Skinny fit)", detail: "The sharpest, most tapered cut, with the least room through the body and legs.", icon: "/icons/mw/sharp.png" },
      { value: "close", label: "Close and sharp (Slim fit)", detail: "A trim shape that follows your frame, tapered through the sleeves and legs.", icon: "/icons/mw/sharp.png" },
      { value: "balanced", label: "Polished, with room to move (Modern fit)", detail: "A balanced cut with a little tapering and room through the body.", icon: "/icons/mw/balanced.png" },
      { value: "roomy", label: "Comfortable with room (Classic fit)", detail: "Room through the chest, seat, and legs, without looking loose.", icon: "/icons/mw/relaxed.png" },
      { value: "executive", label: "Most room for comfort (Executive fit)", detail: "The roomiest cut, with extra room through the midsection and legs.", icon: "/icons/mw/relaxed.png" },
    ],
  },
  eventDate: {
    id: "eventDate",
    title: "When is the event?",
    help: "Your look is ready 3 days before the event and due back the day after.",
    type: "date",
  },
  pieces: {
    id: "pieces",
    title: "What should the look include?",
    help: "Pick one. The more pieces, the less you have to bring.",
    type: "pieces",
    skippable: true,
  },
  colors: {
    id: "colors",
    title: "Any colors in mind?",
    help: "Pick all you like and we'll show those first. Open to anything? Skip this one.",
    type: "colors",
    skippable: true,
    // Each card stores its own value in colors.prefer and expands to these catalog colors.
    options: [
      { value: "classics", label: "Classics", detail: "Navy, gray, and black.", colors: ["navy", "gray", "black"] },
      { value: "earthTones", label: "Earth tones", detail: "Brown, tan, and sage.", colors: ["brown", "tan", "green"] },
      { value: "richBold", label: "Rich and bold", detail: "Burgundy and royal blue.", colors: ["burgundy", "blue"] },
      { value: "lightSoft", label: "Light and soft", detail: "White, cream, or pink.", colors: ["white", "pink"], displayColors: ["white", "cream", "pink"] },
    ],
  },
  measurementKnowledge: {
    id: "measurementKnowledge",
    title: "Do you know your suit size?",
    help: "Jacket size, pant size, or both. Even one helps.",
    type: "single",
    options: [
      { value: "some", label: "I know my size", detail: "Share your jacket size, pant size, or both.", icon: PLACEHOLDER_ICON },
      { value: "no", label: "Help me estimate", detail: "We'll work it out from your usual shirt and jeans sizes.", icon: PLACEHOLDER_ICON },
    ],
  },
  measurements: {
    id: "measurements",
    title: "What sizes do you know?",
    help: "Pick your jacket size, pant size, or both. Not sure? It's on the tag inside a suit jacket or pants you own. Just use the number.",
    type: "measurements",
  },
  fitIssues: {
    id: "fitIssues",
    title: "Where do jackets feel off?",
    help: "Pick any that apply. We'll use your answers to suggest a size and any tailoring.",
    type: "multi",
    skippable: true,
    skipLabel: "Jackets usually feel fine",
    options: [
      {
        value: "broadShoulders",
        icon: "/icons/mw/tight-shoulders.png",
        label: "Jackets pull across my shoulders or back",
        detail: "Tight when I reach forward or cross my arms",
      },
      {
        value: "fullerMidsection",
        icon: "/icons/mw/tight-button.png",
        label: "Jackets pull at the button",
        detail: "I need more room through the middle",
      },
      {
        value: "runsLong",
        icon: "/icons/mw/sleeve.png",
        label: "Sleeves and jackets usually run long",
        detail: "Sleeves cover my shirt cuff, or the jacket hangs low",
        excludes: ["runsShort"],
      },
      {
        value: "runsShort",
        icon: "/icons/mw/tight-sleeves.png",
        label: "Sleeves and jackets usually run short",
        detail: "My wrists show, or the jacket stops too high",
        excludes: ["runsLong"],
      },
    ],
  },
  pantsFit: {
    id: "pantsFit",
    title: "Where do pants feel off?",
    help: "Pick any that apply. We'll use your answers to suggest a size and any tailoring.",
    type: "multi",
    skippable: true,
    skipLabel: "Pants usually feel fine",
    options: [
      {
        value: "athleticBuild",
        icon: "/icons/mw/athletic.png",
        label: "Pants gap at the waist",
        detail: "My jacket fits my chest, but my waist is trimmer",
      },
      {
        value: "seatThighs",
        icon: "/icons/mw/baggy-pants.png",
        label: "Pants are tight through the hips or thighs",
        detail: "Snug when I sit, take stairs, or crouch",
      },
      {
        value: "waistPinch",
        icon: "/icons/mw/tight-waist.png",
        label: "Pants pinch at the waist",
        detail: "The waistband feels tight, even when the jacket is fine",
      },
      {
        value: "pantsLong",
        icon: "/icons/mw/hem.png",
        label: "Pants usually run long",
        detail: "The hem covers my shoes or stacks on the floor",
        excludes: ["pantsShort"],
      },
      {
        value: "pantsShort",
        icon: "/icons/mw/tailor-leg-hem.png",
        label: "Pants usually run short",
        detail: "The hem stops above my shoes",
        excludes: ["pantsLong"],
      },
    ],
  },
  everydaySizes: {
    id: "everydaySizes",
    title: "What sizes do you usually buy?",
    help: "We'll use these to estimate your jacket and pant size.",
    type: "sizes",
    groups: [
      {
        id: "shirt",
        label: "T-shirt or casual shirt size",
        options: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map((value) => ({ value, label: value })),
      },
      {
        id: "waist",
        label: "Jeans or pants waist size",
        options: [28, 29, 30, 31, 32, 33, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60].map((value) => ({ value: String(value), label: String(value) })),
      },
    ],
  },
  height: {
    id: "height",
    title: "What are your height and weight?",
    help: "We ask so we can pick the right jacket and pant length and give you a better size estimate. A close guess is fine.",
    type: "height",
    skippable: true,
  },
  tailoring: {
    id: "tailoring",
    title: "Want your suit tailored?",
    help: "Most suits look sharpest with a few small adjustments. We'll suggest what yours needs, based on your answers.",
    note: "You'll see the price before checkout, and you can remove tailoring anytime.",
    type: "single",
    options: [
      { value: "consider", label: "Yes, suggest tailoring", icon: PLACEHOLDER_ICON },
      { value: "skip", label: "No, just the suit", icon: PLACEHOLDER_ICON },
    ],
  },
  budget: {
    id: "budget",
    title: "What do you want to spend?",
    help: "We ask so we can show suits in this range first.",
    type: "single",
    options: [
      { value: "under-250", label: "Under $250", icon: PLACEHOLDER_ICON },
      { value: "250-400", label: "$250–$400", icon: PLACEHOLDER_ICON },
      { value: "400-600", label: "$400–$600", icon: PLACEHOLDER_ICON },
      { value: "over-600", label: "$600+", icon: PLACEHOLDER_ICON },
      { value: "flexible", label: "Flexible for the right fit", icon: PLACEHOLDER_ICON },
    ],
  },
};

export function getQuestionFlow(answers) {
  const renting = answers.mode === "rent";
  const start = renting
    ? ["mode", "occasion", "eventDate", "pieces", "feel", "colors", "height", "measurementKnowledge"]
    : ["mode", "occasion", "feel", "colors", "height", "measurementKnowledge"];
  const end = renting ? [] : ["tailoring", "budget"];
  const unknown = answers.unknownSizes ?? {};
  const estimate = unknown.chest || unknown.waist ? ["everydaySizes"] : [];
  if (answers.measurementKnowledge === "yes" || answers.measurementKnowledge === "some") {
    return [...start, "measurements", ...estimate, "fitIssues", "pantsFit", ...end];
  }
  if (answers.measurementKnowledge === "no") {
    return [...start, "everydaySizes", "fitIssues", "pantsFit", ...end];
  }
  return start;
}

export function occasionOptions(question, answers) {
  return answers.mode === "rent" ? question.rentOptions : question.options;
}

const BUY_OCCASION = {
  business: "work",
  prom: "milestone",
  mixed: "versatile",
};

export function resolvedOccasion(answers) {
  const value = answers.occasion;
  if (!value) return null;
  if (answers.mode === "rent") return value;
  return BUY_OCCASION[value] ?? value;
}

// Older saved answers used per-color values and groups. Keep them working.
const LEGACY_COLOR_GROUPS = {
  darks: ["navy", "blue", "gray", "black"],
  warm: ["tan", "brown", "burgundy", "green"],
  light: ["white"],
  navy: ["navy"],
  gray: ["gray"],
  black: ["black"],
  brownTan: ["brown", "tan"],
  burgundy: ["burgundy"],
  green: ["green"],
  blue: ["blue"],
  pink: ["pink"],
  white: ["white"],
};

const COLOR_NAMES = {
  navy: "Navy",
  blue: "Blue",
  gray: "Gray",
  black: "Black",
  brown: "Brown",
  tan: "Tan",
  burgundy: "Burgundy",
  green: "Green",
  pink: "Pink",
  white: "White",
};

export function colorsIn(values) {
  const palettes = new Map([
    ...questions.colors.options.map((option) => [option.value, option.colors]),
    ...Object.entries(LEGACY_COLOR_GROUPS),
  ]);
  return [...new Set((Array.isArray(values) ? values : []).flatMap((value) => palettes.get(value) ?? [value]))];
}

// The card keeps its own label even when the lane only carries one of its colors.
function visibleCopy(option) {
  return { label: option.label };
}

function catalogColors(mode) {
  const items = mode === "rent" ? rentals : products.flatMap((product) => [product, ...(product.variants ?? [])]);
  return new Set(items.map((item) => item.colorKey));
}

export function colorThemes(mode) {
  const available = catalogColors(mode);
  return questions.colors.options
    .map((option) => {
      const colors = option.colors.filter((key) => available.has(key) || key === "pink");
      const swatchKeys = option.displayColors ?? colors;
      return {
        ...option,
        ...visibleCopy(option),
        colors,
        swatches: swatchKeys.map((key) => ({ key, hex: SWATCH_HEX[key] })),
      };
    })
    .filter((option) => option.colors.length > 0);
}
