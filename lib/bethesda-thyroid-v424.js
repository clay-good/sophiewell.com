// spec-v424: the Bethesda System for Reporting Thyroid Cytopathology, the standardized six-category scheme a
// cytopathologist reports on a thyroid fine-needle-aspiration (FNA) specimen — categories I / II / III / IV /
// V / VI. It is the near-universal reporting scheme for thyroid FNA. "bethesda thyroid" /
// "thyroid cytology category" routed to nothing.
//
// This tile reports the diagnostic CATEGORY and its cytologic meaning. It does NOT report the
// (edition-dependent) implied risk-of-malignancy percentage or the recommended management, which vary by
// edition (2017 second edition vs 2023 third edition) and by institution.
//
// HIGH-STAKES: this reports the diagnostic category the cytopathologist has assigned, NOT a diagnosis of
// thyroid cancer, a risk estimate, a treatment/surgery decision, or a prognosis (spec-v11 §5.3). The
// diagnostic and management decisions stay with the pathology / endocrinology / surgery team.
//
// CATEGORIES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Cibas ES, Ali SZ. The 2017 Bethesda System for Reporting Thyroid Cytopathology. Thyroid.
//     2017;27(11):1341-1346.
//   - Pathology / endocrinology references reproducing the same six-category (I nondiagnostic /
//     II benign / III AUS / IV follicular neoplasm / V suspicious-for-malignancy / VI malignant) scheme.
//     The third edition (Ali et al, 2023) keeps the same six categories.
//
// Categories:
//   I   : nondiagnostic or unsatisfactory.
//   II  : benign.
//   III : atypia of undetermined significance (AUS) / follicular lesion of undetermined significance (FLUS).
//   IV  : follicular neoplasm or suspicious for a follicular neoplasm.
//   V   : suspicious for malignancy.
//   VI  : malignant.

const CATEGORIES = {
  I: { category: 'I', text: 'Bethesda category I - nondiagnostic or unsatisfactory.' },
  II: { category: 'II', text: 'Bethesda category II - benign.' },
  III: { category: 'III', text: 'Bethesda category III - atypia of undetermined significance (AUS) / follicular lesion of undetermined significance (FLUS).' },
  IV: { category: 'IV', text: 'Bethesda category IV - follicular neoplasm or suspicious for a follicular neoplasm.' },
  V: { category: 'V', text: 'Bethesda category V - suspicious for malignancy.' },
  VI: { category: 'VI', text: 'Bethesda category VI - malignant.' },
};

const NOTE = 'The Bethesda System for Reporting Thyroid Cytopathology (Cibas & Ali 2017) is the standardized six-category scheme for a thyroid FNA. I: nondiagnostic or unsatisfactory. II: benign. III: atypia of undetermined significance (AUS/FLUS). IV: follicular neoplasm or suspicious for one. V: suspicious for malignancy. VI: malignant. This reports the category the cytopathologist has assigned and its cytologic meaning, not the (edition-dependent) implied risk of malignancy, the recommended management, or a diagnosis of thyroid cancer.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
};

// input:
//   category: 'I'..'VI' (case-insensitive; also accepts 1-6).
export function bethesdaThyroid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.category == null ? '' : o.category).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CATEGORIES[key];
  if (!c) {
    return { valid: false, message: 'Select the Bethesda thyroid category (I, II, III, IV, V, or VI).' };
  }
  return {
    valid: true,
    category: c.category,
    bandLabel: `Bethesda category ${c.category}`,
    band: c.text,
    note: NOTE,
  };
}
