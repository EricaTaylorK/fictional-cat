import { useEffect, useState } from "react";
import RentalPdp from "./components/RentalPdp.jsx";
import SalePage from "./SalePage.jsx";
import "./style.css";

function readView() {
  return window.location.hash === "#look" ? "look" : "sale";
}

export default function App() {
  const [view, setView] = useState(readView);

  useEffect(() => {
    const sync = () => setView(readView());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function navigate(next) {
    const hash = next === "look" ? "#look" : "#sale";
    if (window.location.hash !== hash) window.location.hash = hash;
    else setView(next === "look" ? "look" : "sale");
  }

  if (view === "look") {
    return <RentalPdp onNavigate={navigate} />;
  }

  return <SalePage onNavigate={navigate} />;
}
