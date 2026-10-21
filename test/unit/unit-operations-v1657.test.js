// spec-v1657: unit and facility operations arithmetic, against the Five-Star guide's cut points and the
// cost report dictionary's definitions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nursingHppd } from '../../lib/nursing-hppd-v1657.js';
import { pbjHoursPerResidentDay as pbj } from '../../lib/pbj-hours-per-resident-day-v1657.js';
import { pbjCaseMixAdjustedHours as adj } from '../../lib/pbj-case-mix-adjusted-hours-v1657.js';
import { nursingHomeStaffingStar as star, starFor, levelPoints, turnoverPoints } from '../../lib/nursing-home-staffing-star-v1657.js';
import { staffTurnoverRate as turn } from '../../lib/staff-turnover-rate-v1657.js';
import { fteFromHours as fte } from '../../lib/fte-from-hours-v1657.js';
import { bedOccupancyAlos as beds } from '../../lib/bed-occupancy-alos-v1657.js';
import { overtimeAgencyShare as ot } from '../../lib/overtime-agency-share-v1657.js';
import { unitBudgetVariance as budget } from '../../lib/unit-budget-variance-v1657.js';
import { caseMixIndex as cmi } from '../../lib/case-mix-index-v1657.js';
import { staffingGrid as grid } from '../../lib/staffing-grid-v1657.js';

const FULL = { rnHours: '1.202', totalHours: '5.070', weekendHours: '4.464', rnTurnover: '20', totalTurnover: '31.126', adminDepartures: '0' };

test('HPPD: hours over patient days, skill mix, target variance, definitions asked for', () => {
  const r = nursingHppd({ patientDays: '600', rnHours: '3000', lpnHours: '600', aideHours: '1800', targetHppd: '8.5', hoursBasis: 'worked', daysBasis: 'midnight' });
  assert.equal(r.hppd, 9);
  assert.match(r.band, /worked \(productive\) hours over midnight-census patient days/);
  assert.match(r.band, /300 hours over/);
  assert.ok(r.notes.some((n) => /RN: 5 hours per patient day, 55.56%/.test(n)));
  assert.ok(nursingHppd({ patientDays: '10', rnHours: '50' }).notes.some((n) => /^Choose whether/.test(n)));
  assert.equal(nursingHppd({ patientDays: '10' }).valid, false);
  assert.equal(nursingHppd({ patientDays: '0', rnHours: '5' }).valid, false);
  assert.equal(nursingHppd({ patientDays: '10', rnHours: '5', targetHppd: '0' }).valid, false);
});

test('PBJ: aggregate hours over aggregate census; all six exclusions and the RN-days exception', () => {
  const r = pbj({ rnHours: '7000', lpnHours: '8000', aideHours: '20000', census: '9000' });
  assert.equal(r.total, 3.889);
  assert.equal(r.rn, 0.778);
  assert.equal(r.flags.length, 0);
  assert.ok(pbj({ rnHours: '0', lpnHours: '0', aideHours: '0', census: '10' }).flags.some((x) => /zero/.test(x)));
  assert.ok(pbj({ rnHours: '50', lpnHours: '20', aideHours: '51', census: '10' }).flags.some((x) => /over 12/.test(x)));
  assert.equal(pbj({ rnHours: '50', lpnHours: '20', aideHours: '50', census: '10' }).flags.length, 0);
  assert.ok(pbj({ rnHours: '5', lpnHours: '5', aideHours: '52.6', census: '10' }).flags.some((x) => /5.25/.test(x)));
  assert.equal(pbj({ rnHours: '5', lpnHours: '5', aideHours: '52.5', census: '10' }).flags.length, 0);
  const wk = pbj({ rnHours: '7', lpnHours: '8', aideHours: '20', census: '9', weekendNurseHours: '0', weekendAideHours: '0', weekendCensus: '4' });
  assert.ok(wk.flags.some((x) => /Weekend total nurse staffing is zero/.test(x)));
  assert.ok(pbj({ rnHours: '7', lpnHours: '8', aideHours: '20', census: '9', daysWithoutRn: '4' }).flags.some((x) => /one-star/.test(x)));
  assert.equal(pbj({ rnHours: '7', lpnHours: '8', aideHours: '20', census: '9', daysWithoutRn: '3' }).flags.length, 0);
  assert.equal(pbj({ rnHours: '7', lpnHours: '8', aideHours: '20', census: '0' }).valid, false);
});

