// spec-v598 MCP wave: adapter for the Japan Thyroid Association thyroid-storm criteria in
// lib/jta-thyroid-storm-v598.js. The dom keys mirror the browser renderer (views/group-v598.js) and
// META['jta-thyroid-storm'].example.
//
// **CENTRAL NERVOUS SYSTEM MANIFESTATIONS ARE PRIVILEGED, AND NOTHING ELSE IS.** With a CNS manifestation
// present, ONE other feature reaches TS1. Without one, THREE are required. A patient with fever and
// tachycardia alone is TS2; a patient with delirium and fever alone is TS1. Counting the five features
// equally is wrong in BOTH directions.
//
// **TS1 AND TS2 ARE DEFINITE AND SUSPECTED, NOT MILD AND SEVERE.** They grade diagnostic CERTAINTY, not
// severity. Never report TS2 as a milder illness.
//
// **TS2 HAS A SECOND ROUTE THAT IS "TS1 WITHOUT LABORATORY CONFIRMATION"**: a patient meeting the TS1
// pattern whose thyroid function tests are unavailable, with clinical evidence of thyroid disease, is TS2
// rather than TS1. THE SAME CLINICAL PICTURE DROPS A GRADE PURELY ON WHETHER A BLOOD TEST HAS COME BACK.
// `viaNoLabsRoute` marks it - report that flag, because the patient is not "less sick", only less confirmed.
//
// **THYROTOXICOSIS IS A PREREQUISITE, NOT A SCORED ITEM.** With it recorded absent, NO combination of
// features reaches either grade.
//
// **THE HEART-FAILURE CRITERION IS SEVERE-LEVEL ONLY**: pulmonary edema, moist rales over more than half the
// lung fields, or cardiogenic shock - NYHA class IV or Killip class III or above. Mild decompensation does
// NOT count and counting it over-diagnoses.
//
// **THE EXCLUSION CLAUSE IS DELIBERATELY NOT MECHANICAL**: the source says an alternative cause warrants
// exclusion and then says those same conditions may THEMSELVES TRIGGER thyroid storm. This tool asks and
// reports; it does not decide, and neither should a consumer.
//
// NOT THE BURCH-WARTOFSKY POINT SCALE. `burch-wartofsky` in this catalog is a WEIGHTED POINT SCALE read
// against a threshold; these are CATEGORICAL COMBINATION RULES. The two are known to disagree, and a
// Burch-Wartofsky total CANNOT be converted into a JTA grade.

import * as J from '../../lib/jta-thyroid-storm-v598.js';

