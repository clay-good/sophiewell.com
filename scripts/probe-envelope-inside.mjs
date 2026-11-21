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
//   node scripts/probe-envelope-inside.mjs            TOOLS=apache2 node scripts/probe-envelope-inside.mjs

import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';
import { candidates, envelope, fillFor, floorApplies } from './lib/envelope-map.mjs';

const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;
const RANGE = /plausible range|must be (?:between|at most|at least|from|no more)|between -?[\d.,]+ and -?[\d.,]+|outside -?[\d.,]+ to|no more than|beyond (?:a plausible|recorded)/i;
let driven = 0;
let rows = 0;
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
  for (const [side, v] of probes) {
    driven++;
    const res = computeCalculator({ id: r.id, inputs: { ...ex, [r.dom]: String(v) } });
    if (res.valid !== false) continue;
    const msg = String(res.message || res.result?.band || '');
    if (!RANGE.test(msg)) continue; // refused for another reason (a conflict, a missing pair), not a range
    rows++;
    console.log(`${r.id}\t${r.dom}\t${r.key} ${side} drove=${v} [${b.min}, ${b.max}]\t${msg.slice(0, 110)}`);
  }
}
console.error(`${rows} of ${driven} value(s) just inside an envelope are refused by a narrower cap.`);
