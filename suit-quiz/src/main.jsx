import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PlacementsDemo from "./placements/PlacementsDemo.jsx";
import "./kairos/themes/index.scss";
import "./styles.css";

const placements = window.location.pathname.replace(/\/+$/, "") === "/placements";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {placements ? <PlacementsDemo /> : <App />}
  </React.StrictMode>,
);
