// spec-v1564 §3: aware-child-oral-dose, against Table 50.1 of the WHO AWaRe antibiotic book (2022), each band
// checked against the page images on October 9, 2026.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { awareChildOralDose as d, DRUGS } from '../../lib/aware-child-oral-dose-v1564.js';

test('band edges: each band runs up to, not including, the next', () => {
  assert.equal(d({ drug: 'amoxicillin', weight: '3' }).bandLabel, '250 mg every 12 h');
  assert.equal(d({ drug: 'amoxicillin', weight: '5.99' }).bandLabel, '250 mg every 12 h');
  assert.equal(d({ drug: 'amoxicillin', weight: '6' }).bandLabel, '375 mg every 12 h');
  assert.equal(d({ drug: 'amoxicillin', weight: '19.9' }).bandLabel, '750 mg every 12 h');
  assert.equal(d({ drug: 'amoxicillin', weight: '20' }).band, 'Amoxicillin: 500 mg by mouth every 8 hours, or 1 g by mouth every 12 hours (20 kg and over).');
});

test('every row as Table 50.1 prints it', () => {
  const at = (drug, kg) => d({ drug, weight: String(kg) }).band;
  assert.match(at('cefalexin', 25), /625 mg by mouth every 12 hours \(the 20 to under 30 kg band\)/);
  assert.equal(at('cefalexin', 30), 'Cefalexin: at 30 kg and over, use the adult dose.');
  assert.match(at('ciprofloxacin', 4), /50 mg by mouth every 12 hours/);
  assert.match(at('cloxacillin', 4), /62\.5 mg by mouth every 6 hours/);
  assert.match(at('cloxacillin', 22), /500 mg by mouth every 6 hours \(20 kg and over\)/);
  assert.match(at('metronidazole', 16), /150 mg by mouth every 8 hours/);
  assert.match(at('smx-tmp', 12), /400 mg \+ 80 mg by mouth every 12 hours \(the 10 to under 30 kg band\)/);
  assert.match(at('trimethoprim', 7), /40 mg by mouth every 12 hours/);
  assert.match(at('amoxicillin-clavulanate', 8), /375 mg of amoxicillin by mouth every 12 hours/);
  assert.equal(DRUGS.find((x) => x.value === 'ciprofloxacin').group, 'Watch');
});

test('under 3 kg is outside the table; a missing weight or antibiotic asks', () => {
  const r = d({ drug: 'amoxicillin', weight: '2.5' });
  assert.equal(r.bandLabel, 'Below the bands');
  assert.match(r.band, /80-90 mg\/kg a day/);
  assert.equal(d({ drug: 'amoxicillin' }).valid, false);
  assert.equal(d({ weight: '10' }).valid, false);
});

test('mg/kg rows: computed from the weight, a range where the table gives one, held to the daily maximum', async () => {
  const { ALL_DRUGS } = await import('../../lib/aware-child-oral-dose-v1564.js');
  assert.equal(ALL_DRUGS.length, 39);
  assert.equal(d({ drug: 'azithromycin-10', weight: '12' }).band, 'Azithromycin, lower dose (10 mg/kg): 120 mg by mouth once a day (12 kg).');
  const capped = d({ drug: 'azithromycin-20', weight: '30' });
  assert.equal(capped.bandLabel, '500 mg');
  assert.match(capped.notes[0], /^Held to the table's daily maximum of 500 mg/);
  assert.equal(d({ drug: 'clarithromycin', weight: '80' }).bandLabel, '500 mg', '1 g a day in two doses');
  assert.equal(d({ drug: 'nitrofurantoin', weight: '4' }).bandLabel, '8 mg');
  assert.equal(d({ drug: 'phenoxymethylpenicillin', weight: '12' }).bandLabel, '120 to 180 mg');
  assert.equal(d({ drug: 'vancomycin-oral', weight: '20' }).bandLabel, '100 to 200 mg');
  assert.match(d({ drug: 'cefixime', weight: '15' }).notes[0], /the daily maximum is the adult dose/);
});

test('doxycycline for cholera: by mg/kg under 45 kg, 300 mg over, and exactly 45 kg is named as a gap', () => {
  assert.equal(d({ drug: 'doxycycline-cholera', weight: '20' }).bandLabel, '40 to 80 mg once');
  assert.equal(d({ drug: 'doxycycline-cholera', weight: '50' }).bandLabel, '300 mg once');
  assert.equal(d({ drug: 'doxycycline-cholera', weight: '45' }).bandLabel, 'Between the lines');
});

test('IV and IM rows: by age where the table splits them, IU where it doses in IU, held to the daily maximum', () => {
  assert.equal(d({ drug: 'gentamicin-iv', weight: '3', ageDays: '2' }).band, 'Gentamicin IV: 15 mg once a day (3 kg, first week of life).');
  assert.equal(d({ drug: 'gentamicin-iv', weight: '3', ageDays: '7' }).bandLabel, '22.5 mg');
  assert.match(d({ drug: 'gentamicin-iv', weight: '3' }).message, /^Enter the age in days/);
  assert.equal(d({ drug: 'vancomycin-iv', weight: '3', ageDays: '27' }).band, 'Vancomycin IV: 45 mg every 12 hours (3 kg, newborn).');
  assert.equal(d({ drug: 'vancomycin-iv', weight: '3', ageDays: '28' }).band, 'Vancomycin IV: 45 mg every 8 hours (3 kg, child).');
  const pen = d({ drug: 'benzylpenicillin-meningitis-iv', weight: '20' });
  assert.equal(pen.bandLabel, '1,500,000 IU');
  assert.match(pen.notes[0], /daily maximum of 6,000,000 IU/);
  assert.equal(d({ drug: 'ceftriaxone-high-iv', weight: '40' }).bandLabel, '3,000 mg');
  assert.equal(d({ drug: 'benzathine-penicillin-im', weight: '3' }).band, 'Benzathine benzylpenicillin IM: 150,000 IU once, a single dose (3 kg).');
  assert.ok(d({ drug: 'metronidazole-iv', weight: '3', ageDays: '5' }).notes.some((n) => /15 mg\/kg loading dose/.test(n)));
});
