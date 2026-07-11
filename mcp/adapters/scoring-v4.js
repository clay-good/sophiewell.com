// spec-v183 MCP waves 54 + 56: adapters for lib/scoring-v4.js - trauma triage
// (MGAP, GAP, BIG), ICU titration math (insulin correction, electrolyte
// replacement, CRRT dose, ECMO titration), the three PECARN pediatric decision
// rules (wave 54), and the Group G ED decision core (TIMI, GRACE, HEART, PERC,
// Wells PE + revised Geneva, CURB-65, PSI, qSOFA + SOFA, MELD-3.0 + Child-Pugh,
// Ranson + BISAP, Centor + McIsaac, Wells DVT + Caprini, Bishop, Alvarado +
// PAS; wave 56). dom keys mirror views/group-g.js / views/group-v8.js.

import * as F from '../../lib/scoring-v4.js';
import { wellsDvt as clinicalWellsDvt } from '../../lib/clinical.js';
import { scoreScreener, bandFor } from '../../lib/screener.js';

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

  // --- wave 59: GI-bleed / readmission / comorbidity / performance status --
  {
    id: 'gbs',
    summary: 'Glasgow-Blatchford bleeding score (Blatchford 2000): BUN, hemoglobin (sex-weighted), and SBP banded, plus pulse >= 100, melena, syncope, hepatic disease, and cardiac failure; 0 identifies the low-risk outpatient group.',
    compute: F.gbs,
    fields: [
      { dom: 'gb-bun', arg: 'bunMgDl', kind: 'number', required: true, label: 'BUN', unit: 'mg/dL' },
      { dom: 'gb-hgb', arg: 'hgbGdl', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'gb-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex (weights hemoglobin per Blatchford 2000 Table 1)' },
      { dom: 'gb-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'gb-pulse', arg: 'pulse100', kind: 'bool', label: 'Pulse >= 100 (1)' },
      { dom: 'gb-mel', arg: 'melena', kind: 'bool', label: 'Melena (1)' },
      { dom: 'gb-syn', arg: 'syncope', kind: 'bool', label: 'Recent syncope (2)' },
      { dom: 'gb-hep', arg: 'hepaticDisease', kind: 'bool', label: 'Hepatic disease (2)' },
      { dom: 'gb-cf', arg: 'cardiacFailure', kind: 'bool', label: 'Cardiac failure (2)' },
    ],
  },
  {
    id: 'rockall',
    summary: 'Rockall upper-GI-bleed score (Rockall 1996): age band, shock, and comorbidity, plus (post-endoscopy) the endoscopic diagnosis and stigmata of recent hemorrhage; an optional pre-endoscopy flag scores the Vreeburg 1999 variant. Returns the mortality band.',
    compute: F.rockall,
    fields: [
      { dom: 'rk-age', arg: 'ageBand', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Age band (0 < 60 / 1 60-79 / 2 >= 80)', to: (v) => Number(v) },
      { dom: 'rk-shock', arg: 'shock', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Shock (0 none / 1 tachycardia / 2 hypotension)', to: (v) => Number(v) },
      { dom: 'rk-co', arg: 'comorbidity', kind: 'enum', values: ['0', '2', '3'], required: true, label: 'Comorbidity (0 none / 2 CHF-IHD / 3 renal-hepatic-failure or metastatic CA)', to: (v) => Number(v) },
      { dom: 'rk-dx', arg: 'endoscopicDx', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Endoscopic diagnosis (0 Mallory-Weiss / 1 other / 2 upper-GI malignancy)', to: (v) => Number(v) },
      { dom: 'rk-stig', arg: 'stigmata', kind: 'enum', values: ['0', '2'], required: true, label: 'Stigmata of recent hemorrhage (0 clean or dark spot / 2 blood, clot, or vessel)', to: (v) => Number(v) },
      { dom: 'rk-pre', arg: 'preEndoscopy', kind: 'bool', label: 'Use pre-endoscopy variant (omits diagnosis and stigmata)' },
    ],
  },
  {
    id: 'aims65',
    summary: 'AIMS65 upper-GI-bleed mortality score (Saltzman 2011): albumin < 3.0 g/dL, INR > 1.5, altered mental status, SBP <= 90, age > 65 (1 each); the in-hospital mortality band rises from 0.3% at 0 to 24.5% at 5.',
    compute: F.aims65,
    fields: [
      { dom: 'am-alb', arg: 'albuminLt3', kind: 'bool', label: 'Albumin < 3.0 g/dL (A)' },
      { dom: 'am-inr', arg: 'inrGt15', kind: 'bool', label: 'INR > 1.5 (I)' },
      { dom: 'am-am', arg: 'alteredMental', kind: 'bool', label: 'Altered mental status (M)' },
      { dom: 'am-sbp', arg: 'sbpLe90', kind: 'bool', label: 'SBP <= 90 mmHg (S)' },
      { dom: 'am-age', arg: 'ageGt65', kind: 'bool', label: 'Age > 65 (65)' },
    ],
  },
  {
    id: 'oakland',
    summary: 'Oakland lower-GI-bleed safe-discharge score (Oakland 2017): age, sex, prior LGIB admission, blood on DRE, heart rate, SBP, and hemoglobin banded; total <= 8 identifies the 95%-safe-discharge group.',
    compute: F.oakland,
    fields: [
      { dom: 'ok-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ok-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'ok-prior', arg: 'priorLgibAdmission', kind: 'bool', label: 'Previous LGIB admission' },
      { dom: 'ok-dre', arg: 'dreBlood', kind: 'bool', label: 'Blood on digital rectal examination' },
      { dom: 'ok-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'ok-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'ok-hgb', arg: 'hgbGdl', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
    ],
  },
  {
    id: 'maddrey-lille',
    summary: 'Maddrey discriminant function (4.6 x (patient PT - control PT) + bilirubin; DF >= 32 severe alcoholic hepatitis) with the Lille model (day-0 vs day-7 response to steroids). Bilirubin entered in mg/dL. Returns both scores.',
    compute: (a) => {
      const maddrey = F.maddreyDf({ patientPtSec: a.patientPtSec, controlPtSec: a.controlPtSec, bilirubinMgDl: a.bilirubinMgDl });
      const lille = F.lille({
        ageYears: a.ageYears, albuminGDl: a.albuminGDl, creatinineMgDl: a.creatinineMgDl,
        bilirubinDay0MgDl: a.bilirubinDay0MgDl, bilirubinDay7MgDl: a.bilirubinDay7MgDl, ptSec: a.ptSec,
      });
      return { maddrey, lille };
    },
    fields: [
      { dom: 'ml-pt', arg: 'patientPtSec', kind: 'number', required: true, label: 'Patient prothrombin time', unit: 'sec' },
      { dom: 'ml-ctrl', arg: 'controlPtSec', kind: 'number', required: true, label: 'Control prothrombin time', unit: 'sec' },
      { dom: 'ml-bili', arg: 'bilirubinMgDl', kind: 'number', required: true, label: 'Bilirubin (Maddrey)', unit: 'mg/dL' },
      { dom: 'ml-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age (Lille)', unit: 'years' },
      { dom: 'ml-alb', arg: 'albuminGDl', kind: 'number', required: true, label: 'Albumin (Lille)', unit: 'g/dL' },
      { dom: 'ml-cr', arg: 'creatinineMgDl', kind: 'number', required: true, label: 'Creatinine (Lille)', unit: 'mg/dL' },
      { dom: 'ml-b0', arg: 'bilirubinDay0MgDl', kind: 'number', required: true, label: 'Bilirubin day 0 (Lille)', unit: 'mg/dL' },
      { dom: 'ml-b7', arg: 'bilirubinDay7MgDl', kind: 'number', required: true, label: 'Bilirubin day 7 (Lille)', unit: 'mg/dL' },
      { dom: 'ml-ptl', arg: 'ptSec', kind: 'number', required: true, label: 'Prothrombin time (Lille)', unit: 'sec' },
    ],
  },
  {
    id: 'cthr',
    summary: 'Canadian CT Head Rule (Stiell 2001) for GCS 13-15 blunt head injury: CT recommended if any high-risk criterion (neurosurgical-intervention concern) or medium-risk criterion (clinically important brain injury) is present.',
    compute: F.cthr,
    fields: [
      { dom: 'ct-hr', arg: 'highRisk', kind: 'bool', label: 'Any high-risk criterion (GCS < 15 at 2 h, open/depressed or basal skull fracture, >= 2 vomiting episodes, age >= 65)' },
      { dom: 'ct-mr', arg: 'mediumRisk', kind: 'bool', label: 'Any medium-risk criterion (retrograde amnesia >= 30 min, dangerous mechanism)' },
    ],
  },
  {
    id: 'ccsr',
    summary: 'Canadian C-Spine Rule (Stiell 2001): imaging is required if any high-risk factor is present, or if no low-risk factor allows safe range-of-motion testing, or if the patient cannot actively rotate the neck 45 degrees each way.',
    compute: F.ccsr,
    fields: [
      { dom: 'cs-hr', arg: 'highRisk', kind: 'bool', label: 'Any high-risk factor (age >= 65, dangerous mechanism, extremity paresthesias)' },
      { dom: 'cs-lr', arg: 'lowRisk', kind: 'bool', label: 'Any low-risk factor permitting safe range-of-motion assessment' },
      { dom: 'cs-rot', arg: 'canRotate45', kind: 'bool', label: 'Able to actively rotate neck 45 degrees left and right' },
    ],
  },
  {
    id: 'hospital-score',
    summary: 'HOSPITAL readmission score (Donze 2013): hemoglobin < 12, oncology discharge (2), sodium < 135, any procedure, urgent admission, prior admissions in 12 months (banded), length of stay >= 5 days (2); low / intermediate / high 30-day avoidable-readmission bands.',
    compute: F.hospitalScore,
    fields: [
      { dom: 'hs-hgb', arg: 'hgbLt12', kind: 'bool', label: 'Hemoglobin < 12 g/dL at discharge (1)' },
      { dom: 'hs-onc', arg: 'oncologyDischarge', kind: 'bool', label: 'Discharge from oncology service (2)' },
      { dom: 'hs-na', arg: 'sodiumLt135', kind: 'bool', label: 'Sodium < 135 mEq/L at discharge (1)' },
      { dom: 'hs-proc', arg: 'anyProcedure', kind: 'bool', label: 'Any procedure during the hospitalization (1)' },
      { dom: 'hs-urg', arg: 'urgentAdmission', kind: 'bool', label: 'Urgent / emergent index admission (1)' },
      { dom: 'hs-prior', arg: 'priorAdmissions12mo', kind: 'number', required: true, label: 'Admissions in the past 12 months (0/1-2 = 0; 3-4 = 2; >= 5 = 5)' },
      { dom: 'hs-los', arg: 'losGe5', kind: 'bool', label: 'Length of stay >= 5 days (2)' },
    ],
  },
  {
    id: 'lace',
    summary: 'LACE index (van Walraven 2010): length of stay (banded), acute admission (3), Charlson comorbidity (banded), and ED visits in the prior 6 months (capped at 4); 30-day death / unplanned-readmission risk band.',
    compute: F.lace,
    fields: [
      { dom: 'lc-los', arg: 'losDays', kind: 'number', required: true, label: 'Length of stay', unit: 'days' },
      { dom: 'lc-acute', arg: 'acuteAdmission', kind: 'bool', label: 'Acute (emergent) admission (3 points)' },
      { dom: 'lc-charlson', arg: 'charlsonScore', kind: 'number', required: true, label: 'Charlson Comorbidity Index (banded)' },
      { dom: 'lc-ed', arg: 'edVisits6mo', kind: 'number', required: true, label: 'ED visits in the prior 6 months (capped at 4 points)' },
    ],
  },
  {
    id: 'charlson',
    summary: 'Charlson Comorbidity Index (Charlson 1987 weights + 1994 age adjustment): 1/2/3/6-point comorbidities plus one point per decade over 50 (capped at 4); returns the age-adjusted total, the comorbidity subtotal, and the 10-year mortality band. Severity dominance drops the milder class when a more severe one is present.',
    // The tile collects each comorbidity as a flat checkbox; the lib takes them
    // under one `items` object. Rebuild it from the flat bool args (the
    // drug-burden-index precedent), passing ageYears through.
    compute: (a) => {
      const { ageYears, ...items } = a;
      return F.charlson({ items, ageYears });
    },
    fields: [
      { dom: 'ch-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ch-mi', arg: 'mi', kind: 'bool', label: 'Myocardial infarction (1)' },
      { dom: 'ch-chf', arg: 'chf', kind: 'bool', label: 'Congestive heart failure (1)' },
      { dom: 'ch-pvd', arg: 'pvd', kind: 'bool', label: 'Peripheral vascular disease (1)' },
      { dom: 'ch-cvd', arg: 'cvd', kind: 'bool', label: 'Cerebrovascular disease (1)' },
      { dom: 'ch-dementia', arg: 'dementia', kind: 'bool', label: 'Dementia (1)' },
      { dom: 'ch-copd', arg: 'copd', kind: 'bool', label: 'Chronic pulmonary disease (1)' },
      { dom: 'ch-ct', arg: 'connectiveTissue', kind: 'bool', label: 'Connective tissue disease (1)' },
      { dom: 'ch-pud', arg: 'pud', kind: 'bool', label: 'Peptic ulcer disease (1)' },
      { dom: 'ch-mild-liver', arg: 'mildLiver', kind: 'bool', label: 'Mild liver disease (1)' },
      { dom: 'ch-dm', arg: 'diabetesUncomplicated', kind: 'bool', label: 'Diabetes, uncomplicated (1)' },
      { dom: 'ch-hemi', arg: 'hemiplegia', kind: 'bool', label: 'Hemiplegia (2)' },
      { dom: 'ch-renal', arg: 'modSevereRenal', kind: 'bool', label: 'Moderate or severe renal disease (2)' },
      { dom: 'ch-dm-end', arg: 'diabetesEndOrgan', kind: 'bool', label: 'Diabetes with end-organ damage (2)' },
      { dom: 'ch-tumor', arg: 'anyTumor', kind: 'bool', label: 'Any tumor within 5 years (2)' },
      { dom: 'ch-leuk', arg: 'leukemia', kind: 'bool', label: 'Leukemia (2)' },
      { dom: 'ch-lymph', arg: 'lymphoma', kind: 'bool', label: 'Lymphoma (2)' },
      { dom: 'ch-mod-liver', arg: 'modSevereLiver', kind: 'bool', label: 'Moderate or severe liver disease (3)' },
      { dom: 'ch-mets', arg: 'metastaticSolidTumor', kind: 'bool', label: 'Metastatic solid tumor (6)' },
      { dom: 'ch-aids', arg: 'aids', kind: 'bool', label: 'AIDS (6)' },
    ],
  },
  {
    id: 'cfs',
    summary: 'Clinical Frailty Scale (Rockwood 2005): one level 1 (very fit) to 9 (terminally ill), with the level descriptor and the not-frail / vulnerable / mild-moderate / severe frailty band.',
    compute: F.cfs,
    fields: [
      { dom: 'cf-level', arg: 'level', kind: 'enum', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], required: true, label: 'CFS level (1 very fit ... 9 terminally ill)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'ecog-karnofsky',
    summary: 'ECOG performance status (Oken 1982; 0-5) with the Karnofsky Performance Status (Karnofsky 1949; 0-100) and their descriptors, cross-walked per Buccheri 1996. Returns both level descriptors and the KPS the ECOG grade suggests.',
    compute: F.ecogKarnofsky,
    fields: [
      { dom: 'ek-ecog', arg: 'ecog', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], required: true, label: 'ECOG performance status (0 fully active ... 5 dead)', to: (v) => Number(v) },
      { dom: 'ek-kps', arg: 'kps', kind: 'enum', values: ['100', '90', '80', '70', '60', '50', '40', '30', '20', '10', '0'], required: true, label: 'Karnofsky Performance Status', to: (v) => Number(v) },
    ],
  },

  // --- wave 60: VTE / anticoagulation bleeding + risk cluster --------------
  {
    id: 'pesi',
    summary: 'Pulmonary Embolism Severity Index (Aujesky 2005): age in years plus fixed weights for male sex, cancer, heart failure, chronic lung disease, HR >= 110, SBP < 100, RR >= 30, temperature < 36 C, altered mentation, SaO2 < 90%; total points map to Class I-V 30-day mortality.',
    compute: F.pesi,
    fields: [
      { dom: 'pe-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'pe-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex (male adds 10)' },
      { dom: 'pe-ca', arg: 'cancer', kind: 'bool', label: 'History of cancer (+30)' },
      { dom: 'pe-hf', arg: 'heartFailure', kind: 'bool', label: 'History of heart failure (+10)' },
      { dom: 'pe-cld', arg: 'chronicLungDisease', kind: 'bool', label: 'History of chronic lung disease (+10)' },
      { dom: 'pe-hr', arg: 'hr110', kind: 'bool', label: 'Pulse >= 110 (+20)' },
      { dom: 'pe-sbp', arg: 'sbp100', kind: 'bool', label: 'SBP < 100 (+30)' },
      { dom: 'pe-rr', arg: 'rr30', kind: 'bool', label: 'Respiratory rate >= 30 (+20)' },
      { dom: 'pe-tmp', arg: 'tempLt36', kind: 'bool', label: 'Temperature < 36 C (+20)' },
      { dom: 'pe-ams', arg: 'alteredMental', kind: 'bool', label: 'Altered mental status (+60)' },
      { dom: 'pe-sao2', arg: 'sao2Lt90', kind: 'bool', label: 'SaO2 < 90% on room air (+20)' },
    ],
  },
  {
    id: 'spesi',
    summary: 'Simplified PESI (Jimenez 2010): age > 80, cancer, chronic cardiopulmonary disease, HR >= 110, SBP < 100, SaO2 < 90% (1 each); 0 identifies the low 30-day-mortality group.',
    compute: F.spesi,
    fields: [
      { dom: 'sp-age80', arg: 'ageOver80', kind: 'bool', label: 'Age > 80' },
      { dom: 'sp-ca', arg: 'cancer', kind: 'bool', label: 'History of cancer' },
      { dom: 'sp-ccp', arg: 'chronicCardiopulmonary', kind: 'bool', label: 'Chronic cardiopulmonary disease' },
      { dom: 'sp-hr', arg: 'hr110', kind: 'bool', label: 'Pulse >= 110' },
      { dom: 'sp-sbp', arg: 'sbp100', kind: 'bool', label: 'SBP < 100' },
      { dom: 'sp-sao2', arg: 'sao2Lt90', kind: 'bool', label: 'SaO2 < 90%' },
    ],
  },
  {
    id: 'padua',
    summary: 'Padua Prediction Score (Barbar 2010) for inpatient VTE risk: active cancer, prior VTE, reduced mobility, thrombophilia (3 each), recent trauma/surgery (2), then age >= 70, heart/respiratory failure, MI or ischemic stroke, acute infection/rheumatologic disorder, BMI >= 30, hormonal treatment (1 each); >= 4 is high risk.',
    compute: F.padua,
    fields: [
      { dom: 'pa-ca', arg: 'activeCancer', kind: 'bool', label: 'Active cancer (3)' },
      { dom: 'pa-vte', arg: 'priorVte', kind: 'bool', label: 'Prior VTE (3)' },
      { dom: 'pa-mob', arg: 'reducedMobility', kind: 'bool', label: 'Reduced mobility (3)' },
      { dom: 'pa-thr', arg: 'thrombophilia', kind: 'bool', label: 'Known thrombophilia (3)' },
      { dom: 'pa-trauma', arg: 'recentTrauma', kind: 'bool', label: 'Recent (<= 1 month) trauma or surgery (2)' },
      { dom: 'pa-age', arg: 'ageOver70', kind: 'bool', label: 'Age >= 70 (1)' },
      { dom: 'pa-hf', arg: 'heartOrRespFailure', kind: 'bool', label: 'Heart and/or respiratory failure (1)' },
      { dom: 'pa-mi', arg: 'miOrStroke', kind: 'bool', label: 'Acute MI or ischemic stroke (1)' },
      { dom: 'pa-inf', arg: 'acuteInfectionOrRheum', kind: 'bool', label: 'Acute infection / rheumatologic disorder (1)' },
      { dom: 'pa-bmi', arg: 'bmi30', kind: 'bool', label: 'BMI >= 30 (1)' },
      { dom: 'pa-horm', arg: 'hormonalTreatment', kind: 'bool', label: 'Ongoing hormonal treatment (1)' },
    ],
  },
  {
    id: 'atria-bleeding',
    summary: 'ATRIA bleeding-risk score (Fang 2011): anemia (3), severe renal disease (3), age >= 75 (2), prior hemorrhage (1), hypertension (1); 0-3 low, 4 intermediate, 5-10 high annual major-bleed risk.',
    compute: F.atriaBleeding,
    fields: [
      { dom: 'at-an', arg: 'anemia', kind: 'bool', label: 'Anemia (Hb < 13 men / < 12 women) (3)' },
      { dom: 'at-rn', arg: 'severeRenalDisease', kind: 'bool', label: 'Severe renal disease (eGFR < 30 or dialysis) (3)' },
      { dom: 'at-ag', arg: 'ageGte75', kind: 'bool', label: 'Age >= 75 years (2)' },
      { dom: 'at-bl', arg: 'priorBleeding', kind: 'bool', label: 'Prior hemorrhage diagnosis (1)' },
      { dom: 'at-ht', arg: 'hypertension', kind: 'bool', label: 'Hypertension (1)' },
    ],
  },
  {
    id: 'orbit-bleeding',
    summary: 'ORBIT bleeding-risk score (O\'Brien 2015): low hemoglobin/hematocrit (2), age > 74 (1), bleeding history (2), renal insufficiency (1), antiplatelet therapy (1); 0-2 low, 3 intermediate, 4-7 high annual major-bleed risk.',
    compute: F.orbitBleeding,
    fields: [
      { dom: 'ob-hb', arg: 'lowHbOrHct', kind: 'bool', label: 'Low Hb / Hct (2)' },
      { dom: 'ob-age', arg: 'ageGt74', kind: 'bool', label: 'Age > 74 years (1)' },
      { dom: 'ob-bh', arg: 'bleedingHistory', kind: 'bool', label: 'Bleeding history (2)' },
      { dom: 'ob-ri', arg: 'renalInsufficiency', kind: 'bool', label: 'Renal insufficiency (eGFR < 60) (1)' },
      { dom: 'ob-ap', arg: 'antiplatelet', kind: 'bool', label: 'Antiplatelet treatment (1)' },
    ],
  },
  {
    id: 'hemorr2hages',
    summary: 'HEMORR2HAGES bleeding-risk score (Gage 2006): rebleeding weighted 2, the other ten criteria 1 each (hepatic/renal disease, ethanol, malignancy, age > 75, reduced platelets, uncontrolled hypertension, anemia, genetic factors, fall risk, stroke); bleeds per 100 patient-years band.',
    compute: F.hemorr2hages,
    fields: [
      { dom: 'hh-hr', arg: 'hepaticOrRenal', kind: 'bool', label: 'Hepatic or renal disease (1)' },
      { dom: 'hh-et', arg: 'ethanolAbuse', kind: 'bool', label: 'Ethanol abuse (1)' },
      { dom: 'hh-mal', arg: 'malignancy', kind: 'bool', label: 'Malignancy (1)' },
      { dom: 'hh-old', arg: 'olderGt75', kind: 'bool', label: 'Older (age > 75) (1)' },
      { dom: 'hh-plt', arg: 'reducedPlatelets', kind: 'bool', label: 'Reduced platelet count or function (1)' },
      { dom: 'hh-reb', arg: 'rebleeding', kind: 'bool', label: 'Rebleeding / prior bleed (2)' },
      { dom: 'hh-htn', arg: 'uncontrolledHtn', kind: 'bool', label: 'Uncontrolled hypertension (1)' },
      { dom: 'hh-an', arg: 'anemia', kind: 'bool', label: 'Anemia (1)' },
      { dom: 'hh-gen', arg: 'geneticFactors', kind: 'bool', label: 'Genetic factors (CYP2C9 variants) (1)' },
      { dom: 'hh-fall', arg: 'fallRisk', kind: 'bool', label: 'Excessive fall risk (1)' },
      { dom: 'hh-stk', arg: 'stroke', kind: 'bool', label: 'Stroke (1)' },
    ],
  },
  {
    id: 'improve-bleeding',
    summary: 'IMPROVE bleeding-risk score (Decousus 2011): weighted criteria including active ulcer (4.5), prior bleeding (4), platelets < 50 (4), banded age and renal failure, plus hepatic failure, ICU, central line, rheumatic disease, cancer, and male sex; >= 7 is high bleeding risk.',
    compute: F.improveBleeding,
    fields: [
      { dom: 'ib-ulcer', arg: 'activeUlcer', kind: 'bool', label: 'Active gastroduodenal ulcer (4.5)' },
      { dom: 'ib-bleed3', arg: 'bleeding3moPrior', kind: 'bool', label: 'Bleeding in 3 months prior (4)' },
      { dom: 'ib-plt', arg: 'plateletLt50', kind: 'bool', label: 'Platelet count < 50 x10^9/L (4)' },
      { dom: 'ib-age', arg: 'age', kind: 'enum', values: ['<40', '40-84', '>=85'], required: true, label: 'Age category (< 40 = 0, 40-84 = 1.5, >= 85 = 3.5)' },
      { dom: 'ib-hep', arg: 'hepaticFailure', kind: 'bool', label: 'Hepatic failure (INR > 1.5) (2.5)' },
      { dom: 'ib-renal', arg: 'renalFailure', kind: 'enum', values: ['none', 'moderate', 'severe'], required: true, label: 'Renal failure (none = 0, moderate = 1, severe = 2.5)' },
      { dom: 'ib-icu', arg: 'icuAdmission', kind: 'bool', label: 'ICU / CCU admission (2.5)' },
      { dom: 'ib-cvc', arg: 'centralVenousCatheter', kind: 'bool', label: 'Central venous catheter (2)' },
      { dom: 'ib-rheum', arg: 'rheumaticDisease', kind: 'bool', label: 'Rheumatic disease (2)' },
      { dom: 'ib-cancer', arg: 'currentCancer', kind: 'bool', label: 'Active cancer (2)' },
      { dom: 'ib-male', arg: 'male', kind: 'bool', label: 'Male sex (1)' },
    ],
  },
  {
    id: 'improve-vte',
    summary: 'IMPROVE VTE risk score (Spyropoulos 2011): prior VTE (3), thrombophilia (2), lower-limb paralysis (2), cancer (2), immobilized >= 7 days (1), ICU/CCU stay (1), age > 60 (1); >= 2 favors inpatient and >= 4 extended post-discharge prophylaxis.',
    compute: F.improveVte,
    fields: [
      { dom: 'iv-prior', arg: 'priorVte', kind: 'bool', label: 'Prior VTE (3)' },
      { dom: 'iv-thr', arg: 'thrombophilia', kind: 'bool', label: 'Known thrombophilia (2)' },
      { dom: 'iv-para', arg: 'lowerLimbParalysis', kind: 'bool', label: 'Lower-limb paralysis (2)' },
      { dom: 'iv-cancer', arg: 'currentCancer', kind: 'bool', label: 'Active cancer (2)' },
      { dom: 'iv-immob', arg: 'immobilized7d', kind: 'bool', label: 'Immobilized >= 7 days (1)' },
      { dom: 'iv-icu', arg: 'icuCcuStay', kind: 'bool', label: 'ICU / CCU stay (1)' },
      { dom: 'iv-age60', arg: 'ageGt60', kind: 'bool', label: 'Age > 60 years (1)' },
    ],
  },
  {
    id: 'khorana',
    summary: 'Khorana cancer-associated-VTE score (Khorana 2008): cancer-site risk (very-high 2 / high 1 / other 0), platelets >= 350 (1), Hb < 10 or ESA (1), WBC > 11 (1), BMI >= 35 (1); 0 low, 1-2 intermediate, >= 3 high 2.5-month VTE risk.',
    compute: F.khorana,
    fields: [
      { dom: 'kh-site', arg: 'cancerSiteRisk', kind: 'enum', values: ['other', 'high', 'very-high'], required: true, label: 'Cancer-site risk (other 0 / high 1 / very-high 2)' },
      { dom: 'kh-plt', arg: 'plateletGte350', kind: 'bool', label: 'Pre-chemo platelets >= 350 x10^9/L (1)' },
      { dom: 'kh-hb', arg: 'hbLt10OrEsa', kind: 'bool', label: 'Hemoglobin < 10 g/dL or ESA use (1)' },
      { dom: 'kh-wbc', arg: 'wbcGt11', kind: 'bool', label: 'Pre-chemo WBC > 11 x10^9/L (1)' },
      { dom: 'kh-bmi', arg: 'bmiGte35', kind: 'bool', label: 'BMI >= 35 kg/m^2 (1)' },
    ],
  },
  {
    id: 'dash-vte',
    summary: 'DASH score for VTE recurrence (Tosetto 2012): abnormal post-anticoagulation D-dimer (2), age < 50 (1), male (1), hormone use at initial VTE in a woman (-2); <= 1 low, 2 intermediate, >= 3 high annual recurrence risk.',
    compute: F.dashVte,
    fields: [
      { dom: 'da-dd', arg: 'dDimerAbnormal', kind: 'bool', label: 'Abnormal post-anticoagulation D-dimer (2)' },
      { dom: 'da-age', arg: 'ageLt50', kind: 'bool', label: 'Age < 50 at index VTE (1)' },
      { dom: 'da-male', arg: 'male', kind: 'bool', label: 'Male sex (1)' },
      { dom: 'da-horm', arg: 'hormoneUseAtInitialVteInWoman', kind: 'bool', label: 'Hormone use at initial VTE (women only) (-2)' },
    ],
  },
  {
    id: 'herdoo2',
    summary: 'HERDOO2 rule (Rodger 2017; women only): post-thrombotic leg signs, D-dimer >= 250 ug/L on anticoagulation, BMI >= 30, age >= 65 (1 each); 0-1 can safely discontinue anticoagulation, >= 2 continue.',
    compute: F.herdoo2,
    fields: [
      { dom: 'hd-legs', arg: 'legSignsPostThrombotic', kind: 'bool', label: 'Post-thrombotic leg signs (hyperpigmentation, edema, redness) (1)' },
      { dom: 'hd-dd', arg: 'dDimerGte250OnAnticoag', kind: 'bool', label: 'D-dimer >= 250 ug/L while on anticoagulation (1)' },
      { dom: 'hd-bmi', arg: 'bmiGte30', kind: 'bool', label: 'BMI >= 30 kg/m^2 (1)' },
      { dom: 'hd-age', arg: 'ageGte65', kind: 'bool', label: 'Age >= 65 years (1)' },
    ],
  },
  {
    id: 'four-ts',
    summary: '4Ts score for heparin-induced thrombocytopenia (Lo 2006): thrombocytopenia, timing of platelet fall, thrombosis/sequelae, and other causes each graded 0-2; 0-3 low, 4-5 intermediate, 6-8 high pretest probability of HIT.',
    compute: F.fourTs,
    fields: [
      { dom: '4t-thr', arg: 'thrombocytopenia', kind: 'number', required: true, label: 'Thrombocytopenia severity (0-2)' },
      { dom: '4t-time', arg: 'timingOfFall', kind: 'number', required: true, label: 'Timing of platelet fall (0-2)' },
      { dom: '4t-throm', arg: 'thrombosis', kind: 'number', required: true, label: 'Thrombosis or other sequelae (0-2)' },
      { dom: '4t-oth', arg: 'otherCauses', kind: 'number', required: true, label: 'Other causes of thrombocytopenia (0-2)' },
    ],
  },
  {
    id: 'isth-dic',
    summary: 'ISTH overt-DIC score (Taylor 2001): a required underlying-disorder gate, then platelets, fibrin marker, prolonged PT, and fibrinogen graded; total 0-8, >= 5 compatible with overt DIC. If the gate is not met, scoring is not applicable.',
    compute: F.isthDic,
    fields: [
      { dom: 'id-gate', arg: 'underlyingDisorderPresent', kind: 'bool', label: 'Underlying disorder associated with DIC is present (required gate)' },
      { dom: 'id-plt', arg: 'platelet', kind: 'enum', values: ['>100', '50-100', '<50'], required: true, label: 'Platelet count (>100 = 0, 50-100 = 1, <50 = 2)' },
      { dom: 'id-fdp', arg: 'fibrinMarker', kind: 'enum', values: ['none', 'moderate', 'strong'], required: true, label: 'Fibrin marker (none = 0, moderate = 2, strong = 3)' },
      { dom: 'id-pt', arg: 'ptProlonged', kind: 'enum', values: ['<3s', '3-6s', '>6s'], required: true, label: 'Prolonged PT (<3s = 0, 3-6s = 1, >6s = 2)' },
      { dom: 'id-fib', arg: 'fibrinogen', kind: 'enum', values: ['>1', '<=1'], required: true, label: 'Fibrinogen (>1 = 0, <=1 = 1)' },
    ],
  },
  {
    id: 'dapt-score',
    summary: 'DAPT score (Yeh 2016): age band (65-74 = -1, >= 75 = -2), CHF/LVEF < 30% (2), vein-graft PCI (2), then MI at presentation, prior MI/PCI, diabetes, stent < 3 mm, paclitaxel stent, current smoker (1 each); >= 2 favors continuing DAPT beyond 12 months.',
    compute: F.daptScore,
    fields: [
      { dom: 'dp-age', arg: 'ageBand', kind: 'enum', values: ['<65', '65-74', '>=75'], required: true, label: 'Age band (< 65 = 0, 65-74 = -1, >= 75 = -2)' },
      { dom: 'dp-chf', arg: 'chfOrLvefLt30', kind: 'bool', label: 'CHF or LVEF < 30% (2)' },
      { dom: 'dp-vgp', arg: 'veinGraftPci', kind: 'bool', label: 'Vein graft PCI (2)' },
      { dom: 'dp-mi', arg: 'miAtPresentation', kind: 'bool', label: 'MI at presentation (1)' },
      { dom: 'dp-prior', arg: 'priorMiOrPci', kind: 'bool', label: 'Prior MI or prior PCI (1)' },
      { dom: 'dp-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes (1)' },
      { dom: 'dp-stent', arg: 'stentDiameterLt3mm', kind: 'bool', label: 'Stent diameter < 3 mm (1)' },
      { dom: 'dp-pac', arg: 'paclitaxelStent', kind: 'bool', label: 'Paclitaxel-eluting stent (1)' },
      { dom: 'dp-smoke', arg: 'currentSmoker', kind: 'bool', label: 'Current smoker (1)' },
    ],
  },

  // --- wave 61: the obstetric / maternal cluster --------------------------
  {
    id: 'bpp',
    summary: 'Biophysical Profile (Manning 1980): fetal breathing, fetal movements, fetal tone, amniotic fluid volume, and a reactive non-stress test each score 0 or 2; total 0-10 (8-10 normal, 6 equivocal, <= 4 abnormal).',
    compute: F.bpp,
    fields: [
      { dom: 'bp-fb', arg: 'fetalBreathing', kind: 'bool', label: 'Fetal breathing movements present (2)' },
      { dom: 'bp-fm', arg: 'fetalMovements', kind: 'bool', label: 'Fetal movements present (2)' },
      { dom: 'bp-ft', arg: 'fetalTone', kind: 'bool', label: 'Fetal tone present (2)' },
      { dom: 'bp-af', arg: 'amnioticFluid', kind: 'bool', label: 'Adequate amniotic fluid volume (2)' },
      { dom: 'bp-nst', arg: 'reactiveNst', kind: 'bool', label: 'Reactive non-stress test (2)' },
    ],
  },
  {
    id: 'acog-severe-pre',
    summary: 'ACOG severe-feature preeclampsia criteria (ACOG 2013): SBP >= 160 or DBP >= 110, thrombocytopenia < 100, impaired hepatic function, creatinine > 1.1 or doubled, pulmonary edema, or new cerebral/visual disturbances; any single feature qualifies as severe.',
    compute: F.acogSeverePre,
    fields: [
      { dom: 'sp-bp', arg: 'sbpGte160OrDbpGte110', kind: 'bool', label: 'SBP >= 160 or DBP >= 110 (two occasions >= 4 h apart)' },
      { dom: 'sp-plt', arg: 'thrombocytopeniaLt100', kind: 'bool', label: 'Thrombocytopenia (platelets < 100 x10^9/L)' },
      { dom: 'sp-hep', arg: 'impairedHepaticFunction', kind: 'bool', label: 'Impaired hepatic function' },
      { dom: 'sp-cr', arg: 'creatinineGt11OrDoubled', kind: 'bool', label: 'Creatinine > 1.1 mg/dL or doubled' },
      { dom: 'sp-pulm', arg: 'pulmonaryEdema', kind: 'bool', label: 'Pulmonary edema' },
      { dom: 'sp-neuro', arg: 'cerebralOrVisualDisturbances', kind: 'bool', label: 'New cerebral or visual disturbances' },
    ],
  },
  {
    id: 'hellp',
    summary: 'HELLP syndrome criteria (Sibai 1990): hemolysis, elevated liver enzymes (AST >= 70), and low platelets (< 100) - all three is complete, one or two is partial. An optional platelet nadir adds the Mississippi class.',
    compute: F.hellp,
    fields: [
      { dom: 'hl-hem', arg: 'hemolysis', kind: 'bool', label: 'Hemolysis (abnormal smear / bilirubin >= 1.2 / LDH >= 600)' },
      { dom: 'hl-ast', arg: 'astGte70', kind: 'bool', label: 'Elevated liver enzymes (AST >= 70 U/L)' },
      { dom: 'hl-plt', arg: 'plateletsLt100', kind: 'bool', label: 'Low platelets (< 100 x10^9/L)' },
      { dom: 'hl-nadir', arg: 'plateletNadirThousands', kind: 'number', label: 'Platelet nadir for Mississippi class (x10^9/L, optional)' },
    ],
  },
  {
    id: 'carpenter-coustan',
    summary: 'Carpenter-Coustan GDM criteria on the 100-g 3-hour OGTT: fasting >= 95, 1-hour >= 180, 2-hour >= 155, 3-hour >= 140 mg/dL; >= 2 values exceeding diagnoses GDM, a single abnormal value is impaired glucose tolerance.',
    compute: F.carpenterCoustan,
    fields: [
      { dom: 'cc-f', arg: 'fasting', kind: 'number', required: true, label: 'Fasting glucose', unit: 'mg/dL' },
      { dom: 'cc-1h', arg: 'oneHour', kind: 'number', required: true, label: '1-hour glucose', unit: 'mg/dL' },
      { dom: 'cc-2h', arg: 'twoHour', kind: 'number', required: true, label: '2-hour glucose', unit: 'mg/dL' },
      { dom: 'cc-3h', arg: 'threeHour', kind: 'number', required: true, label: '3-hour glucose', unit: 'mg/dL' },
    ],
  },
  {
    id: 'iadpsg',
    summary: 'IADPSG GDM criteria on the 75-g 2-hour OGTT (IADPSG 2010): fasting >= 92, 1-hour >= 180, 2-hour >= 153 mg/dL; a single value exceeding diagnoses GDM.',
    compute: F.iadpsg,
    fields: [
      { dom: 'ia-f', arg: 'fasting', kind: 'number', required: true, label: 'Fasting glucose', unit: 'mg/dL' },
      { dom: 'ia-1h', arg: 'oneHour', kind: 'number', required: true, label: '1-hour glucose', unit: 'mg/dL' },
      { dom: 'ia-2h', arg: 'twoHour', kind: 'number', required: true, label: '2-hour glucose', unit: 'mg/dL' },
    ],
  },
  {
    id: 'meows',
    summary: 'Modified Early Obstetric Warning Score (Singh 2012): respiratory rate, SpO2, temperature (Celsius), systolic and diastolic BP, heart rate, AVPU neurological response, and a 0-3 pain score are each banded green/yellow/red; the response triggers on any one red or two or more yellows.',
    compute: F.meows,
    fields: [
      { dom: 'mw-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'mw-spo2', arg: 'spo2', kind: 'number', required: true, label: 'SpO2', unit: '%' },
      { dom: 'mw-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'mw-dbp', arg: 'dbp', kind: 'number', required: true, label: 'Diastolic BP', unit: 'mmHg' },
      { dom: 'mw-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'mw-temp', arg: 'temp', kind: 'number', required: true, label: 'Temperature', unit: 'C' },
      { dom: 'mw-neuro', arg: 'neuro', kind: 'enum', values: ['A', 'V', 'P', 'U'], required: true, label: 'Neurological response (AVPU)' },
      { dom: 'mw-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain score (0-3)' },
    ],
  },

  // --- wave 62: the pediatric fever / sepsis and respiratory cluster ------
  {
    id: 'rochester',
    summary: 'Rochester criteria for the well-appearing febrile infant (Jaskiewicz 1994): seven low-risk criteria (age <= 60 days, term and previously healthy, no focal infection, WBC 5-15, bands <= 1.5, urine WBC <= 10/HPF, stool WBC <= 5/HPF); all must be met to be low risk for serious bacterial infection.',
    compute: F.rochester,
    fields: [
      { dom: 'rc-age', arg: 'ageLte60Days', kind: 'bool', label: 'Age <= 60 days' },
      { dom: 'rc-term', arg: 'termAndPreviouslyHealthy', kind: 'bool', label: 'Term gestation and previously healthy' },
      { dom: 'rc-focal', arg: 'noFocalInfection', kind: 'bool', label: 'No focal infection on exam' },
      { dom: 'rc-wbc', arg: 'wbc5to15', kind: 'bool', label: 'WBC 5-15 x10^9/L' },
      { dom: 'rc-bands', arg: 'bandsLte1Point5', kind: 'bool', label: 'Bands <= 1.5 x10^9/L' },
      { dom: 'rc-urine', arg: 'urineWbcLte10PerHpf', kind: 'bool', label: 'Urine WBC <= 10/HPF' },
      { dom: 'rc-stool', arg: 'stoolWbcLte5PerHpf', kind: 'bool', label: 'Stool WBC <= 5/HPF (if diarrhea)' },
    ],
  },
  {
    id: 'philadelphia',
    summary: 'Philadelphia criteria for the febrile infant 29-60 days (Baker 1993): eight low-risk criteria (age, well-appearing, WBC < 15, band:neutrophil < 0.2, UA, CSF, chest x-ray, stool); all must be met for safe outpatient management without empiric antibiotics.',
    compute: F.philadelphia,
    fields: [
      { dom: 'ph-age', arg: 'age29To60Days', kind: 'bool', label: 'Age 29-60 days' },
      { dom: 'ph-well', arg: 'wellAppearing', kind: 'bool', label: 'Well-appearing' },
      { dom: 'ph-wbc', arg: 'wbcLt15', kind: 'bool', label: 'WBC < 15 x10^9/L' },
      { dom: 'ph-bnr', arg: 'bandToNeutrophilRatioLt0Point2', kind: 'bool', label: 'Band:neutrophil ratio < 0.2' },
      { dom: 'ph-ua', arg: 'uaLt10WbcAndFewBacteria', kind: 'bool', label: 'UA < 10 WBC/HPF and few bacteria' },
      { dom: 'ph-csf', arg: 'csfLt8WbcAndGramStainNeg', kind: 'bool', label: 'CSF < 8 WBC/mm^3 and Gram stain negative' },
      { dom: 'ph-cxr', arg: 'cxrClearOrNotObtained', kind: 'bool', label: 'Chest x-ray clear or not obtained' },
      { dom: 'ph-stool', arg: 'stoolNormalOrNoDiarrhea', kind: 'bool', label: 'Stool studies normal or no diarrhea' },
    ],
  },
  {
    id: 'boston-febrile',
    summary: 'Boston criteria for the febrile infant 28-89 days (Baskin 1992): seven criteria (age, well-appearing, no focal source, WBC < 20, UA, CSF, chest x-ray); all must be met to be eligible for outpatient ceftriaxone management.',
    compute: F.bostonFebrile,
    fields: [
      { dom: 'bf-age', arg: 'age28To89Days', kind: 'bool', label: 'Age 28-89 days' },
      { dom: 'bf-well', arg: 'wellAppearing', kind: 'bool', label: 'Well-appearing' },
      { dom: 'bf-focal', arg: 'noFocalSourceOnExam', kind: 'bool', label: 'No focal source on exam' },
      { dom: 'bf-wbc', arg: 'wbcLt20', kind: 'bool', label: 'WBC < 20 x10^9/L' },
      { dom: 'bf-ua', arg: 'uaLt10WbcPerHpf', kind: 'bool', label: 'UA < 10 WBC/HPF' },
      { dom: 'bf-csf', arg: 'csfLt10WbcPerMm3', kind: 'bool', label: 'CSF < 10 WBC/mm^3' },
      { dom: 'bf-cxr', arg: 'cxrClearOrNotObtained', kind: 'bool', label: 'Chest x-ray clear or not obtained' },
    ],
  },
  {
    id: 'step-by-step',
    summary: 'Step-by-Step approach to the febrile young infant (Gomez 2016): a sequential decision tree - unwell appearance, age <= 21 days, abnormal urinalysis, or procalcitonin >= 0.5 flag HIGH risk; CRP > 20 or ANC > 10 flags INTERMEDIATE; otherwise LOW. Returns the risk tier and the step that fired.',
    compute: F.stepByStep,
    fields: [
      { dom: 'ss-unwell', arg: 'unwellAppearance', kind: 'bool', label: 'Unwell-appearing (step 1)' },
      { dom: 'ss-age', arg: 'ageLte21Days', kind: 'bool', label: 'Age <= 21 days (step 2)' },
      { dom: 'ss-ua', arg: 'urinalysisAbnormal', kind: 'bool', label: 'Abnormal urinalysis / leukocyturia (step 3)' },
      { dom: 'ss-pct', arg: 'procalcitoninGte0Point5', kind: 'bool', label: 'Procalcitonin >= 0.5 ng/mL (step 4)' },
      { dom: 'ss-crp', arg: 'crpGt20OrAncGt10', kind: 'bool', label: 'CRP > 20 mg/L or ANC > 10 x10^9/L (step 5)' },
    ],
  },
  {
    id: 'yos',
    summary: 'Yale Observation Scale (McCarthy 1982): six observation items (quality of cry, reaction to parents, state variation, color, hydration, response to social overtures) each scored 1, 3, or 5; sum 6-30 (<= 10 low SBI risk, 11-15 increased, >= 16 high probability).',
    compute: F.yos,
    fields: [
      { dom: 'yo-cry', arg: 'qualityOfCry', kind: 'enum', values: ['1', '3', '5'], required: true, label: 'Quality of cry (1/3/5)', to: (v) => Number(v) },
      { dom: 'yo-react', arg: 'reactionToParents', kind: 'enum', values: ['1', '3', '5'], required: true, label: 'Reaction to parent stimulation (1/3/5)', to: (v) => Number(v) },
      { dom: 'yo-state', arg: 'stateVariation', kind: 'enum', values: ['1', '3', '5'], required: true, label: 'State variation (1/3/5)', to: (v) => Number(v) },
      { dom: 'yo-color', arg: 'color', kind: 'enum', values: ['1', '3', '5'], required: true, label: 'Color (1/3/5)', to: (v) => Number(v) },
      { dom: 'yo-hydr', arg: 'hydration', kind: 'enum', values: ['1', '3', '5'], required: true, label: 'Hydration (1/3/5)', to: (v) => Number(v) },
      { dom: 'yo-social', arg: 'responseToSocialOvertures', kind: 'enum', values: ['1', '3', '5'], required: true, label: 'Response to social overtures (1/3/5)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'westley',
    summary: 'Westley croup severity score (Westley 1978): level of consciousness (0/5), cyanosis (0/4/5), stridor (0/1/2), air entry (0/1/2), retractions (0/1/2/3); sum 0-17 (< 3 mild, 3-7 moderate, 8-11 severe, >= 12 impending respiratory failure).',
    compute: F.westley,
    fields: [
      { dom: 'wc-loc', arg: 'loc', kind: 'enum', values: ['0', '5'], required: true, label: 'Level of consciousness (0 normal / 5 disoriented)', to: (v) => Number(v) },
      { dom: 'wc-cyan', arg: 'cyanosis', kind: 'enum', values: ['0', '4', '5'], required: true, label: 'Cyanosis (0 none / 4 with agitation / 5 at rest)', to: (v) => Number(v) },
      { dom: 'wc-stri', arg: 'stridor', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Stridor (0 none / 1 with agitation / 2 at rest)', to: (v) => Number(v) },
      { dom: 'wc-air', arg: 'airEntry', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Air entry (0 normal / 1 decreased / 2 markedly decreased)', to: (v) => Number(v) },
      { dom: 'wc-retr', arg: 'retractions', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Retractions (0 none / 1 mild / 2 moderate / 3 severe)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'pram-asthma',
    summary: 'Pediatric Respiratory Assessment Measure (Chalut 2000): suprasternal retractions (0/2), scalene use (0/2), air entry (0-3), wheezing (0-3), SpO2 on room air (0-2); sum 0-12 (0-3 mild, 4-7 moderate, 8-12 severe).',
    compute: F.pramAsthma,
    fields: [
      { dom: 'pr-supra', arg: 'suprasternal', kind: 'enum', values: ['0', '2'], required: true, label: 'Suprasternal retractions (0 absent / 2 present)', to: (v) => Number(v) },
      { dom: 'pr-scal', arg: 'scalene', kind: 'enum', values: ['0', '2'], required: true, label: 'Scalene muscle use (0 absent / 2 present)', to: (v) => Number(v) },
      { dom: 'pr-air', arg: 'airEntry', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Air entry (0-3)', to: (v) => Number(v) },
      { dom: 'pr-wheez', arg: 'wheezing', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Wheezing (0-3)', to: (v) => Number(v) },
      { dom: 'pr-spo2', arg: 'spo2', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'SpO2 on room air (0 >= 95% / 1 92-94% / 2 < 92%)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'pass-asthma',
    summary: 'Pediatric Asthma Severity Score (Gorelick 2004): wheezing, work of breathing, and prolonged expiration each 0-2; sum 0-6 (0-1 mild, 2-3 moderate, 4-6 severe).',
    compute: F.passAsthma,
    fields: [
      { dom: 'pa-wh', arg: 'wheezing', kind: 'number', required: true, label: 'Wheezing (0-2)' },
      { dom: 'pa-wob', arg: 'workOfBreathing', kind: 'number', required: true, label: 'Work of breathing (0-2)' },
      { dom: 'pa-exp', arg: 'prolongedExpiration', kind: 'number', required: true, label: 'Prolonged expiration (0-2)' },
    ],
  },
  {
    id: 'peds-gcs',
    summary: 'Pediatric Glasgow Coma Scale (Reilly 1988): eye opening (1-4), age-adjusted best verbal (1-5), best motor (1-6); sum 3-15 with the adult severity bands (<= 8 severe, 9-12 moderate, 13-15 mild). The age band selects the verbal scale wording.',
    compute: F.pedsGcs,
    fields: [
      { dom: 'pg-eye', arg: 'eye', kind: 'number', required: true, label: 'Eye opening (1-4)' },
      { dom: 'pg-verb', arg: 'verbal', kind: 'number', required: true, label: 'Best verbal response (1-5, age-adjusted)' },
      { dom: 'pg-mot', arg: 'motor', kind: 'number', required: true, label: 'Best motor response (1-6)' },
      { dom: 'pg-age', arg: 'ageBand', kind: 'enum', values: ['under-2', '2-5', 'older'], required: true, label: 'Age band for the verbal scale' },
    ],
  },
  {
    id: 'nigrovic',
    summary: 'Bacterial Meningitis Score (Nigrovic 2007): positive CSF Gram stain (2), then CSF ANC >= 1000, CSF protein >= 80, peripheral ANC >= 10,000, and seizure at/before presentation (1 each); a total of 0 identifies very low risk (NPV ~99.9%), >= 1 is not low risk.',
    compute: F.nigrovic,
    fields: [
      { dom: 'ni-gram', arg: 'csfGramStainPositive', kind: 'bool', label: 'Positive CSF Gram stain (2)' },
      { dom: 'ni-csf-anc', arg: 'csfAncGte1000', kind: 'bool', label: 'CSF ANC >= 1000 cells/mm^3 (1)' },
      { dom: 'ni-prot', arg: 'csfProteinGte80', kind: 'bool', label: 'CSF protein >= 80 mg/dL (1)' },
      { dom: 'ni-anc', arg: 'peripheralAncGte10000', kind: 'bool', label: 'Peripheral ANC >= 10,000 cells/mm^3 (1)' },
      { dom: 'ni-sz', arg: 'seizureAtOrBeforePresentation', kind: 'bool', label: 'Seizure at or before presentation (1)' },
    ],
  },

  // --- wave 63: the falls-risk and neuro-assessment cluster ---------------
  {
    id: 'braden',
    summary: 'Braden Scale for pressure-injury risk (Bergstrom 1987): sensory perception, moisture, activity, mobility, and nutrition each 1-4, friction/shear 1-3; sum 6-23 (>= 19 none, 15-18 mild, 13-14 moderate, 10-12 high, <= 9 very high risk).',
    compute: F.braden,
    fields: [
      { dom: 'br-sens', arg: 'sensory', kind: 'number', required: true, label: 'Sensory perception (1-4)' },
      { dom: 'br-moist', arg: 'moisture', kind: 'number', required: true, label: 'Moisture (1-4)' },
      { dom: 'br-act', arg: 'activity', kind: 'number', required: true, label: 'Activity (1-4)' },
      { dom: 'br-mob', arg: 'mobility', kind: 'number', required: true, label: 'Mobility (1-4)' },
      { dom: 'br-nutr', arg: 'nutrition', kind: 'number', required: true, label: 'Nutrition (1-4)' },
      { dom: 'br-fric', arg: 'friction', kind: 'number', required: true, label: 'Friction and shear (1-3)' },
    ],
  },
  {
    id: 'morse-falls',
    summary: 'Morse Fall Scale (Morse 1989): history of falling (25), secondary diagnosis (15), ambulatory aid (0/15/30), IV or heparin lock (20), gait (0/10/20), mental status (0/15); 0-24 low, 25-50 moderate, >= 51 high fall risk.',
    compute: F.morseFalls,
    fields: [
      { dom: 'mf-hist', arg: 'history', kind: 'bool', label: 'History of falling within 3 months (25)' },
      { dom: 'mf-sec', arg: 'secondaryDx', kind: 'bool', label: 'Secondary diagnosis (15)' },
      { dom: 'mf-aid', arg: 'ambulatoryAid', kind: 'enum', values: ['none', 'crutches-cane-walker', 'furniture'], required: true, label: 'Ambulatory aid (none 0 / crutches-cane-walker 15 / furniture 30)' },
      { dom: 'mf-iv', arg: 'ivOrLock', kind: 'bool', label: 'IV / heparin lock (20)' },
      { dom: 'mf-gait', arg: 'gait', kind: 'enum', values: ['normal', 'weak', 'impaired'], required: true, label: 'Gait (normal 0 / weak 10 / impaired 20)' },
      { dom: 'mf-ms', arg: 'mentalStatus', kind: 'enum', values: ['oriented', 'forgets-limitations'], required: true, label: 'Mental status (oriented 0 / forgets-limitations 15)' },
    ],
  },
  {
    id: 'hendrich-ii',
    summary: 'Hendrich II Fall Risk Model (Hendrich 2003): confusion/disorientation/impulsivity (4), symptomatic depression (2), altered elimination (1), dizziness (1), male sex (1), antiepileptic (2), benzodiazepine (1), and the get-up-and-go test (0/1/3/4); >= 5 is high fall risk.',
    compute: F.hendrichII,
    fields: [
      { dom: 'hii-conf', arg: 'confusion', kind: 'bool', label: 'Confusion / disorientation / impulsivity (4)' },
      { dom: 'hii-dep', arg: 'depression', kind: 'bool', label: 'Symptomatic depression (2)' },
      { dom: 'hii-elim', arg: 'alteredElim', kind: 'bool', label: 'Altered elimination (1)' },
      { dom: 'hii-dizz', arg: 'dizziness', kind: 'bool', label: 'Dizziness / vertigo (1)' },
      { dom: 'hii-male', arg: 'male', kind: 'bool', label: 'Male sex (1)' },
      { dom: 'hii-aed', arg: 'antiepileptic', kind: 'bool', label: 'Prescribed antiepileptic (2)' },
      { dom: 'hii-bz', arg: 'benzodiazepine', kind: 'bool', label: 'Prescribed benzodiazepine (1)' },
      { dom: 'hii-gug', arg: 'getUpAndGo', kind: 'enum', values: ['able', 'pushes-up', 'needs-help', 'unable'], required: true, label: 'Get-up-and-go test (able 0 / pushes-up 1 / needs-help 3 / unable 4)' },
    ],
  },
  {
    id: 'cam',
    summary: 'Confusion Assessment Method (Inouye 1990) for non-ICU delirium: positive when feature 1 (acute onset or fluctuating course) AND feature 2 (inattention) AND either feature 3 (disorganized thinking) or feature 4 (altered consciousness).',
    compute: F.cam,
    fields: [
      { dom: 'cam-f1', arg: 'acuteFluctuating', kind: 'bool', label: 'Feature 1: acute onset or fluctuating course' },
      { dom: 'cam-f2', arg: 'inattention', kind: 'bool', label: 'Feature 2: inattention' },
      { dom: 'cam-f3', arg: 'disorganizedThinking', kind: 'bool', label: 'Feature 3: disorganized thinking' },
      { dom: 'cam-f4', arg: 'alteredLoc', kind: 'bool', label: 'Feature 4: altered level of consciousness' },
    ],
  },
  {
    id: 'ich-score',
    summary: 'ICH Score for intracerebral hemorrhage (Hemphill 2001): GCS band (3-4 = 2, 5-12 = 1), age >= 80 (1), ICH volume >= 30 mL (1), infratentorial origin (1), intraventricular hemorrhage (1); total 0-6 with the 30-day mortality (0% / 13% / 26% / 72% / 97% / 100%).',
    compute: F.ichScore,
    fields: [
      { dom: 'ich-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale (3-15)' },
      { dom: 'ich-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ich-vol', arg: 'ichVolumeMl', kind: 'number', required: true, label: 'ICH volume', unit: 'mL' },
      { dom: 'ich-infra', arg: 'infratentorial', kind: 'bool', label: 'Infratentorial origin' },
      { dom: 'ich-ivh', arg: 'ivh', kind: 'bool', label: 'Intraventricular hemorrhage' },
    ],
  },
  {
    id: 'hunt-hess-wfns',
    summary: 'Aneurysmal SAH grading: the Hunt-Hess grade I-V (Hunt 1968) alongside the WFNS grade derived from GCS band plus focal motor deficit (Drake 1988); returns both grades and the Hunt-Hess descriptor.',
    compute: F.huntHessWfns,
    fields: [
      { dom: 'hh-grade', arg: 'huntHess', kind: 'enum', values: ['1', '2', '3', '4', '5'], required: true, label: 'Hunt-Hess grade (I-V)', to: (v) => Number(v) },
      { dom: 'hh-gcs', arg: 'gcs', kind: 'number', required: true, label: 'GCS for the WFNS grade (3-15)' },
      { dom: 'hh-focal', arg: 'focalMotorDeficit', kind: 'bool', label: 'Focal motor deficit (splits WFNS II/III at GCS 13-14)' },
    ],
  },
  {
    id: 'mnihss',
    summary: 'Modified NIH Stroke Scale (Meyer 2002): the eleven retained items (LOC questions/commands, gaze, visual fields, motor arm L/R, motor leg L/R, sensory as 0/1, language, extinction) each 0 to its item max; total 0-31 with the stroke-severity band. Unscored items count as 0.',
    compute: F.mnihss,
    fields: [
      { dom: 'mn-loc-q', arg: 'locQuestions', kind: 'number', label: 'LOC questions (0-2)' },
      { dom: 'mn-loc-c', arg: 'locCommands', kind: 'number', label: 'LOC commands (0-2)' },
      { dom: 'mn-gaze', arg: 'gaze', kind: 'number', label: 'Best gaze (0-2)' },
      { dom: 'mn-vf', arg: 'visualFields', kind: 'number', label: 'Visual fields (0-3)' },
      { dom: 'mn-arm-l', arg: 'motorArmL', kind: 'number', label: 'Motor arm left (0-4)' },
      { dom: 'mn-arm-r', arg: 'motorArmR', kind: 'number', label: 'Motor arm right (0-4)' },
      { dom: 'mn-leg-l', arg: 'motorLegL', kind: 'number', label: 'Motor leg left (0-4)' },
      { dom: 'mn-leg-r', arg: 'motorLegR', kind: 'number', label: 'Motor leg right (0-4)' },
      { dom: 'mn-sens', arg: 'sensory', kind: 'number', label: 'Sensory (0 normal / 1 abnormal)' },
      { dom: 'mn-lang', arg: 'language', kind: 'number', label: 'Best language (0-3)' },
      { dom: 'mn-ext', arg: 'extinction', kind: 'number', label: 'Extinction / neglect (0-2)' },
    ],
  },
  {
    id: 'four-score',
    summary: 'FOUR (Full Outline of UnResponsiveness) Score (Wijdicks 2005): eye response, motor response, brainstem reflexes, and respiration each 0-4; total 0-16 with the per-component E/M/B/R breakdown reported.',
    compute: F.fourScore,
    fields: [
      { dom: 'fs-eye', arg: 'eye', kind: 'number', required: true, label: 'Eye response (0-4)' },
      { dom: 'fs-motor', arg: 'motor', kind: 'number', required: true, label: 'Motor response (0-4)' },
      { dom: 'fs-brain', arg: 'brainstem', kind: 'number', required: true, label: 'Brainstem reflexes (0-4)' },
      { dom: 'fs-resp', arg: 'respiration', kind: 'number', required: true, label: 'Respiration (0-4)' },
    ],
  },

  // --- wave 64: the pediatric / ICU pain, sedation, and withdrawal scales --
  {
    id: 'flacc',
    summary: 'FLACC behavioral pain scale (Merkel 1997): face, legs, activity, cry, and consolability each 0-2; sum 0-10 (0 relaxed, 1-3 mild, 4-6 moderate, 7-10 severe discomfort).',
    compute: F.flacc,
    fields: [
      { dom: 'fl-face', arg: 'face', kind: 'number', required: true, label: 'Face (0-2)' },
      { dom: 'fl-legs', arg: 'legs', kind: 'number', required: true, label: 'Legs (0-2)' },
      { dom: 'fl-act', arg: 'activity', kind: 'number', required: true, label: 'Activity (0-2)' },
      { dom: 'fl-cry', arg: 'cry', kind: 'number', required: true, label: 'Cry (0-2)' },
      { dom: 'fl-cons', arg: 'consolability', kind: 'number', required: true, label: 'Consolability (0-2)' },
    ],
  },
  {
    id: 'painad',
    summary: 'PAINAD scale for advanced dementia (Warden 2003): breathing, negative vocalization, facial expression, body language, and consolability each 0-2; sum 0-10 (0 no pain, 1-3 mild, 4-6 moderate, 7-10 severe).',
    compute: F.painad,
    fields: [
      { dom: 'pa-br', arg: 'breathing', kind: 'number', required: true, label: 'Breathing independent of vocalization (0-2)' },
      { dom: 'pa-vo', arg: 'vocalization', kind: 'number', required: true, label: 'Negative vocalization (0-2)' },
      { dom: 'pa-fa', arg: 'facial', kind: 'number', required: true, label: 'Facial expression (0-2)' },
      { dom: 'pa-bl', arg: 'bodyLanguage', kind: 'number', required: true, label: 'Body language (0-2)' },
      { dom: 'pa-cons', arg: 'consolability', kind: 'number', required: true, label: 'Consolability (0-2)' },
    ],
  },
  {
    id: 'nips',
    summary: 'Neonatal Infant Pain Scale (Lawrence 1993): facial expression, breathing, arms, legs, and state of arousal each 0-1 with cry 0-2; sum 0-7 (0-2 no/mild, 3-4 mild-to-moderate, > 4 severe pain).',
    compute: F.nips,
    fields: [
      { dom: 'ni-face', arg: 'facialExpression', kind: 'number', required: true, label: 'Facial expression (0-1)' },
      { dom: 'ni-cry', arg: 'cry', kind: 'number', required: true, label: 'Cry (0-2)' },
      { dom: 'ni-br', arg: 'breathingPatterns', kind: 'number', required: true, label: 'Breathing patterns (0-1)' },
      { dom: 'ni-arms', arg: 'arms', kind: 'number', required: true, label: 'Arms (0-1)' },
      { dom: 'ni-legs', arg: 'legs', kind: 'number', required: true, label: 'Legs (0-1)' },
      { dom: 'ni-sta', arg: 'stateOfArousal', kind: 'number', required: true, label: 'State of arousal (0-1)' },
    ],
  },
  {
    id: 'npass',
    summary: 'Neonatal Pain, Agitation and Sedation Scale (Hummel 2008): five items each -2 to +2; positive values sum to a pain score (with a +1/week preterm adjustment below 30 weeks gestation), negative values sum to a sedation score. Returns both scores and bands.',
    compute: F.npass,
    fields: [
      { dom: 'np-cry', arg: 'crying', kind: 'number', required: true, label: 'Crying / irritability (-2..+2)' },
      { dom: 'np-beh', arg: 'behavior', kind: 'number', required: true, label: 'Behavior / state (-2..+2)' },
      { dom: 'np-fac', arg: 'facial', kind: 'number', required: true, label: 'Facial expression (-2..+2)' },
      { dom: 'np-ext', arg: 'extremities', kind: 'number', required: true, label: 'Extremities / tone (-2..+2)' },
      { dom: 'np-vit', arg: 'vitals', kind: 'number', required: true, label: 'Vital signs (-2..+2)' },
      { dom: 'np-ga', arg: 'gestationalAgeWeeks', kind: 'number', required: true, label: 'Gestational age', unit: 'weeks' },
    ],
  },
  {
    id: 'cries',
    summary: 'CRIES neonatal postoperative pain scale (Krechel 1995): crying, requires oxygen, increased vital signs, expression, and sleeplessness each 0-2; sum 0-10 (>= 4 indicates analgesia, >= 7 severe pain).',
    compute: F.cries,
    fields: [
      { dom: 'cr-cry', arg: 'crying', kind: 'number', required: true, label: 'Crying (0-2)' },
      { dom: 'cr-o2', arg: 'requiresO2', kind: 'number', required: true, label: 'Requires O2 for SaO2 < 95% (0-2)' },
      { dom: 'cr-vit', arg: 'vitals', kind: 'number', required: true, label: 'Increased vital signs (0-2)' },
      { dom: 'cr-exp', arg: 'expression', kind: 'number', required: true, label: 'Expression (0-2)' },
      { dom: 'cr-slp', arg: 'sleeplessness', kind: 'number', required: true, label: 'Sleeplessness (0-2)' },
    ],
  },
  {
    id: 'poss',
    summary: 'Pasero Opioid-induced Sedation Scale (Pasero 2009): a single level S/1/2/3/4 (entered 0-4); S-2 acceptable, 3 and 4 trigger the named opioid-titration actions. Returns the level, its description, the recommended action, and whether it is acceptable.',
    compute: F.poss,
    fields: [
      { dom: 'po-lvl', arg: 'level', kind: 'number', required: true, label: 'Sedation level (0 = S, 1, 2, 3, 4)' },
    ],
  },
  {
    id: 'comfort-b',
    summary: 'COMFORT-B behavioral sedation scale (van Dijk 2005): alertness, calmness, respiratory response/crying, movement, muscle tone, and facial tension each 1-5; sum 6-30 (< 11 over-sedation, 11-22 adequate, > 22 inadequate / distress).',
    compute: F.comfortB,
    fields: [
      { dom: 'cb-alt', arg: 'alertness', kind: 'number', required: true, label: 'Alertness (1-5)' },
      { dom: 'cb-cal', arg: 'calmness', kind: 'number', required: true, label: 'Calmness / agitation (1-5)' },
      { dom: 'cb-res', arg: 'respiratoryOrCry', kind: 'number', required: true, label: 'Respiratory response or crying (1-5)' },
      { dom: 'cb-mov', arg: 'movement', kind: 'number', required: true, label: 'Physical movement (1-5)' },
      { dom: 'cb-mus', arg: 'muscleTone', kind: 'number', required: true, label: 'Muscle tone (1-5)' },
      { dom: 'cb-fac', arg: 'facialTension', kind: 'number', required: true, label: 'Facial tension (1-5)' },
    ],
  },
  {
    id: 'wat-1',
    summary: 'Withdrawal Assessment Tool-1 (Franck 2008): ten binary items plus a recovery-time score (< 2 min = 0, 2-5 = 1, > 5 = 2); total 0-12, >= 3 indicates iatrogenic opioid/benzodiazepine withdrawal.',
    compute: F.wat1,
    fields: [
      { dom: 'w1-ls', arg: 'looseStools', kind: 'number', required: true, label: 'Loose / watery stools in last 12 h (0-1)' },
      { dom: 'w1-vo', arg: 'vomiting', kind: 'number', required: true, label: 'Vomiting / retching / gagging in last 12 h (0-1)' },
      { dom: 'w1-fe', arg: 'fever', kind: 'number', required: true, label: 'Temperature > 37.8 C in last 12 h (0-1)' },
      { dom: 'w1-sb', arg: 'sbsStatePositive', kind: 'number', required: true, label: 'SBS state > 0 during observation (0-1)' },
      { dom: 'w1-tr', arg: 'tremor', kind: 'number', required: true, label: 'Tremor (0-1)' },
      { dom: 'w1-sw', arg: 'sweating', kind: 'number', required: true, label: 'Any sweating (0-1)' },
      { dom: 'w1-um', arg: 'uncoordinatedMovement', kind: 'number', required: true, label: 'Uncoordinated / repetitive movement (0-1)' },
      { dom: 'w1-ys', arg: 'yawnSneeze', kind: 'number', required: true, label: 'Yawning or sneezing (0-1)' },
      { dom: 'w1-st', arg: 'startleToTouch', kind: 'number', required: true, label: 'Startle to touch (0-1)' },
      { dom: 'w1-mt', arg: 'increasedMuscleTone', kind: 'number', required: true, label: 'Increased muscle tone (0-1)' },
      { dom: 'w1-rm', arg: 'recoveryMinutes', kind: 'number', required: true, label: 'Minutes to regain calm after stimulus' },
    ],
  },
  {
    id: 'sbs',
    summary: 'State Behavioral Scale (Curley 2006): a single level -3 (unresponsive) to +2 (agitated); -1 and 0 are the target band, -2/-3 are deeper than target, +1/+2 are inadequate sedation / distress.',
    compute: F.sbs,
    fields: [
      { dom: 'sb-lvl', arg: 'level', kind: 'number', required: true, label: 'SBS level (-3 to +2)' },
    ],
  },
  {
    id: 'sos',
    summary: 'Sophia Observation withdrawal Symptoms scale (Ista 2009): fifteen binary symptoms observed over the prior 4-hour window; total 0-15, >= 4 indicates clinically relevant iatrogenic withdrawal.',
    compute: F.sos,
    fields: [
      { dom: 'so-tac', arg: 'tachycardia', kind: 'number', required: true, label: 'Tachycardia (0-1)' },
      { dom: 'so-tap', arg: 'tachypnea', kind: 'number', required: true, label: 'Tachypnea (0-1)' },
      { dom: 'so-fev', arg: 'fever', kind: 'number', required: true, label: 'Fever (0-1)' },
      { dom: 'so-swe', arg: 'sweating', kind: 'number', required: true, label: 'Sweating (0-1)' },
      { dom: 'so-agi', arg: 'agitation', kind: 'number', required: true, label: 'Agitation (0-1)' },
      { dom: 'so-anx', arg: 'anxiety', kind: 'number', required: true, label: 'Anxiety (0-1)' },
      { dom: 'so-gri', arg: 'grimacing', kind: 'number', required: true, label: 'Grimacing (0-1)' },
      { dom: 'so-sle', arg: 'sleeplessness', kind: 'number', required: true, label: 'Sleeplessness (0-1)' },
      { dom: 'so-hal', arg: 'hallucinations', kind: 'number', required: true, label: 'Hallucinations (0-1)' },
      { dom: 'so-mot', arg: 'motorDisturbance', kind: 'number', required: true, label: 'Motor disturbance (0-1)' },
      { dom: 'so-hyp', arg: 'hypertonia', kind: 'number', required: true, label: 'Hypertonia (0-1)' },
      { dom: 'so-tre', arg: 'tremor', kind: 'number', required: true, label: 'Tremor (0-1)' },
      { dom: 'so-vom', arg: 'vomiting', kind: 'number', required: true, label: 'Vomiting (0-1)' },
      { dom: 'so-dia', arg: 'diarrhea', kind: 'number', required: true, label: 'Diarrhea (0-1)' },
      { dom: 'so-cry', arg: 'inconsolableCrying', kind: 'number', required: true, label: 'Inconsolable crying (0-1)' },
    ],
  },

  // --- wave 65: the prehospital stroke scales, ADLs, and C-SSRS -----------
  {
    id: 'cpss',
    summary: 'Cincinnati Prehospital Stroke Scale (Kothari 1999): facial droop, arm drift, and abnormal speech each 0 (normal) or 1 (abnormal); any single abnormal item is a positive screen.',
    compute: F.cpss,
    fields: [
      { dom: 'cp-face', arg: 'facialDroop', kind: 'number', required: true, label: 'Facial droop (0 normal / 1 abnormal)' },
      { dom: 'cp-arm', arg: 'armDrift', kind: 'number', required: true, label: 'Arm drift (0 normal / 1 abnormal)' },
      { dom: 'cp-speech', arg: 'abnormalSpeech', kind: 'number', required: true, label: 'Abnormal speech (0 normal / 1 abnormal)' },
    ],
  },
  {
    id: 'lams',
    summary: 'Los Angeles Motor Scale (Llanes 2004 / Nazliel 2008): facial droop (0-1), arm drift (0-2), grip strength (0-2); sum 0-5, >= 4 suggests a large-vessel occlusion.',
    compute: F.lams,
    fields: [
      { dom: 'lm-face', arg: 'facialDroop', kind: 'number', required: true, label: 'Facial droop (0-1)' },
      { dom: 'lm-arm', arg: 'armDrift', kind: 'number', required: true, label: 'Arm drift (0-2)' },
      { dom: 'lm-grip', arg: 'gripStrength', kind: 'number', required: true, label: 'Grip strength (0-2)' },
    ],
  },
  {
    id: 'race',
    summary: 'Rapid Arterial oCclusion Evaluation scale (Pérez de la Ossa 2014): facial palsy (0-2), arm motor (0-2), leg motor (0-2), head/gaze deviation (0-1), aphasia or agnosia (0-2); sum 0-9, >= 5 suggests a large-vessel occlusion.',
    compute: F.race,
    fields: [
      { dom: 'ra-face', arg: 'facialPalsy', kind: 'number', required: true, label: 'Facial palsy (0-2)' },
      { dom: 'ra-arm', arg: 'armMotor', kind: 'number', required: true, label: 'Arm motor function (0-2)' },
      { dom: 'ra-leg', arg: 'legMotor', kind: 'number', required: true, label: 'Leg motor function (0-2)' },
      { dom: 'ra-gaze', arg: 'gaze', kind: 'number', required: true, label: 'Head / gaze deviation (0-1)' },
      { dom: 'ra-lang', arg: 'languageAgnosia', kind: 'number', required: true, label: 'Aphasia or agnosia (0-2)' },
    ],
  },
  {
    id: 'rosier',
    summary: 'Recognition of Stroke in the Emergency Room scale (Nor 2005): loss of consciousness/syncope and seizure each subtract 1; asymmetric facial, arm, or leg weakness, speech disturbance, and visual field defect each add 1; a total > 0 indicates a likely stroke.',
    compute: F.rosier,
    fields: [
      { dom: 'ro-loc', arg: 'locSyncope', kind: 'bool', label: 'Loss of consciousness / syncope (-1)' },
      { dom: 'ro-sez', arg: 'seizure', kind: 'bool', label: 'Seizure activity (-1)' },
      { dom: 'ro-face', arg: 'facialWeakness', kind: 'bool', label: 'New asymmetric facial weakness (+1)' },
      { dom: 'ro-arm', arg: 'armWeakness', kind: 'bool', label: 'New asymmetric arm weakness (+1)' },
      { dom: 'ro-leg', arg: 'legWeakness', kind: 'bool', label: 'New asymmetric leg weakness (+1)' },
      { dom: 'ro-speech', arg: 'speechDisturbance', kind: 'bool', label: 'Speech disturbance (+1)' },
      { dom: 'ro-vis', arg: 'visualFieldDefect', kind: 'bool', label: 'Visual field defect (+1)' },
    ],
  },
  {
    id: 'guss',
    summary: 'Gugging Swallowing Screen (Trapl 2007): a two-stage post-stroke dysphagia screen - a 5-point preliminary saliva test gates three sequential 5-point consistency subtests (semisolid, liquid, solid); total 0-20 with the dysphagia-severity and diet band. Later subtests are gated at 0 until the prior stage scores 5.',
    compute: F.guss,
    fields: [
      { dom: 'gu-vig', arg: 'vigilance', kind: 'number', required: true, label: 'Vigilance: awake / alert (0-1)' },
      { dom: 'gu-cgh', arg: 'coughClear', kind: 'number', required: true, label: 'Voluntary cough or throat clearing (0-1)' },
      { dom: 'gu-sw', arg: 'salivaSwallow', kind: 'number', required: true, label: 'Saliva swallow successful (0-1)' },
      { dom: 'gu-dr', arg: 'salivaNoDrool', kind: 'number', required: true, label: 'No drooling (0-1)' },
      { dom: 'gu-vc', arg: 'salivaNoVoiceChange', kind: 'number', required: true, label: 'No voice change (0-1)' },
      { dom: 'gu-ssSw', arg: 'semisolidSwallow', kind: 'number', required: true, label: 'Semisolid deglutition (0-2)' },
      { dom: 'gu-ssCg', arg: 'semisolidNoCough', kind: 'number', required: true, label: 'Semisolid: no involuntary cough (0-1)' },
      { dom: 'gu-ssDr', arg: 'semisolidNoDrool', kind: 'number', required: true, label: 'Semisolid: no drooling (0-1)' },
      { dom: 'gu-ssVc', arg: 'semisolidNoVoiceChange', kind: 'number', required: true, label: 'Semisolid: no voice change (0-1)' },
      { dom: 'gu-liSw', arg: 'liquidSwallow', kind: 'number', required: true, label: 'Liquid deglutition (0-2)' },
      { dom: 'gu-liCg', arg: 'liquidNoCough', kind: 'number', required: true, label: 'Liquid: no involuntary cough (0-1)' },
      { dom: 'gu-liDr', arg: 'liquidNoDrool', kind: 'number', required: true, label: 'Liquid: no drooling (0-1)' },
      { dom: 'gu-liVc', arg: 'liquidNoVoiceChange', kind: 'number', required: true, label: 'Liquid: no voice change (0-1)' },
      { dom: 'gu-soSw', arg: 'solidSwallow', kind: 'number', required: true, label: 'Solid deglutition (0-2)' },
      { dom: 'gu-soCg', arg: 'solidNoCough', kind: 'number', required: true, label: 'Solid: no involuntary cough (0-1)' },
      { dom: 'gu-soDr', arg: 'solidNoDrool', kind: 'number', required: true, label: 'Solid: no drooling (0-1)' },
      { dom: 'gu-soVc', arg: 'solidNoVoiceChange', kind: 'number', required: true, label: 'Solid: no voice change (0-1)' },
    ],
  },
  {
    id: 'barthel',
    summary: 'Barthel Index of activities of daily living (Mahoney 1965; Shah 1989 banding): ten weighted items (feeding, bathing, grooming, dressing, bowel, bladder, toilet use, transfers, mobility, stairs); total 0-100 with the dependency band.',
    compute: F.barthel,
    fields: [
      { dom: 'bt-feed', arg: 'feeding', kind: 'number', required: true, label: 'Feeding (0/5/10)' },
      { dom: 'bt-bath', arg: 'bathing', kind: 'number', required: true, label: 'Bathing (0/5)' },
      { dom: 'bt-groom', arg: 'grooming', kind: 'number', required: true, label: 'Grooming (0/5)' },
      { dom: 'bt-dress', arg: 'dressing', kind: 'number', required: true, label: 'Dressing (0/5/10)' },
      { dom: 'bt-bowel', arg: 'bowel', kind: 'number', required: true, label: 'Bowel control (0/5/10)' },
      { dom: 'bt-bladder', arg: 'bladder', kind: 'number', required: true, label: 'Bladder control (0/5/10)' },
      { dom: 'bt-toil', arg: 'toilet', kind: 'number', required: true, label: 'Toilet use (0/5/10)' },
      { dom: 'bt-trans', arg: 'transfers', kind: 'number', required: true, label: 'Transfers (0/5/10/15)' },
      { dom: 'bt-mob', arg: 'mobility', kind: 'number', required: true, label: 'Mobility (0/5/10/15)' },
      { dom: 'bt-stair', arg: 'stairs', kind: 'number', required: true, label: 'Stairs (0/5/10)' },
    ],
  },
  {
    id: 'lawton-iadl',
    summary: 'Lawton Instrumental Activities of Daily Living scale (Lawton & Brody 1969): eight items (telephone, shopping, food preparation, housekeeping, laundry, transportation, medications, finances) each 0 (needs help) or 1 (independent); total 0-8.',
    compute: F.lawtonIadl,
    fields: [
      { dom: 'lw-tel', arg: 'telephone', kind: 'number', required: true, label: 'Telephone use (0/1)' },
      { dom: 'lw-shop', arg: 'shopping', kind: 'number', required: true, label: 'Shopping (0/1)' },
      { dom: 'lw-food', arg: 'foodPrep', kind: 'number', required: true, label: 'Food preparation (0/1)' },
      { dom: 'lw-house', arg: 'housekeeping', kind: 'number', required: true, label: 'Housekeeping (0/1)' },
      { dom: 'lw-laund', arg: 'laundry', kind: 'number', required: true, label: 'Laundry (0/1)' },
      { dom: 'lw-trans', arg: 'transportation', kind: 'number', required: true, label: 'Transportation (0/1)' },
      { dom: 'lw-med', arg: 'medications', kind: 'number', required: true, label: 'Medication responsibility (0/1)' },
      { dom: 'lw-fin', arg: 'finances', kind: 'number', required: true, label: 'Handling finances (0/1)' },
    ],
  },
  {
    id: 'katz-adl',
    summary: 'Katz Index of Independence in Activities of Daily Living (Katz 1963): six items (bathing, dressing, toileting, transferring, continence, feeding) each 0 (dependent) or 1 (independent); total 0-6.',
    compute: F.katzAdl,
    fields: [
      { dom: 'kz-bath', arg: 'bathing', kind: 'number', required: true, label: 'Bathing (0/1)' },
      { dom: 'kz-dress', arg: 'dressing', kind: 'number', required: true, label: 'Dressing (0/1)' },
      { dom: 'kz-toil', arg: 'toileting', kind: 'number', required: true, label: 'Toileting (0/1)' },
      { dom: 'kz-trans', arg: 'transferring', kind: 'number', required: true, label: 'Transferring (0/1)' },
      { dom: 'kz-cont', arg: 'continence', kind: 'number', required: true, label: 'Continence (0/1)' },
      { dom: 'kz-feed', arg: 'feeding', kind: 'number', required: true, label: 'Feeding (0/1)' },
    ],
  },
  {
    id: 'cssrs',
    summary: 'Columbia-Suicide Severity Rating Scale Screener (Posner 2011, Columbia Lighthouse ED Triage banding): six ideation/behavior questions plus a lifetime-behavior recency follow-up, banded no / low / moderate / high suicide risk with the corresponding action.',
    compute: F.cssrs,
    fields: [
      { dom: 'cs-q1', arg: 'wishDead', kind: 'bool', label: 'Q1: wish to be dead (past month)' },
      { dom: 'cs-q2', arg: 'thoughtsKilling', kind: 'bool', label: 'Q2: thoughts of killing yourself (past month)' },
      { dom: 'cs-q3', arg: 'thoughtsMethods', kind: 'bool', label: 'Q3: thought about how (methods, no plan)' },
      { dom: 'cs-q4', arg: 'someIntent', kind: 'bool', label: 'Q4: some intention of acting' },
      { dom: 'cs-q5', arg: 'planIntent', kind: 'bool', label: 'Q5: plan and intent' },
      { dom: 'cs-q6', arg: 'behaviorLifetime', kind: 'bool', label: 'Q6: any suicidal behavior (lifetime)' },
      { dom: 'cs-q6a', arg: 'behaviorPast3Months', kind: 'bool', label: 'Q6a: behavior within the past 3 months' },
    ],
  },

  // --- wave 66: the pulmonary / community-acquired-pneumonia severity cluster
  {
    id: 'hacor',
    summary: 'HACOR score (Duan 2017) predicting non-invasive-ventilation failure: heart rate, arterial pH, GCS, the PaO2/FiO2 ratio, and respiratory rate each banded; a total > 5 at 1 hour marks the high-risk band.',
    compute: F.hacor,
    fields: [
      { dom: 'hc-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'hc-ph', arg: 'ph', kind: 'number', required: true, label: 'Arterial pH' },
      { dom: 'hc-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale (3-15)' },
      { dom: 'hc-pao2', arg: 'pao2', kind: 'number', required: true, label: 'PaO2', unit: 'mmHg' },
      { dom: 'hc-fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO2 (0-1)' },
      { dom: 'hc-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
    ],
  },
  {
    id: 'berlin-ards',
    summary: 'Berlin definition of ARDS (Ranieri 2012): timing within 1 week, bilateral opacities, an origin not fully explained by cardiac failure/overload, and PEEP >= 5 must all be present; the PaO2/FiO2 ratio then grades mild/moderate/severe. Returns whether criteria are met and the severity.',
    compute: F.berlinArds,
    fields: [
      { dom: 'ba-timing', arg: 'timingLe1wk', kind: 'bool', label: 'Timing: onset <= 1 week of insult or worsening' },
      { dom: 'ba-bilat', arg: 'bilateralOpacities', kind: 'bool', label: 'Bilateral opacities on chest imaging' },
      { dom: 'ba-not', arg: 'notExplainedByCardiacOrOverload', kind: 'bool', label: 'Not fully explained by cardiac failure or fluid overload' },
      { dom: 'ba-peep', arg: 'peepGe5cmH2O', kind: 'bool', label: 'PEEP / CPAP >= 5 cmH2O' },
      { dom: 'ba-pao2', arg: 'pao2', kind: 'number', label: 'PaO2 (mmHg, for the P/F grade)' },
      { dom: 'ba-fio2', arg: 'fio2', kind: 'number', label: 'FiO2 (0-1, for the P/F grade)' },
    ],
  },
  {
    id: 'lis-murray',
    summary: 'Murray Lung Injury Score (Murray 1988): the number of consolidated chest-x-ray quadrants, the PaO2/FiO2 ratio, PEEP, and respiratory-system compliance are each banded 0-4 and averaged; 0 no injury, 0.1-2.5 mild-moderate, > 2.5 severe (ARDS).',
    compute: F.lisMurray,
    fields: [
      { dom: 'lm-quad', arg: 'quadrants', kind: 'number', required: true, label: 'CXR quadrants with consolidation (0-4)' },
      { dom: 'lm-pao2', arg: 'pao2', kind: 'number', required: true, label: 'PaO2', unit: 'mmHg' },
      { dom: 'lm-fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO2 (0-1)' },
      { dom: 'lm-peep', arg: 'peep', kind: 'number', required: true, label: 'PEEP', unit: 'cmH2O' },
      { dom: 'lm-comp', arg: 'complianceMlPerCmH2O', kind: 'number', required: true, label: 'Compliance', unit: 'mL/cmH2O' },
    ],
  },
  {
    id: 'smart-cop',
    summary: 'SMART-COP score (Charles 2008) for intensive respiratory or vasopressor support in CAP: SBP < 90 (2), multilobar infiltrates (1), albumin < 3.5 (1), age-adjusted tachypnea (1), tachycardia >= 125 (1), confusion (1), age-adjusted oxygenation (2), and pH < 7.35 (2). Age drives the RR and oxygenation thresholds.',
    compute: F.smartCop,
    fields: [
      { dom: 'sc-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'sc-sbp', arg: 'sbpLt90', kind: 'bool', label: 'SBP < 90 mmHg (2)' },
      { dom: 'sc-multi', arg: 'multilobar', kind: 'bool', label: 'Multilobar infiltrates (1)' },
      { dom: 'sc-alb', arg: 'albuminLt35', kind: 'bool', label: 'Albumin < 3.5 g/dL (1)' },
      { dom: 'sc-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate (age-adjusted threshold)', unit: 'breaths/min' },
      { dom: 'sc-pao2', arg: 'pao2', kind: 'number', label: 'PaO2 (mmHg, for oxygenation)' },
      { dom: 'sc-spo2', arg: 'spo2', kind: 'number', label: 'SpO2 (%, for oxygenation)' },
      { dom: 'sc-pf', arg: 'pfRatio', kind: 'number', label: 'PaO2/FiO2 ratio (for oxygenation)' },
      { dom: 'sc-hr', arg: 'hrGe125', kind: 'bool', label: 'Heart rate >= 125 bpm (1)' },
      { dom: 'sc-conf', arg: 'confusion', kind: 'bool', label: 'New-onset confusion (1)' },
      { dom: 'sc-ph', arg: 'phLt735', kind: 'bool', label: 'Arterial pH < 7.35 (2)' },
    ],
  },
  {
    id: 'crb65',
    summary: 'CRB-65 pneumonia severity (Lim 2003): confusion, RR >= 30, SBP < 90 or DBP <= 60, and age >= 65 (1 each); the 0-4 total maps to a 30-day mortality band and an outpatient/admit disposition.',
    compute: F.crb65,
    fields: [
      { dom: 'cr-conf', arg: 'confusion', kind: 'bool', label: 'Confusion (new-onset) (1)' },
      { dom: 'cr-rr', arg: 'rrGe30', kind: 'bool', label: 'Respiratory rate >= 30/min (1)' },
      { dom: 'cr-bp', arg: 'sbpLt90OrDbpLe60', kind: 'bool', label: 'SBP < 90 or DBP <= 60 (1)' },
      { dom: 'cr-age', arg: 'ageGe65', kind: 'bool', label: 'Age >= 65 (1)' },
    ],
  },
  {
    id: 'ats-idsa-cap',
    summary: 'ATS/IDSA 2019 severe community-acquired-pneumonia criteria (Metlay 2019): either major criterion (septic shock on vasopressors, respiratory failure needing mechanical ventilation) or >= 3 of nine minor criteria defines severe CAP.',
    compute: F.atsIdsaCap,
    fields: [
      { dom: 'ai-major-vp', arg: 'majorVasopressors', kind: 'bool', label: 'Major: septic shock requiring vasopressors' },
      { dom: 'ai-major-mv', arg: 'majorMechanicalVentilation', kind: 'bool', label: 'Major: respiratory failure requiring mechanical ventilation' },
      { dom: 'ai-rr', arg: 'minorRrGe30', kind: 'bool', label: 'Minor: respiratory rate >= 30/min' },
      { dom: 'ai-pf', arg: 'minorPfLe250', kind: 'bool', label: 'Minor: PaO2/FiO2 <= 250' },
      { dom: 'ai-multi', arg: 'minorMultilobar', kind: 'bool', label: 'Minor: multilobar infiltrates' },
      { dom: 'ai-conf', arg: 'minorConfusion', kind: 'bool', label: 'Minor: confusion / disorientation' },
      { dom: 'ai-bun', arg: 'minorUremiaBunGe20', kind: 'bool', label: 'Minor: uremia (BUN >= 20 mg/dL)' },
      { dom: 'ai-leuk', arg: 'minorLeukopeniaWbcLt4', kind: 'bool', label: 'Minor: leukopenia (WBC < 4 x10^9/L)' },
      { dom: 'ai-plt', arg: 'minorThrombocytopeniaPltLt100', kind: 'bool', label: 'Minor: thrombocytopenia (platelets < 100 x10^9/L)' },
      { dom: 'ai-hypo', arg: 'minorHypothermiaLt36', kind: 'bool', label: 'Minor: hypothermia (core temp < 36 C)' },
      { dom: 'ai-fluid', arg: 'minorHypotensionAggressiveFluids', kind: 'bool', label: 'Minor: hypotension requiring aggressive fluids' },
    ],
  },

  // --- wave 67: the nutrition-risk and Ottawa-rule cluster ----------------
  {
    id: 'nutric',
    summary: 'NUTRIC Score (Heyland 2011) for ICU nutrition risk: age, APACHE II, SOFA, comorbidity count, days from hospital to ICU, and IL-6 each banded; total 0-10, >= 6 is high nutritional risk.',
    compute: F.nutric,
    fields: [
      { dom: 'nt-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'nt-apache', arg: 'apache2', kind: 'number', required: true, label: 'APACHE II score' },
      { dom: 'nt-sofa', arg: 'sofa', kind: 'number', required: true, label: 'SOFA score' },
      { dom: 'nt-comorb', arg: 'comorbidities', kind: 'number', required: true, label: 'Number of comorbidities' },
      { dom: 'nt-days', arg: 'daysHospitalToIcu', kind: 'number', required: true, label: 'Days from hospital to ICU' },
      { dom: 'nt-il6', arg: 'il6Pg', kind: 'number', required: true, label: 'IL-6', unit: 'pg/mL' },
    ],
  },
  {
    id: 'mnutric',
    summary: 'Modified NUTRIC Score (Rahman 2016) without IL-6: age, APACHE II, SOFA, comorbidity count, and days from hospital to ICU each banded; total 0-9, >= 5 is high nutritional risk.',
    compute: F.mnutric,
    fields: [
      { dom: 'mn-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'mn-apache', arg: 'apache2', kind: 'number', required: true, label: 'APACHE II score' },
      { dom: 'mn-sofa', arg: 'sofa', kind: 'number', required: true, label: 'SOFA score' },
      { dom: 'mn-comorb', arg: 'comorbidities', kind: 'number', required: true, label: 'Number of comorbidities' },
      { dom: 'mn-days', arg: 'daysHospitalToIcu', kind: 'number', required: true, label: 'Days from hospital to ICU' },
    ],
  },
  {
    id: 'nrs2002',
    summary: 'Nutritional Risk Screening 2002 (Kondrup 2003): severity of disease (0-3), nutritional status (0-3), plus 1 point for age >= 70; total >= 3 flags nutritional risk (ESPEN-endorsed cutoff).',
    compute: F.nrs2002,
    fields: [
      { dom: 'nr-sev', arg: 'severityOfDisease', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Severity of disease (0-3)', to: (v) => Number(v) },
      { dom: 'nr-nut', arg: 'nutritionalStatus', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Nutritional status (0-3)', to: (v) => Number(v) },
      { dom: 'nr-age', arg: 'ageGe70', kind: 'bool', label: 'Age >= 70 years (+1)' },
    ],
  },
  {
    id: 'must-nutrition',
    summary: 'Malnutrition Universal Screening Tool (BAPEN 2003): BMI band (0-2), unplanned weight-loss band (0-2), plus 2 points if acutely ill with no intake for > 5 days; total 0 low, 1 medium, >= 2 high malnutrition risk.',
    compute: F.mustNutrition,
    fields: [
      { dom: 'mu-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
      { dom: 'mu-wl', arg: 'weightLossPct', kind: 'number', required: true, label: 'Unplanned weight loss in past 3-6 months', unit: '%' },
      { dom: 'mu-acute', arg: 'acuteDiseaseNoIntakeGt5d', kind: 'bool', label: 'Acutely ill and no intake for > 5 days (+2)' },
    ],
  },
  {
    id: 'ottawa-ankle',
    summary: 'Ottawa Ankle and Foot Rules (Stiell 1992): ankle x-ray if malleolar-zone pain plus posterior-malleolus tenderness or inability to bear weight; foot x-ray if midfoot-zone pain plus 5th-metatarsal/navicular tenderness or inability to bear weight. Returns which imaging is indicated.',
    compute: F.ottawaAnkle,
    fields: [
      { dom: 'oa-mp', arg: 'malleolarPain', kind: 'bool', label: 'Pain in malleolar zone' },
      { dom: 'oa-lat', arg: 'lateralMalleolusTender', kind: 'bool', label: 'Lateral malleolus tenderness (distal 6 cm)' },
      { dom: 'oa-med', arg: 'medialMalleolusTender', kind: 'bool', label: 'Medial malleolus tenderness (distal 6 cm)' },
      { dom: 'oa-abw', arg: 'ankleCannotBearWeight', kind: 'bool', label: 'Ankle: cannot bear weight 4 steps' },
      { dom: 'oa-fp', arg: 'midfootPain', kind: 'bool', label: 'Pain in midfoot zone' },
      { dom: 'oa-fmt', arg: 'fifthMetatarsalTender', kind: 'bool', label: 'Base of 5th metatarsal tenderness' },
      { dom: 'oa-nav', arg: 'navicularTender', kind: 'bool', label: 'Navicular tenderness' },
      { dom: 'oa-fbw', arg: 'footCannotBearWeight', kind: 'bool', label: 'Foot: cannot bear weight 4 steps' },
    ],
  },
  {
    id: 'ottawa-sah',
    summary: 'Ottawa Subarachnoid Hemorrhage Rule (Perry 2013) for alert patients with a new severe non-traumatic headache peaking within 1 hour: an exclusion criterion makes the rule inapplicable; otherwise any of six criteria (age >= 40, neck pain/stiffness, witnessed LOC, onset during exertion, thunderclap headache, limited neck flexion) means SAH cannot be ruled out.',
    compute: F.ottawaSah,
    fields: [
      { dom: 'os-excl', arg: 'exclusionCriteriaPresent', kind: 'bool', label: 'Any exclusion present (rule inapplicable)' },
      { dom: 'os-age', arg: 'ageGe40', kind: 'bool', label: 'Age >= 40' },
      { dom: 'os-neck', arg: 'neckPainOrStiffness', kind: 'bool', label: 'Neck pain or stiffness' },
      { dom: 'os-loc', arg: 'witnessedLoc', kind: 'bool', label: 'Witnessed loss of consciousness' },
      { dom: 'os-ex', arg: 'onsetDuringExertion', kind: 'bool', label: 'Onset during exertion' },
      { dom: 'os-tc', arg: 'thunderclapHeadache', kind: 'bool', label: 'Thunderclap headache (peak within 1 second)' },
      { dom: 'os-flex', arg: 'limitedNeckFlexion', kind: 'bool', label: 'Limited neck flexion on exam' },
    ],
  },

  // --- wave 68: the workflow / wound / transfusion cluster ----------------
  {
    id: 'drip',
    summary: 'Drug Resistance in Pneumonia score (Webb 2016): four major risk factors (antibiotics in 60 days, long-term-care residence, tube feeding, prior MDR isolate) score 2 each; six minor factors (recent hospitalization, chronic pulmonary disease, poor functional status, gastric acid suppression, wound care, MRSA colonization) score 1 each; total >= 4 is high risk for a drug-resistant pathogen.',
    compute: F.drip,
    fields: [
      { dom: 'dr-abx', arg: 'antibioticsLast60d', kind: 'bool', label: 'Antibiotic use in past 60 days (2)' },
      { dom: 'dr-ltc', arg: 'longTermCareResidence', kind: 'bool', label: 'Long-term care facility residence (2)' },
      { dom: 'dr-tube', arg: 'tubeFeeding', kind: 'bool', label: 'Tube feeding (2)' },
      { dom: 'dr-mdr', arg: 'priorMdrIsolate', kind: 'bool', label: 'Prior multidrug-resistant isolate (2)' },
      { dom: 'dr-hosp', arg: 'hospitalizationLast60d', kind: 'bool', label: 'Hospitalization in past 60 days (1)' },
      { dom: 'dr-cpd', arg: 'chronicPulmonary', kind: 'bool', label: 'Chronic pulmonary disease (1)' },
      { dom: 'dr-func', arg: 'poorFunctionalStatus', kind: 'bool', label: 'Poor functional status (1)' },
      { dom: 'dr-ppi', arg: 'gastricAcidSuppression', kind: 'bool', label: 'Gastric acid suppression (1)' },
      { dom: 'dr-wound', arg: 'woundCare', kind: 'bool', label: 'Wound care (1)' },
      { dom: 'dr-mrsa', arg: 'mrsaColonization', kind: 'bool', label: 'MRSA colonization (1)' },
    ],
  },
  {
    id: 'abc-mtp',
    summary: 'Assessment of Blood Consumption score (Nunez 2009) for massive-transfusion activation: penetrating mechanism, SBP <= 90, heart rate >= 120, and a positive FAST exam (1 each); a total >= 2 predicts the need for massive transfusion.',
    compute: F.abcMtp,
    fields: [
      { dom: 'abc-pen', arg: 'penetratingMechanism', kind: 'bool', label: 'Penetrating mechanism' },
      { dom: 'abc-sbp', arg: 'sbpLe90', kind: 'bool', label: 'SBP <= 90 mmHg' },
      { dom: 'abc-hr', arg: 'hrGe120', kind: 'bool', label: 'Heart rate >= 120 bpm' },
      { dom: 'abc-fast', arg: 'positiveFast', kind: 'bool', label: 'Positive FAST exam' },
    ],
  },
  {
    id: 'npiap-staging',
    summary: 'NPIAP 2016 pressure-injury staging: classifies from a mucosal location, whether skin is intact and the erythema behavior (blanchable / non-blanchable / deep discoloration), whether slough/eschar obscures the wound base, and the depth (partial-thickness, subcutaneous fat visible, or bone/tendon/muscle visible). Returns the stage.',
    compute: F.npiapStaging,
    fields: [
      { dom: 'np-muc', arg: 'mucosal', kind: 'bool', label: 'Mucosal membrane location' },
      { dom: 'np-intact', arg: 'skinIntact', kind: 'bool', label: 'Skin intact' },
      { dom: 'np-blanch', arg: 'blanching', kind: 'enum', values: ['blanchable', 'non-blanchable-erythema', 'non-blanchable-deep-discoloration'], required: true, label: 'Erythema behavior if skin intact' },
      { dom: 'np-obs', arg: 'obscured', kind: 'bool', label: 'Slough or eschar obscures the wound base' },
      { dom: 'np-depth', arg: 'depth', kind: 'enum', values: ['partial-thickness', 'subq-visible', 'bone-tendon-muscle'], required: true, label: 'Depth if skin not intact and not obscured' },
    ],
  },
  {
    id: 'norton-push',
    summary: 'Norton pressure-sore risk scale (Norton 1962; five items 1-4, <= 14 at risk) alongside the PUSH wound-healing tool (NPIAP 2005; length x width band 0-10, exudate 0-3, tissue type 0-4, total 0-17). Returns both totals.',
    compute: F.nortonPush,
    fields: [
      { dom: 'nr-pc', arg: 'physicalCondition', kind: 'number', required: true, label: 'Norton: physical condition (1-4)' },
      { dom: 'nr-mc', arg: 'mentalCondition', kind: 'number', required: true, label: 'Norton: mental condition (1-4)' },
      { dom: 'nr-act', arg: 'activity', kind: 'number', required: true, label: 'Norton: activity (1-4)' },
      { dom: 'nr-mob', arg: 'mobility', kind: 'number', required: true, label: 'Norton: mobility (1-4)' },
      { dom: 'nr-inc', arg: 'incontinence', kind: 'number', required: true, label: 'Norton: incontinence (1-4)' },
      { dom: 'pu-lw', arg: 'lengthWidthBand', kind: 'number', required: true, label: 'PUSH: length x width band (0-10)' },
      { dom: 'pu-ex', arg: 'exudate', kind: 'number', required: true, label: 'PUSH: exudate amount (0-3)' },
      { dom: 'pu-tt', arg: 'tissueType', kind: 'number', required: true, label: 'PUSH: tissue type (0-4)' },
    ],
  },
  {
    id: 'vip-extravasation',
    summary: 'Peripheral-IV complication grading: the Visual Infusion Phlebitis score (Jackson 1998; 0-5) and the INS infiltration/extravasation grade (INS 2021; 0-4), with a vesicant flag; returns each grade with its label and the escalation banners the thresholds trigger.',
    compute: F.vipExtravasation,
    fields: [
      { dom: 've-vip', arg: 'vip', kind: 'number', required: true, label: 'Visual Infusion Phlebitis score (0-5)' },
      { dom: 've-ins', arg: 'insGrade', kind: 'number', required: true, label: 'INS infiltration / extravasation grade (0-4)' },
      { dom: 've-ves', arg: 'vesicant', kind: 'bool', label: 'Infusate is a known vesicant' },
    ],
  },
  {
    id: 'blood-compat',
    summary: 'ABO/Rh blood-product compatibility (AABB 33rd ed): from the recipient ABO/Rh type and the product (PRBC, FFP/plasma, platelets, cryoprecipitate), returns the compatible donor types and the emergency-release option.',
    compute: F.bloodCompat,
    fields: [
      { dom: 'bc-recip', arg: 'recipient', kind: 'enum', values: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], required: true, label: 'Recipient ABO / Rh' },
      { dom: 'bc-prod', arg: 'product', kind: 'enum', values: ['prbc', 'ffp', 'platelets', 'cryo'], required: true, label: 'Product type' },
    ],
  },

  // --- wave 71: the environmental-emergency decision tiles ----------------
  {
    id: 'hypothermia-rewarm',
    summary: 'Swiss staging of accidental hypothermia (Durrer 2003) with the matched rewarming pathway: core temperature and patient state (alert/shivering HT I, impaired HT II, unconscious HT III, arrest HT IV) select passive, active-external, or active-internal rewarming; the optional ECPR-exclusion flag and serum potassium inform the arrest pathway.',
    compute: F.hypothermiaRewarm,
    fields: [
      { dom: 'hyp-t', arg: 'coreTempC', kind: 'number', required: true, label: 'Core temperature', unit: 'C' },
      { dom: 'hyp-s', arg: 'state', kind: 'enum', values: ['alert-shivering', 'impaired', 'unconscious', 'arrest'], required: true, label: 'Patient state (HT I-IV)' },
      { dom: 'hyp-excl', arg: 'ecprExclusion', kind: 'bool', label: 'ECPR exclusion (lethal injury / non-compressible chest / known asystole before cooling)' },
      { dom: 'hyp-k', arg: 'potassium', kind: 'number', label: 'Serum potassium (optional)', unit: 'mmol/L' },
    ],
  },
  {
    id: 'heatstroke-decision',
    summary: 'Heat-illness severity and cooling algorithm (Bouchama 2002; WMS 2019): core temperature, CNS status, sweating (exertional vs classic subtype), and setting classify heat exhaustion vs heat stroke and select the cooling method (cold-water immersion to 38.9 C, cool-first-transport-second in the field).',
    compute: F.heatstrokeDecision,
    fields: [
      { dom: 'hs-t', arg: 'coreTempC', kind: 'number', required: true, label: 'Core temperature', unit: 'C' },
      { dom: 'hs-cns', arg: 'cns', kind: 'enum', values: ['none', 'mild-confusion', 'altered'], required: true, label: 'CNS status' },
      { dom: 'hs-sw', arg: 'sweating', kind: 'bool', label: 'Sweating present (exertional; unchecked = anhidrotic / classic)' },
      { dom: 'hs-set', arg: 'setting', kind: 'enum', values: ['field', 'hospital'], required: true, label: 'Setting' },
    ],
  },

  // --- wave 74: the deterministic ICU workflow / monitoring tiles ----------
  {
    id: 'lips',
    summary: 'Lung Injury Prediction Score (Gajic 2011) for ARDS risk: weighted predisposing conditions (shock 2, aspiration 2, sepsis 1, pneumonia 1.5, high-risk surgery 1.5, high-risk trauma 2) and risk modifiers (alcohol, obesity, hypoalbuminemia, chemotherapy, high FiO2 2, tachypnea 1.5, SpO2 < 95, acidosis 1.5, diabetes -1); >= 4 is high risk.',
    compute: F.lips,
    fields: [
      { dom: 'lp-shock', arg: 'shock', kind: 'bool', label: 'Shock (2)' },
      { dom: 'lp-asp', arg: 'aspiration', kind: 'bool', label: 'Aspiration (2)' },
      { dom: 'lp-sep', arg: 'sepsis', kind: 'bool', label: 'Sepsis (1)' },
      { dom: 'lp-pna', arg: 'pneumonia', kind: 'bool', label: 'Pneumonia (1.5)' },
      { dom: 'lp-surg', arg: 'highRiskSurgery', kind: 'bool', label: 'High-risk surgery (1.5)' },
      { dom: 'lp-trauma', arg: 'highRiskTrauma', kind: 'bool', label: 'High-risk trauma (2)' },
      { dom: 'lp-etoh', arg: 'alcoholAbuse', kind: 'bool', label: 'Alcohol abuse (1)' },
      { dom: 'lp-obese', arg: 'obesityBmiGt30', kind: 'bool', label: 'Obesity BMI > 30 (1)' },
      { dom: 'lp-alb', arg: 'hypoalbuminemia', kind: 'bool', label: 'Hypoalbuminemia (1)' },
      { dom: 'lp-chemo', arg: 'chemotherapy', kind: 'bool', label: 'Chemotherapy (1)' },
      { dom: 'lp-fio2', arg: 'fio2Gt035or4L', kind: 'bool', label: 'FiO2 > 0.35 or > 4 L/min (2)' },
      { dom: 'lp-tach', arg: 'tachypneaRrGt30', kind: 'bool', label: 'Tachypnea RR > 30 (1.5)' },
      { dom: 'lp-spo2', arg: 'spo2Lt95', kind: 'bool', label: 'SpO2 < 95% (1)' },
      { dom: 'lp-acid', arg: 'acidosisPhLt735', kind: 'bool', label: 'Acidosis pH < 7.35 (1.5)' },
      { dom: 'lp-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus (-1)' },
    ],
  },
  {
    id: 'mtp-tracker',
    summary: 'Massive-transfusion-protocol ratio tracker: from the PRBC, FFP/plasma, platelet, and cryoprecipitate units transfused, returns the running PRBC:FFP:platelet ratio (vs the PROPPR 1:1:1 target), the next product to give, cumulative units, and cryoprecipitate doses due.',
    compute: F.mtpTracker,
    fields: [
      { dom: 'mtp-prbc', arg: 'prbcUnits', kind: 'number', required: true, label: 'PRBC units transfused' },
      { dom: 'mtp-ffp', arg: 'ffpUnits', kind: 'number', required: true, label: 'FFP / plasma units transfused' },
      { dom: 'mtp-plt', arg: 'plateletUnits', kind: 'number', required: true, label: 'Platelet apheresis units transfused' },
      { dom: 'mtp-cryo', arg: 'cryoUnits', kind: 'number', required: true, label: 'Cryoprecipitate doses transfused' },
    ],
  },
  {
    id: 'bristol-girth',
    summary: 'Bristol Stool Form Scale (Lewis 1997; type 1-7 mapped to constipation / normal / soft / diarrhea) with an optional abdominal-girth trend (girth and timestamp at two points yields the change per hour).',
    compute: F.bristolGirth,
    fields: [
      { dom: 'bg-b', arg: 'bristolType', kind: 'number', required: true, label: 'Bristol stool type (1-7)' },
      { dom: 'bg-g0', arg: 'girthT0Cm', kind: 'number', label: 'Abdominal girth at T0 (optional)', unit: 'cm' },
      { dom: 'bg-t0', arg: 't0Timestamp', kind: 'string', label: 'T0 timestamp (optional, ISO)' },
      { dom: 'bg-g1', arg: 'girthT1Cm', kind: 'number', label: 'Abdominal girth at T1 (optional)', unit: 'cm' },
      { dom: 'bg-t1', arg: 't1Timestamp', kind: 'string', label: 'T1 timestamp (optional, ISO)' },
    ],
  },

  // --- wave 77: the cardiovascular 10-year risk engines -------------------
  {
    id: 'ascvd',
    summary: 'ASCVD Pooled Cohort Equations (Goff 2013): the race-stratified 10-year atherosclerotic-cardiovascular-disease risk from age, total cholesterol, HDL, SBP, sex, race, treated hypertension, smoking, and diabetes. Returns the risk percentage, the equation used, and the risk band.',
    // Echo the 10-year horizon so the "10-year" the tile documents round-trips.
    compute: (a) => { const r = F.ascvdPce(a); return r == null ? null : { ...r, horizonYears: 10 }; },
    fields: [
      { dom: 'as-age', arg: 'age', kind: 'number', required: true, label: 'Age (40-79)', unit: 'years' },
      { dom: 'as-tc', arg: 'totalChol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mg/dL' },
      { dom: 'as-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'as-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'as-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'as-race', arg: 'race', kind: 'enum', values: ['white', 'AA'], required: true, label: 'Race (white/other or African-American; PCE only)' },
      { dom: 'as-trt', arg: 'treatedSbp', kind: 'bool', label: 'On treatment for hypertension' },
      { dom: 'as-smk', arg: 'smoker', kind: 'bool', label: 'Smoker' },
      { dom: 'as-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes' },
    ],
  },
  {
    id: 'prevent',
    summary: 'AHA PREVENT 2023 (Khan) race-free 10-year total-cardiovascular-disease risk from age, total cholesterol, HDL, SBP, BMI, eGFR, sex, treated hypertension, smoking, and diabetes. Returns the risk percentage and band.',
    // Echo the 10-year horizon and the age so the documented facts round-trip.
    compute: (a) => { const r = F.prevent10yr(a); return r == null ? null : { ...r, horizonYears: 10, ageYears: a.age }; },
    fields: [
      { dom: 'pv-age', arg: 'age', kind: 'number', required: true, label: 'Age (30-79)', unit: 'years' },
      { dom: 'pv-tc', arg: 'totalChol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mg/dL' },
      { dom: 'pv-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'pv-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'pv-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
      { dom: 'pv-egfr', arg: 'egfr', kind: 'number', required: true, label: 'eGFR', unit: 'mL/min/1.73m^2' },
      { dom: 'pv-sex', arg: 'sex', kind: 'enum', values: ['M', 'F'], required: true, label: 'Sex' },
      { dom: 'pv-trt', arg: 'treatedSbp', kind: 'bool', label: 'On treatment for hypertension' },
      { dom: 'pv-smk', arg: 'smoker', kind: 'bool', label: 'Smoker' },
      { dom: 'pv-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes' },
    ],
  },

  // --- wave 79: the restraint-reassessment timer -------------------------
  // Its cadence banners (renewal q4h, nursing q15 min, face-to-face within 1 h)
  // are constants, so the round-trip holds; the next-due ISO fields are a pure
  // function of the entered order timestamp. The sibling clock tiles are
  // deferred: ews-escalation and sepsis-bundle-clock report a timezone-shifted
  // ISO due-time (datetime-local input -> UTC output) whose hour digits the
  // interpretive example cites, so they cannot round-trip through the numeric
  // contract (they are on the e2e example-correctness scenario-only allowlist
  // for the same reason); code-blue-clock and device-day-counter read the wall
  // clock (Date.now()).
  {
    id: 'restraint-timer',
    summary: 'Restraint reassessment timer (42 CFR 482.13): from restraint type (violent / non-violent), patient age, and the order timestamp, returns the next order-renewal, nursing-reassessment, and physician face-to-face ISO times per the regulatory intervals.',
    compute: F.restraintTimer,
    fields: [
      { dom: 'rt-type', arg: 'type', kind: 'enum', values: ['violent', 'non-violent'], required: true, label: 'Restraint type' },
      { dom: 'rt-age', arg: 'ageYears', kind: 'number', required: true, label: 'Patient age', unit: 'years' },
      { dom: 'rt-ts', arg: 'orderTimestamp', kind: 'string', required: true, label: 'Restraint order at (ISO timestamp)' },
    ],
  },

  // --- wave 83: the ventilator SBT readiness + ARDSnet PEEP look-up ---------
  // The compute is a pure function of the five Boles 2007 readiness inputs plus
  // the ARDSnet arm/FiO2 look-up; no wall clock. Two self-describing counts are
  // echoed (criteriaTotal / criteriaMet) so the "All 5 criteria met" the tile
  // documents round-trips through the numeric contract - the criteria labels
  // carry the threshold digits (150 / 8 / 0.5) but not the count itself. This
  // tile was previously deferred only because its META.example filled the
  // awake/cooperative checkbox with the DOM literal 'on', which is neither
  // applyExample-checkable nor bool-like; the example now uses '1'.
  {
    id: 'vent-sbt-peep',
    summary: 'Spontaneous-breathing-trial readiness (Boles 2007) with the ARDSnet PEEP/FiO2 look-up (Brower 2000 / ALVEOLI 2004): the five readiness criteria (PaO2/FiO2 >= 150, PEEP <= 8, FiO2 <= 0.5, no/minimal vasopressors, awake/cooperative) decide SBT readiness, and the selected arm + target FiO2 return the table PEEP. Echoes the count of criteria met.',
    compute: (a) => {
      const r = F.ventSbtPeep(a);
      if (r == null) return null;
      const criteriaTotal = Object.keys(r.sbtChecks).length;
      const criteriaMet = Object.values(r.sbtChecks).filter(Boolean).length;
      return { ...r, criteriaTotal, criteriaMet };
    },
    fields: [
      { dom: 'vs-pf', arg: 'pao2FiO2', kind: 'number', required: true, label: 'PaO2 / FiO2 ratio' },
      { dom: 'vs-peep', arg: 'peep', kind: 'number', required: true, label: 'Current PEEP', unit: 'cm H2O' },
      { dom: 'vs-fio2', arg: 'fio2', kind: 'number', required: true, label: 'Current FiO2 (fraction 0-1)' },
      { dom: 'vs-vaso', arg: 'vasopressors', kind: 'bool', label: 'Vasopressors at more than minimal dose' },
      { dom: 'vs-awake', arg: 'awakeCooperative', kind: 'bool', required: true, label: 'Patient is awake / cooperative' },
      { dom: 'vs-arm', arg: 'ardsArm', kind: 'enum', values: ['low', 'high'], required: true, label: 'ARDSnet arm (low = Brower 2000, high = ALVEOLI 2004)' },
      { dom: 'vs-lf', arg: 'lookupFiO2', kind: 'number', required: true, label: 'Target FiO2 to look up (fraction 0-1)' },
    ],
  },
  {
    id: 'aldrete-padss',
    // Composite: the two side-by-side recovery scores share one input panel, so
    // one call returns both (each lib fn destructures only its own five items).
    summary: 'Post-anesthesia recovery scores. Modified Aldrete (activity, respiration, circulation, consciousness, O2 saturation, each 0-2; total 0-10) gauges phase-1 recovery. PADSS (vital signs, ambulation, nausea/vomiting, pain, surgical bleeding, each 0-2; total 0-10, >= 9 ready for home discharge) gauges readiness for discharge after ambulatory surgery. Reports both scores, not a discharge order.',
    compute: (a) => ({ aldrete: F.aldrete(a), padss: F.padss(a) }),
    fields: [
      { dom: 'ap-al-act', arg: 'activity', kind: 'number', required: true, label: 'Aldrete: activity (0-2)' },
      { dom: 'ap-al-resp', arg: 'respiration', kind: 'number', required: true, label: 'Aldrete: respiration (0-2)' },
      { dom: 'ap-al-circ', arg: 'circulation', kind: 'number', required: true, label: 'Aldrete: circulation (0-2)' },
      { dom: 'ap-al-cons', arg: 'consciousness', kind: 'number', required: true, label: 'Aldrete: consciousness (0-2)' },
      { dom: 'ap-al-o2', arg: 'oxygenSaturation', kind: 'number', required: true, label: 'Aldrete: O2 saturation (0-2)' },
      { dom: 'ap-pd-vs', arg: 'vitalSigns', kind: 'number', required: true, label: 'PADSS: vital signs (0-2)' },
      { dom: 'ap-pd-amb', arg: 'ambulation', kind: 'number', required: true, label: 'PADSS: ambulation (0-2)' },
      { dom: 'ap-pd-nv', arg: 'nauseaVomiting', kind: 'number', required: true, label: 'PADSS: nausea / vomiting (0-2)' },
      { dom: 'ap-pd-pain', arg: 'pain', kind: 'number', required: true, label: 'PADSS: pain (0-2)' },
      { dom: 'ap-pd-bld', arg: 'surgicalBleeding', kind: 'number', required: true, label: 'PADSS: surgical bleeding (0-2)' },
    ],
  },
  {
    id: 'phq9',
    // The nine PHQ-9 items (each 0-3) score via the generic screener compute over
    // the exported PHQ9_CONFIG; maxScore (27) is echoed so the "of 27" denominator
    // is in the JSON and the numeric round-trip does not depend on the "PHQ-9" 9.
    summary: 'PHQ-9 depression screen (Kroenke 2001): nine items each 0-3 over the last two weeks; total 0-27 with severity bands (0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe). Item 9 asks about thoughts of self-harm. A validated screening tool, not a diagnosis.',
    compute: (a) => {
      const answers = Array.from({ length: 9 }, (_, i) => Number(a[`i${i}`]) || 0);
      const score = scoreScreener(F.PHQ9_CONFIG.items, answers);
      const band = bandFor(F.PHQ9_CONFIG.severityBands, score);
      return { score, maxScore: 27, severity: band ? band.label : null };
    },
    fields: Array.from({ length: 9 }, (_, i) => ({ dom: `phq9-${i}`, arg: `i${i}`, kind: 'number', label: `PHQ-9 item ${i + 1} (0-3)` })),
  },
  {
    id: 'gad7',
    // Same generic-screener pattern as phq9, over the exported GAD7_CONFIG.
    summary: 'GAD-7 generalized-anxiety screen (Spitzer 2006): seven items each 0-3 over the last two weeks; total 0-21 with severity bands (0-4 minimal, 5-9 mild, 10-14 moderate, 15-21 severe). A validated screening tool, not a diagnosis.',
    compute: (a) => {
      const answers = Array.from({ length: 7 }, (_, i) => Number(a[`i${i}`]) || 0);
      const score = scoreScreener(F.GAD7_CONFIG.items, answers);
      const band = bandFor(F.GAD7_CONFIG.severityBands, score);
      return { score, maxScore: 21, severity: band ? band.label : null };
    },
    fields: Array.from({ length: 7 }, (_, i) => ({ dom: `gad7-${i}`, arg: `i${i}`, kind: 'number', label: `GAD-7 item ${i + 1} (0-3)` })),
  },
  {
    id: 'epds',
    // Same generic-screener pattern, over the exported EPDS_CONFIG (perinatal).
    summary: 'Edinburgh Postnatal Depression Scale (EPDS, Cox 1987): ten items each 0-3 for perinatal depression; total 0-30 (0-9 low likelihood, 10-12 possible depression, 13+ likely depression - clinical evaluation indicated). Item 10 asks about self-harm. A validated screening tool, not a diagnosis.',
    compute: (a) => {
      const answers = Array.from({ length: 10 }, (_, i) => Number(a[`i${i}`]) || 0);
      const score = scoreScreener(F.EPDS_CONFIG.items, answers);
      const band = bandFor(F.EPDS_CONFIG.severityBands, score);
      return { score, maxScore: 30, severity: band ? band.label : null };
    },
    fields: Array.from({ length: 10 }, (_, i) => ({ dom: `epds-${i}`, arg: `i${i}`, kind: 'number', label: `EPDS item ${i + 1} (0-3)` })),
  },
];
