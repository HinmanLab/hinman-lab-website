# Hinman Lab — Website

Source code for [hinmanlabucla.org](https://www.hinmanlabucla.org). Built with [Astro 5](https://astro.build), [Tailwind CSS 4](https://tailwindcss.com), and deployed on [Cloudflare Pages](https://pages.cloudflare.com).

The site is fully static — there is no runtime database, no JS by default, and every page renders to plain HTML at build time. Content lives in version-controlled Markdown files under `src/content/`.

## Quick start

```bash
git clone <repo-url> hinman-lab-website
cd hinman-lab-website
npm install
npm run dev          # http://localhost:4321
```

## Project layout

```
.
├── astro.config.mjs           # Astro config + sitemap + tailwind plugin
├── package.json
├── public/                    # Static assets served as-is (favicon, robots.txt, OG image)
├── scripts/
│   └── fetch_pubmed.mjs       # Refresh publications from NCBI E-utilities
├── src/
│   ├── components/            # Header, Footer
│   ├── content/               # All site content — edit these to update the site
│   │   ├── publications/      # One MD file per publication
│   │   ├── team/              # One MD file per lab member
│   │   ├── news/              # One MD file per post
│   │   ├── research/          # One MD file per research focus area
│   │   └── funding/           # One MD file per grant/award
│   ├── content.config.ts      # Schema for each content collection
│   ├── layouts/BaseLayout.astro
│   ├── pages/                 # One .astro file per top-level route
│   └── styles/global.css      # Tailwind import + design tokens
├── _research/                 # Reference material (Wix archive, raw PubMed JSON) — not deployed
├── README.md
├── DEPLOYMENT.md              # How to deploy to Cloudflare Pages
└── MAINTENANCE.md             # Day-to-day updates (publications, team, news)
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with live reload at `http://localhost:4321` |
| `npm run build` | Build static site to `dist/` |
| `npm run preview` | Preview the built `dist/` locally |
| `npm run pubmed:fetch` | Re-pull publications from PubMed and rewrite `src/content/publications/` |

## Where content lives

All site content is plain Markdown with YAML frontmatter, type-checked at build time via the schema in `src/content.config.ts`. To add or change something, edit the relevant file and commit.

- **Publications**: `src/content/publications/*.md` — one file per paper. Frontmatter must include `title`, `authors`, `journal`, `year`, `pmid`. Files can be regenerated en masse with `npm run pubmed:fetch`.
- **Team**: `src/content/team/*.md` — one file per person. Must include `name`, `role`, `group` (PI / Project Scientist / Postdoc / Grad Student / Clinical / Staff / Undergraduate / Alumni), and `order` (within group).
- **News**: `src/content/news/*.md` — one file per post. Must include `title` and `date`.
- **Research**: `src/content/research/*.md` — one file per focus area, shown on `/research` and (top 3) on home.
- **Funding**: `src/content/funding/*.md` — one file per grant or award.

See `MAINTENANCE.md` for the most common edits.

## Design system

- **Typography**: Source Serif 4 (headings), Inter (body), loaded from Google Fonts. To self-host, drop WOFF2 files in `public/fonts/` and update `BaseLayout.astro`.
- **Color tokens**: defined in `src/styles/global.css` under `@theme`. Primary accent is a restrained slate-blue (`--color-accent: #1f3a8a`); UCLA gold is reserved for small highlights.
- **Layout**: 6xl container (`max-w-6xl`) with generous whitespace; mobile-first responsive.
- **Accessibility**: skip link, semantic landmarks, keyboard-visible focus rings, alt text on all images, `prefers-reduced-motion` handled.

## Stack rationale

- **Astro** ships zero client-side JS by default. Pages are pure HTML — fast, robust, indexable, accessible. Markdown content collections fit lab-website data (publications, team, news) cleanly.
- **Tailwind** keeps styling co-located with markup without producing a heavy CSS bundle. Tailwind 4's `@theme` blocks let us define design tokens in CSS.
- **Cloudflare Pages** is free for sites of this size, has a global CDN, automatic SSL, and pushes new builds on every Git commit.

## License

Site code: MIT. Content: © The Hinman Lab.