test('case-mix adjustment: the guide formula; zero case-mix refused', () => {
  assert.equal(adj({ reported: '4.0', caseMix: '3.6', national: '3.8', staffType: 'total' }).adjusted, 4.222);
  assert.equal(adj({ reported: '4.0', caseMix: '0', national: '3.8' }).valid, false);
});

test('Table A2: every row boundary maps to its points', () => {
  const RN = [[1.202, 100], [1.201, 90], [0.934, 90], [0.933, 80], [0.786, 80], [0.785, 70], [0.678, 70], [0.677, 60], [0.591, 60], [0.590, 50], [0.513, 50], [0.512, 40], [0.440, 40], [0.439, 30], [0.368, 30], [0.367, 20], [0.275, 20], [0.274, 10], [0, 10]];
  for (const [v, p] of RN) assert.equal(star({ ...FULL, rnHours: String(v) }).notes[0], `Adjusted RN hours: ${p} of 100 points.`, `RN ${v}`);
  for (const [v, p] of [[5.070, 100], [5.069, 90], [4.499, 90], [4.498, 80], [2.722, 20], [2.721, 10]]) assert.equal(star({ ...FULL, totalHours: String(v) }).notes[1], `Adjusted total nurse hours: ${p} of 100 points.`);
  for (const [v, p] of [[4.464, 50], [4.463, 45], [2.354, 10], [2.353, 5]]) assert.equal(star({ ...FULL, weekendHours: String(v) }).notes[2], `Adjusted weekend total nurse hours: ${p} of 50 points.`);
  for (const [v, p] of [[20, 50], [20.001, 45], [28.571, 45], [28.572, 40], [80, 10], [80.001, 5], [100, 5]]) assert.equal(star({ ...FULL, rnTurnover: String(v) }).notes[3], `RN turnover: ${p} of 50 points.`);
  for (const [v, p] of [[31.126, 50], [31.127, 45], [69.792, 10], [69.793, 5]]) assert.equal(star({ ...FULL, totalTurnover: String(v) }).notes[4], `Total nurse turnover: ${p} of 50 points.`);
  for (const [v, p] of [['0', 30], ['1', 25], ['2', 10], ['5', 10]]) assert.equal(star({ ...FULL, adminDepartures: v }).notes[5], `Administrator departures: ${p} of 30 points.`);
  assert.equal(levelPoints([[10, 0]], 0), 10);
  assert.equal(turnoverPoints([[5, 100]], 100), 5);
});

test('Table 3: each star boundary', () => {
  for (const [s, n] of [[154, 1], [155, 2], [204, 2], [205, 3], [254, 3], [255, 4], [319, 4], [320, 5], [380, 5]]) assert.equal(starFor(s), n, String(s));
  const top = star(FULL);
  assert.equal(top.score, 380);
  assert.equal(top.star, 5);
});

test('rescaling for a missing turnover measure; lowest points for erroneous data are not rescaled', () => {
  const r = star({ rnHours: '0.786', totalHours: '4.151', weekendHours: '3.668', totalTurnover: '45', adminDepartures: '1', rnTurnoverStatus: 'not-reported' });
  // 80 + 80 + 40 + 35 + 25 = 260 of 330 available; 260 × 380 ÷ 330 = 299.39 -> 299.
  assert.equal(r.rawPoints, 260);
  assert.equal(r.score, 299);
  assert.equal(r.star, 4);
  const low = star({ rnHours: '0.786', totalHours: '4.151', weekendHours: '3.668', totalTurnover: '45', adminDepartures: '1', rnTurnoverStatus: 'lowest' });
  assert.equal(low.score, 265);
  assert.match(star({ ...FULL, rnTurnover: '' }).message, /choose why it is missing/);
  assert.equal(star({ ...FULL, exception: 'no-rn-days' }).star, 1);
  assert.equal(star({ ...FULL, adminDepartures: '1.5' }).valid, false);
});

test('turnover and vacancy; CMS spells; over 100% flagged', () => {
  const r = turn({ separations: '12', startHeadcount: '38', endHeadcount: '42', budgeted: '45', filled: '41' });
  assert.equal(r.turnover, 30);
  assert.equal(r.vacancy, 8.9);
  assert.ok(turn({ separations: '50', startHeadcount: '40', endHeadcount: '40' }).notes.some((n) => /over 100%/.test(n)));
  assert.equal(turn({ spellsEnded: '18', eligibleSpells: '60' }).cms, 30);
  assert.equal(turn({ spellsEnded: '61', eligibleSpells: '60' }).valid, false);
  assert.equal(turn({ budgeted: '0', filled: '0' }).valid, false);
  assert.equal(turn({}).valid, false);
});

