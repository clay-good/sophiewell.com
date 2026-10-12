// spec-v1636 tool 11: alteplase and tenecteplase dose by weight and indication, from the labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { thrombolyticDose, LABELS, REGIMENS } from '../../lib/thrombolytic-dose-v1636.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-12T12:00:00Z');
const t = (regimen, weight, extra = {}, table) => thrombolyticDose({ regimen, weight, ...extra }, now, table);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });
const mg = (r) => r.parts.map((p) => p.mg);

test('all three label rows answer; a regimen withholds only on its own label', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  assert.equal(t('alteplase-ischemic-stroke', 80, {}, dead(LABELS.activase.setId)).flag, 'withheld');
  assert.equal(t('alteplase-ischemic-stroke', 80, {}, dead(LABELS.tnkase.setId)).flag, 'dose');
  assert.equal(t('tenecteplase-stemi', 80, {}, dead(LABELS.tnkase.setId)).flag, 'withheld');
  assert.equal(REGIMENS.length, 7);
});

test('alteplase for stroke: 0.9 mg/kg to 90 mg, 10% as the bolus', () => {
  const r = t('alteplase-ischemic-stroke', 80);
  assert.deepEqual([r.totalMg, mg(r)], [72, [7.2, 64.8]]);
  assert.match(r.notes.join(' '), /64\.8 mL at 1 mg\/mL\) over 60 minutes, 64\.8 mL\/hour.*From a 100 mg vial, 28 mL is not part of the dose/);
  assert.deepEqual([t('alteplase-ischemic-stroke', 100).totalMg, t('alteplase-ischemic-stroke', 101).totalMg, t('alteplase-ischemic-stroke', 150).totalMg], [90, 90, 90]);
  assert.deepEqual(mg(t('alteplase-ischemic-stroke', 150)), [9, 81]);
});

test('alteplase for myocardial infarction, accelerated: the label row above 67 kg, per kilogram at or below it', () => {
  assert.deepEqual([t('alteplase-mi-accelerated', 80).totalMg, mg(t('alteplase-mi-accelerated', 80))], [100, [15, 50, 35]]);
  assert.deepEqual(mg(t('alteplase-mi-accelerated', 67.1)), [15, 50, 35]);
  assert.deepEqual([t('alteplase-mi-accelerated', 67).totalMg, mg(t('alteplase-mi-accelerated', 67))], [98.75, [15, 50.25, 33.5]]);
  assert.deepEqual(mg(t('alteplase-mi-accelerated', 60)), [15, 45, 30]);
  assert.match(t('alteplase-mi-accelerated', 60).notes.join(' '), /45 mg \(45 mL at 1 mg\/mL\) over 30 minutes, 90 mL\/hour/);
});

test('alteplase for myocardial infarction, 3-hour: 100 mg at 65 kg or more, 1.25 mg/kg under it', () => {
  const heavy = t('alteplase-mi-3-hour', 65);
  assert.equal(heavy.totalMg, 100);
  assert.match(heavy.notes.join(' '), /gives the bolus as a range and does not pick a point in it/);
  const light = t('alteplase-mi-3-hour', 50);
  assert.deepEqual([light.totalMg, mg(light)], [62.5, [3.75, 33.75, 12.5, 12.5]]);
});

test('alteplase for pulmonary embolism: 100 mg over 2 hours at any weight', () => {
  assert.equal(thrombolyticDose({ regimen: 'alteplase-pulmonary-embolism' }, now).totalMg, 100);
  assert.match(t('alteplase-pulmonary-embolism', 50).band, /100 mg by intravenous infusion over 2 hours \(50 mL\/hour/);
});

test('tenecteplase: the label\'s weight bands, each edge in the upper band', () => {
  const dose = (regimen, w) => t(regimen, w).totalMg;
  assert.deepEqual([59.9, 60, 69.9, 70, 79.9, 80, 89.9, 90, 130].map((w) => dose('tenecteplase-ischemic-stroke', w)), [15, 17.5, 17.5, 20, 20, 22.5, 22.5, 25, 25]);
  assert.deepEqual([59.9, 60, 70, 80, 90].map((w) => dose('tenecteplase-stemi', w)), [30, 35, 40, 45, 50]);
  const r = t('tenecteplase-ischemic-stroke', 70);
  assert.match(r.band, /20 mg \(4 mL at 5 mg\/mL\) as a single bolus over 5 seconds/);
  assert.match(r.notes.join(' '), /does not print a per-kilogram dose.*From a 25 mg vial reconstituted to 5 mg\/mL, 1 mL \(5 mg\) is not part of the dose/);
});

test('Cathflo: 2 mg at 30 kg or more; 110% of the lumen volume under it, not over 2 mg', () => {
  assert.equal(t('cathflo-occluded-line', 30).totalMg, 2);
  assert.equal(t('cathflo-occluded-line', 12, { lumenVolume: 0.8 }).totalMg, 0.88);
  assert.equal(t('cathflo-occluded-line', 12, { lumenVolume: 2.5 }).totalMg, 2);
  assert.match(t('cathflo-occluded-line', 12).message, /^Enter the internal lumen volume.*110%/);
  assert.match(t('cathflo-occluded-line', 70).notes.join(' '), /second dose of equal amount/);
});

test('nothing is defaulted', () => {
  assert.match(thrombolyticDose({}, now).message, /^Choose the drug and indication/);
  for (const r of REGIMENS.filter((x) => x.value !== 'alteplase-pulmonary-embolism')) assert.match(thrombolyticDose({ regimen: r.value }, now).message, /^Enter the weight/, r.value);
  assert.equal(thrombolyticDose(null, now).valid, false);
});
