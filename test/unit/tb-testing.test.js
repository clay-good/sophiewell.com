// TST (Mantoux) tuberculin-skin-test interpretation, extracted from the group-j
// renderer into a pure lib fn. Positive when induration >= the risk cutoff.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tbTstInterpret } from '../../lib/tb-testing.js';

test('induration at or above the cutoff is positive', () => {
  const r = tbTstInterpret({ indurationMm: 12, cutoffMm: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.positive, true);
  assert.equal(r.band, 'TST: 12 mm vs cutoff 10 mm -> POSITIVE');
});

test('exactly at the cutoff is positive; just below is negative', () => {
  assert.equal(tbTstInterpret({ indurationMm: 5, cutoffMm: 5 }).positive, true);
  assert.equal(tbTstInterpret({ indurationMm: 4, cutoffMm: 5 }).positive, false);
  assert.equal(tbTstInterpret({ indurationMm: 14, cutoffMm: 15 }).band, 'TST: 14 mm vs cutoff 15 mm -> Negative');
});

test('the three CDC risk cutoffs interpret the same induration differently', () => {
  // 12 mm induration: positive at the 5 and 10 mm cutoffs, negative at 15 mm.
  assert.equal(tbTstInterpret({ indurationMm: 12, cutoffMm: 5 }).positive, true);
  assert.equal(tbTstInterpret({ indurationMm: 12, cutoffMm: 10 }).positive, true);
  assert.equal(tbTstInterpret({ indurationMm: 12, cutoffMm: 15 }).positive, false);
});

test('an empty string reads as 0 mm (matches the renderer default), not NaN', () => {
  // The browser reads Number(input.value); an empty field yields 0, so the tile
  // shows "0 mm ... Negative" rather than a NaN band. The compute mirrors that.
  const r = tbTstInterpret({ indurationMm: '', cutoffMm: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.indurationMm, 0);
  assert.doesNotMatch(r.band, /NaN/);
});

test('a genuinely non-finite input returns a friendly prompt, never a NaN band', () => {
  const r = tbTstInterpret({ indurationMm: undefined, cutoffMm: 10 });
  assert.equal(r.valid, false);
  assert.doesNotMatch(r.band, /NaN/);
  assert.match(r.band, /Enter the induration/);
});
