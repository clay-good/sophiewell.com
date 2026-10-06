// spec-v1552 tool 2: vivax radical cure by G6PD result. Each test-result row, tafenoquine eligibility and
// bands, women without a quantitative test, and the exclusions.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vivaxRadicalCure as r } from '../../lib/vivax-radical-cure-v1552.js';

const man = { weight: '60', age: '30', sex: 'male', test: 'semi', result: 'gt70', blood: 'cq', southAmerica: 'yes' };

test('semi-quantitative rows', () => {
  const n = r(man);
  assert.match(n.band, /primaquine 30 mg base a day for 14 days/);
  assert.ok(n.notes.some((x) => /60 mg base a day for 7 days/.test(x)));
  assert.ok(n.notes.some((x) => /tafenoquine 300 mg once/.test(x)));
  assert.equal(r({ ...man, result: '30to70' }).bandLabel, '14 days, with precautions');
  assert.equal(r({ ...man, result: 'lt30' }).bandLabel, 'Weekly for 8 weeks');
  assert.match(r({ ...man, result: 'lt30' }).band, /45 mg base once a week/);
});

test('tafenoquine eligibility and bands', () => {
  assert.ok(r({ ...man, southAmerica: 'no' }).notes.some((x) => /only in South America/.test(x)));
  assert.ok(r({ ...man, blood: 'act' }).notes.some((x) => /only with chloroquine/.test(x)));
  assert.ok(r({ ...man, age: '1.5', weight: '11' }).notes.some((x) => /2 years or older/.test(x)));
  assert.ok(r({ ...man, age: '5', weight: '20' }).notes.some((x) => /100 mg once/.test(x)));
  assert.ok(r({ ...man, age: '8', weight: '20.5' }).notes.some((x) => /200 mg once/.test(x)));
  assert.ok(r({ ...man, result: '30to70' }).notes.every((x) => !/tafenoquine 300/.test(x)));
});

test('qualitative and women', () => {
  const q = r({ ...man, test: 'qual', result: 'notdef' });
  assert.equal(q.bandLabel, '14 days');
  assert.ok(q.notes.some((x) => /No tafenoquine/i.test(x)));
  const w = r({ ...man, sex: 'female', pregnant: 'no', bfInfant: 'no', test: 'qual', result: 'notdef' });
  assert.ok(w.notes.some((x) => /every woman is treated as possibly intermediate/.test(x)));
  assert.equal(r({ ...man, test: 'qual', result: 'gt70' }).valid, false);
});

test('no test and exclusions', () => {
  assert.equal(r({ ...man, test: 'none', result: '' }).bandLabel, 'No test, no regimen');
  assert.equal(r({ ...man, sex: 'female', pregnant: 'yes', bfInfant: 'no' }).bandLabel, 'Not in pregnancy');
  assert.equal(r({ ...man, sex: 'female', pregnant: 'no', bfInfant: 'yes' }).bandLabel, 'Not now (breastfeeding)');
  assert.equal(r({ ...man, age: '0.05', weight: '4' }).bandLabel, 'Not under 1 month');
  assert.equal(r({ ...man, sex: 'female' }).valid, false);
  assert.equal(r({ ...man, weight: '' }).valid, false);
});
