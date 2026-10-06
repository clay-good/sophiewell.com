// spec-v1562 tool 3: the community schistosomiasis decision at 9.9/10%, POC-CCA 30%, and twice yearly.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schistoCommunityTreatment as r } from '../../lib/schisto-community-treatment-v1562.js';

test('thresholds', () => {
  assert.equal(r({ prevalence: '9.9', method: 'kk' }).bandLabel, 'Under the threshold');
  assert.equal(r({ prevalence: '10', method: 'kk' }).bandLabel, 'Yearly mass treatment');
  assert.equal(r({ prevalence: '29.9', method: 'cca' }).bandLabel, 'Under the threshold');
  assert.equal(r({ prevalence: '30', method: 'cca' }).bandLabel, 'Yearly mass treatment');
  assert.match(r({ prevalence: '5', method: 'uf', priorProgram: 'no' }).band, /test and treat/);
});

test('twice yearly after a poor response', () => {
  assert.equal(r({ prevalence: '45', method: 'kk', baseline: '60', rounds: 'yes' }).bandLabel, 'Consider twice yearly');
  assert.equal(r({ prevalence: '35', method: 'kk', baseline: '60', rounds: 'yes' }).bandLabel, 'Yearly mass treatment');
  assert.equal(r({ prevalence: '45', method: 'kk', baseline: '60', rounds: 'no' }).bandLabel, 'Yearly mass treatment');
  assert.equal(r({ prevalence: '10' }).valid, false);
});
