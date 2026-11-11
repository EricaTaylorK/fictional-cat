export const reassurance = {
  visible:
    "Free shipping over $99. Free, easy returns to any store or online. Pick up or ship to your store.",
  alternates: {
    b: "Shop with confidence: free shipping over $99, free returns anywhere, and pickup or ship to store.",
    c: "Pick up or ship to your store · Free shipping $99+ · Free, easy returns",
  },
};

export const returning = {
  headline: "Pick up where you left off",
  subhead: "The styles you were looking at, right where you left them.",
  link: "View all recently viewed",
  items: ["Recently viewed", "Recently viewed", "Recently viewed"],
};

export const brands = [
  { name: "Calvin Klein", mark: "ck", descriptor: "Clean, modern essentials", cta: "Shop Calvin Klein", image: "/editorial/white-shirt-walnut.jpg", focus: "50% 28%", scrim: 0.62, bar: "#4a3122" },
  { name: "Kenneth Cole", mark: "kc", descriptor: "Smart, comfortable suiting", cta: "Shop Kenneth Cole", image: "/editorial/charcoal-velvet.jpg", focus: "58% 36%", scrim: 0.32, bar: "#1a2438" },
  { name: "Cole Haan", mark: "ch", descriptor: "Shoes that finish the look", cta: "Shop Cole Haan", image: "/editorial/blue-sling-cream.jpg", focus: "30% 90%", scrim: 0.55, view: "inset(74% 42% 2% 0%)", bar: "#7a3b32" },
  { name: "Tommy Hilfiger", mark: "th", descriptor: "Classic American style", cta: "Shop Tommy Hilfiger", image: "/editorial/navy-check-holiday.jpg", focus: "36% 32%", scrim: 0.36, bar: "#8a8178" },
  { name: "Michael Kors", mark: "mk", descriptor: "Polished, modern looks", cta: "Shop Michael Kors", image: "/editorial/graphite-blazer-cream.jpg", focus: "50% 34%", scrim: 0.5, bar: "#4a3122" },
];

export const brandHeading = "Shop by brand";

export const categories = [
  { name: "Suits", descriptor: "Slim, modern and classic fits", cta: "Shop suits", image: "/editorial/navy-bench-walnut.jpg", focus: "50% 50%", view: "inset(38% 16% 24% 16%)" },
  { name: "Dress shirts", descriptor: "Every cut, collar and color", cta: "Shop dress shirts", image: "/editorial/white-shirt-walnut.jpg", focus: "50% 50%", view: "inset(36% 20% 26% 18%)" },
  { name: "Tuxedos", descriptor: "Black tie, ready to wear", cta: "Shop tuxedos", image: "/editorial/charcoal-velvet.jpg", focus: "55% 42%", view: "inset(30% 10% 30% 20%)" },
  { name: "Shoes", descriptor: "Dress shoes and more", cta: "Shop shoes", image: "/editorial/blue-sling-cream.jpg", focus: "30% 80%", view: "inset(74% 48% 2% 0%)" },
  { name: "Casualwear", descriptor: "Blazers, polos, chinos and more", cta: "Shop casualwear", image: "/editorial/rust-cord-walnut.jpg", focus: "50% 50%", view: "inset(38% 2% 18% 4%)" },
  { name: "Wedding", descriptor: "For the groom, the party and the guests", cta: "Shop wedding", image: "/editorial/navy-check-holiday.jpg", focus: "40% 50%", view: "inset(34% 24% 24% 2%)" },
  { name: "Sale", descriptor: "Savings on styles you'll actually wear", cta: "Shop sale", image: "/editorial/gray-tonal.jpg", focus: "50% 50%", view: "inset(36% 22% 20% 22%)" },
];

export const categoryEyebrow = "Shop by category";

export const occasionHeading = "What are you dressing for?";

