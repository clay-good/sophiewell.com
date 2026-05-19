// spec-v12 §3.6.2 wave 12-6: LACE Index boundary examples per
// van Walraven C, et al. CMAJ. 2010;182(6):551-557 Table 3 / Figure 2.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lace } from '../../lib/scoring-v4.js';

test('lace low: LOS 3, no acute, Charlson 0, 0 ED -> 3 (low)', () => {
  const r = lace({ losDays: 3, acuteAdmission: false, charlsonScore: 0, edVisits6mo: 0 });
  assert.equal(r.score, 3);
  assert.match(r.band, /low risk/);
});

test('lace mid: LOS 5 (4) + acute (3) + Charlson 2 (2) + 1 ED (1) -> 10 (high)', () => {
  const r = lace({ losDays: 5, acuteAdmission: true, charlsonScore: 2, edVisits6mo: 1 });
  assert.equal(r.score, 10);
  assert.match(r.band, /high risk/);
});

test('lace high max: LOS 14 (7) + acute (3) + Charlson 4 (5) + 4 ED (4) -> 19', () => {
  const r = lace({ losDays: 14, acuteAdmission: true, charlsonScore: 4, edVisits6mo: 4 });
  assert.equal(r.score, 19);
  assert.match(r.band, /high risk/);
});

test('lace LOS bands per Table 3: 4-6=4, 7-13=5, 14+=7', () => {
  const f = (d) => lace({ losDays: d, acuteAdmission: false, charlsonScore: 0, edVisits6mo: 0 }).parts.los;
  assert.equal(f(1), 1);
  assert.equal(f(2), 2);
  assert.equal(f(3), 3);
  assert.equal(f(4), 4);
  assert.equal(f(6), 4);
  assert.equal(f(7), 5);
  assert.equal(f(13), 5);
  assert.equal(f(14), 7);
  assert.equal(f(30), 7);
});

test('lace Charlson and ED caps: Charlson >=4 -> 5; ED >=4 -> 4', () => {
  const r = lace({ losDays: 1, acuteAdmission: false, charlsonScore: 8, edVisits6mo: 10 });
  assert.equal(r.parts.charlson, 5);
  assert.equal(r.parts.ed, 4);
});
