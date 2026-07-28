// spec-v551: iRECIST time-point response for trials of immunotherapeutics. "irecist" was zero-hit across
// corpus.json, app.js and lib/meta.js, while "recist" was TAKEN -- a companion gap, and the most useful kind:
// iRECIST exists precisely BECAUSE RECIST 1.1 gets a particular case wrong.
//
// THE CASE IT EXISTS TO CORRECT. Immunotherapy can produce pseudoprogression: immune-cell infiltration makes
// lesions transiently larger, or makes undetectable lesions detectable, and a deep and durable response
// follows. Under RECIST 1.1 that first scan is progressive disease, full stop, and any PD permanently
// precludes a later complete response, partial response or stable disease. iRECIST changes exactly that.
//
// **PROGRESSION IS NEVER ASSIGNED ON A SINGLE SCAN. iCPD CANNOT ARISE WITHOUT A PRIOR iUPD.** The first
// scan meeting RECIST 1.1 progression criteria is iUPD, unconfirmed. Confirmation requires a further
// imaging assessment at least 4 weeks and no more than 8 weeks later. This lib enforces the rule
// structurally rather than by warning: when there is no prior iUPD, iCPD is not a reachable output.
//
// **THE BAR RESETS, AND THIS IS THE STRUCTURAL DIFFERENCE FROM RECIST 1.1.** If the confirmatory scan shows
// shrinkage meeting iCR, iPR or iSD criteria against BASELINE, the criteria for iCPD are not considered to
// have been met. The status is reset, that response is assigned, and iUPD must occur AGAIN -- measured from
// nadir -- and then be confirmed, before iCPD can be reached. The source states the contrast outright:
// unlike RECIST 1.1, where any PD precludes later CR, PR or SD. **iUPD may therefore be assigned MULTIPLE
// TIMES** as long as iCPD is never confirmed.
//
// **NO CHANGE FROM iUPD IS STILL iUPD, NOT iCPD.** Confirmation requires FURTHER increase, not persistence.
// A reader who treats the confirmatory scan as a yes/no on "is the disease still progressed?" converts every
// stable-but-enlarged patient into confirmed progression, which is the failure mode iRECIST was written to
// prevent.
//
// **NEW LESIONS DO NOT AUTOMATICALLY MEAN PROGRESSION, AND ARE NEVER ADDED TO THE BASELINE TARGET SUM.**
// They are recorded separately: up to five, no more than two per organ, measured as New Lesion-Target (NLT),
// and everything else as New Lesion-Non-Target (NLNT). Folding them into the sum of measures of the original
// target lesions would inflate that sum and manufacture progression out of the very finding iRECIST treats
// as provisional. A new lesion produces iUPD; it takes a confirmatory scan to make it iCPD.
//
// THE CONFIRMATION THRESHOLDS ARE NOT UNIFORM ACROSS CATEGORIES, so this lib asks about them separately:
//   target lesions       further increase in the sum of measures of at least 5 mm
//   non-target lesions   further increase, which NEED NOT meet RECIST 1.1 criteria for unequivocal PD
//   new lesions          sum of measures of NLT up by at least 5 mm, OR ANY increase in NLNT, OR additional
//                        new lesions
// Collapsing these into one "did it get worse?" question would apply the 5 mm bar to categories that do not
// carry it, and would miss confirmations the source counts.
//
// CROSS-CATEGORY CONFIRMATION. If iUPD was met in one category, RECIST 1.1 defined progression in a
// DIFFERENT category on the confirmatory scan also confirms iCPD.
//
// HIGH-STAKES: iRECIST is a DATA-COLLECTION AND ANALYSIS standard for clinical trials. The source says so
// directly: it describes what data are to be collected, submitted and analysed, and all decisions about
// continuing or stopping therapy rest with the patient and their health care provider. This tile assigns a
// time-point response category. It does NOT decide whether to continue treatment past iUPD, and the source's
// own condition for doing so -- that the patient be CLINICALLY STABLE -- is a clinical judgment this tile
// cannot make and does not attempt (spec-v11 section 5.3). It does not measure lesions, does not determine
// whether a new lesion is malignant rather than artefactual, and does not compute best overall response
// across time points.
//
// CATEGORIES, THRESHOLDS AND THE RESET RULE RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the
// guideline manuscript itself and corroborated by an independent reproduction of the same criteria:
//   - Seymour L, Bogaerts J, Perrone A, et al. iRECIST: guidelines for response criteria for use in trials
//     testing immunotherapeutics. Lancet Oncol. 2017;18(3):e143-e152.

