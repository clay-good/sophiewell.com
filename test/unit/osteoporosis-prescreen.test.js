// spec-v136 2.5: OST / ORAI DXA pre-screen (Koh LKH, et al, Osteoporos Int
// 2001;12:699 for OST/OSTA; Cadarette SM, et al, CMAJ 2000;162:1289 for ORAI).
// OST index = trunc((weight kg - age yr) x 0.2) toward zero; Caucasian cutoff
// < 2 -> increased risk. ORAI: age 45-54=0/55-64=5/65-74=9/>=75=15; weight
// >=70=0/60-69=3/<60=9; not on estrogen=2; score >= 9 -> DXA. Tests pin the OST
// boundary at 2, the truncate-toward-zero direction, the ORAI point table, and
// the >= 9 referral threshold.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { osteoporosisPrescreen } from '../../lib/endo-v136.js';

test('worked example: age 60, weight 72, no estrogen -> OST 2, ORAI 7', () => {
  const r = osteoporosisPrescreen({ age: 60, weight: 72, estrogen: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.ost, 2);   // trunc((72-60)*0.2) = trunc(2.4) = 2
  assert.equal(r.orai, 7);  // age 55-64=5, weight >=70=0, no estrogen=2
  assert.equal(r.abnormal, false); // OST 2 not < 2; ORAI 7 < 9
});

test('OST boundary: index 2 is lower risk, index 1 is increased risk', () => {
  const at2 = osteoporosisPrescreen({ age: 60, weight: 72, estrogen: 'no' }); // 2.4 -> 2
  const at1 = osteoporosisPrescreen({ age: 60, weight: 67, estrogen: 'no' }); // (67-60)*0.2=1.4 -> 1
  assert.equal(at2.ost, 2);
  assert.match(at2.band, /lower risk/);
  assert.equal(at1.ost, 1);
  assert.match(at1.band, /increased risk/);
});

test('OST truncates toward zero, not floor: -3.6 -> -3', () => {
  const r = osteoporosisPrescreen({ age: 73, weight: 55, estrogen: 'no' });
  assert.equal(r.ost, -3); // Math.trunc(-3.6), not Math.floor (-4)
  assert.match(r.band, /high \(OSTA index < -4\)|moderate/);
});

test('ORAI point table: age, weight, estrogen bands', () => {
  // age >=75 (15) + weight <60 (9) + no estrogen (2) = 26 (max)
  assert.equal(osteoporosisPrescreen({ age: 80, weight: 55, estrogen: 'no' }).orai, 26);
  // age 45-54 (0) + weight >=70 (0) + on estrogen (0) = 0 (min)
  assert.equal(osteoporosisPrescreen({ age: 50, weight: 75, estrogen: 'yes' }).orai, 0);
  // age 65-74 (9) + weight 60-69 (3) + on estrogen (0) = 12
  assert.equal(osteoporosisPrescreen({ age: 68, weight: 65, estrogen: 'yes' }).orai, 12);
});

test('ORAI referral threshold is >= 9', () => {
  const refer = osteoporosisPrescreen({ age: 68, weight: 75, estrogen: 'yes' }); // 9+0+0 = 9
  assert.equal(refer.orai, 9);
  assert.match(refer.band, /select for DXA/);
  const below = osteoporosisPrescreen({ age: 60, weight: 75, estrogen: 'yes' }); // 5+0+0 = 5
  assert.equal(below.orai, 5);
  assert.match(below.band, /below the ORAI referral threshold/);
});

test('blank age / weight / estrogen surfaces the fallback', () => {
  assert.equal(osteoporosisPrescreen({}).valid, false);
  assert.equal(osteoporosisPrescreen({ age: 60, weight: 72 }).valid, false);
  assert.equal(osteoporosisPrescreen({ age: 60, estrogen: 'no' }).valid, false);
  assert.equal(osteoporosisPrescreen({ weight: 72, estrogen: 'no' }).valid, false);
});
