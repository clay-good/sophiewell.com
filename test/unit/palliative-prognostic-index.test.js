// spec-v148 2.4: PPI (Morita 1999). PPS + intake + edema 1 + dyspnea 3.5 +
// delirium 4, max 15. >6 -> <3wk, >4 -> <6wk, <=4 -> >6wk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palliativePrognosticIndex as ppi } from '../../lib/rheum-v148.js';

test('tile example: PPS10-20 + mouthfuls + delirium = 10.5 -> <3 weeks', () => {
  const r = ppi({ pps: 'low', intake: 'mouthfuls', delirium: 1 });
  assert.equal(r.score, 10.5);
  assert.equal(r.bandLabel, '< 3 weeks');
  assert.equal(r.abnormal, true);
});

test('>6 boundary: 6.5 -> <3 weeks, 6.0 -> <6 weeks', () => {
  // PPS 30-50 (2.5) + dyspnea (3.5) = 6.0 -> not >6 -> <6 weeks
  assert.equal(ppi({ pps: 'mid', intake: 'normal', dyspnea: 1 }).bandLabel, '< 6 weeks');
  // + edema (1) = 7.0 -> >6 -> <3 weeks
  assert.equal(ppi({ pps: 'mid', intake: 'normal', dyspnea: 1, edema: 1 }).bandLabel, '< 3 weeks');
});

test('>4 boundary: 4.0 -> >6 weeks, 4.5 -> <6 weeks', () => {
  // PPS 30-50 (2.5) + moderate intake (1) + edema (1) = 4.5 -> <6 weeks
  assert.equal(ppi({ pps: 'mid', intake: 'reduced', edema: 1 }).bandLabel, '< 6 weeks');
  // PPS 10-20 (4) only = 4.0 -> >6 weeks
  assert.equal(ppi({ pps: 'low', intake: 'normal' }).bandLabel, '> 6 weeks');
});

test('all zero -> 0/15 -> >6 weeks', () => {
  const r = ppi({ pps: 'high', intake: 'normal' });
  assert.equal(r.score, 0);
  assert.equal(r.bandLabel, '> 6 weeks');
});

test('blank select -> complete-the-fields', () => {
  assert.equal(ppi({ pps: 'high' }).valid, false);
});

test('maximum 15', () => {
  assert.equal(ppi({ pps: 'low', intake: 'mouthfuls', edema: 1, dyspnea: 1, delirium: 1 }).score, 15);
});
