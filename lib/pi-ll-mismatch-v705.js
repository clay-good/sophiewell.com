// spec-v705: PI-LL mismatch (spinopelvic sagittal alignment).
//
// The pelvic-incidence minus lumbar-lordosis mismatch, a core sagittal-alignment parameter in
// adult spinal deformity. Source:
//   Schwab F, Ungar B, Blondel B, et al. Scoliosis Research Society-Schwab adult spinal
//   deformity classification: a validation study. Spine (Phila Pa 1976). 2012;37(12):1077-1082.
//
//   PI-LL mismatch = PI - LL   (both in degrees)
//     PI = pelvic incidence
//     LL = lumbar lordosis (entered as its magnitude)
//
// SRS-Schwab sagittal modifier, based on the absolute mismatch:
//   |PI-LL| < 10 degrees ...... 0  (well aligned)
//   10 to 20 degrees .......... +  (moderate)
//   > 20 degrees .............. ++ (marked)
// The surgical realignment target is PI-LL within about +/- 10 degrees.
//
// Pure: no DOM, no clock, no network.

export const PI_LL_NOTE = 'PI-LL mismatch, the pelvic incidence minus lumbar lordosis, is a core sagittal-alignment parameter in adult spinal deformity (Schwab F, Ungar B, Blondel B, et al, SRS-Schwab classification, Spine 2012;37(12):1077-1082). It equals PI minus LL in degrees, where PI is the pelvic incidence and LL is the magnitude of the lumbar lordosis. The SRS-Schwab sagittal modifier grades the absolute mismatch as 0 (well aligned) when it is under 10 degrees, + (moderate) at 10 to 20 degrees, and ++ (marked) above 20 degrees, and surgical realignment generally aims for a PI-LL within about plus or minus 10 degrees. An age-adjusted refinement allows a larger acceptable mismatch in older patients, which should be considered when interpreting the result. It is one alignment parameter among several (with sagittal vertical axis and pelvic tilt) and supports rather than replaces the full deformity assessment and surgical planning.';

function num(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

function modifier(absDiff) {
  if (absDiff < 10) return { code: '0', label: 'well aligned' };
  if (absDiff <= 20) return { code: '+', label: 'moderate malalignment' };
  return { code: '++', label: 'marked malalignment' };
}

export function piLlMismatch(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const pi = num(o.pelvicIncidence);
  if (!Number.isFinite(pi) || pi < 0 || pi > 100) {
    return { valid: false, code: 'MISSING_INPUT', field: 'pelvicIncidence', message: 'Enter the pelvic incidence in degrees.', note: PI_LL_NOTE };
  }
  const ll = num(o.lumbarLordosis);
  if (!Number.isFinite(ll) || ll < 0 || ll > 120) {
    return { valid: false, code: 'MISSING_INPUT', field: 'lumbarLordosis', message: 'Enter the lumbar lordosis magnitude in degrees.', note: PI_LL_NOTE };
  }

  const diff = pi - ll;
  const rounded = Math.round(diff);
  const m = modifier(Math.abs(diff));

  return {
    valid: true,
    mismatch: rounded,
    modifier: m.code,
    tier: m.code === '0' ? 'aligned' : (m.code === '+' ? 'moderate' : 'marked'),
    abnormal: Math.abs(diff) >= 10,
    bandLabel: `PI-LL ${rounded}° (${m.code})`,
    band: `PI-LL ${rounded}° — ${m.label} (SRS-Schwab modifier ${m.code}).`,
    detail: `PI ${pi} - LL ${ll} = ${rounded}°. SRS-Schwab: |PI-LL| < 10 = 0, 10-20 = +, > 20 = ++. Realignment target is within about +/- 10 degrees (an age-adjusted target allows more in older patients).`,
    note: PI_LL_NOTE,
  };
}
