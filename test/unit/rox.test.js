import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rox } from '../../lib/clinical-v4.js';

test('rox success: SpO2 94 / FiO2 0.5 / RR 24 -> 7.83 (>=4.88 success)', () => {
  const r = rox({ spo2: 94, fio2: 0.5, rr: 24, hoursAfterStart: 12 });
  assert.ok(Math.abs(r.score - 7.833) < 0.005);
  assert.match(r.band, /success/);
});

test('rox failure at 12h: ROX 3.04 < 3.85', () => {
  // SpO2 85, FiO2 0.7, RR 40 -> (85/0.7)/40 = 3.04
  const r = rox({ spo2: 85, fio2: 0.7, rr: 40, hoursAfterStart: 12 });
  assert.ok(r.score < 3.85);
  assert.match(r.band, /failure/);
});

test('rox failure at 2h uses tighter cutoff <2.85', () => {
  // SpO2 80, FiO2 0.8, RR 38 -> (80/0.8)/38 = 2.63
  const r = rox({ spo2: 80, fio2: 0.8, rr: 38, hoursAfterStart: 2 });
  assert.ok(r.score < 2.85);
  assert.match(r.band, /failure/);
});

test('rox rejects invalid inputs', () => {
  assert.throws(() => rox({ spo2: 0, fio2: 0.5, rr: 20 }), /spo2/);
  assert.throws(() => rox({ spo2: 95, fio2: 0, rr: 20 }), /fio2/);
  assert.throws(() => rox({ spo2: 95, fio2: 0.5, rr: 0 }), /rr/);
});

test('spec-v1131: the ROX timepoint is not a default, and only guards where it decides', () => {
  // `hoursAfterStart = 12` was a default parameter, so an unstated timepoint
  // became the 12-hour window AND the reading named it: "failure-predicting at
  // 12h; consider escalation", about an hour nobody gave. The same score at 2 h
  // is "indeterminate; reassess".
  const undecided = rox({ spo2: 90, fio2: 0.6, rr: 50 });
  assert.equal(undecided.score, 3);
  assert.equal(undecided.hourStated, false);
  assert.equal(undecided.hourDecides, true);
  assert.match(undecided.band, /enter the hours since high-flow was started/);
  assert.doesNotMatch(undecided.band, /at 12h/);

  assert.match(rox({ spo2: 90, fio2: 0.6, rr: 50, hoursAfterStart: 2 }).band, /indeterminate at 2h/);
  assert.match(rox({ spo2: 90, fio2: 0.6, rr: 50, hoursAfterStart: 12 }).band, /failure-predicting at 12h/);
});

test('spec-v1131: outside that range the timepoint changes nothing, so the tile answers', () => {
  // Rule 25. At or above 4.88 every timepoint calls success; under 2.85 every
  // one calls failure. Neither reading may name an hour it was not given.
  const success = rox({ spo2: 92, fio2: 0.5, rr: 25 });
  assert.equal(success.hourDecides, false);
  assert.match(success.band, /success-predicting/);
  assert.doesNotMatch(success.band, /\dh\b/);

  const failure = rox({ spo2: 90, fio2: 0.75, rr: 60 });
  assert.ok(failure.score < 2.85);
  assert.equal(failure.hourDecides, false);
  assert.match(failure.band, /failure-predicting at every published timepoint/);
  assert.match(failure.band, /consider escalation/);
  assert.doesNotMatch(failure.band, /at 12h/);
});
