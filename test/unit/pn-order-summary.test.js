// spec-v1630 tool 7: a PN order per kilogram, GIR, energy and the calorie-to-nitrogen ratio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pnOrderSummary as s, DEXTROSE, AMINO_ACIDS } from '../../lib/pn-order-summary-v1630.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const adult = { weight: 70, weightUnit: 'kg', dextroseGrams: 250, aminoAcidGrams: 85, nitrogenGrams: 13.6, lipidProduct: 'smoflipid', lipidGrams: 50, hours: 24, volume: 2000 };

test('the factors are label rows that answer today', () => {
  assert.deepEqual([DEXTROSE.kcalPerG, DEXTROSE.maxGPerKgHour, AMINO_ACIDS.kcalPerG], [3.4, 0.5, 4]);
  assert.equal(labelRow(DEXTROSE.setId, now).answers, true);
  assert.equal(labelRow(AMINO_ACIDS.setId, now).answers, true);
});

test('per kilogram, GIR and energy for an adult order', () => {
  const r = s(adult, now);
  assert.deepEqual([r.dextroseGPerKgDay, r.aminoAcidGPerKgDay, r.lipidGPerKgDay, r.mLPerKgDay], [3.571, 1.214, 0.7143, 28.57]);
  // 250 g x 1,000 / (70 kg x 1,440 min) = 2.48 mg/kg/min.
  assert.deepEqual([r.girMgKgMin, r.dextroseGPerKgHour, r.dextroseRateAgainst], [2.48, 0.1488, 'at or under']);
  // 850 + 340 + 250 mL x 2 = 1,690 kcal.
  assert.deepEqual([r.dextroseKcal, r.aminoAcidKcal, r.lipidKcal, r.totalKcal, r.kcalPerKgDay], [850, 340, 500, 1690, 24.14]);
  // (850 + 500) / 13.6 g of nitrogen.
  assert.equal(r.nonProteinKcalPerGNitrogen, 99.26);
  assert.match(r.notes.join(' '), /No target is shown/);
  assert.equal(r.abnormal, false);
});

test('0.5 g/kg/hour of dextrose is 8.33 mg/kg/min, and a rate above it is marked', () => {
  const at = s({ weight: 3, weightUnit: 'kg', dextroseGrams: 36, aminoAcidGrams: 9, hours: 24, volume: 400 }, now);
  assert.deepEqual([at.dextroseGPerKgHour, at.girMgKgMin, at.dextroseRateAgainst, at.abnormal], [0.5, 8.333, 'at or under', false]);
  const over = s({ weight: 3, weightUnit: 'kg', dextroseGrams: 60, aminoAcidGrams: 9, hours: 24, volume: 400 }, now);
  assert.deepEqual([over.girMgKgMin, over.dextroseRateAgainst, over.abnormal], [13.89, 'above', true]);
  // The same grams over 12 hours doubles the rate.
  assert.equal(s({ ...adult, hours: 12 }, now).girMgKgMin, 4.96);
});

test('lipid energy follows the product: 2, 3 and 1.12 kcal/mL', () => {
  assert.equal(s({ ...adult, lipidProduct: 'intralipid-30', lipidGrams: 60 }, now).lipidKcal, 600);
  assert.equal(s({ ...adult, lipidProduct: 'omegaven', lipidGrams: 10 }, now).lipidKcal, 112);
  const none = s({ ...adult, lipidProduct: '', lipidGrams: '' }, now);
  assert.deepEqual([none.lipidKcal, none.totalKcal, none.lipidGPerKgDay], [0, 1190, undefined]);
  assert.match(s({ ...adult, lipidProduct: '' }, now).message, /choose the lipid product/);
  assert.match(s({ ...adult, lipidGrams: '' }, now).message, /lipid/);
});

test('nitrogen is the reader\'s: without it there is no ratio, and protein / 6.25 is not assumed', () => {
  const r = s({ ...adult, nitrogenGrams: '' }, now);
  assert.equal(r.nonProteinKcalPerGNitrogen, undefined);
  assert.match(r.notes.join(' '), /No nitrogen was entered.*not assumed to be protein ÷ 6\.25/);
});

test('fail closed: a lapsed or superseded factor withholds energy and keeps the arithmetic', () => {
  const superseded = { ...LABEL_EDITIONS, [AMINO_ACIDS.setId]: { ...LABEL_EDITIONS[AMINO_ACIDS.setId], supersededOn: '2026-11-01' } };
  for (const [when, table, who] of [[new Date('2029-01-01T00:00:00Z'), undefined, ['dextrose', 'amino acid', 'lipid']], [now, superseded, ['amino acid']]]) {
    const r = s(adult, when, table);
    assert.deepEqual([r.valid, r.withheld, r.girMgKgMin, r.totalKcal], [true, who, 2.48, undefined]);
    assert.match(r.band, /Energy is withheld/);
    assert.doesNotMatch(r.notes.join(' '), /× 3\.4|× 4 =/);
  }
  // With only the amino acid label superseded, the dextrose rate line still stands.
  assert.equal(s(adult, now, superseded).dextroseRateAgainst, 'at or under');
  assert.equal(s(adult, new Date('2029-01-01T00:00:00Z')).dextroseRateAgainst, undefined);
});

test('weight in grams or pounds, and required fields', () => {
  assert.equal(s({ ...adult, weight: 70000, weightUnit: 'g' }, now).girMgKgMin, 2.48);
  for (const k of ['weight', 'weightUnit', 'dextroseGrams', 'aminoAcidGrams', 'hours', 'volume']) {
    const r = s({ ...adult, [k]: '' }, now);
    assert.equal(r.valid, false, k);
    assert.ok(r.message.length <= 280, k);
  }
  assert.match(s({ ...adult, hours: 30 }, now).message, /hours/);
});
