// spec-v1634 tool 5: FDA postmarketing adverse event report deadlines (21 CFR 314.80, 600.80, 310.305).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fdaAdverseEventReportClock as d } from '../../lib/fda-adverse-event-report-clock-v1634.js';

const now = new Date(2026, 9, 11, 12);
const run = (i) => d(i, now);

test('serious and unexpected: 15 calendar days from first receipt, in every setting', () => {
  for (const setting of ['nda', 'biologic', 'unapproved']) {
    const r = run({ setting, outcome: 'hospitalization', unexpected: 'yes', received: '2026-10-01' });
    assert.deepEqual([r.report, r.due], ['15-day Alert report', '2026-10-16']);
  }
  // Calendar days: no weekend extension (October 17, 2026 is a Saturday).
  assert.equal(run({ setting: 'nda', outcome: 'death', unexpected: 'yes', received: '2026-10-02' }).due, '2026-10-17');
  // Across a month end and a leap day.
  assert.equal(run({ setting: 'nda', outcome: 'death', unexpected: 'yes', received: '2028-02-20' }).due, '2028-03-06');
  assert.match(run({ setting: 'nda', outcome: 'death', unexpected: 'yes', received: '2026-10-01' }).band, /5 days from today/);
  assert.equal(run({ setting: 'nda', outcome: 'death', unexpected: 'yes', received: '2026-09-01' }).abnormal, true);
});

test('each seriousness outcome counts; "none" does not', () => {
  for (const outcome of ['death', 'life-threatening', 'hospitalization', 'disability', 'congenital-anomaly', 'important-medical-event']) {
    assert.equal(run({ setting: 'nda', outcome, unexpected: 'yes', received: '2026-10-01' }).flag, 'alert-15-day');
  }
  assert.equal(run({ setting: 'nda', outcome: 'not-serious', received: '2026-10-01' }).flag, 'periodic');
  assert.equal(run({ setting: 'nda', outcome: 'death', unexpected: 'no', received: '2026-10-01' }).flag, 'periodic');
});

test('a study event with no reasonable possibility is not a 15-day Alert', () => {
  assert.equal(run({ setting: 'nda', outcome: 'death', unexpected: 'yes', source: 'study-not', received: '2026-10-01' }).flag, 'periodic');
  assert.equal(run({ setting: 'nda', outcome: 'death', unexpected: 'yes', source: 'study-possible', received: '2026-10-01' }).flag, 'alert-15-day');
  assert.equal(run({ setting: 'unapproved', outcome: 'death', unexpected: 'yes', source: 'study-not', received: '2026-10-01' }).flag, 'no-report-in-section');
});

test('periodic: quarterly for 3 years, 30 days after the close; then annual, 60 days after the anniversary', () => {
  const q = run({ setting: 'nda', outcome: 'not-serious', received: '2026-10-01', approval: '2025-01-15' });
  assert.deepEqual(q.schedule[0], { kind: 'Quarterly report 7 of 12', closes: '2026-10-14', due: '2026-11-13' });
  assert.equal(q.schedule.length, 4);
  const last = run({ setting: 'nda', outcome: 'not-serious', received: '2026-10-01', approval: '2023-10-02' });
  assert.deepEqual(last.schedule.map((x) => x.kind), ['Quarterly report 12 of 12', 'Annual report, year 4', 'Annual report, year 5', 'Annual report, year 6']);
  assert.deepEqual(last.schedule[1], { kind: 'Annual report, year 4', closes: '2027-10-02', due: '2027-12-01' });
  const b = run({ setting: 'biologic', outcome: 'not-serious', received: '2026-10-01', approval: '2021-11-30' });
  assert.deepEqual(b.schedule[0], { kind: 'Annual report, year 5', closes: '2026-11-30', due: '2027-01-29' });
  // A start on the 30th of November: the first quarter closes on the last day of February less one.
  const feb = run({ setting: 'nda', outcome: 'not-serious', received: '2025-12-01', approval: '2025-11-30' });
  assert.equal(feb.schedule[0].closes, '2026-02-27');
  assert.match(q.notes.join(' '), /Reading used/);
});

test('310.305 has no periodic report; a missing approval date asks for it', () => {
  assert.equal(run({ setting: 'unapproved', outcome: 'not-serious', received: '2026-10-01' }).report, 'none');
  const r = run({ setting: 'biologic', outcome: 'not-serious', received: '2026-10-01' });
  assert.equal(r.due, undefined);
  assert.match(r.band, /Enter the date of issuance of the biologics license/);
});

test('refusals', () => {
  assert.match(run({}).message, /^Choose the setting/);
  assert.match(run({ setting: 'nda' }).message, /^Choose the most serious outcome/);
  assert.match(run({ setting: 'nda', outcome: 'death', received: '2026-10-01' }).message, /^Choose whether the event is unexpected/);
  assert.match(run({ setting: 'nda', outcome: 'not-serious' }).message, /^Enter the date/);
  assert.match(run({ setting: 'nda', outcome: 'not-serious', received: '2024-02-30' }).message, /^Enter the date/);
  assert.match(run({ setting: 'nda', outcome: 'not-serious', received: '2026-10-01', approval: 'soon' }).message, /^Enter the date of approval/);
  assert.match(run({ setting: 'nda', outcome: 'not-serious', received: '2020-10-01', approval: '2023-10-02' }).message, /received before/);
  assert.equal(d(null, now).valid, false);
  // Without a clock the dates still come out; only "days from today" is dropped.
  assert.doesNotMatch(d({ setting: 'nda', outcome: 'death', unexpected: 'yes', received: '2026-10-01' }).band, /today/);
});
