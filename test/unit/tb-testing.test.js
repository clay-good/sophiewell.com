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

test('spec-v930: an empty string is not 0 mm -- it is a field nobody has filled in', () => {
  // This reverses an earlier choice, and the reason is worth recording. The old behavior read
  // an empty field as 0 mm so the tile would show "0 mm ... Negative" rather than a NaN band.
  // Avoiding NaN was right; reading blank as zero was not the way to do it, because with the
  // cutoff blank as well the tile reported "TST: 0 mm vs cutoff 0 mm -> POSITIVE" -- a positive
  // tuberculin test declared from an empty form. The prompt path already answers the NaN
  // concern, so blank now takes it.
  const r = tbTstInterpret({ indurationMm: '', cutoffMm: 10 });
  assert.equal(r.valid, false);
  assert.doesNotMatch(r.band, /NaN/);
  assert.match(r.band, /Enter the induration/);
});

test('spec-v930: an entirely empty form never reports POSITIVE', () => {
  const r = tbTstInterpret({ indurationMm: '', cutoffMm: '' });
  assert.equal(r.valid, false);
  assert.doesNotMatch(r.band, /POSITIVE/);
  // A real zero is still a real answer: 0 mm against a 10 mm cutoff is negative.
  const zero = tbTstInterpret({ indurationMm: 0, cutoffMm: 10 });
  assert.equal(zero.valid, true);
  assert.equal(zero.positive, false);
});

test('a genuinely non-finite input returns a friendly prompt, never a NaN band', () => {
  const r = tbTstInterpret({ indurationMm: undefined, cutoffMm: 10 });
  assert.equal(r.valid, false);
  assert.doesNotMatch(r.band, /NaN/);
  assert.match(r.band, /Enter the induration/);
});
