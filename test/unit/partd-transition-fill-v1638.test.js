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
  assert.match(s.note, /multiple fills up to a total of 30 days/);
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
