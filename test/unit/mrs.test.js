// spec-v95 2.1: modified Rankin Scale (van Swieten 1988).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mrs } from '../../lib/neuro-v95.js';

test('grade 2 is the good-outcome ceiling', () => {
  const r = mrs({ grade: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.goodOutcome, true);
  assert.match(r.dichotomy, /good outcome/);
  assert.match(r.band, /grade 2/);
});

test('grade 3 flips to poor outcome', () => {
  const r = mrs({ grade: 3 });
  assert.equal(r.goodOutcome, false);
  assert.match(r.dichotomy, /poor outcome/);
});

test('grade 0 and grade 6 endpoints', () => {
  assert.match(mrs({ grade: 0 }).descriptor, /No symptoms/);
  assert.equal(mrs({ grade: 6 }).descriptor, 'Dead');
  assert.equal(mrs({ grade: 6 }).goodOutcome, false);
});

test('out-of-range or blank returns a surfaced guard', () => {
  assert.equal(mrs({ grade: 7 }).valid, false);
  assert.equal(mrs({ grade: -1 }).valid, false);
  assert.equal(mrs({ grade: 2.5 }).valid, false);
  assert.equal(mrs({}).valid, false);
});
