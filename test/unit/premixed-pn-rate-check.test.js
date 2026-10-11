// spec-v1630 tool 11: premixed PN bag rate against the label's adult maximum, on label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { premixedPnRateCheck as r, FORMULATIONS } from '../../lib/premixed-pn-rate-check-v1630.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const row = (k) => [FORMULATIONS[k].max, FORMULATIONS[k].central];

test('each label\'s Table 2, formulation by formulation, with the central-vein-only five', () => {
  assert.deepEqual(['2.75-5', '4.25-5', '4.25-10', '5-15', '5-20', '8-10', '8-14'].map((f) => row(`clinimix-e-${f}`)),
    [[3.6, false], [2.4, false], [2.4, true], [1.67, true], [1.25, true], [1.3, true], [1.3, true]]);
  assert.deepEqual(['4.25-5', '4.25-10', '5-15', '5-20', '6-5', '8-10', '8-14'].map((f) => row(`clinimix-${f}`)),
    [[2.4, false], [2.4, true], [1.67, true], [1.25, true], [1.67, false], [1.3, true], [1.3, true]]);
  assert.deepEqual([row('kabiven'), FORMULATIONS.kabiven.maxDaily], [[2.6, true], 40]);
  assert.equal(Object.keys(FORMULATIONS).length, 15);
  for (const f of Object.values(FORMULATIONS)) assert.equal(labelRow(f.setId, now).answers, true, f.name);
});

test('the percents reproduce the nutrient rates the label prints at the maximum', () => {
  // Clinimix E 5/15 at 1.67 mL/kg/hour: the label prints 0.08 and 0.25 g/kg/hour.
  const at = r({ formulation: 'clinimix-e-5-15', weight: 100, weightUnit: 'kg', rate: 167 }, now);
  assert.deepEqual([at.mLPerKgHour, at.rateAgainst, at.aminoAcidGPerKgHour.toFixed(2), at.dextroseGPerKgHour.toFixed(2)], [1.67, 'at or under', '0.08', '0.25']);
  // Clinimix 6/5 at 1.67: 0.1 and 0.08.
  const six = r({ formulation: 'clinimix-6-5', weight: 100, weightUnit: 'kg', rate: 167 }, now);
  assert.deepEqual([six.aminoAcidGPerKgHour.toFixed(1), six.dextroseGPerKgHour.toFixed(2), six.centralOnly], ['0.1', '0.08', false]);
});

test('the same rate passes on one formulation and not on another', () => {
  const order = { weight: 70, weightUnit: 'kg', rate: 100 };
  assert.equal(r({ ...order, formulation: 'clinimix-e-5-15' }, now).rateAgainst, 'at or under');
  const over = r({ ...order, formulation: 'clinimix-e-5-20' }, now);
  assert.deepEqual([over.mLPerKgHour, over.rateAgainst, over.abnormal], [1.429, 'above', true]);
  // A volume and hours give the same rate.
  assert.equal(r({ formulation: 'clinimix-e-5-20', weight: 70, weightUnit: 'kg', volume: 2400, hours: 24 }, now).mLPerKgHour, 1.429);
  assert.equal(r({ ...order, weight: 154.324, weightUnit: 'lb', formulation: 'clinimix-e-5-20' }, now).mLPerKgHour, 1.429);
});

test('Kabiven: 2.6 mL/kg/hour, nutrient rates by proportion, and 40 mL/kg/day when a volume is entered', () => {
  const at = r({ formulation: 'kabiven', weight: 50, weightUnit: 'kg', rate: 130 }, now);
  assert.deepEqual([at.mLPerKgHour, at.rateAgainst, at.aminoAcidGPerKgHour, at.dextroseGPerKgHour, at.lipidGPerKgHour, at.dailyAgainst], [2.6, 'at or under', 0.09, 0.28, 0.1, undefined]);
  const day = r({ formulation: 'kabiven', weight: 60, weightUnit: 'kg', volume: 2566, hours: 14 }, now);
  assert.deepEqual([day.rateAgainst, day.mLPerKgDay, day.dailyAgainst, day.flags.length], ['above', 42.77, 'above', 2]);
  assert.equal(r({ formulation: 'kabiven', weight: 60, weightUnit: 'kg', volume: 2400, hours: 24 }, now).dailyAgainst, 'at or under');
});

test('fail closed: a withheld label keeps the rate per kilogram and shows no maximum', () => {
  const id = FORMULATIONS['clinimix-5-15'].setId;
  const superseded = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-11-01' } };
  const order = { formulation: 'clinimix-5-15', weight: 70, weightUnit: 'kg', rate: 100 };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const x = r(order, when, table);
    assert.deepEqual([x.valid, x.withheld, x.mLPerKgHour, x.rateAgainst, x.labelMaximum], [true, true, 1.429, undefined, undefined]);
    assert.doesNotMatch(`${x.band} ${x.notes.join(' ')}`, /1\.67/);
  }
  // The Clinimix E label is a different row and keeps answering.
  assert.equal(r({ ...order, formulation: 'clinimix-e-5-15' }, now, superseded).rateAgainst, 'at or under');
});

test('adult weights only; a rate, or a volume and hours, not both and not neither', () => {
  const base = { formulation: 'clinimix-6-5', weight: 70, weightUnit: 'kg' };
  assert.match(r({ ...base, weight: 10, rate: 50 }, now).message, /adult maximums/);
  assert.match(r(base, now).message, /rate in mL\/hour, or the volume and the hours/);
  assert.match(r({ ...base, rate: 100, hours: 3 }, now).message, /not both/);
  assert.match(r({ ...base, volume: 2000 }, now).message, /hours/);
  assert.match(r({ ...base, formulation: '', rate: 100 }, now).message, /Choose the formulation/);
  assert.match(r({ ...base, weightUnit: '', rate: 100 }, now).message, /weight unit/);
  assert.match(r({ ...base, rate: 100 }, now).note, /Adult maximums only/);
});
