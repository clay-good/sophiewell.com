// spec-v679: GerdQ (Gastroesophageal Reflux Disease Questionnaire).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { gerdq } from '../../lib/gerdq-v679.js';

// Bands: 0 = 0 days, 1 = 1 day, 2 = 2-3 days, 3 = 4-7 days.
// Positive items (heartburn, regurgitation, sleep, medication) score the band directly;
// negative items (epigastric, nausea) are reverse-scored (3 - band).

test('true minimum is 0: no positive symptoms, negatives at max frequency', () => {
  const r = gerdq({ heartburn: '0', regurgitation: '0', epigastric: '3', nausea: '3', sleep: '0', medication: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.equal(r.impact, 0);
});

test('true maximum is 18: positives at max, negatives at 0 days', () => {
  const r = gerdq({ heartburn: '3', regurgitation: '3', epigastric: '0', nausea: '0', sleep: '3', medication: '3' });
  assert.equal(r.score, 18);
  assert.equal(r.abnormal, true);
  assert.equal(r.impact, 6);
});

test('negative predictors are reverse-scored (more epigastric pain lowers the score)', () => {
  const base = { heartburn: '3', regurgitation: '3', epigastric: '0', nausea: '0', sleep: '0', medication: '0' };
  const low = gerdq(base).score;                       // epigastric 0 days -> +3
  const high = gerdq({ ...base, epigastric: '3' }).score; // epigastric 4-7 days -> +0
  assert.equal(low - high, 3);
});

test('worked example scores 8 at the GERD cutoff (impact 4)', () => {
  const r = gerdq({ heartburn: '2', regurgitation: '1', epigastric: '2', nausea: '3', sleep: '1', medication: '3' });
  // positive 2+1+1+3 = 7; negative (3-2)+(3-3) = 1; total 8. impact 1+3 = 4.
  assert.equal(r.score, 8);
  assert.equal(r.impact, 4);
  assert.equal(r.abnormal, true);
  assert.equal(r.likelihood, 'about 79%');
  assert.match(r.band, /GerdQ 8\/18/);
});

test('cutoff is >= 8 (7 is not flagged)', () => {
  const seven = gerdq({ heartburn: '2', regurgitation: '1', epigastric: '3', nausea: '3', sleep: '1', medication: '3' });
  // positive 2+1+1+3 = 7; negative 0+0 = 0; total 7.
  assert.equal(seven.score, 7);
  assert.equal(seven.abnormal, false);
  assert.equal(seven.likelihood, 'about 50%');
});

test('likelihood bands follow Jones 2009 (0-2, 3-7, 8-10, 11-18)', () => {
  // total 2: heartburn 2 days band, everything else scoring 0.
  assert.equal(gerdq({ heartburn: '2', regurgitation: '0', epigastric: '3', nausea: '3', sleep: '0', medication: '0' }).likelihood, 'about 0%');
  assert.equal(gerdq({ heartburn: '3', regurgitation: '3', epigastric: '0', nausea: '0', sleep: '3', medication: '2' }).likelihood, 'about 89%'); // 11+
});

test('inputs are validated', () => {
  assert.equal(gerdq({}).valid, false);
  assert.equal(gerdq({}).code, 'MISSING_INPUT');
  assert.equal(gerdq({ heartburn: '1', regurgitation: '1', epigastric: '1', nausea: '1', sleep: '1' }).field, 'medication');
  assert.equal(gerdq({ heartburn: '4', regurgitation: '1', epigastric: '1', nausea: '1', sleep: '1', medication: '1' }).field, 'heartburn');
});
