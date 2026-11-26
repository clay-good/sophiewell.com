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
import { fieldRange } from '../mcp/fields.js';

const run = (e, inputs) => {
  try {
    const r = e.compute(e.toArgs(inputs));
    return r == null ? { valid: false } : r;
  } catch {
    return { valid: false };
  }
};

// spec-v1794: a judged ledger, so this finder prints nothing until something NEW appears. It is the last of
// the declaration finders to get one; the eighteen rows it carried until now were real and are fixed (the
// borrowed-envelope declarations of spec-v1794), which is what makes a ledger worth having here.
//
// `--all` prints the judged rows with their reasons, the way the other finders do, so
// test/unit/finder-ledgers.test.js can read both halves from one run.
const JUDGED = {
  // The clamp is in the adapter's own compute wrapper, where it passes 0 for an ABSENT optional flow. No
  // surface reaches it with a negative: the field declares a minimum of 0, so `validateInputs` refuses an
  // agent's negative first, and the page calls the library directly, where `num()` refuses it. This finder
  // skips the validator on purpose -- that is how it models the page -- and for this one tool the page does
  // not go through the wrapper, so the path it exercises belongs to neither surface.
  'o2-cylinder-duration:o2-flow:min': 'owner decision of 2026-11-17: this tool keeps reading a negative optional flow as absent (docs/spec-v1759.md), and no surface reaches the adapter wrapper\'s clamp -- validateInputs refuses an agent\'s negative and the page reaches num() directly',
};
const ALL = process.argv.includes('--all');
const judgedSeen = new Set();

let rows = 0;
let checked = 0;
for (const [id, e] of REGISTRY) {
  const ex = META[id]?.example?.fields;
  if (!ex || !e.fields) continue;
  const base = run(e, { ...ex });
  if (base.valid === false) continue;
  for (const f of e.fields) {
    if (f.kind !== 'number') continue;
    // spec-v1779: the resolved range, so a bound declared by envelope name is policed like a literal.
    const declared = fieldRange(f);
    for (const [side, v] of [['max', declared.max], ['min', declared.min]]) {
      if (typeof v !== 'number' || !Number.isFinite(v)) continue;
      // spec-v1753: just past the bound, not only far past it -- a library with a looser limit of its own refuses
      // the absurd and answers the merely out-of-range.
      const probe = side === 'max' ? (v === 0 ? 1 : Math.max(v + 1, Number((v * 1.5).toPrecision(6)))) : (v > 0 ? v / 2 : v - 1);
      checked++;
      const r = run(e, { ...ex, [f.dom]: String(probe) });
      if (r.valid === false) continue;
      if (JSON.stringify(r) === JSON.stringify(base)) continue; // the field changed nothing: another finder's job
      const key = `${id}:${f.dom}:${side}`;
      const say = String(r.bandLabel || r.band || r.verdict || r.text || '').slice(0, 90);
      if (JUDGED[key]) {
        judgedSeen.add(key);
        if (ALL) console.log(`JUDGED\t${key}\t${JUDGED[key]}`);
        continue;
      }
      rows++;
      console.log(`${id}\t${f.dom}\t${side}=${v}\tprobe=${probe}\t${say}`);
    }
  }
}
for (const key of Object.keys(JUDGED)) {
  if (!judgedSeen.has(key)) console.log(`STALE-LEDGER\t${key}\t(judged here, but the finder no longer reaches it)`);
}
console.error(`${rows} row(s) of ${checked} declared bound(s) checked; ${judgedSeen.size} judged. `
  + `--all lists the judged rows and why.`);
