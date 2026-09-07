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

function verdictKey(r) {
  if (!r || typeof r !== 'object') return null;
  const parts = [];
  for (const k of ['bandLabel', 'band', 'stage', 'severity', 'grade', 'risk', 'category', 'class']) {
    if (typeof r[k] === 'string' && r[k]) parts.push(`${k}=${r[k]}`);
  }
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
    if (f.kind !== 'number') continue;
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
