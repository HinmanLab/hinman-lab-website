# Maintenance — Day-to-day updates

All site content lives in version-controlled Markdown files. To update the site:

1. Edit the relevant file(s)
2. Commit and push to `main`
3. Cloudflare Pages rebuilds and deploys within ~2 minutes

No CMS, no clicking around a Wix editor. Edit in any text editor (VS Code, GitHub.com web editor, Cursor, vim).

---

## Add a new publication

### Option A: refresh the full list from PubMed (recommended quarterly)

```bash
npm run pubmed:fetch
git add src/content/publications/ _research/publications_raw.json
git commit -m "Refresh publications from PubMed"
git push
```

The script in `scripts/fetch_pubmed.mjs` queries NCBI E-utilities for `Hinman JD[Author]` with the UCLA + Boston University affiliation filter, wipes `src/content/publications/`, and rewrites it. You'll see new papers appear and any title/author corrections from NCBI propagate.

If the affiliation filter starts excluding legitimate papers (e.g., you publish from a different institution), edit `SEARCH_TERM` at the top of `scripts/fetch_pubmed.mjs`.

For higher rate limits (3 → 10 req/s), get a free NCBI API key at https://account.ncbi.nlm.nih.gov/settings/ and run:

```bash
NCBI_API_KEY=xxxxxxxxxx npm run pubmed:fetch
```

### Option B: add a single publication manually

Create a new file in `src/content/publications/`, e.g.
`src/content/publications/2026-99999999-my-new-paper.md`:

```markdown
---
title: "Full title of paper."
authors: "Last F, Last F, Hinman JD"
journal: "J Important Sci"
year: 2026
month: "Jun"
volume: "12"
issue: "3"
pages: "100-110"
pmid: "99999999"
pmcid: null
doi: "10.1000/xyz"
url: "https://pubmed.ncbi.nlm.nih.gov/99999999/"
---
```

Filename convention: `<year>-<pmid>-<short-slug>.md`. Order doesn't matter — the publications page sorts by year/month at build time.

---

## Add a team member

Create `src/content/team/<firstname-lastname>.md`:

```markdown
---
name: "Alex Example, PhD"
role: "Postdoctoral Fellow"
group: "Postdoc"
order: 25
photo: "/team/alex.jpg"   # save image at public/team/alex.jpg, ~400x400px square
linkedin: "https://www.linkedin.com/in/alex-example/"
twitter: null
email: "alex.example@ucla.edu"
orcid: "0000-0000-0000-0000"
---

One- to three-sentence bio. Where they trained, what they work on, what makes them interesting.
```

**Valid `group` values** (sets the section on `/team`):
- `PI`
- `Project Scientist`
- `Postdoc`
- `Grad Student`
- `Clinical`
- `Staff`
- `Undergraduate`
- `Alumni`

`order` controls position within a group (lower = first). Set Jason at `order: 1`, others at 10, 20, 30, etc., so you can insert new people without renumbering.

**Photos:** save to `public/team/<name>.jpg`. The site uses `aspect-square` and `object-cover`, so any square-ish photo works. ~400x400 is plenty (will be displayed at ~200px). Convert to WebP via `cwebp` or an online tool for smaller file sizes if you want.

When someone leaves, change their `group` to `Alumni` (don't delete the file). They'll move to the bottom of `/team` automatically.

---

## Add a news post

Create `src/content/news/<yyyy-mm-short-title>.md`:

```markdown
---
title: "Lab welcomes new grad student"
date: 2026-06-15
summary: "One-line teaser shown on home page and news index."
link: null    # optional external link
---

Full post body in Markdown. Supports **bold**, *italic*, lists, [links](https://example.com),
images, etc.
```

Posts are sorted by `date` descending. The three most recent appear on the home page.

---

## Add or update a research area

Create or edit `src/content/research/<short-slug>.md`:

```markdown
---
title: "Title of research area"
order: 50           # lower = earlier on /research; top 3 appear on home
summary: "One paragraph describing the program — appears on home + research page."
---

Optional longer-form body, displayed on /research only.
```

---

## Add or update funding

Create `src/content/funding/<grant-slug>.md`:

```markdown
---
title: "Plain-language project title"
grant: "R01NS000000"
agency: "NIH / NINDS"
role: "PI"
start: "2024"
end: null
active: true
url: "https://reporter.nih.gov/search/?term=R01NS000000"
---
```

Set `active: false` once a grant ends — it stays on the page but with a "past" badge.

---

## Update the home page hero or PI bio

- **Hero text + tagline**: `src/pages/index.astro` (look for the `<section>` near the top with `Repairing the brain...`).
- **PI bio**: `src/content/team/jason-hinman.md`.
- **Footer contact**: `src/components/Footer.astro`.

---

## Update site-wide settings

| Setting | File |
| --- | --- |
| Color palette | `src/styles/global.css` — `@theme` block |
| Fonts | `src/styles/global.css` + `<link>` tag in `src/layouts/BaseLayout.astro` |
| Site title / default description | `src/layouts/BaseLayout.astro` (the `siteName` and `description` defaults) |
| Header nav links | `src/components/Header.astro` — `nav` array |
| Favicon | `public/favicon.svg` |
| OG default image | `public/og-default.png` (create this; 1200x630 recommended) |
| Sitemap URL | `astro.config.mjs` — `site` field |

---

## Local preview before pushing

```bash
npm run dev       # live-reload dev server
npm run build     # build production HTML
npm run preview   # preview the built dist/ locally
```

If `npm run build` fails, fix the error before pushing — Cloudflare's build will fail too, but it's faster to catch locally.

---

## Backups

- All content is in Git → GitHub.
- Cloudflare Pages keeps every deploy and lets you instantly roll back via the dashboard.
- The original Wix content snapshot is preserved under `_research/wix_archive/`.
- The raw PubMed JSON snapshot lives at `_research/publications_raw.json` (regenerated each time you run `npm run pubmed:fetch`).

You don't need any other backup beyond pushing to GitHub.
