// spec-v732: Fatigue Severity Scale (FSS).
//
// A 9-item self-report scale of the impact of fatigue on daily functioning.
// Source:
//   Krupp LB, LaRocca NG, Muir-Nash J, Steinberg AD. The fatigue severity scale.
//   Application to patients with multiple sclerosis and systemic lupus erythematosus.
//   Arch Neurol. 1989;46(10):1121-1123. (PMID 2803071.)
//
// Nine statements, each rated 1 (strongly disagree) to 7 (strongly agree). The score is
// the mean of the nine item ratings (range 1-7). A mean of 4 or greater is commonly used
// as the threshold for clinically significant fatigue. Only neutral item-topic labels are
// used; the statement wording is copyrighted.
//
// Higher = more fatigue impact.
//
// Pure: no DOM, no clock, no network.

export const FSS_NOTE = "Fatigue Severity Scale (FSS) (Krupp LB et al, Arch Neurol 1989;46(10):1121-1123), a nine-item self-report scale of how much fatigue affects motivation, exercise, physical functioning, and daily, work, family, and social life. Each of the nine statements is rated from 1 (strongly disagree) to 7 (strongly agree), and the score is the mean of the nine ratings, from 1 to 7. A higher mean means greater fatigue impact, and a mean of 4 or greater is commonly used as the threshold for clinically significant fatigue. It is a self-report screen of fatigue impact, not a diagnosis, and it supports rather than replaces the clinical evaluation.";

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 1 || n > 7) return null;
  return n;
}

const ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];

export function fss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let sum = 0;
  for (const k of ITEMS) {
    const v = optIn(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Rate ${k} from 1 to 7.`, note: FSS_NOTE };
    }
    sum += v;
  }

  const mean = sum / 9;
  const meanText = mean.toFixed(2);
  const significant = mean >= 4;
  return {
    valid: true,
    sum,
    mean,
    meanText,
    tier: significant ? 'significant-fatigue' : 'low-fatigue',
    // A mean of 4 or greater is the actionable (clinically significant) state.
    abnormal: significant,
    bandLabel: `FSS mean ${meanText} of 7`,
    band: `FSS mean ${meanText} of 7 (sum ${sum} of 63) — ${significant ? 'clinically significant fatigue' : 'below the fatigue threshold'} (mean >= 4 is significant).`,
    detail: significant
      ? 'Mean 4 or greater: fatigue impact in the clinically significant range - consider evaluation of contributing causes.'
      : 'Mean under 4: below the common fatigue-significance threshold; reassess if symptoms change.',
    note: FSS_NOTE,
  };
}
