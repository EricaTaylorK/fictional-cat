export const questions = {
  occasion: {
    id: "occasion",
    title: "What are you dressing for?",
    help: "Select one. This sets the right level of formality.",
    type: "single",
    options: [
      { value: "wedding", label: "A wedding", detail: "Guest, wedding party, or groom" },
      { value: "funeral", label: "A funeral or memorial", detail: "Respectful and understated" },
      { value: "work", label: "Work or a professional event", detail: "Polished and repeatable" },
      { value: "interview", label: "An interview", detail: "Confident and dependable" },
      { value: "formal", label: "A formal celebration", detail: "Elevated evening dressing" },
      { value: "other", label: "Something else", detail: "A versatile place to start" },
    ],
  },
  feel: {
    id: "feel",
    title: "How should it feel on your body?",
    help: "Select one. No suit terminology needed.",
    type: "single",
    options: [
      { value: "close", label: "Close and sharp", detail: "A trim silhouette with less room" },
      { value: "balanced", label: "Polished, not tight", detail: "Shape without feeling restrictive" },
      { value: "roomy", label: "Comfortable with room", detail: "Ease through the chest, seat, and legs" },
    ],
  },
  measurementKnowledge: {
    id: "measurementKnowledge",
    title: "Do you know your suit measurements?",
    help: "Select one. An estimate is useful too.",
    type: "single",
    options: [
      { value: "yes", label: "Yes, I know them", detail: "I can enter jacket or chest and waist" },
      { value: "some", label: "I know some of them", detail: "I have at least one useful number" },
      { value: "no", label: "No, help me estimate", detail: "Use how my clothes usually fit" },
    ],
  },
  measurements: {
    id: "measurements",
    title: "Enter what you know",
    help: "These details improve size confidence. Leave unknown fields blank.",
    type: "measurements",
  },
  fitIssues: {
    id: "fitIssues",
    title: "Where do clothes usually fit wrong?",
    help: "Select all that apply.",
    type: "multi",
    options: [
      { value: "shoulders", label: "Shoulders or chest", detail: "Pulling, gaping, or too much room" },
      { value: "sleeves", label: "Sleeves", detail: "Usually too long or too short" },
      { value: "waist", label: "Waist or stomach", detail: "Jackets pull or pants gap" },
      { value: "seat", label: "Seat or thighs", detail: "Pants feel tight or too loose" },
      { value: "legs", label: "Pant length", detail: "Inseams rarely land correctly" },
      { value: "unsure", label: "I’m not sure", detail: "I want a safer starting point" },
      { value: "none", label: "Nothing in particular", detail: "Most standard sizes work for me" },
    ],
  },
  height: {
    id: "height",
    title: "What is your height range?",
    help: "Select one. This helps estimate jacket and pant proportions.",
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
    title: "Is this for one event or future wear too?",
    help: "Select one. This balances specificity and versatility.",
    type: "single",
    options: [
      { value: "one-event", label: "This event is the priority", detail: "Optimize for the moment" },
      { value: "rewear", label: "I want to wear it again", detail: "Favor a versatile long-term option" },
      { value: "often", label: "I’ll wear suits often", detail: "Prioritize durability and flexibility" },
    ],
  },
  tailoring: {
    id: "tailoring",
    title: "How do you want to handle tailoring?",
    help: "Select one. Most suits look their best with small adjustments.",
    type: "single",
    options: [
      { value: "bundle", label: "Include tailoring in my plan", detail: "Show the suit and estimated tailoring together" },
      { value: "consider", label: "I’m open to it", detail: "Explain what may be worth adjusting" },
      { value: "skip", label: "Suit only for now", detail: "Keep the recommendation focused on the garment" },
    ],
  },
  budget: {
    id: "budget",
    title: "What feels comfortable for the suit?",
    help: "Select one. We use budget after fit and occasion.",
    type: "single",
    options: [
      { value: "under-250", label: "Under $250" },
      { value: "250-400", label: "$250–$400" },
      { value: "400-600", label: "$400–$600" },
      { value: "over-600", label: "$600+" },
      { value: "flexible", label: "Flexible for the right fit" },
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
