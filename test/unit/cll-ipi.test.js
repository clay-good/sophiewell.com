// spec-v135 2.5: CLL International Prognostic Index (International CLL-IPI Working
// Group, Lancet Oncol 2016;17:779-790). Weighted: TP53 4, IGHV unmutated 2,
// beta2M >3.5 2, advanced stage 1, age >65 1. Total 0-10 -> low 0-1,
// intermediate 2-3, high 4-6, very high 7-10. Boundary tests pin the weights and
// the high/very-high (6/7) flip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cllIpi } from '../../lib/lymphoma-v135.js';

const none = { tp53: 'no', ighvUnmutated: 'no', b2mHigh: 'no', stageAdvanced: 'no', ageOver65: 'no' };

test('no factors -> Low, total 0', () => {
  const r = cllIpi(none);
  assert.equal(r.total, 0);
  assert.equal(r.group, 'Low');
  assert.equal(r.abnormal, false);
});

test('the weights are 4 / 2 / 2 / 1 / 1', () => {
  assert.equal(cllIpi({ ...none, tp53: 'yes' }).total, 4);
  assert.equal(cllIpi({ ...none, ighvUnmutated: 'yes' }).total, 2);
  assert.equal(cllIpi({ ...none, b2mHigh: 'yes' }).total, 2);
  assert.equal(cllIpi({ ...none, stageAdvanced: 'yes' }).total, 1);
  assert.equal(cllIpi({ ...none, ageOver65: 'yes' }).total, 1);
});

test('group boundaries: 1->2 (low/int), 3->4 (int/high), 6->7 (high/very high)', () => {
  assert.equal(cllIpi({ ...none, ageOver65: 'yes' }).group, 'Low'); // 1
  assert.equal(cllIpi({ ...none, ighvUnmutated: 'yes' }).group, 'Intermediate'); // 2
  assert.equal(cllIpi({ ...none, ighvUnmutated: 'yes', stageAdvanced: 'yes' }).group, 'Intermediate'); // 3
  assert.equal(cllIpi({ ...none, tp53: 'yes' }).group, 'High'); // 4
  assert.equal(cllIpi({ ...none, tp53: 'yes', ighvUnmutated: 'yes' }).group, 'High'); // 6
});

test('worked example: total 7 is the Very high floor (high/very-high boundary)', () => {
  const r = cllIpi({ tp53: 'yes', ighvUnmutated: 'yes', b2mHigh: 'no', stageAdvanced: 'yes', ageOver65: 'no' });
  assert.equal(r.total, 7);
  assert.equal(r.group, 'Very high');
  // one less (drop the stage point) -> total 6 -> High
  const high = cllIpi({ tp53: 'yes', ighvUnmutated: 'yes', b2mHigh: 'no', stageAdvanced: 'no', ageOver65: 'no' });
  assert.equal(high.total, 6);
  assert.equal(high.group, 'High');
});

test('all factors -> total 10, Very high', () => {
  const r = cllIpi({ tp53: 'yes', ighvUnmutated: 'yes', b2mHigh: 'yes', stageAdvanced: 'yes', ageOver65: 'yes' });
  assert.equal(r.total, 10);
  assert.equal(r.group, 'Very high');
});

test('any unanswered factor surfaces the fallback', () => {
  assert.equal(cllIpi({}).valid, false);
  assert.equal(cllIpi({ tp53: 'yes' }).valid, false);
});
