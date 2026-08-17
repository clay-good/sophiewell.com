// spec-v612 MCP wave: adapter for the University of Texas diabetic foot wound classification in
// lib/ut-diabetic-foot-v612.js. The dom keys mirror the browser renderer (views/group-v612.js) and
// META['ut-diabetic-foot'].example.
//
// **IT IS A TWO-DIMENSIONAL MATRIX. NEVER REPORT ONE AXIS ALONE.** Depth is the GRADE (0, I, II, III) and
// infection/ischemia is the STAGE (A, B, C, D); the answer is a PAIR such as "2B". The Wagner classification
// it extends is one-dimensional, so carrying a bare Wagner grade across drops the whole second axis.
//
// **GRADE 0 IS NOT "NO PROBLEM"** - it is a pre- or POST-ulcerative completely epithelialized lesion, and it
// still carries a stage. A healed ulcer on an ischemic foot is 0C.
//
// **NO OUTCOME PERCENTAGES ARE RETURNED** - the per-cell healing and amputation figures are single-sourced.
// Report the direction (risk rises across BOTH axes), never a number.
//
// The Wagner grade table is deliberately NOT carried, because independent renderings conflict on whether its
// grade 2 involves bone.

import * as U from '../../lib/ut-diabetic-foot-v612.js';

export default [
  {
    id: 'ut-diabetic-foot',
    summary: `The University of Texas diabetic foot wound classification (Armstrong and colleagues 1998) describes a diabetic foot ulcer on two axes at once. GRADE is depth [${U.GRADES.map((g) => `${g.value} = ${g.text}`).join('; ')}]. STAGE is complications [${U.STAGES.map((s) => `${s.value} = ${s.text}`).join('; ')}]. **IT IS A TWO-DIMENSIONAL MATRIX AND A SINGLE NUMBER CANNOT EXPRESS IT** - ${U.GRADES.length} grades by ${U.STAGES.length} stages is ${U.GRADES.length * U.STAGES.length} cells, and the answer is always a PAIR such as "2B" or "3D". NEVER report one axis alone. The Wagner classification this extends is ONE-dimensional, so carrying a bare Wagner grade across silently drops the entire infection-and-ischemia axis. **${U.STAGE_NOTE}** **${U.GRADE_ZERO_NOTE}** ${U.LADDER_NOTE} ${U.WAGNER_NOTE} **${U.OUTCOME_NOTE}** This DESCRIBES an ulcer. It does NOT diagnose infection or ischemia - those are the clinical and vascular assessments that feed INTO the stage - does NOT decide antibiotics, revascularization or amputation, and does NOT predict an individual patient's outcome.`,
    compute: U.utDiabeticFoot,
    fields: [
      { dom: 'utdf-grade', arg: 'grade', kind: 'enum', values: U.GRADES.map((g) => g.value), required: true, label: `Depth grade [${U.GRADES.map((g) => `${g.value} = ${g.text}`).join('; ')}]. Grade 0 is a pre- or post-ulcerative epithelialized lesion, NOT "no problem".` },
      { dom: 'utdf-stage', arg: 'stage', kind: 'enum', values: U.STAGES.map((s) => s.value), required: true, label: `Complication stage [${U.STAGES.map((s) => `${s.value} = ${s.text}`).join('; ')}]. This is the axis depth cannot see.` },
    ],
  },
];
