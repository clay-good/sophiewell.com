// spec-v562: the Scale for Contraversive Pushing (SCP), for pusher behavior after stroke. "contraversive"
// and "pusher" were both zero-hit across corpus.json, app.js and lib/meta.js, and
// `grep -c "id: 'scp-pushing'" app.js` returned 0.
//
// THREE SECTIONS, EACH SCORED TWICE -- SITTING AND STANDING -- AND THE TWO SUMMED. Each section therefore
// maxes at 2 and the total at 6. Many secondary descriptions call this "three items, 0 to 1 each" and get
// the maximum wrong by a factor of three.
//
// **THE TOTAL SCORE IS NOT THE CLASSIFIER, AND THIS IS THE WHOLE POINT OF THE INSTRUMENT.** Pusher behavior
// is diagnosed only when ALL THREE sections independently clear the threshold. A patient scoring 4 out of 6
// -- section A at 2, section B at 2, section C at 0 -- is NOT a pusher, while a patient scoring 1.5 spread
// across all three sections is. Any implementation that thresholds the total is wrong, and thresholding a
// total is the single most natural thing to do with a scored instrument. This lib returns the section
// subtotals as first-class values and evaluates each published criterion against them, never against the
// total alone.
//
// **THE POINT VALUES ARE NON-UNIFORM AND NOT EQUALLY SPACED, AND THE GAPS ARE REAL.** Section A uses
// 0, 0.25, 0.75 and 1 -- there is NO 0.5 -- while section B uses 0, 0.5 and 1, and section C is binary. A
// reader who assumes a common ladder will offer 0.5 in section A, which the instrument does not contain,
// and will misread the distance between a mild and a severe tilt.
//
// **THREE NAMED CRITERIA COEXIST IN THE LITERATURE AND THIS TILE REPORTS ALL THREE.** They are not a source
// disagreement to be refused: they were formalized and named together in one paper, and they answer
// different questions.
//   Crit_1  total above 0
//   Crit_2  every section above 0            -- the current recommendation, highest agreement with
//                                               clinical diagnosis
//   Crit_3  every section 1 or more          -- Karnath's original, the only one with no false positives
// Reporting only one would hide that a patient can be a pusher under the recommended criterion and not
// under the original, which is exactly the disagreement a clinician needs to see. The revision exists
// because the original missed cases: sensitivity rose from 58.8 percent to 94.1 percent with no loss of
// specificity, which stayed at 100 percent.
//
// A WARNING ABOUT SECONDARY SOURCES, CARRIED DELIBERATELY. A widely used rehabilitation-measures reference
// states Karnath's criterion as subscores ABOVE 1. The primary sources say 1 OR MORE. Above 1 is a
// different and stricter rule that would reclassify patients scoring exactly 1 in a section, and this lib
// implements the primary sources (spec-v97).
//
// NOT SPECIFIED BY EITHER PRIMARY SOURCE: how to score a patient who cannot stand. Assessment is described
// as being done in both positions "when possible", and neither source says what to do with a truncated
// denominator. This lib requires both positions rather than inventing a rule, and says so.
//
// HIGH-STAKES: this identifies a BEHAVIOR, not a lesion and not a diagnosis. It does not diagnose stroke,
// localize it, or distinguish pusher behavior from the other causes of postural asymmetry after a stroke --
// hemianopia, spatial neglect, ataxia, vestibular dysfunction and simple weakness all tilt a patient, and
// several commonly coexist with pushing. It does not measure neglect, which is a separate and frequently
// co-occurring problem with its own instruments. It does not predict recovery for an individual and does
// not select or dose a rehabilitation intervention (spec-v11 section 5.3). The rehabilitation decision
// stays with the clinician and the therapist.
//
// SCALE, POINT VALUES AND ALL THREE CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the
// reliability and validity study's own table and confirmed against an independent comparison study that
// restates the criteria and the direction of the revision:
//   - Baccini M, Paci M, Rinaldi LA. The Scale for Contraversive Pushing: a reliability and validity study.
//     Neurorehabil Neural Repair. 2006;20(4):468-472. Table 1, credited to Karnath and colleagues.
//   - Baccini M, Paci M, Nannetti L, Biricolti C, Rinaldi LA. Scale for contraversive pushing: cutoff
//     scores for diagnosing "pusher behavior" and construct validity. Phys Ther. 2008;88(8):947-955.
//   - Bergmann J, Krewer C, Riess K, Muller F, Koenig E, Jahn K. Inconsistent classification of pusher
//     behaviour in stroke patients. Clin Rehabil. 2014;28(7):696-703.

