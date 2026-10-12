export const questions = {
  occasion: {
    id: "occasion",
    title: "What's the moment?",
    help: "We start here. The occasion tells us how formal to go, and how easy it is to misread the room.",
    type: "single",
    options: [
      { value: "wedding", label: "A wedding", detail: "Guest, wedding party, or groom. We'll match the room." },
      { value: "funeral", label: "A funeral or memorial", detail: "Respectful and quiet. Nothing that pulls focus." },
      { value: "work", label: "Work or a professional event", detail: "Sharp enough to be taken seriously, easy to wear again." },
      { value: "interview", label: "An interview", detail: "Appropriate, confident, and ready for the room." },
      { value: "formal", label: "A formal celebration", detail: "Elevated evening dressing that still feels like you." },
      { value: "other", label: "Something else", detail: "A classic suit you can trust when the dress code is unclear." },
    ],
  },
  feel: {
    id: "feel",
    title: "How should it feel?",
    help: "Skip the suit jargon. Tell us the feeling you want once it's on.",
    type: "single",
    options: [
      { value: "close", label: "Close and sharp", detail: "A trimmer shape, with less room through the body." },
      { value: "balanced", label: "Polished, with room to move", detail: "Shape through the shoulders, ease where you need it." },
      { value: "roomy", label: "Comfortable with room", detail: "Ease through the chest, seat, and legs." },
    ],
  },
  measurementKnowledge: {
    id: "measurementKnowledge",
    title: "Do you know your measurements?",
    help: "Either answer works. If you're unsure, we'll estimate and show you where a fitting makes the difference.",
    type: "single",
    options: [
      { value: "yes", label: "Yes, I know them", detail: "Jacket, chest, or waist is enough to start." },
      { value: "some", label: "I know some of them", detail: "One useful number still helps." },
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
    title: "Where do clothes usually feel off?",
    help: "Select all that apply. This keeps us from starting you in a size that looks right on paper and feels wrong on you.",
    type: "multi",
    options: [
      { value: "shoulders", label: "Shoulders or chest", detail: "Pulling, gaping, or too much room" },
      { value: "sleeves", label: "Sleeves", detail: "Usually too long or too short" },
      { value: "waist", label: "Waist or stomach", detail: "Jackets pull or pants gap" },
      { value: "seat", label: "Seat or thighs", detail: "Pants feel tight or too loose" },
      { value: "legs", label: "Pant length", detail: "The hem rarely lands where it should" },
      { value: "unsure", label: "I'm not sure", detail: "I want a reliable place to start" },
      { value: "none", label: "Nothing in particular", detail: "Most standard sizes work for me" },
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
  wearIntent: {
    id: "wearIntent",
    title: "Is this for one moment, or more?",
    help: "Some suits are for the day. Others earn a place in the closet.",
    type: "single",
    options: [
      { value: "one-event", label: "This moment comes first", detail: "We'll match the occasion closely." },
      { value: "rewear", label: "I want to wear it again", detail: "A classic you can trust past this event." },
      { value: "often", label: "I'll wear suits often", detail: "Built for repeat wear and easy tailoring." },
    ],
  },
  tailoring: {
    id: "tailoring",
    title: "How far do you want to take the fit?",
    help: "A few adjustments are what make a suit feel like yours. You choose how far to go.",
    type: "single",
    options: [
      { value: "bundle", label: "Include tailoring in my plan", detail: "Suit and tailoring, shown together." },
      { value: "consider", label: "I'm open to it", detail: "We'll point out what's worth adjusting." },
      { value: "skip", label: "Suit only for now", detail: "The recommendation stays on the suit itself." },
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
};

const commonEnd = ["wearIntent", "tailoring", "budget"];

export function getQuestionFlow(answers) {
  const start = ["occasion", "feel", "measurementKnowledge"];
  if (answers.measurementKnowledge === "yes" || answers.measurementKnowledge === "some") {
    return [...start, "measurements", ...commonEnd];
  }
  if (answers.measurementKnowledge === "no") {
    return [...start, "fitIssues", "height", ...commonEnd];
  }
  return start;
}
