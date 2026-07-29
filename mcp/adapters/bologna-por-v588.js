// spec-v588 MCP wave: adapter for the ESHRE Bologna criteria in lib/bologna-por-v588.js. The dom keys mirror
// the browser renderer (views/group-v588.js) and META['bologna-por'].example.
//
// **THE CUT-OFFS ARE PUBLISHED AS RANGES, NOT NUMBERS.** The consensus defines an abnormal ovarian reserve
// test as an antral follicle count under 5 TO 7, or AMH under 0.5 TO 1.1 ng/mL. IT DOES NOT PICK A NUMBER.
// The criteria therefore CANNOT BE COMPUTED without a choice the source declined to make: an antral follicle
// count of 6 is abnormal under a cutoff of 7 and normal under a cutoff of 5, and the same patient is or is
// not a poor responder depending on it. Both cutoffs are REQUIRED inputs, NONE IS DEFAULTED, and any result
// resting on a value inside the published range sets `cutoffSensitive` - report that flag, because the
// classification would flip under another permissible cutoff.
//
// **"AT LEAST TWO OF THREE" HAS AN OVERRIDE THAT NEEDS ONLY ONE.** Two episodes of poor response after
// MAXIMAL stimulation are sufficient on their own, IN THE ABSENCE OF advanced maternal age or an abnormal
// ovarian reserve test. A consumer that counts to two and stops calls exactly the group that clause was
// written for a non-responder. The override is also BLOCKED when either of those two is present, and
// `overrideBlocked` reports that case.
//
// **THE FIRST CRITERION IS NOT A NUMBER**: "advanced maternal age (40 or over) OR ANY OTHER RISK FACTOR for
// poor ovarian response" - an open-ended clause with no list attached, satisfied by clinical judgment rather
// than by the age alone, which is why it is asked as a separate input.
//
// **THE SECOND CRITERION IS CONDITIONAL ON THE PROTOCOL**: 3 or fewer oocytes after a CONVENTIONAL
// stimulation protocol. A low yield after a deliberately mild or minimal-stimulation cycle is NOT a Bologna
// criterion, and counting it over-diagnoses poor response.
//
// PREDECESSOR OF `poseidon`, which is already in this catalog and was proposed precisely because these
// criteria group women with very different prognoses.

import * as B from '../../lib/bologna-por-v588.js';

export default [
  {
    id: 'bologna-por',
    summary: `The ESHRE BOLOGNA CRITERIA for POOR OVARIAN RESPONSE (Ferraretti and colleagues 2011). At least ${B.CRITERIA_REQUIRED} of three must be present: (1) advanced maternal age, ${B.ADVANCED_AGE} years or over, OR ANY OTHER RISK FACTOR for poor response; (2) a previous poor response, ${B.PREVIOUS_POR_OOCYTES} or fewer oocytes after a CONVENTIONAL stimulation protocol; (3) an abnormal ovarian reserve test, antral follicle count under ${B.AFC_CUTOFF_RANGE.low} to ${B.AFC_CUTOFF_RANGE.high} or AMH under ${B.AMH_CUTOFF_RANGE.low} to ${B.AMH_CUTOFF_RANGE.high} ng/mL. **THE CUT-OFFS ARE PUBLISHED AS RANGES, NOT NUMBERS** - the consensus does NOT pick one - so the criteria CANNOT BE COMPUTED without a choice the source declined to make. An antral follicle count of 6 is abnormal under a cutoff of ${B.AFC_CUTOFF_RANGE.high} and normal under a cutoff of ${B.AFC_CUTOFF_RANGE.low}, and the same patient is or is not a poor responder depending on it. BOTH CUTOFFS ARE REQUIRED INPUTS AND NEITHER IS DEFAULTED; when a value sits inside the published range the result sets \`cutoffSensitive\`, and that flag must be reported, because the classification would flip under another permissible cutoff. **"AT LEAST TWO OF THREE" HAS AN OVERRIDE THAT NEEDS ONLY ONE**: ${B.OVERRIDE_EPISODES} episodes of poor response after MAXIMAL stimulation are sufficient on their own, IN THE ABSENCE OF advanced maternal age or an abnormal ovarian reserve test. Counting to ${B.CRITERIA_REQUIRED} and stopping calls exactly the group that clause was written for a non-responder; \`qualifiedByOverride\` marks those patients. The override is BLOCKED when advanced age or an abnormal reserve test is present, and \`overrideBlocked\` reports that. **THE FIRST CRITERION IS NOT A NUMBER** - it admits any other risk factor for poor response, an open-ended clause with no list attached, so it is asked as a separate input and satisfied by clinical judgment rather than by the age alone. **THE SECOND CRITERION IS CONDITIONAL ON THE PROTOCOL** - a low yield after a deliberately mild or minimal-stimulation cycle is NOT a Bologna criterion, and counting it over-diagnoses poor response. This is a research and prognostic DEFINITION, NOT a treatment decision. Meeting it does not mean a cycle will fail, does NOT set a stimulation protocol or a gonadotropin dose, and is NOT a reason to decline treatment or to advise donor oocytes. It says nothing about oocyte or embryo quality and nothing about an individual's chance of a live birth. The published criticism of these criteria is precisely that they group women with very different prognoses, which is why the POSEIDON classification (\`poseidon\` in this catalog) was proposed.`,
    compute: B.bolognaPor,
    fields: [
      { dom: 'bol-age', arg: 'age', kind: 'number', unit: 'years', required: true, label: `Age. ${B.ADVANCED_AGE} or over satisfies the first half of criterion 1.` },
      { dom: 'bol-risk', arg: 'otherRiskFactor', kind: 'enum', values: ['no', 'yes'], required: true, label: 'ANY OTHER RISK FACTOR for poor ovarian response. An open-ended clause with no list attached; it satisfies criterion 1 on its own, at any age.' },
      { dom: 'bol-prev', arg: 'previousPorConventional', kind: 'enum', values: ['no', 'yes'], required: true, label: `A previous cycle yielding ${B.PREVIOUS_POR_OOCYTES} or fewer oocytes AFTER A CONVENTIONAL STIMULATION PROTOCOL. A mild or minimal-stimulation cycle does NOT count.` },
      { dom: 'bol-episodes', arg: 'maximalStimulationPorEpisodes', kind: 'number', unit: 'episodes', required: true, label: `Episodes of poor response after MAXIMAL stimulation. ${B.OVERRIDE_EPISODES} or more qualify the patient ON THEIR OWN, but only in the ABSENCE of advanced age and of an abnormal ovarian reserve test.` },
      { dom: 'bol-afc', arg: 'afc', kind: 'number', unit: 'follicles', required: true, label: 'Antral follicle count.' },
      { dom: 'bol-afc-cut', arg: 'afcCutoff', kind: 'number', unit: 'follicles', required: true, label: `YOUR CENTER'S antral follicle count cutoff. REQUIRED AND NOT DEFAULTED: the consensus publishes a RANGE of ${B.AFC_CUTOFF_RANGE.low} to ${B.AFC_CUTOFF_RANGE.high}, not a number.` },
      { dom: 'bol-amh', arg: 'amh', kind: 'number', unit: 'ng/mL', required: true, label: 'AMH.' },
      { dom: 'bol-amh-cut', arg: 'amhCutoff', kind: 'number', unit: 'ng/mL', required: true, label: `YOUR CENTER'S AMH cutoff. REQUIRED AND NOT DEFAULTED: the consensus publishes a RANGE of ${B.AMH_CUTOFF_RANGE.low} to ${B.AMH_CUTOFF_RANGE.high} ng/mL, not a number.` },
    ],
  },
];