test('FTE: period hours, and the cost report sample weeks over 160 or 80', () => {
  assert.equal(fte({ method: 'period', hours: '2080', weeks: '52', hoursPerWeek: '40' }).fte, 1);
  assert.equal(fte({ method: 'period', hours: '800', weeks: '2', hoursPerWeek: '40' }).fte, 10);
  assert.equal(fte({ method: 'cost-report-quarterly', sampleHours: '16000' }).fte, 100);
  assert.equal(fte({ method: 'cost-report-semiannual', sampleHours: '8000' }).fte, 100);
  assert.match(fte({ hours: '10' }).message, /^Choose/);
});

test('occupancy, ADC, ALOS and bed turnover; a mid-period bed change', () => {
  const r = beds({ beds: '100', days: '30', inpatientDays: '2400', discharges: '500' });
  assert.equal(r.occupancy, 80);
  assert.equal(r.adc, 80);
  assert.equal(r.alos, 4.8);
  const ch = beds({ bedPeriods: '40, 10\n50, 20', inpatientDays: '1200' });
  assert.equal(ch.bedDays, 1400);
  assert.equal(ch.occupancy, 85.7);
  assert.equal(beds({ beds: '10', days: '30', inpatientDays: '330' }).abnormal, true);
  assert.equal(beds({ beds: '0', days: '30', inpatientDays: '3' }).valid, false);
  assert.match(beds({ bedPeriods: '40', inpatientDays: '3' }).message, /Line 1/);
});

test('overtime and agency shares, premium', () => {
  const r = ot({ regular: '900', overtime: '100', agency: '250', regularRate: '40', overtimeRate: '60', agencyRate: '90' });
  assert.equal(r.overtimeShare, 10);
  assert.equal(r.agencyShare, 20);
  assert.equal(r.premium, 14500);
  assert.equal(ot({ regular: '0', overtime: '0', agency: '0' }).valid, false);
});

test('flexible budget variance, with and without a fixed portion', () => {
  const r = budget({ budgetVolume: '1000', actualVolume: '1100', budgetAmount: '9000', actualAmount: '10200', fixedAmount: '1000' });
  assert.equal(r.flexible, 9800);
  assert.equal(r.volumeVariance, 800);
  assert.equal(r.spendingVariance, 400);
  assert.equal(r.totalVariance, 1200);
  assert.match(r.band, /\+400 \(unfavorable\)/);
  const v = budget({ budgetVolume: '1000', actualVolume: '1100', budgetAmount: '9000', actualAmount: '9500' });
  assert.equal(v.flexible, 9900);
  assert.ok(v.notes.some((n) => /^Enter the fixed portion/.test(n)));
  assert.equal(budget({ budgetVolume: '0', actualVolume: '1', budgetAmount: '1', actualAmount: '1' }).valid, false);
});

test('case mix index from weights and counts', () => {
  assert.equal(cmi({ weights: '1.0\n2.0\n1.5, 2' }).cmi, 1.5);
  assert.equal(cmi({ weights: '1.0\n2.0\n1.5, 2' }).discharges, 4);
  assert.match(cmi({ weights: 'abc' }).message, /Line 1/);
  assert.equal(cmi({ weights: '' }).valid, false);
});

test('staffing grid: HPPD × census ÷ 24, rounded up', () => {
  const r = grid({ targetHppd: '8', shiftHours: '12', censusFrom: '20', censusTo: '24', step: '2', rnShare: '60' });
  assert.equal(r.rows.length, 3);
  assert.deepEqual(r.rows[0], { census: 20, hours: 80, staff: 6.7, staffRounded: 7, rn: 5 });
  assert.equal(grid({ targetHppd: '6', shiftHours: '8', censusFrom: '24', censusTo: '24' }).rows[0].staffRounded, 6);
  assert.equal(grid({ targetHppd: '0', shiftHours: '8', censusFrom: '1', censusTo: '2' }).valid, false);
  assert.equal(grid({ targetHppd: '6', shiftHours: '25', censusFrom: '1', censusTo: '2' }).valid, false);
});
