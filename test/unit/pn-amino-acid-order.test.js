// spec-v1630 tool 6: PN amino acids against the label, on fail-closed label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pnAminoAcidOrder as a, PRODUCTS, ELCYS } from '../../lib/pn-amino-acid-order-v1630.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const adult = { product: 'travasol', ageBand: 'adult-stable', weight: 70, weightUnit: 'kg', order: 1, orderUnit: 'g-kg-day', cysteine: 'no' };

test('strength and nitrogen per mL are each label\'s own, and every row answers today', () => {
  assert.deepEqual([PRODUCTS.travasol.gPerMl, PRODUCTS.travasol.nPerMl], [0.1, 0.0165]);
  assert.deepEqual([PRODUCTS.prosol.gPerMl, PRODUCTS.prosol.nPerMl], [0.2, 0.032]);
  assert.deepEqual([PRODUCTS.trophamine.gPerMl, PRODUCTS.trophamine.nPerMl], [0.1, 0.0155]);
  for (const p of [...Object.values(PRODUCTS), ELCYS]) assert.equal(labelRow(p.setId, now).answers, true, p.setId);
});

test('Travasol: 1 g/kg/day in 70 kg is 700 mL and 11.55 g of nitrogen, not 70 / 6.25', () => {
  const r = a(adult, now);
  assert.deepEqual([r.gramsPerDay, r.productMl, r.mLPerKgDay, r.nitrogenGrams, r.doseAgainst, r.volumeAgainst, r.abnormal], [70, 700, 10, 11.55, 'within', 'at or under', false]);
  assert.notEqual(r.nitrogenGrams, 70 / 6.25);
  // The same grams as Prosol 20% take half the volume and hold 11.2 g of nitrogen.
  const prosol = a({ ...adult, product: 'prosol' }, now);
  assert.deepEqual([prosol.productMl, prosol.nitrogenGrams], [350, 11.2]);
});

test('the label ranges by age band: below, within and above', () => {
  const at = (ageBand, order) => a({ ...adult, ageBand, order }, now).doseAgainst;
  assert.deepEqual([at('adult-stable', 0.7), at('adult-stable', 0.8), at('adult-stable', 1), at('adult-stable', 1.1)], ['below', 'within', 'within', 'above']);
  assert.deepEqual([at('adult-critical', 2), at('adult-critical', 2.1)], ['within', 'above']);
  assert.deepEqual([at('neonate', 4), at('infant', 3), at('child', 2), at('adolescent', 1.5)], ['within', 'within', 'within', 'within']);
  assert.deepEqual([at('neonate', 4.1), at('infant', 3.1), at('child', 2.1), at('adolescent', 1.6)], ['above', 'above', 'above', 'above']);
  assert.equal(a({ ...adult, order: 1.1 }, now).abnormal, true);
  assert.equal(a({ ...adult, order: 0.7 }, now).abnormal, false);
});

test('the adult 40 mL/kg/day sentence is applied to adults only', () => {
  const over = a({ ...adult, ageBand: 'adult-critical', weight: 40, order: 4.5 }, now);
  assert.deepEqual([over.mLPerKgDay, over.volumeAgainst], [45, 'above']);
  assert.equal(a({ ...adult, ageBand: 'neonate', weight: 3, order: 4 }, now).volumeAgainst, undefined);
});

test('TrophAmine is dosed by weight: 2 to 2.5 g/kg/day to 10 kg, then 20 to 25 g plus 1 to 1.25 per kg over 10', () => {
  const small = a({ product: 'trophamine', ageBand: 'neonate', weight: 3, weightUnit: 'kg', order: 2.5, orderUnit: 'g-kg-day', cysteine: 'no' }, now);
  assert.deepEqual([small.labelRangeGramsPerDay, small.doseAgainst, small.nitrogenGrams], [[6, 7.5], 'within', 1.163]);
  const larger = a({ product: 'trophamine', ageBand: 'child', weight: 15, weightUnit: 'kg', order: 28, orderUnit: 'g', cysteine: 'no' }, now);
  assert.deepEqual([larger.labelRangeGramsPerDay, larger.doseAgainst], [[25, 31.25], 'within']);
  const grown = a({ product: 'trophamine', ageBand: 'adult-stable', weight: 70, weightUnit: 'kg', order: 70, orderUnit: 'g', cysteine: 'no' }, now);
  assert.equal(grown.doseAgainst, undefined);
  assert.match(grown.notes.join(' '), /no adult figure to compare/);
});

test('Elcys: 22 mg per gram under 12 years (0.44 mL/g), 7 mg at 12 and older (0.14 mL/g)', () => {
  const child = a({ product: 'trophamine', ageBand: 'neonate', weight: 3, weightUnit: 'kg', order: 9, orderUnit: 'g', cysteine: 'under-12' }, now);
  assert.deepEqual([child.elcysMg, child.elcysMl, child.cysteineMg], [198, 3.96, 135]);
  const grown = a({ ...adult, cysteine: '12-plus' }, now);
  assert.deepEqual([grown.elcysMg, grown.elcysMl, grown.cysteineMg], [490, 9.8, 350]);
  // 50 mg/mL: the label's mL per gram is the mg per gram divided by 50.
  assert.equal(child.elcysMg / ELCYS.mgPerMl, child.elcysMl);
  assert.equal(a(adult, now).elcysMl, undefined);
});

test('fail closed: a withheld product label leaves the dose per kilogram and nothing else', () => {
  const id = PRODUCTS.travasol.setId;
  const superseded = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-11-01' } };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const r = a(adult, when, table);
    assert.deepEqual([r.valid, r.withheld, r.gPerKgDay, r.nitrogenGrams, r.doseAgainst], [true, true, 1, undefined, undefined]);
    assert.doesNotMatch(r.notes.join(' '), /0\.0165|0\.8 to 1/);
  }
  assert.equal(a({ ...adult, product: 'prosol' }, now, superseded).nitrogenGrams, 11.2);
  // A withheld Elcys label withholds only the cysteine line.
  const noElcys = { ...LABEL_EDITIONS, [ELCYS.setId]: { ...LABEL_EDITIONS[ELCYS.setId], supersededOn: '2026-11-01' } };
  const r = a({ ...adult, cysteine: '12-plus' }, now, noElcys);
  assert.deepEqual([r.nitrogenGrams, r.elcysMl, r.cysteineWithheld], [11.55, undefined, true]);
});

test('every choice is required', () => {
  for (const k of Object.keys(adult)) {
    const r = a({ ...adult, [k]: '' }, now);
    assert.equal(r.valid, false, k);
    assert.ok(r.message.length <= 280, k);
  }
  assert.equal(a({ ...adult, weight: 70000, weightUnit: 'g' }, now).productMl, 700);
});
