// spec-v1634 tool 9: BADRI, the Brighton Adverse Drug Reactions Risk model.
//
// Source: Tangiisuran B, Scutt G, Stevenson J, et al. Development and validation of a risk model for
// predicting adverse drug reactions in older people during hospital stay: Brighton Adverse Drug
// Reactions Risk (BADRI) model. PLoS One 2014;9(10):e111254 (PMC4214735, CC BY), re-read in full
// text on October 11, 2026.
//   - Five variables, "each variable was attributed a score of 1": hyperlipidemia; number of
//     medications 8 or more; length of stay 12 days or more; use of anti-diabetic agents; high white
//     cell count on admission (Table 3). Score 0 to 5.
//   - Cutoff: Youden's index was largest at a score above 1; sensitivity 80% and specificity 55% in
//     the Brighton (derivation) data, Table 4.
//   - External (European) validation: the abstract prints sensitivity 84% and specificity 43%; the
//     paper's own table for that data prints 80% and 46% at the same cutoff. The two do not agree
//     and both are shown, each named.
//   - The paper gives no number for a "high" white cell count. The derivation patients had a
//     median age of 85.
//
// Pure: no DOM, no clock, no network.

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const ITEMS = [
  { arg: 'hyperlipidemia', dom: 'hyperlipidemia', text: 'Hyperlipidemia' },
  { arg: 'eightOrMoreDrugs', dom: 'drugs', text: '8 or more medications' },
  { arg: 'longStay', dom: 'stay', text: 'Length of stay 12 days or more' },
  { arg: 'antidiabetic', dom: 'antidiabetic', text: 'Use of antidiabetic agents' },
  { arg: 'highWhiteCells', dom: 'wcc', text: 'High white cell count on admission (per the reporting laboratory)' },
];
const NOTE = 'A screening score from hospitalized patients aged 65 and over (median age 85 in the derivation data). At its cutoff it misses about 1 in 5 patients who go on to have an adverse drug reaction and flags many who do not, so a low score does not rule one out. The paper gives no number for a high white cell count.';

export function badriAdrRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const present = [];
  for (const it of ITEMS) {
    const a = String(o[it.arg] ?? '').trim();
    if (a !== 'yes' && a !== 'no') return { valid: false, message: `Choose yes or no: ${it.text.replace(/^./, (c) => c.toLowerCase())}. All five items are needed; an unanswered item is not counted as no.` };
    if (a === 'yes') present.push(it.text.replace(/ \(per the reporting laboratory\)$/, ''));
  }
  const score = present.length; const above = score > 1;
  return {
    valid: true, flag: above ? 'above-cutoff' : 'at-or-below-cutoff', abnormal: above, score, items: present,
    band: `BADRI score ${score} of 5: ${above ? 'above' : 'not above'} the paper's cutoff (more than 1).`,
    bandLabel: `${score} of 5`,
    notes: [present.length ? `Present: ${present.join('; ')}.` : 'None of the five items is present.',
      'At a score above 1, the paper reports sensitivity 80% and specificity 55% in its derivation data.',
      'For its European validation data the abstract reports sensitivity 84% and specificity 43%, and the paper\'s table for the same data reports 80% and 46%. The two do not agree; both are given here.',
      'Tangiisuran B, et al. PLoS One 2014;9(10):e111254 (CC BY).'], note: NOTE,
  };
}
