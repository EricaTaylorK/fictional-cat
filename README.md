# fictional-cat

Local UX prototype (Vite + vanilla JS). Run it in your own browser at `localhost`—no public site required.

Remote: [github.com/EricaTaylorK/fictional-cat](https://github.com/EricaTaylorK/fictional-cat)

## One-time: Node.js (includes npm)

If `npm -v` fails in the terminal, install **Node.js LTS** from [https://nodejs.org/](https://nodejs.org/), then open a **new** terminal tab.

## Run in the browser (hot reload)

From this folder:

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Leave the terminal running while you edit.

## Optional: quick preview without npm

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`. This serves static files only (no hot reload).

## Git identity (first time on this Mac)

This repo was committed with a placeholder author so Git would work. Set your real name (repo-only or global):

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Push to GitHub

`origin` is already set to `https://github.com/EricaTaylorK/fictional-cat.git`. From this folder:

```bash
git push -u origin main
```

If Git asks for credentials over HTTPS, use a [personal access token](https://github.com/settings/tokens) as the password (not your GitHub account password), or [switch the remote to SSH](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories).
