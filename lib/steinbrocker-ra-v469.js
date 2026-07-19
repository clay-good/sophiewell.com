// spec-v469: the Steinbrocker functional classification of rheumatoid arthritis, by global functional capacity
// for usual activities — classes I / II / III / IV. It is the classic functional-status grade and companions
// the RA disease-activity tiles (DAS28, CDAI). "steinbrocker" / "rheumatoid arthritis functional class" routed
// to nothing.
//
// HIGH-STAKES: this reports the functional CLASS the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// rheumatology team.
//
// CLASSES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Steinbrocker O, Traeger CH, Batterman RC. Therapeutic criteria in rheumatoid arthritis. JAMA.
//     1949;140(8):659-662.
//   - Rheumatology references reproducing the same complete (I) / adequate-despite-handicap (II) /
//     limited-self-care-or-occupation (III) / incapacitated (IV) functional grouping. The ACR revised the
//     wording in 1991 (self-care / vocational / avocational); this tile uses the original Steinbrocker classes.
//
// Classes (global functional capacity):
//   I   : complete functional capacity; able to carry on all usual duties without handicap.
//   II  : functional capacity adequate for normal activities despite the handicap of discomfort or limited
//         mobility of one or more joints.
//   III : functional capacity adequate to perform only little or none of the duties of the usual occupation or
//         of self-care.
//   IV  : largely or wholly incapacitated; bedridden or confined to a wheelchair, with little or no self-care.

const CLASSES = {
  I: { cls: 'I', text: 'Steinbrocker class I - complete functional capacity; able to carry on all usual duties without handicap.' },
  II: { cls: 'II', text: 'Steinbrocker class II - functional capacity adequate for normal activities despite the handicap of discomfort or limited mobility of one or more joints.' },
  III: { cls: 'III', text: 'Steinbrocker class III - functional capacity adequate to perform only little or none of the duties of the usual occupation or of self-care.' },
  IV: { cls: 'IV', text: 'Steinbrocker class IV - largely or wholly incapacitated; bedridden or confined to a wheelchair, with little or no self-care.' },
};

const NOTE = 'The Steinbrocker functional classification (Steinbrocker 1949) grades global functional capacity in rheumatoid arthritis. I: complete capacity, all usual duties. II: adequate for normal activities despite discomfort or limited joint mobility. III: adequate for little or none of the usual occupation or self-care. IV: largely or wholly incapacitated (bedridden or wheelchair-bound). The ACR revised the wording in 1991. This reports the class the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   cls: 'I'..'IV' (case-insensitive; also accepts 1-4).
export function steinbrockerRa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.cls == null ? '' : o.cls).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CLASSES[key];
  if (!c) {
    return { valid: false, message: 'Select the Steinbrocker class (I, II, III, or IV).' };
  }
  return {
    valid: true,
    cls: c.cls,
    bandLabel: `Steinbrocker class ${c.cls}`,
    band: c.text,
    note: NOTE,
  };
}
