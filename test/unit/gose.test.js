// spec-v95 2.2: Glasgow Outcome Scale - Extended + legacy GOS map (Wilson 1998).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gose } from '../../lib/neuro-v95.js';

test('GOS-E 3 and 4 both map to legacy GOS 3 (severe disability)', () => {
  const r3 = gose({ category: 3 });
  const r4 = gose({ category: 4 });
  assert.equal(r3.gos, 3);
  assert.equal(r4.gos, 3);
  assert.equal(r3.gosLabel, 'Severe disability');
  assert.equal(r4.gosLabel, 'Severe disability');
});

test('GOS-E 7 and 8 both map to legacy GOS 5 (good recovery)', () => {
  assert.equal(gose({ category: 7 }).gos, 5);
  assert.equal(gose({ category: 8 }).gos, 5);
  assert.equal(gose({ category: 8 }).gosLabel, 'Good recovery');
});

test('endpoints: dead and vegetative', () => {
  assert.equal(gose({ category: 1 }).gos, 1);
  assert.equal(gose({ category: 2 }).gos, 2);
  assert.match(gose({ category: 1 }).band, /GOS-E 1/);
});

test('GOS-E 5 and 6 map to legacy GOS 4 (moderate disability)', () => {
  assert.equal(gose({ category: 5 }).gos, 4);
  assert.equal(gose({ category: 6 }).gos, 4);
});

test('out-of-range or blank returns a surfaced guard', () => {
  assert.equal(gose({ category: 0 }).valid, false);
  assert.equal(gose({ category: 9 }).valid, false);
  assert.equal(gose({}).valid, false);
});
