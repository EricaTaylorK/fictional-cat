export default function SiteHeader({ search, onSearch }) {
  return (
    <header className="site-header">
      <div className="promo">Suits from $39 — Free shipping on orders $99+</div>
      <div className="header-bar">
        <a className="logo" href="#suits">
          Men&apos;s Wearhouse
        </a>
        <div className="header-icons">
          <button type="button" className="icon-btn" aria-label="Account">
            <AccountIcon />
          </button>
          <button type="button" className="icon-btn" aria-label="Bag">
            <BagIcon />
          </button>
        </div>
      </div>
      <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search-field">
          <SearchIcon />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search suits"
            aria-label="Search suits"
          />
        </label>
      </form>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.2 15.2 L20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19.2c1.4-3 3.8-4.4 7-4.4s5.6 1.4 7 4.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 8.5h11l-.8 11h-9.4l-.8-11z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
