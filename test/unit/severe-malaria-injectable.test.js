// spec-v1551 tool 2: injectable treatment of severe malaria (WHO 2026). The artesunate step at 19.9/20 kg,
// artemether, quinine as salt with its rate limit, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { severeMalariaInjectable as s } from '../../lib/severe-malaria-injectable-v1551.js';

test('artesunate: 3 mg/kg under 20 kg, 2.4 mg/kg from 20 kg, at 0, 12 and 24 h then daily', () => {
  const small = s({ drug: 'artesunate', weight: '19.9' });
  assert.equal(small.bandLabel, '59.7 mg per dose');
  assert.match(small.band, /3 mg\/kg, the dose under 20 kg/);
  const big = s({ drug: 'artesunate', weight: '20' });
  assert.equal(big.bandLabel, '48 mg per dose');
  assert.match(big.band, /2\.4 mg\/kg, the dose from 20 kg\), IV or IM, at admission, 12 hours and 24 hours, then once a day\./);
  assert.equal(s({ drug: 'artesunate', weight: '60' }).bandLabel, '144 mg per dose');
  assert.doesNotMatch(big.band + big.notes.join(' '), /\d+(\.\d+)? mL\b(?! of 5% dextrose)/, 'no product volume is printed');
});

test('artemether IM: 3.2 mg/kg then 1.6 mg/kg daily', () => {
  assert.match(s({ drug: 'artemether', weight: '25' }).band, /Artemether IM 80 mg as the first dose \(3\.2 mg\/kg\), then 40 mg once a day/);
});

test('quinine: 20 mg salt/kg loading, 10 every 8 h, the rate limit, the 48 h reduction and the IM split', () => {
  const q = s({ drug: 'quinine', weight: '30' });
  assert.match(q.band, /600 mg salt as the loading dose \(20 mg salt\/kg\), then 300 mg salt \(10 mg salt\/kg\) every 8 hours, starting 8 hours after the first dose\. All doses are salt, not base\./);
  const n = q.notes.join(' ');
  assert.match(n, /never faster than 5 mg salt\/kg an hour \(150 mg an hour here\)/);
  assert.match(n, /reduce by a third, to 300 mg salt every 12 hours/);
  assert.match(n, /split the first dose, 300 mg into each thigh/);
});

test('no drug, a blank or impossible weight are refused', () => {
  assert.match(s({ weight: '20' }).message, /Choose the injectable drug/);
  assert.equal(s({ drug: 'artesunate' }).valid, false);
  assert.equal(s({ drug: 'artesunate', weight: '0.2' }).valid, false);
  assert.equal(s({ drug: 'quinine', weight: '200' }).valid, false);
});
