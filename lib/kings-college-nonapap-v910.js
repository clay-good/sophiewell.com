// spec-v910: the non-acetaminophen arm of the King's College criteria for acute liver failure.
//
// Source:
//   O'Grady JG, Alexander GJM, Hayllar KM, Williams R. Early indicators of prognosis in fulminant
//   hepatic failure. Gastroenterology. 1989;97(2):439-445.
//
//   Either limb marks a poor prognosis:
//     LIMB 1  INR above 6.5, or a prothrombin time above 100 seconds, on its own and whatever the
//             grade of encephalopathy.
//     LIMB 2  any THREE of five:
//               age under 10 or over 40 years;
//               a cause of non-A non-B hepatitis, halothane hepatitis, or an idiosyncratic drug
//                 reaction;
//               more than 7 days from the onset of jaundice to encephalopathy;
//               INR above 3.5, or a prothrombin time above 50 seconds;
//               bilirubin above 17.5 mg/dL (300 micromol/L).
//
// THIS IS A DIFFERENT SET OF VARIABLES FROM THE ACETAMINOPHEN ARM, not a second way of scoring the
// same thing. The acetaminophen arm turns on arterial pH, creatinine and encephalopathy grade, and
// lives in its own tile.
//
// THEY ARE SPECIFIC AND THEY ARE NOT SENSITIVE. Meeting them marks a poor prognosis. NOT meeting
// them is not reassurance: a large share of the patients who go on to die never meet them, and a
// negative result here has never been a reason to stand down.
//
// MEETING THEM IS A REASON TO REFER, NOT A DECISION TO TRANSPLANT. And referral does not wait on
// them: the published advice has long been to speak to a transplant center early, before any
// prognostic set is satisfied.
//
// "Non-A non-B hepatitis" is the 1989 wording for what is now called indeterminate or seronegative
// hepatitis, and it is kept here because changing it would change the criterion.
//
// Pure: no DOM, no clock, no network.

export const KINGS_NONAPAP_NOTE = `The non-acetaminophen arm of the King's College criteria marks a poor prognosis in acute liver failure by either of two limbs. The first is an INR above 6.5, or a prothrombin time above 100 seconds, on its own and whatever the grade of encephalopathy. The second is any three of five: age under 10 or over 40 years; a cause of non-A non-B hepatitis, halothane hepatitis or an idiosyncratic drug reaction; more than seven days from the onset of jaundice to encephalopathy; an INR above 3.5 or a prothrombin time above 50 seconds; and a bilirubin above 17.5 mg/dL, which is 300 micromol per liter. Three things are worth stating plainly. This is a different set of variables from the acetaminophen arm rather than a second way of scoring the same thing, and that arm turns on arterial pH, creatinine and encephalopathy grade. The criteria are specific and they are not sensitive, so meeting them marks a poor prognosis while not meeting them is not reassurance -- a large share of the patients who go on to die never meet them. And meeting them is a reason to refer to a transplant center rather than a decision to transplant, while referral itself does not wait on them: the advice has long been to speak to a transplant center early, before any prognostic set is satisfied. Non-A non-B hepatitis is the 1989 wording for what is now called indeterminate or seronegative hepatitis, kept because changing it would change the criterion. This checks entered values against published thresholds. It does not diagnose, and it does not decide on transplantation.`;

export const ETIOLOGY_OPTIONS = [
  { value: 'other', text: 'Another cause, or not yet known' },
  { value: 'seronegative', text: 'Non-A non-B (indeterminate or seronegative) hepatitis' },
  { value: 'halothane', text: 'Halothane hepatitis' },
  { value: 'idiosyncratic-drug', text: 'Idiosyncratic drug reaction' },
];

const COUNTING_ETIOLOGIES = new Set(['seronegative', 'halothane', 'idiosyncratic-drug']);

