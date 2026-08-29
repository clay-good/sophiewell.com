import test from 'node:test';
import assert from 'node:assert/strict';
import { ropeScore as rope } from '../../lib/rope-score-v850.js';

const ALL = { noHypertension: true, noDiabetes: true, noPriorStroke: true, nonsmoker: true, corticalInfarct: true };

test('rope: the age bands', () => {
  assert.equal(rope({ age: 18 }).ageScore, 5);
  assert.equal(rope({ age: 29 }).ageScore, 5);
  assert.equal(rope({ age: 30 }).ageScore, 4);
  assert.equal(rope({ age: 39 }).ageScore, 4);
  assert.equal(rope({ age: 40 }).ageScore, 3);
  assert.equal(rope({ age: 50 }).ageScore, 2);
  assert.equal(rope({ age: 60 }).ageScore, 1);
  assert.equal(rope({ age: 69 }).ageScore, 1);
  assert.equal(rope({ age: 70 }).ageScore, 0);
  assert.equal(rope({ age: 95 }).ageScore, 0);
});

test('rope: each history item is worth 1 and the total tops out at 10', () => {
  assert.equal(rope({ age: 18, ...ALL }).score, 10);
  assert.equal(rope({ age: 18, ...ALL }).historyScore, 5);
  assert.equal(rope({ age: 70 }).score, 0);
  assert.equal(rope({ age: 55, noDiabetes: true, nonsmoker: true, corticalInfarct: true }).score, 5);
  assert.deepEqual(rope({ age: 55, noDiabetes: true, corticalInfarct: true }).items,
    ['no history of diabetes', 'cortical infarct on imaging']);
});

test('rope: the published table, unsmoothed', () => {
  const f = (score) => rope(Object.assign({ age: 70 }, score >= 1 ? { noHypertension: true } : {},
    score >= 2 ? { noDiabetes: true } : {}, score >= 3 ? { noPriorStroke: true } : {},
    score >= 4 ? { nonsmoker: true } : {}, score >= 5 ? { corticalInfarct: true } : {}));
  assert.equal(f(0).score, 0);
  assert.equal(f(0).attributableFraction, 0);
  assert.equal(f(0).recurrenceTwoYear, 20);
  assert.equal(f(4).attributableFraction, 38);
  assert.equal(f(4).recurrenceTwoYear, 12);
  // Not monotonic: 5 sits below 4 in the source.
  assert.equal(f(5).attributableFraction, 34);
  assert.equal(f(5).recurrenceTwoYear, 7);
  assert.ok(f(5).nonMonotonicNote.includes('34 percent'));
  assert.equal(f(4).nonMonotonicNote, null);
  assert.equal(rope({ age: 60, ...ALL }).score, 6);
  assert.equal(rope({ age: 60, ...ALL }).attributableFraction, 62);
  assert.equal(rope({ age: 40, ...ALL }).attributableFraction, 84);
  assert.equal(rope({ age: 30, ...ALL }).attributableFraction, 88);
  assert.equal(rope({ age: 18, ...ALL }).recurrenceTwoYear, 2);
  assert.equal(rope({ age: 18, ...ALL }).bandLabel, '9 to 10');
  assert.equal(f(0).bandLabel, '0 to 3');
});

test('rope: the score is not a risk score and says so every time', () => {
  // The error the tile exists to prevent.
  const high = rope({ age: 25, ...ALL });
  const low = rope({ age: 75 });
  assert.ok(high.directionNote.includes('not a risk score'));
  assert.ok(low.directionNote.includes('not a risk score'));
  // High score, LOW recurrence. Low score, HIGH recurrence.
  assert.ok(high.score > low.score);
  assert.ok(high.recurrenceTwoYear < low.recurrenceTwoYear);
  assert.ok(high.attributableFraction > low.attributableFraction);
});

test('rope: age is named when it supplies half the score or more', () => {
  assert.ok(rope({ age: 25 }).ageNote.includes('5 of the 5 points'));
  assert.equal(rope({ age: 70, ...ALL }).ageNote, null);
  assert.equal(rope({ age: 70 }).ageNote, null, 'a zero score has nothing to attribute');
});

test('rope: the scope is stated every time', () => {
  const r = rope({ age: 44 });
  assert.ok(r.scopeNote.includes('cryptogenic stroke'));
  assert.ok(r.scopeNote.includes('does not detect'));
});

test('rope: validation', () => {
  assert.equal(rope({}).valid, false);
  assert.equal(rope(null).valid, false);
  assert.equal(rope({ age: 17 }).valid, false);
  assert.equal(rope({ age: 121 }).valid, false);
  assert.equal(rope({ age: 'x' }).valid, false);
  assert.equal(rope({ age: 18 }).valid, true);
});

test('rope: the documented example round-trips', () => {
  const r = rope({ age: '32', noHypertension: 'true', noDiabetes: 'true', noPriorStroke: 'true', nonsmoker: 'true', corticalInfarct: 'true' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 9);
  assert.ok(r.band.includes('9 of 10'));
});
