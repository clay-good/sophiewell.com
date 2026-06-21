// spec-v135 2.3: GELF high-tumor-burden criteria (Brice P, et al, J Clin Oncol
// 1997;15:1110-1117). High tumor burden = ANY ONE criterion met. The boundary
// tests pin the any-one met-vs-not flip and the size/cytopenia cut-points.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gelfCriteria } from '../../lib/lymphoma-v135.js';

const lowBurden = { maxMassCm: 4, nodalSites3cm: 'no', bSymptoms: 'no', splenomegaly: 'no', effusion: 'no', hgb: 13, platelet: 250, leukemicPhase: 'no' };

test('no criterion met -> low tumor burden', () => {
  const r = gelfCriteria(lowBurden);
  assert.equal(r.highTumorBurden, false);
  assert.equal(r.count, 0);
  assert.equal(r.abnormal, false);
});

test('a single criterion flips to high tumor burden (any-one)', () => {
  const r = gelfCriteria({ ...lowBurden, maxMassCm: 8 });
  assert.equal(r.highTumorBurden, true);
  assert.equal(r.count, 1);
});

test('mass cut-point is strictly > 7 cm', () => {
  assert.equal(gelfCriteria({ ...lowBurden, maxMassCm: 7 }).highTumorBurden, false);
  assert.equal(gelfCriteria({ ...lowBurden, maxMassCm: 7.1 }).highTumorBurden, true);
});

test('cytopenia fires on Hgb < 10 or platelets < 100', () => {
  assert.equal(gelfCriteria({ ...lowBurden, hgb: 9.9 }).highTumorBurden, true);
  assert.equal(gelfCriteria({ ...lowBurden, platelet: 99 }).highTumorBurden, true);
  assert.equal(gelfCriteria({ ...lowBurden, hgb: 10, platelet: 100 }).highTumorBurden, false);
});

test('multiple criteria are counted and named', () => {
  const r = gelfCriteria({ ...lowBurden, bSymptoms: 'yes', splenomegaly: 'yes', leukemicPhase: 'yes' });
  assert.equal(r.count, 3);
  assert.match(r.band, /criteria MET/);
});

test('any blank field surfaces the fallback', () => {
  assert.equal(gelfCriteria({}).valid, false);
  assert.equal(gelfCriteria({ maxMassCm: 8 }).valid, false);
});
