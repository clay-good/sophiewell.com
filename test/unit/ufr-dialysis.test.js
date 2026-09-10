// spec-v127 2.4: UFR (Flythe 2011). vol/(weight*hours) mL/kg/hr; >13 flag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ufrDialysis } from '../../lib/nephro-v127.js';

test('above the 13 mL/kg/hr threshold', () => {
  const r = ufrDialysis({ volume: 3.5, hours: 3, weight: 70 });
  assert.equal(r.valid, true);
  assert.equal(r.ufr, 16.67);
  assert.equal(r.abnormal, true);
});

test('at or below threshold not flagged', () => {
  const r = ufrDialysis({ volume: 2.0, hours: 4, weight: 80 });
  assert.equal(r.ufr, 6.25);
  assert.equal(r.abnormal, false);
});

test('zero/blank denominator -> valid:false (no divide-by-zero)', () => {
  assert.equal(ufrDialysis({ volume: 3, hours: 0, weight: 70 }).valid, false);
  assert.equal(ufrDialysis({ volume: 3, hours: 3 }).valid, false);
  assert.equal(ufrDialysis(9).valid, false);
});

// spec-v1210: the rate is volume / (weight x hours), so an impossible
// DENOMINATOR drives it toward zero and the tool read "at or below the
// threshold" -- reassuring, from a session nobody sat through.
test('an impossible session length used to read below the risk threshold', () => {
  const bad = ufrDialysis({ volume: 2, hours: 9999, weight: 70 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /session length in hours must be between 0 and 24/);
  assert.ok(!/at or below/.test(bad.message));
});

test('an impossible weight is refused the same way', () => {
  assert.match(ufrDialysis({ volume: 2, hours: 4, weight: 9999 }).message, /post-dialysis weight in kg must be between 0.3 and 500/);
});

test('a real session still computes', () => {
  assert.equal(ufrDialysis({ volume: 2, hours: 4, weight: 70 }).ufr, 7.14);
});
