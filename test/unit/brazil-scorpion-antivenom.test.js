// spec-v1556 tool 3: Quadro 3 classes and vial counts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brazilScorpionAntivenom as r } from '../../lib/brazil-scorpion-antivenom-v1556.js';

test('classes', () => {
  assert.equal(r({ local: 'yes', moderate: 'no', severe: 'no' }).bandLabel, 'Mild: no antivenom');
  assert.equal(r({ local: 'yes', moderate: 'yes', severe: 'no' }).bandLabel, 'Moderate: 2-3 vials');
  assert.equal(r({ local: 'yes', moderate: 'yes', severe: 'yes' }).bandLabel, 'Severe: 4-6 vials');
  assert.equal(r({ local: 'yes', moderate: 'yes' }).bandLabel, 'At least moderate: 2-3 vials');
  assert.equal(r({ local: 'yes' }).bandLabel, 'Not decided');
  assert.equal(r({}).valid, false);
});
