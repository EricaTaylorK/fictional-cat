import "./style.css";

document.querySelector("#app").innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="page">
    <header class="site-header">
      <div class="site-header__inner">
        <a class="logo" href="#">Hole <span>&amp;</span> Hearth</a>
        <nav class="nav" aria-label="Primary">
          <a href="#menu">Menu</a>
          <a href="#story">Our story</a>
          <a href="#visit">Visit</a>
          <a class="nav__cta" href="#order">Order pickup</a>
        </nav>
        <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-panel" aria-label="Open menu">
          <span class="nav-toggle__bar" aria-hidden="true"></span>
          <span class="nav-toggle__bar" aria-hidden="true"></span>
        </button>
      </div>
      <div id="nav-panel" class="nav-panel" hidden>
        <a href="#menu">Menu</a>
        <a href="#story">Our story</a>
        <a href="#visit">Visit</a>
        <a href="#order">Order pickup</a>
      </div>
    </header>

    <main id="main">
      <section class="hero">
        <div class="hero__content">
          <p class="eyebrow">Est. this morning · kettle-boiled, oven-finished</p>
          <h1 class="hero__title">Bagels worth waking up for.</h1>
          <p class="hero__lede">
            Crisp crust, chewy center, and schmears whipped in small batches. Coffee that actually tastes like something.
            Come hungry—leave with crumbs on your coat.
          </p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="#menu">See the menu</a>
            <a class="btn btn--ghost" href="#visit">Find us</a>
          </div>
        </div>
        <div class="hero__visual" aria-hidden="true">
          <div class="hero__ring"></div>
          <div class="hero__ring hero__ring--2"></div>
          <div class="hero__ring hero__ring--3"></div>
        </div>
      </section>

      <section id="menu" class="section menu">
        <div class="section__head">
          <h2>Today’s board</h2>
          <p>Everything’s baked fresh. When we sell out, we close the board—fair warning.</p>
        </div>
        <ul class="menu-grid">
          <li class="menu-card">
            <h3>Classic everything</h3>
            <p>Seeds, salt, garlic, onion—the full constellation. Best with scallion schmear.</p>
            <span class="menu-card__tag">Fan favorite</span>
          </li>
          <li class="menu-card">
            <h3>Salt &amp; malt</h3>
            <p>Subtle sweetness, glossy crust. Pairs with smoked salmon or just butter.</p>
          </li>
          <li class="menu-card">
            <h3>Cinnamon–raisin</h3>
            <p>Warm spice, plump fruit. Controversial toasted; we won’t judge.</p>
          </li>
          <li class="menu-card">
            <h3>Breakfast sandwich</h3>
            <p>Egg, cheddar, arugula, and optional hot honey on any bagel you pick.</p>
            <span class="menu-card__tag">Weekend line</span>
          </li>
        </ul>
      </section>

      <section id="story" class="section story">
        <div class="story__grid">
          <div class="story__copy">
            <h2>Hand-rolled, not factory-rolled</h2>
            <p>
              We mix dough overnight, boil each bagel in a kettle, then finish on stone until the crust sings. It’s slower.
              It’s messier. It’s the only way we know how to do it.
            </p>
            <p>
              Our coffee is roasted by friends down the block—medium roast, chocolate and cherry, zero pretense. Order it
              black or let us foam the milk until it’s like velvet.
            </p>
          </div>
          <ul class="story__stats" aria-label="Highlights">
            <li><strong>4am</strong> first dough goes in</li>
            <li><strong>0</strong> day-old bagels sold as “fresh”</li>
            <li><strong>∞</strong> napkins—we’ve got you</li>
          </ul>
        </div>
      </section>

      <section id="visit" class="section visit">
        <div class="visit__card">
          <h2>Visit the shop</h2>
          <address>
            128 Kettle Lane<br />
            Riverside, RC 01902
          </address>
          <dl class="hours">
            <div><dt>Mon–Fri</dt><dd>6:30a – 2p</dd></div>
            <div><dt>Sat–Sun</dt><dd>7a – 3p</dd></div>
          </dl>
          <p class="visit__note">Outdoor benches, dogs welcome at the curb, high chairs inside.</p>
        </div>
      </section>

      <section id="order" class="section cta">
        <div class="cta__inner">
          <h2>Order for pickup</h2>
          <p>Call ahead and we’ll have your bagel waiting—hot sandwich needs ~10 minutes at rush.</p>
          <p><a class="cta__phone" href="tel:+15555551234">(555) 555-1234</a></p>
          <a class="btn btn--primary btn--wide" href="tel:+15555551234">Tap to call</a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <p><strong>Hole &amp; Hearth</strong> · Bagels &amp; coffee</p>
      <p class="site-footer__fine">Fictional demo page for a prototype project.</p>
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
