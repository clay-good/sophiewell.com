// spec-v708: AAO-HNS Meniere hearing stage.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { meniereAaoHns } from '../../lib/meniere-aao-hns-v708.js';

test('worked example: 20/30/40/50 -> PTA 35, stage 2', () => {
  const r = meniereAaoHns({ threshold500: '20', threshold1000: '30', threshold2000: '40', threshold3000: '50' });
  assert.equal(r.valid, true);
  assert.equal(r.pta, 35);
  assert.equal(r.stage, 2);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /stage 2/);
});

test('PTA is the mean of the four thresholds', () => {
  const r = meniereAaoHns({ threshold500: '10', threshold1000: '10', threshold2000: '10', threshold3000: '10' });
  assert.equal(r.pta, 10);
  assert.equal(r.stage, 1);
});

test('stage bands: <=25 = 1, 26-40 = 2, 41-70 = 3, >70 = 4', () => {
  assert.equal(meniereAaoHns({ threshold500: '25', threshold1000: '25', threshold2000: '25', threshold3000: '25' }).stage, 1); // 25
  assert.equal(meniereAaoHns({ threshold500: '26', threshold1000: '26', threshold2000: '26', threshold3000: '26' }).stage, 2); // 26
  assert.equal(meniereAaoHns({ threshold500: '41', threshold1000: '41', threshold2000: '41', threshold3000: '41' }).stage, 3); // 41
  assert.equal(meniereAaoHns({ threshold500: '71', threshold1000: '71', threshold2000: '71', threshold3000: '71' }).stage, 4); // 71
});

test('stage 3+ is flagged abnormal', () => {
  assert.equal(meniereAaoHns({ threshold500: '50', threshold1000: '50', threshold2000: '50', threshold3000: '50' }).abnormal, true);
});

test('inputs are validated', () => {
  assert.equal(meniereAaoHns({}).valid, false);
  assert.equal(meniereAaoHns({}).code, 'MISSING_INPUT');
  assert.equal(meniereAaoHns({ threshold500: '20', threshold1000: '20', threshold2000: '20' }).field, 'threshold3000');
});
