#!/usr/bin/env node
// spec-v1101: the tile that guards one input and not its sibling.
//
// Three times in one programme a calculator had already been fixed for a missing
// input and left silent on the identical gap beside it:
//
//   scorad     (spec-v1093) refused without the extent since spec-v1016, and read
//              a blank itch score as a symptom the patient denied.
//   dka-hhs    (spec-v1099) refused on one exit for want of a ketone measurement,
//              and asserted "with minimal ketosis" on the other.
//   abi        (spec-v1100) carried a caveat for a missing ANKLE pressure since
//              spec-v1067, and divided silently by one of two brachials.
//
// Each time the reasoning was already written out in the code, for the half that
// was guarded. Nobody walked the other half.
//
// That asymmetry is a SMELL, and it is cheap to detect: inside ONE tile, drop
// each field in turn. If dropping some fields makes the tile ask or disclose,
// the author knew this class of gap mattered here -- so the fields that stay
// silent while the verdict moves are the ones they did not get to.
//
// This is a PRIORITISER, not a new defect list. Every row it prints also appears
// in probe-omitted-field-decides.mjs; what it adds is the evidence that this
// particular tile already agrees the question is worth asking.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-half-guarded.mjs
//   node scripts/probe-half-guarded.mjs --tile abi

import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { META } from '../lib/meta.js';
import { ASKING, DISCLOSING } from '../test/lib/asking-language.js';

const only = (() => {
  const i = process.argv.indexOf('--tile');
  return i > -1 ? process.argv[i + 1] : null;
})();

// Same rule as the sibling probes: a disclosure has to be about THESE inputs,
// not the tile's static explanatory prose.
function texts(v, out = [], top = true) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out, false));
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (top && k === 'note') continue;
      texts(x, out, false);
    }
  }
  return out;
}

// spec-v1239: `band` is the SENTENCE, not the verdict, and including it made
// this probe compare prose.
//
// `nichd-fhr` reads "Category II" with the late decelerations entered and
// "Category II" without them -- the tracing has minimal variability, so neither
// Category I nor Category III is reachable and the decelerations cannot change
// it. What differs is the REASON list: "Not Category I because variability is
// minimal, not moderate; late decelerations are recurrent" loses its second
// clause. The verdict did not move; the explanation got shorter, and the probe
// called that a tile answering in silence from a field that decides the answer.
//
// So the classification fields come first, and `band` is the fallback only when
// a tile has none of them -- which many do, and dropping it outright would blind
// the probe on those (the reach line below counts them).
// spec-v1239: and the list of classification fields was short. Measured across
// the catalog, a tile's structured verdict also arrives as `tier` (87 tiles),
// `grade` (76), `stage` (60), `category` (50), `severity` (28), `group` (28),
// `risk` (27), `verdict` (18), `classification` (17), `gradeLabel` (16) and
// `bandKey`. `truelove-witts` returns `bandKey: 'severe'` unchanged whichever
// systemic criterion is dropped -- the grade is severe either way, because the
// others are met -- and was flagged for a criteria LIST that got shorter.
//
// `type` and `basis` are deliberately out: they name what KIND of calculation
// ran, not what it concluded.
const VERDICT_KEYS = ['bandLabel', 'bandKey', 'stage', 'severity', 'grade', 'gradeLabel',
  'risk', 'category', 'class', 'classification', 'tier', 'group', 'verdict'];
function verdictKey(r) {
  if (!r || typeof r !== 'object') return null;
  const parts = [];
  for (const k of VERDICT_KEYS) {
    if (typeof r[k] === 'string' && r[k]) parts.push(`${k}=${r[k]}`);
  }
  if (!parts.length && typeof r.band === 'string' && r.band) parts.push(`band=${r.band}`);
  return parts.length ? parts.join(' | ').replace(/[\d.]+/g, '') : null;
}

const rows = [];
for (const tool of allCalculators()) {
  if (only && tool.id !== only) continue;
  const ex = META[tool.id]?.example?.fields;
  if (!ex) continue;
  const full = computeCalculator({ id: tool.id, inputs: { ...ex } });
  if (full?.valid !== true) continue;
  const fullVerdict = verdictKey(full.result);

  const guarded = [];
  const silent = [];

  for (const f of tool.fields || []) {
    // spec-v1102: numbers AND enums. Booleans are excluded on purpose -- rule 4
    // of the programme says an unticked checkbox is a real "no", so a missing
    // boolean is an answer rather than a gap. An enum is different: the browser
    // always sends one because a select always has a value, but an API caller
    // omits keys by default, which is the surface split spec-v1073 is about.
    if (f.kind !== 'number' && f.kind !== 'enum') continue;
    if (ex[f.dom] === undefined || String(ex[f.dom]).trim() === '') continue;

    const partial = { ...ex };
    delete partial[f.dom];
    const got = computeCalculator({ id: tool.id, inputs: partial });

    // A refusal is the strongest form of guarding.
    if (got?.valid !== true) { guarded.push({ dom: f.dom, how: 'refuses' }); continue; }

    const said = texts(got.result).join(' ');
    if (ASKING.test(said)) { guarded.push({ dom: f.dom, how: 'asks' }); continue; }
    if (DISCLOSING.test(said)) { guarded.push({ dom: f.dom, how: 'discloses' }); continue; }

    // Silent. Only interesting if the answer actually moved.
    const gotVerdict = verdictKey(got.result);
    if (fullVerdict && gotVerdict && gotVerdict !== fullVerdict) {
      silent.push({ dom: f.dom, label: String(f.label || '').slice(0, 44) });
    }
  }

  if (guarded.length && silent.length) {
    rows.push({ id: tool.id, guarded, silent });
  }
}

console.log('Tiles that guard at least one missing input and stay silent on another,');
console.log('where the silent one moves the answer. The tile already agrees the');
console.log('question matters; these are the fields it does not ask about.\n');
console.log(`${rows.length} calculator(s).\n`);
for (const r of rows) {
  console.log(`  ${r.id}`);
  console.log(`      guards : ${r.guarded.map((g) => `${g.dom} (${g.how})`).join(', ')}`);
  console.log(`      silent : ${r.silent.map((s) => `${s.dom}: ${s.label}`).join('; ')}`);
}
