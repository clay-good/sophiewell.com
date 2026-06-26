// spec-v154 2.1: Berg Balance Scale (Berg 1992). 14 tasks each 0-4, total
// 0-56. Strata 0-20 wheelchair-bound / high fall risk, 21-40 walking with
// assistance, 41-56 independent; total < 45 flags increased fall risk (strict).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bergBalance } from '../../lib/function-v154.js';

const all = (v) => {
  const o = {};
  for (let i = 1; i <= 14; i += 1) o[`q${i}`] = v;
  return o;
};

test('tile example: all tasks 3 -> 42/56, independent stratum, < 45 increased risk', () => {
  const r = bergBalance(all('3'));
  assert.equal(r.valid, true);
  assert.equal(r.score, 42);
  assert.equal(r.bandLabel, 'Walking independently');
  assert.equal(r.increasedRisk, true);
  assert.equal(r.abnormal, true);
});

test('44/45 fall-risk flip (strict < 45)', () => {
  // 11 tasks at 4 = 44; one more point = 45.
  const at44 = all('0'); for (let i = 1; i <= 11; i += 1) at44[`q${i}`] = '4';
  const r44 = bergBalance(at44);
  assert.equal(r44.score, 44);
  assert.equal(r44.increasedRisk, true);
  const at45 = all('0'); for (let i = 1; i <= 11; i += 1) at45[`q${i}`] = '4'; at45.q12 = '1';
  const r45 = bergBalance(at45);
  assert.equal(r45.score, 45);
  assert.equal(r45.increasedRisk, false);
  assert.equal(r45.abnormal, false);
});

test('stratum boundaries 20/21 and 40/41', () => {
  const at20 = all('0'); at20.q1 = '4'; at20.q2 = '4'; at20.q3 = '4'; at20.q4 = '4'; at20.q5 = '4';
  const r20 = bergBalance(at20);
  assert.equal(r20.score, 20);
  assert.equal(r20.bandLabel, 'Wheelchair-bound / high fall risk');
  const at21 = all('0'); at21.q1 = '4'; at21.q2 = '4'; at21.q3 = '4'; at21.q4 = '4'; at21.q5 = '4'; at21.q6 = '1';
  assert.equal(bergBalance(at21).bandLabel, 'Walking with assistance');
  const at40 = all('0'); for (let i = 1; i <= 10; i += 1) at40[`q${i}`] = '4';
  assert.equal(bergBalance(at40).score, 40);
  assert.equal(bergBalance(at40).bandLabel, 'Walking with assistance');
  const at41 = all('0'); for (let i = 1; i <= 10; i += 1) at41[`q${i}`] = '4'; at41.q11 = '1';
  assert.equal(bergBalance(at41).bandLabel, 'Walking independently');
});

test('max 56 lower-risk; blank task -> valid:false', () => {
  assert.equal(bergBalance(all('4')).score, 56);
  assert.equal(bergBalance(all('4')).increasedRisk, false);
  const partial = all('2'); delete partial.q7;
  assert.equal(bergBalance(partial).valid, false);
  assert.match(bergBalance(partial).message, /Score all 14/);
});
