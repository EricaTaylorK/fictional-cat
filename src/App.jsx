import { Fragment, useCallback, useState } from "react";
import { CRAFT_PILLARS, HERO_CHIPS, MARQUEE_PHRASES, MENU_ITEMS } from "./circaContent.js";
import "./style.css";

export default function App() {
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = useCallback(() => {
    setNavOpen(false);
  }, []);

  const toggleNav = useCallback(() => {
    setNavOpen((o) => !o);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page">
        <header className="site-header">
          <div className="site-header__inner">
            <a className="logo" href="#" aria-label="Circa home">
              Circa
            </a>
            <nav className="nav" aria-label="Primary">
              <a href="#menu">Menu</a>
              <a href="#craft">Craft</a>
              <a href="#visit">Visit</a>
              <a className="nav__cta" href="#order">
                Order ahead
              </a>
            </nav>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={navOpen}
              aria-controls="nav-panel"
              aria-label={navOpen ? "Close menu" : "Open menu"}
              onClick={toggleNav}
            >
              <span className="nav-toggle__bar" aria-hidden="true" />
              <span className="nav-toggle__bar" aria-hidden="true" />
            </button>
          </div>
          <div id="nav-panel" className="nav-panel" hidden={!navOpen}>
            <a href="#menu" onClick={closeNav}>
              Menu
            </a>
            <a href="#craft" onClick={closeNav}>
              Craft
            </a>
            <a href="#visit" onClick={closeNav}>
              Visit
            </a>
            <a href="#order" onClick={closeNav}>
              Order ahead
            </a>
          </div>
        </header>

        <main id="main">
          <section className="hero">
            <div className="hero__bg" aria-hidden="true" />
            <div className="hero__grid">
              <div className="hero__content">
                <p className="eyebrow">Fast casual · kettle &amp; stone</p>
                <h1 className="hero__title">
                  The bagel shop, <em>edited</em> for how you actually eat.
                </h1>
                <p className="hero__lede">
                  Hand-shaped rings, overnight ferment, and schmears you can taste the butter in. Line moves fast; the
                  ritual still feels like yours.
                </p>
                <div className="hero__actions">
                  <a className="btn btn--primary" href="#menu">
                    View menu
                  </a>
                  <a className="btn btn--ghost" href="#visit">
                    Hours &amp; location
                  </a>
                </div>
                <ul className="hero__chips" aria-label="Highlights">
                  {HERO_CHIPS.map((chip) => (
                    <li key={chip}>{chip}</li>
                  ))}
                </ul>
              </div>
              <div className="hero__visual" aria-hidden="true">
                <div className="hero__mark">
                  <span className="hero__mark-ring" />
                  <span className="hero__mark-hole" />
                </div>
                <p className="hero__stamp">
                  Est. today
                  <br />
                  <span>always small-batch</span>
                </p>
              </div>
            </div>
          </section>

          <section className="marquee" aria-label="Brand notes">
            <div className="marquee__track">
              {[0, 1].map((dup) =>
                MARQUEE_PHRASES.map((label, i) => (
                  <Fragment key={`${dup}-${i}-${label}`}>
                    <span>{label}</span>
                    <span className="marquee__dot" aria-hidden="true" />
                  </Fragment>
                ))
              )}
            </div>
          </section>

          <section id="craft" className="section craft">
            <div className="section__head section__head--left">
              <p className="section__label">Why it tastes different</p>
              <h2>Craft at counter speed.</h2>
              <p className="section__deck">
                We built Circa for people who care where flour comes from—and still need to make a 9:02 meeting.
              </p>
            </div>
            <ul className="craft__grid">
              {CRAFT_PILLARS.map((p) => (
                <li key={p.num} className="craft-card">
                  <span className="craft-card__num">{p.num}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="menu" className="section menu">
            <div className="section__head">
              <p className="section__label">The board</p>
              <h2>Order like a regular.</h2>
              <p className="section__deck">
                Everything is baked in limited runs. When the board clears, we’re done for the day.
              </p>
            </div>
            <ul className="menu-list">
              {MENU_ITEMS.map((item) => (
                <li key={item.id} className="menu-row">
                  <div className="menu-row__main">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <span className="menu-row__meta">
                    {item.tag ? <span className="menu-row__tag">{item.tag}</span> : null}
                    <span>{item.price}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section id="visit" className="section visit">
            <div className="visit__layout">
              <div className="visit__copy">
                <p className="section__label">Visit</p>
                <h2>Riverside &amp; rising.</h2>
                <address className="visit__address">
                  428 Meridian Row
                  <br />
                  Riverside, RC 01902
                </address>
                <dl className="hours">
                  <div>
                    <dt>Mon–Fri</dt>
                    <dd>7a – 3p</dd>
                  </div>
                  <div>
                    <dt>Sat–Sun</dt>
                    <dd>8a – 4p</dd>
                  </div>
                </dl>
                <p className="visit__note">Stroller-friendly · dogs at the patio rail · gluten-friendly options on request</p>
              </div>
              <div className="visit__panel" aria-hidden="true">
                <div className="visit__panel-inner">
                  <span className="visit__glyph">○</span>
                  <p>Pickup window</p>
                  <strong>East side</strong>
                </div>
              </div>
            </div>
          </section>

          <section id="order" className="section cta">
            <div className="cta__inner">
              <p className="section__label section__label--on-dark">Order</p>
              <h2>Your bagel should be hot when you are.</h2>
              <p>Call ahead for pickup—we’ll text when your order hits the pass. Catering trays for offices of 8–40.</p>
              <p>
                <a className="cta__phone" href="tel:+15555550147">
                  (555) 555-0147
                </a>
              </p>
              <a className="btn btn--light btn--wide" href="tel:+15555550147">
                Call to order
              </a>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="site-footer__row">
            <p className="site-footer__brand">
              <strong>Circa</strong> · Bagels &amp; brew
            </p>
            <p className="site-footer__fine">Fictional demo for a prototype project.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
