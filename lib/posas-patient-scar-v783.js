// spec-v783: POSAS Patient Scale (Patient and Observer Scar Assessment Scale 2.0).
//
// The patient-rated half of the POSAS. Its observer half is already in the catalog
// (the posas-observer-scar tile), whose own note says the scale is meant to be paired.
// Source:
//   Draaijers LJ, Tempelman FR, Botman YA, et al. The Patient and Observer Scar
//   Assessment Scale: a reliable and feasible tool for scar evaluation. Plast Reconstr
//   Surg. 2004;113(7):1960-1965. Version 2.0: van de Kar AL, Corion LU, Smeulders MJ,
//   et al. Plast Reconstr Surg. 2005;116(2):514-522.
//
// The patient rates six characteristics of their own scar, each 1 to 10, where 1 is
// "not at all / like normal skin" and 10 is "very much / the worst imaginable":
//   pain, itch, color, pliability (stiffness), thickness, relief (irregularity)
//
// The total is the SUM of those six, range 6-60. A seventh item, the patient's overall
// opinion of the scar, is recorded on the same 1-10 scale but falls OUTSIDE the total -
// exactly as on the observer scale.
//
// The first two items, pain and itch, are the reason this half exists: no observer can
// rate them, and they are what the patient most often cares about.
//
// There are no fixed severity band cut-points. Pure: no DOM, no clock, no network.

export const POSAS_PATIENT_NOTE = 'POSAS Patient Scale, the patient-rated half of the Patient and Observer Scar Assessment Scale (Draaijers LJ, Tempelman FR, Botman YA, et al, Plast Reconstr Surg 2004;113(7):1960-1965; version 2.0 van de Kar AL, et al, 2005). The patient rates six things about their own scar - pain, itch, color, pliability or stiffness, thickness, and relief or irregularity - each from 1, meaning not at all or like normal skin, to 10, meaning very much or the worst imaginable. The total is the sum of those six and runs from 6 to 60, with higher meaning a worse scar. A seventh item, the overall opinion of the scar, is recorded on the same 1 to 10 scale but is not part of the total. Pain and itch are the reason this half of the scale exists, because no observer can rate them. There are no fixed severity cut-points; the scale describes a scar and tracks change over time, and it is meant to be reported alongside the observer scale rather than instead of it.';

const ITEMS = [
  { arg: 'pain', label: 'pain' },
  { arg: 'itch', label: 'itch' },
  { arg: 'color', label: 'color' },
  { arg: 'pliability', label: 'pliability (stiffness)' },
  { arg: 'thickness', label: 'thickness' },
  { arg: 'relief', label: 'relief (irregularity)' },
];

function scaleVal(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 1 || n > 10) return null;
  return n;
}

export function posasPatientScar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let total = 0;
  for (const it of ITEMS) {
    const v = scaleVal(o[it.arg]);
    if (v === null) {
      return { valid: false, code: 'MISSING_INPUT', field: it.arg, message: `Rate ${it.label} from 1 to 10 (1 = not at all or like normal skin, 10 = very much or worst imaginable).`, note: POSAS_PATIENT_NOTE };
    }
    total += v;
  }

  // Overall opinion is optional and is NOT part of the total.
  let overall = null;
  if (o.overallOpinion !== '' && o.overallOpinion !== null && o.overallOpinion !== undefined) {
    overall = scaleVal(o.overallOpinion);
    if (overall === null) {
      return { valid: false, code: 'INVALID_INPUT', field: 'overallOpinion', message: 'Overall opinion, if given, is 1-10.', note: POSAS_PATIENT_NOTE };
    }
  }

  return {
    valid: true,
    score: total,
    overall,
    // No fixed cut-point; a measurement scale, not a verdict.
    abnormal: false,
    bandLabel: `POSAS Patient ${total} of 60`,
    band: `POSAS Patient total ${total} of 60${overall !== null ? ` (overall opinion ${overall}/10)` : ''} — higher is worse (6 = like normal skin).`,
    detail: 'Sum of six patient-rated items (pain, itch, color, pliability, thickness, relief), each 1-10. The overall opinion item is recorded separately and is not added in. No fixed bands; most useful for tracking change over time and reported alongside the observer scale.',
    note: POSAS_PATIENT_NOTE,
  };
}
