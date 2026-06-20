// spec-v129 2.6: urine osmolal gap (Halperin 1988). calculated osm =
// 2*(Na+K) + urea nitrogen(mg/dL)/2.8 + glucose(mg/dL)/18; gap = measured -
// calculated; gap/2 ~ urinary NH4+. Wide gap -> extrarenal cause; narrow gap
// -> renal tubular acidosis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { urineOsmolalGap } from '../../lib/acidbase-v129.js';

test('wide gap -> intact NH4+ excretion (extrarenal cause)', () => {
  const r = urineOsmolalGap({ measuredOsm: 600, urineNa: 40, urineK: 20, urineUrea: 280, urineGlucose: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.calc, 220); // 2*60 + 280/2.8 + 0 = 120 + 100
  assert.equal(r.gap, 380);
  assert.equal(r.nh4, 190);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /intact urinary ammonium/);
});

test('narrow gap -> impaired acidification (renal tubular acidosis)', () => {
  const r = urineOsmolalGap({ measuredOsm: 350, urineNa: 60, urineK: 40, urineUrea: 196, urineGlucose: 0 });
  assert.equal(r.calc, 270); // 2*100 + 196/2.8 = 200 + 70
  assert.equal(r.gap, 80);
  assert.equal(r.nh4, 40);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /renal tubular acidosis/);
});

test('glucose contributes via /18; threshold at 100 mOsm/kg', () => {
  const r = urineOsmolalGap({ measuredOsm: 400, urineNa: 50, urineK: 30, urineUrea: 140, urineGlucose: 180 });
  // calc = 2*80 + 140/2.8 + 180/18 = 160 + 50 + 10 = 220; gap = 180 -> wide
  assert.equal(r.calc, 220);
  assert.equal(r.gap, 180);
  assert.equal(r.abnormal, false);
});

test('zero solutes allowed; missing measured -> valid:false; scalar -> valid:false', () => {
  assert.equal(urineOsmolalGap({ measuredOsm: 300, urineNa: 0, urineK: 0, urineUrea: 0, urineGlucose: 0 }).gap, 300);
  assert.equal(urineOsmolalGap({ urineNa: 40, urineK: 20, urineUrea: 280, urineGlucose: 0 }).valid, false);
  assert.equal(urineOsmolalGap(9).valid, false);
});
