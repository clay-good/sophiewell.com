// spec-v451: the Sade classification of pars tensa tympanic-membrane retraction, by the depth of the
// retraction pocket on otoscopy — grades I / II / III / IV. It is a standard grading in otology.
// "sade retraction" / "tympanic membrane retraction grade" routed to nothing.
//
// This tile grades PARS TENSA retraction (the Sade grading). Pars flaccida (attic) retraction is graded
// separately (the Tos classification); that scheme is not reported here.
//
// HIGH-STAKES: this reports the otoscopy GRADE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// otolaryngology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Sade J, Berco E. Atelectasis and secretory otitis media. Ann Otol Rhinol Laryngol. 1976;85(2 Suppl 25
//     Pt 2):66-72.
//   - Otology references reproducing the same mild (I) / touching-incus (II) / touching-promontory (III) /
//     adherent (IV) retraction grouping.
//
// Grades (pars tensa retraction):
//   I   : mild (slight) retraction of the pars tensa; not touching the incus.
//   II  : retraction with the tympanic membrane touching the incus or stapes.
//   III : retraction touching the promontory (atelectasis) but not adherent to it.
//   IV  : adhesion of the tympanic membrane to the promontory (adhesive otitis media).

const GRADES = {
  I: { grade: 'I', text: 'Sade grade I - mild (slight) retraction of the pars tensa; not touching the incus.' },
  II: { grade: 'II', text: 'Sade grade II - retraction with the tympanic membrane touching the incus or stapes.' },
  III: { grade: 'III', text: 'Sade grade III - retraction touching the promontory (atelectasis) but not adherent to it.' },
  IV: { grade: 'IV', text: 'Sade grade IV - adhesion of the tympanic membrane to the promontory (adhesive otitis media).' },
};

const NOTE = 'The Sade classification (Sade & Berco 1976) grades pars tensa tympanic-membrane retraction by the depth of the retraction pocket. I: mild, not touching the incus. II: touching the incus or stapes. III: touching the promontory (atelectasis) but not adherent. IV: adherent to the promontory (adhesive otitis media). Pars flaccida (attic) retraction is graded separately (Tos). This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function sadeRetraction(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Sade grade (I, II, III, or IV).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Sade grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
