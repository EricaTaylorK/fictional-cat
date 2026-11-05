import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useDesktop from "../hooks/useDesktop.js";
import { CompactCard } from "../../suit-quiz/src/components/entries/SuitFinderEntries.jsx";
import { quizHref, trackEntryClick } from "../../suit-quiz/src/components/entries/quizEntry.js";

const HOVER_MS = 150;
const FADE_MS = 170;

const DEPARTMENTS = [
  { id: "suits", label: "Suits", shopAll: "Shop All Suits", destination: "sale" },
  { id: "sport-coats", label: "Sport Coats", shopAll: "Shop all Sport Coats", destination: "sale" },
  { id: "shirts", label: "Shirts", shopAll: "Shop all Shirts", destination: "sale" },
  { id: "jackets", label: "Jackets & Sweaters", shopAll: "Shop all Jackets & Sweaters", destination: "sale" },
  { id: "pants", label: "Pants", shopAll: "Shop all Pants", destination: "sale" },
  { id: "shoes", label: "Shoes", shopAll: "Shop all Shoes", destination: "sale" },
  { id: "accessories", label: "Accessories", shopAll: "Shop all Accessories", destination: "sale" },
  { id: "trending", label: "Trending", shopAll: "Shop all Trending", destination: "sale" },
  { id: "sale", label: "Sale", shopAll: "Shop all Sale", destination: "sale" },
  { id: "rental", label: "Rental", shopAll: "Shop all Rental", destination: "look" },
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

const SUIT_PROMO = {
  headline: "Made for Every “I Do”",
  link: "Shop Wedding Suits",
  image: "/suits/suit-navy.jpg",
  destination: "sale",
};

const UTILITIES = ["Find a Store", "Sign In"];

function accountLabel(name) {
  const text = String(name).trim();
  if (text.length <= 20) return text;
  return `${text.slice(0, 20)}…`;
}

function departmentById(id) {
  return DEPARTMENTS.find((item) => item.id === id) ?? null;
}

function focusableIn(root) {
  if (!root) return [];
  return [...root.querySelectorAll("button, a[href]")].filter((element) => {
    if (element.disabled || element.closest("[hidden]")) return false;
    return element.getClientRects().length > 0;
  });
}

export default function SiteHeader({ search, onSearch, onNavigate, onFindSuit, current, accountName }) {
  const desktop = useDesktop();
  const [searchOpen, setSearchOpen] = useState(Boolean(search));
  const [menuOpen, setMenuOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [mobilePanel, setMobilePanel] = useState(null);
  const [shownId, setShownId] = useState(null);
  const [phase, setPhase] = useState("in");
  const [columnShift, setColumnShift] = useState(0);

  const menuRef = useRef(null);
  const drawerRef = useRef(null);
  const mobileNavRef = useRef(null);
  const menuButtonRef = useRef(null);
  const backRef = useRef(null);
  const buttonRefs = useRef({});
  const hoverTimer = useRef(null);
  const hoverTarget = useRef(null);
  const pendingFocus = useRef(false);
  const shownIdRef = useRef(null);
  const restoreMobileFocus = useRef(null);

  function clearHover() {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    hoverTarget.current = null;
  }

  function closeMenus() {
    clearHover();
    setOpenId(null);
    setMenuOpen(false);
    setMobilePanel(null);
  }

  function go(destination) {
    closeMenus();
    onNavigate?.(destination);
  }

  function openQuiz() {
    closeMenus();
    if (onFindSuit) onFindSuit();
    else window.location.assign(quizHref("nav-mega"));
  }

  function startQuiz() {
    trackEntryClick("nav-mega");
    openQuiz();
  }

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  useEffect(() => {
    setOpenId(null);
    setMenuOpen(false);
    setMobilePanel(null);
    clearHover();
  }, [desktop]);

  useEffect(() => {
    function onPopState() {
      clearHover();
      setOpenId(null);
      setMenuOpen(false);
      setMobilePanel(null);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!openId) {
      shownIdRef.current = null;
      setShownId(null);
      setPhase("in");
      return undefined;
    }
    if (shownIdRef.current == null || shownIdRef.current === openId) {
      shownIdRef.current = openId;
      setShownId(openId);
      setPhase("in");
      return undefined;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      shownIdRef.current = openId;
      setShownId(openId);
      setPhase("in");
      return undefined;
    }
    setPhase("out");
    const timer = window.setTimeout(() => {
      shownIdRef.current = openId;
      setShownId(openId);
      setPhase("in");
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [openId]);

  useLayoutEffect(() => {
    if (!desktop || !openId) return undefined;
    function align() {
      const suits = buttonRefs.current.suits;
      const drawer = drawerRef.current;
      if (!suits || !drawer) return;
      const next = Math.max(0, Math.round(suits.getBoundingClientRect().left - drawer.getBoundingClientRect().left - 52));
      setColumnShift((currentShift) => (currentShift === next ? currentShift : next));
    }
    align();
    window.addEventListener("resize", align);
    return () => window.removeEventListener("resize", align);
  }, [desktop, openId, shownId]);

  useEffect(() => {
    if (!desktop || !openId || shownId !== openId || phase !== "in" || !pendingFocus.current) return;
    drawerRef.current?.querySelector(".dept-panel button, .dept-panel a")?.focus();
    pendingFocus.current = false;
  }, [desktop, openId, shownId, phase]);

  useEffect(() => {
    if (!openId && !menuOpen) return undefined;
    function onPointerDown(event) {
      const path = event.composedPath();
      if (menuRef.current && path.includes(menuRef.current)) return;
      if (mobileNavRef.current && path.includes(mobileNavRef.current)) return;
      if (menuButtonRef.current && path.includes(menuButtonRef.current)) return;
      clearHover();
      setOpenId(null);
      setMenuOpen(false);
      setMobilePanel(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openId, menuOpen]);

  useEffect(() => {
    if (!desktop || !openId) return undefined;
    const drawer = drawerRef.current;
    if (!drawer) return undefined;
    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        const id = openId;
        clearHover();
        setOpenId(null);
        buttonRefs.current[id]?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusableIn(drawer);
      if (!items.length) return;
      const root = drawer.getRootNode();
      const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
      const first = items[0];
      const last = items[items.length - 1];
      if (!drawer.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [desktop, openId, shownId]);

  useEffect(() => {
    if (desktop || !menuOpen) return undefined;
    const nav = mobileNavRef.current;
    if (!nav) return undefined;
    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (mobilePanel) {
          restoreMobileFocus.current = mobilePanel;
          setMobilePanel(null);
        } else {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusableIn(nav);
      if (!items.length) return;
      const root = nav.getRootNode();
      const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
      const first = items[0];
      const last = items[items.length - 1];
      if (!nav.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [desktop, menuOpen, mobilePanel]);

  useEffect(() => {
    if (desktop || !mobilePanel) return;
    backRef.current?.focus();
  }, [desktop, mobilePanel]);

  useEffect(() => {
    if (mobilePanel || !restoreMobileFocus.current) return;
    const id = restoreMobileFocus.current;
    restoreMobileFocus.current = null;
    buttonRefs.current[id]?.focus();
  }, [mobilePanel]);

  function setL1Ref(id) {
    return (node) => {
      buttonRefs.current[id] = node;
    };
  }

  function onDesktopL1Click(event, id) {
    if (openId === id) {
      clearHover();
      setOpenId(null);
      return;
    }
    clearHover();
    pendingFocus.current = event.detail === 0;
    setOpenId(id);
  }

  function onL1Enter(id) {
    if (!desktop || !openId || openId === id) {
      if (openId === id) clearHover();
      return;
    }
    clearTimeout(hoverTimer.current);
    hoverTarget.current = id;
    hoverTimer.current = window.setTimeout(() => {
      if (hoverTarget.current === id) setOpenId(id);
    }, HOVER_MS);
  }

  function onL1Leave(id) {
    if (hoverTarget.current === id) clearHover();
  }

  function l1Class(item, open) {
    return [
      item.label === current ? "is-current" : "",
      item.label === "Sale" ? "is-sale" : "",
      open ? "is-open" : "",
    ].filter(Boolean).join(" ") || undefined;
  }

  const active = departmentById(shownId || openId);
  const mobileDepartment = departmentById(mobilePanel);

  return (
    <header className="site-header">
      <div className="promo">
        <p>
          New markdowns — clearance up to 70% off original prices |{" "}
          <button type="button" className="promo-link" onClick={() => go("sale")}>Shop now &gt;</button>
        </p>
      </div>

      {desktop ? (
        <div className="header-desktop">
          <div className="header-utility">
            <button className="logo" type="button" aria-label="Men's Wearhouse home" onClick={() => go("home")}>
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
              {accountName ? (
                <a className="text-link account-name" href="/myAccount">
                  <span className="account-name-text">{accountLabel(accountName)}</span>
                </a>
              ) : (
                <button type="button" className="text-link">
                  Sign In
                </button>
              )}
              <button type="button" className="icon-btn" aria-label="Bag">
                <BagIcon />
              </button>
            </div>
          </div>
          <div className="primary-nav-wrap" ref={menuRef}>
            <nav className="primary-nav" aria-label="Primary">
              {DEPARTMENTS.map((item) => (
                <button
                  key={item.id}
                  ref={setL1Ref(item.id)}
                  type="button"
                  className={l1Class(item, openId === item.id)}
                  aria-expanded={openId === item.id}
                  aria-controls="dept-drawer"
                  onClick={(event) => onDesktopL1Click(event, item.id)}
                  onMouseEnter={() => onL1Enter(item.id)}
                  onMouseLeave={() => onL1Leave(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            {openId && active && (
              <div className="dept-drawer" id="dept-drawer" role="region" aria-label={active.label} ref={drawerRef}>
                <div className={`dept-panel${phase === "out" ? " is-out" : ""}`}>
                  <div className="dept-main" style={{ marginLeft: columnShift }}>
                    {active.id === "suits" && (
                      <div className="dept-columns">
                        {SUITS_MENU.map((column) => (
                          <div key={column.title}>
                            <p className="dept-kicker">{column.title}</p>
                            <ul>
                              {column.title === "Suiting" && (
                                <li>
                                  <button type="button" className="dept-link dept-link-quiz" onClick={startQuiz}>Suit Finder</button>
                                </li>
                              )}
                              {column.links.map((link) => (
                                <li key={link}>
                                  <button type="button" className="dept-link" onClick={() => go("sale")}>{link}</button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" className="dept-shopall" onClick={() => go(active.destination)}>
                      <span>{active.shopAll}</span>
                      <ArrowIcon />
                    </button>
                  </div>
                  {active.id === "suits" && (
                    <div className="dept-promos">
                      <CompactCard entrypoint="nav-mega" onActivate={openQuiz} />
                      <button
                        type="button"
                        className="dept-feature"
                        onClick={() => go(SUIT_PROMO.destination)}
                      >
                        <img src={SUIT_PROMO.image} alt="" />
                        <span className="dept-feature-copy">
                          <strong>{SUIT_PROMO.headline}</strong>
                          <span>{SUIT_PROMO.link}</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="header-bar header-bar-mobile">
            <button
              ref={menuButtonRef}
              type="button"
              className="icon-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => {
                setMenuOpen((open) => !open);
                setMobilePanel(null);
              }}
            >
              <MenuIcon />
            </button>
            <button className="logo" type="button" aria-label="Men's Wearhouse home" onClick={() => go("home")}>
              <img src="/mw-logo.svg" alt="" />
            </button>
            <div className="header-icons">
              {accountName && (
                <a className="account-name" href="/myAccount">
                  <span className="account-name-text">{accountLabel(accountName)}</span>
                </a>
              )}
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
            <>
              <div className="mobile-backdrop" onPointerDown={closeMenus} />
              <nav className="mobile-nav" id="site-menu" aria-label="Departments" ref={mobileNavRef}>
                <div hidden={mobileDepartment ? true : undefined}>
                  {DEPARTMENTS.map((item) => (
                    <button
                      key={item.id}
                      ref={setL1Ref(item.id)}
                      type="button"
                      className={l1Class(item, mobilePanel === item.id) ? `mobile-l1 ${l1Class(item, mobilePanel === item.id)}` : "mobile-l1"}
                      aria-expanded={mobilePanel === item.id}
                      aria-controls="mobile-dept-panel"
                      onClick={() => setMobilePanel(item.id)}
                    >
                      <span>{item.label}</span>
                      <ChevronIcon />
                    </button>
                  ))}
                  <MobileUtilities accountName={accountName} />
                </div>
                {mobileDepartment && (
                  <MobilePanel
                    department={mobileDepartment}
                    backRef={backRef}
                    onBack={() => {
                      restoreMobileFocus.current = mobileDepartment.id;
                      setMobilePanel(null);
                    }}
                    onGo={go}
                    onFindSuit={startQuiz}
                    accountName={accountName}
                  />
                )}
              </nav>
            </>
          )}

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
        </>
      )}
    </header>
  );
}

function MobilePanel({ department, backRef, onBack, onGo, onFindSuit, accountName }) {
  const suits = department.id === "suits";
  return (
    <div className="mobile-panel" id="mobile-dept-panel" role="region" aria-label={department.label}>
      <button ref={backRef} type="button" className="mobile-back" onClick={onBack}>
        <ChevronLeftIcon />
        Back
      </button>
      <button type="button" className="dept-shopall" onClick={() => onGo(department.destination)}>
        <span>{department.shopAll}</span>
        <ArrowIcon />
      </button>
      {suits && (
        <button type="button" className="suit-finder-link" onClick={onFindSuit}>
          Suit Finder
        </button>
      )}
      {suits && SUITS_MENU.map((column) => (
        <div key={column.title} className="mobile-group">
          <p className="dept-kicker">{column.title}</p>
          {column.links.map((link) => (
            <button key={link} type="button" className="dept-link" onClick={() => onGo("sale")}>{link}</button>
          ))}
        </div>
      ))}
      {suits && (
        <button type="button" className="mobile-feature" onClick={() => onGo(SUIT_PROMO.destination)}>
          <img src={SUIT_PROMO.image} alt="" />
          <span className="dept-feature-copy">
            <strong>{SUIT_PROMO.headline}</strong>
            <span>{SUIT_PROMO.link}</span>
          </span>
        </button>
      )}
      <MobileUtilities accountName={accountName} />
    </div>
  );
}

function MobileUtilities({ accountName }) {
  return (
    <div className="mobile-utilities">
      {UTILITIES.map((label) => (
        label === "Sign In" && accountName ? (
          <a key={label} className="mobile-utility" href="/myAccount">{accountLabel(accountName)}</a>
        ) : (
          <button key={label} type="button" className="mobile-utility">{label}</button>
        )
      ))}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg className="dept-arrow" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="dept-chevron" viewBox="0 0 16 16" aria-hidden="true">
      <path d="m6 3.5 4.5 4.5L6 12.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="dept-chevron" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3.5 5.5 8 10 12.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
