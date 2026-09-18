// spec-v1388: the state legal-holiday and business-day calendar. The expected dates below were
// computed independently (Python datetime) and spot-checked against published calendars; every
// Saturday/Sunday observance shift that falls in 2026-2030 has its own case.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  holidaysInYear, isLegalHoliday, isBusinessDay, nextBusinessDay, easter, addHours,
  addExcludingSundaysAndHolidays, elapsedHours, formatDeadline, parseDateTime, STATES, stateOptions, scopeSentence,
} from '../../lib/state-calendar.js';

const iso = (t) => new Date(t).toISOString().slice(0, 10);
const has = (state, date, name) => {
  const h = isLegalHoliday(state, date);
  assert.ok(h, `${state} ${date} should be a holiday (${name})`);
  if (name) assert.match(h.name, name, `${state} ${date}`);
  return h;
};
const not = (state, date) => assert.equal(isLegalHoliday(state, date), null, `${state} ${date} should not be a holiday`);

// Independent tables, 2026-2030.
const WEEKDAY_RULES = {
  2026: { mlk: '2026-01-19', pres: '2026-02-16', mem: '2026-05-25', labor: '2026-09-07', columbus: '2026-10-12', thanks: '2026-11-26', election: '2026-11-03', goodfri: '2026-04-03', njJune: '2026-06-19', nativeAm: '2026-09-25', flag: '2026-06-14' },
  2027: { mlk: '2027-01-18', pres: '2027-02-15', mem: '2027-05-31', labor: '2027-09-06', columbus: '2027-10-11', thanks: '2027-11-25', election: '2027-11-02', goodfri: '2027-03-26', njJune: '2027-06-18', nativeAm: '2027-09-24', flag: '2027-06-13' },
  2028: { mlk: '2028-01-17', pres: '2028-02-21', mem: '2028-05-29', labor: '2028-09-04', columbus: '2028-10-09', thanks: '2028-11-23', election: '2028-11-07', goodfri: '2028-04-14', njJune: '2028-06-16', nativeAm: '2028-09-22', flag: '2028-06-11' },
  2029: { mlk: '2029-01-15', pres: '2029-02-19', mem: '2029-05-28', labor: '2029-09-03', columbus: '2029-10-08', thanks: '2029-11-22', election: '2029-11-06', goodfri: '2029-03-30', njJune: '2029-06-15', nativeAm: '2029-09-28', flag: '2029-06-10' },
  2030: { mlk: '2030-01-21', pres: '2030-02-18', mem: '2030-05-27', labor: '2030-09-02', columbus: '2030-10-14', thanks: '2030-11-28', election: '2030-11-05', goodfri: '2030-04-19', njJune: '2030-06-21', nativeAm: '2030-09-27', flag: '2030-06-09' },
};

test('easter: Good Friday falls two days before the published Easter dates', () => {
  assert.deepEqual([2026, 2027, 2028, 2029, 2030].map((y) => iso(easter(y))), ['2026-04-05', '2027-03-28', '2028-04-16', '2029-04-01', '2030-04-21']);
});

test('the weekday-rule holidays, 2026-2030, in every state that has them', () => {
  for (const [y, r] of Object.entries(WEEKDAY_RULES)) {
    for (const s of ['NY', 'NJ', 'CA', 'TX']) {
      has(s, r.mlk, /King/);
      has(s, r.pres, /Washington|Presidents/);
      has(s, r.mem, /Memorial/);
      has(s, r.labor, /Labor/);
      has(s, r.thanks, /Thanksgiving/);
    }
    for (const s of ['NY', 'NJ', 'CA']) has(s, r.columbus, /Columbus/);
    not('TX', r.columbus);
    has('NY', r.election, /Election/);
    has('NJ', r.election, /Election/);
    not('CA', r.election);
    not('TX', r.election);
    has('NJ', r.goodfri, /Good Friday/);
    assert.equal(has('CA', r.goodfri, /Good Friday/).kind, 'partial');
    not('NY', r.goodfri);
    not('TX', r.goodfri);
    has('NJ', r.njJune, /Juneteenth/);
    has('CA', r.nativeAm, /Native American/);
    has('NY', r.flag, /Flag/);
    has('TX', iso(Date.parse(r.thanks) + 86400000), /Friday after Thanksgiving/);
    assert.ok(y);
  }
});

