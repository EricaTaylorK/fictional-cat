const ink = "#1a2438";
const blue = "#c9dcf5";
const gray = "#d5d8dc";
const red = "#c4362c";

const stroke = {
  fill: "none",
  stroke: ink,
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Spot({ children }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g transform="translate(24 24) scale(1.38) translate(-24 -24)">{children}</g>
    </svg>
  );
}

export function SuitSpot() {
  return (
    <Spot>
      <path d="M25.2 16.2 34.2 19.2 34.2 39.6 27.4 39.6 26.4 28.6 24 30.8Z" fill={gray} />
      <path d="M20.2 17.2 24 22.4 27.8 17.2 27.4 27.6 20.6 27.6Z" fill={blue} />
      <path d="M24 20.2 22.3 32.4 24 34.5 25.7 32.4Z" fill={ink} />
      <path
        d="M15.2 16.4c1.6-3 4.6-2.2 6.6.4L24 19l2.2-2.2c2-2.6 5-3.4 6.6-.4l2.8 3.2v21.2h-7.6l-1.2-12.2L24 32.2l-2.8-2.6-1.2 12.2h-7.6V19.6z"
        {...stroke}
      />
    </Spot>
  );
}

export function SportCoatSpot() {
  return (
    <Spot>
      <path d="M26 16.4 34.6 19.4 34.6 39.8 27.2 39.8 26.2 29.2 24 31.2Z" fill={gray} />
      <path d="M18.2 21.6h5.2l-.4 3.2-2.2 1.2-2.2-1.2z" fill={blue} {...stroke} strokeWidth="1.3" />
      <path
        d="M14.8 16.6c1.8-3.1 5-2.2 7 1L24 20.2l2.2-2.6c2-3.2 5.2-4.1 7-1l3 3.4V40H27.4l-1.4-11.2L24 31.6l-2-2.8-1.4 11.2H13.6V20z"
        {...stroke}
      />
    </Spot>
  );
}

export function DressShirtSpot() {
  return (
    <Spot>
      <path d="M24.4 16.8 33.2 20.2 33.2 40.2 24.4 40.2Z" fill={gray} />
      <path d="M15.2 20.2 24 16.6 32.8 20.2 32.8 40.2 15.2 40.2Z" fill={blue} />
      <path d="M18.4 16.6 24 21.4 29.6 16.6 32.6 19.4 24 25.2 15.4 19.4Z" fill="#fff" {...stroke} />
      <path d="M24 24.8v14.6" {...stroke} />
      <circle cx="24" cy="28.2" r="0.7" fill={ink} />
      <circle cx="24" cy="32.4" r="0.7" fill={ink} />
      <circle cx="24" cy="36.4" r="0.7" fill={ink} />
      <path d="M15.2 20.2 24 16.6 32.8 20.2V40.2H15.2Z" {...stroke} />
    </Spot>
  );
}

export function CasualSpot() {
  return (
    <Spot>
      <path d="M25 17.5 34.5 20.5 35.6 25.2 31.4 25.2 31.2 40.2 25 40.2Z" fill={gray} />
      <path d="M13.2 20.2 17.4 25.2 17.2 40.2 31.2 40.2 31.4 25.2 35.6 20.2 30.2 16.4 24 20.6 17.8 16.4Z" fill={blue} />
      <path
        d="M13.2 20.2 17.4 25.2 17.2 40.2h14l.2-14.8 4.2-5.2-5.4-3.8L24 20.6 17.8 16.4Z"
        {...stroke}
      />
      <path d="M21.4 17.2 24 20.8 26.6 17.2" {...stroke} />
      <path d="M24 20.8v6.4" {...stroke} />
      <circle cx="24" cy="23.2" r="0.7" fill={ink} />
      <circle cx="24" cy="26.2" r="0.7" fill={ink} />
    </Spot>
  );
}

