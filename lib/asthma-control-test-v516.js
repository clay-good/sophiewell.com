// spec-v516: the Asthma Control Test (ACT), the five-item patient-reported measure of asthma control over
// the past four weeks. The catalog's existing asthma tiles (pass-asthma, pram-asthma) score ACUTE severity in
// a child in front of you; the ACT answers a different question - how well controlled has this patient's
// asthma been between visits - and "asthma control test", "well controlled", and "juniper" were all zero-hit
// across the corpus.
//
// Five items, each 1-5, total 5-25. Every item runs the same direction: 5 is always the best answer.
//   25       totally controlled
//   20 to 24 well controlled
//   19 or less  not well controlled
//
// HIGH-STAKES: this sums what the patient reports about the past four weeks. It is NOT a diagnosis of asthma,
// NOT a measure of lung function (a well-controlled score can sit alongside abnormal spirometry), and NOT an
// indication to step therapy up or down, to start or stop a controller, or to prescribe oral steroids
// (spec-v11 section 5.3). It does not assess the things that decide a step-up as much as the score does:
// inhaler technique, adherence, trigger exposure, and comorbidities. It is a control measure, not a risk
// measure - it does not estimate the risk of a future exacerbation. The therapy decision stays with the
// clinician.
//
// ITEMS AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Nathan RA, Sorkness CA, Kosinski M, et al. Development of the Asthma Control Test: a survey for
//     assessing asthma control. J Allergy Clin Immunol. 2004;113(1):59-65.
//   - Respiratory references reproducing the same five items, the same 1-5 per-item anchors, the same 5-25
//     range, and the same cut of 19 or less for not well controlled.

export const ACT_ITEMS = [
  {
    text: 'Asthma limiting activity at work, school, or home (past 4 weeks)',
    options: [
      { value: '1', text: '1 - all of the time' },
      { value: '2', text: '2 - most of the time' },
      { value: '3', text: '3 - some of the time' },
      { value: '4', text: '4 - a little of the time' },
      { value: '5', text: '5 - none of the time' },
    ],
  },
  {
    text: 'Shortness of breath (past 4 weeks)',
    options: [
      { value: '1', text: '1 - more than once a day' },
      { value: '2', text: '2 - once a day' },
      { value: '3', text: '3 - 3 to 6 times a week' },
      { value: '4', text: '4 - once or twice a week' },
      { value: '5', text: '5 - not at all' },
    ],
  },
  {
    text: 'Nighttime or early-morning awakenings from asthma (past 4 weeks)',
    options: [
      { value: '1', text: '1 - 4 or more nights a week' },
      { value: '2', text: '2 - 2 or 3 nights a week' },
      { value: '3', text: '3 - once a week' },
      { value: '4', text: '4 - once or twice' },
      { value: '5', text: '5 - not at all' },
    ],
  },
  {
    text: 'Rescue inhaler or nebulizer use (past 4 weeks)',
    options: [
      { value: '1', text: '1 - 3 or more times per day' },
      { value: '2', text: '2 - once or twice per day' },
      { value: '3', text: '3 - 2 or 3 times per week' },
      { value: '4', text: '4 - once a week or less' },
      { value: '5', text: '5 - not at all' },
    ],
  },
  {
    text: 'Self-rated asthma control (past 4 weeks)',
    options: [
      { value: '1', text: '1 - not controlled at all' },
      { value: '2', text: '2 - poorly controlled' },
      { value: '3', text: '3 - somewhat controlled' },
      { value: '4', text: '4 - well controlled' },
      { value: '5', text: '5 - completely controlled' },
    ],
  },
];

const NOTE = 'The Asthma Control Test (Nathan and colleagues 2004) sums five patient-rated items about the past four weeks, each 1 to 5, for a total of 5 to 25: 25 is totally controlled, 20 to 24 is well controlled, and 19 or less is not well controlled. It sums what the patient reports. It is not a diagnosis of asthma, not a measure of lung function, and not an indication to step therapy up or down or to prescribe oral steroids. It does not assess inhaler technique, adherence, trigger exposure, or comorbidities, which decide a step-up as much as the score does, and it is a control measure rather than a risk measure: it does not estimate the risk of a future exacerbation.';

function readItem(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 5) return NaN;
  return n;
}

function bandFor(total) {
  if (total === 25) return { label: 'Totally controlled', text: 'Total 25: totally controlled over the past four weeks.' };
  if (total >= 20) return { label: 'Well controlled', text: 'Total 20 to 24: well controlled over the past four weeks.' };
  return { label: 'Not well controlled', text: 'Total 19 or less: not well controlled over the past four weeks.' };
}

// input:
//   q1 .. q5: each 1-5 (all five required), in ACT_ITEMS order.
export function asthmaControlTest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = [];
  for (let i = 1; i <= ACT_ITEMS.length; i += 1) vals.push(readItem(o[`q${i}`]));

  if (vals.some((n) => n === null)) {
    return { valid: false, message: 'Answer all five items (each 1 to 5).' };
  }
  if (vals.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each item must be a whole number from 1 to 5. There is no zero on this scale.' };
  }

  const total = vals.reduce((a, b) => a + b, 0);
  const band = bandFor(total);

  return {
    valid: true,
    total,
    controlled: total >= 20,
    bandLabel: `ACT ${total} of 25: ${band.label}`,
    band: `Asthma Control Test ${total} of 25. ${band.text}`,
    note: NOTE,
  };
}
