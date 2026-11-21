#!/usr/bin/env node
// spec-v1760: a value below a floor lib/bounds.js already declares.
//
// probe-envelope-unbounded.mjs drives each mapped field past its CEILING; nothing drove one below its FLOOR. This
// does, at half the floor (a weight of 150 g, a BMI of 2.5, a systolic of 10, a sodium of 45), from the worked example
// or, where the example leaves the field blank, from a value inside the envelope (fillFor). A floor of 0 is the
// negative finder's (probe-negative-as-zero.mjs). Floors that are not a recorded extreme, and fields whose quantity
// can go lower, are listed in scripts/lib/envelope-map.mjs (NO_FLOOR_KEYS, NO_FLOOR_FIELDS) with the reason.
//
// A row is a field that still answers. The fix is boundsAdvisory(key, value) in the tool's lib, as for a ceiling.
//
//   node scripts/probe-envelope-floor.mjs            TOOLS=psi,apache2 node scripts/probe-envelope-floor.mjs

import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';
import { candidates, envelope, fillFor, floorApplies } from './lib/envelope-map.mjs';

const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;
let driven = 0;
let rows = 0;
for (const r of candidates()) {
  if (ONLY && !ONLY.has(r.id)) continue;
  const b = envelope(r);
  if (!(b.min > 0) || !floorApplies(r)) continue;
  let ex = META[r.id]?.example?.fields;
  if (!ex) continue;
  if (r.ex === undefined || String(r.ex).trim() === '') {
    const fill = fillFor(r);
    if (fill === null) continue;
    ex = { ...ex, [r.dom]: fill };
  } else if (!(Number(r.ex) >= b.min && Number(r.ex) <= b.max)) continue;
  driven++;
  const under = Number((b.min / 2).toPrecision(4));
  const res = computeCalculator({ id: r.id, inputs: { ...ex, [r.dom]: String(under) } });
  if (res.valid === false) continue;
  rows++;
  const o = res.result || {};
  console.log(`${r.id}\t${r.dom}\t${r.key} floor=${b.min} drove=${under}\t${String(o.bandLabel || o.verdict || o.band || '').slice(0, 100)}`);
}
console.error(`${rows} of ${driven} field(s) with a floor above 0 still answer at half that floor.`);
