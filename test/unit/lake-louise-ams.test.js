// spec-v111 2.1: 2018 Lake Louise Acute Mountain Sickness score (Roach 2018).
// Four symptoms each 0-3, total 0-12; AMS diagnosed only when total >= 3 AND a
// headache is present; severity mild 3-5 / moderate 6-9 / severe 10-12.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lakeLouiseAms } from '../../lib/enviro-v111.js';

test('total 3 with a headache -> AMS diagnosed, mild', () => {
  const r = lakeLouiseAms({ headache: 1, gi: 1, fatigue: 1, dizziness: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 3);
  assert.equal(r.amsPresent, true);
  assert.equal(r.severity, 'mild');
  assert.match(r.band, /AMS diagnosed, mild/);
});

test('band flip: total 3 WITHOUT a headache fails the headache-required gate', () => {
  // headache 0 but GI/fatigue/dizziness sum to 3.
  const noHeadache = lakeLouiseAms({ headache: 0, gi: 1, fatigue: 1, dizziness: 1 });
  assert.equal(noHeadache.total, 3);
  assert.equal(noHeadache.amsPresent, false);
  assert.match(noHeadache.band, /headache-required diagnostic rule is NOT met/);
  // the same 3 points with one moved into headache flips AMS present.
  const withHeadache = lakeLouiseAms({ headache: 1, gi: 1, fatigue: 1, dizziness: 0 });
  assert.equal(withHeadache.amsPresent, true);
});

test('severity bands: 6 -> moderate, 10 -> severe', () => {
  assert.equal(lakeLouiseAms({ headache: 3, gi: 1, fatigue: 1, dizziness: 1 }).severity, 'moderate'); // 6
  assert.equal(lakeLouiseAms({ headache: 3, gi: 3, fatigue: 3, dizziness: 1 }).severity, 'severe'); // 10
});

test('total < 3 is below the diagnostic threshold', () => {
  const r = lakeLouiseAms({ headache: 1, gi: 1, fatigue: 0, dizziness: 0 });
  assert.equal(r.total, 2);
  assert.equal(r.amsPresent, false);
  assert.match(r.band, /below the AMS diagnostic threshold/);
});

test('symptoms clamp to 0-3 and max total is 12', () => {
  const r = lakeLouiseAms({ headache: 9, gi: 9, fatigue: 9, dizziness: 9 });
  assert.equal(r.total, 12);
  assert.equal(r.severity, 'severe');
});

test('partial input returns a complete-the-fields fallback', () => {
  assert.equal(lakeLouiseAms({ headache: 2, gi: 1 }).valid, false);
});
