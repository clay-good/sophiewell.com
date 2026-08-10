// spec-v682: Wang Bronchiolitis Respiratory Score.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { wangBronchiolitis } from '../../lib/wang-bronchiolitis-v682.js';

test('all-minimal inputs score 0', () => {
  const r = wangBronchiolitis({ respiratoryRate: '25', wheezing: '0', retraction: '0', generalCondition: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.advisoryBand, 'mild');
  assert.equal(r.abnormal, false);
});

test('respiratory-rate bands: <30=0, 30-45=1, 46-60=2, >60=3', () => {
  const base = { wheezing: '0', retraction: '0', generalCondition: '0' };
  assert.equal(wangBronchiolitis({ ...base, respiratoryRate: '29' }).rrPoints, 0);
  assert.equal(wangBronchiolitis({ ...base, respiratoryRate: '30' }).rrPoints, 1);
  assert.equal(wangBronchiolitis({ ...base, respiratoryRate: '45' }).rrPoints, 1);
  assert.equal(wangBronchiolitis({ ...base, respiratoryRate: '46' }).rrPoints, 2);
  assert.equal(wangBronchiolitis({ ...base, respiratoryRate: '60' }).rrPoints, 2);
  assert.equal(wangBronchiolitis({ ...base, respiratoryRate: '61' }).rrPoints, 3);
});

test('general condition accepts only 0 or 3 (1 and 2 are rejected)', () => {
  const base = { respiratoryRate: '25', wheezing: '0', retraction: '0' };
  assert.equal(wangBronchiolitis({ ...base, generalCondition: '3' }).score, 3);
  assert.equal(wangBronchiolitis({ ...base, generalCondition: '1' }).valid, false);
  assert.equal(wangBronchiolitis({ ...base, generalCondition: '2' }).valid, false);
});

test('worked example: RR 50 (2) + wheeze 2 + retraction 1 + condition 3 = 8', () => {
  const r = wangBronchiolitis({ respiratoryRate: '50', wheezing: '2', retraction: '1', generalCondition: '3' });
  assert.equal(r.score, 8);
  assert.equal(r.advisoryBand, 'moderate');
  assert.match(r.band, /Wang 8 of 12/);
});

test('maximum is 12', () => {
  const r = wangBronchiolitis({ respiratoryRate: '70', wheezing: '3', retraction: '3', generalCondition: '3' });
  assert.equal(r.score, 12);
  assert.equal(r.advisoryBand, 'severe');
  assert.equal(r.abnormal, true);
});

test('advisory bands: <=3 mild, 4-8 moderate, >=9 severe', () => {
  const mk = (rr, w, rt, c) => wangBronchiolitis({ respiratoryRate: rr, wheezing: w, retraction: rt, generalCondition: c }).advisoryBand;
  assert.equal(mk('35', '1', '1', '0'), 'mild');   // 1+1+1 = 3
  assert.equal(mk('50', '1', '1', '0'), 'moderate'); // 2+1+1 = 4
  assert.equal(mk('70', '3', '0', '3'), 'severe');   // 3+3+0+3 = 9
});

test('inputs are validated', () => {
  assert.equal(wangBronchiolitis({}).valid, false);
  assert.equal(wangBronchiolitis({}).code, 'MISSING_INPUT');
  assert.equal(wangBronchiolitis({ respiratoryRate: '40', wheezing: '0', retraction: '0' }).field, 'generalCondition');
  assert.equal(wangBronchiolitis({ respiratoryRate: '40', wheezing: '5', retraction: '0', generalCondition: '0' }).field, 'wheezing');
});
