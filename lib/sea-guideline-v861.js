// spec-v861: the spinal epidural abscess clinical decision guideline.
//
// Source:
//   Davis DP, Salazar A, Chan TC, Vilke GM. Prospective evaluation of a clinical decision
//   guideline to diagnose spinal epidural abscess in patients who present to the emergency
//   department with spine pain. J Neurosurg Spine. 2011;14(6):765-770.
//
//   Spine pain, then:
//     a neurologic deficit                      -> image now
//     any risk factor, no deficit               -> ESR; over 20 mm/hr -> image
//     no risk factor and no deficit             -> the guideline does not select for imaging
//
//   Risk factors: injection drug use, an indwelling vascular access device, a remote site of
//   infection, immunosuppression, and a spinal procedure within the past year.
//
// THE CLASSIC TRIAD IS THE TRAP, AND THAT IS WHY THIS TILE EXISTS. Fever, spine pain and a
// neurologic deficit together are present in a small minority of confirmed cases. Waiting for
// the triad is the delay, and the delay is what turns a treatable infection into a permanent
// deficit.
//
// FEVER IS ABSENT IN ABOUT HALF. It is not an entry criterion here, and its absence removes
// nothing.
//
// THE ESR IS THE TEST, NOT THE WHITE COUNT. The white cell count is normal in a large share of
// confirmed cases; the sedimentation rate is raised in the great majority. Reassurance drawn
// from a normal white count is the documented error.
//
// A DEFICIT IS NOT A SCREENING STEP. It is an indication to image immediately, and by the time
// one is established the outcome is already worse.
//
// Pure: no DOM, no clock, no network.

export const SEA_NOTE = 'The clinical decision guideline of Davis and colleagues (J Neurosurg Spine, 2011) selects which patients with spine pain need imaging for a spinal epidural abscess. A neurologic deficit is an indication to image immediately. Without a deficit, the guideline asks whether any risk factor is present — injection drug use, an indwelling vascular access device, a remote site of infection, immunosuppression, or a spinal procedure within the past year — and if one is, the next step is a sedimentation rate: over 20 mm per hour, image. With no risk factor and no deficit, the guideline does not select the patient for imaging on this pathway. Four things go wrong with it. The classic triad of fever, spine pain and a neurologic deficit is present in only a small minority of confirmed cases, so waiting for it is the delay, and the delay is what turns a treatable infection into a permanent deficit. Fever is absent in about half of confirmed cases and is not an entry criterion here, so its absence removes nothing. The sedimentation rate is the test rather than the white cell count, because the white count is normal in a large share of confirmed cases while the sedimentation rate is raised in the great majority, and reassurance drawn from a normal white count is the documented error. And a deficit is not a screening step but an indication to image now, because by the time one is established the outcome is already worse. It selects patients for imaging. It does not diagnose or exclude a spinal epidural abscess, and no pathway through it replaces the judgment of the clinician at the bedside.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export const RISK_FACTORS = [
  { key: 'injectionDrugUse', text: 'Injection drug use' },
  { key: 'vascularAccess', text: 'An indwelling vascular access device' },
  { key: 'remoteInfection', text: 'A site of infection elsewhere in the body' },
  { key: 'immunosuppression', text: 'Immunosuppression, including diabetes, HIV, cancer, dialysis, and alcohol use disorder' },
  { key: 'spinalProcedure', text: 'A spinal procedure or spinal surgery within the past year' },
];

const ESR_THRESHOLD = 20;

export function seaGuideline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const esr = num(o.esr);
  const wbc = num(o.wbc);
  if (esr !== null && (esr < 0 || esr > 200)) {
    return { valid: false, message: 'The sedimentation rate is outside a plausible range of 0 to 200 mm per hour.' };
  }
  if (wbc !== null && (wbc < 0 || wbc > 200)) {
    return { valid: false, message: 'The white cell count is outside a plausible range of 0 to 200 thousand per microliter.' };
  }

  const deficit = on(o.deficit);
  const fever = on(o.fever);
  const present = RISK_FACTORS.filter((r) => on(o[r.key]));

  let step;
  let action;
  if (deficit) {
    step = 'deficit';
    action = 'Image now. A neurologic deficit is an indication to image immediately, whatever the risk factors and whatever the sedimentation rate.';
  } else if (present.length === 0) {
    step = 'no-risk-factor';
    action = 'This pathway does not select the patient for imaging: there is no neurologic deficit and no risk factor was entered.';
  } else if (esr === null) {
    step = 'need-esr';
    action = `A risk factor is present and there is no deficit, so the next step is a sedimentation rate. Over ${ESR_THRESHOLD} mm per hour, image.`;
  } else if (esr > ESR_THRESHOLD) {
    step = 'image';
    action = `Image. A risk factor is present and the sedimentation rate is ${esr} mm per hour, above the threshold of ${ESR_THRESHOLD}.`;
  } else {
    step = 'below-threshold';
    action = `The sedimentation rate is ${esr} mm per hour, at or below the threshold of ${ESR_THRESHOLD}, so this pathway does not select the patient for imaging.`;
  }

  const imaging = step === 'deficit' || step === 'image';

  // The trap the tile exists to name.
  const triadNote = 'The classic triad of fever, spine pain and a neurologic deficit is present in only a small minority of confirmed cases. Waiting for it is the delay, and the delay is what turns a treatable infection into a permanent deficit.';

  const feverNote = !fever && present.length > 0
    ? 'No fever was entered. Fever is absent in about half of confirmed cases and is not an entry criterion on this pathway, so its absence removes nothing.'
    : null;

  const wbcNote = wbc !== null && wbc < 11
    ? `A white cell count of ${wbc} thousand per microliter is not reassuring here. It is normal in a large share of confirmed cases, and the sedimentation rate is the test this pathway uses.`
    : null;

  const deficitNote = deficit
    ? 'A deficit is not a screening step. By the time one is established the outcome is already worse, which is why the risk factors and the sedimentation rate come first.'
    : null;

  const riskNote = present.length > 0
    ? `Risk factor${present.length > 1 ? 's' : ''} entered: ${present.map((r) => r.text.toLowerCase()).join('; ')}.`
    : null;

  const noRiskNote = step === 'no-risk-factor'
    ? 'Not selecting a patient here is not the same as excluding the diagnosis. The pathway starts from the risk factors, so a patient whose risk factor was not asked about never enters it.'
    : null;

  const belowNote = step === 'below-threshold'
    ? 'A sedimentation rate at or below the threshold makes this pathway stop, not the concern. The guideline was built to decide who gets imaged, not to rule the diagnosis out.'
    : null;

  const scopeNote = 'This selects patients for imaging. It does not diagnose or exclude a spinal epidural abscess, and no pathway through it replaces the judgment of the clinician at the bedside.';

  return {
    valid: true,
    step,
    action,
    imaging,
    esr,
    wbc,
    riskFactorCount: present.length,
    riskFactors: present.map((r) => r.text),
    deficit,
    fever,
    triadNote,
    feverNote,
    wbcNote,
    deficitNote,
    riskNote,
    noRiskNote,
    belowNote,
    scopeNote,
    abnormal: imaging,
    bandLabel: imaging ? 'Image' : step === 'need-esr' ? 'Sedimentation rate next' : 'Not selected for imaging on this pathway',
    band: action,
    detail: `A neurologic deficit means imaging now. Without one, any of five risk factors — injection drug use, an indwelling vascular access device, a remote site of infection, immunosuppression, or a spinal procedure within the past year — leads to a sedimentation rate, and a rate over ${ESR_THRESHOLD} mm per hour leads to imaging.`,
    note: SEA_NOTE,
  };
}
