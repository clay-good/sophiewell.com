// Regression tests for the defects two independent reviews found in the medication-access tools (spec-v1500 to
// v1517) on 2026-10-20, each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fplPercent } from '../../lib/income-screens-v1506.js';
import { premiumTaxCredit } from '../../lib/marketplace-credit-v1506.js';
import { siteOfCareCompare } from '../../lib/benefits-v1505.js';
import { maReconsiderationRequest, erisaAppealLetter } from '../../lib/request-letters-v1504.js';
import { partdAppealLadder } from '../../lib/partd-appeals-v1503.js';
import { quantityLimitCheck } from '../../lib/quantity-limit-check-v1502.js';
import { partdLatePenalty } from '../../lib/medicare-penalties-v1507.js';
import { qioDischargeAppealClock } from '../../lib/qio-discharge-appeal-v1503.js';
import { erisaClaimClock } from '../../lib/erisa-claim-clock-v1503.js';
import { acaExternalReviewClock } from '../../lib/aca-external-review-v1503.js';
import { cobraClock } from '../../lib/cobra-clock-v1507.js';
import { adherenceOutreachList } from '../../lib/pdc-star-v1513.js';
import { rateEscalation } from '../../lib/rate-escalation-v1512.js';
import { denialNextStep } from '../../lib/denial-next-step-v1516.js';
import { doseCalendar } from '../../lib/dose-calendar-v1512.js';
import { csRefillValidity } from '../../lib/cs-dispensing-v1511.js';
import { daysSupply } from '../../lib/days-supply-v1511.js';
import { compoundingBud } from '../../lib/compounding-bud-v1511.js';

const now = new Date('2026-10-20T09:00:00Z');

test('percents and amounts at a program line are decided unrounded and printed on that side', () => {
  assert.equal(fplPercent({ size: '1', income: '22030', region: 'us', program: 'current', period: 'annual', year: '2026', threshold: '138' }, now).bandLabel, '138.03%, above 138%');
  assert.match(premiumTaxCredit({ magi: '62600.5', size: '1', benchmark: '800', region: 'us', year: '2026' }).band, /^No premium tax credit .*400\.003%/);
  assert.match(premiumTaxCredit({ magi: '15649.5', size: '1', benchmark: '800', region: 'us', year: '2026' }).band, /below the 100% floor/);
  assert.ok(partdAppealLadder({ level: 'reconsideration', noticeDate: '2026-09-01', amount: '199.9996' }).notes.some((n) => /\$199\.9996 is below/.test(n)));
  assert.match(quantityLimitCheck({ unitsPerDose: '1.0001', dosesPerDay: '1', strength: '10', limitQty: '30', limitDays: '30' }).band, /^Exceeds the limit/);
});

test('impossible date orders and amounts are refused', () => {
  assert.equal(siteOfCareCompare({ perYear: '12', oopLeft: 'abc' }).valid, false);
  assert.equal(maReconsiderationRequest({ noticeDate: '2026-10-01', item: 'service', receivedDate: '2026-08-01', requestDate: '2026-10-05' }, now).valid, false);
  assert.equal(erisaAppealLetter({ denialReceived: '2027-03-01', claimKind: 'post' }, now).valid, false);
  assert.equal(partdLatePenalty({ gap1Start: '2025-01-01', gap1End: '2025-06-30', gap2Start: '2025-01-01', gap2End: '2025-06-30', year: '2026' }, now).valid, false);
  assert.equal(partdLatePenalty({ gap1Start: '2027-01-01', gap1End: '2027-12-31', year: '2026' }, now).valid, false);
  assert.equal(qioDischargeAppealClock({ setting: 'services', keyDate: '2026-10-10', requested: '2026-10-01T09:00' }).valid, false);
  assert.equal(erisaClaimClock({ claimType: 'pre-service', stage: 'claim', received: '2026-10-01', extended: 'yes', extensionNotice: '2026-09-01' }, now).valid, false);
  assert.equal(acaExternalReviewClock({ noticeReceived: '2026-10-30', requestReceived: '2026-10-23' }, now).valid, false);
  assert.equal(cobraClock({ event: 'employment', eventDate: '2026-06-01', noticeDate: '2026-01-01', employerAdministers: 'yes' }, now).valid, false);
  assert.equal(csRefillValidity({ schedule: 'III', issued: '2026-01-01', checkDate: '2026-02-01', authorized: '2', dispensed: '5' }).valid, false);
  assert.equal(doseCalendar({ startDate: '2026-01-05', everyWeeks: '8', loadWeek2: '2', loadWeek3: '6', actualDose: '3', actualDate: '2025-12-01' }).valid, false);
});

test('QIO: a notice after services ended reads as after, not "after before"', () => {
  const r = qioDischargeAppealClock({ setting: 'services', keyDate: '2026-10-10', servicesEnd: '2026-10-08' });
  assert.ok(r.notes.some((n) => /came 2 days after services were to end/.test(n)));
});

test('schedules: no silent truncation, no "60 min", and the actual dose 1 date is used', () => {
  assert.equal(rateEscalation({ unit: 'mg', total: '1000000', startRate: '0.01', increment: '0.01', interval: '1', maxRate: '100000' }).valid, false);
  assert.match(rateEscalation({ unit: 'mg', total: '99.5', startRate: '100', increment: '0', interval: '30', maxRate: '100' }).band, /1 h 00 min/);
  assert.match(doseCalendar({ startDate: '2026-01-05', everyWeeks: '8', loadWeek2: '2', loadWeek3: '6', actualDose: '1', actualDate: '2026-01-20' }).notes[0], /January 20, 2026/);
});

test('1 calendar year is the same date a year later', () => {
  assert.match(denialNextStep({ group: 'CO', carc: '16', payer: 'medicare', remitDate: '2027-07-01', serviceDate: '2027-06-01' }).band, /June 1, 2028/);
});

test('PDC outreach: a treatment period under 91 days cannot enter the measure, so it is not on the call list', () => {
  const r = adherenceOutreachList({ year: '2026', fills: 'A,D10,2026-12-01,30,atorvastatin' }, new Date('2026-12-05T09:00:00Z'));
  assert.doesNotMatch(r.band, /call first: A/);
});

test('whole days only, and the refrigeration the 14-day BUD assumes', () => {
  assert.equal(daysSupply({ form: 'insulin', unitsPerMl: '100', mlPerPen: '3', pens: '1', unitsPerDay: '5', injectionsPerDay: '1', primingUnits: '0', discardDays: '28.5' }).valid, false);
  assert.ok(compoundingBud({ prepType: 'nonsterile', form: 'aqueous-nonpreserved', compounded: '2026-10-20T10:00' }).notes.some((n) => /refrigerator \(2 to 8 °C\)/.test(n)));
});
