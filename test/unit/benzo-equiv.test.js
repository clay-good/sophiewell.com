// spec-v296: benzodiazepine dose-equivalence converter. Worked-example tests:
// the diazepam equivalent under both VA/DoD 2021 and Ashton 2002 systems, the
// documented divergence between them (lorazepam, alprazolam), the Ashton range
// agents (flurazepam), a source->target round trip, the diazepam identity, the
// invalid-dose guard, and the out-of-range RangeError. Factors cross-verified
// against the ASAM 2025 guideline table (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { benzoEquivalence } from '../../lib/benzo-equiv-v296.js';

test('lorazepam 2 mg: 10 mg diazepam (VA/DoD) vs 20 mg (Ashton) -- the systems diverge', () => {
  const r = benzoEquivalence({ source: 'lorazepam', dose: 2, target: 'diazepam' });
  assert.equal(r.valid, true);
  assert.equal(r.diazepamEquivVaDod, '10');
  assert.equal(r.diazepamEquivAshton, '20');
  assert.match(r.band, /2 mg lorazepam/);
  assert.match(r.band, /10 mg oral diazepam \(VA\/DoD 2021\) or 20 mg \(Ashton 2002\)/);
});

test('alprazolam 1 mg: 10 mg (VA/DoD) vs 20 mg (Ashton)', () => {
  const r = benzoEquivalence({ source: 'alprazolam', dose: 1, target: 'diazepam' });
  assert.equal(r.diazepamEquivVaDod, '10');
  assert.equal(r.diazepamEquivAshton, '20');
});

test('clonazepam 0.5 mg: 5 mg (VA/DoD) vs 10 mg (Ashton)', () => {
  const r = benzoEquivalence({ source: 'clonazepam', dose: 0.5, target: 'diazepam' });
  assert.equal(r.diazepamEquivVaDod, '5');
  assert.equal(r.diazepamEquivAshton, '10');
});

test('flurazepam is an Ashton range agent (15-30): 30 mg gives a diazepam range', () => {
  const r = benzoEquivalence({ source: 'flurazepam', dose: 30, target: 'diazepam' });
  assert.equal(r.diazepamEquivVaDod, '20');
  assert.equal(r.diazepamEquivAshton, '10-20');
});

test('source -> target round trip (alprazolam -> lorazepam)', () => {
  const r = benzoEquivalence({ source: 'alprazolam', dose: 2, target: 'lorazepam' });
  assert.equal(r.targetLabel, 'lorazepam');
  // 2 mg alprazolam -> 20 mg diazepam (VA/DoD) -> 4 mg lorazepam.
  assert.equal(r.targetDoseVaDod, '4');
  assert.match(r.band, /lorazepam/);
});

test('diazepam identity: 10 mg in, 10 mg out under both systems', () => {
  const r = benzoEquivalence({ source: 'diazepam', dose: 10, target: 'diazepam' });
  assert.equal(r.diazepamEquivVaDod, '10');
  assert.equal(r.diazepamEquivAshton, '10');
});

test('guards: missing/zero dose is a message; out-of-range throws RangeError', () => {
  assert.equal(benzoEquivalence({ source: 'lorazepam', dose: 0 }).valid, false);
  assert.equal(benzoEquivalence({ source: 'lorazepam' }).valid, false);
  assert.equal(benzoEquivalence({ dose: 2 }).valid, false);
  assert.throws(() => benzoEquivalence({ source: 'lorazepam', dose: 20000 }), RangeError);
});
