// spec-v1549 tool 4: SAM weight gain. The source example, the 5 and 10 g/kg/day edges, stabilization, refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { samWeightGain as g } from '../../lib/sam-weight-gain-v1549.js';

test('the source example: 4.80 to 4.85 kg in 1 day is 10.4 g/kg/day, good', () => {
  assert.equal(g({ previous: '4.80', current: '4.85', days: '1', phase: 'rehab' }).bandLabel, '10.4 g/kg/day, good');
});

test('band edges at 5 and 10 g/kg/day', () => {
  assert.match(g({ previous: '10', current: '10.1', days: '1', phase: 'rehab' }).bandLabel, /10\.0 g\/kg\/day, good/);
  assert.match(g({ previous: '10', current: '10.099', days: '1', phase: 'rehab' }).bandLabel, /moderate/);
  assert.match(g({ previous: '10', current: '10.05', days: '1', phase: 'rehab' }).bandLabel, /5\.0 g\/kg\/day, moderate/);
  const poor = g({ previous: '10', current: '10.04', days: '1', phase: 'rehab' });
  assert.match(poor.bandLabel, /poor/);
  assert.match(poor.notes.join(' '), /failure to respond/);
});

test('stabilization is not graded', () => {
  assert.match(g({ previous: '6', current: '5.8', days: '2', phase: 'stabilization' }).bandLabel, /not graded/);
});

test('refusals', () => {
  assert.equal(g({ current: '5', days: '1', phase: 'rehab' }).valid, false);
  assert.equal(g({ previous: '5', current: '5.1', days: '0', phase: 'rehab' }).valid, false);
  assert.equal(g({ previous: '5', current: '5.1', days: '1' }).valid, false);
});
