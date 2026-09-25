// spec-v1475: modified RECIST for hepatocellular carcinoma (Lencioni and Llovet 2010, as stated in
// open studies that apply it).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { mrecist as m } from '../../lib/mrecist-v1475.js';

test('the worked example: a 36.7% decrease from baseline is a partial response', () => {
  const r = m({ baseline: '60', current: '38', nadir: '60' });
  assert.equal(r.category, 'PR');
  assert.equal(r.band, 'Partial response (PR): a 36.7% decrease in the viable sum from the baseline of 60 mm.');
});

test('the thresholds are "at least" 30% and 20%', () => {
  assert.equal(m({ baseline: 100, current: 70, nadir: 100 }).category, 'PR');
  assert.equal(m({ baseline: 100, current: 70.1, nadir: 100 }).category, 'SD');
  assert.equal(m({ baseline: 100, current: 60, nadir: 50 }).category, 'PD');
  assert.equal(m({ baseline: 60, current: 59.9, nadir: 50 }).category, 'SD');
});

test('complete response is a viable sum of 0, and new lesions or non-target progression override it', () => {
  assert.equal(m({ baseline: 40, current: 0, nadir: 0 }).category, 'CR');
  assert.equal(m({ baseline: 40, current: 0, nadir: 0, newLesion: true }).category, 'PD');
  assert.equal(m({ baseline: 40, current: 30, nadir: 30, nonTarget: true }).category, 'PD');
});

test('regrowth after a nadir of 0 is progression, stated without an infinite percentage', () => {
  const r = m({ baseline: 40, current: 5, nadir: 0 });
  assert.equal(r.category, 'PD');
  assert.equal(r.pctNadir, null);
  assert.match(r.band, /enhancing tumor has reappeared/);
});

test('the 5 mm rule some studies add is named when it would change the answer', () => {
  const r = m({ baseline: 40, current: 12, nadir: 10 });
  assert.equal(r.category, 'PD');
  assert.ok(r.notes.some((n) => /increase from the nadir is 2 mm/.test(n)));
  assert.ok(!m({ baseline: 40, current: 30, nadir: 10 }).notes.some((n) => /5 mm/.test(n)));
});

test('blanks ask, and impossible entries are refused', () => {
  for (const r of [m({}), m({ baseline: 60, current: 38 }), m({ baseline: '', current: 38, nadir: 60 })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
  assert.equal(m({ baseline: 0, current: 0, nadir: 0 }).valid, false);
  assert.equal(m({ baseline: 60, current: 38, nadir: 70 }).valid, false);
  assert.equal(m({ baseline: 60, current: -1, nadir: 60 }).valid, false);
});

test('a sum so small the percentage overflows is refused, never printed as Infinity', () => {
  const r = m({ baseline: 60, current: 38, nadir: 1e-308 });
  assert.equal(r.valid, false);
  assert.match(r.message, ASKING);
  assert.doesNotMatch(JSON.stringify(m({ baseline: 1e-308, current: 38, nadir: 1e-308 })), /Infinity|NaN/);
});
