// spec-v525: the Cornell Assessment of Pediatric Delirium (CAPD). The catalog's delirium screens - ICDSC,
// 4AT, Nu-DESC - are all validated in ADULTS; "capd" and "cornell assessment" were zero-hit, so a PICU nurse
// screening a three-year-old had nothing age-appropriate. The existing `sos` tile is the Sophia Observation
// WITHDRAWAL scale, a different thing entirely.
//
// The scoring is REVERSED between the two halves, and that is the error the tile exists to prevent. All eight
// items are answered on the same never/rarely/sometimes/often/always scale, but:
//   items 1-4 ask about PRESERVED function (eye contact, purposeful actions, awareness, communication)
//             so NEVER scores 4 and ALWAYS scores 0
//   items 5-8 ask about ABNORMAL behaviour (restless, inconsolable, underactive, slow to respond)
//             so NEVER scores 0 and ALWAYS scores 4
// Total 0-32, and 9 or more is the validated positive screen. Reading the anchors the same direction for all
// eight items turns a well child into a positive screen and a delirious one into a negative screen.
//
// HIGH-STAKES: this sums an observer's ratings over one nursing shift. It is NOT a diagnosis of delirium, NOT
// a cause, and NOT an indication for antipsychotics, for a sedation change, or for restraint (spec-v11
// section 5.3). A positive screen means a delirium workup is warranted: the treatable causes it should
// prompt a search for - pain, withdrawal, hypoxia, hypoglycemia, sepsis, seizure, and the sedatives already
// running - are the point of screening, not the score itself. The score also needs the child's developmental
// baseline: an infant, and a child with developmental delay, is rated against what is normal FOR THEM. The
// clinical decision stays with the PICU team.
//
// ITEMS AND SCORING RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Traube C, Silver G, Kearney J, et al. Cornell Assessment of Pediatric Delirium: a valid, rapid,
//     observational tool for screening delirium in the PICU. Crit Care Med. 2014;42(3):656-663.
//   - Pediatric critical-care references reproducing the same eight items, the same reversed anchors between
//     items 1-4 and 5-8, the same 0-32 range, and the same positive cut of 9.

// Anchors for items 1-4: preserved function, so never is the worst answer.
const PRESERVED = [
  { value: '4', text: '4 - never' },
  { value: '3', text: '3 - rarely' },
  { value: '2', text: '2 - sometimes' },
  { value: '1', text: '1 - often' },
  { value: '0', text: '0 - always' },
];

// Anchors for items 5-8: abnormal behavior, so always is the worst answer.
const ABNORMAL = [
  { value: '0', text: '0 - never' },
  { value: '1', text: '1 - rarely' },
  { value: '2', text: '2 - sometimes' },
  { value: '3', text: '3 - often' },
  { value: '4', text: '4 - always' },
];

// Neutral topic labels for the eight items. The instrument's verbatim question wording is
// proprietary (copyright Cornell / Traube); these are short topic cues, not the tool's questions.
// Scoring is key-based and each item keeps its own reversed flag, so the labels cannot change the
// total or the positive cut.
export const CAPD_ITEMS = [
  { key: 'q1', text: 'Eye contact with the caregiver', reversed: true, options: PRESERVED },
  { key: 'q2', text: 'Purposeful actions', reversed: true, options: PRESERVED },
  { key: 'q3', text: 'Awareness of surroundings', reversed: true, options: PRESERVED },
  { key: 'q4', text: 'Communicates needs and wants', reversed: true, options: PRESERVED },
  { key: 'q5', text: 'Restlessness', reversed: false, options: ABNORMAL },
  { key: 'q6', text: 'Inconsolability', reversed: false, options: ABNORMAL },
  { key: 'q7', text: 'Underactivity while awake', reversed: false, options: ABNORMAL },
  { key: 'q8', text: 'Slow to respond to interaction', reversed: false, options: ABNORMAL },
];

const MAX_TOTAL = CAPD_ITEMS.length * 4; // 32
const POSITIVE_AT = 9;

const NOTE = 'The Cornell Assessment of Pediatric Delirium (Traube and colleagues 2014) scores eight observations over a nursing shift, each 0 to 4, for a total of 0 to 32, and 9 or more is the validated positive screen. The anchors are REVERSED between the two halves: items 1 to 4 ask about preserved function, so never scores 4 and always scores 0, while items 5 to 8 ask about abnormal behavior, so never scores 0 and always scores 4. Every item is rated against the child’s own developmental baseline. It sums what an observer rates. It is not a diagnosis of delirium, not a cause, and not an indication for antipsychotics, a sedation change, or restraint. A positive screen means a workup is warranted: pain, withdrawal, hypoxia, hypoglycemia, sepsis, seizure, and the sedatives already running are what it should prompt a search for.';

function readItem(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 4) return NaN;
  return n;
}

// input:
//   q1 .. q8: each 0-4, already mapped through that item's own anchors (all eight required).
export function capd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = CAPD_ITEMS.map((item) => readItem(o[item.key]));

  if (vals.some((n) => n === null)) {
    return { valid: false, message: 'Answer all eight items. Note the anchors differ: on items 1 to 4 never scores 4, on items 5 to 8 never scores 0.' };
  }
  if (vals.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each item must be a whole number from 0 to 4.' };
  }

  const total = vals.reduce((a, b) => a + b, 0);
  const positive = total >= POSITIVE_AT;

  const text = positive
    ? `CAPD total ${total} of ${MAX_TOTAL}: at or above the positive cut of 9. A delirium workup is warranted.`
    : `CAPD total ${total} of ${MAX_TOTAL}: below the positive cut of 9. A negative screen does not exclude delirium.`;

  return {
    valid: true,
    total,
    positive,
    bandLabel: `CAPD ${total} of ${MAX_TOTAL}`,
    band: text,
    note: NOTE,
  };
}
