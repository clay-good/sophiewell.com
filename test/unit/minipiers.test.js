// spec-v138 2.3: miniPIERS (Payne 2014). logit = -5.77 - 0.298*multip - 1.07*ln(GA)
// + 1.34*ln(SBP) + dipstick term + 1.18*vbap + 0.422*hv + 0.847*cpd. GA/SBP natural log;
// dipstick 2+ = -0.218, 3+ = +0.424, 4+ = +0.512.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { miniPiers } from '../../lib/ob-v138.js';

test('worked example -> 10% lower risk', () => {
  const r = miniPiers({ multiparous: 'yes', ga: 34, sbp: 160, proteinuria: '3+', headacheVisual: 'yes' });
  assert.equal(r.valid, true);
  assert.equal(r.probability, 10);
  assert.equal(r.abnormal, false);
});

test('severe profile crosses the >= 25% rule-in flag', () => {
  const r = miniPiers({ multiparous: 'no', ga: 30, sbp: 200, proteinuria: '4+', headacheVisual: 'yes', chestPainDyspnea: 'yes', vaginalBleedingAbdPain: 'yes' });
  assert.equal(r.valid, true);
  assert.ok(r.probability >= 25);
  assert.equal(r.abnormal, true);
});

test('dipstick 2+ carries the published negative coefficient (lowers risk vs 3+)', () => {
  const base = { multiparous: 'no', ga: 32, sbp: 150, headacheVisual: 'no' };
  const dip2 = miniPiers({ ...base, proteinuria: '2+' });
  const dip3 = miniPiers({ ...base, proteinuria: '3+' });
  assert.ok(dip2.probability < dip3.probability);
});

test('missing GA or SBP -> valid:false (no ln of a bad input)', () => {
  assert.equal(miniPiers({ multiparous: 'yes', sbp: 160 }).valid, false);
  assert.equal(miniPiers({ ga: 34 }).valid, false);
  assert.equal(miniPiers(0).valid, false);
});

test('spec-v1117: an undipped proteinuria is not a negative dipstick', () => {
  // `DIP_BETA[o.proteinuria] || 0` covered two different things: 'lt2', which
  // really does score 0, and a proteinuria nobody dipped. 10% probability of an
  // adverse maternal outcome became 6.8%, across the 15% surveillance threshold.
  const dipped = miniPiers({ ga: 34, sbp: 150, proteinuria: 'lt2' });
  assert.equal(dipped.valid, true);

  const r = miniPiers({ ga: 34, sbp: 150 });
  assert.equal(r.valid, false);
  assert.match(r.message, /dipstick proteinuria is needed/);
});
