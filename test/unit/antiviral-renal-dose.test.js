// spec-v1632 tool 4: antiviral dose by kidney function, on eight label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { antiviralRenalDose as d, LABELS, REGIMENS } from '../../lib/antiviral-renal-dose-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (regimen, kidney) => d({ regimen, dialysis: 'none', kidney }, now);
const on = (regimen, dialysis) => d({ regimen, dialysis }, now);

test('eight labels answering, 21 drug-and-indication rows, every one with a hemodialysis line', () => {
  assert.equal(Object.keys(LABELS).length, 8);
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(REGIMENS.length, 21);
  for (const r of REGIMENS) { assert.ok(LABELS[r.drug], r.value); assert.ok(r.hd && r.hd.text, r.value); assert.ok(r.bands.length >= 1, r.value); }
});

test('acyclovir: the label\'s bands share their edges, so 25 and 10 show two rows', () => {
  assert.match(at('acyclovir-iv', 51).band, /100% of the recommended dose every 8 hours/);
  assert.match(at('acyclovir-iv', 50).band, /every 12 hours/);
  assert.deepEqual(at('acyclovir-iv', 25).rows, ['100% of the recommended dose every 12 hours', '100% of the recommended dose every 24 hours']);
  assert.deepEqual(at('acyclovir-iv', 10).rows.length, 2);
  assert.match(at('acyclovir-iv', 5).band, /50% of the recommended dose every 24 hours/);
  assert.match(on('acyclovir-iv', 'hd').band, /additional dose is given after each hemodialysis/);
  assert.match(on('acyclovir-iv', 'pd').band, /no supplemental dose/);
});

test('valacyclovir: the four columns of Table 1 for each indication', () => {
  const col = (regimen) => [60, 40, 20, 5].map((v) => at(regimen, v).rows[0]);
  assert.deepEqual(col('valacyclovir-zoster'), ['1 g every 8 hours', '1 g every 12 hours', '1 g every 24 hours', '500 mg every 24 hours']);
  assert.deepEqual(col('valacyclovir-cold-sores'), ['two 2 g doses 12 hours apart', 'two 1 g doses 12 hours apart', 'two 500 mg doses 12 hours apart', 'a single 500 mg dose']);
  assert.deepEqual(col('valacyclovir-suppression-alternate'), ['500 mg every 24 hours', 'no reduction (500 mg every 24 hours)', '500 mg every 48 hours', '500 mg every 48 hours']);
  assert.equal(at('valacyclovir-genital-initial', 40).flag, 'no-adjustment');
  const gap = at('valacyclovir-zoster', 29.5);
  assert.deepEqual(gap.rows, ['1 g every 24 hours', '1 g every 12 hours']);
  assert.match(gap.notes[0], /falls between two bands/);
});

test('famciclovir: single-day and multiple-day rows, and no line for peritoneal dialysis', () => {
  assert.deepEqual([60, 59, 39, 19].map((v) => at('famciclovir-zoster', v).rows[0]), ['500 mg every 8 hours', '500 mg every 12 hours', '500 mg every 24 hours', '250 mg every 24 hours']);
  assert.deepEqual([40, 39, 19].map((v) => at('famciclovir-suppression', v).rows[0]), ['250 mg every 12 hours', '125 mg every 12 hours', '125 mg every 24 hours']);
  assert.match(on('famciclovir-labialis', 'hd').band, /250 mg as a single dose following dialysis/);
  const pd = on('famciclovir-zoster', 'pd');
  assert.equal(pd.flag, 'no-recommendation-given');
  assert.match(pd.band, /no line for peritoneal dialysis/);
});

test('ganciclovir and valganciclovir: induction and maintenance; valganciclovir on hemodialysis is not recommended', () => {
  assert.deepEqual([70, 69, 49, 24, 9].map((v) => at('ganciclovir-induction', v).rows[0]), ['5 mg/kg every 12 hours', '2.5 mg/kg every 12 hours', '2.5 mg/kg every 24 hours', '1.25 mg/kg every 24 hours', '1.25 mg/kg 3 times per week, following hemodialysis']);
  assert.equal(at('ganciclovir-maintenance', 30).rows[0], '1.25 mg/kg every 24 hours');
  assert.deepEqual([60, 59, 39, 24].map((v) => at('valganciclovir-induction', v).rows[0]), ['900 mg twice daily', '450 mg twice daily', '450 mg once daily', '450 mg every 2 days']);
  assert.equal(at('valganciclovir-maintenance', 5).flag, 'not-recommended');
  assert.equal(on('valganciclovir-induction', 'hd').flag, 'not-recommended');
});

test('oseltamivir: bands open at the bottom; dialysis has its own rows; ESRD without dialysis is not recommended', () => {
  assert.deepEqual([95, 90, 60.1, 60, 30.1, 30, 10.1].map((v) => at('oseltamivir-treatment', v).rows[0].slice(0, 22)), ['75 mg twice daily for ', '75 mg twice daily for ', '75 mg twice daily for ', '30 mg twice daily for ', '30 mg twice daily for ', '30 mg once daily for 5', '30 mg once daily for 5']);
  assert.equal(at('oseltamivir-treatment', 10).flag, 'not-recommended');
  assert.match(on('oseltamivir-treatment', 'hd').band, /30 mg after every hemodialysis cycle/);
  assert.match(on('oseltamivir-prophylaxis', 'hd').band, /alternate hemodialysis cycles/);
  assert.match(on('oseltamivir-prophylaxis', 'pd').band, /30 mg once weekly/);
});

test('nirmatrelvir with ritonavir is by eGFR; remdesivir has no adjustment and needs no number', () => {
  assert.equal(at('nirmatrelvir-ritonavir', 60).flag, 'no-adjustment');
  assert.match(at('nirmatrelvir-ritonavir', 59.9).band, /150 mg nirmatrelvir with 100 mg ritonavir twice daily/);
  assert.match(at('nirmatrelvir-ritonavir', 29.9).band, /once on day 1, then 150 mg/);
  assert.match(at('nirmatrelvir-ritonavir', 40).notes.join(' '), /by eGFR, not creatinine clearance/);
  assert.match(at('nirmatrelvir-ritonavir', '').message, /Enter the eGFR/);
  const r = on('remdesivir', 'none');
  assert.deepEqual([r.valid, r.flag], [true, 'no-adjustment']);
  assert.equal(on('remdesivir', 'hd').flag, 'no-adjustment');
});

test('nothing is defaulted', () => {
  assert.match(d({}, now).message, /Choose the drug and indication/);
  assert.match(d({ regimen: 'valacyclovir-zoster', kidney: 40 }, now).message, /on dialysis/);
  assert.match(at('valacyclovir-zoster', '').message, /Enter the creatinine clearance/);
  assert.equal(at('valacyclovir-zoster', -5).valid, false);
});

test('fail closed: a superseded label withholds that drug only', () => {
  const id = LABELS.valacyclovir.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  const r = d({ regimen: 'valacyclovir-zoster', dialysis: 'none', kidney: 40 }, now, table);
  assert.deepEqual([r.valid, r.withheld, r.rows], [true, true, undefined]);
  assert.match(r.labelUrl, /setid=f8e0d8f8/);
  assert.equal(d({ regimen: 'famciclovir-zoster', dialysis: 'none', kidney: 40 }, now, table).withheld, undefined);
});
