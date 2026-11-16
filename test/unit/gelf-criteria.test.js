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

test('spec-v1741: a hemoglobin or platelet count ten times past its envelope is refused', () => {
  const ex = { maxMassCm: 8, nodalSites3cm: 'no', bSymptoms: 'no', splenomegaly: 'no', effusion: 'no', hgb: 12, platelet: 220, leukemicPhase: 'no' };
  assert.equal(gelfCriteria(ex).valid, true);
  const hgb = gelfCriteria({ ...ex, hgb: 250 });
  assert.equal(hgb.valid, false);
  assert.match(hgb.message, /plausible range for hemoglobin/);
  const plt = gelfCriteria({ ...ex, platelet: 20000 });
  assert.equal(plt.valid, false);
  assert.match(plt.message, /plausible range for platelet count/);
  assert.equal(gelfCriteria({ ...ex, hgb: 20, platelet: 1500 }).valid, true);
  assert.equal(gelfCriteria({ ...ex, hgb: '' }).valid, false);
  assert.match(gelfCriteria({ ...ex, hgb: '' }).message, /^Enter/);
});
