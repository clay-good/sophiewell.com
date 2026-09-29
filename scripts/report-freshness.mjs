#!/usr/bin/env node
// scripts/report-freshness.mjs
//
// spec-v1622 step 5: one list of every dated value the site answers from --
// each module's dated-constant table (an `export const DATED_*` read through
// lib/dated-data.js datedValue) and each dataset manifest under data/ -- with
// its edition, the date it lapses, and its status today.
//
// Dated constants are year-keyed: 'hospice-cap-2026' stays right for FY2026
// questions after September 30, 2026, because a tool selects the row by the
// year asked about. So a FAMILY (the id without its year) is what can go
// stale: it is `expired` when its newest row has lapsed, meaning no figure
// exists for today. Datasets use datasetStatus() from lib/data.js.
//
// The same rows back the expiry guard in test/unit/data-freshness.test.js and,
// later, the pinned freshness issue (spec-v1621 §6).
//
// Usage: node scripts/report-freshness.mjs [--json] [--check]
//   --check exits 1 when anything is expired.

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { datasetStatus } from '../lib/data.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const familyOf = (id) => id.replace(/-(?:fy|cy)?\d{4}$/i, '');

export async function datedRows(now = new Date()) {
  const lib = join(ROOT, 'lib');
  const rows = [];
  for (const f of (await readdir(lib)).filter((n) => n.endsWith('.js')).sort()) {
    const text = await readFile(join(lib, f), 'utf8');
    if (!/export\s+(?:const\s+DATED_|\{[^}]*\bas\s+DATED_)/.test(text)) continue;
    const mod = await import(pathToFileURL(join(lib, f)).href);
    for (const [name, table] of Object.entries(mod)) {
      if (!name.startsWith('DATED_') || !table || typeof table !== 'object') continue;
      for (const [id, row] of Object.entries(table)) {
        if (!row || !row.validThrough) continue;
        rows.push({ kind: 'dated', id, family: familyOf(id), module: `lib/${f}`, edition: row.edition, through: row.validThrough });
      }
    }
  }
  // Two modules can export the same table (a re-export); keep one row per id.
  const byId = new Map(rows.map((r) => [r.id, r]));
  const out = [...byId.values()];
  const newest = new Map();
  for (const r of out) if (!newest.has(r.family) || r.through > newest.get(r.family)) newest.set(r.family, r.through);
  const today = now.toISOString().slice(0, 10);
  for (const r of out) {
    const familyThrough = newest.get(r.family);
    r.status = familyThrough < today ? 'expired' : (r.through < today ? 'superseded' : 'current');
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export async function datasetRows(now = new Date()) {
  const data = join(ROOT, 'data');
  const rows = [];
  for (const d of (await readdir(data, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    const p = join(data, d, 'manifest.json');
    if (!existsSync(p)) continue;
    const m = JSON.parse(await readFile(p, 'utf8'));
    if (!m.dataset) continue;
    const s = datasetStatus(m, now);
    rows.push({ kind: 'dataset', id: m.dataset, coverage: m.coverage, edition: m.sourceEdition, through: m.expiresOn, status: s.status });
  }
  return rows;
}

async function main() {
  const now = new Date();
  const rows = [...await datedRows(now), ...await datasetRows(now)];
  if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
  else {
    console.log('| Kind | Id | Edition | Lapses | Status |');
    console.log('|---|---|---|---|---|');
    for (const r of rows) console.log(`| ${r.kind}${r.coverage ? ` (${r.coverage})` : ''} | ${r.id} | ${r.edition || ''} | ${r.through || ''} | ${r.status} |`);
  }
  const expired = rows.filter((r) => r.status === 'expired');
  if (process.argv.includes('--check') && expired.length) {
    console.error(`report-freshness: ${expired.length} expired: ${expired.map((r) => r.id).join(', ')}`);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('report-freshness.mjs')) main();
