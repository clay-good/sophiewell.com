// spec-v1637 tools 2, 3, 5, 6, 7: DEA dates and counts, each from the eCFR text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deaRegistrationRenewal } from '../../lib/dea-registration-renewal-v1637.js';
import { csBiennialInventory } from '../../lib/cs-biennial-inventory-v1637.js';
import { dea222Validity } from '../../lib/dea-222-validity-v1637.js';
import { csTheftLossClock, FACTORS } from '../../lib/cs-theft-loss-clock-v1637.js';
import { csFivePercentRule } from '../../lib/cs-five-percent-rule-v1637.js';

const now = new Date(2026, 9, 12);

test('renewal: 60 days, the 45-day mark, the reinstatement month and the next 36-month expiration', () => {
  const r = deaRegistrationRenewal({ kind: 'pharmacy-hospital-practitioner', expires: '2027-03-31' }, now);
  assert.deepEqual([r.earliestApplication, r.fortyFiveDayMark, r.expires, r.reinstatementEnds, r.nextExpiration], ['2027-01-30', '2027-02-14', '2027-03-31', '2027-04-30', '2030-03-31']);
  // A February expiration: the reinstatement month is March, and the next cycle ends on a leap-year February 29.
  const f = deaRegistrationRenewal({ kind: 'pharmacy-hospital-practitioner', expires: '2025-02-28' }, now);
  assert.deepEqual([f.reinstatementEnds, f.nextExpiration], ['2025-03-31', '2028-02-29']);
});

test('renewal: 120 days for a bulk manufacturer or importer of Schedule I or II', () => {
  const r = deaRegistrationRenewal({ kind: 'bulk-manufacturer-or-importer', expires: '2027-03-31' }, now);
  assert.equal(r.earliestApplication, '2026-12-01');
  assert.equal(r.nextExpiration, undefined);
});

test('renewal: where a submitted application falls', () => {
  const s = (submitted) => deaRegistrationRenewal({ kind: 'pharmacy-hospital-practitioner', expires: '2027-03-31', submitted }, now).flag;
  assert.equal(s('2027-01-29'), 'submitted-too-early');
  assert.equal(s('2027-01-30'), 'automatic-extension');
  assert.equal(s('2027-02-14'), 'automatic-extension');
  assert.equal(s('2027-02-15'), 'inside-45-days');
  assert.equal(s('2027-03-31'), 'inside-45-days');
  assert.equal(s('2027-04-30'), 'reinstatement-month');
  assert.equal(s('2027-05-01'), 'new-application');
});

test('renewal: a date that is not a month end is flagged, and nothing is defaulted', () => {
  assert.match(deaRegistrationRenewal({ kind: 'pharmacy-hospital-practitioner', expires: '2027-03-15' }, now).note, /not the last day of a month/);
  assert.match(deaRegistrationRenewal({ expires: '2027-03-31' }, now).message, /^Choose the kind of registrant/);
  assert.match(deaRegistrationRenewal({ kind: 'pharmacy-hospital-practitioner' }, now).message, /^Enter the expiration date/);
  assert.equal(deaRegistrationRenewal({ kind: 'pharmacy-hospital-practitioner', expires: '2027-02-30' }, now).valid, false);
  assert.equal(deaRegistrationRenewal({ kind: 'pharmacy-hospital-practitioner', expires: '2027-03-31', registered: '2024-01-15' }, now).firstPeriodMonths, 38);
});

test('inventory: two years from the last one, or the state interval if earlier', () => {
  const r = csBiennialInventory({ lastInventory: '2025-05-01' }, now);
  assert.deepEqual([r.federalDue, r.due, r.keepUntil, r.daysLeft], ['2027-05-01', '2027-05-01', '2027-05-01', 201]);
  const s = csBiennialInventory({ lastInventory: '2025-05-01', stateIntervalMonths: 12 }, now);
  assert.deepEqual([s.due, s.flag], ['2026-05-01', 'past-due']);
  // February 29 plus two years is February 28.
  assert.equal(csBiennialInventory({ lastInventory: '2024-02-29' }, now).federalDue, '2026-02-28');
});

test('inventory: the count method for an opened container', () => {
  const m = (schedule, labeledCount) => csBiennialInventory({ lastInventory: '2025-05-01', container: 'opened-container', schedule, labeledCount }, now).countMethod;
  assert.equal(m('schedule-1-or-2', 100), 'exact');
  assert.equal(m('schedule-3-4-or-5', 1000), 'estimate');
  assert.equal(m('schedule-3-4-or-5', 1001), 'exact');
  assert.equal(m('schedule-3-4-or-5'), 'depends-on-container-size');
  assert.equal(m(''), undefined);
  assert.equal(csBiennialInventory({ lastInventory: '2025-05-01', container: 'sealed-container', schedule: 'schedule-1-or-2' }, now).countMethod, undefined);
  assert.match(csBiennialInventory({}, now).message, /^Enter the date of the last/);
  assert.match(csBiennialInventory({ lastInventory: '2025-05-01', stateIntervalMonths: 1.5 }, now).message, /whole number of months/);
});

