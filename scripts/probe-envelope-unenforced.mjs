#!/usr/bin/env node
// spec-v1799: a field that IS one of lib/bounds.js's quantities, answered outside that quantity's envelope.
//
// `lib/bounds.js` is a promise: each envelope is a range outside which a value "usually means the unit is
// wrong" or is "beyond recorded extremes", with a note saying so and a source behind it. 569 declarations
// name an envelope because the library behind them applies it. This asks about the fields that do not.
//
// [spec-v1796](../docs/spec-v1796.md) found three of them sideways. `peds-transfusion-volume` reads a
// weight in kg and guards it 0 to 500 with a `num()` literal of its own, where `BOUNDS.weightKg` is 0.2 to
// 500 -- so the tool answers a weight of 50 grams. `iss-rts` reads a systolic pressure and guards 0 to 500
// where `BOUNDS.sbp` starts at 20. Those were noticed only because their declarations were being rewritten.
//
// Method: for every number field whose own words and unit name an envelope -- the shared matcher in
// `scripts/lib/quantity-name.mjs`, whose four hard-won rules are recorded there -- drive the worked example
// to half the envelope's floor and twice its ceiling. A row is a value the tool ANSWERS. Two exclusions are
// not defects and are counted rather than printed:
//
//   * CEILING_ONLY -- `lib/bounds.js` deliberately does not refuse below these floors, because the low end
//     has been survived: a hemoglobin of 1.4 g/dL and an albumin under 0.1 are real (spec-v1762). A tool
//     answering below such a floor is doing what the envelope says.
//   * the field DECLARES its own range, which spec-v1781 settled: a stated range is a validated population,
//     not a survivable value turned away, and `probe-declared-cap-configs` already holds it honest.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-envelope-unenforced.mjs
//   node scripts/probe-envelope-unenforced.mjs --all     # the fields that DO keep their envelope
import { BOUNDS, CEILING_ONLY } from '../lib/bounds.js';
import { META } from '../lib/meta.js';
import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { fieldRange } from '../mcp/fields.js';
import { envelopeFor } from './lib/quantity-name.mjs';

const ALL = process.argv.includes('--all');
const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;

// spec-v1799: a judged ledger, so this prints nothing until something new appears.
const JUDGED = {};
const judgedSeen = new Set();

const rows = [];
const kept = [];
let matched = 0;
let declared = 0;
let ceilingOnly = 0;

for (const t of allCalculators()) {
  if (ONLY && !ONLY.has(t.id)) continue;
  const ex = META[t.id] && META[t.id].example && META[t.id].example.fields;
  if (!ex) continue;
  const base = computeCalculator({ id: t.id, inputs: ex });
  if (!base || base.valid !== true) continue;
  for (const f of t.fields || []) {
    if (f.kind !== 'number' || Array.isArray(f.values)) continue;
    if (!Object.prototype.hasOwnProperty.call(ex, f.dom)) continue;
    const key = envelopeFor(f);
    if (!key) continue;
    const b = BOUNDS[key];
    if (!Number.isFinite(b.min) || !Number.isFinite(b.max)) continue;
    matched += 1;
    // A field that states its own range has already answered this question, one way or the other.
    const r = fieldRange(f);
    if (r.min !== null || r.max !== null) { declared += 1; continue; }
    const sides = [['above', b.max * 2]];
    if (CEILING_ONLY.has(key)) ceilingOnly += 1; else sides.push(['below', b.min / 2]);
    let answered = false;
    for (const [side, v] of sides) {
      if (!Number.isFinite(v) || v === 0) continue;
      let res;
      try { res = computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: String(v) } }); } catch { continue; }
      if (!res || res.valid === false) continue;
      answered = true;
      const kk = `${t.id}:${f.dom}:${side}`;
      if (JUDGED[kk]) { judgedSeen.add(kk); if (ALL) console.log(`JUDGED\t${kk}\t${JUDGED[kk]}`); continue; }
      const said = String(res.bandLabel || res.band || res.verdict || '').replace(/\s+/g, ' ').slice(0, 76);
      rows.push(`${t.id}\t${f.dom}\t${key} ${side} ${side === 'above' ? b.max : b.min}\tanswered at ${v}\t${said}`);
    }
    if (!answered) kept.push(`${t.id}\t${f.dom}\t${key}`);
  }
}

if (ALL) for (const k of kept.sort()) console.log(`OK\t${k}`);
for (const r of rows.sort()) console.log(r);
for (const k of Object.keys(JUDGED)) {
  if (!judgedSeen.has(k)) console.log(`STALE-LEDGER\t${k}\t(judged here, but the finder no longer reaches it)`);
}
console.error(`\n${rows.length} value(s) outside a field's own lib/bounds.js envelope are answered rather than refused; `
  + `${judgedSeen.size} judged.\n`
  + `Reach: ${matched} field(s) whose words and unit name an envelope, of which ${declared} state a range of `
  + `their own (spec-v1781: a stated range is a validated population) and ${kept.length} keep the envelope `
  + `without stating it; ${ceilingOnly} are CEILING_ONLY, whose floor lib/bounds.js does not refuse. `
  + `--all lists the ones that keep it.`);
