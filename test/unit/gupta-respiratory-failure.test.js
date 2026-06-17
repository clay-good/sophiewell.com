// spec-v97 2.2: Gupta Postoperative Respiratory Failure (Gupta H et al, Chest
// 2011). risk = 1 / (1 + e^-x).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guptaRespiratoryFailure } from '../../lib/periop-v97.js';

test('worked elective probability matches the published equation', () => {
  // ASA III (-0.6201), no sepsis (-0.7840), independent (0), elective i.e.
  // emergency=no (-0.5739), intestinal (+0.5737):
  // x = -1.7397 - 0.6201 - 0.7840 + 0 - 0.5739 + 0.5737 = -3.144.
  const r = guptaRespiratoryFailure({ asa: '3', sepsis: 'none', functional: 'independent', emergency: 'no', surgery: 'intestinal' });
  assert.equal(r.valid, true);
  assert.equal(r.x, -3.144);
  assert.equal(r.risk, 4.13);
});

test('emergency + septic shock + dependence raise the probability', () => {
  const elective = guptaRespiratoryFailure({ asa: '2', sepsis: 'none', functional: 'independent', emergency: 'no', surgery: 'hernia' });
  const sick = guptaRespiratoryFailure({ asa: '4', sepsis: 'septic-shock', functional: 'total', emergency: 'yes', surgery: 'aortic' });
  assert.ok(sick.risk > elective.risk);
});

test('overflow guard and out-of-enum safety', () => {
  const ok = guptaRespiratoryFailure({ asa: '5', sepsis: 'septic-shock', functional: 'total', emergency: 'yes', surgery: 'aortic' });
  assert.ok(Number.isFinite(ok.risk) && ok.risk >= 0 && ok.risk <= 100);
  const bad = guptaRespiratoryFailure({ asa: '3', sepsis: 'maybe', functional: 'independent', emergency: 'no', surgery: 'intestinal' });
  assert.equal(bad.valid, false);
  assert.ok(!/NaN/.test(bad.band));
});
