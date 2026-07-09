// spec-v272: worked examples for the waist-to-height ratio (WHtR). Boundaries spec-v97
// verified against Ashwell & Gibson 2016 (BMJ Open) and NICE: WHtR = waist / height, with
// the 0.5 boundary and the Ashwell shape-chart bands.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whtr } from '../../lib/anthro-v272.js';

test('whtr: an increased-risk example (0.5 to 0.6)', () => {
  const r = whtr({ waist: 90, height: 170 });
  // 90/170 = 0.5294 -> r2 0.53.
  assert.equal(r.valid, true);
  assert.equal(r.score, 0.53);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('increased central-adiposity risk'));
});

test('whtr: a healthy example (0.4 to 0.5)', () => {
  const r = whtr({ waist: 80, height: 175 });
  // 80/175 = 0.4571 -> r2 0.46.
  assert.equal(r.score, 0.46);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('healthy range'));
});

test('whtr: a high-risk example (>= 0.6)', () => {
  const r = whtr({ waist: 110, height: 165 });
  // 110/165 = 0.6667 -> r2 0.67.
  assert.equal(r.score, 0.67);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('high central-adiposity risk'));
});

test('whtr: invalid / out-of-range inputs', () => {
  assert.equal(whtr({ waist: 90 }).valid, false);
  assert.equal(whtr({}).valid, false);
  assert.equal(whtr({ waist: 90, height: 0 }).valid, false);
});
