// spec-v110 2.2: IV N-acetylcysteine dosing (Prescott 1979 three-bag; Bateman
// 2014 two-bag SNAP). Weight-based, dosing weight capped at 110 kg.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nacDosing } from '../../lib/tox-v110.js';

test('three-bag at 70 kg: 10500 / 3500 / 7000 mg', () => {
  const r = nacDosing({ weight: 70, regimen: 'three-bag' });
  assert.equal(r.valid, true);
  assert.deepEqual(r.bags.map((b) => b.mg), [10500, 3500, 7000]);
  assert.equal(r.totalMg, 21000); // 300 mg/kg x 70
  assert.equal(r.capped, false);
});

test('two-bag (SNAP) at 70 kg: 14000 / 7000 mg', () => {
  const r = nacDosing({ weight: 70, regimen: 'two-bag' });
  assert.deepEqual(r.bags.map((b) => b.mg), [14000, 7000]);
  assert.equal(r.totalMg, 21000); // 300 mg/kg x 70
});

test('band flip: > 110 kg cap clamps the bag dose', () => {
  const r = nacDosing({ weight: 120, regimen: 'three-bag' });
  assert.equal(r.capped, true);
  assert.equal(r.dosingWt, 110);
  assert.deepEqual(r.bags.map((b) => b.mg), [16500, 5500, 11000]);
  assert.match(r.band, /capped at 110 kg \(entered 120 kg\)/);
});

test('exactly 110 kg is not capped (boundary)', () => {
  const r = nacDosing({ weight: 110, regimen: 'three-bag' });
  assert.equal(r.capped, false);
  assert.equal(r.dosingWt, 110);
});

test('guards zero / blank / negative weight', () => {
  assert.equal(nacDosing({ weight: 0 }).valid, false);
  assert.equal(nacDosing({}).valid, false);
  assert.equal(nacDosing({ weight: -5 }).valid, false);
});
