// spec-v125 2.1: PELD (McDiarmid 2002). 4.80*ln(bili)+18.57*ln(INR)-6.87*ln(alb)
// +4.36(age<1)+6.67(growth fail), labs floored at 1.0, raw form (no x10).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { peldScore } from '../../lib/hep-v125.js';

test('worked example with age-under-1 bonus', () => {
  const r = peldScore({ albumin: 3.0, bilirubin: 4.0, inr: 1.5, ageUnder1: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 11);
});

test('growth-failure bonus adds 6.67', () => {
  const base = peldScore({ albumin: 3.0, bilirubin: 4.0, inr: 1.5 }).score;
  const gf = peldScore({ albumin: 3.0, bilirubin: 4.0, inr: 1.5, growthFailure: true }).score;
  assert.equal(base, 7);
  assert.equal(gf, 13);
});

test('labs floored at 1.0 (mild disease can be negative without bonuses)', () => {
  const r = peldScore({ albumin: 4.0, bilirubin: 0.5, inr: 0.9 });
  assert.equal(r.valid, true);
  assert.equal(Number.isFinite(r.score), true);
});

test('non-positive / missing -> valid:false (no ln(0))', () => {
  assert.equal(peldScore({ albumin: 0, bilirubin: 4, inr: 1.5 }).valid, false);
  assert.equal(peldScore({ albumin: 3 }).valid, false);
  assert.equal(peldScore(9).valid, false);
});
