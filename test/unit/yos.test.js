import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yos } from '../../lib/scoring-v4.js';

test('YOS 6 of 30 (all 1s; tile example) -> low band', () => {
  const r = yos({ qualityOfCry: 1, reactionToParents: 1, stateVariation: 1, color: 1, hydration: 1, responseToSocialOvertures: 1 });
  assert.equal(r.score, 6);
  assert.match(r.band, /low SBI risk per McCarthy 1982/);
});

test('YOS 10 of 30 (upper edge of low band) -> low', () => {
  // 1+1+1+1+3+3 = 10
  const r = yos({ qualityOfCry: 1, reactionToParents: 1, stateVariation: 1, color: 1, hydration: 3, responseToSocialOvertures: 3 });
  assert.equal(r.score, 10);
  assert.match(r.band, /low/);
});

test('YOS 11 of 30 (lower edge of intermediate) -> increased risk', () => {
  // 1+1+1+3+3+3 + 1... wait need 11. 3+3+1+1+1+... let's compute: try 3+3+3+1+1+1 = 12. We need 11.
  // YOS only allows 1/3/5. So we can't make 11 with six tokens? 1*4 + 3*1 + ?... 4+3=7 + 1 = 8. Try 1*3 + 3*2 + ?... 3+6=9 + need 2 more = 1+1 = nope. Actually the minimum increment between values is 2, so the score is always even after 6 values? Let me check: even count of items, all-odd values -> sum is even. So 11 is unreachable. Re-check: 1,3,5 - all odd. Sum of 6 odd numbers is even. So scores 11, 13, 15 are unreachable. Bands 11-15 effectively start at 12.
  // Use 12 instead.
  const r = yos({ qualityOfCry: 3, reactionToParents: 3, stateVariation: 3, color: 1, hydration: 1, responseToSocialOvertures: 1 });
  assert.equal(r.score, 12);
  assert.match(r.band, /increased SBI risk/);
});

test('YOS 16 of 30 (lower edge of HIGH) -> HIGH band', () => {
  // 5+3+3+3+1+1 = 16
  const r = yos({ qualityOfCry: 5, reactionToParents: 3, stateVariation: 3, color: 3, hydration: 1, responseToSocialOvertures: 1 });
  assert.equal(r.score, 16);
  assert.match(r.band, /HIGH probability of serious bacterial infection/);
});

test('YOS 30 of 30 (all 5s) -> HIGH', () => {
  const r = yos({ qualityOfCry: 5, reactionToParents: 5, stateVariation: 5, color: 5, hydration: 5, responseToSocialOvertures: 5 });
  assert.equal(r.score, 30);
  assert.match(r.band, /HIGH/);
});

test('YOS clamps out-of-set values to nearest token (0 -> 1; 2 -> 3; 99 -> 5)', () => {
  const r = yos({ qualityOfCry: 0, reactionToParents: 2, stateVariation: 99, color: 1, hydration: 1, responseToSocialOvertures: 1 });
  assert.equal(r.parts.qualityOfCry, 1);
  assert.equal(r.parts.reactionToParents, 3);
  assert.equal(r.parts.stateVariation, 5);
});
