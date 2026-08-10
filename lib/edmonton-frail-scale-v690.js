// spec-v690: Edmonton Frail Scale (EFS).
//
// A multidimensional frailty screen across nine domains, feasible for non-specialists.
// Source: Rolfson DB, Majumdar SR, Tsuyuki RT, Tahir A, Rockwood K. Validity and reliability
// of the Edmonton Frail Scale. Age Ageing. 2006;35(5):526-529. (PMID 16757522.)
//
// Nine domains summed to a maximum of 17:
//   Cognition (clock-drawing test):           no errors 0 / minor spacing 1 / other errors 2
//   General health - hospitalizations (past year): 0 -> 0 / 1-2 -> 1 / > 2 -> 2
//   General health - self-rated health:       good or better 0 / fair 1 / poor 2
//   Functional independence (# of 8 IADLs needing help): 0-1 -> 0 / 2-4 -> 1 / 5-8 -> 2
//   Social support (help available when needed): always 0 / sometimes 1 / never 2
//   Medication use - >= 5 prescription meds:   no 0 / yes 1
//   Medication use - forgets to take meds:     no 0 / yes 1
//   Nutrition - recent weight loss / clothes looser: no 0 / yes 1
//   Mood - feels sad or depressed:             no 0 / yes 1
//   Continence - urinary incontinence:         no 0 / yes 1
//   Functional performance (Timed Up and Go, 3 m): 0-10 s 0 / 11-20 s 1 / > 20 s or needs help 2
//
// Bands (Rolfson 2006): 0-5 not frail; 6-7 apparently vulnerable; 8-9 mild frailty;
// 10-11 moderate frailty; 12-17 severe frailty.
//
// Pure: no DOM, no clock, no network.

export const EFS_NOTE = 'Edmonton Frail Scale (EFS) (Rolfson DB, Majumdar SR, Tsuyuki RT, Tahir A, Rockwood K, Age Ageing 2006;35(5):526-529). A multidimensional frailty screen across nine domains, feasible for non-specialists, summed to a maximum of 17: cognition by a clock-drawing test (0 to 2), general health from hospitalizations in the past year (0 to 2) and self-rated health (0 to 2), functional independence from the number of instrumental activities of daily living needing help (0 to 2), social support (0 to 2), medication use from taking five or more prescription drugs (1) and forgetting medications (1), recent weight loss (1), low mood (1), urinary incontinence (1), and functional performance by a timed up-and-go test (0 to 2). Totals map to bands: 0 to 5 not frail, 6 to 7 apparently vulnerable, 8 to 9 mild frailty, 10 to 11 moderate frailty, and 12 to 17 severe frailty. It is a screening aid to flag frailty and prompt further assessment, not a diagnosis, and it supports rather than replaces clinical judgment.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function optIn(v, allowed) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || !allowed.includes(n)) return null;
  return n;
}

const SELECTS = [
  { key: 'cognition', allowed: [0, 1, 2] },
  { key: 'hospitalizations', allowed: [0, 1, 2] },
  { key: 'selfRatedHealth', allowed: [0, 1, 2] },
  { key: 'iadlHelp', allowed: [0, 1, 2] },
  { key: 'socialSupport', allowed: [0, 1, 2] },
  { key: 'timedUpGo', allowed: [0, 1, 2] },
];
const CHECKS = ['meds5plus', 'medsForget', 'weightLoss', 'lowMood', 'incontinence'];

function band(total) {
  if (total <= 5) return { tier: 'not-frail', label: 'not frail' };
  if (total <= 7) return { tier: 'vulnerable', label: 'apparently vulnerable' };
  if (total <= 9) return { tier: 'mild', label: 'mild frailty' };
  if (total <= 11) return { tier: 'moderate', label: 'moderate frailty' };
  return { tier: 'severe', label: 'severe frailty' };
}

export function edmontonFrailScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const s of SELECTS) {
    const v = optIn(o[s.key], s.allowed);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: s.key, message: `Select a valid score (0-2) for ${s.key}.`, note: EFS_NOTE };
    }
    total += v;
  }
  for (const k of CHECKS) if (truthy(o[k])) total += 1;

  const b = band(total);
  return {
    valid: true,
    score: total,
    tier: b.tier,
    // Flag mild frailty or worse (>= 8) as the actionable result.
    abnormal: total >= 8,
    bandLabel: `Edmonton Frail Scale ${total} of 17`,
    band: `Edmonton Frail Scale ${total} of 17 — ${b.label}.`,
    detail: 'Bands: 0-5 not frail, 6-7 apparently vulnerable, 8-9 mild, 10-11 moderate, 12-17 severe frailty.',
    note: EFS_NOTE,
  };
}
