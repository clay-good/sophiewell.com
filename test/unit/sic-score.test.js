// spec-v112 2.2: ISTH SIC score (Iba 2019). Platelet + PT-INR + SOFA(capped 2),
// total 0-6; SIC met when total >= 4 AND the platelet+PT-INR subscore >= 3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sicScore } from '../../lib/critcare-v112.js';

test('worked example: platelet 80, INR 1.6, SOFA 0 -> total 4, SIC met', () => {
  const r = sicScore({ platelet: 80, inr: 1.6, sofa: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.pltPts, 2);
  assert.equal(r.inrPts, 2);
  assert.equal(r.sofaPts, 0);
  assert.equal(r.total, 4);
  assert.equal(r.met, true);
  assert.match(r.band, /SIC criteria MET/);
});

test('the coag-subscore floor: total 4 but platelet+INR subscore only 2 is NOT met', () => {
  // platelet 1 + INR 1 + SOFA(capped) 2 = total 4, but coag subtotal = 2 (< 3).
  const r = sicScore({ platelet: 120, inr: 1.3, sofa: 3 });
  assert.equal(r.total, 4);
  assert.equal(r.coagSub, 2);
  assert.equal(r.met, false);
  assert.match(r.band, /not met/);
});

test('SOFA is capped at 2 (a SOFA of 20 scores 2, not 20)', () => {
  const r = sicScore({ platelet: 90, inr: 1.5, sofa: 20 });
  assert.equal(r.sofaPts, 2);
  assert.equal(r.total, 6);
  assert.equal(r.met, true);
});

test('band thresholds: platelet 150 = 0, INR 1.2 = 0 (inclusive)', () => {
  const r = sicScore({ platelet: 150, inr: 1.2, sofa: 0 });
  assert.equal(r.pltPts, 0);
  assert.equal(r.inrPts, 0);
  assert.equal(r.total, 0);
  assert.equal(r.met, false);
});

test('partial input returns a complete-the-fields fallback', () => {
  assert.equal(sicScore({ platelet: 80, inr: 1.6 }).valid, false);
  assert.equal(sicScore({}).valid, false);
});
