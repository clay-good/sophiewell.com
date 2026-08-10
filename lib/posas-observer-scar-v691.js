// spec-v691: POSAS Observer Scale (Patient and Observer Scar Assessment Scale).
//
// The observer (clinician) component of the POSAS, a standardized scar-assessment scale.
// The modern companion to the Vancouver Scar Scale (the vancouver-scar-scale tile). Source:
//   Draaijers LJ, Tempelman FR, Botman YA, et al. The Patient and Observer Scar Assessment
//   Scale: a reliable and feasible tool for scar evaluation. Plast Reconstr Surg.
//   2004;113(7):1960-1965. (Observer scale; six items.)
//
// The observer rates six characteristics of the scar, each on a 1-10 scale where 1 is
// "like normal skin" and 10 is "worst scar imaginable":
//   vascularity, pigmentation, thickness, relief (surface roughness), pliability, surface area.
// The total is the SUM of the six items, range 6-60 (6 = normal skin, higher = worse). A
// separate "overall opinion" (1-10) is recorded but is NOT part of the six-item total.
//
// There are no fixed severity band cut-points; the scale is used to describe a scar and to
// track change over time. Pure: no DOM, no clock, no network.

export const POSAS_NOTE = 'POSAS Observer Scale, the observer (clinician) component of the Patient and Observer Scar Assessment Scale (Draaijers LJ, Tempelman FR, Botman YA, et al, Plast Reconstr Surg 2004;113(7):1960-1965). The observer rates six characteristics of a scar - vascularity, pigmentation, thickness, relief or surface roughness, pliability, and surface area - each on a scale from 1, meaning like normal skin, to 10, the worst scar imaginable. The total is the sum of the six items and ranges from 6 (normal skin) to 60, with higher totals indicating worse scarring. A separate overall opinion from 1 to 10 is recorded but is not included in the six-item total. There are no fixed severity cut-points; the scale describes a scar and, most usefully, tracks change over time, and it is typically paired with the patient-rated component. It supports rather than replaces clinical judgment.';

function scaleVal(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 1 || n > 10) return null;
  return n;
}

const ITEMS = ['vascularity', 'pigmentation', 'thickness', 'relief', 'pliability', 'surfaceArea'];

export function posasObserverScar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const it of ITEMS) {
    const v = scaleVal(o[it]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: it, message: `Rate ${it} on the 1-10 scale (1 = normal skin, 10 = worst scar).`, note: POSAS_NOTE };
    }
    total += v;
  }

  // Overall opinion is optional and is NOT part of the total.
  let overall = null;
  if (o.overallOpinion !== '' && o.overallOpinion !== null && o.overallOpinion !== undefined) {
    overall = scaleVal(o.overallOpinion);
    if (overall === null) {
      return { valid: false, code: 'INVALID_INPUT', field: 'overallOpinion', message: 'Overall opinion, if given, is 1-10.', note: POSAS_NOTE };
    }
  }

  return {
    valid: true,
    score: total,
    overall,
    // No fixed cut-point; a measurement scale, not a verdict.
    abnormal: false,
    bandLabel: `POSAS Observer ${total} of 60`,
    band: `POSAS Observer total ${total} of 60${overall !== null ? ` (overall opinion ${overall}/10)` : ''} — higher is worse (6 = normal skin).`,
    detail: 'Sum of six items (vascularity, pigmentation, thickness, relief, pliability, surface area), each 1-10. No fixed bands; most useful for tracking change over time and paired with the patient-rated scale.',
    note: POSAS_NOTE,
  };
}
