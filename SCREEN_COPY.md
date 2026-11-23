# Suit Finder v2: screen copy

All copy is taken from the source in `suit-quiz/src` (Nov 23, 2026). Text in `{braces}` is filled in at runtime. Lines marked **template** are built from answers or data, so the exact text varies.

---

## 1. Entry banners (homepage, rental, suits listing, nav)

Source: `components/entries/SuitFinderEntries.jsx`. All variants share this copy.

| Element | Copy |
|---|---|
| Badge | AI Style Expert |
| Mark | M\|W |
| Headline | Meet your personal style expert |
| Lede | In **under a minute** we'll find the perfect suit for your event, for you. |
| CTA | Find the suit |

---

## 2. Intro screen (quiz modal)

Source: `components/IntroModal.jsx`.

| Element | Copy |
|---|---|
| Header title | AI Style Expert |
| Back button | Back |
| Close button (aria) | Close |
| Title | Tell us the occasion. We'll find the suit. |
| Body | Answer a few quick questions. You'll get matches right away, with the reasons behind each. |
| Start button | Start the quiz |

---

## 3. Questions

Source: `data/quizConfig.js`, `App.jsx`. Each question shows a step eyebrow ("Step N of M"), a **Required** tag when it can't be skipped, the title, the help line, then the answer cards. The bottom bar has a skip button (when skippable) and **Next**, which becomes **See recommendations** on the last step.

Shared buttons: **Next**, **See recommendations**, **Back**.

### 3.1 Buying or renting
- **Title:** Are you buying or renting?
- **Help:** Not sure? Think about how many times you'll wear it.
- **Buy a suit:** Yours to keep and wear again.
- **Rent a suit or tux:** A suit or tux for one event.

### 3.2 Occasion
- **Title:** What's the occasion?
- **Help (buy):** Pick one. The event tells us how formal the suit should be.
- **Help (rent):** Pick one. The event helps us decide between a suit and a tux.
- **Buy options**
  - Work: Office days, big meetings, and interviews.
  - Wedding: Getting married, or going as a guest.
  - Funeral: A funeral or memorial service.
  - Prom: For you, or a prom-goer you're shopping for.
  - A bit of everything: One suit for work, weddings, and whatever comes up.
- **Rent options**
  - Wedding: Getting married, or going as a guest.
  - Black tie: Galas, formal dinners, and any invite that says black tie.
  - Prom: For you, or a prom-goer you're shopping for.
  - Special event: A quinceañera, anniversary, or other celebration.

### 3.3 Event date (rental)
- **Title:** When is the event?
- **Help:** Your look is ready 3 days before the event and due back the day after.
- **Skip:** Not sure of the date yet?
- **Field label:** Event date (hint: MM/DD/YYYY)
- **Timeline (template):** Ready {date} / Event {date} / Due back {date}
  - Ready: Pick it up in store or have it delivered.
  - Due back: Return it in store or by mail.
- **Empty state:** Pick a date to see your timing.
- **Past date:** That date has passed. Pick an upcoming date.
- **Too soon:** The earliest event date we can cover is {date}. You can still continue, but call or visit a store to make sure your look is ready in time.

### 3.4 Package (rental)
- **Title:** What should the look include?
- **Help:** Pick one. The more pieces, the less you have to bring.
- **Options**
  - Jacket and pants (2-piece): Just the jacket and pants. Bring your own shirt, tie, and shoes.
  - Full look (6-piece): Jacket, pants, dress shirt, tie or bow tie, vest, and shoes.
  - Full look and finishing touches (9-piece): Everything in the 6-piece, plus a pocket square, cufflinks and studs, and suspenders.

### 3.5 Fit
- **Title:** How do you like a suit to fit?
- **Help:** Pick the one that sounds most like you. The fit name is in parentheses.
- **Options**
  - As close as it gets (Skinny fit): The sharpest, most tapered cut, with the least room through the body and legs.
  - Close and sharp (Slim fit): A trim shape that follows your frame, tapered through the sleeves and legs.
  - Polished, with room to move (Modern fit): A balanced cut with a little tapering and room through the body.
  - Comfortable with room (Classic fit): Room through the chest, seat, and legs, without looking loose.
  - Most room for comfort (Executive fit): The roomiest cut, with extra room through the midsection and legs.
