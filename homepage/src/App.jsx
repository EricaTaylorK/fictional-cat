import { useEffect, useState } from "react";
import SiteFooter from "./components/SiteFooter.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
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
  [look.image, ...look.pieces.map((piece) => piece.image)].forEach((src) => {
    const image = new Image();
    image.src = src;
  });
}

function FadeSlot({ current, previous, className, render }) {
  return (
    <div className={className}>
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

  useEffect(() => {
    if (!leaving) return undefined;
    const timeout = window.setTimeout(() => setLeaving(null), 560);
    return () => window.clearTimeout(timeout);
  }, [leaving]);

  return (
    <section className="occasion-module" aria-labelledby="occasion-heading">
      <p className="wire-caption" id="mod-occasion">
        3 · Shop by occasion
        <span className="wire-caption-side">4 · Shoppable looks</span>
      </p>
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
          <FadeSlot
            className="stories-photo-stack"
            current={shown}
            previous={leaving}
            render={(look, phase) => (
              <figure
                key={phase === "is-out" ? `${look.name}-out` : look.name}
                className={phase ? `stories-photo ${phase}` : "stories-photo"}
                inert={phase === "is-out" ? true : undefined}
                aria-hidden={phase === "is-out" ? true : undefined}
              >
                <img src={look.image} alt="" />
                <figcaption>
                  <p className="eyebrow eyebrow-on-dark"><span>{look.eyebrow}</span></p>
                  <h1 className="type-h1">{look.line}</h1>
                </figcaption>
              </figure>
            )}
          />
          <div className="stories-panel">
            <h2 className="type-h2" id="occasion-heading">
              {occasionHeading}
            </h2>
            <FadeSlot
              className="stories-cta-stack"
              current={shown}
              previous={leaving}
              render={(look, phase) => (
                <button
                  key={phase === "is-out" ? `${look.name}-cta-out` : `${look.name}-cta`}
                  type="button"
                  className={phase ? `type-cta stories-cta ${phase}` : "type-cta stories-cta"}
                  inert={phase === "is-out" ? true : undefined}
                  aria-hidden={phase === "is-out" ? true : undefined}
                >
                  {look.cta}
                </button>
              )}
            />
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
              className="stories-products-stack"
              current={shown}
              previous={leaving}
              render={(look, phase) => (
                <div
                  key={phase === "is-out" ? `${look.name}-pieces-out` : `${look.name}-pieces`}
                  className={phase ? `stories-products ${phase}` : "stories-products"}
                  id={phase === "is-out" ? undefined : "occasion-panel"}
                  role={phase === "is-out" ? undefined : "tabpanel"}
                  aria-labelledby={phase === "is-out" ? undefined : tabId(look.name)}
                  inert={phase === "is-out" ? true : undefined}
                  aria-hidden={phase === "is-out" ? true : undefined}
                >
                  {look.pieces.map((piece) => (
                    <button key={piece.name} type="button" className="product-card">
                      <span className="product-photo">
                        <img src={piece.image} alt="" />
                      </span>
                      <span className="eyebrow"><span>On this look</span></span>
                      <span className="type-h3">{piece.name}</span>
                      <span className="type-cta product-shop">Shop</span>
                    </button>
                  ))}
                </div>
              )}
            />
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
        <section className="category-module" aria-labelledby="mod-categories">
          <div className="category-caption">
            <p className="wire-caption" id="mod-categories">
              5 · Category entry tiles
            </p>
          </div>
          <div className="category-band">
            <div className="category-band-bg" aria-hidden="true" />
            <div className="category-band-copy">
              <p className="eyebrow eyebrow-on-dark"><span>{categoryEyebrow}</span></p>
            </div>
            <div className="category-strip" role="navigation" aria-label={categoryEyebrow}>
              {categories.map((tile) => (
                <button key={tile.name} type="button" aria-label={tile.cta}>
                  {tile.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="home">
          <div className="pair pair-hero">
            <section aria-labelledby="mod-hero">
              <p className="wire-caption" id="mod-hero">
                1 · Primary hero
              </p>
              <div className="wire-box wire-hero">
                <p className="eyebrow"><span>{hero.eyebrow}</span></p>
                <h1 className="type-h1">{hero.title}</h1>
                <p className="type-body">{hero.body}</p>
                <button type="button" className="type-cta">
                  {hero.cta}
                </button>
              </div>
            </section>
            <section aria-labelledby="mod-seasonal">
              <p className="wire-caption" id="mod-seasonal">
                2 · Seasonal campaign slots
              </p>
              <div className="wire-box wire-slot">
                <p className="wire-kicker">{seasonal.name}</p>
                <p>{seasonal.line}</p>
                <button type="button">{seasonal.cta}</button>
              </div>
              <div className="wire-box wire-slot is-empty">Rotating slot</div>
            </section>
          </div>

          <OccasionModule occasion={occasion} onSelect={setOccasionName} />

          <section aria-labelledby="mod-brands">
            <p className="wire-caption">6 · Brand tiles</p>
            <h2 className="type-h2" id="mod-brands">
              {brandHeading}
            </h2>
            <div className="brand-row">
              {brands.map((tile) => (
                <button key={tile.name} type="button" className="wire-box wire-tile">
                  <span className="wire-kicker">{tile.name}</span>
                  <span>{tile.descriptor}</span>
                  <span className="wire-cta">{tile.cta}</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="mod-returning">
            <p className="wire-caption" id="mod-returning">
              7 · Returning visitor
            </p>
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
              <button type="button">{returning.link}</button>
            </div>
          </section>
        </div>

        <section className="reassure" aria-labelledby="mod-reassure">
          <p className="wire-caption" id="mod-reassure">
            8 · Reassurance strip
          </p>
          <p>{reassurance.visible}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
