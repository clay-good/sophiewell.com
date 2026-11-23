#!/usr/bin/env node
// spec-v1770: the "Fetched federal datasets" table in docs/data-sources.md, written from the manifests.
//
// The table's last two columns -- "Edition today" and "Size" -- are facts about bytes the weekly refresh
// rewrites. They were typed by hand, so they aged: on 2026-11-23 ten of the sixteen rows were wrong, one
// of them by a whole fee-schedule quarter (the doc said RVU26D of 19,453 codes; the data was RVU27A of
// 19,698). A doc that states a number no gate reads is a doc that will state last month's number.
//
// So every number and every edition here is derived: the edition is the dataset's own `sourceEdition`,
// and each size counts the records the manifest counts, plus the rows of an ancillary file where the
// table quotes a second figure. The prose in the "Source" column stays hand-written -- it says what the
// dataset IS, which no manifest knows.
//
//   node scripts/build-data-sources-doc.mjs           # rewrite the two columns
//   node scripts/build-data-sources-doc.mjs --check    # fail if they are stale (the lint chain)

import { readFileSync, writeFileSync } from 'node:fs';

const DOC = 'docs/data-sources.md';
const HEADING = '## Fetched federal datasets';

const n = (x) => x.toLocaleString('en-US');
const rows = (file) => {
  const j = JSON.parse(readFileSync(`data/${file}`, 'utf8'));
  return Array.isArray(j) ? j.length : Object.keys(j).length;
};

// One entry per row of the table, keyed by its folder. `size` is the whole cell; the manifest is passed in.
const SIZE = {
  mpfs: (m) => `${n(m.recordCount)} codes, ${n(rows('mpfs/gpci.json'))} localities`,
  drg: (m) => `${n(m.recordCount)} MS-DRGs`,
  mue: (m) => `${n(m.recordCount)} codes`,
  nadac: (m) => `${n(m.recordCount)} NDCs`,
  asp: (m) => `${n(m.recordCount)} codes`,
  'asp-ndc': (m) => `${n(m.recordCount)} NDCs`,
  'orange-book': (m) => `${n(m.recordCount)} products`,
  'purple-book': (m) => `${n(m.recordCount)} products`,
  'pas-profiles': (m) => `${n(m.recordCount)} definitions`,
  uspstf: (m) => `${n(m.recordCount)} recommendations`,
  'poverty-guidelines': (m) => `${n(m.recordCount)} year-region rows`,
  'mfp-negotiated-prices': (m) => {
    const src = readFileSync('data/mfp-negotiated-prices/drugs.js', 'utf8');
    const file = JSON.parse(src.match(/MFP_FILE = (\{[\s\S]*\});?\s*$/)[1]);
    return `${n(m.recordCount)} NDC rows, ${n(file.drugs.length)} drugs`;
  },
  'aca-ful': (m) => `${n(m.recordCount)} NDCs, ${n(rows('aca-ful/groups.json'))} product groups`,
  'fda-ddi-examples': (m) => `${n(m.recordCount)} drugs`,
  cpic: (m) => `${n(m.recordCount)} rows`,
  'mcd-articles': (m) => `${n(m.recordCount)} articles`,
};

// The edition cell is the dataset's own `sourceEdition`. MS-DRG weights are the one row with two: next
// year's table ships beside this year's until it takes effect, and the doc names both while they differ.
// Three rows name WHICH date their edition is, because the publisher does: the words are kept and only
// the date comes from the manifest.
const EDITION = {
  'fda-ddi-examples': (m) => `content current as of ${m.sourceEdition}`,
  cpic: (m) => `change log of ${m.sourceEdition}`,
  'mfp-negotiated-prices': (m) => `file of ${m.sourceEdition}`,
  drg: (m) => {
    const up = JSON.parse(readFileSync('data/drg/upcoming.json', 'utf8')).edition;
    return up && up !== m.sourceEdition ? `${m.sourceEdition}, ${up} upcoming` : m.sourceEdition;
  },
};

const check = process.argv.includes('--check');
const text = readFileSync(DOC, 'utf8');
const lines = text.split('\n');
const start = lines.findIndex((l) => l.trim() === HEADING);
if (start < 0) { console.error(`check-data-sources-doc: "${HEADING}" is gone from ${DOC}; this writer no longer knows where the table is.`); process.exit(1); }
const end = lines.findIndex((l, i) => i > start && /^## /.test(l));

const seen = new Set();
let changed = 0;
const stale = [];
for (let i = start; i < (end < 0 ? lines.length : end); i += 1) {
  const m = /^\| `data\/([^/`]+)\/` \| (.*) \| (.*) \| (.*) \|$/.exec(lines[i]);
  if (!m) continue;
  const [, folder, source, edition, size] = m;
  if (!SIZE[folder]) { console.error(`check-data-sources-doc: data/${folder}/ is in the table and not in this writer. Add its size (and edition, if it is not the manifest's own).`); process.exit(1); }
  seen.add(folder);
  const manifest = JSON.parse(readFileSync(`data/${folder}/manifest.json`, 'utf8'));
  const wantEdition = (EDITION[folder] || ((x) => x.sourceEdition))(manifest);
  const wantSize = SIZE[folder](manifest);
  if (edition === wantEdition && size === wantSize) continue;
  changed += 1;
  stale.push(`  data/${folder}/: edition "${edition}" -> "${wantEdition}"; size "${size}" -> "${wantSize}"`);
  lines[i] = `| \`data/${folder}/\` | ${source} | ${wantEdition} | ${wantSize} |`;
}
const missing = Object.keys(SIZE).filter((f) => !seen.has(f));
if (missing.length) { console.error(`check-data-sources-doc: this writer knows ${missing.join(', ')}, which the table no longer lists. Drop them here, or put the row back.`); process.exit(1); }

if (check) {
  if (changed) {
    console.error(`check-data-sources-doc: ${changed} row(s) in ${DOC} do not match the data. Rewrite with \`node scripts/build-data-sources-doc.mjs\`.`);
    console.error(stale.join('\n'));
    process.exit(1);
  }
  console.log(`check-data-sources-doc: clean (${seen.size} fetched datasets; every edition and count matches its manifest).`);
} else {
  if (changed) writeFileSync(DOC, lines.join('\n'));
  console.log(`build-data-sources-doc: ${changed ? `rewrote ${changed} row(s)` : 'no change'} (${seen.size} fetched datasets).`);
}
