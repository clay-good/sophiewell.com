// spec-v251: worked examples for the cardiometabolic formulas. Formulas spec-v97
// verified (Gibson 1996; Gupta 2008; Paulmichl 2016; Dobiasova 2001).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { correctedTimiFrameCount, tpeQtRatio, spise, atherogenicIndexOfPlasma } from '../../lib/cardiometab-v251.js';

test('cTFC: LAD divided by 1.7', () => {
  const r = correctedTimiFrameCount({ frames: 34, fps: 30, vessel: 'lad' });
  assert.equal(r.score, 20);
  assert.equal(r.abnormal, false);
});
test('cTFC: slow flow flagged', () => {
  const r = correctedTimiFrameCount({ frames: 40, fps: 30, vessel: 'other' });
  assert.equal(r.score, 40);
  assert.equal(r.abnormal, true);
});

test('tpe-qt-ratio: > 0.25 increased', () => {
  const r = tpeQtRatio({ tpe: 120, qt: 400 });
  assert.equal(r.score, 0.3);
  assert.equal(r.abnormal, true);
});

test('spise: < 5.4 insulin resistance', () => {
  const r = spise({ hdl: 40, tg: 150, bmi: 30 });
  assert.equal(r.score, 4.6);
  assert.equal(r.abnormal, true);
});

test('atherogenic-index-of-plasma: > 0.21 high risk', () => {
  const r = atherogenicIndexOfPlasma({ tg: 1.7, hdl: 1.0 });
  assert.equal(r.score, 0.23);
  assert.equal(r.abnormal, true);
});
test('atherogenic-index-of-plasma: low risk', () => {
  const r = atherogenicIndexOfPlasma({ tg: 1.0, hdl: 1.5 });
  assert.ok(r.score < 0.11);
  assert.equal(r.abnormal, false);
});
