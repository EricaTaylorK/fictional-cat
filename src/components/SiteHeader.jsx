import { useState } from "react";

const NAV = [
  "Suits",
  "Sport Coats",
  "Dress Shirts",
  "Casual Tops & Jackets",
  "Pants",
  "Shoes",
  "Accessories",
  "Trending",
  "Sale",
  "Rental",
];

export default function SiteHeader({ search, onSearch, onNavigate }) {
  const [searchOpen, setSearchOpen] = useState(Boolean(search));

  return (
    <header className="site-header">
      <div className="promo">
        <p>
          New markdowns — clearance up to 70% off original prices |{" "}
          <a href="#suits">Shop now &gt;</a>
        </p>
      </div>

      <div className="header-bar header-bar-mobile">
        <button type="button" className="icon-btn" aria-label="Open menu">
          <MenuIcon />
        </button>
        <a className="logo" href="#suits" aria-label="Men's Wearhouse">
          <img src="/mw-logo.svg" alt="" />
        </a>
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

      <div className="header-desktop">
        <div className="header-utility">
          <a className="logo" href="#suits" aria-label="Men's Wearhouse">
            <img src="/mw-logo.svg" alt="" />
          </a>
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
            <button
              key={item}
              type="button"
              className={item === "Suits" ? "is-current" : undefined}
              onClick={() => {
                if (item === "Rental") onNavigate?.("look");
                if (item === "Suits") onNavigate?.("suits");
              }}
            >
              {item}
            </button>
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
              aria-label="Search suits"
              autoFocus
            />
          </label>
        </form>
      )}
    </header>
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
