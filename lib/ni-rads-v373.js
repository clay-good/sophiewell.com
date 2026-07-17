// spec-v373: NI-RADS (Neck Imaging Reporting and Data System) category (1-4, with 2A/2B) — the ACR
// structured category for POST-TREATMENT surveillance imaging in head-and-neck cancer, assigned
// separately to the primary site and the neck (nodes). It completes the RADS family already in the
// catalog (BI/LI/PI/O/TI/Lung/C/CAD-RADS). "ni-rads" / "neck imaging reporting" / "head and neck cancer
// surveillance category" routed to nothing.
//
// HIGH-STAKES: this reports the NI-RADS CATEGORY the radiologist has assigned, NOT a diagnosis, a
// management order, or a prognosis (spec-v11 §5.3). NI-RADS is for surveillance AFTER definitive
// treatment (not during treatment); the category-linked pathway (routine surveillance, short-interval
// imaging, biopsy, or clinical management) is the classically taught association, not an order. The
// management decision stays with the head-and-neck oncology / radiology team.
//
// CATEGORIES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Aiken AH, Rath TJ, Anzai Y, et al. ACR Neck Imaging Reporting and Data Systems (NI-RADS): A White
//     Paper of the ACR NI-RADS Committee. J Am Coll Radiol. 2018;15(8):1097-1108.
//   - Radiology references reproducing the same 1-4 categories with the 2A (mucosal) / 2B (deep) split.
//
// Categories (level of suspicion for recurrence; assigned separately to primary site and neck):
//   1  : no evidence of recurrence; expected post-treatment change. Routine surveillance.
//   2A : low suspicion, mucosal / superficial abnormality. Direct visual inspection or short-interval
//        follow-up.
//   2B : low suspicion, deep abnormality. Short-interval follow-up imaging.
//   3  : high suspicion (new or enlarging lesion). Biopsy if clinically indicated. Flagged.
//   4  : definite recurrence (biopsy-proven or unequivocal). Clinical management. Flagged.

const CATS = {
  1: { cat: '1', suspicious: false, text: 'NI-RADS 1 - no evidence of recurrence; expected post-treatment change. Routine surveillance.' },
  '2A': { cat: '2A', suspicious: false, text: 'NI-RADS 2A - low suspicion, mucosal or superficial abnormality; direct visual inspection or short-interval follow-up.' },
  '2B': { cat: '2B', suspicious: false, text: 'NI-RADS 2B - low suspicion, deep abnormality; short-interval follow-up imaging.' },
  3: { cat: '3', suspicious: true, text: 'NI-RADS 3 - high suspicion for recurrence (new or enlarging lesion); biopsy if clinically indicated.' },
  4: { cat: '4', suspicious: true, text: 'NI-RADS 4 - definite recurrence (biopsy-proven or unequivocal imaging); clinical management.' },
};

const NOTE = 'NI-RADS (ACR Neck Imaging Reporting and Data System; Aiken 2018) is a structured category for POST-TREATMENT head-and-neck-cancer surveillance imaging, assigned separately to the primary site and the neck (nodes). 1: no evidence of recurrence (routine surveillance). 2A: low suspicion, mucosal (visual inspection / short-interval). 2B: low suspicion, deep (short-interval imaging). 3: high suspicion (biopsy if indicated). 4: definite recurrence (clinical management). It is for surveillance after definitive treatment, not during treatment; the category-linked pathway is the classically taught association, not an order. This reports the category the radiologist has assigned, not a diagnosis, a management order, or a prognosis.';

const ALIAS = {
  1: '1', '2A': '2A', '2B': '2B', 3: '3', 4: '4',
  2: '2A',
};

// input:
//   category: '1' / '2A' / '2B' / '3' / '4' (case-insensitive; bare '2' -> 2A)
export function niRads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.category == null ? '' : o.category).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CATS[key];
  if (!c) {
    return { valid: false, message: 'Select the NI-RADS category (1, 2A, 2B, 3, or 4).' };
  }
  return {
    valid: true,
    category: c.cat,
    suspicious: c.suspicious,
    abnormal: c.suspicious,
    bandLabel: `NI-RADS ${c.cat}`,
    band: c.text,
    note: NOTE,
  };
}
