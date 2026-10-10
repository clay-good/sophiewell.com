// spec-v110 2.2, corrected by spec-v1641 row 2: IV acetylcysteine per the Acetadote label (three-bag; two-bag
// alternative for 41 kg and over). The dose is fixed at 100 kg and above.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nacDosing } from '../../lib/tox-v110.js';

test('three-bag at 70 kg: 10500 / 3500 / 7000 mg in 200 / 500 / 1000 mL', () => {
  const r = nacDosing({ weight: 70, regimen: 'three-bag' });
  assert.equal(r.valid, true);
  assert.deepEqual(r.bags.map((b) => b.mg), [10500, 3500, 7000]);
  assert.deepEqual(r.bags.map((b) => b.diluentMl), [200, 500, 1000]);
  assert.equal(r.totalMg, 21000); // 300 mg/kg x 70
  assert.equal(r.capped, false);
});

test('two-bag at 70 kg: 14000 / 7000 mg in 1000 / 500 mL, named as the label alternative', () => {
  const r = nacDosing({ weight: 70, regimen: 'two-bag' });
  assert.deepEqual(r.bags.map((b) => b.mg), [14000, 7000]);
  assert.deepEqual(r.bags.map((b) => b.diluentMl), [1000, 500]);
  assert.match(r.regimen, /label alternative/);
  assert.doesNotMatch(r.band + r.note, /SNAP|Bateman/);
});

test('the dose is fixed at 100 kg and above (label: 15,000 / 5,000 / 10,000 mg)', () => {
  for (const w of [100, 105, 120]) {
    const r = nacDosing({ weight: w, regimen: 'three-bag' });
    assert.equal(r.capped, true);
    assert.deepEqual(r.bags.map((b) => b.mg), [15000, 5000, 10000], `at ${w} kg`);
  }
  assert.deepEqual(nacDosing({ weight: 120, regimen: 'two-bag' }).bags.map((b) => b.mg), [20000, 10000]);
  assert.equal(nacDosing({ weight: 99, regimen: 'three-bag' }).capped, false);
});

test('the two-bag regimen is refused under 41 kg', () => {
  const r = nacDosing({ weight: 40, regimen: 'two-bag' });
  assert.equal(r.valid, false);
  assert.match(r.band, /41 kg and over/);
  assert.equal(nacDosing({ weight: 41, regimen: 'two-bag' }).valid, true);
});

test('diluent volumes by weight band; no dose under 5 kg', () => {
  assert.deepEqual(nacDosing({ weight: 10, regimen: 'three-bag' }).bags.map((b) => b.diluentMl), [30, 70, 140]);
  assert.deepEqual(nacDosing({ weight: 30, regimen: 'three-bag' }).bags.map((b) => b.diluentMl), [100, 250, 500]);
  const tiny = nacDosing({ weight: 4, regimen: 'three-bag' });
  assert.equal(tiny.valid, false);
  assert.match(tiny.band, /under 5 kg/);
});

test('guards zero / blank / negative weight', () => {
  assert.equal(nacDosing({ weight: 0 }).valid, false);
  assert.equal(nacDosing({}).valid, false);
  assert.equal(nacDosing({ weight: -5 }).valid, false);
});
