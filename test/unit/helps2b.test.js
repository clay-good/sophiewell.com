// spec-v120 2.2: 2HELPS2B (Struck 2017). Six cEEG-read items -- B(I)RDs (+2),
// LPDs/LRDA/BIPDs, sporadic discharges, frequency > 2 Hz, plus features, prior
// seizures (+1 each); total 0-7 mapped through the published fixed integer->risk
// lookup of calibrated 72-hour seizure probabilities.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { helps2b } from '../../lib/neuro-v120.js';

test('no features -> 0/7, about 5% risk', () => {
  const r = helps2b({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.risk, '5%');
  assert.match(r.band, /about a 5% calibrated risk/);
});

test('B(I)RDs alone -> 2/7, about 27% risk (the +2 item)', () => {
  const r = helps2b({ birds: true });
  assert.equal(r.total, 2);
  assert.equal(r.risk, '27%');
});

test('B(I)RDs + sporadic -> 3/7, about 50% risk (tile example)', () => {
  const r = helps2b({ birds: true, sporadic: true });
  assert.equal(r.total, 3);
  assert.equal(r.risk, '50%');
  assert.match(r.band, /about a 50% calibrated risk of an electrographic seizure within 72 hours/);
});

test('every item present -> 7/7, folds into the above-95% stratum', () => {
  const r = helps2b({ birds: true, periodic: true, sporadic: true, fast: true, plus: true, priorSeizure: true });
  assert.equal(r.total, 7);
  assert.equal(r.risk, 'above 95%');
  assert.match(r.band, /above 95%/);
});

test('lookup matches the published per-score calibrated table', () => {
  const expected = ['5%', '12%', '27%', '50%', '73%', '88%', 'above 95%', 'above 95%'];
  // Walk totals 0..7 by adding the single-point items, plus the +2 birds at the end.
  const single = ['periodic', 'sporadic', 'fast', 'plus', 'priorSeizure'];
  for (let n = 0; n <= 5; n += 1) {
    const input = {};
    for (let i = 0; i < n; i += 1) input[single[i]] = true;
    assert.equal(helps2b(input).risk, expected[n]);
  }
  assert.equal(helps2b({ birds: true, periodic: true, sporadic: true, fast: true, plus: true }).risk, expected[6]);
});

test('scalar / non-object fuzz arg yields a valid 0/7, never NaN', () => {
  const r = helps2b(true);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(Number.isFinite(r.total), true);
});