export const TARGET_RESPONSES = [
  { value: 'iCR', label: 'iCR', text: 'Complete response in target lesions by RECIST 1.1 criteria.' },
  { value: 'iPR', label: 'iPR', text: 'Partial response in target lesions by RECIST 1.1 criteria.' },
  { value: 'iSD', label: 'iSD', text: 'Stable disease in target lesions by RECIST 1.1 criteria.' },
  { value: 'iUPD', label: 'iUPD', text: 'Target lesions meet RECIST 1.1 criteria for progression. Under iRECIST this is unconfirmed.' },
];

export const NON_TARGET_RESPONSES = [
  { value: 'iCR', label: 'iCR', text: 'Complete response in non-target lesions.' },
  { value: 'non-iCR-non-iUPD', label: 'Non-iCR/Non-iUPD', text: 'Neither complete response nor progression in non-target lesions.' },
  { value: 'iUPD', label: 'iUPD', text: 'Non-target lesions meet RECIST 1.1 criteria for unequivocal progression. Under iRECIST this is unconfirmed.' },
];

export const CONFIRMATION_WINDOW = 'At least 4 weeks and no more than 8 weeks after iUPD.';

// The per-category confirmation thresholds. Deliberately not uniform.
export const CONFIRMATION_THRESHOLDS = {
  target: 'Further increase in the sum of measures of target disease of at least 5 mm, compared with the prior iUPD assessment.',
  nonTarget: 'Further increase in non-target disease. It need NOT meet RECIST 1.1 criteria for unequivocal progression.',
  newLesions: 'Sum of measures of new lesion-target up by at least 5 mm, OR any increase in new lesion-non-target, OR additional new lesions.',
};

const CONFIRMATION_REASONS = {
  targetIncrease: CONFIRMATION_THRESHOLDS.target,
  nonTargetIncrease: CONFIRMATION_THRESHOLDS.nonTarget,
  newLesionIncrease: CONFIRMATION_THRESHOLDS.newLesions,
  newCategoryProgression: 'RECIST 1.1 progression in a lesion category that had not previously met progression criteria.',
};

const RESET_TEXT = 'The bar is RESET. The criteria for iCPD are not considered to have been met, because shrinkage against baseline meets this response category. Unlike RECIST 1.1, where any progression precludes a later complete response, partial response or stable disease, iUPD must now occur again, measured from nadir, and then be confirmed at the following assessment before iCPD can be assigned.';

const REMAINS_TEXT = 'Still UNCONFIRMED. Confirmation requires FURTHER increase, not persistence: no change from the prior iUPD remains iUPD. iUPD may be assigned repeatedly for as long as iCPD is never confirmed.';

const FIRST_IUPD_TEXT = 'UNCONFIRMED progression. Under RECIST 1.1 this scan would be progressive disease, and that verdict would be permanent. Under iRECIST it is provisional and requires a confirmatory assessment at least 4 weeks and no more than 8 weeks later. iCPD cannot be assigned from a single scan.';

