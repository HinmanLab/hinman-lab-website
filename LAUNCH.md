# Launch walkthrough — from "files on my Mac" to "live at hinmanlabucla.org"

Total active time: ~45 min, spread across a few days (you wait for DNS to propagate).

This guide assumes zero developer experience. Every command is meant to be copy-pasted verbatim into Terminal.app on your Mac.

---

## Before you start (5 min)

Three things you need to know:

1. **Where is `hinmanlabucla.org` registered?** This is the company that bills you for the domain itself (separate from Wix's website-builder fee). Common ones: Wix Domains, GoDaddy, Namecheap, Google Domains/Squarespace, Network Solutions. Log into the account you think it's under and confirm.

   - If you can't find it: at https://lookup.icann.org type `hinmanlabucla.org` → the "Registrar" line tells you who manages it.

2. **GitHub account.** Sign up free at https://github.com/signup if you don't already have one. Pick a username you're OK being public (e.g. `jdhinman` or `hinmanlab`).

3. **Cloudflare account.** Sign up free at https://dash.cloudflare.com/sign-up. Use the same email you'd use for any other lab service.

You don't need to do anything else in either account yet — just have the logins handy.

---

## Phase 1 — Tools on your Mac (one time, ~10 min)

Open **Terminal.app** (Cmd-Space, type "Terminal", Enter).

### 1.1 Install Homebrew (if you don't have it)

Paste this and press Enter. It'll ask for your Mac password partway through.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

When it finishes, it'll print 2–3 lines starting with `eval "$(...)"`. Copy and paste **those** lines into Terminal too — they make `brew` available.

### 1.2 Install Node.js and the GitHub CLI

```bash
brew install node@20 gh
```

Verify both worked:

```bash
node --version    # should print v20.x.x or higher
gh --version      # should print gh version 2.x.x
```

### 1.3 Sign in to GitHub from Terminal

```bash
gh auth login
```

Answer the prompts:
- "Where do you use GitHub?" → **GitHub.com**
- "What is your preferred protocol?" → **HTTPS**
- "Authenticate Git with your GitHub credentials?" → **Y**
- "How would you like to authenticate?" → **Login with a web browser**

It'll show you a one-time code, then open your browser. Paste the code, click Authorize. Come back to Terminal — it'll say "Logged in as ...".

---

## Phase 2 — Push the site to GitHub (~5 min)

### 2.1 Go to the project folder

```bash
cd "$HOME/Documents/Claude/Projects/Hinman lab website"
```

### 2.2 Finalize the initial commit

I already did one commit; there's a small leftover file (`package-lock.json`) to commit too:

```bash
git status
git commit -m "Add package-lock.json"
```

If `git status` shows "nothing to commit" — skip the second line, you're already clean.

### 2.3 Create the GitHub repo and push

```bash
gh repo create hinman-lab-website --private --source=. --remote=origin --push
```

What this does:
- Creates a new **private** repo called `hinman-lab-website` on your GitHub account
- Wires it up as the "origin" remote
- Pushes your code

If you'd rather make the source code public (totally fine for a lab site), change `--private` to `--public`.

When it finishes, it'll print a URL like `https://github.com/<yourname>/hinman-lab-website`. Open it in a browser to confirm you see the files.

---

## Phase 3 — Deploy to Cloudflare Pages (~10 min)

### 3.1 Connect Cloudflare to GitHub

1. Log into https://dash.cloudflare.com
2. Left sidebar → **Workers & Pages**
3. Click **Create application** → tab **Pages** → **Connect to Git**
4. Click **Connect GitHub**. A GitHub authorization popup appears.
5. In the popup: "Only select repositories" → pick `hinman-lab-website` → **Install & Authorize**
6. Back on Cloudflare, your repo now appears in the list. Click it → **Begin setup**

### 3.2 Configure the build

Fill in the form exactly:

| Field | Value |
| --- | --- |
| Project name | `hinman-lab` (or whatever; this becomes the temp URL) |
| Production branch | `main` |
| Framework preset | **Astro** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave empty)* |

Click **Environment variables** → **Add variable**:
- Variable name: `NODE_VERSION`
- Value: `20`

Click **Save and Deploy**. Wait 1–2 minutes for the build to finish.

### 3.3 Confirm it works

Cloudflare gives you a URL like `https://hinman-lab.pages.dev`. Open it. You should see the new lab site with:
- "The Hinman Lab" in the header
- The hero text and research highlights
- Working links to /publications, /team, /research, /news, /join, /contact

**If anything looks broken, stop and tell me what you see before continuing.** This is the safe point — Wix is still live at `hinmanlabucla.org` until you change DNS.

---

## Phase 4 — Point your domain at Cloudflare (~10 min + up to 24h wait)

### 4.1 Add your domain to Cloudflare

1. Cloudflare dashboard → top-right account menu → **Add a site**
2. Type `hinmanlabucla.org` → click **Continue**
3. Pick the **Free** plan → **Continue**
4. Cloudflare scans your current DNS records. Review the list — you should see entries pointing at Wix (e.g. `185.230.x.x`). Leave them for now; we'll replace them. → **Continue**
5. Cloudflare displays **two nameservers** that look like:
   ```
   xxx.ns.cloudflare.com
   yyy.ns.cloudflare.com
   ```
   **Keep this browser tab open.** Or write the two nameservers down.

### 4.2 Change nameservers at your domain registrar

