# Suit Finder v2: quiz logic

How answers become a question flow, a set of ranked matches, and a look. Based on the source in `suit-quiz/src` (Nov 23, 2026). File references are for the code that does each job.

Key files:
- `App.jsx`: state, navigation, persistence, progress
- `data/quizConfig.js`: questions, options, and `getQuestionFlow`
- `lib/recommendation.js`: scoring, tiers, sizes, tailoring, rentals
- `lib/matchingSteps.js`: loading-screen steps
- `components/Results.jsx`: results headline, list, look totals

---

## 1. Overview

```
Intro → Question flow (buy or rent branch) → Matching (loading) → Results
                                                  ↓
                                       Product detail / Look / Bag
```

- **Buy** and **rent** share the intro and the first questions, then split.
- Matches are computed from the answers each time the results render. Nothing is precomputed.
- Answers are saved to `localStorage` under `suit-quiz-wireframe-progress`.

---

## 2. State and navigation (`App.jsx`)

**State shape:** `{ screen, currentId, answers, place }`

**Screens:** `home`, `start`, `intro`, `question`, `matching`, `results`, `matches`, `product`, `look`.

| Action | Logic |
|---|---|
| Start the quiz | Sets `screen = question`, `currentId = mode`, and clears answers. |
| Choosing buy or rent | If `mode` changes, answers reset to `{ mode }`. Switching branches discards everything else. |
| Next | Moves to the next question in `getQuestionFlow(answers)`. On the last question it switches to `matching`. |
| Back | Moves to the previous question in the flow. On the first, it leaves the quiz. |
| Restart quiz | Clears saved progress and returns to `mode`. |
| Edit answers (from results) | Jumps to a chosen question, if it is still in the flow. Otherwise it goes to `mode`. |
| Close or Escape during a question or the loading screen | Saves progress and leaves the quiz. Closing the intro returns to the storefront without adding any answers. |
| Loading finishes | Moves to `results`. |
| Deep link `?product=&color=` | Opens the product detail screen for that item. |

**Persistence and migration (`loadProgress`):**
- Saved progress loads on page load. A few older answer fields are dropped (`rentalBudget`).
- A saved state on the `rentalBudget` step is sent straight to matching.
- Malformed or missing storage falls back to a fresh start at `mode`.

---

## 3. Question flow (`getQuestionFlow` in `quizConfig.js`)

| Branch | Flow |
|---|---|
| **Buy** | mode → occasion → feel → colors → height → measurementKnowledge → *(branch below)* → tailoring → budget |
| **Rent** | mode → occasion → eventDate → pieces → feel → colors → height → measurementKnowledge → *(branch below)* |

**Size branch (after `measurementKnowledge`):**

| Answer | Next questions |
|---|---|
| `some` ("I know my size") | measurements → *everydaySizes, only if the shopper marked a size as Not sure* → fitIssues → pantsFit |
| `no` ("Help me estimate") | everydaySizes → fitIssues → pantsFit |

`yes` is handled the same as `some` in code. It is an older value that no screen offers.

**Progress and step count:**
- Step N of M uses `flow.indexOf(currentId) + 1`.
- Before `measurementKnowledge` is answered, M is counted as if the shopper chose `no`.

**Skip behavior:**

| Question | Skip button | What gets saved |
|---|---|---|
| Multi-select (fit issues, pants fit) | "Jackets/Pants usually feel fine" | `["none"]`, which means no issues |
| Height | Skip | Height and weight are cleared |
| Others marked skippable | Skip (or a custom label) | Nothing. The answer stays unset, and the rule for that answer is left out. |

**When "Next" is enabled (`isAnswered`):**

| Question type | Enabled when |
|---|---|
| Single choice, buy or rent | An option is picked. |
| Occasion | An occasion is picked. |
| Event date | A date is entered, and it is not in the past. |
| Colors, measurements, sizes, height | Always. Choosing nothing is allowed. |
| Multi-select | At least one card is picked, including "usually feel fine". |

---

## 4. Derived inputs (answers → signals)

- **Occasion (`resolvedOccasion`):** buy answers are mapped to match the formality tags. `business` → `work`; `prom` → `milestone`; `mixed` → `versatile`. Rental answers pass through as-is.
- **Fit (`scoringFeel`):** `skinny` counts as `close`, and `executive` counts as `roomy`, because the catalog has no skinny or executive cuts.
- **Colors (`colorsIn`):** each color card expands to its catalog colors. For example, *Classics* → navy, gray, black. Older per-color values are still accepted.
- **Fit signals (`getFitSignals`):** the union of fit issues from both screens (jacket and pants), plus two measurement-based signals:
  - `athleticBuild` if chest minus waist ≥ 8 inches.
  - `fullerMidsection` if chest minus waist ≤ 4 inches.
