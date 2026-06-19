# How to edit the website

You edit the site by changing **text files on GitHub**. Every time you save
("commit"), the site automatically rebuilds and is live in about 1–2 minutes.

Repo: https://github.com/HinmanLab/hinman-lab-website

---

## The basic routine (works for every edit)

1. Open the repo on GitHub (link above).
2. Click into the **file** you want to change (paths are listed below — folders are separated by `/`).
3. Click the **pencil ✏️ icon** (top-right of the file) to edit.
4. Change the text.
5. Scroll down → green **"Commit changes…"** button → **Commit changes** again in the popup.
6. Wait 1–2 minutes, then refresh https://www.hinmanlabucla.org.

> Tip: to preview a change safely, you can put "Draft" in the commit message — it still publishes, but it's a reminder. There's no separate staging site, so small edits go straight to live.

**Three file types, three rules:**
- **`.json` files** → only change words *inside the quotes* `"like this"`. Keep the quotes, commas, and brackets exactly as they are.
- **`.md` files** → the part between the two `---` lines is settings; the text *below* the second `---` is the bio/description and you can write freely.
- **`.astro` files** → only change the words that appear *between* `>` and `<`. Don't touch anything inside `< >` tags.

---

## Where each section lives

### 🏠 Home page
File: **`src/pages/index.astro`**
- **Big headline** ("Where the brain meets its blood vessels") and the sentence under it.
- **"The Lab" section** — the two paragraphs describing the lab.
- **"Get in touch" / Contact** wording at the bottom.
- The PI photo card pulls its name/title/bio from the team file (see Team below).

### 🔬 Research / Projects
File: **`src/data/research.json`** ← this is where your project text lives
- `intro` — the paragraph at the top of the Research page.
- Each program has: `title`, `tagline`, `description`, and `highlights` (the little pills). Edit the text inside the quotes.
- `stats` — the four numbers on the home page (publications and member counts update automatically).

**Changing which publications show under a project** (you asked about this):
Each program has a `pmids` list. Leave it empty (`[]`) to let the site auto-pick papers, **or** type the PubMed IDs you want, in the order you want:
```json
"pmids": [36543124, 39602511]
```
You can find a paper's PubMed ID (PMID) on the Publications page — it's shown next to each paper ("PMID 36543124"). Up to 4 are displayed per program.

The **"Equity in science and medicine"** statement at the bottom of the Research page is in `src/pages/research.astro`.

### 📚 Publications
Folder: **`src/content/publications/`** — one file per paper.
- The list is generated from PubMed. To pull in newly published papers, run `npm run pubmed:fetch` (or ask me) — it only *adds* new ones.
- To **feature** a paper on the home page and at the top of the Publications page, open its file and add this line in the settings block:
  ```
  featured: true
  ```
- To remove a paper, delete its file (use the `…` / trash menu on GitHub).

### 👥 Team
Folder: **`src/content/team/`** — one file per person.
- To **edit someone**, open their file: the settings block holds `name`, `role`, `group`, `photo`; the text below is their bio.
- `group` must be one of: `PI`, `Project Scientist`, `Postdoc`, `Grad Student`, `Clinical`, `Staff`, `Undergraduate`, `Alumni`.
- To **add someone**, copy an existing file (GitHub: open a file → "Copy raw" isn't enough; easiest is "Add file → Create new file" and paste an existing one's contents, then edit).
- **Photos:** upload a square image to `public/images/team/` and set `photo: "/images/team/their-name.jpg"`. Leave `photo: null` to show colored initials.

### 📰 News
Folder: **`src/content/news/`** — one file per post.
- Copy an existing post to add a new one. The settings block has `title` and `date`; write the post below the `---`.

### 🤝 Join Us
File: **`src/pages/join.astro`**
- The intro, the four "who we're looking for" cards, and the "How to apply" text.

### ⚙️ Site-wide info (used everywhere)
File: **`src/data/site.json`**
- Lab name, tagline, institution line, **contact email / phone / address**, and the social links (Twitter, LinkedIn, ORCID).

### 🧭 Menu & footer
Files: **`src/components/Nav.astro`** (top menu) and **`src/components/Footer.astro`** (bottom links).

---

## If something breaks
A bad edit (a missing quote or comma in a `.json` file, a deleted `<tag>` in an `.astro` file) can make the build fail — the **old version stays live**, so the public site won't break. GitHub will email you that the build failed. Just undo your last edit (open the file → History → revert) or ask me to fix it.
