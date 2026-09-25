// spec-v1442: Kyoto classification of gastritis score (Hiramatsu 2025, Clin Endosc, Table 4).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kyotoGastritis as k } from '../../lib/kyoto-gastritis-v1442.js';

const ZERO = { atrophy: '0', im: '0', folds: '0', nodularity: '0', redness: '0' };

test('the five findings sum to 0-8', () => {
  assert.equal(k(ZERO).score, 0);
  assert.equal(k({ atrophy: '2', im: '2', folds: '1', nodularity: '1', redness: '2' }).score, 8);
});

test('4 or more is the risk level; 3 is not', () => {
  assert.equal(k({ ...ZERO, atrophy: '2', im: '1' }).abnormal, false); // 3
  assert.equal(k({ ...ZERO, atrophy: '2', im: '1', redness: '1' }).abnormal, true); // 4
  assert.match(k({ ...ZERO, atrophy: '2', im: '2' }).band, /at or above 4/);
});

test('the post-eradication caveat is always shown', () => {
  assert.ok(k(ZERO).notes.some((n) => /map-like redness/.test(n)));
});

test('a blank finding is asked for, never scored 0', () => {
  assert.match(k({ ...ZERO, im: '' }).message, /intestinal metaplasia is still needed/);
  assert.equal(k({ ...ZERO, atrophy: '3' }).valid, false);
});
