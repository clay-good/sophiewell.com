// spec-v562 MCP wave: adapter for the Scale for Contraversive Pushing in lib/scp-pushing-v562.js. The dom
// keys mirror the browser renderer (views/group-v562.js) and META['scp-pushing'].example.
//
// **THE TOTAL IS NOT THE CLASSIFIER, AND THRESHOLDING A TOTAL IS THE MOST NATURAL THING TO DO WITH A SCORED
// INSTRUMENT.** Pusher behavior is diagnosed only when ALL THREE sections independently clear the
// threshold. A patient scoring 4 of 6 - section A at 2, section B at 2, section C at 0 - is NOT a pusher,
// while a patient scoring 1.5 spread across all three IS. The tool returns the section subtotals as
// first-class values and evaluates every criterion against them, never against the total alone.
//
// **THE POINT LADDERS DIFFER BETWEEN SECTIONS AND ARE NOT EQUALLY SPACED.** Section A is 0, 0.25, 0.75, 1 -
// there is NO 0.5 in section A. Section B is 0, 0.5, 1. Section C is binary. An agent assuming a shared
// ladder will offer or accept 0.5 in section A, which the instrument does not contain. Each field's enum
// carries only its own section's values.
//
// **EACH SECTION IS SCORED TWICE, SITTING AND STANDING, AND THE TWO ARE SUMMED**, so each section maxes at
// 2 and the total at 6. Many secondary descriptions say "three items, 0-1 each" and get the maximum wrong
// by a factor of three.
//
// **THREE NAMED CRITERIA COEXIST AND ALL THREE ARE RETURNED.** They are not a source disagreement to
// refuse - they were formalized and named together and answer different questions. Crit_1 total above 0;
// Crit_2 every section above 0, the current recommendation; Crit_3 every section 1 or more, Karnath's
// original and the only one with no false positives. Reporting one would hide that a patient can be a
// pusher under the recommended criterion and not under the original.
//
// **A SECONDARY-SOURCE ERROR IS CARRIED DELIBERATELY AS A WARNING.** A widely used rehabilitation-measures
// reference states Karnath's criterion as subscores ABOVE 1; the primary sources say 1 OR MORE. The
// stricter misreading would reclassify every patient scoring exactly 1 in a section.

import * as S from '../../lib/scp-pushing-v562.js';

export default [
  {
    id: 'scp-pushing',
    summary: `The Scale for Contraversive Pushing (SCP), for PUSHER BEHAVIOR after stroke (Karnath's scale as tabulated by Baccini and colleagues 2006). THREE SECTIONS, EACH SCORED TWICE - SITTING AND STANDING - AND THE TWO SUMMED, so each section runs 0 to ${S.SECTION_MAX} and the total 0 to ${S.SCP_MAX}. Many secondary descriptions call this "three items, 0 to 1 each" and get the maximum wrong by a factor of three. SECTION A, spontaneous body posture: 1 = severe contraversive tilt WITH falling to that side; 0.75 = severe contraversive tilt WITHOUT falling; 0.25 = mild contraversive tilt without falling; 0 = inconspicuous. NOTE THERE IS NO 0.5 IN SECTION A. SECTION B, use of the nonparetic extremities by abduction and extension: 1 = performed spontaneously, already when at rest; 0.5 = performed only on changing position; 0 = inconspicuous. SECTION C, resistance to passive correction of tilted posture: 1 = resistance occurs; 0 = it does not. THE POINT LADDERS DIFFER BETWEEN SECTIONS AND ARE NOT EQUALLY SPACED, so do not assume a shared ladder. THE TOTAL SCORE IS NOT THE CLASSIFIER, AND THIS IS THE CENTRAL FACT ABOUT THIS INSTRUMENT: pusher behavior is diagnosed only when ALL THREE sections independently clear the threshold. A patient scoring 4 of 6 with one section at zero is NOT a pusher, while a patient scoring 1.5 spread across all three IS. Thresholding the total is the most natural thing to do with a scored instrument and it is WRONG here, so this tool returns the section subtotals as first-class values and evaluates every criterion against them. THREE NAMED CRITERIA COEXIST AND ALL THREE ARE RETURNED, because they were formalized together and answer different questions: Crit_1 = total above 0; Crit_2 = every section above 0, which is the CURRENT RECOMMENDATION and had the highest agreement with clinical diagnosis; Crit_3 = every section 1 OR MORE, which is Karnath's ORIGINAL and the ONLY criterion with no false positives. The revision exists because the original missed cases: sensitivity rose from 58.8 percent to 94.1 percent with specificity unchanged at 100 percent. The result flags when the criteria disagree on a given patient. WARNING ABOUT SECONDARY SOURCES: a widely used rehabilitation-measures reference states Karnath's criterion as subscores ABOVE 1, but the primary sources say 1 OR MORE, and the stricter misreading would reclassify every patient scoring exactly 1 in a section. Neither primary source specifies how to score a patient who CANNOT STAND, so both positions are required rather than a rule being invented. This identifies a BEHAVIOR, not a lesion and not a diagnosis. It does not diagnose stroke, localize it, or distinguish pusher behavior from the other causes of postural asymmetry after stroke - hemianopia, spatial neglect, ataxia, vestibular dysfunction and simple weakness all tilt a patient, and several commonly coexist with pushing. It does not measure neglect, a separate and frequently co-occurring problem with its own instruments. It does not predict recovery for an individual and does not select or dose a rehabilitation intervention.`,
    compute: S.scpPushing,
    fields: S.SCP_SECTIONS.flatMap((section) => S.SCP_POSITIONS.map((position) => ({
      dom: `scp-${section.key}-${position}`, arg: `${section.key}${position}`, kind: 'enum',
      values: section.options.map((o) => String(o.value)), required: true,
      label: `Section ${section.key} (${section.text}), ${position}. This section's OWN ladder [${section.options.map((o) => `${o.value} = ${o.text}`).join('; ')}]`,
    }))),
  },
];
