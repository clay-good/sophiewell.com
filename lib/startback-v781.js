// spec-v781: STarT Back Screening Tool (Keele University).
//
// Source:
//   Hill JC, Dunn KM, Lewis M, et al. A primary care back pain screening tool:
//   identifying patient subgroups for initial treatment. Arthritis Rheum.
//   2008;59(5):632-641. (PMID 18438893.) Scoring as on the Keele University form.
//
// Nine items about the last two weeks. Items 1 to 8 are agree/disagree and score
// 1 for agree. Item 9 rates overall bothersomeness on five levels and scores 1 only
// for "very much" or "extremely" - not at all, slightly and moderately all score 0.
//
//   Total score      all nine items          0 to 9
//   Psychosocial sub items 5 to 9 only       0 to 5
//
// Risk group, which needs BOTH numbers:
//   total <= 3                     low
//   total >= 4 and sub <= 3        medium
//   total >= 4 and sub >= 4        high
//
// The group, not the total, is what the stratified-care pathway keys on: a total of
// 7 can be medium or high depending entirely on where those points came from.
//
// Only neutral item-topic labels are used; the form wording is Keele University
// copyright, free for clinical use.
//
// Pure: no DOM, no clock, no network.

export const STARTBACK_NOTE = 'The STarT Back Screening Tool (Hill JC, Dunn KM, Lewis M, et al, Arthritis Rheum 2008;59(5):632-641) sorts people with low back pain in primary care into low, medium and high risk of persisting disability, so that treatment can be matched to risk. Nine items cover the last two weeks: the first eight are agree or disagree and score a point for agree, and the ninth rates how bothersome the pain has been, scoring a point only for very much or extremely. The total runs 0 to 9 and a psychosocial subscore over items 5 to 9 runs 0 to 5. A total of 3 or less is low risk; a total of 4 or more is medium risk when the subscore is 3 or less and high risk when the subscore is 4 or 5. The group rather than the total is what matters, because the same total can fall in either group depending on which items scored. It is a prognostic screen for matching treatment intensity, not a diagnosis, and it does not identify serious spinal pathology - red flags are assessed separately.';

const ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];
const BOTHER = { 'not-at-all': 0, slightly: 0, moderately: 0, 'very-much': 1, extremely: 1 };

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function startBack(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const botherKey = o.bother === undefined || o.bother === null || o.bother === '' ? 'not-at-all' : String(o.bother).trim();
  if (!Object.prototype.hasOwnProperty.call(BOTHER, botherKey)) {
    return { valid: false, code: 'INVALID_INPUT', field: 'bother', message: 'Bothersomeness must be not-at-all, slightly, moderately, very-much or extremely.', note: STARTBACK_NOTE };
  }

  let total = 0;
  let sub = 0;
  for (const k of ITEMS) {
    if (!truthy(o[k])) continue;
    total += 1;
    if (Number(k.slice(1)) >= 5) sub += 1;
  }
  const botherPoint = BOTHER[botherKey];
  total += botherPoint;
  sub += botherPoint;

  let tier, label;
  if (total <= 3) { tier = 'low'; label = 'low risk'; }
  else if (sub <= 3) { tier = 'medium'; label = 'medium risk'; }
  else { tier = 'high'; label = 'high risk'; }

  return {
    valid: true,
    total,
    subscore: sub,
    tier,
    abnormal: tier !== 'low',
    bandLabel: `STarT Back ${total} of 9, subscore ${sub} of 5`,
    band: `STarT Back total ${total} of 9, psychosocial subscore ${sub} of 5 — ${label}.`,
    detail: 'Items 1 to 8 score 1 for agree. Item 9 scores 1 only for very much or extremely bothersome. The subscore counts items 5 to 9. Groups: total 3 or less is low; total 4 or more is medium when the subscore is 3 or less and high when the subscore is 4 or 5. The same total can land in either group depending on which items scored, so the group, not the total, is what the stratified-care pathway keys on.',
    note: STARTBACK_NOTE,
  };
}
