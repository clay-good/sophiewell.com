// spec-v307: Diabetic macular edema (DME) severity — the International Clinical
// DME disease severity scale (the companion to the ICDR retinopathy scale in the
// same Wilkinson 2003 paper; graded together at every diabetic eye exam). Given
// whether retinal thickening or hard exudates are present in the posterior pole
// and their location relative to the center of the macula, the tile reports the
// DME level: absent, mild, moderate, or severe (center-involving).
//
// This reports the classification's own level, NOT a diagnosis or a treatment
// decision (spec-v11 §5.3) — the examination, grading, and management (e.g.
// anti-VEGF for center-involving DME) stay with the ophthalmologist.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against
// two independent sources that agree on the location-based grading:
//   - Wilkinson CP, Ferris FL 3rd, Klein RE, et al. Proposed international clinical
//     diabetic retinopathy and diabetic macular edema disease severity scales.
//     Ophthalmology. 2003;110(9):1677-1682 (the ICDR / DME scales).
//   - medicalcriteria.com DME reference table, which reproduces the same levels.

// Location of retinal thickening / hard exudates relative to the fovea center.
const LEVELS = {
  distant: { name: 'Mild DME', detail: 'Some retinal thickening or hard exudates in the posterior pole but distant from the center of the macula.', centerInvolving: false },
  approaching: { name: 'Moderate DME', detail: 'Retinal thickening or hard exudates approaching the center of the macula but not involving the center.', centerInvolving: false },
  involving: { name: 'Severe DME', detail: 'Retinal thickening or hard exudates involving the center of the macula (center-involving).', centerInvolving: true },
};

const NOTE = 'International Clinical Diabetic Macular Edema (DME) severity scale (Wilkinson 2003), the companion to the ICDR retinopathy scale. DME is apparently absent (no retinal thickening or hard exudates in the posterior pole) or apparently present; if present it is graded by the location of the thickening/exudates relative to the center of the macula: mild (distant from the center), moderate (approaching but not involving the center), or severe (involving the center = center-involving DME). Center-involving DME is the vision-threatening form. Retinal thickening is best assessed on dilated slit-lamp biomicroscopy, stereo fundus photography, or OCT. This reports the DME level, not a diagnosis or a treatment decision; the examination and management stay with the ophthalmologist.';

// input.present (bool): retinal thickening or hard exudates in the posterior pole.
// input.location: 'distant' | 'approaching' | 'involving' (used only when present).
export function dmeSeverity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const b = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on';
  const present = b(o.present);

  if (!present) {
    return {
      valid: true,
      level: 'absent',
      name: 'DME apparently absent',
      detail: 'No apparent retinal thickening or hard exudates in the posterior pole.',
      centerInvolving: false,
      abnormal: false,
      present: false,
      bandLabel: 'No apparent DME',
      band: 'DME apparently absent: no apparent retinal thickening or hard exudates in the posterior pole.',
      note: NOTE,
    };
  }

  const key = Object.prototype.hasOwnProperty.call(LEVELS, o.location) ? o.location : null;
  if (!key) {
    return { valid: false, message: 'Select where the thickening / hard exudates are relative to the center of the macula.' };
  }
  const entry = LEVELS[key];

  let band = `${entry.name}: ${entry.detail}`;
  if (entry.centerInvolving) {
    band += ' Center-involving DME is the vision-threatening form.';
  }

  return {
    valid: true,
    level: key,
    name: entry.name,
    detail: entry.detail,
    centerInvolving: entry.centerInvolving,
    abnormal: entry.centerInvolving,
    present: true,
    bandLabel: entry.name,
    band,
    note: NOTE,
  };
}
