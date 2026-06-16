// spec-v94 §2.2: Revised IPSS-R for myelodysplastic syndromes (Greenberg 2012).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ipssrMds } from '../../lib/hemonc-v94.js';

test('worked example: good cytogenetics, 7% blasts -> intermediate (total 4)', () => {
  const r = ipssrMds({ cytogenetics: 'good', blasts: 7, hemoglobin: 9, platelets: 150, anc: 1.5 });
  assert.equal(r.total, 4);
  assert.equal(r.bandKey, 'intermediate');
  assert.equal(r.survival, '3.0 years');
  assert.match(r.band, /Intermediate risk/);
});

test('best case maps to very low', () => {
  const r = ipssrMds({ cytogenetics: 'very-good', blasts: 0, hemoglobin: 14, platelets: 300, anc: 3 });
  assert.equal(r.total, 0);
  assert.equal(r.bandKey, 'very-low');
});

test('category edges at 1.5 / 3 / 4.5 / 6', () => {
  // 1.5 -> very low (<=1.5): poor cyto would be too high; use hgb 1.5 + cyto 0.
  assert.equal(ipssrMds({ cytogenetics: 'very-good', blasts: 0, hemoglobin: 7, platelets: 300, anc: 3 }).bandKey, 'very-low'); // 1.5
  assert.equal(ipssrMds({ cytogenetics: 'good', blasts: 0, hemoglobin: 7, platelets: 300, anc: 3 }).bandKey, 'low'); // 2.5
  assert.equal(ipssrMds({ cytogenetics: 'intermediate', blasts: 0, hemoglobin: 7, platelets: 300, anc: 3 }).bandKey, 'intermediate'); // 3.5
  assert.equal(ipssrMds({ cytogenetics: 'very-poor', blasts: 0, hemoglobin: 7, platelets: 300, anc: 3 }).bandKey, 'high'); // 5.5
  assert.equal(ipssrMds({ cytogenetics: 'very-poor', blasts: 12, hemoglobin: 7, platelets: 300, anc: 3 }).bandKey, 'very-high'); // 7.5
});

test('missing inputs surface a guard', () => {
  assert.equal(ipssrMds({}).valid, false);
  assert.equal(ipssrMds({ cytogenetics: 'good', blasts: 5, hemoglobin: 9, platelets: 150 }).valid, false);
});