export function PantsSpot() {
  return (
    <Spot>
      <path d="M25.2 16.2 32.6 17.4 31.2 40.4 25.4 40.4Z" fill={gray} />
      <path d="M16.2 16.2h16.2l-1.4 24.2h-5.6l-.8-14.2-.8 14.2h-5.6z" fill={blue} />
      <path d="M16.2 14.2h16.2v3.2H16.2z" fill="#fff" {...stroke} />
      <path d="M16.4 17.2 18 40.4h5.4l.8-15.2.9 15.2H30.8l1.6-23.2" {...stroke} />
      <path d="M20.6 18.4v19" {...stroke} strokeWidth="1.2" />
    </Spot>
  );
}

export function ShoeSpot() {
  return (
    <Spot>
      <path d="M10 30.2c8.2 3.4 22.4 3.6 29.2-.4l1.2 2.4c-7.6 4.2-22.6 4.2-30.6-.2z" fill={gray} />
      <path d="M12.2 29.6 18.4 23.2l8.2-1.4 10.6 1.6 4.2 5.2-1.6 2.2H12.6z" fill={blue} />
      <path
        d="M11.4 30.4 17.6 23.4l9.2-1.6c4.2-.4 9.6.6 13.2 2.4l3.4 4.6-2 2.6H12.2z"
        {...stroke}
      />
      <path d="M20.2 24.2c.6 2.2 1.2 2.4 2.4 2.4M24.6 23.6c.5 2.2 1.2 2.4 2.4 2.2M29 24c.4 2.1 1.1 2.3 2.2 2" {...stroke} strokeWidth="1.2" />
      <path d="M10.2 31.6c8.4 3.2 21.8 3.4 30.4-.2" {...stroke} />
    </Spot>
  );
}

export function AccessoriesSpot() {
  return (
    <Spot>
      <path d="M22.2 8.8 18.6 22.6 22.2 26.2 25.8 22.6Z" fill={ink} />
      <path d="M20.4 8.2h3.6l2.2 3.2-4 4.2-4-4.2z" fill={blue} {...stroke} strokeWidth="1.3" />
      <path d="M9.5 32.2h29v5.2h-29z" fill={gray} />
      <path d="M9.5 32.2h20.2v5.2H9.5z" fill={blue} />
      <path d="M9.5 32.2h29v5.2h-29z" {...stroke} />
      <path d="M29.6 32.2h5.4v5.2h-5.4z" fill="#fff" {...stroke} />
      <path d="M32.3 33.6v2.4" {...stroke} strokeWidth="1.2" />
    </Spot>
  );
}

export function TrendingSpot() {
  return (
    <Spot>
      <path d="M25.4 17.4 33.6 20.2 33.6 38.8 27.4 38.8 26.6 29.2 24.4 31Z" fill={gray} />
      <path d="M20.6 18.4 24 22.6 27.4 18.4v8.2h-6.8z" fill={blue} />
      <path d="M24 21.2 22.6 31.4 24 33.2 25.4 31.4Z" fill={ink} />
      <path
        d="M16 17.4c1.5-2.6 4.2-1.8 6 .6L24 20.2l2-2.2c1.8-2.4 4.5-3.2 6-.6l2.4 2.8v18.4h-6.4l-1-10.4L24 30.6l-3-2.4-1 10.4H15.2V20.2z"
        {...stroke}
      />
      <path d="M34.2 10.2 36.6 13.4 34.2 14.6 36.8 17.6" stroke={red} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Spot>
  );
}

export function SaleSpot() {
  return (
    <Spot>
      <path d="M24 9.2a3 3 0 0 1 3 2.8c0 1.2-.8 2-2 2.6" {...stroke} />
      <path d="M11.6 18.4 24 14.2 36.4 18.4" {...stroke} />
      <path d="M30.2 18.2 35.8 21.2 35.2 37.6 26.6 37.6 26.2 24.2Z" fill={gray} />
      <path d="M14.2 18.6 24 15.2 33.6 18.6 33.2 37.8 14.8 37.8Z" fill={blue} />
      <path d="M14.2 18.6 24 15.2 33.6 18.6 33.2 37.8H14.8Z" {...stroke} />
      <path d="M31.6 17.2h6.2l-.6 5.2-2.6 1.6-2.6-1.6z" fill={red} />
      <path d="M31.6 17.2h6.2l-.6 5.2-2.6 1.6-2.6-1.6z" stroke={red} strokeWidth="1.2" strokeLinejoin="round" />
    </Spot>
  );
}

