import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import SalePage from "../../../src/SalePage.jsx";
import pgpCss from "../../../src/style.css?inline";

export default function ProductGridEntry({
  onTakeQuiz,
  onBackToQuiz,
  initialFilters,
  quizMatchIds,
  title = "All Suits",
  crumb = "Suits",
}) {
  const hostRef = useRef(null);
  const rootRef = useRef(null);
  const onTakeQuizRef = useRef(onTakeQuiz);
  const onBackRef = useRef(onBackToQuiz);
  onTakeQuizRef.current = onTakeQuiz;
  onBackRef.current = onBackToQuiz;

  useEffect(() => {
    const host = hostRef.current;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(pgpCss.replaceAll(":root", ":host"));
    shadow.adoptedStyleSheets = [sheet];

    const mount = document.createElement("div");
    shadow.appendChild(mount);
    rootRef.current = createRoot(mount);

    return () => {
      rootRef.current.unmount();
      rootRef.current = null;
      mount.remove();
    };
  }, []);

  useEffect(() => {
    rootRef.current?.render(
      <SalePage
        title={title}
        crumb={crumb}
        initialFilters={initialFilters}
        quizMatchIds={quizMatchIds}
        onNavigate={() => {}}
        onTakeQuiz={() => onTakeQuizRef.current()}
        onBackToQuiz={onBackRef.current ? () => onBackRef.current() : undefined}
      />
    );
  }, [title, crumb, initialFilters, quizMatchIds]);

  return <div className="pgp-host" ref={hostRef} />;
}
