// spec-v1629 tool 7: weight to weigh after assay and water correction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiPotencyAdjust as ap } from '../../lib/api-potency-adjust-v1629.js';

const lot = { unit: 'mg', target: 500, assay: 98.5, water: 4.2 };

test('the three bases give different answers for the same lot where they should', () => {
  const asIs = ap({ ...lot, basis: 'as-is' });
  const anhydrous = ap({ ...lot, basis: 'anhydrous' });
  const dried = ap({ ...lot, basis: 'dried' });
  assert.equal(asIs.weigh, 507.614); // 500 / 0.985
  assert.equal(anhydrous.weigh, 529.869); // 500 / (0.985 x 0.958)
  assert.equal(dried.weigh, 529.869);
  assert.ok(anhydrous.weigh > asIs.weigh);
  assert.equal(asIs.waterApplied, false);
  assert.match(asIs.notes.join(' '), /The 4\.2% entered is not applied; applying it would over-weigh/);
  assert.match(anhydrous.notes.join(' '), /Water \(anhydrous basis\)/);
  assert.match(dried.notes.join(' '), /Water \(dried basis\)/);
});

test('no basis chosen gives no answer', () => {
  const r = ap(lot);
  assert.equal(r.valid, false);
  assert.match(r.message, /Choose the basis the assay is stated on/);
  assert.equal(ap({ ...lot, basis: 'constructor' }).valid, false);
});

test('100% assay and 0% water returns the target', () => {
  assert.equal(ap({ unit: 'g', target: 2, assay: 100, water: 0, basis: 'anhydrous' }).weigh, 2);
  assert.equal(ap({ unit: 'g', target: 2, assay: 100, basis: 'as-is' }).weigh, 2);
});

test('an anhydrous or dried assay without a water content is refused; a salt factor multiplies', () => {
  assert.match(ap({ unit: 'mg', target: 500, assay: 98.5, basis: 'anhydrous' }).message, /An anhydrous assay needs it: skipping the correction under-doses/);
  assert.match(ap({ unit: 'mg', target: 500, assay: 98.5, basis: 'dried' }).message, /A dried assay needs it/);
  const salt = ap({ unit: 'g', target: 2, assay: 100, water: 0, basis: 'dried', saltFactor: 1.2 });
  assert.equal(salt.weigh, 2.4);
  assert.match(ap({ ...lot, basis: 'as-is' }).notes.join(' '), /No salt factor was entered/);
  assert.match(ap({ ...lot, basis: 'as-is', unit: '' }).message, /Choose the unit/);
  assert.match(ap({ unit: 'mg', target: 500, basis: 'as-is' }).message, /Enter the assay/);
});
