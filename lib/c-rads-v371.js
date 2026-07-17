// spec-v371: C-RADS (CT Colonography Reporting and Data System) COLONIC categories (C0-C4, 2023
// update) — the standardized reporting category for the colonic findings on a CT colonography (virtual
// colonoscopy). It completes the RADS family already in the catalog (BI-RADS, LI-RADS, PI-RADS, O-RADS,
// TI-RADS, Lung-RADS). "c-rads" / "ct colonography category" / "virtual colonoscopy reporting" routed to
// nothing.
//
// HIGH-STAKES: this reports the C-RADS colonic CATEGORY the radiologist has assigned, NOT a diagnosis, a
// management order, or a prognosis (spec-v11 §5.3). The category-linked follow-up (routine screening,
// surveillance, or colonoscopy) is the classically taught association, not an order; the management
// decision stays with the radiologist and referring team. The extracolonic (E0-E4) axis is out of scope.
//
// CATEGORIES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Zalis ME, Barish MA, Choi JR, et al. CT colonography reporting and data system: a consensus
//     proposal. Radiology. 2005;236(1):3-9; and the C-RADS Version 2023 Update (Radiology 2024).
//   - Radiopaedia and radiology references reproducing the same C0-C4 colonic categories (C2 split into
//     C2a / C2b in the 2023 update).
//
// Colonic categories:
//   C0  : inadequate / incomplete study; repeat CT colonography recommended.
//   C1  : normal colon or unequivocally benign finding; routine interval screening.
//   C2a : indeterminate 6-9 mm polyp(s), fewer than three; short-term CTC follow-up or colonoscopy.
//   C2b : mass-like but likely benign stricture (e.g. diverticular); targeted follow-up. (2023 update)
//   C3  : one or more polyps >= 10 mm, or three or more 6-9 mm polyps; colonoscopy recommended. Flagged.
//   C4  : colonic mass (>= 30 mm), highly suspicious for malignancy; urgent colonoscopy / management.
//         Flagged.

const CATS = {
  C0: { cat: 'C0', actionable: false, text: 'C-RADS C0 - inadequate or incomplete study; a repeat CT colonography is recommended.' },
  C1: { cat: 'C1', actionable: false, text: 'C-RADS C1 - normal colon or an unequivocally benign finding; routine interval screening applies.' },
  C2A: { cat: 'C2a', actionable: false, text: 'C-RADS C2a - indeterminate 6-9 mm polyp(s), fewer than three; short-term CT-colonography follow-up or colonoscopy.' },
  C2B: { cat: 'C2b', actionable: false, text: 'C-RADS C2b - a mass-like but likely benign stricture (e.g. diverticular); targeted follow-up may be appropriate.' },
  C3: { cat: 'C3', actionable: true, text: 'C-RADS C3 - one or more polyps 10 mm or larger, or three or more 6-9 mm polyps; colonoscopy is recommended.' },
  C4: { cat: 'C4', actionable: true, text: 'C-RADS C4 - a colonic mass (30 mm or larger) highly suspicious for malignancy; urgent colonoscopy and further management are warranted.' },
};

const NOTE = 'C-RADS (CT Colonography Reporting and Data System; Zalis 2005, 2023 update) standardizes the colonic reporting category on a CT colonography. C0: inadequate study. C1: normal / benign. C2a: indeterminate 6-9 mm polyps (<3). C2b: mass-like likely-benign stricture. C3: polyp(s) >= 10 mm or >= 3 polyps 6-9 mm (colonoscopy). C4: colonic mass, malignant-appearing (urgent colonoscopy). The category-linked follow-up is the classically taught association, not an order. The extracolonic (E0-E4) axis is out of scope. This reports the category the radiologist has assigned, not a diagnosis, a management order, or a prognosis.';

const ALIAS = {
  C0: 'C0', C1: 'C1', C2A: 'C2A', C2B: 'C2B', C3: 'C3', C4: 'C4',
  0: 'C0', 1: 'C1', 3: 'C3', 4: 'C4',
};

// input:
//   category: 'C0' / 'C1' / 'C2a' / 'C2b' / 'C3' / 'C4' (case-insensitive; also accepts bare 0/1/3/4)
export function cRads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.category == null ? '' : o.category).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CATS[key];
  if (!c) {
    return { valid: false, message: 'Select the C-RADS colonic category (C0, C1, C2a, C2b, C3, or C4).' };
  }
  return {
    valid: true,
    category: c.cat,
    actionable: c.actionable,
    abnormal: c.actionable,
    bandLabel: `C-RADS ${c.cat}`,
    band: c.text,
    note: NOTE,
  };
}
