// spec-v785: OLBI (Oldenburg Burnout Inventory).
//
// Source:
//   Demerouti E, Bakker AB, Vardakou I, Kantas A. The convergent validity of two
//   burnout instruments: a multitrait-multimethod analysis. Eur J Psychol Assess.
//   2003;19(1):12-23; English validation Halbesleben JRB, Demerouti E. Work & Stress.
//   2005;19(3):208-220.
//
// Sixteen statements, each answered strongly agree / agree / disagree / strongly disagree.
// Two subscales of eight:
//   Exhaustion     items 2, 4, 5, 8, 10, 12, 14, 16
//   Disengagement  items 1, 3, 6, 7, 9, 11, 13, 15
//
// HALF THE ITEMS ARE REVERSE SCORED, and that is the whole difficulty of the instrument:
//   items 1, 5, 7, 10, 13, 14, 15, 16   strongly agree 1 ... strongly disagree 4
//   items 2, 3, 4, 6, 8, 9, 11, 12      strongly agree 4 ... strongly disagree 1
// Both subscales mix the two directions, so neither can be scored by just adding up
// answers. This tile takes the raw answer and applies the direction itself.
//
// Each subscale sums 8 to 32 and the total 16 to 64. Higher is more burnout.
//
// There is NO consensus cutoff: published sources disagree, some offering bands and
// others stating plainly that no widespread agreement exists. No band is asserted.
//
// The item wording belongs to the OLBI form and is not reproduced here; the tile
// identifies each item by its number, subscale and scoring direction.
//
// Pure: no DOM, no clock, no network.

export const OLBI_NOTE = 'The Oldenburg Burnout Inventory (Demerouti E, Bakker AB, Vardakou I, Kantas A, Eur J Psychol Assess 2003;19(1):12-23; English validation Halbesleben JRB, Demerouti E, Work and Stress 2005;19(3):208-220) measures burnout as two things: exhaustion and disengagement from the work itself. Sixteen statements are answered from strongly agree to strongly disagree, eight belonging to each subscale, and each subscale sums from 8 to 32 while the total runs 16 to 64, with higher meaning more burnout. Half of the items are reverse scored and both subscales mix the two directions, so neither can be scored by simply adding up the answers, which is the single easiest thing to get wrong about this instrument. There is no consensus cutoff: published sources offer different bands or state that no widespread agreement exists, so no threshold is asserted here. Unlike the Copenhagen inventory it measures withdrawal from the work as well as tiredness, and it is a self-report measure rather than a clinical diagnosis or an occupational-health determination.';

const EXHAUSTION = [2, 4, 5, 8, 10, 12, 14, 16];
const DISENGAGEMENT = [1, 3, 6, 7, 9, 11, 13, 15];
export const REVERSE_SCORED = [2, 3, 4, 6, 8, 9, 11, 12];

const ANSWERS = { 'strongly-agree': 1, agree: 2, disagree: 3, 'strongly-disagree': 4 };

function score(answer, item) {
  const base = ANSWERS[answer];
  if (base === undefined) return undefined;
  // Reverse-scored items run the other way: strongly agree is the most burnt-out answer.
  return REVERSE_SCORED.includes(item) ? 5 - base : base;
}

function subscale(o, items, label) {
  let sum = 0;
  for (const i of items) {
    const raw = o[`q${i}`];
    if (raw === '' || raw === null || raw === undefined) {
      return { error: { field: `q${i}`, message: `Answer ${label} item ${i}.` } };
    }
    const v = score(String(raw).trim(), i);
    if (v === undefined) {
      return { error: { field: `q${i}`, message: `Item ${i} must be strongly-agree, agree, disagree or strongly-disagree.` } };
    }
    sum += v;
  }
  return { sum };
}

export function olbi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ex = subscale(o, EXHAUSTION, 'exhaustion');
  if (ex.error) return { valid: false, code: 'MISSING_INPUT', field: ex.error.field, message: ex.error.message, note: OLBI_NOTE };
  const dis = subscale(o, DISENGAGEMENT, 'disengagement');
  if (dis.error) return { valid: false, code: 'MISSING_INPUT', field: dis.error.field, message: dis.error.message, note: OLBI_NOTE };

  const total = ex.sum + dis.sum;

  return {
    valid: true,
    exhaustion: ex.sum,
    disengagement: dis.sum,
    total,
    // No consensus cutoff exists, so nothing here is flagged as abnormal.
    abnormal: false,
    bandLabel: `OLBI ${total} of 64`,
    band: `OLBI total ${total} of 64 — exhaustion ${ex.sum} of 32, disengagement ${dis.sum} of 32.`,
    detail: 'Exhaustion sums items 2, 4, 5, 8, 10, 12, 14, 16 and disengagement sums items 1, 3, 6, 7, 9, 11, 13, 15, each 8 to 32. Items 2, 3, 4, 6, 8, 9, 11 and 12 are reverse scored, and both subscales mix directions, so neither can be scored by adding answers directly. Higher is more burnout. No cutoff is asserted, because published sources disagree on whether one exists.',
    note: OLBI_NOTE,
  };
}
