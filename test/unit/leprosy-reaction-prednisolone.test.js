// spec-v1561 tool 4: the Table 3 prednisolone tracks, the week lookup, and the weight reading.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leprosyReactionPrednisolone as r } from '../../lib/leprosy-reaction-prednisolone-v1561.js';

test('tracks by weight and by choice', () => {
  assert.equal(r({ weight: '60' }).bandLabel, '30 mg start');
  assert.equal(r({ weight: '70' }).bandLabel, '40 mg start');
  assert.equal(r({ weight: '60', track: '40' }).bandLabel, '40 mg start');
  assert.ok(r({ weight: '60' }).notes.some((n) => /not entered/.test(n)));
  assert.equal(r({ weight: '25' }).bandLabel, 'No schedule at this weight');
  assert.ok(r({ weight: '25', track: '30' }).notes.some((n) => /above the 0.5-1.0/.test(n)));
});

test('the week lookup follows Table 3', () => {
  const w = (track, week) => r({ weight: '60', track, week }).bandLabel;
  assert.equal(w('40', '2'), '40 mg a day');
  assert.equal(w('40', '3'), '30 mg a day');
  assert.equal(w('30', '4'), '25 mg a day');
  assert.equal(w('30', '5'), '20 mg a day');
  assert.equal(w('30', '12'), '20 mg a day');
  assert.equal(w('30', '13'), '10 mg a day');
  assert.equal(w('40', '20'), '5 mg a day');
  assert.equal(r({ weight: '60', week: '21' }).valid, false);
  assert.equal(r({}).valid, false);
});
