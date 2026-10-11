// spec-v1631 tool 4: a new dose and interval from two levels (Sawchuk-Zaske).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sawchukZaskeDosing as sz } from '../../lib/sawchuk-zaske-dosing-v1631.js';
import { singleDose, steadyState } from '../../lib/pk-steady-state-predict-v1631.js';

const k = Math.LN2 / 3;
// A simulated patient: 120 mg over 1 hour, volume 20 L, half-life 3 hours.
const first = (t) => singleDose(120, 1, k, 20, 1 + t).toFixed(5);
const base = { doseState: 'first', dose: 120, infusionHours: 1, interval: 8, level1: first(0.5), time1: 0.5, level2: first(5), time2: 5 };

test('two levels after a first dose recover the half-life and volume that made them', () => {
  const r = sz({ ...base, weight: 80 });
  assert.deepEqual([r.halfLife, r.vd, r.vdPerKg, r.trough], [3, 20, 0.25, 0]);
  assert.equal(r.peak, Number(singleDose(120, 1, k, 20, 1).toPrecision(4)));
  assert.match(r.notes.join(' '), /No desired peak and trough were entered/);
});

test('steady-state levels recover the same parameters, with the trough extrapolated to the end of the interval', () => {
  const ss = steadyState(120, 1, 8, k, 20);
  const at = (t) => (ss.peak * Math.exp(-k * t)).toFixed(5);
  const r = sz({ ...base, doseState: 'steady', level1: at(0.5), level2: at(5) });
  assert.deepEqual([r.halfLife, r.vd], [3, 20]);
  assert.equal(r.trough, Number(ss.trough.toPrecision(4)));
  // A measured pre-dose level stands in for zero after a first dose that was not really the first.
  const withPre = sz({ ...base, preDose: 0.5 });
  assert.ok(withPre.vd > 20);
  assert.match(sz({ ...base, doseState: 'steady', level1: at(0.5), level2: at(5), preDose: 1 }).message, /only with a first dose/);
});

test('a new regimen: the exact interval, the practical intervals on both sides, and what each predicts', () => {
  const r = sz({ ...base, desiredPeak: 8, desiredTrough: 1 });
  // 1 + ln(8) / k = 1 + 3 half-lives = 10 hours, midway between 8 and 12: the longer is the headline.
  assert.deepEqual([r.exactInterval, r.practicalInterval, r.options.map((x) => x.interval)], [10, 12, [8, 12]]);
  for (const x of r.options) assert.equal(x.predictedPeak, 8);
  assert.ok(r.options[0].predictedTrough > 1 && r.options[1].predictedTrough < 1);
  // The dose reproduces the desired peak through the steady-state formula.
  assert.equal(Number(steadyState(r.newDose, 1, 12, k, 20).peak.toPrecision(3)), 8);
  assert.doesNotMatch(`${r.band} ${r.notes.join(' ')}`, /target of|recommended/i);
  assert.match(sz({ ...base, desiredPeak: 8 }).message, /both the desired peak and the desired trough/);
  assert.match(sz({ ...base, desiredPeak: 1, desiredTrough: 2 }).message, /above the desired trough/);
});

test('levels too close together, out of order, or rising are refused, and the guard is named as the tool\'s own', () => {
  const close = sz({ ...base, level1: 6, time1: 0.5, level2: 5.5, time2: 1 });
  assert.match(close.message, /less than half of the half-life.*the tool's own guard, not the paper's/);
  assert.match(sz({ ...base, time2: 0.5 }).message, /drawn after the first/);
  assert.match(sz({ ...base, level2: 9 }).message, /first level must be above the second/);
  assert.match(sz({ ...base, time2: 7.5 }).message, /same interval/);
  assert.match(sz({ ...base, doseState: '' }).message, /first dose or a dose at steady state/);
  assert.match(sz({ ...base, infusionHours: 0 }).message, /infusion time/);
});
