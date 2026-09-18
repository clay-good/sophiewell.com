// spec-v1389: the Texas emergency detention and probable-cause hearing clocks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { txEmergencyDetentionClock as ed } from '../../lib/tx-emergency-detention-clock-v1389.js';
import { txProtectiveCustodyHearingClock as pc } from '../../lib/tx-protective-custody-hearing-clock-v1389.js';

// --- emergency detention (s.573.021) ----------------------------------------

test('ed: a Friday 6 p.m. presentation runs to Monday 4 p.m. (the worked example across a weekend)', () => {
  const r = ed({ presented: '2026-09-18T18:00' });
  assert.equal(r.end48, '2026-09-20T18:00');
  assert.equal(r.detainUntil, '2026-09-21T16:00');
  assert.equal(r.ambiguous, false);
});

test('ed: when that Monday is a legal holiday it runs to Tuesday 4 p.m. (Labor Day 2026)', () => {
  const r = ed({ presented: '2026-09-04T18:00' });
  assert.equal(r.detainUntil, '2026-09-08T16:00');
});

test('ed: a period ending on a business day prints both readings, earlier first', () => {
  const r = ed({ presented: '2026-09-21T18:00' }); // ends Wednesday 18:00
  assert.equal(r.detainUntil, '2026-09-23T16:00');
  assert.equal(r.detainUntilOtherReading, '2026-09-24T16:00');
  assert.equal(r.ambiguous, true);
  assert.ok(r.flags.some((f) => /BEFORE the 48 hours/.test(f)));
  const morning = ed({ presented: '2026-09-21T10:00' }); // ends Wednesday 10:00
  assert.equal(morning.detainUntil, '2026-09-23T16:00');
  assert.equal(morning.flags.some((f) => /BEFORE the 48 hours/.test(f)), false);
});

test('ed: the 12-hour exam runs from apprehension, and extensions add 24 hours each', () => {
  const r = ed({ presented: '2026-09-18T18:00', apprehended: '2026-09-18T15:00', extensions: '2' });
  assert.ok(r.deadlines[0].label.startsWith('Physician examination'));
  assert.equal(r.deadlines[0].at, '2026-09-19T03:00');
  assert.equal(r.detainUntil, '2026-09-23T16:00');
});

test('ed: a staffed Texas state holiday is flagged, not silently treated', () => {
  const r = ed({ presented: '2026-03-01T10:00' });
  assert.ok(r.flags.some((f) => /Texas Independence Day/.test(f)));
});

test('ed: a blank start prints no deadline, and impossible input is refused', () => {
  assert.equal(ed({}).valid, false);
  assert.equal(ed({ presented: '' }).valid, false);
  assert.equal(ed({ presented: '2026-09-18T18:00', apprehended: '2026-09-19T01:00' }).valid, false);
  assert.equal(ed({ presented: '2026-09-18T18:00', extensions: '1.5' }).valid, false);
  assert.equal(ed({ presented: 'tomorrow' }).valid, false);
});

test('ed: hours are real hours across the fall daylight-saving change', () => {
  const r = ed({ presented: '2026-10-31T12:00' }); // 48 h later is 2026-11-02 11:00 on the clock
  assert.equal(r.end48, '2026-11-02T11:00');
});

// --- probable-cause hearing (s.574.025) and services hearing (s.574.005) --

test('pc: 72 hours ending on a Sunday move the hearing to Monday', () => {
  const r = pc({ detained: '2026-09-17T20:00' });
  assert.equal(r.hearingDay, '2026-09-21');
});

test('pc: 72 hours ending on a holiday Monday move the hearing to Tuesday (Labor Day 2026)', () => {
  const r = pc({ detained: '2026-09-04T09:00' }); // ends Monday 2026-09-07 09:00, Labor Day
  assert.equal(r.hearingDay, '2026-09-08');
  assert.match(r.band, /Labor Day/);
});

test('pc: 72 hours ending on a business day need no move', () => {
  const r = pc({ detained: '2026-09-21T09:00' });
  assert.equal(r.hearingDay, null);
  assert.match(r.band, /Thursday, September 24, 2026, 9:00 am, 72 h after detention/);
});

test('pc: the services hearing dates from the filing date', () => {
  const r = pc({ filed: '2026-09-18' });
  const at = Object.fromEntries(r.deadlines.map((d) => [d.label.slice(0, 20), d.at]));
  assert.equal(at['Services hearing set'], '2026-10-02');
  assert.equal(at['Not in the first 3 d'], '2026-09-22');
  assert.equal(at['Latest date with con'], '2026-10-18');
});

test('pc: nothing entered prints nothing', () => {
  assert.equal(pc({}).valid, false);
  assert.equal(pc({ detained: 'soon' }).valid, false);
});
