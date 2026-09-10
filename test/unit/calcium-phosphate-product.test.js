// spec-v161 2.2: Calcium-Phosphate product (CKD-MBD). Product = Ca x PO4 in
// mg^2/dL^2; historical > 55 caution; KDIGO favors tracking individually. SI
// mmol/L toggle converts to mg/dL first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calciumPhosphateProduct } from '../../lib/endo-metab-v161.js';

test('tile example: above the historical 55 threshold', () => {
  // 9.5 * 6.0 = 57.0 mg^2/dL^2 (> 55)
  const r = calciumPhosphateProduct({ calcium: 9.5, phosphate: 6.0 });
  assert.equal(r.valid, true);
  assert.equal(r.product, 57);
  assert.equal(r.abnormal, true);
});

test('at/below 55 not flagged', () => {
  // 9.0 * 4.0 = 36.0
  const r = calciumPhosphateProduct({ calcium: 9.0, phosphate: 4.0 });
  assert.equal(r.product, 36);
  assert.equal(r.abnormal, false);
});

test('SI mmol/L toggle converts before multiplying', () => {
  // Ca 2.5 mmol/L * 4.008 = 10.02 mg/dL ; PO4 1.8 mmol/L * 3.097 = 5.57 mg/dL
  // product ~ 55.9 mg^2/dL^2
  const r = calciumPhosphateProduct({ calcium: 2.5, phosphate: 1.8, unit: 'mmol-l' });
  assert.ok(r.product > 55 && r.product < 57, `product ${r.product}`);
  assert.equal(r.abnormal, true);
});

test('blanks / non-positive fall back', () => {
  assert.equal(calciumPhosphateProduct({ calcium: 0, phosphate: 4 }).valid, false);
  assert.equal(calciumPhosphateProduct({ calcium: 9 }).valid, false);
  assert.equal(calciumPhosphateProduct({}).valid, false);
});

// spec-v1197: the unit selector falls back to mg/dL, and the reading named only
// the OUTPUT unit -- "Ca x PO4 57 mg2/dL2" -- never the one it had assumed for
// the inputs. Calcium and phosphate in mmol/L are 4.008 and 3.097 times smaller,
// so a pair entered in SI with the selector missed reads about twelve times low,
// against the one threshold this tile exists to place them beside.
test('calcium-phosphate-product: the assumed input unit is named', () => {
  const stated = calciumPhosphateProduct({ calcium: 9.5, phosphate: 6, unit: 'mg-dl' });
  assert.equal(stated.unitStated, true);
  assert.doesNotMatch(stated.band, /no unit given/);

  const assumed = calciumPhosphateProduct({ calcium: 9.5, phosphate: 6 });
  assert.equal(assumed.unitStated, false);
  assert.equal(assumed.unit, 'mg-dl');
  // The arithmetic is unchanged; only the reading gained a sentence.
  assert.equal(assumed.product, stated.product);
  assert.match(assumed.band, /no unit given; the calcium and phosphate were read as mg\/dL/);
  assert.match(assumed.band, /about 12\.4 times this/);

  // And 12.4 is the real factor, not a number someone typed.
  assert.equal(Math.round(4.008 * 3.097 * 10) / 10, 12.4);

  // An unrecognised unit is treated as no unit, and says so.
  assert.match(calciumPhosphateProduct({ calcium: 9.5, phosphate: 6, unit: 'made-up' }).band, /no unit given/);
});
