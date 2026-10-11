// spec-v1632 tool 6: gabapentin and pregabalin by creatinine clearance, on two label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gabapentinoidRenalDose as d, DRUGS, GABAPENTIN_BANDS, GABAPENTIN_SUPPLEMENTS, PREGABALIN_BANDS, PREGABALIN_SUPPLEMENTS } from '../../lib/gabapentinoid-renal-dose-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const g = (crcl, hemodialysis = 'no') => d({ drug: 'gabapentin', crcl, hemodialysis }, now);
const p = (crcl, normalDose, hemodialysis = 'no') => d({ drug: 'pregabalin', crcl, normalDose, hemodialysis }, now);

test('the labels\' tables, as printed', () => {
  for (const x of DRUGS) assert.equal(labelRow(x.setId, now).answers, true, x.brand);
  assert.deepEqual(GABAPENTIN_BANDS.map((b) => b.range), [[900, 3600], [400, 1400], [200, 700], [100, 300]]);
  assert.deepEqual(GABAPENTIN_SUPPLEMENTS, [125, 150, 200, 250, 350]);
  assert.deepEqual(PREGABALIN_BANDS.map((b) => b.doses), [['150', '300', '450', '600'], ['75', '150', '225', '300'], ['25 to 50', '75', '100 to 150', '150'], ['25', '25 to 50', '50 to 75', '75']]);
  assert.deepEqual(PREGABALIN_SUPPLEMENTS, ['25 mg or 50 mg', '50 mg or 75 mg', '75 mg or 100 mg', '100 mg or 150 mg']);
});

test('gabapentin: the range for each band; the label\'s gaps at 30 and between 59 and 60 show both rows', () => {
  assert.deepEqual([60, 59, 31, 29, 16, 15].map((v) => [g(v).dailyLow, g(v).dailyHigh]), [[900, 3600], [400, 1400], [400, 1400], [200, 700], [200, 700], [100, 300]]);
  const at30 = g(30);
  assert.equal(at30.rows.length, 2);
  assert.deepEqual([at30.dailyLow, at30.dailyHigh], [200, 1400]);
  assert.match(at30.notes[0], /falls between two bands .* above 15 to 29 and above 30 to 59/);
  assert.equal(g(59.5).rows.length, 2);
});

test('gabapentin below 15: the label\'s proportion, with its own example', () => {
  const r = g(7.5);
  assert.deepEqual([r.proportion, r.dailyLow, r.dailyHigh], [0.5, 50, 150]);
  assert.match(r.band, /7\.5 ÷ 15 = 0\.5 of the 100 to 300 mg\/day .* 50 to 150 mg\/day/);
  assert.match(r.notes.join(' '), /one-half the daily dose given at 15 mL\/min/);
  assert.deepEqual([g(3).dailyLow, g(3).dailyHigh], [20, 60]);
  assert.match(g(7.5, 'yes').notes.join(' '), /supplemental dose after each 4 hours of hemodialysis: 125, 150, 200, 250, 350 mg/);
  assert.doesNotMatch(g(7.5).notes.join(' '), /supplemental/);
});

test('pregabalin: the column for the normal daily dose; the bands share their edges at 30 and 60', () => {
  assert.deepEqual(['150', '300', '450', '600'].map((n) => p(45, n).rows[0]), ['75 mg/day in two or three divided doses', '150 mg/day in two or three divided doses', '225 mg/day in two or three divided doses', '300 mg/day in two or three divided doses']);
  assert.equal(p(20, '450').rows[0], '100 to 150 mg/day once daily or in two divided doses');
  assert.equal(p(10, '300').rows[0], '25 to 50 mg/day once daily');
  assert.equal(p(61, '600').rows[0], '600 mg/day in two or three divided doses');
  assert.deepEqual(p(60, '300').rows, ['300 mg/day in two or three divided doses', '150 mg/day in two or three divided doses']);
  assert.deepEqual(p(30, '300').rows.length, 2);
  assert.deepEqual(p(15, '300').rows, ['75 mg/day once daily or in two divided doses']);
  assert.match(p(10, '600', 'yes').notes.join(' '), /For the 75 mg once-daily regimen of this column: 100 mg or 150 mg/);
  assert.match(p(10, '', 'no').message, /Choose the total daily dose for normal renal function/);
});

test('nothing is defaulted; a superseded label withholds that drug only', () => {
  assert.match(d({}, now).message, /Choose the drug/);
  assert.match(d({ drug: 'gabapentin', crcl: 40 }, now).message, /on hemodialysis/);
  assert.equal(g('').valid, false);
  const id = DRUGS[0].setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ drug: 'gabapentin', crcl: 40, hemodialysis: 'no' }, now, table).withheld, true);
  assert.equal(d({ drug: 'pregabalin', crcl: 40, hemodialysis: 'no', normalDose: '300' }, now, table).withheld, undefined);
});
