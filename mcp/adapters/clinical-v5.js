// spec-v183 MCP waves 54 + 69: adapters for lib/clinical-v5.js - sodium
// correction, free-water deficit, ARDSNet predicted body weight, RSBI,
// albumin-corrected anion gap, and the Ganzoni total iron deficit (wave 54),
// plus the diagnostic-ratio and staging tiles rendered by views/group-v5.js
// (Light's criteria, Mentzer index, SAAG, DILI R-factor, KDIGO AKI staging,
// modified Sgarbossa, AVPU-to-GCS; wave 69). dom keys mirror the renderers.

import * as F from '../../lib/clinical-v5.js';

export default [
  {
    id: 'sodium-correction',
    summary: 'Hyponatremia/hypernatremia sodium-correction planner (Adrogue-Madias): TBW, infusate dNa per liter, target rate with safety-cap ceiling.',
    // Echo the chosen infusate's saline percentage so the JSON names the fluid.
    compute: (a) => {
      const r = F.sodiumCorrection(a);
      if (r == null) return r;
      const pct = { '3pct-saline': 3, '0.9-saline': 0.9, '0.45-saline': 0.45 }[a.infusate];
      return pct == null ? r : { ...r, infusateSalinePercent: pct };
    },
    fields: [
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'na', arg: 'currentNa', kind: 'number', required: true, label: 'Current serum Na', unit: 'mEq/L' },
      { dom: 'infusate', arg: 'infusate', kind: 'enum', values: ['3pct-saline', '0.9-saline', '0.45-saline', 'lr', 'd5w'], required: true, label: 'Infusate' },
      { dom: 'tgt', arg: 'targetChangePer24h', kind: 'number', required: true, label: 'Target change in 24 h', unit: 'mEq/L' },
      { dom: 'acuity', arg: 'acuity', kind: 'enum', values: ['chronic', 'acute'], required: false, label: 'Acuity' },
    ],
  },
  {
    id: 'free-water-deficit',
    summary: 'Free water deficit for hypernatremia: TBW*(currentNa/targetNa - 1), replacement rate with 10 mEq/L/24h safety cap.',
    // Echo the replacement window so the rate is interpretable.
    compute: (a) => {
      const r = F.freeWaterDeficit(a);
      return r == null ? r : { ...r, replaceOverHours: a.replaceOverHours };
    },
    fields: [
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'na', arg: 'currentNa', kind: 'number', required: true, label: 'Current serum Na', unit: 'mEq/L' },
      { dom: 'tgt', arg: 'targetNa', kind: 'number', required: true, label: 'Target Na', unit: 'mEq/L' },
      { dom: 'hrs', arg: 'replaceOverHours', kind: 'number', required: true, label: 'Replace over', unit: 'hours' },
    ],
  },
  {
    id: 'pbw-ardsnet',
    summary: 'Predicted body weight (Devine) and ARDSnet lung-protective tidal-volume target (default 6 mL/kg PBW, range 4-8).',
    compute: F.pbwArdsnet,
    fields: [
      { dom: 'h', arg: 'heightCm', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'mlkg', arg: 'mlPerKg', kind: 'number', required: true, label: 'Target Vt', unit: 'mL/kg PBW' },
    ],
  },
  {
    id: 'rsbi',
    summary: 'Rapid shallow breathing index = respiratory rate / tidal volume(L); <105 predicts extubation success.',
    compute: F.rsbi,
    fields: [
      { dom: 'rr', arg: 'respiratoryRate', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'vt', arg: 'tidalVolumeMl', kind: 'number', required: true, label: 'Tidal volume', unit: 'mL' },
    ],
  },
  {
    id: 'corrected-anion-gap',
    summary: 'Albumin-corrected anion gap (Figge): AG + 2.5*(4.0 - albumin), with optional potassium inclusion.',
    compute: F.correctedAnionGap,
    fields: [
      { dom: 'na', arg: 'na', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'cl', arg: 'cl', kind: 'number', required: true, label: 'Chloride', unit: 'mEq/L' },
      { dom: 'hco3', arg: 'hco3', kind: 'number', required: true, label: 'Bicarbonate', unit: 'mEq/L' },
      { dom: 'alb', arg: 'albuminGdl', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
    ],
  },
  {
    id: 'iron-ganzoni',
    summary: 'Ganzoni 1970 total iron deficit: weight x (target Hb - current Hb) x 2.4 + iron stores (default stores applied when no override given).',
    compute: F.ironDeficitGanzoni,
    fields: [
      { dom: 'w', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'hb', arg: 'currentHb', kind: 'number', required: true, label: 'Current Hb', unit: 'g/dL' },
      { dom: 'tgt', arg: 'targetHb', kind: 'number', required: true, label: 'Target Hb', unit: 'g/dL' },
      { dom: 'stores', arg: 'ironStoresMg', kind: 'number', required: false, label: 'Iron stores override', unit: 'mg' },
    ],
  },

  // --- wave 69: the group-v5 diagnostic-ratio and staging tiles -----------
  {
    id: 'lights',
    summary: "Light's criteria for a pleural effusion: exudative if the pleural/serum protein ratio > 0.5, the pleural/serum LDH ratio > 0.6, or pleural LDH > 2/3 of the serum LDH upper-normal limit. Returns each ratio, whether its criterion is met, and the transudate/exudate classification.",
    // Echo the three criterion cutoffs so the documented thresholds appear in
    // the JSON (self-describing enrichment).
    compute: (a) => {
      const r = F.lightsCriteria(a);
      return r == null ? null : { ...r, cutoffs: { proteinRatio: 0.5, ldhRatio: 0.6 } };
    },
    fields: [
      { dom: 'pp', arg: 'pleuralProtein', kind: 'number', required: true, label: 'Pleural protein', unit: 'g/dL' },
      { dom: 'sp', arg: 'serumProtein', kind: 'number', required: true, label: 'Serum protein', unit: 'g/dL' },
      { dom: 'pl', arg: 'pleuralLdh', kind: 'number', required: true, label: 'Pleural LDH', unit: 'U/L' },
      { dom: 'sl', arg: 'serumLdh', kind: 'number', required: true, label: 'Serum LDH', unit: 'U/L' },
      { dom: 'uln', arg: 'serumLdhUln', kind: 'number', required: true, label: 'Serum LDH upper-normal limit', unit: 'U/L' },
    ],
  },
  {
    id: 'mentzer',
    summary: 'Mentzer index = MCV / RBC count: < 13 favors beta-thalassemia trait, > 13 favors iron-deficiency anemia.',
    compute: (a) => F.mentzerIndex(a),
    fields: [
      { dom: 'mcv', arg: 'mcvFl', kind: 'number', required: true, label: 'MCV', unit: 'fL' },
      { dom: 'rbc', arg: 'rbcMillionsPerUl', kind: 'number', required: true, label: 'RBC count', unit: 'x10^12/L' },
    ],
  },
  {
    id: 'saag',
    summary: 'Serum-ascites albumin gradient = serum albumin - ascites albumin: >= 1.1 g/dL indicates portal hypertension, < 1.1 a non-portal etiology.',
    compute: (a) => F.saag(a),
    fields: [
      { dom: 'sa', arg: 'serumAlbumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
      { dom: 'aa', arg: 'ascitesAlbumin', kind: 'number', required: true, label: 'Ascites albumin', unit: 'g/dL' },
    ],
  },
  {
    id: 'r-factor',
    summary: 'R-factor for drug-induced liver injury = (ALT/ALT-ULN) / (ALP/ALP-ULN): > 5 hepatocellular, < 2 cholestatic, 2-5 mixed pattern.',
    compute: (a) => F.rFactorLiver(a),
    fields: [
      { dom: 'alt', arg: 'alt', kind: 'number', required: true, label: 'ALT', unit: 'U/L' },
      { dom: 'altu', arg: 'altUln', kind: 'number', required: true, label: 'ALT upper-normal limit', unit: 'U/L' },
      { dom: 'alp', arg: 'alp', kind: 'number', required: true, label: 'ALP', unit: 'U/L' },
      { dom: 'alpu', arg: 'alpUln', kind: 'number', required: true, label: 'ALP upper-normal limit', unit: 'U/L' },
    ],
  },
  {
    id: 'kdigo-aki',
    summary: 'KDIGO acute-kidney-injury staging from the creatinine ratio to baseline (and optional 48-hour rise, urine output, anuria duration, and RRT); returns the creatinine and urine-output sub-stages and the overall stage.',
    compute: F.kdigoAki,
    fields: [
      { dom: 'base', arg: 'baselineCr', kind: 'number', required: true, label: 'Baseline serum creatinine', unit: 'mg/dL' },
      { dom: 'cur', arg: 'currentCr', kind: 'number', required: true, label: 'Current serum creatinine', unit: 'mg/dL' },
      { dom: 'rise', arg: 'riseInLast48h', kind: 'number', label: 'Rise in last 48 h (optional)', unit: 'mg/dL' },
      { dom: 'uo', arg: 'uoMlPerKgPerHour', kind: 'number', label: 'Urine output (optional)', unit: 'mL/kg/h' },
      { dom: 'uoh', arg: 'uoDurationHours', kind: 'number', label: 'Urine-output duration (optional)', unit: 'hours' },
      { dom: 'anuria', arg: 'anuriaHours', kind: 'number', label: 'Anuria duration (optional)', unit: 'hours' },
      { dom: 'rrt', arg: 'rrtInitiated', kind: 'bool', label: 'RRT initiated' },
    ],
  },
  {
    id: 'sgarbossa',
    summary: 'Modified Sgarbossa criteria for acute MI in left bundle branch block or ventricular pacing: positive if any of concordant ST elevation >= 1 mm, concordant ST depression >= 1 mm in V1-V3, or an ST/S ratio <= -0.25 in a lead with discordant ST elevation >= 1 mm.',
    // Echo the 1 mm ST-deviation threshold the criteria are defined on.
    compute: (a) => {
      const r = F.modifiedSgarbossa(a);
      return r == null ? null : { ...r, stThresholdMm: 1 };
    },
    fields: [
      { dom: 'a', arg: 'concordantElevation', kind: 'bool', label: 'Concordant ST elevation >= 1 mm in any lead' },
      { dom: 'b', arg: 'concordantDepressionV1V3', kind: 'bool', label: 'Concordant ST depression >= 1 mm in V1-V3' },
      { dom: 'c', arg: 'stToSRatioBelowMinus025', kind: 'bool', label: 'ST/S ratio <= -0.25 with discordant ST elevation >= 1 mm' },
    ],
  },
  {
    id: 'avpu-gcs',
    summary: 'Approximate AVPU-to-GCS crosswalk: Alert -> ~15, Verbal -> ~13, Pain -> ~8, Unresponsive -> ~3, each with an approximate range. AVPU does not map finely to GCS.',
    // avpuToGcs takes a positional string, not an argument object.
    compute: (a) => F.avpuToGcs(a.lvl),
    fields: [
      { dom: 'lvl', arg: 'lvl', kind: 'enum', values: ['A', 'V', 'P', 'U'], required: true, label: 'AVPU level' },
    ],
  },

  // --- wave 73: the remaining group-v5 clinical scores --------------------
  {
    id: 'rcri',
    summary: 'Revised Cardiac Risk Index (Lee 1999) for perioperative major cardiac events: high-risk surgery, ischemic heart disease, congestive heart failure, cerebrovascular disease, insulin-dependent diabetes, and preoperative creatinine > 2.0 (1 each); the factor count maps to the Class I-IV event-rate band.',
    compute: F.rcri,
    fields: [
      { dom: 'highRiskSurgery', arg: 'highRiskSurgery', kind: 'bool', label: 'High-risk surgery (suprainguinal vascular, intraperitoneal, intrathoracic)' },
      { dom: 'ischemicHeartDisease', arg: 'ischemicHeartDisease', kind: 'bool', label: 'Ischemic heart disease' },
      { dom: 'congestiveHeartFailure', arg: 'congestiveHeartFailure', kind: 'bool', label: 'History of congestive heart failure' },
      { dom: 'cerebrovascularDisease', arg: 'cerebrovascularDisease', kind: 'bool', label: 'History of cerebrovascular disease (TIA / CVA)' },
      { dom: 'insulinDependentDm', arg: 'insulinDependentDm', kind: 'bool', label: 'Insulin-dependent diabetes mellitus' },
      { dom: 'creatinineOver2', arg: 'creatinineOver2', kind: 'bool', label: 'Preoperative creatinine > 2.0 mg/dL' },
    ],
  },
  {
    id: 'pews',
    summary: 'Pediatric Early Warning Score: behavior, cardiovascular, and respiratory subscales each 0-3; the total maps to an escalation band (a rising trend warrants escalation).',
    compute: F.pews,
    fields: [
      { dom: 'Behavior', arg: 'behaviorScore', kind: 'number', required: true, label: 'Behavior subscale (0-3)' },
      { dom: 'Cardiovascular', arg: 'cardiovascularScore', kind: 'number', required: true, label: 'Cardiovascular subscale (0-3)' },
      { dom: 'Respiratory', arg: 'respiratoryScore', kind: 'number', required: true, label: 'Respiratory subscale (0-3)' },
    ],
  },
  {
    id: 'abcd2',
    summary: 'ABCD2 score for stroke risk after TIA (Johnston 2007): age >= 60 (1), BP >= 140/90 (1), clinical features (unilateral weakness 2, speech disturbance without weakness 1), duration (>= 60 min 2, 10-59 min 1), diabetes (1); total 0-7 with the 2-day stroke-risk band. Returns the component breakdown and interpretation.',
    compute: F.abcd2,
    fields: [
      { dom: 'age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'dbp', arg: 'dbp', kind: 'number', required: true, label: 'Diastolic BP', unit: 'mmHg' },
      { dom: 'clin', arg: 'clinicalFeatures', kind: 'enum', values: ['weakness', 'speech', 'other'], required: true, label: 'Clinical features (weakness 2 / speech 1 / other 0)' },
      { dom: 'dur', arg: 'durationMinutes', kind: 'number', required: true, label: 'Symptom duration', unit: 'minutes' },
      { dom: 'diab', arg: 'diabetes', kind: 'bool', label: 'Diabetes (1)' },
    ],
  },
];
