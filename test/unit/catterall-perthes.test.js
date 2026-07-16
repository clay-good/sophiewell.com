// spec-v346: Catterall classification of Legg-Calve-Perthes disease (groups I-IV). Worked-example
// tests: each group and its epiphyseal-involvement description, the more-extensive flag on groups
// III-IV, roman + numeric + case-insensitive input, and the invalid-group guard. Definitions
// transcribed from Catterall 1971 (JBJS Br), cross-verified against pediatric-orthopedic references
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catterallPerthes } from '../../lib/catterall-perthes-v346.js';

test('group III: most of the epiphysis, flagged extensive (the META example)', () => {
  const r = catterallPerthes({ group: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.group, 'III');
  assert.equal(r.extensive, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /head within a head/);
});

test('groups I-II are not flagged; I is anterior only, II adds central', () => {
  assert.match(catterallPerthes({ group: 'I' }).band, /only the anterior part/);
  assert.match(catterallPerthes({ group: 'II' }).band, /anterior and central epiphysis/);
  for (const g of ['I', 'II']) {
    assert.equal(catterallPerthes({ group: g }).extensive, false, g);
  }
});

test('group IV is the entire epiphysis and flagged', () => {
  const r = catterallPerthes({ group: 'IV' });
  assert.equal(r.extensive, true);
  assert.match(r.band, /entire capital femoral epiphysis/);
});

test('numeric 1-4 and case-insensitive roman input map to the groups', () => {
  assert.equal(catterallPerthes({ group: '1' }).group, 'I');
  assert.equal(catterallPerthes({ group: 4 }).group, 'IV');
  assert.equal(catterallPerthes({ group: 'iii' }).group, 'III');
});

test('a missing or out-of-range group is invalid', () => {
  assert.equal(catterallPerthes({}).valid, false);
  assert.equal(catterallPerthes({ group: 'V' }).valid, false);
  assert.equal(catterallPerthes({ group: '5' }).valid, false);
});
