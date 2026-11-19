import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import lottie from "lottie-web/build/player/lottie_light";

// Static assets exported from Figma ("MW Homepage — Refined (Holiday)", frame 5:51).
// They live in public/v2 and are listed in scripts/figma-assets.txt.
const A = (path) => `/v2/${path}`;

function stop(event) {
  event.preventDefault();
}

/* ---------- Global navigation ---------- */

const navLinks = [
  "Suits",
  "Sport Coats & Blazers",
  "Dress Shirts",
  "Pants",
  "Shoes",
  "Outerwear",
  "Accessories",
  "Casual",
  "Brands",
  "Wedding",
  "Featured",
  "Rental",
];

function GlobalNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="nav">
      {/* Mobile + tablet bar, below 1024 (Replatform "Global Navigation / Mobile") */}
      <div className="nav-mobile">
        <div className="nav-mobile-start">
          <button
            type="button"
            className="nav-icon-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="nav-drawer"
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            <img src={A("nav/menu.svg")} alt="" width="32" height="32" />
          </button>
          <a className="nav-mobile-logo" href="#" onClick={stop} aria-label="Men's Wearhouse home">
            <img src={A("nav/logo-mobile.svg")} alt="" width="168" height="9" />
          </a>
        </div>
        <div className="nav-mobile-end">
          <button
            type="button"
            className="nav-icon-btn"
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-controls="nav-mobile-search"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMenuOpen(false);
            }}
          >
            <img src={A("nav/search-mobile.svg")} alt="" width="32" height="32" />
          </button>
          <a className="nav-icon-btn" href="#" onClick={stop} aria-label="Bag">
            <img src={A("nav/bag-mobile.svg")} alt="" width="32" height="32" />
          </a>
        </div>
      </div>
      {searchOpen ? (
        <form id="nav-mobile-search" className="nav-mobile-search" role="search" onSubmit={stop}>
          <input type="search" placeholder="What are you looking for?" aria-label="Search" autoFocus />
        </form>
      ) : null}
      {menuOpen ? (
        <nav id="nav-drawer" className="nav-drawer" aria-label="Main">
          {navLinks.map((label) => (
            <a key={label} href="#" onClick={stop}>
              {label}
            </a>
          ))}
          <a className="nav-sale" href="#" onClick={stop}>
            Sale
          </a>
        </nav>
      ) : null}

      {/* Desktop bar, 1024 and up */}
      <div className="nav-utility">
        <a className="nav-logo" href="#" onClick={stop} aria-label="Men's Wearhouse home">
          <img src={A("nav/logo.svg")} alt="" width="256" height="14" />
        </a>
        <form className="nav-search" role="search" onSubmit={stop}>
          <input type="search" placeholder="What are you looking for?" aria-label="Search" />
          <button type="submit" aria-label="Search">
            <img src={A("nav/search.svg")} alt="" width="24" height="24" />
          </button>
        </form>
        <div className="nav-utility-items">
          <a className="nav-store" href="#" onClick={stop}>
            <img src={A("nav/pin.svg")} alt="" width="24" height="24" />
            Find a Store
          </a>
          <button type="button" className="nav-account">
            <span className="nav-account-label">
              <img src={A("nav/profile.svg")} alt="" width="24" height="24" />
              Sign in
            </span>
            <img src={A("nav/chevron-down.svg")} alt="" width="24" height="24" />
          </button>
          <a className="nav-bag" href="#" onClick={stop} aria-label="Bag">
            <img src={A("nav/bag.svg")} alt="" width="24" height="24" />
          </a>
        </div>
      </div>
      <nav className="nav-links" aria-label="Main">
        {navLinks.map((label) => (
          <a key={label} href="#" onClick={stop}>
            {label}
          </a>
        ))}
        <a className="nav-sale" href="#" onClick={stop}>
          <img src={A("nav/sale.svg")} alt="" width="24" height="24" />
          Sale
        </a>
      </nav>
    </header>
  );
}

/* ---------- Shared bits ---------- */

