const stroke = {
  fill: "none",
  stroke: "#111",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Icon({ children }) {
  return (
    <svg className="category-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

// First jacket on the "2 Piece Suit / 3 Piece Suit / Suit Jacket" sheet.
function SuitIcon() {
  return (
    <Icon>
      <path d="M16.5 13.5 24 18.2 31.5 13.5" {...stroke} />
      <path d="M16.5 13.5 13 16.8 10 21.2 13.2 24.2 16 21v17.2h16V21l2.8 3.2L38 21.2 35 16.8 31.5 13.5" {...stroke} />
      <path d="M20 16.2 24 22.4 28 16.2" {...stroke} />
      <path d="M24 22.4V38.2" {...stroke} />
      <path d="M16.8 28.4h4.4M26.8 28.4h4.4" {...stroke} />
    </Icon>
  );
}

// Second drawing on the "Cardigan / Long Sleeved Shirt" sheet: pointed collar, center placket.
function ShirtIcon() {
  return (
    <Icon>
      <path d="M17.5 12.5h13l3.2 3.6 5.8 3.2-3.2 3.4-2.3-1.8V39H14V20.9l-2.3 1.8-3.2-3.4 5.8-3.2 3.2-3.6z" {...stroke} />
      <path d="M17.5 12.5 20.6 17.4h6.8l3.1-4.9" {...stroke} />
      <path d="M24 17.4V39" {...stroke} />
    </Icon>
  );
}

// Third drawing on the "Tuxedo / Waistcoat / Vest / Blazer" sheet: bow tie over peaked lapels.
function TuxedoIcon() {
  return (
    <Icon>
      <path d="M22.4 16.2h3.2v4.6h-3.2z" {...stroke} />
      <path d="M22.4 17.2c-3.6-2.8-8.4-1.8-8.4 1.6 0 3.2 4.6 5.2 8.4 2.2" {...stroke} />
      <path d="M25.6 17.2c3.6-2.8 8.4-1.8 8.4 1.6 0 3.2-4.6 5.2-8.4 2.2" {...stroke} />
      <path d="M15.2 20.2 21.2 18.6M32.8 20.2 26.8 18.6" {...stroke} />
      <path d="M9 18.5 24 42 39 18.5" {...stroke} />
      <path d="M16.5 18.5 24 33.5 31.5 18.5" {...stroke} />
      <path d="M24 22.2v12.4" {...stroke} />
    </Icon>
  );
}

// First pullover on the "Pullover / Windbreaker / Sweater" sheet: crew neck, ribbed hem.
function PulloverIcon() {
  return (
    <Icon>
      <path d="M17 15.2c1-2.8 3.6-4 7-4s6 1.2 7 4l5.6 3.6-3 3-2.2-2.2V35.2H14.6V19.6l-2.2 2.2-3-3z" {...stroke} />
      <path d="M17 15.2c1.4 2.2 4.2 3.4 7 3.4s5.6-1.2 7-3.4" {...stroke} />
      <path d="M14.6 30.4h18.8M14.6 33.2h18.8" {...stroke} />
    </Icon>
  );
}

// First bow on the "Bow Tie" sheet.
function BowIcon() {
  return (
    <Icon>
      <path d="M22.2 21.2h3.6v5.6h-3.6z" {...stroke} />
      <path d="M22.2 22.4C17.2 16.6 10 17.4 9.2 24s7.2 8.2 13 2.6" {...stroke} />
      <path d="M25.8 22.4C30.8 16.6 38 17.4 38.8 24s-7.2 8.2-13 2.6" {...stroke} />
      <path d="M13.4 21.4 20.4 24 13.4 26.6M34.6 21.4 27.6 24 34.6 26.6" {...stroke} />
    </Icon>
  );
}

// Not on the sheets. Drawn in the same stroke to stand in for Shoes.
function ShoeIcon() {
  return (
    <Icon>
      <path d="M8 30.5c1.6-7.2 6.4-10 12.2-10H28l7.2 3.6 5 5.2" {...stroke} />
      <path d="M6.5 32.2h34.2c1 0 1.6 1 .8 2-.8 1.2-2.6 2.4-7.2 2.4H12.2c-3.6 0-6-1.2-6.4-2.8-.3-1.2.2-1.6.7-1.6z" {...stroke} />
      <path d="M16.5 26.2h7.4M16.5 28.8h6.2M31.2 22.4v9.2" {...stroke} />
    </Icon>
  );
}

// Not on the sheets. Drawn in the same stroke to stand in for Sale.
function TagIcon() {
  return (
    <Icon>
      <path d="M16 12.5h13.2L38 21.2V38H16z" {...stroke} />
      <path d="M29.2 12.5V21H38" {...stroke} />
      <circle cx="22.2" cy="19.6" r="1.7" {...stroke} />
      <path d="M21 27.2h10.5M21 31.4h7" {...stroke} />
    </Icon>
  );
}

const icons = {
  Suits: SuitIcon,
  "Dress shirts": ShirtIcon,
  Tuxedos: TuxedoIcon,
  Shoes: ShoeIcon,
  Casualwear: PulloverIcon,
  Wedding: BowIcon,
  Sale: TagIcon,
};

export function CategoryIcon({ name }) {
  const Mark = icons[name];
  if (!Mark) return null;
  return <Mark />;
}
