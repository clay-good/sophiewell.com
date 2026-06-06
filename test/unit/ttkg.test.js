// spec-v55 §2.10: Transtubular Potassium Gradient with precondition guard.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ttkg } from '../../lib/clinical-v6.js';

test('ttkg hypokalemia wasting: uK 40, pK 3.0, uOsm 600, pOsm 290, uNa 40 -> 6.4', () => {
  const r = ttkg({ urineK: 40, plasmaK: 3.0, urineOsm: 600, plasmaOsm: 290, urineNa: 40 });
  assert.equal(r.ttkg, 6.4);
  assert.equal(r.valid, true);
  assert.match(r.band, /renal potassium wasting/);
});

test('ttkg hyperkalemia impaired: uK 60, pK 6.0, uOsm 500, pOsm 290, uNa 40 -> 5.8', () => {
  const r = ttkg({ urineK: 60, plasmaK: 6.0, urineOsm: 500, plasmaOsm: 290, urineNa: 40 });
  assert.equal(r.ttkg, 5.8);
  assert.match(r.band, /impaired renal K excretion/);
});

test('ttkg invalid when urine osm <= plasma osm: surfaced guard, no number', () => {
  const r = ttkg({ urineK: 40, plasmaK: 3.0, urineOsm: 280, plasmaOsm: 290, urineNa: 40 });
  assert.equal(r.ttkg, null);
  assert.equal(r.valid, false);
  assert.match(r.note, /urine osmolality must exceed plasma/);
});

test('ttkg invalid when urine Na <= 25: surfaced guard, no number', () => {
  const r = ttkg({ urineK: 40, plasmaK: 3.0, urineOsm: 600, plasmaOsm: 290, urineNa: 20 });
  assert.equal(r.ttkg, null);
  assert.equal(r.valid, false);
  assert.match(r.note, /urine Na must be > 25/);
});

test('ttkg rejects impossible input', () => {
  assert.throws(() => ttkg({ urineK: 40, plasmaK: 0, urineOsm: 600, plasmaOsm: 290, urineNa: 40 }), /plasmaK/);
});
