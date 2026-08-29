import test from 'node:test';
import assert from 'node:assert/strict';
import { lymeTwoTier as l, FIRST_TIER_RESULTS, SECOND_TIER_RESULTS, IGM_WINDOW_DAYS } from '../../lib/lyme-two-tier-v873.js';

test('lyme-two-tier: the published result vocabularies', () => {
  assert.deepEqual(FIRST_TIER_RESULTS.map((i) => i.value), ['not-done', 'negative', 'equivocal', 'positive']);
  assert.deepEqual(SECOND_TIER_RESULTS.map((i) => i.value), ['not-done', 'negative', 'igm-only', 'igg']);
  assert.equal(IGM_WINDOW_DAYS, 30);
});

test('lyme-two-tier: a negative first tier ends the testing', () => {
  const r = l({ firstTier: 'negative' });
  assert.equal(r.result, 'negative');
  assert.match(r.orderNote, /only interpretable, after a positive or equivocal first tier/);
  // And a second-tier result cannot rescue it -- a standalone immunoblot means nothing.
  assert.equal(l({ firstTier: 'negative', secondTier: 'igg' }).result, 'negative');
  assert.equal(l({ secondTier: 'igg' }).result, 'no-first-tier');
});

test('lyme-two-tier: both reactive first-tier results call for a second tier', () => {
  for (const first of ['positive', 'equivocal']) {
    const r = l({ firstTier: first });
    assert.equal(r.result, 'second-tier-pending', first);
    assert.match(r.mtttNote, /equal alternative, not a lesser test/);
  }
  // The article agrees with the word that follows it.
  assert.match(l({ firstTier: 'equivocal' }).band, /^An equivocal/);
  assert.match(l({ firstTier: 'positive' }).band, /^A positive/);
});

test('lyme-two-tier: a reactive IgG second tier is positive regardless of timing', () => {
  for (const days of [1, 30, 400, null]) {
    assert.equal(l({ firstTier: 'positive', secondTier: 'igg', daysSinceOnset: days }).result, 'positive', String(days));
  }
});

test('lyme-two-tier: an IgM-only second tier counts only inside the 30 day window', () => {
  assert.equal(l({ firstTier: 'positive', secondTier: 'igm-only', daysSinceOnset: 30 }).result, 'positive');
  assert.equal(l({ firstTier: 'positive', secondTier: 'igm-only', daysSinceOnset: 31 }).result, 'negative-second-tier');
  const late = l({ firstTier: 'positive', secondTier: 'igm-only', daysSinceOnset: 60 });
  assert.match(late.igmNote, /outside the 30-day window/);
  assert.match(late.igmNote, /false positive/);
  // With no day count it is unreadable, not positive.
  const unknown = l({ firstTier: 'positive', secondTier: 'igm-only' });
  assert.equal(unknown.result, 'negative-second-tier');
  assert.match(unknown.igmNote, /cannot be read without them/);
});

test('lyme-two-tier: erythema migrans is said on every result, and sharpened when recorded', () => {
  // The reason the tile exists.
  for (const input of [{}, { firstTier: 'negative' }, { firstTier: 'positive', secondTier: 'igg' }]) {
    assert.match(l(input).emNote, /clinical diagnosis/);
    assert.match(l(input).treatmentNote, /does not measure treatment response/);
  }
  assert.match(l({ erythemaMigrans: true, firstTier: 'negative' }).emNote, /should not be serology-tested/);
  assert.match(l({ firstTier: 'negative' }).emNote, /treated on sight, without serology/);
});

test('lyme-two-tier: a negative inside two weeks is early, not exclusionary', () => {
  assert.match(l({ firstTier: 'negative', daysSinceOnset: 5 }).earlyNote, /convalescent testing/);
  assert.equal(l({ firstTier: 'negative', daysSinceOnset: 40 }).earlyNote, null);
  // Not raised on a positive result.
  assert.equal(l({ firstTier: 'positive', secondTier: 'igg', daysSinceOnset: 5 }).earlyNote, null);
});

test('lyme-two-tier: unknown values fall back rather than throwing, and the range is checked', () => {
  assert.equal(l({ firstTier: 'maybe' }).firstTier, 'not-done');
  assert.equal(l({ firstTier: 'positive', secondTier: 'maybe' }).secondTier, 'not-done');
  assert.equal(l({ daysSinceOnset: -1 }).valid, false);
  assert.equal(l({ daysSinceOnset: 3651 }).valid, false);
  assert.equal(l({ daysSinceOnset: 'abc' }).daysSinceOnset, null);
});

test('lyme-two-tier: the documented example', () => {
  const r = l({ daysSinceOnset: '60', firstTier: 'positive', secondTier: 'igm-only' });
  assert.equal(r.result, 'negative-second-tier');
  assert.equal(r.abnormal, false);
  assert.match(r.igmNote, /At 60 days from onset/);
  assert.match(r.band, /within 30 days of symptom onset/);
});
