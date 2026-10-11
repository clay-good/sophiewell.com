// spec-v1630 tool 3: IV rate and concentration against the label, six drugs on label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ivLabelRateCheck as c, DRUGS } from '../../lib/iv-label-rate-check-v1630.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const deny = ['PROPHARMA DISTRIBUTION', 'MEDICAL PURCHASING SOLUTIONS, LLC'];

test('every drug reads a watched label, none of them a distributor\'s copy', () => {
  assert.equal(Object.keys(DRUGS).length, 6);
  for (const d of Object.values(DRUGS)) {
    const row = labelRow(d.setId, now);
    assert.equal(row.answers, true, d.name);
    for (const who of deny) assert.ok(!LABEL_EDITIONS[d.setId].label.toUpperCase().includes(who.split(' ')[0]), d.name);
  }
});

test('phenytoin: 50 mg/minute in adults; 3 mg/kg/minute or 50, whichever is slower, in children; 5 mg/mL; 4 hours', () => {
  const adult = c({ drug: 'phenytoin', population: 'adult', dose: 1000, finalVolume: 100, minutes: 20 }, now);
  assert.deepEqual([adult.ratePerMinute, adult.rateAgainst, adult.shortestMinutes, adult.concentrationAgainst, adult.abnormal], [50, 'at or under', 20, 'at or above', false]);
  assert.equal(c({ drug: 'phenytoin', population: 'adult', dose: 1000, finalVolume: 100, minutes: 19 }, now).rateAgainst, 'above');
  const child = c({ drug: 'phenytoin', population: 'pediatric', weight: 10, weightUnit: 'kg', dose: 150, finalVolume: 50, minutes: 4 }, now);
  assert.deepEqual([child.labelMaxRate, child.rateAgainst, child.shortestMinutes, child.concentrationAgainst], [30, 'above', 5, 'below']);
  // A 40 kg child: 3 x 40 = 120, so the 50 mg/minute cap is the slower one.
  assert.equal(c({ drug: 'phenytoin', population: 'pediatric', weight: 40, weightUnit: 'kg', dose: 600, finalVolume: 100, minutes: 12 }, now).labelMaxRate, 50);
  assert.match(c({ drug: 'phenytoin', population: 'adult', dose: 1000, finalVolume: 100, minutes: 300 }, now).band, /longer than 4 hours/);
  assert.match(c({ drug: 'phenytoin', population: 'pediatric', dose: 150, finalVolume: 50, minutes: 4 }, now).message, /per kilogram/);
});

test('fosphenytoin: 150 mg PE/minute; 2 mg PE/kg/minute in children; 1.5 to 25 mg PE/mL', () => {
  const adult = c({ drug: 'fosphenytoin', population: 'adult', dose: 1500, finalVolume: 100, minutes: 10 }, now);
  assert.deepEqual([adult.rateAgainst, adult.concentrationAgainst], ['at or under', 'within']);
  assert.equal(c({ drug: 'fosphenytoin', population: 'adult', dose: 1500, finalVolume: 50, minutes: 10 }, now).concentrationAgainst, 'above');
  assert.equal(c({ drug: 'fosphenytoin', population: 'adult', dose: 150, finalVolume: 250, minutes: 10 }, now).concentrationAgainst, 'below');
  assert.equal(c({ drug: 'fosphenytoin', population: 'pediatric', weight: 20, weightUnit: 'kg', dose: 400, finalVolume: 50, minutes: 10 }, now).labelMaxRate, 40);
});

test('vancomycin: 10 mg/minute and 60 minutes in adults; 5 mg/mL, up to 10 in fluid restriction', () => {
  const r = c({ drug: 'vancomycin', population: 'adult', dose: 1500, finalVolume: 250, minutes: 90 }, now);
  assert.deepEqual([r.ratePerMinute, r.rateAgainst, r.shortestMinutes, r.durationAgainst, r.concentrationAgainst], [16.67, 'above', 150, '60 minutes or more', 'fluid-restriction range']);
  const ok = c({ drug: 'vancomycin', population: 'adult', dose: 1000, finalVolume: 250, minutes: 100 }, now);
  assert.deepEqual([ok.rateAgainst, ok.concentrationAgainst, ok.abnormal], ['at or under', 'at or under', false]);
  // 500 mg over 50 minutes is 10 mg/minute and still shorter than the 60 minutes the label gives.
  assert.match(c({ drug: 'vancomycin', population: 'adult', dose: 500, finalVolume: 100, minutes: 50 }, now).band, /shorter than 60 minutes/);
  assert.equal(c({ drug: 'vancomycin', population: 'adult', dose: 1500, finalVolume: 100, minutes: 150 }, now).concentrationAgainst, 'above');
  const child = c({ drug: 'vancomycin', population: 'pediatric', dose: 300, finalVolume: 60, minutes: 60 }, now);
  assert.deepEqual([child.rateAgainst, child.durationAgainst], [undefined, '60 minutes or more']);
});

