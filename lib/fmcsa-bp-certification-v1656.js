// spec-v1656 tool 4: commercial driver blood pressure and the certification interval FMCSA's advisory
// criteria give.
//
// Sources, read on the eCFR (title 49 current to October 16, 2026) on October 19, 2026:
//   49 CFR Part 391 Appendix A, section I: the criteria "are strictly advisory and do not have the
//     force and effect of law."
//   Section E (391.41(b)(6)), paragraphs 3-5:
//     Stage 1: "140-159 mmHg and/or ... 90-99 mmHg" -> "may be medically certified to drive for a
//       1-year period"; annual exams "should be at or less than 140/90. If less than 160/100 but
//       greater than 140/90 at the subsequent examinations, the individual may be given a one-time
//       certification of 3 months to reduce the blood pressure to less than or equal to 140/90."
//     Stage 2: "160-179 systolic and/or 100-109 diastolic" -> "a one-time certification of 3 months
//       to initiate or adjust antihypertensive drug therapy"; with treatment well tolerated and
//       140/90 or less, "may be certified for 1 year".
//     Stage 3: "at or greater than 180 (systolic) and 110 (diastolic)" -> "should not be qualified,
//       even for a short period, until the blood pressure is reduced to 140/90 or less and treatment
//       is well tolerated"; then "certified for 6 months and biannually (every 6 months) thereafter".
//   49 CFR 391.45(b): a driver not examined and certified "during the preceding 24 months" must be
//     examined, the ordinary interval when no criterion shortens it.
// Stage 3 is written "and"; stages 1 and 2 "and/or". A reading with one value at Stage 3 levels is
// put in Stage 3 here, the stricter reading, and the result says the appendix's wording differs.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const CONTEXTS = [
  { value: 'examination', text: 'An examination (first, or no hypertension certificate in force)' },
  { value: 'stage1-annual', text: 'Annual recertification after a Stage 1 certificate' },
  { value: 'end-of-3-month', text: 'End of a one-time 3-month certificate' },
  { value: 'stage3-recheck', text: 'Recheck of a driver who had Stage 3' },
];

const ADVISORY = 'FMCSA\'s criteria in Appendix A to Part 391 are "strictly advisory and do not have the force and effect of law." The medical examiner decides.';

function stageOf(s, d) {
  if (s >= 180 || d >= 110) return 3;
  if (s >= 160 || d >= 100) return 2;
  if (s >= 140 || d >= 90) return 1;
  return 0;
}

export function fmcsaBpCertification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the systolic pressure', o.systolic, 60, 300, 'mmHg'], ['the diastolic pressure', o.diastolic, 30, 200, 'mmHg']]);
  if (f) return { valid: false, message: f };
  const ctx = CONTEXTS.some((c) => c.value === o.context) ? o.context : null;
  if (!ctx) return { valid: false, message: 'Choose which examination this is.' };
  const s = Number(o.systolic);
  const d = Number(o.diastolic);
  if (d >= s) return { valid: false, message: 'The diastolic pressure is not below the systolic. Check the values entered.' };
  const tolerated = o.treatmentTolerated === 'yes';
  const atGoal = s <= 140 && d <= 90;
  const stage = stageOf(s, d);
  const stageText = stage ? `Stage ${stage}` : 'Below Stage 1';
  const notes = [];
  if (stage === 3 && !(s >= 180 && d >= 110)) {
    notes.push('The appendix writes Stage 3 as 180 systolic "and" 110 diastolic, while Stages 1 and 2 are "and/or". This reading reaches Stage 3 on one value, and is placed there as the stricter reading.');
  }

  let interval;
  let line;
  if (ctx === 'examination') {
    if (stage === 0) { interval = 'up to 24 months'; line = 'No hypertension stage, so the appendix sets no shorter certificate; §391.45(b) requires examination at least every 24 months.'; }
    else if (stage === 1) { interval = '1 year'; line = 'Stage 1 may be certified for 1 year, and should be at or below 140/90 at each annual examination after.'; }
    else if (stage === 2) { interval = 'one-time 3 months'; line = 'Stage 2 may get a one-time 3-month certificate to start or adjust treatment and reach 140/90 or less.'; }
    else { interval = 'not qualified'; line = 'Stage 3 should not be qualified, even briefly, until the pressure is 140/90 or less and treatment is well tolerated; then 6-month certificates.'; }
  } else if (ctx === 'stage1-annual') {
    if (atGoal) { interval = '1 year'; line = 'At or below 140/90 at the annual examination: certified for another year.'; }
    else if (s < 160 && d < 100) { interval = 'one-time 3 months'; line = 'Above 140/90 but below 160/100 at a later examination: a one-time 3-month certificate to reach 140/90 or less.'; }
    else if (stage === 2) { interval = 'one-time 3 months'; line = 'Now Stage 2: a one-time 3-month certificate to start or adjust treatment, if one has not already been given.'; }
    else { interval = 'not qualified'; line = 'Now Stage 3: not qualified until 140/90 or less with treatment well tolerated.'; }
  } else if (ctx === 'end-of-3-month') {
    if (atGoal && tolerated) { interval = '1 year'; line = 'At or below 140/90 with treatment well tolerated at the end of the 3-month certificate: certified for 1 year.'; }
    else if (atGoal) { interval = 'not stated'; line = 'At or below 140/90, but the 1-year certificate after Stage 2 also needs treatment to be well tolerated. Answer that question.'; }
    else { interval = 'not qualified'; line = 'Still above 140/90 at the end of the one-time 3-month certificate. The appendix gives no second 3-month certificate.'; }
  } else if (atGoal && tolerated) { interval = '6 months'; line = 'After Stage 3, at or below 140/90 with treatment well tolerated: certified for 6 months, and every 6 months while the recheck stays at or below 140/90.'; }
  else if (atGoal) { interval = 'not stated'; line = 'At or below 140/90, but the 6-month certificate after Stage 3 also needs treatment to be well tolerated. Answer that question.'; }
  else { interval = 'not qualified'; line = 'After Stage 3 the recheck must be 140/90 or less; this one is not, so the driver should not be qualified.'; }

  return {
    valid: true, stage, interval, abnormal: interval === 'not qualified' || stage >= 2,
    band: `${s}/${d} mmHg, ${stageText}: ${line}`,
    bandLabel: interval === 'not qualified' ? 'Not qualified' : interval === 'not stated' ? stageText : `${stageText}, ${interval}`,
    notes,
    note: ADVISORY,
  };
}
