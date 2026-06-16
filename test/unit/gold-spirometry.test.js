// spec-v91 §2.1: GOLD spirometric classification of COPD.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goldSpirometry } from '../../lib/pulm-v91.js';

test('obstruction at ratio 0.69, none at 0.70 (the FEV1/FVC cutoff)', () => {
  assert.equal(goldSpirometry({ ratio: 0.69, fev1Pct: 60 }).obstruction, true);
  const noObs = goldSpirometry({ ratio: 0.70, fev1Pct: 60 });
  assert.equal(noObs.obstruction, false);
  assert.equal(noObs.grade, null);
});

test('GOLD grade edges 80 / 50 / 30 %predicted (obstruction present)', () => {
  assert.equal(goldSpirometry({ ratio: 0.6, fev1Pct: 80 }).grade, 1);
  assert.equal(goldSpirometry({ ratio: 0.6, fev1Pct: 79 }).grade, 2);
  assert.equal(goldSpirometry({ ratio: 0.6, fev1Pct: 50 }).grade, 2);
  assert.equal(goldSpirometry({ ratio: 0.6, fev1Pct: 49 }).grade, 3);
  assert.equal(goldSpirometry({ ratio: 0.6, fev1Pct: 30 }).grade, 3);
  assert.equal(goldSpirometry({ ratio: 0.6, fev1Pct: 29 }).grade, 4);
});

test('worked example: FEV1 45% predicted, ratio 0.6 -> GOLD 3 severe', () => {
  const r = goldSpirometry({ fev1Pct: 45, ratio: 0.6 });
  assert.equal(r.grade, 3);
  assert.match(r.band, /GOLD 3 - severe/);
  assert.match(r.band, /FEV1\/FVC 0\.6 < 0\.70/);
});

test('ratio computed from volumes when not entered directly', () => {
  // FEV1 1.8 / FVC 3.0 = 0.6 -> obstruction
  const r = goldSpirometry({ fev1L: 1.8, fvcL: 3.0, fev1Pct: 55 });
  assert.equal(r.obstruction, true);
  assert.equal(r.ratio, 0.6);
  assert.equal(r.grade, 2);
});

test('obstruction present but FEV1 %predicted missing -> no grade, surfaced', () => {
  const r = goldSpirometry({ ratio: 0.55 });
  assert.equal(r.valid, true);
  assert.equal(r.obstruction, true);
  assert.equal(r.grade, null);
  assert.match(r.band, /enter FEV1 %predicted/i);
});

test('no usable ratio -> surfaced complete-the-fields fallback (no NaN)', () => {
  const r = goldSpirometry({ fev1L: 2, fvcL: 0 });
  assert.equal(r.valid, false);
  assert.ok(!/NaN|Infinity/.test(r.band));
});