test('potassium chloride: 10 mEq/hour at up to 40 mEq/L and 200 mEq a day; 40 mEq/hour and 400 when urgent', () => {
  const routine = c({ drug: 'potassium-chloride', population: 'adult', setting: 'routine', dose: 40, finalVolume: 1000, minutes: 240 }, now);
  assert.deepEqual([routine.ratePerHour, routine.rateAgainst, routine.concentrationAgainst, routine.shortestMinutes, routine.abnormal], [10, 'at or under', 'at or under', 240, false]);
  const fast = c({ drug: 'potassium-chloride', population: 'adult', setting: 'routine', dose: 20, finalVolume: 100, minutes: 60 }, now);
  assert.deepEqual([fast.rateAgainst, fast.concentrationAgainst, fast.shortestMinutes], ['above', 'above', 120]);
  const urgent = c({ drug: 'potassium-chloride', population: 'adult', setting: 'urgent', dose: 40, finalVolume: 100, minutes: 60 }, now);
  assert.deepEqual([urgent.rateAgainst, urgent.labelMaxRate, urgent.concentrationAgainst], ['at or under', 40, undefined]);
  assert.match(urgent.notes.join(' '), /continuous cardiac monitoring/);
  assert.match(c({ drug: 'potassium-chloride', population: 'adult', dose: 40, finalVolume: 1000, minutes: 240 }, now).message, /potassium setting/);
});

test('magnesium sulfate: 150 mg/minute, with the label\'s exception stated and not ruled on; 20% or less', () => {
  const r = c({ drug: 'magnesium-sulfate', population: 'adult', dose: 2000, finalVolume: 50, minutes: 10 }, now);
  assert.deepEqual([r.ratePerMinute, r.rateAgainst, r.shortestMinutes, r.concentrationAgainst], [200, 'above', 13.33, 'at or under']);
  assert.match(r.notes.join(' '), /exception for severe eclampsia with seizures; the tool does not rule on it/);
  assert.equal(c({ drug: 'magnesium-sulfate', population: 'adult', dose: 4000, finalVolume: 10, minutes: 30 }, now).concentrationAgainst, 'above');
});

test('calcium gluconate: bolus 200 or 100 mg/minute at 10 to 50 mg/mL; continuous at 5.8 to 10 mg/mL', () => {
  const adult = { drug: 'calcium-gluconate', population: 'adult', setting: 'bolus', dose: 1000, finalVolume: 50, minutes: 5 };
  assert.deepEqual([c(adult, now).rateAgainst, c(adult, now).concentrationAgainst], ['at or under', 'within']);
  assert.deepEqual([c({ ...adult, population: 'pediatric' }, now).rateAgainst, c({ ...adult, population: 'pediatric' }, now).shortestMinutes], ['above', 10]);
  assert.equal(c({ ...adult, finalVolume: 10 }, now).concentrationAgainst, 'above');
  const drip = c({ ...adult, setting: 'continuous', dose: 2000, finalVolume: 250, minutes: 360 }, now);
  assert.deepEqual([drip.concentrationAgainst, drip.rateAgainst], ['within', undefined]);
  assert.equal(c({ ...adult, setting: 'continuous', dose: 2000, finalVolume: 500, minutes: 360 }, now).concentrationAgainst, 'below');
  assert.match(c({ ...adult, setting: '' }, now).message, /bolus or continuous/);
});

test('fail closed: a withheld label keeps the arithmetic and shows no limit', () => {
  const id = DRUGS.vancomycin.setId;
  const superseded = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-11-01' } };
  const order = { drug: 'vancomycin', population: 'adult', dose: 1500, finalVolume: 250, minutes: 90 };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const r = c(order, when, table);
    assert.deepEqual([r.valid, r.withheld, r.ratePerMinute, r.rateAgainst], [true, true, 16.67, undefined]);
    assert.doesNotMatch(r.notes.join(' '), /10 mg\/minute|60 minutes/);
  }
  assert.equal(c({ drug: 'magnesium-sulfate', population: 'adult', dose: 2000, finalVolume: 50, minutes: 20 }, now, superseded).rateAgainst, 'at or under');
});

test('required choices, and a setting on a drug that has none is refused', () => {
  const order = { drug: 'vancomycin', population: 'adult', dose: 1000, finalVolume: 250, minutes: 100 };
  for (const k of Object.keys(order)) {
    const r = c({ ...order, [k]: '' }, now);
    assert.equal(r.valid, false, k);
    assert.ok(r.message.length <= 280, k);
  }
  assert.match(c({ ...order, setting: 'bolus' }, now).message, /Clear it for vancomycin/);
  assert.match(c({ ...order, weight: 70 }, now).message, /weight unit/);
});
