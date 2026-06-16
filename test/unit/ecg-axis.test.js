// spec-v90 §2.1: mean frontal-plane QRS axis (hexaxial atan2 geometry).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ecgAxis } from '../../lib/cardio-v90.js';

test('worked example: lead I 8, aVF 6 -> +36.9 deg, normal', () => {
  // atan2(6, 8) = 36.8699 deg -> 36.9
  const r = ecgAxis({ leadI: 8, avf: 6 });
  assert.equal(r.valid, true);
  assert.equal(r.indeterminate, false);
  assert.equal(r.axis, 36.9);
  assert.equal(r.quadrant, 'normal');
});

test('quadrant boundary: -30 deg reads normal (inclusive)', () => {
  // atan2(-1, sqrt(3)) = -30 deg exactly; rounds to -30 -> normal
  const r = ecgAxis({ leadI: Math.sqrt(3), avf: -1 });
  assert.equal(r.axis, -30);
  assert.equal(r.quadrant, 'normal');
});

test('quadrant boundary: +90 deg reads normal', () => {
  const r = ecgAxis({ leadI: 0, avf: 1 });
  assert.equal(r.axis, 90);
  assert.equal(r.quadrant, 'normal');
});

test('quadrant boundary: +180 deg reads right-axis deviation', () => {
  const r = ecgAxis({ leadI: -1, avf: 0 });
  assert.equal(r.axis, 180);
  assert.equal(r.quadrant, 'rad');
});

test('quadrant boundary: -90 deg reads extreme / northwest', () => {
  const r = ecgAxis({ leadI: 0, avf: -1 });
  assert.equal(r.axis, -90);
  assert.equal(r.quadrant, 'extreme');
});

test('left-axis deviation: lead I positive, aVF negative', () => {
  const r = ecgAxis({ leadI: 1, avf: -1 });
  assert.equal(r.axis, -45);
  assert.equal(r.quadrant, 'lad');
});

test('the (0,0) all-isoelectric input returns indeterminate, never NaN or 0', () => {
  const r = ecgAxis({ leadI: 0, avf: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.indeterminate, true);
  assert.equal(r.axis, null);
  assert.equal(r.quadrant, 'indeterminate');
  assert.match(r.band, /[Ii]ndeterminate/);
});

test('a blank limb lead renders the complete-the-fields fallback', () => {
  assert.equal(ecgAxis({ leadI: 5 }).valid, false);
  assert.equal(ecgAxis({ avf: 5 }).valid, false);
  assert.equal(ecgAxis({}).valid, false);
});

test('lead II is accepted but does not change the result', () => {
  const a = ecgAxis({ leadI: 8, avf: 6 });
  const b = ecgAxis({ leadI: 8, avf: 6, leadII: 10 });
  assert.equal(a.axis, b.axis);
  assert.equal(a.quadrant, b.quadrant);
});
