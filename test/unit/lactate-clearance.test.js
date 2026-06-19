// spec-v112 2.4: lactate clearance (Nguyen 2004). (initial - repeat) / initial
// x 100; >= 10% is the cited favorable early range; division by zero guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lactateClearance } from '../../lib/critcare-v112.js';

test('worked example: 4.0 -> 2.0 mmol/L is 50% clearance, favorable', () => {
  const r = lactateClearance({ initial: 4.0, repeat: 2.0 });
  assert.equal(r.valid, true);
  assert.equal(r.clearance, 50);
  assert.equal(r.favorable, true);
  assert.match(r.band, /Lactate clearance 50% \(4 -> 2 mmol\/L\)/);
});

test('a clearance just under 10% is below the favorable range', () => {
  const r = lactateClearance({ initial: 5.0, repeat: 4.6 }); // 8%
  assert.equal(r.clearance, 8);
  assert.equal(r.favorable, false);
  assert.match(r.band, /below the cited favorable/);
});

test('a rising lactate yields a correctly-signed negative clearance, flagged', () => {
  const r = lactateClearance({ initial: 2.0, repeat: 3.0 }); // -50%
  assert.equal(r.clearance, -50);
  assert.equal(r.rising, true);
  assert.match(r.band, /lactate is rising/);
});

test('division by zero is guarded: initial 0 returns a fallback, not NaN/Infinity', () => {
  const r = lactateClearance({ initial: 0, repeat: 2 });
  assert.equal(r.valid, false);
  assert.match(r.band, /must be greater than 0/);
});

test('partial input returns a complete-the-fields fallback', () => {
  assert.equal(lactateClearance({ initial: 4 }).valid, false);
  assert.equal(lactateClearance({}).valid, false);
});
