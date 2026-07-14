// spec-v299: Cosyntropin (ACTH) stimulation test interpretation (a noted catalog
// gap from the spec-v293 search sweep). Given the peak stimulated serum cortisol
// (at 30 or 60 minutes after 250 µg cosyntropin) the tile reports whether the
// response meets the standard-immunoassay threshold for a normal adrenal
// response, with an explicit caveat that newer, more specific assays (LC-MS/MS)
// use lower cutoffs.
//
// This reports the cited threshold's own interpretation, NOT a diagnosis
// (spec-v11 §5.3) — the diagnosis of adrenal insufficiency stays with the
// clinician and depends on the local assay, clinical context, and baseline ACTH.
//
// THRESHOLD RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against
// two independent sources that agree on the ≥18 µg/dL (500 nmol/L) peak-cortisol
// cutoff at 30 or 60 minutes for the standard high-dose (250 µg) test, and on the
// lower LC-MS/MS cutoffs:
//   - Ortiz-Flores A, et al. Adrenocorticotropic Hormone (Cosyntropin) Stimulation
//     Test. StatPearls. NCBI Bookshelf NBK555940 (peak cortisol <18 µg/dL /
//     500 nmol/L at 30 or 60 min is suggestive of adrenal insufficiency; LC-MS/MS
//     ~412 nmol/L at 30 min and ~485 nmol/L at 60 min).
//   - Bornstein SR, et al. Diagnosis and Treatment of Primary Adrenal
//     Insufficiency: An Endocrine Society Clinical Practice Guideline. J Clin
//     Endocrinol Metab. 2016;101(2):364-389 (peak cortisol ≥18 µg/dL rules out).

// Standard-immunoassay peak-cortisol threshold for a normal 250 µg response.
const THRESHOLD = { 'µg/dL': 18, 'nmol/L': 500 };
const UNITS = ['µg/dL', 'nmol/L'];

const NOTE = 'Cosyntropin (ACTH) stimulation test: 250 µg cosyntropin IV/IM, peak serum cortisol measured at 30 and 60 minutes. A peak cortisol at or above 18 µg/dL (500 nmol/L) at 30 or 60 minutes indicates a normal adrenal response and makes adrenal insufficiency unlikely; a value below the threshold is suggestive of adrenal insufficiency. CAVEAT: newer, more specific cortisol assays (LC-MS/MS, monoclonal immunoassays) run lower — approximately 412 nmol/L at 30 min and 485 nmol/L at 60 min — so use your laboratory\'s assay-specific cutoff. This reports the cited threshold\'s interpretation, not a diagnosis; the diagnosis of adrenal insufficiency stays with the clinician and depends on the assay, clinical context, and baseline ACTH.';

// input.cortisol: peak stimulated serum cortisol (number). input.unit: 'µg/dL'
// (default) or 'nmol/L'. Returns the threshold comparison and normal/abnormal
// flag.
export function cosyntropinTest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = UNITS.includes(o.unit) ? o.unit : 'µg/dL';
  const raw = typeof o.cortisol === 'string' ? o.cortisol.trim() : o.cortisol;
  if (raw === '' || raw === undefined || raw === null) {
    return { valid: false, message: 'Enter the peak stimulated cortisol.' };
  }
  const cortisol = Number(raw);
  if (!Number.isFinite(cortisol) || cortisol < 0) {
    throw new RangeError('Peak cortisol must be a non-negative number.');
  }
  const threshold = THRESHOLD[unit];
  const normal = cortisol >= threshold;

  const band = normal
    ? `Peak cortisol ${cortisol} ${unit} (at or above ${threshold} ${unit}): normal adrenal response — a normal high-dose cosyntropin response makes adrenal insufficiency unlikely.`
    : `Peak cortisol ${cortisol} ${unit} (below ${threshold} ${unit}): below the standard-immunoassay threshold — suggestive of adrenal insufficiency.`;

  return {
    valid: true,
    cortisol,
    unit,
    threshold,
    normal,
    abnormal: !normal,
    bandLabel: normal ? 'Normal adrenal response' : 'Below threshold',
    band,
    note: NOTE,
  };
}
