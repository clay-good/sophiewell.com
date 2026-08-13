// spec-v712: MNA-SF (Mini Nutritional Assessment Short Form).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mnaSf } from '../../lib/mna-sf-v712.js';

const MAX = { foodIntake: '2', weightLoss: '3', mobility: '2', acuteStress: '2', neuropsych: '2', bmiOrCalf: '3' };

test('maximum is 14 -> normal', () => {
  const r = mnaSf(MAX);
  assert.equal(r.valid, true);
  assert.equal(r.score, 14);
  assert.equal(r.tier, 'normal');
  assert.equal(r.abnormal, false);
});

test('worked example sums to 11 -> at risk of malnutrition', () => {
  const r = mnaSf({ foodIntake: '1', weightLoss: '2', mobility: '2', acuteStress: '2', neuropsych: '2', bmiOrCalf: '2' });
  assert.equal(r.score, 11);
  assert.equal(r.tier, 'at-risk');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /MNA-SF 11 of 14/);
});

test('bands: 12-14 normal, 8-11 at risk, 0-7 malnourished', () => {
  const twelve = mnaSf({ ...MAX, bmiOrCalf: '1' }); // 14 - 2 = 12
  assert.equal(twelve.score, 12);
  assert.equal(twelve.tier, 'normal');
  const seven = mnaSf({ foodIntake: '1', weightLoss: '1', mobility: '1', acuteStress: '0', neuropsych: '1', bmiOrCalf: '3' }); // 7
  assert.equal(seven.score, 7);
  assert.equal(seven.tier, 'malnourished');
});

test('the acute-stress item only allows 0 or 2', () => {
  assert.equal(mnaSf({ ...MAX, acuteStress: '1' }).valid, false);
  assert.equal(mnaSf({ ...MAX, acuteStress: '0' }).valid, true);
});

test('inputs are validated / required', () => {
  assert.equal(mnaSf({}).valid, false);
  assert.equal(mnaSf({}).code, 'MISSING_INPUT');
  const partial = { ...MAX }; delete partial.bmiOrCalf;
  assert.equal(mnaSf(partial).field, 'bmiOrCalf');
});
