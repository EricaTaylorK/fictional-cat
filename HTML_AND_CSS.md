# Suit Finder v2: key HTML and CSS (live rendered)

Source: https://suit-finder-v2.vercel.app/ (captured Nov 23, 2026).

- **HTML** is the live DOM for each screen. Element names and class names are kept. Text is shortened.
- **CSS** is the **computed style** the browser applied to each element, not raw stylesheet rules. This is what actually renders.
- Viewports: intro at **1280px desktop**; results at **1280px desktop** and **654px mobile**. Values differ by width, so they are labeled.
- Only key elements are included.

---

## 1. Intro screen

Opened by the **Find the suit** banner on the homepage. Renders as a modal over the storefront.

### HTML

```html
<div class="intro-backdrop">
  <div class="intro-modal" role="dialog">
    <header class="intro-header">
      <span></span>                                  <!-- grid spacer -->
      <span class="intro-brand">
        <span class="intro-badge">MW</span>
        <span class="intro-header-title">AI Style Expert</span>
      </span>
      <span class="intro-header-end">
        <button class="intro-close" aria-label="Close"><svg><path /></svg></button>
      </span>
    </header>

    <div class="intro-body">
      <div class="intro-main">                       <!-- display: contents on desktop -->
        <img class="intro-illustration" alt="" />
        <h1 class="intro-title">Tell us the occasion. We'll find the suit.</h1>
        <p class="intro-copy">Answer a few quick questions. You'll get matches right away, with the reasons behind each.</p>
      </div>
      <div class="quiz-dock">                        <!-- display: contents on desktop -->
        <button class="intro-start"><svg><path /></svg>Start the quiz</button>
      </div>
    </div>
  </div>
</div>
```

### CSS (computed, 1280px)

```css
.intro-backdrop {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;                                   /* 1265 × 900 */
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.72);
  overflow: hidden;
}

.intro-modal {
  display: flex;
  flex-direction: column;
  width: 1160px;
  height: 780px;
  border-radius: 16px;
  background-color: rgb(255, 255, 255);
  background-image: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
                    url("/quiz/quiz-fabric.png");
  box-shadow: rgba(0, 20, 60, 0.16) 0px 24px 64px 0px, rgba(0, 20, 60, 0.06) 0px 2px 8px 0px;
  overflow: hidden;
}

.intro-header {                               /* border-bottom: 1px solid rgba(0,0,0,0.06) (from stylesheet) */
  display: grid;
  align-items: center;
  position: relative;
  width: 1160px;
  height: 64px;
  padding: 0 12px;
  background-color: rgba(255, 255, 255, 0.85);
}

.intro-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 30px;
}

.intro-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgb(0, 30, 86);
  color: rgb(255, 255, 255);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 10px;
  letter-spacing: 0.4px;
}

.intro-header-title {
  padding-left: 16px;
  color: rgb(0, 30, 86);
  font-family: Roboto, sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 1.56px;
  text-transform: uppercase;
}

.intro-header-end {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 48px;
  height: 48px;
}

.intro-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 1px 6px;
  border-radius: 50%;
  text-align: center;
}

.intro-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 1160px;
  height: 716px;
  padding: 64px 48px 48px;
  text-align: center;
}

.intro-main {                                 /* display: contents at 1280px */
  display: contents;
}

.intro-illustration {
  width: 192px;
  height: 192px;
  margin: 0 0 32px;
  overflow: clip;
}

.intro-title {
  width: 553.688px;
  margin: 0 0 16px;
  color: rgb(35, 35, 35);
  font-family: Roboto, sans-serif;
  font-size: 32px;
  font-weight: 500;
  line-height: 40px;
  text-align: center;
}

.intro-copy {
  max-width: 404.648px;                       /* max-width: 40ch */
  margin: 0 0 40px;
  color: rgb(58, 58, 58);
  font-family: Roboto, sans-serif;
  font-size: 18px;
  line-height: 28px;
  text-align: center;
}

.quiz-dock {                                  /* display: contents at 1280px */
  display: contents;                          /* stylesheet: background rgba(255,255,255,0.94); border-top 1px solid rgba(0,0,0,0.06); padding 12px 16px */
}

.intro-start {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 192px;
  height: 56px;
  padding: 0 32px;
  border: 0;
  border-radius: 6px;
  background-color: rgb(31, 91, 230);
  color: rgb(255, 255, 255);
  font-family: Roboto, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  text-align: center;
}
```

