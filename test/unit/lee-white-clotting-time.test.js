// spec-v1556 tool 2: Lee-White at 9/10 and 30/31 minutes, whole minutes only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leeWhiteClottingTime as r } from '../../lib/lee-white-clotting-time-v1556.js';

test('bands', () => {
  assert.equal(r({ minutes: '9', protocol: 'yes' }).bandLabel, 'Normal');
  assert.equal(r({ minutes: '10', protocol: 'yes' }).bandLabel, 'Prolonged');
  assert.equal(r({ minutes: '30', protocol: 'yes' }).bandLabel, 'Prolonged');
  assert.equal(r({ minutes: '31', protocol: 'yes' }).bandLabel, 'Incoagulable');
  assert.equal(r({ minutes: '9.5' }).valid, false);
  assert.ok(r({ minutes: '12', protocol: 'no' }).notes.some((n) => /with caution/.test(n)));
});
