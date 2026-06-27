// spec-v164 2.2: visual-acuity converter. Snellen 20/40 ↔ logMAR 0.3 ↔ decimal
// 0.5 round-trip across all entry notations; the log/division domains are guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visualAcuityConverter } from '../../lib/ophtho-v164.js';

test('tile example: Snellen 20/40 → decimal 0.5, logMAR 0.3, metric 6/12', () => {
  const r = visualAcuityConverter({ mode: 'snellen20', value: 40 });
  assert.equal(r.valid, true);
  assert.equal(r.decimal, 0.5);
  assert.equal(r.logmar, 0.3);
  assert.equal(r.snellen20, 40);
  assert.equal(r.snellen6, 12);
});

test('round-trip: entering logMAR 0.3 or decimal 0.5 yields the same Snellen', () => {
  const fromLog = visualAcuityConverter({ mode: 'logmar', value: 0.3 });
  assert.equal(fromLog.snellen20, 40);
  assert.equal(fromLog.decimal, 0.5);
  const fromDec = visualAcuityConverter({ mode: 'decimal', value: 0.5 });
  assert.equal(fromDec.snellen20, 40);
  assert.equal(fromDec.logmar, 0.3);
});

test('20/20 is decimal 1.0 / logMAR 0; better-than-20/20 gives negative logMAR', () => {
  const normal = visualAcuityConverter({ mode: 'snellen20', value: 20 });
  assert.equal(normal.decimal, 1);
  assert.equal(normal.logmar, 0);
  const better = visualAcuityConverter({ mode: 'logmar', value: -0.1 });
  assert.ok(better.decimal > 1);
});

test('metric 6/x agrees with imperial: 6/12 = 20/40', () => {
  const r = visualAcuityConverter({ mode: 'snellen6', value: 12 });
  assert.equal(r.snellen20, 40);
  assert.equal(r.decimal, 0.5);
});

test('guards: missing mode, blank/zero value, out-of-range logMAR', () => {
  assert.equal(visualAcuityConverter({ value: 40 }).valid, false);
  assert.equal(visualAcuityConverter({ mode: 'snellen20', value: 0 }).valid, false);
  assert.equal(visualAcuityConverter({ mode: 'decimal', value: 0 }).valid, false);
  assert.equal(visualAcuityConverter({ mode: 'logmar', value: 9 }).valid, false);
  assert.equal(visualAcuityConverter({}).valid, false);
});
