// spec-v1560 tool 1: GTFCC cholera dehydration and rehydration plan. Each classification rule, the three
// populations, the 12-month Plan C flip, Plan B bands, not-assessed signs, the antibiotic list, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { choleraRehydration as c } from '../../lib/cholera-rehydration-v1560.js';

const NORMAL = { mental: 'alert', pulse: 'normal', breathing: 'normal', eyes: 'normal', drinking: 'normal', pinch: 'normal', purging: 'no', failed: 'no', hiv: 'no' };
const G = { population: 'general', age: '3', weight: '14', ...NORMAL };

test('classification: one danger sign is severe; two severe signs are severe; two some signs are some', () => {
  for (const d of [{ mental: 'lethargic' }, { pulse: 'weak' }, { breathing: 'distress' }]) assert.equal(c({ ...G, ...d }).bandLabel, 'Severe dehydration: Plan C');
  assert.equal(c({ ...G, eyes: 'sunken', pinch: 'veryslow' }).bandLabel, 'Severe dehydration: Plan C');
  assert.equal(c({ ...G, eyes: 'sunken' }).bandLabel, 'No dehydration: Plan A');
  assert.equal(c({ ...G, eyes: 'sunken', drinking: 'thirsty' }).bandLabel, 'Some dehydration: Plan B');
  assert.equal(c({ ...G, mental: 'irritable', pulse: 'rapid' }).bandLabel, 'Some dehydration: Plan B');
  // A worse grade meets the milder one: drinking poorly counts with "thirsty".
  assert.equal(c({ ...G, mental: 'irritable', drinking: 'poorly' }).bandLabel, 'Some dehydration: Plan B');
});

test('Plan C: 100 mL/kg, 30 then 70 mL/kg, timing flips at 12 months', () => {
  const inf = c({ ...G, age: '0.9', weight: '8', mental: 'lethargic' });
  assert.match(inf.band, /800 mL \(100 mL\/kg\) started now: 240 mL over 1 hour \(240 mL\/h\), then 560 mL over 5 hours \(112 mL\/h\)\. Under 12 months\./);
  const kid = c({ ...G, age: '1', weight: '10', mental: 'lethargic' });
  assert.match(kid.band, /300 mL over 30 minutes \(600 mL\/h\), then 700 mL over 2\.5 hours \(280 mL\/h\)\. 12 months or older\./);
  assert.match(c({ ...G, weight: '', mental: 'lethargic' }).message, /Enter the weight/);
});

