#!/usr/bin/env node
// Fetch Jason D. Hinman publications from NCBI E-utilities and ADD any new ones
// as Markdown files in src/content/publications/.
//
// This is ADDITIVE: existing files (and their `featured: true` flags / manual
// edits) are never deleted or overwritten — only PMIDs not already present are
// added. Safe to re-run anytime; review newly added files and commit.
//
// Usage:
//   node scripts/fetch_pubmed.mjs                # or: npm run pubmed:fetch
//   NCBI_API_KEY=xxxx node scripts/fetch_pubmed.mjs   # higher rate limit
//
// SEARCH_TERM uses an affiliation filter to keep additions high-precision.
// Adjust it if disambiguation drifts (e.g., a new affiliation).

import fs from 'node:fs/promises';
import path from 'node:path';

const SEARCH_TERM = 'Hinman JD[Author] AND (UCLA[Affiliation] OR "University of California, Los Angeles"[Affiliation] OR "Boston University"[Affiliation] OR "West Los Angeles VA"[Affiliation])';
const RETMAX = 500;
const TOOL = 'hinmanlab-site';
const EMAIL = 'jason.hinman@ucla.edu';
const API_KEY = process.env.NCBI_API_KEY || '';
const OUT_DIR = path.resolve('src/content/publications');

function qs(params) {
  const usp = new URLSearchParams(params);
  if (API_KEY) usp.set('api_key', API_KEY);
  usp.set('tool', TOOL);
  usp.set('email', EMAIL);
  return usp.toString();
}

async function esearch(term) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${qs({
    db: 'pubmed',
    term,
    retmax: String(RETMAX),
    retmode: 'json',
  })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`esearch ${res.status}`);
  const json = await res.json();
  return json.esearchresult?.idlist ?? [];
}

async function esummary(ids) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${qs({
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'json',
  })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`esummary ${res.status}`);
  const json = await res.json();
  return json.result;
}

function slugify(title, year, pmid) {
  const s = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .split('-')
    .slice(0, 8)
    .join('-');
  return `${year}-${pmid}-${s}`.slice(0, 120);
}

function esc(v) {
  if (v === null || v === undefined || v === '') return 'null';
  const s = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${s}"`;
}

function parseDate(history) {
  // Try to extract year and month from sortpubdate or pubdate "2024 Jun"
  return null;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log('Searching PubMed:', SEARCH_TERM);
  const ids = await esearch(SEARCH_TERM);
  console.log(`Found ${ids.length} PMIDs`);

  if (ids.length === 0) return;

  // esummary in chunks of 200 PMIDs
  const chunks = [];
  for (let i = 0; i < ids.length; i += 200) chunks.push(ids.slice(i, i + 200));

  const records = [];
  for (const chunk of chunks) {
    const result = await esummary(chunk);
    for (const pmid of chunk) {
      const r = result[pmid];
      if (!r) continue;
      const pubdate = r.pubdate || '';
      const [year, month] = pubdate.split(' ');
      const authors = (r.authors || []).map((a) => a.name).join(', ');
      // Pull DOI from articleids
      const doi = (r.articleids || []).find((x) => x.idtype === 'doi')?.value || null;
      const pmcid = (r.articleids || []).find((x) => x.idtype === 'pmc')?.value || null;
      records.push({
        pmid,
        title: (r.title || '').replace(/[.\s]+$/, '') + '.',
        authors,
        journal: r.source || '',
        year: Number(year) || null,
        month: month || null,
        volume: r.volume || null,
        issue: r.issue || null,
        pages: r.pages || null,
        pmcid,
        doi,
      });
      await new Promise((r) => setTimeout(r, API_KEY ? 100 : 350));
    }
  }

  console.log(`Writing ${records.length} files to ${OUT_DIR}`);

  // Write raw JSON snapshot
  await fs.mkdir('_research', { recursive: true });
  await fs.writeFile(
    '_research/publications_raw.json',
    JSON.stringify(
      {
        source: 'PubMed esearch/esummary',
        scraped: new Date().toISOString().slice(0, 10),
        search_term: SEARCH_TERM,
        count: records.length,
        publications: records,
      },
      null,
      2
    )
  );

  // ADDITIVE merge: never delete or overwrite existing publication files. This
  // preserves the curated set, any manual edits, and `featured: true` flags.
  // Only PMIDs not already present are written as new files.
  const existing = await fs.readdir(OUT_DIR);
  const havePmids = new Set();
  for (const f of existing) {
    if (!f.endsWith('.md')) continue;
    const txt = await fs.readFile(path.join(OUT_DIR, f), 'utf8');
    const pmid = (txt.match(/^pmid:\s*"?(\d+)"?/m) || [])[1];
    if (pmid) havePmids.add(pmid);
  }

  let added = 0;
  for (const p of records) {
    if (havePmids.has(String(p.pmid))) continue; // already curated — leave untouched
    const slug = slugify(p.title, p.year, p.pmid);
    const fp = path.join(OUT_DIR, `${slug}.md`);
    const lines = [
      '---',
      `title: ${esc(p.title)}`,
      `authors: ${esc(p.authors)}`,
      `journal: ${esc(p.journal)}`,
      `year: ${p.year}`,
      `month: ${esc(p.month)}`,
      `volume: ${esc(p.volume)}`,
      `issue: ${esc(p.issue)}`,
      `pages: ${esc(p.pages)}`,
      `pmid: ${esc(p.pmid)}`,
      `pmcid: ${esc(p.pmcid)}`,
      `doi: ${esc(p.doi)}`,
      `url: ${esc(`https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/`)}`,
      '---',
      '',
    ];
    await fs.writeFile(fp, lines.join('\n'));
    added++;
  }

  console.log(`Done. Added ${added} new publication(s); left ${havePmids.size} existing file(s) untouched.`);
  console.log('Tip: review new files (some searches surface namesakes) and delete any that are not the right Hinman JD.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
