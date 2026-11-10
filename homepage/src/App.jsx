import { useEffect, useRef, useState } from "react";
import SiteFooter from "./components/SiteFooter.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import { Flourish, FlourishRule } from "./flourish.jsx";
import { CategorySpot } from "./spots.jsx";
import {
  brandHeading,
  brands,
  categories,
  categoryEyebrow,
  hero,
  occasionHeading,
  occasionLooks,
  reassurance,
  returning,
  rotating,
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

function OccasionModule({ occasion, onSelect }) {
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
      <div className="stories">
        <div className="stories-bg-stack" aria-hidden="true">
          {leaving ? (
            <div
              key={`${leaving.image}-out`}
              className="stories-bg is-out"
              style={{ backgroundImage: `url("${leaving.image}")` }}
            />
          ) : null}
          <div
            key={shown.image}
            className={leaving ? "stories-bg is-in" : "stories-bg"}
            style={{ backgroundImage: `url("${shown.image}")` }}
          />
        </div>
        <div className="stories-scrim" aria-hidden="true" />
        <div className="stories-inner">
          <div className="stories-heading">
            <h2 className="type-h2" id="occasion-heading">
              {occasionHeading}
            </h2>
            <Flourish className="occasion-flourish" />
          </div>
          <div className="stories-stage">
          <FadeSlot
            className="stories-photo-stack"
            slotRef={photoRef}
            current={shown}
            previous={leaving}
            render={(look, phase) => (
              <figure
                key={phase === "is-out" ? `${look.name}-out` : look.name}
                className={phase ? `stories-photo editorial-frame lined ${phase}` : "stories-photo editorial-frame lined"}
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
                  <h1 className="type-h1">{look.line}</h1>
                </figcaption>
              </figure>
            )}
          />
          <div className="stories-panel">
            <div className="occasion-row" role="tablist" aria-labelledby="occasion-heading">
              {occasionLooks.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  role="tab"
                  id={tabId(item.name)}
                  aria-selected={item.name === shown.name}
                  aria-controls="occasion-panel"
                  className={item.name === shown.name ? "is-selected" : undefined}
                  onClick={() => onSelect(item.name)}
                  onMouseEnter={() => preloadLook(item)}
                  onFocus={() => preloadLook(item)}
                >
                  {item.name}
                </button>
              ))}
            </div>
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
                        <span className="type-cta product-shop">Shop</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" className="type-cta is-light stories-cta">
                    {look.cta}
                  </button>
                </div>
              )}
            />
          </div>
          </div>
        </div>
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
        <section className="category-module" aria-label={categoryEyebrow}>
          <p className="eyebrow is-centered"><span>{categoryEyebrow}</span></p>
          <div className="category-row">
            {categories.map((tile) => (
              <button key={tile.name} type="button" className="category-tile" aria-label={tile.cta}>
                <CategorySpot name={tile.name} />
                <span className="category-name">{tile.name}</span>
                <span className="category-descriptor">{tile.descriptor}</span>
              </button>
            ))}
          </div>
        </section>
        <div className="home">
          <div className="pair pair-hero">
            <section className="hero" aria-label="Primary hero">
              <figure className="hero-photo editorial-frame lined" style={{ "--shell": hero.shell }}>
                <img className="editorial" src={hero.image} alt="" />
                <figcaption className="photo-caption">
                  <button type="button" className="type-cta is-light">
                    {hero.cta}
                  </button>
                </figcaption>
              </figure>
            </section>
            <section className="seasonal" aria-label="Seasonal campaign slots">
              <figure className="seasonal-tile editorial-frame lined" style={{ "--shell": seasonal.shell }}>
                <img className="editorial" src={seasonal.image} alt="" />
                <figcaption className="photo-caption">
                  <p className="type-h3">{seasonal.line}</p>
                  <button type="button" className="type-cta is-light">{seasonal.cta}</button>
                </figcaption>
              </figure>
              <figure className="seasonal-tile editorial-frame lined is-quiet" style={{ "--shell": rotating.shell }} aria-hidden="true">
                <img className="editorial" src={rotating.image} alt="" />
              </figure>
            </section>
          </div>

          <FlourishRule />
          <OccasionModule occasion={occasion} onSelect={setOccasionName} />
          <FlourishRule />

          <section aria-label="Brand tiles">
            <h2 className="type-h2">
              {brandHeading}
            </h2>
            <div className="brand-row">
              {brands.map((tile) => (
                <button
                  key={tile.name}
                  type="button"
                  className="brand-tile editorial-frame"
                  aria-label={tile.cta}
                  style={{ "--brand-x": tile.crop.x, "--brand-y": tile.crop.y, "--brand-zoom": tile.crop.zoom }}
                >
                  <img className="editorial" src={tile.image} alt="" />
                  <span className="brand-scrim" aria-hidden="true" />
                  <span className={`brand-wordmark is-${tile.mark}`}>
                    {tile.mark === "th" ? <span>{tile.name}</span> : tile.name}
                  </span>
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
              <button type="button" className="type-cta">{returning.link}</button>
            </div>
          </section>
        </div>

        <section className="reassure" aria-label="Reassurance strip">
          <Flourish variant="sprig" />
          <p>{reassurance.visible}</p>
          <Flourish variant="sprig" />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
