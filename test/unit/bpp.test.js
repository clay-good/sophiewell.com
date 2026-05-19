import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bpp } from '../../lib/scoring-v4.js';

test('bpp 10 of 10 (tile example, all present) -> normal band', () => {
  const r = bpp({ fetalBreathing: true, fetalMovements: true, fetalTone: true, amnioticFluid: true, reactiveNst: true });
  assert.equal(r.score, 10);
  assert.match(r.band, /normal per Manning 1980/);
});

test('bpp 8 of 10 (one absent) -> normal (lower edge)', () => {
  const r = bpp({ fetalBreathing: true, fetalMovements: true, fetalTone: true, amnioticFluid: true });
  assert.equal(r.score, 8);
  assert.match(r.band, /normal/);
});

test('bpp 6 of 10 -> equivocal band', () => {
  const r = bpp({ fetalBreathing: true, fetalMovements: true, fetalTone: true });
  assert.equal(r.score, 6);
  assert.match(r.band, /equivocal per Manning 1980/);
});

test('bpp 4 of 10 -> abnormal band', () => {
  const r = bpp({ fetalBreathing: true, fetalMovements: true });
  assert.equal(r.score, 4);
  assert.match(r.band, /abnormal per Manning 1980/);
});

test('bpp 0 of 10 -> abnormal band', () => {
  const r = bpp({});
  assert.equal(r.score, 0);
  assert.match(r.band, /abnormal/);
});
