// Regression tests for the eleven defects an independent review found in the spec-v1656 to v1662 tools on
// 2026-10-20, each with the input that showed it. Most were a rounded value compared with a cut-off, so the
// printed number contradicted the category beside it; the rest were impossible inputs that got an answer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tMacs, ITEMS } from '../../lib/t-macs-v1662.js';
import { oshaNoiseDose } from '../../lib/osha-noise-dose-v1656.js';
import { oshaLeadAirbornePelShift } from '../../lib/osha-lead-airborne-pel-shift-v1656.js';
import { parseNumberLines } from '../../lib/lab-stats.js';
import { turnaroundTimePercentile } from '../../lib/turnaround-time-percentile-v1658.js';
import { calibrationVerification } from '../../lib/calibration-verification-v1658.js';
import { directAgeStandardization } from '../../lib/direct-age-standardization-v1659.js';
import { bedOccupancyAlos } from '../../lib/bed-occupancy-alos-v1657.js';
import { oshaStandardThresholdShift } from '../../lib/osha-standard-threshold-shift-v1656.js';
import { fmcsaHearingStandard } from '../../lib/fmcsa-hearing-standard-v1656.js';
import { staffTurnoverRate } from '../../lib/staff-turnover-rate-v1657.js';
import { staffingGrid } from '../../lib/staffing-grid-v1657.js';
import { ptEventScore } from '../../lib/pt-event-score-v1658.js';

const none = Object.fromEntries(ITEMS.map(([k]) => [k, 'no']));

test('1. T-MACS: 1.996% is shown as 1.996%, not 2%, beside "very low"', () => {
  const r = tMacs({ ...none, troponinT: '9.8' });
  assert.equal(r.group, 'Very low risk');
  assert.match(r.band, /ACS 1\.996%/);
});

test('2. noise: a 49.8% dose (TWA 84.97) is below the action level, and the TWA shown says so', () => {
  const r = oshaNoiseDose({ dosimeterDose: '49.8' });
  assert.equal(r.actionLevel, false);
  assert.equal(r.twa, 84.97);
  assert.match(oshaNoiseDose({ dosimeterDose: '100.04' }).band, /^Dose 100\.04%/);
});

test('3. lead: 44.42 against 400 / 9 = 44.44 does not exceed it', () => {
  const r = oshaLeadAirbornePelShift({ hours: '9', measuredTwa: '44.42' });
  assert.equal(r.exceeded, false);
  assert.equal(r.pel, 44.44);
  assert.doesNotMatch(r.band, /44\.4 /);
});

test('4. a line of two numbers is refused, not read as its second number', () => {
  assert.match(parseNumberLines('30, 45', 1, 'one number').error, /Line 1/);
  assert.deepEqual(parseNumberLines('2026-01-02, 98', 1, 'one number').rows, [[98]]);
  assert.match(turnaroundTimePercentile({ minutes: '30, 45\n50, 60' }).message, /Line 1/);
});

test('5. calibration: a range with no overlap, an empty range, an inverted range', () => {
  const c = (lo, hi) => calibrationVerification({ levels: '0, 0\n25, 25\n50, 50', limitPct: '3', rangeLow: lo, rangeHigh: hi });
  assert.ok(c('100', '200').notes.some((n) => /none of the range is spanned/.test(n)));
  assert.match(c('100', '100').message, /above the low end/);
  assert.match(c('500', '10').message, /above the low end/);
});

test('6. standardization: more events than population is refused', () => {
  assert.match(directAgeStandardization({ standard: 'us2000', strata: '0, 44, 5000, 100\n45, +, 1, 100' }).message, /more events than population/);
});

test('7. occupancy: no beds at the end of the period gives no bed turnover, not Infinity', () => {
  const r = bedOccupancyAlos({ bedPeriods: '40, 20\n0, 11', inpatientDays: '500', discharges: '100' });
  assert.doesNotMatch(r.band, /Infinity/);
  assert.match(r.band, /No bed turnover/);
});

test('8. threshold shift and hearing: decide on the unrounded average', () => {
  const b = { leftB2: '0', leftB3: '0', leftB4: '0', ageCorrection: 'no' };
  assert.equal(oshaStandardThresholdShift({ ...b, leftR2: '10', leftR3: '10', leftR4: '9.86' }).sts, false);
  assert.equal(oshaStandardThresholdShift({ ...b, leftR2: '9.9', leftR3: '10', leftR4: '10.1' }).sts, true);
  const h = fmcsaHearingStandard({ hz500: '40', hz1000: '40', hz2000: '40.1', calibration: 'ansi' });
  assert.equal(h.meets, false);
  assert.equal(h.average, 40.03);
  assert.equal(fmcsaHearingStandard({ hz500: '54', hz1000: '50', hz2000: '48.5', calibration: 'iso' }).meets, true);
});

test('9. vacancy: more filled than budgeted is refused', () => {
  assert.match(staffTurnoverRate({ budgeted: '10', filled: '12' }).message, /More positions are filled/);
});

test('10. staffing grid: 61 rows is over the 60-row limit, 60 is not', () => {
  const g = (to) => staffingGrid({ targetHppd: '8', shiftHours: '12', censusFrom: '1', censusTo: to });
  assert.equal(g('61').valid, false);
  assert.equal(g('60').rows.length, 60);
});

test('11. event history: the older event alone asks for the previous one instead of concluding', () => {
  const r = ptEventScore({ analytes: 'A, 5, 5', eventBeforeThat: 'unsatisfactory' });
  assert.doesNotMatch(r.band, /Not unsuccessful/);
  assert.ok(r.notes.some((n) => /^Choose the previous event/.test(n)));
});
