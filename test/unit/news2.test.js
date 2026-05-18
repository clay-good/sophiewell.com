// spec-v12 §3.1.1 wave 12-1: NEWS2 boundary worked examples per the
// shipping contract in spec-v12 §5. Aggregate and per-parameter scoring
// reproduce RCP 2017 Table 1; bands reproduce RCP 2017 Table 2.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { news2 } from '../../lib/scoring-v4.js';

// Low edge: every parameter inside the green band (aggregate 0).
test('news2 low edge: normal vitals -> aggregate 0, Low band', () => {
  const r = news2({ rr: 14, spo2: 98, scale2: false, onO2: false,
    sbp: 124, pulse: 78, acvpu: 'A', temp: 37.0 });
  assert.equal(r.score, 0);
  assert.equal(r.anyParameterScoresThree, false);
  assert.match(r.band, /^Low \(0\)/);
});

// Mid: the worked example from spec-v12 §3.1.1.
// RR 22 (2) + SpO2 95 Scale1 (1) + air (0) + SBP 108 (1) + HR 102 (1)
// + A (0) + T 37.8 (0) = 5; Medium because aggregate >=5.
test('news2 mid: spec-v12 worked example -> 5, Medium', () => {
  const r = news2({ rr: 22, spo2: 95, scale2: false, onO2: false,
    sbp: 108, pulse: 102, acvpu: 'A', temp: 37.8 });
  assert.equal(r.score, 5);
  assert.equal(r.parts.rr, 2);
  assert.equal(r.parts.spo2, 1);
  assert.equal(r.parts.supplementalO2, 0);
  assert.equal(r.parts.sbp, 1);
  assert.equal(r.parts.pulse, 1);
  assert.equal(r.parts.consciousness, 0);
  assert.equal(r.parts.temp, 0);
  assert.match(r.band, /^Medium/);
});

// High: every parameter in the deep-red band. Aggregate caps the
// trigger; any single 3 also flips to Medium even at low aggregates.
test('news2 high edge: severe abnormalities -> >=7, High', () => {
  const r = news2({ rr: 30, spo2: 88, scale2: false, onO2: true,
    sbp: 80, pulse: 140, acvpu: 'U', temp: 34.5 });
  assert.ok(r.score >= 7, `expected >=7 got ${r.score}`);
  assert.equal(r.anyParameterScoresThree, true);
  assert.match(r.band, /^High/);
});

// Single-parameter-3 trigger: aggregate < 5 but one parameter is 3.
test('news2 single-3 trigger: SpO2 91 alone -> Medium band', () => {
  const r = news2({ rr: 14, spo2: 91, scale2: false, onO2: false,
    sbp: 124, pulse: 78, acvpu: 'A', temp: 37.0 });
  assert.equal(r.score, 3);
  assert.equal(r.parts.spo2, 3);
  assert.match(r.band, /^Medium/);
});

// Scale 2 (chronic Type II): target 88-92% on air is 0 points.
test('news2 Scale 2: SpO2 90 on air -> 0 points for SpO2', () => {
  const r = news2({ rr: 14, spo2: 90, scale2: true, onO2: false,
    sbp: 124, pulse: 78, acvpu: 'A', temp: 37.0 });
  assert.equal(r.parts.spo2, 0);
});

// Scale 2 on supplemental O2: 97% becomes a 3 (over-oxygenation).
test('news2 Scale 2 on O2: SpO2 97 -> 3 points for SpO2', () => {
  const r = news2({ rr: 14, spo2: 97, scale2: true, onO2: true,
    sbp: 124, pulse: 78, acvpu: 'A', temp: 37.0 });
  assert.equal(r.parts.spo2, 3);
  assert.equal(r.parts.supplementalO2, 2);
});
