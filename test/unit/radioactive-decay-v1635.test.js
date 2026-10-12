// spec-v1635 tools 24 and 25: radioactive decay and the volume to draw.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { radioactiveDecay as decay, NUCLIDES } from '../../lib/radioactive-decay-v1635.js';
import { radiopharmDispenseVolume as volume } from '../../lib/radiopharm-dispense-volume-v1635.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');

test('each half-life is the label\'s, and every label row answers', () => {
  assert.deepEqual(Object.fromEntries(NUCLIDES.filter((n) => n.label).map((n) => [n.value, n.said])), {
    'tc-99m': '6.02 hours', 'mo-99': '66 hours', 'f-18': '109.8 minutes', 'i-131': '8.02 days', 'i-123': '13.2 hours', 'in-111': '2.805 days (67.32 hours)',
    'tl-201': '72.9 hours', 'lu-177': '6.647 days', 'ra-223': '11.4 days', 'rb-82': '75 seconds', 'sr-82': '25 days', 'ga-68': '68 minutes', 'n-13': '9.96 minutes',
  });
  for (const n of NUCLIDES.filter((x) => x.label)) assert.equal(labelRow(n.label.setId, now).answers, true, n.value);
  assert.ok(Math.abs(NUCLIDES.find((n) => n.value === 'in-111').hours - 67.32) < 1e-9);
});

test('one half-life halves it; precalibration runs backward; units convert at 3.7e10 Bq per Ci', () => {
  const half = decay({ nuclide: 'tc-99m', activity: 30, unit: 'mci', calibration: '2026-10-12T08:00', target: '2026-10-12T14:01' }, now);
  assert.ok(Math.abs(half.activity - 30 * 2 ** (-(6 + 1 / 60) / 6.02)) < 1e-6);
  assert.match(half.band, /15\.01 mCi \(555\.2 MBq\)/);
  const back = decay({ nuclide: 'f-18', activity: 10, unit: 'mci', calibration: '2026-10-12T12:00', target: '2026-10-12T10:00' }, now);
  assert.equal(back.flag, 'precalibration');
  assert.ok(Math.abs(back.activity - 10 * 2 ** (120 / 109.8)) < 1e-5);
  assert.match(decay({ nuclide: 'tc-99m', activity: 1, unit: 'ci', calibration: '2026-10-12T08:00', target: '2026-10-12T08:00' }, now).band, /1 Ci \(37 GBq\)/);
});

test('the time to reach a target activity', () => {
  const r = decay({ nuclide: 'i-131', activity: 100, unit: 'mci', targetActivity: 1, calibration: '2026-10-12T08:00' }, now);
  assert.ok(Math.abs(r.hoursToTarget - 8.02 * 24 * Math.log2(100)) < 1e-4);
  assert.match(r.band, /53\.28 days after calibration/);
});

test('decay-in-storage: 120 days or less, and no ten-half-life date is printed', () => {
  const short = decay({ nuclide: 'other', halfLife: 120, halfLifeUnit: 'days', activity: 1, unit: 'gbq', calibration: '2026-10-01T00:00', target: '2026-10-11T00:00' }, now);
  assert.equal(short.decayInStorageEligible, true);
  const long = decay({ nuclide: 'other', halfLife: 121, halfLifeUnit: 'days', activity: 1, unit: 'gbq', calibration: '2026-10-01T00:00', target: '2026-10-11T00:00' }, now);
  assert.equal(long.decayInStorageEligible, false);
  assert.match(short.notes.join(' '), /not on a count of half-lives/);
  assert.doesNotMatch(short.notes.join(' '), /10 half-lives|ten half-lives/);
});

