// spec-v911: the NIH 2014 consensus global severity of chronic graft-versus-host disease.
//
// Source:
//   Jagasia MH, Greinix HT, Arora M, et al. National Institutes of Health Consensus Development
//   Project on Criteria for Clinical Trials in Chronic Graft-versus-Host Disease: I. The 2014
//   Diagnosis and Staging Working Group Report. Biol Blood Marrow Transplant. 2015;21(3):389-401.
//
//   Eight organs are each scored 0 to 3: skin, mouth, eyes, gastrointestinal tract, liver, lungs,
//   joints and fascia, and the genital tract. The global severity follows from the set:
//     SEVERE    any organ at 3, or a lung score of 2 or 3.
//     MODERATE  any organ at 2, or three or more organs at 1, or a lung score of 1.
//     MILD      one or two organs at 1, with the lung at 0.
//
// THE LUNG SCORES ON ITS OWN. A lung score of 1 makes the disease at least moderate and a lung
// score of 2 or 3 makes it severe, whatever every other organ shows. That single organ overrides
// the counting rule, and it is the part of the algorithm most often missed.
//
// NOT ASSESSED IS NOT ZERO. An organ that was never looked at is not an organ known to be
// uninvolved, and leaving one out can only pull the grade down. The result says how many were
// left out rather than treating a blank as a zero.
//
// THIS ASSUMES THE DIAGNOSIS IS ALREADY MADE. Chronic graft-versus-host disease needs at least one
// diagnostic manifestation, or a distinctive one with confirmatory testing. Severity scoring is
// not a diagnostic test and does not make that call.
//
// CHRONIC IS NOT ACUTE. Acute graft-versus-host disease is graded on a different system entirely,
// staging skin, liver and gut, and it lives in its own tiles.
//
// Pure: no DOM, no clock, no network.

export const CGVHD_NOTE = 'The NIH 2014 consensus scores eight organs from 0 to 3 in chronic graft-versus-host disease -- skin, mouth, eyes, gastrointestinal tract, liver, lungs, joints and fascia, and the genital tract -- and reads a global severity from the set. Severe is any organ at 3, or a lung score of 2 or 3. Moderate is any organ at 2, or three or more organs at 1, or a lung score of 1. Mild is one or two organs at 1 with the lung at 0. Four things are worth stating plainly. The lung scores on its own: a lung score of 1 makes the disease at least moderate and a score of 2 or 3 makes it severe, whatever every other organ shows, and that override is the part of the algorithm most often missed. An organ not assessed is not an organ known to be uninvolved, so a blank is never read as a zero and the result says how many were left out. The scoring assumes the diagnosis is already made, since chronic graft-versus-host disease needs at least one diagnostic manifestation or a distinctive one with confirmatory testing, and this is not that test. And chronic is not acute: acute disease is graded on a different system that stages skin, liver and gut. Global severity informs whether systemic therapy is considered. It is not itself a treatment decision.';

export const ORGAN_SCORE_OPTIONS = [
  { value: 'na', text: 'Not assessed' },
  { value: '0', text: '0 - not involved' },
  { value: '1', text: '1 - mild, no significant impairment' },
  { value: '2', text: '2 - moderate, significant impairment without major disability' },
  { value: '3', text: '3 - severe, major disability' },
];

export const ORGANS = [
  { key: 'skin', text: 'Skin' },
  { key: 'mouth', text: 'Mouth' },
  { key: 'eyes', text: 'Eyes' },
  { key: 'gi', text: 'Gastrointestinal tract' },
  { key: 'liver', text: 'Liver' },
  { key: 'lungs', text: 'Lungs' },
  { key: 'joints', text: 'Joints and fascia' },
  { key: 'genital', text: 'Genital tract' },
];

function score(v) {
  const s = String(v == null ? 'na' : v);
  if (s === '0' || s === '1' || s === '2' || s === '3') return Number(s);
  return null;
}

