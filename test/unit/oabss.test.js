// spec-v153 2.3: OABSS (Homma 2006). Four items: daytime frequency 0-2,
// nocturia 0-3, urgency 0-5, urgency incontinence 0-5; total 0-15 (<=5 mild,
// 6-11 moderate, >=12 severe). The OAB diagnostic gate (urgency >= 2 AND total
// >= 3) is surfaced; a high total with urgency < 2 does NOT meet the definition.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oabss } from '../../lib/urology-v153.js';

test('tile example: total 8 -> moderate, OAB definition met', () => {
  const r = oabss({ daytime: 1, nocturia: 2, urgency: 3, incontinence: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 8);
  assert.equal(r.bandLabel, 'Moderate');
  assert.equal(r.meetsOab, true);
});

test('urgency-gate NOT met: high total but urgency < 2', () => {
  // daytime 2 + nocturia 3 + urgency 1 + incontinence 0 = 6 (moderate band)
  // but urgency = 1 (< 2) -> does not meet the OAB symptom definition.
  const r = oabss({ daytime: 2, nocturia: 3, urgency: 1, incontinence: 0 });
  assert.equal(r.score, 6);
  assert.equal(r.bandLabel, 'Moderate');
  assert.equal(r.meetsOab, false);
  assert.match(r.band, /does NOT meet the OAB symptom definition/i);
  assert.match(r.band, /urgency item is < 2/i);
});

test('gate met requires urgency >= 2 and total >= 3', () => {
  // urgency 2, total exactly 3 -> met
  const met = oabss({ daytime: 0, nocturia: 0, urgency: 2, incontinence: 1 });
  assert.equal(met.score, 3);
  assert.equal(met.meetsOab, true);
  // urgency 2 but total 2 (< 3) -> not met (total too low)
  const low = oabss({ daytime: 0, nocturia: 0, urgency: 2, incontinence: 0 });
  assert.equal(low.score, 2);
  assert.equal(low.meetsOab, false);
  assert.match(low.band, /total < 3/i);
});

test('band boundaries 5/6 and 11/12', () => {
  const at5 = oabss({ daytime: 2, nocturia: 0, urgency: 3, incontinence: 0 });
  assert.equal(at5.score, 5);
  assert.equal(at5.bandLabel, 'Mild');
  const at6 = oabss({ daytime: 2, nocturia: 1, urgency: 3, incontinence: 0 });
  assert.equal(at6.score, 6);
  assert.equal(at6.bandLabel, 'Moderate');
  const at11 = oabss({ daytime: 2, nocturia: 1, urgency: 5, incontinence: 3 });
  assert.equal(at11.score, 11);
  assert.equal(at11.bandLabel, 'Moderate');
  const at12 = oabss({ daytime: 2, nocturia: 2, urgency: 5, incontinence: 3 });
  assert.equal(at12.score, 12);
  assert.equal(at12.bandLabel, 'Severe');
});

test('max 15 severe; blank item -> valid:false', () => {
  assert.equal(oabss({ daytime: 2, nocturia: 3, urgency: 5, incontinence: 5 }).score, 15);
  assert.equal(oabss({ daytime: 2, nocturia: 3, urgency: 5, incontinence: 5 }).bandLabel, 'Severe');
  assert.equal(oabss({ daytime: 1, nocturia: 1, urgency: 1 }).valid, false);
  assert.match(oabss({ daytime: 1 }).message, /Answer all 4/);
});
