import { useRef, useState } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="nav">
      {/* Mobile + tablet bar, below 1024 (Replatform "Global Navigation / Mobile") */}
      <div className="nav-mobile">
        <div className="nav-mobile-start">
          <button
            type="button"
            className="nav-icon-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="nav-drawer"
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            <img src={A("nav/menu.svg")} alt="" width="32" height="32" />
          </button>
          <a className="nav-mobile-logo" href="#" onClick={stop} aria-label="Men's Wearhouse home">
            <img src={A("nav/logo-mobile.svg")} alt="" width="168" height="9" />
          </a>
        </div>
        <div className="nav-mobile-end">
          <button
            type="button"
            className="nav-icon-btn"
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-controls="nav-mobile-search"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMenuOpen(false);
            }}
          >
            <img src={A("nav/search-mobile.svg")} alt="" width="32" height="32" />
          </button>
          <a className="nav-icon-btn" href="#" onClick={stop} aria-label="Bag">
            <img src={A("nav/bag-mobile.svg")} alt="" width="32" height="32" />
          </a>
        </div>
      </div>
      {searchOpen ? (
        <form id="nav-mobile-search" className="nav-mobile-search" role="search" onSubmit={stop}>
          <input type="search" placeholder="What are you looking for?" aria-label="Search" autoFocus />
        </form>
      ) : null}
      {menuOpen ? (
        <nav id="nav-drawer" className="nav-drawer" aria-label="Main">
          {navLinks.map((label) => (
            <a key={label} href="#" onClick={stop}>
              {label}
            </a>
          ))}
          <a className="nav-sale" href="#" onClick={stop}>
            Sale
          </a>
        </nav>
      ) : null}

      {/* Desktop bar, 1024 and up */}
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
    <a className={`tex-btn tex-btn--${tone} t-cta`} href={href} onClick={stop}>
      <span>{children}</span>
    </a>
  );
}

function ShopTheLook() {
  return (
    <a className="look-btn" href="#" onClick={stop}>
      <span className="look-btn-label t-cta">Shop the look</span>
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
        <p className="hero-eyebrow t-eyebrow-lg">Holiday Party, Handled.</p>
        <h1 className="hero-title t-display">Show up ready for every holiday party.</h1>
        <TextureButton>Shop holiday outfits</TextureButton>
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
        <h2 className="tags-title t-h4">
          Oh What Fun It Is to Buy... <em>(or something like that)</em>
        </h2>
        <div className="tags-actions">
          <a className="link-caps t-cta" href="#" onClick={stop}>
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
                className="tag-label t-label"
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
      {/* Collage box = Figma's x 431–1440 strip; children are % of it so it scales as one piece */}
      <div className="gifts-collage">
        <div className="gifts-suitcase">
          <img src={A("gifts/suitcase.png")} alt="" />
        </div>
        <div className="gifts-still">
          <img src={A("gifts/still.png")} alt="" />
        </div>
        <img className="gifts-seal" src={A("gifts/wax-seal.png")} alt="" />
      </div>
      <div className="gifts-copy">
        <h2 className="gifts-title t-h2">Gifts that feel like him</h2>
        <p className="gifts-body t-body">
          From everyday favorites to party-ready finishing touches, find a gift he’ll reach for long after the holidays.
        </p>
        <div className="gifts-cta">
          <TextureButton tone="ivory">Shop gifts for him</TextureButton>
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
          <p className="eyebrow t-eyebrow">A little know-how goes a long way</p>
          <h2 className="h-section t-h1">Ready for the moments that matter</h2>
          <p className="real-deck t-lead">
            For generations, we’ve helped men get dressed for life’s big moments—and all the ones in between.
          </p>
        </div>
        {/* Figma export of the "Love patch" frame (48:635): rotation, blend-mode shadows and clip included */}
        <img
          className="real-patch"
          src={A("realworld/love-patch.svg")}
          alt="Love, Men’s Wearhouse"
          width="302"
          height="214"
        />
      </div>
      <div className="real-row">
        <article className="real-tile real-tile--office">
          <img className="real-office-photo" src={A("realworld/office-party.png")} alt="" />
          <h3 className="real-office-title t-eyebrow-lg t-wide">The Office Party</h3>
          <div className="real-office-cta">
            <ShopTheLook />
          </div>
        </article>
        <article className="real-tile real-tile--family">
          <img className="real-family-photo" src={A("realworld/family-gathering.png")} alt="" />
          <div className="real-family-scrim" aria-hidden="true" />
          <div className="real-family-copy">
            <h3 className="real-family-title t-eyebrow-lg t-wide">The Family Gathering</h3>
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
        <h2 className="h-section t-h1">The holiday sale</h2>
        <a className="link-caps link-caps--dark sale-all t-cta" href="#" onClick={stop}>
          Shop all sale styles
        </a>
      </div>
      <div className="sale-grid">
        <a className="sale-suits" href="#" onClick={stop}>
          <img className="sale-suits-photo" src={A("sale/suits.png")} alt="" width="600" height="717" />
          <span className="sale-shade" aria-hidden="true" />
          <span className="sale-shade" aria-hidden="true" />
          <span className="sale-label t-eyebrow-lg">
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
      <p className="ship-caps t-eyebrow-lg">Order by Dec 15</p>
      <p className="ship-title t-h4">Free shipping</p>
      <p className="ship-caps t-eyebrow-lg">Arrives by Christmas</p>
    </section>
  );
}

