// spec-v839: the 2023 stage-based classification of atrial fibrillation.
//
// Source:
//   Joglar JA, Chung MK, Armbruster AL, et al. 2023 ACC/AHA/ACCP/HRS Guideline for the
//   Diagnosis and Management of Patients With Atrial Fibrillation. Circulation.
//   2024;149(1):e1-e156.
//
// THE STAGES:
//   1   at risk for AF - modifiable and non-modifiable risk factors, no AF
//   2   pre-AF - structural or electrical findings predisposing to AF, still no AF
//   3A  paroxysmal - intermittent, terminating within 7 days
//   3B  persistent - continuous for more than 7 days, requiring intervention to terminate
//   3C  long-standing persistent - continuous for more than 12 months
//   3D  successful AF ablation - free from AF after ablation or surgical intervention
//   4   permanent - no further attempts at rhythm control
//
// PERMANENT AF IS A DECISION, NOT A DURATION. This is the error the staging makes hardest to
// commit and the one most often committed anyway. Stage 4 is defined by a joint decision
// between clinician and patient to stop pursuing rhythm control. Atrial fibrillation that has
// been continuous for years is long-standing persistent (3C) as long as rhythm control is
// still being pursued; it becomes permanent the moment that pursuit is abandoned, at any
// duration. A tool that staged on how long the AF had lasted would call 3C permanent and
// close off rhythm-control options the guideline leaves open.
//
// AND THE FRAMEWORK STARTS BEFORE THE ARRHYTHMIA. Stages 1 and 2 describe patients with NO
// atrial fibrillation at all - at risk, and pre-AF. That is the point of restaging the
// disease as a continuum rather than a set of durations: it makes prevention part of the
// classification. A tool that only classified documented AF has no way to express half of it.
//
// STAGE 3D IS ITS OWN STAGE. A patient free from AF after a successful ablation is not
// unstaged and has not returned to stage 2.
//
// Pure: no DOM, no clock, no network.

export const AF_STAGES_NOTE = 'The 2023 atrial fibrillation guideline (Joglar JA, Chung MK, Armbruster AL, et al, Circulation 2024;149(1):e1-e156) replaced a classification built on duration with one built on stages along a disease continuum. Stage one is being at risk, with modifiable and non-modifiable risk factors and no arrhythmia. Stage two is pre-atrial fibrillation, meaning structural or electrical findings that predispose to it, again with no arrhythmia. Stage three is atrial fibrillation itself: 3A paroxysmal and intermittent, terminating within seven days; 3B persistent, continuous beyond seven days and needing intervention to terminate; 3C long-standing persistent, continuous beyond twelve months; and 3D successful ablation, meaning free from the arrhythmia after an ablation or surgical procedure. Stage four is permanent. The point most often got wrong is that permanent is a decision rather than a duration: it means a joint decision between clinician and patient to stop pursuing rhythm control, so atrial fibrillation continuous for years remains long-standing persistent while rhythm control is still being pursued, and becomes permanent at any duration once it is not. A tool that staged on how long the arrhythmia had lasted would call the third of these permanent and close off options the guideline leaves open. The framework also begins before the arrhythmia exists, which is why prevention is part of the classification rather than separate from it. It applies a published classification to a history already taken and it does not choose anticoagulation or a rhythm-control strategy.';

export const PAROXYSMAL_MAX_DAYS = 7;
export const LONGSTANDING_MIN_MONTHS = 12;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function afStages2023(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const hasAf = truthy(o.documentedAf);
  const rhythmControlAbandoned = truthy(o.rhythmControlAbandoned);
  const postAblationFree = truthy(o.freeAfterAblation);
  const pattern = String(o.pattern == null ? '' : o.pattern).trim().toLowerCase();
  const PATTERNS = ['paroxysmal', 'persistent', 'long-standing-persistent', ''];
  if (!PATTERNS.includes(pattern)) {
    return { valid: false, message: 'Pattern must be paroxysmal, persistent or long-standing-persistent.' };
  }

  const riskFactors = truthy(o.riskFactors);
  const predisposingFindings = truthy(o.predisposingFindings);

  let stage = null;
  let label = null;
  if (hasAf || postAblationFree || rhythmControlAbandoned) {
    if (rhythmControlAbandoned) {
      stage = '4';
      label = 'permanent AF, meaning no further attempts at rhythm control';
    } else if (postAblationFree) {
      stage = '3D';
      label = 'successful AF ablation, free from AF after ablation or surgical intervention';
    } else if (pattern === 'long-standing-persistent') {
      stage = '3C';
      label = `long-standing persistent AF, continuous for more than ${LONGSTANDING_MIN_MONTHS} months`;
    } else if (pattern === 'persistent') {
      stage = '3B';
      label = `persistent AF, continuous for more than ${PAROXYSMAL_MAX_DAYS} days and requiring intervention to terminate`;
    } else if (pattern === 'paroxysmal') {
      stage = '3A';
      label = `paroxysmal AF, intermittent and terminating within ${PAROXYSMAL_MAX_DAYS} days`;
    } else {
      stage = '3';
      label = 'atrial fibrillation, with the pattern not yet specified';
    }
  } else if (predisposingFindings) {
    stage = '2';
    label = 'pre-AF, with structural or electrical findings that predispose to it';
  } else if (riskFactors) {
    stage = '1';
    label = 'at risk for AF, with risk factors present and no arrhythmia';
  }

  // The error the staging is meant to prevent.
  const permanentNote = rhythmControlAbandoned
    ? 'Permanent AF is a DECISION, not a duration. This is stage 4 because rhythm control is no longer being pursued, whatever the arrhythmia has lasted.'
    : (pattern === 'long-standing-persistent'
      ? `This is 3C and NOT permanent. Long-standing persistent means continuous for more than ${LONGSTANDING_MIN_MONTHS} months while rhythm control is still being pursued; permanent means that pursuit has been abandoned, at any duration. Staging on how long the AF has lasted would close off options the guideline leaves open.`
      : null);

  // The half of the framework that has no arrhythmia in it.
  const preAfNote = (stage === '1' || stage === '2')
    ? 'Stages 1 and 2 describe patients with NO atrial fibrillation. Restaging the disease as a continuum is what makes prevention part of the classification rather than separate from it.'
    : null;

  const ablationNote = stage === '3D'
    ? 'Successful ablation is its own stage. A patient free from AF afterwards is not unstaged and has not returned to stage 2.'
    : null;

  const continuumNote = stage
    ? 'The stages describe a continuum rather than a one-way ladder. Patients move between them in both directions, including out of stage 4 if rhythm control is taken up again.'
    : null;

  return {
    valid: true,
    stage,
    label,
    permanentNote,
    preAfNote,
    ablationNote,
    continuumNote,
    abnormal: !!stage && stage !== '1',
    bandLabel: stage ? `Stage ${stage}` : 'No stage assigned',
    band: stage
      ? `Atrial fibrillation stage ${stage} — ${label}.`
      : 'No stage assigned. Stage 1 needs at least risk factors for atrial fibrillation.',
    detail: `Stage 1 at risk; stage 2 pre-AF; 3A paroxysmal within ${PAROXYSMAL_MAX_DAYS} days; 3B persistent beyond ${PAROXYSMAL_MAX_DAYS} days; 3C long-standing persistent beyond ${LONGSTANDING_MIN_MONTHS} months; 3D successful ablation; stage 4 permanent, meaning rhythm control is no longer pursued.`,
    note: AF_STAGES_NOTE,
  };
}
