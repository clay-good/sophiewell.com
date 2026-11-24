#!/usr/bin/env node
// spec-v1777: a cap the library enforces that nothing declares.
//
// [spec-v1646](../docs/spec-v1646.md) settled where a field's range lives: a field whose label states its
// range DECLARES it, the declaration rides on the adapter descriptor as `min`/`max`, and `mcp/fields.js`
// refuses a value past it before the library is called. 609 of the catalog's 5,189 number fields declare a
// range that way, and `scripts/probe-adapter-only-bounds.mjs` holds those 609 honest: it drives just past
// each declared edge and reports a declaration the library does not enforce.
//
// This finder is that probe's mirror image. It asks the question nobody had asked: how many fields have the
// opposite gap -- a cap the library DOES enforce, with nothing declaring it? Those caps are invisible. An
// agent reading `describe_calculator` is told the input is a number and nothing more, calls the tool with a
// weight of 160 kg, and is refused by a sentence it had no way to anticipate. The browser reader is told
// nothing either until the refusal appears.
//
// Only fields whose worked example is POSITIVE are driven. A decade walk away from a negative example runs
// the wrong way (-2 x 10 is smaller, not larger), and the quantities with negative examples are the signed
// ones -- Z scores, base excess, POP-Q points -- whose edges are not a cap in the sense asked about here.
//
// Method, per field: start from the tool's own worked example, walk the value outward by decades until a
// refusal whose message is a RANGE sentence appears, then bisect to the edge. A refusal for any other reason
// (a missing pair, a conflicting pick, a date order) is not a cap and is not counted. The refusal must also
// still hold ten times further out, so a band-specific complaint cannot pass for a ceiling.
//
// A found cap is not automatically declarable, and the sections exist because of three ways it is not:
//
//   * ENVELOPE -- the cap is not the tool's own: both edges are one of the 45 `lib/bounds.js` envelopes, to
//     the decimal. A descriptor can only hold a literal, so declaring one here would copy a number that
//     moves: specs v1762-v1765 widened four envelopes past values verified in survivors and then spent
//     three specs chasing the narrower copies left behind in libraries. Freezing 300 more copies into the
//     agent descriptors would rebuild that problem on the agent side. These wait for a declaration that can
//     name an envelope instead of restating it.
//   * UNIT-TOGGLED -- the tool carries a unit select that rescales this field. The library's cap is in one
//     unit; a static `min`/`max` on the descriptor would be applied to whatever unit the caller chose, and
//     would refuse 160 lb against a cap meant for kilograms. These need the declaration to move with the
//     toggle, which the descriptor cannot express today. Where such a field IS declared, the declaration is
//     the union of its units -- wasting-classify's MUAC reads 8 to 250, which is 8 cm through 250 mm -- so
//     the section is settled before the comparison below, which would call the union a contradiction.
//   * VARIES -- the cap moved when another input moved, so it is not a property of this field alone.
//   * DISAGREES -- a range IS declared and the library enforces a different one. That is a defect either
//     way round, and it is the only section here that is not merely an omission.
//
// What is left is DECLARABLE: a stable, unit-free cap the library already enforces, which the descriptor can
// state and `probe-adapter-only-bounds` can then police. Each row prints the edge found and the sentence the
// library refused with, which is where the number in the declaration comes from.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-undeclared-cap.mjs
//   node scripts/probe-undeclared-cap.mjs --limit 50
//   TOOLS=peds-dose,maggic node scripts/probe-undeclared-cap.mjs

import { META } from '../lib/meta.js';
import { computeCalculator, describeCalculator } from '../mcp/tools.js';
import { allCalculators } from '../mcp/catalog.js';
import { BOUNDS } from '../lib/bounds.js';

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;
const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;

// The same sentence shapes probe-envelope-inside matches, which are how every library in lib/ says "that
// value is outside the range I accept".
const RANGE = /plausible range|must be (?:between|at most|at least|from|no more|a number)|between -?[\d.,]+ and -?[\d.,]+|outside -?[\d.,]+ to|no more than|beyond (?:a plausible|recorded)|^enter (?:a|an|the)[^.]*between/i;

// A select that rescales a numeric sibling. `unit` covers weightUnit/heightUnit/tempUnit; the rest are the
// spellings in use for the same thing.
const UNIT_SELECT = /unit|imperial|metric|\blbs?\b|\bkg\b|celsius|fahrenheit/i;

