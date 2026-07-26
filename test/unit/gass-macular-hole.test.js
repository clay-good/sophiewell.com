// spec-v471: Gass macular hole staging (stages 1-4).
// Worked-example tests: each stage and its biomicroscopic description, Roman-numeral alias, invalid guard.
// Stages transcribed from Gass 1995 (Am J Ophthalmol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gassMacularHole } from '../../lib/gass-macular-hole-v471.js';

test('stage 2: small full-thickness hole (the META example)', () => {
  const r = gassMacularHole({ stage: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.stage, '2');
  assert.match(r.band, /a small full-thickness macular hole \(less than 400 micrometers\)/);
});

test('stage 1: impending macular hole', () => {
  assert.match(gassMacularHole({ stage: 1 }).band, /impending \(incipient\) macular hole/);
});

test('stage 3: larger hole without complete PVD', () => {
  assert.match(gassMacularHole({ stage: 3 }).band, /without a complete posterior vitreous detachment/);
});

test('stage 4: full-thickness with complete PVD', () => {
  const r = gassMacularHole({ stage: 4 });
  assert.equal(r.stage, '4');
  assert.match(r.band, /with a complete posterior vitreous detachment \(a Weiss ring is present\)/);
});

test('Roman-numeral alias maps to the stages', () => {
  assert.equal(gassMacularHole({ stage: 'I' }).stage, '1');
  assert.equal(gassMacularHole({ stage: 'IV' }).stage, '4');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(gassMacularHole({}).valid, false);
  assert.equal(gassMacularHole({ stage: 5 }).valid, false);
  assert.equal(gassMacularHole({ stage: '0' }).valid, false);
});
