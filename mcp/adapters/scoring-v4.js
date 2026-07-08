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
];
