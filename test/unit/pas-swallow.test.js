// spec-v367: Penetration-Aspiration Scale (PAS, scores 1-8). Worked-example tests: each score and its
// airway-invasion description, the penetration (2-5) / aspiration (6-8) categories, the aspiration flag,
// numeric/string input, and the invalid-score guard. Levels transcribed from Rosenbek et al. 1996
// (Dysphagia), cross-verified against SLP references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pasSwallow } from '../../lib/pas-swallow-v367.js';

test('PAS 6: below the vocal folds, aspiration, flagged (the META example)', () => {
  const r = pasSwallow({ score: '6' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6);
  assert.equal(r.category, 'aspiration');
  assert.equal(r.aspiration, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /passes below the vocal folds/);
});

test('PAS 1 is no airway invasion (not flagged)', () => {
  const r = pasSwallow({ score: '1' });
  assert.equal(r.category, 'no airway invasion');
  assert.equal(r.aspiration, false);
  assert.match(r.band, /does not enter the airway/);
});

test('PAS 2-5 are penetration (not flagged); 6-8 are aspiration (flagged)', () => {
  for (const s of [2, 3, 4, 5]) {
    assert.equal(pasSwallow({ score: s }).category, 'penetration', String(s));
    assert.equal(pasSwallow({ score: s }).aspiration, false, String(s));
  }
  for (const s of [6, 7]) {
    assert.equal(pasSwallow({ score: s }).category, 'aspiration', String(s));
    assert.equal(pasSwallow({ score: s }).aspiration, true, String(s));
  }
});

test('PAS 8 is silent aspiration and flagged', () => {
  const r = pasSwallow({ score: 8 });
  assert.equal(r.category, 'silent aspiration');
  assert.equal(r.aspiration, true);
  assert.match(r.band, /no effort is made to eject/);
});

test('a missing or out-of-range score is invalid', () => {
  assert.equal(pasSwallow({}).valid, false);
  assert.equal(pasSwallow({ score: '0' }).valid, false);
  assert.equal(pasSwallow({ score: 9 }).valid, false);
});