This is the only DNS change you make. Log into whichever registrar manages `hinmanlabucla.org` (from "Before you start" step 1) and find the **nameservers** setting.

The exact wording varies by registrar:
- **Wix Domains:** Domains → click the domain → Advanced → Name Servers → switch to "Custom"
- **GoDaddy:** My Products → DNS next to the domain → Nameservers → Change → "Enter my own nameservers"
- **Namecheap:** Domain List → Manage → Nameservers → "Custom DNS"
- **Google/Squarespace Domains:** Domain → DNS → "Use custom nameservers"
- **Network Solutions:** Manage → Change Nameservers

In all of them: **delete the existing nameservers** and add the two Cloudflare ones. Save.

### 4.3 Wait

Back on Cloudflare → **Done, check nameservers**. Cloudflare polls until the change propagates. This usually takes 5–60 minutes but can take up to 24 hours. They'll email you when it's active.

You can continue with Phase 5 immediately — the connection between Pages and your domain happens automatically once nameservers flip.

### 4.4 Connect the domain to Pages

While waiting (or after), in the Cloudflare dashboard:

1. **Workers & Pages** → click `hinman-lab` project → **Custom domains** tab
2. **Set up a custom domain** → enter `hinmanlabucla.org` → **Continue** → **Activate domain**
3. Repeat for `www.hinmanlabucla.org`

Both will show "Verifying" then "Active" once nameservers are live. SSL certificates are automatic — usually ready in 5 minutes after Active.

---

## Phase 5 — Final verification and cutover (~15 min + 48h watch)

### 5.1 The pre-cutover checklist

Open `https://hinmanlabucla.org` in a browser (use a private/incognito window to avoid cache). Confirm:

- [ ] Site loads with the new design (not the old Wix site)
- [ ] The padlock in the address bar is closed (SSL working)
- [ ] Home page hero shows up
- [ ] `/publications` shows 83 papers grouped by year
- [ ] `/team` shows the team grid
- [ ] On your phone (use cellular, not WiFi): site loads correctly
- [ ] Click a PubMed link from /publications — it opens NCBI

If everything passes, you're effectively live.

### 5.2 Watch for 48 hours

Don't cancel Wix yet. DNS caches around the world can hold the old Wix address for up to 48 hours. You want a window where you can still roll back to Wix if something breaks.

During the wait:
- Mention to lab members "the website moved, let me know if anything looks off"
- Check email a few times — Cloudflare and the registrar will email if anything changes

### 5.3 Cancel Wix

After 48 hours of clean Cloudflare serving:
1. Log into Wix → Account → Subscriptions
2. Cancel the Wix Premium subscription. If they let you downgrade to "Free" instead of canceling outright, do that — keeps the site as a backup for a month at no cost.
3. **If Wix is also your domain registrar** (Phase 0 step 1), DO NOT let the domain expire. Either:
   - Renew the domain through Wix even after canceling Premium (they let you), or
   - Transfer the domain to a cheaper registrar like Cloudflare Registrar (~$10/yr, at-cost). Cloudflare can guide this in **Domain Registration → Transfer Domains**.

---

## Phase 6 — How to update the site from now on

You don't open a web editor anymore. You edit Markdown files locally and `git push`.

The simplest workflow if you're not a Terminal person: use **GitHub's web editor**.

1. Go to your repo on github.com
2. Navigate to e.g. `src/content/news/`
3. Click **Add file → Create new file**
4. Name it `2026-07-new-grant.md`, type the content (see `MAINTENANCE.md` for the format)
5. Scroll down → **Commit changes**

The site rebuilds automatically. New post appears at https://hinmanlabucla.org/news/ within ~2 minutes.

`MAINTENANCE.md` (in your project folder) has the exact frontmatter format for adding publications, team members, news posts, and grants.

To refresh publications from PubMed in bulk:
```bash
cd "$HOME/Documents/Claude/Projects/Hinman lab website"
npm install                    # first time only
npm run pubmed:fetch           # pulls fresh from PubMed, rewrites files
git add -A
git commit -m "Refresh publications"
git push
```

That's it.

---

## When things go wrong

| Symptom | What to do |
| --- | --- |
| `gh auth login` keeps failing | Try `gh auth login --web` to force the browser flow |
| `npm install` errors with "EACCES" | Run `sudo chown -R $USER ~/.npm` then try again |
| Cloudflare build fails | Click into the failed build → check log. 90% of the time it's the `NODE_VERSION=20` env var missing. |
| Domain stuck "Verifying" in Pages | Wait. Check `dig hinmanlabucla.org NS +short` in Terminal — should return Cloudflare nameservers, not the old ones. |
| Site loads but pages 404 | Build output directory must be `dist` (not `./dist`, not `dist/`) |
| Photos broken after Wix cancellation | Expected — see the "Photos" note in `MAINTENANCE.md`. Quick fix is to download each Wix-hosted image, save under `public/team/`, update the photo path in each `src/content/team/*.md` file |

When in doubt, the Cloudflare Pages build log is usually the most informative thing — every deploy lists exactly what happened.

---

## Recap of what you're paying for after launch

- Domain renewal: ~$12–15/yr at your current registrar (no change unless you transfer)
- Cloudflare Pages: $0
- Cloudflare DNS: $0
- GitHub: $0

**Total: ~$15/yr.** No subscriptions to renew, no plan tiers to think about.


rearviewmirror!2026

jzow ojvu lqey nyqe
