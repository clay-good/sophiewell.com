// spec-v1558 tool 4: the obstetric shock-index bands (El Ayadi 2016) at 0.89/0.9, 1.39/1.4, 1.69/1.7.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obstetricShockBand as b } from '../../lib/shock-index-obstetric-v1558.js';
import { computeCalculator } from '../../mcp/tools.js';

test('band edges', () => {
  assert.equal(b(0.89).level, 'normal');
  assert.equal(b(0.9).level, 'refer');
  assert.equal(b(1.39).level, 'refer');
  assert.equal(b(1.4).level, 'urgent');
  assert.equal(b(1.69).level, 'urgent');
  assert.equal(b(1.7).level, 'high');
  assert.equal(b(0), null);
});

test('the shock-index tile adds the band only in obstetric mode', () => {
  const ob = computeCalculator({ id: 'shock-index', inputs: { 'si-sbp': '90', 'si-hr': '126', 'si-ob': 'obstetric' } });
  assert.match(JSON.stringify(ob), /1\.4 or more, urgent intervention/);
  const gen = computeCalculator({ id: 'shock-index', inputs: { 'si-sbp': '90', 'si-hr': '126' } });
  assert.doesNotMatch(JSON.stringify(gen), /Obstetric hemorrhage band/);
});
