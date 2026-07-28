// spec-v549 MCP wave: adapter for the POSEIDON classification in lib/poseidon-v549.js. The dom keys mirror
// the browser renderer (views/group-v549.js) and META['poseidon'].example: poseidon-age, poseidon-afc,
// poseidon-amh, poseidon-prior, poseidon-oocytes map to the lib args age, afc, amh, priorCycle, oocytes.
//
// **ONLY GROUPS 1 AND 2 ARE SUBDIVIDED, AND AN AGENT WILL INVENT 3a AND 4b IF NOT TOLD OTHERWISE.** The a/b
// split by oocyte yield exists only where a prior cycle has happened. Groups 3 and 4 are single groups with
// no subdivision, and the summary says so explicitly because a four-group scheme where two groups split is
// exactly the shape a language model smooths into "all four split".
//
// **GROUPS 1 AND 2 REQUIRE A PRIOR CONVENTIONAL-STIMULATION CYCLE; GROUPS 3 AND 4 DO NOT.** A patient with
// adequate reserve and no prior cycle is NOT group 1 or 2 and is not "group 1 pending" - she is
// unclassifiable, because the defining criterion is an unexpectedly poor response that has not yet had the
// chance to occur. The tool returns `classified: false` with the reason rather than guessing a group.
//
// **ADEQUATE RESERVE WITH 10 OR MORE OOCYTES IS NOT POSEIDON AT ALL.** The classification describes
// LOW-PROGNOSIS patients, so a normal responder falls outside it and the tool says so. An agent that always
// emitted a group would label every patient low-prognosis, inverting the purpose of the scheme.
//
// THE TWO RESERVE MARKERS ARE ALTERNATIVES. The criterion is an antral follicle count of 5 or more AND/OR
// anti-Mullerian hormone of 1.2 ng/mL or more, so neither field is individually required and the tool
// refuses only when both are absent. When both are supplied and DISAGREE, reserve is graded adequate - that
// is what "and/or" means - and the result sets `markersDiscordant` so the disagreement is visible instead of
// being resolved silently. Discordance is common and it decides which half of the scheme applies.

import * as P from '../../lib/poseidon-v549.js';

export default [
  {
    id: 'poseidon',
    summary: 'The POSEIDON classification of LOW-PROGNOSIS patients in assisted reproductive technology (POSEIDON Group, Fertility and Sterility 2016). Two axes, age and ovarian reserve, give four groups. Group 1: age under 35, ADEQUATE reserve, and a prior conventional-stimulation cycle yielding fewer than 10 oocytes. Group 2: the same picture at age 35 or over. Group 3: age under 35 with POOR reserve. Group 4: age 35 or over with POOR reserve. ONLY GROUPS 1 AND 2 ARE SUBDIVIDED, into a for fewer than 4 oocytes and b for 4 to 9 oocytes. THERE IS NO GROUP 3a OR 4b - groups 3 and 4 are single undivided groups, and this asymmetry is the most commonly misreproduced part of the classification. GROUPS 1 AND 2 REQUIRE A PRIOR CONVENTIONAL-STIMULATION CYCLE and groups 3 and 4 do not: the defining feature of groups 1 and 2 is an UNEXPECTEDLY poor response, so a patient with adequate reserve who has never been stimulated is NOT group 1 or 2 and is not "group 1 pending" either, but simply unclassifiable until a cycle has been done, which this tool reports as classified false with the reason. Groups 3 and 4 are assignable before any stimulation because poor reserve is measurable up front. ADEQUATE RESERVE TOGETHER WITH 10 OR MORE OOCYTES IS NOT A POSEIDON GROUP AT ALL: the classification describes low-prognosis patients, a normal responder falls outside it, and the tool returns that as a real answer rather than forcing a group. Ovarian reserve is defined by an antral follicle count of 5 or more AND/OR anti-Mullerian hormone of 1.2 ng/mL or more, so THE TWO MARKERS ARE ALTERNATIVES rather than both being required: either one suffices, and the tool refuses only when both are absent. When both are given and they disagree, reserve is graded adequate, because that is what and/or means, and the result flags the discordance rather than resolving it silently, since marker disagreement is common and decides which half of the scheme applies. This is a descriptive stratification for research and counseling. It does NOT diagnose infertility, does NOT measure ovarian reserve but reads markers already measured, and does NOT predict whether a given patient will conceive. It is NOT a protocol selector: it does not choose a stimulation regimen, a gonadotropin dose, an adjuvant, or a decision about donor oocytes. The groups describe expected OOCYTE YIELD, not live birth, and the marker thresholds are population cut points that perform poorly as individual predictions.',
    compute: P.poseidon,
    fields: [
      {
        dom: 'poseidon-age', arg: 'age', kind: 'number', unit: 'years', required: true,
        label: 'Patient age. The classification splits at 35: under 35 gives groups 1 and 3, 35 or over gives groups 2 and 4.',
      },
      {
        dom: 'poseidon-afc', arg: 'afc', kind: 'number', unit: 'follicles', required: false,
        label: `Antral follicle count. Adequate reserve is ${P.AFC_THRESHOLD} or more. ALTERNATIVE to anti-Mullerian hormone, not additional to it: supply either marker or both, but at least one.`,
      },
      {
        dom: 'poseidon-amh', arg: 'amh', kind: 'number', unit: 'ng/mL', required: false,
        label: `Anti-Mullerian hormone. Adequate reserve is ${P.AMH_THRESHOLD} or more. ALTERNATIVE to the antral follicle count, not additional to it: supply either marker or both, but at least one.`,
      },
      {
        dom: 'poseidon-prior', arg: 'priorCycle', kind: 'enum', values: ['no', 'yes'], required: false,
        label: 'Whether a prior conventional-stimulation cycle has been done. Needed only when reserve is ADEQUATE, because groups 1 and 2 are defined by an unexpectedly poor response to one. Groups 3 and 4 are assignable with no prior cycle, so this may be omitted when reserve is poor.',
      },
      {
        dom: 'poseidon-oocytes', arg: 'oocytes', kind: 'number', unit: 'oocytes', required: false,
        label: 'Oocytes retrieved in that prior cycle. Required only when reserve is adequate and a prior cycle has been done. It decides both whether this is a POSEIDON group at all (10 or more is a normal response and falls outside the classification) and, below 10, the subdivision: fewer than 4 is a, and 4 to 9 is b.',
      },
    ],
  },
];
