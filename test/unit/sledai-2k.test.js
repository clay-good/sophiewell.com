// spec-v147 2.4: SLEDAI-2K (Gladman 2002). 24 weighted descriptors (8/4/2/1),
// 0-105; >=6 = clinically important active disease.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sledai2k } from '../../lib/rheum-v147.js';

test('no descriptors -> 0, no activity', () => {
  const r = sledai2k({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.bandLabel, 'No activity');
  assert.equal(r.abnormal, false);
});

test('tile example: arthritis 4 + low complement 2 + DNA binding 2 = 8 -> moderate', () => {
  const r = sledai2k({ arthritis: true, lowComplement: true, dnaBinding: true });
  assert.equal(r.score, 8);
  assert.equal(r.bandLabel, 'Moderate activity');
  assert.equal(r.abnormal, true);
});

test('weight-8 descriptor scores 8; >=6 active flag in band', () => {
  const r = sledai2k({ seizure: true });
  assert.equal(r.score, 8);
  assert.match(r.band, /clinically important active disease/);
});

test('5 (mild) is not flagged active; 6 (moderate) is', () => {
  // weight-4 arthritis + weight-1 fever = 5 -> mild, no active flag
  const five = sledai2k({ arthritis: true, fever: true });
  assert.equal(five.score, 5);
  assert.equal(five.bandLabel, 'Mild activity');
  assert.equal(five.abnormal, false);
  assert.doesNotMatch(five.band, /clinically important/);
  // arthritis 4 + low complement 2 = 6 -> moderate
  const six = sledai2k({ arthritis: true, lowComplement: true });
  assert.equal(six.score, 6);
  assert.equal(six.bandLabel, 'Moderate activity');
});

test('all 24 descriptors -> maximum 105', () => {
  const all = {
    seizure: true, psychosis: true, organicBrain: true, visual: true, cranialNerve: true, lupusHeadache: true, cva: true, vasculitis: true,
    arthritis: true, myositis: true, urinaryCasts: true, hematuria: true, proteinuria: true, pyuria: true,
    rash: true, alopecia: true, mucosalUlcers: true, pleurisy: true, pericarditis: true, lowComplement: true, dnaBinding: true,
    fever: true, thrombocytopenia: true, leukopenia: true,
  };
  const r = sledai2k(all);
  assert.equal(r.score, 105);
  assert.equal(r.bandLabel, 'Very high activity');
});

test('11 -> high; 20 -> very high band edges', () => {
  // seizure 8 + arthritis... build 11: seizure 8 + arthritis... no, build 11 via 8+2+1
  assert.equal(sledai2k({ seizure: true, rash: true, fever: true }).bandLabel, 'High activity'); // 11
  // 20: two weight-8 + two weight-2 = 20
  assert.equal(sledai2k({ seizure: true, psychosis: true, rash: true, alopecia: true }).bandLabel, 'Very high activity'); // 20
});
