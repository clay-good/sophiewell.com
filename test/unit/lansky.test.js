// spec-v352: Lansky Play-Performance Scale (pediatric functional status, 0-100 in steps of 10).
// Worked-example tests: the score description, the three coarse functional bands, the reduced flag on
// 0-40, string/number input, and the invalid-score guard (non-multiples of 10, out of range).
// Levels transcribed from Lansky et al. Cancer 1987, cross-verified against pediatric-oncology
// references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lansky } from '../../lib/lansky-v352.js';

test('score 60: up and around, minimal active play, not reduced (the META example)', () => {
  const r = lansky({ score: '60' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 60);
  assert.equal(r.reduced, false);
  assert.equal(r.functionalBand, 'reduced activity but up and about');
  assert.match(r.band, /minimal active play/);
});

test('80-100 is the "normal activity" band, not flagged', () => {
  for (const s of [80, 90, 100]) {
    const r = lansky({ score: s });
    assert.equal(r.functionalBand, 'able to carry on normal activity', String(s));
    assert.equal(r.reduced, false, String(s));
  }
  assert.match(lansky({ score: 100 }).band, /Fully active, normal/);
});

test('0-40 is the disabled band and is flagged', () => {
  for (const s of [0, 10, 20, 30, 40]) {
    const r = lansky({ score: s });
    assert.equal(r.reduced, true, String(s));
    assert.equal(r.abnormal, true, String(s));
    assert.equal(r.functionalBand, 'mostly bedbound / disabled', String(s));
  }
  assert.match(lansky({ score: 0 }).band, /Unresponsive/);
});

test('string and number input both resolve', () => {
  assert.equal(lansky({ score: 70 }).score, 70);
  assert.equal(lansky({ score: '70' }).score, 70);
  assert.equal(lansky({ score: '50' }).functionalBand, 'reduced activity but up and about');
});

test('a missing, off-step, or out-of-range score is invalid', () => {
  assert.equal(lansky({}).valid, false);
  assert.equal(lansky({ score: 65 }).valid, false);
  assert.equal(lansky({ score: 110 }).valid, false);
  assert.equal(lansky({ score: -10 }).valid, false);
});