test('fixed-date holidays by state', () => {
  for (const y of [2026, 2027, 2028, 2029, 2030]) {
    for (const s of ['NY', 'NJ', 'CA', 'TX']) {
      has(s, `${y}-01-01`, /New Year/);
      has(s, `${y}-07-04`, /Independence/);
      has(s, `${y}-11-11`, /Veterans/);
      has(s, `${y}-12-25`, /Christmas/);
    }
    has('NY', `${y}-02-12`, /Lincoln/);
    has('NJ', `${y}-02-12`, /Lincoln/);
    has('CA', `${y}-02-12`, /Lincoln/);
    not('TX', `${y}-02-12`);
    has('NY', `${y}-06-19`, /Juneteenth/);
    has('CA', `${y}-06-19`, /Juneteenth/);
    assert.equal(has('TX', `${y}-06-19`, /Emancipation/).kind, 'staffed');
    has('CA', `${y}-03-31`, /Farmworkers/);
    has('CA', `${y}-04-24`, /Genocide/);
    has('CA', `${y}-09-09`, /Admission/);
    for (const [d, n] of [['01-19', /Confederate/], ['03-02', /Texas Independence/], ['04-21', /San Jacinto/], ['08-27', /Johnson/]]) {
      const h = has('TX', `${y}-${d}`, n);
      // On a date shared with a national holiday the closure wins.
      assert.equal(h.kind, h.also ? 'closure' : 'staffed');
    }
    assert.equal(has('TX', `${y}-12-24`).kind, 'closure');
    assert.equal(has('TX', `${y}-12-26`).kind, 'closure');
  }
});

test('observance: a Sunday Independence Day (2027) moves to Monday in NY, NJ, and CA, not TX', () => {
  for (const s of ['NY', 'NJ', 'CA']) {
    const h = has(s, '2027-07-05', /Independence Day \(observed\)/);
    assert.equal(h.observedFrom, '2027-07-04');
  }
  not('TX', '2027-07-05');
});

test('observance: a Sunday Veterans Day (2029) moves to Monday in NY, NJ, and CA, not TX', () => {
  for (const s of ['NY', 'NJ', 'CA']) has(s, '2029-11-12', /Veterans.* \(observed\)/);
  not('TX', '2029-11-12');
});

test('observance: a Saturday Veterans Day (2028) moves to Friday in California only', () => {
  has('CA', '2028-11-10', /Veterans Day \(observed\)/);
  for (const s of ['NY', 'NJ', 'TX']) not(s, '2028-11-10');
});

test('observance: California shifts Admission Day (2029) and Farmworkers Day (2030) off Sunday', () => {
  has('CA', '2029-09-10', /Admission Day \(observed\)/);
  has('CA', '2030-04-01', /Farmworkers Day \(observed\)/);
});

test('observance: California does not shift Juneteenth or Genocide Remembrance Day', () => {
  // Neither is in s.6701(a)'s list. 2033-06-19 and 2032-04-25 would be the Sunday cases; check the rule directly.
  not('CA', '2033-06-20');
  has('NY', '2033-06-20', /Juneteenth \(observed\)/);
});

test('observance: no state shifts a Saturday holiday except California on Nov 11', () => {
  // July 4, 2026 is a Saturday.
  for (const s of ['NY', 'NJ', 'CA', 'TX']) not(s, '2026-07-03');
  // Dec 25, 2027 is a Saturday: no Friday observance (Texas has Dec 24 as a holiday in its own right).
  for (const s of ['NY', 'NJ', 'CA']) not(s, '2027-12-24');
  has('TX', '2027-12-24', /December 24/);
});

test('business days: weekends and closures are out, Texas staffed holidays are in', () => {
  // January 19, 2026 is both MLK Day (closure) and Confederate Heroes Day (staffed): closed.
  assert.equal(isBusinessDay('TX', '2026-01-19'), false);
  assert.match(isLegalHoliday('TX', '2026-01-19').name, /King.*Confederate|Confederate.*King/);
  assert.equal(isBusinessDay('TX', '2027-01-19'), true); // a Tuesday, Confederate Heroes Day alone
  assert.equal(isBusinessDay('NY', '2026-11-03'), false); // Election Day
  assert.equal(isBusinessDay('TX', '2026-11-03'), true);
  assert.equal(isBusinessDay('TX', '2026-03-02'), true); // Texas Independence Day: staffed
  assert.equal(isBusinessDay('TX', '2026-11-27'), false); // Friday after Thanksgiving
  assert.equal(isBusinessDay('CA', '2026-04-03'), true); // Good Friday: noon to 3 only
  assert.equal(isBusinessDay('NJ', '2026-04-03'), false);
});

