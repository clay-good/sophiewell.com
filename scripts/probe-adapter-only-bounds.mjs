#!/usr/bin/env node
// spec-v1744: a range the agent adapter declares and the library does not.
//
// `mcp/fields.js` refuses an agent's value outside a field's declared `min`/`max` before the library runs.
// The browser page calls the library directly, so the same value typed on the page reaches it. spec-v1743
// found Phoenix Sepsis reading a GCS of 150 as not entered and still answering "septic shock" on the page,
// while every agent-side finder saw the adapter refuse it.
//
// This asks the library, not the adapter. For every number field with a declared bound, it calls the
// registry entry's `compute(toArgs(inputs))` directly -- skipping the validator -- at ten times the
// maximum, or below the minimum, from the worked example. A row is a field where the library answered
// with something different from the example. Read each against the page: a range slider cannot produce
// the value (it snaps to its ends), so only number inputs are reachable.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-adapter-only-bounds.mjs

import { META } from '../lib/meta.js';
import { REGISTRY } from '../mcp/catalog.js';

const run = (e, inputs) => {
  try {
    const r = e.compute(e.toArgs(inputs));
    return r == null ? { valid: false } : r;
  } catch {
    return { valid: false };
  }
};

let rows = 0;
let checked = 0;
for (const [id, e] of REGISTRY) {
  const ex = META[id]?.example?.fields;
  if (!ex || !e.fields) continue;
  const base = run(e, { ...ex });
  if (base.valid === false) continue;
  for (const f of e.fields) {
    if (f.kind !== 'number') continue;
    for (const [side, v] of [['max', f.max], ['min', f.min]]) {
      if (typeof v !== 'number' || !Number.isFinite(v)) continue;
      const probe = side === 'max' ? (v === 0 ? 10 : v * 10) : (v > 0 ? v / 10 - 1 : v - 10);
      checked++;
      const r = run(e, { ...ex, [f.dom]: String(probe) });
      if (r.valid === false) continue;
      if (JSON.stringify(r) === JSON.stringify(base)) continue; // the field changed nothing: another finder's job
      rows++;
      const say = String(r.bandLabel || r.band || r.verdict || r.text || '').slice(0, 90);
      console.log(`${id}\t${f.dom}\t${side}=${v}\tprobe=${probe}\t${say}`);
    }
  }
}
console.error(`${rows} row(s) of ${checked} declared bound(s) checked.`);