// Is this pair of edges one of the 45 shared envelopes, rather than a cap of the tool's own? Asked of the
// NUMBERS, not of the refusal sentence: libraries restate an envelope in their own words as often as they
// pass it through `inputFault()` ("The weight must be between 0.2 and 500 kg" is lib/bounds.js's weightKg
// to the decimal), and the sentence-matching first draft of this finder let three such copies through into
// a batch of declarations. A scale factor covers an envelope the field states in a sub-unit: height in cm
// against an envelope in m, a decimal fraction against a percent.
const SCALES = [1, 0.01, 0.1, 10, 100, 1000];
const near = (a, b) => Math.abs(a - b) <= Math.max(Math.abs(b) * 0.005, 1e-9);
function sharedEnvelope(min, max) {
  if (min === null || max === null) return null;
  for (const [key, b] of Object.entries(BOUNDS)) {
    if (!Number.isFinite(b.min) || !Number.isFinite(b.max)) continue;
    for (const s of SCALES) if (near(min, b.min * s) && near(max, b.max * s)) return `${key}${s === 1 ? '' : ` x${s}`}`;
  }
  return null;
}

const refusedByRange = (id, inputs) => {
  let res;
  try { res = computeCalculator({ id, inputs }); } catch { return false; }
  if (!res || res.valid !== false) return false;
  return RANGE.test(String(res.message || (res.result && res.result.band) || ''));
};

const messageAt = (id, inputs) => {
  try {
    const res = computeCalculator({ id, inputs });
    return String((res && res.message) || '').replace(/\s+/g, ' ').trim();
  } catch { return ''; }
};

// The outermost value this field still accepts, walking away from `from` in `dir`, or null when nothing out
// there is refused by a range sentence. `set` builds the inputs for a candidate value.
function edge(id, set, from, dir) {
  const ok = (v) => !refusedByRange(id, set(v));
  // Decade walk to bracket the edge. A floor search stops at a value small enough to be absurd for any
  // quantity in the catalog; a ceiling at one large enough to be past every one of them.
  let last = from;
  let found = null;
  for (let i = 0; i < 12; i += 1) {
    const v = dir > 0 ? last * 10 || 10 : last / 10;
    if (!Number.isFinite(v) || v === 0) break;
    if (dir > 0 ? v > 1e9 : v < 1e-6) break;
    if (ok(v)) { last = v; continue; }
    found = v;
    break;
  }
  if (found === null) return null;
  // The refusal has to hold further out as well, or it was a complaint about this value rather than a cap.
  const beyond = dir > 0 ? found * 10 : found / 10;
  if (Number.isFinite(beyond) && beyond !== 0 && !refusedByRange(id, set(beyond))) return null;
  let lo = last;
  let hi = found;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    if (mid === lo || mid === hi) break;
    if (ok(mid)) lo = mid; else hi = mid;
    if (Math.abs(hi - lo) <= Math.abs(lo) * 1e-9) break;
  }
  return { accepted: lo, refused: hi };
}

const round = (v) => {
  const p = Number(v.toPrecision(10));
  // The caps in lib/ are written as round numbers; report the edge at the precision that shows which.
  for (const d of [0, 1, 2, 3]) {
    const r = Number(p.toFixed(d));
    if (Math.abs(r - p) <= Math.abs(p) * 1e-6) return r;
  }
  return p;
};

const byId = new Map(allCalculators().map((t) => [t.id, t]));
const sections = { DECLARABLE: [], ENVELOPE: [], 'UNIT-TOGGLED': [], VARIES: [], DISAGREES: [] };
let tools = 0;
let fields = 0;
let capped = 0;

