// spec-v1656: the six occupational health tools, against the numbers their regulations print.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oshaNoiseDose as noise, referenceHours, twaFromDose } from '../../lib/osha-noise-dose-v1656.js';
import { oshaStandardThresholdShift as sts, ageCorrection } from '../../lib/osha-standard-threshold-shift-v1656.js';
import { oshaLeadMedicalRemoval as lead } from '../../lib/osha-lead-medical-removal-v1656.js';
import { fmcsaBpCertification as bp } from '../../lib/fmcsa-bp-certification-v1656.js';
import { fmcsaHearingStandard as hear } from '../../lib/fmcsa-hearing-standard-v1656.js';
import { oshaLeadAirbornePelShift as pel } from '../../lib/osha-lead-airborne-pel-shift-v1656.js';

test('noise: Table G-16a reference durations come from the formula', () => {
  for (const [l, t] of [[80, 32], [85, 16], [90, 8], [95, 4], [101, 1.7], [110, 0.5], [120, 0.125], [130, 0.031]]) {
    assert.equal(Math.round(referenceHours(l) * (t < 1 ? 1000 : 10)) / (t < 1 ? 1000 : 10), t, `${l} dBA`);
  }
});

test('noise: Table A-1 rows and the appendix examples (91% -> 89.3, 50% -> 85)', () => {
  for (const [d, twa] of [[50, 85.0], [91, 89.3], [100, 90.0], [200, 95.0], [500, 101.6]]) {
    assert.equal(Math.round(twaFromDose(d) * 10) / 10, twa, `${d}%`);
    assert.equal(noise({ dosimeterDose: String(d) }).twa, twa);
  }
});

test('noise: Table G-16 durations each make a 100% dose; over unity exceeds the PEL', () => {
  for (const [l, h] of [[90, '8'], [92, '6'], [95, '4'], [97, '3'], [100, '2'], [105, '1'], [110, '0:30']]) {
    const r = noise({ segments: `${l}, ${h}` });
    assert.ok(Math.abs(r.dose - 100) < 1.5, `${l} dBA for ${h} h is ${r.dose}%`);
  }
  const r = noise({ segments: '95, 4\n90, 4' });
  assert.equal(r.dose, 150);
  assert.equal(r.overPel, true);
  assert.equal(r.actionLevel, true);
  assert.equal(noise({ segments: '85, 8' }).actionLevel, true);
  assert.equal(noise({ segments: '85, 8' }).overPel, false);
  assert.equal(noise({ segments: '84, 8' }).actionLevel, false);
});

test('noise: below 80 dBA adds nothing; refusals name the line', () => {
  assert.equal(noise({ segments: '75, 8' }).dose, 0);
  assert.equal(noise({ segments: '90, 4\n70, 4' }).dose, 50);
  assert.match(noise({ segments: '135, 1' }).message, /above 130/);
  assert.match(noise({ segments: '90, 20\n90, 5' }).message, /more than a day/);
  assert.match(noise({ segments: '90' }).message, /Line 1/);
  assert.equal(noise({}).valid, false);
  assert.ok(noise({ segments: '116, 0.1' }).notes.some((n) => /115 dBA/.test(n)));
});

test('STS: the Appendix F example, shift 20 uncorrected and 17 age-corrected at 4000 Hz', () => {
  assert.deepEqual(ageCorrection('male', 32), [5, 7, 10]);
  assert.deepEqual(ageCorrection('male', 27), [4, 6, 7]);
  const r = sts({ rightB2: '0', rightB3: '0', rightB4: '5', rightR2: '10', rightR3: '10', rightR4: '25', ageCorrection: 'yes', sex: 'male', baselineAge: '27', recentAge: '32' });
  assert.deepEqual(r.ears[0].shifts, [10, 10, 20]);
  assert.deepEqual(r.corrections, [1, 1, 3]);
  assert.deepEqual(r.ears[0].adjustedRecent, [9, 9, 22]);
  assert.equal(r.ears[0].correctedShifts[2], 17);
  assert.equal(r.sts, true);
});

