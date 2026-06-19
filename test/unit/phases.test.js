// spec-v118 2.4: PHASES score (Greving 2014). Population/HTN/Age/Size/EarlierSAH/
// Site -> 0-22; 5-year cumulative rupture risk 0.4% (<=2) ... 17.8% (>=12).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phases } from '../../lib/neuro-v118.js';

test('missing age/size -> complete-the-fields fallback', () => {
  const r = phases({ population: 'na' });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the patient age/);
});

test('lowest-risk profile -> 0/22, ~0.4%', () => {
  const r = phases({ population: 'na', htn: false, age: 50, size: 4, earlierSah: false, site: 'ica' });
  assert.equal(r.total, 0);
  assert.equal(r.risk, '0.4%');
  assert.equal(r.abnormal, false);
});

test('Greving worked example: NA, no HTN, no prior SAH, 8 mm posterior aneurysm -> 7 points, ~2.4%', () => {
  const r = phases({ population: 'na', htn: false, age: 55, size: 8, earlierSah: false, site: 'acaPcomPost' });
  assert.equal(r.total, 7);
  assert.equal(r.risk, '2.4%');
});

test('size banding: 7.0 mm -> +3, 10.0 -> +6, 20 -> +10', () => {
  assert.equal(phases({ population: 'na', age: 40, size: 7 }).total, 3);
  assert.equal(phases({ population: 'na', age: 40, size: 10 }).total, 6);
  assert.equal(phases({ population: 'na', age: 40, size: 20 }).total, 10);
  assert.equal(phases({ population: 'na', age: 40, size: 6.9 }).total, 0);
});

test('high-risk band-flip: Finnish + HTN + age>=70 + 12mm + earlierSAH + posterior -> 18, ~17.8%', () => {
  const r = phases({ population: 'finnish', htn: true, age: 72, size: 12, earlierSah: true, site: 'acaPcomPost' });
  assert.equal(r.total, 18);
  assert.equal(r.risk, '17.8%');
  assert.equal(r.abnormal, true);
});

test('the 12-point boundary maps to the >=12 stratum (17.8%)', () => {
  // Japanese (+3) + size 10-19.9 (+6) + MCA (+2) + HTN (+1) = 12
  const r = phases({ population: 'japanese', htn: true, age: 50, size: 11, earlierSah: false, site: 'mca' });
  assert.equal(r.total, 12);
  assert.equal(r.risk, '17.8%');
});

test('negative size rejected', () => {
  const r = phases({ population: 'na', age: 50, size: -3 });
  assert.equal(r.valid, false);
});
