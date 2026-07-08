// spec-v183 MCP wave 54: adapters for lib/scoring-v4.js - trauma triage (MGAP,
// GAP, BIG), ICU titration math (insulin correction, electrolyte replacement,
// CRRT dose, ECMO titration), and the three PECARN pediatric decision rules.
// dom keys mirror views/group-g.js / views/group-v8.js.

import * as F from '../../lib/scoring-v4.js';

export default [
  {
    id: 'mgap',
    summary: 'MGAP trauma triage score (Sartorius 2010) from mechanism, GCS, age, SBP. Higher = lower mortality risk.',
    compute: F.mgap,
    fields: [
      { dom: 'mgap-mech', arg: 'mechanismBlunt', kind: 'enum', values: ['blunt', 'pen'], required: true, label: 'Mechanism', to: (v) => v === 'blunt' },
      { dom: 'mgap-gcs', arg: 'gcs', kind: 'number', required: true, label: 'GCS' },
      { dom: 'mgap-age', arg: 'ageLt60', kind: 'enum', values: ['lt60', 'ge60'], required: true, label: 'Age', to: (v) => v === 'lt60' },
      { dom: 'mgap-sbp', arg: 'sbp', kind: 'number', required: true, label: 'SBP', unit: 'mmHg' },
    ],
  },
  {
    id: 'gap',
    summary: 'GAP trauma triage score (Kondo 2011) from GCS, age, SBP.',
    compute: F.gap,
    fields: [
      { dom: 'gap-gcs', arg: 'gcs', kind: 'number', required: true, label: 'GCS' },
      { dom: 'gap-age', arg: 'ageLt60', kind: 'enum', values: ['lt60', 'ge60'], required: true, label: 'Age', to: (v) => v === 'lt60' },
      { dom: 'gap-sbp', arg: 'sbp', kind: 'number', required: true, label: 'SBP', unit: 'mmHg' },
    ],
  },
  {
    id: 'big',
    summary: 'BIG score (Borgman 2011) = base deficit + 2.5*INR + (15-GCS) + 4; pediatric trauma mortality prediction.',
    compute: F.big,
    fields: [
      { dom: 'big-bd', arg: 'baseDeficit', kind: 'number', required: true, label: 'Base deficit', unit: 'mEq/L' },
      { dom: 'big-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'big-gcs', arg: 'gcs', kind: 'number', required: true, label: 'GCS' },
    ],
  },
  {
    id: 'insulin-correction',
    summary: 'ADA 2024 hospital insulin correction dose: correction = (current - target BG) / ISF, ISF derivable from TDD via the 1800 (rapid) or 1500 (regular) rule, plus optional carb coverage.',
    // Name the ISF-rule constant (1800 rapid / 1500 regular) when the ISF is
    // derived from the total daily dose.
    compute: (a) => {
      const r = F.insulinCorrection(a);
      if (r == null) return r;
      return r.isfDerivedFromTdd ? { ...r, isfRuleConstant: a.isfRule === 'regular' ? 1500 : 1800 } : r;
    },
    fields: [
      { dom: 'ic-bg', arg: 'currentBG', kind: 'number', required: true, label: 'Current BG', unit: 'mg/dL' },
      { dom: 'ic-target', arg: 'targetBG', kind: 'number', required: true, label: 'Target BG', unit: 'mg/dL' },
      { dom: 'ic-isf', arg: 'isf', kind: 'number', required: false, label: 'ISF (mg/dL per unit; blank derives from TDD)', to: (v) => v || 0 },
      { dom: 'ic-tdd', arg: 'totalDailyDose', kind: 'number', required: true, label: 'Total daily insulin dose', unit: 'units' },
      { dom: 'ic-rule', arg: 'isfRule', kind: 'enum', values: ['rapid', 'regular'], required: true, label: 'ISF rule (when derived from TDD)' },
      { dom: 'ic-carbs', arg: 'carbs', kind: 'number', required: true, label: 'Carbs to be eaten', unit: 'g' },
      { dom: 'ic-icr', arg: 'icr', kind: 'number', required: true, label: 'Insulin-to-carb ratio', unit: 'g per unit' },
    ],
  },
  {
    id: 'electrolyte-replacement',
    summary: 'Level-banded K / Mg / phosphate replacement ladder with IV vs PO route and a renal-impairment caution (Hammond 2019 and standard references).',
    compute: F.electrolyteReplacement,
    fields: [
      { dom: 'er-e', arg: 'electrolyte', kind: 'enum', values: ['k', 'mg', 'phos'], required: true, label: 'Electrolyte' },
      { dom: 'er-l', arg: 'level', kind: 'number', required: true, label: 'Serum level' },
      { dom: 'er-r', arg: 'route', kind: 'enum', values: ['iv', 'po'], required: true, label: 'Route' },
      { dom: 'er-renal', arg: 'renalImpaired', kind: 'bool', required: false, label: 'Renal impairment (eGFR < 30 or AKI)' },
    ],
  },
  {
    id: 'crrt-dose',
    summary: 'CRRT effluent dose (KDIGO 2012 target 20-25 mL/kg/h) from weight and prescribed effluent rate, with optional citrate-circuit calcium ratio (Davenport 2009 targets, mmol/L).',
    compute: F.crrtDose,
    fields: [
      { dom: 'cr-w', arg: 'weightKg', kind: 'number', required: true, label: 'Patient weight', unit: 'kg' },
      { dom: 'cr-r', arg: 'effluentRateMlPerHr', kind: 'number', required: true, label: 'Prescribed effluent rate', unit: 'mL/h' },
      { dom: 'cr-mod', arg: 'modality', kind: 'enum', values: ['CVVH', 'CVVHD', 'CVVHDF'], required: true, label: 'Modality' },
      { dom: 'cr-uf', arg: 'ultrafiltrationMlPerHr', kind: 'number', required: false, label: 'Ultrafiltration', unit: 'mL/h' },
      { dom: 'cr-sca', arg: 'systemicIonisedCa', kind: 'number', required: false, label: 'Systemic ionized Ca', unit: 'mmol/L' },
      { dom: 'cr-pca', arg: 'postFilterIonisedCa', kind: 'number', required: false, label: 'Post-filter ionized Ca', unit: 'mmol/L' },
      { dom: 'cr-tca', arg: 'totalCa', kind: 'number', required: false, label: 'Total Ca', unit: 'mmol/L' },
    ],
  },
  {
    id: 'ecmo-titration',
    summary: 'ELSO 2022 ECMO sweep/flow titration helper: suggested sweep from the linear PaCO2-sweep heuristic, suggested pump flow, and DO2i (target >= 6 mL/kg/min) from Hb and saturation.',
    compute: F.ecmoTitration,
    fields: [
      { dom: 'ec-mod', arg: 'modality', kind: 'enum', values: ['VV', 'VA'], required: true, label: 'Modality' },
      { dom: 'ec-w', arg: 'weightKg', kind: 'number', required: true, label: 'Patient weight', unit: 'kg' },
      { dom: 'ec-sw', arg: 'currentSweepLpm', kind: 'number', required: true, label: 'Current sweep', unit: 'L/min' },
      { dom: 'ec-fl', arg: 'currentFlowLpm', kind: 'number', required: true, label: 'Current pump flow', unit: 'L/min' },
      { dom: 'ec-pco', arg: 'currentPaCO2', kind: 'number', required: true, label: 'Current PaCO2', unit: 'mmHg' },
      { dom: 'ec-tgt', arg: 'targetPaCO2', kind: 'number', required: true, label: 'Target PaCO2', unit: 'mmHg' },
      { dom: 'ec-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'ec-sat', arg: 'sao2', kind: 'number', required: true, label: 'SaO2 or post-oxygenator SatO2', unit: '% or fraction' },
    ],
  },
  {
    id: 'pecarn-head',
    summary: 'PECARN pediatric head-injury rule (Kuppermann 2009): age-branched (<2 vs >=2 y) high/intermediate/very-low risk tier for clinically important TBI after blunt head trauma with GCS 14-15, guiding CT vs observation.',
    compute: F.pecarnHead,
    fields: [
      { dom: 'ph-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age (years)', unit: 'years' },
      { dom: 'ph-gcs15', arg: 'gcs15', kind: 'bool', required: true, label: 'GCS = 15 (uncheck if GCS 14 or other AMS)' },
      { dom: 'ph-skfx', arg: 'palpableSkullFx', kind: 'bool', required: true, label: 'Palpable skull fracture (age <2 only)' },
      { dom: 'ph-basal', arg: 'basalSkullFxSigns', kind: 'bool', required: true, label: 'Signs of basal skull fracture (age >=2)' },
      { dom: 'ph-ams', arg: 'ams', kind: 'bool', required: true, label: 'Other signs of altered mental status' },
      { dom: 'ph-loc', arg: 'locSec', kind: 'bool', required: true, label: 'LOC >= 5 seconds (age <2) / any LOC (age >=2)', to: (v) => (v ? 5 : 0) },
      { dom: 'ph-vom', arg: 'vomiting', kind: 'bool', required: true, label: 'Vomiting (age >=2 only)' },
      { dom: 'ph-mech', arg: 'severeMechanism', kind: 'bool', required: true, label: 'Severe mechanism of injury' },
      { dom: 'ph-opt', arg: 'occipitalParietalTemporalHematoma', kind: 'bool', required: true, label: 'Occipital, parietal, or temporal scalp hematoma (age <2 only)' },
      { dom: 'ph-acting', arg: 'notActingNormally', kind: 'bool', required: true, label: 'Not acting normally per parent (age <2 only)', to: (v) => !v },
      { dom: 'ph-hd', arg: 'severeHeadache', kind: 'bool', required: true, label: 'Severe headache (age >=2 only)' },
    ],
  },
  {
    id: 'pecarn-iai',
    summary: 'PECARN intra-abdominal injury rule (Holmes 2013): 7 history/exam findings after blunt torso trauma in children; absence of all 7 identifies very low risk for IAI needing acute intervention.',
    compute: F.pecarnIai,
    fields: [
      { dom: 'pi-wall', arg: 'abdominalWallTraumaOrSeatBeltSign', kind: 'bool', required: true, label: 'Evidence of abdominal wall trauma or seat-belt sign' },
      { dom: 'pi-gcs', arg: 'gcsLt14', kind: 'bool', required: true, label: 'GCS <14' },
      { dom: 'pi-tender', arg: 'abdominalTenderness', kind: 'bool', required: true, label: 'Abdominal tenderness on exam' },
      { dom: 'pi-vom', arg: 'vomiting', kind: 'bool', required: true, label: 'Vomiting' },
      { dom: 'pi-thor', arg: 'thoracicWallTrauma', kind: 'bool', required: true, label: 'Thoracic wall trauma' },
      { dom: 'pi-pain', arg: 'abdominalPain', kind: 'bool', required: true, label: 'Complaint of abdominal pain' },
      { dom: 'pi-breath', arg: 'decreasedBreathSounds', kind: 'bool', required: true, label: 'Decreased breath sounds' },
    ],
  },
  {
    id: 'pecarn-cspine',
    summary: 'PECARN pediatric cervical-spine injury rule (Leonard 2019): 8 risk factors after blunt trauma; absence of all 8 identifies low risk for cervical spine injury.',
    compute: F.pecarnCspine,
    fields: [
      { dom: 'pc-ams', arg: 'alteredMentalStatus', kind: 'bool', required: true, label: 'Altered mental status' },
      { dom: 'pc-abc', arg: 'abnormalAirwayBreathingCirculation', kind: 'bool', required: true, label: 'Abnormal airway/breathing/circulation' },
      { dom: 'pc-neuro', arg: 'focalNeurologicDeficit', kind: 'bool', required: true, label: 'Focal neurologic deficit' },
      { dom: 'pc-neck', arg: 'neckPain', kind: 'bool', required: true, label: 'Neck pain' },
      { dom: 'pc-tort', arg: 'torticollis', kind: 'bool', required: true, label: 'Torticollis' },
      { dom: 'pc-torso', arg: 'substantialTorsoInjury', kind: 'bool', required: true, label: 'Substantial torso injury' },
      { dom: 'pc-pred', arg: 'predisposingCondition', kind: 'bool', required: true, label: 'Predisposing condition (e.g., Down syndrome, juvenile arthritis)' },
      { dom: 'pc-mvc', arg: 'highRiskMvc', kind: 'bool', required: true, label: 'High-risk motor vehicle collision' },
    ],
  },
];
