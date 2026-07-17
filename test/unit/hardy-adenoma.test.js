// spec-v391: Hardy (Hardy-Wilson) classification of a pituitary adenoma (grade 0-IV x stage 0/A-E).
// Worked-example tests: the grade+stage combination, the invasive flag on grades III-IV, roman/numeric
// grade + letter stage input, and the two guards. Axes transcribed from Hardy 1969 (Clin Neurosurg) +
// Wilson's modification (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hardyAdenoma } from '../../lib/hardy-adenoma-v391.js';

test('grade III, stage C: invasive floor + displaced third ventricle (the META example)', () => {
  const r = hardyAdenoma({ grade: 'III', stage: 'C' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.equal(r.stage, 'C');
  assert.equal(r.invasive, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /localized erosion of the sellar floor/);
  assert.match(r.band, /third ventricle grossly displaced/);
});

test('grade 0, stage 0: enclosed, no extension, not invasive', () => {
  const r = hardyAdenoma({ grade: '0', stage: '0' });
  assert.equal(r.invasive, false);
  assert.match(r.band, /enclosed within the sella/);
  assert.match(r.band, /no suprasellar extension/);
});

test('grade IV is invasive; grade II is not', () => {
  assert.equal(hardyAdenoma({ grade: 'IV', stage: 'E' }).invasive, true);
  assert.equal(hardyAdenoma({ grade: 'II', stage: 'A' }).invasive, false);
});

test('numeric grade and letter stage input map correctly', () => {
  assert.equal(hardyAdenoma({ grade: 3, stage: 'c' }).grade, 'III');
  assert.equal(hardyAdenoma({ grade: '4', stage: 'e' }).stage, 'E');
});

test('a missing grade is invalid', () => {
  assert.equal(hardyAdenoma({ stage: 'A' }).valid, false);
  assert.equal(hardyAdenoma({ grade: 'V', stage: 'A' }).valid, false);
});

test('a missing or unknown stage is invalid', () => {
  assert.equal(hardyAdenoma({ grade: 'II' }).valid, false);
  assert.equal(hardyAdenoma({ grade: 'II', stage: 'F' }).valid, false);
});
