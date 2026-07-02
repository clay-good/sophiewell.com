// spec-v204 2.3: Maximum Allowable Blood Loss worked examples. EBV = weight *
// factor; ABL = EBV * (Hct_i - Hct_f)/Hct_i. Blood-volume factors + Gross
// formula spec-v97 cross-verified (MDCalc, Iowa protocols, OpenAnesthesia).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maxAllowableBloodLoss as abl } from '../../lib/nephro-fluids-v204.js';

test('adult male worked example (EBV and ABL shown)', () => {
  const r = abl({ category: 'adult-male', weight: 70, hctInitial: 42, hctTarget: 30 });
  assert.equal(r.valid, true);
  assert.equal(r.ebv, 5250);       // 70 * 75
  assert.equal(r.score, 1500);     // 5250 * 12/42
  assert.match(r.detail, /average-Hct form/);
});

test('infant example matches the published case (~122 mL)', () => {
  const r = abl({ category: 'infant', weight: 5, hctInitial: 36, hctTarget: 25 });
  assert.equal(r.ebv, 400);
  assert.equal(r.score, 122.2);
});

test('blood-volume factor varies by category', () => {
  const base = { weight: 10, hctInitial: 40, hctTarget: 30 };
  assert.equal(abl({ ...base, category: 'neonate' }).ebv, 850);
  assert.equal(abl({ ...base, category: 'child' }).ebv, 700);
  assert.equal(abl({ ...base, category: 'adult-female' }).ebv, 650);
});

test('target >= initial hematocrit -> guarded', () => {
  const r = abl({ category: 'adult-male', weight: 70, hctInitial: 30, hctTarget: 42 });
  assert.equal(r.valid, false);
  assert.match(r.message, /below the initial/);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = abl({ category: 'adult-male', weight: 70 });
  assert.equal(r.valid, false);
});

test('ABL is finite and non-negative', () => {
  const r = abl({ category: 'adult-female', weight: 60, hctInitial: 45, hctTarget: 21 });
  assert.ok(Number.isFinite(r.score) && r.score >= 0);
});
