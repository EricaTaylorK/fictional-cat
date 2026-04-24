import "./style.css";

document.querySelector("#app").innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="page">
    <header class="site-header">
      <div class="site-header__inner">
        <a class="logo" href="#" aria-label="Circa home">Circa</a>
        <nav class="nav" aria-label="Primary">
          <a href="#menu">Menu</a>
          <a href="#craft">Craft</a>
          <a href="#visit">Visit</a>
          <a class="nav__cta" href="#order">Order ahead</a>
        </nav>
        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-panel" aria-label="Open menu">
          <span class="nav-toggle__bar" aria-hidden="true"></span>
          <span class="nav-toggle__bar" aria-hidden="true"></span>
        </button>
      </div>
      <div id="nav-panel" class="nav-panel" hidden>
        <a href="#menu">Menu</a>
        <a href="#craft">Craft</a>
        <a href="#visit">Visit</a>
        <a href="#order">Order ahead</a>
      </div>
    </header>

    <main id="main">
      <section class="hero">
        <div class="hero__bg" aria-hidden="true"></div>
        <div class="hero__grid">
          <div class="hero__content">
            <p class="eyebrow">Fast casual · kettle &amp; stone</p>
            <h1 class="hero__title">The bagel shop, <em>edited</em> for how you actually eat.</h1>
            <p class="hero__lede">
              Hand-shaped rings, overnight ferment, and schmears you can taste the butter in. Line moves fast;
              the ritual still feels like yours.
            </p>
            <div class="hero__actions">
              <a class="btn btn--primary" href="#menu">View menu</a>
              <a class="btn btn--ghost" href="#visit">Hours &amp; location</a>
            </div>
            <ul class="hero__chips" aria-label="Highlights">
              <li>Pickup in ~5 min</li>
              <li>Single-origin espresso</li>
              <li>Daily bake, no freezer aisle</li>
            </ul>
          </div>
          <div class="hero__visual" aria-hidden="true">
            <div class="hero__mark">
              <span class="hero__mark-ring"></span>
              <span class="hero__mark-hole"></span>
            </div>
            <p class="hero__stamp">Est. today<br /><span>always small-batch</span></p>
          </div>
        </div>
      </section>

      <section class="marquee" aria-label="Brand notes">
        <div class="marquee__track">
          <span>Kettle-boiled</span>
          <span class="marquee__dot" aria-hidden="true"></span>
          <span>Stone-finished</span>
          <span class="marquee__dot" aria-hidden="true"></span>
          <span>Third-wave coffee</span>
          <span class="marquee__dot" aria-hidden="true"></span>
          <span>Counter, not conveyor</span>
          <span class="marquee__dot" aria-hidden="true"></span>
          <span>Kettle-boiled</span>
          <span class="marquee__dot" aria-hidden="true"></span>
          <span>Stone-finished</span>
          <span class="marquee__dot" aria-hidden="true"></span>
          <span>Third-wave coffee</span>
          <span class="marquee__dot" aria-hidden="true"></span>
          <span>Counter, not conveyor</span>
        </div>
      </section>

      <section id="craft" class="section craft">
        <div class="section__head section__head--left">
          <p class="section__label">Why it tastes different</p>
          <h2>Craft at counter speed.</h2>
          <p class="section__deck">
            We built Circa for people who care where flour comes from—and still need to make a 9:02 meeting.
          </p>
        </div>
        <ul class="craft__grid">
          <li class="craft-card">
            <span class="craft-card__num">01</span>
            <h3>Dough with patience</h3>
            <p>Cold ferment, minimal yeast, real malt. Flavor develops overnight; the chew is the point.</p>
          </li>
          <li class="craft-card">
            <span class="craft-card__num">02</span>
            <h3>Kettle, then fire</h3>
            <p>Each ring hits boiling water before the stone deck. Glossy crust, open crumb—no shortcuts.</p>
          </li>
          <li class="craft-card">
            <span class="craft-card__num">03</span>
            <h3>Coffee with a point of view</h3>
            <p>Seasonal microlots, calibrated shots, oat or whole on request. Not an afterthought to the bagel.</p>
          </li>
        </ul>
      </section>

      <section id="menu" class="section menu">
        <div class="section__head">
          <p class="section__label">The board</p>
          <h2>Order like a regular.</h2>
          <p class="section__deck">Everything is baked in limited runs. When the board clears, we’re done for the day.</p>
        </div>
        <ul class="menu-list">
          <li class="menu-row">
            <div class="menu-row__main">
              <h3>Everything deluxe</h3>
              <p>Garlic, onion, poppy, sesame, salt—plus a whisper of fennel. Scallion schmear recommended.</p>
            </div>
            <span class="menu-row__meta"><span class="menu-row__tag">Crowd</span> $4.25</span>
          </li>
          <li class="menu-row">
            <div class="menu-row__main">
              <h3>Smoked salmon &amp; caper</h3>
              <p>Scottish salmon, whipped labneh, pickled caper berries, dill on your choice of bagel.</p>
            </div>
            <span class="menu-row__meta">$16.50</span>
          </li>
          <li class="menu-row">
            <div class="menu-row__main">
              <h3>Hot honey egg sandwich</h3>
              <p>Folded egg, aged cheddar, arugula, Mike’s-style hot honey on a toasted salt &amp; malt.</p>
            </div>
            <span class="menu-row__meta"><span class="menu-row__tag">Weekend</span> $12</span>
          </li>
          <li class="menu-row">
            <div class="menu-row__main">
              <h3>Black sesame &amp; miso butter</h3>
              <p>Toasted black sesame, sweet miso–brown butter spread, flaky salt. Sweet-savory, grown-up.</p>
            </div>
            <span class="menu-row__meta">$5.75</span>
          </li>
        </ul>
      </section>

      <section id="visit" class="section visit">
        <div class="visit__layout">
          <div class="visit__copy">
            <p class="section__label">Visit</p>
            <h2>Riverside &amp; rising.</h2>
            <address class="visit__address">
              428 Meridian Row<br />
              Riverside, RC 01902
            </address>
            <dl class="hours">
              <div><dt>Mon–Fri</dt><dd>7a – 3p</dd></div>
              <div><dt>Sat–Sun</dt><dd>8a – 4p</dd></div>
            </dl>
            <p class="visit__note">Stroller-friendly · dogs at the patio rail · gluten-friendly options on request</p>
          </div>
          <div class="visit__panel" aria-hidden="true">
            <div class="visit__panel-inner">
              <span class="visit__glyph">○</span>
              <p>Pickup window</p>
              <strong>East side</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="order" class="section cta">
        <div class="cta__inner">
          <p class="section__label section__label--on-dark">Order</p>
          <h2>Your bagel should be hot when you are.</h2>
          <p>Call ahead for pickup—we’ll text when your order hits the pass. Catering trays for offices of 8–40.</p>
          <p><a class="cta__phone" href="tel:+15555550147">(555) 555-0147</a></p>
          <a class="btn btn--light btn--wide" href="tel:+15555550147">Call to order</a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-footer__row">
        <p class="site-footer__brand"><strong>Circa</strong> · Bagels &amp; brew</p>
        <p class="site-footer__fine">Fictional demo for a prototype project.</p>
      </div>
    </footer>
  </div>
`;

const toggle = document.querySelector(".nav-toggle");
const panel = document.querySelector("#nav-panel");

toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  panel.hidden = open;
  toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
});

panel?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    toggle?.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    toggle?.setAttribute("aria-label", "Open menu");
  });
});
