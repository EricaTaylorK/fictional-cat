import { products, SWATCH_HEX } from "./products.js";
import { rentals } from "./rentals.js";

export const questions = {
  mode: {
    id: "mode",
    title: "Are you buying or renting?",
    help: "Buy a suit to keep, or rent a complete look for one event.",
    type: "single",
    options: [
      { value: "buy", label: "Buy a suit", detail: "Yours to keep.", icon: "/icons/mw/shop.png" },
      { value: "rent", label: "Rent a look", detail: "Suit or tux for one event.", icon: "/icons/mw/suits-bundle.png" },
    ],
  },
  occasion: {
    id: "occasion",
    title: "What's the occasion?",
    help: "Knowing the details will help us find you the perfect suit to meet the moment.",
    type: "occasionPlus",
    skippable: true,
    rentHelp: "Knowing the occasion tells us whether you need a suit or a tuxedo.",
    rentOptions: [
      { value: "wedding", label: "Wedding", detail: "For your big day, or theirs.", icon: "/icons/mw/wedding.png" },
      { value: "formal", label: "Black tie", detail: "Galas, formal dinners, and black-tie invitations.", icon: "/icons/mw/special-event.png" },
      { value: "prom", label: "Prom", detail: "For prom, homecoming, and being the life of the party.", icon: "/icons/mw/school-event.png" },
      { value: "special", label: "Special event", detail: "A quinceañera, anniversary, or other celebration.", icon: "/icons/mw/quinceanera.png" },
    ],
    options: [
      { value: "business", label: "Business", detail: "For daily office attire & those important meetings.", icon: "/icons/mw/suits-bundle.png" },
      { value: "wedding", label: "Wedding", detail: "For your big day or theirs, you want to look your best.", icon: "/icons/mw/wedding.png" },
      { value: "travel", label: "Travel", detail: "For long hour days when comfort matters most.", icon: "/icons/mw/travel.png" },
      { value: "prom", label: "Prom", detail: "For photos, dancing and being the life of the party.", icon: "/icons/mw/school-event.png" },
      { value: "mixed", label: "Mixed use", detail: "One versatile suit for a little bit of everything.", icon: "/icons/mw/special-event.png" },
    ],
  },
  feel: {
    id: "feel",
    title: "How do you like a suit to fit?",
    help: "The name in parentheses is the fit you'll see on the suit.",
    type: "single",
    options: [
      { value: "close", label: "Close and sharp (Slim fit)", detail: "A trimmer shape, with less room through the body.", icon: "/icons/mw/sharp.png" },
      { value: "balanced", label: "Polished, with room to move (Modern fit)", detail: "Shape through the shoulders, ease where you need it.", icon: "/icons/mw/balanced.png" },
      { value: "roomy", label: "Comfortable with room (Classic fit)", detail: "Ease through the chest, seat, and legs, without looking loose.", icon: "/icons/mw/relaxed.png" },
    ],
  },
  eventDate: {
    id: "eventDate",
    title: "When is the event?",
    help: "Your look is ready 3 days before, and it goes back the day after.",
    type: "date",
  },
  pieces: {
    id: "pieces",
    title: "What should the look include?",
    help: "The jacket and pants are always included. Add the pieces you need, or rent the full look.",
    type: "pieces",
  },
  colors: {
    id: "colors",
    title: "Any colors in mind?",
    help: "Pick a color, or leave it blank.",
    type: "colors",
    skippable: true,
    options: [
      { value: "navy", label: "Navy", colors: ["navy"] },
      { value: "blue", label: "Blue", colors: ["blue"] },
      { value: "gray", label: "Gray", colors: ["gray"] },
      { value: "black", label: "Black", colors: ["black"] },
      { value: "brownTan", label: "Brown and tan", colors: ["brown", "tan"] },
      { value: "burgundy", label: "Burgundy", colors: ["burgundy"] },
      { value: "green", label: "Green", colors: ["green"] },
      { value: "white", label: "White", colors: ["white"] },
    ],
  },
  measurementKnowledge: {
    id: "measurementKnowledge",
    title: "Do you know your measurements?",
    help: "Share the sizes you know. If you don't, we'll estimate from how your clothes usually fit.",
    type: "single",
    options: [
      { value: "some", label: "I know some of my sizes", detail: "Jacket, chest, waist, height, or any mix. Leave the rest blank." },
      { value: "no", label: "No, help me estimate", detail: "We'll use your shirt size, pants size, and height if you know them." },
    ],
  },
  measurements: {
    id: "measurements",
    title: "Share the sizes you know",
    help: "Fill in any you know and leave the rest. Jacket size is the number and letter on the tag, like 42R.",
    type: "measurements",
  },
  fitIssues: {
    id: "fitIssues",
    title: "Where do suits usually feel off?",
    help: "Select all that apply. Each answer changes the cut or the size we start you with.",
    type: "multi",
    options: [
      {
        value: "broadShoulders",
        icon: "/icons/mw/tight-shoulders.png",
        label: "Jackets pull across my shoulders or back",
        detail: "Tight when I reach forward or cross my arms",
      },
      {
        value: "athleticBuild",
        icon: "/icons/mw/athletic.png",
        label: "Jackets fit my chest, but pants gap at the waist",
        detail: "A broad chest with a trimmer waist",
        excludes: ["fullerMidsection"],
      },
      {
        value: "fullerMidsection",
        icon: "/icons/mw/tight-button.png",
        label: "Jackets pull at the button, or pants pinch at the waist",
        detail: "I need more room through the middle",
        excludes: ["athleticBuild"],
      },
      {
        value: "seatThighs",
        icon: "/icons/mw/baggy-pants.png",
        label: "Pants are tight through the seat or thighs",
        detail: "Snug when I sit, take stairs, or crouch",
      },
      {
        value: "runsLong",
        icon: "/icons/mw/sleeve.png",
        label: "Sleeves and jackets usually run long",
        detail: "Sleeves cover my shirt cuff, or the jacket covers my seat",
        excludes: ["runsShort"],
      },
      {
        value: "runsShort",
        icon: "/icons/mw/tight-sleeves.png",
        label: "Sleeves and jackets usually run short",
        detail: "My wrists show, or the jacket sits high",
        excludes: ["runsLong"],
      },
      { value: "none", label: "Standard sizes usually fit me", detail: "Nothing in particular comes up", exclusive: true, icon: "/icons/mw/straight.png" },
    ],
  },
  everydaySizes: {
    id: "everydaySizes",
    title: "What sizes do you usually buy?",
    help: "Fill in any you know. Shirt size, jeans waist, and height each help us estimate.",
    type: "sizes",
    groups: [
      {
        id: "shirt",
        label: "T-shirt or casual shirt",
        options: ["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((value) => ({ value, label: value })),
      },
      {
        id: "waist",
        label: "Jeans or pants waist",
        options: [28, 29, 30, 31, 32, 33, 34, 36, 38, 40, 42, 44, 46, 48].map((value) => ({ value: String(value), label: String(value) })),
      },
    ],
  },
  tailoring: {
    id: "tailoring",
    title: "Want to add tailoring?",
    help: "Optional. Most people decide in store. Nothing is added to the price unless you choose it.",
    type: "single",
    options: [
      { value: "skip", label: "Just the suit", detail: "You can add tailoring in store later." },
      { value: "consider", label: "Show me the options", detail: "We'll list what a hem, sleeves, and shaping cost." },
      { value: "bundle", label: "Include it in the price", detail: "Adds $55–$199, depending on the work." },
    ],
  },
  budget: {
    id: "budget",
    title: "What feels comfortable to spend?",
    help: "Fit and occasion come first. Budget narrows the field after that.",
    type: "single",
    options: [
      { value: "under-250", label: "Under $250" },
      { value: "250-400", label: "$250–$400" },
      { value: "400-600", label: "$400–$600" },
      { value: "over-600", label: "$600+" },
      { value: "flexible", label: "Flexible for the right fit", detail: "Worth it when the suit is right for the moment." },
    ],
  },
  rentalBudget: {
    id: "rentalBudget",
    title: "What feels comfortable for the rental?",
    help: "This covers the look and the pieces you picked. The $12 damage and handling fee is added at checkout.",
    type: "single",
    options: [
      { value: "under-150", label: "Under $150" },
      { value: "150-200", label: "$150–$200" },
      { value: "200-250", label: "$200–$250" },
      { value: "over-250", label: "$250+" },
      { value: "flexible", label: "Flexible for the right look" },
    ],
  },
};

export function getQuestionFlow(answers) {
  const renting = answers.mode === "rent";
  const start = renting
    ? ["mode", "occasion", "eventDate", "pieces", "feel", "colors", "measurementKnowledge"]
    : ["mode", "occasion", "feel", "colors", "measurementKnowledge"];
  const end = renting ? ["rentalBudget"] : ["tailoring", "budget"];
  if (answers.measurementKnowledge === "yes" || answers.measurementKnowledge === "some") {
    return [...start, "measurements", "fitIssues", ...end];
  }
  if (answers.measurementKnowledge === "no") {
    return [...start, "everydaySizes", "fitIssues", ...end];
  }
  return start;
}

export function occasionOptions(question, answers) {
  return answers.mode === "rent" ? question.rentOptions : question.options;
}

const BUY_OCCASION = {
  business: "work",
  travel: "versatile",
  prom: "milestone",
  mixed: "versatile",
};

export function resolvedOccasion(answers) {
  const value = answers.occasion;
  if (!value) return null;
  if (answers.mode === "rent") return value;
  return BUY_OCCASION[value] ?? value;
}

const LEGACY_COLOR_GROUPS = {
  darks: ["navy", "blue", "gray", "black"],
  warm: ["tan", "brown", "burgundy", "green"],
  light: ["white"],
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
  white: "White",
};

export function colorsIn(values) {
  const palettes = new Map([
    ...questions.colors.options.map((option) => [option.value, option.colors]),
    ...Object.entries(LEGACY_COLOR_GROUPS),
  ]);
  return [...new Set((Array.isArray(values) ? values : []).flatMap((value) => palettes.get(value) ?? [value]))];
}

function visibleCopy(option, colors) {
  if (colors.length === option.colors.length) return { label: option.label };
  if (colors.length === 1) return { label: COLOR_NAMES[colors[0]] ?? option.label };
  return { label: colors.map((key) => COLOR_NAMES[key] ?? key).join(" and ") };
}

function catalogColors(mode) {
  const items = mode === "rent" ? rentals : products.flatMap((product) => [product, ...(product.variants ?? [])]);
  return new Set(items.map((item) => item.colorKey));
}

export function colorThemes(mode) {
  const available = catalogColors(mode);
  return questions.colors.options
    .map((option) => {
      const colors = option.colors.filter((key) => available.has(key));
      return {
        ...option,
        ...visibleCopy(option, colors),
        colors,
        swatches: colors.map((key) => ({ key, hex: SWATCH_HEX[key] })),
      };
    })
    .filter((option) => option.colors.length > 0);
}
