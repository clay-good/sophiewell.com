// spec-v187 §2.4: RECIST 1.1 response. Baseline and nadir divisors are guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recist } from '../../lib/onc-staging-v187.js';

test('tile example: partial response (>= 30% decrease from baseline)', () => {
  const r = recist({ baseline: 100, current: 65, nadir: 60 });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'PR');
  assert.equal(r.pctBaseline, -35);
});

test('progression from nadir: >= 20% and >= 5 mm absolute is PD even if below baseline', () => {
  const r = recist({ baseline: 100, current: 78, nadir: 60 });
  assert.equal(r.category, 'PD');
  assert.equal(r.pctNadir, 30);
});

test('a new lesion forces PD regardless of shrinkage', () => {
  const r = recist({ baseline: 100, current: 50, nadir: 50, newLesion: true });
  assert.equal(r.category, 'PD');
});

test('complete response (target sum 0) and stable disease', () => {
  assert.equal(recist({ baseline: 100, current: 0, nadir: 0.1 }).category, 'CR');
  assert.equal(recist({ baseline: 100, current: 90, nadir: 88 }).category, 'SD');
});

test('guards: baseline / nadir must be > 0; blanks fall back', () => {
  assert.equal(recist({ baseline: 0, current: 65, nadir: 60 }).valid, false);
  assert.equal(recist({ baseline: 100, current: 65 }).valid, false);
  assert.equal(recist({}).valid, false);
});
