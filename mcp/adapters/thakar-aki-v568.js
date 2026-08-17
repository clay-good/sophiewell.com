// spec-v568 MCP wave: adapter for the Cleveland Clinic (Thakar) score in lib/thakar-aki-v568.js. The dom
// keys mirror the browser renderer (views/group-v568.js) and META['thakar-aki'].example.
//
// **THE OUTCOME IS ACUTE RENAL FAILURE REQUIRING DIALYSIS, NOT KDIGO AKI.** This is the single most
// important thing to get right about this score. Dialysis-requiring failure is far rarer and far more
// severe than any-stage AKI, which is common after cardiac surgery, and studies revalidating this score
// against any-stage AKI are measuring something else entirely. An agent that reports the output as "risk of
// AKI" overstates what is predicted by a wide margin.
//
// **THE PUBLISHED RISK CATEGORIES STOP AT 13 WHILE THE SCORE RUNS TO 17.** Scores of 14-17 are reachable
// and fall outside the published table. The tool returns `bandAssigned: false` above 13 rather than
// stretching the top category, because extending a band the source closed invents a risk estimate for
// patients the derivation never described.
//
// **THE EXACT RISK PERCENTAGES ARE DELIBERATELY NOT REPORTED.** Independent secondary sources disagree -
// one gives the 6-8 band as a 7.8-9.5 percent range and 9-13 as 21.5 percent, another gives 9.5 and 21.3,
// and the original abstract describes the test-set frequency as spanning 0.5 to 22.1 percent. These are
// probably test-set versus validation-set figures, but the primary table is paywalled and could not be
// fetched to adjudicate, so no percentage is quoted. The SCORE and the four BAND BOUNDARIES are consistent
// across sources and are reported.
//
// **SURGERY TYPE IS COUNTER-INTUITIVE AND MUST NOT BE REORDERED BY INVASIVENESS.** Isolated CABG, the
// commonest operation, scores 0. "Other cardiac surgery" scores 2 - the SAME as the far more invasive CABG
// plus valve. An agent sorting these by apparent severity will get "other" wrong.
//
// **CREATININE IS STEPPED, NOT LINEAR, AND JUMPS 2 -> 5 ACROSS ONE THRESHOLD.** That step of 3 points is
// larger than any single risk factor, so 0.1 mg/dL of drift near 2.1 can move a patient two risk bands.
// Never interpolate it.

import * as T from '../../lib/thakar-aki-v568.js';

export default [
  {
    id: 'thakar-aki',
    summary: `The Cleveland Clinic score (Thakar and colleagues, JASN 2005) for the preoperative risk of acute renal failure requiring dialysis after cardiac surgery. Maximum ${T.THAKAR_MAX} points. WEIGHTS: female 1; congestive heart failure 1; left ventricular ejection fraction under 35 percent 1; preoperative intra-aortic balloon pump 2; chronic obstructive pulmonary disease 1; diabetes requiring insulin 1; previous cardiac surgery 1; emergency surgery 2. SURGERY TYPE: CABG only 0; valve only 1; CABG plus valve 2; OTHER cardiac surgery 2. PREOPERATIVE CREATININE: under 1.2 mg/dL 0; 1.2 to under 2.1 mg/dL 2; 2.1 mg/dL or above 5. **THE OUTCOME IS ACUTE RENAL FAILURE REQUIRING DIALYSIS, NOT KDIGO ACUTE KIDNEY INJURY** - this is the most important thing to get right, because dialysis-requiring failure is far rarer and far more severe than any-stage AKI, which is common after cardiac surgery, and studies revalidating this score against any-stage AKI are measuring something else. Reporting the output as "risk of AKI" overstates what is predicted by a wide margin. **THE PUBLISHED RISK CATEGORIES ARE 0-2, 3-5, 6-8 AND 9-13, AND THEY STOP AT ${T.HIGHEST_PUBLISHED_SCORE} WHILE THE SCORE RUNS TO ${T.THAKAR_MAX}**: scores of ${T.HIGHEST_PUBLISHED_SCORE + 1} to ${T.THAKAR_MAX} are REACHABLE and fall outside the published table, so this tool returns bandAssigned false above ${T.HIGHEST_PUBLISHED_SCORE} rather than stretching the top category, which would invent a risk estimate for patients the derivation never described. **THE EXACT RISK PERCENTAGES ARE DELIBERATELY NOT REPORTED**: independent secondary sources disagree on them, probably quoting test-set against validation-set figures, and the primary table is paywalled and could not be fetched to adjudicate. The score and the four band boundaries are consistent across sources; the percentages are not, so none is quoted. **SURGERY TYPE IS COUNTER-INTUITIVE AND MUST NOT BE REORDERED BY INVASIVENESS**: isolated CABG, the commonest operation, scores 0, while OTHER cardiac surgery scores 2, the SAME as the far more invasive CABG plus valve. **CREATININE IS A STEPPED TERM THAT JUMPS FROM 2 TO 5 POINTS ACROSS ONE THRESHOLD** - a step larger than any single risk factor - so 0.1 mg/dL of drift near 2.1 mg/dL can move a patient two risk bands. Never interpolate it. Every input is preoperative except the surgery type, and emergency surgery and previous cardiac surgery are separate items that can both apply to the same patient. This is a preoperative risk estimate for ONE specific postoperative complication. It does NOT diagnose kidney disease, does not measure current kidney function beyond the single creatinine it takes as an input, and does NOT predict any other outcome - not mortality, not length of stay, not non-dialysis acute kidney injury. It is NOT an indication to cancel or defer an operation, and it does not select perioperative management, fluid strategy, or nephroprotective measures.`,
    compute: T.thakarAki,
    fields: [
      ...T.THAKAR_FACTORS.map((f) => ({
        dom: `thakar-${f.key}`, arg: f.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${f.text}. ${f.points} point${f.points === 1 ? '' : 's'}. Preoperative.`,
      })),
      {
        dom: 'thakar-surgery', arg: 'surgeryType', kind: 'enum',
        values: T.SURGERY_TYPES.map((s) => s.value), required: true,
        label: `Type of cardiac surgery. NOT ordered by invasiveness: "other" scores the same as CABG plus valve, and isolated CABG scores 0 [${T.SURGERY_TYPES.map((s) => `${s.value} = ${s.text}, ${s.points} points`).join('; ')}]`,
      },
      {
        dom: 'thakar-creatinine', arg: 'creatinine', kind: 'number', unit: 'mg/dL', required: true,
        label: `Preoperative serum creatinine. A STEPPED term, never interpolated: ${T.CREATININE_BANDS.map((b) => `${b.text} = ${b.points} points`).join('; ')}. The 2 to 5 jump is larger than any single risk factor.`,
      },
    ],
  },
];
