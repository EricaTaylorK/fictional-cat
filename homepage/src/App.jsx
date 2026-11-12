import { useEffect, useRef, useState } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import SiteFooter from "./components/SiteFooter.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import {
  arrivals,
  brandIntro,
  brands,
  categories,
  hero,
  panel,
  reassurance,
  returning,
  sale,
  wedding,
} from "./homeContent.js";

function stopNavigation(event) {
  event.preventDefault();
}

function panelRequested() {
  return new URLSearchParams(window.location.search).get("panel") === "open";
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Placeholder({ label, className = "", tone = "neutral", decorative = false, photo, position = "center 22%", zoom = 1 }) {
  if (photo) {
    return (
      <div
        className={`ph ph-photo ${className}`.trim()}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative ? true : undefined}
      >
        <img
          src={photo}
          alt=""
          style={{
            objectPosition: position,
            transform: zoom === 1 ? undefined : `scale(${zoom})`,
            transformOrigin: position,
          }}
        />
      </div>
    );
  }
  return (
    <div
      className={`ph ${className}`.trim()}
      data-tone={tone}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
    >
      <span className="ph-x" aria-hidden="true" />
      {label ? <span className="ph-chip t-caption">{label}</span> : null}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M5 12.5 9.5 17 19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReassureIcon({ src }) {
  const ref = useRef(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const animation = lottie.loadAnimation({
      container: ref.current,
      renderer: "svg",
      loop: true,
      autoplay: !reduce,
      path: src,
    });
    if (reduce) animation.addEventListener("DOMLoaded", () => animation.goToAndStop(0, true));
    return () => animation.destroy();
  }, [src]);

  return <div ref={ref} className="reassure-icon" aria-hidden="true" />;
}

function CategoryBand() {
  return (
    <section className="category-band" aria-label="Shop by category">
      <div className="category-layout">
        <div className="category-scroller">
          {categories.map((category) => (
            <a
              key={category.name}
              className="category-item"
              href={`#${category.name}`}
              onClick={stopNavigation}
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopPanel({ chipName, onClose, presetFirstSize }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const listRef = useRef(null);
  const cardRefs = useRef([]);
  const timers = useRef([]);
  const [activeItem, setActiveItem] = useState(0);
  const [sizes, setSizes] = useState(() =>
    panel.items.map((_, index) => (presetFirstSize && index === 0 ? "40" : ""))
  );
  const [added, setAdded] = useState(() => panel.items.map(() => false));

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    closeRef.current?.focus();

    function focusable() {
      if (!dialog) return [];
      return [...dialog.querySelectorAll("button, select, a[href]")].filter(
        (el) => !el.disabled && el.getAttribute("aria-hidden") !== "true"
      );
    }

    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function showItem(index) {
    setActiveItem(index);
    const list = listRef.current;
    const card = cardRefs.current[index];
    if (!list || !card) return;
    const top = list.scrollTop + (card.getBoundingClientRect().top - list.getBoundingClientRect().top);
    list.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  function chooseSize(index, value) {
    setSizes((current) => current.map((size, item) => (item === index ? value : size)));
  }

  function addToBag(index) {
    if (!sizes[index] || added[index]) return;
    setAdded((current) => current.map((value, item) => (item === index ? true : value)));
    window.clearTimeout(timers.current[index]);
    timers.current[index] = window.setTimeout(() => {
      setAdded((current) => current.map((value, item) => (item === index ? false : value)));
    }, 1500);
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        ref={dialogRef}
      >
        <header className="panel-head">
          <div>
            <h2 id="panel-title" className="t-h4">
              {wedding.headline}
            </h2>
            <p className="t-label panel-kicker">{chipName}</p>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" ref={closeRef} onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className="panel-strip">
          {panel.items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === activeItem ? "strip-btn is-selected" : "strip-btn"}
              aria-label={item.shot}
              onClick={() => showItem(index)}
            >
              <Placeholder label={item.shot} tone={item.tone} decorative />
            </button>
          ))}
        </div>
        <div className="panel-list" ref={listRef}>
          {panel.items.map((item, index) => (
            <article
              key={item.id}
              className="bag-card"
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
            >
              <Placeholder className="bag-photo" label={item.shot} tone={item.tone} />
              <div className="bag-copy">
                <p className="t-label">{item.name}</p>
                <p className="t-price">{item.price}</p>
                <select
                  aria-label={panel.sizeLabel}
                  value={sizes[index]}
                  onChange={(event) => chooseSize(index, event.target.value)}
                >
                  <option value="">{panel.sizeLabel}</option>
                  {panel.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-btn"
                  disabled={!sizes[index]}
                  aria-label={panel.addToBag}
                  onClick={() => addToBag(index)}
                >
                  {added[index] ? <CheckIcon /> : panel.addToBag}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function OccasionModule() {
  const ctaRef = useRef(null);
  const preset = useRef(panelRequested());
  const [open, setOpen] = useState(() => panelRequested());
  const wasOpen = useRef(false);
  const groom = wedding.chips.find((item) => item.name === "Groom") ?? wedding.chips[0];

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return undefined;
    }
    if (wasOpen.current) ctaRef.current?.focus();
    return undefined;
  }, [open]);

  return (
    <section className="occasion" aria-label="Gifts He'll Love">
      <div className="gifts-band">
        <div className="gifts-copy">
          <h2 className="gifts-title">Gifts He’ll Love</h2>
          <p className="gifts-deck">Find a thoughtful gift that fits his style—and every occasion.</p>
          <a
            className="gifts-cta"
            href="#gifts"
            ref={ctaRef}
            onClick={(event) => {
              stopNavigation(event);
              setOpen(true);
            }}
          >
            Shop Gifts
          </a>
        </div>
        <div className="gifts-suitcase">
          <img src="/gifts/suitcase.jpg" alt="Open suitcase packed with scarves, gloves, and a knit hat" />
        </div>
        <div className="gifts-still-wrap">
          <div className="gifts-still">
            <img src="/gifts/still.jpg" alt="Fragrance bottles and a Man Bar soap beside a sprig of cedar" />
          </div>
          <img className="gifts-seal" src="/gifts/seal.png" alt="" aria-hidden="true" />
        </div>
      </div>
      {open ? (
        <ShopPanel
          chipName={groom.name}
          presetFirstSize={preset.current}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </section>
  );
}

function HolidayBanner() {
  return (
    <section className="holiday" aria-label="Holiday">
      <div className="holiday-banner">
        <video
          className="holiday-video"
          src="/holiday/holiday-party.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="holiday-center">
          <div className="holiday-lockup">
            <h1 className="holiday-title">Holiday Party, Handled.</h1>
            <a className="holiday-cta" href="#holiday" onClick={stopNavigation}>
              {hero.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShippingBanner() {
  return (
    <div className="ship-bar" role="region" aria-label="Holiday shipping">
      <p className="ship-copy">
        <span className="ship-kicker">Order by Dec 15</span>
        <span className="ship-offer">Free shipping</span>
        <span className="ship-support">Arrives by Christmas</span>
      </p>
    </div>
  );
}

function SalePanel() {
  return (
    <section className="sale-panel" id="sale" aria-labelledby="sale-heading">
      <h2 id="sale-heading" className="t-h2 sale-heading">
        {sale.heading}
      </h2>
      <div className="sale-mosaic">
        <a
          className="sale-feature"
          href={`#${sale.feature.id}`}
          aria-label={sale.feature.label}
          onClick={stopNavigation}
        >
          <Placeholder className="sale-ph" decorative photo={sale.feature.photo} position={sale.feature.position} />
          <span className="sale-caption">{sale.feature.caption}</span>
        </a>
        <div className="sale-grid">
          {sale.tiles.map((tile) => (
            <a
              key={tile.id}
              className="sale-tile"
              href={`#${tile.id}`}
              aria-label={tile.label}
              onClick={stopNavigation}
            >
              <Placeholder className="sale-ph" decorative photo={tile.photo} position={tile.position} zoom={tile.zoom} />
              <span className="sale-caption">{tile.caption}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Campaign({ title, deck, cta, shot, tone, label }) {
  return (
    <section className="campaign" aria-label={label}>
      <Placeholder className="campaign-media" label={shot} tone={tone} />
      <div className="campaign-copy">
        <h2 className="t-h2">{title}</h2>
        <p className="t-deck">{deck}</p>
        <a className="cta" href={`#${label}`} onClick={stopNavigation}>
          {cta}
        </a>
      </div>
    </section>
  );
}

function NewArrivals() {
  return (
    <section className="arrivals" aria-labelledby="new-arrivals-heading">
      <h2 id="new-arrivals-heading" className="t-h2 arrivals-heading">
        {arrivals.heading}
      </h2>
      <ul className="arrivals-row">
        {arrivals.tiles.map((tile) => (
          <li key={tile.id} className="arrival-tile" data-bar={tile.bar}>
            <a className="arrival-link" href={`#${tile.id}`} aria-label={tile.cta} onClick={stopNavigation}>
              <span className="arrival-photo">
                <img src={tile.photo} alt="" style={{ objectPosition: tile.position }} />
              </span>
              <span className="arrival-tweed" aria-hidden="true" />
              <span className="arrival-caption">
                <span className="arrival-label">{tile.name}</span>
                <span className="arrival-arrow" aria-hidden="true" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BrandWord({ brand }) {
  if (brand.id === "cole") {
    return (
      <span className="brand-word word-cole">
        <span>Cole Haan</span>
        <span className="word-est">Est. 1928</span>
      </span>
    );
  }
  return <span className={`brand-word word-${brand.id}`}>{brand.name}</span>;
}

function BrandTiles() {
  return (
    <section className="brands" aria-labelledby="brands-heading">
      <div className="brands-photo" aria-hidden="true" />
      <div className="brands-inner">
        <div className="brands-head">
          <div className="brands-copy">
            <h2 id="brands-heading" className="brands-heading">
              {brandIntro.heading}
            </h2>
            <p className="brands-deck">{brandIntro.deck}</p>
          </div>
          <a className="brands-all" href="#brands" onClick={stopNavigation}>
            {brandIntro.link}
          </a>
        </div>
        <ul className="brands-row">
          {brands.map((brand) => (
            <li key={brand.id}>
              <a className="brand-circle" href={`#${brand.id}`} aria-label={brand.cta} onClick={stopNavigation}>
                <BrandWord brand={brand} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Returning() {
  const scrollerRef = useRef(null);
  const [bar, setBar] = useState(120);

  function measure() {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(".returning-card");
    const cardWidth = card ? card.getBoundingClientRect().width : el.clientWidth / 3;
    const max = el.scrollWidth - el.clientWidth;
    const progress = max <= 1 ? 1 : el.scrollLeft / max;
    setBar(cardWidth + progress * Math.max(0, el.clientWidth - cardWidth));
  }

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function showNext() {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(".returning-card");
    const delta = (card?.getBoundingClientRect().width || 240) + 16;
    const max = el.scrollWidth - el.clientWidth;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    if (el.scrollLeft >= max - 8) el.scrollTo({ left: 0, behavior });
    else el.scrollBy({ left: delta, behavior });
  }

  return (
    <section className="returning" aria-label="Returning visitor">
      <div className="returning-copy">
        <h2 className="t-h2">
          Pick up
          <br />
          where you
          <br />
          left off
        </h2>
        <p className="t-deck">{returning.subhead}</p>
        <a className="t-link returning-link" href="#recently-viewed" onClick={stopNavigation}>
          {returning.link}
        </a>
      </div>
      <div className="returning-stage">
        <div
          className="returning-scroller"
          ref={scrollerRef}
          onScroll={measure}
        >
          {returning.items.map((item) => (
            <article key={item.name} className="returning-card">
              <div className="returning-frame">
                <Placeholder label={item.shot} tone="recent" photo={item.photo} position={item.position} zoom={item.zoom} />
              </div>
              <p className="t-label">{item.name}</p>
              <p className="t-price returning-price">{item.price}</p>
            </article>
          ))}
        </div>
        <button type="button" className="returning-next" aria-label="Next" onClick={showNext}>
          <ArrowIcon />
        </button>
        <div className="returning-progress" aria-hidden="true">
          <span style={{ width: `${bar}px` }} />
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [search, setSearch] = useState("");

  return (
    <div className="page" id="top">
      <SiteHeader search={search} onSearch={setSearch} />
      <main>
        <HolidayBanner />
        <CategoryBand />
        <OccasionModule />
        <NewArrivals />
        <ShippingBanner />
        <SalePanel />
        <section className="reassure" aria-label="Reassurance">
          <ul className="reassure-list">
            {reassurance.items.map((item) => (
              <li key={item.icon}>
                <ReassureIcon src={item.icon} />
                <h3 className="reassure-title">{item.title}</h3>
                <p className="t-body">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
        <Returning />
        <BrandTiles />
      </main>
      <SiteFooter />
    </div>
  );
}
