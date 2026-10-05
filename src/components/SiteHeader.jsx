import { useState } from "react";

export default function SiteHeader({ search, onSearch }) {
  const [searchOpen, setSearchOpen] = useState(Boolean(search));

  return (
    <header className="site-header">
      <div className="promo">
        <p>
          Clearance up to 75% off original prices | <a href="#suits">Shop now &gt;</a>
        </p>
      </div>
      <div className="header-bar">
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
      {searchOpen && (
        <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="search-field">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search suits"
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
