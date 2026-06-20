// spec-v121 2.1: EGRIS (Walgaard 2010). Days onset->admission (0-2), facial/
// bulbar weakness (+1), MRC sum-score band (0-4); total 0-7. Banded mechanical-
// ventilation risk: low (0-2) ~4%, intermediate (3-4) ~24%, high (>= 5) ~65%.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { egris } from '../../lib/neuro-v121.js';

test('all 0-point inputs -> 0/7, low band ~4%', () => {
  const r = egris({ daysOnset: '0', mrc: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low score \(0-2\).*about a 4%/);
});

test('intermediate band: total 3 -> ~24%', () => {
  const r = egris({ daysOnset: '2', facialBulbar: true, mrc: '0' });
  assert.equal(r.total, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /intermediate score \(3-4\).*about a 24%/);
});

test('high band band-flip: days <=3 + facial/bulbar + MRC 30-21 -> 6/7, ~65%', () => {
  const r = egris({ daysOnset: '2', facialBulbar: true, mrc: '3' });
  assert.equal(r.total, 6);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high score \(5 or more\).*about a 65%/);
});

test('every item at maximum -> 7/7 (clamped)', () => {
  const r = egris({ daysOnset: '2', facialBulbar: true, mrc: '4' });
  assert.equal(r.total, 7);
  assert.equal(r.abnormal, true);
});

test('scalar / non-object fuzz arg yields a valid 0/7, never NaN', () => {
  const r = egris(9);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(Number.isFinite(r.total), true);
});
