// spec-v368: Ross classification of heart failure in infants and children (classes I-IV) — the
// pediatric functional classification of heart-failure severity, the pediatric counterpart to the adult
// NYHA class (the catalog now carries nyha-class for adults). It grades feeding difficulty, tachypnea,
// diaphoresis, growth, and exertional symptoms. "ross classification" / "ross heart failure" /
// "pediatric heart failure class" routed to nothing.
//
// HIGH-STAKES: this reports the Ross CLASS the clinician has determined from the child's symptoms, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The class
// can vary visit to visit; the management decision stays with the pediatric cardiology team.
//
// DEFINITIONS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Ross RD, Bollinger RO, Pinsky WW. Grading the severity of congestive heart failure in infants.
//     Pediatr Cardiol. 1992;13(2):72-75; modified Ross RD, Pediatr Cardiol. 2012;33(8):1295-1300.
//   - Pediatric-cardiology references reproducing the same class I-IV feeding/growth/symptom
//     definitions, comparable with the adult NYHA classes.
//
// Classes (heart-failure severity in infants / children):
//   I   : no limitation or symptoms.
//   II  : mild tachypnea and/or diaphoresis with feeds (infants), or dyspnea on exertion (older
//         children); no growth failure.
//   III : marked tachypnea and/or diaphoresis with feeds or exertion; prolonged feeding time with
//         growth failure. Flagged.
//   IV  : symptomatic at rest - tachypnea, retractions, grunting, and/or diaphoresis. Flagged.

const CLASSES = {
  I: { cls: 'I', advanced: false, text: 'Ross class I - no limitation or symptoms.' },
  II: { cls: 'II', advanced: false, text: 'Ross class II - mild tachypnea and/or diaphoresis with feeds in infants, or dyspnea on exertion in older children; no growth failure.' },
  III: { cls: 'III', advanced: true, text: 'Ross class III - marked tachypnea and/or diaphoresis with feeds or exertion, with prolonged feeding time and growth failure.' },
  IV: { cls: 'IV', advanced: true, text: 'Ross class IV - symptomatic at rest: tachypnea, retractions, grunting, and/or diaphoresis.' },
};

const NOTE = 'The Ross classification (Ross 1992; modified 2012) grades heart-failure severity in infants and children by feeding difficulty, tachypnea, diaphoresis, growth, and exertional symptoms - the pediatric counterpart to the adult NYHA class. I: no symptoms. II: mild symptoms with feeds/exertion, no growth failure. III: marked symptoms with growth failure. IV: symptoms at rest. Classes III-IV mark more advanced heart failure. The class is symptom-based and can vary visit to visit. This reports the class the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   cls: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4)
export function rossHfPeds(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.cls == null ? '' : o.cls).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CLASSES[key];
  if (!c) {
    return { valid: false, message: 'Select the Ross class (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    rossClass: c.cls,
    advanced: c.advanced,
    abnormal: c.advanced,
    bandLabel: `Ross class ${c.cls}`,
    band: c.text,
    note: NOTE,
  };
}
