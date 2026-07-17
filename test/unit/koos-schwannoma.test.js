// spec-v389: Koos grading of a vestibular schwannoma (grades I-IV). Worked-example tests: each grade and
// its extension/brainstem description, the brainstem-involvement flag on III-IV, roman + numeric + 2a/2b
// input, and the invalid-grade guard. Grades transcribed from Koos 1998 (J Neurosurg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koosSchwannoma } from '../../lib/koos-schwannoma-v389.js';

test('grade IV: compresses the brainstem, flagged (the META example)', () => {
  const r = koosSchwannoma({ grade: 'IV' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'IV');
  assert.equal(r.brainstemInvolvement, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /compresses the brainstem/);
  assert.match(r.band, /fourth ventricle/);
});

test('grade I: intracanalicular, no brainstem involvement', () => {
  const r = koosSchwannoma({ grade: 'I' });
  assert.equal(r.brainstemInvolvement, false);
  assert.match(r.band, /intracanalicular/);
});

test('grade II: CPA extension, no brainstem contact, not flagged', () => {
  const r = koosSchwannoma({ grade: 'II' });
  assert.equal(r.brainstemInvolvement, false);
  assert.match(r.band, /cerebellopontine angle/);
});

test('grade III: contacts the brainstem, flagged', () => {
  const r = koosSchwannoma({ grade: 'III' });
  assert.equal(r.brainstemInvolvement, true);
  assert.match(r.band, /contacts the brainstem/);
});

test('numeric and 2a/2b input map to the grades', () => {
  assert.equal(koosSchwannoma({ grade: 4 }).grade, 'IV');
  assert.equal(koosSchwannoma({ grade: '1' }).grade, 'I');
  assert.equal(koosSchwannoma({ grade: '2a' }).grade, 'II');
  assert.equal(koosSchwannoma({ grade: 'iib' }).grade, 'II');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(koosSchwannoma({}).valid, false);
  assert.equal(koosSchwannoma({ grade: 'V' }).valid, false);
  assert.equal(koosSchwannoma({ grade: '0' }).valid, false);
});
