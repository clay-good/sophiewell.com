// spec-v479: Spitz esophageal atresia risk-group classification (groups I-III).
// Worked-example tests: each group and its birth-weight/cardiac criteria, numeric input, invalid-group guard.
// Groups transcribed from Spitz 1994 (J Pediatr Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spitzAtresia } from '../../lib/spitz-atresia-v479.js';

test('group II: one risk factor (the META example)', () => {
  const r = spitzAtresia({ group: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.group, 'II');
  assert.match(r.band, /birth weight less than 1500 g, or major congenital cardiac disease/);
});

test('group I: neither risk factor', () => {
  assert.match(spitzAtresia({ group: 'I' }).band, /1500 g or more and no major congenital cardiac disease/);
});

test('group III: both risk factors', () => {
  const r = spitzAtresia({ group: 'III' });
  assert.equal(r.group, 'III');
  assert.match(r.band, /less than 1500 g and major congenital cardiac disease/);
});

test('numeric input maps to the groups', () => {
  assert.equal(spitzAtresia({ group: 1 }).group, 'I');
  assert.equal(spitzAtresia({ group: 3 }).group, 'III');
});

test('a missing or unknown group is invalid', () => {
  assert.equal(spitzAtresia({}).valid, false);
  assert.equal(spitzAtresia({ group: 'IV' }).valid, false);
  assert.equal(spitzAtresia({ group: '0' }).valid, false);
});
