import { useEffect, useState } from "react";
import { CompactCard, LargeHeroBanner, WideSlimBanner } from "../components/entries/SuitFinderEntries.jsx";
import { quizHref, trackEntryClick } from "../components/entries/quizEntry.js";
import "./placements.css";

const SWATCHES = ["#1b2a4a", "#3a3834", "#1e3a32", "#243044", "#4a4038", "#171717", "#314158", "#5c534a"];
const NAMES = ["Navy suit", "Charcoal suit", "Olive suit", "Blue suit", "Brown suit", "Black suit", "Slate suit", "Taupe suit"];

function tiles(count, offset) {
  return Array.from({ length: count }, (_, index) => {
    const id = index + offset;
    return {
      id: `tile-${offset}-${index}`,
      brand: id % 2 === 0 ? "Egara" : "Pronto Uomo",
      name: NAMES[id % NAMES.length],
      swatch: SWATCHES[id % SWATCHES.length],
      price: `$${199 + (id % 5) * 30}.99`,
    };
  });
}

function useMinWidth(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

function MockHeader() {
  return (
    <header className="mock-header">
      <p className="mock-promo">Clearance up to 70% off original prices</p>
      <div className="mock-bar">
        <img className="mock-logo" src="/mw-logo.svg" alt="Men's Wearhouse" />
      </div>
    </header>
  );
}

function Tile({ tile }) {
  return (
    <li className="pgp-tile">
      <article className="pgp-card">
        <div className="pgp-swatch" style={{ background: tile.swatch }} />
        <p className="pgp-price">{tile.price}</p>
        <p className="pgp-brand">{tile.brand}</p>
        <p className="pgp-name">{tile.name}</p>
      </article>
    </li>
  );
}

function ProductSpot({ title, crumb, afterRow, band = false, children }) {
  const wide = useMinWidth("(min-width: 768px)");
  const perRow = wide ? 4 : 2;
  const insertAt = perRow * afterRow;
  const items = tiles(insertAt + perRow, title.length);
  const before = items.slice(0, insertAt);
  const after = items.slice(insertAt);

  return (
    <div className="placements-frame">
      <header className="pgp-head">
        <p className="pgp-crumb">Home / {crumb}</p>
        <h2>{title}</h2>
        <p>{items.length} styles</p>
      </header>
      <ul className="pgp-grid">
        {before.map((tile) => <Tile key={tile.id} tile={tile} />)}
        <li className={band ? "pgp-spot pgp-spot-band" : "pgp-spot"}>{children}</li>
        {after.map((tile) => <Tile key={tile.id} tile={tile} />)}
      </ul>
    </div>
  );
}

function Surface({ id, label, slot, children }) {
  return (
    <section className="surface" id={id} aria-labelledby={`${id}-label`}>
      <div className="surface-caption">
        <h2 id={`${id}-label`}>{label}</h2>
        <p>{slot}</p>
      </div>
      <div className="surface-stage">{children}</div>
    </section>
  );
}

export default function PlacementsDemo() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Suit Finder placements | Men's Wearhouse";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <main className="placements">
      <Surface id="home" label="Homepage" slot="Large hero below the header">
        <MockHeader />
        <div className="placements-frame placements-stack">
          <LargeHeroBanner entrypoint="home-hero" priority />
          <p className="home-lede">Suits, tuxedos, and separates, ready when you are.</p>
        </div>
      </Surface>

      <Surface id="nav" label="Global nav" slot="Suits mega-menu on desktop and tablet. Text link on mobile.">
        <div className="placements-frame">
          <div className="mega">
            <div className="mega-nav" aria-hidden="true">
              <span>Suits</span>
              <span>Sport Coats</span>
              <span>Shirts</span>
              <span>Pants</span>
              <span>Shoes</span>
            </div>
            <div className="mega-panel">
              <div className="mega-links">
                <p className="mega-kicker">Suiting</p>
                <span>Suits</span>
                <span>Tuxedos</span>
                <span>Suit Jackets</span>
                <span>3 Piece Suits</span>
              </div>
              <CompactCard entrypoint="nav-mega" />
            </div>
          </div>
          <nav className="mobile-suits" aria-label="Suits">
            <p className="mega-kicker">Suits</p>
            <a
              href={quizHref("nav-mega")}
              data-entrypoint="nav-mega"
              data-variant="text"
              onClick={() => trackEntryClick("nav-mega")}
            >
              Suit Finder
            </a>
            <span>Tuxedos</span>
            <span>Suit Jackets</span>
            <span>Suit Pants</span>
          </nav>
        </div>
      </Surface>

      <Surface id="pgp-suits" label="Suits PGP" slot="Compact card after row 2, spanning 3 of 12 columns">
        <ProductSpot title="Suits" crumb="Suits" afterRow={2}>
          <CompactCard entrypoint="pgp-suits" />
        </ProductSpot>
      </Surface>

      <Surface id="pgp-tux" label="Tuxedos PGP" slot="Compact card after row 2, spanning 3 of 12 columns">
        <ProductSpot title="Tuxedos" crumb="Tuxedos" afterRow={2}>
          <CompactCard entrypoint="pgp-tux" />
        </ProductSpot>
      </Surface>

      <Surface id="pgp-separates" label="Separates PGP" slot="Wide slim band after row 3">
        <ProductSpot title="Suit Separates" crumb="Suit Separates" afterRow={3} band>
          <WideSlimBanner entrypoint="pgp-separates" />
        </ProductSpot>
      </Surface>

      <Surface id="lp-fit" label="Fit Guide" slot="Wide slim under the intro, before the size chart">
        <div className="placements-frame placements-stack">
          <header className="lp-head">
            <h2>Fit Guide</h2>
            <p>Jacket and pant fit, in the measurements you already know.</p>
          </header>
          <WideSlimBanner entrypoint="lp-fit" />
          <table className="size-chart">
            <caption>Jacket size chart</caption>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">Chest</th>
                <th scope="col">Sleeve</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>38</td>
                <td>38</td>
                <td>33.5</td>
              </tr>
              <tr>
                <td>40</td>
                <td>40</td>
                <td>34</td>
              </tr>
              <tr>
                <td>42</td>
                <td>42</td>
                <td>34.5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Surface>

      <Surface id="lp-wedding" label="Wedding Attire" slot="Large hero">
        <div className="placements-frame placements-stack">
          <LargeHeroBanner entrypoint="lp-wedding" />
          <header className="lp-head">
            <h2>Wedding attire</h2>
            <p>Looks for the couple, the party, and everyone walking in with them.</p>
          </header>
        </div>
      </Surface>

      <Surface id="lp-custom" label="Custom Clothing" slot="Wide slim after the value proposition, before the steps">
        <div className="placements-frame placements-stack">
          <header className="lp-head">
            <h2>Custom clothing</h2>
            <p>Cloth, fit, and details chosen with a stylist. Made to your measurements.</p>
          </header>
          <WideSlimBanner entrypoint="lp-custom" />
          <ol className="steps">
            <li>
              <strong>Choose</strong>
              <span>Cloth, lapel, and lining.</span>
            </li>
            <li>
              <strong>Measure</strong>
              <span>In store or from a suit that already fits.</span>
            </li>
            <li>
              <strong>Finish</strong>
              <span>Tailored, then ready for pickup or delivery.</span>
            </li>
          </ol>
        </div>
      </Surface>
    </main>
  );
}
