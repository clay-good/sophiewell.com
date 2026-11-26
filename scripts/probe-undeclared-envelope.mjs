#!/usr/bin/env node
// spec-v1822: the envelope the LIBRARY enforces and the agent surface does not name.
//
// Three finders already ask the other three questions about an envelope declaration:
//
//   probe-borrowed-envelope    does a declaration name a quantity the field is NOT? (spec-v1796)
//   probe-envelope-unenforced  does the library answer past an envelope the field keeps? (spec-v1794)
//   probe-declared-cap-configs is a declared bound honest in EVERY configuration? (spec-v1780)
//
// The fourth was missing, and it is the one spec-v1810 found from the other side: a field whose library
// refuses outside `lib/bounds.js`'s envelope while the agent surface publishes no range at all. An agent
// then learns the range by being refused, which is the divergence spec-v1743 exists to stop.
//
// THE TEST IS THE LIBRARY'S OWN BEHAVIOUR, not a grep. For each number field whose words and unit name an
// envelope (`scripts/lib/quantity-name.mjs`, so a urine albumin is not a serum one), drive the tile an
// order of magnitude past the ceiling and a whole span below the floor. Both refused, and nothing
// declared, is a row.
//
// A field whose example is blank cannot be driven and is counted in the reach line rather than reported.
//
// A ROW IS A SUSPECT, and spec-v1822 took 81 of them and left 27, for a reason worth knowing before
// reaching for the next one: `test/unit/declared-cap-honest.test.js` requires a declared edge to be an
// edge the library ANSWERS AT, and an envelope can be enforced while its edge is unanswerable. Driving
// `penn-state-ree` past the temperature envelope is refused in the envelope's own words -- "Input above
// the plausible range for core temperature (13 to 47 C); verify the units" -- and yet AT 13 C the Penn
// State equation works out to -2227 kcal, outside the range the tool reports. The envelope is enforced;
// declaring it would promise an edge the tool cannot compute.
//
// spec-v1827 TOOK EIGHTEEN OF THOSE TWENTY-SEVEN, and the move is obvious in hindsight: an envelope has
// TWO edges, and a field whose floor is unanswerable can still publish its CEILING. `penn-state-ree`
// declares max 47 and no min; `feua` declares max 500 and no min, because at a urine creatinine of 1 its
// fractional excretion leaves the range it reports. A declaration is per SIDE.
//
// What is left is NINE, and each has no answerable, every-configuration edge on either side:
//
//   deurenberg-body-fat|db-bmi     both edges leave the body-fat range the tool reports
//   gmi|gmi-mean                   both edges leave the GMI range
//   dipss-mf|dp-age                the floor is unanswerable and the ceiling moves with another input
//   isaric-4c-mortality|is4c-urea  a urea unit select rescales the field, so no static edge holds
//   chatelut-carboplatin|chc-gfr, iv-iron-course|iic-weight, digoxin-label-dose|dg-weight,
//   otc-child-label-dose|ocd-weight, pediatric-administered-activity|paa-weight
//                                  a dose table or a weight band makes the bound branch-dependent, which
//                                  is what probe-declared-cap-configs refuses (spec-v1780)
//
// Those want the range each tool can answer across, per tool, and the last five want it per BRANCH.
//
// NOT GATED, for that reason. The gate that decides whether a declaration may be taken is
// `probe-declared-cap-configs` plus `declared-cap-honest`, and they run on every push.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-undeclared-envelope.mjs
//   node scripts/probe-undeclared-envelope.mjs --all

import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { META } from '../lib/meta.js';
import { BOUNDS } from '../lib/bounds.js';
import { envelopeFor } from './lib/quantity-name.mjs';
import { saysOutOfRange } from './lib/range-sentence.mjs';

// spec-v1822: the rows that have been read, with the reason each one is right.
const JUDGED = {};
const judgedSeen = new Set();
const ALL = process.argv.includes('--all');

const rows = [];
let driven = 0;
let blank = 0;
for (const tool of allCalculators()) {
  const ex = META[tool.id]?.example?.fields;
  for (const f of (tool.fields || [])) {
    // A field with `values` is a picklist of points, not a free measurement.
    if (f.kind !== 'number' || Array.isArray(f.values)) continue;
    if (f.bound || f.min !== undefined || f.max !== undefined) continue;
    const key = envelopeFor(f);
    if (!key) continue;
    if (!ex || ex[f.dom] === undefined || String(ex[f.dom]).trim() === '') { blank += 1; continue; }
    const b = BOUNDS[key];
    driven += 1;
    // EVERY CONFIGURATION, which is the lesson spec-v1780 wrote and this finder had to learn twice. A
    // refusal in the worked example's own configuration is not a refusal in all of them: a cap inside one
    // branch is invisible to the others, and 24 of this finder's first 70 rows were exactly that -- a
    // declaration that would have failed `probe-declared-cap-configs` the moment it was written. So each
    // row is driven with every other enum field set to each of its options in turn, and one configuration
    // that answers is enough to drop it.
    const hi = String(b.max * 10 + 1);
    const lo = String(b.min - Math.abs(b.min) - 1);
    const configs = [{ ...ex }];
    for (const e of (tool.fields || [])) {
      if (e.dom === f.dom || !Array.isArray(e.values) || e.values.length > 8) continue;
      for (const v of e.values) if (String(v) !== String(ex[e.dom])) configs.push({ ...ex, [e.dom]: v });
    }
    // AND THE REFUSAL HAS TO BE ABOUT THE INPUT. Nine of this finder's rows were a tool declining because
    // its OWN OUTPUT fell outside the range it reports -- "the Penn State resting metabolic rate works out
    // to -2227.2, which is outside the range this tool reports" -- which is not a bound on the input and
    // cannot be declared as one: `declared-cap-honest` rejects it, because the edge itself is refused.
    const aboutTheInput = (r) => r?.valid === false
      && saysOutOfRange(String(r.message || r.band || r.error || ''))
      && !/works out to/.test(String(r.message || r.band || ''));
    const refusedEverywhere = configs.every((c) => {
      const base = computeCalculator({ id: tool.id, inputs: c });
      if (base?.valid !== true) return true;                      // this configuration answers nothing
      return aboutTheInput(computeCalculator({ id: tool.id, inputs: { ...c, [f.dom]: hi } }))
        && aboutTheInput(computeCalculator({ id: tool.id, inputs: { ...c, [f.dom]: lo } }));
    });
    if (!refusedEverywhere) continue;
    rows.push({ id: tool.id, dom: f.dom, key, label: String(f.label || '').slice(0, 40) });
  }
}

const unjudged = rows.filter((r) => {
  const k = `${r.id}|${r.dom}`;
  if (!JUDGED[k]) return true;
  judgedSeen.add(k);
  if (ALL) console.log(`JUDGED\t${k}\t${JUDGED[k]}`);
  return false;
});
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
if (stale.length) {
  console.log(`STALE-LEDGER: ${stale.length} judged row(s) this run no longer reaches: ${stale.join(', ')}.`);
  console.log('A reason cannot outlive what it describes -- re-read the field and remove the row.');
}

console.log(`${unjudged.length} field(s) whose library refuses outside a lib/bounds.js envelope while the`);
console.log('agent surface publishes no range at all, so an agent learns the range by being refused.\n');
for (const r of unjudged) console.log(`  ${r.id}|${r.dom}  [${r.key}]  ${r.label}`);
console.log(`\nReach: ${driven} field(s) whose words and unit name an envelope and whose example can be driven;`);
console.log(`${blank} more name one and are blank in the worked example, so the library cannot be asked.`);
