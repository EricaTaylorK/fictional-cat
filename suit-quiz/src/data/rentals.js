const IMAGE_BASE = "https://image.menswearhouse.com/is/image/TMW/";
const RENTAL_BASE = "https://www.menswearhouse.com/rental/p/";

function rentalImage(code) {
  return `${IMAGE_BASE}${code}?$TUXPGPMAIN3$`;
}

export const RENTAL_FEE = 12;
export const RENTAL_PANTS = 10;
export const RENTAL_READY_DAYS = 3;
export const RENTAL_MIN_LEAD_DAYS = 4;

export const RENTAL_PIECES = [
  { id: "shirt", label: "Dress shirt", price: 20, icon: "/icons/mw/tailor-shirt-fit.png" },
  { id: "neckwear", label: "Tie or bow tie", price: 10, icon: "/icons/mw/collar.png" },
  { id: "vest", label: "Vest", price: 30, icon: "/icons/mw/vest.png" },
  { id: "shoes", label: "Shoes", price: 30 },
  { id: "pocketsilk", label: "Pocket square", price: 10 },
  { id: "cufflinks", label: "Cufflinks and studs", price: 8 },
  { id: "suspenders", label: "Suspenders", price: 2.5 },
];

function packageDetail(pieceIds) {
  const labels = [
    "Jacket",
    "Pants",
    ...pieceIds.map((id) => RENTAL_PIECES.find((piece) => piece.id === id)?.label).filter(Boolean),
  ];
  const words = labels.map((label, index) => (index === 0 ? label : label.toLowerCase()));
  if (words.length < 2) return words[0] ? `${words[0]}.` : "";
  if (words.length === 2) return `${words[0]} and ${words[1]}.`;
  return `${words.slice(0, -1).join(", ")}, and ${words[words.length - 1]}.`;
}

const SIX_PIECE = ["shirt", "neckwear", "vest", "shoes"];
const NINE_PIECE = ["shirt", "neckwear", "vest", "shoes", "pocketsilk", "cufflinks", "suspenders"];

export const RENTAL_PACKAGES = [
  { id: 2, label: "2-piece rental", pieces: [], detail: packageDetail([]) },
  { id: 6, label: "6-piece rental", pieces: SIX_PIECE, detail: packageDetail(SIX_PIECE) },
  { id: 9, label: "9-piece rental", pieces: NINE_PIECE, detail: packageDetail(NINE_PIECE) },
];

export const FULL_LOOK = ["shirt", "neckwear", "vest", "shoes", "pocketsilk", "cufflinks"];

export const RENTAL_STEPS = [
  { id: "reserve", title: "Reserve your look", icon: "/icons/mw/shop.png" },
  { id: "fitted", title: "Get fitted", icon: "/icons/mw/measurement.png" },
  { id: "pickup", title: "Pickup or delivered to you", icon: "/icons/mw/in-store-pickup.png" },
  { id: "return", title: "Easy return", icon: "/icons/mw/shipping.png" },
];

const TYPE_FORMALITY = {
  tux: ["wedding", "formal", "prom", "special"],
  dinner: ["wedding", "formal", "prom", "special"],
  tailcoat: ["wedding", "formal"],
  suit: ["wedding", "prom", "special"],
};

export const RENTAL_TYPE_NAMES = {
  tux: "Tuxedo",
  dinner: "Dinner jacket tuxedo",
  tailcoat: "Tailcoat tuxedo",
  suit: "Suit",
};

function look(id, brand, name, type, colorKey, color, price, rating, reviews, image, slug) {
  return {
    id: `rent-${id}`,
    brand,
    name,
    type,
    colorKey,
    color,
    price,
    rating,
    reviews,
    image: rentalImage(image),
    url: `${RENTAL_BASE}${slug}-id-tmw-${id}-2p-look`,
    formality: TYPE_FORMALITY[type],
  };
}

