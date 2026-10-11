// spec-v1630 tool 4: an IV phosphate order against the label, on fail-closed label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ivPhosphateOrderCheck as c, SALTS } from '../../lib/iv-phosphate-order-check-v1630.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const base = { salt: 'potassium', ageBand: '12-plus', weight: 70, weightUnit: 'kg', dose: 30, doseUnit: 'mmol', finalVolume: 250, hours: 4, line: 'central' };

test('3 mmol/mL, with 4.4 mEq of potassium or 4 mEq of sodium per mL', () => {
  const k = c(base, now);
  assert.deepEqual([k.concentrateMl, k.cationMEq, k.mmolPer100Ml, k.mmolPerHour, k.cationMEqPerHour], [10, 44, 12, 7.5, 11]);
  // The label's own pairing: 45 mmol carries 66 mEq of potassium.
  assert.equal(c({ ...base, dose: 45 }, now).cationMEq, 66);
  const na = c({ ...base, salt: 'sodium' }, now);
  assert.deepEqual([na.concentrateMl, na.cationMEq, na.abnormal], [10, 40, false]);
  assert.match(na.notes.join(' '), /prints no dose, concentration or rate limit/);
  for (const s of Object.values(SALTS)) assert.equal(labelRow(s.setId, now).answers, true, s.name);
});

test('Table 2: the dose range follows the serum phosphorus, and the lower end depends on age', () => {
  const at = (level, dose, ageBand = '12-plus') => c({ ...base, ageBand, dose, doseUnit: 'mmol-kg', serumPhosphorus: level }, now);
  assert.deepEqual([at(0.9, 0.5).labelDoseRange, at(1, 0.4).labelDoseRange, at(1.7, 0.4).labelDoseRange, at(1.8, 0.2).labelDoseRange, at(2.5, 0.2).labelDoseRange], [[0.44, 0.64], [0.32, 0.43], [0.32, 0.43], [0.16, 0.31], [0.16, 0.31]]);
  assert.deepEqual([at(1.4, 0.3).doseAgainst, at(1.4, 0.43).doseAgainst, at(1.4, 0.5).doseAgainst], ['below', 'within', 'above']);
  // 2.8 mg/dL is above the adult lower end (2.5) and inside the infant one (4).
  assert.equal(at(2.8, 0.2).doseAgainst, undefined);
  assert.match(at(2.8, 0.2).notes.join(' '), /gives no dose/);
  assert.deepEqual(c({ ...base, ageBand: 'under-12-months', weight: 4, dose: 0.2, doseUnit: 'mmol-kg', finalVolume: 50, serumPhosphorus: 2.8 }, now).labelDoseRange, [0.16, 0.31]);
  assert.match(c(base, now).notes.join(' '), /no serum phosphorus was entered/);
});

test('the 45 mmol single-dose maximum', () => {
  assert.equal(c({ ...base, dose: 45, finalVolume: 500, hours: 6 }, now).singleDoseAgainst, 'at or under');
  const over = c({ ...base, dose: 46, finalVolume: 500, hours: 6 }, now);
  assert.deepEqual([over.singleDoseAgainst, over.abnormal], ['above', true]);
});

test('Table 1: maximum concentration by age and line', () => {
  const conc = (ageBand, line, dose, finalVolume) => c({ ...base, ageBand, line, dose, finalVolume, hours: 12, weight: ageBand === '12-plus' ? 70 : 15 }, now).concentrationAgainst;
  assert.deepEqual([conc('12-plus', 'peripheral', 6.8, 100), conc('12-plus', 'peripheral', 6.9, 100), conc('12-plus', 'central', 18, 100), conc('12-plus', 'central', 18.1, 100)], ['at or under', 'above', 'at or under', 'above']);
  // Under 12 years the label prints the row per 10 mL: 0.27 and 0.55 mmol.
  assert.deepEqual([conc('1-to-11-years', 'peripheral', 2.7, 100), conc('1-to-11-years', 'peripheral', 2.8, 100), conc('1-to-11-years', 'central', 5.5, 100), conc('1-to-11-years', 'central', 5.6, 100)], ['at or under', 'above', 'at or under', 'above']);
});

test('Table 3: maximum rate at 12 and older; no rate table under 12; the ECG and central-line threshold', () => {
  const rate = (line, hours) => c({ ...base, line, hours, dose: 13.6, finalVolume: 500 }, now);
  assert.deepEqual([rate('peripheral', 2).rateAgainst, rate('peripheral', 1.9).rateAgainst, rate('central', 1).rateAgainst, rate('central', 0.9).rateAgainst], ['at or under', 'above', 'at or under', 'above']);
  const child = c({ ...base, ageBand: '1-to-11-years', weight: 15, dose: 4.5, finalVolume: 100 }, now);
  assert.equal(child.rateAgainst, undefined);
  assert.match(child.notes.join(' '), /no maximum rate table for patients under 12 years/);
  // 30 mmol over 4 hours is 11 mEq of potassium an hour: above 10 at 20 kg or more.
  assert.equal(c(base, now).ecgAndCentralRecommended, true);
  assert.equal(c({ ...base, hours: 5 }, now).ecgAndCentralRecommended, false);
  // Under 20 kg the threshold is 0.5 mEq/kg/hour: 6.6 mEq over 1 hour in 12 kg is 0.55.
  assert.equal(c({ ...base, ageBand: '1-to-11-years', weight: 12, dose: 4.5, finalVolume: 200, hours: 1 }, now).ecgAndCentralRecommended, true);
  assert.equal(c({ ...base, ageBand: '1-to-11-years', weight: 12, dose: 4.5, finalVolume: 200, hours: 2 }, now).ecgAndCentralRecommended, false);
});

test('serum potassium is compared with 4, and the label\'s unit is quoted as printed', () => {
  const high = c({ ...base, serumPotassium: 4 }, now);
  assert.deepEqual([high.potassiumAgainst, high.abnormal], ['at or above 4', true]);
  assert.match(high.notes.join(' '), /"less than 4 mEq\/dL" \(it prints the unit as mEq\/dL\)/);
  assert.equal(c({ ...base, serumPotassium: 3.9 }, now).potassiumAgainst, 'under 4');
});

test('fail closed: a withheld label keeps the arithmetic and makes no comparison', () => {
  const id = SALTS.potassium.setId;
  const superseded = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-11-01' } };
  for (const [when, table] of [[new Date('2029-01-01T00:00:00Z'), undefined], [now, superseded]]) {
    const r = c({ ...base, serumPhosphorus: 1.4 }, when, table);
    assert.deepEqual([r.valid, r.withheld, r.concentrateMl, r.rateAgainst, r.doseAgainst], [true, true, 10, undefined, undefined]);
    assert.doesNotMatch(r.notes.join(' '), /45 mmol|15 mmol\/hour|0\.32 to 0\.43/);
  }
  assert.equal(c({ ...base, salt: 'sodium' }, now, superseded).withheld, undefined);
});

test('every choice is required', () => {
  for (const k of Object.keys(base)) {
    const r = c({ ...base, [k]: '' }, now);
    assert.equal(r.valid, false, k);
    assert.ok(r.message.length <= 280, k);
  }
});
