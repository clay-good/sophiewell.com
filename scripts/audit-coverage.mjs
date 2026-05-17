#!/usr/bin/env node
// spec-v11 §3.4: per-group audit-completion percentage. Reads
// `docs/audits/v11/*.md`, joins each to the UTILITIES entry in app.js
// (parsed as a literal), and prints a per-group rollup plus the
// overall percentage. Wired into CI as an informational check (not a
// gate; the gate is the per-tile audit log existing).
//
// Pure Node, no dependencies.

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const AUDIT_DIR = join(ROOT, 'docs', 'audits', 'v11');

// spec-v11 §4.1: visible group labels. Kept in sync with app.js.
const GROUP_LABELS = {
  A: 'Billing & Coding',
  C: 'Insurance & Patient Literacy',
  E: 'Clinical Math & Conversions',
  F: 'Medication & Infusion',
  G: 'Clinical Scoring & Risk',
  H: 'Workflow & Documentation',
  I: 'EMS & Field Medicine',
  J: 'Immunization & Infectious Disease',
  K: 'Reference Ranges',
  L: 'Insurance Glossary',
  M: 'State & Coverage Reference',
  N: 'Pediatrics & Neonatal',
  O: 'High-Alert & Safety',
};

async function loadUtilities() {
  const src = await readFile(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!arr) throw new Error('audit-coverage: could not find UTILITIES in app.js');
  const tiles = [];
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id:\s*'([^']+)'/);
    const group = line.match(/group:\s*'([^']+)'/);
    if (id && group) tiles.push({ id: id[1], group: group[1] });
  }
  return tiles;
}

async function loadAuditLogs() {
  if (!existsSync(AUDIT_DIR)) return new Map();
  const entries = await readdir(AUDIT_DIR);
  const logs = new Map();
  for (const name of entries) {
    if (!name.endsWith('.md')) continue;
    if (name === 'README.md') continue;
    const id = name.replace(/\.md$/, '');
    const body = await readFile(join(AUDIT_DIR, name), 'utf8');
    const statusMatch = body.match(/## Status\s*[\r\n]+- ([A-Z][A-Z-]+)/);
    logs.set(id, statusMatch ? statusMatch[1].trim() : 'UNKNOWN');
  }
  return logs;
}

function isComplete(status) {
  return status === 'PASS' || status === 'PASS-WITH-FIXES';
}

async function main() {
  const tiles = await loadUtilities();
  const logs = await loadAuditLogs();
  const byGroup = new Map();
  for (const t of tiles) {
    if (!byGroup.has(t.group)) byGroup.set(t.group, { total: 0, complete: 0, fail: 0 });
    const row = byGroup.get(t.group);
    row.total += 1;
    const status = logs.get(t.id);
    if (status && isComplete(status)) row.complete += 1;
    else if (status && !isComplete(status)) row.fail += 1;
  }
  const groups = Array.from(byGroup.keys()).sort();
  let total = 0, complete = 0;
  console.log('v11 audit coverage');
  console.log('==================');
  for (const g of groups) {
    const row = byGroup.get(g);
    total += row.total;
    complete += row.complete;
    const pct = row.total ? Math.round((row.complete / row.total) * 100) : 0;
    const label = GROUP_LABELS[g] || g;
    console.log(`  ${g} ${label.padEnd(36)} ${row.complete}/${row.total} (${pct}%)`
      + (row.fail ? `  FAIL: ${row.fail}` : ''));
  }
  const overall = total ? Math.round((complete / total) * 100) : 0;
  console.log('------------------');
  console.log(`  total                                  ${complete}/${total} (${overall}%)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
