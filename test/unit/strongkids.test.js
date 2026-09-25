// spec-v1440: STRONGkids (Hulst 2010; points and bands as stated in three open papers).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { strongkids } from '../../lib/strongkids-v1440.js';

const NONE = { clinical: 'no', disease: 'no', intake: 'no', weight: 'no' };

test('points: clinical 1, disease 2, intake 1, weight 1', () => {
  assert.equal(strongkids(NONE).score, 0);
  assert.equal(strongkids({ ...NONE, disease: 'yes' }).score, 2);
  assert.equal(strongkids({ clinical: 'yes', disease: 'yes', intake: 'yes', weight: 'yes' }).score, 5);
});

test('bands: 0 low, 1-3 moderate, 4-5 high', () => {
  assert.equal(strongkids(NONE).risk, 'low');
  assert.equal(strongkids({ ...NONE, weight: 'yes' }).risk, 'moderate');
  assert.equal(strongkids({ ...NONE, disease: 'yes', intake: 'yes' }).risk, 'moderate'); // 3
  assert.equal(strongkids({ ...NONE, disease: 'yes', intake: 'yes', weight: 'yes' }).risk, 'high'); // 4
});

test('a blank item is asked for, never read as no', () => {
  assert.match(strongkids({ ...NONE, weight: '' }).message, /weight loss or poor weight gain is still needed/);
  assert.equal(strongkids({}).valid, false);
});