- **Skip:** Skip (default label for skippable questions with no custom label)

### 3.6 Colors
- **Title:** Any colors in mind?
- **Help:** Pick all you like and we'll show those first. Open to anything? Skip this one.
- **Options**
  - Classics: Navy, gray, and black.
  - Earth tones: Brown, tan, and sage.
  - Rich and bold: Burgundy and royal blue.
  - Light and soft: White, cream, or pink.
- **Panel label:** Colors you'd wear

### 3.7 Height and weight
- **Title:** What are your height and weight?
- **Help:** We ask so we can pick the right jacket and pant length and give you a better size estimate. A close guess is fine.
- **Units:** Imperial, Metric
- **Labels:** Height, Weight, Feet, Inches, Centimeters, Pounds, Kilograms
- **Range errors (template):** Feet should be {x} to {y} and inches 0 to 11. / Height should be {x} to {y} cm. / Weight should be {x} to {y} lb (or kg).

### 3.8 Suit size
- **Title:** Do you know your suit size?
- **Help:** Jacket size, pant size, or both. Even one helps.
- **Options**
  - I know my size: Share your jacket size, pant size, or both.
  - Help me estimate: We'll work it out from your usual shirt and jeans sizes.

#### 3.8a Known sizes
- **Title:** What sizes do you know?
- **Help:** Pick your jacket size, pant size, or both. Not sure? It's on the tag inside a suit jacket or pants you own. Just use the number.
- **Field labels:** Jacket Size, Pant Size. Each has a **Not sure** toggle.

#### 3.8b Usual sizes (estimate)
- **Title:** What sizes do you usually buy?
- **Help (default):** We'll use these to estimate your jacket and pant size.
- **Help (jacket only):** We'll use this to estimate your jacket size.
- **Help (pant only):** We'll use this to estimate your pant size.
- **Group labels:** T-shirt or casual shirt size; Jeans or pants waist size

### 3.9 Jacket fit issues
- **Title:** Where do jackets feel off?
- **Help:** Pick any that apply. We'll use your answers to suggest a size and any tailoring.
- **Skip:** Jackets usually feel fine
- **Options (label / detail)**
  - Jackets pull across my shoulders or back / Tight when I reach forward or cross my arms
  - Jackets pull at the button / I need more room through the middle
  - Sleeves and jackets usually run long / Sleeves cover my shirt cuff, or the jacket hangs low
  - Sleeves and jackets usually run short / My wrists show, or the jacket stops too high

### 3.10 Pants fit issues
- **Title:** Where do pants feel off?
- **Help:** Pick any that apply. We'll use your answers to suggest a size and any tailoring.
- **Skip:** Pants usually feel fine
- **Options (label / detail)**
  - Pants gap at the waist / My jacket fits my chest, but my waist is trimmer
  - Pants are tight through the hips or thighs / Snug when I sit, take stairs, or crouch
  - Pants pinch at the waist / The waistband feels tight, even when the jacket is fine
  - Pants usually run long / The hem covers my shoes or stacks on the floor
  - Pants usually run short / The hem stops above my shoes

### 3.11 Tailoring (buy only)
- **Title:** Want your suit tailored?
- **Help:** Most suits look sharpest with a few small adjustments. We'll suggest what yours needs, based on your answers.
- **Note:** You'll see the price before checkout, and you can remove tailoring anytime.
- **Options:** Yes, suggest tailoring / No, just the suit

### 3.12 Budget (buy only)
- **Title:** What do you want to spend?
- **Help:** We ask so we can show suits in this range first.
- **Options:** Under $250 · $250–$400 · $400–$600 · $600+ · Flexible for the right fit

---

## 4. Matching (loading) screen

Source: `App.jsx` (`MatchingScreen`), `lib/matchingSteps.js`.

- **Heading (buy):** Finding your best fit
- **Heading (rent):** Finding your look
- **Subtext (buy):** Matching suits to your answers. This only takes a moment.
- **Subtext (rent):** Matching rental looks to your answers. This only takes a moment.

Steps appear only when the answers use them. Each step shows an in-progress line, then a done line.