function TextureButton({ children, tone = "burgundy", href = "#" }) {
  return (
    <a className={`tex-btn tex-btn--${tone} t-cta`} href={href} onClick={stop}>
      <span>{children}</span>
    </a>
  );
}

function ShopTheLook({ look, onOpen }) {
  return (
    <button
      type="button"
      className="look-btn"
      aria-haspopup="dialog"
      aria-label={`Shop the look: ${look.title}`}
      onClick={(event) => onOpen(look.id, event.currentTarget)}
    >
      <span className="look-btn-label t-cta">Shop the look</span>
      <span className="look-btn-plus" aria-hidden="true">
        +
      </span>
    </button>
  );
}

/* ---------- Shop the look ---------- */

// Pieces visible on the model in each photo. No catalog data exists for these
// looks yet, so each piece links to its existing nav category instead of a SKU.
// Thumbnails are crops of the look photo itself (size = zoom, pos = focal point).
const looks = {
  office: {
    id: "office",
    title: "The Office Party",
    photo: "realworld/office-party.png",
    items: [
      { name: "Cable-knit turtleneck sweater", category: "Casual", size: "230%", pos: "55% 46%" },
      { name: "Charcoal trousers", category: "Pants", size: "240%", pos: "58% 94%" },
    ],
  },
  family: {
    id: "family",
    title: "The Family Gathering",
    photo: "realworld/family-gathering.png",
    items: [
      { name: "Shearling-collar jacket", category: "Outerwear", size: "190%", pos: "40% 46%" },
      { name: "Plaid flannel shirt", category: "Casual Shirts", size: "320%", pos: "54% 52%" },
      { name: "Jeans", category: "Jeans & Chinos", size: "300%", pos: "78% 100%" },
    ],
  },
};

