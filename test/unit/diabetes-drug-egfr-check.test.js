// spec-v1632 tool 8: metformin, SGLT2 and DPP-4 rules by eGFR, on seven label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diabetesDrugEgfrCheck as d, LABELS, REGIMENS } from '../../lib/diabetes-drug-egfr-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (regimen, kidney) => d({ regimen, dialysis: 'none', kidney }, now);
const on = (regimen, dialysis) => d({ regimen, dialysis }, now);
const flags = (regimen, values) => values.map((v) => at(regimen, v).flag);

test('seven labels answering, twelve drug-and-use rows', () => {
  assert.equal(Object.keys(LABELS).length, 7);
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(REGIMENS.length, 12);
});

test('metformin: starting and continuing are different rules; below 30 is contraindicated', () => {
  assert.deepEqual(flags('metformin-starting', [46, 44, 30, 29]), ['no-adjustment', 'not-recommended', 'not-recommended', 'contraindicated']);
  // The label says "between 30 and 45": at exactly 45 both rows are shown, and the status is the cautious one.
  assert.deepEqual([at('metformin-starting', 45).rows.length, at('metformin-starting', 45).flag], [2, 'not-recommended']);
  assert.deepEqual(flags('metformin-continuing', [45, 44.9, 30, 29.9]), ['no-adjustment', 'dose', 'dose', 'contraindicated']);
  assert.match(at('metformin-continuing', 40).band, /assessment of the benefit and risk of continuing/);
  assert.match(at('metformin-continuing', 20).band, /discontinue/);
  assert.equal(on('metformin-starting', 'hd').flag, 'contraindicated');
  assert.match(at('metformin-starting', 50).notes.join(' '), /Iodinated contrast .* between 30 and 60.*48 hours/);
});

test('empagliflozin: one eGFR rule, for glycemic control; no invented cutoff for the other indications', () => {
  assert.deepEqual(flags('empagliflozin-glycemic', [30, 29.9]), ['no-adjustment', 'not-recommended']);
  const other = on('empagliflozin-other', 'none');
  assert.deepEqual([other.valid, other.flag], [true, 'no-adjustment']);
  assert.match(other.notes.join(' '), /did not enroll adults with an eGFR below 20.*states no cutoff the label does not give/);
});

test('dapagliflozin: 45 for glycemic control; 25 for starting other indications; may continue below 25', () => {
  assert.deepEqual(flags('dapagliflozin-glycemic', [45, 44.9]), ['no-adjustment', 'not-recommended']);
  assert.deepEqual(flags('dapagliflozin-other-starting', [25, 24.9]), ['dose', 'not-recommended']);
  assert.deepEqual(flags('dapagliflozin-other-continuing', [25, 24.9]), ['dose', 'dose']);
  assert.match(at('dapagliflozin-other-continuing', 20).band, /continuation of 10 mg once daily/);
});

test('canagliflozin: 100 mg maximum from 30 to below 60; below 30, starting and continuing differ', () => {
  assert.deepEqual(flags('canagliflozin-starting', [60, 59.9, 30, 29.9]), ['no-adjustment', 'dose', 'dose', 'not-recommended']);
  assert.match(at('canagliflozin-starting', 45).band, /maximum of 100 mg once daily/);
  assert.match(at('canagliflozin-continuing', 25).band, /continuation of 100 mg once daily for adults with albuminuria above 300 mg\/day/);
});

test('the three DPP-4 inhibitors; alogliptin is by creatinine clearance', () => {
  assert.deepEqual([45, 44.9, 30, 29.9].map((v) => at('sitagliptin', v).rows[0]), ['no dosage adjustment (eGFR 45 to less than 90)', '50 mg once daily', '50 mg once daily', '25 mg once daily']);
  assert.match(on('sitagliptin', 'pd').band, /25 mg once daily, given without regard to the timing of dialysis/);
  assert.deepEqual([45, 44.9].map((v) => at('saxagliptin', v).rows[0]), ['the same dosage as with normal renal function', '2.5 mg once daily']);
  assert.match(on('saxagliptin', 'hd').band, /2\.5 mg once daily/);
  assert.equal(on('saxagliptin', 'pd').flag, 'no-recommendation-given');
  assert.deepEqual([60, 59.9, 30, 29.9].map((v) => at('alogliptin', v).rows[0]), ['no dose adjustment', '12.5 mg once daily', '12.5 mg once daily', '6.25 mg once daily']);
  assert.match(at('alogliptin', '').message, /Enter the creatinine clearance/);
  assert.match(at('sitagliptin', '').message, /Enter the eGFR/);
  assert.equal(on('alogliptin', 'pd').flag, 'no-recommendation-given');
});

test('nothing is defaulted; a superseded label withholds that drug only', () => {
  assert.match(d({}, now).message, /Choose the drug and indication/);
  assert.match(d({ regimen: 'sitagliptin', kidney: 40 }, now).message, /on dialysis/);
  const id = LABELS.metformin.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ regimen: 'metformin-starting', dialysis: 'none', kidney: 40 }, now, table).withheld, true);
  assert.equal(d({ regimen: 'sitagliptin', dialysis: 'none', kidney: 40 }, now, table).withheld, undefined);
});
