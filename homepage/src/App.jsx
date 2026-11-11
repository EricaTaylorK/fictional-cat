import { useEffect, useRef, useState } from "react";
import SiteFooter from "./components/SiteFooter.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import { Flourish, FlourishRule } from "./flourish.jsx";
import {
  arrivalTiles,
  arrivals,
  brandHeading,
  brands,
  categories,
  hero,
  occasionHeading,
  occasionLooks,
  reassurance,
  returning,
  salePath,
  seasonal,
} from "./homeContent.js";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduce;
}

function tabId(name) {
  return `occasion-tab-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

function preloadLook(look) {
  const image = new Image();
  image.src = look.image;
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Maps a point on an object-fit: cover image to a fraction of its frame.
function coverPoint(point, aspect, frame, focus) {
  if (aspect < frame) {
    const visible = aspect / frame;
    return { x: point.x, y: (point.y - focus.y * (1 - visible)) / visible };
  }
  const visible = frame / aspect;
  return { x: (point.x - focus.x * (1 - visible)) / visible, y: point.y };
}

const CARD_ASPECT = 4 / 5;

function cropStyle(crop, aspect) {
  const visible = aspect < CARD_ASPECT ? aspect / CARD_ASPECT : CARD_ASPECT / aspect;
  const axis = aspect < CARD_ASPECT ? "y" : "x";
  const focus = { x: 0.5, y: 0.5, [axis]: clamp((crop[axis] - visible / 2) / (1 - visible), 0, 1) };
  const p = coverPoint(crop, aspect, CARD_ASPECT, focus);
  const shift = (v) => clamp(0.5 - v, 1 - (v + (1 - v) * crop.zoom), -v * (1 - crop.zoom));
  return {
    objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
    transformOrigin: `${p.x * 100}% ${p.y * 100}%`,
    transform: `translate(${shift(p.x) * 100}%, ${shift(p.y) * 100}%) scale(${crop.zoom})`,
  };
}

function useFrameAspect() {
  const ref = useRef(null);
  const [aspect, setAspect] = useState(CARD_ASPECT);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setAspect(width / height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, aspect];
}

function FadeSlot({ current, previous, className, render, slotRef }) {
  return (
    <div className={className} ref={slotRef}>
      {previous ? render(previous, "is-out") : null}
      {render(current, previous ? "is-in" : "")}
    </div>
  );
}

function BrandMark({ tile }) {
  if (tile.mark === "ck") {
    return (
      <span className="brand-mark is-ck">
        <span className="ck-mono">CK</span>
        <span className="ck-name">Calvin Klein</span>
      </span>
    );
  }
  if (tile.mark === "mk") {
    return (
      <span className="brand-mark is-mk">
        <span className="mk-badge">MK</span>
        <span className="mk-name">Michael Kors</span>
      </span>
    );
  }
  if (tile.mark === "th") {
    return (
      <span className="brand-mark is-th">
        <span>Tommy Hilfiger</span>
      </span>
    );
  }
  return <span className={`brand-mark is-${tile.mark}`}>{tile.name}</span>;
}

function LookModule({ occasion, occasionName, onSelect }) {
  const reduce = usePrefersReducedMotion();
  const [shown, setShown] = useState(occasion);
  const [leaving, setLeaving] = useState(null);

  if (occasion.name !== shown.name) {
    setShown(occasion);
    setLeaving(reduce ? null : shown);
  }

  const [photoRef, frameAspect] = useFrameAspect();
  const [activePiece, setActivePiece] = useState(null);

  useEffect(() => {
    if (!leaving) return undefined;
    const timeout = window.setTimeout(() => setLeaving(null), 560);
    return () => window.clearTimeout(timeout);
  }, [leaving]);

  useEffect(() => setActivePiece(null), [shown.name]);

  return (
    <section className="occasion-module" aria-label="Shop by occasion">
      <h2 className="type-h2" id="occasion-heading">{occasionHeading}</h2>
      <div className="occasion-row" role="tablist" aria-labelledby="occasion-heading">
        {occasionLooks.map((item) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            id={tabId(item.name)}
            aria-selected={item.name === occasionName}
            aria-controls="occasion-panel"
            className={item.name === occasionName ? "is-selected" : undefined}
            onClick={() => onSelect(item.name)}
            onMouseEnter={() => preloadLook(item)}
            onFocus={() => preloadLook(item)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="look-stage">
      <FadeSlot
        className="look-photo-stack"
        slotRef={photoRef}
        current={shown}
        previous={leaving}
        render={(look, phase) => (
          <figure
            key={phase === "is-out" ? `${look.name}-out` : look.name}
            className={phase ? `look-photo editorial-frame lined ${phase}` : "look-photo editorial-frame lined"}
            style={{ "--shell": look.shell }}
            inert={phase === "is-out" ? true : undefined}
            aria-hidden={phase === "is-out" ? true : undefined}
          >
            <img
              className="editorial"
              src={look.image}
              alt=""
              style={{ objectPosition: `${look.focus.x * 100}% ${look.focus.y * 100}%` }}
            />
            <div className="look-markers" aria-hidden="true">
              {look.pieces.map((piece, index) => {
                const point = coverPoint(piece.at, look.aspect, frameAspect, look.focus);
                return (
                  <span
                    key={piece.name}
                    className={activePiece === index && phase !== "is-out" ? "look-marker is-active" : "look-marker"}
                    style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
                  >
                    {index + 1}
                  </span>
                );
              })}
            </div>
            <figcaption>
              <p className="eyebrow eyebrow-on-dark"><span>{look.eyebrow}</span></p>
              <h2 className="type-h1">{look.line}</h2>
            </figcaption>
          </figure>
        )}
      />
      <FadeSlot
        className="stories-look-stack"
        current={shown}
        previous={leaving}
        render={(look, phase) => (
          <div
            key={phase === "is-out" ? `${look.name}-look-out` : `${look.name}-look`}
            className={phase ? `stories-look ${phase}` : "stories-look"}
            id={phase === "is-out" ? undefined : "occasion-panel"}
            role={phase === "is-out" ? undefined : "tabpanel"}
            aria-labelledby={phase === "is-out" ? undefined : tabId(look.name)}
            inert={phase === "is-out" ? true : undefined}
            aria-hidden={phase === "is-out" ? true : undefined}
          >
            <div className="stories-products">
              {look.pieces.map((piece, index) => (
                <button
                  key={piece.name}
                  type="button"
                  className="product-card"
                  aria-label={`${piece.name}, view product`}
                  onMouseEnter={() => setActivePiece(index)}
                  onMouseLeave={() => setActivePiece(null)}
                  onFocus={() => setActivePiece(index)}
                  onBlur={() => setActivePiece(null)}
                >
                  <span className="product-photo editorial-frame">
                    <img className="editorial" src={look.image} alt="" style={cropStyle(piece.crop, look.aspect)} />
                    <span className="look-marker" aria-hidden="true">{index + 1}</span>
                  </span>
                  <span className="type-h3">{piece.name}</span>
                  <span className="product-price">{piece.price}</span>
                  <span className="type-cta product-shop is-outline">Shop</span>
                </button>
              ))}
            </div>
            <button type="button" className="type-cta stories-cta">
              {look.cta}
            </button>
          </div>
        )}
      />
      </div>
    </section>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [occasionName, setOccasionName] = useState(occasionLooks[0].name);
  const occasion = occasionLooks.find((item) => item.name === occasionName) ?? occasionLooks[0];

  return (
    <div className="page" id="top">
      <SiteHeader search={search} onSearch={setSearch} />
      <main>
        <section className="category-module" aria-label="Category entry tiles">
          <svg className="category-arch-def" aria-hidden="true" focusable="false">
            <clipPath id="category-arch" clipPathUnits="objectBoundingBox">
              <path d="M0,1 L0,0.4138 A0.5,0.4138 0 0 1 1,0.4138 L1,1 Z" />
            </clipPath>
          </svg>
          <div className="category-row">
            {categories.map((tile) => (
              <button key={tile.name} type="button" className="category-tile" aria-label={tile.cta}>
                <span className="category-arch editorial-frame">
                  <img className="editorial" src={tile.image} alt="" style={{ objectPosition: tile.focus, objectViewBox: tile.view }} />
                </span>
                <span className="category-name">{tile.name}</span>
              </button>
            ))}
          </div>
        </section>
        <div className="home">
          <section className="hero" aria-label="Primary hero">
            <figure className="hero-photo editorial-frame" style={{ "--shell": hero.shell }}>
              <img className="editorial" src={hero.image} alt="" />
              <figcaption className="photo-caption">
                <button type="button" className="type-cta is-light">
                  {hero.cta}
                </button>
              </figcaption>
            </figure>
          </section>

          <section className="seasonal" aria-label="Seasonal campaign slots">
            <div className="holiday-band">
              <figure className="holiday-photo editorial-frame">
                <img className="editorial" src="/editorial/holiday-sportcoat.jpg" alt="" />
              </figure>
              <div className="holiday-panel">
                <div className="holiday-rule" aria-hidden="true">
                  <span />
                  <Flourish />
                  <span />
                </div>
                <h2 className="holiday-line">{seasonal.line}</h2>
                <Flourish className="holiday-scroll" />
                <button type="button" className="type-cta is-light holiday-cta">{seasonal.cta}</button>
              </div>
              <figure className="holiday-photo editorial-frame">
                <img className="editorial" src="/editorial/holiday-roulette.jpg" alt="" />
              </figure>
            </div>
          </section>

          <section className="arrivals" aria-label="New arrivals">
            <div className="arrivals-title">
              <span className="arrivals-rule" aria-hidden="true" />
              <h2>{arrivals.title}</h2>
              <span className="arrivals-rule" aria-hidden="true" />
            </div>
            <p className="arrivals-line">{arrivals.line}</p>
            <div className="arrivals-row">
              {arrivalTiles.map((tile) => (
                <article key={tile.label} className="arrival-tile">
                  <div className="arrival-photo editorial-frame">
                    <img className="editorial" src={tile.image} alt="" style={{ objectPosition: tile.focus }} />
                  </div>
                  <p className="arrival-bar" style={{ background: tile.bar }}>{tile.label}</p>
                </article>
              ))}
            </div>
            <button type="button" className="type-cta arrivals-cta is-outline">{arrivals.cta}</button>
          </section>

          <section className="sale-path" aria-label="Sale path">
            <figure className="sale-banner editorial-frame" style={{ "--shell": salePath.shell }}>
              <img className="editorial" src={salePath.image} alt="" style={{ objectPosition: salePath.focus }} />
              <figcaption className="photo-caption">
                <p className="type-h3">{salePath.title}</p>
                <p className="type-body">{salePath.line}</p>
                <button type="button" className="type-cta is-light">{salePath.cta}</button>
              </figcaption>
            </figure>
          </section>

          <FlourishRule />

          <LookModule occasion={occasion} occasionName={occasionName} onSelect={setOccasionName} />

          <FlourishRule />

          <section aria-label="Brand tiles">
            <h3 className="brand-heading">{brandHeading}</h3>
            <div className="brand-row">
              {brands.map((tile) => (
                <button
                  key={tile.name}
                  type="button"
                  className="brand-card"
                  aria-label={tile.cta}
                >
                  <span className="brand-tile editorial-frame" style={{ "--scrim": tile.scrim, "--view": tile.view }}>
                    <img className="editorial" src={tile.image} alt="" style={{ objectPosition: tile.focus }} />
                    <span className="brand-scrim" aria-hidden="true" />
                    <BrandMark tile={tile} />
                  </span>
                  <span className="brand-bar" style={{ background: tile.bar }} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section aria-label="Returning visitor">
            <div className="wire-box">
              <p className="wire-note">Shown only to returning visitors</p>
              <h2>{returning.headline}</h2>
              <p>{returning.subhead}</p>
              <div className="recent-row">
                {returning.items.map((item, index) => (
                  <div key={index} className="wire-box wire-recent">
                    {item}
                  </div>
                ))}
              </div>
              <button type="button" className="type-cta is-outline">{returning.link}</button>
            </div>
          </section>
        </div>

        <section className="reassure-module" aria-label="Reassurance strip">
          <div className="reassure">
            <Flourish variant="sprig" />
            <p>{reassurance.visible}</p>
            <Flourish variant="sprig" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
