// spec-v1638 tools 4, 5, 10, 14, 15: Part D and Part B pharmacy rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partdDailyCostShare } from '../../lib/partd-daily-cost-share-v1638.js';
import { partbSupplyDispensingFee } from '../../lib/partb-supply-dispensing-fee-v1638.js';
import { dmeposRefillWindow } from '../../lib/dmepos-refill-window-v1638.js';
import { ltcShortCycleCheck } from '../../lib/ltc-short-cycle-check-v1638.js';
import { partdPromptPayClock } from '../../lib/partd-prompt-pay-clock-v1638.js';

const share = (o) => partdDailyCostShare({ sharing: 'copayment', solidOral: 'yes', antibiotic: 'no', originalContainer: 'no', monthDays: 30, daysDispensed: 14, monthlyCopay: 47, ...o });

test('daily cost share: the rate is rounded to the cent before multiplying', () => {
  const r = share({});
  assert.deepEqual([r.dailyRate, r.costSharing, r.flag], [1.57, 21.98, 'daily-rate-applies']);
  assert.match(r.note, /would give \$21\.93/);
  // CMS's example: $30 a month gives $7 for 7 days.
  assert.equal(share({ monthlyCopay: 30, daysDispensed: 7 }).costSharing, 7);
});

test('daily cost share: coinsurance is applied unchanged; antibiotics and original containers are out', () => {
  const c = partdDailyCostShare({ sharing: 'percentage-of-price', solidOral: 'yes', antibiotic: 'no', originalContainer: 'no', monthDays: 30, daysDispensed: 7, coinsurancePercent: 25, priceDispensed: 80 });
  assert.equal(c.costSharing, 20);
  assert.equal(share({ antibiotic: 'yes' }).flag, 'outside-the-rule');
  assert.equal(share({ originalContainer: 'yes' }).inRule, false);
  assert.equal(share({ solidOral: 'no' }).inRule, false);
  assert.equal(share({ daysDispensed: 30 }).flag, 'not-a-short-fill');
  assert.match(share({ antibiotic: '' }).message, /^Choose yes or no: is it an antibiotic/);
  assert.match(share({ monthlyCopay: '' }).message, /^Enter the monthly copayment/);
});

test('Part B fees: $24 first, $16 after, $50 for the initial transplant prescription', () => {
  const f = (o) => partbSupplyDispensingFee({ category: 'oral-anticancer-drug', prescriptions: 3, first: 'first-prescription-in-30-days', ...o }).total;
  assert.equal(f({}), 24 + 16 + 16);
  assert.equal(f({ first: 'first-already-paid' }), 48);
  assert.equal(f({ category: 'immunosuppressive-drug', transplant: 'initial-after-transplant' }), 50 + 32);
  assert.equal(f({ category: 'immunosuppressive-drug', transplant: 'not-initial-after-transplant' }), 56);
  assert.match(partbSupplyDispensingFee({ category: 'immunosuppressive-drug', prescriptions: 1, first: 'first-prescription-in-30-days' }).message, /^Choose whether this is the initial immunosuppressive/);
});

test('Part B fees: inhalation drugs are $57, $33 and $66', () => {
  const f = (supply) => partbSupplyDispensingFee({ category: 'inhalation-drug-through-dme', supply }).total;
  assert.deepEqual([f('initial-30-day-supply'), f('later-30-day-supply'), f('ninety-day-supply')], [57, 33, 66]);
  assert.match(partbSupplyDispensingFee({ category: 'inhalation-drug-through-dme' }).message, /^Choose the supply/);
  assert.match(partbSupplyDispensingFee({}).message, /^Choose the drug category/);
});

test('DMEPOS refill: contact within 30 days and date of service within 10 days of the expected end', () => {
  const r = dmeposRefillWindow({ lastService: '2026-09-01', quantity: 90, dailyUse: 3, contacted: '2026-08-31', plannedService: '2026-09-20' });
  assert.deepEqual([r.expectedEnd, r.earliestContact, r.earliestService, r.contactInWindow, r.serviceInWindow], ['2026-10-01', '2026-09-01', '2026-09-21', false, false]);
  const ok = dmeposRefillWindow({ expectedEnd: '2026-10-01', contacted: '2026-09-01', plannedService: '2026-09-21' });
  assert.deepEqual([ok.contactInWindow, ok.serviceInWindow, ok.flag], [true, true, 'window']);
  assert.match(dmeposRefillWindow({}).message, /^Enter the date of the last delivery/);
  assert.match(dmeposRefillWindow({ lastService: '2026-09-01', quantity: 90 }).message, /^Enter the daily use/);
  // A vanishing daily use would put the end of supply past any calendar: refused, not printed as a date.
  assert.match(dmeposRefillWindow({ lastService: '2026-09-01', quantity: 90, dailyUse: 1e-12 }).message, /ten years or less/);
});

