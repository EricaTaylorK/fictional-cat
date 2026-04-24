import { Fragment, useCallback, useEffect, useState } from "react";
import BundleBuilder from "./components/BundleBuilder.jsx";
import { CRAFT_PILLARS, HERO_CHIPS, MARQUEE_PHRASES, MENU_ITEMS } from "./siteContent.js";
import "./style.css";

function useScrollReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
          }
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  useScrollReveal();

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
            <a className="logo" href="#" aria-label="Fishwife home">
              Fishwife
            </a>
            <nav className="nav" aria-label="Primary">
              <a href="#bundle">Bundle</a>
              <a href="#menu">Menu</a>
              <a href="#craft">Our way</a>
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
            <a href="#bundle" onClick={closeNav}>
              Bundle
            </a>
            <a href="#menu" onClick={closeNav}>
              Menu
            </a>
            <a href="#craft" onClick={closeNav}>
              Our way
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
          <section className="hero reveal" data-reveal>
            <div className="hero__bg" aria-hidden="true" />
            <div className="hero__grid">
              <div className="hero__content">
                <p className="eyebrow">Fishwife bagels · kettle &amp; stone</p>
                <h1 className="hero__title">
                  Tinned excellence—<em>bagel-shaped.</em>
                </h1>
                <p className="hero__lede">
                  Build a twenty-four ring tin across eight styles, add two schmears, and we pack it with the same care
                  as a coastal pantry staple.
                </p>
                <div className="hero__actions">
                  <a className="btn btn--primary" href="#bundle">
                    Start your bundle
                  </a>
                  <a className="btn btn--ghost" href="#visit">
                    Hours &amp; pickup
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
                  24 + 2
                  <br />
                  <span>the signature tin</span>
                </p>
              </div>
            </div>
          </section>

          <BundleBuilder />

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

          <section id="craft" className="section craft reveal" data-reveal>
            <div className="section__head section__head--left">
              <p className="section__label">Our way</p>
              <h2>Serious bagels. Light touch.</h2>
              <p className="section__deck">
                Fishwife is fast-casual without the plastic soul—counter service, real ingredients, zero apology for
                caring.
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

          <section id="menu" className="section menu reveal" data-reveal>
            <div className="section__head">
              <p className="section__label">Beyond the tin</p>
              <h2>When you’re not building a bundle.</h2>
              <p className="section__deck">A few other things we love to hand across the pass.</p>
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

          <section id="visit" className="section visit reveal" data-reveal>
            <div className="visit__layout">
              <div className="visit__copy">
                <p className="section__label">Visit</p>
                <h2>Meridian Row</h2>
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

          <section id="order" className="section cta reveal" data-reveal>
            <div className="cta__inner">
              <p className="section__label section__label--on-dark">Order</p>
              <h2>We’ll text when your tin is ready.</h2>
              <p>Call ahead for pickup—or reserve a bundle online when we flip that switch.</p>
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
              <strong>Fishwife</strong> · Bagels &amp; schmear
            </p>
            <p className="site-footer__fine">Prototype — not a real restaurant.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
