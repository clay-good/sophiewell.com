import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hacor } from '../../lib/scoring-v4.js';

test('hacor low: normal values -> 0', () => {
  const r = hacor({ hr: 110, ph: 7.40, gcs: 15, pao2: 120, fio2: 0.5, rr: 25 });
  assert.equal(r.score, 0);
  assert.match(r.band, /not in the/);
});

test('hacor mid 9 -> high', () => {
  // HR 125 (1) + pH 7.32 (2) + GCS 13 (2) + P/F 160 (3) + RR 32 (1) = 9
  const r = hacor({ hr: 125, ph: 7.32, gcs: 13, pao2: 80, fio2: 0.5, rr: 32 });
  assert.equal(r.score, 9);
  assert.match(r.band, /high risk/);
});

test('hacor high (maximum 25)', () => {
  const r = hacor({ hr: 130, ph: 7.20, gcs: 9, pao2: 90, fio2: 1.0, rr: 50 });
  // HR 1 + pH 4 + GCS 10 + P/F (90/1.0=90, <=100=6) + RR 4 = 25
  assert.equal(r.score, 25);
});

test('hacor pH bands per Duan 2017 Table 1', () => {
  // spec-v1231: this used `hr: 0` to hold the heart-rate term at zero points
  // while the pH moved. A heart rate of 0 is outside BOUNDS.hr (10-300,
  // "sustained rates outside 10-300 are not compatible with perfusion") and is
  // now refused, so the term is held at zero with a heart rate that scores zero
  // for the reason Duan gives -- 80 bpm, below the > 120 cutoff.
  assert.equal(hacor({ hr: 80, ph: 7.40, gcs: 15, pao2: 200, fio2: 0.5, rr: 20 }).parts.ph, 0);
  assert.equal(hacor({ hr: 80, ph: 7.34, gcs: 15, pao2: 200, fio2: 0.5, rr: 20 }).parts.ph, 2);
  assert.equal(hacor({ hr: 80, ph: 7.28, gcs: 15, pao2: 200, fio2: 0.5, rr: 20 }).parts.ph, 3);
  assert.equal(hacor({ hr: 80, ph: 7.20, gcs: 15, pao2: 200, fio2: 0.5, rr: 20 }).parts.ph, 4);
  assert.equal(hacor({ hr: 80, ph: 7.40, gcs: 15, pao2: 200, fio2: 0.5, rr: 20 }).parts.hr,
    hacor({ hr: 60, ph: 7.40, gcs: 15, pao2: 200, fio2: 0.5, rr: 20 }).parts.hr);
});

// spec-v59 §2.2: refuse to score from an empty/impossible instrument rather
// than substitute a clinically-loaded default (blank pH -> 7.4, blank GCS -> 15).
test('hacor refuses an all-empty instrument (no band from no data)', () => {
  const r = hacor({});
  assert.equal(r.score, null);
  assert.equal(r.pfRatio, null);
  assert.match(r.band, /Enter all six/);
});
test('hacor refuses when FiO2 <= 0 (P/F undefined), not a magic ratio', () => {
  const r = hacor({ hr: 110, ph: 7.4, gcs: 15, pao2: 120, fio2: 0, rr: 25 });
  assert.equal(r.score, null);
  assert.equal(r.pfRatio, null);
});
