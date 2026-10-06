// spec-v1559 tool 3: newborn temperature bands at 31.9/32.0, 35.9/36.0, 36.4/36.5, 37.5/37.6, and °F.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newbornTemperatureWho as r } from '../../lib/newborn-temperature-who-v1559.js';

test('bands', () => {
  assert.equal(r({ temp: '31.9', site: 'rectal' }).bandLabel, 'Severe hypothermia');
  assert.equal(r({ temp: '32.0', site: 'rectal' }).bandLabel, 'Moderate hypothermia');
  assert.equal(r({ temp: '35.9', site: 'axillary' }).bandLabel, 'Moderate hypothermia');
  assert.equal(r({ temp: '36.0', site: 'axillary' }).bandLabel, 'Cold stress');
  assert.equal(r({ temp: '36.4', site: 'axillary' }).bandLabel, 'Cold stress');
  assert.equal(r({ temp: '36.5', site: 'axillary' }).bandLabel, 'Normal');
  assert.equal(r({ temp: '37.5', site: 'axillary' }).bandLabel, 'Normal');
  assert.equal(r({ temp: '37.6', site: 'axillary' }).bandLabel, 'Hyperthermia');
  assert.equal(r({ temp: '97.0', unit: 'F', site: 'axillary' }).bandLabel, 'Cold stress');
  assert.ok(r({ temp: '35.0', site: 'axillary' }).notes.some((n) => /35\.5/.test(n)));
  assert.equal(r({}).valid, false);
});
