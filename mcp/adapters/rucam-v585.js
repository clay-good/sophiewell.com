// spec-v585 MCP wave: adapter for the updated RUCAM in lib/rucam-v585.js. The dom keys mirror the browser
// renderer (views/group-v585.js) and META['rucam'].example.
//
// **THE R RATIO PICKS THE SCALE, AND MIXED INJURY IS SCORED ON THE CHOLESTATIC SCALE.** There are TWO
// scoring tables, and which one applies is decided BEFORE any item is answered, by R = (ALT / ALT upper
// limit of normal) / (ALP / ALP upper limit of normal). Hepatocellular is R at or above 5, cholestatic at or
// below 2, mixed strictly between - and MIXED HAS NO TABLE OF ITS OWN, it borrows the cholestatic one. This
// is why the four laboratory values are required inputs even though they contribute no points.
//
// **THE TWO SCALES DIFFER IN FOUR OF SEVEN DOMAINS UNDER THE SAME DOMAIN NAMES**: the latency windows are
// longer on the cholestatic scale (prior exposure 1-90 days against 1-15; post-cessation 30 days against
// 15), the dechallenge windows are 180 days against 30, the dechallenge point ranges are 0 to +2 against -2
// to +3, and the risk-factor line differs. A value copied across from the other table looks harmless and is
// wrong. The enum VALUES for `onset` and `course` are shared keys whose day windows and points depend on the
// scale in force, so the same key can be worth different points in two cases.
//
// **TIME TO ONSET CAN EXCLUDE THE CASE OUTRIGHT.** Onset before the drug was started, or more than 15 days
// (hepatocellular) or 30 days (cholestatic) after it was stopped, is an EXCLUSION, not a low score: the
// result carries `excluded: true` and `total: null`, and NO total is produced. Reporting a number there is
// wrong.
//
// **THE TWO SCALES DO NOT SHARE A RANGE BUT DO SHARE THE BANDS.** The best reachable total is 14 on the
// hepatocellular scale and 13 on the cholestatic, yet both are read against the same causality bands, so a
// "probable" is not equally hard to reach on the two. `scaleMax` is returned so the total can be read in
// context.
//
// **NEGATIVE POINTS ARE REAL AND LARGE**: concomitant drugs reach -3 and an alternative diagnosis -3, so a
// case can be argued out of causality as well as into it.
//
// **ONE CELL IS RECONCILED, NOT RECALLED**: the primary and an authoritative secondary reproduction render
// the cholestatic risk-factor line differently, one treating pregnancy as an extra item and the other as
// sharing a line with alcohol. Both state a domain maximum of +2, which is only consistent with the shared
// line, so that reading is applied and the divergence stated.
//
// **NEVER USE THIS TO JUSTIFY READMINISTRATION.** Rechallenge is scored because it sometimes happens, not
// because it is advisable; deliberate rechallenge to raise a RUCAM score has killed patients.

import * as R from '../../lib/rucam-v585.js';

const list = (items) => items.map((i) => `${i.value} = ${i.text}${i.points === null ? ' (CASE EXCLUDED)' : ` (${i.points})`}`).join('; ');