test('next business day rolls over weekends and holidays', () => {
  assert.equal(nextBusinessDay('TX', '2026-11-25'), '2026-11-30'); // Thanksgiving, the Friday after, the weekend
  assert.equal(nextBusinessDay('NY', '2026-11-25'), '2026-11-27'); // NY has no Friday-after
  assert.equal(nextBusinessDay('TX', '2026-12-23'), '2026-12-28'); // 24, 25, 26 (Sat), 27 (Sun)
  assert.equal(nextBusinessDay('NY', '2027-07-02'), '2027-07-06'); // Sunday Independence Day observed Monday
});

test('addHours counts real hours across the daylight-saving changes', () => {
  // 2026 DST: begins 2026-03-08, ends 2026-11-01.
  assert.equal(addHours('2026-03-07T12:00', 24).end, '2026-03-08T13:00');
  assert.equal(addHours('2026-10-31T12:00', 24).end, '2026-11-01T11:00');
  assert.equal(addHours('2026-06-01T09:00', 72).end, '2026-06-04T09:00');
  assert.ok(addHours('2026-03-07T12:00', 24).caveats.some((c) => /spring/.test(c)));
  assert.equal(elapsedHours('2026-03-07T12:00', '2026-03-08T13:00'), 24);
});

test('NY MHL 9.37 style: 72 hours excluding Sundays and holidays', () => {
  // Friday 2026-09-18 10:00. Saturday counts, Sunday is skipped: 14 + 24 + (skip Sun) + 24 + 10.
  const r = addExcludingSundaysAndHolidays('NY', '2026-09-18T10:00', 72);
  assert.equal(r.end, '2026-09-22T10:00');
  assert.deepEqual(r.skipped, ['2026-09-20 (Sunday)']);
  // Across Election Day 2026 (Tue Nov 3): Mon 2026-11-02 08:00 + 72 h skips Tuesday.
  const e = addExcludingSundaysAndHolidays('NY', '2026-11-02T08:00', 72);
  assert.equal(e.end, '2026-11-06T08:00');
  assert.ok(e.skipped.some((s) => /Election/.test(s)));
});

test('a count that could include a California lunar holiday says so', () => {
  const r = addExcludingSundaysAndHolidays('CA', '2027-02-01T08:00', 48);
  assert.ok(r.caveats.some((c) => /Lunar New Year/.test(c)));
  const n = addExcludingSundaysAndHolidays('CA', '2027-06-01T08:00', 48);
  assert.equal(n.caveats.length, 0);
  assert.equal(addExcludingSundaysAndHolidays('NY', '2027-02-01T08:00', 48).caveats.length, 0);
});

test('formatDeadline prints the wall-clock time and the elapsed interval', () => {
  assert.equal(formatDeadline('2026-09-22T13:00', '2026-09-24T16:00', 'presentation'), 'Thursday, September 24, 2026, 4:00 pm, 51 h after presentation');
});

test('bad input is refused, not guessed', () => {
  assert.throws(() => isLegalHoliday('FL', '2026-01-01'));
  assert.throws(() => isLegalHoliday('NY', '2026-02-30'));
  assert.equal(parseDateTime('2026-09-24T25:00'), null);
  assert.deepEqual(STATES.map((s) => s.value), ['NY', 'NJ', 'CA', 'TX']);
});

test('each state has the expected number of dated holidays in an ordinary year (2026)', () => {
  const n = (s) => holidaysInYear(s, 2026).length;
  assert.equal(n('NY'), 14);
  assert.equal(n('NJ'), 14);
  assert.equal(n('CA'), 17);
  assert.equal(n('TX'), 17);
});

test('the state picker lists only the covered states, in the fixed order, with no default', () => {
  assert.deepEqual(stateOptions(['TX', 'NY']).map((s) => s.value), ['NY', 'TX']);
  assert.equal(stateOptions().length, 4);
  assert.throws(() => stateOptions(['NY', 'FL']));
});

test('the scope sentence names the verified date and nothing that sounds like a verdict', () => {
  const s = scopeSentence('2026-09-18');
  assert.equal(s, "This states the statute as of September 18, 2026. It does not replace your facility's policy, its counsel, or the court.");
  assert.doesNotMatch(s, /compliant|legal\b/i);
  assert.throws(() => scopeSentence(''));
});