function LookDrawer({ look, onClose, returnFocusTo }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const reduced = usePrefersReducedMotion();

  const close = () => {
    if (reduced) onClose();
    else setClosing(true);
  };

  // Finish closing even if the exit animation never reports back (e.g. background tab)
  useEffect(() => {
    if (!closing) return undefined;
    const timer = setTimeout(onClose, 320);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

  useEffect(() => {
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        // keep focus inside the dialog
        const focusable = panelRef.current.querySelectorAll("a[href], button:not([disabled])");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      returnFocusTo?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className={`look-layer${closing ? " is-closing" : ""}`} onAnimationEnd={(e) => closing && e.target === panelRef.current && onClose()}>
      <div className="look-scrim" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        className="look-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="look-title"
      >
        <div className="look-head">
          <div>
            <p className="t-eyebrow look-kicker">Shop the look</p>
            <h2 id="look-title" className="t-h4">{look.title}</h2>
          </div>
          <button ref={closeRef} type="button" className="look-close" onClick={close} aria-label="Close">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <div className="look-hero">
          <img src={A(look.photo)} alt={`${look.title} look`} />
        </div>
        <p className="t-small look-count">
          {look.items.length} pieces in this look
        </p>
        <ul className="look-items">
          {look.items.map((item) => (
            <li key={item.name} className="look-item">
              <span
                className="look-thumb"
                role="img"
                aria-label={`${item.name}, as worn in ${look.title}`}
                style={{
                  backgroundImage: `url(${A(look.photo)})`,
                  backgroundSize: item.size,
                  backgroundPosition: item.pos,
                }}
              />
              <span className="look-item-copy">
                <span className="t-body look-item-name">{item.name}</span>
                <a className="t-cta look-item-link" href="#" onClick={stop}>
                  Shop {item.category}
                </a>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}

/* ---------- Hero ---------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

// Hero video: muted + playsInline so browsers allow autoplay. The still (Figma's
// video poster) shows until it plays, if playback fails, and under reduced motion.
function HeroVideo() {
  const videoRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    if (reduced) {
      video.pause();
      return;
    }
    const start = () => {
      const attempt = video.play();
      if (attempt) attempt.catch(() => setPlaying(false)); // autoplay blocked: poster stays
    };
    start();
    // browsers pause background-tab video; pick back up when the page is visible again
    const onVisible = () => document.visibilityState === "visible" && !userPaused.current && start();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reduced, failed]);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  }

  return (
    <>
      <img className="hero-photo" src={A("hero/hero.png")} alt="" />
      {failed ? null : (
        <video
          ref={videoRef}
          className={`hero-photo hero-video${playing ? " is-playing" : ""}`}
          src={A("hero/holiday-party.mp4")}
          poster={A("hero/hero.png")}
          muted
          loop
          playsInline
          autoPlay={!reduced}
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      )}
      {failed ? null : (
        <button
          type="button"
          className="hero-pause"
          onClick={toggle}
          aria-label={playing ? "Pause background video" : "Play background video"}
        >
          {playing ? (
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M5 3l8 5-8 5z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </>
  );
}

function Hero() {
  return (
    <section className="hero">
      <HeroVideo />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-lockup">
        <p className="hero-eyebrow t-eyebrow-lg">Holiday Party, Handled.</p>
        <h1 className="hero-title t-display">Show Up Ready for Every Holiday Party.</h1>
        <TextureButton>Shop holiday outfits</TextureButton>
      </div>
    </section>
  );
}

/* ---------- Category tags ---------- */

// swing: "right" = rotate 3deg, "still" = none, "left" = rotate -3deg (Figma variants).
// The first six carry Figma's category icons; the rest are existing nav categories
// shown as label-only kraft tags, revealed by the arrows / swipe.
const tags = [
  { label: "Gifts", icon: "gifts", swing: "right" },
  { label: "Accessories", icon: "accessories", swing: "still" },
  { label: "Casual Shirts", icon: "casual-shirts", swing: "left" },
  { label: "Suits", icon: "suits", swing: "right" },
  { label: "Jeans & Chinos", icon: "jeans-chinos", swing: "still" },
  { label: "Outerwear", icon: "outerwear", swing: "left" },
  { label: "Dress Shirts", swing: "right" },
  { label: "Pants", swing: "still" },
  { label: "Shoes", swing: "left" },
  { label: "Wedding", swing: "right" },
];

// Shared rail behaviour: arrow buttons, edge state, mouse drag, and a callback
// when scrolling comes to rest (used for the tag wiggle).
function useRail({ onSettle } = {}) {
  const railRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const reduced = usePrefersReducedMotion();
  const drag = useRef(null);
  const moved = useRef(false);

  const measure = () => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    measure();
    let timer;
    const settle = () => onSettle && onSettle();
    const onScroll = () => {
      measure();
      // Safari has no scrollend yet: settle after scrolling pauses
      if (!("onscrollend" in window)) {
        clearTimeout(timer);
        timer = setTimeout(settle, 140);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", settle);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", settle);
      window.removeEventListener("resize", measure);
    };
  }, [onSettle]);

  function step(direction) {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth" });
  }

  // Mouse drag to scroll (touch and trackpads scroll natively)
  const dragHandlers = {
    onPointerDown(event) {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = { x: event.clientX, left: railRef.current.scrollLeft };
      moved.current = false;
    },
    onPointerMove(event) {
      if (!drag.current) return;
      const dx = event.clientX - drag.current.x;
      if (Math.abs(dx) > 4) {
        moved.current = true;
        railRef.current.classList.add("is-dragging");
        railRef.current.setPointerCapture?.(event.pointerId);
      }
      railRef.current.scrollLeft = drag.current.left - dx;
    },
    onPointerUp() {
      if (!drag.current) return;
      drag.current = null;
      railRef.current.classList.remove("is-dragging");
      if (moved.current && onSettle) onSettle();
    },
    onClickCapture(event) {
      // a drag shouldn't also follow the link under the pointer
      if (moved.current) {
        event.preventDefault();
        event.stopPropagation();
        moved.current = false;
      }
    },
  };

  return { railRef, edges, step, dragHandlers };
}

// Prev / next buttons drawn from Figma's brush-arrow artwork (tags/arrows.svg)
function BrushArrows({ edges, step, controls, label }) {
  return (
    <div className="brush-arrows" role="group" aria-label={`${label} navigation`}>
      <button
        type="button"
        className="brush-arrow brush-arrow--prev"
        onClick={() => step(-1)}
        disabled={edges.start}
        aria-controls={controls}
        aria-label={`Previous ${label}`}
      >
        <span aria-hidden="true" />
      </button>
      <span className="brush-arrows-rule" aria-hidden="true" />
      <button
        type="button"
        className="brush-arrow brush-arrow--next"
        onClick={() => step(1)}
        disabled={edges.end}
        aria-controls={controls}
        aria-label={`More ${label}`}
      >
        <span aria-hidden="true" />
      </button>
    </div>
  );
}

function CategoryTags() {
  const reduced = usePrefersReducedMotion();
  const [settling, setSettling] = useState(0);
  const onSettle = useRef(() => {});
  onSettle.current = () => {
    if (!reduced) setSettling((n) => n + 1);
  };
  const stableSettle = useRef(() => onSettle.current()).current;
  const { railRef, edges, step, dragHandlers } = useRail({ onSettle: stableSettle });

  return (
    <section className="tags" aria-label="Shop by category">
      <div className="tags-head">
        <h2 className="tags-title t-h4">
          Oh What Fun It Is to Buy... <em>(or Something Like That)</em>
        </h2>
        <div className="tags-actions">
          <a className="link-caps t-cta" href="#" onClick={stop}>
            Shop All
          </a>
          <BrushArrows edges={edges} step={step} controls="tag-rail" label="categories" />
        </div>
      </div>
      <div
        id="tag-rail"
        ref={railRef}
        className="tags-row"
        // re-keying the class restarts the wiggle each time scrolling settles
        data-settle={settling % 2}
        {...dragHandlers}
      >
        {tags.map((tag, index) => (
          <a
            key={tag.label}
            className={`tag-slot${settling ? (settling % 2 ? " is-wiggle-a" : " is-wiggle-b") : ""}`}
            style={{ "--i": index % 4 }}
            href="#"
            onClick={stop}
            draggable={false}
          >
            <span className={`tag tag--${tag.swing}${tag.icon ? "" : " tag--plain"}`}>
              <img className="tag-body" src={A("tags/kraft.svg")} alt="" width="132" height="184" draggable={false} />
              <img className="tag-washer" src={A("tags/washer.svg")} alt="" width="21" height="21" draggable={false} />
              {tag.icon ? (
                <img className="tag-icon" src={A(`tags/${tag.icon}.svg`)} alt="" width="72" height="72" draggable={false} />
              ) : null}
              <span className="tag-label t-label">{tag.label}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------- Gifts ---------- */

function Gifts() {
  return (
    <section className="gifts">
      {/* Collage box = Figma's x 431–1440 strip; children are % of it so it scales as one piece */}
      <div className="gifts-collage">
        <div className="gifts-suitcase">
          <img src={A("gifts/suitcase.png")} alt="" />
        </div>
        <div className="gifts-still">
          <img src={A("gifts/still.png")} alt="" />
        </div>
        {/* Kraft washi tape holding the still to the board (Figma canvas nodes 35:4772 / 35:4773) */}
        <img className="gifts-tape gifts-tape--top" src={A("gifts/tape-top.png")} alt="" />
        <img className="gifts-tape gifts-tape--bottom" src={A("gifts/tape-bottom.png")} alt="" />
        <img className="gifts-seal" src={A("gifts/wax-seal.png")} alt="" />
      </div>
      <div className="gifts-copy">
        <h2 className="gifts-title t-h2">Gifts That Feel Like Him</h2>
        <p className="gifts-body t-body">
          From everyday favorites to party-ready finishing touches, find a gift he’ll reach for long after the holidays.
        </p>
        <div className="gifts-cta">
          <TextureButton tone="ivory">Shop gifts for him</TextureButton>
        </div>
      </div>
    </section>
  );
}

/* ---------- Holiday, in the real world ---------- */

function RealWorld() {
  const [open, setOpen] = useState(null);
  const trigger = useRef(null);
  const openLook = (id, element) => {
    trigger.current = element;
    setOpen(id);
  };

  return (
    <section className="real">
      <div className="real-accent" aria-hidden="true" />
      <div className="real-head">
        <div className="real-titles">
          <p className="eyebrow t-eyebrow">A little know-how goes a long way</p>
          <h2 className="h-section t-h1">Ready for the Moments That Matter</h2>
          <p className="real-deck t-lead">
            For generations, we’ve helped men get dressed for life’s big moments—and all the ones in between.
          </p>
        </div>
        {/* Figma "Love patch" (48:635): 281 x 195 patch tilted 4deg in a 302 x 214 frame.
            Image is the original embroidered artwork, cut out at 2.4x Figma's fill resolution. */}
        <div className="real-patch">
          <img src={A("realworld/love-patch-hd.png")} alt="Love, Men’s Wearhouse" width="504" height="349" />
        </div>
      </div>
      <div className="real-row">
        <article className="real-tile real-tile--office">
          <img className="real-office-photo" src={A("realworld/office-party.png")} alt="" />
          <h3 className="real-office-title t-eyebrow-lg t-wide">The Office Party</h3>
          <div className="real-office-cta">
            <ShopTheLook look={looks.office} onOpen={openLook} />
          </div>
        </article>
        <article className="real-tile real-tile--family">
          <img className="real-family-photo" src={A("realworld/family-gathering.png")} alt="" />
          <div className="real-family-scrim" aria-hidden="true" />
          <div className="real-family-copy">
            <h3 className="real-family-title t-eyebrow-lg t-wide">The Family Gathering</h3>
            <ShopTheLook look={looks.family} onOpen={openLook} />
          </div>
        </article>
      </div>
      {open ? <LookDrawer look={looks[open]} onClose={() => setOpen(null)} returnFocusTo={trigger.current} /> : null}
    </section>
  );
}

/* ---------- The Sale Edit ---------- */

function SaleEdit() {
  return (
    <section className="sale">
      <div className="sale-head">
        <h2 className="h-section t-h1">The Holiday Sale</h2>
        <a className="link-caps link-caps--dark sale-all t-cta" href="#" onClick={stop}>
          Shop all sale styles
        </a>
      </div>
      <div className="sale-grid">
        <a className="sale-suits" href="#" onClick={stop}>
          <img className="sale-suits-photo" src={A("sale/suits.png")} alt="" width="600" height="717" />
          <span className="sale-shade" aria-hidden="true" />
          <span className="sale-shade" aria-hidden="true" />
          <span className="sale-label t-eyebrow-lg">
            Suits
            <img src={A("sale/arrow.svg")} alt="" width="40" height="9" />
          </span>
        </a>
        <div className="sale-pair">
          <div className="sale-blank" aria-label="Sport coats" />
          <div className="sale-blank" aria-label="Dress shirts" />
        </div>
      </div>
    </section>
  );
}

/* ---------- Shipping banner ---------- */

function ShippingBanner() {
  return (
    <section className="ship" aria-label="Holiday shipping">
      <p className="ship-caps t-eyebrow-lg">Order by Dec 15</p>
      <p className="ship-title t-h4">Free Shipping</p>
      <p className="ship-caps t-eyebrow-lg">Arrives by Christmas</p>
    </section>
  );
}

/* ---------- New Arrivals ---------- */

// Card rail used by New Arrivals and Recently Viewed: native scroll (swipe / trackpad),
// arrows that step one card and disable at the ends, and a progress bar that follows.
function useCardRail() {
  const railRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const reduced = usePrefersReducedMotion();

  const measure = () => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const step = (direction) => {
    const el = railRef.current;
    const card = el.firstElementChild;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const amount = card ? card.getBoundingClientRect().width + gap : el.clientWidth;
    el.scrollBy({ left: direction * amount, behavior: reduced ? "auto" : "smooth" });
  };

  return { railRef, progress, edges, step, onScroll: measure };
}

// Section actions, same as the category band: a "shop all" link + brush arrows
function RailActions({ rail, controls, label, linkText }) {
  return (
    <div className="rail-actions">
      <a className="link-caps link-caps--dark t-cta" href="#" onClick={stop}>
        {linkText}
      </a>
      <BrushArrows edges={rail.edges} step={rail.step} controls={controls} label={label} />
    </div>
  );
}

// Thin progress track under the cards
function RailProgress({ rail }) {
  return (
    <span className="rail-track" aria-hidden="true">
      <span className="rail-progress" style={{ "--progress": rail.progress }} />
    </span>
  );
}

// Figma "Image assets" new-arrival fills, labelled with the matching nav categories
const arrivals = [
  { label: "Sport Coats", photo: "arrivals/coat.png" },
  { label: "Suits", photo: "arrivals/suit.png" },
  { label: "Dress Shirts", photo: "arrivals/shirt.png" },
  { label: "Shoes", photo: "arrivals/shoes.png" },
];

function NewArrivals() {
  const rail = useCardRail();
  return (
    <section className="arrivals">
      <div className="arrivals-head">
        <h2 className="arrivals-title t-h2">Just In: New-Season Styles</h2>
        <RailActions rail={rail} controls="arrivals-rail" label="new-season styles" linkText="Shop All" />
      </div>
      <div className="arrivals-carousel">
        <div
          id="arrivals-rail"
          ref={rail.railRef}
          onScroll={rail.onScroll}
          className="arrivals-row"
          role="region"
          aria-label="New-season styles"
        >
          {arrivals.map((item) => (
            <a key={item.label} className="arrival" href="#" onClick={stop}>
              <img className="arrival-photo" src={A(item.photo)} alt="" />
              <span className="arrival-shade" aria-hidden="true" />
              <span className="arrival-label t-eyebrow-lg">
                {item.label}
                <img className="arrival-arrow" src={A("sale/arrow.svg")} alt="" width="40" height="9" />
              </span>
            </a>
          ))}
        </div>
        <RailProgress rail={rail} />
      </div>
    </section>
  );
}

/* ---------- Reassurance ---------- */

const reassurance = [
  { icon: "truck", title: "Free Shipping", body: "On orders over $99." },
  { icon: "inbox", title: "Easy Returns", body: "Return in store or by mail, free." },
  { icon: "shopping-bag", title: "Free Store Pickup", body: "Pick up in store or have your order shipped there." },
];

// Animated line icon (Lottie). Plays once when it scrolls into view and again on
// hover / focus of its item; holds the first frame under reduced motion.
function LottieIcon({ name, playKey }) {
  const ref = useRef(null);
  const anim = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: ref.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: A(`reassure/${name}.json`),
    });
    anim.current = animation;
    let observer;
    animation.addEventListener("DOMLoaded", () => {
      animation.goToAndStop(0, true);
      if (reduced) return;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            animation.goToAndPlay(0, true);
            observer.disconnect();
          }
        },
        { threshold: 0.6 }
      );
      observer.observe(ref.current);
    });
    return () => {
      observer?.disconnect();
      animation.destroy();
    };
  }, [name, reduced]);

  useEffect(() => {
    if (playKey && !reduced) anim.current?.goToAndPlay(0, true);
  }, [playKey, reduced]);

  return <span ref={ref} className="reassure-icon" aria-hidden="true" />;
}

function ReassureItem({ item }) {
  const [playKey, setPlayKey] = useState(0);
  const replay = () => setPlayKey((n) => n + 1);
  return (
    <div className="reassure-item" onMouseEnter={replay} onFocus={replay}>
      <LottieIcon name={item.icon} playKey={playKey} />
      <p className="reassure-title t-h4">{item.title}</p>
      <p className="reassure-body t-body">{item.body}</p>
    </div>
  );
}

function Reassurance() {
  return (
    <section className="reassure">
      {reassurance.map((item) => (
        <ReassureItem key={item.title} item={item} />
      ))}
    </section>
  );
}

/* ---------- Recently viewed ---------- */

const recent = [
  { name: "Egara Golden Santa Socks, 1-Pair, Gray", price: "$16", photo: "recent/sock-1.png" },
  { name: "Egara Snowmen Socks, 1-Pair, Gray", price: "$16", photo: "recent/sock-2.png" },
  { name: "Egara Surfing Santa Socks, 1-Pair, Black", price: "$16", photo: "recent/sock-3.png" },
  { name: "Joseph Abboud Golf Pattern Performance Socks, 1-Pair, Blue", price: "$18", photo: "recent/sock-4.png" },
  { name: "Egara Party Socks, 1-Pair, Gray", price: "$15", photo: "recent/sock-5.png" },
];

// The card row scrolls natively (swipe on touch, the Next button on desktop);
// the progress bar follows the scroll position.
function RecentlyViewed() {
  const rail = useCardRail();

  return (
    <section className="recent">
      <div className="recent-copy">
        <h2 className="recent-title t-h2">Still Thinking It Over?</h2>
        <p className="recent-deck t-body">Your recently viewed styles are right here.</p>
      </div>
      <div className="recent-carousel">
        <RailActions rail={rail} controls="recent-rail" label="recently viewed items" linkText="View All Recently Viewed" />
        <div
          id="recent-rail"
          className="recent-cards"
          ref={rail.railRef}
          onScroll={rail.onScroll}
          role="region"
          aria-label="Recently viewed products"
        >
          {recent.map((card) => (
            <a key={card.name} className="recent-card t-small" href="#" onClick={stop}>
              <span className="recent-photo-wrap">
                <img className="recent-photo" src={A(card.photo)} alt="" />
              </span>
              <span className="recent-name">{card.name}</span>
              <span className="recent-price">{card.price}</span>
            </a>
          ))}
        </div>
        <RailProgress rail={rail} />
      </div>
    </section>
  );
}

/* ---------- Brands ---------- */

const brands = [
  { name: "Kenneth Cole", style: "kenneth" },
  { name: "Calvin Klein", style: "calvin" },
  { name: "Cole Haan", style: "cole", sub: "Est. 1928" },
  { name: "Tommy Hilfiger", style: "tommy" },
  { name: "Michael Kors", style: "kors" },
];

function Brands() {
  return (
    <section className="brands">
      <div className="brands-head">
        <h2 className="brands-title t-h3">Holiday-Ready Brands</h2>
        <p className="brands-deck t-lead">Standout styles from the brands you wear, all in one place.</p>
      </div>
      <div className="brands-row">
        {brands.map((brand) => (
          <a key={brand.name} className="badge" href="#" onClick={stop}>
            <span className="badge-stitch">
              <span className={`badge-name badge-name--${brand.style}`}>
                {brand.name}
                {brand.sub ? <span className="badge-sub">{brand.sub}</span> : null}
              </span>
            </span>
          </a>
        ))}
      </div>
      <a className="link-caps link-caps--white t-cta" href="#" onClick={stop}>
        Shop All
      </a>
    </section>
  );
}

/* ---------- Footer ---------- */

const footerColumns = [
  { title: "Company", links: ["The MW Story", "Careers", "Investor Relations", "Store Locator"] },
  {
    title: "Customer Services",
    links: ["Help & FAQs", "Rental FAQs", "Shipping", "Returns & Exchanges", "Track My Order", "Contact Us", "Feedback"],
  },
  {
    title: "Quick Links",
    links: [
      "Site Map",
      "Gift Cards",
      "Perfect Fit Rewards",
      "Coupons and Deals",
      "Threadworthy Blog",
      "Prom Advice & Trends",
      "All Brands",
      "Jos.A.Bank Clothiers",
      "Gift List",
    ],
  },
];

const socials = [
  { label: "X", icon: "x" },
  { label: "Facebook", icon: "facebook" },
  { label: "Instagram", icon: "instagram" },
  { label: "YouTube", icon: "youtube" },
  { label: "Pinterest", icon: "pinterest" },
  { label: "TikTok", icon: "tiktok" },
];

// Link group: a plain column on desktop, an accordion row below 768 (Replatform "Footer / Mobile").
function FooterColumn({ title, children }) {
  const [open, setOpen] = useState(false);
  const id = `footer-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className={`footer-col${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="footer-col-title"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <img className="footer-col-chevron" src={A("footer/chevron-down.svg")} alt="" width="24" height="24" />
      </button>
      <ul id={id}>{children}</ul>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="refer">
        <p className="refer-title">Give $20, Get $20!</p>
        <div className="refer-copy">
          <p>Give friends $20 off their first order,</p>
          <p>and you’ll get $20 when they make a purchase!</p>
        </div>
        <a className="refer-btn" href="#" onClick={stop}>
          Refer a friend
        </a>
      </div>
      <div className="footer-main">
        <div className="footer-links">
          {footerColumns.map((column) => (
            <FooterColumn key={column.title} title={column.title}>
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#" onClick={stop}>
                    {link}
                  </a>
                </li>
              ))}
            </FooterColumn>
          ))}
          <FooterColumn title="Follow">
              {socials.map((social) => (
                <li key={social.label}>
                  <a className="footer-social" href="#" onClick={stop}>
                    <span className={`footer-social-icon footer-social-icon--${social.icon}`}>
                      <img src={A(`footer/${social.icon}.svg`)} alt="" />
                    </span>
                    {social.label}
                  </a>
                </li>
              ))}
          </FooterColumn>
          <form className="footer-optin" onSubmit={stop}>
            <div className="footer-optin-top">
            <p className="footer-optin-title">Be the first to know about new arrivals, promotions and more</p>
            <div className="footer-fields">
              <label className="footer-field">
                <img src={A("footer/mail.svg")} alt="" width="24" height="24" />
                <input type="email" placeholder="Email Address" aria-label="Email Address" />
              </label>
              <label className="footer-field">
                <img src={A("footer/phone.svg")} alt="" width="24" height="24" />
                <input type="tel" placeholder="Phone Number" aria-label="Phone Number" />
              </label>
            </div>
            </div>
            <p className="footer-texts">
              <img src={A("footer/curved-arrow.svg")} alt="" width="24" height="24" />
              <span>
                Sign up for texts and get $20 Off $100+ instantly! <a href="#" onClick={stop}>*Terms Apply</a>
              </span>
            </p>
          </form>
        </div>
        <div className="footer-secondary">
          <div className="footer-terms">
            <a href="#" onClick={stop}>Mobile Terms</a>
            <span className="dot">·</span>
            <a className="footer-privacy" href="#" onClick={stop}>Privacy &amp; Security Policy</a>
            <span className="dot">·</span>
            <a className="footer-dns" href="#" onClick={stop}>Do Not Sell Or Share My Personal Information</a>
            <span className="dot">·</span>
            <a href="#" onClick={stop}>Terms of Use</a>
            <span className="dot">·</span>
            <a href="#" onClick={stop}>CA Transparency in Supply Chains Act</a>
            <span className="dot">·</span>
            <a className="footer-a11y" href="#" onClick={stop}>
              Accessibility Standards
              <span className="footer-a11y-icons">
                <img src={A("footer/physical-access.svg")} alt="" width="24" height="24" />
                <img src={A("footer/control-access.svg")} alt="" width="24" height="24" />
                <span className="footer-a11y-digital">
                  <img src={A("footer/digital-access.svg")} alt="" />
                </span>
              </span>
            </a>
          </div>
          <img className="footer-divider" src={A("footer/divider.svg")} alt="" />
          <div className="footer-bottom">
            <p>© 2000-2026 The Men's Wearhouse, Inc. All Rights Reserved.</p>
            <img src={A("footer/norton.png")} alt="Secured" width="84" height="44" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="page">
      <GlobalNav />
      <main>
        <Hero />
        <CategoryTags />
        <Gifts />
        <RealWorld />
        <SaleEdit />
        <ShippingBanner />
        <NewArrivals />
        <Reassurance />
        <RecentlyViewed />
        <Brands />
      </main>
      <Footer />
    </div>
  );
}
