# my-prototypes

Local UX prototype (Vite + vanilla JS). Nothing is published; you run it in your own browser.

## One-time: Node.js (includes npm)

If `npm -v` fails in the terminal, install **Node.js LTS** from [https://nodejs.org/](https://nodejs.org/), then open a **new** terminal tab.

## Run in the browser (hot reload)

```bash
cd my-prototypes
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Leave the terminal running while you edit.

## Optional: quick preview without npm

From this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`. This serves static files only (no hot reload).

## Put it on GitHub (private is fine)

1. Create a **new empty** repo on GitHub (no README), e.g. `my-prototypes`.
2. In this folder:

```bash
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git branch -M main
git push -u origin main
```

Use a [personal access token](https://github.com/settings/tokens) as the password if Git asks over HTTPS, or set up SSH keys.