export const rentals = [
  look(5242, "Vera Wang", "Black Notch Lapel Tux", "tux", "black", "Black", 169.99, 4.2, 17869, "MWTSP25_WED_PSL_FML_1130_MAIN", "notch-lapel-tuxedo-black-vera-wang"),
  look(5347, "Vera Wang", "Midnight Tux", "tux", "navy", "Midnight blue", 169.99, 4.5, 3917, "MWTSP25_WED_PSL_FML_1160_MAIN", "midnight-tuxedo-vera-wang"),
  look(5339, "Vera Wang", "Black Peak Lapel Tux", "tux", "black", "Black", 169.99, 4.3, 9423, "MWTSP25_WED_PSL_FML_1231_MAIN", "black-peak-lapel-tuxedo-vera-wang"),
  look(6078, "Pronto Uomo", "Gray Notch Lapel Tuxedo", "tux", "gray", "Gray", 139.99, 5.0, 1, "MWTSP25_WED_PSL_FML_1470_MAIN", "gray-pronto-notch-lapel-tuxedo"),
  look(5340, "Calvin Klein", "Charcoal Gray Performance Wool Tux", "tux", "gray", "Charcoal gray", 169.99, 4.2, 1900, "MWTSP25_WED_PSL_FML_1317_MAIN", "charcoal-gray-performance-wool-tuxedo-calvin-klein"),
  look(5302, "Joseph Abboud", "Navy Satin Edged Notch Lapel Tux", "tux", "navy", "Navy", 169.99, 4.3, 2444, "MWTSP25_WED_PSL_FML_1150_MAIN", "navy-tuxedo-joseph-abboud-framed-notch-lapel"),
  look(6082, "Joseph Abboud", "Light Gray Performance Wool Tuxedo", "tux", "gray", "Light gray", 169.99, null, 0, "RENTAL_1280_LTGREY_WED_PSL_FRNT_MAIN", "joseph-abboud-light-gray-wool-tuxedo"),
  look(6064, "Calvin Klein", "Double Breasted Tuxedo", "tux", "black", "Black", 169.99, 4.8, 24, "MWTSP24_WED_PSL_FML_1730_MAIN", "calvin-klein-double-breasted-tuxedo"),
  look(5323, "Calvin Klein", "Blue Suit", "suit", "blue", "Blue", 169.99, 4.3, 6268, "MWTSP25_WED_PSL_FML_1919_MAIN", "blue-suit-calvin-klein"),
  look(5341, "Calvin Klein", "Charcoal Gray Performance Wool Suit", "suit", "gray", "Charcoal gray", 169.99, 4.2, 4767, "MWTSP25_WED_PSL_FML_1171_MAIN", "charcoal-gray-performance-wool-suit-calvin-klein"),
  look(6080, "Pronto Uomo", "Navy Suit", "suit", "navy", "Navy", 139.99, 1.0, 1, "RENTAL_1945_NA_WED_PSL_FRNT_MAIN", "navy-suit-pronto-uomo"),
  look(5231, "Pronto Uomo", "Gray Notch Lapel Suit", "suit", "gray", "Gray", 139.99, 4.0, 6339, "MWTSP25_WED_PSL_FML_1917_MAIN", "vintage-pronto-uomo-suit"),
  look(5348, "Vera Wang", "Blue Suit", "suit", "navy", "Blue/navy", 169.99, 4.2, 8008, "MWTSP25_WED_PSL_FML_1219_MAIN", "blue-suit-vera-wang"),
  look(6066, "Kenneth Cole", "Performance Wool Green Suit", "suit", "green", "Green", 139.99, 4.6, 46, "MWTSP24_WED_PSL_FML_1938_MAIN", "kenneth-cole-performance-wool-green-suit"),
  look(6068, "Kenneth Cole", "Performance Wool Black Suit", "suit", "black", "Black", 169.99, 4.0, 102, "MWTSP24_WED_PSL_FML_1922_MAIN", "kenneth-cole-performance-wool-black-suit"),
  look(6057, "Pronto Uomo", "Performance Wool Tan Suit", "suit", "tan", "Tan", 139.99, 4.1, 4326, "MWTSP25_WED_PSL_FML_1980_MAIN", "tan-performance-wool-suit-pronto-uomo"),
  look(5230, "Pronto Uomo", "Black Notch Lapel Suit", "suit", "black", "Black", 139.99, 4.1, 7248, "MWTSP25_WED_PSL_FML_1912_MAIN", "vintage-black-two-button-suit-pronto-uomo"),
  look(5239, "Calvin Klein", "Black Satin Edged Notch Lapel Tux", "tux", "black", "Black", 169.99, 4.3, 9350, "MWTSP25_WED_PSL_FML_1859_MAIN", "calvin-klein-tuxedo-two-button-notch-lapel"),
  look(5240, "Calvin Klein", "Black Shawl Lapel Tux", "tux", "black", "Black", 169.99, 4.3, 6312, "MWTSP25_WED_PSL_FML_1869_MAIN", "shawl-lapel-tuxedo-calvin-klein"),
  look(5342, "Calvin Klein", "White Dinner Jacket Tux", "dinner", "white", "White", 169.99, 4.6, 1453, "MWTSP25_WED_PSL_FML_1895_MAIN", "white-dinner-jacket-tuxedo-calvin-klein"),
  look(5343, "Egara", "Charcoal Gray Jacquard Dinner Jacket Tux", "dinner", "gray", "Charcoal gray", 139.99, 4.6, 1685, "MWTSP25_WED_PSL_FML_1797_MAIN", "charcoal-gray-dinner-jacket-tuxedo-egara"),
  look(5344, "Egara", "Blue Jacquard Dinner Jacket Tux", "dinner", "blue", "Blue", 139.99, 4.7, 1166, "MWTSP25_WED_PSL_FML_1798_MAIN", "blue-dinner-jacket-tuxedo-egara"),
  look(6058, "Pronto Uomo", "White Notch Suit", "suit", "white", "White", 139.99, 4.9, 21, "MWTSP23_WED_PSL_FML_1391_MAIN", "white-tuxedo-pronto-uomo"),
  look(6061, "Pronto Uomo", "Ivory Dinner Jacket", "dinner", "white", "Ivory", 139.99, 4.6, 15, "MWTSP24_WED_PSL_FML_1772_MAIN", "ivory-dinner-jacket-pronto-uomo"),
  look(6071, "Egara", "Black Tuxedo", "tux", "black", "Black", 137.99, 4.5, 73, "MWTSP25_WED_PSL_FML_1445_MAIN", "black-egara-tuxedo"),
  look(6060, "Pronto Uomo", "Black Notch Lapel Tuxedo", "tux", "black", "Black", 139.99, 4.2, 143, "MWTSP24_WED_PSL_FML_1965_MAIN", "black-notch-lapel-tuxedo-pronto-uomo"),
  look(5235, "Joseph & Feiss", "Black Full Dress Tailcoat Tux", "tailcoat", "black", "Black", 99.99, 4.6, 1097, "MWTSP25_WED_PSL_FML_1794_MAIN", "black-full-dress-tail-tuxedo-joseph-feiss"),
];
