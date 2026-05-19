import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daptScore } from '../../lib/scoring-v4.js';

test('dapt-score 0 (tile example) -> does not favor extended DAPT', () => {
  const r = daptScore({ ageBand: '<65' });
  assert.equal(r.score, 0);
  assert.equal(r.favorsExtendedDapt, false);
  assert.match(r.band, /does not favor extended DAPT/);
});

test('dapt-score -2 (age >=75 alone) -> does not favor', () => {
  const r = daptScore({ ageBand: '>=75' });
  assert.equal(r.score, -2);
  assert.equal(r.favorsExtendedDapt, false);
});

test('dapt-score +1 (diabetes alone) just below cutoff -> does not favor', () => {
  const r = daptScore({ ageBand: '<65', diabetes: true });
  assert.equal(r.score, 1);
  assert.equal(r.favorsExtendedDapt, false);
});

test('dapt-score +2 boundary (CHF alone) -> favors extended DAPT', () => {
  const r = daptScore({ ageBand: '<65', chfOrLvefLt30: true });
  assert.equal(r.score, 2);
  assert.equal(r.favorsExtendedDapt, true);
  assert.match(r.band, /favors continuing DAPT beyond 12 months/);
});

test('dapt-score 2 (CHF + diabetes + age 65-74 = 2) -> favors', () => {
  const r = daptScore({ ageBand: '65-74', chfOrLvefLt30: true, diabetes: true });
  assert.equal(r.score, 2);
  assert.equal(r.favorsExtendedDapt, true);
});

test('dapt-score max +10 (age <65 + every checkbox) -> favors', () => {
  const r = daptScore({
    ageBand: '<65', chfOrLvefLt30: true, veinGraftPci: true,
    miAtPresentation: true, priorMiOrPci: true, diabetes: true,
    stentDiameterLt3mm: true, paclitaxelStent: true, currentSmoker: true,
  });
  assert.equal(r.score, 10);
  assert.equal(r.favorsExtendedDapt, true);
});

test('dapt-score unknown age string contributes 0', () => {
  const r = daptScore({ ageBand: 'unknown', diabetes: true });
  assert.equal(r.score, 1);
});
