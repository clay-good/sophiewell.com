// spec-v1172: a clock answers in the frame it was asked in.
//
// The five bedside timers take their timestamps from a `datetime-local` control,
// which emits no UTC offset: `2026-05-19T12:00` is a WALL CLOCK, the one on the
// wall of the room. Each tile added its interval and wrote the result out with
// `toISOString()`, which is an instant in UTC -- so a restraint ordered at noon
// showed its 4-hour CMS renewal as "2026-05-19T21:00:00.000Z" when the renewal
// is due at 16:00 on the reader's own clock. Every worked example on all five
// tiles uses the offset-less form, so this is what the page opened on.
//
// The rule is: an instant in, an instant out; a wall clock in, the same wall
// clock out. The pre-existing tests below the line pass a `Z` timestamp and are
// unchanged by design -- they are the other half of it.
import test from 'node:test';
import assert from 'node:assert/strict';

import { parseStamp, wallClock, stampOut } from '../../lib/num.js';
import {
  restraintTimer, ewsEscalation, sepsisBundleClock, codeBlueClock, deviceDayCounter,
} from '../../lib/scoring-v4.js';

const WALL = '2026-05-19T12:00';
const ZONED = '2026-05-19T12:00:00Z';

test('parseStamp reports whether the caller gave an offset', () => {
  assert.equal(parseStamp(WALL).zoned, false);
  assert.equal(parseStamp(ZONED).zoned, true);
  assert.equal(parseStamp('2026-05-19T12:00+02:00').zoned, true);
  assert.equal(parseStamp('3/14/2026'), null);
});

test('stampOut writes the frame back out, and wallClock round-trips its own input', () => {
  const d = parseStamp(WALL).date;
  assert.equal(wallClock(d), WALL, 'the shape a datetime-local control emits');
  assert.equal(parseStamp(wallClock(d)).date.getTime(), d.getTime());
  assert.equal(stampOut(d, false), WALL);
  assert.equal(stampOut(d, true), d.toISOString());
});

test('a restraint ordered at noon renews at 16:00, not 21:00Z', () => {
  const r = restraintTimer({ type: 'violent', ageYears: 40, orderTimestamp: WALL });
  assert.equal(r.orderIso, '2026-05-19T12:00');
  assert.equal(r.nextRenewalIso, '2026-05-19T16:00', '42 CFR 482.13(e) q4h');
  assert.equal(r.nextReassessIso, '2026-05-19T12:15');
  assert.equal(r.nextFaceToFaceIso, '2026-05-19T13:00');
  // Give it an instant and it still answers with one.
  assert.equal(restraintTimer({ type: 'violent', ageYears: 40, orderTimestamp: ZONED }).nextRenewalIso,
    '2026-05-19T16:00:00.000Z');
});

test('the ACLS rhythm check is two minutes away on the reader\'s clock', () => {
  const r = codeBlueClock({ codeStartTimestamp: WALL, asOf: '2026-05-19T12:05' });
  assert.equal(r.nextRhythmCheckIso, '2026-05-19T12:02');
  const withEpi = codeBlueClock({ codeStartTimestamp: WALL, lastEpi: '2026-05-19T12:04', asOf: '2026-05-19T12:05' });
  assert.equal(withEpi.nextEpiIso, '2026-05-19T12:08');
});

test('the NEWS2, SEP-1 and device clocks do the same', () => {
  assert.equal(ewsEscalation({ news2Total: 6, vitalsTimestamp: WALL }).nextDueIso, '2026-05-19T13:00');
  assert.equal(sepsisBundleClock({ t0: WALL }).t0Iso, WALL);
  assert.equal(sepsisBundleClock({ t0: WALL }).items[0].dueIso, '2026-05-19T13:00', 'lactate within 1 h');
  assert.equal(sepsisBundleClock({ t0: WALL }).items[4].dueIso, '2026-05-19T18:00', 'vasopressors within 6 h');
  assert.equal(deviceDayCounter({
    device: 'foley', insertionTimestamp: WALL, asOf: '2026-05-20T12:00', criteriaMet: ['x'],
  }).insertionIso, WALL);
});

test('all five refuse a timestamp they cannot read, in the reader\'s words', () => {
  const loose = '3/14/2026';
  assert.throws(() => restraintTimer({ type: 'violent', ageYears: 40, orderTimestamp: loose }), /date and a time/);
  assert.throws(() => codeBlueClock({ codeStartTimestamp: loose }), /date and a time/);
  assert.throws(() => sepsisBundleClock({ t0: loose }), /date and a time/);
  assert.throws(() => deviceDayCounter({ device: 'foley', insertionTimestamp: loose, criteriaMet: ['x'] }), /date and a time/);
  // This one is optional, so blank means "no due time" and unreadable does not:
  // a value that was entered and silently discarded is the worse of the two.
  assert.equal(ewsEscalation({ news2Total: 6 }).nextDueIso, null);
  assert.throws(() => ewsEscalation({ news2Total: 6, vitalsTimestamp: loose }), /or leave it blank/);
});

test('every worked example on these tiles uses the offset-less form', async () => {
  // Which is why this defect was on the page each of them opens on.
  const { META } = await import('../../lib/meta.js');
  for (const id of ['restraint-timer', 'ews-escalation', 'sepsis-bundle-clock', 'code-blue-clock', 'device-day-counter']) {
    for (const [k, v] of Object.entries(META[id].example.fields)) {
      if (/^\d{4}-\d{2}-\d{2}T/.test(String(v))) {
        assert.equal(parseStamp(v).zoned, false, `${id}|${k} is a wall clock`);
      }
    }
  }
});
