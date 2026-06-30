// spec-v182 §2.5: BWAT, 13 items 1-5 -> 13-65.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bwat } from '../../lib/ltcga-v182.js';

const KEYS = ['size', 'depth', 'edges', 'undermining', 'necroticType', 'necroticAmount', 'exudateType', 'exudateAmount', 'skinColor', 'edema', 'induration', 'granulation', 'epithelialization'];
function build(v) { const o = {}; for (const k of KEYS) o[k] = v; return o; }

test('BWAT floor 13 (all 1) and ceiling 65 (all 5)', () => {
  assert.equal(bwat(build(1)).total, 13);
  assert.equal(bwat(build(5)).total, 65);
});

test('BWAT all-twos = 26', () => {
  assert.equal(bwat(build(2)).total, 26);
});

test('BWAT guards out-of-range and blank', () => {
  assert.equal(bwat({ ...build(2), size: 0 }).valid, false);
  assert.equal(bwat({ ...build(2), size: 6 }).valid, false);
  assert.equal(bwat({}).valid, false);
});
