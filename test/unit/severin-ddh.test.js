// spec-v491: Severin DDH outcome classification (groups I-VI).
// Worked-example tests: each group and its hip-congruency description, numeric input, invalid-group guard.
// Groups transcribed from Severin 1941 (Acta Chir Scand) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { severinDdh } from '../../lib/severin-ddh-v491.js';

test('group II: concentric, moderate deformity (the META example)', () => {
  const r = severinDdh({ group: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.group, 'II');
  assert.match(r.band, /a concentric hip with moderate deformity/);
});

test('group I: normal', () => {
  assert.match(severinDdh({ group: 'I' }).band, /a normal or nearly normal hip/);
});

test('group IV: subluxated', () => {
  assert.match(severinDdh({ group: 'IV' }).band, /a subluxated hip/);
});

test('group V: false acetabulum', () => {
  assert.match(severinDdh({ group: 'V' }).band, /a secondary \(false\) acetabulum/);
});

test('group VI: redislocation', () => {
  const r = severinDdh({ group: 'VI' });
  assert.equal(r.group, 'VI');
  assert.match(r.band, /redislocation \(complete dislocation of the hip\)/);
});

test('numeric input maps to the groups', () => {
  assert.equal(severinDdh({ group: 1 }).group, 'I');
  assert.equal(severinDdh({ group: 6 }).group, 'VI');
});

test('a missing or out-of-range group is invalid', () => {
  assert.equal(severinDdh({}).valid, false);
  assert.equal(severinDdh({ group: 'VII' }).valid, false);
  assert.equal(severinDdh({ group: '0' }).valid, false);
});
