// spec-v211 2.1: EUTOS score worked examples. EUTOS = 7*basophils + 4*spleen;
// >87 high, <=87 low. Formula + threshold spec-v97 cross-verified (Hasford 2011
// + Medscape / ELN leukemia-net).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eutos } from '../../lib/heme-onc-risk-v211.js';

test('high-risk worked example (EUTOS 104)', () => {
  const r = eutos({ basophils: 8, spleenCm: 12 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 104); // 56 + 48
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high risk/);
});

test('low-risk case (EUTOS 68)', () => {
  const r = eutos({ basophils: 4, spleenCm: 10 });
  assert.equal(r.score, 68);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low risk/);
});

test('non-palpable spleen scores 0 for the spleen term', () => {
  const r = eutos({ basophils: 2, spleenCm: 0 });
  assert.equal(r.score, 14); // 7*2
});

test('the 87 threshold is exclusive for high risk', () => {
  // 7*baso + 4*spleen: choose values summing to exactly 87 and 88
  assert.equal(eutos({ basophils: 5, spleenCm: 13 }).abnormal, false); // 35 + 52 = 87 -> low
  assert.equal(eutos({ basophils: 8, spleenCm: 8 }).abnormal, true); // 56 + 32 = 88 -> high
});

test('matches the formula exactly', () => {
  const r = eutos({ basophils: 6.5, spleenCm: 9 });
  assert.equal(r.score, 7 * 6.5 + 4 * 9);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = eutos({ basophils: 8 });
  assert.equal(r.valid, false);
});
