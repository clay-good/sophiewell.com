// spec-v801: Hodapp-Parrish-Anderson visual field staging of glaucoma.
//
// Sources:
//   Hodapp E, Parrish RK, Anderson DR. Clinical Decisions in Glaucoma. St Louis: Mosby;
//   1993:52-61. Operational thresholds as implemented and validated in the GFDC classifier
//   (npj Digit Med. 2024;7:126; PMC11102533).
//
// FOUR criteria are read off one visual field, each giving its own grade, and THE MOST
// SEVERE RESULT IS THE OVERALL GRADE. That last rule is the whole point: a field can look
// early on mean deviation and be severe on the central points.
//
//   mean deviation (dB)
//     >= -1        none      -1 to -6   early
//     -6 to -12    moderate  < -12      severe
//
//   percentage of points below the 5% level on pattern deviation
//     0            none      up to 25%  early
//     up to 50%    moderate  over 50%   severe
//
//   number of points below the 1% level on pattern deviation (of 76)
//     0            none      under 10   early
//     10 to 20     moderate  over 20    severe
//
//   central 5 degrees
//     all above 15 dB                                   none
//     depressed, but not in both hemifields             moderate
//     depressed in both hemifields, or any point 0 dB   severe
//
// Pure: no DOM, no clock, no network.

export const HPA_NOTE = 'The Hodapp-Parrish-Anderson criteria (Hodapp E, Parrish RK, Anderson DR, Clinical Decisions in Glaucoma, Mosby 1993) stage glaucoma from the visual field alone, using four readings from one test: the mean deviation, the share of points below the 5 percent level on pattern deviation, the number of points below the 1 percent level, and what is happening within the central 5 degrees. Each reading gives its own grade and the most severe of the four is the overall grade, which is the rule that matters, because a field can look early on mean deviation and be severe on its central points. A mean deviation better than minus 6 is early, minus 6 to minus 12 moderate, and worse than minus 12 severe; up to a quarter of points below the 5 percent level is early, up to half moderate and more than half severe; under 10 points below the 1 percent level is early, 10 to 20 moderate and over 20 severe; and in the central 5 degrees a depression in both hemifields, or any point at 0 decibels, is severe. It stages a field a clinician has already reviewed for reliability and artefact; it does not read the printout, it says nothing about intraocular pressure or the optic nerve, and it sets no treatment target.';

const LEVELS = ['none', 'early', 'moderate', 'severe'];
const CENTRAL = {
  'all-above-15': { grade: 'none', text: 'all central points above 15 dB' },
  'one-hemifield': { grade: 'moderate', text: 'depressed within the central 5 degrees, but not in both hemifields' },
  'both-or-zero': { grade: 'severe', text: 'depressed in both hemifields within 5 degrees, or a point at 0 dB' },
};

function optNum(v, min, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}

function gradeFromMd(md) {
  if (md >= -1) return 'none';
  if (md >= -6) return 'early';
  if (md >= -12) return 'moderate';
  return 'severe';
}
function gradeFromPercent5(p) {
  if (p === 0) return 'none';
  if (p <= 25) return 'early';
  if (p <= 50) return 'moderate';
  return 'severe';
}
function gradeFromCount1(n) {
  if (n === 0) return 'none';
  if (n < 10) return 'early';
  if (n <= 20) return 'moderate';
  return 'severe';
}

export function hpaGlaucoma(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const md = optNum(o.meanDeviation, -40, 10);
  if (md === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'meanDeviation', message: 'Enter a mean deviation between -40 and 10 dB.', note: HPA_NOTE };
  const pct5 = optNum(o.percentBelow5, 0, 100);
  if (pct5 === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'percentBelow5', message: 'Enter a percentage between 0 and 100.', note: HPA_NOTE };
  const count1 = optNum(o.countBelow1, 0, 76);
  if (count1 === undefined) return { valid: false, code: 'INVALID_INPUT', field: 'countBelow1', message: 'Enter a point count between 0 and 76.', note: HPA_NOTE };

  const centralKey = o.central === undefined || o.central === null || o.central === '' ? 'all-above-15' : String(o.central).trim();
  if (!Object.prototype.hasOwnProperty.call(CENTRAL, centralKey)) {
    return { valid: false, code: 'INVALID_INPUT', field: 'central', message: 'Central 5 degrees must be all-above-15, one-hemifield or both-or-zero.', note: HPA_NOTE };
  }

  const parts = [];
  if (md !== null) parts.push({ name: 'mean deviation', grade: gradeFromMd(md), detail: `${md} dB` });
  if (pct5 !== null) parts.push({ name: 'points below the 5% level', grade: gradeFromPercent5(pct5), detail: `${pct5}%` });
  if (count1 !== null) parts.push({ name: 'points below the 1% level', grade: gradeFromCount1(count1), detail: `${count1} of 76` });
  parts.push({ name: 'central 5 degrees', grade: CENTRAL[centralKey].grade, detail: CENTRAL[centralKey].text });

  if (parts.every((p) => p.grade === 'none') && md === null && pct5 === null && count1 === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'meanDeviation', message: 'Enter at least one visual field measurement.', note: HPA_NOTE };
  }

  // The most severe of the four criteria is the overall grade.
  let overall = 'none';
  for (const p of parts) {
    if (LEVELS.indexOf(p.grade) > LEVELS.indexOf(overall)) overall = p.grade;
  }
  const drivers = parts.filter((p) => p.grade === overall).map((p) => `${p.name} (${p.detail})`);

  return {
    valid: true,
    stage: overall,
    criteria: parts.map((p) => ({ name: p.name, grade: p.grade, detail: p.detail })),
    drivers,
    abnormal: overall !== 'none',
    bandLabel: `Hodapp-Parrish-Anderson: ${overall}`,
    band: overall === 'none'
      ? 'Hodapp-Parrish-Anderson: no defect on any of the four criteria.'
      : `Hodapp-Parrish-Anderson: ${overall} glaucomatous field defect — set by ${drivers.join(' and ')}.`,
    detail: 'Four criteria are read off one field and the MOST SEVERE result is the overall grade. Mean deviation: better than -6 early, -6 to -12 moderate, worse than -12 severe. Points below the 5% level: up to 25% early, up to 50% moderate, over 50% severe. Points below the 1% level: under 10 early, 10 to 20 moderate, over 20 severe. Central 5 degrees: depressed in both hemifields, or any point at 0 dB, is severe.',
    note: HPA_NOTE,
  };
}