| Step | In progress | Done |
|---|---|---|
| Occasion | Matching your occasion… | Matched your occasion |
| Fit (buy) | Comparing cuts to your fit… | Compared cuts to your fit |
| Suit (rent) | Choosing a suit or tux for your event… | Chose a suit or tux for your event |
| Package (rent, if picked) | Checking the package you picked… | Checked the package you picked |
| Color (if picked) | Matching your colors… | Matched your colors |
| Sizes (estimate) | Estimating your sizes from your answers… | Estimated your sizes from your answers |
| Sizes (known, entered) | Checking your sizes… | Checked your sizes |
| Sizes (known, none entered) | Choosing a starting size… | Chose a starting size |
| Sizes (fallback) | Working out your sizes… | Worked out your sizes |

---

## 5. Results screen

Source: `components/Results.jsx`.

### 5.1 Hero
- **Brand line:** AI Style Expert (monogram M|W)
- **Actions:** Share results · Restart quiz
- **Headline and subhead (template)**
  - 2+ matches: **{n} suits made for your fit.** / "Both are {fit} in {size} and right for {occasion}. Compare them below." (or "All are …" for 3+)
  - 1 best match, occasion is warm (wedding, prom, formal, special, milestone, interview): **Your best match is here.**
  - 1 best match, other occasions: **The right fit for the right day.**
  - 1 best match subhead: "Your best match is {fit} in {size}, right for {occasion}, and inside your budget." plus "{n} more good options are below."
  - Good matches only: **These come closest to your fit.** / "No suit matches every answer, so we show how each lines up and where tailoring can close the gap."
  - Partial only: **Let's get you closer.** / "We didn't find a full match for {miss}. Edit your answers or see how tailoring helps."
- **Account box**
  - Want the Best Fit—Every Time?
  - Suits that don't need tailoring
  - Shirts with the right sleeve and neck sizes
  - Pants that actually fit your waist and leg
  - Outerwear made for your proportions
  - Create an Account · Sign In
  - Prototype note: "Prototype: this would sign you in and keep this fit profile for later recommendations."

### 5.2 Your Fit Profile card
- **Title:** Your Fit Profile
- **Actions:** Edit answers · View full profile / Hide full profile · Show more / Show less
- **Group labels:** Personal Info · Fit Preference · Length · Jacket · Shirt · Fit Type Matches by Category · Fit notes · Occasion · Colors · Colors to avoid · Budget · Tailoring · Event date · Package
- **Fit names:** Skinny Fit · Slim Fit · Modern Fit · Classic Fit · Executive Fit
- **Fit notes (template, from fit issues):** room through the shoulders · broad chest, trimmer waist · room through the middle · room through the hips and thighs · a let-out at the pants waist · pants hemmed to your shoe · a longer inseam, hemmed to your shoe · shorter sleeves and jacket · longer sleeves and jacket
- **Fit issue labels:** Jackets pull across the shoulders or back · Jackets pull at the button · Sleeves and jackets usually run long · Sleeves and jackets usually run short · Pants gap at the waist · Pants are tight through the hips or thighs · Pants pinch at the waist · Pants usually run long · Pants usually run short

### 5.3 Alerts
- **Color miss (template):** None of the colors you picked are in this assortment. Closest options: / No white, cream, or pink suits right now. Closest options:
- **Budget miss (template):** Nothing {phrase} matched. Closest options: / Only {n} suits {phrase} matched. Closest options:

### 5.4 Match list
- **Title:** Your matches are in
- **Card badge:** Best Match · Good Match · Partial Match
- **Card label:** Why it's a match
- **Clearance tag:** Clearance (when on sale)
- **Button:** View More Details
- **Choose buttons:** Choose this suit · Change suit · Selected
- **Recommended tag (tailoring):** Recommended
- **Match checks (template, pass / miss)**
  - Color: "{color}, your color" / "A color you avoid" / "Not your colors"
  - Fit: "{Slimmer or Roomier} than {wanted}" / "Slim cut · {note}" / pass line
  - Size: "Jacket size missing" / "Length missing" / "Waist missing" / "{jacket} {length} · {waist} waist"
  - Price: "Flexible budget" / "Over {range}" / "Under {range}" / "In your {range}"
  - Occasion: "For {occasion}" / "Not for {occasion}"
  - Labels read as "Matches: …" or "Differs: …" for screen readers.
