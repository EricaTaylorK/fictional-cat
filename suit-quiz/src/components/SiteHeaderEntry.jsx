import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import SiteHeader from "../../../src/components/SiteHeader.jsx";
import pgpCss from "../../../src/style.css?inline";
import entryCss from "./entries/entries.css?inline";

/**
 * Mounts the real Men's Wearhouse SiteHeader in a shadow root so quiz
 * global CSS (h1 max-width, .site-header grid, :root tokens) cannot
 * restyle it, matching ProductGridEntry's SalePage chrome.
 */
export default function SiteHeaderEntry({ onNavigate, onFindSuit, current }) {
  const hostRef = useRef(null);
  const rootRef = useRef(null);
  const [search, setSearch] = useState("");
  const onNavigateRef = useRef(onNavigate);
  const onFindSuitRef = useRef(onFindSuit);
  onNavigateRef.current = onNavigate;
  onFindSuitRef.current = onFindSuit;

  useEffect(() => {
    const host = hostRef.current;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`${pgpCss.replaceAll(":root", ":host")}\n${entryCss}`);
    shadow.adoptedStyleSheets = [sheet];

    const mount = document.createElement("div");
    shadow.appendChild(mount);
    rootRef.current = createRoot(mount);

    return () => {
      rootRef.current?.unmount();
      rootRef.current = null;
      mount.remove();
    };
  }, []);

  useEffect(() => {
    rootRef.current?.render(
      <SiteHeader
        search={search}
        onSearch={setSearch}
        current={current}
        onNavigate={(next) => onNavigateRef.current?.(next)}
        onFindSuit={() => onFindSuitRef.current?.()}
      />,
    );
  }, [search, current]);

  return <div className="site-header-host" ref={hostRef} />;
}
