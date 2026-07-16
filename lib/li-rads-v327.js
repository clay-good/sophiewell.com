// spec-v327: ACR LI-RADS v2018 CT/MRI diagnostic categories (liver observations in
// patients at risk for HCC). The radiologist selects the category; the tile reports the
// descriptor and a general management direction. The catalog carries HCC risk/staging tiles
// (milan-criteria, bclc-hcc, galad-hcc, etc.) but had no LI-RADS imaging category system
// ("li-rads" had zero corpus hits); it is the standard HCC-imaging reporting system and the
// liver peer of the -RADS cluster. "li-rads" / "liver imaging category" routed to nothing.
//
// HIGH-STAKES: this reports the DIAGNOSTIC CATEGORY the radiologist has assigned and its
// general management, NOT a diagnosis or an order (spec-v11 §5.3). The workup/treatment
// decision stays with the multidisciplinary team.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Chernyak V, Fowler KJ, Kamaya A, et al. Liver Imaging Reporting and Data System
//     (LI-RADS) Version 2018: Imaging of Hepatocellular Carcinoma in At-Risk Patients.
//     Radiology. 2018;289(3):816-830 (the ACR LI-RADS v2018 CT/MRI algorithm).
//   - ACR RADS support diagnostic-categories material, which agrees on LR-1 through LR-5
//     plus LR-M, LR-TIV, and LR-NC.
//
// CT/MRI diagnostic categories:
//   LR-1  : definitely benign.
//   LR-2  : probably benign.
//   LR-3  : intermediate probability of malignancy.
//   LR-4  : probably HCC.
//   LR-5  : definitely HCC.
//   LR-M  : probably or definitely malignant, not HCC specific.
//   LR-TIV: definite tumor in vein.
//   LR-NC : not categorizable (image degradation or omission).

const CATEGORIES = {
  'LR-1': {
    label: 'LR-1',
    text: 'LR-1 — definitely benign. Management: continue routine surveillance imaging per the program.',
    malignant: false,
  },
  'LR-2': {
    label: 'LR-2',
    text: 'LR-2 — probably benign. Management: continue routine surveillance imaging per the program.',
    malignant: false,
  },
  'LR-3': {
    label: 'LR-3',
    text: 'LR-3 — intermediate probability of malignancy. Management: repeat or alternative diagnostic imaging in 3 to 6 months, with multidisciplinary discussion as needed.',
    malignant: false,
  },
  'LR-4': {
    label: 'LR-4',
    text: 'LR-4 — probably HCC. Management: multidisciplinary discussion; often additional imaging, biopsy, or treatment.',
    malignant: true,
  },
  'LR-5': {
    label: 'LR-5',
    text: 'LR-5 — definitely HCC. Management: may be treated as HCC without biopsy after multidisciplinary discussion.',
    malignant: true,
  },
  'LR-M': {
    label: 'LR-M',
    text: 'LR-M — probably or definitely malignant, but not HCC specific. Management: multidisciplinary discussion; biopsy is often considered.',
    malignant: true,
  },
  'LR-TIV': {
    label: 'LR-TIV',
    text: 'LR-TIV — definite tumor in vein. Management: multidisciplinary discussion.',
    malignant: true,
  },
  'LR-NC': {
    label: 'LR-NC',
    text: 'LR-NC — not categorizable because of image degradation or omission. Management: repeat or alternative imaging.',
    malignant: false,
  },
};

const NOTE = 'ACR LI-RADS v2018 CT/MRI diagnostic categories (liver observations in patients at risk for HCC). LR-1: definitely benign. LR-2: probably benign. LR-3: intermediate probability of malignancy (repeat or alternative imaging in 3 to 6 months). LR-4: probably HCC. LR-5: definitely HCC (may be treated as HCC without biopsy after multidisciplinary discussion). LR-M: probably or definitely malignant, not HCC specific (biopsy often considered). LR-TIV: definite tumor in vein. LR-NC: not categorizable. The category is assigned from observation size and major features (non-rim arterial-phase hyperenhancement, non-peripheral washout, enhancing capsule, threshold growth). This reports the category and its general management, not a diagnosis or an order, which stay with the multidisciplinary team.';

const ALIAS = { 1: 'LR-1', 2: 'LR-2', 3: 'LR-3', 4: 'LR-4', 5: 'LR-5', M: 'LR-M', TIV: 'LR-TIV', NC: 'LR-NC' };

// input:
//   category: 'LR-1' .. 'LR-5', 'LR-M', 'LR-TIV', 'LR-NC'
//     (case-insensitive; also accepts the bare 1-5 / M / TIV / NC and forms without the dash)
export function liRads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let raw = String(o.category == null ? '' : o.category).trim().toUpperCase().replace(/\s+/g, '');
  // Normalize "LR5"/"LRM" -> "LR-5"/"LR-M", and bare "5"/"M" via the alias table.
  let key = raw.replace(/^LR-?/, '');
  key = ALIAS[key] || (CATEGORIES[raw] ? raw : undefined);
  const c = key && CATEGORIES[key];
  if (!c) {
    return { valid: false, message: 'Select the LI-RADS category (LR-1, LR-2, LR-3, LR-4, LR-5, LR-M, LR-TIV, or LR-NC).' };
  }
  return {
    valid: true,
    category: key,
    malignant: c.malignant,
    abnormal: c.malignant,
    bandLabel: c.label,
    band: c.text,
    note: NOTE,
  };
}
