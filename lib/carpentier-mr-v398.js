// spec-v398: Carpentier functional classification of mitral regurgitation (types I / II / IIIa / IIIb),
// by the motion of the mitral leaflets — the "French correction" (Carpentier 1983) that the El Khoury
// aortic-regurgitation classification shipped alongside is explicitly the aortic analog of. It groups the
// mechanism of the regurgitation to plan mitral-valve repair. "carpentier" / "mitral regurgitation
// mechanism" routed to nothing.
//
// HIGH-STAKES: this reports the functional TYPE the clinician has determined from the echocardiogram, NOT
// a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The type
// guides the repair strategy, but that decision stays with the cardiology / cardiac-surgery team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Carpentier A. Cardiac valve surgery — the "French correction". J Thorac Cardiovasc Surg.
//     1983;86(3):323-337 (the type I / II / III functional classification of mitral regurgitation).
//   - Cardiology / cardiac-surgery / echocardiography references reproducing the same
//     normal-motion (I) / excessive-motion (II) / restricted-motion (III, split IIIa structural and
//     IIIb functional) grouping.
//
// Types (motion of the mitral leaflets):
//   I    : normal leaflet motion. MR from annular dilatation or leaflet perforation (e.g. functional
//          annular dilatation, endocarditis perforation, a congenital cleft).
//   II   : excessive leaflet motion — leaflet prolapse or flail (chordal or papillary-muscle rupture or
//          elongation, e.g. myxomatous / Barlow degeneration).
//   IIIa : restricted leaflet motion in both systole and diastole (structural restriction, e.g. rheumatic
//          leaflet thickening / retraction or chordal fusion).
//   IIIb : restricted leaflet motion in systole only (functional restriction from papillary-muscle
//          displacement and leaflet tethering, e.g. ischemic or dilated cardiomyopathy).

const TYPES = {
  I: { type: 'I', text: 'Carpentier type I - normal leaflet motion; mitral regurgitation from annular dilatation or leaflet perforation (e.g. functional annular dilatation, endocarditis perforation, or a congenital cleft).' },
  II: { type: 'II', text: 'Carpentier type II - excessive leaflet motion: leaflet prolapse or flail (chordal or papillary-muscle rupture or elongation, e.g. myxomatous / Barlow degeneration).' },
  IIIA: { type: 'IIIa', text: 'Carpentier type IIIa - restricted leaflet motion in both systole and diastole (structural restriction, e.g. rheumatic leaflet thickening / retraction or chordal fusion).' },
  IIIB: { type: 'IIIb', text: 'Carpentier type IIIb - restricted leaflet motion in systole only (functional restriction from papillary-muscle displacement and leaflet tethering, e.g. ischemic or dilated cardiomyopathy).' },
};

const NOTE = 'Carpentier\'s functional classification (the "French correction", 1983) groups mitral regurgitation by leaflet motion, to plan mitral-valve repair, and is the mitral analog of the El Khoury aortic-regurgitation classification. I: normal motion (annular dilatation or perforation). II: excessive motion (prolapse or flail). IIIa: restricted motion in both systole and diastole (structural, e.g. rheumatic). IIIb: restricted motion in systole only (functional / ischemic). The type guides the repair strategy, but this reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis. Companion: the El Khoury aortic-regurgitation classification.';

const ALIAS = {
  I: 'I', II: 'II', IIIA: 'IIIA', IIIB: 'IIIB',
  1: 'I', 2: 'II',
  '3A': 'IIIA', '3B': 'IIIB',
};

// input:
//   type: 'I' / 'II' / 'IIIa' / 'IIIb' (case-insensitive; also accepts 1, 2, 3a, 3b). Bare 'III' is
//   ambiguous and returns invalid — the clinician must specify IIIa (structural) or IIIb (functional).
export function carpentierMr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Carpentier type (I, II, IIIa, or IIIb).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Carpentier type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
