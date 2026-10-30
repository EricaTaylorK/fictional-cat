import { products, SWATCH_HEX } from "./products.js";
import { rentals } from "./rentals.js";

export const questions = {
  mode: {
    id: "mode",
    title: "Are you buying or renting?",
    help: "Buying is a suit you keep. Renting is a full look for one event.",
    type: "single",
    options: [
      { value: "buy", label: "Buy a suit", detail: "Yours to keep.", icon: "/icons/mw/shop.png" },
      { value: "rent", label: "Rent a look", detail: "Suit or tux for one event.", icon: "/icons/mw/suits-bundle.png" },
    ],
  },
  occasion: {
    id: "occasion",
    title: "What's the occasion?",
    help: "The event is why you're shopping. We'll use it so the suit looks right for the room, not overdone. Every option is a suit you can keep wearing.",
    type: "occasionPlus",
    skippable: true,
    rentHelp: "This tells us whether you need a suit or a tuxedo.",
    rentOptions: [
      { value: "wedding", label: "Wedding", detail: "Your wedding, or someone else's.", icon: "/icons/mw/wedding.png" },
      { value: "formal", label: "Black tie", detail: "Galas, formal dinners, and black-tie invitations.", icon: "/icons/mw/special-event.png" },
      { value: "prom", label: "Prom", detail: "For you, or for someone you're taking. Prom, homecoming, or a school formal.", icon: "/icons/mw/school-event.png" },
      { value: "special", label: "Special event", detail: "A quinceañera, anniversary, or other celebration.", icon: "/icons/mw/quinceanera.png" },
    ],
    options: [
      { value: "business", label: "Work", detail: "The office, and the meetings that matter.", icon: "/icons/mw/suits-bundle.png" },
      { value: "wedding", label: "Wedding", detail: "Your wedding, or someone else's.", icon: "/icons/mw/wedding.png" },
      { value: "funeral", label: "Funeral", detail: "A funeral or memorial. Quiet and appropriate.", icon: "/icons/mw/invitation.png" },
      { value: "prom", label: "Prom", detail: "For you, or for someone you're taking. Prom, homecoming, or a school formal.", icon: "/icons/mw/school-event.png" },
      { value: "mixed", label: "More than one event", detail: "Work, a wedding, and other events.", icon: "/icons/mw/special-event.png" },
    ],
  },
  feel: {
    id: "feel",
    title: "How do you like a suit to fit?",
    help: "This is the cut, not the fabric. The name in parentheses is the fit on the suit, so you can match it on the product page.",
    type: "single",
    options: [
      { value: "close", label: "Close and sharp (Slim fit)", detail: "A trimmer shape, with less room through the body.", icon: "/icons/mw/sharp.png" },
      { value: "balanced", label: "Polished, with room to move (Modern fit)", detail: "Shaped at the shoulder, with room through the middle.", icon: "/icons/mw/balanced.png" },
      { value: "roomy", label: "Comfortable with room (Classic fit)", detail: "Room through the chest, seat, and legs, without looking loose.", icon: "/icons/mw/relaxed.png" },
    ],
  },
  eventDate: {
    id: "eventDate",
    title: "When is the event?",
    help: "The look is ready 3 days before the event and goes back the day after.",
    type: "date",
  },
  pieces: {
    id: "pieces",
    title: "What should the look include?",
    help: "A 2-piece is the jacket and pants. A 6-piece and a 9-piece add the shirt, shoes, and the rest.",
    type: "pieces",
  },
  colors: {
    id: "colors",
    title: "Any colors in mind?",
    help: "Pick any you'd wear. Skip this if you're open.",
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
    title: "Do you know your suit size?",
    help: "No jacket handy? Choose 'help me estimate' and use your usual shirt and pants sizes. You don't need exact numbers.",
    type: "single",
    options: [
      { value: "some", label: "I know some of my sizes", detail: "Jacket or pant size. Leave either one blank." },
      { value: "no", label: "No, help me estimate", detail: "We'll use your shirt size and jeans waist." },
    ],
  },
  measurements: {
    id: "measurements",
    title: "Share the sizes you know",
    help: "Jacket and pant size, if you know them. Use 'I don't know this' for either one. Short, Regular, or Long comes from your height on the next step.",
    type: "measurements",
  },
  fitIssues: {
    id: "fitIssues",
    title: "Where do jackets usually feel tight or long?",
    help: "Choose any that apply, or skip this if they usually feel fine. We'll use it to adjust the cut or the starting size.",
    type: "multi",
    skippable: true,
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
        label: "Jackets pull at the button, or pants pinch at the waist",
        detail: "I need more room through the middle",
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
    ],
  },
  pantsFit: {
    id: "pantsFit",
    title: "Where do pants usually feel tight or loose?",
    help: "Choose any that apply, or skip this if they usually feel fine. We'll use it to adjust the cut or the starting size.",
    type: "multi",
    skippable: true,
    options: [
      {
        value: "athleticBuild",
        icon: "/icons/mw/athletic.png",
        label: "Jackets fit my chest, but pants gap at the waist",
        detail: "A broad chest with a trimmer waist",
      },
      {
        value: "seatThighs",
        icon: "/icons/mw/baggy-pants.png",
        label: "Pants are tight through the seat or thighs",
        detail: "Snug when I sit, take stairs, or crouch",
      },
    ],
  },
  everydaySizes: {
    id: "everydaySizes",
    title: "What sizes do you usually buy?",
    help: "Fill in any you know. A shirt size estimates the jacket, and a jeans waist estimates the pants.",
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
  height: {
    id: "height",
    title: "How tall are you?",
    help: "We use height for the length. Under 5'7\" starts at Short, over 6'0\" at Long, and the heights in between at Regular.",
    type: "height",
    skippable: true,
  },
  tailoring: {
    id: "tailoring",
    title: "Want this suit tailored?",
    help: "This means hemming the pants or shortening the sleeves, not a shirt or tie. We'll suggest it from your size and fit, and you'll see the price before checkout. You can take it off then.",
    type: "single",
    options: [
      { value: "skip", label: "No, just the suit" },
      { value: "consider", label: "Tell me what you'd suggest" },
    ],
  },
  budget: {
    id: "budget",
    title: "What do you want to spend?",
    help: "This is the suit. Tailoring, if you add it, is separate, and you can remove it before checkout. We'll show this range first.",
    type: "single",
    options: [
      { value: "under-250", label: "Under $250" },
      { value: "250-400", label: "$250–$400" },
      { value: "400-600", label: "$400–$600" },
      { value: "over-600", label: "$600+" },
      { value: "flexible", label: "Flexible for the right fit", detail: "I'm willing to spend more if the suit fits." },
    ],
  },
};

export function getQuestionFlow(answers) {
  const renting = answers.mode === "rent";
  const start = renting
    ? ["mode", "occasion", "eventDate", "pieces", "feel", "colors", "measurementKnowledge"]
    : ["mode", "occasion", "feel", "colors", "measurementKnowledge"];
  const end = renting ? [] : ["tailoring", "budget"];
  const unknown = answers.unknownSizes ?? {};
  const estimate = unknown.chest || unknown.waist ? ["everydaySizes"] : [];
  if (answers.measurementKnowledge === "yes" || answers.measurementKnowledge === "some") {
    return [...start, "measurements", "height", ...estimate, "fitIssues", "pantsFit", ...end];
  }
  if (answers.measurementKnowledge === "no") {
    return [...start, "everydaySizes", "height", "fitIssues", "pantsFit", ...end];
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
