// spec-v228: worked examples for the microcytic-anemia RBC discrimination indices.
// Formulas and cutoffs spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  englandFraser, sirdah, rdwi, srivastava, ehsani,
} from '../../lib/mixed-v228.js';

// England & Fraser: MCV - RBC - (5 x Hb) - 3.4; < 0 favors BTT.
test('england-fraser: favors thalassemia trait below 0', () => {
  const r = englandFraser({ mcv: 65, rbc: 5.5, hb: 12.5 }); // 65-5.5-62.5-3.4
  assert.equal(r.score, -6.4);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /beta-thalassemia trait/);
});
test('england-fraser: favors iron deficiency above 0', () => {
  const r = englandFraser({ mcv: 75, rbc: 4, hb: 10 }); // 75-4-50-3.4 = 17.6
  assert.equal(r.score, 17.6);
  assert.equal(r.abnormal, false);
});
test('england-fraser: invalid without all three inputs', () => {
  assert.equal(englandFraser({ mcv: 65 }).valid, false);
});

// Sirdah: MCV - RBC - (3 x Hb); < 27 favors BTT.
test('sirdah: below 27 favors thalassemia trait', () => {
  const r = sirdah({ mcv: 65, rbc: 5.5, hb: 12.5 }); // 65-5.5-37.5 = 22
  assert.equal(r.score, 22);
  assert.equal(r.abnormal, true);
});
test('sirdah: above 27 favors iron deficiency', () => {
  assert.equal(sirdah({ mcv: 80, rbc: 4, hb: 10 }).abnormal, false);
});

// RDW Index: (MCV x RDW) / RBC; < 220 favors BTT.
test('rdwi: below 220 favors thalassemia trait', () => {
  const r = rdwi({ mcv: 65, rdw: 14, rbc: 5.5 }); // 910/5.5 = 165.5
  assert.equal(r.score, 165.5);
  assert.equal(r.abnormal, true);
});
test('rdwi: above 220 favors iron deficiency', () => {
  assert.equal(rdwi({ mcv: 80, rdw: 18, rbc: 4 }).abnormal, false); // 360
});

// Srivastava: MCH / RBC; < 3.8 favors BTT.
test('srivastava: below 3.8 favors thalassemia trait', () => {
  const r = srivastava({ mch: 20, rbc: 5.5 }); // 3.636 -> 3.6
  assert.equal(r.score, 3.6);
  assert.equal(r.abnormal, true);
});
test('srivastava: above 3.8 favors iron deficiency', () => {
  assert.equal(srivastava({ mch: 22, rbc: 4 }).abnormal, false); // 5.5
});

// Ehsani: MCV - (10 x RBC); < 15 favors BTT.
test('ehsani: below 15 favors thalassemia trait', () => {
  const r = ehsani({ mcv: 65, rbc: 5.5 }); // 65-55 = 10
  assert.equal(r.score, 10);
  assert.equal(r.abnormal, true);
});
test('ehsani: above 15 favors iron deficiency', () => {
  assert.equal(ehsani({ mcv: 80, rbc: 4 }).abnormal, false); // 40
});
test('ehsani: invalid without inputs', () => {
  assert.equal(ehsani({}).valid, false);
});
