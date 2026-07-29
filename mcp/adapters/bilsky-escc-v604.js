// spec-v604 MCP wave: adapter for the Bilsky ESCC scale in lib/bilsky-escc-v604.js. The dom keys mirror the
// browser renderer (views/group-v604.js) and META['bilsky-escc'].example.
//
// **THE GRADES ARE NOT NUMBERS AND MUST NOT BE STORED AS ONE.** The labels are 0, 1a, 1b, 1c, 2, 3. They
// CANNOT be averaged, summed or parsed as integers: `parseInt` maps 1a, 1b and 1c ALL to 1 and destroys
// exactly the distinction the subdivision exists to draw. A "mean ESCC grade" is not a quantity this scale
// supports. `grade` is returned as a STRING and `ordinalRank` is exposed separately FOR SORTING ONLY.
//
// **THE CLINICALLY DECISIVE SPLIT SITS INSIDE GRADE 1, NOT AT THE NUMERIC MIDDLE.** Low grade is 0 through
// 1c; high grade is 2 and 3. FOUR of the six grades are low, and the boundary is between cord ABUTMENT (1c)
// and cord COMPRESSION (2).
//
// **THE SCALE GRADES ANATOMY, NOT NEUROLOGY.** In the cited analysis the severity of paralysis was NOT
// correlated with the grade: a patient can have grade 3 with normal power, and grade 1b can be severely
// impaired. Never infer neurological status from the grade.
//
// **THE SAME GRADE MEANS DIFFERENT THINGS AT DIFFERENT LEVELS AND THE SCALE CARRIES NO LEVEL INFORMATION.**
// At C1-T2 at least half of patients with grade 1b or worse had moderate-to-severe paralysis; at T3-L5 that
// threshold was 1c or worse. `level` is an OPTIONAL input and the level-specific threshold is reported
// separately rather than folded into the grade.
//
// **IT IS A SINGLE-SLICE, SINGLE-SEQUENCE JUDGMENT**: axial T2-weighted MRI at the site of MOST SEVERE canal
// compromise. A grade read from a sagittal image, from CT, or away from the worst level is not this grade.

import * as B from '../../lib/bilsky-escc-v604.js';

export default [
  {
    id: 'bilsky-escc',
    summary: `The BILSKY EPIDURAL SPINAL CORD COMPRESSION (ESCC) SCALE grades how far a spinal metastasis has encroached on the canal, assessed on ${B.SEQUENCE}. THE GRADES: ${B.GRADES.map((g) => `${g.grade} = ${g.text}`).join('; ')}. **THE GRADES ARE NOT NUMBERS AND MUST NOT BE STORED AS ONE** - the scale is nominally 4-point but grade 1 is subdivided into 1a, 1b and 1c, and \`parseInt\` maps ALL THREE to 1, destroying exactly the distinction the subdivision exists to draw. They cannot be averaged or summed, a "mean ESCC grade" is not a quantity this scale supports, \`grade\` is returned as a STRING, and \`ordinalRank\` is exposed separately FOR SORTING ONLY. **THE CLINICALLY DECISIVE SPLIT SITS INSIDE GRADE 1, NOT AT THE NUMERIC MIDDLE**: LOW grade is 0 through 1c and HIGH grade is 2 and 3, so FOUR of the six grades are low and the boundary is between cord ABUTMENT (1c) and cord COMPRESSION (2). **THE SCALE GRADES ANATOMY, NOT NEUROLOGY**: in the cited analysis the severity of paralysis was NOT correlated with the grade, so a patient can have grade 3 compression with normal power and a patient with grade 1b can be severely impaired - NEVER infer neurological status from the grade. **THE SAME GRADE MEANS DIFFERENT THINGS AT DIFFERENT SPINAL LEVELS AND THE SCALE CARRIES NO LEVEL INFORMATION**: at ${B.LEVELS[0].text} at least half of patients with grade ${B.LEVELS[0].paralysisThresholdGrade} or worse developed moderate-to-severe paralysis, while at ${B.LEVELS[1].text} that threshold was grade ${B.LEVELS[1].paralysisThresholdGrade} or worse. \`level\` is OPTIONAL and the level-specific threshold is reported separately rather than folded into the grade. **IT IS A SINGLE-SLICE, SINGLE-SEQUENCE JUDGMENT** - T2 axial images were found more useful than T1, and a grade read from a sagittal image, from computed tomography, or away from the worst level is NOT this scale's grade. This grades an IMAGING APPEARANCE. It does NOT diagnose cord compression as a clinical syndrome, does NOT measure neurological function, and does NOT by itself indicate surgery, radiotherapy or corticosteroids - it is one input to a decision that also weighs neurological status, oncological factors, mechanical stability and systemic disease. **SUSPECTED MALIGNANT CORD COMPRESSION IS A TIME-CRITICAL EMERGENCY** and imaging plus specialist referral should NOT wait on a grading exercise.`,
    compute: B.bilskyEscc,
    fields: [
      {
        dom: 'escc-grade', arg: 'grade', kind: 'enum', values: B.GRADES.map((g) => g.grade), required: true,
        label: `The ESCC grade as a LABEL, not a number [${B.GRADES.map((g) => `${g.grade} = ${g.text}`).join('; ')}]. 1a, 1b and 1c are DISTINCT grades that all parse to the integer 1.`,
      },
      {
        dom: 'escc-level', arg: 'level', kind: 'enum', values: B.LEVELS.map((l) => l.value), required: false,
        label: `OPTIONAL spinal level. NOT part of the grade - it changes the interpretation only [${B.LEVELS.map((l) => `${l.value} = ${l.text}, threshold grade ${l.paralysisThresholdGrade}`).join('; ')}]`,
      },
    ],
  },
];
