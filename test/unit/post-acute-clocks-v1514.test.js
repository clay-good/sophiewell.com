// spec-v1514 tools 1, 3, 5, 6: MOON, NOMNC, the SNF qualifying stay, and hospice periods.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { moonDeadline as mo, nomncDeadline as nm, snfQualifyingStay as sq, hospicePeriodClock as hp, imNoticeTiming as im, homeHealthCertClock as hh, dmeRentalClock as dme, irfComplianceClock as irf, mcsnAppealRights as mcsn } from '../../lib/post-acute-clocks-v1514.js';

test('MOON: 36 hours, sooner at release, none at 24 hours or less', () => {
  assert.equal(mo({ observationStart: '2026-10-05T14:00' }).deadline, '2026-10-07T02:00');
  assert.equal(mo({ observationStart: '2026-10-05T14:00', endTime: '2026-10-06T20:00' }).deadline, '2026-10-06T20:00');
  assert.equal(mo({ observationStart: '2026-10-05T14:00', endTime: '2026-10-06T14:00' }).bandLabel, 'Not required');
});

test('NOMNC: 2 days, not 48 hours; a late notice extends coverage', () => {
  assert.equal(nm({ setting: 'snf', lastCovered: '2026-10-09' }).deadline, '2026-10-07');
  assert.equal(nm({ setting: 'snf', lastCovered: '2026-10-09', delivered: '2026-10-07' }).bandLabel, 'On time');
  assert.match(nm({ setting: 'snf', lastCovered: '2026-10-09', delivered: '2026-10-08' }).band, /October 10, 2026/);
});

test('SNF: 3 inpatient days not counting discharge, and the 30-day window', () => {
  assert.equal(sq({ inpatientAdmit: '2026-10-01', inpatientDischarge: '2026-10-04' }).qualifies, true);
  assert.equal(sq({ inpatientAdmit: '2026-10-02', inpatientDischarge: '2026-10-04' }).qualifies, false);
  assert.equal(sq({ inpatientAdmit: '2026-10-01', inpatientDischarge: '2026-10-04', snfAdmit: '2026-11-04' }).bandLabel, 'SNF admission too late');
  assert.match(sq({ inpatientAdmit: '2026-10-01', inpatientDischarge: '2026-10-04', daysUsed: '25' }).notes.join(' '), /0 fully covered days and 75 coinsurance days/);
});

test('hospice: 90, 90, then 60-day periods, and the recertification window', () => {
  const r = hp({ electionDate: '2026-01-10', asOf: '2026-07-20' });
  assert.equal(r.bandLabel, 'Period 3');
  assert.match(r.band, /ends September 6, 2026/);
  assert.match(r.band, /between August 23, 2026 and September 9, 2026/);
});