---

## 2. Results screen

Shown after the quiz's last step (**See recommendations**). Desktop and mobile use the same markup. Only the mobile capture of the DOM was recorded, so the skeleton below is from 654px.

### HTML

```html
<div class="results-layout">
  <section class="results-main">

    <div class="results-hero">
      <div class="results-hero-intro">                          <!-- display: contents on desktop -->
        <div class="results-hero-toolbar">
          <div class="results-expert">
            <span class="results-monogram">MW</span>
            <span class="results-expert-label">AI Style Expert</span>
          </div>
          <div class="results-hero-actions">
            <button class="results-hero-action"><svg /><span>Share results</span></button>
            <button class="results-hero-action"><svg /><span>Restart quiz</span></button>
          </div>
        </div>

        <div class="results-hero-copy">
          <h1>2 looks made for your fit.</h1>
          <p class="results-lede">Both are Classic Fit and right for prom. Compare them below.</p>

          <div class="results-hero-account">
            <h2 class="results-hero-subhead">Want the Best Fit—Every Time?</h2>
            <ul class="fit-profile-benefits">
              <li>Suits that don’t need tailoring</li>
              <li>Shirts with the right sleeve and neck sizes</li>
              <li>Pants that actually fit your waist and leg</li>
              <li>Outerwear made for your proportions</li>
            </ul>
            <div class="fit-profile-actions">
              <a class="button">Create an Account</a>
              <button class="button secondary">Sign In</button>
            </div>
          </div>
        </div>
      </div>

      <section class="fit-card hero-fit-card">
        <div class="fit-card-head">
          <h2 class="fit-card-title">Your Fit Profile</h2>
          <button class="results-hero-action"><span>Edit answers</span></button>
        </div>
        <p class="hero-profile-chip">5'10" · 180 lb</p>
        <!-- also in this card: "Fit Preference", "Length", "Occasion", "Colors", "Package" rows -->
        <button class="fit-profile-expand">Show more</button>      </section>
    </div>

    <div class="results-stage">
      <div class="results-list">
        <h2 class="results-list-title">Your matches are in</h2>

        <!-- one <article> per match (3 on this page) -->
        <article class="suit-card">
          <div class="suit-card-face">
            <div class="suit-row">
              <div class="suit-card-media">
                <div class="product-image"><img alt="" /></div>
                <div class="suit-badges suit-badges-on-photo">
                  <span class="match-score is-best">Best match</span>
                </div>
              </div>

              <div class="suit-card-body">
                <div class="suit-card-topbar"></div>

                <div class="suit-card-info">
                  <div class="suit-card-copy">
                    <div class="color-swatches">
                      <button class="color-swatch is-selected"><span></span></button>
                    </div>
                    <div class="suit-card-names">
                      <p class="product-brand">Egara</p>
                      <p class="product-title">Blue Jacquard Dinner Jacket Tux</p>
                    </div>
                    <p class="product-meta">Dinner jacket tuxedo · Sizes confirmed at your fitting</p>
                    <p class="suit-rating"><svg class="star" /><span>4.7 (1,166)</span></p>
                    <p class="match-why">Why it's a match</p>
                    <ul class="match-checks">
                      <li class="is-pass">Blue, your color</li>
                      <li class="is-pass">For prom</li>
                      <li class="is-miss">Not your colors</li>      <!-- miss state -->
                    </ul>
                  </div>

                  <div class="suit-price-col">
                    <div class="suit-price-stack">
                      <p class="suit-price"><strong>$139.99</strong></p>
                    </div>
                    <button class="suit-expand-toggle">Choose this suit</button>
                  </div>

                  <button class="suit-details-link">View More Details</button>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div class="more-matches-row">
          <button class="more-matches"><span class="more-matches-label">View more products</span></button>
        </div>
      </div>
    </div>

  </section>

  <footer class="site-footer">…</footer>
</div>
```

### CSS (computed)

#### Layout and hero

