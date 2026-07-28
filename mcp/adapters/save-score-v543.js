// spec-v543 MCP wave: adapter for the SAVE score in lib/save-score-v543.js. The dom keys mirror the browser
// renderer (views/group-v543.js) and META['save-score'].example: save-<key> maps to the lib arg <key>.
//
// **THE SUMMARY STATES THE MINUS-SIX CONSTANT FIRST, AND THE RESULT RETURNS IT AS ITS OWN FIELD.** This is
// the design point. An agent that sums the published item weights and stops has produced a number six points
// too high, and because the class boundaries sit at 5, 0, -5 and -10, that shifts most patients a FULL RISK
// CLASS - typically reporting a better survival than the instrument gives. The compute result exposes
// `componentTotal`, `constant` and `total` separately so the arithmetic is auditable rather than something a
// caller has to trust.
//
// **THE DIAGNOSIS GROUPS AND THE ORGAN FAILURES ARE PUBLISHED AS INDEPENDENT BOOLEANS, NOT AS ONE-OF ENUMS.**
// The source says "select one or more" for both. Modelling either as a single-choice list would have been
// the natural schema shape and would be wrong: a patient with myocarditis who is also in refractory VT
// scores +3 AND +2, and a patient with liver, CNS and renal failure scores -9. Enum-ing them would
// under-score the most salvageable and the sickest patients in opposite directions.
//
// EVERY FIELD LABEL CARRIES ITS SIGNED WEIGHT, including the negatives, because roughly half of them subtract
// and an agent cannot otherwise sanity-check a total that falls as the patient's findings accumulate.
//
// THE SUMMARY GIVES THE PRIMARY SOURCE'S CLASS BOUNDARIES EXPLICITLY (class I is ABOVE 5, class II is 1
// THROUGH 5), because a widely used secondary rendering states class I as "5 or above" and mis-assigns a
// score of exactly 5. It also gives the range as -35 to 23, not the -35 to 17 another secondary source
// reports.
//
// And the framing: these are COHORT survival figures. The summary says outright that the score is not a tool
// for deciding whether to offer ECMO or for withdrawing it, because "SAVE class V, 18 percent survival" is
// precisely the phrase an agent might otherwise convert into a recommendation against support - in a
// condition that is fatal without it, and in a class where patients still survived.

import * as S from '../../lib/save-score-v543.js';

const signed = (n) => (n > 0 ? `+${n}` : String(n));

export default [
  {
    id: 'save-score',
    summary: `The SAVE score (Schmidt and colleagues 2015) estimates hospital survival after VENO-ARTERIAL ECMO for refractory cardiogenic shock. It is the veno-arterial counterpart of the RESP score, which covers respiratory veno-venous ECMO in a different population, and it is distinct from cardiogenic-shock severity scores that do not reference ECMO. CRITICAL ARITHMETIC: a CONSTANT OF ${S.SAVE_CONSTANT} IS ADDED TO EVERY CALCULATION. A patient whose item weights sum to zero has a SAVE score of ${S.SAVE_CONSTANT}, not zero, and because the class boundaries sit at 5, 0, minus 5 and minus 10, omitting the constant shifts most patients a full risk class and reports a better survival than the instrument gives. The diagnosis groups and the acute pre-ECMO organ failures are SELECT ONE OR MORE and are additive, not mutually exclusive: myocarditis plus refractory ventricular tachycardia scores both, and liver plus CNS plus renal failure scores minus 9. Diagnosis weights: myocarditis +3, refractory ventricular tachycardia or fibrillation +2, post heart or lung transplantation +3, congenital heart disease -3, other diagnoses 0. Age: 18 to 38 +7, 39 to 52 +4, 53 to 62 +3, 63 or older 0. Weight: 65 kg or less +1, 65 to 89 +2, 90 or more 0. Acute pre-ECMO organ failures, each -3: liver failure with bilirubin 33 micromol/L or above or ALT/AST above 70, central nervous system dysfunction, renal failure. Chronic renal failure -6. Duration of intubation before ECMO: 10 hours or less 0, 11 to 29 hours -2, 30 hours or more -4. Peak inspiratory pressure 20 cmH2O or less +3. Pre-ECMO cardiac arrest -2. Diastolic blood pressure before ECMO 40 mmHg or above +3. Pulse pressure before ECMO 20 mmHg or less -2. Bicarbonate before ECMO 15 mmol/L or less -3. Total range ${-35} to 23. Risk classes, using the primary source's boundaries: ABOVE 5 is class I with 75 percent reported hospital survival; 1 THROUGH 5 is class II at 58 percent; minus 4 to 0 is class III at 42 percent; minus 9 to minus 5 is class IV at 30 percent; and minus 10 or below is class V at 18 percent. Note that a widely used secondary rendering states class I as "5 or above", which mis-assigns a score of exactly 5. The score was constructed so that zero sits near a fifty-fifty chance. These survival figures describe GROUPS of patients who resembled this one in the derivation and validation cohorts. They are NOT a prediction for the individual, and the score is NOT a tool for deciding whether to offer ECMO or for withdrawing it once started: refractory cardiogenic shock is fatal without support, a low predicted survival is not the same as futility, and patients in the lowest class still survived. It does not diagnose cardiogenic shock, does not choose a cannulation strategy, does not address the ECMO-specific complications that drive much of the mortality, and does not account for what happens after cannulation, including bleeding, limb ischemia, neurologic injury, or the availability of a durable device or transplant.`,
    compute: S.saveScore,
    fields: [
      ...[...S.SAVE_DIAGNOSES, ...S.SAVE_ORGAN_FAILURES, ...S.SAVE_BINARY].map((f) => ({
        dom: `save-${f.key}`, arg: f.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${f.text} [yes = ${signed(f.points)}; no = 0]`,
      })),
      {
        dom: 'save-ageBand', arg: 'ageBand', kind: 'enum',
        values: S.SAVE_AGE_BANDS.map((b) => b.value), required: true,
        label: `Age [${S.SAVE_AGE_BANDS.map((b) => `${b.value} = ${b.text}, ${signed(b.points)}`).join('; ')}]`,
      },
      {
        dom: 'save-weightBand', arg: 'weightBand', kind: 'enum',
        values: S.SAVE_WEIGHT_BANDS.map((b) => b.value), required: true,
        label: `Weight [${S.SAVE_WEIGHT_BANDS.map((b) => `${b.value} = ${b.text}, ${signed(b.points)}`).join('; ')}]`,
      },
      {
        dom: 'save-intubationBand', arg: 'intubationBand', kind: 'enum',
        values: S.SAVE_INTUBATION_BANDS.map((b) => b.value), required: true,
        label: `Duration of intubation prior to ECMO [${S.SAVE_INTUBATION_BANDS.map((b) => `${b.value} = ${b.text}, ${signed(b.points)}`).join('; ')}]`,
      },
    ],
  },
];