export const SCP_POSITIONS = ['sitting', 'standing'];

// The ladders are deliberately different from one another. Section A has no 0.5.
export const SCP_SECTIONS = [
  {
    key: 'A',
    text: 'Spontaneous body posture',
    options: [
      { value: 1, text: 'Severe contraversive tilt with falling to that side' },
      { value: 0.75, text: 'Severe contraversive tilt without falling' },
      { value: 0.25, text: 'Mild contraversive tilt without falling' },
      { value: 0, text: 'Inconspicuous' },
    ],
  },
  {
    key: 'B',
    text: 'Use of the nonparetic extremities (abduction and extension)',
    options: [
      { value: 1, text: 'Performed spontaneously, already when at rest' },
      { value: 0.5, text: 'Performed only on changing the position, for example on transferring from bed to wheelchair' },
      { value: 0, text: 'Inconspicuous' },
    ],
  },
  {
    key: 'C',
    text: 'Resistance to passive correction of tilted posture',
    detail: 'Touch the patient at the sternum and the back. Instruction: "I will move your body sidewards. Please permit this movement."',
    options: [
      { value: 1, text: 'Resistance occurs' },
      { value: 0, text: 'Resistance does not occur' },
    ],
  },
];

export const SECTION_MAX = 2; // scored sitting and standing, summed
export const SCP_MAX = 6;

export const SCP_CRITERIA = [
  { key: 'crit1', label: 'Crit_1', text: 'Total score above 0.' },
  { key: 'crit2', label: 'Crit_2', text: 'Every section above 0. The current recommendation, with the highest agreement with clinical diagnosis.' },
  { key: 'crit3', label: 'Crit_3', text: 'Every section 1 or more. Karnath’s original criterion, and the only one with no false positives.' },
];

const NOT_THE_TOTAL = 'The TOTAL IS NOT THE CLASSIFIER. Pusher behavior requires all three sections to clear the threshold independently, so a patient scoring 4 of 6 concentrated in two sections is not a pusher, while a patient scoring 1.5 spread across all three is.';

const REVISION_TEXT = 'The criteria differ because the original missed cases: moving from Karnath’s per-section 1 or more to Baccini’s per-section above 0 raised sensitivity from 58.8 percent to 94.1 percent with no loss of specificity, which stayed at 100 percent.';

const SECONDARY_WARNING = 'A widely used rehabilitation-measures reference states Karnath’s criterion as subscores ABOVE 1; the primary sources say 1 OR MORE, which is what is applied here.';

