// spec-v1489: the 2017 World Workshop peri-implant case definitions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { periImplantStatus as pi } from '../../lib/peri-implant-status-v1489.js';

test('the worked example: no baseline, bleeding, 7 mm pocket and 4 mm bone level is peri-implantitis', () => {
  const r = pi({ bleeding: 'yes', baseline: 'no', probingDepth: '7', boneLevel: '4' });
  assert.equal(r.bandLabel, 'Peri-implantitis');
  assert.match(r.band, /no baseline/);
});

test('with a baseline, the three findings decide', () => {
  assert.equal(pi({ bleeding: 'no', baseline: 'yes', boneLoss: 'no' }).bandLabel, 'Peri-implant health');
  assert.equal(pi({ bleeding: 'yes', baseline: 'yes', boneLoss: 'no' }).bandLabel, 'Peri-implant mucositis');
  assert.equal(pi({ bleeding: 'yes', baseline: 'yes', boneLoss: 'yes', depthIncrease: 'yes' }).bandLabel, 'Peri-implantitis');
  assert.equal(pi({ bleeding: 'yes', baseline: 'yes', boneLoss: 'yes', depthIncrease: 'no' }).bandLabel, 'Criteria not all met');
  assert.equal(pi({ bleeding: 'no', baseline: 'yes', boneLoss: 'yes' }).bandLabel, 'Fits no case definition');
});

test('without a baseline, both thresholds are needed and are inclusive', () => {
  assert.equal(pi({ bleeding: 'yes', baseline: 'no', probingDepth: '6', boneLevel: '3' }).bandLabel, 'Peri-implantitis');
  assert.equal(pi({ bleeding: 'yes', baseline: 'no', probingDepth: '5.5', boneLevel: '4' }).bandLabel, 'Inflamed, peri-implantitis thresholds not met');
  assert.equal(pi({ bleeding: 'no', baseline: 'no' }).bandLabel, 'No inflammation on probing');
});

test('a blank that decides the category is asked for, and impossible values are refused', () => {
  for (const r of [pi({}), pi({ bleeding: 'yes' }), pi({ bleeding: 'yes', baseline: 'yes' }),
    pi({ bleeding: 'yes', baseline: 'yes', boneLoss: 'yes' }), pi({ bleeding: 'yes', baseline: 'no', probingDepth: '7' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
  assert.equal(pi({ bleeding: 'yes', baseline: 'no', probingDepth: '70', boneLevel: '4' }).valid, false);
});
