// spec-v673: Heckerling clinical prediction rule for pneumonia.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { heckerlingPneumonia } from '../../lib/heckerling-pneumonia-v673.js';

const ALL = { fever: true, tachycardia: true, crackles: true, decreasedBreathSounds: true, noAsthma: true };

test('all five predictors -> 5/5, high band', () => {
  const r = heckerlingPneumonia(ALL);
  assert.equal(r.score, 5);
  assert.equal(r.tier, 'high');
  assert.equal(r.approxProbability, '80.8%');
  assert.equal(r.abnormal, true);
});

test('no predictors -> 0/5, low band, not abnormal', () => {
  const r = heckerlingPneumonia({});
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.approxProbability, '3.2%');
  assert.equal(r.abnormal, false);
});

test('band boundaries: 1 low, 2 intermediate, 3 intermediate, 4 high', () => {
  assert.equal(heckerlingPneumonia({ fever: true }).tier, 'low');                       // 1
  assert.equal(heckerlingPneumonia({ fever: true, tachycardia: true }).tier, 'intermediate'); // 2
  assert.equal(heckerlingPneumonia({ fever: true, tachycardia: true, crackles: true }).tier, 'intermediate'); // 3
  assert.equal(heckerlingPneumonia({ fever: true, tachycardia: true, crackles: true, decreasedBreathSounds: true }).tier, 'high'); // 4
});

test('abnormal flag set at score >= 2 (not-low band)', () => {
  assert.equal(heckerlingPneumonia({ fever: true }).abnormal, false);
  assert.equal(heckerlingPneumonia({ fever: true, crackles: true }).abnormal, true);
});

test('absence of asthma is the point-scoring condition', () => {
  // noAsthma true adds a point; a patient WITH asthma simply does not set it.
  assert.equal(heckerlingPneumonia({ noAsthma: true }).score, 1);
  assert.equal(heckerlingPneumonia({ noAsthma: false }).score, 0);
});

test('META example: fever + tachycardia + crackles -> 3/5 intermediate (~24.9%)', () => {
  const r = heckerlingPneumonia({ fever: true, tachycardia: true, crackles: true });
  assert.equal(r.score, 3);
  assert.equal(r.approxProbability, '24.9%');
  assert.match(r.band, /Heckerling 3\/5/);
});
