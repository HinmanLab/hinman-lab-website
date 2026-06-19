# Hinman Lab website

A fast, low-cost, static website for the Hinman Lab at UCLA, built with
[Astro](https://astro.build). No servers, no databases, nothing to patch — it
compiles to plain HTML/CSS and is hosted for free.

**Total ongoing cost: ~$12–20/yr** (just your domain renewal — hosting is free).

Design: a modern, dynamic "vascular neuroscience" look — animated cerebral-vessel
hero, scroll-reveal animations, and live count-up stats. Content is plain
**Markdown** you edit on GitHub; the site rebuilds automatically on each commit.

---

## ✅ Before you launch — things to verify

Edit `src/data/site.json`:

- **Email** — currently `jhinman@mednet.ucla.edu` (a typical UCLA pattern, **please confirm**).
- **Phone / address** — confirm `310-825-7802` and the listed address.
- Socials (Twitter `@HinmanLabUCLA`, LinkedIn, ORCID) were carried over — confirm they're right.

Also:
- **One team placeholder** — `src/content/team/harry-postdoc.md` is a stub ("Harry — Postdoctoral Fellow"). Replace with the real name, bio, and photo, or delete the file. It currently shows as a colored-initials card.

---

## Editing content (what you'll actually use)

Content lives in **Markdown files** you can edit directly on GitHub (open a file →
pencil icon → commit). The site rebuilds and redeploys within ~1 minute.

| What to change | Where |
|---|---|
| Lab name, contact, social links | `src/data/site.json` |
| Research programs + homepage stats | `src/data/research.json` |
| A publication | `src/content/publications/*.md` (one file per paper) |
| A team member | `src/content/team/*.md` (one file per person) |
| A funding grant | `src/content/funding/*.md` |
| A news post | `src/content/news/*.md` |
| "Join Us" page text | `src/pages/join.astro` |

### Publications — keep them current automatically
The publication list (83 papers) is generated from PubMed. To refresh after a new
paper is indexed:

```bash
npm run pubmed:fetch     # re-pulls Dr. Hinman's PubMed record
```

This rewrites the files in `src/content/publications/`. It **preserves your
`featured: true` flags**, so highlighted papers stay highlighted. Review the
changes (`git diff`) and commit. To spotlight a paper on the homepage, add
`featured: true` to its Markdown frontmatter.

> The search term lives near the top of `scripts/fetch_pubmed.mjs` if it ever
> needs tuning for author disambiguation.

### Add or edit a team member
Copy an existing file in `src/content/team/`. Frontmatter fields: `name`, `role`,
`group` (one of `PI`, `Project Scientist`, `Postdoc`, `Grad Student`, `Clinical`,
`Staff`, `Undergraduate`, `Alumni`), `order` (within the group), optional `photo`,
`linkedin`, `twitter`, `orcid`. The text below the frontmatter is the bio.
Set `photo: null` to show tasteful colored initials instead of a picture.

### Add or change a photo
1. Put a square image (e.g. 500×500) in `public/images/team/`.
2. Set that person's `photo:` to `/images/team/their-file.jpg`.

---

## Running it locally (optional)

```bash
npm install      # first time only
npm run dev      # open the printed http://localhost:4321 address
npm run build    # produce the final files in dist/
```

---

## Deployment

See **[DEPLOY.md](DEPLOY.md)** for step-by-step instructions to put this online for
free with Cloudflare Pages (or GitHub Pages) and point `hinmanlabucla.org` at it.

## Project layout

```
src/
  data/site.json          global config (name, contact, socials)
  data/research.json       research programs + homepage stats
  content/                 Markdown content (publications, team, funding, news)
  content.config.ts        content schemas
  components/              Nav, Footer, animated VesselField hero
  layouts/BaseLayout.astro page shell + scroll/animation scripts
  pages/                   index, research, publications, team, news, join, 404
  styles/global.css        the design system
public/images/team/        local headshots
scripts/fetch_pubmed.mjs   PubMed → Markdown sync
```
