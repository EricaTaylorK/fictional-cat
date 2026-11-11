export const categoryHeading = {
  line1: "Shop by",
  line2: "Category",
};

export const categories = [
  {
    name: "Suits",
    descriptor: "Slim, modern and classic fits",
    cta: "Shop suits",
    image: "/categories/suits.png",
  },
  {
    name: "Dress shirts",
    descriptor: "Every cut, collar and color",
    cta: "Shop dress shirts",
    image: "/categories/dress-shirts.png",
  },
  {
    name: "Tuxedos",
    descriptor: "Black tie, ready to wear",
    cta: "Shop tuxedos",
    image: "/categories/tuxedos.png",
  },
  {
    name: "Shoes",
    descriptor: "Dress shoes and more",
    cta: "Shop shoes",
    image: "/categories/shoes.png",
  },
  {
    name: "Casualwear",
    descriptor: "Blazers, polos, chinos and more",
    cta: "Shop casualwear",
    image: "/categories/casualwear.png",
  },
  {
    name: "Wedding",
    descriptor: "For the groom, the party and the guests",
    cta: "Shop wedding",
    image: "/categories/wedding.png",
  },
  {
    name: "Sale",
    descriptor: "Savings on styles you'll actually wear",
    cta: "Shop sale",
    image: "/categories/sale.png",
  },
];

export const wedding = {
  headline: "Wedding",
  deck: "Guest, groom or groomsman, find your look.",
  cta: "Shop wedding",
  chips: [
    { name: "Guest", shot: "Wedding guest in a styled complete outfit", tone: "guest", photo: "/looks/navy-suit-coffee.jpg", position: "center 30%" },
    { name: "Groom", shot: "The groom in a styled complete outfit", tone: "groom", photo: "/looks/blue-suit-leaning.jpg", position: "center 20%" },
    { name: "Groomsman", shot: "A groomsman in a styled complete outfit", tone: "groomsman", photo: "/looks/light-blue-plaid.jpg", position: "center 20%" },
  ],
};

export const secondaryTiles = [
  { name: "Work", shot: "Work occasion", tone: "work", photo: "/looks/gray-check-shirt.jpg", position: "center 25%" },
  { name: "Prom/Black tie", shot: "Prom/Black tie occasion", tone: "prom", photo: "/looks/charcoal-chair.jpg", position: "center 20%" },
  { name: "Rental", shot: "Rental occasion", tone: "rental", photo: "/looks/navy-chair-seated.jpg", position: "center 20%" },
  { name: "Sale", shot: "Sale occasion", tone: "sale-tile", photo: "/looks/navy-check-gifts.jpg", position: "center 25%" },
];

export const panel = {
  addToBag: "Add to bag",
  sizeLabel: "Size",
  sizes: ["36", "38", "40", "42", "44"],
  items: [
    { id: "jacket", shot: "Jacket", name: "Product name", price: "$000", tone: "jacket" },
    { id: "pants", shot: "Pants", name: "Product name", price: "$000", tone: "pants" },
    { id: "shirt", shot: "Shirt", name: "Product name", price: "$000", tone: "shirt" },
    { id: "tie", shot: "Tie", name: "Product name", price: "$000", tone: "tie" },
    { id: "shoes", shot: "Shoes", name: "Product name", price: "$000", tone: "shoes" },
  ],
};

export const hero = {
  headline: "Holiday party, handled.",
  cta: "Shop holiday looks",
  leftAlt: "Man in a navy suit standing beside holiday gifts",
  rightAlt: "Three men dressed for a holiday party beside a fireplace",
};

export const sale = {
  headline: "Good style, better prices",
  deck: "Sharp looks for less, always in one place.",
  cta: "Shop sale",
  shot: "Sale looks",
};

export const arrivals = {
  headline: "See what's new",
  deck: "New styles, ready when you are.",
  cta: "Shop new arrivals",
  shot: "New arrivals",
};

export const brands = [
  { id: "kenneth", name: "Kenneth Cole", descriptor: "Smart, comfortable suiting", cta: "Shop Kenneth Cole" },
  { id: "calvin", name: "Calvin Klein", descriptor: "Clean, modern essentials", cta: "Shop Calvin Klein" },
  { id: "cole", name: "Cole Haan", descriptor: "Shoes that finish the look", cta: "Shop Cole Haan" },
  { id: "tommy", name: "Tommy Hilfiger", descriptor: "Classic American style", cta: "Shop Tommy Hilfiger" },
  { id: "michael", name: "Michael Kors", descriptor: "Polished, modern looks", cta: "Shop Michael Kors" },
];

export const returning = {
  headline: "Pick up where you left off",
  subhead: "The styles you were looking at, right where you left them.",
  link: "View all recently viewed",
  items: [
    { name: "Placeholder product 01", price: "$000", shot: "Tailored navy suit", photo: "/looks/navy-suit-wood.jpg", position: "center 8%", zoom: 1.7 },
    { name: "Placeholder product 02", price: "$000", shot: "White dress shirt", photo: "/looks/white-dot-shirt.jpg", position: "center 12%", zoom: 1.55 },
    { name: "Placeholder product 03", price: "$000", shot: "Textured sport coat", photo: "/looks/sport-coat-detail.jpg", position: "center 42%", zoom: 1.15 },
  ],
};

export const reassurance = {
  visible:
    "Free shipping over $99. Free, easy returns to any store or online. Pick up or ship to your store.",
  items: [
    { icon: "shipping", text: "Free shipping over $99." },
    { icon: "returns", text: "Free, easy returns to any store or online." },
    { icon: "store", text: "Pick up or ship to your store." },
  ],
  alternates: {
    b: "Shop with confidence: free shipping over $99, free returns anywhere, and pickup or ship to store.",
    c: "Pick up or ship to your store · Free shipping $99+ · Free, easy returns",
  },
};
