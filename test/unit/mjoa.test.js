// spec-v159 2.3: mJOA (Benzel 1991). Four domains summed to 0-18; HIGHER is
// BETTER. Severity: mild >= 15, moderate 12-14, severe <= 11.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mjoa } from '../../lib/neuro-disability-v159.js';

test('tile example: total 13 is moderate', () => {
  const r = mjoa({ motorUe: 4, motorLe: 5, sensoryUe: 2, sphincter: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 13);
  assert.equal(r.bandLabel, 'Moderate');
  assert.equal(r.abnormal, true);
});

test('band boundaries 11/12 and 14/15', () => {
  assert.equal(mjoa({ motorUe: 5, motorLe: 7, sensoryUe: 1, sphincter: 2 }).bandLabel, 'Mild'); // 15
  assert.equal(mjoa({ motorUe: 5, motorLe: 6, sensoryUe: 1, sphincter: 2 }).bandLabel, 'Moderate'); // 14
  assert.equal(mjoa({ motorUe: 4, motorLe: 5, sensoryUe: 1, sphincter: 2 }).bandLabel, 'Moderate'); // 12
  assert.equal(mjoa({ motorUe: 4, motorLe: 4, sensoryUe: 1, sphincter: 2 }).bandLabel, 'Severe'); // 11
});

test('18 is no dysfunction (not abnormal)', () => {
  const r = mjoa({ motorUe: 5, motorLe: 7, sensoryUe: 3, sphincter: 3 });
  assert.equal(r.score, 18);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /no dysfunction/);
});

test('domain ranges enforced; blanks fall back', () => {
  assert.equal(mjoa({ motorUe: 6, motorLe: 5, sensoryUe: 2, sphincter: 2 }).valid, false); // UE max 5
  assert.equal(mjoa({ motorUe: 4, motorLe: 8, sensoryUe: 2, sphincter: 2 }).valid, false); // LE max 7
  assert.equal(mjoa({ motorUe: 4, motorLe: 5, sensoryUe: 2 }).valid, false); // no sphincter
  assert.equal(mjoa({}).valid, false);
});
