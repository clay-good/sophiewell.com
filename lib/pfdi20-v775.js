// spec-v775: PFDI-20 (Pelvic Floor Distress Inventory, short form).
//
// Source:
//   Barber MD, Walters MD, Bump RC. Short forms of two condition-specific
//   quality-of-life questionnaires for women with pelvic floor disorders
//   (PFDI-20 and PFIQ-7). Am J Obstet Gynecol. 2005;193(1):103-113. (PMID 16021067.)
//
// Twenty items in three subscales. Each item is 0 (symptom absent) or a bother
// rating of 1 (not at all) to 4 (quite a bit):
//   POPDI-6  items 1-6    pelvic organ prolapse distress
//   CRADI-8  items 7-14   colorectal-anal distress
//   UDI-6    items 15-20  urinary distress
//
// Each subscale scores as the mean of its ANSWERED items multiplied by 25, giving
// 0-100. The summary score is the three subscale scores added together, giving
// 0-300. Higher is more distress on every scale. Only neutral symptom-topic labels
// are used; the questionnaire wording is copyrighted.
//
// Pure: no DOM, no clock, no network.

export const PFDI20_NOTE = 'The PFDI-20, the short-form Pelvic Floor Distress Inventory (Barber MD, Walters MD, Bump RC, Am J Obstet Gynecol 2005;193(1):103-113), measures how much pelvic floor symptoms bother a woman across three areas: prolapse (POPDI-6, 6 items), colorectal and anal symptoms (CRADI-8, 8 items), and urinary symptoms (UDI-6, 6 items). Each item is 0 if the symptom is absent or a bother rating of 1 to 4, each subscale scores as the mean of its answered items multiplied by 25 for a range of 0 to 100, and the summary score adds the three subscales for a range of 0 to 300. Higher means more distress. It measures symptom bother reported by the patient, so it is a way to follow change over time rather than a diagnosis, a physical examination, or a prolapse stage.';

const GROUPS = [
  { key: 'popdi', label: 'POPDI-6', args: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] },
  { key: 'cradi', label: 'CRADI-8', args: ['q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14'] },
  { key: 'udi', label: 'UDI-6', args: ['q15', 'q16', 'q17', 'q18', 'q19', 'q20'] },
];

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 4) return undefined;
  return n;
}

export function pfdi20(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scores = {};
  const answered = {};
  for (const g of GROUPS) {
    let sum = 0;
    let count = 0;
    for (const a of g.args) {
      const v = optIn(o[a]);
      if (v === undefined) {
        return { valid: false, code: 'INVALID_INPUT', field: a, message: `Rate item ${a.slice(1)} from 0 to 4.`, note: PFDI20_NOTE };
      }
      if (v === null) continue;
      sum += v;
      count += 1;
    }
    if (count === 0) {
      return { valid: false, code: 'MISSING_INPUT', field: g.args[0], message: `Answer at least one ${g.label} item.`, note: PFDI20_NOTE };
    }
    scores[g.key] = Math.round((sum / count) * 25 * 100) / 100;
    answered[g.key] = count;
  }

  const total = Math.round((scores.popdi + scores.cradi + scores.udi) * 100) / 100;
  const fmt = (n) => n.toFixed(1);

  return {
    valid: true,
    popdi: scores.popdi,
    cradi: scores.cradi,
    udi: scores.udi,
    total,
    answered,
    // Any reported bother is the actionable state; 0 across all three is symptom-free.
    abnormal: total > 0,
    bandLabel: `PFDI-20 ${fmt(total)} of 300`,
    band: `PFDI-20 summary ${fmt(total)} of 300 — POPDI-6 ${fmt(scores.popdi)}, CRADI-8 ${fmt(scores.cradi)}, UDI-6 ${fmt(scores.udi)}, each of 100.`,
    detail: 'Each subscale is the mean of its answered items multiplied by 25, so each runs 0 to 100; the summary adds the three, so it runs 0 to 300. Higher is more distress. The 2005 source publishes no severity cutoff, so this tile reports the scores and asserts no band; the scales are most useful compared against the same patient before and after treatment.',
    note: PFDI20_NOTE,
  };
}
