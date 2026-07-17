// spec-v367: Penetration-Aspiration Scale (PAS, Rosenbek 1996) — the standard 8-point ordinal scale for
// the depth of airway invasion during a swallow study (videofluoroscopy / FEES), used by speech-language
// pathologists. The catalog carries dysphagia SCREENS (GUSS, EAT-10) but not the PAS airway-invasion
// grade. "penetration aspiration scale" / "rosenbek scale" / "pas score swallow" routed to nothing.
//
// HIGH-STAKES: this reports the PAS SCORE the clinician has determined from the swallow study, NOT a
// diagnosis, a diet/management decision, or a prognosis (spec-v11 §5.3). A single worst-score per bolus
// does not capture the whole study; the management decision stays with the speech-language pathologist
// and team.
//
// LEVELS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Rosenbek JC, Robbins JA, Roecker EB, Coyle JL, Wood JL. A penetration-aspiration scale. Dysphagia.
//     1996;11(2):93-98 (the original 8-point scale).
//   - Speech-language-pathology references reproducing the same 1-8 airway-invasion definitions and the
//     penetration (2-5) / aspiration (6-8) grouping.
//
// Scores (airway invasion during the swallow; higher = worse):
//   1 : material does not enter the airway. No airway invasion.
//   2 : enters the airway, remains above the vocal folds, and is ejected. Penetration.
//   3 : enters the airway, remains above the vocal folds, and is not ejected. Penetration.
//   4 : enters the airway, contacts the vocal folds, and is ejected. Penetration.
//   5 : enters the airway, contacts the vocal folds, and is not ejected. Penetration.
//   6 : passes below the vocal folds and is ejected into the larynx or out of the airway. Aspiration.
//   7 : passes below the vocal folds and is not ejected despite effort. Aspiration.
//   8 : passes below the vocal folds and no effort is made to eject. Silent aspiration.

const SCORES = {
  1: { score: 1, category: 'no airway invasion', text: 'PAS 1 - material does not enter the airway.' },
  2: { score: 2, category: 'penetration', text: 'PAS 2 - material enters the airway, remains above the vocal folds, and is ejected from the airway.' },
  3: { score: 3, category: 'penetration', text: 'PAS 3 - material enters the airway, remains above the vocal folds, and is not ejected.' },
  4: { score: 4, category: 'penetration', text: 'PAS 4 - material enters the airway, contacts the vocal folds, and is ejected.' },
  5: { score: 5, category: 'penetration', text: 'PAS 5 - material enters the airway, contacts the vocal folds, and is not ejected.' },
  6: { score: 6, category: 'aspiration', text: 'PAS 6 - material passes below the vocal folds and is ejected into the larynx or out of the airway.' },
  7: { score: 7, category: 'aspiration', text: 'PAS 7 - material passes below the vocal folds and is not ejected despite effort.' },
  8: { score: 8, category: 'silent aspiration', text: 'PAS 8 - material passes below the vocal folds and no effort is made to eject it (silent aspiration).' },
};

const NOTE = 'The Penetration-Aspiration Scale (Rosenbek 1996) grades the depth of airway invasion during a swallow study (videofluoroscopy or FEES) on an 8-point ordinal scale. 1: no airway invasion. 2-5: penetration (material above or at the level of the vocal folds). 6-8: aspiration (material passes below the vocal folds). 8: silent aspiration (no effort to eject). A single worst-score per bolus does not capture the whole study. This reports the score the clinician has determined, not a diagnosis, a diet/management decision, or a prognosis.';

const ALIAS = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8' };

// input:
//   score: 1-8 (string or number)
export function pasSwallow(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.score == null ? '' : o.score).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = SCORES[key];
  if (!s) {
    return { valid: false, message: 'Select the PAS score (1 to 8).' };
  }
  const aspiration = s.score >= 6;
  return {
    valid: true,
    score: s.score,
    category: s.category,
    aspiration,
    abnormal: aspiration,
    bandLabel: `PAS ${s.score}`,
    band: `${s.text} ${s.category === 'no airway invasion' ? 'No airway invasion.' : s.category === 'penetration' ? 'Penetration.' : s.category === 'aspiration' ? 'Aspiration.' : 'Silent aspiration.'}`,
    note: NOTE,
  };
}
