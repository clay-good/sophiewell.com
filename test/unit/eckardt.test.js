// spec-v519: the Eckardt symptom score for achalasia.
// Worked-example tests: the four items and their two different kinds of option wording, every stage boundary
// (1/2, 3/4, 6/7), the remission cut at 3 versus 4, the total-is-not-the-stage distinction, and the missing /
// out-of-range guards. Items and bands transcribed from Eckardt and colleagues 1992 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eckardt, ECKARDT_ITEMS } from '../../lib/eckardt-v519.js';

function score({ dysphagia = 0, regurgitation = 0, chestPain = 0, weightLoss = 0 } = {}) {
  return eckardt({ dysphagia, regurgitation, chestPain, weightLoss });
}

test('four items, each with four options', () => {
  assert.equal(ECKARDT_ITEMS.length, 4);
  for (const item of ECKARDT_ITEMS) assert.equal(item.options.length, 4);
});

test('weight loss is scored by amount, the other three by frequency', () => {
  const byKey = Object.fromEntries(ECKARDT_ITEMS.map((i) => [i.key, i]));
  assert.match(byKey.dysphagia.options[3].text, /every meal/);
  assert.match(byKey.regurgitation.options[2].text, /daily/);
  // The weight-loss item must never be worded as a frequency.
  const weightText = byKey.weightLoss.options.map((o) => o.text).join(' ');
  assert.match(weightText, /kg/);
  assert.doesNotMatch(weightText, /meal|daily|occasional/);
});

test('an untreated patient with daily symptoms and 7 kg lost scores 8, stage III (the META example)', () => {
  const r = score({ dysphagia: 3, regurgitation: 2, chestPain: 1, weightLoss: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 8);
  assert.equal(r.stage, 'III');
  assert.equal(r.remission, false);
  assert.match(r.band, /Stage III/);
});

test('the ceiling is 12 and the floor is 0', () => {
  const hi = score({ dysphagia: 3, regurgitation: 3, chestPain: 3, weightLoss: 3 });
  assert.equal(hi.total, 12);
  assert.equal(hi.stage, 'III');

  const lo = score();
  assert.equal(lo.total, 0);
  assert.equal(lo.stage, '0');
  assert.equal(lo.remission, true);
});

test('every stage boundary sits where the source puts it', () => {
  assert.equal(score({ dysphagia: 1 }).stage, '0');                    // 1 -> stage 0
  assert.equal(score({ dysphagia: 2 }).stage, 'I');                    // 2 -> stage I
  assert.equal(score({ dysphagia: 3 }).stage, 'I');                    // 3 -> stage I
  assert.equal(score({ dysphagia: 3, regurgitation: 1 }).stage, 'II'); // 4 -> stage II
  assert.equal(score({ dysphagia: 3, regurgitation: 3 }).stage, 'II'); // 6 -> stage II
  assert.equal(score({ dysphagia: 3, regurgitation: 3, chestPain: 1 }).stage, 'III'); // 7 -> stage III
});

test('the total and the stage are different numbers', () => {
  const r = score({ dysphagia: 2 });
  assert.equal(r.total, 2);
  assert.equal(r.stage, 'I');
  assert.notEqual(String(r.total), r.stage);
  assert.match(r.bandLabel, /Eckardt 2 of 12, stage I/);
});

test('remission is 3 or less, not 4', () => {
  const three = score({ dysphagia: 2, regurgitation: 1 });
  assert.equal(three.total, 3);
  assert.equal(three.remission, true);

  const four = score({ dysphagia: 2, regurgitation: 2 });
  assert.equal(four.total, 4);
  assert.equal(four.remission, false);
});

test('string answers are accepted', () => {
  assert.equal(eckardt({ dysphagia: '3', regurgitation: '2', chestPain: '1', weightLoss: '2' }).total, 8);
});

test('a missing item is invalid', () => {
  assert.equal(eckardt({}).valid, false);
  assert.equal(eckardt({ dysphagia: 1, regurgitation: 1, chestPain: 1 }).valid, false);
});

test('out-of-range or non-integer answers are invalid', () => {
  assert.equal(score({ dysphagia: 4 }).valid, false);
  assert.equal(score({ weightLoss: -1 }).valid, false);
  assert.equal(score({ chestPain: 1.5 }).valid, false);
  assert.equal(score({ regurgitation: 'x' }).valid, false);
});