- **Length (`inferLength`):**
  - First, the jacket size's length letter (S/R/L) if given.
  - Otherwise, from height: under 67 in → S; over 72 in → L; otherwise R.
  - Then shifted one step: `runsLong` moves it toward S; `runsShort` moves it toward L.
- **Size estimate (`getSizeEstimate`):**
  - Chest comes from the jacket size, then the chest measurement, then the largest usual shirt size (XS = 36 … 5XL = 60).
  - Waist comes from the waist measurement, then the largest usual waist size.
  - Jacket is rounded to an even number. Pants are the waist, or jacket minus the build drop.
  - Build drop is 8 for `athleticBuild`, 4 for `fullerMidsection` or `waistPinch`, and 6 otherwise.
  - Estimates start from the largest size picked, so a size that fluctuates gets room a tailor can take in.

---

## 5. Buy scoring (`scoreProduct`)

Each product gets a raw score. Higher is better.

| Rule | Points |
|---|---|
| Occasion is in the product's formality list | +32 (otherwise −18) |
| Fit matches the chosen fit (after `scoringFeel`) | +26 (adjacent: +9, when either side is `balanced`) |
| Fit signals (see below) | varies |
| In budget | +18 (out of budget: −1 per $20 away from the band, rounded up, capped at −18) |
| Roomy fit: comfort score × 2 | varies |
| Not "skip tailoring": tailoring ease × 2 | varies |
| Color matches a color picked | +20 |
| Every color of the product is in the avoid list | −20 (unused, see section 11) |

**Fit signals:**

| Signal | Effect |
|---|---|
| Broad shoulders | roomy +8, balanced +4, close −8; stretch fabric +6 |
| Athletic build | close +12, balanced +6, roomy −10; stretch +4 |
| Fuller midsection | roomy +28, close −20 |
| Seat and thighs | roomy +20; stretch +10; close without stretch −14 |

**Ordering (`getRecommendations`):**
- If a color is picked, products are sorted by color rank, then score. Color rank is 0 for a match, 1–3 for the "closest" colors (for light and soft, that means tan or green), and 9 otherwise.
- Otherwise, in-budget products come first, sorted by score, then out-of-budget products.
- Ties keep the original catalog order.

**Results list:** the first 3 are shown. "View more products" reveals up to 9. A product the shopper has chosen or opened stays on screen even if it is outside those slices.

**Budget warning:** if fewer than 3 products are in budget, the results show a note such as "Only 2 suits in the $250–$400 range matched. Closest options:".

---

## 6. Match tier (`matchBadge`)

Two groups of checks:

- **Must-pass (buy only):** size and fit.
  - Size passes only if jacket size, length, and waist are all known from the estimate or the usual sizes. The missing one is named in the line (for example, "Length missing").
  - Fit passes only if the product's cut is the chosen cut. A wrong cut gives "Slimmer than …" or "Roomier than …". If the cut matches but the shopper has a tight spot and the product is a slim cut with no stretch, it fails with "Slim cut · …".
  - If fit was skipped, the fit check is not run.
- **Nice-to-have:** color, price, and occasion. Each one is left out if the shopper didn't answer it.

**Tiers:**

| Tier | Rule | Label |
|---|---|---|
| Partial | Any must-pass check fails | Partial Match |
| Best | Must-pass all pass, and at least 2 nice-to-have checks pass | Best Match |
| Good | Must-pass all pass, and fewer than 2 nice-to-have checks pass | Good Match |

Order: best → good → partial. Ties keep catalog order.

**Price check:** "Flexible budget" always passes. A set band passes when the price falls inside it, and fails with "Over …" or "Under …" otherwise.

**Consequence:** if the shopper skips colors and budget, only occasion remains as a nice-to-have, so a product can reach at most Good Match. This is what the code does, and it may not be what was intended.

---

## 7. Budget

| Answer | Band (dollars) |
|---|---|
| Under $250 | 0–249 |
| $250–$400 | 250–400 |
| $400–$600 | 401–600 |
| $600+ | 601 and up |
| Flexible | No limit |

Small gap: the $400–$600 band starts at 401, so a suit at $400.50 is in no band. Prices in the data are whole dollars, so this has no effect today.

Out-of-budget suits get a trade-off note ("Over your budget by $X" or "Below your budget").

---

