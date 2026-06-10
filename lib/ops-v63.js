// spec-v63 §3 Part B: five deterministic, cited operations calculators. Each
// computes its deadline through lib/deadline.js (OA1) or sets a code-set level
// from the published grid, inherits the spec-v59 safety contract (bad/empty/
// impossible input -> TypeError/RangeError, caught by the renderer's safe()
// wrapper, never an Invalid Date or NaN leak), states the rule and cites it, and
// makes no legal-advice or eligibility judgment (the lib/regulatory.js posture).
//
// Dated constants (appeal day-counts, amount-in-controversy thresholds, the
// timely-filing one-year basis, the CMS-0057-F PA windows, the E/M edition) are
// carried as named, ledger-tracked values; their pa-staleness-ledger.json rows
// keep the check-pa-staleness CI gate guarding them (spec-v63 OA4).

import { num } from './num.js';
import { deadline } from './deadline.js';

// --- 3.1 appeal-deadline — Medicare appeal-level deadline (42 CFR Part 405 I) -
// Each step's filing window (calendar days) and the next level it leads to. The
// amount-in-controversy gate (aicUsd) is the dollar minimum required to reach
// the NEXT level (ALJ and federal court only); annually indexed (CY2026 values).
export const APPEAL_AIC_CY2026 = Object.freeze({ alj: 200, court: 1960 });

export const APPEAL_LEVELS = Object.freeze({
  initial: { label: 'Initial determination', nextLabel: 'Redetermination (MAC)', days: 120, cfr: '42 CFR 405.942', aicUsd: 0 },
  redetermination: { label: 'Redetermination (MAC)', nextLabel: 'Reconsideration (QIC)', days: 180, cfr: '42 CFR 405.962', aicUsd: 0 },
  reconsideration: { label: 'Reconsideration (QIC)', nextLabel: 'ALJ / OMHA hearing', days: 60, cfr: '42 CFR 405.1014', aicUsd: APPEAL_AIC_CY2026.alj },
  alj: { label: 'ALJ / OMHA hearing', nextLabel: 'Medicare Appeals Council review', days: 60, cfr: '42 CFR 405.1102', aicUsd: 0 },
  council: { label: 'Medicare Appeals Council review', nextLabel: 'Federal district court', days: 60, cfr: '42 CFR 405.1136', aicUsd: APPEAL_AIC_CY2026.court },
});

export function appealDeadline({ level, decisionDate, now }) {
  const step = APPEAL_LEVELS[String(level)];
  if (!step) return null;
  const d = deadline({ anchor: decisionDate, days: step.days, basis: 'calendar', now });
  return {
    completedLevel: step.label,
    nextLevel: step.nextLabel,
    windowDays: step.days,
    deadline: d.deadline,
    daysRemaining: d.daysRemaining,
    pastDue: d.pastDue,
    aicUsd: step.aicUsd || null,
    cfr: step.cfr,
  };
}

// --- 3.2 timely-filing — claim timely-filing deadline (42 CFR 424.44) --------
// Medicare: one calendar year (365 days) after the date of service. Any other
// payer's limit is user-supplied (no payer directory is shipped or browsable).
export function timelyFiling({ serviceDate, payer, customLimitDays, basis = 'calendar', now }) {
  const p = String(payer);
  let days;
  if (p === 'medicare') {
    days = 365;
  } else {
    if (typeof customLimitDays !== 'number' || !Number.isFinite(customLimitDays)
        || !Number.isInteger(customLimitDays) || customLimitDays <= 0) {
      throw new TypeError('customLimitDays must be a positive integer for a non-Medicare payer');
    }
    days = customLimitDays;
  }
  const d = deadline({ anchor: serviceDate, days, basis: basis === 'business' ? 'business' : 'calendar', now });
  return {
    windowDays: days,
    medicare: p === 'medicare',
    deadline: d.deadline,
    daysRemaining: d.daysRemaining,
    pastDue: d.pastDue,
    basis: d.basis,
  };
}

