// spec-v149 2.1: pediatric weight estimate (APLS). 0-12 mo (months/2)+4;
// 1-5 yr (2 x years)+8; 6-12 yr (3 x years)+7; > 12 yr flag adult dosing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsWeightEst } from '../../lib/ems-v149.js';

test('5 years -> 18 kg via (2 x years) + 8', () => {
  const r = pedsWeightEst({ years: 5 });
  assert.equal(r.valid, true);
  assert.equal(r.kg, 18);
  assert.match(r.band, /Estimated weight 18 kg \(39\.7 lb\) by APLS: \(2 x years\) \+ 8\./);
});

test('6 months -> 7 kg via (months / 2) + 4', () => {
  const r = pedsWeightEst({ months: 6 });
  assert.equal(r.kg, 7);
  assert.match(r.band, /\(months \/ 2\) \+ 4/);
});

test('10 years -> 37 kg via (3 x years) + 7', () => {
  const r = pedsWeightEst({ years: 10 });
  assert.equal(r.kg, 37);
});

test('months takes precedence over years when both present', () => {
  const r = pedsWeightEst({ months: 6, years: 5 });
  assert.equal(r.kg, 7); // infant path wins
});

test('over 12 years computes (3 x years) + 7 with adult-dosing flag', () => {
  const r = pedsWeightEst({ years: 13 });
  assert.equal(r.kg, 46);
  assert.match(r.flag, /adult-weight dosing/);
});

test('no age entered -> invalid prompt, no NaN', () => {
  const r = pedsWeightEst({});
  assert.equal(r.valid, false);
  assert.doesNotMatch(r.band, /NaN/);
});

test('age out of range (years 99) -> invalid', () => {
  const r = pedsWeightEst({ years: 99 });
  assert.equal(r.valid, false);
});
