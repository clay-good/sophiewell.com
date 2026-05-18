// spec-v12 §3.3.2 wave 12-3: Rockall score boundary examples per the
// shipping contract in spec-v12 §5. Banding reproduces Rockall 1996
// Figure 2 mortality bands; pre-endoscopy variant per Vreeburg 1999
// / NICE CG141.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rockall } from '../../lib/scoring-v4.js';

// Low edge: every category at the lowest band -> 0 (low risk).
test('rockall complete low edge: 0 -> low risk', () => {
  const r = rockall({ ageBand: 0, shock: 0, comorbidity: 0,
    endoscopicDx: 0, stigmata: 0 });
  assert.equal(r.score, 0);
  assert.match(r.band, /low risk/);
});

// Mid: age 60-79 (1) + tachy (1) + CHF (2) + other dx (1) + clean (0) = 5.
// 5 falls in the high-risk band per Rockall 1996 Figure 2.
test('rockall complete mid: age 60-79 + tachy + CHF + other dx -> 5, high risk', () => {
  const r = rockall({ ageBand: 1, shock: 1, comorbidity: 2,
    endoscopicDx: 1, stigmata: 0 });
  assert.equal(r.score, 5);
  assert.match(r.band, /high risk/);
});

// High edge: every category at the deep-red band -> 11.
test('rockall complete high edge: 11 (maximum)', () => {
  const r = rockall({ ageBand: 2, shock: 2, comorbidity: 3,
    endoscopicDx: 2, stigmata: 2 });
  assert.equal(r.score, 11);
  assert.match(r.band, /very high risk|>=40%/);
});

// Pre-endoscopy variant: omits endoscopic dx and stigmata (range 0-7).
test('rockall pre-endoscopy: same inputs -> drops dx/stigmata', () => {
  const r = rockall({ ageBand: 2, shock: 2, comorbidity: 3,
    endoscopicDx: 2, stigmata: 2, preEndoscopy: true });
  assert.equal(r.score, 7);
  assert.equal(r.preEndoscopy, true);
});
