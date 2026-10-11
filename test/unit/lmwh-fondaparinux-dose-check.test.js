// spec-v1632 tool 2: dalteparin and fondaparinux dose by weight, on two label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lmwhFondaparinuxDoseCheck as d, bandRows, DRUGS, UA_TABLE, CANCER_MONTH_1, CANCER_LATER } from '../../lib/lmwh-fondaparinux-dose-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d(i, now);
const cancer = (i) => run({ drug: 'dalteparin', indication: 'cancer-vte', weight: 75, month: '1', crcl: 60, platelets: 150, ...i });

test('the labels\' tables, as printed', () => {
  for (const x of DRUGS) assert.equal(labelRow(x.setId, now).answers, true, x.brand);
  assert.deepEqual(UA_TABLE.map((r) => r[2]), [5500, 6500, 7500, 9000, 10000, 10000]);
  assert.deepEqual(CANCER_MONTH_1.map((r) => r[2]), [10000, 12500, 15000, 18000, 18000]);
  assert.deepEqual(CANCER_LATER.map((r) => r[2]), [7500, 10000, 12500, 15000, 18000]);
  assert.deepEqual(CANCER_MONTH_1.map((r) => [r[0], r[1]]), [[null, 56], [57, 68], [69, 82], [83, 98], [99, null]]);
});

test('a weight inside a row reads that row; one between two whole-kilogram rows reads both', () => {
  assert.deepEqual(bandRows(UA_TABLE, 49).map((r) => r[2]), [5500]);
  assert.deepEqual(bandRows(UA_TABLE, 50).map((r) => r[2]), [6500]);
  assert.deepEqual(bandRows(UA_TABLE, 59).map((r) => r[2]), [6500]);
  assert.deepEqual(bandRows(UA_TABLE, 59.5).map((r) => r[2]), [6500, 7500]);
  assert.deepEqual(bandRows(UA_TABLE, 49.5).map((r) => r[2]), [5500, 6500]);
  assert.deepEqual(bandRows(UA_TABLE, 120).map((r) => r[2]), [10000]);
  const r = run({ drug: 'dalteparin', indication: 'ua-nqmi', weight: 59.5 });
  assert.deepEqual(r.doses, [6500, 7500]);
  assert.match(r.band, /falls between two rows .* 6,500 units \(50 to 59 kg\) or 7,500 units \(60 to 69 kg\), every 12 hours/);
});

