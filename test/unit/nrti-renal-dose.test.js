// spec-v1632 tool 5: tenofovir DF, Truvada, entecavir and lamivudine by clearance, on four label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nrtiRenalDose as d, LABELS, REGIMENS } from '../../lib/nrti-renal-dose-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (regimen, kidney) => d({ regimen, dialysis: 'none', kidney }, now);
const on = (regimen, dialysis) => d({ regimen, dialysis }, now);

test('four labels answering, six drug-and-use rows', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.deepEqual(REGIMENS.map((r) => r.value), ['tenofovir-df', 'truvada-treatment', 'truvada-prep', 'entecavir-usual', 'entecavir-refractory', 'lamivudine']);
});

test('tenofovir DF: the interval by clearance, no data below 10 off dialysis, weekly on hemodialysis', () => {
  assert.deepEqual([50, 49, 30, 29, 10].map((v) => at('tenofovir-df', v).rows[0]), ['300 mg every 24 hours', '300 mg every 48 hours', '300 mg every 48 hours', '300 mg every 72 to 96 hours', '300 mg every 72 to 96 hours']);
  const low = at('tenofovir-df', 9);
  assert.equal(low.flag, 'no-recommendation-given');
  assert.match(low.band, /no data are available/);
  assert.match(on('tenofovir-df', 'hd').band, /every 7 days or after a total of approximately 12 hours of dialysis/);
  assert.equal(on('tenofovir-df', 'pd').flag, 'no-recommendation-given');
  assert.match(at('tenofovir-df', 60).notes.join(' '), /ideal \(lean\) body weight/);
});

test('Truvada: treatment by interval, not recommended below 30 or on hemodialysis; PrEP not recommended below 60', () => {
  assert.deepEqual([50, 49, 30].map((v) => at('truvada-treatment', v).rows[0]), ['one tablet every 24 hours', 'one tablet every 48 hours', 'one tablet every 48 hours']);
  assert.equal(at('truvada-treatment', 29).flag, 'not-recommended');
  assert.equal(on('truvada-treatment', 'hd').flag, 'not-recommended');
  assert.match(at('truvada-treatment', 40).notes.join(' '), /has not been clinically evaluated/);
  assert.equal(at('truvada-prep', 60).flag, 'dose');
  assert.equal(at('truvada-prep', 59.9).flag, 'not-recommended');
  assert.equal(on('truvada-prep', 'pd').flag, 'not-recommended');
});

test('entecavir: both columns of Table 2, with bands that close below their upper edge', () => {
  assert.deepEqual([50, 49.9, 30, 29.9, 10, 9.9].map((v) => at('entecavir-usual', v).rows[0].split(' mg')[0]), ['0.5', '0.25', '0.25', '0.15', '0.15', '0.05']);
  assert.match(at('entecavir-refractory', 40).band, /0\.5 mg once daily or 1 mg every 48 hours/);
  assert.match(on('entecavir-refractory', 'hd').band, /0\.1 mg once daily .* or 1 mg every 7 days; on a hemodialysis day, after the session/);
  assert.match(on('entecavir-usual', 'pd').band, /0\.05 mg once daily .* or 0\.5 mg every 7 days/);
});

test('lamivudine: five rows; no extra dose after dialysis', () => {
  assert.deepEqual([50, 30, 15, 5, 4].map((v) => at('lamivudine', v).rows[0]), ['150 mg twice daily or 300 mg once daily', '150 mg once daily', '150 mg for the first dose, then 100 mg once daily', '150 mg for the first dose, then 50 mg once daily', '50 mg for the first dose, then 25 mg once daily']);
  assert.equal(at('lamivudine', 14.5).rows.length, 2);
  assert.equal(on('lamivudine', 'hd').flag, 'no-adjustment');
  assert.match(on('lamivudine', 'pd').band, /no additional dose is required/);
});

test('nothing is defaulted; a superseded label withholds that drug only', () => {
  assert.match(d({}, now).message, /Choose the drug and indication/);
  assert.match(d({ regimen: 'lamivudine', kidney: 40 }, now).message, /on dialysis/);
  assert.match(at('lamivudine', '').message, /Enter the creatinine clearance/);
  const id = LABELS.lamivudine.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ regimen: 'lamivudine', dialysis: 'none', kidney: 40 }, now, table).withheld, true);
  assert.equal(d({ regimen: 'tenofovir-df', dialysis: 'none', kidney: 40 }, now, table).withheld, undefined);
});
