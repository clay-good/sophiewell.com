// spec-v1632 tool 11: sotalol, atenolol, lisinopril, sacubitril-valsartan, rosuvastatin, on five label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardiacRenalDoseCheck as d, LABELS, REGIMENS } from '../../lib/cardiac-renal-dose-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (regimen, kidney) => d({ regimen, dialysis: 'none', kidney }, now);
const on = (regimen, dialysis) => d({ regimen, dialysis }, now);

test('five labels answering, seven drug-and-indication rows', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(REGIMENS.length, 7);
});

test('sotalol: the interval by clearance; exactly 60 is in neither printed band; no advice on dialysis', () => {
  assert.deepEqual([61, 59, 30, 29, 10].map((v) => at('sotalol', v).rows[0]), ['a dosing interval of 12 hours', 'a dosing interval of 24 hours', 'a dosing interval of 24 hours', 'a dosing interval of 36 to 48 hours', 'a dosing interval of 36 to 48 hours']);
  // The label prints ">60" and "30-59".
  assert.deepEqual(at('sotalol', 60).rows, ['a dosing interval of 24 hours', 'a dosing interval of 12 hours']);
  assert.equal(at('sotalol', 9).flag, 'no-recommendation-given');
  assert.equal(on('sotalol', 'hd').flag, 'no-recommendation-given');
  assert.match(at('sotalol', 40).notes.join(' '), /initial dose of 80 mg .* at least 5 doses/);
});

test('atenolol: maximum 50 mg at 15 to 35, 25 mg below 15, 25 or 50 mg after dialysis', () => {
  assert.equal(at('atenolol', 36).flag, 'no-adjustment');
  assert.deepEqual([35, 15, 14.9].map((v) => at('atenolol', v).rows[0]), ['a maximum of 50 mg daily', 'a maximum of 50 mg daily', 'a maximum of 25 mg daily']);
  assert.match(on('atenolol', 'hd').band, /25 mg or 50 mg after each dialysis/);
});

test('lisinopril: half the usual starting dose from 10 to 30, by indication; 2.5 mg below 10 or on hemodialysis', () => {
  assert.equal(at('lisinopril-hypertension', 31).flag, 'no-adjustment');
  assert.match(at('lisinopril-hypertension', 30).band, /initial dose of 5 mg .* maximum of 40 mg daily/);
  assert.match(at('lisinopril-heart-failure', 10).band, /initial dose of 2\.5 mg \(half/);
  assert.match(at('lisinopril-acute-mi', 20).band, /initial dose of 2\.5 mg \(half/);
  assert.equal(at('lisinopril-hypertension', 9.9).rows[0], 'an initial dose of 2.5 mg once daily');
  assert.match(on('lisinopril-hypertension', 'hd').band, /initial dose of 2\.5 mg once daily/);
});

test('sacubitril-valsartan by eGFR, with the hepatic rule beside it; rosuvastatin below 30', () => {
  assert.equal(at('sacubitril-valsartan', 30).flag, 'no-adjustment');
  assert.match(at('sacubitril-valsartan', 29.9).band, /half the usually recommended starting dose/);
  assert.match(at('sacubitril-valsartan', 50).notes.join(' '), /Child-Pugh B, start at half .* Child-Pugh C, not recommended/);
  assert.match(at('sacubitril-valsartan', '').message, /Enter the eGFR/);
  assert.equal(at('rosuvastatin', 30).flag, 'no-adjustment');
  assert.match(at('rosuvastatin', 29).band, /5 mg once daily, not to exceed 10 mg/);
  assert.equal(on('rosuvastatin', 'hd').flag, 'no-recommendation-given');
});

test('nothing is defaulted; a superseded label withholds that drug only', () => {
  assert.match(d({}, now).message, /Choose the drug and indication/);
  assert.match(d({ regimen: 'sotalol', kidney: 40 }, now).message, /on dialysis/);
  const id = LABELS.sotalol.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  assert.equal(d({ regimen: 'sotalol', dialysis: 'none', kidney: 40 }, now, table).withheld, true);
  assert.equal(d({ regimen: 'atenolol', dialysis: 'none', kidney: 40 }, now, table).withheld, undefined);
});
