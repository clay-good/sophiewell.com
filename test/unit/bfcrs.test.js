// spec-v123 2.2: Bush-Francis Catatonia Rating Scale (Bush 1996). First 14 items
// = screen (>= 2 present suggests catatonia); 23 items 0-3, severity max 69.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bfcrs, BFCRS_ITEMS } from '../../lib/psych-v123.js';

// spec-v1110: a completed examination, with the items under test overridden.
// The two below-threshold assertions rated nothing or one item and read the rest
// as twenty-two or twenty-three signs looked for and not found.
const elicited = (o = {}) => {
  const all = {};
  for (const [key] of BFCRS_ITEMS) all[key] = '0';
  return { ...all, ...o };
};

test('no signs -> 0 screen, 0 severity, below threshold', () => {
  const r = bfcrs(elicited());
  assert.equal(r.valid, true);
  assert.equal(r.screenCount, 0);
  assert.equal(r.severity, 0);
  assert.equal(r.abnormal, false);
});

test('one screen item present -> below the >= 2 screen threshold', () => {
  const r = bfcrs(elicited({ immobility: '2' }));
  assert.equal(r.screenCount, 1);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /below the >= 2 screen threshold/);
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


// --- spec-v1110: an unrated item is not a sign looked for and not found ---

test('spec-v1110: an unperformed examination is not below the screen threshold', () => {
  const r = bfcrs({});
  assert.equal(r.valid, true);
  assert.equal(r.screenCount, 0);
  assert.equal(r.unrated.length, BFCRS_ITEMS.length);
  assert.equal(r.floorOnly, true);
  assert.equal(r.abnormal, false);
  assert.doesNotMatch(r.band, /below the >= 2 screen threshold/);
  assert.match(r.band, /14 of the 14 screen items are unrated/);
  assert.match(r.band, /can only add to the count/);
  assert.doesNotMatch(r.counted, /no catatonic signs elicited/);
});

test('spec-v1110: a screen-positive reading rules in from a subset', () => {
  // Rule 13: two screen items present is two, whatever the unrated ones hold.
  const r = bfcrs({ immobility: '3', mutism: '2' });
  assert.equal(r.abnormal, true);
  assert.equal(r.floorOnly, false);
  assert.match(r.band, /catatonia is suggested/);
});

test('spec-v1114: a screen-positive reading still floors its severity total', () => {
  // Rule 13 exempts the VERDICT, not a number the reading quotes. spec-v1110
  // left the whole screen-positive branch alone, so "severity total 5/69"
  // printed as though all 23 items had been scored.
  const r = bfcrs({ immobility: '3', mutism: '2' });
  assert.equal(r.abnormal, true);
  assert.match(r.band, /catatonia is suggested/);
  assert.match(r.band, /severity total at least 5\/69 over 2 of the 23 items/);
  assert.match(r.counted, /Not rated: /);

  const complete = bfcrs(elicited({ immobility: '3', mutism: '2' }));
  assert.match(complete.band, /severity total 5\/69\./);
  assert.doesNotMatch(complete.band, /at least/);
});
