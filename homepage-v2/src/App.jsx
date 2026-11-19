import { useState } from "react";

// Static assets exported from Figma ("MW Homepage — Refined (Holiday)", frame 5:51).
// They live in public/v2 and are listed in scripts/figma-assets.txt.
const A = (path) => `/v2/${path}`;

function stop(event) {
  event.preventDefault();
}

/* ---------- Global navigation ---------- */

const navLinks = [
  "Suits",
  "Sport Coats & Blazers",
  "Dress Shirts",
  "Pants",
  "Shoes",
  "Outerwear",
  "Accessories",
  "Casual",
  "Brands",
  "Wedding",
  "Featured",
  "Rental",
];

function GlobalNav() {
  return (
    <header className="nav">
      <div className="nav-utility">
        <a className="nav-logo" href="#" onClick={stop} aria-label="Men's Wearhouse home">
          <img src={A("nav/logo.svg")} alt="" width="256" height="14" />
        </a>
        <form className="nav-search" role="search" onSubmit={stop}>
          <input type="search" placeholder="What are you looking for?" aria-label="Search" />
          <button type="submit" aria-label="Search">
            <img src={A("nav/search.svg")} alt="" width="24" height="24" />
          </button>
        </form>
        <div className="nav-utility-items">
          <a className="nav-store" href="#" onClick={stop}>
            <img src={A("nav/pin.svg")} alt="" width="24" height="24" />
            Find a Store
          </a>
          <button type="button" className="nav-account">
            <span className="nav-account-label">
              <img src={A("nav/profile.svg")} alt="" width="24" height="24" />
              Sign in
            </span>
            <img src={A("nav/chevron-down.svg")} alt="" width="24" height="24" />
          </button>
          <a className="nav-bag" href="#" onClick={stop} aria-label="Bag">
            <img src={A("nav/bag.svg")} alt="" width="24" height="24" />
          </a>
        </div>
      </div>
      <nav className="nav-links" aria-label="Main">
        {navLinks.map((label) => (
          <a key={label} href="#" onClick={stop}>
            {label}
          </a>
        ))}
        <a className="nav-sale" href="#" onClick={stop}>
          <img src={A("nav/sale.svg")} alt="" width="24" height="24" />
          Sale
        </a>
      </nav>
    </header>
  );
}

/* ---------- Shared bits ---------- */

function TextureButton({ children, tone = "burgundy", href = "#" }) {
  return (
    <a className={`tex-btn tex-btn--${tone}`} href={href} onClick={stop}>
      <span>{children}</span>
    </a>
  );
}

function ShopTheLook() {
  return (
    <a className="look-btn" href="#" onClick={stop}>
      <span className="look-btn-label">Shop the look</span>
      <span className="look-btn-plus" aria-hidden="true">
        +
      </span>
    </a>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="hero">
      <img className="hero-photo" src={A("hero/hero.png")} alt="" />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-lockup">
        <p className="hero-eyebrow">Holiday Party, Handled.</p>
        <h1 className="hero-title">Holiday Party, Handled.</h1>
        <TextureButton>Shop Holiday Looks</TextureButton>
      </div>
    </section>
  );
}

/* ---------- Category tags ---------- */

// swing: "right" = rotate 3deg, "still" = none, "left" = rotate -3deg (Figma variants).
const tags = [
  { label: "Gifts", icon: "gifts", swing: "right", tracking: 0.32 },
  { label: "Accessories", icon: "accessories", swing: "still" },
  { label: "Casual Shirts", icon: "casual-shirts", swing: "left" },
  { label: "Suits", icon: "suits", swing: "right" },
  { label: "Jeans & Chinos", icon: "jeans-chinos", swing: "still" },
  { label: "Outerwear", icon: "outerwear", swing: "left" },
];