export default [
  {
    id: 'rucam',
    summary: `The UPDATED RUCAM (Roussel Uclaf Causality Assessment Method, Danan and Teschke 2016) grades the PROBABILITY THAT A PARTICULAR DRUG OR HERB CAUSED an episode of liver injury. **THE R RATIO PICKS THE SCALE BEFORE ANY ITEM IS ANSWERED**: R = (ALT / ALT upper limit of normal) / (ALP / ALP upper limit of normal); hepatocellular at R of ${R.R_HEPATOCELLULAR} or above, cholestatic at ${R.R_CHOLESTATIC} or below, mixed strictly between - and **MIXED INJURY IS SCORED ON THE CHOLESTATIC TABLE, HAVING NONE OF ITS OWN**. That is why the four laboratory values are required even though they score nothing. **THE TWO TABLES DIFFER IN FOUR OF SEVEN DOMAINS UNDER THE SAME DOMAIN NAMES**: latency windows (prior exposure 1-15 days hepatocellular against 1-90 cholestatic), dechallenge windows (30 days against 180), dechallenge point ranges (-2 to +3 against 0 to +2) and the risk-factor line. The \`onset\` and \`course\` enum keys are SHARED but their day windows and points depend on the scale in force, so the same key can be worth different points in two cases. HEPATOCELLULAR onset: ${list(R.ONSET_ITEMS.hepatocellular)}. CHOLESTATIC onset: ${list(R.ONSET_ITEMS.cholestatic)}. HEPATOCELLULAR course: ${list(R.COURSE_ITEMS.hepatocellular)}. CHOLESTATIC course: ${list(R.COURSE_ITEMS.cholestatic)}. RISK FACTORS, maximum ${R.RISK_DOMAIN_MAX}: age ${R.AGE_RISK_THRESHOLD} or over = 1, and alcohol use or (on the cholestatic scale) pregnancy = 1. IDENTICAL ON BOTH SCALES - concomitant drugs: ${list(R.CONCOMITANT_ITEMS)}; exclusion of other causes: ${list(R.EXCLUSION_ITEMS)}; previous information: ${list(R.PRIOR_INFO_ITEMS)}; response to readministration: ${list(R.RECHALLENGE_ITEMS)}. **TIME TO ONSET CAN EXCLUDE THE CASE OUTRIGHT**: onset before the drug was started, or more than 15 days (hepatocellular) or 30 days (cholestatic) after it was stopped, returns \`excluded: true\` and \`total: null\` - NO total exists and reporting a number there is wrong. CAUSALITY BANDS: 0 or less excluded, 1 to 2 unlikely, 3 to 5 possible, 6 to 8 probable, 9 or more highly probable. **THE TWO SCALES DO NOT SHARE A RANGE BUT DO SHARE THESE BANDS** - the best reachable total is ${R.scaleMaximum('hepatocellular')} hepatocellular against ${R.scaleMaximum('cholestatic')} cholestatic - so a "probable" is not equally hard to reach on the two, and \`scaleMax\` is returned for context. **NEGATIVE POINTS ARE REAL AND LARGE**, with concomitant drugs and an alternative diagnosis each reaching -3, so a case can be argued OUT of causality as well as into it. ONE CELL IS RECONCILED RATHER THAN RECALLED: two authoritative reproductions render the cholestatic risk-factor line differently, and both state a domain maximum of +2, which is only consistent with alcohol and pregnancy sharing one line, so that reading is applied. RUCAM grades CAUSALITY, NOT SEVERITY: a highly probable case may be mild and an excluded one may be in liver failure, and severity is a separate question. It is not a diagnosis and does not tell anyone to stop or continue a drug. **IT MUST NEVER BE USED TO JUSTIFY READMINISTRATION** - rechallenge is scored because it sometimes happens, not because it is advisable, and deliberate rechallenge has killed patients.`,
    compute: R.rucam,
    fields: [
      { dom: 'rucam-alt', arg: 'alt', kind: 'number', unit: 'U/L', required: true, label: 'ALT. Scores nothing directly; it is half the R ratio that selects the scoring table.' },
      { dom: 'rucam-alt-uln', arg: 'altUln', kind: 'number', unit: 'U/L', required: true, label: 'The laboratory upper limit of normal for ALT.' },
      { dom: 'rucam-alp', arg: 'alp', kind: 'number', unit: 'U/L', required: true, label: 'ALP. Scores nothing directly; it is the other half of the R ratio.' },
      { dom: 'rucam-alp-uln', arg: 'alpUln', kind: 'number', unit: 'U/L', required: true, label: 'The laboratory upper limit of normal for ALP.' },
      { dom: 'rucam-onset', arg: 'onset', kind: 'enum', values: R.ONSET_ITEMS.hepatocellular.map((i) => i.value), required: true, label: 'Time to onset. THE DAY WINDOWS AND POINTS DEPEND ON THE SCALE the R ratio selected. Two values EXCLUDE the case rather than scoring it.' },
      { dom: 'rucam-course', arg: 'course', kind: 'enum', values: [...new Set([...R.COURSE_ITEMS.hepatocellular, ...R.COURSE_ITEMS.cholestatic].map((i) => i.value))], required: true, label: 'Course after stopping the drug. THE VALID VALUES DIFFER BY SCALE: the hepatocellular table runs -2 to +3 over 30 days, the cholestatic 0 to +2 over 180 days.' },
      { dom: 'rucam-age', arg: 'ageAtLeast55', kind: 'enum', values: ['yes', 'no'], required: true, label: `Age ${R.AGE_RISK_THRESHOLD} years or over.` },
      { dom: 'rucam-alcpreg', arg: 'alcoholOrPregnancy', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Alcohol use, or pregnancy on the cholestatic scale. ONE SHARED LINE worth 1 point, and the risk domain is capped at 2.' },
      { dom: 'rucam-concomitant', arg: 'concomitant', kind: 'enum', values: R.CONCOMITANT_ITEMS.map((i) => i.value), required: true, label: `Concomitant drugs [${list(R.CONCOMITANT_ITEMS)}]. Reaches -3.` },
      { dom: 'rucam-exclusion', arg: 'exclusion', kind: 'enum', values: R.EXCLUSION_ITEMS.map((i) => i.value), required: true, label: `Exclusion of other causes [${list(R.EXCLUSION_ITEMS)}]. Reaches -3.` },
      { dom: 'rucam-prior', arg: 'priorInfo', kind: 'enum', values: R.PRIOR_INFO_ITEMS.map((i) => i.value), required: true, label: `Previous information on hepatotoxicity [${list(R.PRIOR_INFO_ITEMS)}]` },
      { dom: 'rucam-rechallenge', arg: 'rechallenge', kind: 'enum', values: R.RECHALLENGE_ITEMS.map((i) => i.value), required: true, label: `Response to readministration [${list(R.RECHALLENGE_ITEMS)}]. SCORED BECAUSE IT SOMETIMES HAPPENS, NOT BECAUSE IT IS ADVISABLE.` },
    ],
  },
];
