// spec-v397: El Khoury (Boodhwani) repair-oriented functional classification of aortic regurgitation
// (types I / II / III), by the mechanism of the aortic insufficiency — the aortic analog of Carpentier's
// mitral classification, used to plan aortic-valve-sparing / repair surgery. It complements the Sievers
// bicuspid-aortic-valve typing shipped alongside. "el khoury" / "aortic regurgitation mechanism" routed
// to nothing.
//
// HIGH-STAKES: this reports the functional TYPE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The type
// guides the repair strategy, but that decision stays with the cardiology / cardiac-surgery team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Boodhwani M, de Kerchove L, Glineur D, et al. Repair-oriented classification of aortic
//     insufficiency: impact on surgical techniques and clinical outcomes. J Thorac Cardiovasc Surg.
//     2009;137(2):286-294 (the El Khoury type I / II / III functional classification).
//   - Cardiac-surgery / echocardiography references reproducing the same normal-motion-with-FAA-dilatation
//     (I; subtypes Ia-Id) / cusp-prolapse (II) / cusp-restriction (III) grouping.
//
// Types (mechanism of the aortic insufficiency):
//   I   : normal cusp motion with dilatation of the functional aortic annulus (FAA). Subtypes: Ia
//         (sinotubular junction / ascending aorta), Ib (aortic root / sinuses of Valsalva), Ic (annular /
//         ventriculo-aortic junction), Id (cusp perforation).
//   II  : cusp prolapse - excessive cusp motion (prolapse or free-edge fenestration).
//   III : cusp restriction - restrictive cusp motion (retraction, calcification, or thickening).

const TYPES = {
  I: { type: 'I', text: 'El Khoury type I - normal cusp motion with dilatation of the functional aortic annulus (subtypes Ia sinotubular junction, Ib aortic root, Ic annular, Id cusp perforation).' },
  II: { type: 'II', text: 'El Khoury type II - cusp prolapse: excessive cusp motion (prolapse or free-edge fenestration).' },
  III: { type: 'III', text: 'El Khoury type III - cusp restriction: restrictive cusp motion (retraction, calcification, or thickening).' },
};

const NOTE = 'The El Khoury (Boodhwani 2009) repair-oriented classification groups aortic regurgitation by mechanism, as the aortic analog of Carpentier\'s mitral classification. I: normal cusp motion with dilatation of the functional aortic annulus (subtypes Ia-Id). II: cusp prolapse (excessive motion). III: cusp restriction (restrictive motion). The type guides the repair strategy, but this reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis. Companion: the Sievers bicuspid-aortic-valve typing.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
  IA: 'I', IB: 'I', IC: 'I', ID: 'I',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3 and the Ia-Id subtypes -> I)
export function elKhouryAr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the El Khoury type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `El Khoury type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
