// spec-v57 §2.12: STONE score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stoneScore } from '../../lib/scoring-v5.js';

test('max weighted -> 13 high', () => {
  const r = stoneScore({ sex: 'male', timing: 'lt6', nonBlack: true, nausea: 'vomiting', hematuria: true });
  assert.equal(r.score, 13); assert.match(r.band, /High/);
});
test('female, >24h, none -> low', () => {
  const r = stoneScore({ sex: 'female', timing: 'gt24', nonBlack: false, nausea: 'none', hematuria: false });
  assert.equal(r.score, 0); assert.match(r.band, /Low/);
});
test('moderate band 6-9', () => {
  const r = stoneScore({ sex: 'male', timing: '6to24', nonBlack: true, nausea: 'none', hematuria: false });
  assert.equal(r.score, 6); assert.match(r.band, /Moderate/);
});
test('nausea alone scores 1, vomiting scores 2', () => {
  assert.equal(stoneScore({ sex: 'female', timing: 'gt24', nausea: 'nausea' }).score, 1);
  assert.equal(stoneScore({ sex: 'female', timing: 'gt24', nausea: 'vomiting' }).score, 2);
});
