#!/usr/bin/env node
// Fetch Jason D. Hinman publications from NCBI E-utilities and write
// one Markdown file per publication into src/content/publications/.
//
// Usage:
//   node scripts/fetch_pubmed.mjs                # default search
//   NCBI_API_KEY=xxxx node scripts/fetch_pubmed.mjs
//
// Default search term targets UCLA + Boston University affiliations.
// Adjust SEARCH_TERM if disambiguation drifts (e.g., new affiliation).

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

  // Wipe and rewrite content files
  for (const f of await fs.readdir(OUT_DIR)) {
    if (f.endsWith('.md')) await fs.unlink(path.join(OUT_DIR, f));
  }

  for (const p of records) {
    const slug = slugify(p.title, p.year, p.pmid);
    const fp = path.join(OUT_DIR, `${slug}.md`);
    const body = [
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
    ].join('\n');
    await fs.writeFile(fp, body);
  }

  console.log('Done. Review changes and commit.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