for (const [id, meta] of Object.entries(META)) {
  if (tools >= LIMIT) break;
  if (ONLY && !ONLY.has(id)) continue;
  const example = meta && meta.example && meta.example.fields;
  if (!example) continue;
  const tool = byId.get(id);
  if (!tool) continue;
  let props;
  try { props = describeCalculator({ id }).inputSchema.properties; } catch { continue; }
  if (!props) continue;
  const base = computeCalculator({ id, inputs: example });
  if (!base || base.valid !== true) continue;
  tools += 1;

  const descriptors = new Map((tool.fields || []).map((f) => [f.dom, f]));
  const unitSelect = (tool.fields || []).find((f) => f.kind === 'enum' && UNIT_SELECT.test(`${f.arg || ''} ${f.label || ''}`));

  for (const [dom, p] of Object.entries(props)) {
    if (p.type !== 'number' || Array.isArray(p.enum)) continue;
    if (!Object.prototype.hasOwnProperty.call(example, dom)) continue;
    const ex = Number(example[dom]);
    if (!Number.isFinite(ex) || ex <= 0) continue;
    const f = descriptors.get(dom) || {};
    if (Array.isArray(f.values)) continue; // a scored scale; its range is the option list
    fields += 1;
    const set = (v) => ({ ...example, [dom]: String(v) });
    const hi = edge(id, set, ex, 1);
    const lo = edge(id, set, ex, -1);
    if (!hi && !lo) continue;
    capped += 1;

    const declaredMax = Number.isFinite(p.maximum) ? p.maximum : null;
    // A declared minimum of 0 on a positive quantity is a non-negativity rule, not a claim about where the
    // quantity starts. Reading it as a floor would call "declared 0, enforced 0.21" a contradiction, when
    // what it is is an undeclared floor.
    const declaredMin = Number.isFinite(p.minimum) && p.minimum !== 0 ? p.minimum : null;
    const foundMax = hi ? round(hi.accepted) : null;
    const foundMin = lo ? round(lo.accepted) : null;
    // Compare the rounded edges: the bisection stops a nanometre short of the cap, and 0.9999999993 against
    // a declared 1 is this method's own noise, not a disagreement.
    const off = (declared, found) => declared !== null && found !== null
      && Math.abs(declared - found) > Math.max(Math.abs(found) * 0.01, 1e-9);

    const detail = `${hi ? `max~${foundMax}` : ''}${hi && lo ? ' ' : ''}${lo ? `min~${foundMin}` : ''}`;
    const said = messageAt(id, set(hi ? hi.refused : lo.refused)).slice(0, 96);
    const row = `${id}\t${dom}\t${f.arg || ''}\t${detail}\tdeclared=[${declaredMin ?? (p.minimum === 0 ? 0 : '-')}, ${declaredMax ?? '-'}]\t${said}`;

    const contradicted = off(declaredMax, foundMax) || off(declaredMin, foundMin);
    // Already declared on every side that exists, and in agreement: nothing to report.
    if (!contradicted && (!hi || declaredMax !== null) && (!lo || declaredMin !== null)) continue;

    // A rescaled field is settled before anything else is asked of it. Its declaration is deliberately the
    // UNION of the units it accepts -- wasting-classify declares MUAC as 8 to 250, which is 8 cm through
    // 250 mm -- so comparing it to a cap measured in one unit reads three honest declarations as wrong.
    if (unitSelect) {
      sections['UNIT-TOGGLED'].push(`${row}\t[rescaled by ${unitSelect.dom}]`);
      continue;
    }

    // Does the cap belong to this field alone? Move another input and look again. This runs before every
    // other verdict: a cap that is really a budget shared with a sibling (DHI's "Yes" and "Sometimes"
    // answers must together total 25) is neither declarable nor a contradiction, and reading it as one
    // would print a defect where the tool is right.
    const other = Object.entries(props).find(([k, q]) => k !== dom && q.type === 'number'
      && !Array.isArray(q.enum) && Number.isFinite(Number(example[k])) && Number(example[k]) > 0);
    let varies = false;
    if (other) {
      // A counted quantity has to stay a whole number or the shifted configuration is simply refused, and
      // the probe would then learn nothing about whether the cap moved. DHI's two answer counts share a
      // budget of 25 and were read as two contradicted declarations until the shift stayed integral.
      const ov = Number(example[other[0]]);
      const shift = Number.isInteger(ov) ? Math.max(Math.round(ov * 1.25), ov + 1) : ov * 1.25;
      const shifted = { ...example, [other[0]]: String(shift) };
      if (computeCalculator({ id, inputs: shifted }).valid === true) {
        const set2 = (v) => ({ ...shifted, [dom]: String(v) });
        const hi2 = hi ? edge(id, set2, Number(shifted[dom]), 1) : null;
        const lo2 = lo ? edge(id, set2, Number(shifted[dom]), -1) : null;
        const moved = (a, b) => (!a) !== (!b)
          || (a && b && Math.abs(a.accepted - b.accepted) > Math.max(Math.abs(a.accepted) * 0.01, 1e-9));
        varies = moved(hi, hi2) || moved(lo, lo2);
      }
    }
    if (varies) { sections.VARIES.push(row); continue; }
    if (contradicted) { sections.DISAGREES.push(row); continue; }
    const shared = sharedEnvelope(foundMin, foundMax);
    if (shared) { sections.ENVELOPE.push(`${row}\t[= BOUNDS.${shared}]`); continue; }
    sections.DECLARABLE.push(row);
  }
}

for (const [name, rows] of Object.entries(sections)) {
  if (!rows.length) continue;
  console.log(`\n== ${name} (${rows.length})`);
  for (const r of rows.sort()) console.log(r);
}

console.error(`\n${sections.DECLARABLE.length} field(s) enforce a stable, unit-free cap that nothing declares; `
  + `${sections.DISAGREES.length} declare one the library does not enforce.\n`
  + `Reach: ${tools} tool(s) with a computable worked example, ${fields} free numeric field(s) driven, `
  + `${capped} of them enforce a cap at all; ${sections.ENVELOPE.length} are refused by the shared envelope `
  + `rather than a cap of their own, ${sections['UNIT-TOGGLED'].length} cannot take a static `
  + `declaration (a unit select rescales them) and ${sections.VARIES.length} have a cap that moves with another input.`);
