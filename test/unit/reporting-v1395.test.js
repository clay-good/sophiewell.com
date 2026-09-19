// spec-v1395: the mandated-report router and New York's HIV / hepatitis C test offers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mandatedReportRouter as mr, MR_STATES } from '../../lib/mandated-report-router-v1395.js';
import { nyHivHcvTestOffer as offer } from '../../lib/ny-hiv-hcv-test-offer-v1395.js';

const T = '2026-09-18T15:00';

test('mr: Texas child abuse is 24 hours now, and not delegable', () => {
  const r = mr({ state: 'TX', victim: 'child', suspected: T });
  assert.match(r.band, /Saturday, September 19, 2026, 3:00 pm, 24 h/);
  assert.match(r.band, /not delegate/);
  assert.match(r.note, /48th hour to the 24th/);
});

test('mr: New York 48-hour written reports; California 36 hours', () => {
  assert.match(mr({ state: 'NY', victim: 'child', suspected: T }).band, /48 h after the suspicion/);
  assert.match(mr({ state: 'NY', victim: 'ltc', suspected: T }).band, /Department of Health/);
  assert.match(mr({ state: 'CA', victim: 'child', suspected: T }).band, /36 h after the suspicion/);
});

test('mr: California long-term care -- two hours unless a dementia resident and no serious injury', () => {
  const two = mr({ state: 'CA', victim: 'ltc', suspected: T, dementiaResident: 'no', seriousInjury: 'no' });
  assert.match(two.band, /Verbal report to local law enforcement by Friday, September 18, 2026, 5:00 pm, 2 h/);
  const dem = mr({ state: 'CA', victim: 'ltc', suspected: T, dementiaResident: 'yes', seriousInjury: 'no' });
  assert.doesNotMatch(dem.band, /2 h after/);
  assert.match(mr({ state: 'CA', victim: 'ltc', suspected: T, dementiaResident: 'yes', seriousInjury: 'yes' }).band, /2 h after/);
  assert.equal(mr({ state: 'CA', victim: 'ltc', suspected: T }).valid, false);
});

test('mr: California two working days skip the weekend', () => {
  assert.match(mr({ state: 'CA', victim: 'injury', suspected: T }).band, /end of Tuesday, September 22, 2026/);
});

test('mr: New Jersey sets no vulnerable-adult deadline; the injury duty is California only', () => {
  assert.match(mr({ state: 'NJ', victim: 'adult', suspected: T }).band, /no time limit/);
  assert.equal(mr({ state: 'NJ', victim: 'injury', suspected: T }).applies, false);
  assert.equal(mr({ state: 'NJ', victim: 'ltc', suspected: T }).bandLabel, 'Not included yet');
});

test('mr: no state or no time prints no deadline', () => {
  assert.deepEqual(MR_STATES.map((s) => s.value), ['NY', 'NJ', 'CA', 'TX']);
  assert.equal(mr({ victim: 'child', suspected: T }).valid, false);
  assert.equal(mr({ state: 'TX', victim: 'child' }).valid, false);
});

const O = { setting: 'ed', emergency: 'no', capacity: 'yes', priorHiv: 'no', priorHcv: 'no' };

test('offer: HIV from 13, hepatitis C from 18, younger with risk', () => {
  const r16 = offer({ ...O, age: '16', risk: 'no' });
  assert.equal(r16.hivRequired, true);
  assert.equal(r16.hcvRequired, false);
  assert.equal(offer({ ...O, age: '12', risk: 'no' }).hivRequired, false);
  assert.equal(offer({ ...O, age: '12' }).valid, false);
  assert.equal(offer({ ...O, age: '12', risk: 'yes' }).hivRequired, true);
  assert.equal(offer({ ...O, age: '40' }).hcvRequired, true);
});

test('offer: the three exceptions, and an unanswered exception is refused', () => {
  assert.equal(offer({ ...O, age: '40', emergency: 'yes' }).hivRequired, false);
  assert.equal(offer({ ...O, age: '40', capacity: 'no' }).hcvRequired, false);
  assert.equal(offer({ ...O, age: '40', priorHiv: 'yes' }).hivRequired, false);
  assert.equal(offer({ ...O, age: '40', capacity: '' }).valid, false);
  assert.equal(offer({ ...O, age: '40', setting: 'other' }).hivRequired, false);
});

// --- California adverse events, Texas forensic exams, minor self-consent ------
import { caAdverseEvent1279 as ae, AE_EVENTS } from '../../lib/ca-adverse-event-1279-v1395.js';
import { txSaForensicExamWindow as sa } from '../../lib/tx-sa-forensic-exam-window-v1395.js';
import { minorSelfConsent as msc } from '../../lib/minor-self-consent-v1395.js';