export function TuxedoSpot() {
  return (
    <Spot>
      <path d="M25.2 16.2 34.2 19.2 34.2 39.6 27.4 39.6 26.4 28.6 24 30.8Z" fill={gray} />
      <path d="M20.6 17.4 24 22.2 27.4 17.4 27.2 26.8 20.8 26.8Z" fill={blue} />
      <path d="M19.2 21.4c1.6 1.1 2.8 1.1 4.8 0 2 1.1 3.2 1.1 4.8 0" {...stroke} strokeWidth="1.45" />
      <path d="M22.6 21.2h2.8v1.8h-2.8z" fill={ink} />
      <path
        d="M15.2 16.4c1.6-3 4.6-2.2 6.6.4L24 19l2.2-2.2c2-2.6 5-3.4 6.6-.4l2.8 3.2v21.2h-7.6l-1.2-12.2L24 32.2l-2.8-2.6-1.2 12.2h-7.6V19.6z"
        {...stroke}
      />
    </Spot>
  );
}

export function WeddingSpot() {
  return (
    <Spot>
      <path d="M25.2 16.2 34.2 19.2 34.2 39.6 27.4 39.6 26.4 28.6 24 30.8Z" fill={gray} />
      <path d="M20.2 17.2 24 22.4 27.8 17.2 27.4 27.6 20.6 27.6Z" fill={blue} />
      <path d="M24 20.2 22.3 32.4 24 34.5 25.7 32.4Z" fill={ink} />
      <circle cx="18.2" cy="22.6" r="1.7" fill={blue} stroke={ink} strokeWidth="1.1" />
      <path d="M18.2 24.2v3.4" {...stroke} strokeWidth="1.15" />
      <path
        d="M15.2 16.4c1.6-3 4.6-2.2 6.6.4L24 19l2.2-2.2c2-2.6 5-3.4 6.6-.4l2.8 3.2v21.2h-7.6l-1.2-12.2L24 32.2l-2.8-2.6-1.2 12.2h-7.6V19.6z"
        {...stroke}
      />
    </Spot>
  );
}

export function RentalSpot() {
  return (
    <Spot>
      <path d="M24 7.4v5.2" {...stroke} />
      <path d="M22.2 7.2h3.6" {...stroke} />
      <path d="M27.2 16.2 33.4 18.4 33.4 39.6 24.2 39.6Z" fill={gray} />
      <path d="M15.2 16.4 24 13.2 32.8 16.4 33.6 40.2 14.4 40.2Z" fill={blue} />
      <path d="M18.6 14.6c1.6 1.6 2.6 1.6 4.2 0 1.6 1.6 2.6 1.6 4.2 0" {...stroke} strokeWidth="1.4" />
      <path d="M15.2 16.4 24 13.2 32.8 16.4 33.6 40.2H14.4Z" {...stroke} />
      <path d="M24 16.8v20.6" {...stroke} strokeWidth="1.2" />
    </Spot>
  );
}

const CATEGORY_SPOTS = {
  Suits: SuitSpot,
  "Dress shirts": DressShirtSpot,
  Tuxedos: TuxedoSpot,
  Shoes: ShoeSpot,
  Casualwear: CasualSpot,
  Wedding: WeddingSpot,
  Sale: SaleSpot,
};

export function CategorySpot({ name }) {
  const Icon = CATEGORY_SPOTS[name];
  if (!Icon) return null;
  return (
    <span className="category-spot">
      <Icon />
    </span>
  );
}
