// spec-v119 2.4: CVT outcome risk score (Ferro 2009, ISCVT). Malignancy +2,
// Coma/GCS < 9 +2, Deep venous thrombosis +2, Mental-status disturbance +1, Male
// sex +1, Intracranial hemorrhage +1; total 0-9; dichotomy >= 3 predicts a poor
// outcome (mRS > 2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cvtRisk } from '../../lib/neuro-v119.js';

test('no items -> 0/9, below the poor-outcome threshold', () => {
  const r = cvtRisk({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /below the >= 3/);
});

test('male + ICH -> 2/9, still below the >= 3 band-flip', () => {
  const r = cvtRisk({ male: true, ich: true });
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, false);
});

test('malignancy alone -> 2/9, below the threshold', () => {
  const r = cvtRisk({ malignancy: true });
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, false);
});

test('malignancy + coma -> 4/9, crosses the poor-outcome threshold', () => {
  const r = cvtRisk({ malignancy: true, coma: true });
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /predicts a poor outcome/);
});

test('one 2-point item + one 1-point item -> 3/9, the threshold itself', () => {
  const r = cvtRisk({ deepCvt: true, mentalStatus: true });
  assert.equal(r.total, 3);
  assert.equal(r.abnormal, true);
});

test('all six items -> 9/9 (max)', () => {
  const r = cvtRisk({ malignancy: true, coma: true, deepCvt: true, mentalStatus: true, male: true, ich: true });
  assert.equal(r.total, 9);
  assert.equal(r.abnormal, true);
});

test('scalar / non-object fuzz arg yields a valid 0/9, never NaN', () => {
  const r = cvtRisk('x');
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(Number.isFinite(r.total), true);
});
