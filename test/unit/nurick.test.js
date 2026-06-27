// spec-v159 2.4: Nurick grade 0-5 (Nurick 1972), gait-focused cervical
// spondylotic myelopathy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nurick } from '../../lib/neuro-disability-v159.js';

test('grade 3 prevents employment', () => {
  const r = nurick({ grade: 3 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 3);
  assert.match(r.band, /preventing full-time employment/);
  assert.equal(r.abnormal, true);
});

test('grade 0 (root signs, no cord involvement) and grade 1 not flagged as gait difficulty', () => {
  assert.equal(nurick({ grade: 0 }).abnormal, false);
  assert.equal(nurick({ grade: 1 }).abnormal, false);
  assert.match(nurick({ grade: 0 }).band, /no evidence of cord involvement/);
  assert.match(nurick({ grade: 1 }).band, /normal gait/);
});

test('grade 4 walks only with assistance; grade 5 chairbound', () => {
  assert.match(nurick({ grade: 4 }).band, /only with assistance/);
  assert.match(nurick({ grade: 5 }).band, /Chairbound or bedridden/);
});

test('out-of-range / blank falls back', () => {
  assert.equal(nurick({ grade: 6 }).valid, false);
  assert.equal(nurick({ grade: -1 }).valid, false);
  assert.equal(nurick({}).valid, false);
});
