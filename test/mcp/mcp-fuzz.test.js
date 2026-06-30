// spec-v183 §3 / §4.5: extend the output-safety discipline to the JSON tool
// surface. Drive every adapter through compute_calculator with a deterministic
// battery of extreme inputs (including the spec-v140 logistic-saturation path:
// huge magnitudes that would overflow a naive sigmoid) and assert the surface
// NEVER leaks a non-finite value. A leak is impossible by construction
// (computeCalculator's firstNonFinite guard demotes it to { valid:false }); this
// test proves the guard holds across the whole exposed set.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { META } from '../../lib/meta.js';
import { REGISTRY } from '../../mcp/catalog.js';
import { computeCalculator } from '../../mcp/tools.js';

// Extreme values that have, historically, produced NaN / Infinity in compute
// paths: zero (division), negatives (logs / sqrt), and float64-saturating
// magnitudes (sigmoid -> 1.0 -> 1 - p -> 0 -> downstream Infinity).
const NUM_EDGES = [0, -0, -1, -1e6, 1e-12, 1e6, 1e308, 1e-308, '', 'abc'];
const BOOL_EDGES = [true, false, '1', '0', 'yes', 'no'];

function baseline(entry) {
  // Start from the documented example so each mutated call is otherwise valid.
  const ex = META[entry.id] && META[entry.id].example;
  return ex && ex.fields ? { ...ex.fields } : {};
}

function assertSafe(entry, inputs, label) {
  let r;
  assert.doesNotThrow(() => { r = computeCalculator({ id: entry.id, inputs }); }, `${entry.id} ${label} threw`);
  assert.equal(typeof r.valid, 'boolean', `${entry.id} ${label}: no valid flag`);
  if (r.valid) {
    const ser = JSON.stringify(r.result);
    assert.doesNotMatch(ser, /NaN|Infinity/, `${entry.id} ${label}: non-finite token in result`);
    // Serialize -> parse -> serialize must be stable: catches undefined /
    // function leaks (which JSON drops) without tripping on the -0 vs 0
    // distinction JSON does not preserve.
    assert.equal(JSON.stringify(JSON.parse(ser)), ser, `${entry.id} ${label}: result not JSON-stable`);
  } else {
    assert.ok(typeof r.message === 'string' && r.message.length > 0, `${entry.id} ${label}: invalid without message`);
  }
}

test('no adapter leaks a non-finite value on extreme inputs', () => {
  for (const entry of REGISTRY.values()) {
    const base = baseline(entry);
    // One field at a time pushed to each edge, others at the example baseline.
    for (const f of entry.fields) {
      if (f.kind === 'number') {
        for (const v of NUM_EDGES) assertSafe(entry, { ...base, [f.dom]: v }, `${f.dom}=${String(v)}`);
      } else if (f.kind === 'bool') {
        for (const v of BOOL_EDGES) assertSafe(entry, { ...base, [f.dom]: v }, `${f.dom}=${String(v)}`);
      } else if (f.kind === 'enum') {
        for (const v of [...f.values, 'invalid-enum']) assertSafe(entry, { ...base, [f.dom]: v }, `${f.dom}=${v}`);
      }
    }
    // All numeric fields simultaneously saturated (the compounded overflow path).
    const allHuge = { ...base };
    for (const f of entry.fields) if (f.kind === 'number') allHuge[f.dom] = 1e308;
    assertSafe(entry, allHuge, 'all-numeric=1e308');
    // Empty inputs: must be a clean complete-the-fields fallback, never a throw.
    assertSafe(entry, {}, 'empty');
  }
});
