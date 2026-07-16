// spec-v333: Kikuchi classification of submucosal invasion in a sessile malignant colorectal
// lesion (Sm1 / Sm2 / Sm3). Worked-example tests: each level and its submucosal-third description,
// the higher-risk flag on Sm2 / Sm3, numeric / string / case-insensitive input, and the
// invalid-level guard. Definitions transcribed from Kikuchi 1995 (Dis Colon Rectum), cross-verified
// against the Haggitt/Kikuchi comparison literature (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kikuchi } from '../../lib/kikuchi-v333.js';

test('Sm3: lower-third invasion, flagged higher-risk (the META example)', () => {
  const r = kikuchi({ level: 'Sm3' });
  assert.equal(r.valid, true);
  assert.equal(r.level, 'Sm3');
  assert.equal(r.highRisk, true);
  assert.match(r.band, /lower third of the submucosa/);
  assert.match(r.band, /~25%/);
});

test('Sm1 is the low-risk upper third; Sm2/Sm3 are flagged higher-risk', () => {
  assert.equal(kikuchi({ level: 'Sm1' }).highRisk, false);
  assert.match(kikuchi({ level: 'Sm1' }).band, /upper \(superficial\) third/);
  assert.equal(kikuchi({ level: 'Sm2' }).highRisk, true);
  assert.match(kikuchi({ level: 'Sm2' }).band, /middle third/);
  assert.equal(kikuchi({ level: 'Sm3' }).highRisk, true);
});

test('numeric 1-3 and case-insensitive input map to the Sm levels', () => {
  assert.equal(kikuchi({ level: '1' }).level, 'Sm1');
  assert.equal(kikuchi({ level: 2 }).level, 'Sm2');
  assert.equal(kikuchi({ level: 'sm3' }).level, 'Sm3');
});

test('a missing or out-of-range level is invalid', () => {
  assert.equal(kikuchi({}).valid, false);
  assert.equal(kikuchi({ level: 'Sm4' }).valid, false);
  assert.equal(kikuchi({ level: '0' }).valid, false);
});
