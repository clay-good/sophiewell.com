// spec-v1777: a declared bound must be one the library actually accepts.
//
// `mcp/fields.js` refuses a value outside a field's declared `min`/`max` before the library runs, so the
// declaration is a promise in both directions. spec-v1744's probe-adapter-only-bounds holds one direction:
// the library must not ANSWER past the declared edge. This test holds the other: the library must not
// REFUSE the declared edge. A declaration looser than the library is how an agent gets a value through the
// schema and then a range sentence it had no way to anticipate -- the agent-side half of the divergence
// spec-v1743 found on the page.
//
// Five fields failed this when it was written. Two declared a floor of 0 on an FiO2 fraction whose envelope
// starts at 0.21, and three declared an inclusive edge on a bound their library states as exclusive -- a
// pre-test probability "between 0 and 100% (exclusive)", a bioavailability and a salt factor "between 0
// (exclusive) and 1". The first two were corrected; the last three are why the descriptor contract now
// carries `exclusiveMin` / `exclusiveMax`.
//
// JUDGED below are the declarations that are right while the edge is still refused at the worked example,
// each for a reason the contract cannot express: a budget shared with a sibling field, or a range that is
// the union of the units the field accepts. A judged row must still be reachable, so a ledger entry cannot
// outlive the field it excuses.

import test from 'node:test';
import assert from 'node:assert/strict';
import { REGISTRY } from '../../mcp/catalog.js';
import { META } from '../../lib/meta.js';

const JUDGED = {
  'dhi:dhi-yes:max': 'the two answer counts share a budget of 25, so 25 is reachable only when the other is 0',
  'dhi:dhi-some:max': 'the two answer counts share a budget of 25, so 25 is reachable only when the other is 0',
  // A pH of 6.3 is a pH. What the library refuses is the CORRECTED potassium it computes from it: at the
  // worked example's 5.4 mEq/L, correcting to a pH of 6.3 puts the result past the output envelope of 20.
  'corrected-potassium-ph:kc-ph:min': 'the refusal is about the corrected potassium, not the pH: 6.3 leaves the output envelope at this potassium',
  'wasting-classify:wc-muac:min': 'the declaration is the union of the units the field accepts: 8 cm through 250 mm',
  'newborn-temperature-who:nt2-temp:max': 'the union of the units the field accepts: 25 °C through 110 °F',
  'newborn-hypoglycemia-who:nh-glu:max': 'the union of the units the field accepts: 0.1 mmol/L through 900 mg/dL',
};

// The sentence shapes every library in lib/ refuses an out-of-range value with.
const RANGE = /plausible range|must be (?:between|at most|at least|from|no more|a number)|between -?[\d.,]+ and -?[\d.,]+|outside -?[\d.,]+ to|no more than|beyond (?:a plausible|recorded)/i;

// A thrown range message is a refusal too, and reading only returned ones hid four of the offenders: the
// A-a gradient, its suite and the P/F ratio all throw "fio2 must be between 0.21 and 1" rather than
// returning it, so a `catch {}` that dropped the message made them look like a refusal for another reason.
const run = (e, inputs) => {
  try {
    const r = e.compute(e.toArgs(inputs));
    return r == null ? { valid: false } : r;
  } catch (err) {
    return { valid: false, message: String((err && err.message) || '') };
  }
};

test('every declared bound is an edge the library accepts', () => {
  const offenders = [];
  const seen = new Set();
  let checked = 0;
  for (const [id, e] of REGISTRY) {
    const ex = META[id]?.example?.fields;
    if (!ex || !e.fields) continue;
    if (run(e, { ...ex }).valid === false) continue;
    for (const f of e.fields) {
      if (f.kind !== 'number' || Array.isArray(f.values)) continue;
      for (const [side, v] of [['max', f.max], ['min', f.min]]) {
        if (typeof v !== 'number' || !Number.isFinite(v)) continue;
        // An exclusive bound promises the edge is NOT allowed, so the library is right to refuse it.
        if (side === 'max' && f.exclusiveMax) continue;
        if (side === 'min' && f.exclusiveMin) continue;
        checked += 1;
        const r = run(e, { ...ex, [f.dom]: String(v) });
        if (r.valid !== false) continue;
        if (!RANGE.test(String(r.message || r.band || ''))) continue; // refused for some other reason
        const key = `${id}:${f.dom}:${side}`;
        if (JUDGED[key]) { seen.add(key); continue; }
        offenders.push(`${key} declared ${v}, library says: ${String(r.message || r.band || '').slice(0, 90)}`);
      }
    }
  }
  assert.ok(checked > 1000, `expected the declared bounds to be reached; checked ${checked}`);
  assert.deepEqual(offenders, [], `declared bound(s) the library refuses:\n${offenders.join('\n')}`);
  const stale = Object.keys(JUDGED).filter((k) => !seen.has(k));
  assert.deepEqual(stale, [], `judged here, but no longer reached: ${stale.join(', ')}`);
});
