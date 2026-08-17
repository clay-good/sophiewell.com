// spec-v615 MCP wave: adapter for the AREDS simplified severity scale in lib/areds-v615.js. The dom keys
// mirror the browser renderer (views/group-v615.js) and META.areds.example.
//
// **THE SCALE SCORES A PERSON, NOT AN EYE.** Both eyes contribute; the total runs 0 to 4. NEVER score one
// eye and report 0 to 2.
//
// **AN EYE WITH ADVANCED DISEASE IS ASSIGNED 2 FACTORS OUTRIGHT** and its own drusen and pigment are NOT
// counted - it has already converted. The remaining factors come from the fellow eye.
//
// **INTERMEDIATE DRUSEN COUNT ONLY WHEN NEITHER EYE HAS LARGE DRUSEN, AND ONLY WHEN BILATERAL** - one factor
// for the person, never one per eye. `intermediateSuppressed` is returned when the answer was yes but an eye
// has large drusen.
//
// **IF BOTH EYES ALREADY HAVE ADVANCED DISEASE**, `atRiskEye` is false and `fiveYearRiskPercent` is NULL -
// there is no at-risk eye and the scale has nothing to predict. Do NOT report a risk.
//
// **THE RISK IS NOT EVENLY SPACED** (0.5, 3, 12, 25, 50%) and it is for advanced disease IN AT LEAST ONE EYE.

import * as A from '../../lib/areds-v615.js';

const cap = (s) => `${s[0].toUpperCase()}${s.slice(1)}`;

export default [
  {
    id: 'areds',
    summary: `The AREDS simplified severity scale (Ferris and colleagues 2005, AREDS Report No. 18) counts risk factors ACROSS BOTH EYES and reads off an approximate FIVE-YEAR risk of advanced age-related macular degeneration [${A.RISKS.map((r) => `${r.factors} factors = ${r.risk}%`).join('; ')}]. **${A.PERSON_NOTE}** **${A.ADVANCED_NOTE}** **${A.INTERMEDIATE_NOTE}** \`intermediateSuppressed\` is returned when the answer was yes but an eye has large drusen. **${A.NONLINEAR_NOTE}** **${A.AT_LEAST_ONE_NOTE}** When both eyes are already advanced, \`atRiskEye\` is false and \`fiveYearRiskPercent\` is NULL - do NOT report a risk. A large druse is ${A.LARGE_DRUSEN_THRESHOLD}. This estimates a GROUP-LEVEL five-year risk from an examination. It does NOT diagnose macular degeneration, does NOT grade disease already present, does NOT decide antioxidant or zinc supplementation or any injection, and does NOT predict what will happen to one person.`,
    compute: A.aredsSimplified,
    fields: [
      ...A.EYES.flatMap((eye) => A.EYE_FEATURES.map((f) => ({
        dom: `areds-${eye.key}${cap(f.key)}`,
        arg: `${eye.key}${cap(f.key)}`,
        kind: 'enum', values: ['yes', 'no'], required: true,
        label: `${eye.text} - ${f.text}.${f.key === 'advanced' ? ` If yes, this eye is assigned ${A.ADVANCED_EYE_FACTORS} factors and its own drusen and pigment are NOT counted.` : ' Worth 1 factor for this eye.'}`,
      }))),
      {
        dom: 'areds-bilateralIntermediateDrusen', arg: 'bilateralIntermediateDrusen',
        kind: 'enum', values: ['yes', 'no'], required: true,
        label: 'Intermediate drusen in BOTH eyes. Worth 1 factor FOR THE PERSON, and ONLY when neither eye has large drusen.',
      },
    ],
  },
];
