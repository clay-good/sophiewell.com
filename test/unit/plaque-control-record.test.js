// spec-v721: Plaque Control Record (O'Leary index).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { plaqueControlRecord } from '../../lib/plaque-control-record-v721.js';

test('worked example: 28 teeth, 20 plaque surfaces -> 17.9% (above goal)', () => {
  const r = plaqueControlRecord({ teethPresent: '28', plaqueSurfaces: '20' });
  assert.equal(r.valid, true);
  assert.equal(r.totalSurfaces, 112);
  assert.equal(r.percent, 17.9); // 20/112*100 = 17.857
  assert.equal(r.tier, 'needs-improvement');
  assert.equal(r.abnormal, true);
});

test('percentage is positive / (4 x teeth) x 100', () => {
  const r = plaqueControlRecord({ teethPresent: '25', plaqueSurfaces: '10' });
  assert.equal(r.totalSurfaces, 100);
  assert.equal(r.percent, 10); // 10/100
  assert.equal(r.tier, 'good');
  assert.equal(r.abnormal, false);
});

test('the 10% goal is inclusive of good control', () => {
  assert.equal(plaqueControlRecord({ teethPresent: '25', plaqueSurfaces: '10' }).tier, 'good');           // 10%
  assert.equal(plaqueControlRecord({ teethPresent: '25', plaqueSurfaces: '11' }).tier, 'needs-improvement'); // 11%
});

test('plaque-free -> 0%', () => {
  const r = plaqueControlRecord({ teethPresent: '28', plaqueSurfaces: '0' });
  assert.equal(r.percent, 0);
  assert.equal(r.tier, 'good');
});

test('inputs validated; positive surfaces cannot exceed 4 x teeth', () => {
  assert.equal(plaqueControlRecord({}).valid, false);
  assert.equal(plaqueControlRecord({}).code, 'MISSING_INPUT');
  assert.equal(plaqueControlRecord({ teethPresent: '28' }).field, 'plaqueSurfaces');
  const over = plaqueControlRecord({ teethPresent: '10', plaqueSurfaces: '41' }); // max 40
  assert.equal(over.valid, false);
  assert.equal(over.code, 'INVALID_INPUT');
});
