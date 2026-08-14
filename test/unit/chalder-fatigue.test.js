// spec-v733: Chalder Fatigue Scale (CFQ-11).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { chalderFatigue } from '../../lib/chalder-fatigue-v733.js';

const all = (v) => ({ q1: v, q2: v, q3: v, q4: v, q5: v, q6: v, q7: v, q8: v, q9: v, q10: v, q11: v });

test('all threes -> Likert 33, bimodal 11, caseness', () => {
  const r = chalderFatigue(all('3'));
  assert.equal(r.valid, true);
  assert.equal(r.likert, 33);
  assert.equal(r.bimodal, 11);
  assert.equal(r.tier, 'fatigue-case');
  assert.equal(r.abnormal, true);
});

test('worked example: Likert 17, bimodal 5 -> caseness', () => {
  const r = chalderFatigue({ q1: '3', q2: '2', q3: '2', q4: '2', q5: '1', q6: '1', q7: '1', q8: '2', q9: '1', q10: '1', q11: '1' });
  assert.equal(r.likert, 17);
  assert.equal(r.bimodal, 5);
  assert.equal(r.tier, 'fatigue-case');
  assert.match(r.band, /CFQ-11 bimodal 5 of 11 \(Likert 17 of 33\)/);
});

test('bimodal maps 0/1 -> 0 and 2/3 -> 1', () => {
  // seven 1s (each -> 0) and four 2s (each -> 1): bimodal 4, Likert 7 + 8 = 15
  const r = chalderFatigue({ q1: '1', q2: '1', q3: '1', q4: '1', q5: '1', q6: '1', q7: '1', q8: '2', q9: '2', q10: '2', q11: '2' });
  assert.equal(r.likert, 15);
  assert.equal(r.bimodal, 4);
  assert.equal(r.tier, 'fatigue-case'); // 4 meets caseness
  assert.equal(r.abnormal, true);
});

test('the caseness cut: bimodal 3 below, 4 is a case', () => {
  const three = chalderFatigue({ q1: '2', q2: '2', q3: '2', q4: '1', q5: '1', q6: '1', q7: '1', q8: '1', q9: '1', q10: '1', q11: '1' }); // bimodal 3
  assert.equal(three.bimodal, 3);
  assert.equal(three.tier, 'below-caseness');
  assert.equal(three.abnormal, false);
});

test('all zeros -> Likert 0, bimodal 0, below caseness', () => {
  const r = chalderFatigue(all('0'));
  assert.equal(r.likert, 0);
  assert.equal(r.bimodal, 0);
  assert.equal(r.tier, 'below-caseness');
  assert.equal(r.abnormal, false);
});

test('items require an integer 0-3; all required', () => {
  assert.equal(chalderFatigue({}).valid, false);
  assert.equal(chalderFatigue({}).code, 'MISSING_INPUT');
  assert.equal(chalderFatigue({ ...all('2'), q11: '4' }).valid, false);
  assert.equal(chalderFatigue({ ...all('2'), q11: '' }).field, 'q11');
});
