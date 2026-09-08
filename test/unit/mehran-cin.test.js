// spec-v92 §2.4: Mehran contrast-induced nephropathy risk score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mehranCin } from '../../lib/nephro-v92.js';

test('worked example: CHF + diabetes + 300 mL contrast + eGFR 30 -> 15 (high)', () => {
  const r = mehranCin({ chf: true, diabetes: true, contrastVolume: 300, egfr: 30 });
  // CHF 5 + DM 3 + contrast 3 + eGFR(20-40) 4 = 15
  assert.equal(r.total, 15);
  assert.equal(r.riskKey, 'high');
  assert.match(r.risk, /26\.1%/);
});

test('band edge 5/6: 5 = low, 6 = moderate', () => {
  // anemia 3 + eGFR(40-60) 2 = 5. The measurements are entered, and spec-v1139
  // added the six clinical factors to the same rule, so they are stated too:
  // each can add 3 to 5 points, and "low risk" cannot be read off a total that
  // five unstated factors could raise to 22.
  assert.equal(mehranCin({
    anemia: true, egfr: 50, contrastVolume: 0,
    hypotension: 'no', iabp: 'no', chf: 'no', ageOver75: 'no', diabetes: 'no',
  }).riskKey, 'low');
  // CHF 5 + contrast 100 mL (1) = 6
  assert.equal(mehranCin({ chf: true, contrastVolume: 100 }).riskKey, 'moderate');
});

test('band edge 10/11 and 15/16', () => {
  // hypotension 5 + CHF 5 = 10 -> moderate
  assert.equal(mehranCin({ hypotension: true, chf: true }).riskKey, 'moderate');
  // + contrast 100 (1) = 11 -> high
  assert.equal(mehranCin({ hypotension: true, chf: true, contrastVolume: 100 }).riskKey, 'high');
  // hypotension 5 + IABP 5 + CHF 5 = 15 -> high
  assert.equal(mehranCin({ hypotension: true, iabp: true, chf: true }).riskKey, 'high');
  // + diabetes 3 = 18 -> very high
  assert.equal(mehranCin({ hypotension: true, iabp: true, chf: true, diabetes: true }).riskKey, 'vhigh');
});

test('contrast volume = 1 point per 100 mL; eGFR band term clamps', () => {
  assert.equal(mehranCin({ contrastVolume: 200 }).points.contrast, 2);
  assert.equal(mehranCin({ egfr: 15 }).points.egfr, 6);
  assert.equal(mehranCin({ egfr: 80 }).points.egfr, 0);
});

// spec-v1007: this test used to assert the defect -- an empty form answering
// "low risk: ~7.5% contrast-induced nephropathy". Contrast volume and eGFR are
// the two unbounded terms; without them the low band cannot be claimed.
test('blank measurements -> the low band is withheld, not asserted', () => {
  const r = mehranCin({});
  assert.equal(r.valid, false);
  assert.equal(r.total, null);
  assert.equal(r.riskKey, null);
  assert.match(r.band, /contrast volume and eGFR/);
  // With everything entered, a genuinely zero-risk patient still bands low.
  const complete = mehranCin({
    contrastVolume: 0, egfr: 90,
    hypotension: 'no', iabp: 'no', chf: 'no', ageOver75: 'no', anemia: 'no', diabetes: 'no',
  });
  assert.equal(complete.valid, true);
  assert.equal(complete.riskKey, 'low');
});

test('spec-v1139: an omitted clinical factor is not a "no" on the agent surface', () => {
  // The page shows `No` selected and the reader can change it -- that is the
  // disclosure spec-v1007 relied on when it called the six factors pickers. The
  // agent surface has no picker, and omitting `chf` is not the same statement as
  // sending chf: 'no': it is five points, and the worked example drops from
  // "Mehran 15: high risk, ~26.1% nephropathy, ~1.09% dialysis" to "Mehran 10:
  // moderate risk, ~14.0%, ~0.12%".
  const stated = mehranCin({
    chf: 'yes', diabetes: 'yes', contrastVolume: 300, egfr: 30,
    hypotension: 'no', iabp: 'no', ageOver75: 'no', anemia: 'no',
  });
  assert.equal(stated.unstatedFactors.length, 0);
  assert.doesNotMatch(stated.band, /not stated/);

  const partial = mehranCin({ chf: 'yes', diabetes: 'yes', contrastVolume: 300, egfr: 30 });
  assert.deepEqual(partial.unstatedFactors, ['hypotension', 'iabp', 'ageOver75', 'anemia']);
  assert.match(partial.band, /Scored from 2 of 6 clinical factors/);
  assert.match(partial.band, /the rest can only raise it/);
  // The band itself is unchanged: the total is a floor and high risk rules in.
  assert.equal(partial.riskKey, stated.riskKey);
});

test('spec-v1139: an unstated factor keeps the low band withheld', () => {
  // Each factor can only add, so a total of 5 with any factor unstated is not a
  // low-risk patient -- it is a floor that four unstated factors could raise.
  const r = mehranCin({ anemia: 'yes', egfr: 50, contrastVolume: 0 });
  assert.equal(r.valid, false);
  assert.equal(r.riskKey, null);
  assert.match(r.band, /hypotension/);
  assert.match(r.band, /can only add points/);
});
