// spec-v1632 tool 7: renal dose limits for eight CNS drugs, on eight label rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cnsRenalDoseCheck as d, LABELS, REGIMENS } from '../../lib/cns-renal-dose-check-v1632.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (regimen, kidney, extra = {}) => d({ regimen, dialysis: 'none', kidney, ...extra }, now);
const on = (regimen, dialysis) => d({ regimen, dialysis }, now);

test('eight labels answering, one row set per drug', () => {
  assert.equal(REGIMENS.length, 8);
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
});

test('levetiracetam: the label\'s body-surface adjustment comes first, then Table 1', () => {
  const r = at('levetiracetam', 60, { bsa: 2 });
  // 60 x 1.73 / 2 = 51.9 mL/min/1.73 m2.
  assert.equal(r.adjustedClearance, 51.9);
  assert.match(r.band, /500 to 1,000 mg every 12 hours/);
  assert.match(r.notes[0], /60 mL\/min × 1\.73 ÷ 2 m² = 51\.9/);
  const row = (kidney) => at('levetiracetam', kidney, { bsa: 1.73 }).rows;
  assert.deepEqual(row(81), ['500 to 1,500 mg every 12 hours']);
  assert.deepEqual(row(80), ['500 to 1,000 mg every 12 hours']);
  assert.deepEqual(row(50), ['500 to 1,000 mg every 12 hours', '250 to 750 mg every 12 hours']);
  assert.deepEqual(row(30), ['250 to 750 mg every 12 hours']);
  assert.deepEqual(row(29), ['250 to 500 mg every 12 hours']);
  assert.match(at('levetiracetam', 60).message, /Enter the body surface area/);
  assert.match(on('levetiracetam', 'hd').band, /500 to 1,000 mg every 24 hours, with a 250 to 500 mg supplemental dose after dialysis/);
});

test('lacosamide and topiramate: a percentage and a half, in the label\'s words', () => {
  assert.equal(at('lacosamide', 30).flag, 'no-adjustment');
  assert.match(at('lacosamide', 29).band, /a reduction of 25% of the maximum dosage/);
  assert.match(on('lacosamide', 'hd').band, /supplementation of up to 50% should be considered/);
  assert.equal(at('topiramate', 70).flag, 'no-adjustment');
  assert.match(at('topiramate', 69.9).band, /one-half of the usual adult dose/);
  assert.match(on('topiramate', 'hd').band, /supplemental dose may be required/);
});

test('memantine, tramadol, varenicline: a limit only below the label\'s clearance', () => {
  assert.match(at('memantine-er', 29).band, /14 mg\/day/);
  assert.match(at('memantine-er', 5).band, /14 mg\/day/);
  assert.equal(at('memantine-er', 30).flag, 'no-adjustment');
  assert.equal(at('memantine-er', 4).flag, 'no-recommendation-given');
  assert.equal(on('memantine-er', 'hd').flag, 'no-recommendation-given');
  assert.match(at('tramadol-ir', 29).band, /12 hours, with a maximum of 200 mg\/day/);
  assert.equal(at('tramadol-ir', 30).flag, 'no-adjustment');
  assert.match(at('tramadol-ir', 60).notes.join(' '), /50 mg every 12 hours for severe hepatic impairment.*300 mg\/day over 75/);
  assert.match(on('tramadol-ir', 'hd').band, /regular dose on the day of dialysis/);
  assert.match(at('varenicline', 29).band, /0\.5 mg once daily, titrated as needed to a maximum of 0\.5 mg twice daily/);
  assert.match(on('varenicline', 'hd').band, /maximum of 0\.5 mg once daily, if tolerated/);
});

test('duloxetine is by GFR and reads "avoid use" below 30; desvenlafaxine has three limits', () => {
  assert.equal(at('duloxetine', 29.9).flag, 'not-recommended');
  assert.equal(at('duloxetine', 30).flag, 'no-adjustment');
  assert.match(at('duloxetine', '').message, /Enter the GFR/);
  assert.match(at('duloxetine', 60).notes.join(' '), /chronic liver disease or cirrhosis/);
  assert.equal(at('desvenlafaxine', 51).flag, 'no-adjustment');
  assert.match(at('desvenlafaxine', 50).band, /maximum of 50 mg per day/);
  assert.match(at('desvenlafaxine', 20).band, /25 mg every day or 50 mg every other day/);
  assert.match(at('desvenlafaxine', 10).band, /25 mg every day or 50 mg every other day/);
  assert.equal(at('desvenlafaxine', 29.5).rows.length, 2);
  assert.match(on('desvenlafaxine', 'hd').band, /should not be given after dialysis/);
});

test('nothing is defaulted; a superseded label withholds that drug only', () => {
  assert.match(d({}, now).message, /Choose the drug/);
  assert.match(d({ regimen: 'varenicline', kidney: 40 }, now).message, /on dialysis/);
  const id = LABELS.levetiracetam.setId;
  const table = { ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } };
  const r = d({ regimen: 'levetiracetam', dialysis: 'none', kidney: 60, bsa: 2 }, now, table);
  assert.deepEqual([r.withheld, r.adjustedClearance], [true, undefined]);
  assert.equal(d({ regimen: 'varenicline', dialysis: 'none', kidney: 40 }, now, table).withheld, undefined);
});

// spec-v1632 tool 7: an entered daily dose against the row's maximum; lacosamide and topiramate need the
// reader's reference dose.
test('entered dose: the row maximum, a reference dose for relative rows, and avoid-use', async () => {
  const { cnsRenalDoseCheck: c } = await import('../../lib/cns-renal-dose-check-v1632.js');
  const at = new Date('2026-10-15T12:00:00Z');
  const base = (regimen, kidney, extra = {}) => c({ regimen, dialysis: 'none', kidney, ...extra }, at);
  const t = base('tramadol-ir', 20, { enteredDose: 300 });
  assert.deepEqual([t.doseCheck, t.rowMaximumMgPerDay, t.abnormal], ['above-row-maximum', 200, true]);
  assert.equal(base('memantine-er', 20, { enteredDose: 14 }).doseCheck, 'within-row-maximum');
  assert.equal(base('levetiracetam', 60, { bsa: 1.73, enteredDose: 2500 }).rowMaximumMgPerDay, 2000);
  assert.match(base('lacosamide', 20, { enteredDose: 300 }).notes.join(' '), /relative to the maximum dosage for the indication.*Enter that figure/);
  const l = base('lacosamide', 20, { enteredDose: 350, referenceDose: 400 });
  assert.deepEqual([l.doseCheck, l.rowMaximumMgPerDay], ['above-row-maximum', 300]);
  assert.equal(base('topiramate', 50, { enteredDose: 200, referenceDose: 400 }).doseCheck, 'within-row-maximum');
  assert.equal(base('duloxetine', 20, { enteredDose: 30 }).doseCheck, 'label-says-avoid');
  assert.match(base('tramadol-ir', 60, { enteredDose: 300 }).notes.join(' '), /states no daily maximum/);
  assert.equal(base('tramadol-ir', 20).doseCheck, undefined);
});
