// spec-v640: 2022 ACR/EULAR Classification Criteria for Microscopic Polyangiitis.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mpaAcrEular2022 } from '../../lib/mpa-v640.js';

test('META example: positive pANCA/MPO alone = 6/12 classifies', () => {
  const r = mpaAcrEular2022({ pAncaMpo: '1' });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /2022 ACR\/EULAR 6\/12/);
  assert.match(r.band, /classify as microscopic polyangiitis/);
});

test('positive items carry their verified weights', () => {
  assert.equal(mpaAcrEular2022({ pAncaMpo: '1' }).score, 6);
  assert.equal(mpaAcrEular2022({ pauciGn: '1' }).score, 3);
  assert.equal(mpaAcrEular2022({ fibrosisIld: '1' }).score, 3);
});

test('the three negative items subtract (nasal, cANCA/PR3, eosinophilia)', () => {
  assert.equal(mpaAcrEular2022({ nasal: '1' }).score, -3);
  assert.equal(mpaAcrEular2022({ cAncaPr3: '1' }).score, -1);
  assert.equal(mpaAcrEular2022({ eosinophilia: '1' }).score, -4);
  // Positive MPO (+6) pulled below threshold by nasal involvement (-3): net 3, not classified.
  const r = mpaAcrEular2022({ pAncaMpo: '1', nasal: '1' });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
});

test('threshold is at 5', () => {
  // MPO alone = 6 -> classifies. GN + ILD = 6 -> classifies.
  assert.equal(mpaAcrEular2022({ pauciGn: '1', fibrosisIld: '1' }).abnormal, true);
  // GN alone = 3 -> not classified.
  const r = mpaAcrEular2022({ pauciGn: '1' });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
});

test('score range: max +12 (three positives), min -8 (three negatives)', () => {
  const max = mpaAcrEular2022({ pAncaMpo: 1, pauciGn: 1, fibrosisIld: 1 });
  assert.equal(max.score, 12);
  const min = mpaAcrEular2022({ nasal: 1, cAncaPr3: 1, eosinophilia: 1 });
  assert.equal(min.score, -8);
  assert.equal(min.abnormal, false);
});

test('empty inputs score 0 and do not classify', () => {
  const r = mpaAcrEular2022({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.equal(r.valid, true);
});
