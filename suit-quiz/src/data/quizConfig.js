export const questions = {
  mode: {
    id: "mode",
    title: "Are you buying or renting?",
    help: "Buy a suit to keep and tailor, or rent a complete look for one event.",
    type: "single",
    options: [
      { value: "buy", label: "Buy a suit", detail: "Yours to keep, tailored to fit.", icon: "/icons/mw/shop.png" },
      { value: "rent", label: "Rent a look", detail: "Suit or tux, shirt, tie, and shoes for one event, starting at $99.99.", icon: "/icons/mw/suits-bundle.png" },
    ],
  },
  occasion: {
    id: "occasion",
    title: "What's the moment?",
    help: "We start here. The occasion tells us how formal to go, and how easy it is to misread the room.",
    type: "occasionPlus",
    rentHelp: "The occasion tells us whether a suit or a tuxedo fits the room.",
    rentOptions: [
      { value: "wedding", label: "A wedding", detail: "Groom, wedding party, or guest.", icon: "/icons/mw/wedding.png" },
      { value: "formal", label: "A black-tie or formal evening", detail: "Galas, formal dinners, and black-tie invitations.", icon: "/icons/mw/special-event.png" },
      { value: "prom", label: "Prom or homecoming", detail: "A night to stand out.", icon: "/icons/mw/school-event.png" },
      { value: "special", label: "Another special event", detail: "A quinceañera, anniversary, or celebration.", icon: "/icons/mw/quinceanera.png" },
    ],
    options: [
      { value: "wedding", label: "A wedding", detail: "Guest, wedding party, or groom. We'll match the room.", icon: "/icons/mw/wedding.png" },
      { value: "work", label: "Work or an interview", detail: "The office, a new job, or a professional event. Sharp enough to wear again.", icon: "/icons/mw/suits-bundle.png" },
      { value: "versatile", label: "A go-to suit for whatever comes up", detail: "Work, dinners, and everyday, when the dress code isn't clear.", icon: "/icons/mw/travel.png" },
      { value: "formal", label: "A black-tie or formal evening", detail: "Elevated evening dressing that still feels like you.", icon: "/icons/mw/special-event.png" },
      { value: "milestone", label: "A graduation, prom, or milestone", detail: "For the person being celebrated.", icon: "/icons/mw/school-event.png" },
      { value: "funeral", label: "A funeral or memorial", detail: "Respectful and quiet. Nothing that pulls focus.", icon: "/icons/mw/invitation.png" },
    ],
    wear: {
      title: "Will you wear it again?",
      help: "This helps us choose between a suit for one occasion and an all-purpose suit.",
      options: [
        { value: "one-event", label: "Mostly for this event", detail: "Every suit we show is built to last. We'll match this occasion closely." },
        { value: "rewear", label: "I want to wear it again", detail: "A classic you can trust past this event." },
        { value: "often", label: "I'll wear suits often", detail: "Built for repeat wear and easy tailoring." },
      ],
    },
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
    help: "Pick shades you like, shades to skip, or leave this blank.",
    type: "colors",
    options: [
      { value: "navy", label: "Navy" },
      { value: "blue", label: "Blue" },
      { value: "gray", label: "Gray" },
      { value: "black", label: "Black" },
      { value: "brown", label: "Brown" },
      { value: "tan", label: "Tan" },
      { value: "burgundy", label: "Burgundy" },
      { value: "green", label: "Green" },
      { value: "white", label: "White or ivory", modes: ["rent"] },
    ],
  },
  measurementKnowledge: {
    id: "measurementKnowledge",
    title: "Do you know your measurements?",
    help: "Either answer works. No jacket handy? Choose \"help me estimate\" and use your usual shirt and pants sizes.",
    type: "single",
    options: [
      { value: "yes", label: "Yes, I know my jacket size and waist", detail: "The number on the jacket tag and your pants waist are enough." },
      { value: "some", label: "I know one or two numbers", detail: "A jacket size, a chest, or a waist. Leave the rest blank." },
      { value: "no", label: "No, help me estimate", detail: "We'll use how your clothes usually fit. A lot of people start here." },
    ],
  },
  measurements: {
    id: "measurements",
    title: "Share what you already know",
    help: "Any number helps. Leave the rest blank, and we'll flag where a store measurement matters.",
    type: "measurements",
  },
  fitIssues: {
    id: "fitIssues",
    title: "Where do suits usually feel off?",
    help: "Select all that apply. Each answer changes the cut, the size, or the tailoring we start you with.",
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
  height: {
    id: "height",
    title: "About how tall are you?",
    help: "A range is enough. It puts jacket and pant proportions in the right neighborhood.",
    type: "single",
    options: [
      { value: "short", label: "Under 5′7″" },
      { value: "regular", label: "5′7″ to 6′0″" },
      { value: "tall", label: "6′1″ to 6′3″" },
      { value: "extra-tall", label: "6′4″ or taller" },
    ],
  },
  everydaySizes: {
    id: "everydaySizes",
    title: "What sizes do you usually buy?",
    help: "Your everyday shirt and jeans sizes are enough for us to work out your jacket and pants.",
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
    title: "Want tailoring? (shortening sleeves, hemming pants, shaping the jacket)",
    help: "A few adjustments are what make a suit feel like yours. Each option shows what it adds to the price.",
    type: "single",
    options: [
      { value: "bundle", label: "Include tailoring in my plan", detail: "Adds $55–$199, depending on the work." },
      { value: "consider", label: "I'm open to it", detail: "We'll point out what's worth adjusting, and what it adds." },
      { value: "skip", label: "Suit only for now", detail: "No tailoring added to the price." },
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
    return [...start, "measurements", ...end];
  }
  if (answers.measurementKnowledge === "no") {
    return [...start, "everydaySizes", "fitIssues", "height", ...end];
  }
  return start;
}

export function occasionOptions(question, answers) {
  return answers.mode === "rent" ? question.rentOptions : question.options;
}