// --- 3.3 em-mdm — 2021 E/M level by Medical Decision Making (AMA CPT) ---------
// Level set by 2 of 3 of: problems addressed, data reviewed/analyzed, risk. Each
// element is graded 2..5 (straightforward/low/moderate/high). The MDM level is
// the highest level met or exceeded by at least two of the three elements
// (minimum 2 = straightforward). em-mdm covers the MDM path; em-time the time
// path -- the two ways a 2021 office/outpatient visit level is set.
const EM_CODES = Object.freeze({
  2: { newCode: '99202', estCode: '99212', mdm: 'Straightforward' },
  3: { newCode: '99203', estCode: '99213', mdm: 'Low' },
  4: { newCode: '99204', estCode: '99214', mdm: 'Moderate' },
  5: { newCode: '99205', estCode: '99215', mdm: 'High' },
});

export function emMdm({ problems, data, risk }) {
  num('problems', problems, { min: 2, max: 5 });
  num('data', data, { min: 2, max: 5 });
  num('risk', risk, { min: 2, max: 5 });
  const p = Math.round(problems);
  const dt = Math.round(data);
  const rk = Math.round(risk);
  const vals = [p, dt, rk];
  let level = 2;
  for (let L = 5; L >= 2; L -= 1) {
    if (vals.filter((v) => v >= L).length >= 2) { level = L; break; }
  }
  // The two elements at or above the level are the qualifying pair; any element
  // below the level is the limiting element (the "2 of 3" driver).
  const names = ['problems', 'data', 'risk'];
  const limiting = names.filter((_, i) => vals[i] < level);
  const code = EM_CODES[level];
  return {
    level,
    mdm: code.mdm,
    newCode: code.newCode,
    estCode: code.estCode,
    limitingElements: limiting,
  };
}

// --- 3.4 pa-turnaround — prior-authorization decision-deadline (CMS-0057-F) ---
// Impacted-payer standard PA decisions within 7 calendar days; expedited within
// 72 hours (effective 2026). Commercial/ERISA windows are user-supplied.
export const PA_TURNAROUND_CMS0057 = Object.freeze({ standardDays: 7, expeditedHours: 72 });

export function paTurnaround({ requestDate, type, customDays, now }) {
  const t = String(type);
  let days;
  let windowLabel;
  if (t === 'standard') {
    days = PA_TURNAROUND_CMS0057.standardDays;
    windowLabel = '7 calendar days (CMS-0057-F standard)';
  } else if (t === 'expedited') {
    days = PA_TURNAROUND_CMS0057.expeditedHours / 24; // 72 h = 3 calendar days
    windowLabel = '72 hours (CMS-0057-F expedited)';
  } else if (t === 'custom') {
    if (typeof customDays !== 'number' || !Number.isFinite(customDays)
        || !Number.isInteger(customDays) || customDays <= 0) {
      throw new TypeError('customDays must be a positive integer for a plan-specified window');
    }
    days = customDays;
    windowLabel = `${customDays} days (plan-specified)`;
  } else {
    return null;
  }
  const d = deadline({ anchor: requestDate, days, basis: 'calendar', now });
  return {
    windowLabel,
    windowDays: days,
    deadline: d.deadline,
    daysRemaining: d.daysRemaining,
    pastDue: d.pastDue,
  };
}

// --- 3.5 overpayment-60day — 60-day report-and-return clock (ACA 6402) --------
// 42 CFR 401.305 / 42 U.S.C. 1320a-7k(d): an identified Medicare A/B overpayment
// must be reported and returned within 60 days of identification. States the
// rule's deadline only; makes no judgment that an overpayment occurred.
export function overpayment60Day({ identificationDate, now }) {
  const d = deadline({ anchor: identificationDate, days: 60, basis: 'calendar', now });
  return {
    identificationDate: d.anchor,
    deadline: d.deadline,
    daysRemaining: d.daysRemaining,
    pastDue: d.pastDue,
  };
}
