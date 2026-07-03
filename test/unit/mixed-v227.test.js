// spec-v227: worked examples for the closing cross-domain slice. Point systems
// spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  icbdBehcet, isgBehcet, batt, denverEdTof, ets, whoDengue,
} from '../../lib/mixed-v227.js';

test('icbd: classifies at >= 4', () => {
  const r = icbdBehcet({ oral: true, genital: true, skin: true }); // 2+2+1
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('icbd: below threshold', () => {
  assert.equal(icbdBehcet({ oral: true }).abnormal, false);
});

test('isg: meets with oral + 2 minor', () => {
  const r = isgBehcet({ oralUlceration: true, genital: true, eye: true });
  assert.equal(r.meets, true);
});
test('isg: fails without mandatory oral', () => {
  assert.equal(isgBehcet({ genital: true, eye: true }).meets, false);
});
test('isg: fails with < 2 minor', () => {
  assert.equal(isgBehcet({ oralUlceration: true, genital: true }).meets, false);
});

test('batt: banded score', () => {
  const r = batt({ age: 70, sbp: 80, gcs: 14, hrHigh: true }); // 1+5+0+1
  assert.equal(r.score, 7);
  assert.equal(r.abnormal, true);
});
test('batt: severe hypotension', () => {
  assert.equal(batt({ age: 40, sbp: 50, gcs: 15 }).score, 14);
});
test('batt: invalid without vitals', () => { assert.equal(batt({ age: 40 }).valid, false); });

test('denver: high band', () => {
  const r = denverEdTof({ hematocrit: 18, intubation: true, ageOver65: true }); // 2+3+1
  assert.equal(r.score, 6);
  assert.match(r.band, /high/);
});
test('denver: low band', () => {
  assert.equal(denverEdTof({ hematocrit: 40 }).abnormal, false);
});

test('ets: half-point weights', () => {
  const r = ets({ sbp: 85, age: 40, freeFluid: true }); // 2.5+0.5+2.0
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('ets: below threshold', () => {
  assert.equal(ets({ sbp: 130, age: 15 }).abnormal, false);
});

test('dengue: warning signs', () => {
  const r = whoDengue({ abdominalPain: true, vomiting: true });
  assert.match(r.tier, /warning signs/);
});
test('dengue: severe overrides', () => {
  assert.match(whoDengue({ severeBleeding: true, abdominalPain: true }).tier, /severe/);
});
test('dengue: without warning signs', () => {
  const r = whoDengue({});
  assert.match(r.tier, /without warning/);
  assert.equal(r.abnormal, false);
});
