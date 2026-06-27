// spec-v164 2.1: SRK II IOL power. The chief correctness risk is the A-constant
// axial-length band table, unit-tested at each boundary (20, 21, 22, 24.5 mm).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iolPower } from '../../lib/ophtho-v164.js';

test('tile example: standard eye, emmetropic target', () => {
  // A1 = 118.4 + 0 (AL 22-24.5); P = 118.4 − 0.9·44 − 2.5·23.5 = 20.05
  const r = iolPower({ aConst: 118.4, al: 23.5, k: 44, target: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.emmetropic, 20.05);
  assert.equal(r.power, 20.05);
  assert.equal(r.adjust, 0);
});

test('axial-length band boundaries: 20, 21, 22, 24.5 mm', () => {
  assert.equal(iolPower({ aConst: 118, al: 19.9, k: 44 }).adjust, 3); // <20
  assert.equal(iolPower({ aConst: 118, al: 20, k: 44 }).adjust, 2); // [20,21)
  assert.equal(iolPower({ aConst: 118, al: 21, k: 44 }).adjust, 1); // [21,22)
  assert.equal(iolPower({ aConst: 118, al: 22, k: 44 }).adjust, 0); // [22,24.5)
  assert.equal(iolPower({ aConst: 118, al: 24.5, k: 44 }).adjust, -0.5); // >=24.5
});

test('non-zero target refraction applies the 1.25 refractive factor', () => {
  // emmetropic 20.05; target −2 → 20.05 − 1.25·(−2) = 22.55
  const r = iolPower({ aConst: 118.4, al: 23.5, k: 44, target: -2 });
  assert.equal(r.power, 22.55);
  assert.equal(r.emmetropic, 20.05);
});

test('guards: blank/non-positive AL, K, A-constant; out-of-range target', () => {
  assert.equal(iolPower({ aConst: 118, al: 0, k: 44 }).valid, false);
  assert.equal(iolPower({ aConst: 118, k: 44 }).valid, false);
  assert.equal(iolPower({ aConst: 118, al: 23.5, k: 44, target: 50 }).valid, false);
  assert.equal(iolPower({}).valid, false);
});
