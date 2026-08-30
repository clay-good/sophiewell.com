// spec-v924: Bland-Altman. The tests that matter are that the limits never come back bare and
// that the tile never says whether the span is acceptable.

import test from 'node:test';
import assert from 'node:assert/strict';
import { blandAltman, BLAND_ALTMAN_NOTE } from '../../lib/bland-altman-v924.js';

const CASE = { meanDifference: -0.4, sdOfDifferences: 1.2, pairs: 85 };

test('bland-altman: all three inputs are required, and each message says why', () => {
  assert.match(blandAltman({}).message, /mean of the differences/);
  assert.match(blandAltman({ meanDifference: 0 }).message, /standard deviation/);
  assert.match(blandAltman({ meanDifference: 0, sdOfDifferences: 1 }).message, /paired measurements/);
  assert.equal(blandAltman({ meanDifference: 0, sdOfDifferences: -1, pairs: 10 }).valid, false);
  assert.equal(blandAltman({ meanDifference: 0, sdOfDifferences: 1, pairs: 1 }).valid, false);
  assert.equal(blandAltman({ meanDifference: 0, sdOfDifferences: 1, pairs: 10.5 }).valid, false);
});

test('bland-altman: the limits are the bias plus and minus 1.96 standard deviations', () => {
  const r = blandAltman(CASE);
  assert.equal(r.lowerLimit, -0.4 - 1.96 * 1.2);
  assert.equal(r.upperLimit, Math.round((-0.4 + 1.96 * 1.2) * 1000) / 1000);
  assert.equal(r.span, Math.round((2 * 1.96 * 1.2) * 1000) / 1000);
});

test('bland-altman: each limit carries its own confidence interval', () => {
  const r = blandAltman(CASE);
  const seLimit = 1.2 * Math.sqrt(3 / 85);
  assert.ok(Math.abs(r.lowerLimitCi[0] - (r.lowerLimit - 1.96 * seLimit)) < 0.002);
  assert.ok(Math.abs(r.upperLimitCi[1] - (r.upperLimit + 1.96 * seLimit)) < 0.002);
  assert.ok(r.biasCi[0] < r.bias && r.bias < r.biasCi[1]);
});

test('bland-altman: a small sample is called out, with the width that makes it matter', () => {
  const small = blandAltman({ ...CASE, pairs: 20 });
  assert.equal(small.smallSample, true);
  assert.match(small.uncertaintyNote, /With 20 pairs the limits are themselves uncertain/);
  assert.equal(blandAltman({ ...CASE, pairs: 50 }).smallSample, false);
});

test('bland-altman: nothing is judged acceptable or unacceptable', () => {
  const r = blandAltman({ meanDifference: 0, sdOfDifferences: 500, pairs: 500 });
  assert.equal(r.abnormal, false);
  assert.match(r.band, /a clinical decision this does not make/);
  assert.match(r.judgementNote, /set before the study/);
});

test('bland-altman: correlation is disclaimed on every result', () => {
  for (const pairs of [5, 500]) {
    assert.match(blandAltman({ ...CASE, pairs }).correlationNote, /high correlation is not agreement/);
    assert.match(blandAltman({ ...CASE, pairs }).proportionalNote, /only the plot/);
  }
});

test('bland-altman: the sign of the bias says which method reads higher', () => {
  assert.match(blandAltman({ ...CASE, meanDifference: 1.5 }).signNote, /reads higher/);
  assert.match(blandAltman({ ...CASE, meanDifference: -1.5 }).signNote, /reads lower/);
  assert.match(blandAltman({ ...CASE, meanDifference: 0 }).signNote, /on average the two methods agree/);
});

test('bland-altman: a bias of zero still has limits, and the note says why that matters', () => {
  const r = blandAltman({ meanDifference: 0, sdOfDifferences: 2, pairs: 100 });
  assert.equal(r.bias, 0);
  assert.ok(r.span > 7);
  assert.match(r.signNote, /says nothing about how far apart any single pair can be/);
  assert.match(BLAND_ALTMAN_NOTE, /only the plot will/);
});
