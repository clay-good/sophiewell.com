// spec-v322: ACR BI-RADS assessment categories (breast imaging). The radiologist selects
// the final assessment category (0-6, with the 4A/4B/4C sub-divisions); the tile reports
// the category, its likelihood-of-malignancy band, and the standard management. The catalog
// carries the ACR TI-RADS thyroid tile (acr-tirads) but had no BI-RADS; it is one of the
// most widely used imaging reporting systems. "bi-rads" / "breast imaging category" routed
// to nothing.
//
// HIGH-STAKES: this reports the ASSESSMENT CATEGORY the radiologist has assigned and its
// standard management, NOT a diagnosis or an order (spec-v11 §5.3). The biopsy / follow-up
// decision stays with the clinician and the patient.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - D'Orsi CJ, Sickles EA, Mendelson EB, Morris EA, et al. ACR BI-RADS Atlas, Breast
//     Imaging Reporting and Data System. 5th ed. Reston, VA: American College of Radiology
//     (ACR); 2013.
//   - StatPearls (NBK459169) and the ACR BI-RADS category definitions, which agree on the
//     0-6 categories and the 4A/4B/4C likelihood bands.
//
// Categories (likelihood of malignancy in parentheses):
//   0  : incomplete -- need additional imaging and/or prior comparison.
//   1  : negative (~0%).
//   2  : benign (~0%).
//   3  : probably benign (> 0% to <= 2%) -- short-interval follow-up.
//   4  : suspicious (> 2% to < 95%) -- tissue diagnosis (biopsy).
//   4A : low suspicion (> 2% to <= 10%).
//   4B : moderate suspicion (> 10% to <= 50%).
//   4C : high suspicion (> 50% to < 95%).
//   5  : highly suggestive of malignancy (>= 95%) -- biopsy.
//   6  : known biopsy-proven malignancy.

const CATEGORIES = {
  0: {
    label: 'BI-RADS 0',
    text: 'BI-RADS 0 — incomplete assessment. Need additional imaging evaluation (e.g. spot compression, magnification, or ultrasound) and/or comparison with prior mammograms before a final category is assigned.',
    suspicious: false,
  },
  1: {
    label: 'BI-RADS 1',
    text: 'BI-RADS 1 — negative (essentially 0% likelihood of malignancy). Routine screening. No mass, suspicious calcification, or architectural distortion.',
    suspicious: false,
  },
  2: {
    label: 'BI-RADS 2',
    text: 'BI-RADS 2 — benign (essentially 0% likelihood of malignancy). Routine screening. A definitely benign finding (e.g. simple cyst, calcified fibroadenoma, intramammary lymph node).',
    suspicious: false,
  },
  3: {
    label: 'BI-RADS 3',
    text: 'BI-RADS 3 — probably benign (greater than 0% but no more than 2% likelihood of malignancy). Short-interval (usually 6-month) follow-up to establish stability.',
    suspicious: false,
  },
  4: {
    label: 'BI-RADS 4',
    text: 'BI-RADS 4 — suspicious (greater than 2% to less than 95% likelihood of malignancy). Tissue diagnosis (biopsy) is recommended. May be sub-divided 4A, 4B, 4C.',
    suspicious: true,
  },
  '4A': {
    label: 'BI-RADS 4A',
    text: 'BI-RADS 4A — low suspicion for malignancy (greater than 2% to no more than 10% likelihood). Tissue diagnosis (biopsy) is recommended.',
    suspicious: true,
  },
  '4B': {
    label: 'BI-RADS 4B',
    text: 'BI-RADS 4B — moderate suspicion for malignancy (greater than 10% to no more than 50% likelihood). Tissue diagnosis (biopsy) is recommended.',
    suspicious: true,
  },
  '4C': {
    label: 'BI-RADS 4C',
    text: 'BI-RADS 4C — high suspicion for malignancy (greater than 50% to less than 95% likelihood). Tissue diagnosis (biopsy) is recommended.',
    suspicious: true,
  },
  5: {
    label: 'BI-RADS 5',
    text: 'BI-RADS 5 — highly suggestive of malignancy (at least 95% likelihood). Tissue diagnosis (biopsy) is recommended; appropriate action should be taken.',
    suspicious: true,
  },
  6: {
    label: 'BI-RADS 6',
    text: 'BI-RADS 6 — known biopsy-proven malignancy. Assessment used before or during definitive therapy; surgical excision when clinically appropriate.',
    suspicious: true,
  },
};

const NOTE = 'ACR BI-RADS assessment categories (5th ed, 2013). 0: incomplete, need more imaging or prior comparison. 1: negative (~0%). 2: benign (~0%). 3: probably benign (> 0% to <= 2%), short-interval follow-up. 4: suspicious (> 2% to < 95%), biopsy, sub-divided 4A (> 2% to <= 10%), 4B (> 10% to <= 50%), 4C (> 50% to < 95%). 5: highly suggestive of malignancy (>= 95%), biopsy. 6: known biopsy-proven malignancy. The category is the radiologist final assessment; this reports its standard likelihood band and management, not a diagnosis or an order, which stay with the clinician and the patient.';

// input:
//   category: '0' | '1' | '2' | '3' | '4' | '4A' | '4B' | '4C' | '5' | '6'
//     (case-insensitive; the sub-division letter may be upper or lower case)
export function biRads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.category == null ? '' : o.category).trim().toUpperCase();
  const c = CATEGORIES[key];
  if (!c) {
    return { valid: false, message: 'Select the BI-RADS category (0, 1, 2, 3, 4, 4A, 4B, 4C, 5, or 6).' };
  }
  return {
    valid: true,
    category: key,
    suspicious: c.suspicious,
    abnormal: c.suspicious,
    bandLabel: c.label,
    band: c.text,
    note: NOTE,
  };
}
