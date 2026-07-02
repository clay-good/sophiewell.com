// spec-v199 2.3: gipss worked examples across the four risk tiers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gipss } from '../../lib/myeloid-prognosis-v199.js';

test('low risk 0: favorable karyotype, no lesion', () => {
  const r = gipss({ karyotype: 'favorable' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.match(r.band, /low risk/);
  assert.equal(r.abnormal, false);
});

test('intermediate-1 (1): single mutation', () => {
  const r = gipss({ asxl1: true });
  assert.equal(r.score, 1);
  assert.match(r.band, /intermediate-1/);
});

test('intermediate-2 (2): unfavorable karyotype + mutation', () => {
  const r = gipss({ karyotype: 'unfavorable', asxl1: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /intermediate-2/);
});

test('high risk >=3: VHR karyotype + mutation', () => {
  const r = gipss({ karyotype: 'vhr', asxl1: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /high risk/);
});

test('all lesions sum to the 0-6 max', () => {
  const r = gipss({ karyotype: 'vhr', noCalr: true, asxl1: true, srsf2: true, u2af1: true });
  assert.equal(r.score, 6);
});
