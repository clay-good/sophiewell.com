// spec-v518: the Childhood Asthma Control Test (c-ACT), for children roughly 4 to 11 years old. The
// companion spec-v516 named as out of scope: the adult ACT is validated from 12 up, so using it on a
// seven-year-old is the exact age-band error this tile removes. "childhood asthma control", "c-act", and
// "pediatric asthma control" were all zero-hit across the corpus and app.js.
//
// It is NOT the adult ACT with easier words. It is a different instrument with a different shape:
//   4 CHILD items,  each 0-3, answered by the child about how things are now
//   3 PARENT items, each 0-5, answered by the caregiver about the past four weeks
//   total 0-27
// The cut point is the same number as the adult ACT but sits on a different scale: 19 or less is not well
// controlled. Scoring a c-ACT out of 25, or an ACT out of 27, is the error the two tiles exist to prevent.
//
// HIGH-STAKES: this sums what a child and a caregiver report. It is NOT a diagnosis of asthma, NOT a measure
// of lung function, and NOT an indication to step therapy up or down, to start or stop a controller, or to
// prescribe oral steroids (spec-v11 section 5.3). It does not assess inhaler technique, spacer use,
// adherence, trigger exposure, or comorbidities, which decide a step-up as much as the score does, and it is
// a control measure rather than a risk measure: it does not estimate the risk of a future exacerbation. The
// therapy decision stays with the clinician.
//
// ITEMS AND CUT POINT RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Liu AH, Zeiger R, Sorkness C, et al. Development and cross-sectional validation of the Childhood
//     Asthma Control Test. J Allergy Clin Immunol. 2007;119(4):817-825.
//   - Respiratory references reproducing the same four child items scored 0-3, the same three caregiver
//     items scored 0-5, the same 0-27 range, and the same cut of 19 or less for not well controlled.

const DAYS_OPTIONS = [
  { value: '0', text: '0 - every day' },
  { value: '1', text: '1 - 19 to 24 days' },
  { value: '2', text: '2 - 11 to 18 days' },
  { value: '3', text: '3 - 4 to 10 days' },
  { value: '4', text: '4 - 1 to 3 days' },
  { value: '5', text: '5 - not at all' },
];

export const CHILD_ITEMS = [
  {
    key: 'c1',
    text: 'Child rates asthma today',
    options: [
      { value: '0', text: '0 - very bad' },
      { value: '1', text: '1 - bad' },
      { value: '2', text: '2 - good' },
      { value: '3', text: '3 - very good' },
    ],
  },
  {
    key: 'c2',
    text: 'Asthma during running, exercise, or play',
    options: [
      { value: '0', text: '0 - a big problem' },
      { value: '1', text: '1 - a problem' },
      { value: '2', text: '2 - a little problem' },
      { value: '3', text: '3 - not a problem' },
    ],
  },
  {
    key: 'c3',
    text: 'Cough from asthma',
    options: [
      { value: '0', text: '0 - yes, all of the time' },
      { value: '1', text: '1 - yes, most of the time' },
      { value: '2', text: '2 - yes, some of the time' },
      { value: '3', text: '3 - no, none of the time' },
    ],
  },
  {
    key: 'c4',
    text: 'Nighttime awakening from asthma',
    options: [
      { value: '0', text: '0 - yes, all of the time' },
      { value: '1', text: '1 - yes, most of the time' },
      { value: '2', text: '2 - yes, some of the time' },
      { value: '3', text: '3 - no, none of the time' },
    ],
  },
];

export const PARENT_ITEMS = [
  { key: 'p1', text: 'Days with daytime asthma symptoms (past 4 weeks)', options: DAYS_OPTIONS },
  { key: 'p2', text: 'Days with daytime wheeze from asthma (past 4 weeks)', options: DAYS_OPTIONS },
  { key: 'p3', text: 'Days waking at night from asthma (past 4 weeks)', options: DAYS_OPTIONS },
];

const MAX_TOTAL = 27;
const CONTROLLED_AT = 20;

const NOTE = 'The Childhood Asthma Control Test (Liu and colleagues 2007) is for children roughly 4 to 11 years old and is a different instrument from the adult ACT, not a simplified version of it: four items answered by the child score 0 to 3 and three items answered by the caregiver about the past four weeks score 0 to 5, for a total of 0 to 27. A total of 19 or less is not well controlled and 20 or more is well controlled. The cut point is the same number as the adult ACT but sits on a different scale, so scoring a c-ACT out of 25 misreads it. It sums what a child and a caregiver report. It is not a diagnosis of asthma, not a measure of lung function, and not an indication to step therapy up or down or to prescribe oral steroids. It does not assess inhaler technique, spacer use, adherence, trigger exposure, or comorbidities, and it is a control measure rather than a risk measure.';

function readItem(v, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > max) return NaN;
  return n;
}

// input:
//   c1 .. c4: each 0-3 (the child's answers).
//   p1 .. p3: each 0-5 (the caregiver's answers). All seven required.
export function childhoodAct(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const child = CHILD_ITEMS.map((item) => readItem(o[item.key], 3));
  const parent = PARENT_ITEMS.map((item) => readItem(o[item.key], 5));
  const all = [...child, ...parent];

  if (all.some((n) => n === null)) {
    return { valid: false, message: 'Answer all four child items and all three caregiver items.' };
  }
  if (all.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each child item must be a whole number from 0 to 3, and each caregiver item from 0 to 5.' };
  }

  const childTotal = child.reduce((a, b) => a + b, 0);
  const parentTotal = parent.reduce((a, b) => a + b, 0);
  const total = childTotal + parentTotal;
  const controlled = total >= CONTROLLED_AT;

  const text = controlled
    ? `Childhood ACT ${total} of ${MAX_TOTAL}: 20 or more, well controlled over the past four weeks.`
    : `Childhood ACT ${total} of ${MAX_TOTAL}: 19 or less, not well controlled over the past four weeks.`;

  return {
    valid: true,
    total,
    childTotal,
    parentTotal,
    controlled,
    bandLabel: `c-ACT ${total} of ${MAX_TOTAL}`,
    band: `${text} ${childTotal} of 12 from the child and ${parentTotal} of 15 from the caregiver.`,
    note: NOTE,
  };
}
