# Pal Breeding Ledger — OneDrive edition

A desktop + Android installable app (PWA) that stores your breeding combos and
Palpedia in a private folder inside your own OneDrive, so the same data
follows you across devices. Nothing else in your OneDrive is touched — the
app only ever sees its own dedicated "app folder."

You need to do two one-time setup steps before this works: register the app
in Azure (free, ~5 minutes) and deploy these files to GitHub Pages (free).

---

## Step 1 — Deploy to GitHub Pages

1. Create a new **public** GitHub repository (e.g. `pal-breeding-ledger`).
2. Upload every file in this folder (`index.html`, `manifest.json`, `sw.js`,
   `icon-192.png`, `icon-512.png`) to the root of that repo.
   - Easiest way: on the repo page, click **Add file → Upload files**, drag
     all five files in, and commit.
3. Go to the repo's **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**,
   branch **main**, folder **/ (root)**. Save.
5. Wait a minute or two, then your app will be live at:

   ```
   https://YOUR-GITHUB-USERNAME.github.io/pal-breeding-ledger/
   ```

   Write that exact URL down — you need it for Step 2.

---

## Step 2 — Register the app in Azure

This gives your app permission to talk to Microsoft Graph (OneDrive) on your
behalf. It's free and only you can authorize it — nobody else can use this
registration without your login.

1. Go to **[portal.azure.com](https://portal.azure.com)** and sign in with
   your Microsoft account (the same one tied to your OneDrive).
2. Search for **"App registrations"** in the top search bar and open it.
3. Click **+ New registration**.
4. Fill in:
   - **Name:** `Pal Breeding Ledger` (or anything you like)
   - **Supported account types:** choose **"Accounts in any organizational
     directory and personal Microsoft accounts"**
   - **Redirect URI:** select platform **Single-page application (SPA)**,
     and paste your exact GitHub Pages URL from Step 1, e.g.
     `https://YOUR-GITHUB-USERNAME.github.io/pal-breeding-ledger/`
5. Click **Register**.
6. On the app's Overview page, copy the **Application (client) ID** — a
   string of letters/numbers/dashes. You'll paste this into `index.html`.
7. In the left sidebar, go to **API permissions → + Add a permission →
   Microsoft Graph → Delegated permissions**. Search for and check:
   - `Files.ReadWrite.AppFolder`
   - `User.Read` (usually already added by default)
   Click **Add permissions**.
   (No admin consent needed — these are personal-data permissions you
   grant yourself when you sign in.)

That's it — no client secret needed, since SPAs authenticate with a public
flow (PKCE) instead.

---

## Step 3 — Plug the Client ID into the app

1. Open `index.html` in a text editor.
2. Find this near the top of the `<script>` section:
   ```js
   const CONFIG = {
     clientId: "PASTE_YOUR_AZURE_CLIENT_ID_HERE",
     ...
   ```
3. Replace `PASTE_YOUR_AZURE_CLIENT_ID_HERE` with the Client ID you copied
   in Step 2.
4. Re-upload the edited `index.html` to your GitHub repo (same
   "Add file → Upload files" flow, or just edit it directly in GitHub's web
   editor).

---

## Step 4 — Install it

Visit your GitHub Pages URL in **Chrome**, on both desktop and Android:

- **Desktop Chrome:** look for an install icon (⊕ or a small monitor icon)
  in the address bar → **Install**.
- **Android Chrome:** tap the **⋮** menu → **Add to Home screen** / **Install
  app**.

Open the installed app, tap **Sign in with Microsoft**, and approve access.
The first time, it'll create `pal-breeding-data.json` inside a hidden
`Apps/Pal Breeding Ledger` folder in your OneDrive. From then on, every
device you install this on and sign in with the same Microsoft account will
read and write that same file.

---

## How offline works

- The app shell (the interface itself) is cached, so it opens even with no
  connection.
- Your data is cached locally too, so you can browse your Ledger, Path
  Finder, and Palpedia offline using the last-synced copy.
- While offline, saving is disabled — you'll see an "Offline" banner and a
  toast if you try. Reconnect and it'll sync automatically, or tap **Sync
  now** in the settings (⚙) menu.

## If something breaks

- **"Sign-in failed" / redirect errors:** double check the redirect URI in
  Azure *exactly* matches your GitHub Pages URL, including the trailing
  slash.
- **Stuck on "Connecting…":** open browser dev tools (F12) → Console, and
  check for errors — most commonly a Client ID typo or a permission that
  wasn't added.
- **Data not appearing on second device:** make sure you signed in with the
  *same* Microsoft account on both.
