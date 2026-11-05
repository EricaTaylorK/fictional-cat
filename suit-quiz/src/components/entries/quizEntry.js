/** Surface ids from the Suit Finder entry-point mapping. */
export const ENTRYPOINTS = [
  "home-hero",
  "nav-mega",
  "pgp-suits",
  "pgp-tux",
  "pgp-separates",
  "lp-fit",
  "lp-wedding",
  "lp-custom",
];

/** Quiz root with the surface id analytics reads from the URL. */
export function quizHref(entrypoint) {
  const params = new URLSearchParams({ entrypoint });
  return `/?${params.toString()}`;
}

/** Same dataLayer pattern the quiz uses for click events. */
export function trackEntryClick(entrypoint) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "suit_finder_entrypoint_click",
    entrypoint,
  });
}