// Scaling by 10 overflows a large but finite input to Infinity, which would then be printed.
function safeRound(n) {
  const r = Math.round(n * 10) / 10;
  return Number.isFinite(r) ? r : n;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function kingsCollegeNonApap(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const inr = num(o.inr);
  const pt = num(o.pt);
  const age = num(o.age);
  const days = num(o.jaundiceToEncephalopathyDays);
  const bili = num(o.bilirubin);
  const biliUnit = String(o.bilirubinUnit || 'mg/dl').toLowerCase();
  const etiology = String(o.etiology || 'other');

  if (inr === null && pt === null) {
    return { valid: false, message: 'Enter an INR or a prothrombin time. Both limbs of the criteria are written on the clotting, and neither can be read without it.' };
  }

  // 17.5 mg/dL and 300 micromol/L are the same threshold in the two units the paper is read in.
  const biliMgDl = bili === null ? null : (biliUnit === 'umol/l' ? bili / 17.104 : bili);

  const clottingSevere = (inr !== null && inr > 6.5) || (pt !== null && pt > 100);
  const clottingModerate = (inr !== null && inr > 3.5) || (pt !== null && pt > 50);

  const factors = [
    {
      key: 'age',
      text: 'Age under 10 or over 40 years',
      met: age === null ? null : (age < 10 || age > 40),
      detail: age === null ? 'Age not entered.' : `Age ${age}.`,
    },
    {
      key: 'etiology',
      text: 'Non-A non-B hepatitis, halothane hepatitis, or an idiosyncratic drug reaction',
      met: COUNTING_ETIOLOGIES.has(etiology),
      detail: (ETIOLOGY_OPTIONS.find((e) => e.value === etiology) || ETIOLOGY_OPTIONS[0]).text + '.',
    },
    {
      key: 'jaundice-interval',
      text: 'More than 7 days from the onset of jaundice to encephalopathy',
      met: days === null ? null : days > 7,
      detail: days === null ? 'Interval not entered.' : `${days} days from jaundice to encephalopathy.`,
    },
    {
      key: 'clotting',
      text: 'INR above 3.5, or a prothrombin time above 50 seconds',
      met: clottingModerate,
      detail: `${inr === null ? '' : `INR ${inr}. `}${pt === null ? '' : `Prothrombin time ${pt} s.`}`.trim(),
    },
    {
      key: 'bilirubin',
      text: 'Bilirubin above 17.5 mg/dL, which is 300 micromol per liter',
      met: biliMgDl === null ? null : biliMgDl > 17.5,
      detail: biliMgDl === null ? 'Bilirubin not entered.' : `Bilirubin ${safeRound(biliMgDl)} mg/dL.`,
    },
  ];

  const metCount = factors.filter((f) => f.met === true).length;
  const unknownCount = factors.filter((f) => f.met === null).length;
  const secondLimbMet = metCount >= 3;
  const met = clottingSevere || secondLimbMet;

  const bandLabel = met ? 'Meets the criteria' : 'Does not meet the criteria';

  const band = clottingSevere && secondLimbMet
    ? `Both limbs are met: the clotting alone, and ${metCount} of the five factors.`
    : clottingSevere
      ? `The first limb is met on the clotting alone, whatever the grade of encephalopathy.`
      : secondLimbMet
        ? `The second limb is met: ${metCount} of the five factors, and three are needed.`
        : unknownCount
          ? `Neither limb is met from what is here: ${metCount} of five factors, three needed, with ${unknownCount} not entered.`
          : `Neither limb is met: ${metCount} of five factors, and three are needed.`;

  const sensitivityNote = 'These criteria are specific and they are not sensitive. Meeting them marks a poor prognosis; not meeting them is not reassurance, because a large share of the patients who go on to die never meet them.';

  const referralNote = 'Meeting them is a reason to refer to a transplant center, not a decision to transplant. Referral does not wait on them, and speaking to a transplant center early is the long-standing advice.';

  const armNote = 'This is the non-acetaminophen arm. The acetaminophen arm is a different set of variables entirely, turning on arterial pH, creatinine and encephalopathy grade.';

  const wordingNote = 'Non-A non-B hepatitis is the 1989 wording for what is now called indeterminate or seronegative hepatitis. It is kept because changing it would change the criterion.';

  const scopeNote = 'This checks entered values against published thresholds. It does not diagnose, and it does not decide on transplantation.';

  return {
    valid: true,
    met,
    firstLimbMet: clottingSevere,
    secondLimbMet,
    metCount,
    unknownCount,
    factors,
    sensitivityNote,
    referralNote,
    armNote,
    wordingNote,
    scopeNote,
    abnormal: met,
    bandLabel,
    band,
    detail: 'Either limb marks a poor prognosis: an INR above 6.5 or a prothrombin time above 100 seconds on its own, whatever the grade of encephalopathy; or any three of age under 10 or over 40, a cause of non-A non-B hepatitis, halothane hepatitis or an idiosyncratic drug reaction, more than 7 days from jaundice to encephalopathy, an INR above 3.5 or a prothrombin time above 50 seconds, and a bilirubin above 17.5 mg/dL.',
    note: KINGS_NONAPAP_NOTE,
  };
}
