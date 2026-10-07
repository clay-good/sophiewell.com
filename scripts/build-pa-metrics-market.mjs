#!/usr/bin/env node
// spec-v1605: the market summary of the curated prior authorization metrics table.
//
// scripts/data/pa-metrics.json holds one row per posted CMS-0057-F report (the payer's figures as posted,
// its URL and the date it was read). This writes lib/pa-metrics-market.js: for each program and year, and
// each metric, how many reports give it, their median and the middle half (25th to 75th percentile,
// linear interpolation), and which payers they come from. pa-metrics-compare imports it, so the tool sets a
// payer's figure beside the market without fetching anything.
//
// Decision times are kept in the rows but not summarized: payers post them at different precision (Humana
// and Aetna in whole days, so "0 day(s)" means under a day; Kaiser in days and hours), and a pooled median of
// mixed roundings is not a market figure.
//
// The full range is not the summary: a contract with three requests posts 0% or 100%, so the extremes say
// nothing about a market. Every report counts once, whatever its size, because most payers post no counts.
//
// Usage: node scripts/build-pa-metrics-market.mjs [--check]

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SEED = join(ROOT, 'scripts', 'data', 'pa-metrics.json');
const OUT = join(ROOT, 'lib', 'pa-metrics-market.js');

export const METRICS = ['stdApprovedPct', 'stdDeniedPct', 'appealApprovedPct', 'extendedApprovedPct', 'expApprovedPct', 'expDeniedPct'];
// The extended-review rate is checked per row but not summarized: payers divide it by different things (Kaiser by
// the requests whose review was extended, Humana's Virginia report by every request), so pooled it means nothing.
export const SUMMARY_METRICS = METRICS.filter((m) => m !== 'extendedApprovedPct');

// quantile(sorted, q): linear interpolation between closest ranks (R type 7, spreadsheet PERCENTILE.INC).
export function quantile(sorted, q) {
  const h = (sorted.length - 1) * q;
  const lo = Math.floor(h);
  return sorted[lo] + (h - lo) * ((sorted[Math.min(lo + 1, sorted.length - 1)]) - sorted[lo]);
}

export const MIN_PAYERS = 3;

const round2 = (x) => Math.round(x * 100) / 100;

// checkRows(rows) -> [problem]. A row without a source URL or read date fails the build (spec-v1605 Tests).
export function checkRows(rows) {
  const problems = [];
  const ids = new Set();
  for (const r of rows) {
    if (!r.id || ids.has(r.id)) problems.push(`duplicate or missing id: ${r.id}`);
    ids.add(r.id);
    if (!/^https:\/\//.test(r.url || '')) problems.push(`${r.id}: no source URL`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.readOn || '')) problems.push(`${r.id}: no read date`);
    if (!Number.isInteger(r.year)) problems.push(`${r.id}: no report year`);
    for (const k of METRICS) if (r[k] != null && !(r[k] >= 0 && r[k] <= 100)) problems.push(`${r.id}: ${k} ${r[k]} outside 0-100`);
    for (const [n, d, p] of [['stdApproved', 'stdRequests', 'stdApprovedPct'], ['stdDenied', 'stdRequests', 'stdDeniedPct'], ['expApproved', 'expRequests', 'expApprovedPct'], ['expDenied', 'expRequests', 'expDeniedPct'], ['appealApproved', 'appeals', 'appealApprovedPct'], ['extendedApproved', 'extendedRequests', 'extendedApprovedPct']]) {
      if (r[n] == null || r[d] == null) continue;
      if (r[d] === 0) { if (r[p] != null) problems.push(`${r.id}: ${p} over zero requests`); continue; }
      const declared = (r.rateMismatch || []).includes(p) && /does not match the posted counts/.test(r.note || '');
      if (!declared && (r[p] == null || Math.abs((100 * r[n]) / r[d] - r[p]) > 0.051)) problems.push(`${r.id}: ${p} ${r[p]} does not match ${r[n]} of ${r[d]}`);
    }
  }
  return problems;
}

export function summarize(rows) {
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.program}|${r.year}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const out = {};
  for (const [key, rs] of [...groups.entries()].sort()) {
    const [program, year] = key.split('|');
    const metrics = {};
    const payers = [...new Set(rs.map((r) => r.payer))].sort();
    // Fewer than three payers describe those payers, not a market: no summary is given.
    if (payers.length >= MIN_PAYERS) for (const m of SUMMARY_METRICS) {
      // A rate its own counts contradict, or one posted over a different denominator, is declared on the row
      // (`notPooled`) and left out.
      const vals = rs.filter((r) => !(r.notPooled || []).includes(m)).map((r) => r[m]).filter((v) => typeof v === 'number').sort((a, b) => a - b);
      if (vals.length < 10) continue;
      metrics[m] = { n: vals.length, median: round2(quantile(vals, 0.5)), p25: round2(quantile(vals, 0.25)), p75: round2(quantile(vals, 0.75)) };
    }
    out[key] = {
      program, year: Number(year), reports: rs.length,
      payers,
      readOn: rs.map((r) => r.readOn).sort().at(-1),
      metrics,
    };
  }
  return out;
}

export function moduleText(summary) {
  return `// GENERATED by scripts/build-pa-metrics-market.mjs from scripts/data/pa-metrics.json. Do not edit by hand:
// edit the table and re-run the generator (test/unit/pa-metrics-market.test.js fails on drift).
//
// spec-v1605: per program and report year, each metric's count of reports, median and middle half
// (25th to 75th percentile) across the posted CMS-0057-F reports in the curated table.

export const PA_METRICS_MARKET = ${JSON.stringify(summary, null, 2)};
`;
}

function main() {
  const rows = JSON.parse(readFileSync(SEED, 'utf8'));
  const problems = checkRows(rows);
  if (problems.length) { console.error(`build-pa-metrics-market: ${problems.length} problem(s):\n  ${problems.join('\n  ')}`); process.exit(1); }
  const text = moduleText(summarize(rows));
  if (process.argv.includes('--check')) {
    if (readFileSync(OUT, 'utf8') !== text) { console.error('build-pa-metrics-market: lib/pa-metrics-market.js is out of date; run node scripts/build-pa-metrics-market.mjs'); process.exit(1); }
    console.log('build-pa-metrics-market: clean.');
    return;
  }
  writeFileSync(OUT, text);
  console.log(`build-pa-metrics-market: wrote lib/pa-metrics-market.js (${rows.length} reports).`);
}

if (process.argv[1] && process.argv[1].endsWith('build-pa-metrics-market.mjs')) main();