test('STS: average of 2000-4000 only, 10 dB is a shift, either ear, age correction can undo it', () => {
  const base = { leftB2: '10', leftB3: '10', leftB4: '10' };
  assert.equal(sts({ ...base, leftR2: '20', leftR3: '20', leftR4: '20' }).sts, true);
  assert.equal(sts({ ...base, leftR2: '20', leftR3: '20', leftR4: '19' }).sts, false);
  assert.ok(sts({ ...base, leftR2: '20', leftR3: '20', leftR4: '20' }).notes.some((n) => /Choose whether to apply the Appendix F age correction/.test(n)));
  assert.ok(!sts({ ...base, leftR2: '20', leftR3: '20', leftR4: '20', ageCorrection: 'no' }).notes.some((n) => /Choose whether/.test(n)));
  const aged = sts({ ...base, leftR2: '18', leftR3: '22', leftR4: '25', ageCorrection: 'yes', sex: 'female', baselineAge: '20', recentAge: '60' });
  assert.equal(aged.uncorrectedSts, true);
  assert.equal(aged.sts, false);
  assert.deepEqual(ageCorrection('female', 15), ageCorrection('female', 20));
  assert.deepEqual(ageCorrection('male', 70), ageCorrection('male', 60));
});

test('STS: refusals name the missing field', () => {
  assert.match(sts({ rightB2: '0', rightB3: '0', rightB4: '5', rightR2: '10', rightR3: '10' }).message, /right ear recent 4000 Hz/);
  assert.equal(sts({}).valid, false);
  assert.match(sts({ rightB2: '0', rightB3: '0', rightB4: '0', rightR2: '0', rightR3: '0', rightR4: '0', ageCorrection: 'yes', sex: 'male', baselineAge: '40', recentAge: '30' }).message, /younger/);
});

test('lead: monitoring frequency switches at 40 and needs two consecutive below 40', () => {
  assert.equal(lead({ results: '2026-01-05, 32' }).monitoringMonths, 6);
  assert.equal(lead({ results: '2026-01-05, 40' }).monitoringMonths, 2);
  assert.equal(lead({ results: '2026-01-05, 40' }).nextTestBy, '2026-03-05');
  assert.equal(lead({ results: '2026-01-05, 44\n2026-03-05, 38' }).monitoringMonths, 2);
  assert.equal(lead({ results: '2026-01-05, 44\n2026-03-05, 38\n2026-05-05, 36' }).monitoringMonths, 6);
});

test('lead: removal at a periodic and follow-up both at or above 60', () => {
  assert.equal(lead({ results: '2026-03-02, 62\n2026-03-12, 61', lastIsFollowUp: 'yes' }).ruleA, true);
  assert.equal(lead({ results: '2026-03-02, 62\n2026-03-12, 61', lastIsFollowUp: 'yes' }).monitoringMonths, 1);
  assert.equal(lead({ results: '2026-03-02, 62\n2026-03-12, 59', lastIsFollowUp: 'yes' }).ruleA, false);
  const one = lead({ results: '2026-03-02, 62' });
  assert.equal(one.removal, false);
  assert.ok(one.notes.some((n) => /follow-up test is due within two weeks/.test(n)));
});

test('lead: the average rule uses the longer of last three and the previous six months', () => {
  const r = lead({ results: '2025-11-01, 52\n2026-01-01, 50\n2026-03-01, 49' });
  assert.equal(r.average, 50.3);
  assert.equal(r.ruleB, true);
  const six = lead({ results: '2025-12-01, 30\n2026-01-01, 52\n2026-02-01, 52\n2026-03-01, 52\n2026-04-01, 52' });
  assert.match(six.averageBasis, /all 5 tests/);
  assert.equal(six.average, 47.6);
  assert.equal(six.ruleB, false);
  assert.equal(lead({ results: '2025-11-01, 60\n2026-01-01, 60\n2026-03-01, 39' }).ruleB, false);
  assert.equal(lead({ results: '2026-01-01, 55\n2026-03-01, 55' }).average, null);
});

