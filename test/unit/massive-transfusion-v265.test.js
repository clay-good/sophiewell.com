// spec-v265: worked examples for the ABC massive-transfusion trigger (the only tile
// shipped this slice; McLaughlin + PWH parked per spec-v265 §7). ABC items spec-v97
// verified against Nunez 2009 (J Trauma; PMID 19204506): four binary items, >= 2 predicts
// massive transfusion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abcTransfusion } from '../../lib/massive-transfusion-v265.js';

test('abc: no items positive does not predict MT', () => {
  const r = abcTransfusion({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('ABC 0 of 4'));
  assert.ok(r.band.includes('does not predict'));
});
test('abc: a single positive item stays below the trigger', () => {
  const r = abcTransfusion({ penetrating: true });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('does not predict'));
});
test('abc: two positive items cross the >= 2 trigger', () => {
  const r = abcTransfusion({ penetrating: true, sbp90: true });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('ABC 2 of 4'));
  assert.ok(r.band.includes('predicts massive transfusion'));
});
test('abc: all four items sum to 4 and predict MT', () => {
  const r = abcTransfusion({ penetrating: true, sbp90: true, hr120: true, positiveFast: true });
  assert.equal(r.score, 4);
  assert.ok(r.abnormal);
  assert.ok(r.detail.includes('positive FAST (+1)'));
});
