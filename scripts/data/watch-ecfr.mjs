#!/usr/bin/env node
// scripts/data/watch-ecfr.mjs -- spec-v1517 route B, watcher 1 (the eCFR amendment watcher).
//
// Every CFR section a tool cites (its META citation text or its eCFR citationUrl) is checked against the eCFR
// versions API; a section amended after the date the tool last read its source (META citationAccessed) is
// listed, with the tools it affects, for the weekly data-refresh pull request:
//
//   42 CFR 423.137 was amended on 2027-02-03, after m3p-monthly-bill last verified it (2026-09-25).
//
// It never fails the job: a section the API cannot answer is named as unchecked. Usage:
//   node scripts/data/watch-ecfr.mjs [--json] [--offline]

import { getText } from './http.mjs';

const API = 'https://www.ecfr.gov/api/versioner/v1/versions';
// A trailing -N is part of an IRS-style section (1.36B-2), never the start of a range (414.20-414.22).
// So is a parenthesized letter that a -N follows (1.501(r)-6); a bare paragraph (147.130(a)(1)) is not part of it.
const SECTION_TEXT = /\b(\d{1,2}) C\.?F\.?R\.? (?:(?:§|sec(?:tion)?\.?)\s*)?(\d{1,4})\.(\d+[A-Za-z]*(?:\([a-z]\)-\d+|-\d+(?![.\d]))?)/g;
const SECTION_URL = /ecfr\.gov\/(?:current|on\/[^/]+)\/title-(\d+)\/(?:[^?#]*\/)?section-(\d+)\.(\d+[A-Za-z]*(?:\([a-z]\)-\d+|-\d+)?)/;

// citedSections(META) -> Map 'T CFR P.S' -> [{ tile, verified }], from each tile's citation and citationUrl.
export function citedSections(meta) {
  const out = new Map();
  for (const [tile, e] of Object.entries(meta || {})) {
    if (!e || typeof e !== 'object') continue;
    const found = new Set();
    for (const m of String(e.citation || '').matchAll(SECTION_TEXT)) found.add(`${m[1]} CFR ${m[2]}.${m[3]}`);
    const u = SECTION_URL.exec(String(e.citationUrl || ''));
    if (u) found.add(`${u[1]} CFR ${u[2]}.${u[3]}`);
    for (const s of found) {
      if (!out.has(s)) out.set(s, []);
      out.get(s).push({ tile, verified: /^\d{4}-\d{2}-\d{2}$/.test(e.citationAccessed || '') ? e.citationAccessed : null });
    }
  }
  return out;
}

// amendedAfter(sections, amendments) -> [{ section, amended, tiles: [{ tile, verified }] }] for each section whose
// latest amendment is after a citing tile's verification date. A tile with no date cannot be compared; it is
// listed by unverified() instead.
export function amendedAfter(sections, amendments) {
  const rows = [];
  for (const [section, tiles] of sections) {
    const amended = amendments.get(section);
    if (!amended) continue;
    const stale = tiles.filter((t) => t.verified && t.verified < amended);
    if (stale.length) rows.push({ section, amended, tiles: stale });
  }
  return rows.sort((a, b) => b.amended.localeCompare(a.amended) || a.section.localeCompare(b.section));
}

// unverified(sections) -> the tiles that cite a CFR section but carry no citationAccessed date.
export const unverified = (sections) => [...new Set([...sections.values()].flat().filter((t) => !t.verified).map((t) => t.tile))].sort();

export function markdown(rows, { checked, unchecked, undated = [] }) {
  const lines = ['## Cited regulations amended since their tools last read them', ''];
  if (!rows.length) lines.push(`No cited CFR section was amended after the tools citing it last verified it (${checked} sections checked).`);
  for (const r of rows) {
    const who = r.tiles.map((t) => `\`${t.tile}\` (verified ${t.verified})`).join(', ');
    lines.push(`- ${r.section} was amended on ${r.amended}. Tools to re-check: ${who}.`);
  }
  if (undated.length) lines.push('', `${undated.length} tool${undated.length === 1 ? ' cites' : 's cite'} a CFR section with no verification date to compare against: ${undated.map((t) => `\`${t}\``).join(', ')}.`);
  if (unchecked.length) lines.push('', `The eCFR could not answer for ${unchecked.length} section${unchecked.length === 1 ? '' : 's'}: ${unchecked.join(', ')}.`);
  return lines.join('\n') + '\n';
}

async function latestAmendment(section, http) {
  const [title, , num] = section.split(' ');
  const text = await http.getText(`${API}/title-${title}.json?section=${encodeURIComponent(num)}`, { retries: 4, backoffMs: 3000, timeoutMs: 60000 });
  const meta = JSON.parse(text).meta || {};
  return /^\d{4}-\d{2}-\d{2}$/.test(meta.latest_amendment_date || '') ? meta.latest_amendment_date : null;
}

async function main() {
  const args = process.argv.slice(2);
  const { META } = await import('../../lib/meta.js');
  const sections = citedSections(META);
  if (args.includes('--offline') || process.env.SOPHIEWELL_OFFLINE === '1') {
    process.stdout.write(`## Cited regulations\n\nOffline run: ${sections.size} cited CFR sections were not checked.\n`);
    return;
  }
  const amendments = new Map(); const unchecked = [];
  for (const s of sections.keys()) {
    try {
      const d = await latestAmendment(s, { getText });
      if (d) amendments.set(s, d); else unchecked.push(s);
    } catch { unchecked.push(s); }
    await new Promise((r) => setTimeout(r, 250));
  }
  const rows = amendedAfter(sections, amendments);
  if (args.includes('--json')) process.stdout.write(JSON.stringify({ checked: amendments.size, unchecked, undated: unverified(sections), rows }, null, 2) + '\n');
  else process.stdout.write(markdown(rows, { checked: amendments.size, unchecked, undated: unverified(sections) }));
}

if (process.argv[1] && process.argv[1].endsWith('watch-ecfr.mjs')) {
  main().catch((err) => { process.stdout.write(`## Cited regulations\n\nThe eCFR watcher did not run: ${err.message}\n`); });
}
