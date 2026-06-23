// spec-v142 2.4: Goldman Cardiac Risk Index (Goldman 1977). 9 weighted factors
// summing 0-53, mapped to Class I-IV.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goldmanCardiacRisk } from '../../lib/surg-v142.js';

test('no factors -> 0 points, Class I', () => {
  const r = goldmanCardiacRisk({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.class, 'I');
  assert.equal(r.abnormal, false);
});

test('Class II -> III boundary: 12 points = II, 13 points = III', () => {
  // age70(5) + emergency(4) + intraop(3) = 12 -> Class II
  const ii = goldmanCardiacRisk({ age70: true, emergency: true, intraop: true });
  assert.equal(ii.score, 12);
  assert.equal(ii.class, 'II');
  // MI<6mo(10) + intraop(3) = 13 -> Class III
  const iii = goldmanCardiacRisk({ mi6mo: true, intraop: true });
  assert.equal(iii.score, 13);
  assert.equal(iii.class, 'III');
  assert.match(iii.band, /Class III\b.*about 14%/);
});

test('all nine factors -> 53 points, Class IV', () => {
  const r = goldmanCardiacRisk({ s3jvd: true, mi6mo: true, pvc: true, nonsinus: true, age70: true, emergency: true, intraop: true, aorticstenosis: true, poorstatus: true });
  assert.equal(r.score, 53);
  assert.equal(r.class, 'IV');
  assert.equal(r.counted.length, 9);
});
