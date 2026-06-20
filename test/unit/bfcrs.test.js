// spec-v123 2.2: Bush-Francis Catatonia Rating Scale (Bush 1996). First 14 items
// = screen (>= 2 present suggests catatonia); 23 items 0-3, severity max 69.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bfcrs } from '../../lib/psych-v123.js';

test('no signs -> 0 screen, 0 severity, below threshold', () => {
  const r = bfcrs({});
  assert.equal(r.valid, true);
  assert.equal(r.screenCount, 0);
  assert.equal(r.severity, 0);
  assert.equal(r.abnormal, false);
});

test('one screen item present -> below the >= 2 screen threshold', () => {
  const r = bfcrs({ immobility: '2' });
  assert.equal(r.screenCount, 1);
  assert.equal(r.abnormal, false);
});

test('>= 2 screen items -> catatonia suggested (screen-positive)', () => {
  const r = bfcrs({ immobility: '3', mutism: '2', staring: '1' });
  assert.equal(r.screenCount, 3);
  assert.equal(r.severity, 6);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /catatonia is suggested/);
});

test('severity-only items (15-23) do not count toward the 14-item screen', () => {
  const r = bfcrs({ combativeness: '3', autonomic: '3' }); // items 22, 23
  assert.equal(r.screenCount, 0);
  assert.equal(r.severity, 6);
  assert.equal(r.abnormal, false);
});

test('all 23 items at max -> severity 69/69', () => {
  const all = {};
  for (const k of ['immobility', 'mutism', 'staring', 'posturing', 'grimacing', 'echo', 'stereotypy', 'mannerisms', 'verbigeration', 'rigidity', 'negativism', 'waxy', 'withdrawal', 'excitement', 'impulsivity', 'autoObedience', 'mitgehen', 'gegenhalten', 'ambitendency', 'grasp', 'perseveration', 'combativeness', 'autonomic']) all[k] = '3';
  assert.equal(bfcrs(all).severity, 69);
});

test('scalar / non-object fuzz arg yields valid 0s, never NaN', () => {
  const r = bfcrs(9);
  assert.equal(r.valid, true);
  assert.equal(Number.isFinite(r.severity), true);
});
