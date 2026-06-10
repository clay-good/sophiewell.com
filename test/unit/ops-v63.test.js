// spec-v63 Part B unit tests. Each tile gets >=3 boundary worked examples
// including the invalid-input fallback (throws TypeError/RangeError, caught by
// the renderer safe() wrapper) and, for the deadline tiles, a pinned `now` so
// the days-remaining/past-due assertions are deterministic.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  appealDeadline, timelyFiling, emMdm, paTurnaround, overpayment60Day, APPEAL_AIC_CY2026,
} from '../../lib/ops-v63.js';
import { parseDate } from '../../lib/pa/date.js';

const NOW = parseDate('2026-06-09');

// --- appeal-deadline --------------------------------------------------------
test('appealDeadline: initial determination -> redetermination, 120-day window', () => {
  const r = appealDeadline({ level: 'initial', decisionDate: '2026-01-15', now: NOW });
  assert.equal(r.nextLevel, 'Redetermination (MAC)');
  assert.equal(r.windowDays, 120);
  assert.equal(r.deadline, '2026-05-15');
  assert.equal(r.aicUsd, null);
});
test('appealDeadline: reconsideration -> ALJ carries the CY2026 AIC gate ($200)', () => {
  const r = appealDeadline({ level: 'reconsideration', decisionDate: '2026-05-01', now: NOW });
  assert.equal(r.windowDays, 60);
  assert.equal(r.deadline, '2026-06-30');
  assert.equal(r.aicUsd, APPEAL_AIC_CY2026.alj);
  assert.equal(r.aicUsd, 200);
  assert.equal(r.pastDue, false);
});
test('appealDeadline: council -> federal court AIC is $1,960; unknown level -> null; bad date throws', () => {
  assert.equal(appealDeadline({ level: 'council', decisionDate: '2026-05-01', now: NOW }).aicUsd, 1960);
  assert.equal(appealDeadline({ level: 'bogus', decisionDate: '2026-05-01', now: NOW }), null);
  assert.throws(() => appealDeadline({ level: 'initial', decisionDate: 'nope', now: NOW }), RangeError);
});

// --- timely-filing ----------------------------------------------------------
test('timelyFiling: Medicare = 365 days from DOS', () => {
  const r = timelyFiling({ serviceDate: '2026-03-01', payer: 'medicare', now: NOW });
  assert.equal(r.windowDays, 365);
  assert.equal(r.deadline, '2027-03-01');
  assert.equal(r.medicare, true);
});
test('timelyFiling: other payer uses the supplied limit', () => {
  const r = timelyFiling({ serviceDate: '2026-03-01', payer: 'cigna', customLimitDays: 90, now: NOW });
  assert.equal(r.windowDays, 90);
  assert.equal(r.deadline, '2026-05-30');
  assert.equal(r.pastDue, true);
});
test('timelyFiling: non-Medicare without a positive integer limit throws', () => {
  assert.throws(() => timelyFiling({ serviceDate: '2026-03-01', payer: 'other', now: NOW }), TypeError);
  assert.throws(() => timelyFiling({ serviceDate: '2026-03-01', payer: 'other', customLimitDays: 0, now: NOW }), TypeError);
});

// --- em-mdm -----------------------------------------------------------------
test('emMdm: 2-of-3 at moderate -> level 4 (99204/99214), data is the limiting element', () => {
  const r = emMdm({ problems: 4, data: 3, risk: 4 });
  assert.equal(r.level, 4);
  assert.equal(r.mdm, 'Moderate');
  assert.equal(r.newCode, '99204');
  assert.equal(r.estCode, '99214');
  assert.deepEqual(r.limitingElements, ['data']);
});
test('emMdm: high needs two elements at 5; one high + two low -> level 3', () => {
  assert.equal(emMdm({ problems: 5, data: 5, risk: 3 }).level, 5);
  assert.equal(emMdm({ problems: 5, data: 3, risk: 3 }).level, 3);
  assert.equal(emMdm({ problems: 2, data: 2, risk: 2 }).level, 2);
});
test('emMdm: out-of-range element throws (no silent miscode)', () => {
  assert.throws(() => emMdm({ problems: 1, data: 3, risk: 4 }), RangeError);
  assert.throws(() => emMdm({ problems: NaN, data: 3, risk: 4 }), TypeError);
});

// --- pa-turnaround ----------------------------------------------------------
test('paTurnaround: CMS-0057-F standard = 7 calendar days', () => {
  const r = paTurnaround({ requestDate: '2026-06-01', type: 'standard', now: NOW });
  assert.equal(r.windowDays, 7);
  assert.equal(r.deadline, '2026-06-08');
});
test('paTurnaround: expedited = 72 hours (3 days); custom window honored; unknown type -> null', () => {
  assert.equal(paTurnaround({ requestDate: '2026-06-01', type: 'expedited', now: NOW }).deadline, '2026-06-04');
  assert.equal(paTurnaround({ requestDate: '2026-06-01', type: 'custom', customDays: 14, now: NOW }).deadline, '2026-06-15');
  assert.equal(paTurnaround({ requestDate: '2026-06-01', type: 'bogus', now: NOW }), null);
});
test('paTurnaround: custom without a positive integer throws; bad date throws', () => {
  assert.throws(() => paTurnaround({ requestDate: '2026-06-01', type: 'custom', customDays: -1, now: NOW }), TypeError);
  assert.throws(() => paTurnaround({ requestDate: 'nope', type: 'standard', now: NOW }), RangeError);
});

// --- overpayment-60day ------------------------------------------------------
test('overpayment60Day: 60 days from identification', () => {
  const r = overpayment60Day({ identificationDate: '2026-05-01', now: NOW });
  assert.equal(r.deadline, '2026-06-30');
  assert.equal(r.identificationDate, '2026-05-01');
  assert.equal(r.pastDue, false);
});
test('overpayment60Day: past-due once the window has elapsed', () => {
  const r = overpayment60Day({ identificationDate: '2026-01-01', now: NOW });
  assert.equal(r.deadline, '2026-03-02');
  assert.equal(r.pastDue, true);
});
test('overpayment60Day: invalid date throws', () => {
  assert.throws(() => overpayment60Day({ identificationDate: '2026-13-40', now: NOW }), RangeError);
});
