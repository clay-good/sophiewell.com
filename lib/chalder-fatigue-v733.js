// spec-v733: Chalder Fatigue Scale (CFQ-11, the Fatigue Questionnaire).
//
// An 11-item self-report scale of physical and mental fatigue.
// Source:
//   Chalder T, Berelowitz G, Pawlikowska T, et al. Development of a fatigue scale.
//   J Psychosom Res. 1993;37(2):147-153. (PMID 8463991.)
//
// Eleven items (physical: items 1-7; mental: items 8-11), each rated 0-3 relative to
// feeling well: 0 less than usual, 1 no more than usual, 2 more than usual, 3 much more
// than usual. Two scoring methods:
//   Likert:  each item 0-1-2-3, summed to 0-33.
//   Bimodal: each item mapped 0/1 -> 0 and 2/3 -> 1, summed to 0-11.
// A bimodal total of 4 or more indicates fatigue "caseness". Higher = more fatigue.
// Only neutral item-topic labels are used; the item wording is copyrighted.
//
// Pure: no DOM, no clock, no network.

export const CHALDER_NOTE = "Chalder Fatigue Scale (CFQ-11) (Chalder T et al, J Psychosom Res 1993;37(2):147-153), an eleven-item self-report scale of physical fatigue (items 1-7) and mental fatigue (items 8-11). Each item is rated from 0 to 3 relative to feeling well. Likert scoring sums the items 0-3 to a total of 0 to 33, and bimodal scoring maps each item to 0 or 1 and sums to a total of 0 to 11, where a bimodal total of 4 or more indicates fatigue caseness. A higher score means more fatigue. It is a self-report screen of fatigue, not a diagnosis, and it supports rather than replaces the clinical evaluation.";

function optIn(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) return null;
  return n;
}

const ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11'];

export function chalderFatigue(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let likert = 0;
  let bimodal = 0;
  for (const k of ITEMS) {
    const v = optIn(o[k]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Rate ${k} from 0 to 3.`, note: CHALDER_NOTE };
    }
    likert += v;
    bimodal += v >= 2 ? 1 : 0;
  }

  const caseness = bimodal >= 4;
  return {
    valid: true,
    likert,
    bimodal,
    tier: caseness ? 'fatigue-case' : 'below-caseness',
    // Bimodal 4 or more is the actionable (fatigue-caseness) state.
    abnormal: caseness,
    bandLabel: `CFQ-11 bimodal ${bimodal} of 11`,
    band: `CFQ-11 bimodal ${bimodal} of 11 (Likert ${likert} of 33) — ${caseness ? 'fatigue caseness' : 'below caseness'} (bimodal >= 4 is a case).`,
    detail: caseness
      ? 'Bimodal 4 or more: meets the fatigue-caseness threshold - consider evaluation of contributing causes.'
      : 'Bimodal under 4: below the fatigue-caseness threshold; reassess if symptoms change.',
    note: CHALDER_NOTE,
  };
}
