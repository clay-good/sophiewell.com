// spec-v180 2.7: interRAI CHESS scale (Hirdes 2003; interRAI/CIHI LTCF
// operationalization). Signs/symptoms counted and capped at 2, then +1 each for
// decline in decision-making, decline in ADL, and end-stage disease = 0-5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chessScale } from '../../lib/ltcga-v180.js';

test('no items present -> 0, no health instability', () => {
  const r = chessScale({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /no health instability/);
});

test('signs-and-symptoms sub-score caps at 2 no matter how many are present', () => {
  const two = chessScale({ vomiting: 1, edema: 1 });
  assert.equal(two.score, 2);
  const all = chessScale({ vomiting: 1, edema: 1, dyspnea: 1, weightLoss: 1, dehydration: 1, reducedIntake: 1 });
  assert.equal(all.score, 2); // symptom cap, no other variables
});

test('the 2 -> 3 transition: two symptoms (2) plus one other variable = 3', () => {
  const two = chessScale({ vomiting: 1, dyspnea: 1 });
  assert.equal(two.score, 2);
  assert.equal(two.abnormal, false);
  const three = chessScale({ vomiting: 1, dyspnea: 1, endStage: 1 });
  assert.equal(three.score, 3);
  assert.equal(three.abnormal, true);
  assert.match(three.band, /substantial health instability/);
});

test('each of the three other variables adds exactly one point', () => {
  assert.equal(chessScale({ declineCognition: 1 }).score, 1);
  assert.equal(chessScale({ declineAdl: 1 }).score, 1);
  assert.equal(chessScale({ endStage: 1 }).score, 1);
  assert.equal(chessScale({ declineCognition: 1, declineAdl: 1, endStage: 1 }).score, 3);
});

test('maximum score is 5 (symptom cap 2 + three other variables)', () => {
  const max = chessScale({
    vomiting: 1, edema: 1, dyspnea: 1, weightLoss: 1, dehydration: 1, reducedIntake: 1,
    declineCognition: 1, declineAdl: 1, endStage: 1,
  });
  assert.equal(max.score, 5);
  assert.equal(max.abnormal, true);
});

test('a single symptom scores 1 (some instability), not abnormal', () => {
  const r = chessScale({ dyspnea: 1 });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /some health instability/);
});
