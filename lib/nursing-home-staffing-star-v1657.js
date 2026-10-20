// spec-v1657 tool 4: nursing home staffing rating points and star, CMS cut points.
//
// Source: CMS, Design for Care Compare, Nursing Home Five-Star Quality Rating System: Technical Users'
// Guide, September 2026, read October 19, 2026 (PDF sha256 5b071101...a41239c):
//   "Scoring Rules for the Staffing Measures": points by decile for five measures; administrator
//     turnover 30 / 25 / 10 for 0 / 1 / 2 or more departures. Turnover measures with missing or
//     erroneous submitted data get the lowest score (5, 5, 10), except exclusions for fewer than five
//     eligible nurses or no eligible administrator.
//   "Rating Methodology": maximum 380; a home missing a turnover measure is rescaled, "Total staffing
//     points for available measures X (380/maximum possible points based on available measures)";
//     rescaling does not apply to a measure given the lowest score.
//   Table 3: 1 star < 155; 2 stars 155-204; 3 stars 205-254; 4 stars 255-319; 5 stars 320-380; "The
//     rescaled score is rounded to the nearest integer."
//   Appendix Table A2 (cut points set in July 2024, on data through 2024 Q1): transcribed below.
//   "Scoring Exceptions": one star for no staffing data by the deadline, for four or more days with
//     residents and no RN hours, or for a failed or unanswered audit.
// Cut points change by edition; the edition is printed on every result.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const EDITION = 'September 2026';

// [points, minimum] from Appendix Table A2; higher is better for staffing.
const RN = [[100, 1.202], [90, 0.934], [80, 0.786], [70, 0.678], [60, 0.591], [50, 0.513], [40, 0.440], [30, 0.368], [20, 0.275], [10, 0]];
const TOTAL = [[100, 5.070], [90, 4.499], [80, 4.151], [70, 3.910], [60, 3.692], [50, 3.493], [40, 3.293], [30, 3.051], [20, 2.722], [10, 0]];
const WEEKEND = [[50, 4.464], [45, 3.958], [40, 3.668], [35, 3.429], [30, 3.233], [25, 3.044], [20, 2.862], [15, 2.637], [10, 2.354], [5, 0]];
// [points, maximum] for turnover; lower is better.
const RN_TO = [[50, 20.000], [45, 28.571], [40, 35.714], [35, 41.667], [30, 44.444], [25, 52.941], [20, 60.000], [15, 66.667], [10, 80.000], [5, 100]];
const TOTAL_TO = [[50, 31.126], [45, 37.500], [40, 41.739], [35, 45.679], [30, 49.254], [25, 53.425], [20, 57.692], [15, 62.791], [10, 69.792], [5, 100]];

export const STATUS = [
  { value: 'not-reported', text: 'Not reported (fewer than five eligible nurses, or no eligible administrator): rescale' },
  { value: 'lowest', text: 'Missing or erroneous submitted data: lowest points' },
];
export const EXCEPTIONS = [
  { value: 'none', text: 'None' },
  { value: 'no-data', text: 'No staffing data submitted by the deadline' },
  { value: 'no-rn-days', text: 'Four or more days with residents and no RN hours' },
  { value: 'audit', text: 'Failed or unanswered PBJ audit' },
];

const r3 = (n) => Math.round(n * 1000) / 1000;
// Lower-case the first letter for use mid-sentence, leaving acronyms (RN, PBJ) and the rest as written.
const lc = (t) => (/^[A-Z]{2}/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
export const levelPoints = (table, v) => table.find(([, min]) => r3(v) >= min)[0];
export const turnoverPoints = (table, v) => table.find(([, max]) => r3(v) <= max)[0];

export function starFor(score) {
  if (score < 155) return 1;
  if (score <= 204) return 2;
  if (score <= 254) return 3;
  if (score <= 319) return 4;
  return 5;
}

export function nursingHomeStaffingStar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const exc = EXCEPTIONS.find((e) => e.value === o.exception);
  if (exc && exc.value !== 'none') {
    return {
      valid: true, star: 1, score: null, abnormal: true,
      band: `1 star: ${lc(exc.text)} is a scoring exception that gives a one-star staffing rating, whatever the points.`,
      bandLabel: '1 star', notes: [], note: `CMS Five-Star Technical Users' Guide, ${EDITION}, "Scoring Exceptions".`,
    };
  }
  const f = inputFault([
    ['the adjusted RN hours per resident day', o.rnHours, 0, 24, ''],
    ['the adjusted total nurse hours per resident day', o.totalHours, 0, 24, ''],
    ['the adjusted weekend total nurse hours per resident day', o.weekendHours, 0, 24, ''],
  ]);
  if (f) return { valid: false, message: f };

  const rows = [
    ['Adjusted RN hours', levelPoints(RN, Number(o.rnHours)), 100],
    ['Adjusted total nurse hours', levelPoints(TOTAL, Number(o.totalHours)), 100],
    ['Adjusted weekend total nurse hours', levelPoints(WEEKEND, Number(o.weekendHours)), 50],
  ];
  const turnover = [
    ['RN turnover', o.rnTurnover, o.rnTurnoverStatus, (v) => turnoverPoints(RN_TO, v), 50, 5, 100],
    ['Total nurse turnover', o.totalTurnover, o.totalTurnoverStatus, (v) => turnoverPoints(TOTAL_TO, v), 50, 5, 100],
    ['Administrator departures', o.adminDepartures, o.adminStatus, (v) => (v === 0 ? 30 : v === 1 ? 25 : 10), 30, 10, 50],
  ];
  const missing = [];
  for (const [name, raw, status, pts, max, lowest, hi] of turnover) {
    if (!blank(raw)) {
      const g = inputFault([[`the ${lc(name)}`, raw, 0, hi, name === 'Administrator departures' ? '' : 'percent']]);
      if (g) return { valid: false, message: g };
      if (name === 'Administrator departures' && !Number.isInteger(Number(raw))) return { valid: false, message: 'Enter the administrator departures as a whole number.' };
      rows.push([name, pts(Number(raw)), max]);
    } else if (status === 'lowest') {
      rows.push([`${name} (missing or erroneous data)`, lowest, max]);
    } else if (status === 'not-reported') {
      missing.push([name, max]);
    } else {
      return { valid: false, message: `Enter the ${lc(name)}, or choose why it is missing.` };
    }
  }
  const total = rows.reduce((s, [, p]) => s + p, 0);
  const maxAvail = 380 - missing.reduce((s, [, m]) => s + m, 0);
  const score = missing.length ? Math.round(total * (380 / maxAvail)) : total;
  const star = starFor(score);
  const notes = rows.map(([n, p, m]) => `${n}: ${p} of ${m} points.`);
  if (missing.length) notes.push(`Rescaled for ${missing.map(([n]) => lc(n)).join(' and ')}: ${total} × 380 ÷ ${maxAvail} = ${score}, rounded to the nearest integer.`);
  notes.push('Hours and turnover are read at three decimals, as Table A2 is written.');
  return {
    valid: true, star, score, rawPoints: total, abnormal: star <= 2,
    band: `${star} star${star > 1 ? 's' : ''}: ${score} of 380 points${missing.length ? ' after rescaling' : ''} (Table 3: 155, 205, 255 and 320 start 2 to 5 stars).`,
    bandLabel: `${star} star${star > 1 ? 's' : ''} (${score} points)`,
    notes,
    note: `Cut points from Appendix Table A2 of the Five-Star Technical Users' Guide, ${EDITION}; CMS revises them by edition. This applies the published cut points to the numbers entered; CMS's own census and case-mix hours may differ from them.`,
  };
}
