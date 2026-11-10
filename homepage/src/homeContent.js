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
  { name: "Calvin Klein", descriptor: "Clean, modern essentials", cta: "Shop Calvin Klein", image: "/editorial/white-shirt-walnut.jpg", crop: { x: "50%", y: "36%", zoom: "2.6" } },
  { name: "Kenneth Cole", descriptor: "Smart, comfortable suiting", cta: "Shop Kenneth Cole", image: "/editorial/charcoal-velvet.jpg", crop: { x: "40%", y: "42%", zoom: "2.3" } },
  { name: "Cole Haan", descriptor: "Shoes that finish the look", cta: "Shop Cole Haan", image: "/editorial/blue-sling-cream.jpg", crop: { x: "26%", y: "92%", zoom: "3.8" } },
  { name: "Tommy Hilfiger", descriptor: "Classic American style", cta: "Shop Tommy Hilfiger", image: "/editorial/navy-check-holiday.jpg", crop: { x: "34%", y: "42%", zoom: "2.3" } },
  { name: "Michael Kors", descriptor: "Polished, modern looks", cta: "Shop Michael Kors", image: "/editorial/tie-detail.jpg", crop: { x: "38%", y: "46%", zoom: "1.2" } },
];

export const brandHeading = "Shop by brand";

export const categories = [
  { name: "Suits", descriptor: "Slim, modern and classic fits", cta: "Shop suits" },
  { name: "Dress shirts", descriptor: "Every cut, collar and color", cta: "Shop dress shirts" },
  { name: "Tuxedos", descriptor: "Black tie, ready to wear", cta: "Shop tuxedos" },
  { name: "Shoes", descriptor: "Dress shoes and more", cta: "Shop shoes" },
  { name: "Casualwear", descriptor: "Blazers, polos, chinos and more", cta: "Shop casualwear" },
  { name: "Wedding", descriptor: "For the groom, the party and the guests", cta: "Shop wedding" },
  { name: "Sale", descriptor: "Savings on styles you'll actually wear", cta: "Shop sale" },
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
    pieces: [
      { name: "Rust corduroy blazer", price: "$198", at: { x: 0.2, y: 0.48 }, crop: { x: 0.28, y: 0.58, zoom: 2 } },
      { name: "Black knit polo", price: "$42", at: { x: 0.5, y: 0.46 }, crop: { x: 0.48, y: 0.55, zoom: 2.6 } },
      { name: "Black chinos", price: "$48", at: { x: 0.78, y: 0.68 }, crop: { x: 0.7, y: 0.76, zoom: 2.1 } },
    ],
  },
];

export const hero = {
  eyebrow: "Formalwear",
  title: "Black tie, decoded.",
  body: "The whole look, picked to work together, from jacket to shoes.",
  cta: "Shop the Full Look",
  image: "/editorial/navy-coffee-walnut.jpg",
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
  name: "Rotating slot",
  line: "Campaign copy goes here.",
  cta: "Shop now",
  image: "/editorial/tie-detail.jpg",
  shell: "#3a4654",
};

