#!/usr/bin/env node
// spec-v1217: an input made impossible, and an answer that did not move.
//
// The defect this exists for is [spec-v1214](../docs/spec-v1214.md)'s: a reader
// written as
//
//   if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
//
// discards a value off the scale and substitutes a constant. Four scalp regions
// entered as 150% terminal hair loss scored "Severity of Alopecia Tool 0 of 100
// -- S0 (no loss)". The impossible input did not merely score, it scored as the
// most normal score the instrument has -- and the shape appears in more than
// thirty lib modules.
//
// The oracle is deliberately not "is the answer benign", which needs judgment.
// It is **did the answer move at all**. Take a tile's own worked example, make
// one numeric field impossible, and compare the result to the unperturbed one. If
// they are byte-identical, that field's value was thrown away in silence: the
// tile neither used it nor refused it.
//
// This is not the envelope probe. `probe-envelope-unbounded` asks whether a tile
// ANSWERS from a value an order of magnitude past a ceiling `lib/bounds.js`
// declares, and it can only ask it of fields that have a `BOUNDS` entry. This one
// needs no envelope: it asks whether the input mattered, which is a question you
// can put to any numeric field.
//
// A row is a suspect, and there are three innocent explanations to check before
// calling one a defect:
//
//   * the field is a `values:` enum, so the value is refused upstream by the
//     adapter and never reaches the library. Those are skipped outright below.
//   * the field is genuinely not used on this branch -- a tile that reports a
//     different sub-score when a flag is off, say.
//   * the perturbation is not actually impossible for that quantity. A "count of
//     admissions" of 1e6 is absurd; a platelet count of 1e6 per uL is not
//     (spec-v1157's trap: an envelope is a claim about a quantity IN A UNIT).
//
// Usage: node scripts/probe-impossible-changes-nothing.mjs [--limit N]
import { META } from '../lib/meta.js';
import { computeCalculator, describeCalculator } from '../mcp/tools.js';

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

// Big enough to be off every clinical scale, small enough to stay finite through
// a multiplication or an exponent.
const IMPOSSIBLE = ['999999', '-999999'];

const stable = (r) => JSON.stringify(r && r.result !== undefined ? r.result : r);

let checked = 0;
let fieldsTried = 0;
const rows = [];
for (const [id, meta] of Object.entries(META)) {
  if (checked >= LIMIT) break;
  const example = meta && meta.example && meta.example.fields;
  if (!example) continue;
  let props;
  try { props = describeCalculator({ id }).inputSchema.properties; } catch { props = null; }
  if (!props) continue;
  const base = computeCalculator({ id, inputs: example });
  if (!base || base.valid !== true) continue;
  checked += 1;
  const baseline = stable(base);
  for (const [dom, p] of Object.entries(props)) {
    // A picklist refuses the value before the library sees it; that is the
    // adapter doing its job, not the tile discarding an input.
    if (p.type !== 'number' || Array.isArray(p.enum)) continue;
    if (!Object.prototype.hasOwnProperty.call(example, dom)) continue;
    const f = { dom, label: p.description || dom };
    fieldsTried += 1;
    // BOTH directions, and a row needs both to change nothing.
    //
    // The first version of this flagged a field when EITHER direction left the
    // answer alone, and most of what it printed was a threshold criterion already
    // on the far side of its cutoff: `truelove-witts` scores >= 6 bloody stools
    // as severe, so an example of 8 pushed to 999999 is still severe and the
    // score is right not to move. Pushing the other way crosses the threshold and
    // does move it. A field whose value was genuinely discarded moves for
    // neither.
    const outcomes = IMPOSSIBLE.map((bad) => {
      const r = computeCalculator({ id, inputs: { ...example, [f.dom]: bad } });
      return { bad, refused: !r || r.valid !== true, same: r && r.valid === true && stable(r) === baseline };
    });
    // A refusal anywhere is the tile noticing, which is the correct outcome.
    if (outcomes.some((o) => o.refused)) continue;
    if (!outcomes.every((o) => o.same)) continue;
    // ... and again from a second baseline, because an example can make a field
    // inert all by itself. `apap-24h-max` totals dose x doses-per-day per source,
    // and its example enters source 3 as 0 doses/day -- so the source-3 DOSE is
    // multiplied by zero and no value of it changes anything. The tile is right;
    // the example neutralised the field. Bumping every other numeric field the
    // example set to 0 up to 1 breaks that, and a genuinely discarded field is
    // still discarded afterwards.
    const unzeroed = { ...example };
    let bumped = false;
    for (const [k, v] of Object.entries(example)) {
      if (k === f.dom) continue;
      if (props[k] && props[k].type === 'number' && !Array.isArray(props[k].enum) && Number(v) === 0) {
        unzeroed[k] = '1';
        bumped = true;
      }
    }
    if (bumped) {
      const alt = computeCalculator({ id, inputs: unzeroed });
      if (alt && alt.valid === true) {
        const altBase = stable(alt);
        const altOut = IMPOSSIBLE.map((bad) => computeCalculator({ id, inputs: { ...unzeroed, [f.dom]: bad } }));
        if (altOut.some((r) => !r || r.valid !== true)) continue;
        if (!altOut.every((r) => stable(r) === altBase)) continue;
      }
    }
    rows.push({ id, dom: f.dom, label: f.label || f.arg, bad: IMPOSSIBLE.join(' and ') });
  }
}

rows.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
console.log(`${rows.length} fields whose impossible value changed nothing`
  + ` (reach: ${checked} tiles with a computable worked example, ${fieldsTried} free numeric fields perturbed)`);
for (const r of rows) console.log(`  ${r.id}  ${r.dom} (${r.label}) = ${r.bad}`);
