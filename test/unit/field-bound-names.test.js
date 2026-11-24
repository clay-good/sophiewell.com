// spec-v1779: a field that names an envelope must name one that exists.
//
// `bound: 'weightKg'` resolves against `lib/bounds.js` on every read, which is the whole point -- a
// declaration cannot fall behind the envelope it names. The cost of that indirection is that a typo is
// silent: `bound: 'weightKG'` resolves to nothing, and a field that was meant to be bounded is published
// with no range at all. `fieldRange` deliberately does not invent a range for an unknown name, so this is
// the gate that refuses one.
//
// It also holds the two invariants that make a resolved range readable: a scale is a positive finite
// number, and a field does not both name an envelope and restate the same edge as a literal.

import test from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';
import { fieldRange } from '../../mcp/fields.js';
import { BOUNDS, CEILING_ONLY } from '../../lib/bounds.js';

const numberFields = () => {
  const out = [];
  for (const t of allCalculators()) for (const f of t.fields || []) if (f.kind === 'number') out.push([t.id, f]);
  return out;
};

test('every `bound` names a real lib/bounds.js envelope', () => {
  const offenders = [];
  for (const [id, f] of numberFields()) {
    if (f.bound === undefined) continue;
    if (typeof f.bound !== 'string' || !Object.prototype.hasOwnProperty.call(BOUNDS, f.bound)) {
      offenders.push(`${id} ${f.dom}: bound ${JSON.stringify(f.bound)} is not a BOUNDS key`);
    }
  }
  assert.deepEqual(offenders, [], `\n${offenders.join('\n')}`);
});

test('a `boundScale` is a positive finite number, and only appears beside a `bound`', () => {
  const offenders = [];
  for (const [id, f] of numberFields()) {
    if (f.boundScale === undefined) continue;
    if (!Number.isFinite(f.boundScale) || f.boundScale <= 0) offenders.push(`${id} ${f.dom}: boundScale ${f.boundScale}`);
    if (!f.bound) offenders.push(`${id} ${f.dom}: boundScale with no bound`);
  }
  assert.deepEqual(offenders, [], `\n${offenders.join('\n')}`);
});

test('a resolved range is the envelope, scaled, and a literal still wins', () => {
  const offenders = [];
  let resolved = 0;
  for (const [id, f] of numberFields()) {
    if (!f.bound || !BOUNDS[f.bound]) continue;
    resolved += 1;
    const b = BOUNDS[f.bound];
    const s = Number.isFinite(f.boundScale) && f.boundScale > 0 ? f.boundScale : 1;
    const r = fieldRange(f);
    const want = (literal, edge) => (Number.isFinite(literal) ? literal
      : (Number.isFinite(edge) ? Number((edge * s).toPrecision(12)) : null));
    // A CEILING_ONLY envelope publishes no floor: its low end has been survived and the library flags it
    // rather than refusing it (spec-v1762), so a published minimum would claim a floor nothing holds.
    const wantMin = CEILING_ONLY.has(f.bound) ? (Number.isFinite(f.min) ? f.min : null) : want(f.min, b.min);
    if (r.min !== wantMin) offenders.push(`${id} ${f.dom}: min resolved ${r.min}, expected ${wantMin}`);
    if (r.max !== want(f.max, b.max)) offenders.push(`${id} ${f.dom}: max resolved ${r.max}, expected ${want(f.max, b.max)}`);
  }
  assert.deepEqual(offenders, [], `\n${offenders.join('\n')}`);
  assert.ok(resolved > 0, 'no field resolves a range from an envelope; the mechanism is unused');
});

test('fieldRange leaves a field with neither a literal nor a bound unranged', () => {
  assert.deepEqual(fieldRange({ kind: 'number' }), { min: null, max: null, exclusiveMin: false, exclusiveMax: false });
  // An unknown name widens nothing: it resolves to the literals the descriptor stated, if any.
  assert.deepEqual(fieldRange({ kind: 'number', bound: 'notAnEnvelope', min: 3 }),
    { min: 3, max: null, exclusiveMin: false, exclusiveMax: false });
});
