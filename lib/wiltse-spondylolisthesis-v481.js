// spec-v481: the Wiltse-Newman-Macnab classification of spondylolisthesis, by etiology — types I / II / III /
// IV / V. It complements the Meyerding grade (which measures the amount of slip). "wiltse" / "spondylolisthesis
// type" routed to nothing.
//
// HIGH-STAKES: this reports the etiologic TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic / spine team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Wiltse LL, Newman PH, Macnab I. Classification of spondylolysis and spondylolisthesis. Clin Orthop Relat
//     Res. 1976;(117):23-29.
//   - Spine references reproducing the same dysplastic (I) / isthmic (II) / degenerative (III) / traumatic (IV)
//     / pathologic (V) grouping. A type VI (iatrogenic / post-surgical) was added by later authors.
//
// Types (etiology):
//   I   : dysplastic - congenital dysplasia of the L5-S1 articulation permits forward slippage.
//   II  : isthmic - a lesion in the pars interarticularis (IIA lytic/fatigue fracture, IIB elongated pars,
//         IIC acute pars fracture); the most common type in younger patients.
//   III : degenerative - long-standing intersegmental instability with facet remodeling (older adults).
//   IV  : traumatic - an acute fracture of a posterior element other than the pars.
//   V   : pathologic - generalized or localized bone disease weakening the posterior elements.

const TYPES = {
  I: { type: 'I', text: 'Wiltse type I - dysplastic: congenital dysplasia of the L5-S1 articulation permits forward slippage.' },
  II: { type: 'II', text: 'Wiltse type II - isthmic: a lesion in the pars interarticularis (IIA lytic/fatigue fracture, IIB elongated pars, IIC acute pars fracture); the most common type in younger patients.' },
  III: { type: 'III', text: 'Wiltse type III - degenerative: long-standing intersegmental instability with facet remodeling (older adults).' },
  IV: { type: 'IV', text: 'Wiltse type IV - traumatic: an acute fracture of a posterior element other than the pars.' },
  V: { type: 'V', text: 'Wiltse type V - pathologic: generalized or localized bone disease weakening the posterior elements.' },
};

const NOTE = 'The Wiltse-Newman-Macnab classification (Wiltse 1976) groups spondylolisthesis by etiology. I: dysplastic (congenital). II: isthmic (pars lesion; IIA lytic, IIB elongated, IIC acute fracture). III: degenerative. IV: traumatic. V: pathologic. A type VI (iatrogenic / post-surgical) was added by later authors. It complements the Meyerding grade (amount of slip). This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   type: 'I'..'V' (case-insensitive; also accepts 1-5).
export function wiltseSpondylolisthesis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Wiltse type (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Wiltse type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
