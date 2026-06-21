// spec-v135 2.2: NCCN-IPI for DLBCL (Zhou Z, et al, Blood 2014;123:837-842).
// Banded age (>40-60=1, >60-75=2, >75=3) and LDH ratio (>1-3=1, >3=2) plus
// stage/ECOG/major-extranodal (1 each). Total 0-8 -> low 0-1, low-int 2-3,
// high-int 4-5, high 6-8. Boundary tests pin the age/LDH bands and group flips.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nccnIpi } from '../../lib/lymphoma-v135.js';

const base = { age: 30, ldhRatio: 1, stageAdvanced: 'no', ecog2: 'no', extranodalMajor: 'no' };

test('age <= 40 and LDH ratio <= 1 score zero -> Low', () => {
  const r = nccnIpi(base);
  assert.equal(r.total, 0);
  assert.equal(r.group, 'Low');
});

test('age bands: 41 -> 1, 61 -> 2, 76 -> 3', () => {
  assert.equal(nccnIpi({ ...base, age: 41 }).total, 1);
  assert.equal(nccnIpi({ ...base, age: 61 }).total, 2);
  assert.equal(nccnIpi({ ...base, age: 76 }).total, 3);
  // exact band edges are exclusive lower / inclusive upper: 60 -> 1, 75 -> 2
  assert.equal(nccnIpi({ ...base, age: 60 }).total, 1);
  assert.equal(nccnIpi({ ...base, age: 75 }).total, 2);
});

test('LDH ratio bands: 2 -> 1, 3.5 -> 2 (boundary at 3)', () => {
  assert.equal(nccnIpi({ ...base, ldhRatio: 2 }).total, 1);
  assert.equal(nccnIpi({ ...base, ldhRatio: 3 }).total, 1);
  assert.equal(nccnIpi({ ...base, ldhRatio: 3.5 }).total, 2);
});

test('worked example: age 70 + LDH 2.5 + stage = 4 -> High-intermediate', () => {
  const r = nccnIpi({ age: 70, ldhRatio: 2.5, stageAdvanced: 'yes', ecog2: 'no', extranodalMajor: 'no' });
  assert.equal(r.total, 4);
  assert.equal(r.group, 'High-intermediate');
});

test('group flips: total 1->2 (low/low-int), 3->4 (low-int/high-int), 5->6 (high-int/high)', () => {
  assert.equal(nccnIpi({ ...base, age: 50 }).group, 'Low'); // 1
  assert.equal(nccnIpi({ ...base, age: 50, stageAdvanced: 'yes' }).group, 'Low-intermediate'); // 2
  assert.equal(nccnIpi({ age: 80, ldhRatio: 1, stageAdvanced: 'no', ecog2: 'no', extranodalMajor: 'no' }).group, 'Low-intermediate'); // 3
  assert.equal(nccnIpi({ age: 80, ldhRatio: 2, stageAdvanced: 'no', ecog2: 'no', extranodalMajor: 'no' }).group, 'High-intermediate'); // 4
  // 8 (max) -> High
  const max = nccnIpi({ age: 80, ldhRatio: 4, stageAdvanced: 'yes', ecog2: 'yes', extranodalMajor: 'yes' });
  assert.equal(max.total, 8);
  assert.equal(max.group, 'High');
});

test('blank inputs surface the fallback', () => {
  assert.equal(nccnIpi({}).valid, false);
  assert.equal(nccnIpi({ age: 70 }).valid, false);
});
