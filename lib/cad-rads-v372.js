// spec-v372: CAD-RADS 2.0 (Coronary Artery Disease Reporting and Data System) category — the
// standardized coronary-CT-angiography category by maximal coronary stenosis (0-5, with 4A/4B). It
// extends the RADS family already in the catalog (BI/LI/PI/O/TI/Lung/C-RADS). "cad-rads" / "coronary cta
// category" / "coronary stenosis grade" routed to nothing.
//
// HIGH-STAKES: this reports the CAD-RADS stenosis CATEGORY the radiologist has assigned, NOT a diagnosis,
// a management order, or a prognosis (spec-v11 §5.3). The category-linked pathway (e.g. functional
// testing or invasive angiography for higher categories) is the classically taught association, not an
// order; the CAD-RADS 2.0 modifiers (N/S/G/HRP/I/E) and the plaque-burden P-score are out of scope. The
// management decision stays with the cardiology / radiology team.
//
// CATEGORIES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Cury RC, Abbara S, Achenbach S, et al. CAD-RADS 2.0 - 2022 Coronary Artery Disease Reporting and
//     Data System. J Cardiovasc Comput Tomogr. 2022;16(6):536-557.
//   - Radiology references (RadioGraphics / Radiology Assistant) reproducing the same 0-5 stenosis
//     categories with the 4A/4B split.
//
// Categories (maximal coronary stenosis on coronary CTA):
//   0  : 0% - no plaque or stenosis.
//   1  : 1-24% - minimal stenosis (non-obstructive).
//   2  : 25-49% - mild stenosis (non-obstructive).
//   3  : 50-69% - moderate stenosis (obstructive). Flagged.
//   4A : 70-99% - severe stenosis. Flagged.
//   4B : left main >= 50%, or three-vessel obstructive (>= 70%) disease. Flagged.
//   5  : 100% - total coronary occlusion. Flagged.

const CATS = {
  0: { cat: '0', obstructive: false, text: 'CAD-RADS 0 - 0% maximal stenosis; no plaque or stenosis on coronary CT angiography.' },
  1: { cat: '1', obstructive: false, text: 'CAD-RADS 1 - minimal stenosis (1-24%); non-obstructive coronary artery disease.' },
  2: { cat: '2', obstructive: false, text: 'CAD-RADS 2 - mild stenosis (25-49%); non-obstructive coronary artery disease.' },
  3: { cat: '3', obstructive: true, text: 'CAD-RADS 3 - moderate stenosis (50-69%); obstructive coronary artery disease.' },
  '4A': { cat: '4A', obstructive: true, text: 'CAD-RADS 4A - severe stenosis (70-99%).' },
  '4B': { cat: '4B', obstructive: true, text: 'CAD-RADS 4B - left main stenosis of 50% or more, or three-vessel obstructive (>= 70%) disease.' },
  5: { cat: '5', obstructive: true, text: 'CAD-RADS 5 - total coronary occlusion (100%).' },
};

const NOTE = 'CAD-RADS 2.0 (Cury 2022) standardizes the coronary-CT-angiography category by the maximal coronary stenosis. 0: 0% (no plaque). 1: 1-24% minimal. 2: 25-49% mild (non-obstructive). 3: 50-69% moderate (obstructive). 4A: 70-99% severe. 4B: left main >= 50% or three-vessel obstructive. 5: 100% occlusion. Categories 3 and above are obstructive. The category-linked pathway is the classically taught association, not an order; the CAD-RADS 2.0 modifiers (N/S/G/HRP/I/E) and the plaque-burden P-score are out of scope. This reports the category the radiologist has assigned, not a diagnosis, a management order, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 5: '5',
  '4A': '4A', '4B': '4B', 4: '4A',
};

// input:
//   category: '0'-'5' incl. '4A'/'4B' (case-insensitive; bare '4' -> 4A)
export function cadRads(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.category == null ? '' : o.category).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CATS[key];
  if (!c) {
    return { valid: false, message: 'Select the CAD-RADS category (0, 1, 2, 3, 4A, 4B, or 5).' };
  }
  return {
    valid: true,
    category: c.cat,
    obstructive: c.obstructive,
    abnormal: c.obstructive,
    bandLabel: `CAD-RADS ${c.cat}`,
    band: c.text,
    note: NOTE,
  };
}
