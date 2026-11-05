import { useEffect, useMemo, useRef, useState } from "react";
import SiteFooter from "../../../src/components/SiteFooter.jsx";
import useDesktop from "../../../src/hooks/useDesktop.js";
import SiteHeaderEntry from "../components/SiteHeaderEntry.jsx";
import { fitProfileRows } from "../components/Results.jsx";
import {
  buildResultSummary,
  formatPrice,
  getRecommendations,
  getRentalRecommendations,
} from "../lib/recommendation.js";
import "./account.css";

const STORAGE_KEY = "suit-quiz-wireframe-progress";

const NAV = [
  { id: "account-info", label: "Account Info" },
  { id: "suit-profile", label: "Suit Profile" },
  { id: "rewards", label: "Perfect Fit Rewards" },
  { id: "orders", label: "Order History" },
  { id: "wallet", label: "My Wallet" },
  { id: "addresses", label: "My Addresses" },
  { id: "appointments", label: "My Appointments" },
  { id: "saved", label: "Saved Items" },
  { id: "refer", label: "Refer A Friend Dashboard" },
  { id: "rental", label: "Rental Dashboard" },
  { id: "sign-out", label: "Sign Out" },
];

function readSavedAnswers() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || saved.answers == null || typeof saved.answers !== "object") return null;
    if (!Object.keys(saved.answers).length) return null;
    return saved.answers;
  } catch {
    return null;
  }
}

function HammerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.75 7.25h12.5v4.5H2.75z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 7.25 19.75 5.25M15.25 11.75 19.75 13.75M8 11.75V20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg className={open ? "is-open" : undefined} viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3.5 6 4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ItemIcon({ id }) {
  if (id === "addresses") {
    return (
      <span className="account-icon">
        <PinIcon />
      </span>
    );
  }
  return (
    <span className="account-icon" title="Icon placeholder">
      <HammerIcon />
      <span className="visually-hidden">Icon placeholder</span>
    </span>
  );
}

function AccountNav({ selected, onSelect }) {
  const desktop = useDesktop();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const current = NAV.find((item) => item.id === selected) ?? NAV[1];

  useEffect(() => {
    if (desktop) setOpen(false);
  }, [desktop]);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(id) {
    onSelect(id);
    setOpen(false);
  }

  if (desktop) {
    return (
      <nav className="account-nav" aria-label="Account">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === selected ? "is-selected" : undefined}
            aria-current={item.id === selected ? "page" : undefined}
            onClick={() => choose(item.id)}
          >
            <ItemIcon id={item.id} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className="account-menu-toggle"
        aria-expanded={open}
        aria-controls="account-menu-list"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="account-menu-current">
          <ItemIcon id={current.id} />
          <span>{current.label}</span>
        </span>
        <span className="account-chevron">
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && (
        <nav className="account-nav account-nav-menu" id="account-menu-list" aria-label="Account">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === selected ? "is-selected" : undefined}
              aria-current={item.id === selected ? "page" : undefined}
              onClick={() => choose(item.id)}
            >
              <ItemIcon id={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

function SuitProfileSection({ answers }) {
  const summary = useMemo(() => (answers ? buildResultSummary(answers) : null), [answers]);
  const renting = answers?.mode === "rent";
  const rows = summary
    ? fitProfileRows({
      answers,
      renting,
      size: summary.sizeEstimate,
      fitName: summary.fitName,
    })
    : [];
  const recommendations = useMemo(() => {
    if (!answers) return [];
    const ranked = renting ? getRentalRecommendations(answers) : getRecommendations(answers);
    return ranked.slice(0, 3);
  }, [answers, renting]);

  if (!answers) {
    return (
      <section className="account-section" aria-labelledby="fit-profile-title">
        <div className="fit-card">
          <h2 id="fit-profile-title" className="fit-card-title">Your suit profile</h2>
          <p className="account-empty">
            Your suit profile is empty. <a href="/">Back to the quiz</a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="account-section" aria-labelledby="fit-profile-title">
      <div className="fit-card">
        <div className="fit-card-head">
          <h2 id="fit-profile-title" className="fit-card-title">Your suit profile</h2>
          <a className="results-hero-action" href="/">
            <PencilIcon />
            Edit answers
          </a>
        </div>
        {rows.map((row) => (
          <div className="fit-group" key={row.label}>
            <p className="fit-group-label">{row.label}</p>
            <p className="fit-group-line">{row.value}</p>
          </div>
        ))}
      </div>
      <div className="account-recs">
        <h2 className="account-recs-title">Your recommendations</h2>
        <ul className="account-rec-list">
          {recommendations.map((product) => (
            <li key={product.id}>
              <article className="suit-card account-rec">
                <div className="suit-card-face">
                  <div className="suit-row">
                    <div className="suit-card-media">
                      <div className="product-image">
                        <img src={product.image} alt="" />
                      </div>
                    </div>
                    <div className="suit-card-body">
                      <div className="suit-badges">
                        <span className="match-score">
                          {Number.isFinite(product.matchPercent) ? `${product.matchPercent}% match` : "Great match"}
                        </span>
                      </div>
                      <div className="suit-card-copy">
                        <div className="suit-card-names">
                          <p className="product-brand">{product.brand}</p>
                          <h3 className="product-title">{product.name}</h3>
                        </div>
                      </div>
                      <p className="suit-price">
                        <strong>{formatPrice(product.price)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PlaceholderSection({ id }) {
  const item = NAV.find((entry) => entry.id === id);
  return (
    <section className="account-section" aria-labelledby={`account-section-${id}`}>
      <h2 id={`account-section-${id}`}>{item?.label}</h2>
      <p className="account-note">This section is not part of this demo.</p>
    </section>
  );
}

export default function AccountPage() {
  const [selected, setSelected] = useState("suit-profile");
  const [answers] = useState(readSavedAnswers);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "My Account | Men's Wearhouse";
    document.documentElement.classList.add("page-white");
    return () => {
      document.title = previousTitle;
      document.documentElement.classList.remove("page-white");
    };
  }, []);

  function leaveAccount() {
    window.location.assign("/");
  }

  return (
    <>
      <SiteHeaderEntry
        accountName="Isaac"
        onNavigate={leaveAccount}
        onFindSuit={leaveAccount}
      />
      <main className="account-page">
        <h1 className="visually-hidden">My Account</h1>
        <AccountNav selected={selected} onSelect={setSelected} />
        <div className="account-content">
          {selected === "suit-profile" ? (
            <SuitProfileSection answers={answers} />
          ) : (
            <PlaceholderSection id={selected} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
