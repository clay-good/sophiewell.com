// spec-v182 §2.3: MCSI, 13 items 0-2 -> 0-26.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modifiedCaregiverStrainIndex as mcsi } from '../../lib/ltcga-v182.js';

const KEYS = ['sleep', 'physical', 'confining', 'family', 'plans', 'otherDemands', 'emotional', 'upsetting', 'changed', 'work', 'financial', 'overwhelmed', 'completelyOverwhelmed'];
function build(v) { const o = {}; for (const k of KEYS) o[k] = v; return o; }

test('MCSI 0 floor and 26 ceiling', () => {
  assert.equal(mcsi(build(0)).total, 0);
  assert.equal(mcsi(build(2)).total, 26);
});

test('MCSI all-ones = 13', () => {
  assert.equal(mcsi(build(1)).total, 13);
});

test('MCSI guards out-of-range and blank', () => {
  assert.equal(mcsi({ ...build(1), sleep: 3 }).valid, false);
  assert.equal(mcsi({}).valid, false);
});
