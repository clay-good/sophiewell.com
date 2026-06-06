// spec-v56 §2.2: vancomycin AUC24/MIC, first-order two-level (Sawchuk-Zaske).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vancAuc } from '../../lib/medication-v5.js';

test('vanc within target: peak 30/trough 10 -> AUC24/MIC ~453', () => {
  const r = vancAuc({ peak: 30, tPeak: 1, trough: 10, tTrough: 10, tInf: 1, tau: 12, mic: 1 });
  assert.ok(Math.abs(r.auc24 - 453) <= 2, `auc24 ${r.auc24}`);
  assert.match(r.band, /within target/);
  assert.ok(r.k > 0 && r.halfLife > 0);
});

test('vanc sub-therapeutic flags when AUC24/MIC < 400', () => {
  const r = vancAuc({ peak: 20, tPeak: 1, trough: 7, tTrough: 10, tInf: 1, tau: 12, mic: 2 });
  assert.ok(r.aucMicRatio < 400, `ratio ${r.aucMicRatio}`);
  assert.match(r.band, /sub-therapeutic/);
});

test('vanc supratherapeutic flags when AUC24/MIC > 600', () => {
  const r = vancAuc({ peak: 45, tPeak: 2, trough: 22, tTrough: 10, tInf: 1, tau: 12, mic: 1 });
  assert.ok(r.aucMicRatio > 600, `ratio ${r.aucMicRatio}`);
  assert.match(r.band, /Supratherapeutic|supratherapeutic/i);
});

test('vanc rejects peak <= trough and impossible draw times', () => {
  assert.throws(() => vancAuc({ peak: 10, tPeak: 1, trough: 10, tTrough: 10, tInf: 1, tau: 12, mic: 1 }), /peak must exceed/);
  assert.throws(() => vancAuc({ peak: 30, tPeak: 5, trough: 10, tTrough: 5, tInf: 1, tau: 12, mic: 1 }), /after peak/);
  assert.throws(() => vancAuc({ peak: 30, tPeak: 1, trough: 10, tTrough: 11, tInf: 2, tau: 12, mic: 1 }), /within the dosing interval/);
});

test('vanc rejects non-finite inputs', () => {
  assert.throws(() => vancAuc({ peak: NaN, tPeak: 1, trough: 10, tTrough: 10, tInf: 1, tau: 12, mic: 1 }), /peak/);
});
