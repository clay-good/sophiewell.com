// spec-v788: InterTAK Diagnostic Score.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { interTak } from '../../lib/intertak-v788.js';

const ALL = ['femaleSex', 'emotionalTrigger', 'physicalTrigger', 'noStDepression', 'psychiatricDisorder', 'neurologicDisorder', 'qtProlongation'];

test('no features -> 0, low to intermediate probability', () => {
  const r = interTak({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low-intermediate');
  assert.equal(r.abnormal, false);
});

test('the seven weights sum to exactly 100', () => {
  const o = {};
  for (const k of ALL) o[k] = true;
  const r = interTak(o);
  assert.equal(r.score, 100);
  assert.equal(r.tier, 'high');
});

test('worked example: female with an emotional trigger and no ST depression -> 61', () => {
  const r = interTak({ femaleSex: 'true', emotionalTrigger: 'true', noStDepression: 'true' });
  assert.equal(r.score, 61);
  assert.equal(r.tier, 'low-intermediate');
  assert.match(r.band, /InterTAK 61 of 100/);
});

test('70 is the first high-probability score and 69 is not', () => {
  // 25 + 24 + 13 + 6 = 68, plus nothing = below; 25 + 24 + 12 + 9 = 70 exactly.
  assert.equal(interTak({ femaleSex: true, emotionalTrigger: true, physicalTrigger: true, qtProlongation: true }).score, 68);
  assert.equal(interTak({ femaleSex: true, emotionalTrigger: true, physicalTrigger: true, qtProlongation: true }).tier, 'low-intermediate');
  const seventy = interTak({ femaleSex: true, emotionalTrigger: true, noStDepression: true, neurologicDisorder: true });
  assert.equal(seventy.score, 70);
  assert.equal(seventy.tier, 'high');
});

test('each feature carries its own published weight', () => {
  const weights = { femaleSex: 25, emotionalTrigger: 24, physicalTrigger: 13, noStDepression: 12, psychiatricDisorder: 11, neurologicDisorder: 9, qtProlongation: 6 };
  for (const [k, w] of Object.entries(weights)) {
    assert.equal(interTak({ [k]: true }).score, w, k);
  }
});

test('the two sides carry different consensus pathways', () => {
  assert.match(interTak({}).workup, /angiography/);
  const o = {};
  for (const k of ALL) o[k] = true;
  assert.match(interTak(o).workup, /echocardiography/);
});
