// spec-v232: worked examples for Villalta + SIC. Point systems spec-v97 verified.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { villalta } from '../../lib/coagscore-v232.js';

test('villalta: moderate band 10-14', () => {
  const r = villalta({ pain: 2, heaviness: 2, edema: 2, induration: 2, hyperpigmentation: 2, ectasia: 2 }); // 12
  assert.equal(r.score, 12);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /moderate/);
});
test('villalta: no PTS below 5', () => {
  const r = villalta({ pain: 2, cramps: 1 }); // 3
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
});
test('villalta: ulcer is severe regardless of score', () => {
  const r = villalta({ pain: 1, ulcer: true }); // 1 but ulcer
  assert.match(r.band, /severe/);
  assert.equal(r.abnormal, true);
});
test('villalta: >= 15 severe', () => {
  assert.match(villalta({ pain: 3, cramps: 3, heaviness: 3, edema: 3, induration: 3 }).band, /severe/); // 15
});

