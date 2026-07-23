// spec-v501: the Ludwig scale of female-pattern hair loss (grades I, II, III), by the degree of central
// (crown) thinning with a preserved frontal hairline. It joins the dermatology tiles; the catalog has SALT
// for alopecia areata but nothing for the pattern (androgenetic) hair loss the Ludwig scale grades. "ludwig"
// / "female pattern hair loss" routed to nothing.
//
// HIGH-STAKES: this reports the pattern GRADE the clinician has determined on examination, NOT a diagnosis of
// androgenetic alopecia, an exclusion of other causes of hair loss, or a treatment decision (spec-v11 section
// 5.3). The workup and management decision stay with the treating clinician.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Ludwig E. Classification of the types of androgenetic alopecia (common baldness) occurring in the
//     female sex. Br J Dermatol. 1977;97(3):247-254.
//   - Dermatology references reproducing the same perceptible (I) / pronounced (II) / bald-crown (III)
//     central thinning with a retained frontal fringe.
//
// Grades (increasing central thinning, the frontal hairline preserved throughout):
//   I   : perceptible thinning of the hair on the crown, limited in front by a line about 1-3 cm behind the
//         frontal hairline.
//   II  : pronounced thinning of the hair on the crown within the same area.
//   III : full baldness (total denudation) within the same area on the crown.

const GRADES = {
  I: { grade: 'I', text: 'Ludwig grade I - perceptible thinning of the hair on the crown, limited in front by a line about 1-3 cm behind the frontal hairline.' },
  II: { grade: 'II', text: 'Ludwig grade II - pronounced thinning of the hair on the crown within that same area.' },
  III: { grade: 'III', text: 'Ludwig grade III - full baldness (total denudation) within that same area on the crown.' },
};

const NOTE = 'The Ludwig scale (Ludwig 1977) grades female-pattern (androgenetic) hair loss by the degree of central crown thinning, with the frontal hairline preserved throughout. I: perceptible thinning of the crown behind a retained frontal fringe. II: pronounced thinning within that area. III: full baldness within that area. This reports the pattern grade the clinician has determined on examination, not a diagnosis of androgenetic alopecia, an exclusion of other causes of hair loss, or a treatment decision.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   grade: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function ludwigHairloss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Ludwig grade (I, II, or III).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Ludwig grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
