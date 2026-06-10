// spec-v64: IV calcium replacement -- elemental calcium and the
// gluconate<->chloride equivalence. Calcium chloride 10% carries ~273 mg
// (13.6 mEq) elemental Ca per gram and calcium gluconate 10% ~93 mg
// (4.65 mEq), so per gram chloride delivers ~3x the elemental calcium --
// the dangerous "1 g vs 1 g" confusion this tile computes away.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calciumReplacement } from '../../lib/clinical-v7.js';

test('gluconate 1 g: elemental Ca, volume, and the chloride equivalence (tile example)', () => {
  const r = calciumReplacement({ product: 'gluconate', doseGrams: 1, indication: 'hyperkalemia' });
  assert.equal(r.product, 'calcium gluconate 10%');
  assert.equal(r.elementalMg, 93);
  assert.equal(r.elementalMEq, 4.6);
  assert.equal(r.volumeMl, 10);
  // Same elemental calcium as 0.34 g calcium chloride (93 / 273).
  assert.equal(r.equivProduct, 'calcium chloride 10%');
  assert.equal(r.equivGrams, 0.34);
  assert.equal(r.equivVolumeMl, 3.4);
  assert.match(r.band, /93 mg \(4\.6 mEq\) elemental calcium = 0\.34 g calcium chloride/);
  assert.match(r.indicationText, /ACLS 2020/);
});

test('chloride 1 g delivers ~3x the elemental calcium of gluconate', () => {
  const r = calciumReplacement({ product: 'chloride', doseGrams: 1 });
  assert.equal(r.elementalMg, 273);
  assert.equal(r.elementalMEq, 13.6);
  // 1 g chloride == 2.94 g gluconate (273 / 93) for the same elemental Ca.
  assert.equal(r.equivProduct, 'calcium gluconate 10%');
  assert.equal(r.equivGrams, 2.94);
  assert.equal(r.equivVolumeMl, 29.4);
  // No indication selected -> no indication line.
  assert.equal(r.indicationText, null);
});

test('dose scales linearly (2 g gluconate = 186 mg elemental Ca)', () => {
  const r = calciumReplacement({ product: 'gluconate', doseGrams: 2 });
  assert.equal(r.elementalMg, 186);
  assert.equal(r.volumeMl, 20);
});

test('unknown product returns null (fuzz-safe, no throw)', () => {
  assert.equal(calciumReplacement({ product: 'carbonate', doseGrams: 1 }), null);
  assert.equal(calciumReplacement({ product: '', doseGrams: 1 }), null);
  assert.equal(calciumReplacement({ product: 1, doseGrams: 1 }), null);
});

test('impossible dose throws a TypeError/RangeError (caught by the renderer)', () => {
  assert.throws(() => calciumReplacement({ product: 'gluconate', doseGrams: NaN }));
  assert.throws(() => calciumReplacement({ product: 'gluconate', doseGrams: -1 }));
  assert.throws(() => calciumReplacement({ product: 'gluconate', doseGrams: Infinity }));
});