## 8. Fit, tailoring, and the suggestion (`recommendTailoring`)

The suggestion is the first rule that matches, in this order:

| Order | Signal | Suggested tier | Reason shown |
|---|---|---|---|
| 1 | Athletic build | Signature Fit | Shapes the jacket waist and sets the pants waist. |
| 2 | Fuller midsection | Signature Fit | Adjusts the jacket button point. |
| 3 | Waist pinch | Signature Fit | Lets out the pants waist. |
| 4 | Runs long (jacket or sleeves) | Fit Essentials | Sets sleeves and hems the pants. |
| 5 | Runs short | Fit Essentials | Starts longer and finishes the sleeves and hem. |
| 6 | Pants run long | Fit Essentials | Hems the pants to the shoe. |
| 7 | Pants run short | Fit Essentials | Starts with a longer inseam. |
| 8 | None of the above | Fit Essentials | Every suit needs a hem and a sleeve check. |

- "No, just the suit" gives no suggestion at all.
- The suggestion is shown on the results as the "Recommended" tag, but the tier is not preselected for "Yes, suggest tailoring" (see section 11).

---

## 9. Sizes and confidence

- `isLowConfidence` sets the "needs measurement help" flag.
  - For `some`: true if no jacket, chest, or waist number was entered.
  - For `no`: true if height is under 67 or over 75 inches, or if there are 2 or more fit issues, or the height answer is `short` or `extra-tall`.

---

## 10. Rentals

**Dates (`rentalDates`):**
- Ready = event date − 3 days.
- Due back = event date + 1 day.
- Too soon = fewer than 4 days from today.
- Past = the date is before today.

**Packages:**

| Package | Pieces | Pieces total |
|---|---|---|
| 2-piece | Jacket and pants | $0 extra |
| 6-piece | + dress shirt ($20), tie or bow tie ($10), vest ($30), shoes ($30) | $90 |
| 9-piece | + pocket square ($10), cufflinks and studs ($8), suspenders ($2.50) | $110.50 |

**Look total:** look price + package pieces.

**Scoring (`scoreRental`):**

| Rule | Points |
|---|---|
| Occasion in the look's formality list | +32 (otherwise −18) |
| Look type fits the occasion | from `RENTAL_TYPE_SCORES` (e.g., black tie: tux +16, dinner +12, tailcoat +14, suit −12) |
| In the rental budget | +18 (out of budget: penalty up to −18) |
| Color picked | +20 (avoid: −20, unused) |
| Rating ≥ 20 reviews | (rating − 4) × 10, floored at 0 |

**Matching badge for rentals:**
- No must-pass checks, so rentals are never Partial.
- Nice-to-have: color and occasion. Price is not checked (see section 11).
- Best if both pass. Good otherwise.

**Trade-offs:** a suit in a black-tie search gets "A suit, not a tuxedo. Some black-tie invitations expect a tux." Low-review looks are flagged.

---

## 11. Known gaps and unused paths

These come from reading the code. Each one changes what the shopper sees.

1. **Avoid colors are never set.** `ColorQuestion` always writes `avoid: []`, so the "avoid" rules never fire.
2. **Rental budget is never asked.** The rental flow ends after the size questions. `rentalBudget` is deleted on load, so rental price checks and the rental budget band never apply.
3. **Preselected tailoring never happens.** The results preselect "No tailoring" unless `tailoring === "bundle"`. No screen sets `bundle`, so "Yes, suggest tailoring" shows the Recommended tag but does not add tailoring to the look.
4. **Bundle pricing is never used.** `bundlePrice` and `TAILORING_ESTIMATE` depend on `bundle`, so they are dead.
5. **`matchPercent` is only shown on the account page.** The quiz results don't display it.
6. **Legacy values.** `yes` on the size question, and `short` or `extra-tall` in height logic, are older values that no current screen offers. They are harmless but unused.
7. **Skipped questions weaken the match.** Skipping colors, budget, or height removes that check, so the tier and sort rely on fewer signals. This is intentional but may not be what the copy promises.
8. **Price gap at $400.50** (see section 7).

---

## 12. Totals and bag (`lookTotals`, `YourLook`)

- Total = suit + tailoring (if chosen) + added pieces, less any promo.
- **Promo:** $100 off when the look has a dress shirt and a tie. The nudge text changes to match what's missing.
- **Add to bag:** needs jacket and pants sizes. Without them, the button is marked disabled and focuses the size fields.
- The add-to-bag step is simulated. It waits 650 ms and succeeds, unless the page is loaded with `?bag=fail`, which forces the error path.
