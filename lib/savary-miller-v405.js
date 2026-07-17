// spec-v405: modified Savary-Miller endoscopic classification of reflux esophagitis, by the endoscopic
// extent of the mucosal lesions — grades I / II / III / IV / V. It is the older / alternative companion to
// the Los Angeles (la-esophagitis) classification already in the catalog. "savary miller" / "reflux
// esophagitis grade" / "esophagitis classification" routed to nothing.
//
// HIGH-STAKES: this reports the endoscopic GRADE the clinician has determined at endoscopy, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Higher grades
// carry more complications, but this reports the grade; the management decision stays with the
// gastroenterology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Savary M, Miller G. The Esophagus: Handbook and Atlas of Endoscopy. Solothurn: Gassmann; 1978 (the
//     original I-IV grading); the modified grade V (Barrett) from Ollyo/Monnier.
//   - Gastroenterology references reproducing the same single-fold-erosion (I) / multiple-fold-non-
//     confluent (II) / circumferential-confluent (III) / chronic-complication (IV) / Barrett (V) grouping.
//
// Grades (endoscopic extent of the esophagitis):
//   I   : single or isolated erosion(s) (erythematous or exudative) on a single mucosal fold.
//   II  : multiple, non-confluent erosions affecting more than one mucosal fold, not circumferential.
//   III : circumferential (confluent) erosions extending around the entire lumen.
//   IV  : chronic complications - deep ulcer, stricture, or esophageal shortening (fibrosis), with or
//         without grade I-III lesions.
//   V   : Barrett's esophagus - columnar-lined (metaplastic) epithelium.

const GRADES = {
  I: { grade: 'I', text: 'Savary-Miller grade I - single or isolated erosion(s) (erythematous or exudative) on a single mucosal fold.' },
  II: { grade: 'II', text: 'Savary-Miller grade II - multiple, non-confluent erosions affecting more than one mucosal fold, not circumferential.' },
  III: { grade: 'III', text: 'Savary-Miller grade III - circumferential (confluent) erosions extending around the entire lumen.' },
  IV: { grade: 'IV', text: 'Savary-Miller grade IV - chronic complications: deep ulcer, stricture, or esophageal shortening (fibrosis), with or without grade I-III lesions.' },
  V: { grade: 'V', text: 'Savary-Miller grade V - Barrett\'s esophagus: columnar-lined (metaplastic) epithelium.' },
};

const NOTE = 'The modified Savary-Miller classification (Savary-Miller 1978; grade V from Ollyo/Monnier) grades reflux esophagitis by the endoscopic extent of the mucosal lesions. I: isolated erosion on a single fold. II: multiple non-confluent erosions on more than one fold. III: circumferential confluent erosions. IV: chronic complications (ulcer, stricture, short esophagus). V: Barrett\'s (columnar-lined) epithelium. Higher grades carry more complications, but this reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis. Companion: the Los Angeles esophagitis classification.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' / 'V' (case-insensitive; also accepts 1-5).
export function savaryMiller(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Savary-Miller grade (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Savary-Miller grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
