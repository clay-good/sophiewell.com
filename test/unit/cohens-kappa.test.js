// spec-v922: Cohen's kappa. The test that matters is the paradox -- 95% agreement, kappa near
// zero -- and that the tile explains it instead of just reporting it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { cohensKappa, KAPPA_NOTE } from '../../lib/cohens-kappa-v922.js';

test('cohens-kappa: all four counts are whole, non-negative numbers', () => {
  assert.equal(cohensKappa({}).valid, false);
  assert.equal(cohensKappa({ bothYes: 1, firstYesSecondNo: 1, firstNoSecondYes: 1, bothNo: -1 }).valid, false);
  assert.equal(cohensKappa({ bothYes: 1.5, firstYesSecondNo: 1, firstNoSecondYes: 1, bothNo: 1 }).valid, false);
  assert.match(cohensKappa({ bothYes: 0, firstYesSecondNo: 0, firstNoSecondYes: 0, bothNo: 0 }).message, /no cases to agree/);
});

test('cohens-kappa: a balanced table gives the textbook value', () => {
  const r = cohensKappa({ bothYes: 45, firstYesSecondNo: 5, firstNoSecondYes: 5, bothNo: 45 });
  assert.equal(r.observedAgreement, 0.9);
  assert.equal(r.expectedAgreement, 0.5);
  assert.equal(r.kappa, 0.8);
  assert.equal(r.abnormal, false);
});

test('cohens-kappa: the first paradox -- 95% agreement, kappa near zero', () => {
  const r = cohensKappa({ bothYes: 95, firstYesSecondNo: 2, firstNoSecondYes: 3, bothNo: 0 });
  assert.equal(r.observedAgreement, 0.95);
  assert.ok(r.kappa < 0.05, `kappa was ${r.kappa}`);
  assert.equal(r.prevalenceIndex, 0.95);
  assert.match(r.paradoxNote, /which is high/);
  assert.match(r.paradoxNote, /Observed agreement here is 95%/);
});

test('cohens-kappa: a substantial bias index is called out', () => {
  const r = cohensKappa({ bothYes: 40, firstYesSecondNo: 25, firstNoSecondYes: 2, bothNo: 33 });
  assert.ok(r.biasIndex >= 0.2);
  assert.match(r.biasNote, /which is substantial/);
  assert.match(r.biasNote, /run in a direction rather than at random/);
});

test('cohens-kappa: with no disagreements at all, kappa is undefined rather than a number', () => {
  const r = cohensKappa({ bothYes: 100, firstYesSecondNo: 0, firstNoSecondYes: 0, bothNo: 0 });
  assert.equal(r.undefinedKappa, true);
  assert.equal(r.kappa, null);
  assert.match(r.band, /kappa has no value/);
  assert.equal(r.observedAgreement, 1);
});

test('cohens-kappa: kappa can fall below zero when agreement is worse than chance', () => {
  const r = cohensKappa({ bothYes: 10, firstYesSecondNo: 40, firstNoSecondYes: 40, bothNo: 10 });
  assert.ok(r.kappa < 0);
  assert.equal(r.bandLabel.includes('worse than chance'), true);
  assert.equal(r.abnormal, true);
});

test('cohens-kappa: the published bands land where they should', () => {
  const bandOf = (r) => r.bandLabel.split(' - ')[1];
  assert.equal(bandOf(cohensKappa({ bothYes: 45, firstYesSecondNo: 5, firstNoSecondYes: 5, bothNo: 45 })), 'substantial');
  assert.equal(bandOf(cohensKappa({ bothYes: 48, firstYesSecondNo: 2, firstNoSecondYes: 2, bothNo: 48 })), 'almost perfect');
  // 0.40 and 0.20 sit on the LOWER band's ceiling: Landis and Koch's divisions are 0.21-0.40
  // and 0.41-0.60, so an exact 0.40 is fair and an exact 0.20 is slight.
  assert.equal(bandOf(cohensKappa({ bothYes: 35, firstYesSecondNo: 15, firstNoSecondYes: 15, bothNo: 35 })), 'fair');
  assert.equal(bandOf(cohensKappa({ bothYes: 30, firstYesSecondNo: 20, firstNoSecondYes: 20, bothNo: 30 })), 'slight');
  assert.equal(bandOf(cohensKappa({ bothYes: 36, firstYesSecondNo: 14, firstNoSecondYes: 14, bothNo: 36 })), 'moderate');
});

test('cohens-kappa: PABAK is reported for comparison, not as a correction', () => {
  const r = cohensKappa({ bothYes: 95, firstYesSecondNo: 2, firstNoSecondYes: 3, bothNo: 0 });
  assert.equal(r.pabak, 0.9);
  assert.match(r.pabakNote, /not as a correction/);
});

test('cohens-kappa: the labels are called a convention on every result', () => {
  for (const args of [
    { bothYes: 45, firstYesSecondNo: 5, firstNoSecondYes: 5, bothNo: 45 },
    { bothYes: 100, firstYesSecondNo: 0, firstNoSecondYes: 0, bothNo: 0 },
  ]) {
    assert.match(cohensKappa(args).labelsNote, /convention rather than a standard/);
    assert.match(cohensKappa(args).scopeNote, /good enough for what the rating is for/);
  }
  assert.match(KAPPA_NOTE, /first kappa paradox/);
});
