// spec-v872 MCP adapter: the CDC/CSTE measles case definition in lib/measles-case-def-v872.js.
// The dom keys mirror the browser renderer (views/group-v872.js) and
// META['measles-case-def'].example.
//
// It names the surveillance tier. Isolation and reporting start on suspicion and are not what
// this returns. Clinical domain.

import { measlesCaseDefinition } from '../../lib/measles-case-def-v872.js';

export default [
  {
    id: 'measles-case-def',
    summary: 'Classifies a febrile rash illness as suspect, probable, or confirmed measles under the CDC and CSTE case definition. Suspect is ANY febrile illness accompanied by rash. The clinical criteria, absent a more likely diagnosis, are a temperature at or above 101 F, a generalized maculopapular rash lasting at least three days, and cough, coryza or conjunctivitis; meeting them with no laboratory result and no epidemiologic link is probable. Virus isolation, nucleic acid detection, a positive IgM, IgG seroconversion, or a direct epidemiologic link confirms. AIRBORNE ISOLATION AND NOTIFICATION START ON SUSPICION and do not wait on the tier. A NEGATIVE IgM IN THE FIRST 72 HOURS AFTER RASH ONSET DOES NOT EXCLUDE MEASLES, and a positive IgM alone is not conclusive where prevalence is low. VACCINATION DOES NOT EXCLUDE MEASLES: only a rash 7 to 14 days after vaccination with vaccine strain identified is a vaccine reaction.',
    compute: measlesCaseDefinition,
    fields: [
      { dom: 'mcd-febrilerashillness', arg: 'febrileRashIllness', kind: 'boolean', required: false, label: 'A febrile illness accompanied by rash (the whole suspect definition)' },
      { dom: 'mcd-fever101', arg: 'fever101', kind: 'boolean', required: false, label: 'Temperature at or above 101 F (38.3 C) (clinical criterion)' },
      { dom: 'mcd-rashthreedays', arg: 'rashThreeDays', kind: 'boolean', required: false, label: 'Generalized maculopapular rash lasting at least three days (clinical criterion)' },
      { dom: 'mcd-cccsymptom', arg: 'cccSymptom', kind: 'boolean', required: false, label: 'Cough, coryza, or conjunctivitis (clinical criterion)' },
      { dom: 'mcd-morelikelydiagnosis', arg: 'moreLikelyDiagnosis', kind: 'boolean', required: false, label: 'A more likely diagnosis has been made (defeats the clinical criteria)' },
      { dom: 'mcd-virusdetected', arg: 'virusDetected', kind: 'boolean', required: false, label: 'Measles virus isolated, or measles nucleic acid detected (laboratory evidence)' },
      { dom: 'mcd-igmpositive', arg: 'igmPositive', kind: 'boolean', required: false, label: 'Positive serologic test for measles IgM (laboratory evidence)' },
      { dom: 'mcd-iggseroconversion', arg: 'iggSeroconversion', kind: 'boolean', required: false, label: 'IgG seroconversion, or a significant rise in measles IgG (laboratory evidence)' },
      { dom: 'mcd-epilink', arg: 'epiLink', kind: 'boolean', required: false, label: 'Direct epidemiologic link to a laboratory-confirmed case (confirms on its own with a febrile rash illness)' },
      { dom: 'mcd-vaccinestrainrash', arg: 'vaccineStrainRash', kind: 'boolean', required: false, label: 'Rash began 7 to 14 days after vaccination, with vaccine strain identified (a vaccine reaction, not a case)' },
    ],
  },
];
