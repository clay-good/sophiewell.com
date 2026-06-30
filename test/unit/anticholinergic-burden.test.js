// spec-v179 §2.1: ACB scale. total = 1*c1 + 2*c2 + 3*c3; >= 3 clinically relevant.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anticholinergicBurden as acb } from '../../lib/ltcga-v179.js';

test('ACB total = sum(level x count)', () => {
  const r = acb({ level1Count: '2', level2Count: '1', level3Count: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 2 + 2 + 3); // 7
});

test('ACB 2 -> not relevant, 3 -> relevant (the >= 3 flip)', () => {
  assert.equal(acb({ level1Count: '0', level2Count: '1', level3Count: '0' }).relevant, false); // 2
  assert.equal(acb({ level3Count: '1' }).total, 3);
  assert.equal(acb({ level3Count: '1' }).relevant, true);
});

test('ACB blanks treated as 0 but all-blank -> complete-the-fields', () => {
  assert.equal(acb({ level1Count: '3' }).total, 3);
  assert.equal(acb({}).valid, false);
});

test('ACB rejects non-integer / negative counts', () => {
  assert.equal(acb({ level1Count: '1.5' }).valid, false);
  assert.equal(acb({ level1Count: '-1' }).valid, false);
});