test('blanks are asked for', () => {
  for (const r of [mo({}), nm({}), nm({ setting: 'snf' }), sq({}), sq({ inpatientAdmit: '2026-10-01' }), hp({})]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});

test('im-notice-timing: first IM within 2 calendar days of admission; follow-up window ends 4 hours before discharge', () => {
  const r = im({ admission: '2026-10-05T14:00', firstDelivered: '2026-10-06', discharge: '2026-10-10T11:00' });
  assert.match(r.band, /on time/);
  assert.match(r.band, /no sooner than October 8, 2026 and no later than October 10, 2026, 7:00 am/);
});

test('im-notice-timing: no follow-up when the first IM came within 2 calendar days of discharge', () => {
  const r = im({ admission: '2026-10-05T14:00', firstDelivered: '2026-10-07', discharge: '2026-10-09T11:00' });
  assert.match(r.band, /No follow-up copy is needed/);
});

test('im-notice-timing: late and too-early first IMs are flagged', () => {
  assert.equal(im({ admission: '2026-10-05T14:00', firstDelivered: '2026-10-08' }).bandLabel, 'First IM late');
  assert.equal(im({ admission: '2026-10-05T14:00', firstDelivered: '2026-09-27' }).bandLabel, 'First IM too early');
  assert.equal(im({ admission: '2026-10-05T14:00', firstDelivered: '2026-09-28' }).bandLabel, 'First IM on time');
});

test('im-notice-timing: a blank admission asks; a discharge before admission is refused', () => {
  assert.equal(im({}).valid, false);
  assert.equal(im({ admission: '2026-10-05T14:00', discharge: '2026-10-04T10:00' }).valid, false);
});

test('home-health-cert-clock: face-to-face window from 90 days before to 30 days after the start of care', () => {
  assert.equal(hh({ startOfCare: '2026-10-01', faceToFace: '2026-07-03' }).abnormal, false);
  assert.equal(hh({ startOfCare: '2026-10-01', faceToFace: '2026-07-02' }).abnormal, true);
  assert.equal(hh({ startOfCare: '2026-10-01', faceToFace: '2026-10-31' }).abnormal, false);
  assert.equal(hh({ startOfCare: '2026-10-01', faceToFace: '2026-11-01' }).abnormal, true);
});

test('home-health-cert-clock: 60-day periods, the last-5-days recertification window, and OASIS by day 5', () => {
  const r = hh({ startOfCare: '2026-10-01' });
  assert.match(r.band, /October 1, 2026 to November 29, 2026, with the recertification assessment due November 25, 2026 to November 29, 2026/);
  assert.match(r.notes.join(' '), /complete by October 6, 2026/);
  assert.match(r.notes.join(' '), /Certification period 2: November 30, 2026 to January 28, 2027/);
});

test('home-health-cert-clock: a blank start of care asks', () => {
  assert.equal(hh({}).valid, false);
  assert.equal(hh({ startOfCare: '2026-10-01', faceToFace: 'soon' }).valid, false);
});

test('dme-rental-clock: capped rental title after 13 months; oxygen rental ends at 36 with a 5-year floor', () => {
  assert.match(dme({ item: 'capped', delivered: '2026-01-15' }).band, /Title passes to the patient on February 15, 2027/);
  const r = dme({ item: 'oxygen', delivered: '2026-01-15' });
  assert.match(r.band, /on January 14, 2029/);
  assert.match(r.band, /at least until January 14, 2031/);
});

test('dme-rental-clock: a break of 60 days plus the rest of the rental month is temporary, one day more is not', () => {
  const base = { item: 'capped', delivered: '2026-01-15', lastUse: '2026-03-20' };
  assert.equal(dme({ ...base, resumed: '2026-06-14' }).bandLabel, 'Temporary break');
  const r = dme({ ...base, resumed: '2026-06-15' });
  assert.equal(r.bandLabel, 'Break too long');
  assert.match(r.band, /new prescription/);
});

test('dme-rental-clock: blank item or delivery asks; a resume date alone asks for the stop date', () => {
  assert.equal(dme({ delivered: '2026-01-15' }).valid, false);
  assert.equal(dme({ item: 'capped' }).valid, false);
  assert.equal(dme({ item: 'capped', delivered: '2026-01-15', resumed: '2026-03-01' }).valid, false);
});

test('irf-compliance-clock: therapy within 36 hours of the midnight ending the admission day', () => {
  assert.match(irf({ admission: '2026-10-05T15:00' }).band, /First therapy by October 7, 2026, 12:00 pm/);
  assert.equal(irf({ admission: '2026-10-05T15:00', firstTherapy: '2026-10-07T12:00' }).abnormal, false);
  assert.equal(irf({ admission: '2026-10-05T15:00', firstTherapy: '2026-10-07T12:01' }).abnormal, true);
});

test('irf-compliance-clock: a screening older than 48 hours passes only with an update inside them', () => {
  const base = { admission: '2026-10-05T15:00', screening: '2026-10-02T10:00' };
  assert.equal(irf(base).abnormal, true);
  assert.equal(irf({ ...base, screeningUpdate: '2026-10-04T09:00' }).abnormal, false);
  assert.equal(irf({ ...base, screening: '2026-10-03T15:00' }).abnormal, false);
});

test('irf-compliance-clock: IRF-PAI admission and discharge dates', () => {
  const n = irf({ admission: '2026-10-05T15:00', discharge: '2026-10-20' }).notes.join(' ');
  assert.match(n, /completed October 8, 2026, encoded by October 14, 2026/);
  assert.match(n, /transmitted together by November 6, 2026/);
});

test('irf-compliance-clock: a blank admission asks', () => {
  assert.equal(irf({}).valid, false);
});

test('mcsn-appeal-rights: 3 hospital days with fewer than 3 as an inpatient qualifies; the notice is due 4 hours before release', () => {
  const b = { hospitalStart: '2026-10-04', admitted: '2026-10-05', reclassified: '2026-10-06', partB: 'yes' };
  const r = mcsn({ ...b, release: '2026-10-07T15:00' });
  assert.equal(r.eligible, true);
  assert.match(r.band, /no later than October 7, 2026, 11:00 am/);
  assert.equal(mcsn({ ...b, release: '2026-10-06T15:00' }).eligible, false);
  assert.equal(mcsn({ ...b, reclassified: '2026-10-08', release: '2026-10-09T10:00' }).eligible, false);
});

test('mcsn-appeal-rights: no Part B qualifies; with Part B and no release date it asks for the release', () => {
  const b = { hospitalStart: '2026-10-04', admitted: '2026-10-05', reclassified: '2026-10-06' };
  assert.equal(mcsn({ ...b, partB: 'no' }).eligible, true);
  assert.equal(mcsn({ ...b, partB: 'yes' }).bandLabel, 'Needs release date');
});

test('mcsn-appeal-rights: admissions before February 14, 2025 get the retrospective-window note', () => {
  assert.match(mcsn({ hospitalStart: '2025-01-04', admitted: '2025-01-05', reclassified: '2025-01-06', partB: 'yes' }).band, /January 2, 2026/);
});

test('mcsn-appeal-rights: blank required dates or Part B ask', () => {
  assert.equal(mcsn({}).valid, false);
  assert.equal(mcsn({ hospitalStart: '2026-10-04', admitted: '2026-10-05', reclassified: '2026-10-06' }).valid, false);
});
