// spec-v707: Amsler-Krumeich keratoconus classification.
//
// A four-stage classification of keratoconus severity. The stage is the most advanced one
// for which any parameter qualifies (worst-parameter-wins). Source:
//   Amsler M / Krumeich JH, Daniel J, Knulle A. Live-epikeratophakia for keratoconus.
//   J Cataract Refract Surg. 1998;24(4):456-463; stage boundaries per Kamiya K, et al.
//   Sci Rep. 2018;8:12852 and standard keratoconus references.
//
// Per-parameter stage:
//   Mean central K (diopters):        < 48 -> 1, 48-53 -> 2, 54-55 -> 3, > 55 -> 4
//   Thinnest corneal thickness (um):  > 500 -> 1, 400-500 -> 2, 200-400 -> 3, < 200 -> 4
//   Myopia + astigmatism (diopters):  < 5 -> 1, 5 to < 8 -> 2, 8-10 -> 3, > 10 -> 4 (optional)
//   Central corneal scarring:         present -> 4 (a defining feature of stage 4)
//
// The overall stage = the maximum single-parameter stage.
//
// Pure: no DOM, no clock, no network.

export const AMSLER_KRUMEICH_NOTE = 'Amsler-Krumeich classification of keratoconus severity (Krumeich JH, Daniel J, Knulle A, J Cataract Refract Surg 1998;24(4):456-463; stage boundaries per Kamiya K, et al, Sci Rep 2018;8:12852). It assigns a stage from 1 to 4 by the most advanced finding among the mean central keratometry, the thinnest corneal thickness, the refractive error, and the presence of central scarring. Mean central K under 48 diopters is stage 1, 48 to 53 stage 2, 54 to 55 stage 3, and over 55 stage 4. Thinnest corneal thickness over 500 microns is stage 1, 400 to 500 stage 2, 200 to 400 stage 3, and under 200 stage 4. Myopia plus astigmatism under 5 diopters is stage 1, 5 to under 8 stage 2, 8 to 10 stage 3, and refraction not measurable or over 10 stage 4. Central corneal scarring is a defining feature of stage 4. The overall stage is the highest that any single parameter reaches; stage 1 is mildest and stage 4 the most advanced. It grades severity to guide management and does not by itself select a treatment; it supports rather than replaces the full corneal-tomography assessment and clinical judgment.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

function kStage(k) { if (k < 48) return 1; if (k <= 53) return 2; if (k <= 55) return 3; return 4; }
function thicknessStage(t) { if (t > 500) return 1; if (t > 400) return 2; if (t >= 200) return 3; return 4; }
function refractionStage(r) { if (r < 5) return 1; if (r < 8) return 2; if (r <= 10) return 3; return 4; }

const STAGE_LABEL = { 1: 'mild keratoconus', 2: 'moderate keratoconus', 3: 'severe keratoconus', 4: 'advanced keratoconus' };

export function amslerKrumeich(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const k = num(o.meanK);
  if (!Number.isFinite(k) || k < 30 || k > 100) {
    return { valid: false, code: 'MISSING_INPUT', field: 'meanK', message: 'Enter the mean central keratometry (diopters).', note: AMSLER_KRUMEICH_NOTE };
  }
  const thickness = num(o.thinnestThickness);
  if (!Number.isFinite(thickness) || thickness <= 0 || thickness > 900) {
    return { valid: false, code: 'MISSING_INPUT', field: 'thinnestThickness', message: 'Enter the thinnest corneal thickness (microns).', note: AMSLER_KRUMEICH_NOTE };
  }

  const stages = [kStage(k), thicknessStage(thickness)];
  const drivers = [`K -> stage ${kStage(k)}`, `thickness -> stage ${thicknessStage(thickness)}`];

  // Refraction is optional (it is "not measurable" in stage 4).
  const refraction = num(o.refraction);
  if (Number.isFinite(refraction) && refraction >= 0) {
    stages.push(refractionStage(refraction));
    drivers.push(`refraction -> stage ${refractionStage(refraction)}`);
  }

  if (truthy(o.centralScar)) { stages.push(4); drivers.push('central scar -> stage 4'); }

  const stage = Math.max(...stages);

  return {
    valid: true,
    stage,
    tier: `stage-${stage}`,
    abnormal: stage >= 3,
    bandLabel: `Amsler-Krumeich stage ${stage}`,
    band: `Amsler-Krumeich stage ${stage} — ${STAGE_LABEL[stage]}.`,
    detail: `Stage = the most advanced parameter: ${drivers.join(', ')}. Stage 1 mildest, stage 4 most advanced.`,
    note: AMSLER_KRUMEICH_NOTE,
  };
}
