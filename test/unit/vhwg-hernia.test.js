// spec-v666: Ventral Hernia Working Group (VHWG) grade.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { vhwgHernia } from '../../lib/vhwg-hernia-v666.js';

test('no features = Grade 1 (low risk)', () => {
  const r = vhwgHernia({});
  assert.equal(r.grade, 1);
  assert.equal(r.code, 'Grade 1');
  assert.equal(r.abnormal, false);
});

test('comorbid only = Grade 2', () => {
  const r = vhwgHernia({ comorbid: true });
  assert.equal(r.grade, 2);
  assert.equal(r.abnormal, false);
});

test('contaminated = Grade 3', () => {
  const r = vhwgHernia({ contaminated: true });
  assert.equal(r.grade, 3);
  assert.equal(r.abnormal, true);
});

test('infected = Grade 4', () => {
  const r = vhwgHernia({ infected: true });
  assert.equal(r.grade, 4);
  assert.equal(r.abnormal, true);
});

test('most severe wins: infected overrides contaminated and comorbid', () => {
  assert.equal(vhwgHernia({ infected: true, contaminated: true, comorbid: true }).grade, 4);
  assert.equal(vhwgHernia({ contaminated: true, comorbid: true }).grade, 3);
});

test('META example: contaminated = Grade 3', () => {
  const r = vhwgHernia({ contaminated: true });
  assert.equal(r.code, 'Grade 3');
  assert.match(r.bandLabel, /Grade 3/);
});
