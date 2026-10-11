// spec-v1633 tool 15: formulation switches stated on four labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { labelFormulationSwitch as d, LABELS, SWITCHES, DIGOXIN_PAIRS, CARVEDILOL_PAIRS, CONCERTA_PAIRS } from '../../lib/label-formulation-switch-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (sw, dose) => d({ switch: sw, dose }, now);

test('the four labels answer, and the tables are the labels\'', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.deepEqual(DIGOXIN_PAIRS, [[50, 62.5], [100, 125], [200, 250], [400, 500]]);
  assert.deepEqual(CARVEDILOL_PAIRS, [[3.125, 10], [6.25, 20], [12.5, 40], [25, 80]]);
  assert.deepEqual(CONCERTA_PAIRS, [[5, 18], [10, 36], [15, 54], [20, 72]]);
  assert.equal(SWITCHES.length, 6);
});

test('digoxin: the table of equivalent doses, both ways, and nothing between its rows', () => {
  assert.deepEqual([50, 100, 200, 400].map((v) => at('digoxin-iv-to-tablet', v).targetDose), [62.5, 125, 250, 500]);
  assert.deepEqual([62.5, 125, 250, 500].map((v) => at('digoxin-tablet-to-iv', v).targetDose), [50, 100, 200, 400]);
  const off = at('digoxin-tablet-to-iv', 187.5);
  assert.deepEqual([off.flag, off.targetDose, off.abnormal], ['not-in-table', undefined, true]);
  assert.match(at('digoxin-iv-to-tablet', 100).notes.join(' '), /60% to 80%/);
});

test('carvedilol to Coreg CR: by the dose taken twice daily, with the lower start the label mentions', () => {
  assert.deepEqual([3.125, 6.25, 12.5, 25].map((v) => at('carvedilol-ir-to-cr', v).targetDose), [10, 20, 40, 80]);
  assert.deepEqual([at('carvedilol-ir-to-cr', 12.5).lowerStartDose, at('carvedilol-ir-to-cr', 25).lowerStartDose, at('carvedilol-ir-to-cr', 6.25).lowerStartDose], [20, 40, undefined]);
  assert.match(at('carvedilol-ir-to-cr', 25).notes.join(' '), /elderly patients or those at increased risk of hypotension/);
  const total = at('carvedilol-ir-to-cr', 50); // a daily total entered by mistake
  assert.equal(total.flag, 'not-in-table');
  assert.match(total.notes.join(' '), /not the daily total/);
});

test('methylphenidate to Concerta: four rows, and 72 mg carries its age limit', () => {
  assert.deepEqual([5, 10, 15, 20].map((v) => at('methylphenidate-ir-to-concerta', v).targetDose), [18, 36, 54, 72]);
  assert.match(at('methylphenidate-ir-to-concerta', 20).notes.join(' '), /13 to 65 years/);
  assert.doesNotMatch(at('methylphenidate-ir-to-concerta', 15).notes.join(' '), /13 to 65 years/);
  assert.equal(at('methylphenidate-ir-to-concerta', 7.5).flag, 'not-in-table');
});

test('furosemide and bumetanide: the label\'s approximate 1:40, stated as a substitution one way only', () => {
  const to = at('furosemide-to-bumetanide', 80);
  assert.deepEqual([to.flag, to.targetDose], ['dose', 2]);
  assert.match(to.notes.join(' '), /allergic to furosemide/);
  const back = at('bumetanide-to-furosemide', 2);
  assert.deepEqual([back.flag, back.targetDose, back.abnormal], ['potency-only', 80, true]);
  assert.match(back.notes.join(' '), /no instruction for a switch from bumetanide to furosemide/);
});

test('nothing is defaulted, and a superseded label withholds its statement', () => {
  assert.match(d({}, now).message, /^Choose the switch/);
  assert.match(d({ switch: 'carvedilol-ir-to-cr' }, now).message, /^Enter the carvedilol dose taken twice daily/);
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.concerta.setId].supersededOn = '2026-10-12';
  const w = d({ switch: 'methylphenidate-ir-to-concerta', dose: 10 }, now, T);
  assert.deepEqual([w.withheld, w.targetDose], [true, undefined]);
  assert.equal(d({ switch: 'digoxin-iv-to-tablet', dose: 100 }, now, T).targetDose, 125);
});
