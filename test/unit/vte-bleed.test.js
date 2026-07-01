// spec-v185 §2.5: VTE-BLEED bleeding-risk score. Weighted sum; the ≥ 2
// cut-point marks elevated risk on stable anticoagulation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vteBleed } from '../../lib/gaps-v185.js';

test('tile example: anemia + age >= 60 crosses the >= 2 cut-point', () => {
  const r = vteBleed({ anemia: true, age60: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
  assert.equal(r.bandLabel, 'Elevated bleeding risk');
});

test('no factors: score 0, not elevated', () => {
  const r = vteBleed({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.equal(r.bandLabel, 'Not elevated');
});

test('active cancer alone (2) is already elevated; full house sums to 9', () => {
  assert.equal(vteBleed({ cancer: true }).score, 2);
  assert.equal(vteBleed({ cancer: true }).abnormal, true);
  const full = vteBleed({ cancer: true, maleHtn: true, anemia: true, bleeding: true, age60: true, renal: true });
  assert.equal(full.score, 9);
});

test('a single 1.5-point factor stays below the cut-point', () => {
  const r = vteBleed({ anemia: true });
  assert.equal(r.score, 1.5);
  assert.equal(r.abnormal, false);
});
