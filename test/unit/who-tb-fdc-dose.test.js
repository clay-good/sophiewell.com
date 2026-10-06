// spec-v1553 tool 3: WHO first-line TB tablets by weight. Every band edge (7.9/8 kg), the child-adult switch
// at 25 kg, the doubled 4-tablet adult bands, loose tablets, HPMZ eligibility, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoTbFdcDose as t } from '../../lib/who-tb-fdc-dose-v1553.js';

const I = { phase: 'intensive' };
const C = { phase: 'continuation' };

test('child dispersible bands: 7.9 kg is the 4 to under 8 band, 8 kg the next', () => {
  for (const [w, n] of [['4', '1'], ['7.9', '1'], ['8', '2'], ['11.9', '2'], ['12', '3'], ['15.9', '3'], ['16', '4'], ['24.9', '4']]) {
    assert.equal(t({ ...I, weight: w }).bandLabel, `${n} tablet${n === '1' ? '' : 's'}`, w);
  }
  const r = t({ ...I, weight: '10' });
  assert.match(r.band, /2 tablets of HRZ 50\/75\/150 mg dispersible once a day; add 2 tablets of ethambutol 100 mg dispersible if indicated/);
  assert.match(r.notes.join(' '), /isoniazid 10, rifampicin 15, pyrazinamide 30 and ethambutol 20 mg\/kg/);
  assert.match(t({ ...C, weight: '10' }).band, /2 tablets of HR 50\/75 mg dispersible/);
  assert.match(t({ ...C, weight: '10' }).notes[0], /No regimen was entered, so this is the standard regimen/);
  assert.doesNotMatch(t({ ...C, weight: '10', regimen: 'standard' }).notes.join(' '), /No regimen was entered/);
});

test('25 kg or more: adult FDC bands, with 4 tablets at both 35-50 and 50-65 kg', () => {
  for (const [w, n] of [['25', 2], ['29.9', 2], ['30', 3], ['35', 4], ['49.9', 4], ['50', 4], ['64.9', 4], ['65', 5]]) {
    assert.equal(t({ ...I, weight: w }).bandLabel, `${n} tablets`, w);
  }
  const r = t({ ...I, weight: '55' });
  assert.match(r.band, /4 tablets of HRZE 75\/150\/400\/275 mg once a day/);
  assert.match(r.notes.join(' '), /4 tablets for both the 35 to under 50 kg and the 50 to under 65 kg bands/);
  assert.match(r.notes.join(' '), /isoniazid 300 mg 1, rifampicin 300 mg 2, ethambutol 400 mg 3, pyrazinamide 400 mg 4, pyrazinamide 500 mg 3/);
  assert.match(t({ ...C, weight: '70' }).notes.join(' '), /isoniazid 300 mg 1\.25, rifampicin 300 mg 2\.5\.$/);
});

test('HPMZ: 12 years or older and 40 kg or more', () => {
  const H = { regimen: 'hpmz', phase: 'intensive' };
  assert.match(t({ ...H, weight: '45', age: '16' }).band, /pyrazinamide 1,500 to 1,600 mg/);
  assert.match(t({ ...H, weight: '70', age: '30' }).band, /pyrazinamide 2,000 mg/);
  assert.match(t({ ...H, weight: '45', age: '16', phase: 'continuation' }).band, /no pyrazinamide/);
  assert.equal(t({ ...H, weight: '39.9', age: '16' }).bandLabel, 'Not eligible for HPMZ');
  assert.equal(t({ ...H, weight: '50', age: '11' }).bandLabel, 'Not eligible for HPMZ');
  assert.match(t({ ...H, weight: '40', age: '16' }).notes.join(' '), /Exactly 40 kg/);
  assert.equal(t({ ...H, weight: '50' }).valid, false, 'HPMZ needs an age');
});

test('refusals', () => {
  assert.match(t({ ...I, weight: '3.9' }).message, /starts at 4 kg/);
  assert.equal(t({ weight: '20' }).valid, false);
  assert.equal(t({ ...I }).valid, false);
  assert.equal(t({ ...I, weight: '20', regimen: 'xdr' }).valid, false);
  assert.equal(t().valid, false);
});
