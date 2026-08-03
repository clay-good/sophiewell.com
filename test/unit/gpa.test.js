// spec-v639: 2022 ACR/EULAR Classification Criteria for Granulomatosis with Polyangiitis.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { gpaAcrEular2022 } from '../../lib/gpa-v639.js';

test('META example: nasal + cANCA/PR3 = 8/17 classifies', () => {
  const r = gpaAcrEular2022({ nasal: '1', cAnca: '1' });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /2022 ACR\/EULAR 8\/17/);
  assert.match(r.band, /classify as granulomatosis with polyangiitis/);
});

test('positive items carry their verified weights', () => {
  assert.equal(gpaAcrEular2022({ nasal: '1' }).score, 3);
  assert.equal(gpaAcrEular2022({ cartilage: '1' }).score, 2);
  assert.equal(gpaAcrEular2022({ hearingLoss: '1' }).score, 1);
  assert.equal(gpaAcrEular2022({ cAnca: '1' }).score, 5);
  assert.equal(gpaAcrEular2022({ pulmNodule: '1' }).score, 2);
  assert.equal(gpaAcrEular2022({ granuloma: '1' }).score, 2);
  assert.equal(gpaAcrEular2022({ sinus: '1' }).score, 1);
  assert.equal(gpaAcrEular2022({ pauciGn: '1' }).score, 1);
});

test('the two negative items subtract (pANCA/MPO and eosinophilia)', () => {
  assert.equal(gpaAcrEular2022({ pAnca: '1' }).score, -1);
  assert.equal(gpaAcrEular2022({ eosinophilia: '1' }).score, -4);
  // A positive cANCA (+5) pulled below threshold by eosinophilia (-4): net 1, not classified.
  const r = gpaAcrEular2022({ cAnca: '1', eosinophilia: '1' });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
});

test('threshold is at 5', () => {
  // cANCA alone = 5 -> classifies (boundary).
  const r = gpaAcrEular2022({ cAnca: '1' });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
  // nasal (3) + hearing (1) = 4 -> not classified.
  const r2 = gpaAcrEular2022({ nasal: '1', hearingLoss: '1' });
  assert.equal(r2.score, 4);
  assert.equal(r2.abnormal, false);
});

test('score range: max +17 (all positives), min -5 (both negatives)', () => {
  const max = gpaAcrEular2022({
    nasal: 1, cartilage: 1, hearingLoss: 1, cAnca: 1, pulmNodule: 1, granuloma: 1, sinus: 1, pauciGn: 1,
  });
  assert.equal(max.score, 17);
  const min = gpaAcrEular2022({ pAnca: 1, eosinophilia: 1 });
  assert.equal(min.score, -5);
  assert.equal(min.abnormal, false);
});

test('empty inputs score 0 and do not classify', () => {
  const r = gpaAcrEular2022({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.equal(r.valid, true);
});
