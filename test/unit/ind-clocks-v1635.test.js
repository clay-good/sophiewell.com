// spec-v1635 tools 19 to 22: IND deadlines (21 CFR 312.30, 312.32, 312.33, 312.40, 312.57, 312.62,
// 312.64, 312.310 and 56.104).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indSafetyReportClock as safety } from '../../lib/ind-safety-report-clock-v1635.js';
import { emergencyIndClock as emergency } from '../../lib/emergency-ind-clock-v1635.js';
import { indAnnualReportDue as annual } from '../../lib/ind-annual-report-due-v1635.js';
import { trialRecordRetention as retain } from '../../lib/trial-record-retention-v1635.js';

const now = new Date(2026, 9, 11, 12);

test('IND safety report: 15 calendar days from the determination', () => {
  const r = safety({ role: 'sponsor', fatalOrLifeThreatening: 'no', determined: '2026-10-05' }, now);
  assert.deepEqual(r.dates, [{ report: 'IND safety report', due: '2026-10-20', paragraph: '312.32(c)(1)' }]);
  assert.match(r.band, /9 days from today/);
  // Calendar days: October 17, 2026 is a Saturday and stays the date.
  assert.equal(safety({ role: 'sponsor', fatalOrLifeThreatening: 'no', determined: '2026-10-02' }, now).dates[0].due, '2026-10-17');
});

test('IND safety report: a fatal or life-threatening reaction adds 7 days from first receipt', () => {
  const r = safety({ role: 'sponsor', fatalOrLifeThreatening: 'yes', determined: '2026-10-05', received: '2026-10-01', fdaRequest: '2026-10-20' }, now);
  assert.deepEqual(r.dates.map((x) => [x.paragraph, x.due]), [['312.32(c)(2)', '2026-10-08'], ['312.32(c)(1)', '2026-10-20'], ['312.32(c)(1)(v)', '2026-11-04']]);
  assert.equal(r.abnormal, true); // the 7-day date has passed
  assert.match(safety({ role: 'sponsor', fatalOrLifeThreatening: 'yes', determined: '2026-10-05' }, now).message, /^Enter the date the sponsor first received/);
  assert.match(safety({ role: 'sponsor', fatalOrLifeThreatening: 'yes', determined: '2026-10-05', received: '2026-10-06' }, now).message, /received after/);
});

test('IND safety report: an investigator reports immediately, and no date is counted', () => {
  const r = safety({ role: 'investigator' }, now);
  assert.equal(r.bandLabel, 'Immediately');
  assert.equal(r.dates, undefined);
  assert.match(r.band, /312\.64\(b\)/);
  assert.match(safety({}, now).message, /^Choose who is reporting/);
  assert.match(safety({ role: 'sponsor' }, now).message, /^Choose whether/);
  assert.match(safety({ role: 'sponsor', fatalOrLifeThreatening: 'no', determined: '2026-02-30' }, now).message, /^Enter the date the sponsor determined/);
  assert.equal(safety(null, now).valid, false);
});

test('emergency use: 15 working days to FDA and 5 to the IRB, skipping weekends and federal holidays', () => {
  const r = emergency({ authorized: '2026-11-20', used: '2026-11-23' });
  // November 26, 2026 is Thanksgiving.
  assert.deepEqual(r.dates.map((x) => [x.paragraph, x.due]), [['21 CFR 312.310(d)(2)', '2026-12-14'], ['21 CFR 56.104(c)', '2026-12-01']]);
  // Across Christmas: December 22 plus 5 working days.
  assert.equal(emergency({ used: '2026-12-22' }).dates[0].due, '2026-12-30');
  // A plain week: Monday plus 5 working days is the next Monday.
  assert.equal(emergency({ used: '2026-10-05' }).dates[0].due, '2026-10-13'); // October 12, 2026 is Columbus Day
  assert.match(emergency({ used: '2026-10-05' }).notes.join(' '), /written summary/);
  assert.match(emergency({}).message, /^Enter the date FDA authorized/);
  assert.match(emergency({ used: 'soon' }).message, /^Enter the date of the emergency use/);
  assert.equal(emergency(null).valid, false);
});

test('IND effective date, annual reports and the new-investigator notice', () => {
  const r = annual({ received: '2025-03-01' }, now);
  assert.equal(r.effective, '2025-03-31');
  assert.deepEqual(r.annualReports, [{ year: 2, anniversary: '2027-03-31', due: '2027-05-30' }, { year: 3, anniversary: '2028-03-31', due: '2028-05-30' }, { year: 4, anniversary: '2029-03-31', due: '2029-05-30' }]);
  const e = annual({ received: '2025-03-01', mayBegin: '2025-03-15', investigatorAdded: '2026-10-01' }, now);
  assert.deepEqual([e.effective, e.investigatorNoticeDue], ['2025-03-15', '2026-10-31']);
  assert.equal(annual({ investigatorAdded: '2026-10-01' }, now).investigatorNoticeDue, '2026-10-31');
  // A first report whose 60-day date has not passed is still listed.
  assert.equal(annual({ received: '2025-08-01' }, now).annualReports[0].year, 1);
  assert.match(annual({ received: '2025-03-01', mayBegin: '2025-05-01' }, now).message, /later than 30 days/);
  assert.match(annual({ received: '2025-03-01', mayBegin: '2025-02-01' }, now).message, /before the date it received/);
  assert.match(annual({}, now).message, /^Enter the date FDA received/);
  assert.equal(annual(null, now).valid, false);
});

test('record retention: 2 years, by role and event, and a later requirement governs', () => {
  const i = retain({ role: 'investigator', event: 'discontinued', date: '2026-02-28' });
  assert.deepEqual([i.federalMinimum, i.retainUntil], ['2028-02-28', '2028-02-28']);
  assert.match(i.notes[0], /312\.62\(c\)/);
  const s = retain({ role: 'sponsor', event: 'approved', date: '2024-02-29', longerUntil: '2040-01-01' });
  assert.deepEqual([s.federalMinimum, s.retainUntil], ['2026-02-28', '2040-01-01']);
  assert.match(s.notes[0], /312\.57\(c\)/);
  assert.equal(retain({ role: 'sponsor', event: 'approved', date: '2024-03-01', longerUntil: '2025-01-01' }).retainUntil, '2026-03-01');
  assert.match(retain({ role: 'sponsor', event: 'discontinued', date: '2024-03-01' }).notes[0], /shipment and delivery/);
  assert.match(retain({}).message, /^Choose the role/);
  assert.match(retain({ role: 'sponsor' }).message, /^Choose what started the clock/);
  assert.match(retain({ role: 'sponsor', event: 'approved' }).message, /^Enter the date/);
  assert.equal(retain(null).valid, false);
});
