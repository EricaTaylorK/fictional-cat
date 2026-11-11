import { useEffect, useRef, useState } from "react";
import {
  arrivals,
  brands,
  categories,
  categoryHeading,
  hero,
  panel,
  reassurance,
  returning,
  sale,
  secondaryTiles,
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

function Placeholder({ label, className = "", tone = "neutral", decorative = false }) {
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

function CategoryBand() {
  return (
    <section className="category-band" aria-label="Shop by category">
      <div className="category-layout">
        <h2 className="t-h2 category-heading">
          <span>{categoryHeading.line1}</span>
          <span>{categoryHeading.line2}</span>
        </h2>
        <div className="category-scroller">
          {categories.map((category) => (
            <a
              key={category.name}
              className="category-item"
              href={`#${category.name}`}
              aria-label={category.cta}
              onClick={stopNavigation}
            >
              <img src={category.image} alt="" />
              <span className="t-h4">{category.name}</span>
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
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(() => panelRequested());
  const wasOpen = useRef(false);
  const chip = wedding.chips[selected];

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return undefined;
    }
    if (wasOpen.current) ctaRef.current?.focus();
    return undefined;
  }, [open]);

  function moveChip(event, index) {
    let next = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % wedding.chips.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + wedding.chips.length) % wedding.chips.length;
    }
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    const target = next;
    window.requestAnimationFrame(() => {
      document.getElementById(`occasion-chip-${target}`)?.focus();
    });
  }

  return (
    <section className="occasion" aria-label={wedding.headline}>
      <div className="occasion-scene">
        {wedding.chips.map((item, index) => (
          <div
            key={item.name}
            className={index === selected ? "scene-layer is-active" : "scene-layer"}
            aria-hidden={index === selected ? undefined : true}
          >
            <Placeholder label={item.shot} tone={item.tone} />
          </div>
        ))}
        <div className="occasion-scrim" />
        <div className="occasion-copy">
          <h2 className="t-h2">{wedding.headline}</h2>
          <p className="t-deck">{wedding.deck}</p>
          <div className="chip-row" role="radiogroup" aria-label={wedding.headline}>
            {wedding.chips.map((item, index) => (
              <button
                key={item.name}
                id={`occasion-chip-${index}`}
                type="button"
                role="radio"
                aria-checked={index === selected}
                tabIndex={index === selected ? 0 : -1}
                className={index === selected ? "chip is-selected" : "chip"}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => moveChip(event, index)}
              >
                <Placeholder className="chip-thumb" label={item.shot} tone={item.tone} decorative />
                <span className="chip-name" id={`occasion-chip-label-${index}`}>
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="cta is-outline occasion-cta"
          ref={ctaRef}
          onClick={() => setOpen(true)}
        >
          {wedding.cta}
        </button>
      </div>
      <div className="secondary-grid">
        {secondaryTiles.map((tile) => (
          <a
            key={tile.name}
            className="secondary-tile"
            href={`#${tile.name}`}
            aria-label={tile.name}
            onClick={stopNavigation}
          >
            <Placeholder label={tile.shot} tone={tile.tone} />
            <span className="t-h4">{tile.name}</span>
          </a>
        ))}
      </div>
      {open ? (
        <ShopPanel
          chipName={chip.name}
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
        <div className="holiday-photo holiday-photo-left">
          <img className="photo" src="/editorial/navy-check-holiday.jpg" alt={hero.leftAlt} />
          <img className="pine pine-left" src="/holiday/pine-left.svg" alt="" />
        </div>
        <div className="holiday-center">
          <span className="holiday-snow" aria-hidden="true" />
          <h1 className="holiday-title">{hero.headline}</h1>
          <a className="holiday-cta" href="#holiday" onClick={stopNavigation}>
            {hero.cta}
          </a>
        </div>
        <div className="holiday-photo holiday-photo-right">
          <img className="photo" src="/holiday/fireplace.jpg" alt={hero.rightAlt} />
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

function BrandTiles() {
  return (
    <section aria-label="Brands">
      <ul className="brand-grid">
        {brands.map((brand) => (
          <li key={brand.name}>
            <h3 className="t-h3 brand-word">{brand.name}</h3>
            <p className="t-label">{brand.descriptor}</p>
            <a className="t-link" href={`#${brand.name}`} onClick={stopNavigation}>
              {brand.cta}
            </a>
          </li>
        ))}
      </ul>
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
                <Placeholder label={item.shot} tone="recent" />
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
  return (
    <div className="page" id="top">
      <div className="bar bar-header" aria-hidden="true" />
      <main>
        <CategoryBand />
        <OccasionModule />
        <HolidayBanner />
        <Campaign
          label="Sale"
          title={sale.headline}
          deck={sale.deck}
          cta={sale.cta}
          shot={sale.shot}
          tone="sale"
        />
        <Campaign
          label="New arrivals"
          title={arrivals.headline}
          deck={arrivals.deck}
          cta={arrivals.cta}
          shot={arrivals.shot}
          tone="arrivals"
        />
        <BrandTiles />
        <Returning />
        <section className="reassure" aria-label="Reassurance">
          <p className="t-label">{reassurance.visible}</p>
        </section>
      </main>
      <div className="bar bar-footer" aria-hidden="true" />
    </div>
  );
}
