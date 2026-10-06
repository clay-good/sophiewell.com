// spec-v1559 tool 4: the 2.6 (at-risk) and 2.2 (sick) thresholds, units, and the IV volumes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newbornHypoglycemiaWho as r } from '../../lib/newborn-hypoglycemia-who-v1559.js';

test('at-risk newborn', () => {
  assert.equal(r({ population: 'atrisk', glucose: '2.5' }).bandLabel, 'Feed and recheck');
  assert.equal(r({ population: 'atrisk', glucose: '2.6' }).bandLabel, 'At target');
  assert.equal(r({ population: 'atrisk', glucose: '46', unit: 'mgdl' }).bandLabel, 'Feed and recheck');
  assert.equal(r({ population: 'atrisk' }).bandLabel, 'No measurement');
});

test('sick young infant', () => {
  assert.equal(r({ population: 'sick', glucose: '2.1', weight: '3' }).bandLabel, 'Give IV glucose');
  assert.match(r({ population: 'sick', glucose: '2.1', weight: '3' }).band, /= 6 mL, then 15 mL an hour/);
  assert.equal(r({ population: 'sick', glucose: '2.2' }).bandLabel, 'Not below 2.2');
  assert.equal(r({ population: 'sick' }).bandLabel, 'Treat as hypoglycemia');
  assert.equal(r({}).valid, false);
});
