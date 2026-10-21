// Regression tests for the defects an independent review found in the spec-v1634 (medication safety), v1637
// (controlled substances and supply chain) and v1638 (Part D and pharmacy operations) tools on 2026-10-20.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stoppStartV3 } from '../../lib/stopp-start-v3-v1634.js';
import { disproportionality2x2 } from '../../lib/disproportionality-2x2-v1634.js';
import { adeCostAvoidance } from '../../lib/ade-cost-avoidance-v1634.js';
import { fdaAdverseEventReportClock } from '../../lib/fda-adverse-event-report-clock-v1634.js';
import { icerDominance } from '../../lib/icer-dominance-v1634.js';
import { pedsHeparinNomogram } from '../../lib/peds-heparin-nomogram-v1634.js';
import { partdPromptPayClock } from '../../lib/partd-prompt-pay-clock-v1638.js';
import { otpTakeHomeLimit } from '../../lib/otp-take-home-limit-v1637.js';
import { gs1DrugBarcodeParser } from '../../lib/gs1-drug-barcode-parser-v1637.js';
import { ltcMrrTracker } from '../../lib/ltc-mrr-tracker-v1638.js';
import { mtmServiceClock } from '../../lib/mtm-service-clock-v1638.js';
import { pharmacyEffectiveRate } from '../../lib/pharmacy-effective-rate-v1638.js';

const now = new Date('2026-10-20T09:00:00Z');

test('START J1 applies at eGFR 30 ("unless ... eGFR < 30"), and a blank eGFR is said to be unchecked', () => {
  const at = (egfr) => stoppStartV3({ ageYears: 70, drugs: ['statin'], conditions: ['diabetes', 'ckd-proteinuria'], egfr }).start.map((x) => x.id);
  assert.ok(at(30).includes('START J1'));
  assert.ok(!at(29.9).includes('START J1'));
  const blank = stoppStartV3({ ageYears: 70, drugs: ['statin'], conditions: ['diabetes', 'ckd-proteinuria'] });
  assert.ok(blank.notes.some((n) => /START J1 \(unless eGFR below 30\)/.test(n)));
});

test('the ROR lower bound is printed on the side of 1 the EudraVigilance test decided', () => {
  assert.ok(disproportionality2x2({ a: 8, b: 1000, c: 77, d: 20000, ime: 'yes' }).notes.some((n) => /lower bound of the ROR interval is 1\.001, above 1/.test(n)));
  assert.ok(disproportionality2x2({ a: 7, b: 1000, c: 64, d: 20000, ime: 'yes' }).notes.some((n) => /is 0\.9999, not above 1/.test(n)));
});

test('impossible or ambiguous inputs are refused', () => {
  assert.equal(adeCostAvoidance({ interventions: 'high, $1,500' }).valid, false);
  assert.equal(fdaAdverseEventReportClock({ setting: 'nda', outcome: 'death', unexpected: 'yes', received: '2099-01-01' }, now).valid, false);
  assert.equal(partdPromptPayClock({ pharmacy: 'retail-network-pharmacy', claim: 'electronic-claim', sent: '2026-10-01', deficiencyNotice: '2026-09-20' }).valid, false);
  assert.equal(partdPromptPayClock({ pharmacy: 'retail-network-pharmacy', claim: 'electronic-claim', sent: '2026-10-01', paid: '2026-09-01' }).valid, false);
  assert.match(otpTakeHomeLimit({ medication: 'methadone', treatmentDay: '10', admitted: '2026-01-01', dispensedOn: '2026-10-20', proposedDays: '7' }).message, /disagree/);
  assert.equal(mtmServiceClock({ contractYear: '2026', asOf: '2026-10-20', enrollees: 'A,2026-03-01,no,,,,2026-02-01,70,no,yes' }).valid, false);
});

test('ICER: equal cost with more effect is dominance, not "costs more"', () => {
  const r = icerDominance({ options: 'A,100,1\nB,100,2' });
  assert.match(r.band, /B is dominant: it costs the same and does better than A/);
});

test('pediatric heparin: "<50" and ">120" take every value below and above them', () => {
  assert.notEqual(pedsHeparinNomogram({ weight: 10, aptt: 49.5, currentRate: 200 }).flag, 'between-rows');
  assert.notEqual(pedsHeparinNomogram({ weight: 10, aptt: 120.5, currentRate: 200 }).flag, 'between-rows');
  assert.equal(pedsHeparinNomogram({ weight: 10, aptt: 59.5, currentRate: 200 }).flag, 'between-rows');
});

test('GS1: a day-00 expiration is a problem, as the note says', () => {
  const r = gs1DrugBarcodeParser({ scan: '(01)00312345678906(17)270200(10)A1B2(21)12345' }, now);
  assert.equal(r.flag, 'problems-found');
  assert.ok(r.problems.some((p) => /day 00/.test(p)));
});

test('LTC MRR: future dates are not read, and a partial admission month is explained', () => {
  const r = ltcMrrTracker({ asOf: '2026-10-20', residents: 'Ann,2026-01-05,2026-12-01\nBob,2026-09-30,,2026-11-01,' });
  assert.equal(r.valid, false);
  assert.match(r.message, /Ann\): the review date is after the as-of date.*Bob\): the report date is after the as-of date/);
  assert.ok(ltcMrrTracker({ asOf: '2026-10-01', residents: 'Cy,2026-09-30' }).notes.some((n) => /began partway through it: Cy \(September 2026\)/.test(n)));
});

test('effective rate: paid above AWP reads "AWP + 20%", not "AWP - -20%"', () => {
  assert.match(pharmacyEffectiveRate({ awp: '100', ingredientPaid: '120' }).band, /AWP \+ 20%/);
});
