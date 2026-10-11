// spec-v1632 tool 17: famotidine and metoclopramide adjustments, on two label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { giDrugDoseCheck as d, LABELS, REGIMENS, METOCLOPRAMIDE } from '../../lib/gi-drug-dose-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const fam = (regimen, kidney) => d({ regimen, dialysis: 'none', kidney }, now);
const met = (regimen, i = {}) => d({ regimen, dialysis: 'none', kidney: 90, hepatic: 'none-or-a', poorMetabolizer: 'no', inhibitor: 'no', ...i }, now);

test('two labels answering; seven famotidine rows and two metoclopramide rows', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(REGIMENS.length, 9);
  assert.deepEqual(METOCLOPRAMIDE.map((m) => [m.usual[1], m.adjusted[1], m.esrd[1]]), [[60, 30, 20], [40, 20, 10]]);
});

test('famotidine: the maximum dosage by indication at 30 to 60 and below 30', () => {
  assert.equal(fam('famotidine-du', 61).flag, 'no-adjustment');
  assert.match(fam('famotidine-du', 60).band, /20 mg once daily, or 40 mg every other day/);
  assert.match(fam('famotidine-du', 29.9).band, /20 mg every other day .*10 mg once daily/);
  assert.match(fam('famotidine-gerd', 45).band, /maximum of 20 mg once daily\./);
  assert.match(fam('famotidine-erosive-40', 45).band, /maximum of 40 mg once daily/);
  assert.match(fam('famotidine-erosive-40', 20).band, /maximum of 20 mg once daily/);
  assert.equal(fam('famotidine-hypersecretory', 45).flag, 'not-recommended');
  assert.match(fam('famotidine-du-recurrence', 20).band, /10 mg every other day/);
  assert.equal(d({ regimen: 'famotidine-gerd', dialysis: 'hd' }, now).flag, 'no-recommendation-given');
  assert.match(fam('famotidine-gerd', 45).notes.join(' '), /lowest effective dose/);
});

test('metoclopramide for reflux: 60 mg a day, 30 for the reduced group, 20 in end-stage renal disease', () => {
  assert.deepEqual([met('metoclopramide-gerd').maxDaily, met('metoclopramide-gerd').reducedGroup], [60, false]);
  assert.equal(met('metoclopramide-gerd', { kidney: 60 }).maxDaily, 30);
  assert.equal(met('metoclopramide-gerd', { kidney: 61 }).maxDaily, 60);
  assert.equal(met('metoclopramide-gerd', { hepatic: 'b-or-c' }).maxDaily, 30);
  assert.equal(met('metoclopramide-gerd', { poorMetabolizer: 'yes' }).maxDaily, 30);
  assert.equal(met('metoclopramide-gerd', { inhibitor: 'yes' }).maxDaily, 30);
  assert.equal(d({ regimen: 'metoclopramide-gerd', dialysis: 'hd', hepatic: 'none-or-a', poorMetabolizer: 'no', inhibitor: 'no' }, now).maxDaily, 20);
});

test('metoclopramide for gastroparesis: 40, 20 and 10 mg a day; its renal row is below 60, not 60 and below', () => {
  assert.equal(met('metoclopramide-gastroparesis').maxDaily, 40);
  assert.equal(met('metoclopramide-gastroparesis', { kidney: 60 }).maxDaily, 40);
  assert.match(met('metoclopramide-gastroparesis', { kidney: 60 }).notes.join(' '), /two tables differ at exactly 60/);
  assert.equal(met('metoclopramide-gastroparesis', { kidney: 59.9 }).maxDaily, 20);
  assert.match(met('metoclopramide-gastroparesis', { inhibitor: 'yes' }).notes.join(' '), /avoid use with bupropion, fluoxetine and paroxetine/);
  assert.equal(d({ regimen: 'metoclopramide-gastroparesis', dialysis: 'pd', hepatic: 'none-or-a', poorMetabolizer: 'no', inhibitor: 'no' }, now).maxDaily, 10);
});

test('nothing is defaulted; a superseded label withholds that drug only', () => {
  assert.match(d({}, now).message, /Choose the drug and indication/);
  assert.match(met('metoclopramide-gerd', { hepatic: '' }).message, /hepatic function/);
  assert.match(met('metoclopramide-gerd', { poorMetabolizer: '' }).message, /poor metabolizer/);
  assert.match(met('metoclopramide-gerd', { inhibitor: '' }).message, /strong CYP2D6 inhibitor/);
  assert.match(met('metoclopramide-gerd', { kidney: '' }).message, /creatinine clearance/);
  const id = LABELS.metoclopramide.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ regimen: 'metoclopramide-gerd', dialysis: 'none', kidney: 90, hepatic: 'none-or-a', poorMetabolizer: 'no', inhibitor: 'no' }, now, table).withheld, true);
  assert.equal(d({ regimen: 'famotidine-gerd', dialysis: 'none', kidney: 45 }, now, table).withheld, undefined);
});
