import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comfortB } from '../../lib/scoring-v4.js';

test('comfort-b 6 (all 1s, deepest sedation) -> over-sedation', () => {
  const r = comfortB({ alertness: 1, calmness: 1, respiratoryOrCry: 1, movement: 1, muscleTone: 1, facialTension: 1 });
  assert.equal(r.score, 6);
  assert.equal(r.band, 'over-sedation');
});

test('comfort-b 10 (upper edge of over-sedation) -> over-sedation', () => {
  const r = comfortB({ alertness: 2, calmness: 2, respiratoryOrCry: 2, movement: 2, muscleTone: 1, facialTension: 1 });
  assert.equal(r.score, 10);
  assert.equal(r.band, 'over-sedation');
});

test('comfort-b 11 (lower edge of adequate) -> adequate sedation', () => {
  const r = comfortB({ alertness: 2, calmness: 2, respiratoryOrCry: 2, movement: 2, muscleTone: 2, facialTension: 1 });
  assert.equal(r.score, 11);
  assert.equal(r.band, 'adequate sedation');
});

test('comfort-b 18 (tile example, midband) -> adequate sedation', () => {
  const r = comfortB({ alertness: 3, calmness: 3, respiratoryOrCry: 3, movement: 3, muscleTone: 3, facialTension: 3 });
  assert.equal(r.score, 18);
  assert.equal(r.band, 'adequate sedation');
});

test('comfort-b 22 (upper edge of adequate) -> adequate sedation', () => {
  const r = comfortB({ alertness: 4, calmness: 4, respiratoryOrCry: 4, movement: 4, muscleTone: 3, facialTension: 3 });
  assert.equal(r.score, 22);
  assert.equal(r.band, 'adequate sedation');
});

test('comfort-b 23 (lower edge of distress) -> inadequate sedation / distress', () => {
  const r = comfortB({ alertness: 4, calmness: 4, respiratoryOrCry: 4, movement: 4, muscleTone: 4, facialTension: 3 });
  assert.equal(r.score, 23);
  assert.equal(r.band, 'inadequate sedation / distress');
});

test('comfort-b 30 (all 5s) -> inadequate sedation / distress', () => {
  const r = comfortB({ alertness: 5, calmness: 5, respiratoryOrCry: 5, movement: 5, muscleTone: 5, facialTension: 5 });
  assert.equal(r.score, 30);
  assert.equal(r.band, 'inadequate sedation / distress');
});

test('comfort-b rejects out-of-range items', () => {
  assert.throws(() => comfortB({ alertness: 0, calmness: 1, respiratoryOrCry: 1, movement: 1, muscleTone: 1, facialTension: 1 }));
  assert.throws(() => comfortB({ alertness: 6, calmness: 1, respiratoryOrCry: 1, movement: 1, muscleTone: 1, facialTension: 1 }));
  assert.throws(() => comfortB({ alertness: 2.5, calmness: 1, respiratoryOrCry: 1, movement: 1, muscleTone: 1, facialTension: 1 }));
});
