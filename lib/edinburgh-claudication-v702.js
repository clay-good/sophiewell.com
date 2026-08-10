// spec-v702: Edinburgh Claudication Questionnaire.
//
// A validated symptom questionnaire for intermittent claudication. Source:
//   Leng GC, Fowkes FGR. The Edinburgh Claudication Questionnaire: an improved version of the
//   WHO/Rose Questionnaire for use in epidemiological surveys. J Clin Epidemiol.
//   1992;45(10):1101-1109. (PMID 1474400.)
//
// Decision logic (all character criteria must hold for a claudication pattern):
//   Q1 Pain or discomfort in the leg(s) on walking .............. must be YES
//   Q2 Does the pain begin while standing still or sitting ...... must be NO
//   Q3 Pain when walking uphill or hurrying ..................... must be YES
//   Q5 If you stand still, is the pain relieved in <= 10 min .... must be YES
//   Site: the calf must be involved for DEFINITE claudication.
//
// Classification:
//   Definite claudication  = all four character criteria met AND calf pain present.
//   Atypical claudication  = all four met, but pain in the thigh or buttock only (no calf).
//   Not claudication       = any character criterion fails, or pain only in a non-vascular
//                            distribution (e.g. shin, foot, hamstring, or joints).
//   Grade (of a claudication pattern): Grade I if pain does NOT occur at an ordinary walking
//     pace on the level (Q4 = No); Grade II (more severe) if it does (Q4 = Yes).
//
// Sensitivity ~91%, specificity ~99% vs physician diagnosis. Returns a classification code;
// pure: no DOM, no clock, no network.

export const EDINBURGH_CLAUDICATION_NOTE = 'Edinburgh Claudication Questionnaire (Leng GC, Fowkes FGR, J Clin Epidemiol 1992;45(10):1101-1109), a validated symptom questionnaire for intermittent claudication. For a claudication pattern, all four character criteria must hold: pain or discomfort in the leg(s) on walking (yes), pain that does not begin while standing still or sitting (no), pain when walking uphill or hurrying (yes), and pain relieved within about 10 minutes of standing still (yes). The result is definite claudication when those are met and the calf is involved, atypical claudication when they are met but the pain is in the thigh or buttock only, and not claudication when any character criterion fails or the pain is only in a non-vascular distribution such as the shin, foot, hamstring, or joints. A claudication pattern is graded I if the pain does not occur at an ordinary walking pace on the level, or grade II (more severe) if it does. It is about 91 percent sensitive and 99 percent specific against a physician diagnosis, but it does not measure disease severity or replace the ankle-brachial index and vascular assessment; it supports rather than replaces clinical judgment.';

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function edinburghClaudication(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const painOnWalking = truthy(o.painOnWalking);
  const painAtRest = truthy(o.painAtRest);
  const painUphillHurry = truthy(o.painUphillHurry);
  const reliefWithin10 = truthy(o.reliefWithin10);
  const painOrdinaryPace = truthy(o.painOrdinaryPace);

  if (!(o.painSite === 'calf' || o.painSite === 'thigh-buttock' || o.painSite === 'other')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'painSite', message: 'Select the main pain site (calf, thigh/buttock, or other).', note: EDINBURGH_CLAUDICATION_NOTE };
  }

  const criteriaMet = painOnWalking && !painAtRest && painUphillHurry && reliefWithin10;

  let classification, code, grade = null;
  if (!criteriaMet) {
    classification = 'not claudication';
    code = 'not-claudication';
  } else if (o.painSite === 'calf') {
    classification = 'definite claudication';
    code = 'definite';
  } else if (o.painSite === 'thigh-buttock') {
    classification = 'atypical claudication';
    code = 'atypical';
  } else {
    // criteria met but pain only in a non-vascular distribution
    classification = 'not claudication';
    code = 'not-claudication';
  }

  if (code === 'definite' || code === 'atypical') {
    grade = painOrdinaryPace ? 'II' : 'I';
  }

  const positive = code === 'definite' || code === 'atypical';
  return {
    valid: true,
    classification,
    code,
    grade,
    abnormal: positive,
    bandLabel: positive ? `${classification} (grade ${grade})` : classification,
    band: `Edinburgh: ${classification}${grade ? `, grade ${grade}` : ''}.`,
    detail: positive
      ? `Character criteria met; ${o.painSite === 'calf' ? 'calf involvement gives a definite pattern' : 'thigh/buttock-only pain gives an atypical pattern'}. Grade ${grade} = pain ${grade === 'II' ? 'also occurs' : 'does not occur'} at an ordinary walking pace. Confirm with an ankle-brachial index.`
      : (criteriaMet ? 'Character criteria met but the pain is in a non-vascular distribution.' : 'One or more character criteria are not met, so this is not a claudication pattern.'),
    note: EDINBURGH_CLAUDICATION_NOTE,
  };
}
