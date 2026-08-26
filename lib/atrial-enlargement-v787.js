// spec-v787: ECG criteria for atrial enlargement (left and right).
//
// The atrial companion to the ventricular-hypertrophy tiles already in the catalog
// (lvh-criteria, romhilt-estes). Sources:
//   Morris JJ, Estes EH, Whalen RE, Thompson HK, McIntosh HD. P-wave analysis in
//   valvular heart disease. Circulation. 1964;29:242-252 (the P terminal force);
//   standard criteria as taught in the University of Utah ECG learning modules and
//   reproduced across contemporary references.
//
// LEFT atrial enlargement - any one of:
//   P wave duration in lead II  >= 120 ms
//   notched P in a limb lead with inter-peak duration >= 40 ms
//   P terminal force in V1: terminal negative deflection >= 40 ms long AND >= 1 mm deep
//     (the Morris index, the product of the two, >= 0.04 mm.s)
//
// RIGHT atrial enlargement - either:
//   P wave amplitude in lead II  > 2.5 mm
//   P wave amplitude in V1       > 1.5 mm
//
// Note the thresholds are NOT symmetric: the left-sided ones are "or more" and the
// right-sided ones are strictly greater than. A P of exactly 2.5 mm in lead II does
// not meet the right atrial criterion.
//
// Reported sensitivity for the left-sided criteria is about 50% with specificity about
// 90%, so a normal P wave does not exclude an enlarged atrium.
//
// Pure: no DOM, no clock, no network.

export const ATRIAL_NOTE = 'ECG criteria for atrial enlargement read the P wave, the first small deflection of each beat, for signs that an atrium is enlarged. The left-sided criteria are met by any one of a P wave lasting 120 milliseconds or more in lead II, a notched P in a limb lead whose two peaks are 40 milliseconds or more apart, or a terminal negative deflection in V1 that is at least 40 milliseconds long and at least 1 millimetre deep, the product of which is the Morris index. The right-sided criteria are met by a P wave taller than 2.5 millimetres in lead II or taller than 1.5 millimetres in V1. The thresholds are deliberately not symmetric: the left-sided ones are or-more and the right-sided ones are strictly greater than. Sensitivity for the left-sided criteria is only about 50 percent against a specificity of about 90 percent, so a normal P wave does not rule out an enlarged atrium and an echocardiogram measures the chamber that this only infers.';

function optNum(v, min, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}

const FIELDS = [
  { arg: 'pDurationII', min: 0, max: 400, name: 'P wave duration in lead II' },
  { arg: 'notchInterpeak', min: 0, max: 400, name: 'notch inter-peak duration' },
  { arg: 'ptfDuration', min: 0, max: 400, name: 'P terminal force duration in V1' },
  { arg: 'ptfDepth', min: 0, max: 20, name: 'P terminal force depth in V1' },
  { arg: 'pAmplitudeII', min: 0, max: 20, name: 'P wave amplitude in lead II' },
  { arg: 'pAmplitudeV1', min: 0, max: 20, name: 'P wave amplitude in V1' },
];

export function atrialEnlargement(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const v = {};
  for (const f of FIELDS) {
    const parsed = optNum(o[f.arg], f.min, f.max);
    if (parsed === undefined) {
      return { valid: false, code: 'INVALID_INPUT', field: f.arg, message: `Enter a ${f.name} between ${f.min} and ${f.max}.`, note: ATRIAL_NOTE };
    }
    v[f.arg] = parsed;
  }
  if (FIELDS.every((f) => v[f.arg] === null)) {
    return { valid: false, code: 'MISSING_INPUT', field: 'pDurationII', message: 'Enter at least one P wave measurement.', note: ATRIAL_NOTE };
  }

  const left = [];
  if (v.pDurationII !== null && v.pDurationII >= 120) left.push(`P duration in II ${v.pDurationII} ms (>= 120)`);
  if (v.notchInterpeak !== null && v.notchInterpeak >= 40) left.push(`notch inter-peak ${v.notchInterpeak} ms (>= 40)`);

  // The Morris index needs BOTH halves of the terminal force, so it is only assessed
  // when both were measured; one alone cannot meet or exclude it.
  let morris = null;
  if (v.ptfDuration !== null && v.ptfDepth !== null) {
    morris = Math.round(v.ptfDuration * v.ptfDepth) / 1000;
    if (v.ptfDuration >= 40 && v.ptfDepth >= 1) {
      left.push(`P terminal force in V1 ${v.ptfDuration} ms x ${v.ptfDepth} mm (Morris index ${morris.toFixed(3)} mm.s)`);
    }
  }

  const right = [];
  if (v.pAmplitudeII !== null && v.pAmplitudeII > 2.5) right.push(`P amplitude in II ${v.pAmplitudeII} mm (> 2.5)`);
  if (v.pAmplitudeV1 !== null && v.pAmplitudeV1 > 1.5) right.push(`P amplitude in V1 ${v.pAmplitudeV1} mm (> 1.5)`);

  const leftMet = left.length > 0;
  const rightMet = right.length > 0;
  let summary;
  if (leftMet && rightMet) summary = 'criteria met for BOTH left and right atrial enlargement';
  else if (leftMet) summary = 'criteria met for left atrial enlargement';
  else if (rightMet) summary = 'criteria met for right atrial enlargement';
  else summary = 'no atrial enlargement criterion met';

  return {
    valid: true,
    leftMet,
    rightMet,
    leftCriteria: left,
    rightCriteria: right,
    morrisIndex: morris,
    abnormal: leftMet || rightMet,
    bandLabel: leftMet || rightMet ? `Atrial enlargement: ${leftMet ? 'left' : ''}${leftMet && rightMet ? ' and ' : ''}${rightMet ? 'right' : ''}` : 'Atrial enlargement: none met',
    band: `P wave analysis — ${summary}.`,
    detail: 'Left: P duration in II 120 ms or more, a notched limb-lead P with peaks 40 ms or more apart, or a V1 terminal negative deflection 40 ms or more long and 1 mm or more deep (the Morris index). Right: P taller than 2.5 mm in II or taller than 1.5 mm in V1. The thresholds are not symmetric - the left ones are or-more and the right ones are strictly greater. Sensitivity for the left criteria is about 50 percent at about 90 percent specificity, so a normal P wave does not rule enlargement out.',
    note: ATRIAL_NOTE,
  };
}
