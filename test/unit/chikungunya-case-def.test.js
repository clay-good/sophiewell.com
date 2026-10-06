// spec-v1563: the chikungunya case definition, each level.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chikungunyaCaseDef as chik } from '../../lib/chikungunya-case-def-v1563.js';

test('chikungunya', () => {
  const c = { fever: 'yes', joint: 'yes' };
  assert.equal(chik({ ...c, epi: 'yes', lab: 'no' }).bandLabel, 'Suspected');
  assert.equal(chik({ ...c, lab: 'yes', severe: 'no', atypical: 'no' }).bandLabel, 'Confirmed');
  assert.equal(chik({ ...c, lab: 'yes', atypical: 'yes', severe: 'no' }).bandLabel, 'Atypical');
  assert.equal(chik({ ...c, lab: 'yes', severe: 'yes' }).bandLabel, 'Severe acute');
  assert.equal(chik({ chronic: 'yes' }).bandLabel, 'Suspected chronic');
  assert.equal(chik({ chronic: 'yes', lab: 'yes' }).bandLabel, 'Confirmed chronic');
  assert.equal(chik({ fever: 'yes', joint: 'no' }).bandLabel, 'Criterion not met');
  assert.equal(chik({ fever: 'yes' }).bandLabel, 'Not decided');
  assert.equal(chik({ ...c }).bandLabel, 'Not decided');
  assert.equal(chik({}).valid, false);
});
