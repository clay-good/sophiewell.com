#!/usr/bin/env node
// spec-v1766: a value INSIDE a lib/bounds.js envelope that a tool still refuses.
//
// specs v1762-v1765 moved envelopes past values verified in survivors (an INR of 189, a sodium of 208, a
// triglyceride of 33,727 mg/dL) and then found dozens of tools refusing those values with an older, narrower cap
// of their own. Those were found by grep; this asks directly. For each mapped field (scripts/lib/envelope-map.mjs),
// starting from the worked example (or a fill for a blank field), drive 97% of the ceiling and, where a floor
// applies, 103% of the floor. A tool that refuses either with a range sentence has a cap narrower than the
// envelope: a survivable value is turned away.
//
// Not every row is a defect. A score's documented input domain, a value the tool itself treats as out of its
// validated population, or a field whose quantity the map mistook, can rightly be narrower; read each row.
//
// spec-v1781: "documented" now has a machine-readable meaning, so the report stops printing the rows that
// have one. A field whose own `min`/`max` (resolved through `fieldRange`, so an envelope named with `bound:`
// counts) already excludes the value this probe drives is a cap the tool STATES: it reaches the published
// input schema, and an agent reading `describe_calculator` is told the range before it calls. That is a
// validated population declared, not a survivable value turned away in silence, and
// [spec-v1777](../docs/spec-v1777.md) and [spec-v1779](../docs/spec-v1779.md) declared 709 of them. 116 of
// this finder's 213 rows were that, which is most of what anyone reading the report had to re-decide every
// run. What is left is the thing it was written for: a narrower cap nothing declares.
//
//   node scripts/probe-envelope-inside.mjs            TOOLS=apache2 node scripts/probe-envelope-inside.mjs

import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';
import { allCalculators } from '../mcp/catalog.js';
import { candidates, envelope, fillFor, floorApplies } from './lib/envelope-map.mjs';
import { RANGE_SENTENCE } from './lib/range-sentence.mjs';
import { REGISTRY } from '../mcp/catalog.js';
import { fieldRange } from '../mcp/fields.js';

// The field's own declared range, resolved; null when it declares none.
function declaredFor(id, dom) {
  const f = (REGISTRY.get(id)?.fields || []).find((x) => x.dom === dom);
  return f ? fieldRange(f) : null;
}