test('ae: 28 reportable events plus "none"; five days, or 24 hours for an ongoing threat', () => {
  assert.equal(AE_EVENTS.filter((e) => e.value !== 'none').length, 28);
  assert.equal(ae({ event: 'c-pressure-injury', urgent: 'no', detected: '2026-09-18T08:00' }).dueAt, '2026-09-23T08:00');
  assert.equal(ae({ event: 'e-wrong-gas', urgent: 'yes', detected: '2026-09-18T08:00' }).dueAt, '2026-09-19T08:00');
  assert.equal(ae({ event: 'none' }).reportable, false);
  assert.equal(ae({ event: 'c-pressure-injury', detected: '2026-09-18T08:00' }).valid, false);
});

test('ae: a fall is listed only for death; serious disability goes through the catch-all', () => {
  assert.match(ae({ event: 'e-fall-death', urgent: 'no', detected: '2026-09-18T08:00' }).fallNote, /catch-all/);
  assert.equal(ae({ event: 'catch-all', urgent: 'no', detected: '2026-09-18T08:00' }).ref, '(b)(7)');
});

test('sa: minors any time; adults within 120 hours or on referral', () => {
  assert.equal(sa({ age: '14', safeReady: 'yes' }).eligible, true);
  assert.equal(sa({ age: '25', hours: '120', safeReady: 'yes' }).eligible, true);
  assert.equal(sa({ age: '25', hours: '121', safeReady: 'yes' }).eligible, false);
  assert.equal(sa({ age: '25', hours: '200', referral: 'law-enforcement', safeReady: 'yes' }).eligible, true);
  assert.match(sa({ age: '25', hours: '10', safeReady: 'no' }).duties, /not SAFE-ready/);
  assert.equal(sa({ age: '25', safeReady: 'yes' }).valid, false);
});

test('msc: California and Texas differ on contraception and abortion', () => {
  assert.equal(msc({ state: 'CA', age: '14', service: 'contraception' }).mayConsent, true);
  assert.equal(msc({ state: 'TX', age: '14', service: 'contraception' }).mayConsent, false);
  assert.equal(msc({ state: 'TX', age: '15', service: 'pregnancy' }).mayConsent, true);
  assert.equal(msc({ state: 'TX', age: '15', service: 'abortion' }).mayConsent, false);
});

test('msc: California age cuts and the maturity question', () => {
  assert.equal(msc({ state: 'CA', age: '11', service: 'sti' }).mayConsent, false);
  assert.equal(msc({ state: 'CA', age: '12', service: 'sti' }).mayConsent, true);
  assert.equal(msc({ state: 'CA', age: '13', service: 'mental-health' }).valid, false);
  assert.equal(msc({ state: 'CA', age: '13', service: 'mental-health', mature: 'yes' }).mayConsent, true);
  assert.equal(msc({ state: 'CA', age: '15', service: 'moud-otp' }).mayConsent, false);
  assert.equal(msc({ state: 'CA', age: '16', service: 'moud-otp' }).mayConsent, true);
});

test('msc: Texas sexual assault names the routes and does not decide; adults and other states refused', () => {
  const r = msc({ state: 'TX', age: '15', service: 'sexual-assault' });
  assert.match(r.band, /reasonable grounds to believe/);
  assert.equal(r.mayConsent, 'conditional');
  assert.match(msc({ state: 'TX', age: '16', service: 'sexual-assault' }).band, /16 or older who refuses/);
  assert.equal(msc({ state: 'FL', age: '15', service: 'sti' }).valid, false);
  assert.equal(msc({ state: 'CA', age: '18', service: 'sti' }).valid, false);
});

// spec-v1395: New York and New Jersey minor consent; what no statute read settles stays unanswered.
test('minor consent: NY -- STI under 21 alone; mental health only on documented grounds; abortion unanswered', () => {
  const sti = msc({ state: 'NY', age: '15', service: 'sti' });
  assert.equal(sti.mayConsent, true);
  assert.match(sti.band, /under 21/);
  const mh = msc({ state: 'NY', age: '15', service: 'mental-health' });
  assert.equal(mh.mayConsent, 'conditional');
  assert.match(mh.bandLabel, /33\.21\(c\)/);
  assert.equal(msc({ state: 'NY', age: '15', service: 'abortion' }).bandLabel, 'Not settled by the sections read here');
  assert.match(sti.stateNote, /2504\(1\)/);
});

test('minor consent: NJ -- behavioral health at 16, not 15; sexual assault with parent notice; HIV at 13', () => {
  assert.equal(msc({ state: 'NJ', age: '16', service: 'mental-health' }).mayConsent, true);
  assert.match(msc({ state: 'NJ', age: '16', service: 'mental-health' }).band, /confidential/);
  assert.equal(msc({ state: 'NJ', age: '15', service: 'mental-health' }).mayConsent, false);
  assert.match(msc({ state: 'NJ', age: '14', service: 'sexual-assault' }).band, /best interests/);
  assert.match(msc({ state: 'NJ', age: '12', service: 'sti' }).band, /which this minor is not/);
  assert.equal(msc({ state: 'NJ', age: '15', service: 'contraception' }).mayConsent, null);
});
