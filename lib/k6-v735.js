// spec-v735: Kessler Psychological Distress Scale (K6).
//
// A 6-item self-report screen of nonspecific psychological distress over the past 30 days.
// Source:
//   Kessler RC, Barker PR, Colpe LJ, et al. Screening for serious mental illness in the
//   general population. Arch Gen Psychiatry. 2003;60(2):184-189. (PMID 12578436.)
//   The K6 is in the public domain.
//
// Six items, each rated 0 (none of the time) to 4 (all of the time), summed to 0-24. A
// total of 13 or more indicates probable serious mental illness (SMI). Scores of 5-12 are
// commonly described as mild-to-moderate distress. Higher = more distress.
//
// Pure: no DOM, no clock, no network.

export const K6_NOTE = "Kessler Psychological Distress Scale (K6) (Kessler RC et al, Arch Gen Psychiatry 2003;60(2):184-189), a six-item self-report screen of nonspecific psychological distress over the past 30 days. Each item is rated from 0 (none of the time) to 4 (all of the time), and the ratings are summed to a total of 0 to 24. A total of 13 or more indicates probable serious mental illness, and scores of 5 to 12 are commonly described as mild to moderate distress, with higher meaning more distress. It is a self-report screen of distress, not a diagnosis, and it supports rather than replaces the clinical evaluation.";

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 4) return null;
  return n;
}

const ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

function bandFor(total) {
  if (total >= 13) return { tier: 'serious', range: '13-24' };
  if (total >= 5) return { tier: 'mild-moderate', range: '5-12' };
  return { tier: 'low', range: '0-4' };
}

export function k6(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const k of ITEMS) {
    const v = optIn(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Rate ${k} from 0 to 4.`, note: K6_NOTE };
    }
    total += v;
  }

  const b = bandFor(total);
  // A total of 13 or more (probable serious mental illness) is the actionable state.
  const abnormal = total >= 13;
  const label = b.tier === 'serious' ? 'probable serious mental illness' : b.tier === 'mild-moderate' ? 'mild-to-moderate distress' : 'low distress';
  return {
    valid: true,
    score: total,
    tier: b.tier,
    abnormal,
    bandLabel: `K6 ${total} of 24`,
    band: `K6 ${total} of 24 — ${label} (${b.range}).`,
    detail: abnormal
      ? 'Total 13 or more: screens positive for probable serious mental illness - consider further evaluation.'
      : 'Total under 13: below the serious-mental-illness threshold; reassess if symptoms change.',
    note: K6_NOTE,
  };
}
