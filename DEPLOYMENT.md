# Deployment SOP — Cloudflare Pages

This is the production deployment guide for `hinmanlabucla.org`. Total ongoing cost: **~$15/yr** (domain renewal only; Cloudflare Pages free tier covers hosting, SSL, CDN, build minutes).

## Prerequisites

- GitHub account (free)
- Cloudflare account (free) — sign up at https://dash.cloudflare.com/sign-up
- Access to the current domain registrar where `hinmanlabucla.org` is registered (e.g. GoDaddy, Namecheap, Google Domains, Wix Domains). Look at the WHOIS record or the Wix account billing settings if you don't remember.

## Step 1 — Push to GitHub

```bash
cd "Hinman lab website"
git status                                   # confirm clean working tree
gh repo create hinman-lab-website --public   # or use the GitHub UI
git remote add origin git@github.com:<your-username>/hinman-lab-website.git
git branch -M main
git push -u origin main
```

If you prefer not to publish the source code, use `--private` instead. Cloudflare Pages works with private repos too.

## Step 2 — Create a Cloudflare Pages project

1. Log into the [Cloudflare dashboard](https://dash.cloudflare.com).
2. Navigate to **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize Cloudflare's GitHub app and select `hinman-lab-website`.
4. **Build settings:**
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: leave empty
   - Node version: set environment variable `NODE_VERSION=20` (Node 20 LTS, matches local dev)
5. Click **Save and Deploy**. First build will take ~2 minutes.
6. Cloudflare assigns a `*.pages.dev` URL — open it and verify the site loads.

Every subsequent `git push` to `main` triggers an automatic deploy. Preview deploys are created for pull requests.

## Step 3 — Add the custom domain

In the Pages project, go to **Custom domains → Set up a custom domain**.

Add **both** of these, one at a time:
- `hinmanlabucla.org`
- `www.hinmanlabucla.org`

Cloudflare will then show you what DNS records to set. You have two paths — pick **A**.

### Option A (recommended): Move DNS to Cloudflare

Pros: Cloudflare manages everything, automatic SSL, gives access to free analytics, performance features, and one-click rollback. Domain registrar fees stay the same.

1. In Cloudflare, go to **Add a Site → enter `hinmanlabucla.org`** and pick the Free plan.
2. Cloudflare scans existing DNS records. Review and accept.
3. Cloudflare gives you **two nameservers** that look like `xxx.ns.cloudflare.com`.
4. Log into your current domain registrar, find DNS / nameserver settings, replace whatever is there with Cloudflare's two nameservers. Save.
5. DNS propagation: 5 minutes to 24 hours typically. Check status in Cloudflare; it'll email you when active.
6. Once active, in the Pages project the custom domain status will go from "Verifying" to "Active" automatically.

### Option B: Keep DNS at current registrar

Only do this if you have a strong reason not to use Cloudflare DNS (e.g., shared zone with other services managed elsewhere).

In your current DNS:
- Delete the existing A/AAAA records for `@` and `www` that point to Wix.
- Add:
  - `hinmanlabucla.org` → CNAME → `<your-project>.pages.dev` (flat CNAME; ask registrar if they support CNAME at apex / "ANAME")
  - If apex CNAME is unsupported, use the IPs Cloudflare shows in the Pages custom-domain dialog.
  - `www.hinmanlabucla.org` → CNAME → `<your-project>.pages.dev`

## Step 4 — SSL

Automatic. Cloudflare provisions a free TLS certificate within a few minutes of the domain going active. No action needed.

## Step 5 — Pre-cutover verification checklist

Before pointing DNS away from Wix, confirm on the `*.pages.dev` URL:

- [ ] Home page loads with hero text, three research highlights, latest publications, lab news.
- [ ] `/publications` shows 80+ entries grouped by year, with PMID links that open PubMed.
- [ ] `/team` shows PI first, then postdocs, grad students, etc., with photos.
- [ ] `/research`, `/news`, `/join`, `/contact` all render.
- [ ] 404 page works (visit something like `/asdf`).
- [ ] Mobile view (375px wide) — open Chrome DevTools, set device to iPhone SE. Header collapses to hamburger; content reflows.
- [ ] Tab through every page with the keyboard — focus rings visible, all interactive elements reachable.
- [ ] View page source and confirm `<title>`, `<meta description>`, OG tags are populated.
- [ ] `/sitemap-index.xml` returns XML.
- [ ] `/robots.txt` returns text.

If anything fails, fix it and re-push; cutover later.

## Step 6 — DNS cutover & monitoring

After DNS goes active (Option A) or records are updated (Option B):

- Test from multiple networks: phone on cellular, work laptop on different DNS resolver.
- Confirm `https://hinmanlabucla.org` and `https://www.hinmanlabucla.org` both resolve to the new site with a valid TLS cert.
- Monitor for **at least 48 hours** before canceling the Wix subscription. DNS caches can take that long to fully flush, and you want a window to roll back to Wix if something breaks.
- Set up a free uptime check at [UptimeRobot](https://uptimerobot.com) (also free) to alert on outages.

## Step 7 — Cancel Wix

Once you've confirmed >48 hours of clean Cloudflare serving, log into Wix:
- Cancel the premium subscription (downgrade to free is also fine if you want a fallback for a month).
- If Wix manages the domain registration, transfer it out **first** (use the EPP / authorization code Wix provides). Don't let the domain lapse mid-cancellation.

## Cost summary

| Item | Cost |
| --- | --- |
| Cloudflare Pages (hosting, CDN, SSL, builds) | $0/yr |
| Cloudflare DNS (Option A) | $0/yr |
| Domain renewal (.org typical) | $12–15/yr |
| **Total** | **~$15/yr** |

Compared to a Wix Premium plan ($16–40/month = $192–480/yr), this is a ~90–95% reduction in recurring cost.

## Troubleshooting

- **Build fails on Cloudflare**: check that `NODE_VERSION` is set to `20`. Older versions can't run Astro 5.
- **Custom domain stuck "Verifying"**: nameservers haven't propagated yet. Wait. Use `dig hinmanlabucla.org NS +short` to confirm Cloudflare's nameservers are returned.
- **Site loads but pages 404**: confirm Build output directory is `dist`, not `dist/` or `./dist`.
- **Fonts don't load**: Google Fonts may be blocked in some networks. Self-hosting is an option — drop WOFF2 files in `public/fonts/` and update the `<link>` tag in `src/layouts/BaseLayout.astro`.
