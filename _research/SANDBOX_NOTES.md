# Build notes from the initial scaffold session

## Verified
- `npm install` succeeds (312 packages) in a fresh Node 20+ environment.
- `npm run build` succeeds and emits `dist/` with:
  - 8 HTML pages (index, research, publications, team, news, join, contact, 404)
  - 1 sitemap-index.xml + sitemap-0.xml
  - favicon.svg, robots.txt
  - all 83 publications rendered with PubMed links
  - 18 team members in grouped sections, Jason as PI
  - 4 research areas, 4 funding entries, 1 seed news post

## Git state
The mounted filesystem on this Mac has macOS extended attributes that
the build sandbox can't modify on `.git/`, so the **second commit (adding
package-lock.json) couldn't be finalized from the sandbox.** The initial
commit `07bbfd8` is on `main` and contains the full scaffold.

After you open this project locally, finalize with two commands:

```bash
cd "~/Documents/Claude/Projects/Hinman lab website"
git status            # should show package-lock.json staged
git commit -m "Add package-lock.json"
```

That's it. From there normal `git add` / `git commit` / `git push` will
work without any further setup.
