// spec-v776: PFIQ-7 (Pelvic Floor Impact Questionnaire, short form).
//
// Source:
//   Barber MD, Walters MD, Bump RC. Short forms of two condition-specific
//   quality-of-life questionnaires for women with pelvic floor disorders
//   (PFDI-20 and PFIQ-7). Am J Obstet Gynecol. 2005;193(1):103-113. (PMID 16021067.)
//
// The same seven life-impact questions are asked three times, once about each organ
// system, giving 21 items in three scales:
//   UIQ-7    bladder or urine
//   CRAIQ-7  bowel or rectum
//   POPIQ-7  vagina or pelvis
//
// Each item is rated 0 (not at all) to 3 (quite a bit). Each scale scores as the mean
// of its ANSWERED items multiplied by 100/3, giving 0-100; the summary adds the three
// scales, giving 0-300. Higher is more impact. Only neutral topic labels are used; the
// questionnaire wording is copyrighted.
//
// The companion of the PFDI-20: distress asks how much symptoms bother you, impact asks
// how much they interfere with your life.
//
// Pure: no DOM, no clock, no network.

export const PFIQ7_NOTE = 'The PFIQ-7, the short-form Pelvic Floor Impact Questionnaire (Barber MD, Walters MD, Bump RC, Am J Obstet Gynecol 2005;193(1):103-113), asks the same seven questions about everyday life three times over, once about bladder or urine symptoms, once about bowel or rectal symptoms, and once about vaginal or pelvic symptoms. Each of the 21 items is rated 0 (not at all) to 3 (quite a bit), each scale scores as the mean of its answered items multiplied by 100 divided by 3 for a range of 0 to 100, and the summary adds the three scales for a range of 0 to 300. Higher means more interference with daily life. It is the impact companion of the PFDI-20, which measures symptom bother; both are ways to follow change over time in one patient rather than a diagnosis, an examination, or a prolapse stage.';

const SCALES = [
  { key: 'uiq', label: 'UIQ-7', prefix: 'u' },
  { key: 'craiq', label: 'CRAIQ-7', prefix: 'c' },
  { key: 'popiq', label: 'POPIQ-7', prefix: 'p' },
];

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) return undefined;
  return n;
}

export function pfiq7(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scores = {};
  const answered = {};
  for (const sc of SCALES) {
    let sum = 0;
    let count = 0;
    for (let i = 1; i <= 7; i += 1) {
      const arg = `${sc.prefix}${i}`;
      const v = optIn(o[arg]);
      if (v === undefined) {
        return { valid: false, code: 'INVALID_INPUT', field: arg, message: `Rate ${sc.label} question ${i} from 0 to 3.`, note: PFIQ7_NOTE };
      }
      if (v === null) continue;
      sum += v;
      count += 1;
    }
    if (count === 0) {
      return { valid: false, code: 'MISSING_INPUT', field: `${sc.prefix}1`, message: `Answer at least one ${sc.label} question.`, note: PFIQ7_NOTE };
    }
    scores[sc.key] = Math.round((sum / count) * (100 / 3) * 100) / 100;
    answered[sc.key] = count;
  }

  const total = Math.round((scores.uiq + scores.craiq + scores.popiq) * 100) / 100;
  // 100/3 does not terminate, so show two decimals: the parts must visibly add up.
  const fmt = (n) => n.toFixed(2);

  return {
    valid: true,
    uiq: scores.uiq,
    craiq: scores.craiq,
    popiq: scores.popiq,
    total,
    answered,
    // Any reported interference is the actionable state; 0 across all three is impact-free.
    abnormal: total > 0,
    bandLabel: `PFIQ-7 ${fmt(total)} of 300`,
    band: `PFIQ-7 summary ${fmt(total)} of 300 — UIQ-7 ${fmt(scores.uiq)}, CRAIQ-7 ${fmt(scores.craiq)}, POPIQ-7 ${fmt(scores.popiq)}, each of 100.`,
    detail: 'Each scale is the mean of its answered items multiplied by 100 divided by 3, so each runs 0 to 100; the summary adds the three, so it runs 0 to 300. Higher is more interference with daily life. The 2005 source publishes no severity cutoff, so this tile reports the scores and asserts no band; the scales are most useful compared against the same patient before and after treatment.',
    note: PFIQ7_NOTE,
  };
}