const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;
// spec-v1785: the `computed: true` sentence shape. When those twelve call sites stopped saying "must be
// between X and Y" about a number nobody entered, every row vanished from this report -- not fixed, just
// unrecognised. A finder's sentence list is part of its reach, and a better message must not silence it.
// spec-v1794: one shared list, see scripts/lib/range-sentence.mjs. The copy here did not know the
// `must be a number` shape that spec-v1785 added to the other one.
const RANGE = RANGE_SENTENCE;
const byId = new Map(allCalculators().map((t) => [t.id, t]));
let driven = 0;
let rows = 0;
let stated = 0;
let moves = 0;
let computed = 0;
for (const r of candidates()) {
  if (ONLY && !ONLY.has(r.id)) continue;
  let ex = META[r.id]?.example?.fields;
  if (!ex) continue;
  const b = envelope(r);
  if (r.ex === undefined || String(r.ex).trim() === '') {
    const fill = fillFor(r);
    if (fill === null) continue;
    ex = { ...ex, [r.dom]: fill };
  } else if (!(Number(r.ex) >= b.min && Number(r.ex) <= b.max)) continue;
  const probes = [['ceiling', Number((b.max * 0.97).toPrecision(5))]];
  if (b.min > 0 && floorApplies(r)) probes.push(['floor', Number((b.min * 1.03).toPrecision(5))]);
  const declared = declaredFor(r.id, r.dom);
  for (const [side, v] of probes) {
    driven++;
    // The cap is STATED: the field's own declared range already excludes this value, so it is in the
    // published input schema and no reader or agent meets it unannounced.
    if (declared && ((declared.min !== null && v < declared.min) || (declared.max !== null && v > declared.max))) {
      stated++;
      continue;
    }
    const res = computeCalculator({ id: r.id, inputs: { ...ex, [r.dom]: String(v) } });
    if (res.valid !== false) continue;
    const msg = String(res.message || res.result?.band || '');
    if (!RANGE.test(msg)) continue; // refused for another reason (a conflict, a missing pair), not a range
    // spec-v1802: IS THE NARROWER CAP DECLARABLE AT ALL? `probe-undeclared-cap` classifies a cap that moves
    // with another input as VARIES -- no literal can state it -- and sixteen of the twenty-two fields this
    // finder was reporting are exactly that: `iv-iron-course`'s weight moves with the regimen,
    // `salazar-corcoran`'s creatinine with the age. Reporting those as a missing declaration asks for
    // something no descriptor can hold, and buried the handful that could be declared. The same question
    // this suite asks everywhere: flip each enum and move each sibling, and see whether the refusal holds.
    const variants = [];
    for (const q of (byId.get(r.id) || {}).fields || []) {
      if (q.dom === r.dom) continue;
      if (q.kind === 'enum' && Array.isArray(q.values)) {
        for (const o of q.values) if (String(ex[q.dom]) !== String(o)) variants.push({ ...ex, [q.dom]: String(o) });
      } else if (q.kind === 'number') {
        const base = Number(ex[q.dom]);
        if (Number.isFinite(base) && base !== 0) for (const k of [0.5, 2]) variants.push({ ...ex, [q.dom]: String(base * k) });
      }
    }
    const live = variants.filter((c) => { const x = computeCalculator({ id: r.id, inputs: c }); return !!x && x.valid === true; });
    const holds = live.every((c) => {
      let x; try { x = computeCalculator({ id: r.id, inputs: { ...c, [r.dom]: String(v) } }); } catch { return true; }
      return !!x && x.valid === false;
    });
    if (!holds) { moves++; continue; }
    // spec-v1802: AN OUTPUT RANGE IS NOT A MISSING DECLARATION. `num({ computed: true })` says "works out
    // to X, which is outside the range this tool reports", and that sentence comes from exactly one call
    // site, about a value nobody entered: `feua`'s fractional excretion, `deurenberg-body-fat`'s
    // percentage, `minute-ventilation`'s ideal body weight. spec-v1795 settled that such a cap belongs to
    // the output and that a literal for it would be a derived number that drifts.
    if (/works out to [-\d.,]+, which is outside the range this tool reports/i.test(msg)) { computed++; continue; }
    // And the same thing wearing the field's clothes. `deurenberg-body-fat` says "The BMI in kg/m^2 must be
    // between 5 and 100", which reads like a cap on the BMI -- but 100 itself is refused, because the
    // body-fat percentage it works out to leaves ITS range first. A cap whose own edge is not accepted is
    // not a cap on this field; `test/unit/declared-cap-honest.test.js` is the gate that says so, and asking
    // the same question here keeps the two from disagreeing.
    const edge = /between ([-\d.,]+) and ([\d.,]+)|at most ([\d.,]+)/i.exec(msg);
    if (edge) {
      // The edge on the side being probed: a floor row asks whether the stated minimum is accepted, a
      // ceiling row the stated maximum. `body-roundness-index` says "between 50 and 250" and 250 answers
      // while 50 does not, because the roundness index it reports leaves its own range there first.
      const stated = Number((side === 'floor' ? (edge[1] || '') : (edge[2] || edge[3] || '')).replace(/,/g, ''));
      if (Number.isFinite(stated) && stated !== 0) {
        let at; try { at = computeCalculator({ id: r.id, inputs: { ...ex, [r.dom]: String(stated) } }); } catch { at = null; }
        if (!at || at.valid === false) { computed++; continue; }
      }
    }
    rows++;
    console.log(`${r.id}\t${r.dom}\t${r.key} ${side} drove=${v} [${b.min}, ${b.max}]\t${msg.slice(0, 110)}`);
  }
}
console.error(`${rows} of ${driven} value(s) just inside an envelope are refused by a narrower cap that nothing declares`
  + `; ${moves} more are refused by a cap that MOVES with another input and ${computed} by the range the tool `
  + `reports its OUTPUT in, neither of which a static declaration can state`
  + `; ${stated} more are outside a range the field itself declares, which is a validated population stated rather `
  + `than a survivable value turned away (spec-v1781).`);
