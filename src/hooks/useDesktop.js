import { useEffect, useState } from "react";

const QUERY = "(min-width: 1024px)";

export default function useDesktop() {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(QUERY).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    function onChange() {
      setDesktop(media.matches);
    }
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return desktop;
}
