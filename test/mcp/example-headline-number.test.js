// spec-v1650: the first number a worked example states is a number its result contains.
//
// Four examples stated answers their tiles do not give: eGFR "~60" (64.5), the
// eGFR suite "CKD-EPI 2021 ~89" (86.2), IBW "~70.5" (70.7) and MELD-3.0 "~17"
// with Child-Pugh "~7" (18 and 8). Each lib was right by hand; the example was
// the stale part, and a +/-1 tolerance in derivation.test.js hid the MELD one.
// Later numbers in an example are often band edges quoted in prose ("moderate
// (6-10)"), so only the headline -- the first number -- is held to the result.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';
import { computeCalculator } from '../../mcp/tools.js';

test('spec-v1650: every example headline number appears in its computed result', () => {
  const offenders = [];
  for (const c of allCalculators()) {
    const ex = c.example;
    if (!ex || !ex.fields || typeof ex.expected !== 'string') continue;
    const r = computeCalculator({ id: c.id, inputs: ex.fields });
    if (!r || r.valid === false) continue;
    const blob = JSON.stringify(r.result);
    const have = new Set();
    for (const m of blob.matchAll(/-?\d+(?:\.\d+)?/g)) {
      const n = Number(m[0]);
      for (const v of [n, Math.round(n), +n.toFixed(1), +n.toFixed(2)]) have.add(v);
    }
    // Years and ISO dates are labels, not results.
    const text = ex.expected.replace(/\d{4}-\d\d-\d\d/g, '').replace(/\b(19|20)\d\d\b/g, '');
    const first = /(?<![\w.-])(\d+(?:\.\d+)?)(?!\w)/.exec(text);
    if (!first) continue;
    if (!have.has(Number(first[1]))) offenders.push(`${c.id}: example says ${first[1]} -- "${ex.expected.slice(0, 80)}"`);
  }
  assert.deepEqual(offenders, [], `\n${offenders.join('\n')}`);
});
