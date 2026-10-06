// spec-v1556 tool 6: each Mesobuthus tamulus grade, the highest wins, and "at least".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scorpionGradeIndia as r } from '../../lib/scorpion-grade-india-v1556.js';

const no = { local: 'no', autonomic: 'no', pulmonary: 'no', warmShock: 'no' };

test('grades', () => {
  assert.equal(r({ ...no, local: 'yes' }).bandLabel, 'Grade 1');
  assert.equal(r({ ...no, local: 'yes', autonomic: 'yes' }).bandLabel, 'Grade 2');
  assert.equal(r({ ...no, pulmonary: 'yes' }).bandLabel, 'Grade 3');
  assert.equal(r({ ...no, warmShock: 'yes' }).bandLabel, 'Grade 4');
  assert.equal(r(no).bandLabel, 'No grade');
});

test('unassessed and refusal', () => {
  assert.equal(r({ autonomic: 'yes' }).bandLabel, 'At least grade 2');
  assert.equal(r({ local: 'no' }).bandLabel, 'Not graded');
  assert.equal(r({}).valid, false);
});
