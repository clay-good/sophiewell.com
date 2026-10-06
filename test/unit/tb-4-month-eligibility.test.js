// spec-v1553 tool 2: the 4-month child TB regimen. Box 5.3 A, B and C, the Xpert low/medium edge, the
// exclusions, HIV and ethambutol.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tb4MonthEligibility as r } from '../../lib/tb-4-month-eligibility-v1553.js';

const base = { age: '4', weight: '15', setting: 'full', cxr: 'onelobe', bact: 'low', dr: 'no', prior: 'no', signs: 'no', pneumonia: 'no', periph: 'no', hiv: 'no', highprev: 'no' };

test('Box 5.3 A, B and C', () => {
  assert.equal(r(base).bandLabel, '4 months');
  assert.equal(r({ ...base, setting: 'nocxr', cxr: '' }).bandLabel, '4 months');
  assert.equal(r({ ...base, setting: 'none', cxr: '', bact: '' }).bandLabel, '4 months');
  assert.equal(r({ ...base, setting: 'nocxr', bact: 'high', periph: 'yes' }).bandLabel, '4 months', 'isolated peripheral node TB qualifies');
  assert.equal(r({ ...base, cxr: 'other' }).bandLabel, '6 months');
});

test('Xpert low is eligible; medium is not', () => {
  assert.equal(r({ ...base, bact: 'low' }).bandLabel, '4 months');
  assert.equal(r({ ...base, bact: 'medium' }).bandLabel, '6 months');
  assert.equal(r({ ...base, bact: 'smearpos' }).bandLabel, '6 months');
});

test('exclusions', () => {
  assert.equal(r({ ...base, age: '0.2' }).bandLabel, '6 months');
  assert.equal(r({ ...base, age: '0.5', weight: '2.9' }).bandLabel, '6 months');
  assert.equal(r({ ...base, prior: 'yes' }).bandLabel, '6 months');
  assert.equal(r({ ...base, signs: 'yes' }).bandLabel, '6 months');
  assert.equal(r({ ...base, pneumonia: 'yes' }).bandLabel, '6 months');
  assert.equal(r({ ...base, dr: 'yes' }).bandLabel, 'Drug-resistant TB');
  assert.equal(r({ ...base, age: '17' }).bandLabel, 'Over 16 years');
  assert.equal(r({ ...base, age: '16.9' }).bandLabel, '4 months');
});

test('HIV and ethambutol', () => {
  const x = r({ ...base, hiv: 'yes' });
  assert.equal(x.bandLabel, '4 months may be considered');
  assert.match(x.band, /2HRZE\/2HR/);
  assert.match(r({ ...base, highprev: 'yes' }).band, /2HRZE\/2HR/);
  assert.match(r(base).band, /\(2HRZ\/2HR\)/);
  assert.match(r({ ...base, highprev: '' }).band, /2HRZ\(E\)\/2HR/);
  assert.ok(r({ ...base, highprev: '' }).notes.some((n) => /not entered/.test(n)));
});

test('refusals', () => {
  assert.equal(r({ ...base, setting: '' }).valid, false);
  assert.equal(r({ ...base, bact: '' }).valid, false);
  assert.equal(r({ ...base, cxr: '' }).valid, false);
  assert.equal(r({ ...base, age: '' }).valid, false);
  assert.equal(r({ ...base, hiv: '' }).valid, false);
});
