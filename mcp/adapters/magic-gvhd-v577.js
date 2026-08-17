// spec-v577 MCP wave: adapter for MAGIC acute GVHD staging in lib/magic-gvhd-v577.js. The dom keys mirror
// the browser renderer (views/group-v577.js) and META['magic-gvhd'].example.
//
// **THE GRADE IS NOT A MAXIMUM OVER THE ORGAN STAGES, AND TREATING IT AS ONE IS THE CENTRAL ERROR.**
// Stage-3 skin ALONE is grade II. Stage-2 lower GI ALONE is grade III. A LOWER organ stage therefore
// produces a HIGHER overall grade, because the grade table asks WHICH organ is involved, not how badly. An
// agent that takes the worst organ stage and calls it the grade will be wrong in both directions.
//
// **UPPER GI HAS ONLY TWO STATES, 0 AND 1.** There is no upper-GI stage 2, 3 or 4. A uniform 0-4 enum per
// organ invents three unreachable values. In the grade III and IV rules upper GI appears as a CONSTRAINT
// ("with stage 0-1 upper GI") and, since 1 is its maximum, that constraint can NEVER be violated - so upper
// GI can never by itself drive grade III or IV. It contributes at grade II and is a passenger above it.
//
// **LOWER-GI STAGE 4 IS QUALITATIVE AND EXPLICITLY OVERRIDES STOOL VOLUME**: severe abdominal pain with or
// without ileus, or grossly bloody stool, REGARDLESS OF VOLUME. An agent deriving the stage from a volume
// alone could never reach stage 4 and would cap the sickest gut patients at 3.
//
// **THE LOWER-GI VOLUME CRITERIA HAVE SEPARATE ADULT AND PEDIATRIC DENOMINATORS**, and two alternative
// measures within each (volume OR episode count) that can DISAGREE for the same patient, with NO tie-break
// rule in the source. That is why this tool takes the STAGE rather than a volume.
//
// **SKIN STAGE 4 IS A CONJUNCTION, NOT A THRESHOLD**: erythroderma >50% BSA PLUS bullae PLUS desquamation
// >5%. Generalized erythroderma without bullae stays at stage 3. Skin is scored on ACTIVE ERYTHEMA ONLY.

import * as M from '../../lib/magic-gvhd-v577.js';

export default [
  {
    id: 'magic-gvhd',
    summary: `MAGIC acute GVHD staging and grading (Harris and colleagues, BBMT 2016), the consortium standard that superseded the Modified Glucksberg grade for data collection and is the grading used in the ruxolitinib registration trials. Four organs are staged, then a grade is read off a PATTERN table. SKIN (active erythema only): 0 no rash; 1 maculopapular rash under 25 percent BSA; 2 rash 25 to 50 percent; 3 rash over 50 percent; 4 generalized erythroderma over 50 percent BSA PLUS bullous formation PLUS desquamation over 5 percent - **A CONJUNCTION, NOT A THRESHOLD**, so erythroderma without bullae stays at stage 3. LIVER (bilirubin): 0 under 2; 1 two to 3; 2 3.1 to 6; 3 6.1 to 15; 4 over 15 mg/dL. UPPER GI: 0 no or intermittent nausea, vomiting or anorexia; ${M.UPPER_GI_MAX_STAGE} persistent. **UPPER GI HAS ONLY TWO STATES - THERE IS NO UPPER-GI STAGE 2, 3 OR 4** - so a uniform 0-4 enum per organ invents three unreachable values. LOWER GI: 0 adult under 500 mL/day or under 3 episodes/day; 1 adult 500 to 999 mL/day or 3 to 4 episodes; 2 adult 1000 to 1500 mL/day or 5 to 7 episodes; 3 adult over 1500 mL/day or over 7 episodes; 4 severe abdominal pain with or without ileus, OR grossly bloody stool, REGARDLESS OF STOOL VOLUME. Pediatric denominators differ (mL/kg/day). GRADES: 0 no stage 1-4 of any organ; I stage 1-2 skin without liver, upper GI or lower GI involvement; II stage 3 rash and/or stage 1 liver and/or stage 1 upper GI and/or stage 1 lower GI; III stage 2-3 liver and/or stage 2-3 lower GI, with stage 0-3 skin and stage 0-1 upper GI; IV stage 4 skin, liver or lower GI, with stage 0-1 upper GI. **THE GRADE IS NOT A MAXIMUM OVER THE ORGAN STAGES**: stage-3 skin ALONE is grade II while stage-2 lower GI ALONE is grade III, so a LOWER organ stage can produce a HIGHER overall grade, because the table asks WHICH organ is involved rather than how badly. Taking the worst organ stage as the grade is wrong in both directions. **UPPER GI CAN NEVER BY ITSELF DRIVE GRADE III OR IV**: in those rules it appears as a CONSTRAINT, and since ${M.UPPER_GI_MAX_STAGE} is its maximum the constraint can never be violated. **LOWER-GI STAGE 4 IS QUALITATIVE AND OVERRIDES VOLUME**, so a volume-derived stage could never reach it. **THE LOWER-GI VOLUME CRITERIA HAVE SEPARATE ADULT AND PEDIATRIC DENOMINATORS AND TWO ALTERNATIVE MEASURES WITHIN EACH** - volume or episode count - which can disagree for the same patient with NO tie-break rule given, which is why this tool takes the STAGE rather than a volume. This STAGES AN ESTABLISHED DIAGNOSIS. It does NOT diagnose acute graft-versus-host disease, and its mimics are common and dangerous: drug eruption, viral infection including CMV and adenovirus, Clostridioides difficile and other enteric infection, engraftment syndrome and sinusoidal obstruction syndrome all imitate one or more organs, and several require treatment that is the OPPOSITE of immunosuppression - biopsy and infectious workup settle that, not this table. It does not distinguish acute from chronic GVHD, which is defined by features rather than by day 100. It does not select or dose immunosuppression, and a grade is not an indication for corticosteroids or any second-line agent.`,
    compute: M.magicGvhd,
    fields: [
      {
        dom: 'magic-skin', arg: 'skin', kind: 'enum',
        values: M.SKIN_STAGES.map((s) => String(s.stage)), required: true,
        label: `Skin stage, ACTIVE ERYTHEMA ONLY [${M.SKIN_STAGES.map((s) => `${s.stage} = ${s.text}`).join('; ')}]`,
      },
      {
        dom: 'magic-liver', arg: 'liver', kind: 'enum',
        values: M.LIVER_STAGES.map((s) => String(s.stage)), required: true,
        label: `Liver stage by bilirubin [${M.LIVER_STAGES.map((s) => `${s.stage} = ${s.text}`).join('; ')}]`,
      },
      {
        dom: 'magic-upper', arg: 'upperGi', kind: 'enum',
        values: M.UPPER_GI_STAGES.map((s) => String(s.stage)), required: true,
        label: `Upper GI stage. ONLY 0 OR ${M.UPPER_GI_MAX_STAGE} EXIST - there is no upper-GI stage 2, 3 or 4 [${M.UPPER_GI_STAGES.map((s) => `${s.stage} = ${s.text}`).join('; ')}]`,
      },
      {
        dom: 'magic-lower', arg: 'lowerGi', kind: 'enum',
        values: M.LOWER_GI_STAGES.map((s) => String(s.stage)), required: true,
        label: `Lower GI stage. Stage 4 is QUALITATIVE and overrides volume [${M.LOWER_GI_STAGES.map((s) => `${s.stage} = ${s.text}`).join('; ')}]`,
      },
    ],
  },
];
