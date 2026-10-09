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
