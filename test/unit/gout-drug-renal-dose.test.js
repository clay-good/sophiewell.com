// spec-v1632 tool 13: allopurinol and colchicine by kidney function, on two label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goutDrugRenalDose as d, LABELS, REGIMENS } from '../../lib/gout-drug-renal-dose-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (regimen, kidney) => d({ regimen, dialysis: 'none', kidney }, now);
const on = (regimen, dialysis) => d({ regimen, dialysis }, now);

test('two labels answering, five drug-and-indication rows', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(REGIMENS.length, 5);
});

test('allopurinol in gout: the label\'s eGFR table, with its open lower edges', () => {
  assert.deepEqual([61, 60, 31, 30, 16, 15, 5, 4.9].map((v) => at('allopurinol-gout', v).rows[0]), ['no dosage modification', '50 mg daily', '50 mg daily', '50 mg every other day', '50 mg every other day', '50 mg twice weekly', '50 mg twice weekly', '50 mg once weekly']);
  assert.match(at('allopurinol-gout', 40).notes.join(' '), /50 mg\/day increments every 2 to 4 weeks.*maximum dosage is not defined/);
  assert.match(at('allopurinol-gout', '').message, /Enter the eGFR/);
  assert.equal(on('allopurinol-gout', 'hd').flag, 'no-recommendation-given');
});

test('allopurinol with cancer therapy: 200 mg/day at 10 to 20, 100 below 10, and the dialysis line', () => {
  assert.deepEqual([61, 60, 21, 20, 10, 9.9].map((v) => at('allopurinol-cancer', v).rows[0]), ['no renal row above 60 mL/min (its table starts at 60)', 'no dosage modification', 'no dosage modification', '200 mg/day', '200 mg/day', '100 mg/day']);
  assert.match(on('allopurinol-cancer', 'hd').band, /50 mg every 12 hours, or 100 mg every 24 hours/);
});

test('colchicine: prophylaxis, flare and familial Mediterranean fever differ below 30 and on dialysis', () => {
  assert.equal(at('colchicine-prophylaxis', 30).flag, 'no-adjustment');
  assert.match(at('colchicine-prophylaxis', 29.9).band, /starting dose of 0\.3 mg\/day/);
  assert.match(on('colchicine-prophylaxis', 'hd').band, /0\.3 mg twice a week/);
  assert.match(at('colchicine-flare', 20).band, /usual dose, with a treatment course repeated no more than once every two weeks/);
  assert.match(on('colchicine-flare', 'pd').band, /single dose of 0\.6 mg \(one tablet\)/);
  assert.match(at('colchicine-flare', 60).notes.join(' '), /not recommended in a patient with renal impairment who is taking colchicine for prophylaxis/);
  assert.match(at('colchicine-fmf', 20).band, /start at 0\.3 mg\/day/);
  assert.match(on('colchicine-fmf', 'hd').band, /0\.3 mg \(half a tablet\) per day/);
  assert.match(at('colchicine-fmf', 60).notes.join(' '), /P-gp or strong CYP3A4 inhibitor/);
  assert.match(at('colchicine-flare', '').message, /Enter the creatinine clearance/);
});

test('nothing is defaulted; a superseded label withholds that drug only', () => {
  assert.match(d({}, now).message, /Choose the drug and indication/);
  assert.match(d({ regimen: 'colchicine-flare', kidney: 40 }, now).message, /on dialysis/);
  const id = LABELS.colchicine.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ regimen: 'colchicine-flare', dialysis: 'none', kidney: 40 }, now, table).withheld, true);
  assert.equal(d({ regimen: 'allopurinol-gout', dialysis: 'none', kidney: 40 }, now, table).withheld, undefined);
});