// Points are fractions of the source photo. `at` places the numbered marker on the
// lifestyle photo; `crop` is the detail crop shown on the matching card.
export const occasionLooks = [
  {
    name: "Wedding",
    eyebrow: "Wedding",
    line: "Guest, groom or groomsman, find your look.",
    image: "/editorial/navy-bench-walnut.jpg",
    aspect: 677 / 1024,
    focus: { x: 0.5, y: 0.2 },
    shell: "#4a3122",
    cta: "Shop wedding",
    pieces: [
      { name: "Navy suit", price: "$348", at: { x: 0.6, y: 0.43 }, crop: { x: 0.52, y: 0.45, zoom: 2.2 } },
      { name: "White dress shirt", price: "$68", at: { x: 0.53, y: 0.27 }, crop: { x: 0.51, y: 0.33, zoom: 5.6 } },
      { name: "Navy tie", price: "$45", at: { x: 0.49, y: 0.34 }, crop: { x: 0.49, y: 0.4, zoom: 4.2 } },
    ],
  },
  {
    name: "Work",
    eyebrow: "Work",
    line: "The suit for the office.",
    image: "/editorial/blue-midcentury-cream.jpg",
    aspect: 809 / 1024,
    focus: { x: 0.55, y: 0.4 },
    shell: "#4a3d32",
    cta: "Shop the full Work look",
    pieces: [
      { name: "Blue suit", price: "$398", at: { x: 0.8, y: 0.46 }, crop: { x: 0.62, y: 0.66, zoom: 2.2 } },
      { name: "Print dress shirt", price: "$72", at: { x: 0.66, y: 0.51 }, crop: { x: 0.67, y: 0.56, zoom: 3.6 } },
      { name: "Blue dress pants", price: "$98", at: { x: 0.52, y: 0.63 }, crop: { x: 0.46, y: 0.7, zoom: 2.1 } },
    ],
  },
  {
    name: "Prom/Black tie",
    eyebrow: "Prom",
    line: "Dressed for the evening.",
    image: "/editorial/charcoal-velvet.jpg",
    aspect: 677 / 1024,
    focus: { x: 0.5, y: 0.25 },
    shell: "#4a3122",
    cta: "Shop the full Prom/Black tie look",
    pieces: [
      { name: "Charcoal suit", price: "$428", at: { x: 0.28, y: 0.38 }, crop: { x: 0.38, y: 0.56, zoom: 1.85 } },
      { name: "Navy dress shirt", price: "$68", at: { x: 0.46, y: 0.27 }, crop: { x: 0.48, y: 0.34, zoom: 5.2 } },
      { name: "Burgundy sweater", price: "$88", at: { x: 0.5, y: 0.34 }, crop: { x: 0.5, y: 0.38, zoom: 3.4 } },
    ],
  },
  {
    name: "Rental",
    eyebrow: "Rental",
    line: "Rent the look for the day.",
    image: "/editorial/graphite-blazer-cream.jpg",
    aspect: 810 / 1024,
    focus: { x: 0.5, y: 0.2 },
    shell: "#4a3d32",
    cta: "Shop the full Rental look",
    pieces: [
      { name: "Blue check sport coat", price: "$199", at: { x: 0.36, y: 0.4 }, crop: { x: 0.48, y: 0.55, zoom: 2.2 } },
      { name: "Light blue dress shirt", price: "$58", at: { x: 0.52, y: 0.26 }, crop: { x: 0.52, y: 0.38, zoom: 4 } },
      { name: "Navy print tie", price: "$45", at: { x: 0.5, y: 0.34 }, crop: { x: 0.5, y: 0.42, zoom: 3.8 } },
    ],
  },
  {
    name: "Sale",
    eyebrow: "Sale",
    line: "The same look, for less.",
    image: "/editorial/rust-cord-walnut.jpg",
    aspect: 676 / 1024,
    focus: { x: 0.5, y: 0.1 },
    shell: "#4a3122",
    cta: "Shop the full Sale look",
    pieces: [
      { name: "Rust corduroy blazer", price: "$198", at: { x: 0.2, y: 0.48 }, crop: { x: 0.28, y: 0.58, zoom: 2 } },
      { name: "Black knit polo", price: "$42", at: { x: 0.5, y: 0.46 }, crop: { x: 0.48, y: 0.55, zoom: 2.6 } },
      { name: "Black chinos", price: "$48", at: { x: 0.78, y: 0.68 }, crop: { x: 0.7, y: 0.76, zoom: 2.1 } },
    ],
  },
];

export const hero = {
  cta: "Shop the Full Look",
  image: "/editorial/charcoal-velvet.jpg",
  shell: "#4a3122",
};

export const seasonal = {
  name: "Holiday",
  line: "Holiday party, handled.",
  cta: "Shop holiday",
  image: "/editorial/navy-check-holiday.jpg",
  shell: "#4a3122",
};

export const rotating = {
  quiet: true,
  image: "/editorial/tie-detail.jpg",
  shell: "#3a4654",
};

export const arrivals = {
  title: "See what's new",
  line: "New styles, ready when you are.",
  cta: "Shop new arrivals",
};

export const arrivalTiles = [
  { label: "Dress shirts", image: "/editorial/white-shirt-walnut.jpg", bar: "#4a3122", focus: "50% 32%" },
  { label: "Sport coats", image: "/editorial/graphite-blazer-cream.jpg", bar: "#1a2438", focus: "48% 28%" },
  { label: "Suits", image: "/editorial/navy-bench-walnut.jpg", bar: "#7a3b32", focus: "50% 18%" },
  { label: "Shoes", image: "/editorial/blue-sling-cream.jpg", bar: "#8a8178", focus: "36% 72%" },
];

export const salePath = {
  title: "Good style, better prices",
  line: "Sharp looks for less, always in one place.",
  cta: "Shop sale",
  image: "/editorial/rust-cord-walnut.jpg",
  shell: "#4a3122",
  focus: "50% 22%",
};

