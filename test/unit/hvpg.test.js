// spec-v1416: HVPG = wedged - free hepatic vein pressure, read against Baveno VII (J Hepatol 2022).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hvpg } from '../../lib/hvpg-v1416.js';

test('the three Baveno VII levels and their edges', () => {
  assert.equal(hvpg({ whvp: 12, fhvp: 7 }).level, 'not-raised');     // 5: not ABOVE 5
  assert.equal(hvpg({ whvp: 12.5, fhvp: 7 }).level, 'sinusoidal');   // 5.5
  assert.equal(hvpg({ whvp: 16.9, fhvp: 7 }).level, 'sinusoidal');   // 9.9
  const r = hvpg({ whvp: 17, fhvp: 7 });                             // 10: CSPH
  assert.equal(r.level, 'csph');
  assert.equal(r.gradient, 10);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /clinically significant portal hypertension/);
});

test('16 mmHg adds the surgical-mortality statement; 20 does not trigger TIPS unless bleeding', () => {
  assert.ok(hvpg({ whvp: 24, fhvp: 8 }).notes.some((n) => /non-hepatic abdominal surgery/.test(n)));
  assert.ok(!hvpg({ whvp: 15, fhvp: 0 }).notes.some((n) => /surgery/.test(n)));
  assert.ok(!hvpg({ whvp: 30, fhvp: 8 }).notes.some((n) => /pre-emptive TIPS/.test(n)));
  assert.ok(hvpg({ whvp: 30, fhvp: 8, bleeding: 'yes' }).notes.some((n) => /pre-emptive TIPS/.test(n)));
  assert.ok(!hvpg({ whvp: 28, fhvp: 8, bleeding: 'yes' }).notes.some((n) => /pre-emptive TIPS/.test(n))); // exactly 20: not >20
});

test('signs below 10 point to porto-sinusoidal vascular disorder', () => {
  assert.ok(hvpg({ whvp: 14, fhvp: 7, signs: 'yes' }).notes.some((n) => /porto-sinusoidal/.test(n)));
  assert.ok(!hvpg({ whvp: 14, fhvp: 7, signs: 'no' }).notes.some((n) => /porto-sinusoidal/.test(n)));
});

test('cause-specific caveats', () => {
  assert.ok(hvpg({ whvp: 14, fhvp: 7, etiology: 'pbc' }).notes.some((n) => /underestimate/.test(n)));
  assert.ok(hvpg({ whvp: 14, fhvp: 7, etiology: 'nash' }).notes.some((n) => /small proportion/.test(n)));
  assert.ok(hvpg({ whvp: 20, fhvp: 7 }).notes.some((n) => /viral- and alcohol-related/.test(n)));
  assert.ok(!hvpg({ whvp: 20, fhvp: 7, etiology: 'viral-alcohol' }).notes.some((n) => /viral- and alcohol-related/.test(n)));
});

test('a free pressure more than 2 above the IVC flags outflow obstruction', () => {
  assert.ok(hvpg({ whvp: 22, fhvp: 10, ivc: 7 }).notes.some((n) => /outflow obstruction/.test(n)));
  assert.ok(!hvpg({ whvp: 22, fhvp: 9, ivc: 7 }).notes.some((n) => /outflow obstruction/.test(n)));
});

test('missing, non-numeric, and negative gradients are refused', () => {
  assert.match(hvpg({}).message, /wedged hepatic vein pressure and the free/);
  assert.match(hvpg({ whvp: 20 }).message, /free hepatic vein pressure/);
  assert.equal(hvpg({ whvp: 'x', fhvp: 5 }).valid, false);
  assert.equal(hvpg({ whvp: 20, fhvp: 5, ivc: 'x' }).valid, false);
  assert.match(hvpg({ whvp: 5, fhvp: 9 }).message, /negative gradient/);
});

test('a blank cause is named when the CSPH caveat depends on it (spec-v1432)', () => {
  assert.ok(hvpg({ whvp: 20, fhvp: 7 }).notes.some((n) => /^No cause entered; choose it/.test(n)));
  assert.ok(!hvpg({ whvp: 20, fhvp: 7, etiology: 'other' }).notes.some((n) => /No cause entered/.test(n)));
});
