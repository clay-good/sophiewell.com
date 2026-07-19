// spec-v479: the Spitz classification of esophageal atresia, by birth weight and the presence of major
// congenital cardiac disease — groups I / II / III. It is the standard risk grouping in the neonatal-surgery
// literature and joins the neonatology tiles. "spitz" / "esophageal atresia group" routed to nothing.
//
// HIGH-STAKES: this reports the risk GROUP the clinician has determined from the birth weight and cardiac
// status, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// management decision stays with the neonatal / pediatric-surgery team.
//
// GROUPS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Spitz L, Kiely EM, Morecroft JA, Drake DP. Oesophageal atresia: at-risk groups for the 1990s.
//     J Pediatr Surg. 1994;29(6):723-725.
//   - Neonatal-surgery references reproducing the same weight->=1500g-and-no-cardiac (I) / one-risk-factor (II)
//     / both-risk-factors (III) grouping.
//
// Groups (birth weight + major cardiac disease):
//   I   : birth weight 1500 g or more AND no major congenital cardiac disease.
//   II  : birth weight less than 1500 g OR major congenital cardiac disease.
//   III : birth weight less than 1500 g AND major congenital cardiac disease.

const GROUPS = {
  I: { group: 'I', text: 'Spitz group I - birth weight 1500 g or more and no major congenital cardiac disease.' },
  II: { group: 'II', text: 'Spitz group II - birth weight less than 1500 g, or major congenital cardiac disease.' },
  III: { group: 'III', text: 'Spitz group III - birth weight less than 1500 g and major congenital cardiac disease.' },
};

const NOTE = 'The Spitz classification (Spitz 1994) groups esophageal atresia by birth weight and major congenital cardiac disease. I: birth weight 1500 g or more and no major cardiac disease. II: birth weight less than 1500 g, or major cardiac disease. III: birth weight less than 1500 g and major cardiac disease. This reports the group the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   group: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function spitzAtresia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.group == null ? '' : o.group).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GROUPS[key];
  if (!g) {
    return { valid: false, message: 'Select the Spitz group (I, II, or III).' };
  }
  return {
    valid: true,
    group: g.group,
    bandLabel: `Spitz group ${g.group}`,
    band: g.text,
    note: NOTE,
  };
}
