// spec-v146 2.5: SLIC - Subaxial Cervical Spine Injury Classification (Vaccaro
// 2007). Morphology + DLC + neurology sum 0-10 with a +1 modifier for continuous
// cord compression; <= 3 nonoperative, 4 indeterminate, >= 5 operative.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slicScore } from '../../lib/spine-v146.js';

test('total 3 -> nonoperative (boundary)', () => {
  const r = slicScore({ morphology: 'compression', dlc: 'indeterminate', neuro: 'root' }); // 1+1+1 = 3
  assert.equal(r.valid, true);
  assert.equal(r.score, 3);
  assert.equal(r.bandLabel, 'Nonoperative');
  assert.equal(r.abnormal, false);
});

test('+1 continuous-compression modifier: 3 -> 4 (nonoperative->indeterminate)', () => {
  const r = slicScore({ morphology: 'compression', dlc: 'indeterminate', neuro: 'root', continuousCompression: true }); // 1+1+1 +1 = 4
  assert.equal(r.score, 4);
  assert.equal(r.bandLabel, 'Indeterminate');
  assert.equal(r.abnormal, true);
  assert.match(r.detail, /continuous cord compression/);
});

test('total 5 -> operative (4->5 flip)', () => {
  const r4 = slicScore({ morphology: 'burst', dlc: 'indeterminate', neuro: 'root' }); // 2+1+1 = 4
  assert.equal(r4.score, 4);
  assert.equal(r4.bandLabel, 'Indeterminate');
  const r5 = slicScore({ morphology: 'burst', dlc: 'disrupted', neuro: 'root' }); // 2+2+1 = 5
  assert.equal(r5.score, 5);
  assert.equal(r5.bandLabel, 'Operative');
  assert.equal(r5.abnormal, true);
});

test('incomplete cord (3) scores higher than complete cord (2)', () => {
  const complete = slicScore({ morphology: 'compression', dlc: 'intact', neuro: 'complete' }); // 1+0+2 = 3
  const incomplete = slicScore({ morphology: 'compression', dlc: 'intact', neuro: 'incomplete' }); // 1+0+3 = 4
  assert.equal(complete.score, 3);
  assert.equal(incomplete.score, 4);
});

test('ceiling 10 with modifier', () => {
  assert.equal(slicScore({ morphology: 'rotation', dlc: 'disrupted', neuro: 'incomplete', continuousCompression: true }).score, 10); // 4+2+3+1
});

test('blank category -> complete-the-fields fallback', () => {
  const r = slicScore({ morphology: 'burst', dlc: 'disrupted' });
  assert.equal(r.valid, false);
  assert.match(r.message, /neurologic status/);
});
