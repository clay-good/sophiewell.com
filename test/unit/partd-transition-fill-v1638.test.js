// spec-v1638 tool 3: the Part D transition supply.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partdTransitionFill } from '../../lib/partd-transition-fill-v1638.js';

const t = (o) => partdTransitionFill({ drugStatus: 'non-formulary-drug', coverageEffective: '2026-01-01', requested: '2026-02-10', monthDays: 30, alreadySupplied: 0, immediateChange: 'not-under-e2', ...o });

test('inside the first 90 days a month\'s supply is owed; day 90 is in, day 91 is out', () => {
  const r = t({});
  assert.deepEqual([r.flag, r.daysOwed, r.windowEnds, r.coverageDay], ['transition-supply-owed', 30, '2026-03-31', 41]);
  assert.equal(t({ requested: '2026-03-31' }).daysOwed, 30);
  assert.deepEqual([t({ requested: '2026-04-01' }).flag, t({ requested: '2026-04-01' }).coverageDay], ['not-owed', 91]);
});

test('days already supplied reduce what is owed; a short prescription takes multiple fills', () => {
  assert.equal(t({ alreadySupplied: 14 }).daysOwed, 16);
  assert.equal(t({ alreadySupplied: 30 }).flag, 'already-supplied');
  const s = t({ daysWritten: 14 });
  assert.deepEqual([s.daysThisFill, s.daysOwed], [14, 30]);
  assert.match(s.notes.join(' '), /multiple fills up to a total of 30 days/);
});

test('prior authorization or step therapy counts; an unrestricted formulary drug and an immediate change do not', () => {
  assert.equal(t({ drugStatus: 'formulary-with-pa-or-step' }).flag, 'transition-supply-owed');
  assert.equal(t({ drugStatus: 'formulary-no-restriction' }).flag, 'not-owed');
  assert.equal(t({ immediateChange: 'formulary-change-under-e2' }).flag, 'not-owed');
});

test('the notice is due within 3 business days of adjudication', () => {
  // Adjudicated Friday October 9, 2026; Monday October 12 is a federal holiday: Tue 13, Wed 14, Thu 15.
  assert.equal(t({ adjudicated: '2026-10-09', coverageEffective: '2026-09-01', requested: '2026-10-09' }).noticeDue, '2026-10-15');
});

test('refusals', () => {
  assert.match(partdTransitionFill({}).message, /^Choose the drug's status/);
  assert.match(t({ coverageEffective: '' }).message, /^Enter the date coverage/);
  assert.match(t({ requested: '2025-12-31' }).message, /not before coverage took effect/);
  assert.match(t({ alreadySupplied: '' }).message, /already supplied/);
  assert.match(t({ immediateChange: '' }).message, /^Choose whether this is an immediate formulary change/);
});

// CMS manual chapter 6 (Rev. 18), re-read October 14, 2026: 30.4.6 and 30.4.5.
test('outside the 90 days a long-term care resident gets a 31-day emergency supply, once per drug per stay', () => {
  const late = { requested: '2026-04-01' };
  const r = t({ ...late, ltcResident: 'yes', priorEmergency: 'no' });
  assert.deepEqual([r.flag, r.emergencyDays, r.daysOwed], ['ltc-emergency-supply', 31, 0]);
  assert.match(r.band, /emergency supply of 31 days \(CMS manual\)/);
  assert.match(r.notes.join(' '), /CMS manual guidance, not the regulation/);
  assert.equal(t({ ...late, ltcResident: 'yes', priorEmergency: 'no', daysWritten: 14 }).emergencyDays, 14);
  assert.equal(t({ ...late, ltcResident: 'yes', priorEmergency: 'yes' }).flag, 'ltc-emergency-already-given');
  assert.match(t({ ...late, ltcResident: 'yes' }).message, /^Choose whether an emergency supply of this drug was already given/);
  assert.equal(t({ ...late, ltcResident: 'no' }).flag, 'not-owed');
  assert.match(t(late).notes.join(' '), /long-term care facility was not entered/);
  // Inside the window, an unrestricted drug, or an immediate change: no emergency supply arises.
  assert.equal(t({ ltcResident: 'yes', priorEmergency: 'no' }).flag, 'transition-supply-owed');
  assert.equal(t({ ...late, drugStatus: 'formulary-no-restriction', ltcResident: 'yes', priorEmergency: 'no' }).flag, 'not-owed');
  assert.equal(t({ ...late, immediateChange: 'formulary-change-under-e2', ltcResident: 'yes', priorEmergency: 'no' }).flag, 'not-owed');
});

test('a continuing member whose drug changed for the new year counts 90 days from January 1', () => {
  const r = t({ memberType: 'continuing-new-year', coverageEffective: '2027-01-01', requested: '2027-02-01' });
  assert.deepEqual([r.flag, r.windowEnds], ['transition-supply-owed', '2027-03-31']);
  assert.match(r.notes.join(' '), /beginning January 1.*manual's guidance, not the rule's text/);
  assert.match(t({ memberType: 'continuing-new-year', coverageEffective: '2027-02-01', requested: '2027-02-10' }).message, /enter January 1 of that year/);
});
