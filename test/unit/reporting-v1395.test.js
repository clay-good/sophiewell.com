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
  const r16 = offer({ ...O, age: '16' });
  assert.equal(r16.hivRequired, true);
  assert.equal(r16.hcvRequired, false);
  assert.equal(offer({ ...O, age: '12' }).hivRequired, false);
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