test('dalteparin for unstable angina: the table dose beside 120 units/kg, capped at 10,000', () => {
  const r = run({ drug: 'dalteparin', indication: 'ua-nqmi', weight: 72 });
  assert.deepEqual([r.doses, r.perKgDose, r.flag], [[9000], 8640, 'dose']);
  assert.match(r.notes.join(' '), /differ by design/);
  const big = run({ drug: 'dalteparin', indication: 'ua-nqmi', weight: 95 });
  assert.deepEqual([big.doses, big.perKgDose], [[10000], 10000]);
  assert.match(big.notes.join(' '), /11,400 units, above the label's 10,000-unit ceiling/);
  assert.equal(run({ drug: 'dalteparin', indication: 'ua-nqmi' }).valid, false);
});

test('dalteparin for VTE in cancer: month 1 and months 2 to 6, each beside its per-kilogram figure', () => {
  assert.deepEqual([cancer({}).doses, cancer({}).perKgDose], [[15000], 15000]);
  assert.deepEqual([cancer({ month: '2-6' }).doses, cancer({ month: '2-6' }).perKgDose], [[12500], 11250]);
  assert.deepEqual([cancer({ weight: 110 }).doses, cancer({ weight: 110 }).perKgDose], [[18000], 18000]);
  assert.deepEqual(cancer({ weight: 56 }).doses, [10000]);
  assert.deepEqual(cancer({ weight: 57 }).doses, [12500]);
  assert.match(cancer({ month: '' }).message, /Choose the month/);
  assert.equal(cancer({ crcl: '' }).valid, false);
  assert.equal(cancer({ platelets: '' }).valid, false);
});

test('dalteparin in cancer: the platelet rows and the clearance sentence', () => {
  assert.equal(cancer({ platelets: 50 }).flag, 'hold');
  assert.match(cancer({ platelets: 50 }).band, /discontinue dalteparin until the platelet count recovers to above 50,000/);
  const low = cancer({ platelets: 80 });
  assert.deepEqual([low.flag, low.reducedDoses], ['dose', [12500]]);
  assert.match(low.band, /reduce the daily dose by 2,500 units, to 12,500 units/);
  assert.equal(cancer({ platelets: 51 }).reducedDoses[0], 12500);
  assert.equal(cancer({ platelets: 100 }).reducedDoses, undefined);
  assert.match(cancer({ platelets: 100 }).notes.join(' '), /reads both ways/);
  assert.equal(cancer({ platelets: 101 }).reducedDoses, undefined);
  const renal = cancer({ crcl: 29 });
  assert.equal(renal.flag, 'no-recommendation-given');
  assert.match(renal.band, /monitor anti-Xa levels .* 0\.5 to 1\.5 units\/mL, sampled 4 to 6 hours after a dose and only after 3 to 4 doses/);
  assert.equal(cancer({ crcl: 30 }).flag, 'dose');
});

test('dalteparin prophylaxis: fixed doses, no weight asked for', () => {
  const hip = run({ drug: 'dalteparin', indication: 'hip' });
  assert.equal(hip.flag, 'dose');
  assert.match(hip.notes.join(' '), /Postoperative start: 2,500 units 4 to 8 hours after.*Day-of-surgery start.*Evening-before start: 5,000 units 10 to 14 hours before/);
  assert.match(run({ drug: 'dalteparin', indication: 'abdominal' }).band, /2,500 units once daily, starting 1 to 2 hours before/);
  assert.match(run({ drug: 'dalteparin', indication: 'abdominal-high' }).band, /5,000 units the evening before/);
  assert.match(run({ drug: 'dalteparin', indication: 'medical' }).band, /5,000 units once daily/);
});

test('fondaparinux: weight bands for treatment, 2.5 mg for prophylaxis, and the two contraindications', () => {
  const t = (weight, crcl = 60) => run({ drug: 'fondaparinux', indication: 'vte-treatment', weight, crcl });
  assert.deepEqual([49.9, 50, 100, 100.1].map((w) => t(w).doses[0]), [5, 7.5, 7.5, 10]);
  assert.equal(t(80, 29.9).flag, 'contraindicated');
  assert.equal(t(80, 30).flag, 'dose');
  const p = (weight, crcl = 60) => run({ drug: 'fondaparinux', indication: 'surgical-prophylaxis', weight, crcl });
  assert.deepEqual([p(50).flag, p(50).doses], ['dose', [2.5]]);
  assert.equal(p(49.9).flag, 'contraindicated');
  assert.match(p(49.9).band, /below 50 kg as a contraindication for VTE prophylaxis in adults/);
  assert.match(p(80, 20).band, /creatinine clearance below 30 mL\/min as a contraindication/);
  assert.equal(run({ drug: 'fondaparinux', indication: 'vte-treatment', weight: 80 }).valid, false);
  assert.equal(run({ drug: 'fondaparinux', indication: 'vte-treatment', crcl: 80 }).valid, false);
});

test('nothing is defaulted; an indication belongs to one drug', () => {
  assert.match(run({}).message, /Choose the drug/);
  assert.match(run({ drug: 'dalteparin' }).message, /Choose the indication/);
  assert.match(run({ drug: 'fondaparinux', indication: 'hip' }).message, /belongs to the other drug/);
  assert.match(run({ drug: 'dalteparin', indication: 'vte-treatment', weight: 70, crcl: 60 }).message, /belongs to the other drug/);
});

test('fail closed: a superseded label withholds that drug only', () => {
  const id = DRUGS[0].setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  const r = d({ drug: 'dalteparin', indication: 'medical' }, now, table);
  assert.deepEqual([r.valid, r.withheld, r.flag], [true, true, undefined]);
  assert.match(r.labelUrl, /setid=23527b8b/);
  assert.equal(d({ drug: 'fondaparinux', indication: 'vte-treatment', weight: 80, crcl: 60 }, now, table).withheld, undefined);
});
