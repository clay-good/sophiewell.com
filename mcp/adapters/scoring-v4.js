// spec-v183 MCP waves 54 + 56: adapters for lib/scoring-v4.js - trauma triage
// (MGAP, GAP, BIG), ICU titration math (insulin correction, electrolyte
// replacement, CRRT dose, ECMO titration), the three PECARN pediatric decision
// rules (wave 54), and the Group G ED decision core (TIMI, GRACE, HEART, PERC,
// Wells PE + revised Geneva, CURB-65, PSI, qSOFA + SOFA, MELD-3.0 + Child-Pugh,
// Ranson + BISAP, Centor + McIsaac, Wells DVT + Caprini, Bishop, Alvarado +
// PAS; wave 56). dom keys mirror views/group-g.js / views/group-v8.js.

import * as F from '../../lib/scoring-v4.js';
import { wellsDvt as clinicalWellsDvt } from '../../lib/clinical.js';

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

  // --- wave 56: the Group G ED decision core (views/group-g.js) ------------
  {
    id: 'timi',
    summary: 'TIMI risk score for UA/NSTEMI (Antman 2000): age >= 65, >= 3 CAD risk factors, known CAD >= 50%, ASA in past 7 days, severe angina, ST deviation >= 0.5 mm, elevated markers (1 each); total 0-7 with 14-day event-rate band.',
    compute: F.timi,
    fields: [
      { dom: 'tm-age', arg: 'age65', kind: 'bool', label: 'Age >= 65 (1)' },
      { dom: 'tm-rf', arg: 'threeRiskFactors', kind: 'bool', label: '>= 3 CAD risk factors (1)' },
      { dom: 'tm-cad', arg: 'knownCad50pct', kind: 'bool', label: 'Known CAD (>= 50% stenosis) (1)' },
      { dom: 'tm-asa', arg: 'asaPast7Days', kind: 'bool', label: 'ASA in past 7 days (1)' },
      { dom: 'tm-ang', arg: 'severeAngina', kind: 'bool', label: 'Severe angina (>= 2 episodes in 24 h) (1)' },
      { dom: 'tm-st', arg: 'stDeviation', kind: 'bool', label: 'ST deviation >= 0.5 mm (1)' },
      { dom: 'tm-mark', arg: 'elevatedMarkers', kind: 'bool', label: 'Elevated cardiac markers (1)' },
    ],
  },
  {
    id: 'grace',
    summary: 'GRACE ACS risk score (banded point implementation): age, heart rate, SBP, and creatinine bands plus Killip class, cardiac arrest at admission, ST deviation, and abnormal enzymes; in-hospital mortality band.',
    compute: F.grace,
    fields: [
      { dom: 'gr-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'gr-hr', arg: 'heartRate', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'gr-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'gr-cr', arg: 'creatinineMgDl', kind: 'number', required: true, label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'gr-killip', arg: 'killipClass', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'Killip class', to: (v) => Number(v) },
      { dom: 'gr-arrest', arg: 'cardiacArrestAdmission', kind: 'bool', label: 'Cardiac arrest at admission' },
      { dom: 'gr-st', arg: 'stDeviation', kind: 'bool', label: 'ST-segment deviation' },
      { dom: 'gr-enz', arg: 'abnormalEnzymes', kind: 'bool', label: 'Abnormal cardiac enzymes' },
    ],
  },
  {
    id: 'heart',
    summary: 'HEART score for chest pain (Six 2008): history, EKG, age, risk factors, troponin each graded 0/1/2; total 0-10 with 6-week MACE band (0-3 low 1.7%, 4-6 moderate 16.6%, >= 7 high 50.1%).',
    compute: F.heart,
    fields: [
      { dom: 'h-hist', arg: 'history', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'History (0 slightly / 1 moderately / 2 highly suspicious)', to: (v) => Number(v) },
      { dom: 'h-ekg', arg: 'ekg', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'EKG (0 normal / 1 nonspecific / 2 significant ST deviation)', to: (v) => Number(v) },
      { dom: 'h-age', arg: 'age', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Age (0 < 45 / 1 45-64 / 2 >= 65)', to: (v) => Number(v) },
      { dom: 'h-rf', arg: 'riskFactors', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Risk factors (0 none / 1 one-two / 2 >= 3 or atherosclerosis)', to: (v) => Number(v) },
      { dom: 'h-trop', arg: 'troponin', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Troponin (0 normal / 1 1-3x ULN / 2 > 3x ULN)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'perc',
    summary: 'PERC rule (Kline 2004): eight rule-out criteria (age >= 50, HR >= 100, SaO2 < 95%, hemoptysis, estrogen, prior VTE, recent surgery/trauma, unilateral leg swelling). Zero positives + low pretest probability rules PE out. The result echoes the age / HR / SaO2 cutoffs.',
    // Echo the three numeric criterion cutoffs so the documented thresholds
    // appear in the JSON (self-describing enrichment).
    compute: (a) => {
      const r = F.perc(a);
      return r == null ? null : { ...r, cutoffs: { ageYears: 50, hrBpm: 100, sao2Pct: 95 } };
    },
    fields: [
      { dom: 'pc-age', arg: 'age50', kind: 'bool', label: 'Age >= 50' },
      { dom: 'pc-hr', arg: 'hr100', kind: 'bool', label: 'HR >= 100' },
      { dom: 'pc-sao2', arg: 'sao2lt95', kind: 'bool', label: 'SaO2 < 95%' },
      { dom: 'pc-hemo', arg: 'hemoptysis', kind: 'bool', label: 'Hemoptysis' },
      { dom: 'pc-estrogen', arg: 'estrogen', kind: 'bool', label: 'Estrogen use' },
      { dom: 'pc-vte', arg: 'priorVte', kind: 'bool', label: 'Prior VTE' },
      { dom: 'pc-surg', arg: 'recentSurgery', kind: 'bool', label: 'Recent surgery or trauma' },
      { dom: 'pc-leg', arg: 'unilateralLegSwelling', kind: 'bool', label: 'Unilateral leg swelling' },
    ],
  },
  {
    id: 'wells-pe-geneva',
    summary: 'Wells PE (Wells 2000) and revised Geneva (Le Gal 2006) side by side: the seven weighted Wells criteria plus the eight Geneva items (heart rate entered as a number and banded 75-94 / >= 95). The result lists each fired Wells criterion with its point weight.',
    // The firedWellsPoints echo names the weight each checked Wells criterion
    // contributed (the weights the tile's own labels document).
    compute: (a) => {
      const wells = F.wellsPe(a);
      const geneva = F.geneva(a);
      const WELLS_POINTS = { dvtSigns: 3, alternativeDxLessLikely: 3, hr100: 1.5, immobilization: 1.5, priorVte: 1.5, hemoptysis: 1, malignancy: 1 };
      const firedWellsPoints = {};
      for (const [k, pts] of Object.entries(WELLS_POINTS)) if (a[k]) firedWellsPoints[k] = pts;
      return { wells, geneva, firedWellsPoints };
    },
    fields: [
      { dom: 'wp-dvt', arg: 'dvtSigns', kind: 'bool', label: 'Wells: clinical signs of DVT (3)' },
      { dom: 'wp-alt', arg: 'alternativeDxLessLikely', kind: 'bool', label: 'Wells: alternative diagnosis less likely (3)' },
      { dom: 'wp-hr', arg: 'hr100', kind: 'bool', label: 'Wells: HR > 100 (1.5)' },
      { dom: 'wp-immo', arg: 'immobilization', kind: 'bool', label: 'Wells: immobilization or surgery < 4 weeks (1.5)' },
      { dom: 'wp-vte', arg: 'priorVte', kind: 'bool', label: 'Wells + Geneva: prior VTE (1.5 / 3)' },
      { dom: 'wp-hemo', arg: 'hemoptysis', kind: 'bool', label: 'Wells + Geneva: hemoptysis (1 / 2)' },
      { dom: 'wp-mal', arg: 'malignancy', kind: 'bool', label: 'Wells: malignancy (1)' },
      { dom: 'gv-age', arg: 'age65', kind: 'bool', label: 'Geneva: age > 65 (1)' },
      { dom: 'gv-surg', arg: 'recentSurgery', kind: 'bool', label: 'Geneva: surgery / fracture < 1 month (2)' },
      { dom: 'gv-mal', arg: 'activeMalignancy', kind: 'bool', label: 'Geneva: active malignancy (2)' },
      { dom: 'gv-leg', arg: 'unilateralLegPain', kind: 'bool', label: 'Geneva: unilateral leg pain (3)' },
      { dom: 'gv-hr', arg: 'hr', kind: 'number', required: true, label: 'Geneva: heart rate (75-94 scores 3, >= 95 scores 5)', unit: 'bpm' },
      { dom: 'gv-exam', arg: 'lowerLimbExam', kind: 'bool', label: 'Geneva: pain on lower-limb deep palpation + unilateral edema (4)' },
    ],
  },
  {
    id: 'curb-65',
    summary: 'CURB-65 pneumonia severity (Lim 2003): confusion, BUN > 20 mg/dL, RR >= 30, SBP < 90 or DBP <= 60, age >= 65 (1 each); 0-1 outpatient, 2 consider hospitalization, >= 3 severe. The result echoes the age-65 cutoff.',
    compute: (a) => {
      const r = F.curb65(a);
      return r == null ? null : { ...r, ageCutoffYears: 65 };
    },
    fields: [
      { dom: 'cu-conf', arg: 'confusion', kind: 'bool', label: 'Confusion (new) (1)' },
      { dom: 'cu-bun', arg: 'bun20', kind: 'bool', label: 'BUN > 20 mg/dL (1)' },
      { dom: 'cu-rr', arg: 'rr30', kind: 'bool', label: 'RR >= 30/min (1)' },
      { dom: 'cu-bp', arg: 'sbp90OrDbp60', kind: 'bool', label: 'SBP < 90 or DBP <= 60 (1)' },
      { dom: 'cu-age', arg: 'age65', kind: 'bool', label: 'Age >= 65 (1)' },
    ],
  },
  {
    id: 'psi',
    summary: 'Pneumonia Severity Index / PORT (Fine 1997, condensed): age (female -10), residence and comorbidity points, exam findings, and optional labs (temperature, pH, BUN, sodium, glucose, hematocrit, PaO2); total points with risk class I-V.',
    compute: F.psi,
    fields: [
      { dom: 'ps-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ps-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'ps-nh', arg: 'nursingHome', kind: 'bool', label: 'Nursing home resident (+10)' },
      { dom: 'ps-neo', arg: 'neoplasm', kind: 'bool', label: 'Neoplasm (+30)' },
      { dom: 'ps-liv', arg: 'liverDisease', kind: 'bool', label: 'Liver disease (+20)' },
      { dom: 'ps-chf', arg: 'chf', kind: 'bool', label: 'CHF (+10)' },
      { dom: 'ps-cva', arg: 'cerebrovascular', kind: 'bool', label: 'Cerebrovascular disease (+10)' },
      { dom: 'ps-ren', arg: 'renalDisease', kind: 'bool', label: 'Renal disease (+10)' },
      { dom: 'ps-am', arg: 'alteredMental', kind: 'bool', label: 'Altered mental status (+20)' },
      { dom: 'ps-rr', arg: 'rr30', kind: 'bool', label: 'RR >= 30 (+20)' },
      { dom: 'ps-sbp', arg: 'sbp90', kind: 'bool', label: 'SBP < 90 (+20)' },
      { dom: 'ps-hr', arg: 'hr125', kind: 'bool', label: 'HR >= 125 (+10)' },
      { dom: 'ps-pl', arg: 'pleuralEffusion', kind: 'bool', label: 'Pleural effusion (+10)' },
      { dom: 'ps-t', arg: 'temp', kind: 'number', label: 'Temperature (optional; < 35 or >= 40 scores +15)', unit: 'C' },
      { dom: 'ps-ph', arg: 'ph', kind: 'number', label: 'Arterial pH (optional; < 7.35 scores +30)' },
      { dom: 'ps-bun', arg: 'bun', kind: 'number', label: 'BUN (optional; >= 30 scores +20)', unit: 'mg/dL' },
      { dom: 'ps-na', arg: 'sodium', kind: 'number', label: 'Sodium (optional; < 130 scores +20)', unit: 'mEq/L' },
      { dom: 'ps-g', arg: 'glucose', kind: 'number', label: 'Glucose (optional; >= 250 scores +10)', unit: 'mg/dL' },
      { dom: 'ps-hct', arg: 'hct', kind: 'number', label: 'Hematocrit (optional; < 30 scores +10)', unit: '%' },
      { dom: 'ps-pao2', arg: 'pao2', kind: 'number', label: 'PaO2 (optional; < 60 scores +10)', unit: 'mmHg' },
    ],
  },
  {
    id: 'qsofa-sofa',
    summary: 'qSOFA (RR >= 22, altered mentation, SBP <= 100; >= 2 flags high risk) and total SOFA (six organ systems each pre-graded 0-4, unsupplied systems score 0) side by side.',
    compute: (a) => ({ qsofa: F.qsofa(a), sofa: F.sofa(a) }),
    fields: [
      { dom: 'q-rr', arg: 'rr22', kind: 'bool', label: 'qSOFA: RR >= 22/min' },
      { dom: 'q-am', arg: 'alteredMental', kind: 'bool', label: 'qSOFA: altered mental status' },
      { dom: 'q-sbp', arg: 'sbp100', kind: 'bool', label: 'qSOFA: SBP <= 100' },
      { dom: 's-resp', arg: 'respiration', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'SOFA: respiration grade', to: (v) => Number(v) },
      { dom: 's-coag', arg: 'coagulation', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'SOFA: coagulation grade', to: (v) => Number(v) },
      { dom: 's-liv', arg: 'liver', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'SOFA: liver grade', to: (v) => Number(v) },
      { dom: 's-cv', arg: 'cardiovascular', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'SOFA: cardiovascular grade', to: (v) => Number(v) },
      { dom: 's-cns', arg: 'cns', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'SOFA: CNS grade', to: (v) => Number(v) },
      { dom: 's-ren', arg: 'renal', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'SOFA: renal grade', to: (v) => Number(v) },
    ],
  },
  {
    id: 'meld-childpugh',
    summary: 'MELD-3.0 (Kim 2021; labs clamped to approved ranges, dialysis sets creatinine to 3.0) and Child-Pugh (five components graded 1/2/3, class A/B/C) from one shared lab panel. Bilirubin is entered in mg/dL. The result echoes the albumin input.',
    compute: (a) => {
      const meld = F.meld30(a);
      const childPugh = F.childPugh(a);
      return { meld, childPugh, albuminGdl: a.albumin };
    },
    fields: [
      { dom: 'm-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Bilirubin', unit: 'mg/dL' },
      { dom: 'm-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'm-cr', arg: 'creatinine', kind: 'number', required: true, label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'm-na', arg: 'sodium', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'm-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
      { dom: 'm-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'm-dial', arg: 'hadDialysisTwiceLastWeek', kind: 'bool', label: 'Hemodialysis at least twice in past week' },
      { dom: 'cp-asc', arg: 'ascites', kind: 'enum', values: ['none', 'mild', 'severe'], required: true, label: 'Ascites (Child-Pugh)' },
      { dom: 'cp-enc', arg: 'encephalopathy', kind: 'enum', values: ['none', 'grade1-2', 'grade3-4'], required: true, label: 'Encephalopathy (Child-Pugh)' },
    ],
  },
  {
    id: 'ranson-bisap',
    summary: 'Ranson criteria (5 admission + 6 at-48-hour booleans, mortality band) and BISAP (BUN > 25, altered mentation, SIRS, age > 60, pleural effusion) side by side for pancreatitis severity.',
    // Rebuild the lib's two nested boolean groups from the flat args.
    compute: (a) => {
      const ranson = F.ranson({
        admission: { age: a.admAge, wbc: a.admWbc, glucose: a.admGlucose, ldh: a.admLdh, ast: a.admAst },
        fortyEightHour: { hct: a.h48Hct, bun: a.h48Bun, calcium: a.h48Calcium, pao2: a.h48Pao2, baseDeficit: a.h48BaseDeficit, fluid: a.h48Fluid },
      });
      const bisap = F.bisap(a);
      return { ranson, bisap };
    },
    fields: [
      { dom: 'r-age', arg: 'admAge', kind: 'bool', label: 'Ranson admission: age > 55' },
      { dom: 'r-wbc', arg: 'admWbc', kind: 'bool', label: 'Ranson admission: WBC > 16k' },
      { dom: 'r-glu', arg: 'admGlucose', kind: 'bool', label: 'Ranson admission: glucose > 200 mg/dL' },
      { dom: 'r-ldh', arg: 'admLdh', kind: 'bool', label: 'Ranson admission: LDH > 350 IU/L' },
      { dom: 'r-ast', arg: 'admAst', kind: 'bool', label: 'Ranson admission: AST > 250 IU/L' },
      { dom: 'r-hct', arg: 'h48Hct', kind: 'bool', label: 'Ranson 48 h: hematocrit drop > 10%' },
      { dom: 'r-bun', arg: 'h48Bun', kind: 'bool', label: 'Ranson 48 h: BUN rise > 5 mg/dL' },
      { dom: 'r-calc', arg: 'h48Calcium', kind: 'bool', label: 'Ranson 48 h: calcium < 8 mg/dL' },
      { dom: 'r-pao2', arg: 'h48Pao2', kind: 'bool', label: 'Ranson 48 h: PaO2 < 60 mmHg' },
      { dom: 'r-base', arg: 'h48BaseDeficit', kind: 'bool', label: 'Ranson 48 h: base deficit > 4 mEq/L' },
      { dom: 'r-fluid', arg: 'h48Fluid', kind: 'bool', label: 'Ranson 48 h: fluid sequestration > 6 L' },
      { dom: 'b-bun', arg: 'bun25', kind: 'bool', label: 'BISAP: BUN > 25 mg/dL' },
      { dom: 'b-am', arg: 'alteredMental', kind: 'bool', label: 'BISAP: altered mental status' },
      { dom: 'b-sirs', arg: 'sirs', kind: 'bool', label: 'BISAP: SIRS' },
      { dom: 'b-age', arg: 'age60', kind: 'bool', label: 'BISAP: age > 60' },
      { dom: 'b-pl', arg: 'pleuralEffusion', kind: 'bool', label: 'BISAP: pleural effusion' },
    ],
  },
  {
    id: 'centor',
    summary: 'Centor strep-pharyngitis score (tonsillar exudate, tender anterior adenopathy, fever history, absence of cough; 1 each) with the McIsaac age modifier (3-14 years +1, >= 45 years -1) computed from the same criteria.',
    compute: (a) => ({ centor: F.centor(a), mcisaac: F.mcisaac(a) }),
    fields: [
      { dom: 'ce-exud', arg: 'tonsillarExudate', kind: 'bool', label: 'Tonsillar exudate (1)' },
      { dom: 'ce-aden', arg: 'tenderAnteriorAdenopathy', kind: 'bool', label: 'Tender anterior cervical adenopathy (1)' },
      { dom: 'ce-fever', arg: 'feverHistory', kind: 'bool', label: 'History of fever > 38 C (1)' },
      { dom: 'ce-cough', arg: 'absenceOfCough', kind: 'bool', label: 'Absence of cough (1)' },
      { dom: 'ce-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age (McIsaac modifier)', unit: 'years' },
    ],
  },
  {
    id: 'wells-dvt-caprini',
    summary: 'Wells DVT criteria (nine 1-point findings minus 2 for an as-likely alternative diagnosis; low / moderate / high) beside the Caprini VTE risk total (entered as summed points, banded very low / low / moderate / high).',
    // Wells DVT reuses the pure lib/clinical.js compute; Caprini takes the
    // summed points the tile collects as a single number.
    compute: (a) => ({
      wellsDvt: clinicalWellsDvt(a),
      caprini: F.caprini({ items: [{ points: a.capriniPoints }] }),
    }),
    fields: [
      { dom: 'wd-cancer', arg: 'activeCancer', kind: 'bool', label: 'Wells: active cancer (1)' },
      { dom: 'wd-paralysis', arg: 'paralysis', kind: 'bool', label: 'Wells: paralysis or recent leg immobilization (1)' },
      { dom: 'wd-bedrest', arg: 'recentBedrest', kind: 'bool', label: 'Wells: bedridden > 3 days or surgery < 12 weeks (1)' },
      { dom: 'wd-tender', arg: 'tendernessAlongVeins', kind: 'bool', label: 'Wells: localized tenderness along deep veins (1)' },
      { dom: 'wd-leg', arg: 'entireLegSwollen', kind: 'bool', label: 'Wells: entire leg swollen (1)' },
      { dom: 'wd-calf', arg: 'calfSwellingGt3cm', kind: 'bool', label: 'Wells: calf swelling > 3 cm (1)' },
      { dom: 'wd-edema', arg: 'pittingEdema', kind: 'bool', label: 'Wells: pitting edema in symptomatic leg (1)' },
      { dom: 'wd-collat', arg: 'collateralVeins', kind: 'bool', label: 'Wells: collateral superficial veins (1)' },
      { dom: 'wd-prior', arg: 'priorDvt', kind: 'bool', label: 'Wells: previously documented DVT (1)' },
      { dom: 'wd-alt', arg: 'alternativeDxAsLikely', kind: 'bool', label: 'Wells: alternative diagnosis as likely or more likely (-2)' },
      { dom: 'cap-pts', arg: 'capriniPoints', kind: 'number', required: true, label: 'Caprini total points (summed weighted items)' },
    ],
  },
  {
    id: 'bishop',
    summary: 'Bishop score for cervical favorability: dilation, effacement, and station banded to 0-3, consistency and position to 0-2; total 0-13 (<= 5 unfavorable, 6-8 intermediate, >= 9 favorable).',
    compute: F.bishop,
    fields: [
      { dom: 'bp-d', arg: 'dilation', kind: 'number', required: true, label: 'Dilation', unit: 'cm' },
      { dom: 'bp-e', arg: 'effacement', kind: 'number', required: true, label: 'Effacement', unit: '%' },
      { dom: 'bp-s', arg: 'station', kind: 'number', required: true, label: 'Station (-3 to +2)' },
      { dom: 'bp-c', arg: 'consistency', kind: 'enum', values: ['firm', 'medium', 'soft'], required: true, label: 'Consistency' },
      { dom: 'bp-p', arg: 'position', kind: 'enum', values: ['posterior', 'mid', 'anterior'], required: true, label: 'Position' },
    ],
  },
  {
    id: 'alvarado-pas',
    summary: 'Alvarado / MANTRELS appendicitis score (RLQ tenderness and leukocytosis 2 points, the other six 1 point; 0-10) beside the Pediatric Appendicitis Score (cough/hop tenderness and RLQ tenderness 2 points, the other six 1 point; 0-10).',
    compute: (a) => ({
      alvarado: F.alvarado(a),
      pas: F.pediatricAppendicitis({
        coughHopTenderness: a.coughHopTenderness, rlqTenderness: a.pasRlqTenderness,
        migration: a.pasMigration, anorexia: a.pasAnorexia, fever: a.pasFever,
        nausea: a.pasNausea, leukocytosis: a.pasLeukocytosis, leftShift: a.pasLeftShift,
      }),
    }),
    fields: [
      { dom: 'a-mig', arg: 'migration', kind: 'bool', label: 'Alvarado: migration of pain to RLQ (1)' },
      { dom: 'a-anx', arg: 'anorexia', kind: 'bool', label: 'Alvarado: anorexia (1)' },
      { dom: 'a-nau', arg: 'nausea', kind: 'bool', label: 'Alvarado: nausea / vomiting (1)' },
      { dom: 'a-rlq', arg: 'rlqTenderness', kind: 'bool', label: 'Alvarado: RLQ tenderness (2)' },
      { dom: 'a-reb', arg: 'reboundTenderness', kind: 'bool', label: 'Alvarado: rebound tenderness (1)' },
      { dom: 'a-temp', arg: 'elevatedTemp', kind: 'bool', label: 'Alvarado: elevated temperature (1)' },
      { dom: 'a-wbc', arg: 'leukocytosis', kind: 'bool', label: 'Alvarado: leukocytosis (2)' },
      { dom: 'a-shift', arg: 'leftShift', kind: 'bool', label: 'Alvarado: left shift (1)' },
      { dom: 'p-cough', arg: 'coughHopTenderness', kind: 'bool', label: 'PAS: cough / hop / percussion tenderness (2)' },
      { dom: 'p-rlq', arg: 'pasRlqTenderness', kind: 'bool', label: 'PAS: RLQ tenderness (2)' },
      { dom: 'p-mig', arg: 'pasMigration', kind: 'bool', label: 'PAS: migration of pain (1)' },
      { dom: 'p-anx', arg: 'pasAnorexia', kind: 'bool', label: 'PAS: anorexia (1)' },
      { dom: 'p-fev', arg: 'pasFever', kind: 'bool', label: 'PAS: fever (1)' },
      { dom: 'p-nau', arg: 'pasNausea', kind: 'bool', label: 'PAS: nausea (1)' },
      { dom: 'p-wbc', arg: 'pasLeukocytosis', kind: 'bool', label: 'PAS: leukocytosis (1)' },
      { dom: 'p-shift', arg: 'pasLeftShift', kind: 'bool', label: 'PAS: left shift (1)' },
    ],
  },

  // --- wave 57: the ICU bedside assessment / early-warning cluster ---------
  {
    id: 'news2',
    summary: 'NEWS2 (RCP 2017): respiratory rate, SpO2 (Scale 1, or Scale 2 for hypercapnic respiratory failure), supplemental oxygen, SBP, pulse, ACVPU consciousness, and temperature scored per parameter; aggregate 0-20 with the RCP escalation band and per-parameter breakdown. Temperature is entered in degrees Celsius.',
    compute: F.news2,
    fields: [
      { dom: 'n2-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'n2-spo2', arg: 'spo2', kind: 'number', required: true, label: 'SpO2', unit: '%' },
      { dom: 'n2-scale2', arg: 'scale2', kind: 'bool', label: 'Use SpO2 Scale 2 (hypercapnic / chronic type II respiratory failure)' },
      { dom: 'n2-o2', arg: 'onO2', kind: 'bool', label: 'On supplemental oxygen (+2)' },
      { dom: 'n2-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'n2-pulse', arg: 'pulse', kind: 'number', required: true, label: 'Pulse', unit: 'bpm' },
      { dom: 'n2-acvpu', arg: 'acvpu', kind: 'enum', values: ['A', 'C', 'V', 'P', 'U'], required: true, label: 'Consciousness (ACVPU; anything but A scores 3)' },
      { dom: 'n2-temp', arg: 'temp', kind: 'number', required: true, label: 'Temperature', unit: 'C' },
    ],
  },
  {
    id: 'mews',
    summary: 'Modified Early Warning Score (Subbe 2001): SBP, pulse, respiratory rate, temperature (Celsius), and AVPU each banded to 0-3; aggregate with the Subbe risk band and per-parameter breakdown.',
    compute: F.mews,
    fields: [
      { dom: 'me-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'me-pulse', arg: 'pulse', kind: 'number', required: true, label: 'Pulse', unit: 'bpm' },
      { dom: 'me-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'me-temp', arg: 'temp', kind: 'number', required: true, label: 'Temperature', unit: 'C' },
      { dom: 'me-avpu', arg: 'avpu', kind: 'enum', values: ['A', 'V', 'P', 'U'], required: true, label: 'Consciousness (AVPU scores 0-3)' },
    ],
  },
  {
    id: 'sirs',
    summary: 'SIRS criteria (Bone 1992): temperature > 38 or < 36 C, HR > 90, RR > 20 or PaCO2 < 32, WBC > 12 or < 4 or > 10% bands; >= 2 of 4 is SIRS-positive. Sepsis-3 deprecated SIRS for sepsis screening; provided for auditing local protocol triggers.',
    compute: F.sirs,
    fields: [
      { dom: 'sr-temp', arg: 'tempAbnormal', kind: 'bool', label: 'Temperature > 38 C or < 36 C' },
      { dom: 'sr-hr', arg: 'hrGt90', kind: 'bool', label: 'Heart rate > 90 bpm' },
      { dom: 'sr-resp', arg: 'rrOrPaco2', kind: 'bool', label: 'RR > 20/min or PaCO2 < 32 mmHg' },
      { dom: 'sr-wbc', arg: 'wbcOrBands', kind: 'bool', label: 'WBC > 12 or < 4 (x10^9/L) or > 10% bands' },
    ],
  },
  {
    id: 'killip',
    summary: 'Killip classification for acute MI (Killip & Kimball 1967): class I-IV by heart-failure signs, with the original-cohort in-hospital mortality percentage.',
    compute: F.killip,
    fields: [
      { dom: 'kp-class', arg: 'klass', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'Killip class (I no HF signs / II rales or S3 / III pulmonary edema / IV cardiogenic shock)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'mods',
    summary: 'Multiple Organ Dysfunction Score (Marshall 1995): six organ systems graded 0-4 from P/F ratio, creatinine, bilirubin, pressure-adjusted heart rate (HR x CVP / MAP), platelets, and GCS; total 0-24 with ICU-mortality band and per-organ subscores.',
    compute: F.mods,
    fields: [
      { dom: 'mods-pf', arg: 'pfRatio', kind: 'number', required: true, label: 'PaO2 / FiO2 ratio' },
      { dom: 'mods-cr', arg: 'creatinineMgDl', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'mods-bili', arg: 'bilirubinMgDl', kind: 'number', required: true, label: 'Total bilirubin', unit: 'mg/dL' },
      { dom: 'mods-par', arg: 'par', kind: 'number', required: true, label: 'Pressure-adjusted heart rate (HR x CVP / MAP)' },
      { dom: 'mods-plt', arg: 'plateletsK', kind: 'number', required: true, label: 'Platelets', unit: 'x10^9/L' },
      { dom: 'mods-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale (3-15)' },
    ],
  },
  {
    id: 'rass',
    summary: 'Richmond Agitation-Sedation Scale (Sessler 2002): one level from -5 (unarousable) to +4 (combative), with the level descriptor and the SCCM PADIS 2018 light-sedation target band (-2 to 0).',
    compute: F.rass,
    fields: [
      { dom: 'rs-level', arg: 'level', kind: 'enum', values: ['4', '3', '2', '1', '0', '-1', '-2', '-3', '-4', '-5'], required: true, label: 'RASS level (+4 combative ... 0 alert and calm ... -5 unarousable)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'sas-riker',
    summary: 'Riker Sedation-Agitation Scale (Riker 1999): one level 1 (unarousable) to 7 (dangerous agitation), with the descriptor and the SAS 3-4 light-sedation goal band.',
    compute: F.sasRiker,
    fields: [
      { dom: 'sk-level', arg: 'level', kind: 'enum', values: ['1', '2', '3', '4', '5', '6', '7'], required: true, label: 'SAS level (1 unarousable ... 4 calm and cooperative ... 7 dangerous agitation)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'cam-icu',
    summary: 'CAM-ICU delirium screen (Ely 2001): positive when feature 1 (acute onset or fluctuating course) AND feature 2 (inattention) AND either feature 3 (altered consciousness, RASS != 0) or feature 4 (disorganized thinking).',
    compute: F.camIcu,
    fields: [
      { dom: 'ci-f1', arg: 'acuteOnsetOrFluctuating', kind: 'bool', label: 'Feature 1: acute onset of mental-status change or fluctuating course' },
      { dom: 'ci-f2', arg: 'inattention', kind: 'bool', label: 'Feature 2: inattention (>= 2 ASE errors)' },
      { dom: 'ci-f3', arg: 'alteredLoc', kind: 'bool', label: 'Feature 3: altered level of consciousness (current RASS != 0)' },
      { dom: 'ci-f4', arg: 'disorganizedThinking', kind: 'bool', label: 'Feature 4: disorganized thinking' },
    ],
  },
  {
    id: 'icdsc',
    summary: 'Intensive Care Delirium Screening Checklist (Bergeron 2001): eight binary items over the shift; score >= 4 of 8 indicates delirium.',
    compute: F.icdsc,
    fields: [
      { dom: 'id-a', arg: 'alteredLoc', kind: 'bool', label: 'Altered level of consciousness' },
      { dom: 'id-b', arg: 'inattention', kind: 'bool', label: 'Inattention' },
      { dom: 'id-c', arg: 'disorientation', kind: 'bool', label: 'Disorientation' },
      { dom: 'id-d', arg: 'hallucination', kind: 'bool', label: 'Hallucination, delusion, or psychosis' },
      { dom: 'id-e', arg: 'psychomotor', kind: 'bool', label: 'Psychomotor agitation or retardation' },
      { dom: 'id-f', arg: 'inappropriateSpeechOrMood', kind: 'bool', label: 'Inappropriate speech or mood' },
      { dom: 'id-g', arg: 'sleepWakeDisturbance', kind: 'bool', label: 'Sleep / wake cycle disturbance' },
      { dom: 'id-h', arg: 'symptomFluctuation', kind: 'bool', label: 'Symptom fluctuation' },
    ],
  },
  {
    id: '4at',
    summary: '4AT rapid delirium screen (MacLullich 2019): abnormal alertness (0 or 4), AMT4 errors (0/1/2), attention by months backwards (0/1/2), acute change or fluctuating course (0 or 4); total 0-12, >= 4 possible delirium.',
    compute: F.fourAt,
    fields: [
      { dom: 'fa-alert', arg: 'alertnessAbnormal', kind: 'bool', label: 'Alertness clearly abnormal (drowsy or agitated) (0 or 4)' },
      { dom: 'fa-amt', arg: 'amt4Errors', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'AMT4 errors (0 none / 1 one / 2 two or more or untestable)', to: (v) => Number(v) },
      { dom: 'fa-att', arg: 'attentionScore', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Attention, months backwards (0 reaches July / 1 starts but < 7 / 2 untestable)', to: (v) => Number(v) },
      { dom: 'fa-acute', arg: 'acuteChange', kind: 'bool', label: 'Acute change or fluctuating course (0 or 4)' },
    ],
  },
  {
    id: 'cpot',
    summary: 'Critical-Care Pain Observation Tool (Gelinas 2006): facial expression, body movements, muscle tension, and ventilator compliance / vocalization each 0-2; total 0-8, >= 3 unacceptable pain.',
    compute: F.cpot,
    fields: [
      { dom: 'cp-f', arg: 'facial', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Facial expression (0 relaxed / 1 tense / 2 grimacing)', to: (v) => Number(v) },
      { dom: 'cp-b', arg: 'body', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Body movements (0 absent / 1 protection / 2 restlessness)', to: (v) => Number(v) },
      { dom: 'cp-m', arg: 'muscleTension', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Muscle tension (0 relaxed / 1 tense / 2 very tense or rigid)', to: (v) => Number(v) },
      { dom: 'cp-c', arg: 'complianceOrVocalization', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Ventilator compliance (intubated) or vocalization (extubated) (0-2)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'bps',
    summary: 'Behavioral Pain Scale (Payen 2001) for the ventilated patient: facial expression, upper-limb movements, and ventilator compliance each 1-4; total 3-12, > 5 unacceptable pain.',
    compute: F.bps,
    fields: [
      { dom: 'bp-f', arg: 'facial', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'Facial expression (1 relaxed ... 4 grimacing)', to: (v) => Number(v) },
      { dom: 'bp-u', arg: 'upperLimb', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'Upper-limb movements (1 none ... 4 permanently retracted)', to: (v) => Number(v) },
      { dom: 'bp-v', arg: 'ventilatorCompliance', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'Ventilator compliance (1 tolerating ... 4 unable to control ventilation)', to: (v) => Number(v) },
    ],
  },

  // --- wave 58: cognition / withdrawal / sleep / periop assessment ---------
  {
    id: 'mini-cog',
    summary: 'Mini-Cog dementia screen: three-word recall (0-3) plus a normal clock draw (2 points); total 0-5, >= 3 is a negative screen. The result echoes the 5-point maximum.',
    compute: (a) => {
      const r = F.miniCog(a);
      return r == null ? null : { ...r, maxScore: 5 };
    },
    fields: [
      { dom: 'mc-w', arg: 'wordsRecalled', kind: 'number', required: true, label: 'Words recalled (0-3)' },
      { dom: 'mc-clock', arg: 'clockNormal', kind: 'bool', label: 'Clock draw is normal (2 points)' },
    ],
  },
  {
    id: 'ciwa',
    summary: 'CIWA-Ar alcohol-withdrawal scale (Sullivan 1989): nine symptoms graded 0-7 (nausea, tremor, sweats, anxiety, agitation, tactile / auditory / visual disturbances, headache) plus orientation 0-4; total 0-67 with the standard <8 / 8-15 / 16-20 / >20 bands.',
    compute: F.ciwaAr,
    fields: [
      { dom: 'cw-nau', arg: 'nausea', kind: 'number', required: true, label: 'Nausea / vomiting (0-7)' },
      { dom: 'cw-tre', arg: 'tremor', kind: 'number', required: true, label: 'Tremor (0-7)' },
      { dom: 'cw-swt', arg: 'sweats', kind: 'number', required: true, label: 'Paroxysmal sweats (0-7)' },
      { dom: 'cw-anx', arg: 'anxiety', kind: 'number', required: true, label: 'Anxiety (0-7)' },
      { dom: 'cw-agi', arg: 'agitation', kind: 'number', required: true, label: 'Agitation (0-7)' },
      { dom: 'cw-tac', arg: 'tactile', kind: 'number', required: true, label: 'Tactile disturbances (0-7)' },
      { dom: 'cw-aud', arg: 'auditory', kind: 'number', required: true, label: 'Auditory disturbances (0-7)' },
      { dom: 'cw-vis', arg: 'visual', kind: 'number', required: true, label: 'Visual disturbances (0-7)' },
      { dom: 'cw-hea', arg: 'headache', kind: 'number', required: true, label: 'Headache (0-7)' },
      { dom: 'cw-ori', arg: 'orientation', kind: 'number', required: true, label: 'Orientation / clouding of sensorium (0-4)' },
    ],
  },
  {
    id: 'cows',
    summary: 'Clinical Opiate Withdrawal Scale (Wesson & Ling 2003): eleven pre-graded items per the COWS scoring sheet (resting pulse, sweating, restlessness, pupil size, bone/joint aches, runny nose/tearing, GI upset, tremor, yawning, anxiety/irritability, gooseflesh); 5-12 mild, 13-24 moderate, 25-36 moderately severe, > 36 severe.',
    compute: F.cows,
    fields: [
      { dom: 'co-pul', arg: 'pulse', kind: 'number', required: true, label: 'Resting pulse points (0/1/2/4)' },
      { dom: 'co-swt', arg: 'sweating', kind: 'number', required: true, label: 'Sweating points (0-4)' },
      { dom: 'co-rest', arg: 'restlessness', kind: 'number', required: true, label: 'Restlessness points (0/1/3/5)' },
      { dom: 'co-pup', arg: 'pupil', kind: 'number', required: true, label: 'Pupil size points (0/1/2/5)' },
      { dom: 'co-jt', arg: 'jointAches', kind: 'number', required: true, label: 'Bone / joint aches points (0/1/2/4)' },
      { dom: 'co-rn', arg: 'runnyNose', kind: 'number', required: true, label: 'Runny nose / tearing points (0-4)' },
      { dom: 'co-gi', arg: 'gi', kind: 'number', required: true, label: 'GI upset points (0/1/2/3/5)' },
      { dom: 'co-tre', arg: 'tremor', kind: 'number', required: true, label: 'Tremor points (0-4)' },
      { dom: 'co-yaw', arg: 'yawning', kind: 'number', required: true, label: 'Yawning points (0-4)' },
      { dom: 'co-anx', arg: 'anxiety', kind: 'number', required: true, label: 'Anxiety / irritability points (0/1/2/4)' },
      { dom: 'co-goose', arg: 'gooseflesh', kind: 'number', required: true, label: 'Gooseflesh skin points (0/3/5)' },
    ],
  },
  {
    id: 'epworth',
    summary: 'Epworth Sleepiness Scale (Johns 1991): eight dozing scenarios each 0-3; total 0-24 (0-10 normal, 11-14 mild, 15-17 moderate, 18-24 severe daytime sleepiness).',
    compute: F.epworth,
    fields: [
      { dom: 'ep-read', arg: 'reading', kind: 'number', required: true, label: 'Sitting and reading (0-3)' },
      { dom: 'ep-tv', arg: 'tv', kind: 'number', required: true, label: 'Watching TV (0-3)' },
      { dom: 'ep-pub', arg: 'publicPlace', kind: 'number', required: true, label: 'Sitting inactive in a public place (0-3)' },
      { dom: 'ep-car', arg: 'carPassenger', kind: 'number', required: true, label: 'Car passenger for an hour (0-3)' },
      { dom: 'ep-lying', arg: 'lyingDown', kind: 'number', required: true, label: 'Lying down to rest in the afternoon (0-3)' },
      { dom: 'ep-talk', arg: 'sittingTalking', kind: 'number', required: true, label: 'Sitting and talking to someone (0-3)' },
      { dom: 'ep-lunch', arg: 'afterLunch', kind: 'number', required: true, label: 'Sitting quietly after lunch without alcohol (0-3)' },
      { dom: 'ep-traffic', arg: 'carTraffic', kind: 'number', required: true, label: 'In a car stopped in traffic (0-3)' },
    ],
  },
  {
    id: 'stop-bang',
    summary: 'STOP-BANG OSA screen (Chung 2012): snoring, tiredness, observed apnea, high blood pressure, BMI > 35, age > 50, neck > 40 cm, male sex (1 each); 0-2 low, 3-4 intermediate, >= 5 high risk for moderate-to-severe OSA.',
    compute: F.stopBang,
    fields: [
      { dom: 'sb-s', arg: 'snore', kind: 'bool', label: 'Snore loudly' },
      { dom: 'sb-t', arg: 'tired', kind: 'bool', label: 'Daytime tiredness / sleepiness' },
      { dom: 'sb-o', arg: 'observedApnea', kind: 'bool', label: 'Observed apnea' },
      { dom: 'sb-p', arg: 'highBp', kind: 'bool', label: 'High blood pressure' },
      { dom: 'sb-b', arg: 'bmiGt35', kind: 'bool', label: 'BMI > 35 kg/m^2' },
      { dom: 'sb-a', arg: 'ageGt50', kind: 'bool', label: 'Age > 50 years' },
      { dom: 'sb-n', arg: 'neckGt40cm', kind: 'bool', label: 'Neck circumference > 40 cm' },
      { dom: 'sb-g', arg: 'male', kind: 'bool', label: 'Male sex' },
    ],
  },
  {
    id: 'berlin-osa',
    summary: 'Berlin Questionnaire for OSA (Netzer 1999): category 1 snoring (positive if >= 2 of 5), category 2 daytime sleepiness (positive if >= 2 of 3), category 3 hypertension or BMI > 30; >= 2 positive categories = high risk.',
    compute: F.berlinOsa,
    fields: [
      { dom: 'bo-q1', arg: 'q1Snore', kind: 'bool', label: 'Cat 1: do you snore?' },
      { dom: 'bo-q2', arg: 'q2LouderThanTalking', kind: 'bool', label: 'Cat 1: snoring louder than talking' },
      { dom: 'bo-q3', arg: 'q3FreqAtLeast3to4PerWeek', kind: 'bool', label: 'Cat 1: snoring >= 3-4 times per week' },
      { dom: 'bo-q4', arg: 'q4BotheredOthers', kind: 'bool', label: 'Cat 1: snoring bothered other people' },
      { dom: 'bo-q5', arg: 'q5ObservedApneaAtLeast3to4PerWeek', kind: 'bool', label: 'Cat 1: observed breathing pauses >= 3-4 times per week' },
      { dom: 'bo-q6', arg: 'q6TiredAfterSleepAtLeast3to4PerWeek', kind: 'bool', label: 'Cat 2: tired after sleep >= 3-4 times per week' },
      { dom: 'bo-q7', arg: 'q7TiredDuringDayAtLeast3to4PerWeek', kind: 'bool', label: 'Cat 2: tired during waking hours >= 3-4 times per week' },
      { dom: 'bo-q8', arg: 'q8NoddedOffWhileDriving', kind: 'bool', label: 'Cat 2: nodded off while driving' },
      { dom: 'bo-htn', arg: 'hasHypertension', kind: 'bool', label: 'Cat 3: hypertension' },
      { dom: 'bo-bmi', arg: 'bmiGt30', kind: 'bool', label: 'Cat 3: BMI > 30 kg/m^2' },
    ],
  },
  {
    id: 'apfel',
    summary: 'Apfel simplified PONV risk score (Apfel 1999): female sex, nonsmoker, history of PONV or motion sickness, postoperative opioids (1 each); predicted PONV risk ~10/20/40/60/80% for scores 0-4.',
    compute: F.apfel,
    fields: [
      { dom: 'ap-female', arg: 'female', kind: 'bool', label: 'Female sex' },
      { dom: 'ap-nonsmoker', arg: 'nonsmoker', kind: 'bool', label: 'Nonsmoker' },
      { dom: 'ap-hx', arg: 'historyPonvOrMotionSickness', kind: 'bool', label: 'History of PONV or motion sickness' },
      { dom: 'ap-opioid', arg: 'postopOpioids', kind: 'bool', label: 'Postoperative opioids' },
    ],
  },
  {
    id: 'aldrete',
    summary: 'Modified Aldrete PACU recovery score (Aldrete 1995): activity, respiration, circulation, consciousness, oxygen saturation each 0-2; total 0-10, >= 9 ready for PACU discharge.',
    compute: F.aldrete,
    fields: [
      { dom: 'al-act', arg: 'activity', kind: 'number', required: true, label: 'Activity (0-2)' },
      { dom: 'al-resp', arg: 'respiration', kind: 'number', required: true, label: 'Respiration (0-2)' },
      { dom: 'al-circ', arg: 'circulation', kind: 'number', required: true, label: 'Circulation (0-2)' },
      { dom: 'al-cons', arg: 'consciousness', kind: 'number', required: true, label: 'Consciousness (0-2)' },
      { dom: 'al-o2', arg: 'oxygenSaturation', kind: 'number', required: true, label: 'Oxygen saturation (0-2)' },
    ],
  },
  {
    id: 'lemon',
    summary: 'LEMON difficult-airway assessment (Reed 2005): look externally, the 3-3-2 rule (one point per failed measurement), Mallampati >= III, obstruction/obesity, limited neck mobility; total 0-7 with the 3-3-2 subtotal reported.',
    compute: F.lemon,
    fields: [
      { dom: 'le-look', arg: 'lookExternal', kind: 'bool', label: 'Look externally: abnormal facial features (1)' },
      { dom: 'le-incisor', arg: 'incisorLt3fb', kind: 'bool', label: '3-3-2: incisor opening < 3 fingerbreadths (1)' },
      { dom: 'le-hyoid', arg: 'hyoidMentalLt3fb', kind: 'bool', label: '3-3-2: hyoid-mental distance < 3 fingerbreadths (1)' },
      { dom: 'le-thyroid', arg: 'thyroidFloorLt2fb', kind: 'bool', label: '3-3-2: thyroid-to-floor-of-mouth < 2 fingerbreadths (1)' },
      { dom: 'le-mp', arg: 'mallampatiGte3', kind: 'bool', label: 'Mallampati class >= III (1)' },
      { dom: 'le-obs', arg: 'obstruction', kind: 'bool', label: 'Obstruction or obesity (1)' },
      { dom: 'le-neck', arg: 'neckMobilityLimited', kind: 'bool', label: 'Limited neck mobility (1)' },
    ],
  },
  {
    id: 'white-song',
    summary: 'White-Song fast-track eligibility score (White 1999): seven domains each 0-2 (LOC, physical activity, hemodynamic and respiratory stability, oxygen saturation, postoperative pain, emetic symptoms); total 0-14, fast-track eligible at >= 12 with no domain below 1.',
    compute: F.whiteSong,
    fields: [
      { dom: 'ws-loc', arg: 'loc', kind: 'number', required: true, label: 'Level of consciousness (0-2)' },
      { dom: 'ws-act', arg: 'physicalActivity', kind: 'number', required: true, label: 'Physical activity (0-2)' },
      { dom: 'ws-hd', arg: 'hemodynamicStability', kind: 'number', required: true, label: 'Hemodynamic stability (0-2)' },
      { dom: 'ws-resp', arg: 'respiratoryStability', kind: 'number', required: true, label: 'Respiratory stability (0-2)' },
      { dom: 'ws-o2', arg: 'oxygenSaturation', kind: 'number', required: true, label: 'Oxygen saturation (0-2)' },
      { dom: 'ws-pain', arg: 'postoperativePain', kind: 'number', required: true, label: 'Postoperative pain (0-2)' },
      { dom: 'ws-eme', arg: 'postoperativeEmesis', kind: 'number', required: true, label: 'Postoperative emetic symptoms (0-2)' },
    ],
  },
];
