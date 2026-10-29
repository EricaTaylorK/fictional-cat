import { useEffect, useState } from "react";

const NAV = [
  "Suits",
  "Sport Coats",
  "Shirts",
  "Jackets & Sweaters",
  "Pants",
  "Shoes",
  "Accessories",
  "Trending",
  "Sale",
  "Rental",
];

const SUITS_MENU = [
  {
    title: "Suiting",
    links: ["Suits", "Tuxedos", "Suit Jackets", "Suit Pants", "3 Piece Suits", "Vests", "Boys Clothing", "Big & Tall Suits", "Big & Tall Tuxedos"],
  },
  {
    title: "Occasions",
    links: ["Week of the Wedding", "Week of the Wedding Outfitting", "Wedding Shop", "Wedding Suits", "Formal Shop", "Work", "Homecoming Suits"],
  },
  {
    title: "Collections",
    links: ["Everyday Deals Suits", "Linen Suits", "American Bespoke", "CHILLFLEX Tailored", "Tailored Shop"],
  },
];

export default function SiteHeader({ search, onSearch, onNavigate, onTakeQuiz, current }) {
  const [searchOpen, setSearchOpen] = useState(Boolean(search));
  const [menuOpen, setMenuOpen] = useState(false);
  const [suitsOpen, setSuitsOpen] = useState(false);

  useEffect(() => {
    if (!suitsOpen) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setSuitsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [suitsOpen]);

  function choose(item) {
    setMenuOpen(false);
    setSuitsOpen(false);
    if (item === "Suits" || item === "Sale") onNavigate?.("sale");
    if (item === "Rental") onNavigate?.("look");
  }

  function openQuiz() {
    setMenuOpen(false);
    setSuitsOpen(false);
    onTakeQuiz?.();
  }

  return (
    <header className="site-header">
      <div className="promo">
        <p>
          New markdowns — clearance up to 70% off original prices |{" "}
          <button type="button" className="promo-link" onClick={() => onNavigate?.("sale")}>Shop now &gt;</button>
        </p>
      </div>

      <div className="header-bar header-bar-mobile">
        <button
          type="button"
          className="icon-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon />
        </button>
        <button className="logo" type="button" aria-label="Men's Wearhouse home" onClick={() => { setMenuOpen(false); onNavigate?.("home"); }}>
          <img src="/mw-logo.svg" alt="" />
        </button>
        <div className="header-icons">
          <button
            type="button"
            className="icon-btn icon-search"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <SearchIcon />
          </button>
          <button type="button" className="icon-btn" aria-label="Bag">
            <BagIcon />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" id="site-menu" aria-label="Departments">
          <SuitFinderFeature onTakeQuiz={openQuiz} />
          {NAV.map((item) => (
            item === "Suits" ? (
              <div key={item} className="mobile-suits-wrap">
                <button
                  type="button"
                  className={current === "Suits" ? "is-current" : undefined}
                  aria-expanded={suitsOpen}
                  onClick={() => setSuitsOpen((open) => !open)}
                >
                  Suits
                </button>
                {suitsOpen && (
                  <div className="mobile-suits">
                    {SUITS_MENU.map((column) => (
                      <div key={column.title}>
                        <p>{column.title}</p>
                        {column.links.map((link) => (
                          <button key={link} type="button" onClick={() => choose("Suits")}>{link}</button>
                        ))}
                      </div>
                    ))}
                    <button type="button" onClick={() => choose("Suits")}>Shop all suits</button>
                  </div>
                )}
              </div>
            ) : (
              <button
                key={item}
                type="button"
                className={[item === current ? "is-current" : "", item === "Sale" ? "is-sale" : ""].filter(Boolean).join(" ") || undefined}
                onClick={() => choose(item)}
              >
                {item}
              </button>
            )
          ))}
        </nav>
      )}

      <div className="header-desktop">
        <div className="header-utility">
          <button className="logo" type="button" aria-label="Men's Wearhouse home" onClick={() => onNavigate?.("home")}>
            <img src="/mw-logo.svg" alt="" />
          </button>
          <form className="header-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search"
            />
            <button type="submit">Search</button>
          </form>
          <div className="header-links">
            <button type="button" className="text-link">
              <PinIcon />
              Find a Store
            </button>
            <button type="button" className="text-link">
              Sign In
            </button>
            <button type="button" className="icon-btn" aria-label="Bag">
              <BagIcon />
            </button>
          </div>
        </div>
        <nav className="primary-nav" aria-label="Primary">
          {NAV.map((item) => (
            item === "Suits" ? (
              <div
                key={item}
                className="nav-suits"
                onMouseEnter={() => setSuitsOpen(true)}
                onMouseLeave={() => setSuitsOpen(false)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setSuitsOpen(false);
                }}
              >
                <button
                  type="button"
                  className={current === "Suits" || suitsOpen ? "is-current" : undefined}
                  aria-expanded={suitsOpen}
                  aria-controls="suits-menu"
                  onClick={() => setSuitsOpen(true)}
                >
                  Suits
                </button>
                {suitsOpen && (
                  <div className="mega-menu" id="suits-menu" role="region" aria-label="Suits">
                    <div className="mega-columns">
                      {SUITS_MENU.map((column) => (
                        <div key={column.title}>
                          <p>{column.title}</p>
                          {column.links.map((link) => (
                            <button key={link} type="button" onClick={() => choose("Suits")}>{link}</button>
                          ))}
                        </div>
                      ))}
                      <button className="mega-all" type="button" onClick={() => choose("Suits")}>Shop all suits →</button>
                    </div>
                    <SuitFinderFeature onTakeQuiz={openQuiz} />
                  </div>
                )}
              </div>
            ) : (
              <button
                key={item}
                type="button"
                className={[item === current ? "is-current" : "", item === "Sale" ? "is-sale" : ""].filter(Boolean).join(" ") || undefined}
                onClick={() => choose(item)}
              >
                {item}
              </button>
            )
          ))}
        </nav>
      </div>

      {searchOpen && (
        <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="search-field">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search"
              autoFocus
            />
          </label>
        </form>
      )}
    </header>
  );
}

function SuitFinderFeature({ onTakeQuiz }) {
  return (
    <button className="nav-feature" type="button" onClick={onTakeQuiz}>
      <img src="/quiz/suit-finder-hero.jpg" alt="" />
      <span className="nav-feature-copy">
        <span className="nav-feature-kicker">AI Style Expert</span>
        <strong>What&apos;s the occasion? We&apos;ll find the suit.</strong>
        <span className="nav-feature-link">Take the suit quiz</span>
      </span>
    </button>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16.5 16.5 L20.5 20.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 8h11l-.7 12H7.2L6.5 8z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 8V6.8a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
