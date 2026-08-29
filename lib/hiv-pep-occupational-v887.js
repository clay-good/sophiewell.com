// spec-v887: the occupational HIV post-exposure prophylaxis decision.
//
// Source:
//   Kuhar DT, Henderson DK, Struble KA, et al. Updated US Public Health Service guidelines for
//   the management of occupational exposures to human immunodeficiency virus and recommendations
//   for postexposure prophylaxis. Infect Control Hosp Epidemiol. 2013;34(9):875-892.
//
//   An exposure that warrants evaluation is a percutaneous injury, contact of a mucous membrane
//   or non-intact skin with blood or another potentially infectious material, or a bite with
//   blood exposure. INTACT SKIN IS NOT AN EXPOSURE.
//
//   Source known HIV positive        prophylaxis is recommended.
//   Source of unknown HIV status     prophylaxis is not routinely recommended; it is decided
//                                    case by case, on the likelihood the source is infected.
//   Source known HIV negative        prophylaxis is not recommended.
//
// THE 2013 UPDATE REMOVED THE TWO-DRUG "BASIC" REGIMEN, AND THAT IS WHY THIS TILE EXISTS. The
// older tiering of exposures into basic and expanded regimens by severity is gone: every
// recommended course is now a three-drug regimen or more, and the exposure severity no longer
// selects between them.
//
// DO NOT WAIT FOR SOURCE TESTING TO START. Prophylaxis should begin as soon as possible, in
// hours rather than days, and it can be stopped if the source is later found to be negative.
// Waiting for a result is the delay that costs the most.
//
// INTACT SKIN IS NOT AN EXPOSURE, and a source of unknown status is not a source that is
// positive.
//
// This returns a decision framework. It names no drug, no dose and no regimen; those are for the
// occupational health service or the treating clinician.
//
// Pure: no DOM, no clock, no network.

export const PEP_NOTE = 'The US Public Health Service guidelines of 2013 govern occupational exposures to HIV. An exposure that warrants evaluation is a percutaneous injury, contact of a mucous membrane or non-intact skin with blood or another potentially infectious material, or a bite with blood exposure; intact skin is not an exposure. When the source is known to be HIV positive, prophylaxis is recommended. When the source status is unknown it is not routinely recommended and is decided case by case on the likelihood that the source is infected. When the source is known negative it is not recommended. Three things about the guidance are worth stating plainly. The 2013 update removed the two-drug basic regimen, so the older tiering of exposures into basic and expanded regimens by severity is gone and every recommended course is now three drugs or more, with exposure severity no longer selecting between them. Prophylaxis should not wait for source testing: it should begin as soon as possible, in hours rather than days, and can be stopped if the source is later found negative, since waiting for a result is the delay that costs the most. And intact skin is not an exposure, while a source of unknown status is not a source that is positive. This returns a decision framework and names no drug, no dose and no regimen. It does not prescribe, and the occupational health service or treating clinician decides.';

export const EXPOSURE_TYPES = [
  { value: 'none', text: 'No exposure of a recognized type' },
  { value: 'percutaneous', text: 'Percutaneous injury: a needlestick or a cut with a sharp object' },
  { value: 'mucous-membrane', text: 'Contact of a mucous membrane with blood or another potentially infectious material' },
  { value: 'non-intact-skin', text: 'Contact of non-intact skin with blood or another potentially infectious material' },
  { value: 'bite-with-blood', text: 'A bite with blood exposure' },
  { value: 'intact-skin', text: 'Contact with intact skin only' },
];

