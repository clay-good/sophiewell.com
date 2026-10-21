// Regression tests for the defects an independent review found in the state-practice tools (spec-v1389 to v1399:
// California, New York, New Jersey, Texas) on 2026-10-20, each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { njCivilCommitmentClock } from '../../lib/nj-civil-commitment-clock-v1389.js';
import { minorSelfConsent } from '../../lib/minor-self-consent-v1395.js';
import { caloshaWildfireSmoke } from '../../lib/calosha-wildfire-smoke-v1398.js';
import { caNp103104Tracker } from '../../lib/ca-np-103-104-tracker-v1397.js';
import { nursingHomeStaffingCheck } from '../../lib/nursing-home-staffing-check-v1396.js';
import { reportableConditionUrgency } from '../../lib/reportable-condition-urgency-v1395.js';
import { caloshaOutdoorHeat } from '../../lib/calosha-outdoor-heat-v1398.js';
import { nurseLicenseTrainingRequirements } from '../../lib/nurse-license-training-requirements-v1397.js';
import { caEoloaTimeline } from '../../lib/ca-eoloa-timeline-v1392.js';
import { nyMaidTimeline } from '../../lib/ny-maid-timeline-v1392.js';
import { caApotCalculator } from '../../lib/ca-apot-calculator-v1399.js';
import { txWorkplaceViolencePlanAudit, ITEMS } from '../../lib/tx-workplace-violence-plan-audit-v1396.js';
import { parseDate } from '../../lib/state-calendar.js';

test('NJ voluntary discharge: "whichever is longer" compares the end of the working day with the 48 hours', () => {
  assert.match(njCivilCommitmentClock({ mode: 'voluntary', start: '2026-10-17T01:00' }).band, /by the end of Monday, October 19, 2026, the next working day/);
});

test('minor consent: an unassessed ground is named, not read as "no"', () => {
  const r = minorSelfConsent({ state: 'TX', service: 'general', age: '17' });
  assert.match(r.bandLabel, /unless a ground not assessed applies/);
  assert.match(minorSelfConsent({ state: 'CA', service: 'general', age: '16' }).band, /Family Code 6922/);
});

test('Cal/OSHA wildfire smoke: the 5141.1 Appendix A table converts the concentration (400 ug/m3 is under AQI 500)', () => {
  const r = caloshaWildfireSmoke({ conc: '400', hours: '3' });
  assert.equal(r.aqi, 420);
  assert.match(r.bandLabel, /voluntary/);
  assert.match(caloshaWildfireSmoke({ conc: '600', hours: '3' }).bandLabel, /required/);
});

test('dates: a two-digit year is not a date, and the order of documented steps is checked', () => {
  assert.equal(parseDate('0020-01-01'), null);
  assert.equal(caEoloaTimeline({ oral1: '2026-10-10T09:00', oral2: '2026-10-08T09:00' }).valid, false);
  assert.equal(nyMaidTimeline({ oral: '2026-10-10', written: '2026-10-10', attending: '2026-10-10', consulting: '2026-10-10', mentalHealth: '2026-10-10', witness1: 'ok', witness2: 'ok', prescribed: '2026-09-01T09:00' }).valid, false);
  assert.match(reportableConditionUrgency({ state: 'NY', nyCondition: 'ny-amebiasis', identified: '2026-10-31T12:00' }).band, /November 1, 2026, 11:00 am, 24 h/);
});

test('figures at a line are printed on the side they were judged, and parts cannot exceed their whole', () => {
  assert.match(nursingHomeStaffingCheck({ state: 'NY', census: '100', totalHours: '349.6', aideHours: '250', licensedHours: '120' }).band, /3\.496, under 3\.5/);
  assert.equal(nursingHomeStaffingCheck({ state: 'CA', distinctPart: 'no', census: '10', totalHours: '35', aideHours: '300' }).valid, false);
  assert.ok(JSON.stringify(caloshaOutdoorHeat({ tempF: '95', industry: 'construction', priorHighs: '85,85,85,85,85.2' })).includes('85.04F'));
  const rows = `${Array(1799).fill('10:00, 10:20').join('\n')}\n${Array(200).fill('10:00, 10:40').join('\n')}`;
  const a = caApotCalculator({ rows });
  assert.match(a.band, /1799 of 1999 \(89\.99/);
});

test('a completed course is scheduled, not due; the CA NP 104 years are asked for when only hours are given', () => {
  const r = nurseLicenseTrainingRequirements({ state: 'NY', license: 'RN', practicingNY: 'yes', abuseDate: '2025-10-01', infectionDate: '2025-01-01' });
  assert.equal(r.abnormal, false);
  assert.ok(JSON.stringify(caNp103104Tracker({ asOf: '2026-10-20', ttpHours: '12000' })).includes('For 104, enter the years'));
});

test('Texas workplace violence plan: a conditional member may be marked not required', () => {
  const all = Object.fromEntries(ITEMS.map(([k]) => [k, 'yes']));
  assert.equal(txWorkplaceViolencePlanAudit({ ...all, security: 'na', physician: 'na' }).bandLabel, 'Complete');
});