export function cgvhdSeverity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = ORGANS.map((organ) => ({ ...organ, score: score(o[organ.key]) }));
  const assessed = scored.filter((s) => s.score !== null);
  const notAssessed = scored.filter((s) => s.score === null);

  if (assessed.length === 0) {
    return { valid: false, message: 'Score at least one organ. Every organ is optional on its own, but a global severity cannot be read from a form where nothing was assessed.' };
  }

  const lung = scored.find((s) => s.key === 'lungs').score;
  const atOne = assessed.filter((s) => s.score === 1);
  const atTwo = assessed.filter((s) => s.score === 2);
  const atThree = assessed.filter((s) => s.score === 3);
  const involved = assessed.filter((s) => s.score > 0);

  const severity = atThree.length || lung >= 2
    ? 'severe'
    : atTwo.length || lung === 1 || atOne.length >= 3
      ? 'moderate'
      : atOne.length
        ? 'mild'
        : 'none';

  const bandLabel = {
    severe: 'Severe',
    moderate: 'Moderate',
    mild: 'Mild',
    none: 'No organ involvement recorded',
  }[severity];

  const names = (list) => list.map((s) => s.text.toLowerCase()).join(', ');

  const band = {
    severe: atThree.length
      ? `Severe: ${atThree.length === 1 ? 'one organ is' : `${atThree.length} organs are`} scored 3 (${names(atThree)}).`
      : `Severe: the lung is scored ${lung}, and a lung score of 2 or 3 is severe whatever the other organs show.`,
    moderate: lung === 1 && !atTwo.length && atOne.length < 3
      ? 'Moderate: the lung is scored 1, and that alone makes the disease at least moderate.'
      : atTwo.length
        ? `Moderate: ${atTwo.length === 1 ? 'one organ is' : `${atTwo.length} organs are`} scored 2 (${names(atTwo)}).`
        : `Moderate: ${atOne.length} organs are scored 1, and three or more at 1 is moderate.`,
    mild: `Mild: ${atOne.length === 1 ? 'one organ is' : 'two organs are'} scored 1 (${names(atOne)}), ${lung === 0 ? 'with the lung at 0' : 'and the lung was not assessed'}.`,
    none: 'No organ that was assessed is involved. A global severity is not assigned.',
  }[severity];

  const lungNote = 'The lung scores on its own. A lung score of 1 makes the disease at least moderate and a score of 2 or 3 makes it severe, whatever every other organ shows.';

  const notAssessedNote = notAssessed.length
    ? `${notAssessed.length} of the eight organs ${notAssessed.length === 1 ? 'was' : 'were'} not assessed: ${names(notAssessed)}. Not assessed is not the same as scored 0, and leaving an organ out can only pull this grade down.`
    : 'All eight organs were assessed.';

  const diagnosisNote = 'This assumes the diagnosis is already made. Chronic graft-versus-host disease needs at least one diagnostic manifestation, or a distinctive one with confirmatory testing, and severity scoring is not that test.';

  const acuteNote = 'Chronic is not acute. Acute graft-versus-host disease is graded on a different system entirely, staging skin, liver and gut.';

  const treatmentNote = 'Global severity informs whether systemic therapy is considered. It is not itself a treatment decision.';

  const scopeNote = 'This reads a published algorithm from organ scores already assigned. It does not diagnose, and it does not choose therapy.';

  return {
    valid: true,
    severity,
    organs: scored,
    lungScore: lung,
    involvedCount: involved.length,
    assessedCount: assessed.length,
    notAssessedCount: notAssessed.length,
    lungNote,
    notAssessedNote,
    diagnosisNote,
    acuteNote,
    treatmentNote,
    scopeNote,
    abnormal: severity === 'moderate' || severity === 'severe',
    bandLabel,
    band,
    detail: 'Severe is any organ at 3, or a lung score of 2 or 3. Moderate is any organ at 2, or three or more organs at 1, or a lung score of 1. Mild is one or two organs at 1 with the lung at 0.',
    note: CGVHD_NOTE,
  };
}