test('lead: return on two consecutive below 40; monthly while removed', () => {
  const stay = lead({ results: '2026-01-01, 45\n2026-02-01, 38', currentlyRemoved: 'yes' });
  assert.equal(stay.returnMet, false);
  assert.equal(stay.monitoringMonths, 1);
  assert.equal(lead({ results: '2026-01-01, 39\n2026-02-01, 38', currentlyRemoved: 'yes' }).returnMet, true);
  assert.match(lead({ results: '2026-13-01, 39' }).message, /date/);
  assert.equal(lead({}).valid, false);
});

test('FMCSA BP: each stage boundary, and/or', () => {
  const at = (s, d) => bp({ systolic: String(s), diastolic: String(d), context: 'examination' }).stage;
  assert.equal(at(139, 89), 0);
  assert.equal(at(140, 80), 1);
  assert.equal(at(130, 90), 1);
  assert.equal(at(159, 99), 1);
  assert.equal(at(160, 90), 2);
  assert.equal(at(150, 100), 2);
  assert.equal(at(179, 109), 2);
  assert.equal(at(180, 100), 3);
  assert.equal(at(170, 110), 3);
  assert.ok(bp({ systolic: '185', diastolic: '95', context: 'examination' }).notes.some((n) => /"and"/.test(n)));
});

test('FMCSA BP: intervals by examination', () => {
  const r = (s, d, context, treatmentTolerated) => bp({ systolic: String(s), diastolic: String(d), context, treatmentTolerated }).interval;
  assert.equal(r(150, 92, 'examination'), '1 year');
  assert.equal(r(165, 95, 'examination'), 'one-time 3 months');
  assert.equal(r(185, 112, 'examination'), 'not qualified');
  assert.equal(r(128, 80, 'examination'), 'up to 24 months');
  assert.equal(r(140, 90, 'stage1-annual'), '1 year');
  assert.equal(r(141, 88, 'stage1-annual'), 'one-time 3 months');
  assert.equal(r(138, 88, 'end-of-3-month', 'yes'), '1 year');
  assert.equal(r(145, 88, 'end-of-3-month', 'yes'), 'not qualified');
  assert.equal(r(138, 88, 'stage3-recheck', 'yes'), '6 months');
  assert.equal(r(138, 88, 'stage3-recheck'), 'not stated');
  assert.equal(bp({ systolic: '150', context: 'examination' }).valid, false);
  assert.equal(bp({ systolic: '150', diastolic: '90' }).valid, false);
});

test('FMCSA hearing: 5-foot whisper, 40 dB better-ear average, ISO-to-ANSI', () => {
  assert.equal(hear({ whisperFeet: '5' }).meets, true);
  assert.equal(hear({ whisperFeet: '4' }).meets, false);
  assert.equal(hear({ hz500: '40', hz1000: '40', hz2000: '40', calibration: 'ansi' }).meets, true);
  assert.equal(hear({ hz500: '40', hz1000: '40', hz2000: '41', calibration: 'ansi' }).meets, false);
  const iso = hear({ hz500: '54', hz1000: '50', hz2000: '48.5', calibration: 'iso' });
  assert.deepEqual(iso.thresholds, [40, 40, 40]);
  assert.equal(iso.average, 40);
  assert.equal(iso.meets, true);
  assert.equal(hear({ whisperFeet: '3', hz500: '20', hz1000: '20', hz2000: '20', calibration: 'ansi' }).meets, true);
  assert.match(hear({ hz500: '20', hz1000: '20', hz2000: '20' }).message, /calibration/);
  assert.equal(hear({}).valid, false);
});

test('lead airborne: 400 / hours above 8, 50 at or below, action level 30', () => {
  assert.equal(pel({ hours: '10' }).pel, 40);
  assert.equal(pel({ hours: '8' }).pel, 50);
  assert.equal(pel({ hours: '12' }).pel, 33.3);
  const r = pel({ hours: '10', measuredTwa: '45' });
  assert.equal(r.exceeded, true);
  assert.equal(r.actionLevel, true);
  assert.equal(pel({ hours: '10', measuredTwa: '40' }).exceeded, false);
  assert.equal(pel({ hours: '10', measuredTwa: '29' }).actionLevel, false);
  assert.equal(pel({ hours: '25' }).valid, false);
  assert.equal(pel({}).valid, false);
});
