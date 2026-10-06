// spec-v1563: the zika case definition, each level.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zikaCaseDef as zika } from '../../lib/zika-case-def-v1563.js';

test('zika', () => {
  const s = { rash: 'yes', fever: 'no', signs: 'yes' };
  assert.equal(zika(s).bandLabel, 'Suspected');
  assert.equal(zika({ ...s, igm: 'yes', epi: 'yes' }).bandLabel, 'Probable');
  assert.equal(zika({ ...s, rna: 'yes' }).bandLabel, 'Confirmed');
  assert.equal(zika({ ...s, prnt: 'yes' }).bandLabel, 'Confirmed');
  assert.equal(zika({ rash: 'no', fever: 'no', signs: 'yes' }).bandLabel, 'Criterion not met');
  assert.equal(zika({ rash: 'yes' }).bandLabel, 'Not decided');
});
