// spec-v269: worked examples for METS-IR. Formula spec-v97 verified against
// Bello-Chavolla 2018 (Eur J Endocrinol): METS-IR = (ln[(2 x FPG) + TG] x BMI) / ln(HDL),
// with FPG, TG, and HDL in mg/dL and BMI in kg/m^2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metsIr } from '../../lib/metabolic-v269.js';

test('mets-ir: a worked example', () => {
  const r = metsIr({ fpg: 100, tg: 150, hdl: 50, bmi: 25 });
  // ln(2*100 + 150) = ln(350) = 5.85793; x25 = 146.4483; / ln(50)=3.91202 = 37.4356 -> r2 37.44.
  assert.equal(r.valid, true);
  assert.equal(r.score, 37.44);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('METS-IR 37.44'));
  assert.ok(r.band.includes('greater insulin resistance'));
});

test('mets-ir: a higher (more insulin-resistant) profile', () => {
  const r = metsIr({ fpg: 180, tg: 300, hdl: 35, bmi: 34 });
  // ln(2*180+300)=ln(660)=6.49224; x34=220.7362; /ln(35)=3.555348 = 62.087 -> r2 62.09.
  assert.equal(r.valid, true);
  assert.equal(r.score, 62.09);
  assert.ok(r.score > 37.44);
});

test('mets-ir: missing any field is invalid, not a crash', () => {
  assert.equal(metsIr({ fpg: 100, tg: 150, hdl: 50 }).valid, false);
  assert.equal(metsIr({}).valid, false);
  assert.equal(metsIr().valid, false);
});

test('mets-ir: out-of-range or ln(HDL)=0 inputs are rejected', () => {
  assert.equal(metsIr({ fpg: 100, tg: 150, hdl: 1, bmi: 25 }).valid, false); // ln(1)=0
  assert.equal(metsIr({ fpg: 0, tg: 150, hdl: 50, bmi: 25 }).valid, false);
});