export default [
  {
    id: 'jta-thyroid-storm',
    summary: `The Japan Thyroid Association (JTA) diagnostic criteria for thyroid storm (Akamizu and colleagues 2012). THYROTOXICOSIS - an elevated free T3 or free T4 - is a PREREQUISITE, not a scored item. THE FEATURES: a central nervous system manifestation (${J.CNS_DESCRIPTION}); ${J.NON_CNS_FEATURES.map((f) => f.text.toLowerCase()).join('; ')}. Heart failure means ${J.CHF_DESCRIPTION} Gastrointestinal or hepatic disturbance means ${J.GI_DESCRIPTION} **TS1** = thyrotoxicosis + at least one CNS manifestation + at least ${J.TS1_FEATURES_WITH_CNS} of the other four, OR thyrotoxicosis + at least ${J.TS1_FEATURES_WITHOUT_CNS} of the other four. **TS2** = thyrotoxicosis + at least ${J.TS2_FEATURES} of the other four, OR a patient meeting the TS1 pattern whose thyroid function tests are UNAVAILABLE but who has clinical evidence of thyroid disease. **CENTRAL NERVOUS SYSTEM MANIFESTATIONS ARE PRIVILEGED AND NOTHING ELSE IS**: with one present, ONE other feature reaches TS1; without one, THREE are required. A patient with fever and tachycardia alone is TS2; a patient with delirium and fever alone is TS1. COUNTING THE FIVE FEATURES EQUALLY IS WRONG IN BOTH DIRECTIONS. **TS1 AND TS2 ARE DEFINITE AND SUSPECTED, NOT MILD AND SEVERE** - they grade diagnostic CERTAINTY, so never report TS2 as a milder illness. **TS2'S SECOND ROUTE IS "TS1 WITHOUT LABORATORY CONFIRMATION"**, so the same clinical picture drops a grade purely on whether a blood test has come back; \`viaNoLabsRoute\` marks it and must be reported, because the patient is not less sick, only less confirmed. **THE HEART-FAILURE CRITERION IS SEVERE-LEVEL ONLY** and mild decompensation does not count. **THE EXCLUSION CLAUSE IS DELIBERATELY NOT MECHANICAL**: the source says an alternative cause warrants exclusion and then says those same conditions may THEMSELVES TRIGGER thyroid storm, so this tool asks and reports rather than deciding, and neither should a consumer. One operator diverges between reproductions - the bilirubin element is printed as "above ${J.BILIRUBIN_THRESHOLD}" in one source and "${J.BILIRUBIN_THRESHOLD} or more" in another - and the at-or-above reading is applied. **NOT THE BURCH-WARTOFSKY POINT SCALE**: \`burch-wartofsky\` in this catalog is a WEIGHTED POINT SCALE read against a threshold while these are CATEGORICAL COMBINATION RULES; the two are known to disagree and a total CANNOT be converted into a grade. Thyroid storm is a LIFE-THREATENING EMERGENCY with mortality above 10 percent. These criteria CLASSIFY and do NOT treat: they do not select or sequence thionamides, iodine, beta-blockade or corticosteroids, do not indicate that iodine must follow a thionamide, and do not decide on intensive care. **FAILING THE CRITERIA DOES NOT EXCLUDE THYROID STORM**, and treatment of a patient who looks to be in storm should NOT wait for a criteria set or for thyroid function tests to return.`,
    compute: J.jtaThyroidStorm,
    fields: [
      { dom: 'jta-thyrotoxicosis', arg: 'thyrotoxicosis', kind: 'enum', values: ['confirmed', 'labs-unavailable', 'absent'], required: true, label: 'Thyrotoxicosis (elevated free T3 or free T4). A PREREQUISITE, not a scored item: "absent" means neither grade can be met. "labs-unavailable" opens the TS2 no-laboratory route.' },
      { dom: 'jta-clinicalThyroidDisease', arg: 'clinicalThyroidDisease', kind: 'enum', values: ['no', 'yes'], required: true, label: 'Clinical evidence of thyroid disease (history, goiter, exophthalmos). Used ONLY for the TS2 no-laboratory route.' },
      { dom: 'jta-cnsManifestation', arg: 'cnsManifestation', kind: 'enum', values: ['no', 'yes'], required: true, label: `CNS manifestation - THE PRIVILEGED FEATURE. ${J.CNS_DESCRIPTION} With it, ${J.TS1_FEATURES_WITH_CNS} other feature reaches TS1; without it, ${J.TS1_FEATURES_WITHOUT_CNS} are required.` },
      ...J.NON_CNS_FEATURES.map((f) => ({
        dom: `jta-${f.key}`, arg: f.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${f.text}. One of the four non-privileged features.${f.key === 'heartFailure' ? ` ${J.CHF_DESCRIPTION}` : ''}${f.key === 'giHepatic' ? ` ${J.GI_DESCRIPTION}` : ''}`,
      })),
      { dom: 'jta-alternativeCauseExcluded', arg: 'alternativeCauseExcluded', kind: 'enum', values: ['no', 'yes'], required: true, label: 'Whether an alternative cause of the findings has been considered and excluded. REPORTED, NOT DECIDED: the source notes those same conditions may themselves trigger thyroid storm.' },
    ],
  },
];