const NOTE = 'iRECIST (Seymour and colleagues, Lancet Oncology 2017) adapts RECIST 1.1 for trials of immunotherapeutics, because immune-cell infiltration can transiently enlarge lesions or make undetectable lesions detectable before a deep and durable response follows. Progression is never assigned on a single scan: the first assessment meeting RECIST 1.1 progression criteria is iUPD, unconfirmed, and confirmation as iCPD requires a further imaging assessment at least 4 weeks and no more than 8 weeks later. The structural difference from RECIST 1.1 is that the bar resets. If the confirmatory scan shows shrinkage against baseline meeting iCR, iPR or iSD criteria, the criteria for iCPD are not considered to have been met, that response is assigned, and iUPD must occur again from nadir and then be confirmed before iCPD can be reached, whereas under RECIST 1.1 any progression permanently precludes a later complete response, partial response or stable disease. iUPD may therefore be assigned multiple times so long as iCPD is never confirmed, and no change from a prior iUPD remains iUPD rather than becoming iCPD, since confirmation requires further increase rather than persistence. New lesions do not automatically mean progression and are never added to the sum of measures of the original target lesions: up to five, no more than two per organ, are recorded separately as new lesion-target, and everything else as new lesion-non-target. The confirmation thresholds differ by category: at least 5 mm of further increase in the sum of measures for target disease, any further increase for non-target disease which need not meet criteria for unequivocal progression, and for new lesions a sum-of-measures increase of at least 5 mm in new lesion-target, any increase in new lesion-non-target, or additional new lesions. Progression by RECIST 1.1 in a category that had not previously progressed also confirms iCPD. This is a data-collection and analysis standard for clinical trials. The source states that it describes what data are to be collected, submitted and analysed, and that all decisions about continuing or stopping therapy rest with the patient and their health care provider. It does not decide whether to continue treatment past iUPD, and the source’s own condition for doing so, that the patient be clinically stable, is a clinical judgment this does not make. It does not measure lesions, does not determine whether a new lesion is malignant rather than artefactual, and does not compute best overall response across time points.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// The RECIST 1.1 category combination, before any iRECIST confirmation logic.
function baseResponse(target, nonTarget, newLesions) {
  if (newLesions) return 'iUPD';
  if (target === 'iUPD' || nonTarget === 'iUPD') return 'iUPD';
  if (target === 'iCR') return nonTarget === 'iCR' ? 'iCR' : 'iPR';
  if (target === 'iPR') return 'iPR';
  return 'iSD';
}

