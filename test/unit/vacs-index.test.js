// spec-v137 2.4: VACS Index 1.0 (Tate JP, Justice AC, et al, AIDS 2013;27:563).
// Additive 0-164 across age, CD4, HIV-1 RNA, hemoglobin, FIB-4, eGFR, HCV.
// FIB-4 = (age x AST) / (platelets x sqrt(ALT)). Tests pin the worked total, the
// FIB-4 sub-computation, every band edge, and the 0/164 range.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vacsIndex } from '../../lib/id-v137.js';

const base = { age: 55, cd4: 250, rna: 1000, hgb: 11, ast: 40, alt: 30, platelets: 150, egfr: 70, hepC: 'no' };

test('worked example: total 53, FIB-4 2.68', () => {
  const r = vacsIndex(base);
  assert.equal(r.valid, true);
  // age 12 + CD4 6 + RNA 7 + Hb 22 + FIB-4 6 + eGFR 0 + HCV 0 = 53
  assert.equal(r.total, 53);
  assert.equal(r.fib4, 2.68);
});

test('FIB-4 = (age x AST)/(platelets x sqrt(ALT))', () => {
  // (55 * 40) / (150 * sqrt(30)) = 2200 / 821.58 = 2.678
  const r = vacsIndex(base);
  const expected = (55 * 40) / (150 * Math.sqrt(30));
  assert.ok(Math.abs(r.fib4 - expected) < 0.01);
});

test('hepatitis-C co-infection adds 5 points', () => {
  const without = vacsIndex(base).total;
  const with_ = vacsIndex({ ...base, hepC: 'yes' }).total;
  assert.equal(with_ - without, 5);
});

test('CD4 band edges: < 50 = 29, 50-99 = 28, 100-199 = 10, 200-349 = 6, 350-499 = 6, >= 500 = 0', () => {
  const z = { ...base, age: 40, rna: 100, hgb: 15, ast: 20, alt: 20, platelets: 300, egfr: 90, hepC: 'no' }; // all other components 0
  assert.equal(vacsIndex({ ...z, cd4: 49 }).total, 29);
  assert.equal(vacsIndex({ ...z, cd4: 50 }).total, 28);
  assert.equal(vacsIndex({ ...z, cd4: 100 }).total, 10);
  assert.equal(vacsIndex({ ...z, cd4: 200 }).total, 6);
  assert.equal(vacsIndex({ ...z, cd4: 350 }).total, 6);
  assert.equal(vacsIndex({ ...z, cd4: 500 }).total, 0);
});

test('all-best-band minimum is 0; the published range tops out at 164', () => {
  const lo = vacsIndex({ age: 40, cd4: 600, rna: 100, hgb: 15, ast: 20, alt: 20, platelets: 300, egfr: 90, hepC: 'no' });
  assert.equal(lo.total, 0);
  const hi = vacsIndex({ age: 70, cd4: 10, rna: 200000, hgb: 8, ast: 200, alt: 10, platelets: 50, egfr: 20, hepC: 'yes' });
  // 27 + 29 + 14 + 38 + 25 + 26 + 5 = 164
  assert.equal(hi.total, 164);
});

test('FIB-4 band edges: < 1.45 = 0, 1.45-3.25 = 6, > 3.25 = 25', () => {
  // Construct AST/ALT/platelets to hit each FIB-4 band, other components 0.
  const z = { age: 40, cd4: 600, rna: 100, hgb: 15, egfr: 90, hepC: 'no' };
  assert.equal(vacsIndex({ ...z, ast: 20, alt: 20, platelets: 300 }).total, 0); // FIB-4 ~0.6
  assert.equal(vacsIndex({ ...z, ast: 40, alt: 30, platelets: 150 }).total, 6); // FIB-4 ~1.95
  assert.equal(vacsIndex({ ...z, ast: 200, alt: 30, platelets: 80 }).total, 25); // FIB-4 ~18
});

test('zero/blank platelets or ALT surface the fallback (no divide-by-zero / sqrt(0))', () => {
  assert.equal(vacsIndex({ ...base, platelets: 0 }).valid, false);
  assert.equal(vacsIndex({ ...base, alt: 0 }).valid, false);
  assert.equal(vacsIndex({}).valid, false);
  assert.equal(vacsIndex({ ...base, hepC: '' }).valid, false);
});
