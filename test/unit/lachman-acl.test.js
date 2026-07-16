// spec-v355: Lachman test grade of ACL laxity (grades I-III). Worked-example tests: each grade and its
// translation/endpoint description, the higher-laxity flag on grades II-III, roman + numeric + "1+"
// + case-insensitive input, and the invalid-grade guard. Grading per StatPearls / IKDC convention
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lachmanAcl } from '../../lib/lachman-acl-v355.js';

test('grade II: 6-10 mm soft endpoint, flagged (the META example)', () => {
  const r = lachmanAcl({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /6 to 10 mm/);
});

test('grade I is mild (firm endpoint) and not flagged', () => {
  const r = lachmanAcl({ grade: 'I' });
  assert.equal(r.severe, false);
  assert.match(r.band, /0 to 5 mm/);
  assert.match(r.band, /firm endpoint/);
});

test('grade III is severe (no endpoint) and flagged', () => {
  const r = lachmanAcl({ grade: 'III' });
  assert.equal(r.severe, true);
  assert.equal(r.grade, 'III');
  assert.match(r.band, /no discernible endpoint/);
});

test('numeric, "1+" plus-notation, and case-insensitive input map to the grades', () => {
  assert.equal(lachmanAcl({ grade: 2 }).grade, 'II');
  assert.equal(lachmanAcl({ grade: '3' }).grade, 'III');
  assert.equal(lachmanAcl({ grade: '2+' }).grade, 'II');
  assert.equal(lachmanAcl({ grade: 'iii' }).grade, 'III');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(lachmanAcl({}).valid, false);
  assert.equal(lachmanAcl({ grade: 'IV' }).valid, false);
  assert.equal(lachmanAcl({ grade: '0' }).valid, false);
});
