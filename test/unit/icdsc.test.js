// spec-v13 §3.2.4 wave 13-2: ICDSC boundary examples per Bergeron N,
// et al. Intensive Care Med. 2001;27(5):859-864 (cutoff >=4 of 8).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icdsc } from '../../lib/scoring-v4.js';

const allFalse = {
  alteredLoc: false, inattention: false, disorientation: false,
  hallucination: false, psychomotor: false,
  inappropriateSpeechOrMood: false, sleepWakeDisturbance: false,
  symptomFluctuation: false,
};

test('icdsc 0 of 8 -> below cutoff', () => {
  const r = icdsc(allFalse);
  assert.equal(r.score, 0);
  assert.equal(r.delirium, false);
});

test('icdsc 3 of 8 -> still below cutoff', () => {
  const r = icdsc({ ...allFalse, alteredLoc: true, inattention: true, disorientation: true });
  assert.equal(r.score, 3);
  assert.equal(r.delirium, false);
});

test('icdsc threshold 4 of 8 -> delirium', () => {
  const r = icdsc({ ...allFalse, alteredLoc: true, inattention: true, disorientation: true, hallucination: true });
  assert.equal(r.score, 4);
  assert.equal(r.delirium, true);
});

test('icdsc maximum 8 of 8 -> delirium', () => {
  const r = icdsc({
    alteredLoc: true, inattention: true, disorientation: true,
    hallucination: true, psychomotor: true,
    inappropriateSpeechOrMood: true, sleepWakeDisturbance: true,
    symptomFluctuation: true,
  });
  assert.equal(r.score, 8);
  assert.equal(r.delirium, true);
});
