// spec-v95 2.5: House-Brackmann facial nerve function grading (1985).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { houseBrackmann } from '../../lib/neuro-v95.js';

test('grade I is normal function', () => {
  const r = houseBrackmann({ grade: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.roman, 'I');
  assert.match(r.descriptor, /Normal/);
});

test('grade VI is total paralysis', () => {
  const r = houseBrackmann({ grade: 6 });
  assert.equal(r.roman, 'VI');
  assert.match(r.descriptor, /Total paralysis/);
  assert.match(r.band, /grade VI/);
});

test('grade III is moderate dysfunction', () => {
  const r = houseBrackmann({ grade: 3 });
  assert.equal(r.roman, 'III');
  assert.match(r.descriptor, /Moderate dysfunction/);
});

test('out-of-range or blank returns a surfaced guard', () => {
  assert.equal(houseBrackmann({ grade: 0 }).valid, false);
  assert.equal(houseBrackmann({ grade: 7 }).valid, false);
  assert.equal(houseBrackmann({}).valid, false);
});