```css
.results-layout {                         /* 1265px desktop · 639px mobile */
  display: grid;
  background-color: rgb(255, 255, 255);
  font-family: Roboto, sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: rgb(35, 35, 35);
}

/* Desktop (1280px) */
.results-hero {
  display: grid;
  grid-template-columns: 605px 380px;
  gap: 8px 40px;
  padding: 40px 120px 24px;
  margin: 0 0 40px;
  background-color: rgb(255, 255, 255);
}

/* Mobile (654px) */
.results-hero {                           /* mobile override */
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px 32px;
  margin: 0 0 40px;
  background-color: rgb(255, 255, 255);
  background-image: linear-gradient(rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.2)),
                    linear-gradient(100deg, rgb(244, 232, 226), rgb(247, 243, 238) 46%, rgb(228, 240, 252));
}

.results-hero-intro {                     /* mobile */
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.results-expert {                         /* mobile */
  display: flex;
  gap: 16px;
  align-items: center;
}

.results-monogram {
  display: flex;
  width: 48px;
  height: 40px;
  border-radius: 50%;
  background-color: rgb(0, 30, 86);
  color: rgb(255, 255, 255);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 13px;
  letter-spacing: 0.26px;
}

.results-expert-label {
  color: rgb(0, 12, 44);
  font-family: Roboto, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 20.8px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.results-hero-actions {                   /* mobile */
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.results-hero-action {                    /* mobile: 12px; desktop: 16px/24px */
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgb(0, 30, 86);
  font-family: Roboto, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-decoration: none;
}

.results-hero-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;                              /* desktop: 12px */
}

.results-main .results-hero h1 {          /* mobile 30px/34.5px · desktop 52px/59.8px */
  max-width: 360px;                       /* desktop: 624px */
  margin: 0;
  color: rgb(0, 30, 86);
  font-family: Oswald, sans-serif;
  font-size: 30px;
  font-weight: 500;
  line-height: 34.5px;
  text-transform: uppercase;
}

.results-lede {
  max-width: 672px;
  color: rgb(35, 35, 35);
  font-family: Roboto, sans-serif;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.16px;
}

.results-hero-account {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 0;
}

.results-hero-subhead {
  color: rgb(0, 30, 86);
  font-family: Roboto, sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  margin: 0;
}

.fit-profile-benefits {
  display: grid;
  gap: 8px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  color: rgb(35, 35, 35);
  font-size: 14px;
  line-height: 20px;
}

.fit-profile-benefits li {
  position: relative;
  padding-left: 24px;
}

.fit-profile-benefits li::before {        /* from stylesheet */
  content: "✓";
  position: absolute;
  left: 0;
  color: rgb(0, 30, 86);
}

.fit-profile-actions {                    /* mobile: column · desktop: row */
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 4px 0 0;
}

.fit-profile-actions .button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border: 1px solid rgb(0, 12, 44);
  color: rgb(0, 12, 44);
  font-family: Roboto, sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: 0.12px;
  text-transform: uppercase;
}

.results-hero-account .fit-profile-actions .button.secondary {
  background: transparent;
}
```

#### Fit profile card

```css
.hero-fit-card {                          /* mobile: padding 32px 24px 24px · desktop: 16px 20px */
  display: block;
  width: 100%;
  padding: 32px 24px 24px;
  border: 1px solid rgb(242, 242, 242);
  border-radius: 4px;
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.12) 0px 8px 20px 0px, rgba(0, 0, 0, 0.1) 0px 0px 2px 0px;
}

.fit-card-title {
  color: rgb(35, 35, 35);
  font-family: Oswald, sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 30px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.hero-profile-chip {
  color: rgb(35, 35, 35);
  font-family: Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.fit-profile-expand {
  margin: 8px 0 0;
  padding: 4px 0 0;
  border: 0;
  background: none;
  color: rgb(0, 30, 86);
  font-family: Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  cursor: pointer;
}
```

#### Results list and match cards

