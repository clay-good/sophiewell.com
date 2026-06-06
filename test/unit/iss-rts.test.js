// spec-v57 §2.13: Injury Severity Score + Revised Trauma Score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { issRts } from '../../lib/scoring-v5.js';

test('AIS 4/3/2 -> ISS 29 major trauma; RTS 7.84 for normal vitals', () => {
  const r = issRts({ ais1: 4, ais2: 3, ais3: 2, gcs: 14, sbp: 120, rr: 18 });
  assert.equal(r.iss, 29); assert.equal(r.majorTrauma, true);
  assert.equal(r.rts, 7.84);
});
test('any AIS = 6 forces ISS 75', () => {
  const r = issRts({ ais1: 6, ais2: 2, ais3: 1, gcs: 15, sbp: 120, rr: 16 });
  assert.equal(r.iss, 75); assert.equal(r.majorTrauma, true);
});
test('minor injury below major-trauma threshold', () => {
  const r = issRts({ ais1: 2, ais2: 1, ais3: 0, gcs: 15, sbp: 130, rr: 16 });
  assert.equal(r.iss, 5); assert.equal(r.majorTrauma, false);
});
test('RTS drops with deranged physiology', () => {
  const r = issRts({ ais1: 5, ais2: 4, ais3: 3, gcs: 5, sbp: 60, rr: 4 });
  // gcs 5 -> code1 (0.9368), sbp 60 -> code2 (1.4652), rr 4 -> code1 (0.2908)
  assert.equal(r.rts, 2.69);
  assert.equal(r.iss, 50);
});
test('rejects out-of-range AIS / vitals', () => {
  assert.throws(() => issRts({ ais1: 7, ais2: 0, ais3: 0, gcs: 15, sbp: 120, rr: 16 }), /ais1/);
  assert.throws(() => issRts({ ais1: 3, ais2: 0, ais3: 0, gcs: 2, sbp: 120, rr: 16 }), /gcs/);
});