test('a superseded label withholds that half-life and offers the typed one', () => {
  const tc = NUCLIDES.find((n) => n.value === 'tc-99m').label.setId;
  const dead = { ...LABEL_EDITIONS, [tc]: { ...LABEL_EDITIONS[tc], supersededOn: '2026-10-10' } };
  const r = decay({ nuclide: 'tc-99m', activity: 30, unit: 'mci', calibration: '2026-10-12T08:00', target: '2026-10-12T14:00' }, now, dead);
  assert.deepEqual([r.withheld, r.activity], [true, undefined]);
  assert.match(r.band, /type the half-life from the label in hand/);
  assert.equal(decay({ nuclide: 'f-18', activity: 10, unit: 'mci', calibration: '2026-10-12T12:00', target: '2026-10-12T13:00' }, now, dead).withheld, undefined);
  assert.equal(volume({ nuclide: 'tc-99m', unit: 'mci', vialActivity: 100, vialVolume: 5, calibration: '2026-10-12T07:00', prescribed: 25, draw: '2026-10-12T09:00' }, now, dead).withheld, true);
});

test('decay refusals', () => {
  assert.match(decay({}, now).message, /^Choose the radionuclide/);
  assert.match(decay({ nuclide: 'other' }, now).message, /^Enter the half-life/);
  assert.match(decay({ nuclide: 'other', halfLife: 5 }, now).message, /^Choose the unit of the half-life/);
  assert.match(decay({ nuclide: 'tc-99m' }, now).message, /^Enter the activity/);
  assert.match(decay({ nuclide: 'tc-99m', activity: 30 }, now).message, /^Choose the activity unit/);
  assert.match(decay({ nuclide: 'tc-99m', activity: 30, unit: 'mci' }, now).message, /^Enter the calibration date and time/);
  assert.match(decay({ nuclide: 'tc-99m', activity: 30, unit: 'mci', calibration: '2026-10-12T08:00' }, now).message, /^Enter the target date and time/);
  assert.equal(decay(null, now).valid, false);
});

const base = { nuclide: 'tc-99m', unit: 'mci', vialActivity: 100, vialVolume: 5, calibration: '2026-10-12T07:00', prescribed: 25, draw: '2026-10-12T09:00' };

test('volume: the vial decays forward and the prescription back', () => {
  const r = volume({ ...base, administration: '2026-10-12T10:00' }, now);
  const conc = (100 * 2 ** (-2 / 6.02)) / 5; const needed = 25 * 2 ** (1 / 6.02);
  assert.ok(Math.abs(r.volumeMl - needed / conc) < 1e-4);
  assert.ok(Math.abs(r.activityAtDraw - needed) < 1e-4);
  // Given when drawn: no back-correction.
  assert.ok(Math.abs(volume(base, now).activityAtDraw - 25) < 1e-9);
  const short = volume({ ...base, vialActivity: 10 }, now);
  assert.deepEqual([short.flag, short.abnormal], ['not-enough', true]);
});

test('volume: the 35.63(d) test is the range and 20 percent', () => {
  const ok = volume({ ...base, measured: 27, rangeLow: 20, rangeHigh: 30 }, now);
  assert.deepEqual([ok.within20Percent, ok.withinRange, ok.abnormal], [true, true, false]);
  const edge = volume({ ...base, measured: 30 }, now);
  assert.deepEqual([edge.percentDifference, edge.within20Percent, edge.withinRange], [20, true, null]); // "more than 20 percent"
  assert.equal(volume({ ...base, measured: 30.1 }, now).flag, 'outside-35-63');
  assert.equal(volume({ ...base, measured: 27, rangeLow: 20, rangeHigh: 26 }, now).flag, 'outside-35-63');
  assert.equal(volume({ ...base, measured: 19 }, now).within20Percent, false);
});

test('volume refusals', () => {
  assert.match(volume({ nuclide: 'tc-99m' }, now).message, /^Choose the activity unit/);
  assert.match(volume({ nuclide: 'tc-99m', unit: 'mci' }, now).message, /^Enter the vial activity/);
  assert.match(volume({ ...base, draw: '' }, now).message, /^Enter the date and time the dose is drawn/);
  assert.match(volume({ ...base, administration: '2026-10-12T08:00' }, now).message, /before the draw time/);
  assert.match(volume({ ...base, rangeLow: 30, rangeHigh: 20 }, now).message, /must not be below/);
  assert.equal(volume(null, now).valid, false);
});
