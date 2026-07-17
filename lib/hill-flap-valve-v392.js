// spec-v392: Hill classification of the gastroesophageal flap valve (grades I-IV), graded endoscopically
// from a retroflexed view of the cardia — the standard endoscopic description of the flap-valve /
// esophagogastric-junction competence, which correlates with hiatal hernia and GERD. It sits beside the
// GI-endoscopy tiles (Los Angeles esophagitis, Prague, Forrest) in the catalog. "hill grade" /
// "gastroesophageal flap valve" routed to nothing.
//
// HIGH-STAKES: this reports the Hill GRADE the endoscopist has determined on retroflexion, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Grades III-IV
// are the classically abnormal (flap-valve-incompetent) grades, but the management decision stays with the
// treating team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Hill LD, Kozarek RA, Kraemer SJ, et al. The gastroesophageal flap valve: in vitro and in vivo
//     observations. Gastrointest Endosc. 1996;44(5):541-547 (the I-IV grading on retroflexion).
//   - GI-endoscopy references reproducing the same ridge / approximation / hiatal-hernia associations
//     (grades I-II without hernia, III-IV with hernia).
//
// Grades (appearance of the flap valve / ridge at the cardia on retroflexion):
//   I   : a prominent ridge of tissue closely approximated to the retroflexed scope, extending 3-4 cm
//         along the lesser curvature; normal.
//   II  : a less pronounced ridge that may open with respiration but closes.
//   III : a diminished ridge that fails to close around the endoscope; often with a hiatal hernia.
//         Flagged.
//   IV  : no ridge; the esophagogastric junction stays open and the esophageal lumen is seen in
//         retroflexion; associated with a hiatal hernia. Flagged.

const GRADES = {
  I: { grade: 'I', abnormalValve: false, text: 'Hill grade I - a prominent ridge of tissue at the cardia, closely approximated to the retroflexed scope, extending 3-4 cm along the lesser curvature; a normal flap valve.' },
  II: { grade: 'II', abnormalValve: false, text: 'Hill grade II - a less pronounced ridge at the cardia that may open with respiration but closes.' },
  III: { grade: 'III', abnormalValve: true, text: 'Hill grade III - a diminished ridge that fails to close around the endoscope; often with a hiatal hernia.' },
  IV: { grade: 'IV', abnormalValve: true, text: 'Hill grade IV - no ridge; the esophagogastric junction stays open and the esophageal lumen is seen in retroflexion; associated with a hiatal hernia.' },
};

const NOTE = 'The Hill classification grades the gastroesophageal flap valve on a retroflexed endoscopic view of the cardia. I: a prominent ridge closely approximated to the scope (normal). II: a less pronounced ridge that may open with respiration. III: a diminished ridge that fails to close around the scope. IV: no ridge, the junction stays open. Grades III-IV are associated with a hiatal hernia and GERD - the classically taught pattern, not an order. This reports the grade the endoscopist has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4)
export function hillFlapValve(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Hill grade (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    abnormalValve: g.abnormalValve,
    abnormal: g.abnormalValve,
    bandLabel: `Hill grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
