// spec-v1637 tools 10 and 12: the nonprescription sale limit and the methadone take-home ceiling.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { otpTakeHomeLimit } from '../../lib/otp-take-home-limit-v1637.js';
import { c5OtcSaleLimit } from '../../lib/c5-otc-sale-limit-v1637.js';

test('take-home ceiling: 7 days through day 14, 14 days from day 15, 28 days from day 31', () => {
  const c = (treatmentDay) => otpTakeHomeLimit({ medication: 'methadone', treatmentDay }).federalCeilingDays;
  assert.deepEqual([1, 14, 15, 30, 31, 400].map(c), [7, 7, 14, 14, 28, 28]);
});

test('take-home ceiling: the admission date is day 1, and the next step is dated', () => {
  const r = otpTakeHomeLimit({ medication: 'methadone', admitted: '2026-10-01', dispensedOn: '2026-10-14' });
  assert.deepEqual([r.treatmentDay, r.federalCeilingDays, r.nextStepOpens], [14, 7, '2026-10-15']);
  const s = otpTakeHomeLimit({ medication: 'methadone', admitted: '2026-10-01', dispensedOn: '2026-10-15' });
  assert.deepEqual([s.treatmentDay, s.federalCeilingDays, s.nextStepOpens], [15, 14, '2026-10-31']);
  assert.match(r.note, /the rule does not say which day is day 1/);
});

test('take-home ceiling: a proposed supply, a lower state ceiling, and the first-day dose', () => {
  assert.equal(otpTakeHomeLimit({ medication: 'methadone', treatmentDay: 10, proposedDays: 7 }).proposedFits, true);
  assert.equal(otpTakeHomeLimit({ medication: 'methadone', treatmentDay: 10, proposedDays: 8 }).flag, 'over-the-ceiling');
  const s = otpTakeHomeLimit({ medication: 'methadone', treatmentDay: 31, stateCeilingDays: 14, proposedDays: 20 });
  assert.deepEqual([s.federalCeilingDays, s.ceilingDays, s.proposedFits], [28, 14, false]);
  assert.equal(otpTakeHomeLimit({ medication: 'methadone', treatmentDay: 1, firstDayDose: 50 }).firstDayOver50, false);
  assert.equal(otpTakeHomeLimit({ medication: 'methadone', treatmentDay: 1, firstDayDose: 50.5 }).firstDayOver50, true);
});

test('take-home ceiling: buprenorphine has none, and nothing is defaulted', () => {
  const b = otpTakeHomeLimit({ medication: 'buprenorphine-product', treatmentDay: 3, proposedDays: 30 });
  assert.deepEqual([b.flag, b.federalCeilingDays], ['no-federal-ceiling', null]);
  assert.match(otpTakeHomeLimit({ treatmentDay: 3 }).message, /^Choose the medication/);
  assert.match(otpTakeHomeLimit({ medication: 'methadone' }).message, /^Enter the admission date/);
  assert.match(otpTakeHomeLimit({ medication: 'methadone', admitted: '2026-10-05', dispensedOn: '2026-10-01' }).message, /not before the admission date/);
  assert.match(otpTakeHomeLimit({ medication: 'methadone', treatmentDay: 2.5 }).message, /whole number/);
});

const sale = (over) => c5OtcSaleLimit({ stateRule: 'no-prescription-required', contents: 'no-opium', form: 'liquid-ml', requested: 60, age: 30, saleTime: '2026-10-12T14:00', ...over });

test('sale limit: the four limits of 1306.26(b)', () => {
  const lim = (contents, form) => sale({ contents, form, requested: 1 }).limit;
  assert.deepEqual([lim('contains-opium', 'liquid-ml'), lim('no-opium', 'liquid-ml'), lim('contains-opium', 'solid-dosage-units'), lim('no-opium', 'solid-dosage-units')], [240, 120, 48, 24]);
});

test('sale limit: earlier sales inside 48 hours count, including one exactly 48 hours before', () => {
  const r = sale({ requested: 120, earlierSales: '2026-10-11 09:30, 60\n2026-10-10 14:00, 30\n2026-10-09 10:00, 120' });
  assert.deepEqual([r.soldInWindow, r.remaining, r.flag, r.fitsAfter], [90, 30, 'over-the-limit', '2026-10-13T09:30']);
  assert.equal(sale({ requested: 30, earlierSales: '2026-10-11 09:30, 60\n2026-10-10 14:00, 30' }).flag, 'within-the-limit');
  // One minute past 48 hours is outside.
  assert.equal(sale({ earlierSales: '2026-10-10 13:59, 120' }).soldInWindow, 0);
  // A request over the whole limit never fits.
  assert.equal(sale({ requested: 121 }).fitsAfter, undefined);
  assert.equal(sale({ requested: 121 }).flag, 'over-the-limit');
});

test('sale limit: under 18, a state that requires a prescription, and refusals', () => {
  assert.equal(sale({ age: 17 }).flag, 'purchaser-under-18');
  assert.equal(sale({ age: 18 }).flag, 'within-the-limit');
  assert.equal(c5OtcSaleLimit({ stateRule: 'prescription-required' }).flag, 'section-does-not-apply');
  assert.match(c5OtcSaleLimit({}).message, /^Choose whether state or local law/);
  assert.match(sale({ contents: '' }).message, /^Choose whether the product contains opium/);
  assert.match(sale({ saleTime: '' }).message, /^Enter the date and time/);
  assert.match(sale({ earlierSales: 'yesterday, 30' }).message, /^Enter each earlier sale/);
  assert.match(sale({ requested: '' }).message, /^Enter the quantity requested/);
});
