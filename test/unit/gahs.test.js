// spec-v125 2.3: GAHS (Forrest 2005). Banded 5-12; >= 9 high. SI units: urea
// mmol/L, bilirubin umol/L.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gahs } from '../../lib/hep-v125.js';

test('all minimum bands -> 5/12', () => {
  const r = gahs({ age: 40, wbc: 10, urea: 4, inr: 1.2, bilirubin: 100 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 5);
  assert.equal(r.abnormal, false);
});

test('all maximum bands -> 12/12, >= 9 flagged', () => {
  const r = gahs({ age: 55, wbc: 16, urea: 8, inr: 2.2, bilirubin: 300 });
  assert.equal(r.total, 12);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /9 or more/);
});

test('the >= 9 band-flip', () => {
  const below = gahs({ age: 55, wbc: 16, urea: 8, inr: 1.4, bilirubin: 100 }); // 2+2+2+1+1 = 8
  const at = gahs({ age: 55, wbc: 16, urea: 8, inr: 1.6, bilirubin: 100 });    // 2+2+2+2+1 = 9
  assert.equal(below.total, 8);
  assert.equal(below.abnormal, false);
  assert.equal(at.total, 9);
  assert.equal(at.abnormal, true);
});

test('SI bilirubin band: umol/L cutoffs 125/250 (not mg/dL)', () => {
  assert.equal(gahs({ age: 40, wbc: 10, urea: 4, inr: 1.2, bilirubin: 200 }).total, 6); // bili 125-250 -> 2
  assert.equal(gahs({ age: 40, wbc: 10, urea: 4, inr: 1.2, bilirubin: 300 }).total, 7); // bili > 250 -> 3
});

test('non-positive / missing -> valid:false', () => {
  assert.equal(gahs({ age: 40, wbc: 10, urea: 4, inr: 1.2 }).valid, false);
  assert.equal(gahs(9).valid, false);
});
