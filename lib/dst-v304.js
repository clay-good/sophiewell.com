// spec-v304: 1-mg overnight dexamethasone suppression test (DST) interpretation
// (a catalog gap surfaced by the SESSION-40 second fresh-domain search sweep:
// "cushing screening" had no tile). Given the 8 am serum cortisol drawn after
// 1 mg dexamethasone at ~11 pm, the tile reports whether cortisol suppressed
// below the standard 1.8 µg/dL (50 nmol/L) cutoff or failed to suppress
// (consistent with possible Cushing syndrome or autonomous cortisol secretion).
//
// This reports the cited threshold's interpretation, NOT a diagnosis
// (spec-v11 §5.3) — a positive screen must be confirmed, and false positives are
// common (see the note); the diagnosis stays with the clinician.
//
// THRESHOLD RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against
// independent sources that agree on the <1.8 µg/dL (50 nmol/L) suppression cutoff:
//   - Nieman LK, Biller BMK, Findling JW, et al. The diagnosis of Cushing's
//     syndrome: an Endocrine Society Clinical Practice Guideline. J Clin
//     Endocrinol Metab. 2008;93(5):1526-1540 (post-test cortisol <1.8 µg/dL /
//     50 nmol/L is a normal response).
//   - Multiple current reviews on the 1-mg overnight DST reproduce the same
//     1.8 µg/dL (50 nmol/L) cutoff for excluding autonomous cortisol secretion.

// Standard suppression cutoff: cortisol below this suppressed normally.
const CUTOFF = { 'µg/dL': 1.8, 'nmol/L': 50 };
const UNITS = ['µg/dL', 'nmol/L'];

const NOTE = 'Overnight 1-mg dexamethasone suppression test: 1 mg dexamethasone at 11 pm, serum cortisol at 8 am. A cortisol below 1.8 µg/dL (50 nmol/L) is a normal (suppressed) response and makes Cushing syndrome unlikely; a value at or above the cutoff is a failure to suppress, consistent with possible Cushing syndrome or autonomous cortisol secretion, and must be confirmed. CAVEAT: this is a screening test with meaningful false positives — estrogen/oral contraceptives (raise CBG), CYP3A4 inducers or poor dexamethasone absorption (low serum dexamethasone), acute illness, and depression can all raise the post-test cortisol; screening people without clinical features risks over-diagnosis. This reports the cited threshold\'s interpretation, not a diagnosis; confirmation and management stay with the clinician.';

// input.cortisol: post-dexamethasone 8 am serum cortisol (number). input.unit:
// 'µg/dL' (default) or 'nmol/L'. Returns the suppression comparison and
// normal/abnormal flag (abnormal = failure to suppress).
export function dexSuppressionTest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = UNITS.includes(o.unit) ? o.unit : 'µg/dL';
  const raw = typeof o.cortisol === 'string' ? o.cortisol.trim() : o.cortisol;
  if (raw === '' || raw === undefined || raw === null) {
    return { valid: false, message: 'Enter the post-dexamethasone cortisol.' };
  }
  const cortisol = Number(raw);
  if (!Number.isFinite(cortisol) || cortisol < 0) {
    throw new RangeError('Post-dexamethasone cortisol must be a non-negative number.');
  }
  const cutoff = CUTOFF[unit];
  const suppressed = cortisol < cutoff;

  const band = suppressed
    ? `Post-dexamethasone cortisol ${cortisol} ${unit} (below ${cutoff} ${unit}): normal suppression — Cushing syndrome / autonomous cortisol secretion is unlikely.`
    : `Post-dexamethasone cortisol ${cortisol} ${unit} (at or above ${cutoff} ${unit}): failure to suppress — consistent with possible Cushing syndrome or autonomous cortisol secretion; confirm with further testing.`;

  return {
    valid: true,
    cortisol,
    unit,
    cutoff,
    suppressed,
    abnormal: !suppressed,
    bandLabel: suppressed ? 'Normal suppression' : 'Failure to suppress',
    band,
    note: NOTE,
  };
}
