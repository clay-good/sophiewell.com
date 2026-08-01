// spec-v629 wave 9: regulatory-deadline calculators from lib/ops-v63.js
// (non-clinical / administrative).
//
// DETERMINISM: these fns also return `daysRemaining` / `pastDue` relative to
// "today", so identical inputs would give different output on different days.
// stripNow drops those clock-relative fields, leaving only the deadline DATE and
// window (computed from the anchor date alone, no clock) so the MCP result is
// byte-identical for the same inputs. An agent computes days-remaining itself
// from the returned deadline against its own "today".

import * as O from '../../lib/ops-v63.js';

const stripNow = (raw) => {
  const { daysRemaining, pastDue, ...rest } = raw;
  return rest;
};

export default [
  {
    id: 'appeal-deadline',
    summary: 'Medicare claim-appeal deadline: from the level just completed and the decision date, the next level, its filing window, and the deadline date.',
    compute: O.appealDeadline,
    formatResult: stripNow,
    fields: [
      { dom: 'apd-level', arg: 'level', kind: 'string', required: true, label: 'Level just completed (e.g. initial, redetermination, reconsideration)' },
      { dom: 'apd-date', arg: 'decisionDate', kind: 'string', required: true, label: 'Decision / notice date (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'timely-filing',
    summary: 'Timely-filing deadline: the payer window (Medicare 365 days, or a custom limit) from the date of service and the deadline date.',
    compute: O.timelyFiling,
    formatResult: stripNow,
    fields: [
      { dom: 'tf-date', arg: 'serviceDate', kind: 'string', required: true, label: 'Date of service (YYYY-MM-DD)' },
      { dom: 'tf-payer', arg: 'payer', kind: 'string', required: true, label: 'Payer (e.g. medicare, medicaid, commercial)' },
      { dom: 'tf-limit', arg: 'customLimitDays', kind: 'number', label: 'Custom filing limit in days (overrides the payer default)' },
    ],
  },
  {
    id: 'pa-turnaround',
    summary: 'Prior-authorization decision deadline under CMS-0057-F: the standard or expedited window from the request date and the decision-due date.',
    compute: O.paTurnaround,
    formatResult: stripNow,
    fields: [
      { dom: 'pat-date', arg: 'requestDate', kind: 'string', required: true, label: 'Request date (YYYY-MM-DD)' },
      { dom: 'pat-type', arg: 'type', kind: 'string', required: true, label: 'Type: standard or expedited' },
      { dom: 'pat-days', arg: 'customDays', kind: 'number', label: 'Custom window in days (overrides the default)' },
    ],
  },
  {
    id: 'overpayment-60day',
    summary: 'Medicare 60-day overpayment report-and-return deadline from the identification date (42 CFR 401.305).',
    compute: O.overpayment60Day,
    // strip the clock-relative fields and surface the statutory 60-day window.
    formatResult: (raw) => ({ ...stripNow(raw), windowDays: 60 }),
    fields: [
      { dom: 'ov-date', arg: 'identificationDate', kind: 'string', required: true, label: 'Overpayment identification date (YYYY-MM-DD)' },
    ],
  },
];