export const SOURCE_STATUSES = [
  { value: 'positive', text: 'Known HIV positive' },
  { value: 'unknown', text: 'Unknown status, or the source cannot be identified' },
  { value: 'negative', text: 'Known HIV negative' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function hivPepOccupational(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const exposure = oneOf(EXPOSURE_TYPES, o.exposureType, 'none');
  const source = oneOf(SOURCE_STATUSES, o.sourceStatus, 'unknown');
  const hoursSince = num(o.hoursSinceExposure);

  if (hoursSince !== null && (hoursSince < 0 || hoursSince > 2000)) {
    return { valid: false, message: 'Enter the hours since the exposure, between 0 and 2000.' };
  }

  const qualifying = exposure !== 'none' && exposure !== 'intact-skin';
  const sourceRiskFactors = on(o.sourceRiskFactors);

  const decision = !qualifying
    ? 'not-an-exposure'
    : source === 'positive'
      ? 'recommended'
      : source === 'negative'
        ? 'not-recommended'
        : sourceRiskFactors
          ? 'case-by-case-higher'
          : 'case-by-case';

  const action = {
    'not-an-exposure': exposure === 'intact-skin'
      ? 'Contact with intact skin only is not an exposure under these guidelines, and prophylaxis is not indicated for it. Wash the area; nothing further follows from this pathway.'
      : 'No exposure of a recognized type is recorded. The guidelines apply to a percutaneous injury, a mucous membrane or non-intact skin contact, or a bite with blood exposure.',
    recommended: 'The source is known HIV positive and the exposure is of a recognized type: post-exposure prophylaxis is recommended. Start it now, without waiting for anything else.',
    'not-recommended': 'The source is known HIV negative, so prophylaxis is not recommended. That rests on the source result being reliable and on there being no reason to suspect recent infection in the source.',
    'case-by-case': 'The source status is unknown. Prophylaxis is not routinely recommended in this situation and is decided case by case, on the likelihood that the source is infected. That decision belongs to the occupational health service.',
    'case-by-case-higher': 'The source status is unknown but risk factors for HIV are recorded. Prophylaxis is decided case by case, and those risk factors are what raises the likelihood the decision turns on. That decision belongs to the occupational health service.',
  }[decision];

  // The reason the tile exists, on every result that is an exposure at all.
  const noTieringNote = qualifying
    ? 'The 2013 update removed the two-drug "basic" regimen. Exposures are no longer tiered into basic and expanded regimens by severity; every recommended course is three drugs or more, and the severity of the injury no longer selects between them.'
    : null;

  const timingNote = qualifying
    ? (hoursSince === null
      ? 'Prophylaxis should begin as soon as possible, in hours rather than days. Do not wait for source testing: start, and stop if the source is later found to be negative. Waiting for a result is the delay that costs the most.'
      : hoursSince <= 72
        ? `${hoursSince} hours have passed. Prophylaxis should begin as soon as possible, in hours rather than days, and should not wait for source testing: start, and stop if the source is later found negative.`
        : `${hoursSince} hours have passed, beyond the 72 hours within which prophylaxis is usually offered. That is a reason for expert consultation, not for assuming nothing can be done.`)
    : null;

  const intactSkinNote = 'Intact skin is not an exposure. A source of unknown status is not a source that is positive. Both are read the other way often enough to be worth stating.';

  const followUpNote = decision === 'recommended' || decision === 'case-by-case' || decision === 'case-by-case-higher'
    ? 'Whatever is decided about prophylaxis, baseline and follow-up testing of the exposed person is part of the pathway, and so is evaluation for hepatitis B and hepatitis C, which follow separate rules from these.'
    : null;

  const noDrugNote = 'This names no drug, no dose and no regimen. Those are for the occupational health service or the treating clinician, and expert consultation is advised for pregnancy, known or suspected resistance, and delayed presentation.';

  const recordedNote = `Recorded: ${EXPOSURE_TYPES.find((e) => e.value === exposure).text.toLowerCase()}; source ${SOURCE_STATUSES.find((s) => s.value === source).text.toLowerCase()}.`;

  const scopeNote = 'This applies a published decision framework to an exposure already described. It does not prescribe, and it does not replace occupational health review.';

  return {
    valid: true,
    decision,
    qualifying,
    exposureType: exposure,
    sourceStatus: source,
    hoursSinceExposure: hoursSince,
    action,
    recordedNote,
    noTieringNote,
    timingNote,
    intactSkinNote,
    followUpNote,
    noDrugNote,
    scopeNote,
    abnormal: decision === 'recommended' || decision === 'case-by-case-higher',
    bandLabel: {
      'not-an-exposure': 'Not an exposure',
      recommended: 'Prophylaxis recommended',
      'not-recommended': 'Prophylaxis not recommended',
      'case-by-case': 'Decided case by case',
      'case-by-case-higher': 'Decided case by case',
    }[decision],
    band: action,
    detail: 'A percutaneous injury, a mucous membrane or non-intact skin contact with blood or another potentially infectious material, or a bite with blood exposure is an exposure; intact skin is not. A known positive source means prophylaxis is recommended, a known negative source means it is not, and an unknown source is decided case by case. Every recommended course is three drugs or more, and it should start in hours rather than days.',
    note: PEP_NOTE,
  };
}
