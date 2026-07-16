// spec-v325: ACR Lung-RADS v2022 assessment categories (lung cancer screening LDCT). The
// radiologist selects the assessment category; the tile reports the descriptor and the
// standard management recommendation. The catalog carries the BI-RADS and ACR TI-RADS
// tiles but had no Lung-RADS ("lung-rads" had zero corpus hits); lung cancer screening is
// one of the highest-volume reporting settings. "lung-rads" / "lung screening category"
// routed to nothing.
//
// HIGH-STAKES: this reports the ASSESSMENT CATEGORY the radiologist has assigned and its
// standard management, NOT a diagnosis or an order (spec-v11 §5.3). The follow-up / workup
// decision stays with the clinician and the patient.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the primary ACR table:
//   - American College of Radiology. Lung CT Screening Reporting & Data System (Lung-RADS)
//     v2022. Release date November 2022 (the official ACR assessment-category table).
//   - Christensen J, Prosper AE, Wu CC, et al. ACR Lung-RADS v2022: Assessment Categories
//     and Management Recommendations. J Am Coll Radiol / Chest. 2024 (reproduces the table).
//
// v2022 note: the ACR removed the risk-of-malignancy column, so this tile reports the
// descriptor + management (the actionable v2022 content), not a malignancy percentage.
//
// Categories:
//   0  : Incomplete.
//   1  : Negative.
//   2  : Benign (imaging features or indolent behavior).
//   3  : Probably benign.
//   4A : Suspicious.
//   4B : Very suspicious.
//   4X : category 3 or 4 with additional features increasing suspicion for lung cancer.
//   (S : modifier for significant/potentially significant non-lung-cancer findings.)

const CATEGORIES = {
  0: {
    label: 'Lung-RADS 0',
    text: 'Lung-RADS 0 — Incomplete. Prior chest CT is being located for comparison, part or all of the lungs cannot be evaluated, or findings suggest an inflammatory or infectious process. Management: comparison to a prior chest CT or additional lung cancer screening CT imaging; a 1 to 3 month LDCT for a suspected infectious or inflammatory process.',
    suspicious: false,
  },
  1: {
    label: 'Lung-RADS 1',
    text: 'Lung-RADS 1 — Negative. No lung nodules, or a nodule with benign features (complete, central, popcorn, or concentric-ring calcification, or fat-containing). Management: continue annual screening with a 12-month LDCT.',
    suspicious: false,
  },
  2: {
    label: 'Lung-RADS 2',
    text: 'Lung-RADS 2 — Benign appearance or behavior. Small or stable nodules with a very low likelihood of becoming a clinically active cancer. Management: continue annual screening with a 12-month LDCT.',
    suspicious: false,
  },
  3: {
    label: 'Lung-RADS 3',
    text: 'Lung-RADS 3 — Probably benign. Management: 6-month LDCT.',
    suspicious: false,
  },
  '4A': {
    label: 'Lung-RADS 4A',
    text: 'Lung-RADS 4A — Suspicious. Management: 3-month LDCT; PET or CT may be considered if there is a solid component of at least 8 mm.',
    suspicious: true,
  },
  '4B': {
    label: 'Lung-RADS 4B',
    text: 'Lung-RADS 4B — Very suspicious. Management: diagnostic chest CT with or without contrast; PET or CT may be considered if there is a solid component of at least 8 mm; tissue sampling; and, or, referral for further clinical evaluation, depending on the probability of malignancy and comorbidities.',
    suspicious: true,
  },
  '4X': {
    label: 'Lung-RADS 4X',
    text: 'Lung-RADS 4X — a category 3 or 4 nodule with additional features or imaging findings that increase the suspicion for lung cancer. Management: as for category 4B (diagnostic workup).',
    suspicious: true,
  },
};

const NOTE = 'ACR Lung-RADS v2022 assessment categories (lung cancer screening LDCT). 0: incomplete (comparison or additional imaging needed; 1-3 month LDCT if infectious or inflammatory). 1: negative, 12-month LDCT. 2: benign appearance or behavior, 12-month LDCT. 3: probably benign, 6-month LDCT. 4A: suspicious, 3-month LDCT (PET or CT if a solid component >= 8 mm). 4B: very suspicious, diagnostic CT, PET or CT, tissue sampling, and, or referral. 4X: a category 3 or 4 nodule with additional suspicious features, managed as 4B. An "S" modifier may be added to categories 0-4 for significant or potentially significant findings unrelated to lung cancer. v2022 removed the risk-of-malignancy column, so this reports the descriptor and management, not a malignancy percentage. The category is the radiologist final assessment; this reports its standard management, not a diagnosis or an order.';

// input:
//   category: '0' | '1' | '2' | '3' | '4A' | '4B' | '4X'
//     (case-insensitive; the sub-division letter may be upper or lower case)
export function lungRads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.category == null ? '' : o.category).trim().toUpperCase();
  const c = CATEGORIES[key];
  if (!c) {
    return { valid: false, message: 'Select the Lung-RADS category (0, 1, 2, 3, 4A, 4B, or 4X).' };
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
