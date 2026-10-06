// spec-v1561 tool 10: the five signs, the 5-follicle edge, and unassessed signs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trachomaGrade as r } from '../../lib/trachoma-grade-v1561.js';

const none = { tt: 'no', co: 'no', ti: 'no', ts: 'no', follicles: '0' };

test('signs', () => {
  assert.equal(r(none).bandLabel, 'No signs');
  assert.equal(r({ ...none, follicles: '4' }).bandLabel, 'No signs');
  assert.equal(r({ ...none, follicles: '5' }).bandLabel, 'TF');
  assert.equal(r({ ...none, tt: 'yes', ts: 'yes' }).bandLabel, 'TT, TS');
  assert.ok(r({ ...none, tt: 'yes' }).notes.some((n) => /refer for surgery/.test(n)));
  assert.equal(r({ ...none, ti: 'yes', follicles: '8' }).bandLabel, 'TF, TI');
});

test('unassessed and refusal', () => {
  assert.equal(r({ tt: 'no' }).bandLabel, 'Not fully graded');
  assert.equal(r({}).valid, false);
});
