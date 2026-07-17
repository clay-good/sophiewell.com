// spec-v357: NYHA (New York Heart Association) functional classification of heart failure (classes
// I-IV) — the most widely used symptom-based functional classification in cardiology, grading the
// limitation of physical activity from the patient's symptoms. The catalog uses NYHA class as an INPUT
// field inside composite cardiac scores (MAGGIC, EuroSCORE, ...) but had no standalone tile to look up
// the class definitions. "nyha class" / "new york heart association class" / "heart failure functional
// class" routed to nothing.
//
// HIGH-STAKES: this reports the NYHA CLASS the clinician has determined from the patient's symptoms,
// NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// class can vary visit to visit; the management decision stays with the treating clinician.
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - The Criteria Committee of the New York Heart Association. Nomenclature and Criteria for Diagnosis
//     of Diseases of the Heart and Great Vessels. 9th ed. Boston: Little, Brown & Co; 1994:253-256.
//   - Standard cardiology references reproducing the same class I-IV symptom-limitation definitions.
//
// Classes (limitation of physical activity from heart-failure symptoms):
//   I   : no limitation; ordinary physical activity does not cause undue fatigue, palpitation, or
//         dyspnea.
//   II  : slight limitation; comfortable at rest, but ordinary physical activity causes fatigue,
//         palpitation, or dyspnea.
//   III : marked limitation; comfortable at rest, but less-than-ordinary activity causes symptoms.
//         Flagged.
//   IV  : unable to carry on any physical activity without discomfort; symptoms of heart failure at
//         rest. Flagged.

const CLASSES = {
  I: { cls: 'I', advanced: false, text: 'NYHA class I - no limitation of physical activity; ordinary physical activity does not cause undue fatigue, palpitation, or dyspnea.' },
  II: { cls: 'II', advanced: false, text: 'NYHA class II - slight limitation of physical activity; comfortable at rest, but ordinary physical activity causes fatigue, palpitation, or dyspnea.' },
  III: { cls: 'III', advanced: true, text: 'NYHA class III - marked limitation of physical activity; comfortable at rest, but less-than-ordinary activity causes fatigue, palpitation, or dyspnea.' },
  IV: { cls: 'IV', advanced: true, text: 'NYHA class IV - unable to carry on any physical activity without discomfort; symptoms of heart failure are present at rest.' },
};

const NOTE = 'The NYHA (New York Heart Association) functional classification grades heart-failure symptom limitation. I: no limitation. II: slight limitation; symptoms on ordinary activity, comfortable at rest. III: marked limitation; symptoms on less-than-ordinary activity, comfortable at rest. IV: symptoms at rest / unable to do any activity without discomfort. Classes III-IV mark more advanced functional limitation. The class is symptom-based and can vary visit to visit. This reports the class the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   cls: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4)
export function nyhaClass(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.cls == null ? '' : o.cls).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CLASSES[key];
  if (!c) {
    return { valid: false, message: 'Select the NYHA class (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    nyhaClass: c.cls,
    advanced: c.advanced,
    abnormal: c.advanced,
    bandLabel: `NYHA class ${c.cls}`,
    band: c.text,
    note: NOTE,
  };
}