/* ---------- New Arrivals ---------- */

const arrivals = ["Suits", "Suits", "Suits", "Suits"];

function NewArrivals() {
  return (
    <section className="arrivals">
      <h2 className="arrivals-title t-h2">Just in: new-season styles</h2>
      <div className="arrivals-row">
        {arrivals.map((label, index) => (
          <a key={index} className="arrival" href="#" onClick={stop}>
            <span className="arrival-photo" />
            <span className="arrival-caption">
              <span className="arrival-tape">
                <img className={`arrival-tape-img arrival-tape-img--${index + 1}`} src={A("arrivals/kraft-tape.png")} alt="" />
              </span>
              <span className="arrival-label t-eyebrow">{label}</span>
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
  { icon: "returns", title: "Easy returns", body: "Return in store or by mail, free." },
  { icon: "pickup", title: "Free store pickup", body: "Pick up in store or have your order shipped there." },
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
          <p className="reassure-title t-h4">{item.title}</p>
          <p className="reassure-body t-body">{item.body}</p>
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

// The card row scrolls natively (swipe on touch, the Next button on desktop);
// the progress bar follows the scroll position.
function RecentlyViewed() {
  const cardsRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const atEnd = progress > 0.99;

  function onScroll() {
    const el = cardsRef.current;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }

  function next() {
    const el = cardsRef.current;
    const card = el.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth;
    if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: step, behavior: "smooth" });
  }

  return (
    <section className="recent">
      <div className="recent-copy">
        <h2 className="recent-title t-h2">Still thinking it over?</h2>
        <p className="recent-deck t-body">Your recently viewed styles are right here.</p>
        <a className="link-caps link-caps--dark t-cta" href="#" onClick={stop}>
          View all recently viewed
        </a>
      </div>
      <div className="recent-carousel">
        <div className="recent-cards" ref={cardsRef} onScroll={onScroll}>
          {recent.map((card) => (
            <a key={card.name} className="recent-card t-small" href="#" onClick={stop}>
              <img className="recent-photo" src={A(card.photo)} alt="" />
              <span className="recent-name">{card.name}</span>
              <span className="recent-price">{card.price}</span>
            </a>
          ))}
        </div>
        <span className="recent-track" aria-hidden="true" />
        <span className="recent-progress" style={{ "--progress": progress }} aria-hidden="true" />
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
        <h2 className="brands-title t-h3">Holiday-ready brands</h2>
        <p className="brands-deck t-lead">Standout styles from the brands you wear, all in one place.</p>
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
      <a className="link-caps link-caps--white t-cta" href="#" onClick={stop}>
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

// Link group: a plain column on desktop, an accordion row below 768 (Replatform "Footer / Mobile").
function FooterColumn({ title, children }) {
  const [open, setOpen] = useState(false);
  const id = `footer-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className={`footer-col${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="footer-col-title"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <img className="footer-col-chevron" src={A("footer/chevron-down.svg")} alt="" width="24" height="24" />
      </button>
      <ul id={id}>{children}</ul>
    </div>
  );
}

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
            <FooterColumn key={column.title} title={column.title}>
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#" onClick={stop}>
                    {link}
                  </a>
                </li>
              ))}
            </FooterColumn>
          ))}
          <FooterColumn title="Follow">
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
          </FooterColumn>
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