test('Plan B: 75 mL/kg with the job aid band; age band without a weight', () => {
  const b = c({ ...G, eyes: 'sunken', drinking: 'thirsty' });
  assert.match(b.band, /ORS 1,050 mL over 4 hours \(75 mL\/kg/);
  assert.match(b.notes.join(' '), /12 to under 16 kg is 800 to 1,200 mL/);
  assert.match(c({ ...G, weight: '7.9', eyes: 'sunken', drinking: 'thirsty' }).notes.join(' '), /5 to under 8 kg is 400 to 600 mL/);
  assert.match(c({ ...G, weight: '8', eyes: 'sunken', drinking: 'thirsty' }).notes.join(' '), /8 to under 12 kg is 600 to 800 mL/);
  const byAge = c({ ...G, age: '4.5', weight: '', eyes: 'sunken', drinking: 'thirsty' });
  assert.match(byAge.band, /800 to 1,200 mL over 4 hours \(the job aid's band for 2 to under 5 years\)/);
  assert.match(byAge.notes.join(' '), /No weight was entered/);
  assert.match(c({ ...G, age: '5', weight: '', eyes: 'sunken', drinking: 'thirsty' }).band, /1,200 to 2,200 mL/);
});

test('Plan A by age; no admission', () => {
  assert.match(c({ ...G, age: '1.9' }).band, /50 to 100 mL after each loose stool; give enough packets for 500 mL a day\. Do not admit\./);
  assert.match(c({ ...G, age: '9.9' }).band, /100 to 200 mL .* 1 L a day/);
  assert.match(c({ ...G, age: '10', weight: '30' }).band, /as much as wanted .* 2 L a day/);
});

test('a blank sign is not assessed: answered only when it cannot change the level', () => {
  const ok = c({ ...G, mental: 'lethargic', eyes: '' });
  assert.equal(ok.bandLabel, 'Severe dehydration: Plan C');
  assert.match(ok.notes[0], /Not assessed: eyes\. The classification holds whatever it shows\./);
  const ask = c({ ...G, eyes: 'sunken', drinking: '' });
  assert.equal(ask.valid, false);
  assert.match(ask.message, /enter the drinking\. The dehydration level could be none or severe/);
  const empty = c({ population: 'general', age: '3', weight: '14' });
  assert.equal(empty.valid, false);
});

test('pregnancy, second or third trimester: systolic 90 or below is a danger sign; fetal heart counts', () => {
  const P = { ...G, population: 'preg23', age: '25', weight: '60', sbp: '110', fetal: 'normal' };
  assert.equal(c(P).bandLabel, 'No dehydration: Plan A');
  const low = c({ ...P, sbp: '90' });
  assert.equal(low.bandLabel, 'Severe dehydration: Plan C');
  assert.match(low.band, /1,800 mL bolus over 30 minutes .* 4,200 mL over 3 to 4 hours/);
  assert.equal(c({ ...P, fetal: 'over160', eyes: 'sunken' }).bandLabel, 'Severe dehydration: Plan C');
  assert.equal(c({ ...P, fetal: 'over160', drinking: 'thirsty' }).bandLabel, 'Some dehydration: Plan B');
  assert.match(c(P).notes.join(' '), /Antibiotic indicated \(pregnancy\): doxycycline 300 mg/);
  assert.equal(c({ ...P, sbp: '' }).valid, false, 'a blank systolic could be a danger sign');
});

test('severe acute malnutrition: 2 of 5 for severe, IV only with collapse, standard ORS not ReSoMal', () => {
  const S = { ...G, population: 'sam', age: '2', weight: '8' };
  assert.equal(c({ ...S, pulse: 'weak' }).bandLabel, 'No dehydration: Plan A', 'one sign alone is not severe here: no single-sign rule');
  const collapse = c({ ...S, mental: 'lethargic', pulse: 'weak' });
  assert.match(collapse.band, /IV 120 mL over 1 hour \(15 mL\/kg/);
  const noCollapse = c({ ...S, eyes: 'sunken', pinch: 'veryslow' });
  assert.equal(noCollapse.bandLabel, 'Severe dehydration: Plan C');
  assert.match(noCollapse.band, /40 mL \(5 mL\/kg\) every 30 minutes for the first 2 hours/);
  assert.match(noCollapse.notes.join(' '), /IV fluid in severe malnutrition only for circulatory collapse/);
  assert.match(noCollapse.notes.join(' '), /not ReSoMal/);
  assert.match(c(S).notes.join(' '), /No extra zinc/);
  assert.equal(c({ ...S, age: '5' }).valid, false);
});

test('antibiotics: the 2022 indications, child doses by weight, and a disclosed blank', () => {
  assert.match(c({ ...G, purging: 'yes' }).notes.join(' '), /Antibiotic indicated \(high purging .*doxycycline 2 to 4 mg\/kg by mouth once, 28 to 56 mg/);
  assert.match(c({ ...G, age: '65', weight: '60' }).notes.join(' '), /Antibiotic indicated \(age over 60\): doxycycline 300 mg/);
  assert.match(c({ ...G, weight: '60', age: '30', hiv: '' }).notes.join(' '), /Not assessed: HIV; any of them would indicate doxycycline 300 mg/);
  assert.match(c(G).notes.join(' '), /Antibiotic: not indicated/);
  assert.match(c({ ...G, weight: '60', age: '11', purging: 'yes' }).notes.join(' '), /1000 mg \(maximum 1 g\)/);
});

test('refusals', () => {
  assert.equal(c({ ...G, population: '' }).valid, false);
  assert.equal(c({ ...G, age: '' }).valid, false);
  assert.equal(c({ ...G, weight: '0.1' }).valid, false);
  assert.equal(c({ ...G, mental: 'confused' }).valid, false);
  assert.equal(c().valid, false);
});
