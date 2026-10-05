import { useState } from "react";

export default function SiteFooter() {
  const [joined, setJoined] = useState(false);

  return (
    <footer className="site-footer">
      <div className="footer-referral">
        <h2>Give $20, Get $20!</h2>
        <p>Give friends $20 off their first order, and you’ll get $20 when they make a purchase.</p>
        <a href="#suits">Refer a friend</a>
      </div>
      <div className="footer-inner">
        <div className="footer-columns">
          <div>
            <p>Company</p>
            <span>The MW Story</span>
            <span>Careers</span>
            <span>Store Locator</span>
          </div>
          <div>
            <p>Customer Service</p>
            <span>Help &amp; FAQs</span>
            <span>Shipping</span>
            <span>Returns &amp; Exchanges</span>
            <span>Contact Us</span>
          </div>
          <div>
            <p>Quick Links</p>
            <span>Gift Cards</span>
            <span>Perfect Fit Rewards</span>
            <span>Coupons and Deals</span>
          </div>
        </div>
        <form
          className="footer-signup"
          onSubmit={(event) => {
            event.preventDefault();
            setJoined(true);
          }}
        >
          <p>Be the first to know about new arrivals, promotions and more</p>
          <label>
            <span className="visually-hidden">Email address</span>
            <input type="email" required placeholder="Email Address" />
          </label>
          <button type="submit">{joined ? "You're on the list" : "Sign up"}</button>
        </form>
        <p className="footer-legal">© 2000-2026 The Men’s Wearhouse, LLC. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
