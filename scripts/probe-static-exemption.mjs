#!/usr/bin/env node
// spec-v1193: the tile excused by prose that was there before the field was dropped.
//
// `test/lib/asking-language.js` is matched against the WHOLE reading, and its own
// rule 2 says so: "a tile that says the words and then answers anyway is
// skipped". What that rule does not say is where the words come from. A tile
// carries standing explanatory notes, an option label read back, a formula
// written out -- text that is the same whatever was entered -- and any of it can
// contain a phrase from the vocabulary.
//
// spec-v1192 walked into one. `hiv-pep-occupational` was printed as GUARDED for a
// missing source status, on the strength of its own option label:
//
//   "source unknown status, or the source cannot be identified"
//
// `cannot be` is in ASKING for the range refusals ("age cannot be negative"), and
// it matched a sentence that is not a refusal at all. The tile was answering, and
// three sweeps had been reading it as one that asked.
//
// The discriminator is not the phrase. Trying to fix this by tightening `cannot
// be` fails on the evidence: nine tiles refuse an empty form with "the low-risk
// reading cannot be given yet", so the phrase earns its place, and the verbs run
// to a seventy-row tail that no allow-list survives.
//
// The discriminator is MOVEMENT. Drop one field from the worked example and
// compare each string in the reading against the same reading with nothing
// dropped. A string that is identical in both cannot be a statement about the
// field that was dropped -- it was written before anyone left anything out. Only
// the text that CHANGED can be asking or disclosing about this gap.
//
// A row here is a suspect, not a defect: a tile can be answering correctly and
// still be exempted for the wrong reason. But an exemption granted by static
// prose is an exemption granted for nothing, and spec-v1056 is the record of what
// that costs -- "a tile exempted for nothing is a tile the gate is not
// protecting".
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-static-exemption.mjs
//   node scripts/probe-static-exemption.mjs --tile reference-change-value
//   node scripts/probe-static-exemption.mjs --all     (include rows whose verdict did not move)

import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { META } from '../lib/meta.js';
import { ASKING, DISCLOSING } from '../test/lib/asking-language.js';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? (process.argv[i + 1] || true) : null;
};
const only = arg('--tile');
const showAll = !!arg('--all');

// The reading as a LIST of strings rather than one joined blob, so a string can
// be compared with the same string in the undropped reading. Same top-level
// `note` exclusion as the sibling probes.
function strings(v, out = [], top = true) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out, false));
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (top && k === 'note') continue;
      strings(x, out, false);
    }
  }
  return out;
}

function verdictKey(r) {
  if (!r || typeof r !== 'object') return null;
  const parts = [];
  for (const k of ['bandLabel', 'band', 'stage', 'severity', 'grade', 'risk', 'category', 'class']) {
    if (typeof r[k] === 'string' && r[k]) parts.push(`${k}=${r[k]}`);
  }
  return parts.length ? parts.join(' | ').replace(/[\d.]+/g, '') : null;
}

const rows = [];
let examined = 0;
let tilesRead = 0;

for (const tool of allCalculators()) {
  if (only && only !== true && tool.id !== only) continue;
  const ex = META[tool.id]?.example?.fields;
  if (!ex) continue;
  const full = computeCalculator({ id: tool.id, inputs: { ...ex } });
  if (full?.valid !== true) continue;
  tilesRead += 1;
  const before = new Set(strings(full.result));
  const fullVerdict = verdictKey(full.result);

  for (const f of tool.fields || []) {
    // Numbers and enums, for the reason spec-v1102 gives: an unticked checkbox
    // is a real "no", so a missing boolean is an answer rather than a gap.
    if (f.kind !== 'number' && f.kind !== 'enum') continue;
    if (ex[f.dom] === undefined || String(ex[f.dom]).trim() === '') continue;

    const partial = { ...ex };
    delete partial[f.dom];
    const got = computeCalculator({ id: tool.id, inputs: partial });
    // A refusal needs no exemption; this is about tiles that ANSWERED.
    if (got?.valid !== true) continue;

    const all = strings(got.result);
    const said = all.join(' ');
    const grantedBy = said.match(ASKING) || said.match(DISCLOSING);
    if (!grantedBy) continue;
    examined += 1;

    const moved = all.filter((s) => !before.has(s)).join(' ');
    if (ASKING.test(moved) || DISCLOSING.test(moved)) continue;

    const verdictMoved = !!(fullVerdict && verdictKey(got.result) && verdictKey(got.result) !== fullVerdict);
    if (!verdictMoved && !showAll) continue;

    rows.push({
      id: tool.id,
      dom: f.dom,
      label: String(f.label || '').slice(0, 40),
      phrase: grantedBy[0],
      context: (said.match(new RegExp(`.{0,55}${grantedBy[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,55}`, 'i')) || [''])[0].replace(/\s+/g, ' '),
    });
  }
}

console.log('Rows the asking/disclosing vocabulary exempts on text that did NOT');
console.log('change when the field was dropped. Static prose cannot be a statement');
console.log('about a gap that did not exist when it was written.\n');
if (!showAll) console.log('(Verdict-moving rows only. Pass --all for every row.)\n');
console.log(`${rows.length} row(s) across ${new Set(rows.map((r) => r.id)).size} calculator(s).\n`);

const byTile = new Map();
for (const r of rows) {
  if (!byTile.has(r.id)) byTile.set(r.id, []);
  byTile.get(r.id).push(r);
}
for (const [id, list] of byTile) {
  console.log(`  ${id}`);
  for (const r of list) {
    console.log(`      ${r.dom} (${r.label})`);
    console.log(`          exempted by "${r.phrase}" in: ...${r.context}...`);
  }
}

console.log(`\nReach: ${tilesRead} calculators have a worked example that computes;`);
console.log(`${examined} dropped-field readings are exempted by the vocabulary at all,`);
console.log(`and ${rows.length} of those are exempted only by text that was already there.`);
