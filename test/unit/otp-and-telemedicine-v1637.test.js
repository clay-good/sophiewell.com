// spec-v1637 tools 13 and 14: OTP admission clocks and the telemedicine prescribing window.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { otpAdmissionClock } from '../../lib/otp-admission-clock-v1637.js';
import { oudTelemedicineRxWindow } from '../../lib/oud-telemedicine-rx-window-v1637.js';

test('admission: the 14-day dates, and the 7-day and 30-day look-backs', () => {
  const r = otpAdmissionClock({ admitted: '2026-10-01' });
  assert.deepEqual([r.fullExamDue, r.assessmentDue, r.earliestOutsideScreening, r.earliestLabDraw, r.flag], ['2026-10-15', '2026-10-15', '2026-09-24', '2026-09-01', 'dates']);
});

test('admission: an outside screening more than seven days before, labs more than 30, a late examination', () => {
  const ok = otpAdmissionClock({ admitted: '2026-10-01', screened: '2026-09-24', screenedBy: 'outside-practitioner', labsDrawn: '2026-09-01', fullExam: '2026-10-15', assessment: '2026-10-15' });
  assert.deepEqual(ok.problems, []);
  const bad = otpAdmissionClock({ admitted: '2026-10-01', screened: '2026-09-23', screenedBy: 'outside-practitioner', labsDrawn: '2026-08-31', fullExam: '2026-10-16', assessment: '2026-10-20' });
  assert.deepEqual(bad.problems, ['outside screening too early', 'labs drawn too early', 'full examination late', 'assessment late']);
  // The seven-day limit is for a practitioner outside the program.
  assert.deepEqual(otpAdmissionClock({ admitted: '2026-10-01', screened: '2026-09-01', screenedBy: 'otp-practitioner' }).problems, []);
  assert.match(otpAdmissionClock({ admitted: '2026-10-01', screened: '2026-09-30' }).message, /^Choose who did the screening/);
});

test('admission: interim treatment day 120 and day 180, counting the first day as day 1', () => {
  const r = otpAdmissionClock({ admitted: '2026-10-01', interimStart: '2026-01-01' });
  assert.deepEqual([r.interimPlanBy, r.interimLastDay], ['2026-04-30', '2026-06-29']);
  assert.match(r.note, /counted as day 1 \(the rule does not say\)/);
  assert.match(otpAdmissionClock({}).message, /^Enter the admission date/);
});

const tele = (o) => oudTelemedicineRxWindow({ prescribedOn: '2026-10-12', inPerson: 'no-inperson-evaluation', schedule: 'schedule-3-to-5', purpose: 'oud-labeled-product', va: 'not-a-va-prescriber', pdmp: 'pdmp-reviewed', ...o });

test('telemedicine: six calendar months from the first prescription, read to end the day before', () => {
  const r = tele({ firstTelemedicineRx: '2026-06-15' });
  assert.deepEqual([r.oudWindowEnds, r.authorities], ['2026-12-14', ['21 CFR 1306.51', '21 CFR 1307.41']]);
  const after = tele({ prescribedOn: '2026-12-15', firstTelemedicineRx: '2026-06-15' });
  assert.deepEqual(after.authorities, ['21 CFR 1307.41']);
  // With no earlier date, this prescription is the first.
  assert.equal(tele({}).oudWindowEnds, '2027-04-11');
  assert.match(tele({ pdmp: 'pdmp-unavailable' }).note, /seven-day supply/);
});

test('telemedicine: the temporary rule covers through December 31, 2026 and is not assumed after it', () => {
  const any = (prescribedOn) => tele({ prescribedOn, schedule: 'schedule-2', purpose: 'any-other-purpose' });
  assert.deepEqual([any('2026-12-31').flag, any('2026-12-31').authorities], ['covered', ['21 CFR 1307.41']]);
  assert.deepEqual([any('2027-01-01').flag, any('2027-01-01').covered], ['check-the-rule-in-force', false]);
  assert.equal(any('2023-05-11').flag, 'no-authority-found');
  assert.equal(any('2023-05-12').flag, 'covered');
  // An OUD prescription inside its six months is still covered in 2027 by 1306.51.
  assert.deepEqual(tele({ prescribedOn: '2027-02-01', firstTelemedicineRx: '2026-11-01' }).authorities, ['21 CFR 1306.51']);
});

test('telemedicine: the VA rule, an in-person evaluation, and refusals', () => {
  const va = tele({ prescribedOn: '2027-03-01', schedule: 'schedule-2', purpose: 'any-other-purpose', va: 'va-prescriber-with-va-patient-evaluated', pdmp: 'pdmp-unavailable' });
  assert.deepEqual(va.authorities, ['21 CFR 1306.52']);
  assert.match(va.note, /limited to a 7-day supply/);
  assert.equal(oudTelemedicineRxWindow({ prescribedOn: '2026-10-12', inPerson: 'inperson-evaluation-done' }).flag, 'inperson-evaluation-done');
  assert.match(oudTelemedicineRxWindow({}).message, /^Enter the date of the prescription/);
  assert.match(oudTelemedicineRxWindow({ prescribedOn: '2026-10-12' }).message, /^Choose whether the prescriber has evaluated/);
  assert.match(tele({ pdmp: '' }).message, /^Choose whether the state drug-monitoring database/);
  assert.match(tele({ firstTelemedicineRx: '2026-11-01' }).message, /not after this prescription/);
  // A Schedule II OUD drug is outside 1306.51 and is told so.
  assert.match(tele({ schedule: 'schedule-2' }).note, /does not cover a Schedule II drug/);
});
