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
const JUDGED = {
  // An INFUSATE's electrolytes, not a patient's. `iv-osmolarity` adds up what is in the bag: 154 mEq/L of
  // sodium is normal saline, and the serum envelope (85 to 210) would turn away half the solutions a
  // pharmacy makes. The matcher cannot see this from the field's own words, which say only "Sodium".
  'iv-osmolarity:io-na:above': 'the sodium is the concentration IN THE BAG, not in serum; 3% saline is 513 mEq/L',
  'iv-osmolarity:io-na:below': 'the sodium is the concentration IN THE BAG; a dilute additive solution is ordinary',
  'iv-osmolarity:io-k:above': 'the potassium is the concentration IN THE BAG; a 40 mEq/L bag is routine and concentrates run higher',
  'iv-osmolarity:io-k:below': 'the potassium is the concentration IN THE BAG; a dilute additive solution is ordinary',
  // A TYPED 0 IS A READING in a trauma score. spec-v1154 settled this for GAP and MGAP: a systolic of 0 is
  // no recordable blood pressure, which is exactly what the score is for, and is kept distinct from a blank
  // at some length in both functions. The CEILING is applied; the floor would turn away the worst case.
  'gap:gap-sbp:below': 'spec-v1154: a typed 0 systolic is a real reading in a trauma score (no recordable BP), kept distinct from a blank; the ceiling IS applied',
  'mgap:mgap-sbp:below': 'spec-v1154: the same, in MGAP',
  // Two floors that are OFF ON PURPOSE, each with a spec behind it.
  // spec-v1234 kept the 25 C floor off a neonatal LOWEST temperature; the ceiling is applied in the library.
  'snappe-ii:sn-temp:below': 'spec-v1234: the floor is deliberately off a neonatal lowest temperature; the CEILING is applied',
  // The Revised Trauma Score has a respiratory-rate band for APNOEA -- a rate of 0 scores 0 points, which
  // is the reading the score exists to capture.
  'iss-rts:ir-rr:below': 'the RTS scores apnoea: a respiratory rate of 0 is a band of its own, not an implausible value',
  // A CONVERTER converts. Refusing a weight outside the envelope would stop the one tool whose whole job is
  // to say what a number in one unit is in the other, and it reads no patient and scores nothing.
  'peds-weight-conv:pw-kg:above': 'a unit converter: it states what a weight in kg is in lb and reads nothing else, so there is no patient to be implausible',
  'peds-weight-conv:pw-kg:below': 'a unit converter: the same, and converting 0.1 kg to 0.22 lb is a correct answer',
  // The one tool where the floor is the subject. BOUNDS.temperature starts at 13 C because 13.7 is the
  // lowest survived core temperature on record -- and a rewarming tool is what a reader opens for exactly
  // that case. Refusing below the record would turn away the next one.
  'hypothermia-rewarm:hyp-t:below': 'a rewarming tool is opened for the record-breaking case; BOUNDS.temperature 13 C floor is the record (13.7), not a limit on what may be entered',
};
const judgedSeen = new Set();

const rows = [];
const kept = [];
let matched = 0;
let declared = 0;
let ceilingOnly = 0;
let unitToggled = 0;
let configDependent = 0;

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
    // spec-v1800: A FIELD WHOSE UNIT COMES FROM A SIBLING SELECT cannot be compared with an envelope's
    // numbers at all. `isaric-4c-mortality` reads a urea in mmol/L or a BUN in mg/dL, picked by
    // `is4c-ureaunit` beside it, and applies BOUNDS.bun after converting -- which spec-v1748 added. Driving
    // the raw field to half the envelope's floor lands at 0.5, which in mmol/L is 1.4 mg/dL and well inside
    // it, so the tool answers and the finder called that a defect.
    const toggled = (t.fields || []).some((q) => q.kind === 'enum' && Array.isArray(q.values)
      && (String(q.arg || '').toLowerCase() === `${String(f.arg || '').toLowerCase()}unit`
        || String(q.dom || '').toLowerCase().replace(/-/g, '') === `${String(f.dom || '').toLowerCase().replace(/-/g, '')}unit`));
    if (toggled) { unitToggled += 1; continue; }
    const b = BOUNDS[key];
    if (!Number.isFinite(b.min) || !Number.isFinite(b.max)) continue;
    matched += 1;
    // A field that states its own range has already answered this question -- but PER SIDE, not for the
    // whole field. spec-v1801 declared a ceiling of 500 on `gap`'s and `mgap`'s systolic pressure, whose
    // FLOOR is deliberately not the envelope's (spec-v1154: a typed 0 is a real trauma reading). Skipping
    // the whole field on one declared edge made both judged rows go stale and hid the unexamined floor.
    const r = fieldRange(f);
    if (r.min !== null && r.max !== null) { declared += 1; continue; }
    // spec-v1800: HALVING A NEGATIVE FLOOR MOVES IT INWARD. BOUNDS.baseExcess starts at -60, and -60/2 is
    // -30, which the envelope permits -- so every signed quantity was being driven to a value it allows and
    // reported when the tool answered, which is correct behaviour. Out is `* 2` below zero and `/ 2` above.
    const out = (v, dir) => (dir > 0 ? (v > 0 ? v * 2 : v / 2) : (v > 0 ? v / 2 : v * 2));
    const sides = [];
    if (r.max === null) sides.push(['above', out(b.max, 1)]);
    if (CEILING_ONLY.has(key)) ceilingOnly += 1; else if (r.min === null) sides.push(['below', out(b.min, -1)]);
    if (!sides.length) { declared += 1; continue; }
    // spec-v1800: THE VALUE MUST BE ANSWERED IN EVERY CONFIGURATION, not just the worked example's. A unit
    // select rescales the field, so the envelope's numbers do not apply to the value as entered:
    // `calcium-phosphate-product` reads calcium in mg/dL or mmol/L through one select shared by both of its
    // fields, and 1.5 mmol/L is 6 mg/dL, an ordinary calcium. Asking of every single-factor variation
    // settles that without naming a unit -- and it settles the same way for a guard that exists on one
    // branch only, which is a different finding from "the envelope is not kept".
    const variants = [ex];
    for (const q of t.fields || []) {
      if (q.dom === f.dom) continue;
      if (q.kind === 'enum' && Array.isArray(q.values)) {
        for (const o of q.values) if (String(ex[q.dom]) !== String(o)) variants.push({ ...ex, [q.dom]: String(o) });
      } else if (q.kind === 'bool' || q.kind === 'checkbox') {
        variants.push({ ...ex, [q.dom]: String(ex[q.dom] === 'true' ? 'false' : 'true') });
      }
    }
    const live = variants.filter((c) => { const r = computeCalculator({ id: t.id, inputs: c }); return !!r && r.valid === true; });
    const answeredEverywhere = (v) => live.every((c) => {
      let r; try { r = computeCalculator({ id: t.id, inputs: { ...c, [f.dom]: String(v) } }); } catch { return false; }
      return !!r && r.valid !== false;
    });
    let answered = false;
    for (const [side, v] of sides) {
      if (!Number.isFinite(v) || v === 0) continue;
      let res;
      try { res = computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: String(v) } }); } catch { continue; }
      if (!res || res.valid === false) continue;
      if (!answeredEverywhere(v)) { configDependent += 1; continue; }
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
