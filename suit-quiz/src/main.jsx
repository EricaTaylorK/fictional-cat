import React from "react";
import ReactDOM from "react-dom/client";
import AccountPage from "./account/AccountPage.jsx";
import App from "./App.jsx";
import PlacementsDemo from "./placements/PlacementsDemo.jsx";
import "./kairos/themes/index.scss";
import "./styles.css";

const path = window.location.pathname.replace(/\/+$/, "");
const placements = path === "/placements";
const account = path === "/myAccount";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {placements ? <PlacementsDemo /> : account ? <AccountPage /> : <App />}
  </React.StrictMode>,
);
