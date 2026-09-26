// spec-v1503 tools 5-8: ERISA, ACA external review, Medicaid, and QIO fast-appeal clocks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { erisaClaimClock as er } from '../../lib/erisa-claim-clock-v1503.js';
import { acaExternalReviewClock as ac, monthsLaterOrFirstOfNext } from '../../lib/aca-external-review-v1503.js';
import { medicaidAppealClock as md } from '../../lib/medicaid-appeal-clock-v1503.js';
import { qioDischargeAppealClock as qi } from '../../lib/qio-discharge-appeal-v1503.js';
import { parseIsoStrict, fmtUtc } from '../../lib/deadline.js';

test('ERISA claims: each row, the extension, and a late extension notice', () => {
  assert.equal(er({ claimType: 'urgent', stage: 'claim', received: '2026-10-01T08:00' }).deadline, '2026-10-04T08:00');
  assert.equal(er({ claimType: 'concurrent', stage: 'claim', received: '2026-10-01T08:00' }).deadline, '2026-10-02T08:00');
  assert.equal(er({ claimType: 'pre-service', stage: 'claim', received: '2026-10-01', extended: 'no' }).deadline, '2026-10-16');
  assert.equal(er({ claimType: 'pre-service', stage: 'claim', received: '2026-10-01', extended: 'yes', extensionNotice: '2026-10-16' }).deadline, '2026-10-31');
  assert.equal(er({ claimType: 'pre-service', stage: 'claim', received: '2026-10-01', extended: 'yes', extensionNotice: '2026-10-17' }).deadline, '2026-10-16');
  assert.equal(er({ claimType: 'post-service', stage: 'claim', received: '2026-10-01', extended: 'yes' }).deadline, '2026-11-15');
  assert.match(er({ claimType: 'post-service', stage: 'claim', received: '2026-10-01' }).bandLabel, /if extended/);
});

test('ERISA appeals: one or two levels, and the 180-day window', () => {
  assert.equal(er({ claimType: 'pre-service', stage: 'appeal', received: '2026-10-01', levels: 'one' }).deadline, '2026-10-31');
  assert.equal(er({ claimType: 'pre-service', stage: 'appeal', received: '2026-10-01', levels: 'two' }).deadline, '2026-10-16');
  assert.equal(er({ claimType: 'post-service', stage: 'appeal', received: '2026-10-01', levels: 'one' }).deadline, '2026-11-30');
  assert.equal(er({ claimType: 'post-service', stage: 'appeal', received: '2026-10-01', levels: 'two' }).deadline, '2026-10-31');
  assert.equal(er({ claimType: 'urgent', stage: 'appeal', received: '2026-10-01T08:00' }).deadline, '2026-10-04T08:00');
  assert.match(er({ claimType: 'urgent', stage: 'claim', received: '2026-10-01T08:00', denialReceived: '2026-01-01' }).notes.join(' '), /June 30, 2026/);
});

test('ACA external review: no February 31, the weekend roll, and business days', () => {
  assert.equal(fmtUtc(monthsLaterOrFirstOfNext(parseIsoStrict('2026-10-30'), 4)), '2027-03-01');
  assert.equal(ac({ noticeReceived: '2026-10-31' }).deadline, '2027-03-01');
  assert.equal(ac({ noticeReceived: '2026-06-10' }).deadline, '2026-10-13');
  assert.equal(ac({ noticeReceived: '2026-05-15' }).deadline, '2026-09-15');
  assert.match(ac({ noticeReceived: '2026-05-15', requestReceived: '2026-11-20' }).notes.join(' '), /November 30, 2026/);
});

test('Medicaid: appeal, continued benefits, decision, and the 90-120 state window', () => {
  const r = md({ noticeDate: '2026-10-01' });
  assert.equal(r.deadline, '2026-11-30');
  assert.match(r.notes[0], /October 11, 2026/);
  assert.match(md({ noticeDate: '2026-10-01', effectiveDate: '2026-10-20' }).notes[0], /October 20, 2026/);
  assert.match(md({ noticeDate: '2026-10-01', appealReceived: '2026-10-05', appealType: 'standard', extended: 'yes' }).notes.join(' '), /November 18, 2026/);
  assert.match(md({ noticeDate: '2026-10-01', appealReceived: '2026-10-05T10:00', appealType: 'expedited' }).notes.join(' '), /October 8, 2026, 10:00 am/);
  assert.equal(md({ noticeDate: '2026-10-01', resolutionDate: '2026-11-01', stateWindow: '80' }).valid, false);
  assert.match(md({ noticeDate: '2026-10-01', resolutionDate: '2026-11-01', stateWindow: '90' }).notes.join(' '), /January 30, 2027/);
});

test('QIO: hospital discharge and ending services', () => {
  assert.equal(qi({ setting: 'hospital', keyDate: '2026-10-09' }).deadline, '2026-10-09');
  assert.equal(qi({ setting: 'services', keyDate: '2026-10-09' }).deadline, '2026-10-10T12:00');
  assert.match(qi({ setting: 'services', keyDate: '2026-10-09', servicesEnd: '2026-10-10' }).notes.join(' '), /at least 2 days before/);
  assert.match(qi({ setting: 'services', keyDate: '2026-10-09', servicesEnd: '2026-10-12' }).notes.join(' '), /meeting the 2-day minimum/);
});

test('blanks that decide the answer are asked for', () => {
  for (const r of [er({}), er({ claimType: 'urgent' }), er({ claimType: 'urgent', stage: 'claim', received: '2026-10-01' }),
    er({ claimType: 'pre-service', stage: 'appeal', received: '2026-10-01' }), ac({}), md({}),
    md({ noticeDate: '2026-10-01', appealReceived: '2026-10-05' }), md({ noticeDate: '2026-10-01', resolutionDate: '2026-11-01' }), qi({}), qi({ setting: 'hospital' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});