// input:
//   target      -- iCR, iPR, iSD or iUPD. Required.
//   nonTarget   -- iCR, non-iCR-non-iUPD or iUPD. Required.
//   newLesions  -- yes/no, whether new lesions are present. Required.
//   priorIupd   -- yes/no, whether iUPD was recorded at the immediately preceding assessment. Required:
//                  without it, iCPD is not reachable.
//   The four confirmation questions below are read ONLY when priorIupd is yes AND the current combination
//   is still iUPD. Each carries its own threshold, which the source does not make uniform.
//   targetIncrease     -- yes/no, sum of measures up at least 5 mm from the prior iUPD.
//   nonTargetIncrease  -- yes/no, further increase in non-target disease (need not be unequivocal).
//   newLesionIncrease  -- yes/no, NLT sum up at least 5 mm, any NLNT increase, or additional new lesions.
//   newCategoryProgression -- yes/no, RECIST 1.1 progression in a category that had not previously
//                             progressed.
export function irecist(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const target = TARGET_RESPONSES.find((r) => r.value === String(o.target || '').trim());
  if (!target) {
    return { valid: false, message: 'Choose the target-lesion response: iCR, iPR, iSD or iUPD.' };
  }
  const nonTarget = NON_TARGET_RESPONSES.find((r) => r.value === String(o.nonTarget || '').trim());
  if (!nonTarget) {
    return { valid: false, message: 'Choose the non-target-lesion response: iCR, Non-iCR/Non-iUPD or iUPD.' };
  }

  const newLesions = readBool(o.newLesions);
  if (newLesions === null) {
    return { valid: false, message: 'Say whether new lesions are present. A new lesion produces iUPD, but it does not by itself confirm progression.' };
  }
  if (Number.isNaN(newLesions)) {
    return { valid: false, message: 'The new-lesion answer must be yes or no.' };
  }

  const priorIupd = readBool(o.priorIupd);
  if (priorIupd === null) {
    return { valid: false, message: 'Say whether iUPD was recorded at the immediately preceding assessment. Without a prior iUPD, iCPD cannot be assigned at all: progression is never confirmed on a single scan.' };
  }
  if (Number.isNaN(priorIupd)) {
    return { valid: false, message: 'The prior-iUPD answer must be yes or no.' };
  }

  const base = baseResponse(target.value, nonTarget.value, newLesions);

  const common = {
    valid: true,
    target: target.value,
    nonTarget: nonTarget.value,
    newLesions,
    priorIupd,
    baseResponse: base,
    confirmationWindow: CONFIRMATION_WINDOW,
    note: NOTE,
  };

  // No prior iUPD: iCPD is structurally unreachable.
  if (!priorIupd) {
    if (base === 'iUPD') {
      return {
        ...common,
        response: 'iUPD',
        confirmable: false,
        resetApplied: false,
        bandLabel: 'iUPD',
        band: `iUPD. ${FIRST_IUPD_TEXT} Repeat imaging ${CONFIRMATION_WINDOW.toLowerCase()} Continuing treatment in the interval is permitted only for a patient who is clinically stable, which is a judgment this does not make.`,
      };
    }
    return {
      ...common,
      response: base,
      confirmable: false,
      resetApplied: false,
      bandLabel: base,
      band: `${base}. Assigned by the RECIST 1.1 category combination, with no prior iUPD to confirm or reset. iCPD is not reachable from a single assessment.`,
    };
  }

  // Prior iUPD, and the disease has now shrunk into a response category: the bar resets.
  if (base !== 'iUPD') {
    return {
      ...common,
      response: base,
      confirmable: false,
      resetApplied: true,
      bandLabel: base,
      band: `${base}, after a prior iUPD. ${RESET_TEXT}`,
    };
  }

  // Prior iUPD and still progressed: confirmation depends on FURTHER increase, per category.
  const reads = {
    targetIncrease: readBool(o.targetIncrease),
    nonTargetIncrease: readBool(o.nonTargetIncrease),
    newLesionIncrease: readBool(o.newLesionIncrease),
    newCategoryProgression: readBool(o.newCategoryProgression),
  };
  const missing = Object.keys(reads).filter((k) => reads[k] === null);
  if (missing.length) {
    return { valid: false, message: `iUPD was recorded previously, so confirmation depends on FURTHER increase. Answer each, noting that the thresholds differ by category. Still needed: ${missing.join(', ')}.` };
  }
  const bad = Object.keys(reads).filter((k) => Number.isNaN(reads[k]));
  if (bad.length) {
    return { valid: false, message: `Each confirmation answer must be yes or no. Unrecognized: ${bad.join(', ')}.` };
  }

  const confirmedBy = Object.keys(reads).filter((k) => reads[k] === true);

  if (confirmedBy.length) {
    const reasons = confirmedBy.map((k) => CONFIRMATION_REASONS[k]);
    return {
      ...common,
      response: 'iCPD',
      confirmable: true,
      confirmedBy,
      resetApplied: false,
      bandLabel: 'iCPD',
      band: `iCPD, confirmed. Further increase since the prior iUPD meets the confirmation criteria: ${reasons.join(' ')} Confirmation is valid only on an assessment ${CONFIRMATION_WINDOW.toLowerCase()}`,
    };
  }

  return {
    ...common,
    response: 'iUPD',
    confirmable: true,
    confirmedBy: [],
    resetApplied: false,
    bandLabel: 'iUPD',
    band: `iUPD, again. ${REMAINS_TEXT}`,
  };
}
