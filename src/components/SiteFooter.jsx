import { useState } from "react";

export default function SiteFooter() {
  const [joined, setJoined] = useState(false);

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <form
          className="footer-signup"
          onSubmit={(event) => {
            event.preventDefault();
            setJoined(true);
          }}
        >
          <p className="footer-kicker">Stay in the know</p>
          <label>
            <span className="visually-hidden">Email address</span>
            <input type="email" required placeholder="Email address" />
          </label>
          <button type="submit">{joined ? "You're on the list" : "Sign up"}</button>
        </form>
        <div className="footer-columns">
          <div>
            <p>Customer service</p>
            <span>Help</span>
            <span>Track order</span>
            <span>Returns</span>
          </div>
          <div>
            <p>About</p>
            <span>Stores</span>
            <span>Careers</span>
            <span>Gift cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
