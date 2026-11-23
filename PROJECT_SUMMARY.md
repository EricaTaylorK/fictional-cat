# Project summary: Suit Finder v2 (Men's Wearhouse prototype)

## What it is
A clickable prototype of a "Suit Finder" AI style quiz for Men's Wearhouse, built inside a store-like shell. A shopper answers questions about the event, fit, colors, size, and budget, then gets ranked suit recommendations with reasons. It also covers tuxedo rental, saved sizes on an account page, and the entry points that open the quiz across the site. It is a design and UX prototype, not a production build.

## Where it lives
- Repo: `my-prototypes`. The project is in the `v2/` folder, on the Git branch `suit-finder-v2`, remote `EricaTaylorK/fictional-cat`.
- Two parts:
  - `v2/src/` is the storefront shell: header and nav, Suits mega-menu, homepage, suit listings, rental shop, filters, footer, and product detail.
  - `v2/suit-quiz/` is the quiz app: intro, questions, matching animation, results, product detail, rentals, and account. Vite dev server, React 18.
- Production deploy: Vercel project `suit-finder-v2` (team-protected with SSO), production domain `suit-finder-v2.vercel.app`. Each push to `suit-finder-v2` deploys.

## Run and test
- Local dev: `cd v2/suit-quiz && npm install && npm run dev`. The dev server was run on port 5196 during this work.
- Tests: `npm test` (Vitest, in `v2/suit-quiz`). Test files cover the recommendation engine, height/weight, look summary, matching steps, products, and entry points.
- Build: `npm run build`.

## Quiz entry points
Eight surface IDs are defined in `v2/suit-quiz/src/components/entries/quizEntry.js`:
`home-hero`, `nav-mega`, `pgp-suits`, `pgp-tux`, `pgp-separates`, `lp-fit`, `lp-wedding`, `lp-custom`.

Clicks push a `suit_finder_entrypoint_click` event to `window.dataLayer`. The quiz URL carries `?entrypoint=<id>`.

The entry components live in `v2/suit-quiz/src/components/entries/SuitFinderEntries.jsx`: `CompactCard`, `LargeHeroBanner`, and `WideSlimBanner`.

Where each one renders in the live prototype (`v2/src/`):
- `home-hero` (`LargeHeroBanner`): on the homepage (`HomeScreen` in `SalePage.jsx`), after the Veterans Day sale hero and before the promo row.
- `lp-wedding` (`LargeHeroBanner`): on the rental shop (`RentalShop` in `SalePage.jsx`), directly under the rental hero and before the "Your wedding, our rentals" section.
- `pgp-suits` (`CompactCard`): inside the product grid on suit listing pages (when the breadcrumb is "Suits").
- `nav-mega` (`CompactCard`): inside the Suits mega-menu drawer (desktop, in `SiteHeader.jsx`), and again on mobile.
- "Find My Suit" filter chip: in `FilterBar.jsx`, which opens the quiz through `onFindSuit`.

Defined in the placements demo (`v2/suit-quiz/src/placements/PlacementsDemo.jsx`) but not wired into the live pages: `pgp-tux`, `pgp-separates`, `lp-fit`, `lp-custom`. The demo shows intended slots for each (for example, `pgp-separates` as a wide slim band after row 3).

## Storefront navigation
- The header logo returns to the homepage from every screen.
- Top-level department names do not navigate on click.
- Suits opens a full drawer: Suiting, Occasions, and Collections columns, a Shop All Suits link, and banner cards.
- Other departments open a short "Shop all" panel.
- Desktop: hover switches panels with a debounce. Click on the open item, Escape, outside click, or browser Back closes the drawer. Keyboard focus stays inside the open drawer.
- Mobile: a menu with a Back control inside the Suits panel.

## The quiz flow
Questions are defined in `v2/suit-quiz/src/data/quizConfig.js`, in this order:
1. `mode`: buy or rent
2. `occasion`: wedding, work, formal, prom, and so on
3. `feel`: fit preference, from skinny to executive
4. `eventDate`: rental dates (rental only)
5. `pieces`: which rental pieces to include
6. `colors`: preferred colors
7. `measurementKnowledge`, then `measurements`: whether the shopper knows their sizes
8. `fitIssues` and `pantsFit`: jacket and pants fit concerns
9. `everydaySizes`: shirt and waist size
10. `height`
11. `tailoring`
12. `budget`

After the questions comes a matching animation, then the results.

## Recommendation logic
`v2/suit-quiz/src/lib/recommendation.js` scores catalog suits against the answers. Color picks rank ahead of occasion and budget. Skinny and executive fits score as the nearest catalog fit (close and roomy), because the catalog has no suits in those fits. Each result shows match reasons as pill chips.

## Data
- `v2/suit-quiz/src/data/products.js`: suit catalog (about 20 suits) with fit, color, occasion, and price.
- `v2/suit-quiz/src/data/rentals.js`: rental packages and pieces, with lead-time constants.
- `v2/src/data/catalog.js`: the storefront listing.
- `v2/src/data/mwSizes.js` and `sizes.js`: size charts.

## Current state
- Latest commit on the local branch: `f8e6f5f`, "Name the quiz occasion in the look heading."
- Most recent production deploy checked earlier: `20fe12c`, which added the logo and nav behavior. Later commits may not be deployed yet.
- Banner designs (1336×197 and 1336×288 comps) were resized to the live page widths. The current homepage and rental shop use the large hero banner component, not the earlier 1380×173 strip.
- Open questions: which entry points go live next (`pgp-tux`, `pgp-separates`, `lp-fit`, `lp-custom`), and whether the quiz also belongs on the Big & Tall listing.
