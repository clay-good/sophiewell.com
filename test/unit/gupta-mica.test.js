// spec-v97 2.1: Gupta Perioperative Cardiac Risk (MICA; Gupta PK et al,
// Circulation 2011). risk = 1 / (1 + e^-x).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guptaMica } from '../../lib/periop-v97.js';

test('worked logistic probability matches the published equation', () => {
  // age 65, ASA III (-1.92), partially dependent (+0.65), normal creatinine (0),
  // intestinal surgery (+1.14): x = -5.25 + 1.30 - 1.92 + 0.65 + 0 + 1.14 = -4.08.
  const r = guptaMica({ age: 65, asa: '3', functional: 'partial', creatinine: 'normal', surgery: 'intestinal' });
  assert.equal(r.valid, true);
  assert.equal(r.x, -4.08);
  const expected = 100 / (1 + Math.exp(4.08));
  assert.ok(Math.abs(r.risk - Math.round(expected * 100) / 100) < 0.01);
  assert.equal(r.risk, 1.66);
});

test('higher ASA and totally dependent raise the probability', () => {
  const low = guptaMica({ age: 40, asa: '2', functional: 'independent', creatinine: 'normal', surgery: 'hernia' });
  const high = guptaMica({ age: 80, asa: '4', functional: 'total', creatinine: 'elevated', surgery: 'aortic' });
  assert.ok(high.risk > low.risk);
});

test('overflow guard: a huge linear predictor yields a finite probability in [0,100]', () => {
  const r = guptaMica({ age: 1e9, asa: '5', functional: 'total', creatinine: 'elevated', surgery: 'aortic' });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.risk));
  assert.ok(r.risk >= 0 && r.risk <= 100);
});

test('an out-of-enum categorical surfaces valid:false, not NaN', () => {
  const r = guptaMica({ age: 65, asa: '9', functional: 'partial', creatinine: 'normal', surgery: 'intestinal' });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});