test('Form 222: day 60 is valid, day 61 is not; a Defense Supply Center order has six months', () => {
  const r = dea222Validity({ kind: 'paper-form-222', purchaser: 'ordinary-purchaser', executed: '2026-09-01', shipments: '2026-09-10, 2026-10-31, 2026-11-01' }, now);
  assert.equal(r.lastValidShipment, '2026-10-31');
  assert.deepEqual(r.shipments.map((s) => s.state), ['in-time', 'in-time', 'after-the-order-expired']);
  assert.deepEqual([r.flag, r.copyDeadlineIfExpired, r.daysLeft], ['shipment-outside-validity', '2026-10-31', 19]);
  const d = dea222Validity({ kind: 'electronic-csos-order', purchaser: 'defense-supply-center', executed: '2026-08-31' }, now);
  assert.equal(d.lastValidShipment, '2027-02-28');
  assert.match(d.note, /1305\.22\(h\)/);
  assert.equal(d.copyDeadlineIfExpired, undefined);
  assert.match(dea222Validity({ kind: 'paper-form-222', executed: '2026-09-01' }, now).message, /^Choose the purchaser/);
  assert.match(dea222Validity({ kind: 'paper-form-222', purchaser: 'ordinary-purchaser', executed: '2026-09-01', shipments: 'soon' }, now).message, /^Enter each shipment date/);
});

test('theft or loss: one business day skips the weekend and the federal holiday; Form 106 is 45 calendar days', () => {
  // Discovered Friday October 9, 2026; Monday October 12 is Columbus Day.
  const r = csTheftLossClock({ registrant: 'practitioner-or-pharmacy', discovered: '2026-10-09' }, now);
  assert.deepEqual([r.noticeDue, r.form106Due], ['2026-10-13', '2026-11-23']);
  assert.match(r.note, /Read most strictly, the day after discovery is Saturday, October 10, 2026/);
  // A plain weekday: the next day.
  assert.equal(csTheftLossClock({ registrant: 'non-practitioner-registrant', discovered: '2026-10-06' }, now).noticeDue, '2026-10-07');
  // A day the reader says the business is closed is skipped too.
  assert.equal(csTheftLossClock({ registrant: 'practitioner-or-pharmacy', discovered: '2026-10-06', closedDays: '2026-10-07' }, now).noticeDue, '2026-10-08');
  assert.equal(FACTORS.length, 6);
  assert.match(csTheftLossClock({ discovered: '2026-10-06' }, now).message, /^Choose the registrant/);
  assert.match(csTheftLossClock({ registrant: 'practitioner-or-pharmacy' }, now).message, /^Enter the date the theft or loss was discovered/);
});

test('five percent rule: the denominator is distributed plus dispensed, and the comparison is exact', () => {
  const at = csFivePercentRule({ dispensed: 95000, distributed: 5000 });
  assert.deepEqual([at.sharePercent, at.flag, at.headroomUnits], [5, 'within-five-percent', 0]);
  const over = csFivePercentRule({ dispensed: 95000, distributed: 5001 });
  assert.equal(over.flag, 'over-five-percent');
  assert.match(over.band, /^just over 5%/);
  // Dividing by dispensed alone would give 5.26%.
  assert.equal(csFivePercentRule({ dispensed: 95000, distributed: 5000 }).sharePercent, 5);
});

test('five percent rule: headroom, a planned transfer, and the long-term care exclusion', () => {
  const r = csFivePercentRule({ dispensed: 100000, distributed: 4000 });
  assert.equal(r.headroomUnits, 1263);
  assert.equal(csFivePercentRule({ dispensed: 100000, distributed: 4000, planned: 1263 }).plannedFits, true);
  assert.equal(csFivePercentRule({ dispensed: 100000, distributed: 4000, planned: 1264 }).flag, 'planned-transfer-goes-over');
  const a = csFivePercentRule({ dispensed: 100000, distributed: 4000, ltcAds: 1000 });
  assert.deepEqual([a.countedDistributed, a.sharePercent, a.sharePercentWithoutAdsInTotal], [3000, 2.88, 2.91]);
  assert.match(csFivePercentRule({ dispensed: 100, distributed: 10, ltcAds: 11 }).message, /no more than the total distributed/);
  assert.match(csFivePercentRule({}).message, /^Enter the dosage units dispensed/);
  assert.match(csFivePercentRule({ dispensed: 0, distributed: 0 }).message, /^Enter the dosage units/);
});
