// spec-v717: Pederson Difficulty Index.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pedersonDifficulty } from '../../lib/pederson-difficulty-v717.js';

test('minimum is 3 -> slightly difficult', () => {
  const r = pedersonDifficulty({ angulation: '1', depth: '1', ramus: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 3);
  assert.equal(r.tier, 'slight');
  assert.equal(r.abnormal, false);
});

test('maximum is 10 -> very difficult', () => {
  const r = pedersonDifficulty({ angulation: '4', depth: '3', ramus: '3' });
  assert.equal(r.score, 10);
  assert.equal(r.tier, 'very-difficult');
  assert.equal(r.abnormal, true);
});

test('worked example: mesioangular + B + II -> 5 (moderate)', () => {
  const r = pedersonDifficulty({ angulation: '1', depth: '2', ramus: '2' });
  assert.equal(r.score, 5);
  assert.equal(r.tier, 'moderate');
  assert.match(r.band, /Pederson 5 of 10/);
});

test('bands: 3-4 slight, 5-6 moderate, 7-10 very difficult', () => {
  assert.equal(pedersonDifficulty({ angulation: '2', depth: '1', ramus: '1' }).tier, 'slight');       // 4
  assert.equal(pedersonDifficulty({ angulation: '2', depth: '2', ramus: '2' }).tier, 'moderate');     // 6
  assert.equal(pedersonDifficulty({ angulation: '3', depth: '2', ramus: '2' }).tier, 'very-difficult'); // 7
});

test('parameters validated / required', () => {
  assert.equal(pedersonDifficulty({}).valid, false);
  assert.equal(pedersonDifficulty({}).code, 'MISSING_INPUT');
  assert.equal(pedersonDifficulty({ angulation: '5', depth: '1', ramus: '1' }).valid, false); // angulation max 4
  assert.equal(pedersonDifficulty({ angulation: '1', depth: '1' }).field, 'ramus');
});