```css
.results-stage {                          /* mobile: column · desktop: row */
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 8px 16px 40px;                 /* desktop: 8px 120px 40px */
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 100%;
  min-width: 0;
}

.results-list-title {
  color: rgb(58, 58, 58);
  font-family: Oswald, sans-serif;
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  letter-spacing: 0.48px;
  text-transform: uppercase;
}

.suit-card {
  display: flex;
  flex-direction: column;
}

.suit-card-face {                         /* mobile: padding 0 · desktop: padding 12px */
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(0, 0, 0, 0.1) 0px 0px 2px 0px;
}

.suit-row {                               /* mobile: flex column · desktop: grid 168px | 815px, gap 16px */
  display: flex;
  flex-direction: column;
}

.suit-card-media {                        /* mobile: full width, 4:3 · desktop: 168px wide */
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: visible;
}

.suit-card-media .product-image {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: rgb(242, 242, 242);
}

.suit-card-media .product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

.suit-card-body {                         /* mobile: flex column, gap 8px, padding 16px · desktop: grid 607px | 188px, gap 8px 20px */
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  min-width: 0;
}

.suit-card-copy {                         /* mobile: display: contents · desktop: flex column, gap 4px */
  display: contents;
}

.color-swatches {
  display: flex;
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 100px;
}

.color-swatch.is-selected {
  border-color: rgb(0, 12, 44);
}

.product-brand {                          /* mobile: 16px/22px 600 · desktop: 14px/20px 700 */
  margin: 0;
  color: rgb(35, 35, 35);
  font-family: Roboto, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  text-transform: none;
}

.product-title {                          /* mobile: 16px/22px · desktop: 14px/20px */
  margin: 0;
  color: rgb(116, 116, 116);
  font-family: Roboto, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 0;
  color: rgb(58, 58, 58);
  font-family: Roboto, sans-serif;
  font-size: 12px;
  line-height: 24px;
}

.suit-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 0;
  color: rgb(116, 116, 116);
  font-family: Roboto, sans-serif;
  font-size: 14px;
  line-height: 20px;
}

.match-why {                              /* mobile margin 16px 0 0 · desktop 8px 0 0 */
  display: block;
  margin: 16px 0 0;
  color: rgb(35, 35, 35);
  font-family: Roboto, sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}

.match-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.match-checks li {
  display: block;
  padding: 5px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-family: Roboto, sans-serif;
  font-size: 14px;
  line-height: 20px;
}

.match-checks li.is-pass {
  background-color: rgb(255, 255, 255);
  border-color: rgb(58, 58, 58);
  color: rgb(35, 35, 35);
}

.match-checks li.is-miss {
  background-color: rgb(235, 235, 235);
  border-color: transparent;
  color: rgb(154, 154, 154);
  opacity: 0.72;                          /* from stylesheet */
}

.match-score {                            /* mobile 11px/14px, padding 4px 10px · desktop 10px/12px, padding 4px 8px */
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgb(0, 128, 82);
  color: rgb(255, 255, 255);
  font-family: Roboto, sans-serif;
  font-size: 11px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 0.44px;
  text-transform: uppercase;
}

.suit-price-col {                         /* mobile: display: contents · desktop: flex column, 188px */
  display: contents;
}

.suit-price strong {                      /* mobile 24px/28px #232323 · desktop 20px/24px #3a3a3a */
  color: rgb(35, 35, 35);
  font-family: Roboto, sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 28px;
}

.suit-expand-toggle {                     /* mobile: width 573px, margin-top 16px · desktop: 188px, margin-top 124px */
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid rgb(0, 30, 86);
  background-color: rgb(255, 255, 255);
  color: rgb(0, 12, 44);
  font-family: Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.14px;
  text-transform: uppercase;
}

.suit-details-link {
  display: flex;
  gap: 4px;
  margin: 12px 0 0;
  color: rgb(35, 35, 35);
  font-family: Roboto, sans-serif;
  font-size: 12px;                        /* desktop: 14px/20px */
  line-height: 16px;
}

.more-matches {
  display: flex;
  gap: 4px;
  color: rgb(35, 35, 35);
  font-family: Roboto, sans-serif;
  font-size: 14px;
  line-height: 20px;
}
```

---

## Notes

- **Computed vs. source CSS.** The values above are computed in the browser. The stylesheet has many overlapping responsive rules, and a few details (such as `::before` pseudo-elements and `opacity`) come from the stylesheet, not the computed output. These are labeled.
- **Not captured.** Desktop markup for the results screen (the `results-stage` second column, if it exists) was not re-dumped at 1280px. The intro's mobile (654px) computed values were not recorded.
- **Browser state changed.** While capturing, the saved quiz answers in the test browser were reset and rebuilt by clicking through the rental flow. This only affects the test browser's local storage, not the live site.
