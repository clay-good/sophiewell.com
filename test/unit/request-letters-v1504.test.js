// spec-v1504: Part D redetermination and employer-plan appeal builders.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partdRedeterminationRequest as p, erisaAppealLetter as e, maReconsiderationRequest as ma, externalReviewRequest as x, medicaidHearingRequest as mh, partdExceptionRequest as pe, medicalNecessityLetter as mn } from '../../lib/request-letters-v1504.js';

const now = new Date(Date.UTC(2026, 8, 26));

test('Part D: 60 days from presumed receipt; the reason is always a blank for a person', () => {
  const r = p({ noticeDate: '2026-09-10', drug: 'drug 10 mg', enrollee: 'Pat Doe', memberId: 'X1', plan: 'Plan', requester: 'Pat Doe' }, now);
  assert.equal(r.deadline, '2026-11-14');
  assert.equal(r.blanks, 1);
  assert.match(r.sections[1].paragraphs.join(' '), /\[clinical reason/);
});

test('Part D: the expedited sentence only when asked, in the form 423.584 recognizes', () => {
  const r = p({ noticeDate: '2026-09-10', expedited: 'yes', prescriberStatement: 'yes' }, now);
  assert.match(r.sections[1].paragraphs.join(' '), /may seriously jeopardize the enrollee's life or health or ability to regain maximum function/);
  assert.doesNotMatch(p({ noticeDate: '2026-09-10' }, now).sections[1].paragraphs.join(' '), /expedited/);
});

test('Part D: a late request is refused unless good cause is asked for, then carries the 423.582(c) paragraph', () => {
  assert.equal(p({ noticeDate: '2026-06-01' }, now).valid, false);
  const r = p({ noticeDate: '2026-06-01', goodCause: 'yes' }, now);
  assert.match(r.sections[1].paragraphs.join(' '), /good cause/);
  assert.equal(r.deadline, null);
});

test('ERISA: the (h) rights are asserted and the decision clock matches the claim kind', () => {
  const r = e({ denialReceived: '2026-09-01', claimKind: 'post', claimant: 'Pat Doe' }, now);
  const t = r.sections[1].paragraphs.join(' ');
  assert.match(t, /no deference/);
  assert.match(t, /Free copies/);
  assert.match(t, /within 60 days/);
  assert.equal(r.deadline, '2027-02-28');
});

test('blank required inputs ask', () => {
  assert.equal(p({}, now).valid, false);
  assert.equal(e({ denialReceived: '2026-09-01' }, now).valid, false);
});

test('MA reconsideration: 60 days from presumed receipt; expedited never for payment; decision clock by item', () => {
  const r = ma({ noticeDate: '2026-09-10', item: 'partb-drug' }, now);
  assert.equal(r.deadline, '2026-11-14');
  assert.match(r.notes.join(' '), /within 7 days/);
  assert.equal(ma({ noticeDate: '2026-09-10', item: 'payment', expedited: 'yes' }, now).valid, false);
  assert.match(ma({ noticeDate: '2026-09-10', item: 'service', expedited: 'yes', physicianStatement: 'yes' }, now).sections[1].paragraphs.join(' '), /could seriously jeopardize/);
});

test('external review: four months from receipt; deemed exhaustion only when marked', () => {
  const r = x({ denialReceived: '2026-08-31' }, now);
  assert.equal(r.deadline, '2026-12-31');
  assert.doesNotMatch(r.sections[1].paragraphs.join(' '), /deemed/);
  assert.match(x({ denialReceived: '2026-08-31', deemedExhaustion: 'yes' }, now).sections[1].paragraphs.join(' '), /deemed to have exhausted/);
  assert.equal(x({ denialReceived: '2026-04-01' }, now).valid, false);
});

test('Medicaid: a plan appeal in 60 days; a fair hearing needs the state window; continued benefits warn about the 10 days', () => {
  const r = mh({ kind: 'plan', noticeDate: '2026-09-10', keepBenefits: 'yes' }, now);
  assert.equal(r.deadline, '2026-11-09');
  assert.match(r.notes.join(' '), /September 20, 2026/);
  assert.equal(mh({ kind: 'hearing', noticeDate: '2026-09-10' }, now).valid, false);
  assert.equal(mh({ kind: 'hearing', noticeDate: '2026-09-10', stateDays: '120' }, now).valid, false);
  assert.equal(mh({ kind: 'hearing', noticeDate: '2026-09-10', stateDays: '90' }, now).deadline, '2026-12-09');
});

test('Part D exception: the statement standard by kind; a missing statement is flagged and the clock waits', () => {
  const r = pe({ type: 'formulary', basis: 'both', statement: 'yes' }, now);
  assert.match(r.sections[2].paragraphs[0], /all of the covered Part D drugs on any tier/);
  const miss = pe({ type: 'tiering', basis: 'adverse' }, now);
  assert.match(miss.band, /clock has not started/);
  assert.match(miss.sections[2].paragraphs[0], /\[Missing/);
  assert.equal(pe({ type: 'tiering' }, now).valid, false);
  assert.equal(pe({ type: 'dose', statement: 'yes' }, now).valid, true);
});

test('medical necessity: the rationale is always a blank; the lists come one per line', () => {
  const r = mn({ drug: 'drug 40 mg', diagnosis: 'RA, M06.9', labeled: 'yes', patient: 'P', memberId: '1', plan: 'X', prescriber: 'Dr', priorTherapies: 'a\nb', criteria: '1. c' }, now);
  assert.equal(r.blanks, 1);
  assert.deepEqual(r.sections[2].items, ['a', 'b']);
  assert.equal(mn({ drug: 'x' }, now).valid, false);
});
