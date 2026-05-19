import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nigrovic } from '../../lib/scoring-v4.js';

test('nigrovic 0 (tile example) -> very low risk', () => {
  const r = nigrovic({});
  assert.equal(r.score, 0);
  assert.equal(r.veryLowRisk, true);
  assert.match(r.band, /very low risk for bacterial meningitis per Nigrovic 2007/);
});

test('nigrovic 1 (peripheral ANC alone) -> not low risk', () => {
  const r = nigrovic({ peripheralAncGte10000: true });
  assert.equal(r.score, 1);
  assert.equal(r.veryLowRisk, false);
  assert.match(r.band, /NOT low risk/);
});

test('nigrovic 2 (Gram stain weighted +2 alone) -> not low risk', () => {
  const r = nigrovic({ csfGramStainPositive: true });
  assert.equal(r.score, 2);
  assert.equal(r.veryLowRisk, false);
});

test('nigrovic 1 via seizure alone -> not low risk', () => {
  const r = nigrovic({ seizureAtOrBeforePresentation: true });
  assert.equal(r.score, 1);
  assert.equal(r.veryLowRisk, false);
});

test('nigrovic 6 (all criteria) -> not low risk', () => {
  const r = nigrovic({
    csfGramStainPositive: true, csfAncGte1000: true, csfProteinGte80: true,
    peripheralAncGte10000: true, seizureAtOrBeforePresentation: true,
  });
  assert.equal(r.score, 6);
  assert.equal(r.veryLowRisk, false);
});
