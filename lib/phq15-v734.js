// spec-v734: PHQ-15 (Patient Health Questionnaire-15, somatic symptom severity).
//
// A 15-item self-report of somatic symptom burden over the past 4 weeks.
// Source:
//   Kroenke K, Spitzer RL, Williams JB. The PHQ-15: validity of a new measure for
//   evaluating the severity of somatic symptoms. Psychosom Med. 2002;64(2):258-266.
//   (PMID 11914441.) The PHQ instruments are free to use without permission.
//
// Fifteen somatic symptoms, each rated 0 (not bothered at all), 1 (bothered a little),
// 2 (bothered a lot), summed to a total of 0-30. Severity bands:
//   0-4 minimal, 5-9 low, 10-14 medium, 15-30 high somatic symptom severity.
// Higher = greater somatic symptom burden.
//
// Pure: no DOM, no clock, no network.

export const PHQ15_NOTE = "PHQ-15 (Patient Health Questionnaire-15) (Kroenke K et al, Psychosom Med 2002;64(2):258-266), a fifteen-item self-report of somatic symptom burden over the past four weeks. Each symptom is rated 0 (not bothered at all), 1 (bothered a little), or 2 (bothered a lot), and the ratings are summed to a total of 0 to 30. A total of 0 to 4 is minimal, 5 to 9 low, 10 to 14 medium, and 15 to 30 high somatic symptom severity, with higher meaning a greater burden. It is a self-report screen of somatic symptoms, not a diagnosis, and it supports rather than replaces the clinical evaluation.";

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 2) return null;
  return n;
}

const ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15'];

function bandFor(total) {
  if (total >= 15) return { tier: 'high', range: '15-30' };
  if (total >= 10) return { tier: 'medium', range: '10-14' };
  if (total >= 5) return { tier: 'low', range: '5-9' };
  return { tier: 'minimal', range: '0-4' };
}

export function phq15(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const k of ITEMS) {
    const v = optIn(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Rate ${k} from 0 to 2.`, note: PHQ15_NOTE };
    }
    total += v;
  }

  const b = bandFor(total);
  // Medium or high (total 10 or more) is the actionable somatic-symptom-burden state.
  const abnormal = total >= 10;
  return {
    valid: true,
    score: total,
    tier: b.tier,
    abnormal,
    bandLabel: `PHQ-15 ${total} of 30`,
    band: `PHQ-15 ${total} of 30 — ${b.tier} somatic symptom severity (${b.range}).`,
    detail: abnormal
      ? 'Total 10 or more (medium-high): a clinically meaningful somatic symptom burden - consider further evaluation.'
      : 'Total under 10 (minimal-low): below the medium-severity band; reassess if symptoms change.',
    note: PHQ15_NOTE,
  };
}