const cycle = (o) => ltcShortCycleCheck({ drug: 'brandname-product', facility: 'nursing-facility', solidOral: 'yes', antibiotic: 'no', originalContainer: 'no', ...o });

test('short cycle: a brand solid oral drug in a nursing facility, 14 days at a time', () => {
  assert.deepEqual([cycle({ daysToDispense: 14 }).flag, cycle({ daysToDispense: 14 }).complies], ['in-the-rule', true]);
  assert.equal(cycle({ daysToDispense: 15 }).flag, 'over-14-days');
  assert.equal(cycle({ totalDays: 30 }).dispensingEvents, 3);
});

test('short cycle: generics, non-solid forms, antibiotics, original containers and waived facilities are out', () => {
  for (const o of [{ drug: 'nonbrand-product' }, { solidOral: 'no' }, { antibiotic: 'yes' }, { originalContainer: 'yes' }, { facility: 'icf-iid' }, { facility: 'imd-facility' }, { facility: 'itu-pharmacy' }]) {
    assert.equal(cycle({ ...o, daysToDispense: 30 }).flag, 'outside-the-rule', JSON.stringify(o));
  }
  assert.match(cycle({ facility: 'icf-iid' }).note, /stays in force for the three waived/);
  assert.match(ltcShortCycleCheck({}).message, /^Choose brand or generic/);
  assert.match(cycle({ antibiotic: '' }).message, /^Choose yes or no: is it an antibiotic/);
});

const pay = (o) => partdPromptPayClock({ pharmacy: 'retail-network-pharmacy', claim: 'electronic-claim', sent: '2026-10-01', ...o });

test('prompt pay: 14 days electronic, 30 days from the 5th day after the postmark otherwise', () => {
  assert.deepEqual([pay({}).received, pay({}).paymentDue, pay({}).deficiencyNoticeBy], ['2026-10-01', '2026-10-15', '2026-10-11']);
  const paper = pay({ claim: 'paper-or-other-claim' });
  assert.deepEqual([paper.received, paper.paymentDue, paper.deficiencyNoticeBy], ['2026-10-06', '2026-11-05', '2026-10-21']);
});

test('prompt pay: late days and interest at the Treasury rate plus 0.1 point over 365', () => {
  const r = pay({ paid: '2026-10-25', amount: 10000, treasuryRatePercent: 4.4 });
  // 10 days late: 10,000 x 4.5% x 10 / 365 = 12.33.
  assert.deepEqual([r.daysLate, r.interest, r.flag], [10, 12.33, 'paid-late']);
  assert.equal(pay({ paid: '2026-10-15' }).daysLate, 0);
  assert.match(pay({ paid: '2026-10-25' }).note, /no rate is supplied here/);
});

test('prompt pay: a timely deficiency notice, and the pharmacy types the rule leaves out', () => {
  const r = pay({ deficiencyNotice: '2026-10-11', additionalInfo: '2026-10-20', paid: '2026-11-20' });
  assert.deepEqual([r.deemedClean, r.remainingDefectNoticeBy, r.daysLate, r.flag], [false, '2026-10-30', undefined, 'deficiency-notice-given']);
  assert.equal(pay({ deficiencyNotice: '2026-10-12' }).deemedClean, true);
  assert.equal(partdPromptPayClock({ pharmacy: 'mail-order-pharmacy' }).flag, 'rule-does-not-apply');
  assert.match(partdPromptPayClock({ pharmacy: 'ltc-pharmacy' }).note, /30 nor more than 90 days/);
  assert.match(partdPromptPayClock({}).message, /^Choose the pharmacy type/);
  assert.match(pay({ sent: '' }).message, /^Enter the date the claim was transferred/);
});