function CategoryTags() {
  return (
    <section className="tags" aria-label="Shop by category">
      <div className="tags-head">
        <h2 className="tags-title">
          Oh What Fun It Is to Buy... <em>(or something like that)</em>
        </h2>
        <div className="tags-actions">
          <a className="link-caps" href="#" onClick={stop}>
            Shop All
          </a>
          <img src={A("tags/arrows.svg")} alt="" width="128" height="19" />
        </div>
      </div>
      <div className="tags-row">
        {tags.map((tag) => (
          <a key={tag.label} className="tag-slot" href="#" onClick={stop}>
            <span className={`tag tag--${tag.swing}`}>
              <img className="tag-body" src={A("tags/kraft.svg")} alt="" width="132" height="184" />
              <img className="tag-washer" src={A("tags/washer.svg")} alt="" width="21" height="21" />
              <img className="tag-icon" src={A(`tags/${tag.icon}.svg`)} alt="" width="72" height="72" />
              <span
                className="tag-label"
                style={tag.tracking ? { letterSpacing: `${tag.tracking}px` } : undefined}
              >
                {tag.label}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------- Gifts ---------- */

function Gifts() {
  return (
    <section className="gifts">
      <div className="gifts-suitcase">
        <img src={A("gifts/suitcase.png")} alt="" />
      </div>
      <div className="gifts-still">
        <img src={A("gifts/still.png")} alt="" />
      </div>
      <img className="gifts-seal" src={A("gifts/wax-seal.png")} alt="" />
      <div className="gifts-copy">
        <h2 className="gifts-title">Gifts He’ll Love</h2>
        <p className="gifts-body">Find a thoughtful gift that fits his style—and every occasion.</p>
        <div className="gifts-cta">
          <TextureButton tone="ivory">Shop Gifts</TextureButton>
        </div>
      </div>
    </section>
  );
}

/* ---------- Holiday, in the real world ---------- */

function RealWorld() {
  return (
    <section className="real">
      <div className="real-accent" aria-hidden="true" />
      <div className="real-head">
        <div className="real-titles">
          <p className="eyebrow">A little holiday know-how</p>
          <h2 className="h-section">Holiday, in the real world</h2>
          <p className="real-deck">We've been helping men get dressed for life's big moments for generations.</p>
        </div>
        <div className="real-patch">
          <div className="real-patch-box">
            <img src={A("realworld/love-patch.png")} alt="Love, Men’s Wearhouse" />
          </div>
        </div>
      </div>
      <div className="real-row">
        <article className="real-tile real-tile--office">
          <img className="real-office-photo" src={A("realworld/office-party.png")} alt="" />
          <h3 className="real-office-title">The Office Party</h3>
          <div className="real-office-cta">
            <ShopTheLook />
          </div>
        </article>
        <article className="real-tile real-tile--family">
          <img className="real-family-photo" src={A("realworld/family-gathering.png")} alt="" />
          <div className="real-family-scrim" aria-hidden="true" />
          <div className="real-family-copy">
            <h3 className="real-family-title">The Family Gathering</h3>
            <ShopTheLook />
          </div>
        </article>
      </div>
    </section>
  );
}

/* ---------- The Sale Edit ---------- */

function SaleEdit() {
  return (
    <section className="sale">
      <div className="sale-head">
        <h2 className="h-section">The Sale Edit</h2>
        <a className="link-caps link-caps--dark sale-all" href="#" onClick={stop}>
          Shop all sale
        </a>
      </div>
      <div className="sale-grid">
        <a className="sale-suits" href="#" onClick={stop}>
          <img className="sale-suits-photo" src={A("sale/suits.png")} alt="" width="600" height="717" />
          <span className="sale-shade" aria-hidden="true" />
          <span className="sale-shade" aria-hidden="true" />
          <span className="sale-label">
            Suits
            <img src={A("sale/arrow.svg")} alt="" width="40" height="9" />
          </span>
        </a>
        <div className="sale-pair">
          <div className="sale-blank" aria-label="Sport coats" />
          <div className="sale-blank" aria-label="Dress shirts" />
        </div>
      </div>
    </section>
  );
}

/* ---------- Shipping banner ---------- */

function ShippingBanner() {
  return (
    <section className="ship" aria-label="Holiday shipping">
      <p className="ship-caps">Order by Dec 15</p>
      <p className="ship-title">Free shipping</p>
      <p className="ship-caps">Arrives by Christmas</p>
    </section>
  );
}

/* ---------- New Arrivals ---------- */

const arrivals = ["Suits", "Suits", "Suits", "Suits"];

function NewArrivals() {
  return (
    <section className="arrivals">
      <h2 className="arrivals-title">New Arrivals</h2>
      <div className="arrivals-row">
        {arrivals.map((label, index) => (
          <a key={index} className="arrival" href="#" onClick={stop}>
            <span className="arrival-photo" />
            <span className="arrival-caption">
              <span className="arrival-tape">
                <img className={`arrival-tape-img arrival-tape-img--${index + 1}`} src={A("arrivals/kraft-tape.png")} alt="" />
              </span>
              <span className="arrival-label">{label}</span>
              <img className="arrival-arrow" src={A("arrivals/arrow.svg")} alt="" width="44" height="10" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------- Reassurance ---------- */

const reassurance = [
  { icon: "truck", title: "Free shipping", body: "On orders over $99." },
  { icon: "returns", title: "Easy returns", body: "Free, to any store or online." },
  { icon: "pickup", title: "Store pickup", body: "Pick up or ship to your store." },
];

function Reassurance() {
  return (
    <section className="reassure">
      {reassurance.map((item) => (
        <div key={item.title} className="reassure-item">
          <span className={`reassure-icon reassure-icon--${item.icon}`}>
            <span>
              <span>
                <img src={A(`reassure/${item.icon}.svg`)} alt="" />
              </span>
            </span>
          </span>
          <p className="reassure-title">{item.title}</p>
          <p className="reassure-body">{item.body}</p>
        </div>
      ))}
    </section>
  );
}

/* ---------- Recently viewed ---------- */

const recent = [
  { name: "Egara Golden Santa Socks, 1-Pair, Gray", price: "$16", photo: "recent/sock-1.png" },
  { name: "Egara Snowmen Socks, 1-Pair, Gray", price: "$16", photo: "recent/sock-2.png" },
  { name: "Egara Surfing Santa Socks, 1-Pair, Black", price: "$16", photo: "recent/sock-3.png" },
  { name: "Joseph Abboud Golf Pattern Performance Socks, 1-Pair, Blue", price: "$18", photo: "recent/sock-4.png" },
  { name: "Egara Party Socks, 1-Pair, Gray", price: "$15", photo: "recent/sock-5.png" },
];

const CARD_STEP = 311; // 295px card + 16px gap
const CAROUSEL_WIDTH = 844;
const MAX_SHIFT = recent.length * CARD_STEP - 16 - CAROUSEL_WIDTH;

function RecentlyViewed() {
  const [shift, setShift] = useState(0);
  const atEnd = shift >= MAX_SHIFT;
  const progressLeft = MAX_SHIFT ? (shift / MAX_SHIFT) * (CAROUSEL_WIDTH - 298) : 0;

  function next() {
    setShift((current) => (current >= MAX_SHIFT ? 0 : Math.min(current + CARD_STEP, MAX_SHIFT)));
  }

  return (
    <section className="recent">
      <div className="recent-copy">
        <h2 className="recent-title">
          Pick up
          <br />
          where you
          <br />
          left off
        </h2>
        <p className="recent-deck">The styles you were looking at, right where you left them.</p>
        <a className="link-caps link-caps--dark" href="#" onClick={stop}>
          Recently Viewed
        </a>
      </div>
      <div className="recent-carousel">
        <div className="recent-cards" style={{ transform: `translateX(${-shift}px)` }}>
          {recent.map((card) => (
            <a key={card.name} className="recent-card" href="#" onClick={stop}>
              <img className="recent-photo" src={A(card.photo)} alt="" />
              <span className="recent-name">{card.name}</span>
              <span className="recent-price">{card.price}</span>
            </a>
          ))}
        </div>
        <span className="recent-track" aria-hidden="true" />
        <span className="recent-progress" style={{ transform: `translateX(${progressLeft}px)` }} aria-hidden="true" />
        <button type="button" className="recent-next" onClick={next} aria-label={atEnd ? "Back to start" : "Next"}>
          <img src={A("recent/arrow-right.svg")} alt="" width="18" height="18" />
        </button>
      </div>
    </section>
  );
}

/* ---------- Brands ---------- */

const brands = [
  { name: "Kenneth Cole", style: "kenneth" },
  { name: "Calvin Klein", style: "calvin" },
  { name: "Cole Haan", style: "cole", sub: "Est. 1928" },
  { name: "Tommy Hilfiger", style: "tommy" },
  { name: "Michael Kors", style: "kors" },
];

function Brands() {
  return (
    <section className="brands">
      <div className="brands-head">
        <h2 className="brands-title">Holiday-ready brands</h2>
        <p className="brands-deck">Standout styles from the brands you wear, all in one place.</p>
      </div>
      <div className="brands-row">
        {brands.map((brand) => (
          <a key={brand.name} className="badge" href="#" onClick={stop}>
            <span className="badge-stitch">
              <span className={`badge-name badge-name--${brand.style}`}>
                {brand.name}
                {brand.sub ? <span className="badge-sub">{brand.sub}</span> : null}
              </span>
            </span>
          </a>
        ))}
      </div>
      <a className="link-caps link-caps--white" href="#" onClick={stop}>
        Shop All
      </a>
    </section>
  );
}

/* ---------- Footer ---------- */

const footerColumns = [
  { title: "Company", links: ["The MW Story", "Careers", "Investor Relations", "Store Locator"] },
  {
    title: "Customer Services",
    links: ["Help & FAQs", "Rental FAQs", "Shipping", "Returns & Exchanges", "Track My Order", "Contact Us", "Feedback"],
  },
  {
    title: "Quick Links",
    links: [
      "Site Map",
      "Gift Cards",
      "Perfect Fit Rewards",
      "Coupons and Deals",
      "Threadworthy Blog",
      "Prom Advice & Trends",
      "All Brands",
      "Jos.A.Bank Clothiers",
      "Gift List",
    ],
  },
];

const socials = [
  { label: "X", icon: "x" },
  { label: "Facebook", icon: "facebook" },
  { label: "Instagram", icon: "instagram" },
  { label: "YouTube", icon: "youtube" },
  { label: "Pinterest", icon: "pinterest" },
  { label: "TikTok", icon: "tiktok" },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="refer">
        <p className="refer-title">Give $20, Get $20!</p>
        <div className="refer-copy">
          <p>Give friends $20 off their first order,</p>
          <p>and you’ll get $20 when they make a purchase!</p>
        </div>
        <a className="refer-btn" href="#" onClick={stop}>
          Refer a friend
        </a>
      </div>
      <div className="footer-main">
        <div className="footer-links">
          {footerColumns.map((column) => (
            <div key={column.title} className="footer-col">
              <p className="footer-col-title">{column.title}</p>
              <ul>
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" onClick={stop}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer-col">
            <p className="footer-col-title">Follow</p>
            <ul>
              {socials.map((social) => (
                <li key={social.label}>
                  <a className="footer-social" href="#" onClick={stop}>
                    <span className={`footer-social-icon footer-social-icon--${social.icon}`}>
                      <img src={A(`footer/${social.icon}.svg`)} alt="" />
                    </span>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <form className="footer-optin" onSubmit={stop}>
            <div className="footer-optin-top">
            <p className="footer-optin-title">Be the first to know about new arrivals, promotions and more</p>
            <div className="footer-fields">
              <label className="footer-field">
                <img src={A("footer/mail.svg")} alt="" width="24" height="24" />
                <input type="email" placeholder="Email Address" aria-label="Email Address" />
              </label>
              <label className="footer-field">
                <img src={A("footer/phone.svg")} alt="" width="24" height="24" />
                <input type="tel" placeholder="Phone Number" aria-label="Phone Number" />
              </label>
            </div>
            </div>
            <p className="footer-texts">
              <img src={A("footer/curved-arrow.svg")} alt="" width="24" height="24" />
              <span>
                Sign up for texts and get $20 Off $100+ instantly! <a href="#" onClick={stop}>*Terms Apply</a>
              </span>
            </p>
          </form>
        </div>
        <div className="footer-secondary">
          <div className="footer-terms">
            <a href="#" onClick={stop}>Mobile Terms</a>
            <span className="dot">·</span>
            <a className="footer-privacy" href="#" onClick={stop}>Privacy &amp; Security Policy</a>
            <span className="dot">·</span>
            <a className="footer-dns" href="#" onClick={stop}>Do Not Sell Or Share My Personal Information</a>
            <span className="dot">·</span>
            <a href="#" onClick={stop}>Terms of Use</a>
            <span className="dot">·</span>
            <a href="#" onClick={stop}>CA Transparency in Supply Chains Act</a>
            <span className="dot">·</span>
            <a className="footer-a11y" href="#" onClick={stop}>
              Accessibility Standards
              <span className="footer-a11y-icons">
                <img src={A("footer/physical-access.svg")} alt="" width="24" height="24" />
                <img src={A("footer/control-access.svg")} alt="" width="24" height="24" />
                <span className="footer-a11y-digital">
                  <img src={A("footer/digital-access.svg")} alt="" />
                </span>
              </span>
            </a>
          </div>
          <img className="footer-divider" src={A("footer/divider.svg")} alt="" />
          <div className="footer-bottom">
            <p>© 2000-2026 The Men's Wearhouse, Inc. All Rights Reserved.</p>
            <img src={A("footer/norton.png")} alt="Secured" width="84" height="44" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="page">
      <GlobalNav />
      <main>
        <Hero />
        <CategoryTags />
        <Gifts />
        <RealWorld />
        <SaleEdit />
        <ShippingBanner />
        <NewArrivals />
        <Reassurance />
        <RecentlyViewed />
        <Brands />
      </main>
      <Footer />
    </div>
  );
}
