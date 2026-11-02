import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import SalePage from "../../../src/SalePage.jsx";
import pgpCss from "../../../src/style.css?inline";

export default function ProductGridEntry({ onTakeQuiz }) {
  const hostRef = useRef(null);
  const onTakeQuizRef = useRef(onTakeQuiz);
  onTakeQuizRef.current = onTakeQuiz;

  useEffect(() => {
    const host = hostRef.current;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(pgpCss.replaceAll(":root", ":host"));
    shadow.adoptedStyleSheets = [sheet];

    const mount = document.createElement("div");
    shadow.appendChild(mount);
    const root = createRoot(mount);
    root.render(
      <SalePage
        title="All Suits"
        crumb="Suits"
        onNavigate={() => {}}
        onTakeQuiz={() => onTakeQuizRef.current()}
      />
    );

    return () => {
      root.unmount();
      mount.remove();
    };
  }, []);

  return <div className="pgp-host" ref={hostRef} />;
}
