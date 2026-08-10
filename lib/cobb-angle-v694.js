// spec-v694: Cobb angle interpretation for scoliosis curve magnitude.
//
// The Cobb angle is the standard radiographic measure of a scoliotic (or kyphotic)
// spinal curve. This tile interprets a measured Cobb angle into its severity band and
// the (maturity-dependent) management context. Companion to the built Risser sign
// (risser-sign), which grades the skeletal maturity that drives the bracing decision.
// Sources:
//   Cobb JR. Outline for the study of scoliosis. Instr Course Lect. 1948;5:261-275.
//   Scoliosis Research Society definitions (scoliosis is a Cobb angle >= 10 degrees).
//
// Bands (degrees): < 10 not scoliosis; 10-24 mild; 25-44 moderate; >= 45 severe.
// Management is guideline- and maturity-dependent, NOT a fixed function of the angle:
// bracing is typically considered for curves of about 25-40 degrees in a skeletally
// immature patient (Risser 0-2), and surgery for curves of about 45-50 degrees or more.
// The tile reports the angle band and states these cut-points as advisory.
//
// Pure: no DOM, no clock, no network.

export const COBB_NOTE = 'Cobb angle for scoliosis (Cobb JR, 1948; Scoliosis Research Society). The Cobb angle is measured on a standing spine radiograph as the angle between the most-tilted upper and lower end vertebrae of a curve. A curve of 10 degrees or more defines scoliosis; below 10 degrees is minor spinal asymmetry, not scoliosis. Severity bands are roughly 10 to 24 degrees mild, 25 to 44 degrees moderate, and 45 degrees or more severe. Management depends on skeletal maturity and growth remaining, not on the angle alone: for a skeletally immature patient (for example Risser 0 to 2), bracing is typically considered for curves of about 25 to 40 degrees to slow progression, and surgery is typically considered for curves of about 45 to 50 degrees or more. These cut-points are advisory and vary by guideline, curve pattern, and patient; the score interprets the measured angle and supports rather than replaces the specialist assessment.';

function band(a) {
  if (a < 10) return { tier: 'none', label: 'not scoliosis (minor spinal asymmetry)' };
  if (a <= 24) return { tier: 'mild', label: 'mild scoliosis' };
  if (a <= 44) return { tier: 'moderate', label: 'moderate scoliosis' };
  return { tier: 'severe', label: 'severe scoliosis' };
}

export function cobbAngle(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = o.angle;
  if (raw === '' || raw === null || raw === undefined) {
    return { valid: false, code: 'MISSING_INPUT', field: 'angle', message: 'Enter the measured Cobb angle in degrees.' };
  }
  const angle = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(angle) || angle < 0 || angle > 180) {
    return { valid: false, code: 'OUT_OF_RANGE', field: 'angle', message: `The Cobb angle is 0 to 180 degrees. Got "${raw}".` };
  }

  const b = band(angle);
  const isScoliosis = angle >= 10;
  const braceZone = angle >= 25 && angle <= 40;
  const surgeryZone = angle >= 45;
  return {
    valid: true,
    angle,
    category: b.tier,
    isScoliosis,
    // Flag a management-relevant curve (moderate or greater, >= 25 degrees).
    abnormal: angle >= 25,
    band: `Cobb ${angle}° — ${b.label}.`,
    detail: !isScoliosis
      ? 'Below the 10-degree threshold that defines scoliosis; typically observation only.'
      : (surgeryZone
          ? 'In the range where surgery is often considered (about 45-50 degrees or more), depending on maturity and progression.'
          : (braceZone
              ? 'In the range where bracing is often considered for a skeletally immature patient (about 25-40 degrees); check skeletal maturity (Risser).'
              : 'Scoliosis; management (observation vs bracing) depends on the angle, skeletal maturity, and documented progression.')),
    note: COBB_NOTE,
  };
}
