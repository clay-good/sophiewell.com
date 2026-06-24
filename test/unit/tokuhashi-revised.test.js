// spec-v146 2.2: Revised Tokuhashi Score (Tokuhashi 2005). Six parameters sum
// 0-15; a lower total is the worse prognosis: 0-8 < 6 months, 9-11 >= 6 months,
// 12-15 >= 1 year.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokuhashiRevised } from '../../lib/spine-v146.js';

test('total 8 -> < 6 months (boundary)', () => {
  const r = tokuhashiRevised({ general: 'good', extraspinalBone: 'mid', vertebralMets: 'two', organMets: 'removable', primary: 'p2', palsy: 'incomplete' }); // 2+1+1+1+2+1 = 8
  assert.equal(r.valid, true);
  assert.equal(r.score, 8);
  assert.equal(r.bandLabel, 'Poor (< 6 months)');
  assert.equal(r.abnormal, true);
});

test('total 9 -> >= 6 months (8->9 survival-band change)', () => {
  const r = tokuhashiRevised({ general: 'good', extraspinalBone: 'mid', vertebralMets: 'one', organMets: 'removable', primary: 'p2', palsy: 'incomplete' }); // 2+1+2+1+2+1 = 9
  assert.equal(r.score, 9);
  assert.equal(r.bandLabel, 'Intermediate (≥ 6 months)');
  assert.equal(r.abnormal, false);
});

test('total 11 -> >= 6 months; 12 -> >= 1 year (11->12 flip)', () => {
  const r11 = tokuhashiRevised({ general: 'good', extraspinalBone: 'zero', vertebralMets: 'one', organMets: 'none', primary: 'p2', palsy: 'complete' }); // 2+2+2+2+2+0 = 10... adjust
  // Build exactly 11 and 12 by primary site:
  const r11b = tokuhashiRevised({ general: 'good', extraspinalBone: 'zero', vertebralMets: 'one', organMets: 'none', primary: 'p1', palsy: 'incomplete' }); // 2+2+2+2+1+1 = 10
  const r11c = tokuhashiRevised({ general: 'good', extraspinalBone: 'zero', vertebralMets: 'one', organMets: 'none', primary: 'p2', palsy: 'incomplete' }); // 2+2+2+2+2+1 = 11
  assert.equal(r11c.score, 11);
  assert.equal(r11c.bandLabel, 'Intermediate (≥ 6 months)');
  const r12 = tokuhashiRevised({ general: 'good', extraspinalBone: 'zero', vertebralMets: 'one', organMets: 'none', primary: 'p2', palsy: 'none' }); // 2+2+2+2+2+2 = 12
  assert.equal(r12.score, 12);
  assert.equal(r12.bandLabel, 'Favorable (≥ 1 year)');
  void r11; void r11b;
});

test('floor 0 and ceiling 15', () => {
  assert.equal(tokuhashiRevised({ general: 'poor', extraspinalBone: 'ge3', vertebralMets: 'ge3', organMets: 'unremovable', primary: 'p0', palsy: 'complete' }).score, 0);
  assert.equal(tokuhashiRevised({ general: 'good', extraspinalBone: 'zero', vertebralMets: 'one', organMets: 'none', primary: 'p5', palsy: 'none' }).score, 15);
});

test('blank parameter -> complete-the-fields fallback', () => {
  const r = tokuhashiRevised({ general: 'good', extraspinalBone: 'zero', vertebralMets: 'one', organMets: 'none', primary: 'p5' });
  assert.equal(r.valid, false);
  assert.match(r.message, /palsy/);
});
