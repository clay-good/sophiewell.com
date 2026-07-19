// spec-v445: the Revised Atlanta classification of acute pancreatitis SEVERITY, by the presence and duration
// of organ failure and of local/systemic complications — mild / moderately severe / severe. It is the
// standard severity classification, distinct from the prediction scores (ranson-bisap) and the organ-failure
// score. "atlanta pancreatitis severity" / "moderately severe pancreatitis" routed to nothing.
//
// HIGH-STAKES: this reports the severity CATEGORY the clinician has determined from the clinical course, NOT
// a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Persistent
// organ failure is defined at > 48 hours; the assessment and management stay with the treating team.
//
// CATEGORIES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Banks PA, Bollen TL, Dervenis C, et al; Acute Pancreatitis Classification Working Group. Classification
//     of acute pancreatitis -- 2012: revision of the Atlanta classification by international consensus. Gut.
//     2013;62(1):102-111.
//   - Gastroenterology / critical-care references reproducing the same mild (no organ failure, no
//     complications) / moderately severe (transient organ failure and/or complications) / severe (persistent
//     organ failure) grouping.
//
// Categories (severity):
//   mild               : no organ failure and no local or systemic complications.
//   moderately-severe  : transient organ failure (resolving within 48 hours) and/or local or systemic
//                        complications, without persistent organ failure.
//   severe             : persistent organ failure (> 48 hours), single or multiple.

const CATEGORIES = {
  MILD: { category: 'mild', text: 'Revised Atlanta: mild acute pancreatitis - no organ failure and no local or systemic complications.' },
  'MODERATELY-SEVERE': { category: 'moderately severe', text: 'Revised Atlanta: moderately severe acute pancreatitis - transient organ failure (resolving within 48 hours) and/or local or systemic complications, without persistent organ failure.' },
  SEVERE: { category: 'severe', text: 'Revised Atlanta: severe acute pancreatitis - persistent organ failure (more than 48 hours), single or multiple.' },
};

const NOTE = 'The Revised Atlanta classification (Banks 2013) grades acute pancreatitis severity. Mild: no organ failure, no complications. Moderately severe: transient organ failure (resolving within 48 h) and/or local or systemic complications. Severe: persistent organ failure (> 48 h). This reports the severity category the clinician has determined from the clinical course, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  MILD: 'MILD', '1': 'MILD',
  'MODERATELY-SEVERE': 'MODERATELY-SEVERE', 'MODERATELY SEVERE': 'MODERATELY-SEVERE', MODERATE: 'MODERATELY-SEVERE', '2': 'MODERATELY-SEVERE',
  SEVERE: 'SEVERE', '3': 'SEVERE',
};

// input:
//   severity: 'mild' / 'moderately-severe' / 'severe' (case-insensitive; also accepts 1-3).
export function atlantaPancreatitis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.severity == null ? '' : o.severity).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CATEGORIES[key];
  if (!c) {
    return { valid: false, message: 'Select the Revised Atlanta severity (mild, moderately-severe, or severe).' };
  }
  return {
    valid: true,
    category: c.category,
    bandLabel: `Revised Atlanta: ${c.category}`,
    band: c.text,
    note: NOTE,
  };
}
