import { useState } from "react";
import SiteFooter from "./components/SiteFooter.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import {
  brands,
  categories,
  hero,
  looks,
  occasions,
  reassurance,
  returning,
  seasonal,
} from "./homeContent.js";

export default function App() {
  const [search, setSearch] = useState("");

  return (
    <div className="page" id="top">
      <SiteHeader search={search} onSearch={setSearch} />
      <main>
        <div className="home">
          <div className="pair pair-hero">
            <section aria-labelledby="mod-hero">
              <p className="wire-caption" id="mod-hero">
                1 · Primary hero
              </p>
              <div className="wire-box wire-hero">
                <p className="wire-kicker">{hero.label}</p>
                <p>{hero.detail}</p>
                <button type="button">{hero.cta}</button>
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

          <div className="pair">
            <section aria-labelledby="mod-occasion">
              <p className="wire-caption" id="mod-occasion">
                3 · Shop by occasion
              </p>
              <div className="tile-stack">
                {occasions.map((name) => (
                  <button key={name} type="button" className="wire-box wire-tile">
                    {name}
                  </button>
                ))}
              </div>
            </section>
            <section aria-labelledby="mod-looks">
              <p className="wire-caption" id="mod-looks">
                4 · Shoppable looks
              </p>
              <div className="tile-stack">
                {looks.map((look, index) => (
                  <button key={`${look.name}-${index}`} type="button" className="wire-box wire-look">
                    <span className="wire-kicker">{look.name}</span>
                    {look.line ? <span>{look.line}</span> : null}
                    {look.cta ? <span className="wire-cta">{look.cta}</span> : null}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section aria-labelledby="mod-categories">
            <p className="wire-caption" id="mod-categories">
              5 · Category entry tiles
            </p>
            <div className="category-grid">
              {categories.map((tile) => (
                <button key={tile.name} type="button" className="wire-box wire-tile">
                  <span className="wire-kicker">{tile.name}</span>
                  <span className="tile-desc">{tile.descriptor}</span>
                  <span className="wire-cta">{tile.cta}</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="mod-brands">
            <p className="wire-caption" id="mod-brands">
              6 · Brand tiles
            </p>
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
