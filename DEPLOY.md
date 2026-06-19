# Deploying the Hinman Lab site (free hosting + your domain)

This guide gets the site online for **$0/year in hosting**, auto-deploying every
time you edit content on GitHub. Your only cost is the domain you already own.

There are two equally-good free options. **Cloudflare Pages** is recommended
(fastest, free SSL, generous limits). **GitHub Pages** is the simplest if you'd
rather not create another account. Pick one.

---

## Step 1 — Put the code on GitHub (both options need this)

1. Create a free account at <https://github.com> if you don't have one.
2. Create a new **private or public** repository, e.g. `hinman-lab-site`.
3. From this `site/` folder, push the code:

```bash
git init
git add -A
git commit -m "Initial Hinman Lab website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/hinman-lab-site.git
git push -u origin main
```

---

## Option A — Cloudflare Pages (recommended)

1. Sign up free at <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick your `hinman-lab-site` repo. Cloudflare auto-detects Astro. Confirm:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Click **Save and Deploy**. In ~1 minute you'll get a live `*.pages.dev` URL.
4. **Custom domain:** in the Pages project → **Custom domains** → **Set up a domain** →
   enter `www.hinmanlabucla.org` (and also add `hinmanlabucla.org`).
   - The easiest path is to move your domain's DNS to Cloudflare (free) when prompted —
     Cloudflare then configures SSL and the records automatically.
   - If you keep DNS at your current registrar, Cloudflare shows you the exact
     `CNAME` record to add. Add it there.
5. Done. Every `git push` (including edits made in GitHub's web editor) auto-rebuilds and deploys.

---

## Option B — GitHub Pages (no second account)

1. Add the official Astro GitHub Action. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

2. In the repo: **Settings → Pages → Source → GitHub Actions**.
3. **Custom domain:** Settings → Pages → enter `www.hinmanlabucla.org`. GitHub
   shows the DNS records to add at your registrar:
   - a `CNAME` record for `www` → `YOUR-USERNAME.github.io`
   - (optional) four `A` records for the apex `hinmanlabucla.org` → GitHub's IPs.
4. Check **Enforce HTTPS** once the certificate is issued.

> Note: `astro.config.mjs` already sets `site: 'https://www.hinmanlabucla.org'`, which is correct for a custom domain on either host.

---

## Step 2 — Point your domain & retire Wix

1. Add the DNS record(s) from whichever option you chose, at your **domain registrar**
   (where you bought `hinmanlabucla.org`).
2. Wait for DNS to propagate (minutes to a few hours) and confirm the site loads at
   `https://www.hinmanlabucla.org`.
3. Once you're happy, **cancel the Wix plan**. Keep the domain registration active —
   that renewal (~$12–20/yr) is your only ongoing cost.

---

## Cost summary

| Item | Cost |
|---|---|
| Hosting (Cloudflare Pages or GitHub Pages) | **$0** |
| SSL certificate | **$0** (automatic) |
| Domain renewal (you already own it) | ~$12–20/yr |
| **Total** | **~$12–20/yr** |
