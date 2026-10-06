// spec-v1561 tool 3: WHO leprosy disability grade and EHF score; "at least" with unassessed sites.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leprosyDisabilityGrade as r } from '../../lib/leprosy-disability-grade-v1561.js';

const all0 = { eyeR: '0', eyeL: '0', handR: '0', handL: '0', footR: '0', footL: '0' };

test('grade and EHF', () => {
  assert.equal(r(all0).bandLabel, 'Grade 0');
  assert.equal(r({ ...all0, footL: '1' }).bandLabel, 'Grade 1');
  const x = r({ ...all0, footL: '1', handR: '2', eyeL: '2' });
  assert.equal(x.bandLabel, 'Grade 2');
  assert.match(x.band, /EHF score 5 of 12/);
  assert.match(r({ eyeR: '2', eyeL: '2', handR: '2', handL: '2', footR: '2', footL: '2' }).band, /12 of 12/);
});

test('unassessed sites and the eye has no grade 1', () => {
  assert.equal(r({ footL: '1' }).bandLabel, 'At least grade 1');
  assert.match(r({ footL: '1' }).band, /at least 1 of 12/);
  assert.equal(r({ ...all0, eyeR: '1' }).valid, false);
  assert.equal(r({}).valid, false);
});