const NOTE = 'The Scale for Contraversive Pushing (Karnath, as tabulated by Baccini and colleagues 2006) assesses pusher behavior after stroke in three sections: spontaneous body posture, use of the nonparetic extremities, and resistance to passive correction of tilted posture. Each section is scored twice, sitting and standing, and the two are summed, so each section maxes at 2 and the total at 6; many secondary descriptions call it three items of 0 to 1 and get the maximum wrong. The point values are non-uniform and not equally spaced: section A uses 0, 0.25, 0.75 and 1 with no 0.5 at all, section B uses 0, 0.5 and 1, and section C is binary. The total score is not the classifier, which is the central fact about this instrument: pusher behavior is diagnosed only when all three sections independently clear the threshold, so a patient scoring 4 of 6 with one section at zero is not a pusher while a patient scoring 1.5 spread across all three is, and any implementation that thresholds the total is wrong. Three named criteria coexist and all three are reported here, because they answer different questions and were formalized together: Crit_1 is a total above 0, Crit_2 is every section above 0 and is the current recommendation with the highest agreement with clinical diagnosis, and Crit_3 is every section at 1 or more, which is Karnath’s original and the only criterion with no false positives. The revision exists because the original missed cases, sensitivity rising from 58.8 percent to 94.1 percent with specificity unchanged at 100 percent. A widely used rehabilitation-measures reference misstates Karnath’s criterion as subscores above 1 rather than 1 or more, and the primary sources are followed here. Neither primary source specifies how to score a patient who cannot stand, so both positions are required rather than a rule being invented. This identifies a behavior, not a lesion and not a diagnosis. It does not diagnose stroke, localize it, or distinguish pusher behavior from the other causes of postural asymmetry after stroke, since hemianopia, spatial neglect, ataxia, vestibular dysfunction and simple weakness all tilt a patient and several commonly coexist with pushing. It does not measure neglect, which is a separate and frequently co-occurring problem with its own instruments. It does not predict recovery for an individual and does not select or dose a rehabilitation intervention.';

function readValue(section, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  const allowed = section.options.some((o) => o.value === n);
  return allowed ? n : NaN;
}

// input: for each section key K in SCP_SECTIONS and each position P, `${K}${P}` -- for example
// `Asitting`, `Astanding`, `Bsitting`, and so on. All six required.
export function scpPushing(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const sections = [];
  for (const section of SCP_SECTIONS) {
    const scores = {};
    for (const position of SCP_POSITIONS) {
      const key = `${section.key}${position}`;
      const value = readValue(section, o[key]);
      if (value === null) {
        return { valid: false, message: `Score every section both sitting and standing: the two are summed, so each section runs 0 to ${SECTION_MAX}. Neither primary source says how to score a patient who cannot stand, so no rule is invented here. Still needed: ${key}.` };
      }
      if (Number.isNaN(value)) {
        return { valid: false, message: `Section ${section.key} accepts only ${section.options.map((x) => x.value).join(', ')}. The ladders differ between sections, and section A has no 0.5. Unrecognized: ${key}.` };
      }
      scores[position] = value;
    }
    const subtotal = SCP_POSITIONS.reduce((a, p) => a + scores[p], 0);
    sections.push({ key: section.key, text: section.text, scores, subtotal });
  }

  const total = sections.reduce((a, s) => a + s.subtotal, 0);
  const rounded = Math.round(total * 100) / 100;

  const crit1 = rounded > 0;
  const crit2 = sections.every((s) => s.subtotal > 0);
  const crit3 = sections.every((s) => s.subtotal >= 1);
  const criteriaDisagree = !(crit1 === crit2 && crit2 === crit3);

  return {
    valid: true,
    total: rounded,
    max: SCP_MAX,
    sections,
    sectionSubtotals: Object.fromEntries(sections.map((s) => [s.key, s.subtotal])),
    crit1,
    crit2,
    crit3,
    criteriaDisagree,
    bandLabel: `SCP ${rounded} of ${SCP_MAX}; Crit_2 ${crit2 ? 'met' : 'not met'}`,
    bandText: `SCP total ${rounded} of ${SCP_MAX}, from section subtotals A ${sections[0].subtotal}, B ${sections[1].subtotal}, C ${sections[2].subtotal}. ${NOT_THE_TOTAL} Crit_1 (total above 0): ${crit1 ? 'met' : 'not met'}. Crit_2 (every section above 0, the current recommendation): ${crit2 ? 'met' : 'not met'}. Crit_3 (every section 1 or more, Karnath’s original, no false positives): ${crit3 ? 'met' : 'not met'}.${criteriaDisagree ? ' The criteria DISAGREE on this patient, which is why all three are reported.' : ''} ${REVISION_TEXT} ${SECONDARY_WARNING} This identifies a behavior, not a lesion, and does not distinguish pushing from the other causes of postural asymmetry after stroke.`,
    note: NOTE,
  };
}
