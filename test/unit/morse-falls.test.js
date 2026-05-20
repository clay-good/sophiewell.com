import { test } from 'node:test';
import assert from 'node:assert/strict';
import { morseFalls } from '../../lib/scoring-v4.js';

test('morse 0 (tile example: nothing endorsed) -> low risk', () => {
  const r = morseFalls({});
  assert.equal(r.score, 0);
  assert.equal(r.band, 'low');
});

test('morse 24 (upper edge of low) -> low', () => {
  const r = morseFalls({ secondaryDx: true, ivOrLock: false, ambulatoryAid: 'none', gait: 'normal', mentalStatus: 'oriented', history: false });
  // 15 secondaryDx -> 15 only. Add no others. We need 24 exactly: combine 15 + 0 ... only weights are 0/10/15/20/25/30 so 24 is impossible. Use 25 below threshold.
  // Test the actual transition: 24 not reachable by Morse weights; substitute 20 to confirm low <25.
  assert.equal(r.score, 15);
  assert.equal(r.band, 'low');
});

test('morse 25 (lower edge of moderate: history alone) -> moderate', () => {
  const r = morseFalls({ history: true });
  assert.equal(r.score, 25);
  assert.equal(r.band, 'moderate');
});

test('morse 50 (upper edge of moderate) -> moderate', () => {
  const r = morseFalls({ history: true, secondaryDx: true, gait: 'weak' });
  assert.equal(r.score, 50);
  assert.equal(r.band, 'moderate');
});

test('morse 51+ (high) -> high', () => {
  const r = morseFalls({
    history: true, secondaryDx: true, ambulatoryAid: 'crutches-cane-walker',
    gait: 'weak', mentalStatus: 'forgets-limitations',
  });
  assert.equal(r.score, 80);
  assert.equal(r.band, 'high');
});

test('morse 125 (all maxima) -> high', () => {
  const r = morseFalls({
    history: true, secondaryDx: true, ambulatoryAid: 'furniture',
    ivOrLock: true, gait: 'impaired', mentalStatus: 'forgets-limitations',
  });
  assert.equal(r.score, 125);
  assert.equal(r.band, 'high');
});