- **Trade-offs (template):** "Not the usual choice for {occasion}." and similar
- **More matches:** View more products · View less · See all quiz matches (link mode)

### 5.5 Add tailoring (buy)
- **Heading:** Add Tailoring · Optional Add Ons
- **Tiers**
  - No tailoring: The suit as it is. You can add tailoring later.
  - Fit Essentials: We'll hem the pants and adjust sleeve length for a clean, finished look.
  - Signature Fit (Recommended): Everything in Essentials, plus we shape the jacket and waist so you look sharper.
  - Custom-Level Fit: Our most complete tailoring—refined lines, cleaner drape, and a truly made-for-you silhouette (without the custom price).
- **Rental note:** Rentals aren't tailored. Instead, a free fitting confirms your jacket, pants, shirt, and shoe sizes, so everything fits when you pick it up.

### 5.6 Complete the look (buy)
- **Title:** Complete the look
- **Label:** Optional add-ons
- **Look heading (template):** Your {occasion phrase} look, pulled together. Phrases: work · wedding · funeral · prom · all-purpose · black-tie · special-event (or "Your look, pulled together")
- **Lede (template):** Styled to finish this {color} suit: a {piece}, {piece}, and {piece}. Chosen for the {suit name}.

### 5.7 Quick view (item picker)
- **Labels:** Size · Inseam · Finish · Quantity
- **Badges:** Popular · Going Fast · Promotion · Online Exclusive · Sale
- **Stock:** Out of Stock
- **Clearance tooltip:** Clearance disclaimer / Clearance items are final sale.
- **Buttons:** Add Product to Look · Update Product · View full product details
- **Validation:** Select your size · Please select inseam · Please select Finish

### 5.8 Bottom bar (buy)
- **Total:** Est. Total
- **CTA:** Add look to bag · Adding... · Try again
- **Status:** This look was added to your bag. / We couldn't add this look. Try again
- **Nudge (template):** Add a dress shirt + tie to save $100 · Add a dress shirt to save $100 · Add a tie to save $100 · You're saving $100 with Suit Bundle Offer

### 5.9 Bottom bar (rent)
- **Total:** Est. Total
- **CTA:** Reserve this look
- **Note:** Prototype: this would reserve the look and its pieces for your event date.

### 5.10 How to rent (rent only)
- **Title:** How to rent
- **Steps**
  - Reserve your look: Check out today to hold this look for {event}. / Check out to hold this look for your event.
  - Get fitted: Book a free fitting. We measure you and confirm every size.
  - Pickup or delivered to you: Ready {date} for pickup in store, or delivered to your door. / Ready 3–4 days before your event, in store or delivered.
  - Easy return: Return it {date}, in store or by mail. / Return it the day after your event, in store or by mail.
- **Short-notice warning:** Your event is less than 4 days away. Call or visit a store to make sure this look is ready in time.
- **Fitting section**
  - Title: Book your fitting
  - Body: Rentals aren't tailored. Instead, a free fitting confirms your jacket, pants, shirt, and shoe sizes, so everything fits when you pick it up.
  - Button: Book a fitting appointment
  - Prototype note: Prototype: this would open nearby stores and fitting times.

---

## 6. Product detail screen

Source: `components/ProductDetail.jsx`, `components/MatchBadge.jsx`.

- **Back link:** Back to results
- **Not found:** Product details / This recommendation is not in the current results.
- **Rating:** {n.n} ({count})
- **Rental type labels:** Tuxedo · Dinner jacket tuxedo · Tailcoat tuxedo · Suit
- **Match:** Why this match (toggle), then the match checks (see 5.4)

---

## 7. Quiz matches screen

Reached from the results page (See all quiz matches).

- **Page title:** Quiz matches
- **Breadcrumb:** Quiz matches
- **Back:** Returns to results (no label is set in the code for this link)

The storefront listing that shows when not in the quiz uses **All Suits** and crumb **Suits**.

---

## 8. Not covered

- Homepage, navigation, footer, cart, and account page copy (storefront, not quiz screens).
- Product and look data (names, notes, pair notes, prices, and `occasionNote` text) in `data/products.js`, `data/rentals.js`, and `lib/recommendation.js`.
- Trade-off and budget phrasing templates beyond the examples above.
- Error and fallback messages in `ProductGridEntry.jsx` and `AccountPage.jsx`.
