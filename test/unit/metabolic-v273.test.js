// spec-v273: worked examples for TyG-BMI. Formula spec-v97 verified against Er 2016
// (PLoS One): TyG-BMI = ln[(TG x glucose)/2] x BMI, both mg/dL (TyG core Simental-Mendia 2008).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tygBmi } from '../../lib/metabolic-v273.js';

test('tyg-bmi: a worked example', () => {
  const r = tygBmi({ tg: 150, glucose: 100, bmi: 25 });
  // TyG = ln((150*100)/2) = ln(7500) = 8.92266; x25 = 223.0665 -> r2 223.07.
  assert.equal(r.valid, true);
  assert.equal(r.score, 223.07);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('TyG-BMI 223.07'));
  assert.ok(r.band.includes('greater insulin resistance'));
  assert.ok(r.detail.includes('TyG 8.92'));
});

test('tyg-bmi: a higher (more insulin-resistant) profile', () => {
  const r = tygBmi({ tg: 250, glucose: 130, bmi: 34 });
  // TyG = ln((250*130)/2) = ln(16250) = 9.69581; x34 = 329.6575 -> r2 329.66.
  assert.equal(r.valid, true);
  assert.equal(r.score, 329.66);
  assert.ok(r.score > 223.07);
});

test('tyg-bmi: missing any field is invalid, not a crash', () => {
  assert.equal(tygBmi({ tg: 150, glucose: 100 }).valid, false);
  assert.equal(tygBmi({}).valid, false);
  assert.equal(tygBmi().valid, false);
});

test('tyg-bmi: out-of-range inputs are rejected', () => {
  assert.equal(tygBmi({ tg: 150, glucose: 100, bmi: 0 }).valid, false);
  assert.equal(tygBmi({ tg: 0, glucose: 100, bmi: 25 }).valid, false);
});
