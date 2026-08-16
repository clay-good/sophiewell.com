// spec-v737: Short Michigan Alcoholism Screening Test (SMAST).
//
// A 13-item self-administered yes/no screen for alcohol problems.
// Source:
//   Selzer ML, Vinokur A, van Rooijen L. A self-administered Short Michigan
//   Alcoholism Screening Test (SMAST). J Stud Alcohol. 1975;36(1):117-126.
//   (PMID 238068.) The SMAST is in the public domain.
//
// Thirteen yes/no items, each scoring 1 point. Items 1, 4, and 5 are reverse-keyed
// (a "no" earns the point); the other ten items score on a "yes". The points sum to
// 0-13. Bands (Selzer 1975): 0-1 no problem, 2 borderline, 3 or more probable alcohol
// problem (positive screen). Higher = more indication of a drinking problem.
//
// Pure: no DOM, no clock, no network.

export const SMAST_NOTE = "Short Michigan Alcoholism Screening Test (SMAST) (Selzer ML et al, J Stud Alcohol 1975;36(1):117-126), a 13-item self-administered yes/no screen for alcohol problems. Each item scores 1 point; items 1, 4, and 5 are reverse-keyed so a 'no' earns the point, while the other ten items score on a 'yes'. The points sum to a total of 0 to 13. A total of 3 or more screens positive for a probable alcohol problem, a total of 2 is borderline, and 0 to 1 indicates no problem, with higher meaning more indication of a drinking problem. It is a self-report screen, not a diagnosis, and it supports rather than replaces the clinical evaluation.";

function optYN(v) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (s === 'yes' || s === 'y' || s === 'true' || s === '1') return 'yes';
  if (s === 'no' || s === 'n' || s === 'false' || s === '0') return 'no';
  return null;
}

const ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13'];
// Items 1, 4, 5 score a point on "no"; every other item scores a point on "yes".
const REVERSE = new Set(['q1', 'q4', 'q5']);

function bandFor(total) {
  if (total >= 3) return { tier: 'positive', range: '3-13' };
  if (total === 2) return { tier: 'borderline', range: '2' };
  return { tier: 'none', range: '0-1' };
}

export function smast(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const k of ITEMS) {
    const v = optYN(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Answer ${k} yes or no.`, note: SMAST_NOTE };
    }
    const scores = REVERSE.has(k) ? v === 'no' : v === 'yes';
    if (scores) total += 1;
  }

  const b = bandFor(total);
  // A total of 3 or more (probable alcohol problem) is the actionable, positive-screen state.
  const abnormal = total >= 3;
  const label = b.tier === 'positive' ? 'probable alcohol problem' : b.tier === 'borderline' ? 'borderline' : 'no problem indicated';
  return {
    valid: true,
    score: total,
    tier: b.tier,
    abnormal,
    bandLabel: `SMAST ${total} of 13`,
    band: `SMAST ${total} of 13 — ${label} (${b.range}).`,
    detail: abnormal
      ? 'Total 3 or more: screens positive for a probable alcohol problem - consider further assessment.'
      : b.tier === 'borderline'
        ? 'Total 2: borderline; consider further inquiry and reassess.'
        : 'Total under 2: below the borderline threshold; reassess if concern arises.',
    note: SMAST_NOTE,
  };
}
