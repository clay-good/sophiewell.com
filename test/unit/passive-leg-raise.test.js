// spec-v113 2.3: passive leg raise stroke-volume response (Monnet 2006).
// %dSV = (peak - baseline) / baseline x 100; >= 10-15% predicts responsiveness.
// Baseline denominator guarded (baseline > 0).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passiveLegRaise } from '../../lib/fluidresp-v113.js';

test('worked example: 60 -> 72 is a +20% rise, predicts responsiveness', () => {
  const r = passiveLegRaise({ baseline: 60, peak: 72 });
  assert.equal(r.valid, true);
  assert.equal(r.change, 20);
  assert.equal(r.responsive, true);
  assert.match(r.band, /Passive leg raise \+20% stroke volume \(60 -> 72\): >= 10-15% -- predicts fluid responsiveness\./);
});

test('a rise just under 10% is below the threshold', () => {
  const r = passiveLegRaise({ baseline: 100, peak: 108 }); // 8%
  assert.equal(r.change, 8);
  assert.equal(r.responsive, false);
  assert.match(r.band, /below the cited fluid-responsiveness threshold/);
});

test('a fall is reported as a correctly-signed negative change', () => {
  const r = passiveLegRaise({ baseline: 60, peak: 54 }); // -10%
  assert.equal(r.change, -10);
  assert.equal(r.falling, true);
  assert.equal(r.responsive, false);
  assert.match(r.band, /argues against fluid responsiveness/);
});

test('baseline denominator guarded: baseline 0 returns a fallback', () => {
  const r = passiveLegRaise({ baseline: 0, peak: 50 });
  assert.equal(r.valid, false);
  assert.match(r.band, /baseline value must be greater than 0/);
});

test('partial input returns a complete-the-fields fallback', () => {
  assert.equal(passiveLegRaise({ baseline: 60 }).valid, false);
  assert.equal(passiveLegRaise({}).valid, false);
});
