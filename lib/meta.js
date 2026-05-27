// Per-utility metadata: inline citation (spec-v2 5.1), test-with-example
// values (spec-v2 5.3), and primary data source for the inline source stamp
// (spec-v2 5.2).
//
// The router renders these in a uniform block above each utility body, so
// the citation, example, and source stamp are present and styled the same
// way on every view without each renderer having to remember to add them.

export const META = {
  // ---- Group A: Code lookups (removed in spec-v29 wave 29-2) ----
  // 19 code-reference lookup tiles deleted: icd10, hcpcs, cpt, ndc,
  // pos-codes, modifier-codes, revenue-codes, carc, rarc, hcpcs-mod,
  // pos-lookup, tob-decode, rev-table, nubc-codes, drg-lookup,
  // apc-lookup, pcs-lookup, rxnorm-lookup, ndc-rxnorm. Survivors
  // (em-time, ndc-convert) live further down with their v4/v5 META.

  // ---- Group B: Pricing ----

  // ---- Group B: v4 extensions (utilities 94-104) ----

  // ---- Group C: Patient tools (most removed in spec-v29 wave 29-2) ----
  // Removed: decoder, insurance, eob-decoder, no-surprises,
  // insurance-card, abn-explainer, msn-decoder, idr-eligibility,
  // birthday-rule, cobra-timeline, medicare-enrollment, aca-sep.
  // Survivors: appeal-letter, hipaa-roa (workflow generators per
  // spec-v29 sec 10 open question 1).
  'appeal-letter':       { citation: 'Educational template. Plan-specific appeal procedures govern. Not legal advice.',
                           example: { fields: { 'al-pt': 'Jane Doe', 'al-id': 'W123456789', 'al-dos': '2026-04-12', 'al-prov': 'Acme Internal Medicine', 'al-svc': 'MRI lumbar spine without contrast', 'al-dx': 'M54.5', 'al-plan': 'Anthem Gold PPO', 'al-denial': '2026-04-25', 'al-reason': 'Not medically necessary' },
                                      expected: 'Click "Build printable letter" to render an appeal letter addressed to the plan with the denial reason quoted back.' } },
  'hipaa-roa':           { citation: 'HIPAA Privacy Rule, 45 CFR 164.524. Right of Access; 30-day response requirement with one 30-day extension; cost-based fee cap.',
                           example: { fields: { 'roa-pt': 'Jane Doe', 'roa-dob': '1985-03-12', 'roa-fac': 'Acme Internal Medicine', 'roa-range': '2024-01-01 to 2025-01-01', 'roa-recs': 'Office visit notes, lab results, imaging reports', 'roa-fmt': 'electronic (PDF)', 'roa-deliver': 'patient portal' },
                                      expected: 'Click "Build printable request" to render a 45 CFR 164.524 letter citing the 30-day response requirement and the cost-based fee cap.' } },

  // ---- Group D: Provider lookup ----

  // ---- Group D: v4 extensions (utilities 115-116) ----

  // ---- Group E: Clinical math (citations + examples) ----
  'unit-converter':    { citation: 'Standard SI and US customary unit definitions.',
                         example: { fields: { kind: 'weight', val: '70', from: 'kg', to: 'lb' }, expected: '70 kg = 154.32 lb' } },
  bmi:                 { citation: 'Quetelet 1835; Keys A, et al. Indices of relative weight and obesity. J Chronic Dis. 1972;25(6).',
                         example: { fields: { w: '70', h: '1.75' }, expected: 'BMI 22.9 (Normal)' } },
  bsa:                 { citation: 'Du Bois D, Du Bois EF. Arch Intern Med. 1916;17:863. Mosteller RD. N Engl J Med. 1987;317(17):1098.',
                         example: { fields: { w: '70', h: '175' }, expected: 'Du Bois ~1.85 m^2; Mosteller ~1.84 m^2' } },
  map:                 { citation: 'Standard physiology: MAP = ((2 * DBP) + SBP) / 3.',
                         example: { fields: { s: '120', d: '80' }, expected: 'MAP 93.3 mmHg' } },
  'anion-gap':         { citation: 'Emmett M, Narins RG. Clinical use of the anion gap. Medicine (Baltimore). 1977;56(1):38-54.',
                         example: { fields: { na: '140', cl: '100', hco3: '24', alb: '4' }, expected: 'AG 16; corrected AG 16' } },
  'corrected-calcium': { citation: 'Payne RB, et al. Interpretation of serum calcium in patients with abnormal serum proteins. BMJ. 1973;4(5893):643-646.',
                         example: { fields: { ca: '8.0', alb: '2.0' }, expected: 'Corrected Ca 9.6 mg/dL' } },
  'corrected-sodium':  { citation: 'Katz MA. NEJM. 1973. Hillier TA, Abbott RD, Barrett EJ. Am J Med. 1999;106(4):399-403.',
                         example: { fields: { na: '130', g: '600' }, expected: 'Corrected Na 138 (1.6); 142 (2.4)' } },
  'aa-gradient':       { citation: 'West JB. Respiratory Physiology: The Essentials. PAO2 = (FiO2 * (760-47)) - (PaCO2 / 0.8).',
                         example: { fields: { fio2: '0.21', paco2: '40', pao2: '90' }, expected: 'A-a gradient ~9.7 mmHg' } },
  egfr:                { citation: 'Inker LA, Eneanya ND, Coresh J, et al. New creatinine and cystatin C-based equations to estimate GFR without race. NEJM. 2021;385(19):1737-1749. Implements the 2021 race-free creatinine-only equation.',
                         example: { fields: { scr: '1.0', age: '60', sex: 'F' }, expected: 'eGFR ~60 mL/min/1.73m^2' } },
  'cockcroft-gault':   { citation: 'Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31-41.',
                         example: { fields: { age: '60', w: '80', scr: '1.0', sex: 'M' }, expected: 'CrCl 88.89 mL/min' } },
  'pack-years':        { citation: 'Standard tobacco-history measure: pack-years = packs per day x years smoked.',
                         example: { fields: { p: '1.5', y: '20' }, expected: 'Pack-years 30' } },
  'due-date':          { citation: 'Naegele rule: due date = LMP + 280 days.',
                         example: { fields: { lmp: '2025-01-01' }, expected: 'Due date 2025-10-08' } },
  qtc:                 { citation: 'Bazett 1920; Fridericia 1920; Sagie (Framingham) 1992; Hodges 1983. All four formulas reported side by side.',
                         example: { fields: { qt: '400', hr: '60' }, expected: 'All four formulas ~400 ms' } },
  'pf-ratio':          { citation: 'ARDS Definition Task Force. Berlin Definition. JAMA. 2012;307(23):2526-2533.',
                         example: { fields: { pao2: '90', fio2: '0.5' }, expected: 'P/F 180 (Moderate ARDS)' } },

  // ---- Group E: v4 extensions (utilities 117-128) ----
  'anion-gap-dd':    { citation: 'Standard chemistry references; Wrenn KD. The delta gap. Ann Emerg Med. 1990;19(11):1310-1313.',
                       example: { fields: { na: '140', cl: '100', hco3: '14', alb: '4' }, expected: 'AG 26; delta-AG 14; delta-HCO3 10; ratio 1.4 - pure AG metabolic acidosis' } },
  'corrected-ca-na': { citation: 'Payne RB BMJ 1973 (Ca); Katz NEJM 1973 / Hillier Am J Med 1999 (Na).',
                       example: { fields: { ca: '8.0', 'cca-alb': '2.0', 'csna-na': '130', glu: '600' },
                                  expected: 'Corrected Ca 9.6 mg/dL; corrected Na (Katz) 138, (Hillier) 142.' } },
  'osmolal-gap':     { citation: 'Calculated osm = 2*Na + glucose/18 + BUN/2.8 (+ EtOH/4.6). Gap >10 raises suspicion of toxic alcohols.',
                       example: { fields: { measured: '300', 'og-na': '140', 'og-glu': '90', 'og-bun': '14', 'og-etoh': '0' },
                                  expected: 'Calculated osm ~290; gap ~10 (within normal range).' } },
  'aa-pf-suite':     { citation: 'West JB. Respiratory Physiology. ARDS Berlin Definition: JAMA 2012;307(23):2526.',
                       example: { fields: { 'sf-fio2': '0.21', 'sf-pao2': '90', 'sf-paco2': '40', 'sf-age': '40' },
                                  expected: 'A-a gradient ~9.7 mmHg (expected ~14 by age); P/F ratio 429 (Normal).' } },
  winters:           { citation: "Albert MS, Dell RB, Winters RW. Quantitative displacement of acid-base equilibrium in metabolic acidosis. Ann Intern Med 1967;66(2):312-322.",
                       example: { fields: { 'wf-hco3': '14', 'wf-paco2': '29' }, expected: "Expected PaCO2 27-31; appropriate respiratory compensation" } },
  'shock-index':     { citation: 'Allgower & Burri 1967 (shock index). Standard physiology for MAP and PP.',
                       example: { fields: { 'si-sbp': '120', 'si-dbp': '80', 'si-hr': '110' },
                                  expected: 'MAP 93.3; PP 40; shock index 0.92; modified shock index 1.18.' } },
  'bw-bsa-suite':    { citation: 'Devine 1974 (IBW); 0.4 AdjBW rule; Mosteller NEJM 1987; Du Bois 1916.',
                       example: { fields: { 'bw-hin': '69', 'bw-kg': '85', 'bw-sex': 'M' },
                                  expected: 'IBW ~70.5 kg; AdjBW ~76.3 kg; BSA Mosteller ~2.00 m^2; BSA Du Bois ~2.01 m^2.' } },
  'egfr-suite':      { citation: 'Inker LA et al. NEJM 2021 (CKD-EPI race-free); Levey AS et al. Ann Intern Med 1999 (MDRD); Cockcroft-Gault Nephron 1976.',
                       example: { fields: { 'es-scr': '1.0', 'es-age': '60', 'es-w': '70', 'es-sex': 'M' }, expected: 'CKD-EPI 2021 ~89; MDRD ~77; Cockcroft-Gault ~78 mL/min' } },
  'fena-feurea':     { citation: 'Espinel CH JAMA 1976 (FENa); Carvounis CP Kidney Int 2002 (FEUrea).',
                       example: { fields: { 'fn-una': '20', 'fn-pna': '140', 'fn-ucr': '50', 'fn-pcr': '2.0', 'fu-uu': '300', 'fu-pu': '60' },
                                  expected: 'FENa ~0.57% (prerenal); FEUrea ~20% (prerenal).' } },
  'maint-fluids':    { citation: 'Holliday MA, Segar WE. Pediatrics 1957. 4-2-1 maintenance rule.',
                       example: { fields: { 'mf-w': '70' }, expected: 'Maintenance: 110 mL/hr (40 + 20 + 50)' } },
  'qtc-suite':       { citation: 'Bazett 1920; Fridericia 1920; Sagie (Framingham) 1992; Hodges 1983.',
                       example: { fields: { 'qs-qt': '400', 'qs-hr': '60' }, expected: 'All four formulas ~400 ms' } },
  'preg-dating':     { citation: 'Naegele rule (LMP+280); Robinson-Fleming CRL formula; ACOG Practice Bulletin redating thresholds (T1: 7d; T2: 14d; T3: 21d).',
                       example: { fields: { 'pd-lmp': '2025-12-23', 'pd-crl': '50', 'pd-us': '2026-03-12' },
                                  expected: 'LMP-derived EDD 2026-09-29; CRL-derived GA at ultrasound ~11w 5d; small T1 discordance (~3 days), within accepted limit.' } },

  // ---- Group F: Medication math ----
  'drip-rate':         { citation: 'Standard infusion arithmetic: rate (mL/hr) = volume * 60 / duration; gtts/min = volume * drop factor / duration.',
                         example: { fields: { v: '1000', t: '480', df: '15' }, expected: '125 mL/hr; 31 gtts/min' } },
  'weight-dose':       { citation: 'Standard weight-based dose: total = weight * per-kg dose. Verify against your formulary.',
                         example: { fields: { w: '70', d: '5', u: 'mg/kg' }, expected: 'Total 350 mg' } },
  'conc-rate':         { citation: 'Standard infusion math: rate (mL/hr) = (dose per minute / concentration per mL) * 60. Bag presets per common institutional protocols.',
                         example: { fields: { dv: '0.1', du: 'mcg/kg/min', w: '70', cv: '0.064', cu: 'mg/mL' }, expected: 'Norepi at 0.1 mcg/kg/min, 70 kg, 64 mcg/mL: ~6.56 mL/hr' } },
  'peds-dose':         { citation: 'AAP, NLM/DailyMed, manufacturer labels. Reference table only.' },
  'insulin-drip':      { citation: 'Example protocols only. Use your institution\'s active insulin protocol.',
                         example: { fields: { p: 'mod', bg: '180' }, expected: 'Suggested rate (example only): 2 units/hr (moderate-intensity sample protocol).' } },
  'anticoag-reversal': { citation: 'Standard reversal references; verify against your institution\'s protocol and current literature.' },
  // high-alert removed in spec-v29 wave 29-2 (Group K/O): ISMP wallet.

  // ---- Group F: v4 extensions (utilities 129-135) ----
  'opioid-mme':     { source: { dataset: 'mme-factors', label: 'CDC 2022 Opioid MME conversion factors' },
                      citation: 'CDC Clinical Practice Guideline for Prescribing Opioids - United States, 2022. MMWR Recomm Rep. 2022;71(3):1-95.',
                      example: { fields: {}, expected: 'Morphine 30 mg q4h = 180 MME (above the 90 MME CDC threshold)' } },
  'steroid-equiv':  { source: { dataset: 'steroid-equiv', label: 'Standard pharmacology references (project-author table)' },
                      citation: 'Glucocorticoid equipotent-dose ratios per standard pharmacology references (e.g., Goodman & Gilman; Brunton, Hilal-Dandan, Knollmann eds., 13e). Mineralocorticoid activity noted separately; verify against your formulary.',
                      example: { fields: { 'st-dose': '5', 'st-from': 'prednisone', 'st-to': 'methylprednisolone' },
                                 expected: '5 mg prednisone ~ 4 mg methylprednisolone' } },
  'benzo-equiv':    { source: { dataset: 'benzo-equiv', label: 'Ashton benzodiazepine equivalence table (public)' },
                      citation: 'Ashton CH. Benzodiazepines: How They Work and How to Withdraw (the Ashton Manual).',
                      example: { fields: { 'bz-dose': '10', 'bz-from': 'diazepam', 'bz-to': 'lorazepam' },
                                 expected: '10 mg diazepam ~ 1.0 mg lorazepam (Ashton equivalence).' } },
  'abx-renal':      { source: { dataset: 'abx-renal', label: 'FDA labels via DailyMed (subset)' },
                      citation: 'Renal-adjusted antibiotic dosing per FDA-approved labeling (DailyMed). Verify against your institution\'s antimicrobial stewardship guidance.',
                      example: { fields: { 'abx-crcl': '70' }, expected: 'Cefepime 1-2 g q8-12h at default selector' } },
  vasopressor:      { source: { dataset: 'vasopressor-doses', label: 'FDA vasopressor labels (subset)' },
                      citation: 'Standard infusion math: rate (mL/hr) = (dose per min / concentration per mL) * 60.',
                      example: { fields: { 'vp-w': '70', 'vp-conc': '64', 'vp-dose': '0.1', 'vp-rate': '6.56' },
                                 expected: 'Norepinephrine at 0.1 mcg/kg/min, 70 kg, 64 mcg/mL: ~6.56 mL/hr (forward); 6.56 mL/hr -> ~0.1 mcg/kg/min (reverse).' } },
  'tpn-macro':      { source: { dataset: 'tpn-rules', label: 'Standard nutrition references' },
                      citation: 'Dextrose 3.4 kcal/g; protein 4 kcal/g; lipid (20% emulsion) 2 kcal/mL.',
                      example: { fields: { 'tpn-vol': '1500', 'tpn-d': '20', 'tpn-aa': '5', 'tpn-lipid': '10' }, expected: '1620 kcal: 300 g dextrose / 75 g protein / 30 g lipid' } },
  // iv-to-po removed in spec-v29 wave 29-2 (Group K/O): static
  // equivalence table per the sec 7.2 audit decision (no numeric output).

  // ---- Group G: Scoring ----
  gcs:         { citation: 'Teasdale G, Jennett B. Assessment of coma and impaired consciousness. Lancet. 1974;2(7872):81-84.',
                 example: { fields: { eye: '3', verbal: '4', motor: '5' }, expected: 'GCS 12' },
                 interpretation: {
                   bands: [
                     { range: '13-15', text: 'Mild brain injury per Teasdale & Jennett.' },
                     { range: '9-12',  text: 'Moderate brain injury per Teasdale & Jennett.' },
                     { range: '3-8',   text: 'Severe brain injury per Teasdale & Jennett (GCS <=8 is the conventional threshold for considering definitive airway protection).' },
                   ],
                   sourceQuoted: true,
                   sourceCitation: 'Teasdale G, Jennett B. Lancet. 1974;2(7872):81-84.',
                 },
                 derivation: {
                   formula: 'GCS = E + V + M\n  E (Eye opening): 1 (none), 2 (to pain), 3 (to voice), 4 (spontaneous)\n  V (Verbal): 1 (none), 2 (incomprehensible), 3 (inappropriate words), 4 (confused), 5 (oriented)\n  M (Motor): 1 (none), 2 (extension), 3 (abnormal flexion), 4 (withdrawal), 5 (localizes), 6 (obeys commands)',
                   components: [
                     { inputKey: 'eye',    label: 'Eye opening (1-4)',           points: (v) => Number(v) || 0 },
                     { inputKey: 'verbal', label: 'Best verbal response (1-5)',  points: (v) => Number(v) || 0 },
                     { inputKey: 'motor',  label: 'Best motor response (1-6)',   points: (v) => Number(v) || 0 },
                   ],
                   bands: [
                     { range: [13, 15], label: 'mild brain injury' },
                     { range: [9, 12],  label: 'moderate brain injury' },
                     { range: [3, 8],   label: 'severe brain injury' },
                   ],
                   population: 'Adults with acute brain injury admitted to neurosurgical units in Glasgow (n=700), Teasdale & Jennett 1974.',
                   units: { eye: 'integer 1-4', verbal: 'integer 1-5', motor: 'integer 1-6' },
                   validity: 'Designed for adults with traumatic or non-traumatic acute brain injury. Component scores are recorded individually (E_V_M) when intubation, sedation, or facial trauma precludes a component. Range 3-15.',
                   source: 'Teasdale G, Jennett B. "Assessment of coma and impaired consciousness: a practical scale." Lancet. 1974;2(7872):81-84.',
                 } },
  apgar:       { citation: 'Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.',
                 example: { fields: { appearance: '2', pulse: '2', grimace: '2', activity: '2', respiration: '2' }, expected: 'APGAR 10' } },
  // peds-vitals removed in spec-v29 wave 29-2 (Group G non-scores): static reference table.
  // lab-ranges removed in spec-v29 wave 29-2 (Group K/O): static table.
  abg:         { citation: 'Acid-base interpretation per standard physiology; Winter formula compensation; ARDS Berlin definition for P/F bands.',
                 example: { fields: { pH: '7.30', paco2: '30', hco3: '14' }, expected: 'Metabolic acidosis with appropriate respiratory compensation' } },
  'wells-pe':  { citation: 'Wells PS, et al. Derivation of a simple clinical model to categorize patients\' probability of pulmonary embolism. Thromb Haemost. 2000;83(3):416-420.',
                 example: { fields: { peLikely: '1', hrOver100: '1' }, expected: 'Wells PE total 4.5 (PE-likely group, moderate probability).' },
                 interpretation: {
                   bands: [
                     { range: '<=4',  text: 'PE unlikely per the two-tier Wells PE model. Consider D-dimer to further risk-stratify per source.' },
                     { range: '>4',   text: 'PE likely per the two-tier Wells PE model. Imaging (CTPA or V/Q) per source.' },
                   ],
                   sourceQuoted: true,
                   sourceCitation: 'Wells PS, et al. Thromb Haemost. 2000;83(3):416-420; two-tier dichotomization per Wells 2001 (Ann Intern Med).',
                 },
                 derivation: {
                   formula: 'Wells PE = sum of points across 7 binary criteria',
                   components: [
                     { inputKey: 'clinicalDvtSigns',        label: 'Clinical signs and symptoms of DVT',                      points: 3 },
                     { inputKey: 'peLikely',                label: 'PE is the most likely diagnosis',                          points: 3 },
                     { inputKey: 'hrOver100',               label: 'Heart rate > 100/min',                                      points: 1.5 },
                     { inputKey: 'immobilizationOrSurgery', label: 'Immobilization (>=3 days) or surgery in previous 4 weeks',  points: 1.5 },
                     { inputKey: 'priorPeOrDvt',            label: 'Previous PE or DVT',                                        points: 1.5 },
                     { inputKey: 'hemoptysis',              label: 'Hemoptysis',                                                points: 1 },
                     { inputKey: 'malignancy',              label: 'Malignancy (active treatment, palliative, or treated in last 6 months)', points: 1 },
                   ],
                   bands: [
                     { range: { op: '<=', value: 4 }, label: 'PE unlikely (two-tier)' },
                     { range: { op: '>',  value: 4 }, label: 'PE likely (two-tier)' },
                   ],
                   population: 'Derivation: 1239 ED outpatients with suspected PE across four Canadian sites (Wells 2000). Validation: prospective cohorts using two-tier and three-tier cutoffs.',
                   units: {
                     clinicalDvtSigns: 'boolean', peLikely: 'boolean', hrOver100: 'boolean',
                     immobilizationOrSurgery: 'boolean', priorPeOrDvt: 'boolean',
                     hemoptysis: 'boolean', malignancy: 'boolean',
                   },
                   validity: 'Adult ED outpatients with suspected acute PE. Two-tier cutoff (>4 vs <=4) is the validated dichotomization. Not validated in pregnancy, in the inpatient setting, or against newer simplified scores (e.g., simplified Wells, Geneva) which use different point values.',
                   source: 'Wells PS, Anderson DR, Rodger M, et al. "Derivation of a simple clinical model to categorize patients\' probability of pulmonary embolism: increasing the model\'s utility with the SimpliRED D-dimer." Thromb Haemost. 2000;83(3):416-420.',
                 } },
  'wells-dvt': { citation: 'Wells PS, et al. Value of assessment of pretest probability of deep-vein thrombosis. Lancet. 1997;350(9094):1795-1798.',
                 example: { fields: { tendernessAlongVeins: '1', entireLegSwollen: '1', calfSwellingGt3cm: '1' },
                            expected: 'Wells DVT total 3 (High probability).' },
                 interpretation: {
                   bands: [
                     { range: '<=0', text: 'Low probability of DVT per source.' },
                     { range: '1-2', text: 'Moderate probability of DVT per source.' },
                     { range: '>=3', text: 'High probability of DVT per source.' },
                   ],
                   sourceQuoted: true,
                   sourceCitation: 'Wells PS, et al. Lancet. 1997;350(9094):1795-1798, Table 3.',
                 },
                 derivation: {
                   formula: 'Wells DVT = sum of points across 10 clinical criteria (9 positive + 1 subtractive)',
                   components: [
                     { inputKey: 'activeCancer',           label: 'Active cancer (treatment within 6 months, or palliative)',         points: 1 },
                     { inputKey: 'paralysis',              label: 'Paralysis, paresis, or recent plaster immobilization of leg',      points: 1 },
                     { inputKey: 'recentBedrest',          label: 'Recently bedridden >=3 days, or major surgery within 12 weeks',    points: 1 },
                     { inputKey: 'tendernessAlongVeins',   label: 'Localized tenderness along distribution of deep venous system',   points: 1 },
                     { inputKey: 'entireLegSwollen',       label: 'Entire leg swollen',                                                points: 1 },
                     { inputKey: 'calfSwellingGt3cm',      label: 'Calf swelling >3 cm compared with asymptomatic side',              points: 1 },
                     { inputKey: 'pittingEdema',           label: 'Pitting edema confined to symptomatic leg',                         points: 1 },
                     { inputKey: 'collateralVeins',        label: 'Collateral superficial veins (non-varicose)',                       points: 1 },
                     { inputKey: 'priorDvt',               label: 'Previously documented DVT',                                         points: 1 },
                     { inputKey: 'alternativeDxAsLikely',  label: 'Alternative diagnosis at least as likely as DVT',                   points: -2 },
                   ],
                   bands: [
                     { range: { op: '<=', value: 0 }, label: 'low probability of DVT' },
                     { range: [1, 2],                 label: 'moderate probability of DVT' },
                     { range: { op: '>=', value: 3 }, label: 'high probability of DVT' },
                   ],
                   population: '593 ED outpatients with suspected first-episode DVT across three Canadian teaching hospitals (Wells 1997 §Methods).',
                   units: {
                     activeCancer: 'boolean', paralysis: 'boolean', recentBedrest: 'boolean',
                     tendernessAlongVeins: 'boolean', entireLegSwollen: 'boolean',
                     calfSwellingGt3cm: 'boolean', pittingEdema: 'boolean',
                     collateralVeins: 'boolean', priorDvt: 'boolean', alternativeDxAsLikely: 'boolean',
                   },
                   validity: 'Adult outpatients with clinically suspected first-episode DVT. The 1997 three-tier model (Low/Moderate/High) is what this tile implements; the simplified two-tier model published in Wells 2003 (NEJM) is a separate instrument. Not validated for asymptomatic screening or for recurrent DVT.',
                   source: 'Wells PS, Anderson DR, Bormanis J, et al. "Value of assessment of pretest probability of deep-vein thrombosis in clinical management." Lancet. 1997;350(9094):1795-1798.',
                 } },
  chads:       { citation: 'Lip GYH, et al. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation. Chest. 2010;137(2):263-272.',
                 example: { fields: { hypertension: '1', ageGte65: '1', diabetes: '1' },
                            expected: 'CHA2DS2-VASc total 3 (consider anticoagulation).' },
                 interpretation: {
                   bands: [
                     { range: '0',  text: 'Low risk. Antithrombotic therapy not recommended per source.' },
                     { range: '1',  text: 'Low-moderate risk. Oral anticoagulation may be considered per source.' },
                     { range: '>=2', text: 'Moderate-to-high risk. Oral anticoagulation recommended per source.' },
                   ],
                   sourceQuoted: true,
                   sourceCitation: 'Lip GYH, et al. Chest. 2010;137(2):263-272.',
                 },
                 derivation: {
                   formula: 'CHA2DS2-VASc = sum of points (range 0-9):\n  C = CHF / LV dysfunction (1)\n  H = Hypertension (1)\n  A2 = Age >= 75 (2)\n  D = Diabetes mellitus (1)\n  S2 = Stroke / TIA / thromboembolism (2)\n  V = Vascular disease (prior MI, PAD, aortic plaque) (1)\n  A = Age 65-74 (1)\n  Sc = Sex category (female) (1)',
                   components: [
                     { inputKey: 'chf',             label: 'C — Congestive heart failure or LV dysfunction', points: 1 },
                     { inputKey: 'hypertension',    label: 'H — Hypertension',                                points: 1 },
                     { inputKey: 'ageGte75',        label: 'A2 — Age >= 75',                                  points: 2 },
                     { inputKey: 'diabetes',        label: 'D — Diabetes mellitus',                           points: 1 },
                     { inputKey: 'strokeOrTia',     label: 'S2 — Prior stroke, TIA, or thromboembolism',      points: 2 },
                     { inputKey: 'vascularDisease', label: 'V — Vascular disease (prior MI, PAD, aortic plaque)', points: 1 },
                     { inputKey: 'ageGte65',        label: 'A — Age 65-74',                                   points: 1 },
                     { inputKey: 'female',          label: 'Sc — Sex category (female)',                      points: 1 },
                   ],
                   bands: [
                     { range: [0, 0],                 label: 'low risk (antithrombotic therapy not recommended)' },
                     { range: [1, 1],                 label: 'low-moderate risk (oral anticoagulation may be considered)' },
                     { range: { op: '>=', value: 2 }, label: 'moderate-to-high risk (oral anticoagulation recommended)' },
                   ],
                   population: 'Euro Heart Survey on AF — 1084 patients with non-valvular AF across 35 European countries (Lip 2010 §Methods). Validated in multiple subsequent cohorts.',
                   units: {
                     chf: 'boolean', hypertension: 'boolean', ageGte75: 'boolean',
                     diabetes: 'boolean', strokeOrTia: 'boolean', vascularDisease: 'boolean',
                     ageGte65: 'boolean', female: 'boolean',
                   },
                   validity: 'Adults with non-valvular atrial fibrillation. Not validated in valvular AF (mechanical or moderate-to-severe mitral stenosis), in pregnancy, or in pediatric populations. The A and A2 components are mutually exclusive by definition (age cannot be both 65-74 and >=75); the renderer does not enforce mutual exclusion — the user is responsible for setting only one. Sex category (female) is a *risk modifier*, not an independent risk factor, per the 2019 AHA/ACC/HRS focused update; the original 2010 paper assigns 1 point as listed.',
                   source: 'Lip GY, Nieuwlaat R, Pisters R, Lane DA, Crijns HJ. "Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the euro heart survey on atrial fibrillation." Chest. 2010;137(2):263-272.',
                 } },
  hasbled:     { citation: 'Pisters R, et al. A novel user-friendly score (HAS-BLED). Chest. 2010;138(5):1093-1100.',
                 example: { fields: { hypertension: '1', ageGt65: '1' },
                            expected: 'HAS-BLED total 2 (moderate bleeding risk).' },
                 interpretation: {
                   bands: [
                     { range: '0-1', text: 'Low risk of major bleeding per source (bleeds per 100 patient-years: 1.13 at score 0; 1.02 at score 1).' },
                     { range: '2',   text: 'Moderate risk of major bleeding per source (1.88 bleeds per 100 patient-years).' },
                     { range: '>=3', text: 'High risk of major bleeding per source. Caution and regular review of bleeding-risk factors advised per source.' },
                   ],
                   sourceQuoted: true,
                   sourceCitation: 'Pisters R, et al. Chest. 2010;138(5):1093-1100, Table 5.',
                 },
                 derivation: {
                   formula: 'HAS-BLED = sum of points across 9 criteria (each 0 or 1):\n  H = Hypertension (uncontrolled, SBP > 160)\n  A = Abnormal renal or liver function (each 1)\n  S = Stroke\n  B = Bleeding history or predisposition\n  L = Labile INR\n  E = Elderly (age > 65)\n  D = Drugs / alcohol concomitantly (each 1)\nRange 0-9.',
                   components: [
                     { inputKey: 'hypertension',     label: 'H — Uncontrolled hypertension (SBP > 160 mmHg)',         points: 1 },
                     { inputKey: 'abnormalRenal',    label: 'A — Abnormal renal function',                             points: 1 },
                     { inputKey: 'abnormalLiver',    label: 'A — Abnormal liver function',                             points: 1 },
                     { inputKey: 'stroke',           label: 'S — Prior stroke',                                        points: 1 },
                     { inputKey: 'bleedingHistory',  label: 'B — Bleeding history or predisposition',                  points: 1 },
                     { inputKey: 'labileInr',        label: 'L — Labile INR (TTR < 60% for VKA patients)',             points: 1 },
                     { inputKey: 'ageGt65',          label: 'E — Elderly (age > 65)',                                  points: 1 },
                     { inputKey: 'drugs',            label: 'D — Drugs predisposing to bleeding (e.g., NSAIDs)',       points: 1 },
                     { inputKey: 'alcohol',          label: 'D — Alcohol use >= 8 drinks/week',                        points: 1 },
                   ],
                   bands: [
                     { range: [0, 1],                 label: 'low risk of major bleeding' },
                     { range: [2, 2],                 label: 'moderate risk of major bleeding' },
                     { range: { op: '>=', value: 3 }, label: 'high risk of major bleeding (caution; review risk factors)' },
                   ],
                   population: 'Euro Heart Survey on AF — 3978 patients with non-valvular AF (Pisters 2010 §Methods).',
                   units: {
                     hypertension: 'boolean', abnormalRenal: 'boolean', abnormalLiver: 'boolean',
                     stroke: 'boolean', bleedingHistory: 'boolean', labileInr: 'boolean',
                     ageGt65: 'boolean', drugs: 'boolean', alcohol: 'boolean',
                   },
                   validity: 'Adults with atrial fibrillation. The score is intended to flag modifiable bleeding risk factors for review (uncontrolled BP, labile INR, concomitant antiplatelets/NSAIDs, heavy alcohol), not to deny anticoagulation. A high HAS-BLED is not an indication to withhold anticoagulation if CHA2DS2-VASc indicates it — per 2020 ESC AF guideline.',
                   source: 'Pisters R, Lane DA, Nieuwlaat R, de Vos CB, Crijns HJ, Lip GY. "A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation: the Euro Heart Survey." Chest. 2010;138(5):1093-1100.',
                 } },
  nihss:       { citation: 'Brott T, Adams HP Jr, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864-870. Public-domain instrument maintained by NIH/NINDS.',
                 example: { fields: { '1a': '1', '4': '1', '5': '2', '9': '1' },
                            expected: 'NIHSS total 5 (Moderate stroke).' },
                 interpretation: {
                   bands: [
                     { range: '0',     text: 'No stroke symptoms per NIH/NINDS interpretation guide.' },
                     { range: '1-4',   text: 'Minor stroke per NIH/NINDS interpretation guide.' },
                     { range: '5-15',  text: 'Moderate stroke per NIH/NINDS interpretation guide.' },
                     { range: '16-20', text: 'Moderate-to-severe stroke per NIH/NINDS interpretation guide.' },
                     { range: '21-42', text: 'Severe stroke per NIH/NINDS interpretation guide.' },
                   ],
                   sourceQuoted: true,
                   sourceCitation: 'NIH/NINDS NIH Stroke Scale interpretation conventions per Adams HP Jr, et al. Neurology. 1999;53(1):126-131 and the public-domain NIHSS form.',
                 },
                 derivation: {
                   formula: 'NIHSS = sum of 11 items (or 15 sub-items; motor arm L+R and motor leg L+R are entered as a per-side sum on the Sophie tile). Each item has its own max per Brott 1989 + NINDS public-domain form. Total range 0-42.\n  1a Level of consciousness: 0-3\n  1b LOC questions (month, age): 0-2\n  1c LOC commands: 0-2\n  2 Best gaze: 0-2\n  3 Visual fields: 0-3\n  4 Facial palsy: 0-3\n  5 Motor arm (sum L+R): 0-8\n  6 Motor leg (sum L+R): 0-8\n  7 Limb ataxia: 0-2\n  8 Sensory: 0-2\n  9 Best language: 0-3\n  10 Dysarthria: 0-2\n  11 Extinction and inattention: 0-2',
                   components: [
                     { inputKey: '1a', label: '1a — Level of consciousness (0-3)',           points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                     { inputKey: '1b', label: '1b — LOC questions (month, age) (0-2)',       points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                     { inputKey: '1c', label: '1c — LOC commands (open/close eyes; grip/release) (0-2)', points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                     { inputKey: '2',  label: '2 — Best gaze (0-2)',                          points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                     { inputKey: '3',  label: '3 — Visual fields (0-3)',                      points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                     { inputKey: '4',  label: '4 — Facial palsy (0-3)',                       points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                     { inputKey: '5',  label: '5 — Motor arm sum L+R (0-8)',                  points: (v) => Math.max(0, Math.min(8, Number(v) || 0)) },
                     { inputKey: '6',  label: '6 — Motor leg sum L+R (0-8)',                  points: (v) => Math.max(0, Math.min(8, Number(v) || 0)) },
                     { inputKey: '7',  label: '7 — Limb ataxia (0-2)',                        points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                     { inputKey: '8',  label: '8 — Sensory (0-2)',                            points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                     { inputKey: '9',  label: '9 — Best language (0-3)',                      points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                     { inputKey: '10', label: '10 — Dysarthria (0-2)',                        points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                     { inputKey: '11', label: '11 — Extinction and inattention (0-2)',         points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                   ],
                   bands: [
                     { range: [0, 0],   label: 'no stroke symptoms' },
                     { range: [1, 4],   label: 'minor stroke' },
                     { range: [5, 15],  label: 'moderate stroke' },
                     { range: [16, 20], label: 'moderate-to-severe stroke' },
                     { range: [21, 42], label: 'severe stroke' },
                   ],
                   population: 'Derived from the NIH/NINDS rt-PA Stroke Study (Brott 1989); refined in subsequent NINDS public-domain training materials. The NIHSS has been used in nearly every major stroke trial since.',
                   units: {
                     '1a': 'integer 0-3', '1b': 'integer 0-2', '1c': 'integer 0-2',
                     '2': 'integer 0-2',  '3':  'integer 0-3', '4':  'integer 0-3',
                     '5': 'integer 0-8 (sum L+R)', '6': 'integer 0-8 (sum L+R)',
                     '7': 'integer 0-2',  '8':  'integer 0-2', '9':  'integer 0-3',
                     '10': 'integer 0-2', '11': 'integer 0-2',
                   },
                   validity: 'Adults with acute stroke. The NIHSS is the standard severity instrument in stroke trials and bedside practice. The Sophie tile enters motor arm and motor leg as per-side sums (0-8 each) to compress the published 8-row sub-items into a single input per limb pair; this is the conventional bedside collapse. NOT validated in pediatrics (use PedNIHSS). NIHSS depends on the rater being NIHSS-certified for inter-rater reliability — uncalibrated scoring can vary by ±2 points.',
                   source: 'Brott T, Adams HP Jr, Olinger CP, et al. "Measurements of acute cerebral infarction: a clinical examination scale." Stroke. 1989;20(7):864-870. Public-domain instrument maintained by NIH/NINDS.',
                 } },
  // asa, mallampati, beers removed in spec-v29 wave 29-2 (Group G non-scores): static reference tables.

  // ---- Group G: v4 extensions waves 1-2 (utilities 136-145) ----
  timi:             { citation: 'Antman EM, et al. The TIMI Risk Score for Unstable Angina/Non-ST Elevation MI. JAMA. 2000;284(7):835-842.',
                      example: { fields: { 'tm-age': '1', 'tm-rf': '1', 'tm-asa': '1' },
                                 expected: 'TIMI 3 - intermediate risk band.' },
                      interpretation: {
                        bands: [
                          { range: '0-1', text: '14-day risk of all-cause mortality, new/recurrent MI, or severe ischemia requiring urgent revascularization: 4.7% per source.' },
                          { range: '2',   text: '14-day composite risk: 8.3% per source.' },
                          { range: '3',   text: '14-day composite risk: 13.2% per source.' },
                          { range: '4',   text: '14-day composite risk: 19.9% per source.' },
                          { range: '5',   text: '14-day composite risk: 26.2% per source.' },
                          { range: '6-7', text: '14-day composite risk: 40.9% per source.' },
                        ],
                        sourceQuoted: true,
                        sourceCitation: 'Antman EM, et al. JAMA. 2000;284(7):835-842, Table 3 (TIMI 11B / ESSENCE pooled cohort).',
                      },
                      derivation: {
                        formula: 'TIMI UA/NSTEMI = sum of 7 binary criteria, each 0 or 1. Range 0-7. Predicts 14-day composite of all-cause mortality, new or recurrent MI, or severe recurrent ischemia requiring urgent revascularization.',
                        components: [
                          { inputKey: 'age65',             label: 'Age >= 65',                                                      points: 1 },
                          { inputKey: 'threeRiskFactors',  label: '>=3 risk factors for CAD (HTN, DM, FHx, hyperlipidemia, smoker)', points: 1 },
                          { inputKey: 'knownCad50pct',     label: 'Known CAD (stenosis >= 50%)',                                    points: 1 },
                          { inputKey: 'asaPast7Days',      label: 'ASA use in past 7 days',                                          points: 1 },
                          { inputKey: 'severeAngina',      label: 'Severe angina (>=2 episodes in past 24 h)',                       points: 1 },
                          { inputKey: 'stDeviation',       label: 'ST deviation >= 0.5 mm on initial ECG',                            points: 1 },
                          { inputKey: 'elevatedMarkers',   label: 'Elevated cardiac biomarkers (troponin / CK-MB)',                   points: 1 },
                        ],
                        bands: [
                          { range: [0, 2], label: 'low risk (~5%)' },
                          { range: [3, 4], label: 'intermediate risk (~13-20%)' },
                          { range: [5, 7], label: 'high risk (~26-41%)' },
                        ],
                        population: 'Derived from TIMI 11B (3910 UA/NSTEMI patients) and ESSENCE (3171 patients) pooled cohorts (Antman 2000).',
                        units: {
                          age65: 'boolean', threeRiskFactors: 'boolean', knownCad50pct: 'boolean',
                          asaPast7Days: 'boolean', severeAngina: 'boolean', stDeviation: 'boolean',
                          elevatedMarkers: 'boolean',
                        },
                        validity: 'Adults presenting to the ED with UA or NSTEMI (must have ischemic chest discomfort within 24 h plus aspirin given in the prior 7 days or ST changes or elevated markers as the inclusion criteria for the original trials). Not validated for STEMI (separate TIMI STEMI score), unstable angina without troponin available, or chronic stable angina.',
                        source: 'Antman EM, Cohen M, Bernink PJ, McCabe CH, Horacek T, Papuchis G, Mautner B, Corbalan R, Radley D, Braunwald E. "The TIMI risk score for unstable angina/non-ST elevation MI: A method for prognostication and therapeutic decision making." JAMA. 2000;284(7):835-842.',
                      } },
  grace:            { citation: 'Granger CB, et al. GRACE Project. Arch Intern Med. 2003;163(19):2345-2353. Simplified-points implementation.',
                      example: { fields: { 'gr-age': '70', 'gr-hr': '95', 'gr-sbp': '115', 'gr-cr': '1.2', 'gr-killip': '1' },
                                 expected: 'GRACE points calculation lands in the intermediate-risk band.' } },
  heart:            { citation: 'Six AJ, Backus BE, Kelder JC. HEART score. Neth Heart J. 2008;16(6):191-196.',
                      example: { fields: { 'h-hist': '1', 'h-ekg': '0', 'h-age': '1', 'h-rf': '1', 'h-trop': '0' },
                                 expected: 'HEART 3 - low-risk band (~1.7% MACE at 6 weeks).' },
                      interpretation: {
                        bands: [
                          { range: '0-3',  text: 'Low risk (~1.7% MACE at 6 weeks per Backus 2013 validation). Suitable for early discharge per source.' },
                          { range: '4-6',  text: 'Moderate risk (~16.6% MACE at 6 weeks). Admission for clinical observation per source.' },
                          { range: '7-10', text: 'High risk (~50% MACE at 6 weeks). Early invasive strategy per source.' },
                        ],
                        sourceQuoted: true,
                        sourceCitation: 'Backus BE, Six AJ, Kelder JC, et al. A prospective validation of the HEART score. Int J Cardiol. 2013;168(3):2153-2158.',
                      },
                      derivation: {
                        formula: 'HEART = sum of 5 components, each 0/1/2 (range 0-10):\n  H = History (slightly / moderately / highly suspicious)\n  E = ECG (normal / non-specific repolarization / significant ST depression)\n  A = Age (<45 / 45-64 / >=65)\n  R = Risk factors (none / 1-2 / >=3 risk factors or known atherosclerotic disease)\n  T = Troponin (<= normal limit / 1-3x normal / > 3x normal)',
                        components: [
                          { inputKey: 'history',     label: 'H — History (0 slightly / 1 moderately / 2 highly suspicious)',                points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                          { inputKey: 'ekg',         label: 'E — ECG (0 normal / 1 non-specific repolarization / 2 significant ST depression)', points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                          { inputKey: 'age',         label: 'A — Age (0 <45 / 1 45-64 / 2 >=65)',                                            points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                          { inputKey: 'riskFactors', label: 'R — Risk factors (0 none / 1 one or two / 2 >=3 or known atherosclerotic disease)', points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                          { inputKey: 'troponin',    label: 'T — Troponin (0 <= normal / 1 1-3x normal / 2 > 3x normal)',                    points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
                        ],
                        bands: [
                          { range: [0, 3],  label: 'low risk (~1.7% 6-week MACE; suitable for early discharge)' },
                          { range: [4, 6],  label: 'moderate risk (~16.6%; admission for observation)' },
                          { range: [7, 10], label: 'high risk (~50%; early invasive strategy)' },
                        ],
                        population: 'Derivation: 122 ED chest-pain patients in the Netherlands (Six 2008). Validation: prospective multi-center cohort of 2440 patients (Backus 2013, Int J Cardiol).',
                        units: {
                          history: 'integer 0-2', ekg: 'integer 0-2', age: 'integer 0-2',
                          riskFactors: 'integer 0-2', troponin: 'integer 0-2',
                        },
                        validity: 'Adults presenting to the ED with chest pain. The "History" component is clinician gestalt at the bedside (not an algorithm); inter-rater agreement is the principal source of measurement variability. Should not be used to dispose patients with a single negative troponin alone — serial troponins per institutional protocol are assumed. Not validated for STEMI (those go directly to cath); not validated for non-cardiac chest pain workups.',
                        source: 'Six AJ, Backus BE, Kelder JC. "Chest pain in the emergency room: value of the HEART score." Neth Heart J. 2008;16(6):191-196.',
                      } },
  perc:             { citation: 'Kline JA, et al. PERC rule. J Thromb Haemost. 2004;2(8):1247-1255. Use only if clinical pretest probability is low.',
                      example: { fields: { 'pc-age': '1' },
                                 expected: 'PERC 1 positive feature (age >= 50): rule-out does NOT apply.' },
                      interpretation: {
                        bands: [
                          { range: '0 features positive', text: 'PERC negative. In patients with low pretest probability, PE can be excluded without further testing per source.' },
                          { range: '>=1 feature positive', text: 'PERC positive. Rule-out does not apply; further evaluation per source.' },
                        ],
                        sourceQuoted: true,
                        sourceCitation: 'Kline JA, et al. J Thromb Haemost. 2004;2(8):1247-1255.',
                      },
                      derivation: {
                        formula: 'PERC = count of positive features across 8 criteria. PE is ruled out by PERC ONLY when:\n  (a) clinical pretest probability is low, AND\n  (b) all 8 criteria are negative (PERC = 0).\nAny one positive criterion is enough to fail PERC.',
                        components: [
                          { inputKey: 'age50',                 label: 'Age >= 50',                       points: 1 },
                          { inputKey: 'hr100',                 label: 'Heart rate >= 100/min',           points: 1 },
                          { inputKey: 'sao2lt95',              label: 'SaO2 < 95% on room air',          points: 1 },
                          { inputKey: 'hemoptysis',            label: 'Hemoptysis',                       points: 1 },
                          { inputKey: 'estrogen',              label: 'Estrogen use (OCPs, HRT)',         points: 1 },
                          { inputKey: 'priorVte',              label: 'Prior DVT or PE',                  points: 1 },
                          { inputKey: 'recentSurgery',         label: 'Recent surgery or trauma (within 4 weeks requiring general anesthesia)', points: 1 },
                          { inputKey: 'unilateralLegSwelling', label: 'Unilateral leg swelling',          points: 1 },
                        ],
                        bands: [
                          { range: [0, 0],                 label: 'PERC negative (PE can be ruled out at low pretest probability)' },
                          { range: { op: '>=', value: 1 }, label: 'PERC positive (rule-out does not apply)' },
                        ],
                        population: 'Derivation: 3148 ED patients with suspected PE across 10 US sites (Kline 2004). Validation: prospective multicenter study of 8138 patients (Kline 2008, J Thromb Haemost).',
                        units: {
                          age50: 'boolean', hr100: 'boolean', sao2lt95: 'boolean',
                          hemoptysis: 'boolean', estrogen: 'boolean', priorVte: 'boolean',
                          recentSurgery: 'boolean', unilateralLegSwelling: 'boolean',
                        },
                        validity: 'Applies ONLY to adults with low pretest probability of PE (e.g., Wells <= 4, or unstructured gestalt <15%). PERC should not be used in moderate or high pretest probability — in those patients PE workup proceeds regardless of PERC. Not validated in pregnancy, where D-dimer interpretation differs.',
                        source: 'Kline JA, Mitchell AM, Kabrhel C, Richman PB, Courtney DM. "Clinical criteria to prevent unnecessary diagnostic testing in emergency department patients with suspected pulmonary embolism." J Thromb Haemost. 2004;2(8):1247-1255.',
                      } },
  'wells-pe-geneva':{ citation: 'Wells PS, et al. Thromb Haemost. 2000;83(3):416-420 (Wells PE). Le Gal G, et al. Ann Intern Med. 2006;144(3):165-171 (revised Geneva).',
                      example: { fields: { 'wp-alt': '1', 'wp-hr': '1', 'gv-hr': '105' },
                                 expected: 'Wells PE 4.5 (PE-likely); Geneva ~3 (low/intermediate).' } },
  'curb-65':        { citation: 'Lim WS, et al. Defining community acquired pneumonia severity. Thorax. 2003;58(5):377-382.',
                      example: { fields: { 'cu-conf': '1', 'cu-age': '1' },
                                 expected: 'CURB-65 2 (consider hospitalization).' },
                      interpretation: {
                        bands: [
                          { range: '0-1', text: 'Low severity (30-day mortality ~1.5%). Likely suitable for outpatient treatment per source.' },
                          { range: '2',   text: 'Intermediate severity (mortality ~9.2%). Short hospital stay or closely supervised outpatient treatment per source.' },
                          { range: '3-5', text: 'Severe pneumonia (mortality ~22%). Manage as severe; assess for ICU admission, especially with score 4-5, per source.' },
                        ],
                        sourceQuoted: true,
                        sourceCitation: 'Lim WS, et al. Thorax. 2003;58(5):377-382, Table 4.',
                      },
                      derivation: {
                        formula: 'CURB-65 = sum of 5 binary criteria (each 0 or 1), range 0-5.\n  C = Confusion (new disorientation in person/place/time, AMTS <= 8)\n  U = Urea > 7 mmol/L (BUN > 19 mg/dL — the source uses urea; Sophie uses BUN > 20 mg/dL as the standard US-clinical equivalent)\n  R = Respiratory rate >= 30/min\n  B = SBP < 90 mmHg or DBP <= 60 mmHg\n  65 = Age >= 65',
                        components: [
                          { inputKey: 'confusion',     label: 'C — Confusion (new disorientation; AMTS <= 8)',                    points: 1 },
                          { inputKey: 'bun20',         label: 'U — BUN > 20 mg/dL (equivalent to urea > 7 mmol/L in source)',     points: 1 },
                          { inputKey: 'rr30',          label: 'R — Respiratory rate >= 30/min',                                   points: 1 },
                          { inputKey: 'sbp90OrDbp60',  label: 'B — SBP < 90 mmHg or DBP <= 60 mmHg',                              points: 1 },
                          { inputKey: 'age65',         label: '65 — Age >= 65',                                                   points: 1 },
                        ],
                        bands: [
                          { range: [0, 1], label: 'low severity (outpatient candidate)' },
                          { range: [2, 2], label: 'intermediate severity (consider hospitalization)' },
                          { range: [3, 5], label: 'severe pneumonia (assess for ICU; 4-5 highest priority)' },
                        ],
                        population: 'Derivation/validation: 1068 adults with CAP from three UK studies pooled in Lim 2003 §Methods. Multinational validation in Capelastegui 2006 and others.',
                        units: {
                          confusion: 'boolean', bun20: 'boolean', rr30: 'boolean',
                          sbp90OrDbp60: 'boolean', age65: 'boolean',
                        },
                        validity: 'Adults with community-acquired pneumonia. CURB-65 is a triage tool — its purpose is to direct site-of-care decision (outpatient vs ward vs ICU), not to choose specific antibiotic therapy. NOT validated in immunocompromised hosts, in hospital-acquired or ventilator-associated pneumonia, or in pediatric pneumonia (use age-appropriate criteria). The 4-5 ICU criterion can under-trigger early septic shock; the IDSA/ATS 2007 minor criteria are an adjunct.',
                        source: 'Lim WS, van der Eerden MM, Laing R, Boersma WG, Karalus N, Town GI, Lewis SA, Macfarlane JT. "Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study." Thorax. 2003;58(5):377-382.',
                      } },
  psi:              { citation: 'Fine MJ, et al. Pneumonia Severity Index. NEJM. 1997;336(4):243-250. Reference points-only implementation; class V advisory.',
                      example: { fields: { 'ps-age': '70', 'ps-sex': 'M', 'ps-rr': '1' },
                                 expected: 'PSI ~90 - Class III (short observation typically considered).' },
                      derivation: {
                        formula: 'PSI = sum of demographic + comorbidity + exam + lab points per Fine 1997 Table 2.\n  Age in years (males contribute age; females contribute age-10)\n  Nursing-home resident: +10\n  Neoplastic disease: +30; Liver disease: +20; CHF: +10; Cerebrovascular disease: +10; Renal disease: +10\n  Altered mental status: +20\n  RR >= 30/min: +20\n  SBP < 90 mmHg: +20\n  Temp < 35°C or >= 40°C: +15\n  HR >= 125/min: +10\n  pH < 7.35: +30\n  BUN >= 30 mg/dL: +20; Na < 130: +20; glucose >= 250: +10; Hct < 30%: +10; PaO2 < 60 mmHg: +10\n  Pleural effusion: +10\nClass: I (age <=50 AND 0 points), II (≤70), III (71-90), IV (91-130), V (>130).',
                        components: [
                          { inputKey: 'age',             label: 'Age (males: age in years; females: age − 10)',  points: (v, inputs) => {
                            const age = Number(v) || 0;
                            return inputs && inputs.sex === 'F' ? Math.max(0, age - 10) : age;
                          } },
                          { inputKey: 'nursingHome',     label: 'Nursing-home resident',                          points: 10 },
                          { inputKey: 'neoplasm',        label: 'Neoplastic disease',                              points: 30 },
                          { inputKey: 'liverDisease',    label: 'Liver disease',                                   points: 20 },
                          { inputKey: 'chf',             label: 'Congestive heart failure',                        points: 10 },
                          { inputKey: 'cerebrovascular', label: 'Cerebrovascular disease',                         points: 10 },
                          { inputKey: 'renalDisease',    label: 'Renal disease',                                   points: 10 },
                          { inputKey: 'alteredMental',   label: 'Altered mental status',                            points: 20 },
                          { inputKey: 'rr30',            label: 'Respiratory rate >= 30/min',                       points: 20 },
                          { inputKey: 'sbp90',           label: 'SBP < 90 mmHg',                                    points: 20 },
                          { inputKey: 'temp',            label: 'Temperature < 35°C or >= 40°C',                    points: (v) => { if (v == null || v === '') return 0; const t = Number(v); return (t < 35 || t >= 40) ? 15 : 0; } },
                          { inputKey: 'hr125',           label: 'Heart rate >= 125/min',                            points: 10 },
                          { inputKey: 'ph',              label: 'Arterial pH < 7.35',                               points: (v) => (v != null && v !== '' && Number(v) < 7.35) ? 30 : 0 },
                          { inputKey: 'bun',             label: 'BUN >= 30 mg/dL',                                  points: (v) => (v != null && v !== '' && Number(v) >= 30) ? 20 : 0 },
                          { inputKey: 'sodium',          label: 'Sodium < 130 mEq/L',                               points: (v) => (v != null && v !== '' && Number(v) < 130) ? 20 : 0 },
                          { inputKey: 'glucose',         label: 'Glucose >= 250 mg/dL',                             points: (v) => (v != null && v !== '' && Number(v) >= 250) ? 10 : 0 },
                          { inputKey: 'hct',             label: 'Hematocrit < 30%',                                  points: (v) => (v != null && v !== '' && Number(v) < 30) ? 10 : 0 },
                          { inputKey: 'pao2',            label: 'PaO2 < 60 mmHg',                                    points: (v) => (v != null && v !== '' && Number(v) < 60) ? 10 : 0 },
                          { inputKey: 'pleuralEffusion', label: 'Pleural effusion on imaging',                       points: 10 },
                        ],
                        bands: [
                          { range: { op: '<=', value: 70 },  label: 'Class I-II (outpatient candidate)' },
                          { range: [71, 90],                 label: 'Class III (observation / short admission)' },
                          { range: [91, 130],                label: 'Class IV (admit)' },
                          { range: { op: '>',  value: 130 }, label: 'Class V (admit; high mortality)' },
                        ],
                        population: 'Derivation: 14,199 adult inpatients with CAP from the Medisgroups Comparative Hospital Database (Fine 1997 §Methods). Validation: 38,039 inpatients from Pennsylvania + the PORT cohort.',
                        units: {
                          age: 'integer years', sex: '"M" or "F"',
                          nursingHome: 'boolean', neoplasm: 'boolean', liverDisease: 'boolean',
                          chf: 'boolean', cerebrovascular: 'boolean', renalDisease: 'boolean',
                          alteredMental: 'boolean', rr30: 'boolean', sbp90: 'boolean',
                          temp: '°C (optional; outside [35, 40) scores 15)',
                          hr125: 'boolean',
                          ph: 'unitless (optional; <7.35 scores 30)',
                          bun: 'mg/dL (optional; >=30 scores 20)',
                          sodium: 'mEq/L (optional; <130 scores 20)',
                          glucose: 'mg/dL (optional; >=250 scores 10)',
                          hct: '% (optional; <30 scores 10)',
                          pao2: 'mmHg (optional; <60 scores 10)',
                          pleuralEffusion: 'boolean',
                        },
                        validity: 'Adults with community-acquired pneumonia. PSI Class I requires age <=50 AND zero clinical risk factors AND no relevant labs abnormal — Sophie does not enforce the Class-I age gate in the bands array; the result block uses the existing classifier which DOES enforce it. Class V is an advisory band in the Sophie tile (recommendation: admit) — the original paper does not prescribe ICU vs ward at Class V. NOT validated in immunocompromised hosts, hospital-acquired or ventilator-associated pneumonia, or pediatric pneumonia.',
                        source: 'Fine MJ, Auble TE, Yealy DM, Hanusa BH, Weissfeld LA, Singer DE, Coley CM, Marrie TJ, Kapoor WN. "A prediction rule to identify low-risk patients with community-acquired pneumonia." NEJM. 1997;336(4):243-250.',
                      } },
  'qsofa-sofa':     { citation: 'Singer M, et al. Sepsis-3 (qSOFA). JAMA. 2016;315(8):801-810. Vincent JL, et al. SOFA. Intensive Care Med. 1996;22(7):707-710.',
                      example: { fields: { 'q-rr': '1', 'q-am': '1', 's-resp': '1', 's-cv': '1' },
                                 expected: 'qSOFA 2 (high risk for poor outcome); SOFA 2.' },
                      derivation: {
                        formula: 'qSOFA = sum of 3 bedside criteria (each 0 or 1):\n  - Respiratory rate >= 22/min\n  - Altered mental status (GCS < 15)\n  - SBP <= 100 mmHg\nqSOFA >= 2 identifies adult patients outside the ICU with suspected infection at higher risk of poor outcomes.',
                        components: [
                          { inputKey: 'rr22',          label: 'Respiratory rate >= 22/min', points: 1 },
                          { inputKey: 'alteredMental', label: 'Altered mental status (GCS < 15)', points: 1 },
                          { inputKey: 'sbp100',        label: 'SBP <= 100 mmHg',             points: 1 },
                        ],
                        bands: [
                          { range: [0, 1], label: 'low risk (qSOFA negative)' },
                          { range: [2, 3], label: 'higher risk of poor outcome (Sepsis-3 screen positive)' },
                        ],
                        population: 'Adults with suspected infection outside the ICU. Derivation/validation: Seymour CW, et al. JAMA. 2016;315(8):762-774 — UPMC, KPNC, Veterans Affairs cohorts (n>700,000 encounters).',
                        units: {
                          rr22: 'boolean (true when RR >= 22/min)',
                          alteredMental: 'boolean (true when GCS < 15)',
                          sbp100: 'boolean (true when systolic BP <= 100 mmHg)',
                        },
                        validity: 'Bedside screen for poor outcomes in adults outside the ICU with suspected infection; not a diagnostic test for sepsis. The Sepsis-3 task force notes qSOFA was developed for prediction (in-hospital mortality / prolonged ICU stay), not for diagnosis or for triggering antibiotics. Not validated for children.',
                        source: 'Singer M, Deutschman CS, Seymour CW, et al. "The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3)." JAMA. 2016;315(8):801-810. (qSOFA introduced as the non-ICU bedside surrogate for SOFA.)',
                      },
                      derivationSofa: {
                        formula: 'SOFA = sum of 6 organ-system scores, each 0-4 (range 0-24).\n  Respiration: PaO2/FiO2 >=400 → 0; 300-399 → 1; 200-299 → 2; 100-199 (on respiratory support) → 3; <100 (on respiratory support) → 4\n  Coagulation: platelets x10^3/uL >=150 → 0; 100-149 → 1; 50-99 → 2; 20-49 → 3; <20 → 4\n  Liver: bilirubin mg/dL <1.2 → 0; 1.2-1.9 → 1; 2.0-5.9 → 2; 6.0-11.9 → 3; >=12 → 4\n  Cardiovascular: MAP >=70 mmHg → 0; MAP <70 → 1; dopamine <=5 or dobutamine any → 2; dopamine >5 / epi <=0.1 / norepi <=0.1 → 3; dopamine >15 / epi >0.1 / norepi >0.1 → 4\n  CNS: GCS 15 → 0; 13-14 → 1; 10-12 → 2; 6-9 → 3; <6 → 4\n  Renal: creatinine mg/dL <1.2 (or UO normal) → 0; 1.2-1.9 → 1; 2.0-3.4 → 2; 3.5-4.9 or UO <500 mL/d → 3; >=5.0 or UO <200 mL/d → 4',
                        components: [
                          { inputKey: 'respiration',    label: 'Respiration (PaO2/FiO2; 0-4)',  points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
                          { inputKey: 'coagulation',    label: 'Coagulation (platelets; 0-4)',   points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
                          { inputKey: 'liver',          label: 'Liver (bilirubin; 0-4)',          points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
                          { inputKey: 'cardiovascular', label: 'Cardiovascular (MAP / vasopressors; 0-4)', points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
                          { inputKey: 'cns',            label: 'CNS (GCS; 0-4)',                  points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
                          { inputKey: 'renal',          label: 'Renal (creatinine / urine output; 0-4)', points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
                        ],
                        bands: [
                          { range: [0, 6],   label: 'low mortality (~10%)' },
                          { range: [7, 9],   label: 'moderate mortality (~15-20%)' },
                          { range: [10, 12], label: 'high mortality (~40-50%)' },
                          { range: [13, 24], label: 'very high mortality (>50%)' },
                        ],
                        population: 'Originally derived from 1449 ICU patients across 40 European ICUs (Vincent 1996). Validated and recalibrated in Sepsis-3 (Seymour 2016) on >700,000 EHR encounters; the >=2-point increase from baseline criterion is the Sepsis-3 organ-dysfunction operationalization.',
                        units: {
                          respiration: 'integer 0-4 (caller pre-grades from PaO2/FiO2 with respiratory-support context)',
                          coagulation: 'integer 0-4 (caller pre-grades from platelet count)',
                          liver:       'integer 0-4 (caller pre-grades from bilirubin)',
                          cardiovascular: 'integer 0-4 (caller pre-grades from MAP and vasopressor dose)',
                          cns:         'integer 0-4 (caller pre-grades from GCS)',
                          renal:       'integer 0-4 (caller pre-grades from creatinine or urine output)',
                        },
                        validity: 'Adult ICU patients. The Sophie tile accepts pre-graded 0-4 values per organ system because the underlying clinical inputs (PaO2/FiO2 with vent context, vasopressor dose tier, urine output trend) require bedside judgment that does not collapse into a single numeric input. SOFA delta (≥2-point increase from baseline) is the Sepsis-3 criterion; absolute SOFA is the per-encounter score. Not validated in pediatric ICU (use pSOFA).',
                        source: 'Vincent JL, Moreno R, Takala J, Willatts S, De Mendonça A, Bruining H, Reinhart CK, Suter PM, Thijs LG. "The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure." Intensive Care Med. 1996;22(7):707-710. Recalibrated in Singer M et al. JAMA 2016 (Sepsis-3).',
                      } },
  'meld-childpugh': { citation: 'Kim WR, et al. MELD-3.0. Gastroenterology. 2021;161(6):1887-1895. Pugh RN, et al. Br J Surg. 1973;60(8):646-649 (Child-Pugh).',
                      example: { fields: { 'm-bili': '2.0', 'm-inr': '1.5', 'm-cr': '1.3', 'm-na': '135', 'm-alb': '3.0', 'm-sex': 'M', 'cp-asc': 'mild', 'cp-enc': 'none' },
                                 expected: 'MELD-3.0 ~17; Child-Pugh ~7 (Class B).' },
                      derivation: {
                        formula: 'MELD-3.0 = round(\n  1.33 × (1 if female else 0)\n  + 4.56 × ln(bilirubin)\n  + 0.82 × (137 − sodium)\n  − 0.24 × (137 − sodium) × ln(bilirubin)\n  + 9.09 × ln(INR)\n  + 11.14 × ln(creatinine)\n  + 1.85 × (3.5 − albumin)\n  − 1.83 × (3.5 − albumin) × ln(creatinine)\n  + 6\n)\nwith inputs clamped before substitution:\n  bilirubin lower-bounded at 1.0 mg/dL (no upper bound)\n  INR lower-bounded at 1.0 (no upper bound)\n  creatinine clamped to [1.0, 3.0] mg/dL (set to 3.0 if dialyzed ≥2× in the last week)\n  sodium clamped to [125, 137] mEq/L\n  albumin clamped to [1.5, 3.5] g/dL',
                        bands: [
                          { range: { op: '<',  value: 10 }, label: 'low mortality (~2-4% 3-mo waitlist)' },
                          { range: [10, 19],                label: 'moderate (~6-12% 3-mo waitlist)' },
                          { range: [20, 29],                label: 'high (~20-30% 3-mo waitlist)' },
                          { range: { op: '>=', value: 30 }, label: 'very high (>50% 3-mo waitlist; transplant priority)' },
                        ],
                        population: 'Derivation: 20,316 US adult candidates listed for first deceased-donor liver transplant 2016-2018; validated in a 2018-2019 cohort (n=19,373). Kim 2021 introduced sex (+1.33 for female) and albumin terms relative to MELD-Na 2016.',
                        units: {
                          bilirubin: 'mg/dL', inr: 'unitless', creatinine: 'mg/dL',
                          sodium: 'mEq/L', albumin: 'g/dL', sex: '"M" or "F"',
                          hadDialysisTwiceLastWeek: 'boolean (sets creatinine to 3.0)',
                        },
                        validity: 'Adult candidates (>= 12 years) for liver transplantation. MELD-3.0 corrects the prior MELD-Na underestimation of female mortality (the +1.33 female term) and adds an albumin term. The clamping of inputs (bilirubin ≥1, INR ≥1, creatinine 1-3, sodium 125-137, albumin 1.5-3.5) is part of the published formula — values outside these ranges are substituted to the nearest endpoint before the log/linear terms are evaluated. NOT defined for pediatric candidates (use PELD); NOT applicable to acute liver failure prioritization (Status 1A).',
                        source: 'Kim WR, Mannalithara A, Heimbach JK, Kamath PS, Asrani SK, Biggins SW, Wood NL, Gentry SE, Kwong AJ. "MELD 3.0: The Model for End-Stage Liver Disease Updated for the Modern Era." Gastroenterology. 2021;161(6):1887-1895.e4.',
                      } },
  'ranson-bisap':   { citation: 'Ranson JH, et al. Surg Gynecol Obstet. 1974;139(1):69-81. Wu BU, et al. BISAP. Gut. 2008;57(12):1698-1703.',
                      example: { fields: { 'r-age': '1', 'r-wbc': '1', 'b-bun': '1', 'b-age': '1' },
                                 expected: 'Ranson 2; BISAP 2 (intermediate severity).' },
                      derivation: {
                        formula: 'BISAP = sum of 5 binary criteria (each 0 or 1), range 0-5. Calculated at presentation to the ED in acute pancreatitis. Mortality stratification per Wu 2008 Table 3.\n  B = BUN > 25 mg/dL\n  I = Impaired mental status (GCS < 15)\n  S = SIRS criteria met (>=2 of: temp <36 or >38, HR >90, RR >20 or PaCO2 <32, WBC <4 or >12 or >10% bands)\n  A = Age > 60\n  P = Pleural effusion present',
                        components: [
                          { inputKey: 'bun25',           label: 'B — BUN > 25 mg/dL',                                           points: 1 },
                          { inputKey: 'alteredMental',   label: 'I — Impaired mental status (GCS < 15)',                        points: 1 },
                          { inputKey: 'sirs',            label: 'S — SIRS criteria met (>=2 of 4)',                              points: 1 },
                          { inputKey: 'age60',           label: 'A — Age > 60',                                                  points: 1 },
                          { inputKey: 'pleuralEffusion', label: 'P — Pleural effusion present',                                  points: 1 },
                        ],
                        bands: [
                          { range: [0, 2],                 label: 'low risk of mortality' },
                          { range: { op: '>=', value: 3 }, label: 'high risk of mortality (>5-10%)' },
                        ],
                        population: 'Derivation: 17,992 cases of acute pancreatitis from the National Cancer Data Bank (Wu 2008 §Methods). Internal validation in 18,256 cases. Designed to be calculable within 24 h of admission (vs Ranson which requires 48 h labs).',
                        units: {
                          bun25: 'boolean', alteredMental: 'boolean', sirs: 'boolean',
                          age60: 'boolean', pleuralEffusion: 'boolean',
                        },
                        validity: 'Adults with acute pancreatitis presenting to the ED. BISAP is a 24-hour bedside severity score; it is not a diagnostic test for pancreatitis (Atlanta criteria apply). Compared to Ranson (the second half of this tile), BISAP requires fewer inputs and no 48-hour follow-up. The score has not been validated for chronic pancreatitis flares or for pediatric pancreatitis.',
                        source: 'Wu BU, Johannes RS, Sun X, Tabak Y, Conwell DL, Banks PA. "The early prediction of mortality in acute pancreatitis: a large population-based study." Gut. 2008;57(12):1698-1703.',
                      } },

  // ---- Group G: v4 extensions waves 3-4 (utilities 146-156) ----
  centor:               { citation: 'Centor RM, et al. Med Decis Making. 1981;1(3):239-246. McIsaac WJ, et al. CMAJ. 1998;158(1):75-83.',
                          example: { fields: { 'ce-exud': '1', 'ce-aden': '1', 'ce-fever': '1', 'ce-cough': '1', 'ce-age': '12' },
                                     expected: 'Centor 4; McIsaac 5 (high probability of GAS pharyngitis; consider testing or empiric treatment).' },
                          interpretation: {
                            bands: [
                              { range: '<=1 (McIsaac)', text: 'Low probability of GAS pharyngitis. No further testing or antibiotics per source.' },
                              { range: '2-3 (McIsaac)', text: 'Intermediate probability. Rapid antigen detection test or throat culture per source.' },
                              { range: '4-5 (McIsaac)', text: 'High probability of GAS pharyngitis. Empiric treatment may be considered per source; testing remains an option.' },
                            ],
                            sourceQuoted: true,
                            sourceCitation: 'McIsaac WJ, et al. CMAJ. 1998;158(1):75-83, Table 4 management bands.',
                          },
                          derivation: {
                            formula: 'Centor = sum of 4 clinical criteria (each 0 or 1), range 0-4:\n  - Tonsillar exudate\n  - Tender anterior cervical adenopathy\n  - Fever history (>38°C)\n  - Absence of cough',
                            components: [
                              { inputKey: 'tonsillarExudate',          label: 'Tonsillar exudate',                       points: 1 },
                              { inputKey: 'tenderAnteriorAdenopathy',  label: 'Tender anterior cervical adenopathy',     points: 1 },
                              { inputKey: 'feverHistory',              label: 'Fever history (>38°C)',                   points: 1 },
                              { inputKey: 'absenceOfCough',            label: 'Absence of cough',                        points: 1 },
                            ],
                            bands: [
                              { range: [0, 1], label: 'low probability of GAS pharyngitis (<10%); no test/abx' },
                              { range: [2, 3], label: 'intermediate (~15-32%); consider rapid antigen test' },
                              { range: [4, 4], label: 'high (~56%); consider empiric treatment or test' },
                            ],
                            population: '286 adults with acute pharyngitis at an inner-city ED (Centor 1981 §Methods). Independently validated in multiple subsequent cohorts.',
                            units: {
                              tonsillarExudate: 'boolean', tenderAnteriorAdenopathy: 'boolean',
                              feverHistory: 'boolean', absenceOfCough: 'boolean',
                            },
                            validity: 'Adults with acute pharyngitis. The Centor score targets pretest probability of Group A streptococcal pharyngitis; it does not address rare-but-serious differential diagnoses (peritonsillar abscess, Lemierre, epiglottitis). NOT validated in immunocompromised hosts. For pediatric use, the McIsaac modification (next block) adds an age modifier that downweights adolescents/adults and upweights ages 3-14.',
                            source: 'Centor RM, Witherspoon JM, Dalton HP, Brody CE, Link K. "The diagnosis of strep throat in adults in the emergency room." Med Decis Making. 1981;1(3):239-246.',
                          },
                          derivationMcisaac: {
                            formula: 'McIsaac = Centor + age modifier:\n  - Age 3-14: +1\n  - Age 15-44: +0\n  - Age >= 45: -1',
                            components: [
                              { inputKey: 'tonsillarExudate',          label: 'Tonsillar exudate',                       points: 1 },
                              { inputKey: 'tenderAnteriorAdenopathy',  label: 'Tender anterior cervical adenopathy',     points: 1 },
                              { inputKey: 'feverHistory',              label: 'Fever history (>38°C)',                   points: 1 },
                              { inputKey: 'absenceOfCough',            label: 'Absence of cough',                        points: 1 },
                              { inputKey: 'ageYears',                  label: 'Age modifier (age 3-14 +1; 15-44 +0; >=45 -1)',
                                points: (v) => { const a = Number(v) || 0; if (a >= 3 && a <= 14) return 1; if (a >= 45) return -1; return 0; } },
                            ],
                            bands: [
                              { range: { op: '<=', value: 1 }, label: 'low probability; no test/abx (McIsaac)' },
                              { range: [2, 3],                 label: 'intermediate; rapid antigen test (McIsaac)' },
                              { range: [4, 5],                 label: 'high; empiric treatment may be considered (McIsaac)' },
                            ],
                            population: '521 patients with sore throat (children and adults) at family-practice teaching units in Toronto (McIsaac 1998 §Methods). Re-derives Centor with an empirically fit age modifier.',
                            units: {
                              tonsillarExudate: 'boolean', tenderAnteriorAdenopathy: 'boolean',
                              feverHistory: 'boolean', absenceOfCough: 'boolean',
                              ageYears: 'integer years',
                            },
                            validity: 'Children and adults with acute pharyngitis. The age modifier is the McIsaac addition; everything else is identical to Centor. NOT validated in immunocompromised hosts.',
                            source: 'McIsaac WJ, White D, Tannenbaum D, Low DE. "A clinical score to reduce unnecessary antibiotic use in patients with sore throat." CMAJ. 1998;158(1):75-83.',
                          } },
  'wells-dvt-caprini':  { citation: 'Wells PS, et al. Lancet. 1997;350(9094):1795-1798 (Wells DVT). Caprini JA. Dis Mon. 2005;51(2-3):70-78.',
                          example: { fields: { 'wd-tender': '1', 'wd-leg': '1', 'wd-calf': '1', 'cap-pts': '5' },
                                     expected: 'Wells DVT 3 (High); Caprini 5 (high VTE risk).' } },
  bishop: {
    citation: 'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266-268.',
    example: { fields: { 'bp-d': '3', 'bp-e': '60', 'bp-s': '-1', 'bp-c': 'medium', 'bp-p': 'anterior' },
               expected: 'Bishop 9 (favorable; induction success likely).' },
    derivation: {
      formula: 'Bishop = sum across 5 cervical examination items (Bishop 1964 Table 1). Range 0-13.\n  Dilation (cm):       0 (0) | 1-2 (+1) | 3-4 (+2) | >=5 (+3)\n  Effacement (%):       <30 (0) | 30-50 (+1) | 51-70 (+2) | >70 (+3)\n  Station:              <=-3 (0) | -2 (+1) | -1 or 0 (+2) | +1 or +2 (+3)\n  Consistency:          firm (0) | medium (+1) | soft (+2)\n  Position:             posterior (0) | mid (+1) | anterior (+2)\nBands per Bishop 1964: 0-5 unfavorable (induction less likely to succeed); 6-8 intermediate; 9-13 favorable.',
      components: [
        { inputKey: 'dilation',    label: 'Dilation (cm; 0: 0 / 1-2: +1 / 3-4: +2 / >=5: +3)',          points: (v) => { const n = Number(v); if (n === 0) return 0; if (n <= 2) return 1; if (n <= 4) return 2; return 3; } },
        { inputKey: 'effacement',  label: 'Effacement (%; <30: 0 / 30-50: +1 / 51-70: +2 / >70: +3)',   points: (v) => { const n = Number(v); if (n < 30) return 0; if (n <= 50) return 1; if (n <= 70) return 2; return 3; } },
        { inputKey: 'station',     label: 'Station (<=-3: 0 / -2: +1 / -1 or 0: +2 / +1 or +2: +3)',    points: (v) => { const n = Number(v); if (n <= -3) return 0; if (n <= -2) return 1; if (n <= 0) return 2; return 3; } },
        { inputKey: 'consistency', label: 'Consistency (firm: 0 / medium: +1 / soft: +2)',              points: (v) => ({ firm: 0, medium: 1, soft: 2 })[v] ?? 0 },
        { inputKey: 'position',    label: 'Position (posterior: 0 / mid: +1 / anterior: +2)',          points: (v) => ({ posterior: 0, mid: 1, anterior: 2 })[v] ?? 0 },
      ],
      bands: [
        { range: [0, 5],  label: 'unfavorable (induction less likely to succeed)' },
        { range: [6, 8],  label: 'intermediate' },
        { range: [9, 13], label: 'favorable' },
      ],
      population: 'Bishop 1964: prospective derivation in 500 multiparous patients at term scheduled for elective induction at Pennsylvania Hospital; outcome was time-to-delivery after induction. The original cohort was multiparous; nulliparous validation came later. The score predates routine cervical ripening agents (PGE2, misoprostol) — modern obstetric practice frequently combines Bishop with imaging and ripening assessment.',
      units: {
        dilation: 'cm (cervical dilation)',
        effacement: 'percent (cervical effacement)',
        station: 'integer station (-3 to +2) by ACOG standard',
        consistency: "enum: 'firm' | 'medium' | 'soft'",
        position: "enum: 'posterior' | 'mid' | 'anterior'",
      },
      validity: 'Term pregnancies at >= 37 weeks being evaluated for induction of labor. Best-studied in multiparous patients; nulliparous validation in subsequent decades found a less favorable predictive performance, and the Modified Bishop (with parity adjustment) is more commonly used now. The 6+ threshold for favorability is a commonly-cited (not Bishop 1964 original) cutoff for induction success. Not validated for preterm induction, for cesarean-eligibility decisions, or for non-induction cervical assessment (e.g., threatened preterm labor).',
      source: 'Bishop EH. "Pelvic scoring for elective induction." Obstet Gynecol. 1964;24:266-268.',
    },
  },
  'alvarado-pas': {
    citation: 'Alvarado A. Ann Emerg Med. 1986;15(5):557-564 (MANTRELS). Samuel M. J Pediatr Surg. 2002;37(6):877-881 (PAS).',
    example: { fields: { 'a-mig': '1', 'a-anx': '1', 'a-rlq': '1', 'a-wbc': '1', 'p-rlq': '1', 'p-mig': '1', 'p-wbc': '1' },
               expected: 'Alvarado 6 (compatible with appendicitis); PAS 5 (intermediate).' },
    derivation: {
      formula: 'Alvarado (MANTRELS) = sum across 8 criteria, range 0-10.\n  M — Migration of pain to RLQ                                    (+1)\n  A — Anorexia                                                    (+1)\n  N — Nausea / vomiting                                            (+1)\n  T — Tenderness in RLQ                                            (+2)\n  R — Rebound tenderness                                           (+1)\n  E — Elevated temperature (>= 37.3 °C)                            (+1)\n  L — Leukocytosis (WBC > 10 x10^9/L)                              (+2)\n  S — Shift of WBC to the left (> 75% neutrophils)                 (+1)\nBands per Alvarado 1986: 0-4 low (appendicitis unlikely); 5-6 equivocal (consider observation / imaging); 7-10 high (probable appendicitis).',
      components: [
        { inputKey: 'migration',          label: 'M — Migration of pain to RLQ (+1)',                     points: 1 },
        { inputKey: 'anorexia',           label: 'A — Anorexia (+1)',                                     points: 1 },
        { inputKey: 'nausea',             label: 'N — Nausea / vomiting (+1)',                            points: 1 },
        { inputKey: 'rlqTenderness',      label: 'T — Tenderness in RLQ (+2)',                            points: 2 },
        { inputKey: 'reboundTenderness',  label: 'R — Rebound tenderness (+1)',                           points: 1 },
        { inputKey: 'elevatedTemp',       label: 'E — Elevated temperature (>= 37.3 °C) (+1)',            points: 1 },
        { inputKey: 'leukocytosis',       label: 'L — Leukocytosis (WBC > 10 x10^9/L) (+2)',              points: 2 },
        { inputKey: 'leftShift',          label: 'S — Shift of WBC to the left (> 75% neutrophils) (+1)', points: 1 },
      ],
      bands: [
        { range: [0, 4],  label: 'appendicitis unlikely (low)' },
        { range: [5, 6],  label: 'equivocal (consider observation / imaging)' },
        { range: [7, 10], label: 'probable appendicitis (high)' },
      ],
      population: 'Alvarado 1986: retrospective derivation in 305 adult and adolescent patients hospitalized with abdominal pain at a single US center; outcome was histologically-confirmed acute appendicitis at appendectomy. The score predates routine CT imaging and was designed for the pre-imaging clinical triage of suspected appendicitis.',
      units: {
        migration: 'boolean', anorexia: 'boolean', nausea: 'boolean',
        rlqTenderness: 'boolean (+2 weight)', reboundTenderness: 'boolean',
        elevatedTemp: 'boolean (>= 37.3 °C / >= 99.1 °F oral)',
        leukocytosis: 'boolean (WBC > 10 x10^9/L; +2 weight)',
        leftShift: 'boolean (>75% neutrophils)',
      },
      validity: 'Adults and adolescents with suspected acute appendicitis. Sensitivity drops in pregnant patients, elderly patients, and immunocompromised hosts; modern practice frequently combines Alvarado with imaging (CT or graded-compression US) and serial examination rather than acting on the score alone. Pediatric appendicitis is better captured by the companion PAS (Samuel 2002, surfaced as `derivationPas` on this tile). Not a substitute for surgical evaluation in patients in whom there is genuine clinical concern despite a low score.',
      source: 'Alvarado A. "A practical score for the early diagnosis of acute appendicitis." Ann Emerg Med. 1986;15(5):557-564.',
    },
    derivationPas: {
      formula: 'Pediatric Appendicitis Score (PAS) = sum across 8 criteria, range 0-10.\n  Cough / hop / percussion tenderness                              (+2)\n  RLQ tenderness                                                    (+2)\n  Migration of pain                                                 (+1)\n  Anorexia                                                          (+1)\n  Fever (>= 38.0 °C)                                                (+1)\n  Nausea / vomiting                                                 (+1)\n  Leukocytosis (WBC > 10 x10^9/L)                                   (+1)\n  Polymorphonuclear neutrophilia (> 75% neutrophils)                (+1)\nBands per Samuel 2002: 0-3 low; 4-6 equivocal (observe / image); 7-10 high (probable appendicitis).',
      components: [
        { inputKey: 'coughHopTenderness', label: 'Cough / hop / percussion tenderness (+2)',                 points: 2 },
        { inputKey: 'rlqTenderness',      label: 'RLQ tenderness (+2)',                                       points: 2 },
        { inputKey: 'migration',          label: 'Migration of pain (+1)',                                    points: 1 },
        { inputKey: 'anorexia',           label: 'Anorexia (+1)',                                             points: 1 },
        { inputKey: 'fever',              label: 'Fever (>= 38.0 °C) (+1)',                                   points: 1 },
        { inputKey: 'nausea',             label: 'Nausea / vomiting (+1)',                                    points: 1 },
        { inputKey: 'leukocytosis',       label: 'Leukocytosis (WBC > 10 x10^9/L) (+1)',                      points: 1 },
        { inputKey: 'leftShift',          label: 'Polymorphonuclear neutrophilia (> 75% neutrophils) (+1)',   points: 1 },
      ],
      bands: [
        { range: [0, 3],  label: 'appendicitis unlikely (low)' },
        { range: [4, 6],  label: 'equivocal (observe / image)' },
        { range: [7, 10], label: 'probable appendicitis (high)' },
      ],
      population: 'Samuel 2002: prospective derivation in 1170 children aged 4-15 with suspected acute appendicitis at a pediatric tertiary center; outcome was histologically-confirmed appendicitis at surgery or 2-week clinical follow-up for non-operative patients. PAS adapts Alvarado for the pediatric exam (cough/hop/percussion tenderness replaces rebound; fever threshold raised; left-shift simplified to >75% PMNs).',
      units: {
        coughHopTenderness: 'boolean (+2 weight; cough / heel-drop / percussion-induced pain in RLQ)',
        rlqTenderness: 'boolean (+2 weight)',
        migration: 'boolean', anorexia: 'boolean',
        fever: 'boolean (>= 38.0 °C)',
        nausea: 'boolean', leukocytosis: 'boolean (WBC > 10 x10^9/L)',
        leftShift: 'boolean (>75% PMNs)',
      },
      validity: 'Children aged ~4-15 with suspected acute appendicitis. Modern pediatric ED practice often pairs PAS with ultrasound or staged imaging rather than acting on the score alone; the Pediatric Appendicitis Risk Calculator (pARC, Kharbanda 2018) is an alternative continuous-risk model. Not validated for adults (use Alvarado), for adolescent pregnancy, or for immunocompromised pediatric patients.',
      source: 'Samuel M. "Pediatric appendicitis score." J Pediatr Surg. 2002;37(6):877-881.',
    },
  },
  // mrs removed in spec-v29 wave 29-2 (Group G non-scores): static reference table.
  phq9:                 { citation: 'Kroenke K, Spitzer RL, Williams JBW. PHQ-9. J Gen Intern Med. 2001;16(9):606-613.',
                          interpretation: {
                            bands: [
                              { range: '0-4',   text: 'None / minimal depression per source.' },
                              { range: '5-9',   text: 'Mild depression per source.' },
                              { range: '10-14', text: 'Moderate depression per source.' },
                              { range: '15-19', text: 'Moderately severe depression per source.' },
                              { range: '20-27', text: 'Severe depression per source.' },
                            ],
                            sourceQuoted: true,
                            sourceCitation: 'Kroenke K, et al. J Gen Intern Med. 2001;16(9):606-613, Table 4.',
                          },
                          derivation: {
                            formula: 'PHQ-9 = sum of 9 items, each 0-3 (0 not at all / 1 several days / 2 more than half the days / 3 nearly every day). Range 0-27. Items reference DSM-IV symptom criteria for major depressive disorder over the prior 2 weeks.',
                            components: [
                              { inputKey: '0', label: 'Q1 Little interest or pleasure in doing things (0-3)',                                       points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '1', label: 'Q2 Feeling down, depressed, or hopeless (0-3)',                                              points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '2', label: 'Q3 Trouble falling/staying asleep or sleeping too much (0-3)',                               points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '3', label: 'Q4 Feeling tired or having little energy (0-3)',                                              points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '4', label: 'Q5 Poor appetite or overeating (0-3)',                                                        points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '5', label: 'Q6 Feeling bad about yourself / failure / let yourself or family down (0-3)',                 points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '6', label: 'Q7 Trouble concentrating on things (0-3)',                                                    points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '7', label: 'Q8 Moving or speaking so slowly that others noticed, or the opposite (0-3)',                  points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '8', label: 'Q9 Thoughts that you would be better off dead or of hurting yourself (0-3)',                  points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                            ],
                            bands: [
                              { range: [0, 4],   label: 'minimal depression' },
                              { range: [5, 9],   label: 'mild depression' },
                              { range: [10, 14], label: 'moderate depression' },
                              { range: [15, 19], label: 'moderately severe depression' },
                              { range: [20, 27], label: 'severe depression' },
                            ],
                            population: 'Derivation and validation: 6000 patients across 8 primary-care clinics and 7 obstetrics-gynecology clinics (Kroenke 2001). Validated against the SCID structured psychiatric interview as the reference standard.',
                            units: {
                              '0': 'integer 0-3', '1': 'integer 0-3', '2': 'integer 0-3',
                              '3': 'integer 0-3', '4': 'integer 0-3', '5': 'integer 0-3',
                              '6': 'integer 0-3', '7': 'integer 0-3', '8': 'integer 0-3',
                            },
                            validity: 'Adults (≥18) in primary-care and obstetrics-gynecology settings. The PHQ-9 is a SCREEN, not a diagnostic test — a positive score (≥10) should prompt a clinical interview to confirm the DSM diagnosis. Item 9 (suicidality) is a critical-action flag regardless of the aggregate: any non-zero Q9 response should trigger immediate suicide-risk evaluation (C-SSRS is a separate Sophie tile for this). NOT validated in patients with cognitive impairment that precludes self-report, or in non-English-speaking populations using non-validated translations.',
                            source: 'Kroenke K, Spitzer RL, Williams JBW. "The PHQ-9: validity of a brief depression severity measure." J Gen Intern Med. 2001;16(9):606-613.',
                          } },
  gad7:                 { citation: 'Spitzer RL, et al. GAD-7. Arch Intern Med. 2006;166(10):1092-1097.',
                          interpretation: {
                            bands: [
                              { range: '0-4',   text: 'Minimal anxiety per source.' },
                              { range: '5-9',   text: 'Mild anxiety per source.' },
                              { range: '10-14', text: 'Moderate anxiety per source.' },
                              { range: '15-21', text: 'Severe anxiety per source.' },
                            ],
                            sourceQuoted: true,
                            sourceCitation: 'Spitzer RL, et al. Arch Intern Med. 2006;166(10):1092-1097.',
                          },
                          derivation: {
                            formula: 'GAD-7 = sum of 7 items, each 0-3 (0 not at all / 1 several days / 2 more than half the days / 3 nearly every day). Range 0-21. Items reference generalized anxiety symptoms over the prior 2 weeks.',
                            components: [
                              { inputKey: '0', label: 'Q1 Feeling nervous, anxious, or on edge (0-3)',                          points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '1', label: 'Q2 Not being able to stop or control worrying (0-3)',                    points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '2', label: 'Q3 Worrying too much about different things (0-3)',                      points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '3', label: 'Q4 Trouble relaxing (0-3)',                                              points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '4', label: 'Q5 Being so restless that it is hard to sit still (0-3)',                points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '5', label: 'Q6 Becoming easily annoyed or irritable (0-3)',                          points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '6', label: 'Q7 Feeling afraid as if something awful might happen (0-3)',             points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                            ],
                            bands: [
                              { range: [0, 4],   label: 'minimal anxiety' },
                              { range: [5, 9],   label: 'mild anxiety' },
                              { range: [10, 14], label: 'moderate anxiety' },
                              { range: [15, 21], label: 'severe anxiety' },
                            ],
                            population: 'Derivation: 2740 adult primary-care patients across 15 sites (Spitzer 2006). Reference standard: structured psychiatric interview (MINI). The 5/10/15 boundaries are the validated cutoffs from the derivation cohort.',
                            units: {
                              '0': 'integer 0-3', '1': 'integer 0-3', '2': 'integer 0-3',
                              '3': 'integer 0-3', '4': 'integer 0-3', '5': 'integer 0-3',
                              '6': 'integer 0-3',
                            },
                            validity: 'Adults in primary-care settings. GAD-7 was developed as a screen for generalized anxiety disorder but performs reasonably for panic, social anxiety, and PTSD as well (sensitivity drops for the non-GAD anxiety disorders). The cutoff of ≥10 is the standard treatment-threshold cutoff. NOT designed as a stand-alone diagnostic test — a positive screen should prompt clinical interview.',
                            source: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. "A brief measure for assessing generalized anxiety disorder: the GAD-7." Arch Intern Med. 2006;166(10):1092-1097.',
                          } },
  auditc:               { citation: 'Bush K, et al. AUDIT-C. Arch Intern Med. 1998;158(16):1789-1795.',
                          derivation: {
                            formula: 'AUDIT-C = sum of 3 items, each 0-4 (range 0-12).\n  Q1: How often do you have a drink containing alcohol?\n    0 never / 1 monthly or less / 2 2-4×/month / 3 2-3×/week / 4 ≥4×/week\n  Q2: How many standard drinks on a typical drinking day?\n    0 1-2 / 1 3-4 / 2 5-6 / 3 7-9 / 4 ≥10\n  Q3: How often do you have ≥6 drinks on one occasion?\n    0 never / 1 less than monthly / 2 monthly / 3 weekly / 4 daily or almost daily',
                            components: [
                              { inputKey: '0', label: 'Q1 Frequency of alcohol use (0-4)',                       points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
                              { inputKey: '1', label: 'Q2 Typical drinks per drinking day (0-4)',                points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
                              { inputKey: '2', label: 'Q3 Frequency of >=6 drinks on one occasion (0-4)',        points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
                            ],
                            bands: [
                              { range: [0, 2],  label: 'negative (women); use cutoff 4 for men' },
                              { range: [3, 7],  label: 'positive: indicates risky drinking' },
                              { range: [8, 12], label: 'positive: high risk for alcohol use disorder' },
                            ],
                            population: 'Bush 1998: validation in 243 Veterans Affairs primary-care patients. Reference standard: structured AUDIT (10-item) interview. AUDIT-C has subsequently been validated in primary-care, ED, and obstetric settings.',
                            units: {
                              '0': 'integer 0-4 (frequency)',
                              '1': 'integer 0-4 (typical drinks)',
                              '2': 'integer 0-4 (heavy episodes)',
                            },
                            validity: 'Adults in primary-care settings. The published cutoff is sex-specific: ≥3 for women, ≥4 for men (Bush 1998). The Sophie tile surfaces both sex-appropriate cutoffs in the bands text rather than asking the user to provide sex (consistent with the screener form). NOT designed for adolescents (use CRAFFT) or for monitoring response to treatment (use AUDIT-10 or biomarkers).',
                            source: 'Bush K, Kivlahan DR, McDonell MB, Fihn SD, Bradley KA. "The AUDIT alcohol consumption questions (AUDIT-C): an effective brief screening test for problem drinking. Ambulatory Care Quality Improvement Project (ACQUIP). Alcohol Use Disorders Identification Test." Arch Intern Med. 1998;158(16):1789-1795.',
                          } },
  cage:                 { citation: 'Ewing JA. CAGE Questionnaire. JAMA. 1984;252(14):1905-1907.',
                          derivation: {
                            formula: 'CAGE = count of "yes" answers across 4 binary questions, range 0-4. Mnemonic CAGE: Cut down, Annoyed, Guilty, Eye-opener. Cutoff >=2 = positive screen for alcohol use disorder.',
                            components: [
                              { inputKey: '0', label: 'C — Have you ever felt the need to Cut down on your drinking?',                points: (v) => Math.max(0, Math.min(1, Number(v) || 0)) },
                              { inputKey: '1', label: 'A — Have people Annoyed you by criticizing your drinking?',                   points: (v) => Math.max(0, Math.min(1, Number(v) || 0)) },
                              { inputKey: '2', label: 'G — Have you ever felt Guilty about your drinking?',                          points: (v) => Math.max(0, Math.min(1, Number(v) || 0)) },
                              { inputKey: '3', label: 'E — Eye-opener: had a drink first thing in the morning?',                     points: (v) => Math.max(0, Math.min(1, Number(v) || 0)) },
                            ],
                            bands: [
                              { range: [0, 1], label: 'negative' },
                              { range: [2, 4], label: 'positive: clinically significant suspicion of alcohol use disorder' },
                            ],
                            population: 'Ewing 1984: derived from clinical experience with 130 alcoholic patients, refined and validated across multiple psychiatric / primary-care cohorts in the 1970s-80s. The CAGE is the most-cited brief alcohol-screening instrument in the literature.',
                            units: {
                              '0': 'boolean (Cut down)',
                              '1': 'boolean (Annoyed)',
                              '2': 'boolean (Guilty)',
                              '3': 'boolean (Eye-opener)',
                            },
                            validity: 'Adults. The cutoff of ≥2 yes responses is the published positive-screen threshold. CAGE is more specific than sensitive; AUDIT-C (a separate Sophie tile) detects risky drinking that CAGE misses. NOT designed for adolescents or pregnant women (use CRAFFT or T-ACE/TWEAK). The questions are framed *lifetime* — a positive CAGE in a patient who quit years ago still merits inquiry but does not mean active disease.',
                            source: 'Ewing JA. "Detecting alcoholism. The CAGE questionnaire." JAMA. 1984;252(14):1905-1907.',
                          } },
  epds:                 { citation: 'Cox JL, Holden JM, Sagovsky R. EPDS. Br J Psychiatry. 1987;150:782-786.',
                          derivation: {
                            formula: 'EPDS = sum of 10 items, each 0-3 (range 0-30). Items target depressive symptoms over the prior 7 days. Some items are reverse-scored on the original form; the screener form Sophie uses normalizes to 0=best / 3=worst across all 10 items.',
                            components: [
                              { inputKey: '0', label: 'Q1 Able to laugh and see the funny side (0-3)',          points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '1', label: 'Q2 Looked forward to things (0-3)',                     points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '2', label: 'Q3 Blamed myself unnecessarily (0-3)',                   points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '3', label: 'Q4 Anxious or worried for no good reason (0-3)',         points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '4', label: 'Q5 Scared or panicky for no very good reason (0-3)',     points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '5', label: 'Q6 Things have been getting on top of me (0-3)',          points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '6', label: 'Q7 So unhappy I have had difficulty sleeping (0-3)',      points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '7', label: 'Q8 Felt sad or miserable (0-3)',                          points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '8', label: 'Q9 So unhappy I have been crying (0-3)',                  points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: '9', label: 'Q10 Thought of harming myself has occurred to me (0-3)', points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                            ],
                            bands: [
                              { range: [0, 9],   label: 'low likelihood of depression' },
                              { range: [10, 12], label: 'possible depression — consider follow-up' },
                              { range: [13, 30], label: 'likely depression — clinical evaluation indicated' },
                            ],
                            population: 'Cox 1987: validation in 84 postnatal women in Edinburgh against psychiatric interview as reference standard. Subsequently validated extensively in pregnant and postpartum populations across languages and cultures. The Edinburgh Postnatal Depression Scale is the most widely-used perinatal depression screen.',
                            units: {
                              '0': 'integer 0-3', '1': 'integer 0-3', '2': 'integer 0-3',
                              '3': 'integer 0-3', '4': 'integer 0-3', '5': 'integer 0-3',
                              '6': 'integer 0-3', '7': 'integer 0-3', '8': 'integer 0-3',
                              '9': 'integer 0-3',
                            },
                            validity: 'Pregnant and postpartum women (postnatal up to 1 year). The published cutoff is ≥10 for "possible" depression and ≥13 for "likely" depression. **Item 10 (self-harm) is a critical-action flag regardless of the aggregate**: any non-zero response should trigger immediate suicide-risk evaluation (C-SSRS is a separate Sophie tile). Validated in fathers/partners but cutoffs differ (typically ≥10). NOT designed as a stand-alone diagnostic test.',
                            source: 'Cox JL, Holden JM, Sagovsky R. "Detection of postnatal depression. Development of the 10-item Edinburgh Postnatal Depression Scale." Br J Psychiatry. 1987;150:782-786.',
                          } },
  'mini-cog':           { citation: 'Borson S, et al. Mini-Cog. Int J Geriatr Psychiatry. 2000;15(11):1021-1027.',
                          example: { fields: { 'mc-w': '2', 'mc-clock': '1' },
                                     expected: 'Mini-Cog 4/5 - Negative for cognitive impairment screen.' },
                          derivation: {
                            formula: 'Mini-Cog = 3-word recall (0-3 points) + clock-draw test (0 or 2 points). Total 0-5.\n  Words recalled: count of 3 unrelated words recalled after the clock draw distractor (typical word lists: Apple/Penny/Table or similar). Each correctly recalled word = +1.\n  Clock-draw: clinician-judged normal (all numbers in correct positions; hands at 11:10 or similar specified time) = +2; abnormal = 0.\nCutoff <3 = positive screen for cognitive impairment.',
                            components: [
                              { inputKey: 'wordsRecalled', label: 'Words recalled (0-3)',                                            points: (v) => Math.max(0, Math.min(3, Number(v) || 0)) },
                              { inputKey: 'clockNormal',   label: 'Clock-draw test normal (0 abnormal / 2 normal)',                  points: 2 },
                            ],
                            bands: [
                              { range: [0, 2], label: 'positive screen — further cognitive evaluation indicated' },
                              { range: [3, 5], label: 'negative for cognitive impairment screen' },
                            ],
                            population: 'Borson 2000: derivation in 249 community-dwelling older adults at risk for cognitive impairment. Validation studies have placed Mini-Cog at sensitivity ~76% and specificity ~89% for dementia at the cutoff <3.',
                            units: {
                              wordsRecalled: 'integer 0-3 (count of 3 unrelated words recalled after a brief distractor)',
                              clockNormal: 'boolean (clinician-judged normal clock-draw test)',
                            },
                            validity: 'Older adults in primary-care and ED settings. The Mini-Cog is a brief (~3 minutes) screen designed to be administered in any clinical setting; it is more concise than the MMSE/MoCA but less detailed. NOT designed to track severity over time (use MMSE/MoCA for that). Word-recall scoring requires the clinician to use a consistent 3-word list across patients. Clock-draw scoring is binary (normal vs abnormal) per Borson 2000; more elaborate clock-scoring systems (Sunderland, Shulman) are not part of Mini-Cog.',
                            source: 'Borson S, Scanlan J, Brush M, Vitaliano P, Dokmak A. "The Mini-Cog: a cognitive \'vital signs\' measure for dementia screening in multi-lingual elderly." Int J Geriatr Psychiatry. 2000;15(11):1021-1027.',
                          } },

  // ---- Group G: v4 extensions waves 5-6 (utilities 157-160) ----
  ciwa:    { citation: 'Sullivan JT, et al. Assessment of alcohol withdrawal: the revised CIWA-Ar. Br J Addict. 1989;84(11):1353-1357.',
             example: { fields: { 'cw-nau': '2', 'cw-tre': '2', 'cw-swt': '2', 'cw-anx': '2', 'cw-agi': '1', 'cw-tac': '0', 'cw-aud': '0', 'cw-vis': '0', 'cw-hea': '1', 'cw-ori': '0' },
                        expected: 'CIWA-Ar 10 (moderate withdrawal, 8-15 band; symptom-triggered protocol typically considers active treatment).' },
             interpretation: {
               bands: [
                 { range: '0-9',   text: 'Minimal-to-mild alcohol withdrawal per source.' },
                 { range: '10-15', text: 'Moderate alcohol withdrawal per source.' },
                 { range: '16-19', text: 'Moderate-to-severe alcohol withdrawal per source.' },
                 { range: '>=20',  text: 'Severe alcohol withdrawal per source.' },
               ],
               sourceQuoted: true,
               sourceCitation: 'Sullivan JT, et al. Br J Addict. 1989;84(11):1353-1357; severity bands per Mayo-Smith MF. JAMA. 1997;278(2):144-151 expert consensus on symptom-triggered therapy.',
             },
             derivation: {
               formula: 'CIWA-Ar = sum of 10 nurse-rated items (Sullivan 1989 Appendix). Range 0-67.\n  9 items each 0-7:\n    - Nausea/vomiting\n    - Tremor\n    - Paroxysmal sweats\n    - Anxiety\n    - Agitation\n    - Tactile disturbances\n    - Auditory disturbances\n    - Visual disturbances\n    - Headache / fullness in head\n  1 item 0-4:\n    - Orientation / clouding of sensorium',
               components: [
                 { inputKey: 'nausea',      label: 'Nausea/vomiting (0-7)',                points: (v) => Math.max(0, Math.min(7, Number(v) || 0)) },
                 { inputKey: 'tremor',      label: 'Tremor (0-7)',                          points: (v) => Math.max(0, Math.min(7, Number(v) || 0)) },
                 { inputKey: 'sweats',      label: 'Paroxysmal sweats (0-7)',               points: (v) => Math.max(0, Math.min(7, Number(v) || 0)) },
                 { inputKey: 'anxiety',     label: 'Anxiety (0-7)',                         points: (v) => Math.max(0, Math.min(7, Number(v) || 0)) },
                 { inputKey: 'agitation',   label: 'Agitation (0-7)',                       points: (v) => Math.max(0, Math.min(7, Number(v) || 0)) },
                 { inputKey: 'tactile',     label: 'Tactile disturbances (0-7)',            points: (v) => Math.max(0, Math.min(7, Number(v) || 0)) },
                 { inputKey: 'auditory',    label: 'Auditory disturbances (0-7)',           points: (v) => Math.max(0, Math.min(7, Number(v) || 0)) },
                 { inputKey: 'visual',      label: 'Visual disturbances (0-7)',             points: (v) => Math.max(0, Math.min(7, Number(v) || 0)) },
                 { inputKey: 'headache',    label: 'Headache / fullness in head (0-7)',     points: (v) => Math.max(0, Math.min(7, Number(v) || 0)) },
                 { inputKey: 'orientation', label: 'Orientation / clouding of sensorium (0-4)', points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
               ],
               bands: [
                 { range: [0, 7],                  label: 'mild withdrawal (<8); supportive care typically sufficient' },
                 { range: [8, 15],                 label: 'moderate withdrawal (8-15); symptom-triggered protocol typically initiates treatment' },
                 { range: [16, 20],                label: 'severe withdrawal (16-20)' },
                 { range: { op: '>=', value: 21 }, label: 'very severe (>20); high risk of seizure / DTs' },
               ],
               population: 'Derived from inpatient and outpatient alcohol withdrawal cohorts at the Addiction Research Foundation, Toronto (Sullivan 1989). Validated extensively in subsequent symptom-triggered-therapy studies (Saitz 1994, Mayo-Smith 1997).',
               units: {
                 nausea: 'integer 0-7', tremor: 'integer 0-7', sweats: 'integer 0-7',
                 anxiety: 'integer 0-7', agitation: 'integer 0-7',
                 tactile: 'integer 0-7', auditory: 'integer 0-7', visual: 'integer 0-7',
                 headache: 'integer 0-7', orientation: 'integer 0-4',
               },
               validity: 'Adult patients with confirmed or strongly suspected alcohol withdrawal. The scale requires a verbal patient who can describe symptoms (tactile/auditory/visual disturbances, headache, anxiety) — its validity drops sharply in intubated, sedated, delirious, or aphasic patients. RASS / CAM-ICU are better-suited in those populations. The 8-point treatment threshold is an INSTITUTIONAL convention (Mayo-Smith 1997 expert consensus); the original Sullivan 1989 paper did not specify a treatment cutoff.',
               source: 'Sullivan JT, Sykora K, Schneiderman J, Naranjo CA, Sellers EM. "Assessment of alcohol withdrawal: the revised Clinical Institute Withdrawal Assessment for Alcohol scale (CIWA-Ar)." Br J Addict. 1989;84(11):1353-1357.',
             } },
  cows:    { citation: 'Wesson DR, Ling W. The Clinical Opiate Withdrawal Scale (COWS). J Psychoactive Drugs. 2003;35(2):253-259.',
             example: { fields: { 'co-pul': '1', 'co-swt': '2', 'co-rest': '1', 'co-pup': '1', 'co-jt': '2', 'co-rn': '2', 'co-gi': '2', 'co-tre': '1', 'co-yaw': '1', 'co-anx': '2', 'co-goose': '0' },
                        expected: 'COWS 15 (moderate withdrawal).' },
             interpretation: {
               bands: [
                 { range: '5-12',  text: 'Mild opioid withdrawal per source.' },
                 { range: '13-24', text: 'Moderate opioid withdrawal per source.' },
                 { range: '25-36', text: 'Moderately severe opioid withdrawal per source.' },
                 { range: '>=37',  text: 'Severe opioid withdrawal per source.' },
               ],
               sourceQuoted: true,
               sourceCitation: 'Wesson DR, Ling W. J Psychoactive Drugs. 2003;35(2):253-259, scoring key on COWS form.',
             },
             derivation: {
               formula: 'COWS = sum of 11 items rated against the clinician-administered Wesson & Ling 2003 COWS form. Each item has its own anchor set (not all 0-N integer):\n  - Resting pulse: 0 (<=80) / 1 (81-100) / 2 (101-120) / 4 (>120)\n  - Sweating: 0-4 (none / chills not subjective / flushed / beads on brow / streaming sweat)\n  - Restlessness: 0 / 1 / 3 / 5\n  - Pupil size: 0 / 1 / 2 / 5\n  - Bone/joint aches: 0 / 1 / 2 / 4\n  - Runny nose / tearing: 0-4\n  - GI upset: 0 / 1 / 2 / 3 / 5\n  - Tremor: 0-4\n  - Yawning: 0-4\n  - Anxiety / irritability: 0 / 1 / 2 / 4\n  - Gooseflesh skin: 0 / 3 / 5\nThe Sophie tile accepts the pre-rated 0-N value per item and sums them.',
               components: [
                 { inputKey: 'pulse',       label: 'Resting pulse (0 / 1 / 2 / 4)',         points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'sweating',    label: 'Sweating (0-4)',                         points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'restlessness',label: 'Restlessness (0 / 1 / 3 / 5)',           points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'pupil',       label: 'Pupil size (0 / 1 / 2 / 5)',             points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'jointAches',  label: 'Bone / joint aches (0 / 1 / 2 / 4)',     points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'runnyNose',   label: 'Runny nose / tearing (0-4)',             points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'gi',          label: 'GI upset (0 / 1 / 2 / 3 / 5)',           points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'tremor',      label: 'Tremor (0-4)',                            points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'yawning',     label: 'Yawning (0-4)',                           points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'anxiety',     label: 'Anxiety / irritability (0 / 1 / 2 / 4)', points: (v) => Math.max(0, Number(v) || 0) },
                 { inputKey: 'gooseflesh',  label: 'Gooseflesh skin (0 / 3 / 5)',            points: (v) => Math.max(0, Number(v) || 0) },
               ],
               bands: [
                 { range: [0, 4],                  label: 'no active withdrawal' },
                 { range: [5, 12],                 label: 'mild withdrawal' },
                 { range: [13, 24],                label: 'moderate withdrawal' },
                 { range: [25, 36],                label: 'moderately severe withdrawal' },
                 { range: { op: '>=', value: 37 }, label: 'severe withdrawal' },
               ],
               population: 'Wesson & Ling 2003 introduces COWS as a 1-page clinician-administered scale derived from prior opioid-withdrawal instruments (Himmelsbach, OOWS, SOWS). Validated subsequently for buprenorphine induction protocols.',
               units: {
                 pulse: 'pre-rated 0-4 per pulse band',
                 sweating: 'pre-rated 0-4',
                 restlessness: 'pre-rated 0-5',
                 pupil: 'pre-rated 0-5',
                 jointAches: 'pre-rated 0-4',
                 runnyNose: 'pre-rated 0-4',
                 gi: 'pre-rated 0-5',
                 tremor: 'pre-rated 0-4',
                 yawning: 'pre-rated 0-4',
                 anxiety: 'pre-rated 0-4',
                 gooseflesh: 'pre-rated 0-5',
               },
               validity: 'Adult patients with confirmed or suspected opioid withdrawal. The COWS is the standard instrument for guiding buprenorphine induction timing (most protocols start at COWS >=8 or >=12 to minimize precipitated withdrawal). Each item has clinician-anchored levels — values BETWEEN the anchor points are not part of the published score (e.g., for "restlessness," 2 and 4 are not defined; the rater picks 0, 1, 3, or 5).',
               source: 'Wesson DR, Ling W. "The Clinical Opiate Withdrawal Scale (COWS)." J Psychoactive Drugs. 2003;35(2):253-259.',
             } },
  ascvd:   { citation: 'Goff DC Jr, et al. 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk: Pooled Cohort Equations. Circulation. 2014;129(25 Suppl 2):S49-73. PCE retains race-stratified equations (white vs African-American).',
             example: { fields: { 'as-age': '55', 'as-tc': '213', 'as-hdl': '50', 'as-sbp': '120', 'as-sex': 'M', 'as-race': 'white' },
                        expected: 'ASCVD PCE ~5-7% 10-year risk (borderline to low risk; race/treated/smoke/dm modifiers shift the band).' } },
  prevent: { citation: 'Khan SS, et al. Development and Validation of the AHA PREVENT Equations. Circulation. 2024;149(6):430-449. PREVENT is race-FREE; differs from PCE on this point. Base 10-yr total CVD equation only (no statin / antihypertensive use, UACR, HbA1c, or SDI terms).',
             example: { fields: { 'pv-age': '55', 'pv-tc': '200', 'pv-hdl': '50', 'pv-sbp': '120', 'pv-bmi': '25', 'pv-egfr': '90', 'pv-sex': 'M' },
                        expected: 'PREVENT 10-year total CVD risk lands in the borderline / low band for a healthy 55-year-old.' } },

  // ---- Group H: Workflow ----
  prep:         { citation: 'Question scaffolds are derived from AHRQ "Questions to Ask Your Doctor" patient-engagement guides (Agency for Healthcare Research and Quality; ahrq.gov/questions).',
                  example: { fields: { visit: 'annual physical', topic: 'cholesterol' },
                             expected: 'Click "Generate questions" to render an AHRQ-derived list for the annual physical with cholesterol-related prompts.' } },
  'prior-auth': { citation: 'Field set follows the CMS Prior Authorization rule (CMS-0057-F, 89 FR 8758) and the AMA model prior-authorization request data fields. Generic checklist; payer-specific forms supersede.',
                  example: { fields: { proc: 'imaging-mri-msk' },
                             expected: 'Click "Generate checklist" to render the MRI musculoskeletal prior-authorization document set.' } },

  // ---- Group H: v4 extensions (utilities 161-165) ----
  'hipaa-auth':      { citation: 'HIPAA Privacy Rule, 45 CFR 164.508. Required-element template; covered entities may add their own elements.',
                       example: { fields: { 'ha-pt': 'Jane Doe', 'ha-plan': 'Acme Health Plan', 'ha-info': 'medical records 2024-2025', 'ha-rcpt': 'New Provider Internal Medicine', 'ha-purpose': 'continuity of care', 'ha-exp': '2027-05-15' },
                                  expected: 'Click "Build printable authorization" for a 45 CFR 164.508 letter listing patient, plan, info, recipient, purpose, and expiration.' } },
  roi:               { citation: 'Patient-authorized release of records. Many providers require their own ROI form; this template can be attached or used as the basis.',
                       example: { fields: { 'roi-pt': 'Jane Doe', 'roi-dob': '1985-03-12', 'roi-from': 'Acme Internal Medicine', 'roi-to': 'New Provider Internal Medicine', 'roi-dr': '2024-01-01 to 2025-01-01', 'roi-rec': 'office notes, labs, imaging', 'roi-del': 'secure email' },
                                  expected: 'Click "Build printable ROI request" to render a release-of-information letter.' } },
  'discharge-instr': { citation: 'Reference template only. Institutional discharge protocols and condition-specific guidelines govern the required content.',
                       example: { fields: { 'di-dx': 'Community-acquired pneumonia', 'di-fu': '2026-05-22 with PCP', 'di-rp': 'Fever > 102 F\nWorsening shortness of breath\nChest pain', 'di-meds': 'Amoxicillin 500 mg PO TID x 7 days', 'di-notes': 'Rest, hydration, complete the antibiotic course.' },
                                  expected: 'Click "Build printable discharge instructions" to render a discharge sheet with diagnosis, follow-up, return precautions, meds, and notes.' } },
  'specialty-visit': { citation: 'Generic per-specialty question banks compiled by the project author. Tailor to the visit.',
                       example: { fields: { 'sv-spec': 'cardiology', 'sv-ctx': 'palpitations workup' },
                                  expected: 'Click "Build printable question list" to render a cardiology-visit prep sheet.' } },
  'wallet-card':     { citation: 'Patient-maintained medication / health summary. Not a substitute for a pharmacist-reviewed list.',
                       example: { fields: { 'wc-name': 'Jane Doe', 'wc-ec': 'John Doe 555-0100', 'wc-pp': 'Acme Internal Medicine 555-0199', 'wc-rx': 'Acme Pharmacy 555-0150', 'wc-allergies': 'Penicillin', 'wc-conditions': 'Hypertension\nType 2 diabetes', 'wc-meds': 'Lisinopril 10 mg daily\nMetformin 500 mg BID' },
                                  expected: 'Click "Build printable wallet card" to render a folded reference card with allergies, conditions, meds, and contacts.' } },

  // ---- Group I: Field Medicine ----
  'peds-weight-dose': { citation: 'FDA labeling and standard prehospital pediatric resuscitation literature. Reference only.',
                        source: { dataset: 'prehospital-meds', label: 'FDA prehospital drug labeling subset' },
                        example: { fields: { 'pwd-w': '10', 'pwd-r': 'epinephrine-iv-io' }, expected: 'Epinephrine 0.1 mg IV/IO' } },
  // adult-arrest-ref / peds-arrest-ref / defib removed in spec-v29
  // wave 29-2 (Group I): pure AHA ECC numeric reference cards.
  cincinnati:         { citation: 'Kothari RU, Pancioli A, Liu T, Brott T, Broderick J. Cincinnati Prehospital Stroke Scale: reproducibility and validity. Acad Emerg Med. 1997;4(9):986-990.',
                        example: { fields: { 'cps-face': '1', 'cps-arm': '0', 'cps-speech': '0' }, expected: 'POSITIVE (1 of 3)' } },
  fast:               { citation: 'Kleindorfer DO, et al. Designing a message for public stroke education using the FAST mnemonic. Stroke. 2007;38(10):2864-2868. BE-FAST: Aroor S, Singh R, Goldstein LB. BE-FAST: reducing the proportion of strokes missed using the FAST mnemonic. Stroke. 2017;48(2):479-481.',
                        example: { fields: { 'fast-face': '1' }, expected: 'FAST: POSITIVE' } },

  'field-triage':     { citation: 'CDC. Guidelines for Field Triage of Injured Patients. MMWR Recommendations and Reports. Current edition.',
                        source: { dataset: 'field-triage', label: 'CDC Field Triage Guidelines' },
                        example: { fields: { 'ft-gcs-le-13': '1' }, expected: 'Highest-level trauma center (Step 1).' } },
  'start-triage':     { citation: 'Super G, et al. START: Simple Triage and Rapid Treatment. Newport Beach Fire Department / Hoag Hospital, 1983. Public-domain MCI triage protocol.',
                        source: { dataset: 'mci-triage', label: 'START / JumpSTART algorithm reference' },
                        example: { fields: { 'st-walk': '1' }, expected: 'Minor (green): patient can walk.' } },
  'jumpstart-triage': { citation: 'Romig LE. JumpSTART pediatric MCI triage tool. CHOC Children\'s Hospital. Public-domain pediatric variant of START.',
                        source: { dataset: 'mci-triage', label: 'START / JumpSTART algorithm reference' },
                        example: { fields: { 'js-walk': '1' }, expected: 'Minor (green): child can walk.' } },
  bsa_burn:           { citation: 'Lund CC, Browder NC. The estimation of areas of burns. Surg Gynecol Obstet. 1944;79:352-358. Rule of Nines: standard adult body-region distribution.',
                        example: { fields: { 'bb-method': 'nines', 'bb-n-trunk-anterior': '1' }, expected: 'TBSA 18% (anterior trunk only).' } },
  'burn-fluid':       { citation: 'Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci. 1968;150(3):874-894 (Parkland). Reiss E, et al. Modified Brooke formula.',
                        example: { fields: { 'bf-w': '70', 'bf-bsa': '20', 'bf-h': '0' }, expected: 'Parkland 5600 mL/24h (2800 mL first 8h); Brooke 2800 mL/24h.' } },
  // hypothermia / heat-illness / toxidromes removed in spec-v29 wave
  // 29-2 (Group I): pure staging / syndrome reference tables.
  'peds-ett':         { citation: 'Cuffed: age/4 + 3.5 mm. Uncuffed: age/4 + 4 mm. Depth at the lip = 3 x tube size in cm. Standard pediatric airway formulas; verify against bedside assessment.',
                        example: { fields: { 'pet-age': '4', 'pet-cuffed': 'uncuffed' }, expected: 'Tube 5.0 mm uncuffed, depth 15 cm.' } },
  naloxone:           { citation: 'Naloxone HCl FDA labeling. CDC opioid overdose guidance. Repeat q2-3 min until adequate respirations.',
                        source: { dataset: 'prehospital-meds', label: 'FDA prehospital drug labeling subset' },
                        example: { fields: { 'nx-pop': 'adult', 'nx-route': 'in' }, expected: 'Initial: 4 mg intranasal (1 spray each nostril).' } },
  'ems-doc':          { citation: 'Templated workflow tool. Specific agency documentation requirements govern.',
                        example: { fields: { 'ed-rt': 'cardiac-arrest' },
                                   expected: 'Click "Generate checklist" to render the cardiac-arrest run-type documentation prompts.' } },

  // ---- Group I: v4 extensions (utilities 166-171) ----
  'nexus-cspine':   { citation: 'Hoffman JR, et al. NEXUS criteria. NEJM. 2000;343(2):94-99. Stiell IG, et al. Canadian C-Spine Rule. JAMA. 2001;286(15):1841-1848.',
                      example: { fields: { 'nx-tender': '1', 'nx-intox': '1', 'nx-alert': '1', 'nx-focal': '1', 'nx-distract': '1' },
                                 expected: 'All five low-risk criteria met -> NEXUS: cervical spine imaging NOT required.' } },
  // dot-erg / niosh-pg / cpr-numeric / tccc removed in spec-v29 wave
  // 29-2 (Group I): pure hazmat / chemical-hazard / numeric-wallet
  // reference cards.
  'co-cn-antidote': { citation: 'FDA labeling: Cyanokit (hydroxocobalamin) and Nithiodote (sodium nitrite + sodium thiosulfate). UHMS guidance for HBO indications.' },

  // ---- Group J (NEW): Public Health & Travel (utilities 172-180) ----
  tetanus:          { source: { dataset: 'tetanus', label: 'CDC tetanus prophylaxis decision aid' },
                      citation: 'CDC tetanus prophylaxis recommendations (current edition).' },
  'rabies-pep':     { source: { dataset: 'rabies-pep', label: 'CDC rabies post-exposure prophylaxis decision aid' },
                      citation: 'CDC ACIP rabies PEP recommendations (current edition).' },
  'bbp-exposure':   { source: { dataset: 'bbp-exposure', label: 'CDC HIV/HBV/HCV bloodborne pathogen exposure recommendations' },
                      citation: 'CDC USPHS guidance for occupational and non-occupational HIV PEP; HBV/HCV exposure management.' },
  'tb-testing':     { source: { dataset: 'tb-tst-igra', label: 'CDC TB testing interpretation' },
                      citation: 'CDC TST cutoffs (5 / 10 / 15 mm) by risk category; IGRA interpretation.',
                      example: { fields: { 'tb-mm': '12', 'tb-risk': '10' },
                                 expected: 'TST: 12 mm vs cutoff 10 mm -> POSITIVE.' } },
  'sti-screening':  { source: { dataset: 'sti-screening', label: 'CDC STI Screening Recommendations' },
                      citation: 'CDC Sexually Transmitted Infections Treatment Guidelines, 2021 (MMWR Recomm Rep 2021;70(4):1-187) and current CDC screening recommendations by population.' },

  // ---- Group K: Lab Reference (removed in spec-v29 wave 29-2) ----
  // lab-adult, lab-peds, tdm-levels, tox-levels are pure reference-range
  // tables. lab-interpret in Group V6 still consumes these thresholds
  // internally; the data shards are no longer bundled as exposed tiles.

  // ---- Group L: Forms & Numbers Literacy (removed in spec-v29 wave 29-2) ----
  // cms1500, ub04, eob-glossary are pure form / glossary references.

  // ---- Group M (NEW): Eligibility & Benefits (utilities 188-191) ----

  // ---- Group N (NEW): Literacy Helpers (utilities 192-194) ----
  'unit-converter-v4': { citation: 'Standard SI <-> conventional conversion factors. NIH/NLM and IFCC references for HbA1c.',
                         example: { fields: { 'uc-cat': 'glucose', 'uc-v1': '90' }, expected: '90 mg/dL = 5.0 mmol/L' } },
  'time-to-dose':      { citation: 'Plain time math. Frequency abbreviations per standard pharmacy nomenclature.',
                         example: { fields: { 'td-time': '14:00', 'td-freq': 'q6h' },
                                    expected: 'Next four doses at 20:00, 02:00, 08:00, 14:00.' } },
  'peds-weight-conv':  { citation: '1 lb = 0.453592 kg. Reference newborn / infant weight bands per AAP.',
                         example: { fields: { 'pw-lb': '7', 'pw-oz': '5', 'pw-kg': '3.5' },
                                    expected: '7 lb 5 oz ~ 3.317 kg; 3.5 kg ~ 7 lb 11.5 oz.' } },

  // ---- Group O: Patient Safety (removed in spec-v29 wave 29-2) ----
  // high-alert-card was a pure ISMP wallet-card infographic.

  // ---- spec-v5 §4: deterministic additions for the floor (T1-T17) ----
  'sodium-correction':  { citation: 'Adrogue HJ, Madias NE. Hyponatremia. NEJM 2000;342:1493-1499.',
                          example: { fields: { w: '70', sex: 'M', na: '110', infusate: '3pct-saline', tgt: '8' },
                                     expected: 'About 0.85 L of 3% saline over 24 h to raise Na by 8 mEq/L.' } },
  'free-water-deficit': { citation: 'Adrogue HJ, Madias NE. Hypernatremia. NEJM 2000;342:1493-1499.',
                          example: { fields: { w: '70', sex: 'M', na: '160', tgt: '145', hrs: '48' },
                                     expected: 'Free water deficit ~4.3 L; replace over 48 h.' } },
  'iron-ganzoni':       { citation: 'Ganzoni AM. Schweiz Med Wochenschr 1970;100:301-303.',
                          example: { fields: { w: '70', hb: '9', tgt: '15' },
                                     expected: 'Total iron deficit 1508 mg (1008 mg + 500 mg stores).' } },
  'pbw-ardsnet':        { citation: 'ARDSNet. Lower tidal volumes for ARDS. NEJM 2000;342:1301-1308. PBW per Devine 1974.',
                          example: { fields: { h: '175', sex: 'M', mlkg: '6' },
                                     expected: 'PBW ~70.5 kg, target Vt ~423 mL.' } },
  'rsbi':               { citation: 'Yang KL, Tobin MJ. RSBI. NEJM 1991;324:1445-1450.',
                          example: { fields: { rr: '24', vt: '350' },
                                     expected: 'RSBI 68.6 - likely to tolerate weaning (< 105).' } },
  'lights':             { citation: 'Light RW. Pleural effusion criteria. Ann Intern Med 1972;77:507-513.',
                          example: { fields: { pp: '4.0', sp: '6.0', pl: '250', sl: '200', uln: '222' },
                                     expected: 'Exudate (protein ratio 0.67 > 0.5).' } },
  'mentzer':            { citation: 'Mentzer WC. Lancet 1973;1:882.',
                          example: { fields: { mcv: '65', rbc: '6.0' },
                                     expected: 'Index ~10.8 - favors beta-thalassemia trait.' } },
  'saag':               { citation: 'Runyon BA. Hepatology 1992;16:240-245.',
                          example: { fields: { sa: '3.5', aa: '1.5' },
                                     expected: 'SAAG 2.0 g/dL - portal hypertension.' } },
  'r-factor':           { citation: 'Benichou C. CIOMS classification. J Hepatol 1990;11:272-276.',
                          example: { fields: { alt: '500', altu: '40', alp: '100', alpu: '120' },
                                     expected: 'Hepatocellular pattern (R = 15).' } },
  'kdigo-aki':          { citation: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012;2:1-138.',
                          example: { fields: { base: '1.0', cur: '3.5' },
                                     expected: 'KDIGO AKI Stage 3 (3.5x baseline).' } },
  'sgarbossa':          { citation: 'Smith SW et al. Modified Sgarbossa criteria. Ann Emerg Med 2012;60:766-776.',
                          example: { fields: { a: '1' }, expected: 'Positive (concordant ST elevation >=1 mm in at least one lead).' } },
  'rcri': {
    citation: 'Lee TH, Marcantonio ER, Mangione CM, et al. Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery. Circulation. 1999;100(10):1043-1049.',
    specialties: ['anesthesiology', 'cardiology', 'internal-medicine', 'nursing-general', 'surgery-general'],
    example: {
      fields: { highRiskSurgery: '1', ischemicHeartDisease: '1' },
      expected: 'RCRI 2 factors -> ~6.6% major cardiac event risk (Class III per Lee 1999).',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Class I (very low) — ~0.4% major cardiac event risk per Lee 1999.' },
        { range: '1', text: 'Class II (low) — ~0.9% major cardiac event risk per Lee 1999.' },
        { range: '2', text: 'Class III (moderate) — ~6.6% major cardiac event risk per Lee 1999.' },
        { range: '>=3', text: 'Class IV (high) — >=11% major cardiac event risk per Lee 1999.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Lee TH, et al. Circulation. 1999;100(10):1043-1049, Table 3.',
    },
    derivation: {
      formula: 'RCRI = count of 6 yes/no risk factors (each 0 or 1), range 0-6.\n  1. High-risk surgery (suprainguinal vascular, intraperitoneal, or intrathoracic)\n  2. History of ischemic heart disease\n  3. History of congestive heart failure\n  4. History of cerebrovascular disease (TIA or CVA)\n  5. Insulin-dependent diabetes mellitus\n  6. Preoperative serum creatinine > 2.0 mg/dL\nMajor adverse cardiac event risk by class per Lee 1999 Table 3: Class I (0 factors) 0.4%, Class II (1) 0.9%, Class III (2) 6.6%, Class IV (>=3) >=11%.',
      components: [
        { inputKey: 'highRiskSurgery',        label: 'High-risk surgery (suprainguinal vascular, intraperitoneal, intrathoracic)', points: 1 },
        { inputKey: 'ischemicHeartDisease',   label: 'History of ischemic heart disease',                  points: 1 },
        { inputKey: 'congestiveHeartFailure', label: 'History of congestive heart failure',                points: 1 },
        { inputKey: 'cerebrovascularDisease', label: 'History of cerebrovascular disease (TIA or CVA)',    points: 1 },
        { inputKey: 'insulinDependentDm',     label: 'Insulin-dependent diabetes mellitus',                 points: 1 },
        { inputKey: 'creatinineOver2',        label: 'Preoperative serum creatinine > 2.0 mg/dL',           points: 1 },
      ],
      bands: [
        { range: [0, 0],                 label: 'Class I (very low) — ~0.4% major cardiac event risk' },
        { range: [1, 1],                 label: 'Class II (low) — ~0.9% major cardiac event risk' },
        { range: [2, 2],                 label: 'Class III (moderate) — ~6.6% major cardiac event risk' },
        { range: { op: '>=', value: 3 }, label: 'Class IV (high) — >=11% major cardiac event risk' },
      ],
      population: 'Lee 1999: derivation in 2893 adults >=50 years undergoing elective major noncardiac surgery at a single Boston tertiary center; prospective validation in a separate 1422-patient cohort. Outcome: composite major cardiac event (MI, pulmonary edema, ventricular fibrillation, cardiac arrest, complete heart block) within the hospitalization.',
      units: {
        highRiskSurgery: 'boolean', ischemicHeartDisease: 'boolean',
        congestiveHeartFailure: 'boolean', cerebrovascularDisease: 'boolean',
        insulinDependentDm: 'boolean', creatinineOver2: 'boolean',
      },
      validity: 'Adults >=50 years undergoing elective major noncardiac surgery. RCRI is the most-studied preoperative cardiac risk index but underestimates risk in vascular surgery cohorts; the NSQIP MICA and ACS-NSQIP universal calculators outperform RCRI in modern external validation, particularly for non-cardiac vascular procedures. RCRI does not include functional capacity, frailty, or biomarkers (BNP, troponin); current ACC/AHA preoperative guidance treats RCRI as one input among several. Not validated for emergency surgery.',
      source: 'Lee TH, Marcantonio ER, Mangione CM, Thomas EJ, Polanczyk CA, Cook EF, Sugarbaker DJ, Donaldson MC, Poss R, Ho KK, Ludwig LE, Pedan A, Goldman L. "Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery." Circulation. 1999;100(10):1043-1049.',
    },
  },
  'pews': {
    citation: 'Monaghan A. Detecting and managing deterioration in children. Paediatr Nurs 2005;17:32-35.',
    example: { fields: { Behavior: '2', Cardiovascular: '2', Respiratory: '1' },
               expected: 'Total 5 - Escalate: bedside provider review.' },
    derivation: {
      formula: 'PEWS = sum across 3 subscales each scored 0-3, range 0-9 (Brighton variant; Monaghan 2005).\n  Behavior          (0-3): playing/appropriate (0) | sleeping (1) | irritable (2) | lethargic/confused/reduced response (3)\n  Cardiovascular    (0-3): pink or CR 1-2 s (0) | pale or CR 3 s (1) | grey or CR 4 s, HR up 20 (2) | grey/mottled/CR >=5 s, HR up 30 / bradycardia (3)\n  Respiratory       (0-3): WNL, no retractions (0) | >10 above normal, accessory use, 30% FiO2 or 3 L/min (1) | >20 above normal, retractions, 40% FiO2 or 6 L/min (2) | >=5 below normal, sternal retractions, grunting, 50% FiO2 or 8+ L/min (3)\nMonaghan 2005 escalation: 0-2 routine; 3 q1h obs + bedside review; 4 q30m obs + medical review; >=5 urgent senior review.',
      components: [
        { inputKey: 'behaviorScore',       label: 'Behavior subscale (0-3)',       points: (v) => Math.max(0, Math.min(3, Math.round(Number(v) || 0))) },
        { inputKey: 'cardiovascularScore', label: 'Cardiovascular subscale (0-3)', points: (v) => Math.max(0, Math.min(3, Math.round(Number(v) || 0))) },
        { inputKey: 'respiratoryScore',    label: 'Respiratory subscale (0-3)',    points: (v) => Math.max(0, Math.min(3, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: [0, 2],                 label: 'routine monitoring' },
        { range: [3, 3],                 label: 'q1h observations and bedside provider review' },
        { range: [4, 4],                 label: 'q30m observations and medical review' },
        { range: { op: '>=', value: 5 }, label: 'urgent senior review (escalate)' },
      ],
      population: 'Monaghan 2005 (Brighton PEWS): operational tool developed at the Brighton & Sussex University Hospitals NHS Trust for inpatient pediatric ward monitoring; subsequent multi-site validations (Akre 2010, Parshuram 2009 with the separate Bedside PEWS variant) explored the score\'s ability to detect deterioration before ICU transfer or cardiopulmonary arrest. The Brighton variant is the most widely deployed bedside form in UK and Canadian pediatric inpatient settings.',
      units: {
        behaviorScore: 'integer 0-3 (clamped)',
        cardiovascularScore: 'integer 0-3 (clamped)',
        respiratoryScore: 'integer 0-3 (clamped)',
      },
      validity: 'Pediatric inpatients in general-ward settings. PEWS is an operational triage tool, not a statistically-derived risk score: cutoffs are escalation triggers rather than mortality predictors. The Brighton variant is one of many PEWS family tools — Bedside PEWS (Parshuram 2009) uses 7 parameters; institution-specific PEWS variants are common. Sophie ships the original Brighton 3-subscale Monaghan 2005 form. Not validated for neonatal patients (use NEWS-newborn / nEWS variants), pediatric ICU patients (use full ICU illness-severity scores), or for emergency-department triage (use specialty pediatric triage tools).',
      source: 'Monaghan A. "Detecting and managing deterioration in children." Paediatr Nurs. 2005;17(1):32-35.',
    },
  },
  'em-time':            { citation: 'AMA CPT 2021 office/outpatient E/M time bands. Code descriptors are AMA-owned and not bundled.',
                          example: { fields: { enc: 'new', t: '45' }, expected: 'Code 99204 (45 min, new patient; AMA 2021 bands).' } },
  'ndc-convert':        { citation: 'CMS NDC billing guidance (5-4-2 billing format) and FDA Structured Product Labeling.',
                          example: { fields: { n: '1234-5678-90' }, expected: 'Billing 11: 01234-5678-90 / FDA 10: 1234-5678-90.' } },
  'avpu-gcs':           { citation: 'McNarry AF, Goldhill DR. Comparison of AVPU and GCS. Anaesthesia 2004;59:34-37.',
                          example: { fields: { lvl: 'P' }, expected: 'P -> typical GCS 8 (range 7-9).' } },
  'sbar-template':      { citation: 'Institute for Healthcare Improvement (IHI) SBAR communication toolkit.',
                          example: { fields: { s: 'Mrs. Chen in 412B, post-op day 1, complaining of chest pressure.', b: '68F, CABG yesterday, hx HTN/DM, on aspirin / atorvastatin.', a: 'Vitals stable but new ST changes on telemetry; concerned for ischemia.', r: 'Request bedside evaluation, repeat ECG, troponin.' },
                                     expected: 'Pre-formatted SBAR ready to copy.' } },

  // ---- spec-v6 §1: HIPAA + corrected AG ----
  'corrected-anion-gap': {
    citation: 'Figge J, Jabor A, Kazda A, Fencl V. Anion gap and hypoalbuminemia. Crit Care Med 1998;26(11):1807-1810. AG correction = +2.5 mEq/L per 1 g/dL drop in albumin from 4.0.',
    example: { fields: { na: '140', cl: '106', hco3: '24', alb: '2.0' },
               expected: 'Measured AG 10 (looks normal); corrected AG 15 (elevated -- consider HAGMA workup).' },
  },
  'breach-clock': {
    citation: 'HIPAA Breach Notification Rule, 45 CFR §§164.404, 164.406, 164.408. Individual + media + HHS deadlines computed from the discovery date.',
    example: { fields: { d: '2026-03-15', n: '600' },
               expected: 'Discovery 2026-03-15, >=500 affected: individual + media + HHS notice all due 2026-05-14.' },
  },
  'abcd2': {
    citation: 'Johnston SC, Rothwell PM, Nguyen-Huynh MN, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet 2007;369(9558):283-292.',
    example: { fields: { age: '70', sbp: '150', dbp: '90', clin: 'weakness', dur: '90', diab: '1' },
               expected: 'ABCD2 7/7 - High risk (2-day stroke risk ~8.1%).' },
    interpretation: {
      bands: [
        { range: '0-3', text: 'Low risk; 2-day stroke risk 1.0% per source.' },
        { range: '4-5', text: 'Moderate risk; 2-day stroke risk 4.1% per source.' },
        { range: '6-7', text: 'High risk; 2-day stroke risk 8.1% per source.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Johnston SC, et al. Lancet 2007;369(9558):283-292, Table 3.',
    },
    derivation: {
      formula: 'ABCD2 = sum of points across 5 features, range 0-7.\n  A: Age >= 60                                                  (+1)\n  B: Systolic BP >= 140 OR diastolic BP >= 90 at first eval     (+1)\n  C: Clinical features  unilateral weakness                     (+2)\n                        speech disturbance without weakness     (+1)\n                        other                                    (0)\n  D: Duration           >= 60 min                                (+2)\n                        10-59 min                                (+1)\n                        < 10 min                                 (0)\n  D: Diabetes mellitus                                           (+1)\nBands per Johnston 2007 Table 3 (2-day stroke risk after TIA): 0-3 low (~1.0%), 4-5 moderate (~4.1%), 6-7 high (~8.1%).',
      components: [
        { inputKey: 'age',              label: 'A — Age >= 60 (+1)',                                   points: (v) => (Number(v) >= 60 ? 1 : 0) },
        { inputKey: 'sbp',              label: 'B — SBP >= 140 OR DBP >= 90 at first evaluation (+1)', points: (v, inputs) => ((Number(v) >= 140 || Number(inputs?.dbp) >= 90) ? 1 : 0) },
        { inputKey: 'clinicalFeatures', label: 'C — Clinical features (weakness +2 / speech +1 / other 0)', points: (v) => (v === 'weakness' ? 2 : v === 'speech' ? 1 : 0) },
        { inputKey: 'durationMinutes',  label: 'D — Symptom duration (>=60 min +2 / 10-59 min +1 / <10 min 0)', points: (v) => { const n = Number(v); if (n >= 60) return 2; if (n >= 10) return 1; return 0; } },
        { inputKey: 'diabetes',         label: 'D — Diabetes mellitus (+1)',                            points: 1 },
      ],
      bands: [
        { range: [0, 3], label: 'low 2-day stroke risk (~1.0%)' },
        { range: [4, 5], label: 'moderate 2-day stroke risk (~4.1%)' },
        { range: [6, 7], label: 'high 2-day stroke risk (~8.1%)' },
      ],
      population: 'Johnston 2007: pooled derivation/validation across four cohorts totaling 4809 patients with TIA — California ED cohort, Oxfordshire OXVASC cohort, plus two prospective TIA validation cohorts. Outcome: stroke within 2, 7, and 90 days of TIA.',
      units: {
        age: 'years', sbp: 'mmHg', dbp: 'mmHg',
        clinicalFeatures: 'enum: weakness / speech / other',
        durationMinutes: 'minutes (symptom duration)',
        diabetes: 'boolean',
      },
      validity: 'Adult patients presenting with TIA, scored at first medical evaluation. ABCD2 has been criticized in subsequent validation work for modest discrimination compared with imaging-augmented strategies (e.g., adding DWI MRI), and current AHA/ASA guidance favors urgent specialist evaluation regardless of ABCD2. The score is NOT intended to triage AWAY from workup; the low band still carries clinically meaningful stroke risk and warrants timely TIA evaluation per AHA/ASA. Not validated in pediatric stroke.',
      source: 'Johnston SC, Rothwell PM, Nguyen-Huynh MN, Giles MF, Elkins JS, Bernstein AL, Sidney S. "Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack." Lancet. 2007;369(9558):283-292.',
    },
  },

  // ---- spec-v12 §3.1 wave 12-1: early-warning bundle ----
  news2: {
    citation: 'Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS - Updated report of a working party. London: RCP, 2017.',
    specialties: ['nursing-general', 'emergency-medicine', 'critical-care', 'pulmonology'],
    example: {
      fields: { 'n2-rr': '14', 'n2-spo2': '98', 'n2-scale2': '0', 'n2-o2': '0', 'n2-sbp': '124', 'n2-pulse': '78', 'n2-acvpu': 'A', 'n2-temp': '37.0' },
      expected: 'NEWS2 0 - Low band (continue routine monitoring per RCP 2017 Table 2).',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Minimum 12-hourly monitoring; continue routine monitoring per RCP 2017 Table 2.' },
        { range: '1-4', text: 'Minimum 4-6-hourly monitoring; registered nurse assesses whether escalation is required per RCP 2017 Table 2.' },
        { range: 'single parameter scoring 3', text: 'Minimum 1-hourly monitoring; urgent review by clinician with competencies in acute illness per RCP 2017 Table 2.' },
        { range: '>=5', text: 'Minimum 1-hourly monitoring; urgent review and consider continuous monitoring and critical-care review per RCP 2017 Table 2.' },
        { range: '>=7', text: 'Continuous monitoring; emergency assessment by critical-care team; usually transfer to higher-acuity area per RCP 2017 Table 2.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Royal College of Physicians. NEWS2. London: RCP, 2017, Table 2.',
    },
    derivation: {
      formula: 'NEWS2 = sum of per-parameter scores from RCP 2017 Table 1.\n  Respiratory rate (/min): <=8 → 3; 9-11 → 1; 12-20 → 0; 21-24 → 2; >=25 → 3\n  SpO2 Scale 1: <=91 → 3; 92-93 → 2; 94-95 → 1; >=96 → 0\n  SpO2 Scale 2 (hypercapnic, target 88-92%): <=83 → 3; 84-85 → 2; 86-87 → 1; 88-92 → 0;\n    when on supplemental O2: 93-94 → 1; 95-96 → 2; >=97 → 3 (on-air values 93+ score 0)\n  Air or oxygen: room air → 0; on supplemental O2 → 2\n  Systolic BP (mmHg): <=90 → 3; 91-100 → 2; 101-110 → 1; 111-219 → 0; >=220 → 3\n  Pulse (/min): <=40 → 3; 41-50 → 1; 51-90 → 0; 91-110 → 1; 111-130 → 2; >=131 → 3\n  Consciousness (ACVPU): A (Alert) → 0; C/V/P/U (any not-A) → 3\n  Temperature (°C): <=35.0 → 3; 35.1-36.0 → 1; 36.1-38.0 → 0; 38.1-39.0 → 1; >=39.1 → 2\nAggregate range 0-20; clinical-response trigger band per RCP 2017 Table 2 (escalation increases if any single parameter scores 3).',
      components: [
        { inputKey: 'rr',    label: 'Respiratory rate (/min)', points: (v) => {
          const rr = Number(v); if (rr <= 8) return 3; if (rr <= 11) return 1; if (rr <= 20) return 0; if (rr <= 24) return 2; return 3;
        } },
        { inputKey: 'spo2',  label: 'SpO2 (%) — scale per Scale 1 / Scale 2 selection', points: (v, inputs) => {
          const spo2 = Number(v); const scale2 = !!(inputs && inputs.scale2); const onO2 = !!(inputs && inputs.onO2);
          if (!scale2) { if (spo2 <= 91) return 3; if (spo2 <= 93) return 2; if (spo2 <= 95) return 1; return 0; }
          if (spo2 <= 83) return 3; if (spo2 <= 85) return 2; if (spo2 <= 87) return 1; if (spo2 <= 92) return 0;
          if (!onO2) return 0; if (spo2 <= 94) return 1; if (spo2 <= 96) return 2; return 3;
        } },
        { inputKey: 'onO2',  label: 'Air or oxygen — supplemental O2 in use', points: 2 },
        { inputKey: 'sbp',   label: 'Systolic BP (mmHg)', points: (v) => {
          const sbp = Number(v); if (sbp <= 90) return 3; if (sbp <= 100) return 2; if (sbp <= 110) return 1; if (sbp <= 219) return 0; return 3;
        } },
        { inputKey: 'pulse', label: 'Pulse (/min)', points: (v) => {
          const p = Number(v); if (p <= 40) return 3; if (p <= 50) return 1; if (p <= 90) return 0; if (p <= 110) return 1; if (p <= 130) return 2; return 3;
        } },
        { inputKey: 'acvpu', label: 'Consciousness (ACVPU; any not-A scores 3)', points: (v) => (v && v !== 'A' ? 3 : 0) },
        { inputKey: 'temp',  label: 'Temperature (°C)', points: (v) => {
          const t = Number(v); if (t <= 35.0) return 3; if (t <= 36.0) return 1; if (t <= 38.0) return 0; if (t <= 39.0) return 1; return 2;
        } },
      ],
      bands: [
        { range: [0, 0],                 label: 'low (continue routine monitoring; minimum 12-hourly observations)' },
        { range: [1, 4],                 label: 'low-medium (minimum 4-6-hourly observations; RN assesses escalation)' },
        { range: [5, 6],                 label: 'medium (minimum 1-hourly observations; urgent review)' },
        { range: { op: '>=', value: 7 }, label: 'high (continuous monitoring; emergency critical-care team assessment)' },
      ],
      population: 'Originally derived in 2012 (NEWS) from a 35,585-admission cohort across UK acute hospitals. NEWS2 (2017) is the RCP update that introduces the Scale 2 SpO2 column for hypercapnic respiratory failure and replaces V with C (new confusion) at the top of the ACVPU response.',
      units: {
        rr: 'breaths/min', spo2: '% (Scale 1 default; Scale 2 for target 88-92%)',
        scale2: 'boolean (use SpO2 Scale 2)', onO2: 'boolean (supplemental oxygen)',
        sbp: 'mmHg', pulse: 'beats/min', acvpu: 'A | C | V | P | U', temp: '°C',
      },
      validity: 'Adult acute-care inpatients. NOT validated in pregnancy, in children, in patients with spinal-cord injury affecting autonomic responses, or where any vital sign is itself the index condition being treated (e.g., palliative care). Scale 2 is intended only for patients with a documented target SpO2 of 88-92% (chronic Type II respiratory failure); using Scale 2 outside that group will systematically under-trigger escalation. A single parameter scoring 3 triggers urgent review regardless of aggregate.',
      source: 'Royal College of Physicians. "National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS." Updated report of a working party. London: RCP, December 2017. Tables 1-2.',
    },
  },
  mews: {
    citation: 'Subbe CP, Kruger M, Rutherford P, Gemmel L. Validation of a modified Early Warning Score in medical admissions. QJM. 2001;94(10):521-526.',
    specialties: ['nursing-general', 'emergency-medicine', 'critical-care'],
    example: {
      fields: { 'me-sbp': '120', 'me-pulse': '78', 'me-rr': '14', 'me-temp': '37.0', 'me-avpu': 'A' },
      expected: 'MEWS 0 - low band (0-2) per Subbe 2001 Table 2.',
    },
    interpretation: {
      bands: [
        { range: '0-2', text: 'Low risk band per Subbe 2001 Table 2.' },
        { range: '3', text: 'Low-intermediate risk band per Subbe 2001 Table 2.' },
        { range: '4', text: 'Intermediate risk band per Subbe 2001 Table 2.' },
        { range: '>=5', text: 'Increased risk of death, ICU admission, and HDU admission per Subbe 2001 Table 2.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Subbe CP, et al. QJM. 2001;94(10):521-526, Table 2.',
    },
    derivation: {
      formula: 'MEWS = sum of per-parameter scores per Subbe 2001 Table 1.\n  Systolic BP (mmHg): <=70 → 3; 71-80 → 2; 81-100 → 1; 101-199 → 0; >=200 → 2\n  Pulse (/min): <40 → 2; 41-50 → 1; 51-100 → 0; 101-110 → 1; 111-129 → 2; >=130 → 3\n  Respiratory rate (/min): <9 → 2; 9-14 → 0; 15-20 → 1; 21-29 → 2; >=30 → 3\n  Temperature (°C): <35 → 2; 35-38.4 → 0; >=38.5 → 2\n  AVPU level of consciousness: A → 0; V → 1; P → 2; U → 3',
      components: [
        { inputKey: 'sbp',   label: 'Systolic BP (mmHg)', points: (v) => {
          const x = Number(v); if (x <= 70) return 3; if (x <= 80) return 2; if (x <= 100) return 1; if (x <= 199) return 0; return 2;
        } },
        { inputKey: 'pulse', label: 'Pulse (/min)', points: (v) => {
          const x = Number(v); if (x < 40) return 2; if (x <= 50) return 1; if (x <= 100) return 0; if (x <= 110) return 1; if (x <= 129) return 2; return 3;
        } },
        { inputKey: 'rr',    label: 'Respiratory rate (/min)', points: (v) => {
          const x = Number(v); if (x < 9) return 2; if (x <= 14) return 0; if (x <= 20) return 1; if (x <= 29) return 2; return 3;
        } },
        { inputKey: 'temp',  label: 'Temperature (°C)', points: (v) => {
          const x = Number(v); if (x < 35) return 2; if (x <= 38.4) return 0; return 2;
        } },
        { inputKey: 'avpu',  label: 'AVPU (A=0 / V=1 / P=2 / U=3)', points: (v) => ({ A: 0, V: 1, P: 2, U: 3 })[v] ?? 0 },
      ],
      bands: [
        { range: [0, 2],                 label: 'low risk band' },
        { range: [3, 3],                 label: 'low-intermediate risk band' },
        { range: [4, 4],                 label: 'intermediate risk band' },
        { range: { op: '>=', value: 5 }, label: 'increased risk of death, ICU admission, and HDU admission' },
      ],
      population: 'Subbe 2001: 709 consecutive medical admissions to a UK district general hospital. Subsequently validated in surgical, ED, and obstetric populations (the obstetric variant is MEOWS, a separate Sophie tile).',
      units: {
        sbp: 'mmHg', pulse: 'beats/min', rr: 'breaths/min',
        temp: '°C', avpu: '"A" | "V" | "P" | "U"',
      },
      validity: 'Adult medical-ward inpatients. MEWS predates NEWS2 (Royal College of Physicians 2017, a separate Sophie tile). NEWS2 is the contemporary UK standard with additional SpO2 / supplemental-oxygen items and Scale 1/Scale 2 SpO2 stratification. MEWS remains in active use where NEWS2 has not yet been adopted. NOT validated in pediatric populations.',
      source: 'Subbe CP, Kruger M, Rutherford P, Gemmel L. "Validation of a modified Early Warning Score in medical admissions." QJM. 2001;94(10):521-526.',
    },
  },

  // ---- spec-v12 §3.2 wave 12-2: VTE risk & severity bundle ----
  pesi: {
    citation: 'Aujesky D, Obrosky DS, Stone RA, et al. Derivation and validation of a prognostic model for pulmonary embolism. Am J Respir Crit Care Med. 2005;172(8):1041-1046.',
    specialties: ['pulmonology', 'emergency-medicine', 'cardiology', 'critical-care'],
    example: {
      fields: { 'pe-age': '50', 'pe-sex': 'F', 'pe-hr': '0', 'pe-sbp': '0', 'pe-rr': '0', 'pe-tmp': '0', 'pe-ams': '0', 'pe-sao2': '0', 'pe-ca': '0', 'pe-hf': '0', 'pe-cld': '0' },
      expected: 'PESI 50 - Class I (very low risk; 30-day mortality 0.0-1.6% per Aujesky 2005 Table 4).',
    },
    interpretation: {
      bands: [
        { range: 'I (<=65)', text: '30-day mortality 0.0-1.6% per Aujesky 2005 Table 4 (Class I).' },
        { range: 'II (66-85)', text: '30-day mortality 1.7-3.5% per Aujesky 2005 Table 4 (Class II).' },
        { range: 'III (86-105)', text: '30-day mortality 3.2-7.1% per Aujesky 2005 Table 4 (Class III).' },
        { range: 'IV (106-125)', text: '30-day mortality 4.0-11.4% per Aujesky 2005 Table 4 (Class IV).' },
        { range: 'V (>125)', text: '30-day mortality 10.0-24.5% per Aujesky 2005 Table 4 (Class V).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Aujesky D, et al. Am J Respir Crit Care Med. 2005;172(8):1041-1046, Table 4.',
    },
  },
  spesi: {
    citation: 'Jimenez D, Aujesky D, Moores L, et al. Simplification of the pulmonary embolism severity index for prognostication in patients with acute symptomatic pulmonary embolism. Arch Intern Med. 2010;170(15):1383-1389.',
    specialties: ['pulmonology', 'emergency-medicine', 'cardiology'],
    example: {
      fields: { 'sp-age80': '0', 'sp-ca': '0', 'sp-ccp': '0', 'sp-hr': '0', 'sp-sbp': '0', 'sp-sao2': '0' },
      expected: 'sPESI 0 - low risk; 30-day all-cause mortality 1.0% per Jimenez 2010 Table 3.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Low risk; 30-day all-cause mortality 1.0% per Jimenez 2010 Table 3.' },
        { range: '>=1', text: 'Not-low risk; 30-day all-cause mortality 10.9% per Jimenez 2010 Table 3.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Jimenez D, et al. Arch Intern Med. 2010;170(15):1383-1389, Table 3.',
    },
  },
  padua: {
    citation: 'Barbar S, Noventa F, Rossetto V, et al. A risk assessment model for the identification of hospitalized medical patients at risk for venous thromboembolism: the Padua Prediction Score. J Thromb Haemost. 2010;8(11):2450-2457.',
    specialties: ['hematology', 'nursing-general', 'geriatrics'],
    example: {
      fields: { 'pa-ca': '0', 'pa-vte': '0', 'pa-mob': '0', 'pa-thr': '0', 'pa-trauma': '0', 'pa-age': '0', 'pa-hf': '0', 'pa-mi': '0', 'pa-inf': '0', 'pa-bmi': '0', 'pa-horm': '0' },
      expected: 'Padua 0 - low risk; 90-day VTE 0.3% without prophylaxis per Barbar 2010 Table 4.',
    },
    interpretation: {
      bands: [
        { range: '<4', text: 'Low risk; 90-day VTE 0.3% without prophylaxis per Barbar 2010 Table 4.' },
        { range: '>=4', text: 'High risk; 90-day VTE 11.0% if untreated per Barbar 2010 Table 4. Prophylaxis-eligible per Barbar 2010 Results.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Barbar S, et al. J Thromb Haemost. 2010;8(11):2450-2457, Table 4.',
    },
  },

  // ---- spec-v12 §3.3 wave 12-3: upper & lower GI-bleeding bundle ----
  gbs: {
    citation: 'Blatchford O, Murray WR, Blatchford M. A risk score to predict need for treatment for upper-gastrointestinal haemorrhage. Lancet. 2000;356(9238):1318-1321.',
    specialties: ['gastroenterology', 'emergency-medicine', 'hematology'],
    example: {
      fields: { 'gb-bun': '14', 'gb-hgb': '15', 'gb-sex': 'M', 'gb-sbp': '120', 'gb-pulse': '0', 'gb-mel': '0', 'gb-syn': '0', 'gb-hep': '0', 'gb-cf': '0' },
      expected: 'GBS 0 - low risk; can be considered for outpatient management per Blatchford 2000 §Results (cutoff endorsed by NICE CG141 2012).',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Low risk; can be considered for outpatient management per Blatchford 2000 §Results.' },
        { range: '>=1', text: 'Not in the Blatchford 2000 low-risk group; inpatient assessment per source.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Blatchford O, et al. Lancet. 2000;356(9238):1318-1321, Table 1 (weights) and §Results (outpatient-management cutoff endorsed by NICE CG141 2012).',
    },
  },
  rockall: {
    citation: 'Rockall TA, Logan RFA, Devlin HB, Northfield TC. Risk assessment after acute upper gastrointestinal haemorrhage. Gut. 1996;38(3):316-321.',
    specialties: ['gastroenterology', 'emergency-medicine'],
    example: {
      fields: { 'rk-age': '0', 'rk-shock': '0', 'rk-co': '0', 'rk-dx': '0', 'rk-stig': '0', 'rk-pre': '0' },
      expected: 'Complete Rockall 0 - low risk; mortality 0.1-0.4% per Rockall 1996 Figure 2.',
    },
    interpretation: {
      bands: [
        { range: '0-2', text: 'Low risk; mortality 0.1-0.4% per Rockall 1996 Figure 2.' },
        { range: '3-4', text: 'Intermediate risk; mortality 5.3-11.2% per Rockall 1996 Figure 2.' },
        { range: '5-7', text: 'High risk; mortality 24.6-39.6% per Rockall 1996 Figure 2.' },
        { range: '8+', text: 'Very high risk; mortality >=40% per Rockall 1996 Figure 2.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Rockall TA, et al. Gut. 1996;38(3):316-321, Figure 2. Pre-endoscopy variant per Vreeburg EM, et al. Gastroenterology. 1999/NICE CG141 endorsement.',
    },
  },
  aims65: {
    citation: 'Saltzman JR, Tabak YP, Hyett BH, Sun X, Travis AC, Johannes RS. A simple risk score accurately predicts in-hospital mortality, length of stay, and cost in acute upper GI bleeding. Gastrointest Endosc. 2011;74(6):1215-1224.',
    specialties: ['gastroenterology', 'emergency-medicine'],
    example: {
      fields: { 'am-alb': '0', 'am-inr': '0', 'am-am': '0', 'am-sbp': '0', 'am-age': '0' },
      expected: 'AIMS65 0 - in-hospital mortality 0.3% per Saltzman 2011 Table 4.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'In-hospital mortality 0.3% per Saltzman 2011 Table 4.' },
        { range: '1', text: 'In-hospital mortality 1.2% per Saltzman 2011 Table 4.' },
        { range: '2', text: 'In-hospital mortality 5.3% per Saltzman 2011 Table 4.' },
        { range: '3', text: 'In-hospital mortality 10.3% per Saltzman 2011 Table 4.' },
        { range: '4', text: 'In-hospital mortality 16.5% per Saltzman 2011 Table 4.' },
        { range: '5', text: 'In-hospital mortality 24.5% per Saltzman 2011 Table 4.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Saltzman JR, et al. Gastrointest Endosc. 2011;74(6):1215-1224, Table 4.',
    },
  },
  oakland: {
    citation: 'Oakland K, Jairath V, Uberoi R, et al. Derivation and validation of a novel risk score for safe discharge after acute lower gastrointestinal bleeding: a modelling study. Lancet Gastroenterol Hepatol. 2017;2(9):635-643.',
    specialties: ['gastroenterology', 'emergency-medicine'],
    example: {
      fields: { 'ok-age': '35', 'ok-sex': 'F', 'ok-prior': '0', 'ok-dre': '0', 'ok-hr': '65', 'ok-sbp': '165', 'ok-hgb': '17' },
      expected: 'Oakland 0 - safe for outpatient management (95% probability of safe discharge per Oakland 2017; cutoff endorsed by BSG 2019).',
    },
    interpretation: {
      bands: [
        { range: '<=8', text: 'Safe for outpatient management; 95% probability of safe discharge per Oakland 2017 (cutoff endorsed by BSG 2019).' },
        { range: '>8', text: 'Not in the safe-discharge band; inpatient assessment per Oakland 2017.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Oakland K, et al. Lancet Gastroenterol Hepatol. 2017;2(9):635-643, Table 2 (weights) and Figure 3 (<=8 safe-discharge cutoff endorsed by BSG 2019).',
    },
  },

  // ---- spec-v12 §3.4 wave 12-4: hepatology & liver-fibrosis bundle ----
  fib4: {
    citation: 'Sterling RK, Lissen E, Clumeck N, et al. Development of a simple noninvasive index to predict significant fibrosis in patients with HIV/HCV coinfection. Hepatology. 2006;43(6):1317-1325.',
    specialties: ['hepatology', 'gastroenterology', 'infectious-disease'],
    example: {
      fields: { 'fib4-age': '55', 'fib4-ast': '60', 'fib4-alt': '40', 'fib4-plt': '150' },
      expected: 'FIB-4 3.48 - rules in advanced fibrosis (PPV 65% per Sterling 2006).',
    },
    interpretation: {
      bands: [
        { range: '<1.45', text: 'Rules out advanced fibrosis (NPV 90% per Sterling 2006).' },
        { range: '1.45-3.25', text: 'Indeterminate; consider further evaluation per Sterling 2006.' },
        { range: '>3.25', text: 'Rules in advanced fibrosis (PPV 65% per Sterling 2006).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Sterling RK, et al. Hepatology. 2006;43(6):1317-1325, Table 4 (cutoffs).',
    },
  },
  apri: {
    citation: 'Wai CT, Greenson JK, Fontana RJ, et al. A simple noninvasive index can predict both significant fibrosis and cirrhosis in patients with chronic hepatitis C. Hepatology. 2003;38(2):518-526.',
    specialties: ['hepatology', 'gastroenterology', 'infectious-disease'],
    example: {
      fields: { 'apri-ast': '60', 'apri-uln': '40', 'apri-plt': '150' },
      expected: 'APRI 1.00 - predicts significant fibrosis per Wai 2003 (WHO 2014 HCV guideline endorsement).',
    },
    interpretation: {
      bands: [
        { range: '<=0.7', text: 'Below the Wai 2003 significant-fibrosis cutoff.' },
        { range: '>0.7', text: 'Predicts significant fibrosis per Wai 2003 (WHO 2014 HCV guideline endorsement).' },
        { range: '>1.0', text: 'Predicts cirrhosis per Wai 2003 (WHO 2014 HCV guideline endorsement).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Wai CT, et al. Hepatology. 2003;38(2):518-526, Table 4 (cutoffs); WHO 2014 HCV guideline endorsement for resource-limited settings.',
    },
  },
  'maddrey-lille': {
    citation: 'Maddrey WC, et al. Corticosteroid therapy of alcoholic hepatitis. Gastroenterology. 1978;75(2):193-199. Lille model: Louvet A, et al. Hepatology. 2007;45(6):1348-1354.',
    specialties: ['hepatology', 'gastroenterology', 'critical-care'],
    example: {
      fields: { 'ml-pt': '20', 'ml-ctrl': '12', 'ml-bili': '10', 'ml-age': '50', 'ml-alb': '3.0', 'ml-cr': '0.9', 'ml-b0': '10', 'ml-b7': '6', 'ml-ptl': '20' },
      expected: 'Maddrey DF 46.8 - severe alcoholic hepatitis per Maddrey 1978 §Results; Lille model also computed.',
    },
    interpretation: {
      bands: [
        { range: 'DF <32', text: 'Not in the severe alcoholic hepatitis band per Maddrey 1978 §Results.' },
        { range: 'DF >=32', text: 'Severe alcoholic hepatitis per Maddrey 1978 §Results; corticosteroid therapy commonly considered.' },
        { range: 'Lille <0.45', text: 'Predicts response to steroids (6-month survival ~85% per Louvet 2007).' },
        { range: 'Lille >=0.45', text: 'Predicts non-response to steroids (6-month survival ~25% per Louvet 2007).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Maddrey WC, et al. Gastroenterology. 1978;75(2):193-199 (DF formula and >=32 cutoff). Louvet A, et al. Hepatology. 2007;45(6):1348-1354 (Lille equation and 0.45 cutoff).',
    },
  },

  // ---- spec-v12 §3.5 wave 12-5: imaging-decision bundle ----
  cthr: {
    citation: 'Stiell IG, Wells GA, Vandemheen K, et al. The Canadian CT Head Rule for patients with minor head injury. Lancet. 2001;357(9266):1391-1396.',
    specialties: ['emergency-medicine', 'neurology', 'surgery'],
    example: {
      fields: { 'ct-hr': '0', 'ct-mr': '0' },
      expected: 'CT not required by Canadian CT Head Rule per Stiell 2001.',
    },
    interpretation: {
      bands: [
        { range: 'no high or medium criterion', text: 'CT not required by Canadian CT Head Rule per Stiell 2001.' },
        { range: 'any medium criterion', text: 'CT recommended (clinically important brain injury concern) per Stiell 2001.' },
        { range: 'any high criterion', text: 'CT recommended (need for neurosurgical intervention concern) per Stiell 2001.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Stiell IG, et al. Lancet. 2001;357(9266):1391-1396, Figure 2 (algorithm). Rule applies to GCS 13-15 blunt head injury with witnessed LOC, definite amnesia, or witnessed disorientation.',
    },
  },
  ccsr: {
    citation: 'Stiell IG, Wells GA, Vandemheen KL, et al. The Canadian C-Spine Rule for radiography in alert and stable trauma patients. JAMA. 2001;286(15):1841-1848.',
    specialties: ['emergency-medicine', 'surgery', 'neurology'],
    example: {
      fields: { 'cs-hr': '0', 'cs-lr': '1', 'cs-rot': '1' },
      expected: 'Imaging not required: low-risk factor present and able to rotate neck 45 degrees actively per Stiell 2001.',
    },
    interpretation: {
      bands: [
        { range: 'high-risk factor', text: 'Imaging recommended per Stiell 2001 step 1.' },
        { range: 'no low-risk factor', text: 'Imaging recommended per Stiell 2001 step 2.' },
        { range: 'cannot rotate 45 degrees', text: 'Imaging recommended per Stiell 2001 step 3.' },
        { range: 'all three pass', text: 'Imaging not required per Stiell 2001.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Stiell IG, et al. JAMA. 2001;286(15):1841-1848, Figure 1 (three-step algorithm). Ships side by side with the nexus-cspine tile so both rules are visible on the same screen.',
    },
  },
  'pecarn-head': {
    citation: 'Kuppermann N, Holmes JF, Dayan PS, et al. Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study. Lancet. 2009;374(9696):1160-1170.',
    specialties: ['pediatrics', 'emergency-medicine', 'neurology'],
    example: {
      fields: { 'ph-age': '5', 'ph-gcs15': '1', 'ph-skfx': '0', 'ph-basal': '0', 'ph-ams': '0', 'ph-loc': '0', 'ph-vom': '0', 'ph-mech': '0', 'ph-opt': '0', 'ph-acting': '1', 'ph-hd': '0' },
      expected: 'Very low risk: ciTBI <0.05% per Kuppermann 2009. CT not recommended.',
    },
    interpretation: {
      bands: [
        { range: 'very low', text: 'ciTBI <0.02% (age <2) / <0.05% (age >=2) per Kuppermann 2009. CT not recommended.' },
        { range: 'intermediate', text: 'ciTBI ~0.9% per Kuppermann 2009. Observation vs CT based on the Kuppermann 2009 shared-decision factors.' },
        { range: 'high', text: 'ciTBI ~4.4% (age <2) / ~4.3% (age >=2) per Kuppermann 2009. CT recommended.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Kuppermann N, et al. Lancet. 2009;374(9696):1160-1170, Figure 2 (age <2 branch) and Figure 3 (age >=2 branch).',
    },
  },
  'ottawa-ankle': {
    citation: 'Stiell IG, Greenberg GH, McKnight RD, Nair RC, McDowell I, Worthington JR. A study to develop clinical decision rules for the use of radiography in acute ankle injuries. Ann Emerg Med. 1992;21(4):384-390.',
    specialties: ['emergency-medicine', 'surgery'],
    example: {
      fields: { 'oa-mp': '0', 'oa-lat': '0', 'oa-med': '0', 'oa-abw': '0', 'oa-fp': '0', 'oa-fmt': '0', 'oa-nav': '0', 'oa-fbw': '0' },
      expected: 'No imaging indicated by Ottawa Ankle Rules per Stiell 1992.',
    },
    interpretation: {
      bands: [
        { range: 'no criteria', text: 'No imaging indicated by Ottawa Ankle Rules per Stiell 1992.' },
        { range: 'ankle criteria met', text: 'Ankle x-ray indicated per Stiell 1992.' },
        { range: 'foot criteria met', text: 'Foot x-ray indicated per Stiell 1992.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Stiell IG, et al. Ann Emerg Med. 1992;21(4):384-390, Figure 1 (algorithm). Rule for patients >=18; pediatric variant Plint 1999 deferred to a future spec.',
    },
  },
  'ottawa-sah': {
    citation: 'Perry JJ, Stiell IG, Sivilotti MLA, et al. Clinical decision rules to rule out subarachnoid hemorrhage for acute headache. JAMA. 2013;310(12):1248-1255.',
    specialties: ['emergency-medicine', 'neurology'],
    example: {
      fields: { 'os-excl': '0', 'os-age': '0', 'os-neck': '0', 'os-loc': '0', 'os-ex': '0', 'os-tc': '0', 'os-flex': '0' },
      expected: 'Rule out SAH by Ottawa SAH Rule: all six criteria negative per Perry 2013 (100% sensitivity in the derivation cohort).',
    },
    interpretation: {
      bands: [
        { range: 'all negative', text: 'Rule out SAH per Perry 2013 (100% sensitivity in the derivation cohort).' },
        { range: 'any positive', text: 'Cannot rule out SAH; further workup indicated per Perry 2013.' },
        { range: 'exclusion present', text: 'Ottawa SAH Rule does not apply per Perry 2013.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Perry JJ, et al. JAMA. 2013;310(12):1248-1255, Figure 2 (algorithm) and §Methods (exclusion criteria).',
    },
  },

  // ---- spec-v12 §3.6 wave 12-6: readmission & care-transition risk ----
  'hospital-score': {
    citation: 'Donze J, Aujesky D, Williams D, Schnipper JL. Potentially avoidable 30-day hospital readmissions in medical patients: derivation and validation of a prediction model. JAMA Intern Med. 2013;173(8):632-638.',
    specialties: ['nursing-general', 'geriatrics', 'palliative'],
    example: {
      fields: { 'hs-hgb': '0', 'hs-onc': '0', 'hs-na': '0', 'hs-proc': '0', 'hs-urg': '0', 'hs-prior': '0', 'hs-los': '0' },
      expected: 'HOSPITAL 0 - low risk; 30-day potentially-avoidable readmission ~5.8% per Donze 2013 Table 4.',
    },
    interpretation: {
      bands: [
        { range: '0-4', text: 'Low risk; ~5.8% 30-day potentially-avoidable readmission per Donze 2013 Table 4.' },
        { range: '5-6', text: 'Intermediate risk; ~11.9% per Donze 2013 Table 4.' },
        { range: '>=7', text: 'High risk; ~22.8% per Donze 2013 Table 4.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Donze J, et al. JAMA Intern Med. 2013;173(8):632-638, Table 2 (weights) and Table 4 (risk bands).',
    },
    derivation: {
      formula: 'HOSPITAL = sum across 7 criteria (Donze 2013 Table 2), range 0-13.\n  Hemoglobin < 12 g/dL at discharge                              (+1)\n  Discharge from an Oncology service                              (+2)\n  Sodium < 135 mEq/L at discharge                                 (+1)\n  Any procedure during hospital stay (any ICD-9 procedure code)   (+1)\n  Index admission was urgent / non-elective                        (+1)\n  Prior admissions in last 12 months:  0-2 (0) | 3-4 (+2) | >=5 (+5)\n  Length of stay >= 5 days                                         (+2)\nBands per Donze 2013 Table 4 (30-day potentially-avoidable readmission): 0-4 low ~5.8%, 5-6 intermediate ~11.9%, >=7 high ~22.8%.',
      components: [
        { inputKey: 'hgbLt12',             label: 'Hemoglobin < 12 g/dL at discharge (+1)',                    points: 1 },
        { inputKey: 'oncologyDischarge',   label: 'Discharge from an Oncology service (+2)',                   points: 2 },
        { inputKey: 'sodiumLt135',         label: 'Sodium < 135 mEq/L at discharge (+1)',                      points: 1 },
        { inputKey: 'anyProcedure',        label: 'Any procedure during hospital stay (+1)',                   points: 1 },
        { inputKey: 'urgentAdmission',     label: 'Urgent / non-elective index admission (+1)',                points: 1 },
        { inputKey: 'priorAdmissions12mo', label: 'Prior admissions in last 12 months (0-2: 0 / 3-4: +2 / >=5: +5)', points: (v) => { const n = Number(v) || 0; if (n >= 5) return 5; if (n >= 3) return 2; return 0; } },
        { inputKey: 'losGe5',              label: 'Length of stay >= 5 days (+2)',                             points: 2 },
      ],
      bands: [
        { range: [0, 4],                 label: 'low 30-day potentially-avoidable readmission risk (~5.8%)' },
        { range: [5, 6],                 label: 'intermediate 30-day potentially-avoidable readmission risk (~11.9%)' },
        { range: { op: '>=', value: 7 }, label: 'high 30-day potentially-avoidable readmission risk (~22.8%)' },
      ],
      population: 'Donze 2013: derivation in 9212 adult medical inpatients discharged alive from a Boston tertiary academic medical center (2009-2010); validation in 7769 patients from a Swiss university hospital (Lausanne). Outcome: 30-day potentially-avoidable readmission as adjudicated by the SQLape algorithm.',
      units: {
        hgbLt12: 'boolean (at discharge)',
        oncologyDischarge: 'boolean (discharged from an Oncology service)',
        sodiumLt135: 'boolean (at discharge, in mEq/L)',
        anyProcedure: 'boolean (any inpatient ICD procedure during stay)',
        urgentAdmission: 'boolean (urgent / non-elective index admission)',
        priorAdmissions12mo: 'integer count of prior hospital admissions in last 12 months',
        losGe5: 'boolean (length of stay >= 5 days)',
      },
      validity: 'Adult medical inpatients discharged alive; intended for prediction of potentially-avoidable readmission, not all-cause readmission (the cited 5.8% / 11.9% / 22.8% rates are derivation-cohort SQLape-adjudicated rates, not all-cause). Performance is modest in external validation; ACP and SHM guidance treat the score as one signal among several for transitions-of-care risk-stratification. Not validated for surgical patients, obstetric patients, psychiatric admissions, or pediatrics.',
      source: 'Donze J, Aujesky D, Williams D, Schnipper JL. "Potentially avoidable 30-day hospital readmissions in medical patients: derivation and validation of a prediction model." JAMA Intern Med. 2013;173(8):632-638.',
    },
  },
  lace: {
    citation: 'van Walraven C, Dhalla IA, Bell C, et al. Derivation and validation of an index to predict early death or unplanned readmission after discharge from hospital to the community. CMAJ. 2010;182(6):551-557.',
    specialties: ['nursing-general', 'geriatrics', 'palliative'],
    example: {
      fields: { 'lc-los': '3', 'lc-acute': '0', 'lc-charlson': '0', 'lc-ed': '0' },
      expected: 'LACE 3 - low risk of 30-day death or unplanned readmission per van Walraven 2010 Figure 2.',
    },
    interpretation: {
      bands: [
        { range: '0-4', text: 'Low risk of 30-day death or unplanned readmission per van Walraven 2010 Figure 2.' },
        { range: '5-9', text: 'Moderate risk of 30-day death or unplanned readmission per van Walraven 2010 Figure 2.' },
        { range: '>=10', text: 'High risk of 30-day death or unplanned readmission per van Walraven 2010 Figure 2.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'van Walraven C, et al. CMAJ. 2010;182(6):551-557, Table 3 (weights) and Figure 2 (risk bands).',
    },
    derivation: {
      formula: 'LACE = sum across 4 components (van Walraven 2010 Table 3).\n  L — Length of stay (days):  <1 (0) | 1 (1) | 2 (2) | 3 (3) | 4-6 (4) | 7-13 (5) | >=14 (7)\n  A — Acute (non-elective) admission:                                    (+3)\n  C — Charlson comorbidity score: 0 (0) | 1 (1) | 2 (2) | 3 (3) | >=4 (5)\n  E — ED visits in 6 months prior:    0 (0) | 1 (1) | 2 (2) | 3 (3) | >=4 (4)\nBands per van Walraven 2010 Figure 2: 0-4 low, 5-9 moderate, >=10 high risk of 30-day death or unplanned readmission.',
      components: [
        { inputKey: 'losDays',         label: 'L — Length of stay (days, banded per Table 3)', points: (v) => { const n = Number(v) || 0; if (n < 1) return 0; if (n === 1) return 1; if (n === 2) return 2; if (n === 3) return 3; if (n <= 6) return 4; if (n <= 13) return 5; return 7; } },
        { inputKey: 'acuteAdmission',  label: 'A — Acute (non-elective) admission (+3)',       points: 3 },
        { inputKey: 'charlsonScore',   label: 'C — Charlson score (banded per Table 3)',       points: (v) => { const n = Number(v) || 0; if (n <= 0) return 0; if (n === 1) return 1; if (n === 2) return 2; if (n === 3) return 3; return 5; } },
        { inputKey: 'edVisits6mo',     label: 'E — ED visits in last 6 months (banded)',        points: (v) => { const n = Number(v) || 0; if (n <= 0) return 0; if (n >= 4) return 4; return n; } },
      ],
      bands: [
        { range: [0, 4],                  label: 'low risk of 30-day death or unplanned readmission' },
        { range: [5, 9],                  label: 'moderate risk of 30-day death or unplanned readmission' },
        { range: { op: '>=', value: 10 }, label: 'high risk of 30-day death or unplanned readmission' },
      ],
      population: 'van Walraven 2010: derivation in 4812 adult medical and surgical inpatients discharged alive from 11 hospitals in Ontario, Canada (LACE-D cohort); external validation in 1,000,000 administrative records from Ontario. Outcome: composite of 30-day mortality or unplanned readmission to any hospital.',
      units: {
        losDays: 'integer days (length of index hospital stay)',
        acuteAdmission: 'boolean (urgent / non-elective admission)',
        charlsonScore: 'integer (Charlson comorbidity index)',
        edVisits6mo: 'integer count of ED visits in the 6 months prior to admission',
      },
      validity: 'Adult medical and surgical inpatients discharged alive. Predicts composite 30-day death or any-cause readmission (broader than HOSPITAL\'s potentially-avoidable readmission). The expanded LACE+ adds patient age, sex, hospital teaching status, and additional covariates and outperforms LACE in some validation cohorts; ACP / SHM treat LACE as one signal among several for transitions-of-care risk-stratification. Not validated for obstetric, psychiatric, or pediatric admissions.',
      source: 'van Walraven C, Dhalla IA, Bell C, Etchells E, Stiell IG, Zarnke K, Austin PC, Forster AJ. "Derivation and validation of an index to predict early death or unplanned readmission after discharge from hospital to the community." CMAJ. 2010;182(6):551-557.',
    },
  },

  // ---- spec-v12 §3.7 wave 12-7: comorbidity, frailty & performance status ----
  charlson: {
    citation: 'Charlson ME, Pompei P, Ales KL, MacKenzie CR. A new method of classifying prognostic comorbidity in longitudinal studies: development and validation. J Chronic Dis. 1987;40(5):373-383. Age adjustment: Charlson ME, et al. J Clin Epidemiol. 1994;47(11):1245-1251.',
    specialties: ['nursing-general', 'geriatrics', 'oncology', 'palliative'],
    example: {
      fields: { 'ch-age': '55' },
      expected: 'Charlson age-adjusted 1 - estimated 10-year mortality ~26% per Charlson 1987 Table 4.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Estimated 10-year mortality ~12% per Charlson 1987 Table 4.' },
        { range: '1-2', text: 'Estimated 10-year mortality ~26% per Charlson 1987 Table 4.' },
        { range: '3-4', text: 'Estimated 10-year mortality ~52% per Charlson 1987 Table 4.' },
        { range: '>=5', text: 'Estimated 10-year mortality ~85% per Charlson 1987 Table 4.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Charlson ME, et al. J Chronic Dis. 1987;40(5):373-383, Table 3 (weights) and Table 4 (mortality). Age adjustment: Charlson 1994 (1 point per decade >=50, max 4).',
    },
  },
  cfs: {
    citation: 'Rockwood K, Song X, MacKnight C, et al. A global clinical measure of fitness and frailty in elderly people. CMAJ. 2005;173(5):489-495. v2 (2020) wording per the Dalhousie public CFS PDF.',
    specialties: ['geriatrics', 'palliative', 'nursing-general', 'oncology'],
    example: {
      fields: { 'cf-level': '2' },
      expected: 'CFS 2 (Well): not frail per Rockwood 2005.',
    },
    interpretation: {
      bands: [
        { range: '1-3', text: 'Not frail per Rockwood 2005.' },
        { range: '4', text: 'Vulnerable / pre-frail per Rockwood 2005.' },
        { range: '5-6', text: 'Mild-to-moderate frailty; increased risk of adverse outcomes per Rockwood 2005.' },
        { range: '7-8', text: 'Severe frailty; high risk of adverse outcomes per Rockwood 2005.' },
        { range: '9', text: 'Approaching end of life (life expectancy <6 months) per Rockwood 2005.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Rockwood K, et al. CMAJ. 2005;173(5):489-495. v2 (2020) wording per the Dalhousie public CFS PDF.',
    },
  },
  'ecog-karnofsky': {
    citation: 'ECOG: Oken MM, et al. Am J Clin Oncol. 1982;5(6):649-655. Karnofsky: Karnofsky DA, Burchenal JH. In: MacLeod CM, ed. Evaluation of Chemotherapeutic Agents. Columbia University Press; 1949:191-205. Crosswalk: Buccheri G, et al. Eur J Cancer. 1996;32A(7):1135-1141.',
    specialties: ['oncology', 'palliative', 'geriatrics', 'nursing-general'],
    example: {
      fields: { 'ek-ecog': '0', 'ek-kps': '100' },
      expected: 'ECOG 0 / KPS 100 - fully active; no evidence of disease.',
    },
    interpretation: {
      bands: [
        { range: 'ECOG 0 / KPS 100-90', text: 'Fully active per Oken 1982 / Karnofsky 1949.' },
        { range: 'ECOG 1 / KPS 80-70', text: 'Ambulatory; restricted in strenuous activity per Oken 1982 / Karnofsky 1949.' },
        { range: 'ECOG 2 / KPS 60-50', text: 'Self-care but unable to work; up >50% of waking hours.' },
        { range: 'ECOG 3 / KPS 40-30', text: 'Limited self-care; confined to bed or chair >50% of waking hours.' },
        { range: 'ECOG 4 / KPS 20-10', text: 'Completely disabled; totally confined.' },
        { range: 'ECOG 5 / KPS 0', text: 'Dead.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Oken MM, et al. Am J Clin Oncol. 1982;5(6):649-655 (ECOG). Karnofsky DA, Burchenal JH. 1949 (KPS). Buccheri G, et al. Eur J Cancer. 1996;32A(7):1135-1141 (crosswalk).',
    },
  },

  // ---- spec-v12 §3.8 wave 12-8: Killip Classification ----
  killip: {
    citation: 'Killip T, Kimball JT. Treatment of myocardial infarction in a coronary care unit. A two-year experience with 250 patients. Am J Cardiol. 1967;20(4):457-464.',
    specialties: ['cardiology', 'emergency-medicine', 'critical-care'],
    example: {
      fields: { 'kp-class': '1' },
      expected: 'Killip I: in-hospital mortality 6% in the Killip 1967 original cohort.',
    },
    interpretation: {
      bands: [
        { range: 'I', text: 'In-hospital mortality 6% in the Killip 1967 original cohort.' },
        { range: 'II', text: 'In-hospital mortality 17% in the Killip 1967 original cohort.' },
        { range: 'III', text: 'In-hospital mortality 38% in the Killip 1967 original cohort.' },
        { range: 'IV', text: 'In-hospital mortality 81% in the Killip 1967 original cohort.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Killip T, Kimball JT. Am J Cardiol. 1967;20(4):457-464. Contemporary GUSTO-I cohort: Lee KL, et al. Circulation. 1995;91(6):1659-1668 (Killip I ~5%, II ~14%, III ~32%, IV ~58% with reperfusion-era therapy).',
    },
  },

  // ---- spec-v12 §3.9 wave 12-8: SIRS Criteria ----
  sirs: {
    citation: 'Bone RC, Balk RA, Cerra FB, et al. Definitions for sepsis and organ failure and guidelines for the use of innovative therapies in sepsis. The ACCP/SCCM Consensus Conference Committee. Chest. 1992;101(6):1644-1655.',
    specialties: ['critical-care', 'emergency-medicine', 'nursing-general', 'infectious-disease'],
    example: {
      fields: { 'sr-temp': '0', 'sr-hr': '0', 'sr-resp': '0', 'sr-wbc': '0' },
      expected: 'SIRS-negative (0 of 4 criteria) per Bone 1992. Sepsis-3 (Singer 2016) deprecated SIRS for sepsis screening in favor of qSOFA / SOFA.',
    },
    interpretation: {
      bands: [
        { range: '0-1 of 4', text: 'SIRS-negative per Bone 1992.' },
        { range: '>=2 of 4', text: 'SIRS-positive per Bone 1992. Sepsis-3 (Singer 2016) replaced SIRS with qSOFA / SOFA for sepsis screening.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Bone RC, et al. Chest. 1992;101(6):1644-1655 (SIRS definition). Sepsis-3 update: Singer M, et al. JAMA. 2016;315(8):801-810 (qSOFA / SOFA replace SIRS for sepsis screening).',
    },
  },

  // ---- spec-v13 §3.2 wave 13-2: sedation & delirium bundle ----
  rass: {
    citation: 'Sessler CN, Gosnell MS, Grap MJ, et al. The Richmond Agitation-Sedation Scale: validity and reliability in adult intensive care unit patients. Am J Respir Crit Care Med. 2002;166(10):1338-1344.',
    specialties: ['critical-care', 'nursing-icu', 'nursing-general', 'anesthesiology', 'psychiatry'],
    example: {
      fields: { 'rs-level': '0' },
      expected: 'RASS 0: in the SCCM PADIS 2018 light-sedation target band (-2 to 0).',
    },
    interpretation: {
      bands: [
        { range: '+2 to +4', text: 'Agitated. Review sedation per SCCM PADIS 2018 (Devlin 2018).' },
        { range: '-2 to 0', text: 'SCCM PADIS 2018 light-sedation target band.' },
        { range: '-5 to -3', text: 'Deeper than the SCCM PADIS 2018 target; consider lightening sedation.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Sessler CN, et al. Am J Respir Crit Care Med. 2002;166(10):1338-1344. SCCM PADIS 2018: Devlin JW, et al. Crit Care Med. 2018;46(9):e825-e873.',
    },
  },
  'sas-riker': {
    citation: 'Riker RR, Picard JT, Fraser GL. Prospective evaluation of the Sedation-Agitation Scale for adult critically ill patients. Crit Care Med. 1999;27(7):1325-1329.',
    specialties: ['critical-care', 'nursing-general'],
    example: {
      fields: { 'sk-level': '4' },
      expected: 'SAS 4: calm and cooperative; goal sedation per Riker 1999.',
    },
    interpretation: {
      bands: [
        { range: 'SAS 5-7', text: 'Agitated; review sedation, analgesia, and delirium per SCCM PADIS 2018.' },
        { range: 'SAS 3-4', text: 'Goal band per Riker 1999 / SCCM PADIS 2018.' },
        { range: 'SAS 1-2', text: 'Deeper than goal; consider lightening sedation.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Riker RR, et al. Crit Care Med. 1999;27(7):1325-1329. SCCM PADIS 2018 endorsement (Devlin 2018).',
    },
  },
  'cam-icu': {
    citation: 'Ely EW, Inouye SK, Bernard GR, et al. Delirium in mechanically ventilated patients: validity and reliability of the Confusion Assessment Method for the ICU (CAM-ICU). JAMA. 2001;286(21):2703-2710.',
    specialties: ['critical-care', 'nursing-icu', 'nursing-general', 'psychiatry'],
    example: {
      fields: { 'ci-f1': '0', 'ci-f2': '0', 'ci-f3': '0', 'ci-f4': '0' },
      expected: 'CAM-ICU negative per Ely 2001.',
    },
    interpretation: {
      bands: [
        { range: 'negative', text: 'CAM-ICU negative per Ely 2001 (no delirium detected).' },
        { range: 'positive', text: 'CAM-ICU positive per Ely 2001 (delirium present); review precipitants per SCCM PADIS 2018.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Ely EW, et al. JAMA. 2001;286(21):2703-2710. Four-feature algorithm: feature 1 AND feature 2 AND (feature 3 OR feature 4).',
    },
  },
  icdsc: {
    citation: 'Bergeron N, Dubois MJ, Dumont M, Dial S, Skrobik Y. Intensive Care Delirium Screening Checklist: evaluation of a new screening tool. Intensive Care Med. 2001;27(5):859-864.',
    specialties: ['critical-care', 'nursing-icu', 'nursing-general'],
    example: {
      fields: { 'id-a': '0', 'id-b': '0', 'id-c': '0', 'id-d': '0', 'id-e': '0', 'id-f': '0', 'id-g': '0', 'id-h': '0' },
      expected: 'ICDSC 0 of 8: below the Bergeron 2001 delirium cutoff (>=4).',
    },
    interpretation: {
      bands: [
        { range: '0-3', text: 'Below the Bergeron 2001 delirium cutoff (>=4).' },
        { range: '>=4', text: 'Delirium per Bergeron 2001.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Bergeron N, et al. Intensive Care Med. 2001;27(5):859-864 (8 binary items; cutoff >=4).',
    },
    derivation: {
      formula: 'ICDSC = sum of 8 binary items (each 0 or 1), range 0-8. Cutoff >=4 = delirium per Bergeron 2001.',
      components: [
        { inputKey: 'alteredLoc',                label: 'Altered level of consciousness',          points: 1 },
        { inputKey: 'inattention',               label: 'Inattention',                              points: 1 },
        { inputKey: 'disorientation',            label: 'Disorientation',                           points: 1 },
        { inputKey: 'hallucination',             label: 'Hallucination, delusion, or psychosis',    points: 1 },
        { inputKey: 'psychomotor',               label: 'Psychomotor agitation or retardation',     points: 1 },
        { inputKey: 'inappropriateSpeechOrMood', label: 'Inappropriate speech or mood',             points: 1 },
        { inputKey: 'sleepWakeDisturbance',      label: 'Sleep / wake cycle disturbance',           points: 1 },
        { inputKey: 'symptomFluctuation',        label: 'Symptom fluctuation',                      points: 1 },
      ],
      bands: [
        { range: [0, 3],                 label: 'below delirium cutoff' },
        { range: { op: '>=', value: 4 }, label: 'delirium per Bergeron 2001' },
      ],
      population: 'Bergeron 2001: derivation in 93 medical-surgical ICU patients at three Canadian hospitals. Validation against DSM-IV delirium by a psychiatrist as gold standard.',
      units: {
        alteredLoc: 'boolean', inattention: 'boolean', disorientation: 'boolean',
        hallucination: 'boolean', psychomotor: 'boolean',
        inappropriateSpeechOrMood: 'boolean',
        sleepWakeDisturbance: 'boolean', symptomFluctuation: 'boolean',
      },
      validity: 'Adult ICU patients. Each item is scored on observations over the preceding 8 or 24 hours (institutional convention); the score is a *screen* — a positive screen (>=4) prompts confirmation against DSM criteria or by trained psychiatry. Not validated in non-ICU populations (use CAM or 4AT). Not validated in pediatric ICU.',
      source: 'Bergeron N, Dubois MJ, Dumont M, Dial S, Skrobik Y. "Intensive Care Delirium Screening Checklist: evaluation of a new screening tool." Intensive Care Med. 2001;27(5):859-864.',
    },
  },
  '4at': {
    citation: 'MacLullich AMJ, Shenkin SD, Goodacre S, et al. The 4 "A"s Test for detecting delirium in acute medical patients (4AT): a diagnostic accuracy study. Health Technol Assess. 2019;23(40):1-194.',
    specialties: ['geriatrics', 'nursing-general', 'emergency-medicine', 'psychiatry'],
    example: {
      fields: { 'fa-alert': '0', 'fa-amt': '0', 'fa-att': '0', 'fa-acute': '0' },
      expected: '4AT 0 of 12: delirium or significant cognitive impairment unlikely per MacLullich 2019.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Delirium or significant cognitive impairment unlikely per MacLullich 2019.' },
        { range: '1-3', text: 'Possible cognitive impairment without delirium per MacLullich 2019.' },
        { range: '>=4', text: 'Possible delirium +/- cognitive impairment per MacLullich 2019.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'MacLullich AMJ, et al. Health Technol Assess. 2019;23(40):1-194 (cutoff >=4 for possible delirium).',
    },
    derivation: {
      formula: '4AT = sum of 4 items (range 0-12). Two binary items (alertness, acute change) contribute 4 points each; two 3-level items (AMT4 errors, attention months-backwards) contribute 0/1/2 each.\n  - Alertness abnormal (clearly drowsy or agitated) → 4; otherwise 0\n  - AMT4 (age, DOB, place, current year): 0 errors → 0; 1 error → 1; >=2 errors / untestable → 2\n  - Attention (months of year backwards): reaches >=7 → 0; starts but <7 → 1; untestable → 2\n  - Acute change or fluctuating course in cognition / mental status → 4; otherwise 0\nCutoff >= 4 = possible delirium ± cognitive impairment.',
      components: [
        { inputKey: 'alertnessAbnormal', label: 'Alertness abnormal (clearly drowsy or agitated) — 0 or 4', points: 4 },
        { inputKey: 'amt4Errors',        label: 'AMT4 errors (0=none, 1=one, 2=>=2 or untestable)',          points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'attentionScore',    label: 'Attention months-backwards (0=reaches >=7, 1=<7, 2=untestable)', points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'acuteChange',       label: 'Acute change / fluctuating course in cognition — 0 or 4',  points: 4 },
      ],
      bands: [
        { range: [0, 0],                 label: 'delirium or significant cognitive impairment unlikely' },
        { range: [1, 3],                 label: 'possible cognitive impairment without delirium' },
        { range: { op: '>=', value: 4 }, label: 'possible delirium ± cognitive impairment' },
      ],
      population: 'Diagnostic-accuracy validation in 785 acute-medical inpatients aged ≥65 across UK hospitals (MacLullich 2019). Reference standard: clinical delirium assessment by trained psychiatry / geriatrics.',
      units: {
        alertnessAbnormal: 'boolean',
        amt4Errors: 'integer 0-2',
        attentionScore: 'integer 0-2',
        acuteChange: 'boolean',
      },
      validity: 'Adults in acute medical / ED / inpatient settings. The 4AT is designed for rapid bedside use without specialist training (median admin time ~2 min). NOT intended as a stand-alone diagnostic test — a positive screen (>=4) should prompt formal delirium assessment. NOT validated in ICU patients (use CAM-ICU or ICDSC) or for tracking severity over time (the score is binary-pass / fail in design).',
      source: 'MacLullich AMJ, Shenkin SD, Goodacre S, et al. "The 4 \'A\'s Test for detecting delirium in acute medical patients (4AT): a diagnostic accuracy study." Health Technol Assess. 2019;23(40):1-194.',
    },
  },

  // ---- spec-v13 §3.3 wave 13-3: ICU pain bundle ----
  cpot: {
    citation: 'Gelinas C, Fillion L, Puntillo KA, Viens C, Fortier M. Validation of the Critical-Care Pain Observation Tool in adult patients. Am J Crit Care. 2006;15(4):420-427.',
    specialties: ['critical-care', 'nursing-icu', 'nursing-general'],
    example: {
      fields: { 'cp-f': '0', 'cp-b': '0', 'cp-m': '0', 'cp-c': '0' },
      expected: 'CPOT 0 of 8: acceptable pain per Gelinas 2006 (cutoff <3).',
    },
    interpretation: {
      bands: [
        { range: '0-2', text: 'Acceptable pain per Gelinas 2006 (cutoff <3).' },
        { range: '>=3', text: 'Unacceptable pain per Gelinas 2006 (cutoff >=3); review analgesia per SCCM PADIS 2018.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Gelinas C, et al. Am J Crit Care. 2006;15(4):420-427 (four behaviors each 0-2; cutoff >=3).',
    },
    derivation: {
      formula: 'CPOT = sum of 4 nurse-observed behaviors (each 0-2), range 0-8. Cutoff >=3 = unacceptable pain.\n  Facial expression: 0 relaxed neutral / 1 tense (frowning, brow lowering) / 2 grimacing\n  Body movements: 0 absence / 1 protection (slow / cautious; touching pain site) / 2 restlessness or agitation\n  Muscle tension (assess by passive flexion-extension): 0 relaxed / 1 tense rigid / 2 very tense or rigid\n  Compliance with ventilator (intubated) OR vocalization (extubated): 0 tolerating / talking in normal tone; 1 coughing but tolerating, sighing, moaning; 2 fighting ventilator / crying out',
      components: [
        { inputKey: 'facial',                   label: 'Facial expression (0-2)',                          points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'body',                     label: 'Body movements (0-2)',                              points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'muscleTension',            label: 'Muscle tension (0-2; assess by passive flex/ext)',  points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'complianceOrVocalization', label: 'Vent compliance (intubated) / vocalization (extubated) (0-2)', points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: [0, 2],                 label: 'acceptable pain (cutoff <3)' },
        { range: { op: '>=', value: 3 }, label: 'unacceptable pain (cutoff >=3); review analgesia' },
      ],
      population: 'Gelinas 2006: validation in 105 adult cardiac-surgery ICU patients (intubated and extubated) at a Canadian tertiary center. Reference standards: patient self-report (extubated) and Behavioral Pain Scale (intubated).',
      units: {
        facial: 'integer 0-2', body: 'integer 0-2',
        muscleTension: 'integer 0-2',
        complianceOrVocalization: 'integer 0-2',
      },
      validity: 'Adult ICU patients (intubated AND extubated). CPOT is a behavioral pain assessment for patients who cannot self-report; if the patient can self-report reliably, the numeric rating scale (NRS) is the preferred tool. Endorsed by SCCM PADIS 2018 (Devlin 2018) for adult ICU pain monitoring. NOT validated in deeply sedated (RASS ≤ -4) or paralyzed patients — both reduce observable pain behaviors. NOT validated in pediatric ICU (use FLACC or COMFORT-B).',
      source: 'Gelinas C, Fillion L, Puntillo KA, Viens C, Fortier M. "Validation of the Critical-Care Pain Observation Tool in adult patients." Am J Crit Care. 2006;15(4):420-427.',
    },
  },
  bps: {
    citation: 'Payen JF, Bru O, Bosson JL, et al. Assessing pain in critically ill sedated patients by using a behavioral pain scale. Crit Care Med. 2001;29(12):2258-2263.',
    specialties: ['critical-care', 'nursing-icu', 'nursing-general', 'anesthesiology'],
    example: {
      fields: { 'bp-f': '1', 'bp-u': '1', 'bp-v': '1' },
      expected: 'BPS 3 of 12: acceptable pain per Payen 2001 (cutoff <=5).',
    },
    interpretation: {
      bands: [
        { range: '3-5', text: 'Acceptable pain per Payen 2001 (cutoff <=5).' },
        { range: '>5', text: 'Unacceptable pain per Payen 2001 (cutoff >5); review analgesia per SCCM PADIS 2018.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Payen JF, et al. Crit Care Med. 2001;29(12):2258-2263 (three behaviors each 1-4; cutoff >5).',
    },
    derivation: {
      formula: 'BPS = sum of 3 nurse-observed behaviors (each 1-4), range 3-12. Cutoff >5 = unacceptable pain.\n  Facial expression: 1 relaxed / 2 partially tightened (brow lowering) / 3 fully tightened (eyelid closing) / 4 grimacing\n  Upper limb movements: 1 no movement / 2 partially bent / 3 fully bent with finger flexion / 4 permanently retracted\n  Compliance with mechanical ventilation: 1 tolerating / 2 coughing but tolerating most of the time / 3 fighting ventilator / 4 unable to control ventilation',
      components: [
        { inputKey: 'facial',               label: 'Facial expression (1-4)',                                points: (v) => Math.max(1, Math.min(4, Math.round(Number(v) || 1))) },
        { inputKey: 'upperLimb',            label: 'Upper limb movements (1-4)',                              points: (v) => Math.max(1, Math.min(4, Math.round(Number(v) || 1))) },
        { inputKey: 'ventilatorCompliance', label: 'Compliance with mechanical ventilation (1-4)',            points: (v) => Math.max(1, Math.min(4, Math.round(Number(v) || 1))) },
      ],
      bands: [
        { range: [3, 5],                 label: 'acceptable pain (cutoff <=5)' },
        { range: { op: '>=', value: 6 }, label: 'unacceptable pain (cutoff >5); review analgesia' },
      ],
      population: 'Payen 2001: derivation in 30 deeply sedated mechanically ventilated ICU patients at a French university hospital. Subsequent validation in larger cohorts including the SCCM PADIS literature.',
      units: {
        facial: 'integer 1-4', upperLimb: 'integer 1-4',
        ventilatorCompliance: 'integer 1-4',
      },
      validity: 'Mechanically ventilated, sedated adult ICU patients. BPS was the first widely-adopted behavioral pain scale for sedated mechanically ventilated patients. Endorsed by SCCM PADIS 2018 (Devlin 2018) alongside CPOT. Because every component starts at 1 (not 0), the minimum aggregate is 3 — a "zero pain" reading in the source sense IS a BPS of 3. NOT validated in extubated patients (use CPOT or self-report); NOT validated in pediatric ICU.',
      source: 'Payen JF, Bru O, Bosson JL, Lagrasta A, Novel E, Deschaux I, Lavagne P, Jacquot C. "Assessing pain in critically ill sedated patients by using a behavioral pain scale." Crit Care Med. 2001;29(12):2258-2263.',
    },
  },

  // ---- spec-v13 §3.4 wave 13-4: nutrition risk bundle ----
  nutric: {
    citation: 'Heyland DK, Dhaliwal R, Jiang X, Day AG. Identifying critically ill patients who benefit the most from nutrition therapy: the development and initial validation of a novel risk assessment tool. Crit Care. 2011;15(6):R268.',
    specialties: ['critical-care', 'nursing-general', 'pharmacy'],
    example: {
      fields: { 'nt-age': '55', 'nt-apache': '18', 'nt-sofa': '6', 'nt-comorb': '1', 'nt-days': '0', 'nt-il6': '0' },
      expected: 'NUTRIC 3 of 10: low nutritional risk per Heyland 2011 (cutoff >=6).',
    },
    interpretation: {
      bands: [
        { range: '0-5', text: 'Low nutritional risk per Heyland 2011.' },
        { range: '>=6', text: 'High nutritional risk per Heyland 2011 (cutoff >=6); benefits most from aggressive nutrition therapy.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Heyland DK, et al. Crit Care. 2011;15(6):R268 §Methods (6-component weighted sum; cutoff >=6).',
    },
  },
  mnutric: {
    citation: 'Rahman A, Hasan RM, Agarwala R, Martin C, Day AG, Heyland DK. Identifying critically-ill patients who will benefit most from nutritional therapy: further validation of the "modified NUTRIC" nutritional risk assessment tool. Clin Nutr. 2016;35(1):158-162.',
    specialties: ['critical-care', 'nursing-general', 'pharmacy'],
    example: {
      fields: { 'mn-age': '55', 'mn-apache': '18', 'mn-sofa': '6', 'mn-comorb': '1', 'mn-days': '0' },
      expected: 'mNUTRIC 3 of 9: low nutritional risk per Rahman 2016 (cutoff >=5).',
    },
    interpretation: {
      bands: [
        { range: '0-4', text: 'Low nutritional risk per Rahman 2016.' },
        { range: '>=5', text: 'High nutritional risk per Rahman 2016 (cutoff >=5; IL-6 omitted from the original NUTRIC).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Rahman A, et al. Clin Nutr. 2016;35(1):158-162 (NUTRIC without IL-6; cutoff >=5).',
    },
  },
  nrs2002: {
    citation: 'Kondrup J, Rasmussen HH, Hamberg O, Stanga Z. Nutritional risk screening (NRS 2002): a new method based on an analysis of controlled clinical trials. Clin Nutr. 2003;22(3):321-336.',
    specialties: ['nursing-general', 'geriatrics', 'pharmacy'],
    example: {
      fields: { 'nr-sev': '1', 'nr-nut': '1', 'nr-age': '0' },
      expected: 'NRS-2002 2: not at risk for malnutrition per Kondrup 2003 (ESPEN-endorsed cutoff >=3).',
    },
    interpretation: {
      bands: [
        { range: '0-2', text: 'Not at risk for malnutrition per Kondrup 2003.' },
        { range: '>=3', text: 'At risk for malnutrition per Kondrup 2003 (ESPEN-endorsed cutoff >=3); nutritional support indicated.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Kondrup J, et al. Clin Nutr. 2003;22(3):321-336 (severity 0-3 + nutritional status 0-3 + age >=70 +1; cutoff >=3).',
    },
  },
  'must-nutrition': {
    citation: 'BAPEN. The "MUST" Explanatory Booklet. British Association for Parenteral and Enteral Nutrition; 2003 (reprinted with minor revisions). Tool derived by Elia M et al. on behalf of the MAG/BAPEN Working Group.',
    specialties: ['nursing-general', 'geriatrics'],
    example: {
      fields: { 'mu-bmi': '22', 'mu-wl': '0', 'mu-acute': '0' },
      expected: 'MUST 0: low malnutrition risk per BAPEN 2003.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Low malnutrition risk per BAPEN 2003.' },
        { range: '1', text: 'Medium malnutrition risk per BAPEN 2003; observe and document intake.' },
        { range: '>=2', text: 'High malnutrition risk per BAPEN 2003; refer to dietitian / nutritional support team.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'BAPEN. The MUST Explanatory Booklet. 2003 (BMI 0-2 + weight loss 0-2 + acute disease no intake >5 days = 2 else 0; 0 low / 1 medium / >=2 high).',
    },
    derivation: {
      formula: 'MUST = BMI band + unplanned-weight-loss band + acute disease modifier. Range 0-6.\n  BMI (kg/m^2):    >20 (0)  | 18.5-20 (1)  | <18.5 (2)\n  Unplanned weight loss in last 3-6 months: <5% (0) | 5-10% (1) | >10% (2)\n  Acutely ill AND no nutritional intake for >5 days (+2)\nBands per BAPEN 2003: 0 low risk; 1 medium risk (observe + document intake); >=2 high risk (refer to dietitian).',
      components: [
        { inputKey: 'bmi',                          label: 'BMI band (>20: 0 / 18.5-20: 1 / <18.5: 2)',                       points: (v) => { const n = Number(v); if (!Number.isFinite(n)) return 0; if (n < 18.5) return 2; if (n <= 20) return 1; return 0; } },
        { inputKey: 'weightLossPct',                label: 'Unplanned weight loss in 3-6 months (<5%: 0 / 5-10%: 1 / >10%: 2)', points: (v) => { const n = Number(v); if (!Number.isFinite(n)) return 0; if (n > 10) return 2; if (n >= 5) return 1; return 0; } },
        { inputKey: 'acuteDiseaseNoIntakeGt5d',     label: 'Acutely ill AND no nutritional intake for >5 days (+2)',         points: 2 },
      ],
      bands: [
        { range: [0, 0],                 label: 'low malnutrition risk' },
        { range: [1, 1],                 label: 'medium malnutrition risk; observe and document intake' },
        { range: { op: '>=', value: 2 }, label: 'high malnutrition risk; refer to dietitian / nutritional support team' },
      ],
      population: 'BAPEN 2003: consensus-built tool developed by the Malnutrition Advisory Group of BAPEN for use across hospital, community, and care-home adult populations. Construct-validated against multiple anthropometric and clinical-outcome reference standards in the MUST Report (Elia 2003) including length of stay, mortality, and discharge destination.',
      units: {
        bmi: 'kg/m^2 (height-corrected weight; alternate measures listed in the BAPEN booklet may be substituted)',
        weightLossPct: 'percent of usual body weight lost over the preceding 3-6 months',
        acuteDiseaseNoIntakeGt5d: 'boolean (acute illness AND nil-by-mouth or markedly reduced intake for >5 days)',
      },
      validity: 'Adults in hospital, community, and care-home settings; widely used in the UK NHS. The acute-illness component is intended for patients in whom the underlying disease has caused or is likely to cause nil-by-mouth for >5 days; the BAPEN booklet provides alternate measurements (ulna length, knee height, mid-upper-arm circumference) when BMI cannot be obtained directly. Not a diagnosis of malnutrition — a screen to trigger formal nutritional assessment. Not validated for pediatrics (use STAMP / PYMS / similar pediatric tools) or for active end-stage cancer cachexia (use cancer-specific tools like PG-SGA).',
      source: 'BAPEN. "The \'MUST\' Explanatory Booklet." British Association for Parenteral and Enteral Nutrition; 2003 (reprinted with minor revisions). Derived by the Malnutrition Advisory Group (MAG) of BAPEN.',
    },
  },

  // ---- spec-v13 §3.5 wave 13-5: ventilation & lung-injury bundle ----
  rox: {
    citation: 'Roca O, Caralt B, Messika J, et al. An index combining respiratory rate and oxygenation to predict outcome of nasal high-flow therapy. Am J Respir Crit Care Med. 2019;199(11):1368-1376.',
    specialties: ['critical-care', 'pulmonology', 'emergency-medicine'],
    example: {
      fields: { 'rx-spo2': '94', 'rx-fio2': '0.5', 'rx-rr': '24', 'rx-hr': '12' },
      expected: 'ROX 7.83: success-predicting (>=4.88 per Roca 2019).',
    },
    interpretation: {
      bands: [
        { range: '>=4.88', text: 'Success-predicting per Roca 2019 (cutoff >=4.88 at 2 / 6 / 12 h post-HFNC start).' },
        { range: 'failure cutoff', text: 'Failure-predicting at the stated time point per Roca 2019 Figure 2 (<2.85 at 2 h; <3.47 at 6 h; <3.85 at 12 h).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Roca O, et al. Am J Respir Crit Care Med. 2019;199(11):1368-1376 Figure 2 (cutoffs at 2 / 6 / 12 h).',
    },
  },
  hacor: {
    citation: 'Duan J, Han X, Bai L, Zhou L, Huang S. Assessment of heart rate, acidosis, consciousness, oxygenation, and respiratory rate to predict noninvasive ventilation failure in hypoxemic patients. Intensive Care Med. 2017;43(2):192-199.',
    specialties: ['critical-care', 'pulmonology', 'emergency-medicine'],
    example: {
      fields: { 'hc-hr': '110', 'hc-ph': '7.40', 'hc-gcs': '15', 'hc-pao2': '120', 'hc-fio2': '0.5', 'hc-rr': '25' },
      expected: 'HACOR 0: not in the Duan 2017 high-risk band (cutoff >5).',
    },
    interpretation: {
      bands: [
        { range: '0-5', text: 'Not in the Duan 2017 NIV-failure high-risk band.' },
        { range: '>5', text: 'High risk of NIV failure at 1 hour per Duan 2017 (cutoff >5; specificity ~90%).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Duan J, et al. Intensive Care Med. 2017;43(2):192-199 Table 1 (HR, pH, GCS, PaO2/FiO2, RR weights; cutoff >5 at 1 hour of NIV).',
    },
  },
  'berlin-ards': {
    citation: 'ARDS Definition Task Force, Ranieri VM, Rubenfeld GD, et al. Acute Respiratory Distress Syndrome: The Berlin Definition. JAMA. 2012;307(23):2526-2533.',
    specialties: ['critical-care', 'pulmonology'],
    example: {
      fields: { 'ba-timing': '0', 'ba-bilat': '0', 'ba-not': '0', 'ba-peep': '0', 'ba-pao2': '', 'ba-fio2': '' },
      expected: 'ARDS criteria not met per Berlin definition (Ranieri 2012).',
    },
    interpretation: {
      bands: [
        { range: 'not met', text: 'ARDS criteria not met per Berlin 2012 (timing <=1 wk, bilateral opacities, not cardiac/overload, PEEP >=5 all required).' },
        { range: 'mild', text: 'ARDS, mild: PaO2/FiO2 200-300 on PEEP >=5 (Berlin 2012).' },
        { range: 'moderate', text: 'ARDS, moderate: PaO2/FiO2 100-200 on PEEP >=5 (Berlin 2012).' },
        { range: 'severe', text: 'ARDS, severe: PaO2/FiO2 <=100 on PEEP >=5 (Berlin 2012).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'ARDS Definition Task Force. JAMA. 2012;307(23):2526-2533 Table 1.',
    },
  },
  'lis-murray': {
    citation: 'Murray JF, Matthay MA, Luce JM, Flick MR. An expanded definition of the adult respiratory distress syndrome. Am Rev Respir Dis. 1988;138(3):720-723.',
    specialties: ['critical-care', 'pulmonology', 'cardiology'],
    example: {
      fields: { 'lm-quad': '0', 'lm-pao2': '300', 'lm-fio2': '0.4', 'lm-peep': '5', 'lm-comp': '80' },
      expected: 'Murray LIS 0.00: no lung injury per Murray 1988.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'No lung injury per Murray 1988.' },
        { range: '0.1-2.5', text: 'Mild-to-moderate lung injury per Murray 1988.' },
        { range: '>2.5', text: 'Severe lung injury per Murray 1988; ECMO referral per ELSO 2017 may be appropriate.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Murray JF, et al. Am Rev Respir Dis. 1988;138(3):720-723 (CXR quadrants + PaO2/FiO2 + PEEP + compliance, each 0-4; average of four). ECMO context per ELSO 2017 guidelines.',
    },
  },
  lips: {
    citation: 'Gajic O, Dabbagh O, Park PK, et al. Early identification of patients at risk of acute lung injury: evaluation of lung injury prediction score in a multicenter cohort study. Am J Respir Crit Care Med. 2011;183(4):462-470.',
    specialties: ['critical-care', 'emergency-medicine', 'pulmonology'],
    example: {
      fields: { 'lp-shock': '0', 'lp-asp': '0', 'lp-sep': '0', 'lp-pna': '0', 'lp-surg': '0', 'lp-trauma': '0', 'lp-etoh': '0', 'lp-obese': '0', 'lp-alb': '0', 'lp-chemo': '0', 'lp-fio2': '0', 'lp-tach': '0', 'lp-spo2': '0', 'lp-acid': '0', 'lp-dm': '0' },
      expected: 'LIPS 0: below the Gajic 2011 ALI/ARDS high-risk cutoff (>=4).',
    },
    interpretation: {
      bands: [
        { range: '<4', text: 'Below the Gajic 2011 ALI/ARDS high-risk cutoff.' },
        { range: '>=4', text: 'High risk for ALI/ARDS development per Gajic 2011 (cutoff >=4).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Gajic O, et al. Am J Respir Crit Care Med. 2011;183(4):462-470 Table 2 (weighted predisposing conditions and modifiers; diabetes -1).',
    },
    derivation: {
      formula: 'LIPS = sum across 15 weighted yes/no factors (Gajic 2011 Table 2). Range -1 to +20. Diabetes is the only protective (negative-weighted) factor.\n  Predisposing conditions:\n    Shock                                                       (+2)\n    Aspiration                                                  (+2)\n    Sepsis                                                      (+1)\n    Pneumonia                                                   (+1.5)\n    High-risk surgery (orthopedic spine, acute abdomen, cardiac, aortic vascular, emergent)  (+1.5)\n    High-risk trauma (TBI, smoke inhalation, near drowning, lung contusion, multiple fractures)  (+2)\n  Risk modifiers:\n    Alcohol abuse                                               (+1)\n    Obesity (BMI > 30)                                          (+1)\n    Hypoalbuminemia                                             (+1)\n    Chemotherapy                                                (+1)\n    FiO2 > 0.35 or O2 > 4 L/min                                 (+2)\n    Tachypnea (RR > 30)                                         (+1.5)\n    SpO2 < 95%                                                  (+1)\n    Acidosis (pH < 7.35)                                        (+1.5)\n    Diabetes mellitus (PROTECTIVE)                              (-1)\nCutoff per Gajic 2011: >= 4 = high risk for ALI/ARDS development.',
      components: [
        { inputKey: 'shock',            label: 'Shock (+2)',                                          points: 2 },
        { inputKey: 'aspiration',       label: 'Aspiration (+2)',                                     points: 2 },
        { inputKey: 'sepsis',           label: 'Sepsis (+1)',                                         points: 1 },
        { inputKey: 'pneumonia',        label: 'Pneumonia (+1.5)',                                    points: 1.5 },
        { inputKey: 'highRiskSurgery',  label: 'High-risk surgery (+1.5)',                            points: 1.5 },
        { inputKey: 'highRiskTrauma',   label: 'High-risk trauma (+2)',                               points: 2 },
        { inputKey: 'alcoholAbuse',     label: 'Alcohol abuse (+1)',                                  points: 1 },
        { inputKey: 'obesityBmiGt30',   label: 'Obesity (BMI > 30) (+1)',                             points: 1 },
        { inputKey: 'hypoalbuminemia',  label: 'Hypoalbuminemia (+1)',                                points: 1 },
        { inputKey: 'chemotherapy',     label: 'Chemotherapy (+1)',                                   points: 1 },
        { inputKey: 'fio2Gt035or4L',    label: 'FiO2 > 0.35 or O2 > 4 L/min (+2)',                    points: 2 },
        { inputKey: 'tachypneaRrGt30',  label: 'Tachypnea (RR > 30) (+1.5)',                          points: 1.5 },
        { inputKey: 'spo2Lt95',         label: 'SpO2 < 95% (+1)',                                     points: 1 },
        { inputKey: 'acidosisPhLt735',  label: 'Acidosis (pH < 7.35) (+1.5)',                         points: 1.5 },
        { inputKey: 'diabetes',         label: 'Diabetes mellitus (PROTECTIVE, -1)',                  points: -1 },
      ],
      bands: [
        { range: { op: '<', value: 4 },  label: 'below the ALI / ARDS high-risk cutoff' },
        { range: { op: '>=', value: 4 }, label: 'high risk for ALI / ARDS development' },
      ],
      population: 'Gajic 2011: multicenter prospective cohort of 5584 adult patients admitted to 22 US hospitals via the ED or an OR with at least one ALI risk factor. Outcome: development of acute lung injury (ALI; per the 1994 American-European Consensus Conference criteria used at the time, later superseded by Berlin 2012). LIPS was calculated within 6 hours of presentation; ALI was assessed at any point during hospitalization.',
      units: {
        shock: 'boolean', aspiration: 'boolean', sepsis: 'boolean',
        pneumonia: 'boolean', highRiskSurgery: 'boolean', highRiskTrauma: 'boolean',
        alcoholAbuse: 'boolean', obesityBmiGt30: 'boolean', hypoalbuminemia: 'boolean',
        chemotherapy: 'boolean', fio2Gt035or4L: 'boolean', tachypneaRrGt30: 'boolean',
        spo2Lt95: 'boolean', acidosisPhLt735: 'boolean',
        diabetes: 'boolean (PROTECTIVE: -1 weight)',
      },
      validity: 'Adults presenting via ED or OR with at least one ALI / ARDS risk factor, scored within 6 hours of presentation. LIPS predicts subsequent ALI / ARDS development with sensitivity ~69% and specificity ~78% at the >=4 cutoff in the derivation cohort. The diabetes -1 modifier is consistent with cohort observations of a paradoxically lower ARDS incidence among diabetics; the mechanism is unsettled and the modifier should not be interpreted as a treatment recommendation. Subsequent ALI/ARDS criteria were updated to the Berlin Definition (Ranieri 2012); LIPS continues to be validated against Berlin in newer cohorts. Not validated for non-ED/OR admissions, pediatrics, or for the prevention rather than prediction of ARDS.',
      source: 'Gajic O, Dabbagh O, Park PK, Adesanya A, Chang SY, Hou P, Anderson H 3rd, Hoth JJ, Mikkelsen ME, Gentile NT, Gong MN, Talmor D, Bajwa E, Watkins TR, Festic E, Yilmaz M, Iscimen R, Kaufman DA, Esper AM, Sadikot R, Douglas I, Sevransky J, Malinchoc M; U.S. Critical Illness and Injury Trials Group: Lung Injury Prevention Study Investigators (USCIITG-LIPS). "Early identification of patients at risk of acute lung injury: evaluation of lung injury prediction score in a multicenter cohort study." Am J Respir Crit Care Med. 2011;183(4):462-470.',
    },
  },

  // ---- spec-v13 §3.6 wave 13-6: vasoactive load ----
  vis: {
    citation: 'Gaies MG, Gurney JG, Yen AH, et al. Vasoactive-inotropic score as a predictor of morbidity and mortality in infants after cardiopulmonary bypass. Pediatr Crit Care Med. 2010;11(2):234-238.',
    specialties: ['critical-care', 'cardiology', 'pediatrics', 'anesthesiology'],
    example: {
      fields: { 'vs-dop': '0', 'vs-dob': '0', 'vs-epi': '0', 'vs-ne': '0', 'vs-mil': '0', 'vs-vaso': '0' },
      expected: 'VIS 0.0: low vasoactive load per Gaies 2010 Table 2.',
    },
    interpretation: {
      bands: [
        { range: '<10', text: 'Low vasoactive load per Gaies 2010 Table 2.' },
        { range: '10-19', text: 'Moderate vasoactive load per Gaies 2010 Table 2.' },
        { range: '>=20', text: 'High vasoactive load per Gaies 2010 (associated with increased morbidity / mortality in the post-CPB cohort).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Gaies MG, et al. Pediatr Crit Care Med. 2010;11(2):234-238. Also surfaces the simpler Inotrope Score (IS) per Wernovsky 1995.',
    },
  },

  // ---- spec-v13 §3.1 wave 13-1: ICU mortality scoring (partial) ----
  mods: {
    citation: 'Marshall JC, Cook DJ, Christou NV, Bernard GR, Sprung CL, Sibbald WJ. Multiple Organ Dysfunction Score: a reliable descriptor of a complex clinical outcome. Crit Care Med. 1995;23(10):1638-1652.',
    specialties: ['critical-care'],
    example: {
      fields: { 'mods-pf': '350', 'mods-cr': '1.0', 'mods-bili': '1.0', 'mods-par': '8', 'mods-plt': '200', 'mods-gcs': '15' },
      expected: 'MODS 0 of 24: ICU mortality 0% per Marshall 1995 Table 4.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'ICU mortality 0% per Marshall 1995 Table 4.' },
        { range: '1-4', text: 'ICU mortality ~1-2% per Marshall 1995 Table 4.' },
        { range: '5-8', text: 'ICU mortality ~3-5% per Marshall 1995 Table 4.' },
        { range: '9-12', text: 'ICU mortality ~25% per Marshall 1995 Table 4.' },
        { range: '13-16', text: 'ICU mortality ~50% per Marshall 1995 Table 4.' },
        { range: '17-20', text: 'ICU mortality ~75% per Marshall 1995 Table 4.' },
        { range: '21-24', text: 'ICU mortality ~100% per Marshall 1995 Table 4.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Marshall JC, et al. Crit Care Med. 1995;23(10):1638-1652 Tables 1 and 4. PAR = HR x CVP / MAP (Marshall used right atrial pressure / MAP).',
    },
  },

  // ---- spec-v13 §3.7 wave 13-7: severe CAP triage ----
  'smart-cop': {
    citation: 'Charles PGP, Wolfe R, Whitby M, et al. SMART-COP: a tool for predicting the need for intensive respiratory or vasopressor support in community-acquired pneumonia. Clin Infect Dis. 2008;47(3):375-384.',
    specialties: ['pulmonology', 'infectious-disease', 'emergency-medicine'],
    example: {
      fields: { 'sc-age': '55', 'sc-sbp': '0', 'sc-multi': '0', 'sc-alb': '0', 'sc-rr': '20', 'sc-pao2': '90', 'sc-spo2': '96', 'sc-pf': '400', 'sc-hr': '0', 'sc-conf': '0', 'sc-ph': '0' },
      expected: 'SMART-COP 0: low risk per Charles 2008.',
    },
    interpretation: {
      bands: [
        { range: '0-2', text: 'Low risk per Charles 2008.' },
        { range: '3-4', text: 'Moderate risk; intensive respiratory or vasopressor support possible per Charles 2008.' },
        { range: '>=5', text: 'High risk of needing intensive respiratory or vasopressor support per Charles 2008.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Charles PGP, et al. Clin Infect Dis. 2008;47(3):375-384 Table 1 (age-adjusted RR and oxygenation thresholds applied at age <=50 vs >50).',
    },
  },
  crb65: {
    citation: 'Lim WS, van der Eerden MM, Laing R, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax. 2003;58(5):377-382.',
    specialties: ['pulmonology', 'infectious-disease', 'emergency-medicine'],
    example: {
      fields: { 'cr-conf': '0', 'cr-rr': '0', 'cr-bp': '0', 'cr-age': '0' },
      expected: 'CRB-65 0: 30-day mortality ~1.2% per Lim 2003; outpatient management likely appropriate.',
    },
    interpretation: {
      bands: [
        { range: '0', text: '30-day mortality ~1.2% per Lim 2003; outpatient management likely appropriate.' },
        { range: '1-2', text: '30-day mortality ~8.2% per Lim 2003; consider hospital management.' },
        { range: '3-4', text: '30-day mortality ~31.4% per Lim 2003; urgent hospital management indicated.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Lim WS, et al. Thorax. 2003;58(5):377-382. Ships alongside the existing curb-65 tile for sites without BUN at presentation.',
    },
    derivation: {
      formula: 'CRB-65 = sum of 4 binary criteria, range 0-4.\n  Confusion (new disorientation or mental confusion)               (+1)\n  Respiratory rate >= 30 / min                                       (+1)\n  Blood pressure: SBP < 90 mmHg OR DBP <= 60 mmHg                    (+1)\n  Age >= 65 years                                                    (+1)\nBands per Lim 2003 (30-day mortality): 0 -> ~1.2% (outpatient); 1-2 -> ~8.2% (consider hospital); 3-4 -> ~31.4% (urgent hospital).',
      components: [
        { inputKey: 'confusion',          label: 'C — Confusion (new disorientation or mental confusion) (+1)', points: 1 },
        { inputKey: 'rrGe30',             label: 'R — Respiratory rate >= 30 / min (+1)',                       points: 1 },
        { inputKey: 'sbpLt90OrDbpLe60',   label: 'B — SBP < 90 mmHg OR DBP <= 60 mmHg (+1)',                    points: 1 },
        { inputKey: 'ageGe65',            label: '65 — Age >= 65 years (+1)',                                   points: 1 },
      ],
      bands: [
        { range: [0, 0], label: '30-day mortality ~1.2% (outpatient management likely appropriate)' },
        { range: [1, 2], label: '30-day mortality ~8.2% (consider hospital management)' },
        { range: [3, 4], label: '30-day mortality ~31.4% (urgent hospital management indicated)' },
      ],
      population: 'Lim 2003: international derivation and validation across three prospective cohorts (1068 derivation patients in the UK, 1675 validation in New Zealand, 295 validation in the Netherlands) of adults with community-acquired pneumonia. CRB-65 is the simplified outpatient-friendly variant of CURB-65 that omits the Urea (BUN) component for sites without admission labs.',
      units: {
        confusion: 'boolean (new-onset disorientation to person, place, or time, or AMTS <= 8)',
        rrGe30: 'boolean (respiratory rate >= 30 / min)',
        sbpLt90OrDbpLe60: 'boolean (SBP < 90 mmHg OR DBP <= 60 mmHg)',
        ageGe65: 'boolean (age >= 65 years)',
      },
      validity: 'Adults with community-acquired pneumonia presenting to primary care or to a community / outpatient setting without rapid access to laboratory testing. The full CURB-65 (with Urea) discriminates slightly better in the inpatient setting; ATS/IDSA 2019 guidance (Metlay 2019) cautions against using either score as the sole admission trigger and lists CRB-65 / CURB-65 alongside PSI/PORT and clinical judgement. Not validated for healthcare-associated pneumonia, immunocompromised patients, or pediatric pneumonia.',
      source: 'Lim WS, van der Eerden MM, Laing R, Boersma WG, Karalus N, Town GI, Lewis SA, Macfarlane JT. "Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study." Thorax. 2003;58(5):377-382.',
    },
  },
  'ats-idsa-cap': {
    citation: 'Metlay JP, Waterer GW, Long AC, et al. Diagnosis and Treatment of Adults with Community-acquired Pneumonia. An Official Clinical Practice Guideline of the American Thoracic Society and Infectious Diseases Society of America. Am J Respir Crit Care Med. 2019;200(7):e45-e67.',
    specialties: ['pulmonology', 'infectious-disease', 'emergency-medicine', 'critical-care'],
    example: {
      fields: { 'ai-major-vp': '0', 'ai-major-mv': '0', 'ai-rr': '0', 'ai-pf': '0', 'ai-multi': '0', 'ai-conf': '0', 'ai-bun': '0', 'ai-leuk': '0', 'ai-plt': '0', 'ai-hypo': '0', 'ai-fluid': '0' },
      expected: 'Not severe per ATS/IDSA 2019 (0 major + 0 minor; requires >=1 major or >=3 minor).',
    },
    interpretation: {
      bands: [
        { range: 'not severe', text: 'Not severe per ATS/IDSA 2019.' },
        { range: 'severe', text: 'Severe CAP per ATS/IDSA 2019 (>=1 major or >=3 minor); ICU admission per Metlay 2019 Table 1.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Metlay JP, et al. Am J Respir Crit Care Med. 2019;200(7):e45-e67 Table 1.',
    },
  },
  drip: {
    citation: 'Webb BJ, Dascomb K, Stenehjem E, et al. Derivation and Multicenter Validation of the Drug Resistance in Pneumonia Clinical Prediction Score. Antimicrob Agents Chemother. 2016;60(5):2652-2663.',
    specialties: ['infectious-disease', 'pulmonology', 'emergency-medicine', 'pharmacy'],
    example: {
      fields: { 'dr-abx': '0', 'dr-ltc': '0', 'dr-tube': '0', 'dr-mdr': '0', 'dr-hosp': '0', 'dr-cpd': '0', 'dr-func': '0', 'dr-ppi': '0', 'dr-wound': '0', 'dr-mrsa': '0' },
      expected: 'DRIP 0: low risk for drug-resistant pneumonia per Webb 2016 (cutoff >=4).',
    },
    interpretation: {
      bands: [
        { range: '<4', text: 'Low risk for drug-resistant pneumonia per Webb 2016.' },
        { range: '>=4', text: 'High risk for drug-resistant pneumonia per Webb 2016; consider broader empiric coverage (2019 ATS/IDSA endorsement).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Webb BJ, et al. Antimicrob Agents Chemother. 2016;60(5):2652-2663 (4 major risk factors at 2 each; 6 minor at 1 each; cutoff >=4).',
    },
  },

  // ---- spec-v14 §3.2 wave 14-2 (partial): sleep-disordered breathing ----
  'stop-bang': {
    citation: 'Chung F, Yegneswaran B, Liao P, et al. STOP questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology. 2008;108(5):812-821. (BANG extension: Chung F, et al. High STOP-Bang score indicates a high probability of obstructive sleep apnoea. Br J Anaesth. 2012;108(5):768-775.)',
    specialties: ['anesthesiology', 'pulmonology', 'nursing-general'],
    example: {
      fields: { 'sb-s': '0', 'sb-t': '0', 'sb-o': '0', 'sb-p': '0', 'sb-b': '0', 'sb-a': '0', 'sb-n': '0', 'sb-g': '0' },
      expected: 'STOP-BANG 0 of 8: low risk for OSA per Chung 2012 (0-2 band).',
    },
    interpretation: {
      bands: [
        { range: '0-2', text: 'Low risk for obstructive sleep apnea per Chung 2012.' },
        { range: '3-4', text: 'Intermediate risk for OSA per Chung 2012; consider further evaluation.' },
        { range: '5-8', text: 'High risk for moderate-to-severe OSA per Chung 2012 Table 3.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Chung F, et al. Br J Anaesth. 2012;108(5):768-775 Table 3.',
    },
    derivation: {
      formula: 'STOP-BANG = sum of 8 yes/no items (each 0 or 1), range 0-8.\n  S = Snoring loudly (louder than talking, or heard through closed doors)\n  T = Tiredness / fatigue / sleepiness during the daytime\n  O = Observed apnea (someone has seen you stop breathing during sleep)\n  P = high blood Pressure (treated or untreated)\n  B = BMI > 35 kg/m^2\n  A = Age > 50 years\n  N = Neck circumference > 40 cm\n  G = male Gender / sex\nBands per Chung 2012 Table 3: 0-2 low risk, 3-4 intermediate, >=5 high risk for moderate-to-severe OSA.',
      components: [
        { inputKey: 'snore',         label: 'S — Snoring loudly',                            points: 1 },
        { inputKey: 'tired',         label: 'T — Tiredness / daytime sleepiness',            points: 1 },
        { inputKey: 'observedApnea', label: 'O — Observed apnea during sleep',               points: 1 },
        { inputKey: 'highBp',        label: 'P — High blood pressure (treated or untreated)', points: 1 },
        { inputKey: 'bmiGt35',       label: 'B — BMI > 35 kg/m^2',                            points: 1 },
        { inputKey: 'ageGt50',       label: 'A — Age > 50 years',                             points: 1 },
        { inputKey: 'neckGt40cm',    label: 'N — Neck circumference > 40 cm',                 points: 1 },
        { inputKey: 'male',          label: 'G — Male sex',                                   points: 1 },
      ],
      bands: [
        { range: [0, 2],                 label: 'low risk for OSA' },
        { range: [3, 4],                 label: 'intermediate risk for OSA' },
        { range: { op: '>=', value: 5 }, label: 'high risk for moderate-to-severe OSA' },
      ],
      population: 'Chung 2008: 2467 surgical patients at a preoperative clinic in Toronto, with polysomnography in 211. Chung 2012 high-score validation: 6369 surgical patients across 13 hospitals. Designed for preoperative OSA screening.',
      units: {
        snore: 'boolean', tired: 'boolean', observedApnea: 'boolean',
        highBp: 'boolean', bmiGt35: 'boolean', ageGt50: 'boolean',
        neckGt40cm: 'boolean', male: 'boolean',
      },
      validity: 'Adult preoperative / surgical patients. STOP-BANG is a screening instrument; a positive screen warrants further evaluation (e.g., sleep study), not a diagnosis. The high-risk cutoff (>=5) has higher specificity for moderate-to-severe OSA than the original STOP cutoff (>=2). Not validated as a stand-alone diagnostic in pediatrics, pregnancy, or in patients with prior OSA diagnosis.',
      source: 'Chung F, Yegneswaran B, Liao P, et al. "STOP questionnaire: a tool to screen patients for obstructive sleep apnea." Anesthesiology. 2008;108(5):812-821. BANG extension: Chung F, Subramanyam R, Liao P, Sasaki E, Shapiro C, Sun Y. "High STOP-Bang score indicates a high probability of obstructive sleep apnoea." Br J Anaesth. 2012;108(5):768-775.',
    },
  },
  epworth: {
    citation: 'Johns MW. A new method for measuring daytime sleepiness: the Epworth sleepiness scale. Sleep. 1991;14(6):540-545.',
    specialties: ['pulmonology', 'psychiatry', 'nursing-general'],
    example: {
      fields: { 'ep-read': '1', 'ep-tv': '1', 'ep-pub': '0', 'ep-car': '1', 'ep-lying': '2', 'ep-talk': '0', 'ep-lunch': '1', 'ep-traffic': '0' },
      expected: 'Epworth 6 of 24: normal daytime sleepiness per Johns 1991 (0-10).',
    },
    interpretation: {
      bands: [
        { range: '0-10', text: 'Normal daytime sleepiness per Johns 1991.' },
        { range: '11-14', text: 'Mild excessive daytime sleepiness per Johns 1991.' },
        { range: '15-17', text: 'Moderate excessive daytime sleepiness per Johns 1991.' },
        { range: '18-24', text: 'Severe excessive daytime sleepiness per Johns 1991.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Johns MW. Sleep. 1991;14(6):540-545. Each of eight scenarios scored 0 (never doze) to 3 (high chance of dozing).',
    },
  },

  // ---- spec-v14 §3.3 wave 14-3 (partial): airway, PONV, recovery ----
  apfel: {
    citation: 'Apfel CC, Laara E, Koivuranta M, Greim CA, Roewer N. A simplified risk score for predicting postoperative nausea and vomiting: conclusions from cross-validations between two centers. Anesthesiology. 1999;91(3):693-700.',
    specialties: ['anesthesiology', 'nursing-general', 'surgery'],
    example: {
      fields: { 'ap-female': '1', 'ap-nonsmoker': '1', 'ap-hx': '0', 'ap-opioid': '0' },
      expected: 'Apfel 2 of 4: predicted PONV risk ~40% per Apfel 1999 Table 4.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Predicted PONV risk ~10% per Apfel 1999.' },
        { range: '1', text: 'Predicted PONV risk ~20% per Apfel 1999.' },
        { range: '2', text: 'Predicted PONV risk ~40% per Apfel 1999.' },
        { range: '3', text: 'Predicted PONV risk ~60% per Apfel 1999.' },
        { range: '4', text: 'Predicted PONV risk ~80% per Apfel 1999.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Apfel CC, et al. Anesthesiology. 1999;91(3):693-700 Table 4.',
    },
  },
  aldrete: {
    citation: 'Aldrete JA. The post-anesthesia recovery score revisited. J Clin Anesth. 1995;7(1):89-91. (Original: Aldrete JA, Kroulik D. A postanesthetic recovery score. Anesth Analg. 1970;49(6):924-934.)',
    specialties: ['anesthesiology', 'nursing-general', 'surgery'],
    example: {
      fields: { 'al-act': '2', 'al-resp': '2', 'al-circ': '2', 'al-cons': '2', 'al-o2': '2' },
      expected: 'modified Aldrete 10 of 10: ready for PACU discharge per Aldrete 1995 (cutoff >=9).',
    },
    interpretation: {
      bands: [
        { range: '<9', text: 'Not yet ready for PACU discharge per Aldrete 1995.' },
        { range: '>=9', text: 'Ready for PACU discharge per Aldrete 1995.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Aldrete JA. J Clin Anesth. 1995;7(1):89-91 (five domains each scored 0-2; cutoff >=9 for discharge).',
    },
  },

  // ---- spec-v14 §3.4 wave 14-4: AFib bleeding alternatives ----
  'atria-bleeding': {
    citation: 'Fang MC, Go AS, Chang Y, et al. A new risk scheme to predict warfarin-associated hemorrhage. The ATRIA (Anticoagulation and Risk Factors in Atrial Fibrillation) Study. J Am Coll Cardiol. 2011;58(4):395-401.',
    specialties: ['cardiology', 'hematology', 'pharmacy', 'geriatrics'],
    example: {
      fields: { 'at-an': '0', 'at-rn': '0', 'at-ag': '0', 'at-bl': '0', 'at-ht': '0' },
      expected: 'ATRIA 0 of 10: low annual major-bleed risk 0.8% per Fang 2011 Table 3 (0-3 band).',
    },
    interpretation: {
      bands: [
        { range: '0-3', text: 'Low annual major-bleed risk 0.8%/yr per Fang 2011 Table 3.' },
        { range: '4', text: 'Intermediate annual major-bleed risk 2.6%/yr per Fang 2011 Table 3.' },
        { range: '5-10', text: 'High annual major-bleed risk 5.8%/yr per Fang 2011 Table 3.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Fang MC, et al. J Am Coll Cardiol. 2011;58(4):395-401 Table 3.',
    },
    derivation: {
      formula: 'ATRIA Bleeding = sum of 5 weighted criteria per Fang 2011 Table 2 (range 0-10):\n  Anemia (Hgb <13 g/dL men, <12 g/dL women): +3\n  Severe renal disease (eGFR <30 mL/min/1.73m² OR dialysis-dependent): +3\n  Age >= 75: +2\n  Prior hemorrhage diagnosis: +1\n  Hypertension diagnosis: +1',
      components: [
        { inputKey: 'anemia',              label: 'Anemia (Hgb <13 g/dL men / <12 g/dL women)',                                points: 3 },
        { inputKey: 'severeRenalDisease',  label: 'Severe renal disease (eGFR <30 mL/min/1.73m² OR dialysis)',                  points: 3 },
        { inputKey: 'ageGte75',            label: 'Age >= 75',                                                                  points: 2 },
        { inputKey: 'priorBleeding',       label: 'Prior hemorrhage diagnosis',                                                  points: 1 },
        { inputKey: 'hypertension',        label: 'Hypertension diagnosis',                                                      points: 1 },
      ],
      bands: [
        { range: [0, 3],  label: 'low annual major-bleed risk (0.8%/yr)' },
        { range: [4, 4],  label: 'intermediate annual major-bleed risk (2.6%/yr)' },
        { range: [5, 10], label: 'high annual major-bleed risk (5.8%/yr)' },
      ],
      population: 'Fang 2011: derivation in 9186 patients with non-valvular AF on warfarin from the Kaiser Permanente Northern California ATRIA cohort. Reference standard: validated major-bleeding events.',
      units: {
        anemia: 'boolean', severeRenalDisease: 'boolean',
        ageGte75: 'boolean', priorBleeding: 'boolean', hypertension: 'boolean',
      },
      validity: 'Adults with non-valvular AF on warfarin. ATRIA was derived primarily on warfarin-treated patients; predictive performance for DOAC bleeding is similar but the absolute event rates are lower across all bands. Companion bleeding-risk instruments (HAS-BLED, ORBIT, HEMORR2HAGES — all separate Sophie tiles) score modestly differently in some patients; institutional preference governs which to use. The score is intended to identify modifiable bleeding-risk factors (anemia, BP control, renal function) for review, NOT to deny anticoagulation if CHA2DS2-VASc indicates it.',
      source: 'Fang MC, Go AS, Chang Y, Borowsky LH, Pomernacki NK, Udaltsova N, Singer DE. "A new risk scheme to predict warfarin-associated hemorrhage. The ATRIA (Anticoagulation and Risk Factors in Atrial Fibrillation) Study." J Am Coll Cardiol. 2011;58(4):395-401.',
    },
  },
  'orbit-bleeding': {
    citation: "O'Brien EC, Simon DN, Thomas LE, et al. The ORBIT bleeding score: a simple bedside score to assess bleeding risk in atrial fibrillation. Eur Heart J. 2015;36(46):3258-3264.",
    specialties: ['cardiology', 'hematology', 'pharmacy'],
    example: {
      fields: { 'ob-hb': '0', 'ob-age': '0', 'ob-bh': '0', 'ob-ri': '0', 'ob-ap': '0' },
      expected: "ORBIT 0 of 7: low annual major-bleed risk 2.4% per O'Brien 2015 Table 3 (0-2 band).",
    },
    interpretation: {
      bands: [
        { range: '0-2', text: "Low annual major-bleed risk 2.4%/yr per O'Brien 2015 Table 3." },
        { range: '3', text: "Intermediate annual major-bleed risk 4.7%/yr per O'Brien 2015 Table 3." },
        { range: '4-7', text: "High annual major-bleed risk 8.1%/yr per O'Brien 2015 Table 3." },
      ],
      sourceQuoted: true,
      sourceCitation: "O'Brien EC, et al. Eur Heart J. 2015;36(46):3258-3264 Table 3.",
    },
    derivation: {
      formula: "ORBIT Bleeding = sum of 5 weighted criteria per O'Brien 2015 Table 2 (range 0-7):\n  Low Hgb (<13 g/dL men, <12 g/dL women) OR low Hct (<40% men, <36% women): +2\n  Age > 74: +1\n  Bleeding history (GI, intracranial, or hemorrhagic stroke): +2\n  Renal insufficiency (eGFR <60 mL/min/1.73m²): +1\n  Treatment with antiplatelet: +1",
      components: [
        { inputKey: 'lowHbOrHct',          label: 'Low Hgb (<13 men / <12 women) OR low Hct (<40% / <36%)',              points: 2 },
        { inputKey: 'ageGt74',             label: 'Age > 74',                                                             points: 1 },
        { inputKey: 'bleedingHistory',     label: 'Bleeding history (GI, intracranial, or hemorrhagic stroke)',           points: 2 },
        { inputKey: 'renalInsufficiency',  label: 'Renal insufficiency (eGFR <60 mL/min/1.73m²)',                          points: 1 },
        { inputKey: 'antiplatelet',        label: 'Treatment with antiplatelet',                                            points: 1 },
      ],
      bands: [
        { range: [0, 2], label: 'low annual major-bleed risk (2.4%/yr)' },
        { range: [3, 3], label: 'intermediate annual major-bleed risk (4.7%/yr)' },
        { range: [4, 7], label: 'high annual major-bleed risk (8.1%/yr)' },
      ],
      population: "O'Brien 2015: derivation in 7411 patients with AF from the ORBIT-AF registry; external validation in 8438 patients from the ROCKET-AF trial. ORBIT was designed to be simpler than HAS-BLED/HEMORR2HAGES while retaining discrimination.",
      units: {
        lowHbOrHct: 'boolean', ageGt74: 'boolean', bleedingHistory: 'boolean',
        renalInsufficiency: 'boolean', antiplatelet: 'boolean',
      },
      validity: 'Adults with non-valvular AF on anticoagulation. ORBIT has slightly better c-statistic than HAS-BLED in some cohorts and is endorsed by the 2019 AHA/ACC/HRS focused update. Like ATRIA and HAS-BLED, it identifies *modifiable* bleeding risk factors (anemia → workup; renal function → dose adjustment) — NOT a reason to withhold anticoagulation if CHA2DS2-VASc indicates it.',
      source: "O'Brien EC, Simon DN, Thomas LE, Hylek EM, Gersh BJ, Ansell JE, Kowey PR, Mahaffey KW, Chang P, Fonarow GC, Pencina MJ, Piccini JP, Peterson ED. \"The ORBIT bleeding score: a simple bedside score to assess bleeding risk in atrial fibrillation.\" Eur Heart J. 2015;36(46):3258-3264.",
    },
  },
  hemorr2hages: {
    citation: 'Gage BF, Yan Y, Milligan PE, et al. Clinical classification schemes for predicting hemorrhage: results from the National Registry of Atrial Fibrillation (NRAF). Am Heart J. 2006;151(3):713-719.',
    specialties: ['cardiology', 'hematology', 'pharmacy'],
    example: {
      fields: { 'hh-hr': '0', 'hh-et': '0', 'hh-mal': '0', 'hh-old': '0', 'hh-plt': '0', 'hh-reb': '0', 'hh-htn': '0', 'hh-an': '0', 'hh-gen': '0', 'hh-fall': '0', 'hh-stk': '0' },
      expected: 'HEMORR2HAGES 0 of 12: 1.9 bleeds per 100 patient-years per Gage 2006 Table 3.',
    },
    interpretation: {
      bands: [
        { range: '0', text: '1.9 bleeds per 100 patient-years per Gage 2006 Table 3.' },
        { range: '1', text: '2.5 bleeds per 100 patient-years per Gage 2006 Table 3.' },
        { range: '2', text: '5.3 bleeds per 100 patient-years per Gage 2006 Table 3.' },
        { range: '3', text: '8.4 bleeds per 100 patient-years per Gage 2006 Table 3.' },
        { range: '4', text: '10.4 bleeds per 100 patient-years per Gage 2006 Table 3.' },
        { range: '>=5', text: '12.3 bleeds per 100 patient-years per Gage 2006 Table 3.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Gage BF, et al. Am Heart J. 2006;151(3):713-719 Table 3.',
    },
    derivation: {
      formula: 'HEMORR2HAGES = sum across 11 criteria (Gage 2006 Table 2). Range 0-12.\n  Hepatic or Renal disease                                       (+1)\n  Ethanol abuse                                                   (+1)\n  Malignancy history                                              (+1)\n  Older (age > 75)                                                (+1)\n  Reduced platelet count or function (incl. aspirin)              (+1)\n  Rebleeding (any prior bleed)                                    (+2)\n  Hypertension uncontrolled                                       (+1)\n  Anemia                                                          (+1)\n  Genetic factors (CYP2C9 single-nucleotide polymorphisms)        (+1)\n  Excessive fall risk                                             (+1)\n  Stroke history                                                  (+1)\nBands per Gage 2006 Table 3 (major bleeds per 100 patient-years on warfarin): 0 -> 1.9, 1 -> 2.5, 2 -> 5.3, 3 -> 8.4, 4 -> 10.4, >=5 -> 12.3.',
      components: [
        { inputKey: 'hepaticOrRenal',     label: 'Hepatic or Renal disease (+1)',                                points: 1 },
        { inputKey: 'ethanolAbuse',       label: 'Ethanol abuse (+1)',                                           points: 1 },
        { inputKey: 'malignancy',         label: 'Malignancy history (+1)',                                      points: 1 },
        { inputKey: 'olderGt75',          label: 'Older (age > 75) (+1)',                                        points: 1 },
        { inputKey: 'reducedPlatelets',   label: 'Reduced platelet count or function (incl. aspirin use) (+1)',  points: 1 },
        { inputKey: 'rebleeding',         label: 'Rebleeding (any prior bleed) (+2)',                            points: 2 },
        { inputKey: 'uncontrolledHtn',    label: 'Hypertension (uncontrolled, SBP > 160 mmHg) (+1)',             points: 1 },
        { inputKey: 'anemia',             label: 'Anemia (Hb < 13 men / < 12 women) (+1)',                       points: 1 },
        { inputKey: 'geneticFactors',     label: 'Genetic factors (CYP2C9 SNPs) (+1)',                           points: 1 },
        { inputKey: 'fallRisk',           label: 'Excessive fall risk (+1)',                                     points: 1 },
        { inputKey: 'stroke',             label: 'Stroke history (+1)',                                          points: 1 },
      ],
      bands: [
        { range: [0, 0],                 label: '1.9 bleeds per 100 patient-years on warfarin' },
        { range: [1, 1],                 label: '2.5 bleeds per 100 patient-years on warfarin' },
        { range: [2, 2],                 label: '5.3 bleeds per 100 patient-years on warfarin' },
        { range: [3, 3],                 label: '8.4 bleeds per 100 patient-years on warfarin' },
        { range: [4, 4],                 label: '10.4 bleeds per 100 patient-years on warfarin' },
        { range: { op: '>=', value: 5 }, label: '12.3 bleeds per 100 patient-years on warfarin' },
      ],
      population: 'Gage 2006: derivation in 3791 Medicare beneficiaries with atrial fibrillation enrolled in the National Registry of Atrial Fibrillation (NRAF) on warfarin; rates from Table 3 are major bleed events per 100 patient-years observed during warfarin anticoagulation.',
      units: {
        hepaticOrRenal: 'boolean', ethanolAbuse: 'boolean', malignancy: 'boolean',
        olderGt75: 'boolean', reducedPlatelets: 'boolean',
        rebleeding: 'boolean (any prior bleed - +2, the "2" in HEMORR2HAGES)',
        uncontrolledHtn: 'boolean (SBP > 160 mmHg uncontrolled)',
        anemia: 'boolean (Hb < 13 men / < 12 women)',
        geneticFactors: 'boolean (CYP2C9 SNPs)',
        fallRisk: 'boolean (clinical assessment of excessive fall risk)',
        stroke: 'boolean (history of any stroke)',
      },
      validity: 'Adults with non-valvular AF on warfarin (the original cohort was warfarin-anticoagulated Medicare beneficiaries). Inter-rater reliability is moderate; the genetic-factors item requires CYP2C9 genotyping which is uncommon in routine practice and is frequently omitted in real-world scoring. HEMORR2HAGES was superseded for routine use by HAS-BLED (Pisters 2010) and ORBIT (O\'Brien 2015), which are simpler and have similar or better discrimination; the AHA/ACC/HRS 2019 focused update favors ORBIT or HAS-BLED. Like the others, a high HEMORR2HAGES score identifies *modifiable* bleeding risk (HTN control, alcohol counseling) — NOT a reason to withhold anticoagulation if CHA2DS2-VASc indicates it. Not validated for DOAC-treated patients in the original cohort.',
      source: 'Gage BF, Yan Y, Milligan PE, Waterman AD, Culverhouse R, Rich MW, Radford MJ. "Clinical classification schemes for predicting hemorrhage: results from the National Registry of Atrial Fibrillation (NRAF)." Am Heart J. 2006;151(3):713-719.',
    },
  },

  // ---- spec-v14 §3.5 wave 14-5: medical-inpatient prophylaxis ----
  'improve-bleeding': {
    citation: 'Decousus H, Tapson VF, Bergmann JF, et al. Factors at admission associated with bleeding risk in medical patients: findings from the IMPROVE investigators. Chest. 2011;139(1):69-79.',
    specialties: ['hematology', 'nursing-general', 'geriatrics'],
    example: {
      fields: { 'ib-ulcer': '0', 'ib-bleed3': '0', 'ib-plt': '0', 'ib-age': '<40', 'ib-hep': '0', 'ib-renal': 'none', 'ib-icu': '0', 'ib-cvc': '0', 'ib-rheum': '0', 'ib-cancer': '0', 'ib-male': '0' },
      expected: 'IMPROVE-Bleeding 0: not high bleeding risk per Decousus 2011 (cutoff >=7).',
    },
    interpretation: {
      bands: [
        { range: '<7', text: 'Not high bleeding risk per Decousus 2011 (cutoff >=7).' },
        { range: '>=7', text: 'High bleeding risk per Decousus 2011; favor mechanical over pharmacologic prophylaxis.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Decousus H, et al. Chest. 2011;139(1):69-79 (cutoff >=7 = high bleeding risk).',
    },
    derivation: {
      formula: 'IMPROVE-Bleeding = weighted sum across 11 admission factors (Decousus 2011 Table 2).\n  Active gastroduodenal ulcer                    (+4.5)\n  Bleeding in 3 months prior to admission        (+4)\n  Platelet count < 50 x10^9/L                    (+4)\n  Age:           < 40 years (0) | 40-84 (+1.5) | >= 85 (+3.5)\n  Hepatic failure (INR > 1.5)                    (+2.5)\n  Renal:         none (0) | moderate eGFR 30-59 (+1) | severe eGFR < 30 (+2.5)\n  ICU / CCU admission                            (+2.5)\n  Central venous catheter                        (+2)\n  Active rheumatic disease                       (+2)\n  Active cancer                                  (+2)\n  Male sex                                       (+1)\nCutoff per Decousus 2011: >=7 = high bleeding risk (consider mechanical over pharmacologic prophylaxis).',
      components: [
        { inputKey: 'activeUlcer',           label: 'Active gastroduodenal ulcer (+4.5)',                   points: 4.5 },
        { inputKey: 'bleeding3moPrior',      label: 'Bleeding in 3 months prior to admission (+4)',         points: 4 },
        { inputKey: 'plateletLt50',          label: 'Platelet count < 50 x10^9/L (+4)',                     points: 4 },
        { inputKey: 'age',                   label: 'Age band (<40: 0 / 40-84: +1.5 / >=85: +3.5)',         points: (v) => (v === '>=85' ? 3.5 : v === '40-84' ? 1.5 : 0) },
        { inputKey: 'hepaticFailure',        label: 'Hepatic failure: INR > 1.5 (+2.5)',                    points: 2.5 },
        { inputKey: 'renalFailure',          label: 'Renal failure band (none: 0 / moderate eGFR 30-59: +1 / severe eGFR <30: +2.5)', points: (v) => (v === 'severe' ? 2.5 : v === 'moderate' ? 1 : 0) },
        { inputKey: 'icuAdmission',          label: 'ICU / CCU admission (+2.5)',                           points: 2.5 },
        { inputKey: 'centralVenousCatheter', label: 'Central venous catheter (+2)',                         points: 2 },
        { inputKey: 'rheumaticDisease',      label: 'Active rheumatic disease (+2)',                        points: 2 },
        { inputKey: 'currentCancer',         label: 'Active cancer (+2)',                                   points: 2 },
        { inputKey: 'male',                  label: 'Male sex (+1)',                                        points: 1 },
      ],
      bands: [
        { range: { op: '<', value: 7 },  label: 'not high bleeding risk' },
        { range: { op: '>=', value: 7 }, label: 'high bleeding risk; consider mechanical over pharmacologic prophylaxis' },
      ],
      population: 'Decousus 2011: case-control analysis nested within the IMPROVE registry (International Medical Prevention Registry on Venous Thromboembolism), an observational international cohort of 15,156 hospitalized medical (non-surgical) patients across 12 countries; bleeding outcomes adjudicated to ISTH major and clinically-relevant non-major criteria during hospitalization.',
      units: {
        activeUlcer: 'boolean', bleeding3moPrior: 'boolean', plateletLt50: 'boolean',
        age: "enum: '<40' | '40-84' | '>=85'",
        hepaticFailure: 'boolean (INR > 1.5 at admission)',
        renalFailure: "enum: 'none' | 'moderate' (eGFR 30-59) | 'severe' (eGFR <30)",
        icuAdmission: 'boolean', centralVenousCatheter: 'boolean',
        rheumaticDisease: 'boolean', currentCancer: 'boolean', male: 'boolean',
      },
      validity: 'Adult hospitalized medical (non-surgical) inpatients. Companion to IMPROVE-VTE (Spyropoulos 2011); the two scores together support a paired VTE-vs-bleeding decision. Performance is modest in external validation; ACCP CHEST 2018 / ASH 2018 treat the score as one input among several. The >=7 cutoff identifies the top decile of bleeding risk in the derivation cohort; a high score is a relative indication to favor mechanical prophylaxis, not an absolute contraindication to pharmacologic prophylaxis. Not validated for surgical patients (use HAS-BLED-equivalent surgical risk frameworks), obstetric patients, or pediatrics.',
      source: 'Decousus H, Tapson VF, Bergmann JF, Chong BH, Froehlich JB, Kakkar AK, Merli GJ, Monreal M, Nakamura M, Pavanello R, Pini M, Piovella F, Spencer FA, Spyropoulos AC, Turpie AGG, Zotz RB, FitzGerald G, Anderson FA Jr. "Factors at admission associated with bleeding risk in medical patients: findings from the IMPROVE investigators." Chest. 2011;139(1):69-79.',
    },
  },
  'improve-vte': {
    citation: 'Spyropoulos AC, Anderson FA Jr, FitzGerald G, et al. Predictive and associative models to identify hospitalized medical patients at risk for VTE. Chest. 2011;140(3):706-714.',
    specialties: ['hematology', 'nursing-general', 'geriatrics'],
    example: {
      fields: { 'iv-prior': '0', 'iv-thr': '0', 'iv-para': '0', 'iv-cancer': '0', 'iv-immob': '0', 'iv-icu': '0', 'iv-age60': '0' },
      expected: 'IMPROVE-VTE 0 of 12: low VTE risk per Spyropoulos 2011 (<2); prophylaxis not routinely indicated.',
    },
    interpretation: {
      bands: [
        { range: '<2', text: 'Low VTE risk per Spyropoulos 2011; prophylaxis not routinely indicated.' },
        { range: '2-3', text: 'Candidate for inpatient VTE prophylaxis per Spyropoulos 2011.' },
        { range: '>=4', text: 'Candidate for extended-duration post-discharge VTE prophylaxis per Spyropoulos 2011.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Spyropoulos AC, et al. Chest. 2011;140(3):706-714 (cutoffs >=2 inpatient, >=4 extended).',
    },
    derivation: {
      formula: 'IMPROVE-VTE = sum of 7 weighted criteria, range 0-12.\n  Prior VTE                    (+3)\n  Known thrombophilia          (+2)\n  Lower-limb paralysis         (+2)\n  Active cancer                (+2)\n  Immobilized >= 7 days        (+1)\n  ICU / CCU stay               (+1)\n  Age > 60 years               (+1)\nBands per Spyropoulos 2011: <2 low (prophylaxis not routinely indicated); 2-3 candidate for inpatient prophylaxis; >=4 candidate for extended-duration post-discharge prophylaxis.',
      components: [
        { inputKey: 'priorVte',           label: 'Prior VTE (+3)',                points: 3 },
        { inputKey: 'thrombophilia',      label: 'Known thrombophilia (+2)',      points: 2 },
        { inputKey: 'lowerLimbParalysis', label: 'Lower-limb paralysis (+2)',     points: 2 },
        { inputKey: 'currentCancer',      label: 'Active cancer (+2)',            points: 2 },
        { inputKey: 'immobilized7d',      label: 'Immobilized >= 7 days (+1)',    points: 1 },
        { inputKey: 'icuCcuStay',         label: 'ICU / CCU stay (+1)',           points: 1 },
        { inputKey: 'ageGt60',            label: 'Age > 60 years (+1)',           points: 1 },
      ],
      bands: [
        { range: [0, 1],                 label: 'low VTE risk; prophylaxis not routinely indicated' },
        { range: [2, 3],                 label: 'candidate for inpatient VTE prophylaxis' },
        { range: { op: '>=', value: 4 }, label: 'candidate for extended-duration post-discharge VTE prophylaxis' },
      ],
      population: 'Spyropoulos 2011: derivation in 15,156 hospitalized medical patients from the IMPROVE registry (International Medical Prevention Registry on Venous Thromboembolism), an international observational cohort across 12 countries. Outcome: clinically symptomatic VTE within 90 days of admission, adjudicated.',
      units: {
        priorVte: 'boolean', thrombophilia: 'boolean', lowerLimbParalysis: 'boolean',
        currentCancer: 'boolean', immobilized7d: 'boolean', icuCcuStay: 'boolean',
        ageGt60: 'boolean',
      },
      validity: 'Adult hospitalized medical (non-surgical) inpatients. Companion to IMPROVE-Bleeding (Decousus 2011) for paired VTE-vs-bleeding risk assessment; the two scores share the IMPROVE registry derivation cohort. Performance is modest in external validation; ACCP CHEST 2018 and subsequent ASH 2018 guidelines treat the score as one input among several rather than a binary trigger. Not validated for surgical inpatients (use Caprini), obstetric patients, or pediatrics.',
      source: 'Spyropoulos AC, Anderson FA Jr, FitzGerald G, Decousus H, Pini M, Chong BH, Zotz RB, Bergmann JF, Tapson V, Froehlich JB, Monreal M, Merli GJ, Pavanello R, Turpie AGG, Nakamura M, Piovella F, Kakkar AK, Spencer FA. "Predictive and associative models to identify hospitalized medical patients at risk for VTE." Chest. 2011;140(3):706-714.',
    },
  },

  // ---- spec-v14 §3.6 wave 14-6 (partial): cancer-VTE & recurrence ----
  khorana: {
    citation: 'Khorana AA, Kuderer NM, Culakova E, Lyman GH, Francis CW. Development and validation of a predictive model for chemotherapy-associated thrombosis. Blood. 2008;111(10):4902-4907.',
    specialties: ['oncology', 'hematology', 'pharmacy'],
    example: {
      fields: { 'kh-site': 'other', 'kh-plt': '0', 'kh-hb': '0', 'kh-wbc': '0', 'kh-bmi': '0' },
      expected: 'Khorana 0 of 6: low 2.5-month VTE risk 0.3% per Khorana 2008 Table 3 (score 0).',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Low 2.5-month VTE risk 0.3% per Khorana 2008 Table 3.' },
        { range: '1-2', text: 'Intermediate 2.5-month VTE risk 2.0% per Khorana 2008 Table 3.' },
        { range: '>=3', text: 'High 2.5-month VTE risk 6.7% per Khorana 2008 Table 3.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Khorana AA, et al. Blood. 2008;111(10):4902-4907 Table 3 (2.5-month VTE rates).',
    },
    derivation: {
      formula: 'Khorana = sum across 5 criteria, range 0-6.\n  Cancer site:  stomach / pancreas      (+2)\n                lung / lymphoma / gynecologic / bladder / testicular (+1)\n                other                    (0)\n  Pre-chemotherapy platelet count >= 350 x10^9/L (+1)\n  Hemoglobin < 10 g/dL or use of erythropoiesis-stimulating agent (+1)\n  Pre-chemotherapy WBC count > 11 x10^9/L (+1)\n  BMI >= 35 kg/m^2 (+1)\nBands per Khorana 2008 Table 3 (2.5-month VTE rates): 0 low 0.3%, 1-2 intermediate 2.0%, >=3 high 6.7%.',
      components: [
        { inputKey: 'cancerSiteRisk',  label: 'Cancer site risk (very-high +2 / high +1 / other 0)', points: (v) => (v === 'very-high' ? 2 : v === 'high' ? 1 : 0) },
        { inputKey: 'plateletGte350',  label: 'Pre-chemotherapy platelets >= 350 x10^9/L (+1)',     points: 1 },
        { inputKey: 'hbLt10OrEsa',     label: 'Hemoglobin < 10 g/dL or ESA use (+1)',               points: 1 },
        { inputKey: 'wbcGt11',         label: 'Pre-chemotherapy WBC > 11 x10^9/L (+1)',             points: 1 },
        { inputKey: 'bmiGte35',        label: 'BMI >= 35 kg/m^2 (+1)',                              points: 1 },
      ],
      bands: [
        { range: [0, 0],                 label: 'low 2.5-month VTE risk (0.3%)' },
        { range: [1, 2],                 label: 'intermediate 2.5-month VTE risk (2.0%)' },
        { range: { op: '>=', value: 3 }, label: 'high 2.5-month VTE risk (6.7%)' },
      ],
      population: 'Khorana 2008: derivation in 2701 ambulatory cancer patients starting a new chemotherapy regimen at the University of Rochester / Cleveland Clinic; prospective validation in a separate 1365-patient cohort from the same investigators. Outcome: symptomatic VTE (DVT or PE) within a median 2.5-month follow-up.',
      units: {
        cancerSiteRisk: "enum: 'very-high' (stomach, pancreas) | 'high' (lung, lymphoma, gynecologic, bladder, testicular) | 'other'",
        plateletGte350: 'boolean',
        hbLt10OrEsa: 'boolean',
        wbcGt11: 'boolean',
        bmiGte35: 'boolean',
      },
      validity: 'Ambulatory adult cancer patients about to start systemic chemotherapy. Khorana is the most-validated outpatient cancer-VTE score and underpins the ASCO and ITAC guideline recommendations to consider thromboprophylaxis at scores >=2. The score under-discriminates in some cancer types (notably lung) and modern variants (PROTECHT, CONKO, ONKOTEV) add D-dimer, soluble P-selectin, or imaging data; Khorana remains the bedside-friendly default. Not validated for inpatient cancer VTE, brain tumors with primary CNS involvement (which often need separate consideration), or pediatric oncology.',
      source: 'Khorana AA, Kuderer NM, Culakova E, Lyman GH, Francis CW. "Development and validation of a predictive model for chemotherapy-associated thrombosis." Blood. 2008;111(10):4902-4907.',
    },
  },
  'dash-vte': {
    citation: 'Tosetto A, Iorio A, Marcucci M, et al. Predicting disease recurrence in patients with previous unprovoked venous thromboembolism: a proposed prediction score (DASH). J Thromb Haemost. 2012;10(6):1019-1025.',
    specialties: ['hematology', 'cardiology', 'pulmonology'],
    example: {
      fields: { 'da-dd': '0', 'da-age': '0', 'da-male': '0', 'da-horm': '0' },
      expected: 'DASH 0: low annual VTE-recurrence risk 3.1% per Tosetto 2012 Table 4 (<=1 band).',
    },
    interpretation: {
      bands: [
        { range: '<=1', text: 'Low annual VTE-recurrence risk 3.1%/yr per Tosetto 2012 Table 4.' },
        { range: '2', text: 'Intermediate annual VTE-recurrence risk 6.4%/yr per Tosetto 2012 Table 4.' },
        { range: '>=3', text: 'High annual VTE-recurrence risk 12.3%/yr per Tosetto 2012 Table 4.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Tosetto A, et al. J Thromb Haemost. 2012;10(6):1019-1025 Table 4 (annual recurrence rates).',
    },
    derivation: {
      formula: 'DASH = sum across 4 criteria, range -2 to +4.\n  abnormal post-anticoagulation D-dimer  (+2)\n  Age < 50 years at index VTE            (+1)\n  Male sex                                (+1)\n  Hormone use at time of initial VTE (women only) (-2)\nBands per Tosetto 2012 Table 4 (annual VTE-recurrence rates): <=1 low 3.1%/yr, 2 intermediate 6.4%/yr, >=3 high 12.3%/yr.',
      components: [
        { inputKey: 'dDimerAbnormal',                label: 'Abnormal post-anticoagulation D-dimer (+2)',          points: 2 },
        { inputKey: 'ageLt50',                       label: 'Age < 50 years at index VTE (+1)',                    points: 1 },
        { inputKey: 'male',                          label: 'Male sex (+1)',                                       points: 1 },
        { inputKey: 'hormoneUseAtInitialVteInWoman', label: 'Hormone use at time of initial VTE (women only) (-2)', points: -2 },
      ],
      bands: [
        { range: { op: '<=', value: 1 }, label: 'low annual VTE-recurrence risk (3.1%/yr)' },
        { range: [2, 2],                 label: 'intermediate annual VTE-recurrence risk (6.4%/yr)' },
        { range: { op: '>=', value: 3 }, label: 'high annual VTE-recurrence risk (12.3%/yr)' },
      ],
      population: 'Tosetto 2012: patient-level meta-analysis of 7 prospective cohort studies totaling 1818 adults with a first unprovoked venous thromboembolism who had completed >= 3 months of anticoagulation; D-dimer was measured after anticoagulation was stopped. Outcome: symptomatic, objectively confirmed VTE recurrence over a median follow-up of 22 months.',
      units: {
        dDimerAbnormal: 'boolean (post-anticoagulation; cutoff per study assay)',
        ageLt50: 'boolean (age < 50 at index VTE)',
        male: 'boolean (male sex)',
        hormoneUseAtInitialVteInWoman: 'boolean (estrogen-containing hormonal therapy at index VTE; women only)',
      },
      validity: 'Adults with a first unprovoked VTE who have completed at least 3 months of anticoagulation and are being evaluated for indefinite-vs-time-limited continuation. The -2 hormone modifier applies only to women whose index VTE occurred during hormonal therapy (typically COCP or postmenopausal HRT); it does not apply to men or to women whose index VTE was unprovoked off hormones. Not validated for provoked VTE, recurrent VTE, cancer-associated VTE, or pediatrics; competing scores (HERDOO2, Vienna nomogram) exist for women specifically.',
      source: 'Tosetto A, Iorio A, Marcucci M, Baglin T, Cushman M, Eichinger S, Palareti G, Poli D, Tait RC, Douketis J. "Predicting disease recurrence in patients with previous unprovoked venous thromboembolism: a proposed prediction score (DASH)." J Thromb Haemost. 2012;10(6):1019-1025.',
    },
  },
  herdoo2: {
    citation: 'Rodger MA, Le Gal G, Anderson DR, et al. Validating the HERDOO2 rule to guide treatment duration for women with unprovoked venous thrombosis: multinational prospective cohort management study. BMJ. 2017;356:j1065.',
    specialties: ['hematology', 'obstetrics-gynecology'],
    example: {
      fields: { 'hd-legs': '0', 'hd-dd': '0', 'hd-bmi': '0', 'hd-age': '0' },
      expected: 'HERDOO2 0 of 4 (women): low risk; safe to discontinue anticoagulation per Rodger 2017 (0-1 band).',
    },
    interpretation: {
      bands: [
        { range: '0-1', text: 'Low risk; safe to discontinue anticoagulation per Rodger 2017 (women with unprovoked VTE).' },
        { range: '>=2', text: 'Continue anticoagulation per Rodger 2017.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Rodger MA, et al. BMJ. 2017;356:j1065 (women with unprovoked VTE; cutoff 0-1 safe to stop).',
    },
    derivation: {
      formula: 'HERDOO2 = sum across 4 criteria (women only), range 0-4. Mnemonic HERDOO2:\n  Hyperpigmentation, Edema, or Redness in either leg               (+1)\n  D-dimer >= 250 ug/L (measured while on anticoagulation)          (+1)\n  Obesity: BMI >= 30 kg/m^2                                         (+1)\n  Older: age >= 65 years                                            (+1)\nBands per Rodger 2017: 0-1 low (safe to discontinue anticoagulation); >=2 continue anticoagulation.',
      components: [
        { inputKey: 'legSignsPostThrombotic',   label: 'Hyperpigmentation, edema, or redness in either leg (+1)', points: 1 },
        { inputKey: 'dDimerGte250OnAnticoag',   label: 'D-dimer >= 250 ug/L while on anticoagulation (+1)',       points: 1 },
        { inputKey: 'bmiGte30',                 label: 'BMI >= 30 kg/m^2 (+1)',                                   points: 1 },
        { inputKey: 'ageGte65',                 label: 'Age >= 65 years (+1)',                                    points: 1 },
      ],
      bands: [
        { range: [0, 1],                 label: 'low recurrence risk; safe to discontinue anticoagulation' },
        { range: { op: '>=', value: 2 }, label: 'continue anticoagulation' },
      ],
      population: 'Rodger 2017: multinational prospective management cohort of 2785 women with a first unprovoked VTE who had completed 5-12 months of anticoagulation across 44 centres in 7 countries; D-dimer was measured on anticoagulation. Outcome: symptomatic, objectively confirmed VTE recurrence during 1-year follow-up after rule-guided cessation.',
      units: {
        legSignsPostThrombotic: 'boolean (hyperpigmentation, edema, or redness in either leg on examination)',
        dDimerGte250OnAnticoag: 'boolean (D-dimer >= 250 ug/L FEU equivalent while on anticoagulation)',
        bmiGte30: 'boolean (BMI >= 30 kg/m^2)',
        ageGte65: 'boolean (age >= 65 years)',
      },
      validity: 'Women only, with a first unprovoked or weakly provoked VTE who have completed 5-12 months of anticoagulation. D-dimer must be measured while still on anticoagulation (not the off-anticoagulation D-dimer used in DASH). Not validated in men, in provoked VTE, in cancer-associated VTE, in patients with antiphospholipid syndrome or thrombophilia, in patients on antiplatelet therapy, or in pediatrics. The original cutoff-2 stratification reflects the prospectively-managed validation cohort; subsequent meta-analyses (e.g., Iorio 2017) put the 1-year recurrence at the low band around 3% per year.',
      source: 'Rodger MA, Le Gal G, Anderson DR, Schmidt J, Pernod G, Kahn SR, Righini M, Mismetti P, Kearon C, Meyer G, Elias A, Ramsay T, Ortel TL, Huisman MV, Kovacs MJ. "Validating the HERDOO2 rule to guide treatment duration for women with unprovoked venous thrombosis: multinational prospective cohort management study." BMJ. 2017;356:j1065.',
    },
  },

  // ---- spec-v14 §3.7 wave 14-7 (partial): HIT / DIC ----
  'four-ts': {
    citation: 'Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler P, Greinacher A. Evaluation of pretest clinical score (4 T\'s) for the diagnosis of heparin-induced thrombocytopenia in two clinical settings. J Thromb Haemost. 2006;4(4):759-765.',
    specialties: ['hematology', 'critical-care', 'pharmacy'],
    example: {
      fields: { '4t-thr': '0', '4t-time': '0', '4t-throm': '0', '4t-oth': '0' },
      expected: '4Ts 0 of 8: low pretest probability of HIT per Lo 2006 Table 2 (0-3 band).',
    },
    interpretation: {
      bands: [
        { range: '0-3', text: 'Low pretest probability of HIT per Lo 2006 Table 2.' },
        { range: '4-5', text: 'Intermediate pretest probability of HIT per Lo 2006 Table 2.' },
        { range: '6-8', text: 'High pretest probability of HIT per Lo 2006 Table 2.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Lo GK, et al. J Thromb Haemost. 2006;4(4):759-765 Table 2 (four domains each scored 0-2).',
    },
    derivation: {
      formula: '4Ts = sum of 4 domains each scored 0-2, range 0-8. Bands per Lo 2006 Table 2: 0-3 low, 4-5 intermediate, 6-8 high pretest probability of HIT.\n  Thrombocytopenia: >50% fall AND nadir >=20 (+2) | 30-50% fall OR nadir 10-19 (+1) | <30% fall OR nadir <10 (0)\n  Timing of platelet fall: clear onset days 5-10, OR <=1 day with prior heparin in last 30 d (+2) | consistent with 5-10 d but unclear, OR >10 d (+1) | <4 d without recent heparin (0)\n  Thrombosis / sequelae: new thrombosis, skin necrosis, or acute systemic reaction after IV heparin bolus (+2) | progressive/recurrent thrombosis or erythematous skin lesion (+1) | none (0)\n  oTher causes of thrombocytopenia: none apparent (+2) | possible (+1) | definite (0)',
      components: [
        { inputKey: 'thrombocytopenia', label: 'T — Thrombocytopenia (0/1/2 per Lo 2006)',          points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'timingOfFall',     label: 'T — Timing of platelet fall (0/1/2 per Lo 2006)',  points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'thrombosis',       label: 'T — Thrombosis or other sequelae (0/1/2 per Lo 2006)', points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'otherCauses',      label: 'T — oTher causes of thrombocytopenia (0/1/2 per Lo 2006)', points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: [0, 3], label: 'low pretest probability of HIT' },
        { range: [4, 5], label: 'intermediate pretest probability of HIT' },
        { range: [6, 8], label: 'high pretest probability of HIT' },
      ],
      population: 'Lo 2006: 100 patients from two clinical settings (academic hematology consult service in Hamilton, Ontario; cardiothoracic ICU in Greifswald, Germany). Reference standard: serotonin-release assay (SRA) for HIT antibodies. Negative predictive value at the low band (0-3) is approximately 97-99% across subsequent validation cohorts.',
      units: {
        thrombocytopenia: 'integer 0-2 (clamped)',
        timingOfFall: 'integer 0-2 (clamped)',
        thrombosis: 'integer 0-2 (clamped)',
        otherCauses: 'integer 0-2 (clamped)',
      },
      validity: 'Adult patients with suspected heparin-induced thrombocytopenia. The 4Ts is a pretest probability score, not a diagnostic test — a low score has high NPV for HIT, but an intermediate or high score warrants laboratory confirmation (immunoassay and/or functional assay such as SRA). Inter-rater reliability is moderate; the "other causes" domain is the most subjective. Not designed for pediatrics or pregnancy.',
      source: 'Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler P, Greinacher A. "Evaluation of pretest clinical score (4 T\'s) for the diagnosis of heparin-induced thrombocytopenia in two clinical settings." J Thromb Haemost. 2006;4(4):759-765.',
    },
  },
  'isth-dic': {
    citation: 'Taylor FB Jr, Toh CH, Hoots WK, Wada H, Levi M. Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation. Thromb Haemost. 2001;86(5):1327-1330.',
    specialties: ['hematology', 'critical-care', 'obstetrics-gynecology'],
    example: {
      fields: { 'id-gate': '1', 'id-plt': '>100', 'id-fdp': 'none', 'id-pt': '<3s', 'id-fib': '>1' },
      expected: 'ISTH DIC 0 of 8: not compatible with overt DIC per Taylor 2001 (cutoff >=5); repeat scoring 1-2 days as clinically indicated.',
    },
    interpretation: {
      bands: [
        { range: 'gate', text: 'An underlying disorder known to be associated with DIC must be present per Taylor 2001 before scoring.' },
        { range: '<5', text: 'Not compatible with overt DIC per Taylor 2001; repeat scoring 1-2 days as clinically indicated.' },
        { range: '>=5', text: 'Compatible with overt DIC per Taylor 2001 (cutoff >=5).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Taylor FB Jr, et al. Thromb Haemost. 2001;86(5):1327-1330 (four lab components; gate then cutoff >=5).',
    },
    derivation: {
      formula: 'ISTH overt DIC = sum across 4 laboratory components (Taylor 2001). Range 0-8. An underlying disorder known to be associated with DIC must be present (gate) before scoring; cutoff >=5 = compatible with overt DIC.\n  Platelet count: >100 x10^9/L (0) | 50-100 (+1) | <50 (+2)\n  Elevated fibrin-related marker (D-dimer / FDP / soluble fibrin monomers): none (0) | moderate (+2) | strong (+3)\n  Prolonged PT: <3 s (0) | 3-6 s (+1) | >6 s (+2)\n  Fibrinogen: >1 g/L (0) | <=1 g/L (+1)',
      components: [
        { inputKey: 'platelet',     label: 'Platelet count (>100: 0 / 50-100: +1 / <50: +2)',          points: (v) => (v === '<50' ? 2 : v === '50-100' ? 1 : 0) },
        { inputKey: 'fibrinMarker', label: 'Fibrin-related marker (none: 0 / moderate: +2 / strong: +3)', points: (v) => (v === 'strong' ? 3 : v === 'moderate' ? 2 : 0) },
        { inputKey: 'ptProlonged',  label: 'Prolonged PT (<3 s: 0 / 3-6 s: +1 / >6 s: +2)',             points: (v) => (v === '>6s' ? 2 : v === '3-6s' ? 1 : 0) },
        { inputKey: 'fibrinogen',   label: 'Fibrinogen (>1 g/L: 0 / <=1 g/L: +1)',                      points: (v) => (v === '<=1' ? 1 : 0) },
      ],
      bands: [
        { range: { op: '<', value: 5 },  label: 'not compatible with overt DIC; repeat scoring 1-2 days as clinically indicated' },
        { range: { op: '>=', value: 5 }, label: 'compatible with overt DIC' },
      ],
      population: 'Taylor 2001: consensus-built ISTH SSC scoring system; subsequent validation cohorts include the multicenter overt-DIC validation by Bakhtiari 2004 (217 ICU patients with suspected DIC) and additional cohort studies in septic, obstetric, and trauma DIC. Sensitivity ~91%, specificity ~97% for overt DIC against expert-panel diagnosis in Bakhtiari 2004.',
      units: {
        underlyingDisorderPresent: 'boolean (gate: an underlying disorder known to be associated with DIC, e.g., sepsis, trauma, malignancy, obstetric complication)',
        platelet: "enum: '>100' | '50-100' | '<50' (x10^9/L)",
        fibrinMarker: "enum: 'none' | 'moderate' | 'strong' (D-dimer / FDP / soluble fibrin monomers; cutoffs assay-specific)",
        ptProlonged: "enum: '<3s' | '3-6s' | '>6s' (prolongation above the upper limit of normal)",
        fibrinogen: "enum: '>1' | '<=1' (g/L)",
      },
      validity: 'Adult patients with an underlying disorder known to be associated with DIC (sepsis, trauma, malignancy, obstetric complication, severe liver disease, vascular abnormalities). The score identifies *overt* DIC; the separate "non-overt" ISTH scoring template (Taylor 2001 also) tracks day-over-day trends in patients suspected of subclinical DIC. The fibrin-marker rubric is intentionally semi-quantitative because cutoffs are assay-specific; institutional D-dimer or FDP thresholds for "moderate" and "strong" should be defined locally. Not validated for pediatric DIC, neonatal DIC, or for liver-disease-driven coagulopathy without an additional DIC-associated trigger.',
      source: 'Taylor FB Jr, Toh CH, Hoots WK, Wada H, Levi M; Scientific Subcommittee on Disseminated Intravascular Coagulation of the International Society on Thrombosis and Haemostasis. "Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation." Thromb Haemost. 2001;86(5):1327-1330.',
    },
  },

  // ---- spec-v14 §3.8 wave 14-8 (partial): DAPT duration ----
  'dapt-score': {
    citation: 'Yeh RW, Secemsky EA, Kereiakes DJ, et al. Development and validation of a prediction rule for benefit and harm of dual antiplatelet therapy beyond 1 year after percutaneous coronary intervention. JAMA. 2016;315(16):1735-1749.',
    specialties: ['cardiology', 'pharmacy'],
    example: {
      fields: { 'dp-age': '<65', 'dp-chf': '0', 'dp-vgp': '0', 'dp-mi': '0', 'dp-prior': '0', 'dp-dm': '0', 'dp-stent': '0', 'dp-pac': '0', 'dp-smoke': '0' },
      expected: 'DAPT Score 0: does not favor extended DAPT beyond 12 months per Yeh 2016 (cutoff >=2).',
    },
    interpretation: {
      bands: [
        { range: '<2', text: 'Does not favor extended DAPT beyond 12 months after PCI per Yeh 2016.' },
        { range: '>=2', text: 'Favors continuing DAPT beyond 12 months after PCI per Yeh 2016.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Yeh RW, et al. JAMA. 2016;315(16):1735-1749 (cutoff >=2 favors extended DAPT).',
    },
    derivation: {
      formula: 'DAPT Score = sum across 9 criteria (Yeh 2016 Table 4). Range -2 to +10.\n  Age:                 <65 (0) | 65-74 (-1) | >=75 (-2)\n  CHF or LVEF < 30%                                              (+2)\n  Saphenous vein graft PCI                                       (+2)\n  MI at presentation                                              (+1)\n  Prior MI or PCI                                                 (+1)\n  Diabetes mellitus                                               (+1)\n  Stent diameter < 3 mm                                           (+1)\n  Paclitaxel-eluting stent                                        (+1)\n  Current cigarette smoker                                        (+1)\nCutoff per Yeh 2016: <2 does NOT favor extended DAPT beyond 12 months; >=2 favors extended DAPT.',
      components: [
        { inputKey: 'ageBand',            label: 'Age band (<65: 0 / 65-74: -1 / >=75: -2)', points: (v) => (v === '>=75' ? -2 : v === '65-74' ? -1 : 0) },
        { inputKey: 'chfOrLvefLt30',      label: 'CHF or LVEF < 30% (+2)',                  points: 2 },
        { inputKey: 'veinGraftPci',       label: 'Saphenous vein graft PCI (+2)',           points: 2 },
        { inputKey: 'miAtPresentation',   label: 'MI at index presentation (+1)',           points: 1 },
        { inputKey: 'priorMiOrPci',       label: 'Prior MI or PCI (+1)',                    points: 1 },
        { inputKey: 'diabetes',           label: 'Diabetes mellitus (+1)',                  points: 1 },
        { inputKey: 'stentDiameterLt3mm', label: 'Stent diameter < 3 mm (+1)',              points: 1 },
        { inputKey: 'paclitaxelStent',    label: 'Paclitaxel-eluting stent (+1)',           points: 1 },
        { inputKey: 'currentSmoker',      label: 'Current cigarette smoker (+1)',           points: 1 },
      ],
      bands: [
        { range: { op: '<', value: 2 },  label: 'does not favor extended DAPT beyond 12 months after PCI' },
        { range: { op: '>=', value: 2 }, label: 'favors continuing DAPT beyond 12 months after PCI' },
      ],
      population: 'Yeh 2016: derivation in 11,648 patients enrolled in the DAPT Study (randomized trial of continued versus discontinued thienopyridine 12-30 months after PCI); external validation in the PROTECT trial (8136 patients). Outcomes: composite ischemic events (MI / stent thrombosis) versus GUSTO moderate/severe bleeding from 12 to 30 months post-PCI.',
      units: {
        ageBand: "enum: '<65' | '65-74' | '>=75'",
        chfOrLvefLt30: 'boolean', veinGraftPci: 'boolean', miAtPresentation: 'boolean',
        priorMiOrPci: 'boolean', diabetes: 'boolean', stentDiameterLt3mm: 'boolean',
        paclitaxelStent: 'boolean', currentSmoker: 'boolean',
      },
      validity: 'Adults who have completed 12 months of DAPT after PCI and are being evaluated for continuation versus cessation. The score balances *ischemic benefit* against *bleeding harm* of continued DAPT — a high DAPT Score predicts more benefit from continuation; the companion PRECISE-DAPT score (Costa 2017) predicts bleeding harm and is typically used together with DAPT to drive the duration decision. ACC/AHA 2016 (Levine) and ESC 2017 (Valgimigli) DAPT-duration guidance reference both scores. Paclitaxel-eluting stents are uncommon in contemporary practice; the +1 paclitaxel item is typically 0 in modern cohorts. Not validated for patients with prior major bleeding, mechanical valves, or other absolute indications for prolonged anticoagulation/DAPT.',
      source: 'Yeh RW, Secemsky EA, Kereiakes DJ, Normand SL, Gershlick AH, Cohen DJ, Spertus JA, Steg PG, Cutlip DE, Rinaldi MJ, Camenzind E, Wijns W, Apruzzese PK, Song Y, Massaro JM, Mauri L; DAPT Study Investigators. "Development and validation of a prediction rule for benefit and harm of dual antiplatelet therapy beyond 1 year after percutaneous coronary intervention." JAMA. 2016;315(16):1735-1749.',
    },
  },

  // ---- spec-v14 wave 14-2/14-3 backfill: berlin-osa, lemon, white-song ----
  'berlin-osa': {
    citation: 'Netzer NC, Stoohs RA, Netzer CM, Clark K, Strohl KP. Using the Berlin Questionnaire to identify patients at risk for the sleep apnea syndrome. Ann Intern Med. 1999;131(7):485-491.',
    specialties: ['pulmonology', 'nursing-general', 'anesthesiology'],
    example: {
      fields: { 'bo-q1': '0', 'bo-q2': '0', 'bo-q3': '0', 'bo-q4': '0', 'bo-q5': '0', 'bo-q6': '0', 'bo-q7': '0', 'bo-q8': '0', 'bo-htn': '0', 'bo-bmi': '0' },
      expected: 'Berlin Questionnaire: 0 of 3 categories positive -> LOW risk for obstructive sleep apnea per Netzer 1999 (<2 positive categories).',
    },
    interpretation: {
      bands: [
        { range: '0-1 positive categories', text: 'LOW risk for obstructive sleep apnea per Netzer 1999.' },
        { range: '>=2 positive categories', text: 'HIGH risk for obstructive sleep apnea per Netzer 1999.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Netzer NC, et al. Ann Intern Med. 1999;131(7):485-491 (3 categories; high-risk if >=2 positive).',
    },
  },
  lemon: {
    citation: 'Reed MJ, Dunn MJG, McKeown DW. Can an airway assessment score predict difficulty at intubation in the emergency department? Emerg Med J. 2005;22(2):99-102.',
    specialties: ['anesthesiology', 'emergency-medicine', 'critical-care'],
    example: {
      fields: { 'le-look': '0', 'le-incisor': '0', 'le-hyoid': '0', 'le-thyroid': '0', 'le-mp': '0', 'le-obs': '0', 'le-neck': '0' },
      expected: 'LEMON 0 of 7: no predictors of difficult intubation per Reed 2005.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'No predictors of difficult intubation per Reed 2005.' },
        { range: '1-7', text: 'Number of predictors of difficult intubation per Reed 2005; higher = greater difficulty.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Reed MJ, et al. Emerg Med J. 2005;22(2):99-102 (sum of predictors; higher = harder).',
    },
  },
  'white-song': {
    citation: 'White PF, Song D. New criteria for fast-tracking after outpatient anesthesia: a comparison with the modified Aldrete\'s scoring system. Anesth Analg. 1999;88(5):1069-1072.',
    specialties: ['anesthesiology', 'nursing-general'],
    example: {
      fields: { 'ws-loc': '2', 'ws-act': '2', 'ws-hd': '2', 'ws-resp': '2', 'ws-o2': '2', 'ws-pain': '2', 'ws-eme': '2' },
      expected: 'White-Song 14 of 14: fast-track eligible per White 1999 (>=12 with no individual domain <1).',
    },
    interpretation: {
      bands: [
        { range: '<12 or any domain <1', text: 'Not fast-track eligible per White 1999 (cutoff >=12 with no individual domain <1).' },
        { range: '>=12 with no domain <1', text: 'Fast-track eligible per White 1999.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'White PF, Song D. Anesth Analg. 1999;88(5):1069-1072 (seven domains 0-2; fast-track iff sum >=12 and no domain <1).',
    },
  },

  // ---- spec-v15 §3.1 wave 15-1 (partial): obstetrics ----
  bpp: {
    citation: 'Manning FA, Platt LD, Sipos L. Antepartum fetal evaluation: development of a fetal biophysical profile. Am J Obstet Gynecol. 1980;136(6):787-795.',
    specialties: ['obstetrics-gynecology'],
    example: {
      fields: { 'bp-fb': '1', 'bp-fm': '1', 'bp-ft': '1', 'bp-af': '1', 'bp-nst': '1' },
      expected: 'BPP 10 of 10: normal per Manning 1980 (8-10 band).',
    },
    interpretation: {
      bands: [
        { range: '8-10', text: 'Normal per Manning 1980; routine follow-up.' },
        { range: '6', text: 'Equivocal per Manning 1980; repeat in 24 h or further evaluation.' },
        { range: '<=4', text: 'Abnormal per Manning 1980; consider delivery per ACOG Practice Bulletin 145, 2014.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Manning FA, et al. Am J Obstet Gynecol. 1980;136(6):787-795; bands re-affirmed in ACOG Practice Bulletin 145, 2014.',
    },
  },
  'acog-severe-pre': {
    citation: 'ACOG Task Force on Hypertension in Pregnancy. Hypertension in pregnancy. Obstet Gynecol. 2013;122(5):1122-1131. (Re-affirmed ACOG Practice Bulletin 222, 2020.)',
    specialties: ['obstetrics-gynecology', 'emergency-medicine'],
    example: {
      fields: { 'sp-bp': '0', 'sp-plt': '0', 'sp-hep': '0', 'sp-cr': '0', 'sp-pulm': '0', 'sp-neuro': '0' },
      expected: 'ACOG Severe-feature Preeclampsia: 0 of 6 severe features present per ACOG 2013.',
    },
    interpretation: {
      bands: [
        { range: '0 features', text: 'No severe features per ACOG 2013.' },
        { range: '>=1 feature', text: 'Severe preeclampsia per ACOG 2013 (any single feature qualifies).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'ACOG Task Force on Hypertension in Pregnancy. Obstet Gynecol. 2013;122(5):1122-1131 (any one feature qualifies as severe).',
    },
  },
  hellp: {
    citation: 'Sibai BM. The HELLP syndrome (hemolysis, elevated liver enzymes, and low platelets): much ado about nothing? Am J Obstet Gynecol. 1990;162(2):311-316. (Mississippi classification: Martin JN Jr, et al. Am J Obstet Gynecol. 1999;180(6):1373-1384.)',
    specialties: ['obstetrics-gynecology', 'hematology', 'emergency-medicine'],
    example: {
      fields: { 'hl-hem': '0', 'hl-ast': '0', 'hl-plt': '0', 'hl-nadir': '' },
      expected: 'HELLP: no HELLP criteria met per Sibai 1990.',
    },
    interpretation: {
      bands: [
        { range: '0 criteria', text: 'No HELLP criteria met per Sibai 1990.' },
        { range: '1-2 criteria', text: 'Partial HELLP per Sibai 1990.' },
        { range: '3 criteria', text: 'Complete HELLP per Sibai 1990.' },
        { range: 'Mississippi class 1', text: 'Platelet nadir <=50 x10^9/L per Martin 1999.' },
        { range: 'Mississippi class 2', text: 'Platelet nadir 50-100 x10^9/L per Martin 1999.' },
        { range: 'Mississippi class 3', text: 'Platelet nadir 100-150 x10^9/L per Martin 1999.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Sibai BM. Am J Obstet Gynecol. 1990;162(2):311-316; Mississippi class from Martin JN Jr, et al. Am J Obstet Gynecol. 1999;180(6):1373-1384.',
    },
  },
  'carpenter-coustan': {
    citation: 'Carpenter MW, Coustan DR. Criteria for screening tests for gestational diabetes. Am J Obstet Gynecol. 1982;144(7):768-773.',
    specialties: ['obstetrics-gynecology', 'endocrinology'],
    example: {
      fields: { 'cc-f': '85', 'cc-1h': '160', 'cc-2h': '140', 'cc-3h': '120' },
      expected: 'Carpenter-Coustan: 0 of 4 values exceed cutoffs -> not diagnostic of GDM per Carpenter 1982.',
    },
    interpretation: {
      bands: [
        { range: '0 abnormal', text: 'Not diagnostic of GDM per Carpenter 1982.' },
        { range: '1 abnormal', text: 'Impaired glucose tolerance per Carpenter 1982 (single abnormal value).' },
        { range: '>=2 abnormal', text: 'GDM diagnosed per Carpenter 1982 (>=2 values exceed fasting 95 / 1-h 180 / 2-h 155 / 3-h 140 mg/dL).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Carpenter MW, Coustan DR. Am J Obstet Gynecol. 1982;144(7):768-773 (100-g 3-h OGTT; >=2 abnormal -> GDM).',
    },
  },
  iadpsg: {
    citation: 'International Association of Diabetes and Pregnancy Study Groups Consensus Panel. International association of diabetes and pregnancy study groups recommendations on the diagnosis and classification of hyperglycemia in pregnancy. Diabetes Care. 2010;33(3):676-682.',
    specialties: ['obstetrics-gynecology', 'endocrinology'],
    example: {
      fields: { 'ia-f': '85', 'ia-1h': '160', 'ia-2h': '140' },
      expected: 'IADPSG: 0 of 3 values exceed cutoffs -> not diagnostic of GDM per IADPSG 2010.',
    },
    interpretation: {
      bands: [
        { range: '0 abnormal', text: 'Not diagnostic of GDM per IADPSG 2010.' },
        { range: '>=1 abnormal', text: 'GDM diagnosed per IADPSG 2010 (any value exceeds fasting 92 / 1-h 180 / 2-h 153 mg/dL).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'IADPSG 2010 Consensus Panel. Diabetes Care. 2010;33(3):676-682 (75-g 2-h OGTT; >=1 abnormal -> GDM).',
    },
  },

  // ---- spec-v15 §3.2 wave 15-2: pediatric febrile-infant ----
  rochester: {
    citation: 'Jaskiewicz JA, McCarthy CA, Richardson AC, et al. Febrile infants at low risk for serious bacterial infection -- an appraisal of the Rochester criteria and implications for management. Pediatrics. 1994;94(3):390-396.',
    specialties: ['pediatrics', 'emergency-medicine', 'infectious-disease'],
    example: {
      fields: { 'rc-age': '0', 'rc-term': '0', 'rc-focal': '0', 'rc-wbc': '0', 'rc-bands': '0', 'rc-urine': '0', 'rc-stool': '0' },
      expected: 'Rochester: 0 of 7 criteria met -> NOT low risk for SBI per Jaskiewicz 1994 (any failed criterion disqualifies).',
    },
    interpretation: {
      bands: [
        { range: '<7 criteria met', text: 'Not low risk per Jaskiewicz 1994 (any failed criterion disqualifies).' },
        { range: 'all 7 criteria met', text: 'Low risk for SBI per Jaskiewicz 1994.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Jaskiewicz JA, et al. Pediatrics. 1994;94(3):390-396 (low risk only when ALL criteria met).',
    },
  },
  philadelphia: {
    citation: 'Baker MD, Bell LM, Avner JR. Outpatient management without antibiotics of fever in selected infants. N Engl J Med. 1993;329(20):1437-1441.',
    specialties: ['pediatrics', 'emergency-medicine', 'infectious-disease'],
    example: {
      fields: { 'ph-age': '0', 'ph-well': '0', 'ph-wbc': '0', 'ph-bnr': '0', 'ph-ua': '0', 'ph-csf': '0', 'ph-cxr': '0', 'ph-stool': '0' },
      expected: 'Philadelphia: 0 of 8 criteria met -> NOT low risk per Baker 1993 (any failed criterion disqualifies).',
    },
    interpretation: {
      bands: [
        { range: '<8 criteria met', text: 'Not low risk per Baker 1993 (any failed criterion disqualifies).' },
        { range: 'all 8 criteria met', text: 'Low risk; safe outpatient management without empiric antibiotic per Baker 1993.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Baker MD, et al. N Engl J Med. 1993;329(20):1437-1441 (all criteria required).',
    },
  },
  'boston-febrile': {
    citation: "Baskin MN, O'Rourke EJ, Fleisher GR. Outpatient treatment of febrile infants 28 to 89 days of age with intramuscular administration of ceftriaxone. J Pediatr. 1992;120(1):22-27.",
    specialties: ['pediatrics', 'emergency-medicine', 'infectious-disease'],
    example: {
      fields: { 'bf-age': '0', 'bf-well': '0', 'bf-focal': '0', 'bf-wbc': '0', 'bf-ua': '0', 'bf-csf': '0', 'bf-cxr': '0' },
      expected: 'Boston: 0 of 7 criteria met -> NOT eligible for outpatient ceftriaxone management per Baskin 1992.',
    },
    interpretation: {
      bands: [
        { range: '<7 criteria met', text: 'Not eligible for outpatient ceftriaxone management per Baskin 1992.' },
        { range: 'all 7 criteria met', text: 'Eligible for outpatient ceftriaxone management per Baskin 1992.' },
      ],
      sourceQuoted: true,
      sourceCitation: "Baskin MN, et al. J Pediatr. 1992;120(1):22-27 (all criteria required).",
    },
  },
  'step-by-step': {
    citation: 'Gomez B, Mintegi S, Bressan S, Da Dalt L, Gervaix A, Lacroix L, European Group for Validation of the Step-by-Step Approach. Validation of the "Step-by-Step" approach in the management of young febrile infants. Pediatrics. 2016;138(2):e20154381.',
    specialties: ['pediatrics', 'emergency-medicine', 'infectious-disease'],
    example: {
      fields: { 'ss-unwell': '0', 'ss-age': '0', 'ss-ua': '0', 'ss-pct': '0', 'ss-crp': '0' },
      expected: 'Step-by-Step: LOW risk per Gomez 2016 (all preceding steps negative).',
    },
    interpretation: {
      bands: [
        { range: 'low', text: 'Low risk per Gomez 2016 (all preceding steps negative).' },
        { range: 'intermediate', text: 'Intermediate risk per Gomez 2016 (CRP >20 mg/L or ANC >10 x10^9/L).' },
        { range: 'high', text: 'High risk per Gomez 2016 (unwell appearance OR age <=21 d OR abnormal UA OR PCT >=0.5).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Gomez B, et al. Pediatrics. 2016;138(2):e20154381 Figure 1 (sequential decision tree).',
    },
  },
  yos: {
    citation: 'McCarthy PL, Sharpe MR, Spiesel SZ, et al. Observation scales to identify serious illness in febrile children. Pediatrics. 1982;70(5):802-809.',
    specialties: ['pediatrics', 'emergency-medicine'],
    example: {
      fields: { 'yo-cry': '1', 'yo-react': '1', 'yo-state': '1', 'yo-color': '1', 'yo-hydr': '1', 'yo-social': '1' },
      expected: 'YOS 6 of 30: low SBI risk per McCarthy 1982 (<=10 band).',
    },
    interpretation: {
      bands: [
        { range: '<=10', text: 'Low SBI risk per McCarthy 1982.' },
        { range: '11-15', text: 'Increased SBI risk per McCarthy 1982.' },
        { range: '>=16', text: 'High probability of serious bacterial infection per McCarthy 1982.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'McCarthy PL, et al. Pediatrics. 1982;70(5):802-809 (six items each 1/3/5).',
    },
  },

  // ---- spec-v15 §3.3 wave 15-3: pediatric respiratory + neurologic ----
  westley: {
    citation: 'Westley CR, Cotton EK, Brooks JG. Nebulized racemic epinephrine by IPPB for the treatment of croup: a double-blind study. Am J Dis Child. 1978;132(5):484-487.',
    specialties: ['pediatrics', 'emergency-medicine'],
    example: {
      fields: { 'wc-loc': '0', 'wc-cyan': '0', 'wc-stri': '0', 'wc-air': '0', 'wc-retr': '0' },
      expected: 'Westley 0 of 17: mild croup per Westley 1978 (<3 band).',
    },
    interpretation: {
      bands: [
        { range: '<3', text: 'Mild croup per Westley 1978.' },
        { range: '3-7', text: 'Moderate croup per Westley 1978.' },
        { range: '8-11', text: 'Severe croup per Westley 1978.' },
        { range: '>=12', text: 'Impending respiratory failure per Westley 1978.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Westley CR, et al. Am J Dis Child. 1978;132(5):484-487 §Methods.',
    },
    derivation: {
      formula: 'Westley croup score = sum across 5 items with non-uniform per-item maxima (Westley 1978 Table 1). Range 0-17.\n  Level of consciousness:    normal (0) | disoriented (5)\n  Cyanosis:                  none (0) | with agitation (4) | at rest (5)\n  Stridor:                   none (0) | with agitation (1) | at rest (2)\n  Air entry:                  normal (0) | decreased (1) | markedly decreased (2)\n  Retractions:                none (0) | mild (1) | moderate (2) | severe (3)\nBands per Westley 1978: < 3 mild; 3-7 moderate; 8-11 severe; >= 12 impending respiratory failure.',
      components: [
        { inputKey: 'loc',         label: 'Level of consciousness (normal: 0 / disoriented: 5)', points: (v) => (Math.round(Number(v) || 0) >= 1 ? 5 : 0) },
        { inputKey: 'cyanosis',    label: 'Cyanosis (none: 0 / with agitation: 4 / at rest: 5)',  points: (v) => { const n = Math.round(Number(v) || 0); if (n >= 5) return 5; if (n >= 1) return 4; return 0; } },
        { inputKey: 'stridor',     label: 'Stridor (none: 0 / with agitation: 1 / at rest: 2)',   points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'airEntry',    label: 'Air entry (normal: 0 / decreased: 1 / markedly decreased: 2)', points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'retractions', label: 'Retractions (none: 0 / mild: 1 / moderate: 2 / severe: 3)',    points: (v) => Math.max(0, Math.min(3, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: { op: '<', value: 3 },   label: 'mild croup' },
        { range: [3, 7],                  label: 'moderate croup' },
        { range: [8, 11],                 label: 'severe croup' },
        { range: { op: '>=', value: 12 }, label: 'impending respiratory failure' },
      ],
      population: 'Westley 1978: derived from a double-blind RCT of nebulized racemic epinephrine versus placebo by IPPB in 20 children with viral croup at the Children\'s Hospital of Denver. The score was constructed to provide a quantitative outcome measure for the trial; subsequent decades of pediatric ED use established the bands now used for management escalation.',
      units: {
        loc: 'integer 0 (normal) or 5 (disoriented)',
        cyanosis: 'integer 0 (none) / 4 (with agitation) / 5 (at rest)',
        stridor: 'integer 0-2',
        airEntry: 'integer 0-2',
        retractions: 'integer 0-3',
      },
      validity: 'Children with viral croup (laryngotracheitis) presenting to the ED or pediatric unit. The score guides decisions about racemic epinephrine, dexamethasone, observation duration, and admission. Not validated for non-croup upper-airway obstruction (epiglottitis, bacterial tracheitis, anaphylaxis, retropharyngeal abscess), for spasmodic / recurrent croup outside the acute viral context, or for adolescents with persistent stridor (where the underlying anatomy differs).',
      source: 'Westley CR, Cotton EK, Brooks JG. "Nebulized racemic epinephrine by IPPB for the treatment of croup: a double-blind study." Am J Dis Child. 1978;132(5):484-487.',
    },
  },
  'pram-asthma': {
    citation: 'Chalut DS, Ducharme FM, Davis GM. The Preschool Respiratory Assessment Measure (PRAM): a responsive index of acute asthma severity. J Pediatr. 2000;137(6):762-768.',
    specialties: ['pediatrics', 'emergency-medicine', 'pulmonology'],
    example: {
      fields: { 'pr-supra': '0', 'pr-scal': '0', 'pr-air': '0', 'pr-wheez': '0', 'pr-spo2': '0' },
      expected: 'PRAM 0 of 12: mild asthma per Chalut 2000 (0-3 band).',
    },
    interpretation: {
      bands: [
        { range: '0-3', text: 'Mild asthma per Chalut 2000.' },
        { range: '4-7', text: 'Moderate asthma per Chalut 2000.' },
        { range: '8-12', text: 'Severe asthma per Chalut 2000.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Chalut DS, et al. J Pediatr. 2000;137(6):762-768 §Results.',
    },
    derivation: {
      formula: 'PRAM = sum across 5 items with item-specific allowed values (Chalut 2000 Table 2). Range 0-12.\n  Suprasternal retractions:           absent (0) | present (2)\n  Scalene muscle contraction:         absent (0) | present (2)\n  Air entry (auscultation):           normal (0) | decreased at bases (1) | widespread decrease (2) | absent / minimal (3)\n  Wheezing:                           none (0) | expiratory only (1) | inspiratory + expiratory (2) | audible without stethoscope / silent chest (3)\n  Oxygen saturation:                  >=95% (0) | 92-94% (1) | <92% (2)\nBands per Chalut 2000: 0-3 mild; 4-7 moderate; 8-12 severe asthma.',
      components: [
        { inputKey: 'suprasternal', label: 'Suprasternal retractions (absent: 0 / present: 2)',                                                            points: (v) => (Math.round(Number(v) || 0) >= 1 ? 2 : 0) },
        { inputKey: 'scalene',      label: 'Scalene muscle contraction (absent: 0 / present: 2)',                                                          points: (v) => (Math.round(Number(v) || 0) >= 1 ? 2 : 0) },
        { inputKey: 'airEntry',     label: 'Air entry (normal 0 / decreased at bases 1 / widespread decrease 2 / absent or minimal 3)',                    points: (v) => Math.max(0, Math.min(3, Math.round(Number(v) || 0))) },
        { inputKey: 'wheezing',     label: 'Wheezing (none 0 / expiratory only 1 / insp+exp 2 / audible without stethoscope or silent chest 3)',           points: (v) => Math.max(0, Math.min(3, Math.round(Number(v) || 0))) },
        { inputKey: 'spo2',         label: 'Oxygen saturation (>=95%: 0 / 92-94%: 1 / <92%: 2)',                                                            points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: [0, 3],  label: 'mild asthma' },
        { range: [4, 7],  label: 'moderate asthma' },
        { range: [8, 12], label: 'severe asthma' },
      ],
      population: 'Chalut 2000: prospective derivation and validation in 258 children aged 6 weeks to 17 years presenting to a pediatric ED with acute asthma exacerbation at a single Montreal center. The PRAM was designed to be reliably reproducible across pediatric ED examiners; subsequent multi-site validations (Chalut 2000 follow-up + Ducharme 2008) established the >= 4 / >= 8 cutoffs used for management escalation in current pediatric asthma guidelines.',
      units: {
        suprasternal: 'integer 0 or 2 (selection snapped to nearest allowed value)',
        scalene: 'integer 0 or 2 (selection snapped to nearest allowed value)',
        airEntry: 'integer 0-3 (clamped to allowed values)',
        wheezing: 'integer 0-3 (clamped to allowed values)',
        spo2: 'integer 0-2 banded SpO2 score (>=95: 0 / 92-94: 1 / <92: 2)',
      },
      validity: 'Children with acute asthma exacerbation. PRAM is one of two widely-used pediatric asthma severity scores (the other is PASS, Gorelick 2004; surfaced as a separate Sophie tile). PRAM\'s 12-point range and per-item maxima are non-uniform — Sophie clamps each item to its allowed value set on input. Not validated for adults (use FEV1 or peak flow), for infants under ~6 weeks (insufficient cooperation for SpO2), or for non-asthma pediatric wheeze (bronchiolitis severity scores differ).',
      source: 'Chalut DS, Ducharme FM, Davis GM. "The Preschool Respiratory Assessment Measure (PRAM): a responsive index of acute asthma severity." J Pediatr. 2000;137(6):762-768.',
    },
  },
  'pass-asthma': {
    citation: 'Gorelick MH, Stevens MW, Schultz TR, Scribano PV. Performance of a novel clinical score, the pediatric asthma severity score (PASS), in the evaluation of acute asthma. Acad Emerg Med. 2004;11(1):10-18.',
    specialties: ['pediatrics', 'emergency-medicine', 'pulmonology'],
    example: {
      fields: { 'pa-wh': '0', 'pa-wob': '0', 'pa-exp': '0' },
      expected: 'PASS 0 of 6: mild asthma per Gorelick 2004 (0-1 band).',
    },
    interpretation: {
      bands: [
        { range: '0-1', text: 'Mild asthma per Gorelick 2004.' },
        { range: '2-3', text: 'Moderate asthma per Gorelick 2004.' },
        { range: '4-6', text: 'Severe asthma per Gorelick 2004.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Gorelick MH, et al. Acad Emerg Med. 2004;11(1):10-18.',
    },
    derivation: {
      formula: 'PASS = sum across 3 items each 0-2 (clamped), range 0-6 (Gorelick 2004 Table 1).\n  Wheezing             (0-2): none (0) | end-expiratory (1) | throughout exhalation or audible without stethoscope (2)\n  Work of breathing    (0-2): no retractions (0) | intercostal retractions (1) | suprasternal / nasal flaring / abdominal accessory use (2)\n  Prolonged expiration (0-2): normal (0) | mild prolongation (1) | severe prolongation with audible wheeze on inspiration (2)\nBands per Gorelick 2004: 0-1 mild; 2-3 moderate; 4-6 severe asthma.',
      components: [
        { inputKey: 'wheezing',            label: 'Wheezing (0-2)',                points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'workOfBreathing',     label: 'Work of breathing (0-2)',       points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'prolongedExpiration', label: 'Prolonged expiration (0-2)',    points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: [0, 1], label: 'mild asthma' },
        { range: [2, 3], label: 'moderate asthma' },
        { range: [4, 6], label: 'severe asthma' },
      ],
      population: 'Gorelick 2004: prospective derivation and validation in 852 children aged 1-18 years presenting to two urban pediatric EDs with acute asthma exacerbation. PASS was designed as a shorter alternative to PRAM (5 items) with the same level of inter-rater reliability and discrimination against post-treatment outcomes (admission, length of stay, response to therapy).',
      units: {
        wheezing: 'integer 0-2 (clamped)',
        workOfBreathing: 'integer 0-2 (clamped)',
        prolongedExpiration: 'integer 0-2 (clamped)',
      },
      validity: 'Children aged 1-18 with acute asthma exacerbation. PASS and PRAM (Chalut 2000) are both endorsed by current pediatric ED asthma guidelines; PASS is faster to score, PRAM has stronger inter-rater reliability in some studies. Not validated for adults (use FEV1 or peak flow), for infants under ~12 months (use bronchiolitis-specific severity scores), or for asthma exacerbations triggered by anaphylaxis or upper-airway obstruction.',
      source: 'Gorelick MH, Stevens MW, Schultz TR, Scribano PV. "Performance of a novel clinical score, the pediatric asthma severity score (PASS), in the evaluation of acute asthma." Acad Emerg Med. 2004;11(1):10-18.',
    },
  },
  'peds-gcs': {
    citation: 'Reilly PL, Simpson DA, Sprod R, Thomas L. Assessing the conscious level in infants and young children: a paediatric version of the Glasgow Coma Scale. Childs Nerv Syst. 1988;4(1):30-33. (Verbal age-adjustment: James HE. Pediatr Ann. 1986;15(1):16-22.)',
    specialties: ['pediatrics', 'emergency-medicine', 'neurology', 'critical-care'],
    example: {
      fields: { 'pg-eye': '4', 'pg-verb': '5', 'pg-mot': '6', 'pg-age': 'older' },
      expected: 'Pediatric GCS 15 of 15 (older child verbal scale): mild per adult GCS bands (<=8 severe, 9-12 moderate, 13-15 mild).',
    },
    interpretation: {
      bands: [
        { range: '<=8', text: 'Severe per adult GCS bands.' },
        { range: '9-12', text: 'Moderate per adult GCS bands.' },
        { range: '13-15', text: 'Mild per adult GCS bands.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Reilly PL, et al. Childs Nerv Syst. 1988;4(1):30-33; verbal age-adjustment from James HE. Pediatr Ann. 1986;15(1):16-22.',
    },
  },
  nigrovic: {
    citation: 'Nigrovic LE, Kuppermann N, Macias CG, et al. Clinical prediction rule for identifying children with cerebrospinal fluid pleocytosis at very low risk of bacterial meningitis. JAMA. 2007;297(1):52-60.',
    specialties: ['pediatrics', 'emergency-medicine', 'infectious-disease', 'neurology'],
    example: {
      fields: { 'ni-gram': '0', 'ni-csf-anc': '0', 'ni-prot': '0', 'ni-anc': '0', 'ni-sz': '0' },
      expected: 'Nigrovic: 0 -> very low risk for bacterial meningitis per Nigrovic 2007 (NPV ~99.9%).',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Very low risk for bacterial meningitis per Nigrovic 2007 (NPV ~99.9%).' },
        { range: '>=1', text: 'Not low risk per Nigrovic 2007; do not discharge.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Nigrovic LE, et al. JAMA. 2007;297(1):52-60 (positive Gram stain weighted +2; all others +1).',
    },
  },

  // ---- spec-v15 §3.4 wave 15-4: pediatric imaging-decision ----
  'pecarn-iai': {
    citation: 'Holmes JF, Lillis K, Monroe D, et al. Identifying children at very low risk of clinically important blunt abdominal injuries. Ann Emerg Med. 2013;62(2):107-116.e2.',
    specialties: ['pediatrics', 'emergency-medicine', 'surgery'],
    example: {
      fields: { 'pi-wall': '0', 'pi-gcs': '0', 'pi-tender': '0', 'pi-vom': '0', 'pi-thor': '0', 'pi-pain': '0', 'pi-breath': '0' },
      expected: 'PECARN IAI: 0 of 7 risk findings present -> very low risk of clinically important IAI per Holmes 2013 (NPV 99.9%).',
    },
    interpretation: {
      bands: [
        { range: 'all 7 absent', text: 'Very low risk of clinically important IAI per Holmes 2013 (NPV 99.9%).' },
        { range: 'any present', text: 'Not very low risk per Holmes 2013; consider imaging.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Holmes JF, et al. Ann Emerg Med. 2013;62(2):107-116.e2 (all seven negative findings required for very-low-risk classification).',
    },
  },
  'pecarn-cspine': {
    citation: 'Leonard JC, Browne LR, Ahmad FA, et al. Cervical spine injury risk factors in children with blunt trauma. Pediatrics. 2019;144(1):e20183221. (Derivation: Leonard JC, Kuppermann N, Olsen C, et al. Ann Emerg Med. 2011;58(2):145-155.)',
    specialties: ['pediatrics', 'emergency-medicine', 'surgery', 'neurology'],
    example: {
      fields: { 'pc-ams': '0', 'pc-abc': '0', 'pc-neuro': '0', 'pc-neck': '0', 'pc-tort': '0', 'pc-torso': '0', 'pc-pred': '0', 'pc-mvc': '0' },
      expected: 'PECARN C-Spine: 0 of 8 risk factors present -> LOW risk per Leonard 2019; cervical-spine imaging not indicated.',
    },
    interpretation: {
      bands: [
        { range: 'all 8 absent', text: 'Low risk per Leonard 2019; cervical-spine imaging not indicated.' },
        { range: 'any present', text: 'Not low risk per Leonard 2019; cervical-spine imaging warranted.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Leonard JC, et al. Pediatrics. 2019;144(1):e20183221 (any single factor disqualifies low-risk classification).',
    },
  },

  // ---- spec-v15 §3.5 wave 15-5 (partial): trauma scoring ----
  'abc-mtp': {
    citation: 'Nunez TC, Voskresensky IV, Dossett LA, Shinall R, Dutton WD, Cotton BA. Early prediction of massive transfusion in trauma: simple as ABC (assessment of blood consumption)? J Trauma. 2009;66(2):346-352.',
    specialties: ['emergency-medicine', 'surgery', 'hematology', 'critical-care'],
    example: {
      fields: { 'abc-pen': '0', 'abc-sbp': '0', 'abc-hr': '0', 'abc-fast': '0' },
      expected: 'ABC 0 of 4: MTP activation not indicated by ABC alone per Nunez 2009 (>=2 threshold).',
    },
    interpretation: {
      bands: [
        { range: '0-1', text: 'MTP activation not indicated by ABC alone per Nunez 2009 (>=2 threshold).' },
        { range: '>=2', text: 'Activate massive transfusion protocol per Nunez 2009 (sensitivity 75%, specificity 86%).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Nunez TC, et al. J Trauma. 2009;66(2):346-352 (>=2 of 4 criteria predicts massive transfusion).',
    },
    derivation: {
      formula: 'ABC = count of 4 binary criteria present at ED admission, range 0-4 (Nunez 2009 Table 2).\n  Penetrating mechanism of injury                                  (+1)\n  Initial SBP <= 90 mmHg                                            (+1)\n  Initial HR >= 120 bpm                                             (+1)\n  Positive FAST (focused assessment with sonography for trauma)    (+1)\nCutoff per Nunez 2009: >= 2 of 4 criteria -> activate massive transfusion protocol (sensitivity 75%, specificity 86% in derivation cohort).',
      components: [
        { inputKey: 'penetratingMechanism', label: 'Penetrating mechanism of injury (+1)', points: 1 },
        { inputKey: 'sbpLe90',              label: 'Initial SBP <= 90 mmHg (+1)',          points: 1 },
        { inputKey: 'hrGe120',              label: 'Initial HR >= 120 bpm (+1)',           points: 1 },
        { inputKey: 'positiveFast',         label: 'Positive FAST (+1)',                   points: 1 },
      ],
      bands: [
        { range: [0, 1],                 label: 'MTP activation not indicated by ABC alone' },
        { range: { op: '>=', value: 2 }, label: 'activate massive transfusion protocol' },
      ],
      population: 'Nunez 2009: retrospective derivation in 596 trauma patients receiving any blood product transfusion at Vanderbilt University Medical Center (level-I trauma); prospective validation in a separate 110-patient cohort. Outcome: massive transfusion (>= 10 units pRBC in the first 24 hours).',
      units: {
        penetratingMechanism: 'boolean (penetrating injury mechanism)',
        sbpLe90: 'boolean (initial ED systolic blood pressure <= 90 mmHg)',
        hrGe120: 'boolean (initial ED heart rate >= 120 bpm)',
        positiveFast: 'boolean (positive focused assessment with sonography for trauma)',
      },
      validity: 'Adult trauma patients arriving to a trauma center. The ABC score is designed for early bedside-fast triage to massive transfusion activation; it is one input among several (clinical gestalt, base deficit, lactate, INR / TEG, anatomic injury pattern) for the MTP-activation decision. The >= 2 threshold balances sensitivity and over-activation; institutional MTP triggers commonly augment ABC with shock index or trauma-specific lab values. Not validated for blunt-only mechanisms in older patients (where atypical presentation may delay scoring), for pediatric trauma (use pediatric-specific MTP triggers), or for non-traumatic massive bleeding (GI bleed, OB hemorrhage — use scenario-specific protocols).',
      source: 'Nunez TC, Voskresensky IV, Dossett LA, Shinall R, Dutton WD, Cotton BA. "Early prediction of massive transfusion in trauma: simple as ABC (assessment of blood consumption)?" J Trauma. 2009;66(2):346-352.',
    },
  },
  mgap: {
    citation: 'Sartorius D, Le Manach Y, David JS, et al. Mechanism, glasgow coma scale, age, and arterial pressure (MGAP): a new simple prehospital triage score to predict mortality in trauma patients. Crit Care Med. 2010;38(3):831-837.',
    specialties: ['emergency-medicine', 'critical-care'],
    example: {
      fields: { 'mgap-mech': 'blunt', 'mgap-gcs': '15', 'mgap-age': 'lt60', 'mgap-sbp': '130' },
      expected: 'MGAP 29: low risk per Sartorius 2010 (<18 high; 18-22 moderate; 23-29 low).',
    },
    interpretation: {
      bands: [
        { range: '<18', text: 'High risk per Sartorius 2010.' },
        { range: '18-22', text: 'Moderate risk per Sartorius 2010.' },
        { range: '23-29', text: 'Low risk per Sartorius 2010.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Sartorius D, et al. Crit Care Med. 2010;38(3):831-837 Table 3.',
    },
    derivation: {
      formula: 'MGAP = sum across 4 prehospital trauma items (Sartorius 2010 Table 2). Range 3-29.\n  Mechanism: blunt    (+4) | penetrating (0)\n  GCS (3-15):  passed through as the raw GCS value\n  Age < 60                                                          (+5)\n  SBP: > 120 mmHg (+5) | 60-120 (+3) | < 60 (0)\nBands per Sartorius 2010 Table 3 (in-hospital mortality risk): < 18 high; 18-22 moderate; 23-29 low.',
      components: [
        { inputKey: 'mechanismBlunt', label: 'Mechanism: blunt (+4) / penetrating (0)',                   points: (v) => (v ? 4 : 0) },
        { inputKey: 'gcs',            label: 'GCS (3-15)',                                                 points: (v) => Number(v) || 0 },
        { inputKey: 'ageLt60',        label: 'Age < 60 (+5)',                                              points: 5 },
        { inputKey: 'sbp',            label: 'SBP (>120: +5 / 60-120: +3 / <60: 0)',                       points: (v) => { const n = Number(v); if (n > 120) return 5; if (n >= 60) return 3; return 0; } },
      ],
      bands: [
        { range: { op: '<', value: 18 }, label: 'high risk' },
        { range: [18, 22],                label: 'moderate risk' },
        { range: [23, 29],                label: 'low risk' },
      ],
      population: 'Sartorius 2010: prospective derivation in 1360 prehospital trauma patients treated by physician-staffed SMUR units in France; external validation in 1003 patients from the German Trauma Society registry. Outcome: in-hospital mortality. The MGAP score outperformed RTS (Revised Trauma Score) in the derivation cohort with the advantage of using prehospital-available variables only.',
      units: {
        mechanismBlunt: 'boolean (true = blunt mechanism gets +4; penetrating = 0)',
        gcs: 'integer 3-15 (Glasgow Coma Scale; raw value enters the sum)',
        ageLt60: 'boolean (age < 60 gets +5)',
        sbp: 'mmHg (initial systolic blood pressure)',
      },
      validity: 'Prehospital adult trauma triage. MGAP and the related GAP score (Kondo 2011) use widely-available variables (GCS, age, SBP) and require no anatomic injury scoring (unlike ISS or RTS). External validation in non-European cohorts is mixed; institutional trauma triage protocols may use MGAP / GAP as one input alongside anatomic criteria and mechanism. Not validated for pediatric trauma (use BIG / Borgman 2011 instead), for non-trauma critical illness, or for use beyond initial triage (where serial scores or anatomic data become available).',
      source: 'Sartorius D, Le Manach Y, David JS, Rancurel E, Smail N, Thicoipe M, Wiel E, Ricard-Hibon A, Berthier F, Gueugniaud PY, Riou B. "Mechanism, glasgow coma scale, age, and arterial pressure (MGAP): a new simple prehospital triage score to predict mortality in trauma patients." Crit Care Med. 2010;38(3):831-837.',
    },
  },
  gap: {
    citation: 'Kondo Y, Abe T, Kohshi K, Tokuda Y, Cook EF, Kukita I. Revised trauma scoring system to predict in-hospital mortality in the emergency department: Glasgow Coma Scale, Age, and Systolic Blood Pressure score. Crit Care. 2011;15(4):R191.',
    specialties: ['emergency-medicine', 'critical-care'],
    example: {
      fields: { 'gap-gcs': '15', 'gap-age': 'lt60', 'gap-sbp': '130' },
      expected: 'GAP 24: low risk per Kondo 2011 (<=10 high; 11-18 moderate; 19-24 low).',
    },
    interpretation: {
      bands: [
        { range: '<=10', text: 'High risk per Kondo 2011.' },
        { range: '11-18', text: 'Moderate risk per Kondo 2011.' },
        { range: '19-24', text: 'Low risk per Kondo 2011.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Kondo Y, et al. Crit Care. 2011;15(4):R191.',
    },
    derivation: {
      formula: 'GAP = sum across 3 items (Kondo 2011 §Methods). Range 3-24.\n  GCS (3-15):  passed through as the raw GCS value\n  Age < 60                                                          (+3)\n  SBP: > 120 mmHg (+6) | 60-120 (+4) | < 60 (0)\nBands per Kondo 2011 (in-hospital mortality): <= 10 high; 11-18 moderate; 19-24 low.',
      components: [
        { inputKey: 'gcs',     label: 'GCS (3-15)',                                          points: (v) => Number(v) || 0 },
        { inputKey: 'ageLt60', label: 'Age < 60 (+3)',                                       points: 3 },
        { inputKey: 'sbp',     label: 'SBP (>120: +6 / 60-120: +4 / <60: 0)',                 points: (v) => { const n = Number(v); if (n > 120) return 6; if (n >= 60) return 4; return 0; } },
      ],
      bands: [
        { range: { op: '<=', value: 10 }, label: 'high risk' },
        { range: [11, 18],                 label: 'moderate risk' },
        { range: [19, 24],                 label: 'low risk' },
      ],
      population: 'Kondo 2011: retrospective derivation in 35,732 trauma patients from the Japan Trauma Data Bank (2004-2009) presenting to 222 hospitals; outcome was in-hospital mortality. Kondo dropped the mechanism term from MGAP (Sartorius 2010) on the grounds that it added little incremental information in the Japanese cohort, where penetrating trauma is uncommon. External validation outside Japan is limited.',
      units: {
        gcs: 'integer 3-15 (Glasgow Coma Scale; raw value enters the sum)',
        ageLt60: 'boolean (age < 60 gets +3)',
        sbp: 'mmHg (initial systolic blood pressure)',
      },
      validity: 'Adult ED trauma triage. GAP simplifies MGAP (Sartorius 2010) by dropping the mechanism term; it has comparable discrimination in cohorts where blunt mechanism dominates. External validation in trauma systems with high penetrating-trauma prevalence is limited; in such systems MGAP may be preferred. Not validated for pediatric trauma (use BIG / Borgman 2011 instead), non-trauma critical illness, or for use beyond initial triage.',
      source: 'Kondo Y, Abe T, Kohshi K, Tokuda Y, Cook EF, Kukita I. "Revised trauma scoring system to predict in-hospital mortality in the emergency department: Glasgow Coma Scale, Age, and Systolic Blood Pressure score." Crit Care. 2011;15(4):R191.',
    },
  },
  big: {
    citation: 'Borgman MA, Maegele M, Wade CE, Blackbourne LH, Spinella PC. Pediatric trauma BIG score: predicting mortality in children after military and civilian trauma. Pediatrics. 2011;127(4):e892-e897.',
    specialties: ['pediatrics', 'emergency-medicine', 'critical-care'],
    example: {
      fields: { 'big-bd': '0', 'big-inr': '1', 'big-gcs': '15' },
      expected: 'BIG 2.5: <16 -> below the Borgman 2011 high-mortality threshold.',
    },
    interpretation: {
      bands: [
        { range: '<16', text: 'Below Borgman 2011 high-mortality threshold.' },
        { range: '>=16', text: 'High predicted mortality per Borgman 2011.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Borgman MA, et al. Pediatrics. 2011;127(4):e892-e897 (BIG = base deficit + 2.5 * INR + (15 - GCS)).',
    },
  },

  // ---- spec-v29 §4 wave 29-3a: nurse-bedside scoring tiles (partial) ----
  braden: {
    citation: 'Bergstrom N, Braden BJ, Laguzza A, Holman V. The Braden Scale for predicting pressure sore risk. Nurs Res. 1987;36(4):205-210.',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'geriatrics', 'wound-care'],
    example: {
      fields: { 'br-sens': '4', 'br-moist': '4', 'br-act': '4', 'br-mob': '4', 'br-nutr': '4', 'br-fric': '3' },
      expected: 'Braden 23: not at risk per Bergstrom 1987.',
    },
    interpretation: {
      bands: [
        { range: '>=19', text: 'Not at risk.' },
        { range: '15-18', text: 'Mild risk.' },
        { range: '13-14', text: 'Moderate risk.' },
        { range: '10-12', text: 'High risk.' },
        { range: '<=9', text: 'Very high risk.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Bergstrom N, et al. Nurs Res. 1987;36(4):205-210 (six ordinal items; total 6-23).',
    },
    derivation: {
      formula: 'Braden = sum of 6 ordinal items (range 6-23):\n  Sensory perception (1 completely limited / 2 very limited / 3 slightly limited / 4 no impairment)\n  Moisture (1 constantly moist / 2 often moist / 3 occasionally moist / 4 rarely moist)\n  Activity (1 bedfast / 2 chairfast / 3 walks occasionally / 4 walks frequently)\n  Mobility (1 completely immobile / 2 very limited / 3 slightly limited / 4 no limitation)\n  Nutrition (1 very poor / 2 probably inadequate / 3 adequate / 4 excellent)\n  Friction and shear (1 problem / 2 potential problem / 3 no apparent problem)',
      components: [
        { inputKey: 'sensory',   label: 'Sensory perception (1-4)',     points: (v) => Math.max(1, Math.min(4, Number(v) || 1)) },
        { inputKey: 'moisture',  label: 'Moisture (1-4)',                points: (v) => Math.max(1, Math.min(4, Number(v) || 1)) },
        { inputKey: 'activity',  label: 'Activity (1-4)',                points: (v) => Math.max(1, Math.min(4, Number(v) || 1)) },
        { inputKey: 'mobility',  label: 'Mobility (1-4)',                points: (v) => Math.max(1, Math.min(4, Number(v) || 1)) },
        { inputKey: 'nutrition', label: 'Nutrition (1-4)',               points: (v) => Math.max(1, Math.min(4, Number(v) || 1)) },
        { inputKey: 'friction',  label: 'Friction and shear (1-3)',      points: (v) => Math.max(1, Math.min(3, Number(v) || 1)) },
      ],
      bands: [
        { range: { op: '<=', value: 9 },  label: 'very high risk' },
        { range: [10, 12],                label: 'high risk' },
        { range: [13, 14],                label: 'moderate risk' },
        { range: [15, 18],                label: 'mild risk' },
        { range: { op: '>=', value: 19 }, label: 'not at risk' },
      ],
      population: 'Bergstrom 1987: validation in 100 adult patients across medical-surgical and ICU settings. Subsequently validated in long-term care, home health, and pediatrics (with modified Braden Q for children).',
      units: {
        sensory: 'integer 1-4', moisture: 'integer 1-4', activity: 'integer 1-4',
        mobility: 'integer 1-4', nutrition: 'integer 1-4',
        friction: 'integer 1-3 (note: friction caps at 3, not 4)',
      },
      validity: 'Adult inpatients at risk for pressure injury. Score guides preventive interventions; specific institutional protocols govern frequency of repositioning, support-surface choice, and skin-assessment intervals. The friction component is unique in scoring 1-3 (not 1-4); the Sophie tile enforces this in its `points` callback. NOT validated for active treatment of existing pressure injuries (different staging tools).',
      source: 'Bergstrom N, Braden BJ, Laguzza A, Holman V. "The Braden Scale for predicting pressure sore risk." Nurs Res. 1987;36(4):205-210.',
    },
  },
  'morse-falls': {
    citation: 'Morse JM, Morse RM, Tylko SJ. Development of a scale to identify the fall-prone patient. Can J Aging. 1989;8(4):366-377.',
    specialties: ['nursing-floor', 'nursing-general', 'geriatrics'],
    example: {
      fields: { 'mf-aid': 'none', 'mf-gait': 'normal', 'mf-ms': 'oriented' },
      expected: 'Morse 0: low fall risk per Morse 1989.',
    },
    interpretation: {
      bands: [
        { range: '0-24', text: 'Low fall risk.' },
        { range: '25-50', text: 'Moderate fall risk.' },
        { range: '>=51', text: 'High fall risk.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Morse JM, et al. Can J Aging. 1989;8(4):366-377 (six weighted items; 0-125).',
    },
    derivation: {
      formula: 'Morse Falls = sum of 6 weighted items (range 0-125, though practical max ~120):\n  History of falling (within 3 months): no → 0; yes → 25\n  Secondary diagnosis (≥2 medical diagnoses on chart): no → 0; yes → 15\n  Ambulatory aid: none / bed rest / nurse assist → 0; crutches / cane / walker → 15; furniture → 30\n  IV therapy or saline lock: no → 0; yes → 20\n  Gait / transferring: normal / bed rest / wheelchair → 0; weak → 10; impaired → 20\n  Mental status: oriented to own ability → 0; forgets limitations → 15',
      components: [
        { inputKey: 'history',         label: 'History of falling (within 3 months)',                          points: 25 },
        { inputKey: 'secondaryDx',     label: 'Secondary diagnosis (>=2 medical diagnoses on chart)',          points: 15 },
        { inputKey: 'ambulatoryAid',   label: 'Ambulatory aid (none=0 / crutches/cane/walker=15 / furniture=30)', points: (v) => v === 'furniture' ? 30 : v === 'crutches-cane-walker' ? 15 : 0 },
        { inputKey: 'ivOrLock',        label: 'IV therapy or saline lock',                                     points: 20 },
        { inputKey: 'gait',            label: 'Gait (normal=0 / weak=10 / impaired=20)',                       points: (v) => v === 'impaired' ? 20 : v === 'weak' ? 10 : 0 },
        { inputKey: 'mentalStatus',    label: 'Mental status (oriented=0 / forgets-limitations=15)',           points: (v) => v === 'forgets-limitations' ? 15 : 0 },
      ],
      bands: [
        { range: [0, 24],                 label: 'low fall risk' },
        { range: [25, 50],                label: 'moderate fall risk' },
        { range: { op: '>=', value: 51 }, label: 'high fall risk' },
      ],
      population: 'Morse 1989: derivation in 100 fall-prone and 100 control adult inpatients across 16 nursing units (rehabilitation, long-term care, acute care). Refined in subsequent multi-center implementation studies.',
      units: {
        history: 'boolean', secondaryDx: 'boolean',
        ambulatoryAid: '"none" | "crutches-cane-walker" | "furniture"',
        ivOrLock: 'boolean',
        gait: '"normal" | "weak" | "impaired"',
        mentalStatus: '"oriented" | "forgets-limitations"',
      },
      validity: 'Adult inpatients. The Morse Falls Scale is one of several fall-risk instruments (Hendrich II, STRATIFY, Schmid). Cutoff bands vary by institution — Morse 1989 proposed 25/51 boundaries but later literature suggests institutions should re-calibrate to their own fall rates. Score guides preventive interventions (bed-alarm, sitter, low bed, non-skid socks); it is NOT a treatment plan.',
      source: 'Morse JM, Morse RM, Tylko SJ. "Development of a scale to identify the fall-prone patient." Can J Aging. 1989;8(4):366-377.',
    },
  },
  'hendrich-ii': {
    citation: 'Hendrich AL, Bender PS, Nyhuis A. Validation of the Hendrich II Fall Risk Model: a large concurrent case/control study of hospitalized patients. Appl Nurs Res. 2003;16(1):9-21.',
    specialties: ['nursing-floor', 'nursing-general', 'geriatrics'],
    example: {
      fields: { 'hii-gug': 'able' },
      expected: 'Hendrich II 0: below the Hendrich 2003 high-risk cutoff (>=5).',
    },
    interpretation: {
      bands: [
        { range: '<5', text: 'Not high fall risk.' },
        { range: '>=5', text: 'High fall risk.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Hendrich AL, et al. Appl Nurs Res. 2003;16(1):9-21 (validated cutoff >=5).',
    },
    derivation: {
      formula: 'Hendrich II = sum of 8 weighted items per Hendrich 2003 Table 2. Range 0-16. High fall risk at >=5.\n  Confusion / disorientation / impulsivity: +4\n  Symptomatic depression: +2\n  Altered elimination: +1\n  Dizziness / vertigo: +1\n  Male sex: +1\n  Prescribed antiepileptic: +2\n  Prescribed benzodiazepine: +1\n  Get-up-and-go: 0 able, 1 pushes up to rise, 3 needs help, 4 unable',
      components: [
        { inputKey: 'confusion',     label: 'Confusion / disorientation / impulsivity',  points: 4 },
        { inputKey: 'depression',    label: 'Symptomatic depression',                     points: 2 },
        { inputKey: 'alteredElim',   label: 'Altered elimination',                        points: 1 },
        { inputKey: 'dizziness',     label: 'Dizziness / vertigo',                        points: 1 },
        { inputKey: 'male',          label: 'Male sex',                                   points: 1 },
        { inputKey: 'antiepileptic', label: 'Prescribed antiepileptic',                   points: 2 },
        { inputKey: 'benzodiazepine',label: 'Prescribed benzodiazepine',                  points: 1 },
        { inputKey: 'getUpAndGo',    label: 'Get-up-and-go (able=0 / pushes-up=1 / needs-help=3 / unable=4)',
          points: (v) => v === 'unable' ? 4 : v === 'needs-help' ? 3 : v === 'pushes-up' ? 1 : 0 },
      ],
      bands: [
        { range: { op: '<',  value: 5 }, label: 'not high fall risk' },
        { range: { op: '>=', value: 5 }, label: 'high fall risk' },
      ],
      population: 'Hendrich 2003: large concurrent case/control study in 355 falls and 780 matched controls across 8 medical-surgical units at a US tertiary hospital. Cutoff ≥5 is the validated high-risk threshold (sensitivity ~75%, specificity ~62%).',
      units: {
        confusion: 'boolean', depression: 'boolean', alteredElim: 'boolean',
        dizziness: 'boolean', male: 'boolean',
        antiepileptic: 'boolean', benzodiazepine: 'boolean',
        getUpAndGo: '"able" | "pushes-up" | "needs-help" | "unable"',
      },
      validity: 'Adult inpatients. Hendrich II is one of several fall-risk instruments (Morse, STRATIFY, Schmid — Morse Falls is a separate Sophie tile); each has different sensitivity/specificity trade-offs. Hendrich uniquely includes drug-class items (antiepileptics, benzodiazepines) that flag iatrogenic risk. The get-up-and-go test requires the patient to stand from a chair without assistance; bedfast patients are scored as "unable" (+4). Score guides preventive interventions, NOT a treatment plan.',
      source: 'Hendrich AL, Bender PS, Nyhuis A. "Validation of the Hendrich II Fall Risk Model: a large concurrent case/control study of hospitalized patients." Appl Nurs Res. 2003;16(1):9-21.',
    },
  },
  cam: {
    citation: 'Inouye SK, van Dyck CH, Alessi CA, Balkin S, Siegal AP, Horwitz RI. Clarifying confusion: the confusion assessment method. A new method for detection of delirium. Ann Intern Med. 1990;113(12):941-948.',
    specialties: ['nursing-floor', 'nursing-general', 'geriatrics', 'internal-medicine', 'emergency-medicine'],
    example: {
      fields: {},
      expected: 'CAM negative per Inouye 1990: features 1 + 2 and (3 or 4) not all met.',
    },
    interpretation: {
      bands: [
        { range: 'features 1 + 2 AND (3 OR 4)', text: 'CAM positive (delirium suggested).' },
        { range: 'otherwise', text: 'CAM negative.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Inouye SK, et al. Ann Intern Med. 1990;113(12):941-948.',
    },
    derivation: {
      formula: 'CAM is an ALGORITHM, not an additive score. Delirium is suggested when ALL of the following are present:\n  Feature 1 (Acute onset and fluctuating course) AND\n  Feature 2 (Inattention) AND\n  EITHER Feature 3 (Disorganized thinking) OR Feature 4 (Altered level of consciousness)\nBoolean form: (F1 AND F2) AND (F3 OR F4).',
      bands: [
        { range: [0, 0], label: 'CAM negative — features 1+2 and (3 or 4) NOT all present' },
        { range: [1, 1], label: 'CAM positive — features 1+2 AND (3 OR 4) present; delirium suggested' },
      ],
      population: 'Inouye 1990: derivation in 26 hospitalized patients aged ≥65; validation in 30 patients comparing CAM against psychiatrist-administered DSM-III-R delirium diagnosis. Subsequent validation in tens of thousands of patients across medical, surgical, ED, and post-acute settings.',
      units: {
        feature1: 'boolean (acute onset / fluctuating course)',
        feature2: 'boolean (inattention)',
        feature3: 'boolean (disorganized thinking)',
        feature4: 'boolean (altered level of consciousness)',
      },
      validity: 'Adult hospitalized patients aged ≥65 (also valid in younger adults). CAM is a SCREEN — a positive screen prompts clinical confirmation against DSM criteria. The Sophie derivation block ships formula-only (no `components` array) because the algorithm is a boolean expression `(F1 AND F2) AND (F3 OR F4)`, not an additive sum. The Sophie tile separately surfaces each feature and the algorithm evaluation. CAM-ICU (a separate Sophie tile) is the ICU adaptation for mechanically ventilated / unable-to-speak patients.',
      source: 'Inouye SK, van Dyck CH, Alessi CA, Balkin S, Siegal AP, Horwitz RI. "Clarifying confusion: the confusion assessment method. A new method for detection of delirium." Ann Intern Med. 1990;113(12):941-948.',
    },
  },

  'ich-score': {
    citation: 'Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC. The ICH score: a simple, reliable grading scale for intracerebral hemorrhage. Stroke. 2001;32(4):891-897.',
    specialties: ['nursing-icu', 'nursing-er', 'nursing-general', 'neurology', 'neurosurgery', 'critical-care', 'emergency-medicine'],
    example: {
      fields: { 'ich-gcs': '15', 'ich-age': '70', 'ich-vol': '10' },
      expected: 'ICH Score 0: 30-day mortality 0% per Hemphill 2001 Table 4.',
    },
    interpretation: {
      bands: [
        { range: '0', text: '30-day mortality 0% per Hemphill 2001 Table 4.' },
        { range: '1', text: '30-day mortality 13%.' },
        { range: '2', text: '30-day mortality 26%.' },
        { range: '3', text: '30-day mortality 72%.' },
        { range: '4', text: '30-day mortality 97%.' },
        { range: '5-6', text: '30-day mortality 100%.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Hemphill JC III, et al. Stroke. 2001;32(4):891-897 (GCS, age, ICH volume, infratentorial, intraventricular extension).',
    },
    derivation: {
      formula: 'ICH Score = sum across 5 features, range 0-6.\n  GCS 3-4    (+2) | 5-12 (+1) | 13-15 (0)\n  Age >= 80  (+1)\n  ICH volume >= 30 mL (+1)\n  Infratentorial origin (+1)\n  Intraventricular hemorrhage (+1)\n30-day mortality per Hemphill 2001 Table 4: 0 -> 0%, 1 -> 13%, 2 -> 26%, 3 -> 72%, 4 -> 97%, 5-6 -> 100%.',
      components: [
        { inputKey: 'gcs',            label: 'GCS band (3-4 +2 / 5-12 +1 / 13-15 0)', points: (v) => { const n = Number(v); if (n >= 3 && n <= 4) return 2; if (n >= 5 && n <= 12) return 1; return 0; } },
        { inputKey: 'age',            label: 'Age >= 80 (+1)',                         points: (v) => (Number(v) >= 80 ? 1 : 0) },
        { inputKey: 'ichVolumeMl',    label: 'ICH volume >= 30 mL (+1)',               points: (v) => (Number(v) >= 30 ? 1 : 0) },
        { inputKey: 'infratentorial', label: 'Infratentorial origin (+1)',             points: 1 },
        { inputKey: 'ivh',            label: 'Intraventricular hemorrhage (+1)',       points: 1 },
      ],
      bands: [
        { range: [0, 0], label: '30-day mortality 0% per Hemphill 2001 Table 4' },
        { range: [1, 1], label: '30-day mortality 13%' },
        { range: [2, 2], label: '30-day mortality 26%' },
        { range: [3, 3], label: '30-day mortality 72%' },
        { range: [4, 4], label: '30-day mortality 97%' },
        { range: [5, 6], label: '30-day mortality 100%' },
      ],
      population: 'Hemphill 2001: retrospective derivation in 152 consecutive patients with spontaneous (non-traumatic) intracerebral hemorrhage presenting to a single academic medical center; mortality assessed at 30 days. Each component was an independent predictor of mortality in multivariable analysis; integer points were assigned to mirror the regression coefficients.',
      units: {
        gcs: 'integer 3-15 (Glasgow Coma Scale at presentation)',
        age: 'years',
        ichVolumeMl: 'mL (hemorrhage volume estimated by ABC/2 method on initial CT)',
        infratentorial: 'boolean (hemorrhage origin in brainstem or cerebellum)',
        ivh: 'boolean (any intraventricular extension on initial CT)',
      },
      validity: 'Adult patients with spontaneous (non-traumatic) intracerebral hemorrhage; intended for prognostication at presentation, not for treatment decisions. The ICH score predicts 30-day mortality and is not a self-fulfilling prophecy when used as part of comprehensive care; AHA/ASA guidance cautions against early withdrawal-of-care decisions based on the score alone. Not validated for subarachnoid hemorrhage, intraventricular hemorrhage without parenchymal involvement, traumatic ICH, or pediatric stroke.',
      source: 'Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC. "The ICH score: a simple, reliable grading scale for intracerebral hemorrhage." Stroke. 2001;32(4):891-897.',
    },
  },
  'hunt-hess-wfns': {
    citation: 'Hunt WE, Hess RM. Surgical risk as related to time of intervention in the repair of intracranial aneurysms. J Neurosurg. 1968;28(1):14-20. Drake CG. Report of World Federation of Neurological Surgeons committee on a universal subarachnoid hemorrhage grading scale. J Neurosurg. 1988;68(6):985-986.',
    specialties: ['nursing-icu', 'nursing-er', 'nursing-general', 'neurology', 'neurosurgery', 'critical-care'],
    example: {
      fields: { 'hh-grade': '1', 'hh-gcs': '15' },
      expected: 'Hunt-Hess 1 / WFNS 1 per Hunt 1968 + Drake 1988.',
    },
    interpretation: {
      bands: [
        { range: 'WFNS 1', text: 'GCS 15, no motor deficit per Drake 1988.' },
        { range: 'WFNS 2', text: 'GCS 13-14, no motor deficit.' },
        { range: 'WFNS 3', text: 'GCS 13-14, with motor deficit.' },
        { range: 'WFNS 4', text: 'GCS 7-12, with or without motor deficit.' },
        { range: 'WFNS 5', text: 'GCS 3-6, with or without motor deficit.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Drake CG. J Neurosurg. 1988;68(6):985-986. Hunt grade is the bedside picker; WFNS is computed from GCS and motor deficit.',
    },
  },

  mnihss: {
    citation: 'Meyer BC, Hemmen TM, Jackson CM, Lyden PD. Modified National Institutes of Health Stroke Scale for use in stroke clinical trials: prospective reliability and validity. Stroke. 2002;33(5):1261-1266.',
    specialties: ['nursing-icu', 'nursing-er', 'nursing-general', 'neurology', 'emergency-medicine'],
    example: {
      fields: {},
      expected: 'mNIHSS 0 of 31: no stroke symptoms per Meyer 2002.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'No stroke symptoms.' },
        { range: '1-4', text: 'Minor stroke.' },
        { range: '5-15', text: 'Moderate stroke.' },
        { range: '16-20', text: 'Moderate-severe stroke.' },
        { range: '>=21', text: 'Severe stroke.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Meyer BC, et al. Stroke. 2002;33(5):1261-1266 (11-item mNIHSS; total 0-31).',
    },
  },
  'aldrete-padss': {
    citation: 'Aldrete JA. The post-anesthesia recovery score revisited. J Clin Anesth. 1995;7(1):89-91. Chung F, Chan VW, Ong D. A post-anesthetic discharge scoring system for home readiness after ambulatory surgery. J Clin Anesth. 1995;7(6):500-506.',
    specialties: ['nursing-or', 'nursing-floor', 'nursing-general', 'anesthesiology'],
    example: {
      fields: {},
      expected: 'Aldrete 10 / PADSS 10 (both at maxima).',
    },
    interpretation: {
      bands: [
        { range: 'Aldrete >=9', text: 'PACU to floor discharge per Aldrete 1995.' },
        { range: 'PADSS >=9', text: 'Home discharge per Chung 1995.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Aldrete JA. J Clin Anesth. 1995;7(1):89-91. Chung F, et al. J Clin Anesth. 1995;7(6):500-506.',
    },
    derivation: {
      formula: 'modified Aldrete = sum across 5 PACU criteria each 0-2 (clamped), range 0-10. Cutoff per Aldrete 1995: >=9 ready for PACU-to-floor discharge.\n  Activity (moves all extremities voluntarily / on command 2 | two extremities 1 | unable 0)\n  Respiration (deep breath and cough freely 2 | dyspnea or limited breathing 1 | apneic 0)\n  Circulation (BP +/-20 mmHg of pre-anesthetic 2 | +/-20-50 1 | >+/-50 0)\n  Consciousness (fully awake 2 | arousable on calling 1 | not responding 0)\n  Oxygen saturation (>92% on room air 2 | needs O2 to maintain >90% 1 | <90% with O2 0)',
      components: [
        { inputKey: 'activity',         label: 'Activity (0-2)',         points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'respiration',      label: 'Respiration (0-2)',      points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'circulation',      label: 'Circulation (0-2)',      points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'consciousness',    label: 'Consciousness (0-2)',    points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'oxygenSaturation', label: 'Oxygen saturation (0-2)', points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: [0, 8],                 label: 'not yet ready for PACU-to-floor discharge per Aldrete 1995 (cutoff >=9)' },
        { range: { op: '>=', value: 9 }, label: 'ready for PACU-to-floor discharge per Aldrete 1995' },
      ],
      population: 'Aldrete 1995: methodologic revision of the original 1970 Aldrete recovery score (Aldrete JA, Kroulik D. Anesth Analg. 1970;49(6):924-934) replacing the color-based oxygenation item with pulse oximetry; deployed in PACU populations across multiple academic institutions. The cutoff >=9 reflects the operational PACU-discharge convention rather than a separately-derived statistical threshold.',
      units: {
        activity: 'integer 0-2 (clamped)',
        respiration: 'integer 0-2 (clamped)',
        circulation: 'integer 0-2 (clamped)',
        consciousness: 'integer 0-2 (clamped)',
        oxygenSaturation: 'integer 0-2 (clamped)',
      },
      validity: 'Adult and pediatric post-anesthesia care unit patients. The score is an operational discharge-readiness checklist, not a validated outcomes score; >=9 is the convention for safe transfer to a step-down floor, not for home discharge (use PADSS for home discharge). Pulse-oximetry item assumes a calibrated reading without dyshemoglobinemia. Not validated for ICU patients, for procedural sedation outside an OR / PACU context, or for regional-anesthesia-only patients where motor block confounds the activity item.',
      source: 'Aldrete JA. "The post-anesthesia recovery score revisited." J Clin Anesth. 1995;7(1):89-91.',
    },
    derivationPadss: {
      formula: 'PADSS (post-anesthetic discharge scoring system) = sum across 5 ambulatory-surgery readiness criteria each 0-2 (clamped), range 0-10. Cutoff per Chung 1995: >=9 ready for home discharge.\n  Vital signs (within 20% of preop 2 | within 40% 1 | >40% 0)\n  Ambulation (steady gait, no dizziness 2 | with assistance 1 | unable 0)\n  Nausea/vomiting (minimal 2 | moderate, treated 1 | severe, persistent 0)\n  Pain (acceptable to patient and controlled by oral analgesics 2 | moderate 1 | severe 0)\n  Surgical bleeding (minimal, not requiring dressing change 2 | moderate 1 | severe 0)',
      components: [
        { inputKey: 'vitalSigns',       label: 'Vital signs (0-2)',       points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'ambulation',       label: 'Ambulation (0-2)',        points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'nauseaVomiting',   label: 'Nausea / vomiting (0-2)', points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'pain',             label: 'Pain (0-2)',              points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'surgicalBleeding', label: 'Surgical bleeding (0-2)', points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: [0, 8],                 label: 'not yet ready for home discharge per Chung 1995 (cutoff >=9)' },
        { range: { op: '>=', value: 9 }, label: 'ready for home discharge per Chung 1995' },
      ],
      population: 'Chung 1995: prospective evaluation in 502 consecutive adult ambulatory-surgery patients at a Toronto tertiary center; outcomes included delayed discharge, unplanned admission, and post-discharge complications. The modified PADSS (1999, Chung) replaced the original "intake/output" item with the contemporary 5-item structure used here.',
      units: {
        vitalSigns: 'integer 0-2 (clamped)',
        ambulation: 'integer 0-2 (clamped)',
        nauseaVomiting: 'integer 0-2 (clamped)',
        pain: 'integer 0-2 (clamped)',
        surgicalBleeding: 'integer 0-2 (clamped)',
      },
      validity: 'Adult ambulatory-surgery patients meeting discharge criteria from the day-surgery unit. PADSS is operational, not a clinical-outcomes-validated risk score; >=9 is the convention for home discharge. Pediatric ambulatory cohorts often use modified PADSS variants. Not validated for inpatient post-anesthesia transitions (use Aldrete for floor discharge), for procedural-sedation home discharge from non-surgical units, or for spinal-anesthesia patients in whom residual motor block prolongs the ambulation item independently of recovery.',
      source: 'Chung F, Chan VW, Ong D. "A post-anesthetic discharge scoring system for home readiness after ambulatory surgery." J Clin Anesth. 1995;7(6):500-506.',
    },
  },

  'npiap-staging': {
    citation: 'Edsberg LE, Black JM, Goldberg M, McNichol L, Moore L, Sieggreen M. Revised National Pressure Ulcer Advisory Panel Pressure Injury Staging System. J Wound Ostomy Continence Nurs. 2016;43(6):585-597. Adopted by NPIAP (formerly NPUAP) 2019.',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'wound-care'],
    example: {
      fields: { 'np-blanch': 'blanchable', 'np-depth': 'partial-thickness' },
      expected: 'Blanchable erythema does not meet NPIAP 2016 criteria for a pressure injury.',
    },
    interpretation: {
      bands: [
        { range: 'Mucosal', text: 'Mucosal Membrane Pressure Injury (staging system does not apply).' },
        { range: 'Stage 1', text: 'Intact skin with non-blanchable erythema.' },
        { range: 'Stage 2', text: 'Partial-thickness skin loss with exposed dermis.' },
        { range: 'Stage 3', text: 'Full-thickness skin loss; subcutaneous fat visible.' },
        { range: 'Stage 4', text: 'Full-thickness skin and tissue loss; exposed bone, tendon, or muscle.' },
        { range: 'Unstageable', text: 'Full-thickness loss obscured by slough or eschar.' },
        { range: 'DTPI', text: 'Persistent non-blanchable deep red, maroon, or purple discoloration.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Edsberg LE, et al. J Wound Ostomy Continence Nurs. 2016;43(6):585-597.',
    },
  },
  'norton-push': {
    citation: 'Norton D, McLaren R, Exton-Smith AN. An Investigation of Geriatric Nursing Problems in Hospital. Churchill Livingstone, 1962. PUSH Tool 3.0: NPIAP/NPUAP 2005 (Ratliff CR, Rodeheaver GT).',
    specialties: ['nursing-floor', 'nursing-general', 'wound-care'],
    example: {
      fields: { 'nr-pc': '4', 'nr-mc': '4', 'nr-act': '4', 'nr-mob': '4', 'nr-inc': '4', 'pu-lw': '0', 'pu-ex': '0', 'pu-tt': '0' },
      expected: 'Norton 20 of 20 (low risk; <=14 at risk per Norton 1962); PUSH 0 of 17 per NPIAP 2005.',
    },
    interpretation: {
      bands: [
        { range: 'Norton >=19', text: 'Low pressure-injury risk.' },
        { range: 'Norton 15-18', text: 'Medium risk.' },
        { range: 'Norton <=14', text: 'At risk per Norton 1962.' },
        { range: 'PUSH 0-17', text: 'Lower total = better healing per NPIAP 2005; trend over time is the metric.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Norton D, et al. 1962. PUSH 3.0: NPIAP/NPUAP 2005.',
    },
  },
  'vip-extravasation': {
    citation: 'Jackson A. Infection control - a battle in vein: infusion phlebitis. Nurs Times. 1998;94(4):68-71. Infusion Nurses Society (INS) 2021 Standards of Practice sec 38 (infiltration / extravasation grading 0-4).',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'nursing-or'],
    example: {
      fields: { 've-vip': '0', 've-ins': '0' },
      expected: 'VIP 0 of 5; INS infiltration / extravasation grade 0 of 4.',
    },
    interpretation: {
      bands: [
        { range: 'VIP >=3', text: 'Remove cannula and resite per Jackson 1998 / INS 2021.' },
        { range: 'INS >=3', text: 'Stop infusion, remove cannula immediately, photograph, escalate per INS 2021 sec 38.' },
        { range: 'Grade 4 vesicant', text: 'Antidote decision per INS 2021 Table 38-3.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Jackson A. Nurs Times. 1998;94(4):68-71. INS 2021 Standards sec 38.',
    },
  },
  'blood-compat': {
    citation: 'American Association of Blood Banks (AABB) / Association for the Advancement of Blood & Biotherapies. Standards for Blood Banks and Transfusion Services. 33rd ed., 2024. AABB Technical Manual, 20th ed., 2020.',
    specialties: ['nursing-icu', 'nursing-er', 'nursing-or', 'nursing-floor', 'nursing-general', 'pathology', 'hematology'],
    example: {
      fields: { 'bc-recip': 'O-', 'bc-prod': 'prbc' },
      expected: 'PRBC compatibility for O- per AABB 33rd ed: O-. Emergency release: O-negative.',
    },
    interpretation: {
      bands: [
        { range: 'PRBC', text: 'ABO and Rh both matter; O- is the universal emergency-release donor.' },
        { range: 'FFP / plasma', text: 'ABO only (Rh is not a plasma compatibility factor); AB plasma is the universal emergency-release donor.' },
        { range: 'Platelets', text: 'ABO-identical preferred; ABO-compatible plasma acceptable; Rh matching for Rh-negative women of CBP.' },
        { range: 'Cryoprecipitate', text: 'Any ABO acceptable (small residual plasma volume).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'AABB 33rd ed. (2024); AABB Technical Manual 20th ed. (2020).',
    },
  },

  // ---- spec-v29 wave 29-3c: bedside math ----
  'insulin-correction': {
    citation: 'American Diabetes Association. Standards of Care in Diabetes - 2024: 16. Diabetes Care in the Hospital. Diabetes Care. 2024;47(Suppl 1):S295-S306. Uses ADA-endorsed insulin-sensitivity-factor formulas (1800-rule for rapid-acting analogues; 1500-rule for regular insulin).',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'endocrinology'],
    example: {
      fields: { 'ic-bg': '250', 'ic-target': '150', 'ic-tdd': '50', 'ic-rule': 'rapid', 'ic-carbs': '60', 'ic-icr': '10' },
      expected: 'Correction ~2.8 U + meal 6 U = ~8.8 U total (ISF 36 from 1800/TDD per ADA 2024).',
    },
    interpretation: {
      bands: [
        { range: 'non-critical inpatient', text: 'ADA 2024 hospital glycemic target 140-180 mg/dL.' },
        { range: 'ICU', text: 'ADA 2024 hospital glycemic target 110-180 mg/dL.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'ADA Standards of Care 2024, ch. 16 (Diabetes Care in the Hospital).',
    },
  },
  'electrolyte-replacement': {
    citation: 'Hammond DA, et al. Potassium replacement in critically ill patients. JAMA Netw Open. 2019;2(8):e198587. Hebert PC, et al. Acute hypomagnesaemia. Acute Care Internal Medicine, Lippincott 2008. Brown KA, et al. Graduated phosphorus replacement. JPEN. 2006;30(3):209-214 (Brown protocol).',
    specialties: ['nursing-icu', 'nursing-floor', 'nursing-general', 'critical-care', 'pharmacy'],
    example: {
      fields: { 'er-e': 'k', 'er-l': '2.8', 'er-r': 'iv' },
      expected: 'K 2.8 mEq/L: 60 mEq IV per ASHP 2019; cap 10 mEq/h peripheral or 20 mEq/h central.',
    },
    interpretation: {
      bands: [
        { range: 'K 3.0-3.4', text: 'Replace 40 mEq.' },
        { range: 'K 2.5-2.9', text: 'Replace 60 mEq.' },
        { range: 'K <2.5', text: 'Replace 80 mEq.' },
        { range: 'Mg 1.0-1.7', text: 'Replace 2 g MgSO4 IV over 1 h.' },
        { range: 'Mg <1.0', text: 'Replace 4 g MgSO4 IV over 1 h.' },
        { range: 'Phos 1.6-2.2', text: '0.16 mmol/kg per Brown 2006.' },
        { range: 'Phos 1.0-1.5', text: '0.32 mmol/kg per Brown 2006.' },
        { range: 'Phos <1.0', text: '0.64 mmol/kg per Brown 2006.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Hammond DA, et al. JAMA Netw Open. 2019;2(8):e198587. Brown KA, et al. JPEN. 2006;30(3):209-214.',
    },
  },
  'crrt-dose': {
    citation: 'KDIGO AKI Work Group. KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138 (sec 5.8 effluent 20-25 mL/kg/h). Davenport A, Tolwani A. Citrate anticoagulation for CRRT in AKI. NDT Plus. 2009;2(6):439-447 (citrate-Ca targets).',
    specialties: ['nursing-icu', 'critical-care', 'nephrology'],
    example: {
      fields: { 'cr-w': '80', 'cr-r': '1800', 'cr-mod': 'CVVHDF' },
      expected: 'Delivered effluent dose 22.5 mL/kg/h within KDIGO 2012 target 20-25 mL/kg/h.',
    },
    interpretation: {
      bands: [
        { range: 'Effluent dose <20 mL/kg/h', text: 'Below KDIGO 2012 target.' },
        { range: 'Effluent dose 20-25 mL/kg/h', text: 'Within KDIGO 2012 target.' },
        { range: 'Effluent dose >25 mL/kg/h', text: 'Above KDIGO 2012 target.' },
        { range: 'Total/ionised Ca >=2.5', text: 'Citrate accumulation suspected per Davenport 2009.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'KDIGO AKI 2012; Davenport A, Tolwani A. NDT Plus. 2009;2(6):439-447.',
    },
  },
  'ecmo-titration': {
    citation: 'Extracorporeal Life Support Organization (ELSO). ELSO Adult and Paediatric Respiratory Failure Guidelines, Version 1.5, 2022. Encodes the linear PaCO2-sweep heuristic and the DO2i target >=6 mL/kg/min for VV ECMO.',
    specialties: ['nursing-icu', 'critical-care', 'perfusion', 'cardiac-surgery'],
    example: {
      fields: { 'ec-mod': 'VV', 'ec-w': '70', 'ec-sw': '4', 'ec-fl': '4', 'ec-pco': '50', 'ec-tgt': '40', 'ec-hb': '10', 'ec-sat': '90' },
      expected: 'Suggested sweep 5 L/min; DO2i ~6.9 mL/kg/min (ELSO 2022 target >= 6).',
    },
    interpretation: {
      bands: [
        { range: 'DO2i < 6 mL/kg/min', text: 'Below ELSO 2022 target; increase pump flow.' },
        { range: 'VV SatO2 >= 80%', text: 'Acceptable VV target per ELSO 2022; do not titrate to perfect SatO2.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'ELSO Adult and Paediatric Respiratory Failure Guidelines, v1.5, 2022.',
    },
  },

  // ---- spec-v29 wave 29-3d: timer / workflow tiles ----
  'ews-escalation': {
    citation: 'Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. RCP, London 2017 (NEWS2 trigger / response table).',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'internal-medicine'],
    example: {
      fields: { 'ews-total': '5', 'ews-ts': '2026-05-19T14:00' },
      expected: 'Aggregate 5: urgent response; min 1-hourly; next due 2026-05-19T15:00 per RCP NEWS2 2017.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Min 12-hourly observations.' },
        { range: '1-4', text: 'Min 4-6 hourly; ward-based response.' },
        { range: 'single 3', text: 'Min 1-hourly + urgent ward-team review.' },
        { range: '5-6', text: 'Urgent response; min 1-hourly; consider critical-care outreach.' },
        { range: '>=7', text: 'Emergency critical-care team activation; continuous monitoring.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'RCP NEWS2 2017 trigger table.',
    },
  },
  'restraint-timer': {
    citation: 'Centers for Medicare & Medicaid Services. Hospital Conditions of Participation: Patients\' Rights - Use of Restraint or Seclusion. 42 CFR sec 482.13(e); CoP Interpretive Guidelines (Appendix A, Tag A-0178 through A-0214).',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'psychiatry', 'quality-safety'],
    example: {
      fields: { 'rt-type': 'violent', 'rt-age': '40', 'rt-ts': '2026-05-19T12:00' },
      expected: 'Violent adult: renewal q4h; nursing q15 min; physician face-to-face within 1 h per 42 CFR sec 482.13(e).',
    },
    interpretation: {
      bands: [
        { range: 'Violent age >=18', text: 'Order renewed q4h.' },
        { range: 'Violent age 9-17', text: 'Order renewed q2h.' },
        { range: 'Violent age <9', text: 'Order renewed q1h.' },
        { range: 'Non-violent', text: 'Order renewed each calendar day.' },
      ],
      sourceQuoted: true,
      sourceCitation: '42 CFR sec 482.13(e); CMS CoP Tag A-0178 et seq.',
    },
  },
  'sepsis-bundle-clock': {
    citation: 'Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Intensive Care Med. 2021;47(11):1181-1247. CMS SEP-1 measure 2024. Nguyen HB, et al. Early lactate clearance. Crit Care Med. 2004;32(8):1637-1642.',
    specialties: ['nursing-er', 'nursing-icu', 'nursing-floor', 'nursing-general', 'critical-care', 'emergency-medicine', 'infectious-disease'],
    example: {
      fields: { 'sb-t0': '2026-05-19T12:00', 'sb-lac1': '4', 'sb-lact1': '2026-05-19T12:30', 'sb-cult': '2026-05-19T12:30', 'sb-abx': '2026-05-19T12:45', 'sb-fluid': '2026-05-19T12:45' },
      expected: 'All hour-1 elements on-time per SSC 2021; repeat lactate pending at 6 h.',
    },
    interpretation: {
      bands: [
        { range: 'Hour-1 elements', text: 'Lactate, cultures, antibiotics, fluids within 60 min of T0.' },
        { range: 'Repeat lactate', text: 'Within 6 h if initial lactate >=2 (Nguyen 2004 clearance).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'SSC 2021 (Evans 2021); CMS SEP-1 2024.',
    },
  },
  'code-blue-clock': {
    citation: 'American Heart Association. 2020 Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care: Adult Basic and Advanced Life Support. Circulation. 2020;142(16_suppl_2):S366-S468.',
    specialties: ['nursing-icu', 'nursing-er', 'nursing-floor', 'nursing-general', 'critical-care', 'emergency-medicine'],
    example: {
      fields: { 'cb-start': '2026-05-19T12:00', 'cb-rhy': '2026-05-19T12:06', 'cb-epi': '2026-05-19T12:04', 'cb-shock': '200', 'cb-cyc': '3' },
      expected: 'Next rhythm check 12:08; next epi 12:08; last shock 200 J; AHA 2020 ETCO2 ROSC target >10 mmHg.',
    },
    interpretation: {
      bands: [
        { range: 'Rhythm checks', text: 'q2 min per AHA 2020.' },
        { range: 'Epinephrine 1 mg', text: 'q3-5 min per AHA 2020.' },
        { range: 'ETCO2 ROSC', text: 'Sustained >10 mmHg (ideally >20) per AHA 2020.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'AHA 2020 Adult BLS / ACLS Guidelines.',
    },
  },
  'mtp-tracker': {
    citation: 'Holcomb JB, Tilley BC, Baraniuk S, et al. Transfusion of plasma, platelets, and red blood cells in a 1:1:1 vs 1:1:2 ratio (PROPPR). JAMA. 2015;313(5):471-482. ATLS 10th ed (2018) for cryoprecipitate dosing.',
    specialties: ['nursing-er', 'nursing-icu', 'nursing-or', 'nursing-general', 'trauma-surgery', 'critical-care', 'anesthesiology'],
    example: {
      fields: { 'mtp-prbc': '6', 'mtp-ffp': '4', 'mtp-plt': '1', 'mtp-cryo': '0' },
      expected: 'Ratio 6:4:1 below PROPPR 1:1:1 target; next product FFP; 1 cryo dose due per ATLS 2018.',
    },
    interpretation: {
      bands: [
        { range: 'PROPPR target', text: 'PRBC : FFP : Platelets = 1:1:1.' },
        { range: 'Cryo cadence', text: '1 pooled dose every 6 PRBC per ATLS 2018.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Holcomb JB, et al. PROPPR. JAMA. 2015;313(5):471-482.',
    },
  },
  'device-day-counter': {
    citation: 'CDC 2024 NHSN Patient Safety Component Manual (Ch 7 CAUTI, Ch 4 CLABSI). Lo E, Nicolle LE, Coffin SE, et al. SHEA CAUTI prevention 2014 update. Infect Control Hosp Epidemiol. 2014;35(5):464-479.',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'infectious-disease', 'quality-safety'],
    example: {
      fields: { 'dd-dev': 'foley', 'dd-ins': '2026-05-15T08:00' },
      expected: 'Device-day count from insertion; no CDC SHEA indication checked: remove Foley today.',
    },
    interpretation: {
      bands: [
        { range: 'No indication checked', text: 'Remove device today per CDC SHEA 2014.' },
        { range: 'Indication present', text: 'Re-verify daily; document the indication.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'CDC NHSN 2024; SHEA CAUTI 2014.',
    },
  },
  'bristol-girth': {
    citation: 'Lewis SJ, Heaton KW. Stool form scale as a useful guide to intestinal transit time. Scand J Gastroenterol. 1997;32(9):920-924. ANA Standards of Gastroenterology Nursing Practice 2013. SCCM 2013 abdominal compartment syndrome consensus.',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'gastroenterology'],
    example: {
      fields: { 'bg-b': '4' },
      expected: 'Bristol 4: smooth soft sausage (normal-ideal) per Lewis 1997.',
    },
    interpretation: {
      bands: [
        { range: 'Bristol 1-2', text: 'Constipation.' },
        { range: 'Bristol 3-4', text: 'Normal.' },
        { range: 'Bristol 5', text: 'Soft (lacking fibre).' },
        { range: 'Bristol 6-7', text: 'Diarrhoea.' },
        { range: 'Girth >=2 cm/h', text: 'ACS concern per SCCM 2013.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Lewis SJ, Heaton KW. Scand J Gastroenterol. 1997;32(9):920-924.',
    },
  },

  // ---- spec-v29 wave 29-3e: vent bundle (closes wave 29-3) ----
  'vent-sbt-peep': {
    citation: 'Boles JM, Bion J, Connors A, et al. Weaning from mechanical ventilation. Eur Respir J. 2007;29(5):1033-1056. ARDS Network. Ventilation with lower tidal volumes vs traditional tidal volumes for acute lung injury and ARDS. N Engl J Med. 2000;342(18):1301-1308 (PEEP / FiO2 table).',
    specialties: ['nursing-icu', 'critical-care', 'pulmonology', 'respiratory-therapy'],
    example: {
      fields: { 'vs-pf': '200', 'vs-peep': '6', 'vs-fio2': '0.4', 'vs-awake': 'on', 'vs-arm': 'low', 'vs-lf': '0.5' },
      expected: 'All 5 Boles 2007 readiness criteria met; ARDSnet low-PEEP at FiO2 0.5 -> PEEP 8-10.',
    },
    interpretation: {
      bands: [
        { range: 'SBT ready', text: 'All five Boles 2007 criteria met; proceed with SBT per institutional protocol.' },
        { range: 'SBT not ready', text: 'One or more Boles 2007 criteria failed.' },
        { range: 'ARDSnet low-PEEP', text: 'Brower 2000 PEEP/FiO2 table.' },
        { range: 'ARDSnet high-PEEP', text: 'ALVEOLI 2004 high-PEEP arm.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Boles JM, et al. Eur Respir J. 2007;29(5):1033-1056. ARDS Network. NEJM. 2000;342(18):1301-1308.',
    },
  },

  // ---- spec-v30 §2: thermal-emergency decision tiles ----
  'hypothermia-rewarm': {
    citation: 'Durrer B, Brugger H, Syme D. ICAR-MEDCOM hypothermia staging. High Alt Med Biol. 2003;4(1):99-103. Lott C, et al. ERC 2021 Guidelines: cardiac arrest in special circumstances. Resuscitation. 2021;161:152-219 (§4 hypothermia, including K+ > 12 ECPR cut-off).',
    specialties: ['emergency-medicine', 'ems', 'wilderness-medicine', 'critical-care', 'nursing-er', 'nursing-icu', 'nursing-general'],
    example: {
      fields: { 'hyp-t': '30', 'hyp-s': 'impaired' },
      expected: 'HT II at 30 C per Durrer 2003: active external + minimally invasive (forced-air warming + warm IV).',
    },
    interpretation: {
      bands: [
        { range: 'HT I', text: 'Alert and shivering. Passive external rewarming.' },
        { range: 'HT II', text: 'Impaired consciousness, breathing. Active external + minimally invasive; avoid jostling.' },
        { range: 'HT III', text: 'Unconscious, vital signs present. Active internal; consider ECMO / CPB if unstable.' },
        { range: 'HT IV', text: 'Cardiac arrest. ECPR is first-line per ERC 2021 §4.7 unless K+ > 12 or lethal-injury / chest-non-compressible flag.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Durrer B, et al. High Alt Med Biol. 2003;4(1):99-103. Lott C, et al. Resuscitation. 2021;161:152-219.',
    },
  },
  'heatstroke-decision': {
    citation: 'Bouchama A, Knochel JP. Heat stroke. N Engl J Med. 2002;346(25):1978-1988. Lipman GS, et al. WMS Heat Illness Practice Guideline 2019 Update. Wilderness Environ Med. 2019;30(4S):S33-S46 (CWI to 38.9 C; cool-first-transport-second).',
    specialties: ['emergency-medicine', 'ems', 'sports-medicine', 'wilderness-medicine', 'nursing-er', 'nursing-general'],
    example: {
      fields: { 'hs-t': '41.2', 'hs-cns': 'mild-confusion', 'hs-sw': '1', 'hs-set': 'field' },
      expected: 'heat stroke (exertional) at 41.2 C per Bouchama 2002: CWI to 38.9 C, cool-first-transport-second per WMS 2019.',
    },
    interpretation: {
      bands: [
        { range: 'heat exhaustion', text: 'Core <=40 C and no CNS dysfunction. Rest, rehydrate, passive cooling.' },
        { range: 'heat stroke (exertional)', text: 'Sweating preserved. Cold-water immersion to 38.9 C, cool-first-transport-second (WMS 2019).' },
        { range: 'heat stroke (classic)', text: 'Anhidrotic. CWI preferred; evaporative + ice packs acceptable.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Bouchama A, Knochel JP. N Engl J Med. 2002;346(25):1978-1988. Lipman GS, et al. Wilderness Environ Med. 2019;30(4S):S33-S46.',
    },
  },

  // ---- spec-v32 §2: non-verbal pain scales ----
  flacc: {
    citation: 'Merkel SI, Voepel-Lewis T, Shayevitz JR, Malviya S. The FLACC: a behavioral scale for scoring postoperative pain in young children. Pediatr Nurs. 1997;23(3):293-297.',
    specialties: ['nursing-floor', 'nursing-peds', 'nursing-nicu', 'nursing-general', 'pediatrics', 'anesthesiology'],
    example: {
      fields: { 'fl-face': '0', 'fl-legs': '0', 'fl-act': '0', 'fl-cry': '0', 'fl-cons': '0' },
      expected: 'FLACC 0: relaxed per Merkel 1997.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'Relaxed / comfortable.' },
        { range: '1-3', text: 'Mild discomfort.' },
        { range: '4-6', text: 'Moderate pain.' },
        { range: '7-10', text: 'Severe pain or severe discomfort.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Merkel SI, et al. Pediatr Nurs. 1997;23(3):293-297 (five items each 0-2; total 0-10).',
    },
    derivation: {
      formula: 'FLACC = sum of 5 nurse-observed behaviors (each 0-2), range 0-10.\n  Face: 0 no expression / 1 occasional grimace or frown / 2 frequent or constant frown, clenched jaw\n  Legs: 0 normal or relaxed / 1 uneasy, restless, tense / 2 kicking, legs drawn up\n  Activity: 0 lying quietly / 1 squirming, shifting / 2 arched, rigid, or jerking\n  Cry: 0 no cry awake or asleep / 1 moans or whimpers, occasional complaint / 2 steady cry, screams or sobs\n  Consolability: 0 content, relaxed / 1 reassured by occasional touching, hugging, or talking; distractible / 2 difficult to console or comfort',
      components: [
        { inputKey: 'face',          label: 'Face (0-2)',           points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'legs',          label: 'Legs (0-2)',            points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'activity',      label: 'Activity (0-2)',        points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'cry',           label: 'Cry (0-2)',             points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'consolability', label: 'Consolability (0-2)',   points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: [0, 0],   label: 'relaxed / comfortable' },
        { range: [1, 3],   label: 'mild discomfort' },
        { range: [4, 6],   label: 'moderate pain' },
        { range: [7, 10],  label: 'severe pain or severe discomfort' },
      ],
      population: 'Merkel 1997: derivation in 89 children aged 2 months to 7 years undergoing postoperative pain assessment at the University of Michigan. Reference standards: patient self-report when possible and clinician observation.',
      units: {
        face: 'integer 0-2', legs: 'integer 0-2', activity: 'integer 0-2',
        cry: 'integer 0-2', consolability: 'integer 0-2',
      },
      validity: 'Infants and young children (~2 months to 7 years) who cannot self-report pain reliably. For verbal children old enough to use the Wong-Baker faces or numeric rating scale, those are the preferred tools. Validated extensively in postoperative, procedural, and ICU settings. The companion PAINAD (Warden 2003) is a separate Sophie tile for nonverbal adults with advanced dementia and uses the identical band structure.',
      source: 'Merkel SI, Voepel-Lewis T, Shayevitz JR, Malviya S. "The FLACC: a behavioral scale for scoring postoperative pain in young children." Pediatr Nurs. 1997;23(3):293-297.',
    },
  },
  painad: {
    citation: 'Warden V, Hurley AC, Volicer L. Development and psychometric evaluation of the Pain Assessment in Advanced Dementia (PAINAD) scale. J Am Med Dir Assoc. 2003;4(1):9-15.',
    specialties: ['nursing-floor', 'nursing-general', 'geriatrics', 'palliative-care', 'internal-medicine', 'family-medicine'],
    example: {
      fields: { 'pa-br': '0', 'pa-vo': '0', 'pa-fa': '0', 'pa-bl': '0', 'pa-cons': '0' },
      expected: 'PAINAD 0: no pain per Warden 2003.',
    },
    interpretation: {
      bands: [
        { range: '0', text: 'No pain.' },
        { range: '1-3', text: 'Mild pain / discomfort.' },
        { range: '4-6', text: 'Moderate pain.' },
        { range: '7-10', text: 'Severe pain.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Warden V, Hurley AC, Volicer L. J Am Med Dir Assoc. 2003;4(1):9-15 (five items each 0-2; total 0-10).',
    },
    derivation: {
      formula: 'PAINAD = sum of 5 nurse-observed behaviors (each 0-2), range 0-10.\n  Breathing (independent of vocalization): 0 normal / 1 occasional labored breathing or short period of hyperventilation / 2 noisy labored breathing, long period of hyperventilation, Cheyne-Stokes respirations\n  Negative vocalization: 0 none / 1 occasional moan or groan, low-level speech with a negative or disapproving quality / 2 repeated troubled calling out, loud moaning or groaning, crying\n  Facial expression: 0 smiling or inexpressive / 1 sad, frightened, frowning / 2 facial grimacing\n  Body language: 0 relaxed / 1 tense, distressed pacing, fidgeting / 2 rigid, fists clenched, knees pulled up, pulling or pushing away, striking out\n  Consolability: 0 no need to console / 1 distracted or reassured by voice or touch / 2 unable to console, distract, or reassure',
      components: [
        { inputKey: 'breathing',     label: 'Breathing (0-2)',          points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'vocalization',  label: 'Negative vocalization (0-2)', points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'facial',        label: 'Facial expression (0-2)',   points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'bodyLanguage',  label: 'Body language (0-2)',       points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
        { inputKey: 'consolability', label: 'Consolability (0-2)',       points: (v) => Math.max(0, Math.min(2, Math.round(Number(v) || 0))) },
      ],
      bands: [
        { range: [0, 0],   label: 'no pain' },
        { range: [1, 3],   label: 'mild pain / discomfort' },
        { range: [4, 6],   label: 'moderate pain' },
        { range: [7, 10],  label: 'severe pain' },
      ],
      population: 'Warden 2003: derivation in 19 male veterans with advanced dementia on a long-term-care ward. Reference standards: Discomfort Scale (DS-DAT), patient self-report when possible, and nurse Numeric Rating Scale assessments.',
      units: {
        breathing: 'integer 0-2', vocalization: 'integer 0-2',
        facial: 'integer 0-2', bodyLanguage: 'integer 0-2',
        consolability: 'integer 0-2',
      },
      validity: 'Adults with advanced dementia (or severe cognitive impairment) who cannot self-report pain. PAINAD uses the same 0/1-3/4-6/7-10 band structure as FLACC (a separate Sophie tile for pediatric pain). For verbal cognitively intact older adults, the numeric rating scale is the preferred tool. NOT designed for acute-pain assessment in unimpaired patients.',
      source: 'Warden V, Hurley AC, Volicer L. "Development and psychometric evaluation of the Pain Assessment in Advanced Dementia (PAINAD) scale." J Am Med Dir Assoc. 2003;4(1):9-15.',
    },
  },
  nips: {
    citation: 'Lawrence J, Alcock D, McGrath P, Kay J, MacMurray SB, Dulberg C. The development of a tool to assess neonatal pain. Neonatal Netw. 1993;12(6):59-66.',
    specialties: ['nursing-nicu', 'nursing-peds', 'nursing-general', 'pediatrics', 'neonatology'],
    example: {
      fields: { 'ni-face': '0', 'ni-cry': '0', 'ni-br': '0', 'ni-arms': '0', 'ni-legs': '0', 'ni-sta': '0' },
      expected: 'NIPS 0 of 7: no / mild pain per Lawrence 1993.',
    },
    interpretation: {
      bands: [
        { range: '0-2', text: 'No / mild pain.' },
        { range: '3-4', text: 'Mild-to-moderate pain.' },
        { range: '>4', text: 'Severe pain.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Lawrence J, et al. Neonatal Netw. 1993;12(6):59-66 (six items; cry 0-2, others 0-1; total 0-7).',
    },
  },

  // ---- spec-v34 §2: pediatric ICU bedside extensions ----
  'comfort-b': {
    citation: 'van Dijk M, Peters JWB, van Deventer P, Tibboel D. The COMFORT Behavior Scale: a tool for assessing pain and sedation in infants. Am J Nurs. 2005;105(1):33-36.',
    specialties: ['nursing-picu', 'nursing-nicu', 'nursing-peds', 'nursing-general', 'pediatrics', 'anesthesiology'],
    example: {
      fields: { 'cb-alt': '3', 'cb-cal': '3', 'cb-res': '3', 'cb-mov': '3', 'cb-mus': '3', 'cb-fac': '3' },
      expected: 'COMFORT-B 18 of 30: adequate sedation per van Dijk 2005.',
    },
    interpretation: {
      bands: [
        { range: '<11', text: 'Over-sedation - consider lightening.' },
        { range: '11-22', text: 'Adequate sedation - within target band.' },
        { range: '>22', text: 'Inadequate sedation / distress - assess pain and sedation needs.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'van Dijk M, et al. Am J Nurs. 2005;105(1):33-36 (six items each 1-5; total 6-30).',
    },
    derivation: {
      formula: 'COMFORT-B = sum of 6 nurse-observed behaviors (each 1-5), range 6-30. Target band 11-22.\n  Alertness: 1 deeply asleep / 2 lightly asleep / 3 drowsy / 4 fully awake and alert / 5 hyper-alert\n  Calmness/agitation: 1 calm / 2 slightly anxious / 3 anxious / 4 very anxious / 5 panicky\n  Respiratory response (intubated) OR crying (extubated): 1 no spontaneous respiration / 2 spontaneous + ventilator / 3 restless against vent / 4 active breathing against vent or persistent cough / 5 fighting ventilator (or hysterical crying if extubated)\n  Physical movement: 1 no movement / 2 occasional slight / 3 frequent slight / 4 vigorous limited to extremities / 5 vigorous including torso and head\n  Muscle tone: 1 totally relaxed / 2 reduced / 3 normal / 4 increased and flexion of fingers/toes / 5 extreme rigidity\n  Facial tension: 1 totally relaxed / 2 normal / 3 some tension / 4 full facial tension / 5 grimacing',
      components: [
        { inputKey: 'alertness',       label: 'Alertness (1-5)',                                      points: (v) => Math.max(1, Math.min(5, Math.round(Number(v) || 1))) },
        { inputKey: 'calmness',         label: 'Calmness / agitation (1-5)',                          points: (v) => Math.max(1, Math.min(5, Math.round(Number(v) || 1))) },
        { inputKey: 'respiratoryOrCry', label: 'Respiratory response (intubated) or crying (extubated) (1-5)', points: (v) => Math.max(1, Math.min(5, Math.round(Number(v) || 1))) },
        { inputKey: 'movement',         label: 'Physical movement (1-5)',                              points: (v) => Math.max(1, Math.min(5, Math.round(Number(v) || 1))) },
        { inputKey: 'muscleTone',       label: 'Muscle tone (1-5)',                                    points: (v) => Math.max(1, Math.min(5, Math.round(Number(v) || 1))) },
        { inputKey: 'facialTension',    label: 'Facial tension (1-5)',                                 points: (v) => Math.max(1, Math.min(5, Math.round(Number(v) || 1))) },
      ],
      bands: [
        { range: [6, 10],  label: 'over-sedation — consider lightening' },
        { range: [11, 22], label: 'adequate sedation (within target band)' },
        { range: [23, 30], label: 'inadequate sedation / distress — assess pain and sedation needs' },
      ],
      population: 'van Dijk 2005: PICU patients in the Netherlands. The COMFORT-B is the "behavior-only" variant of the original COMFORT scale (Ambuel 1992), removing the physiologic items (HR, MAP) so the score does not double-count when sedation also affects vital signs. Widely used in PICU sedation protocols.',
      units: {
        alertness: 'integer 1-5', calmness: 'integer 1-5',
        respiratoryOrCry: 'integer 1-5', movement: 'integer 1-5',
        muscleTone: 'integer 1-5', facialTension: 'integer 1-5',
      },
      validity: 'Pediatric ICU patients (intubated AND extubated). COMFORT-B is one of several PICU sedation instruments (SBS, FLACC, RASS for older children — all separate Sophie tiles); institutional preference governs which to use. Minimum aggregate is 6 (not 0) because every item starts at 1.',
      source: 'van Dijk M, Peters JWB, van Deventer P, Tibboel D. "The COMFORT Behavior Scale: a tool for assessing pain and sedation in infants." Am J Nurs. 2005;105(1):33-36.',
    },
  },
  'wat-1': {
    citation: 'Franck LS, Harris SK, Soetenga DJ, Amling JK, Curley MAQ. The Withdrawal Assessment Tool-1 (WAT-1): an assessment instrument for monitoring opioid and benzodiazepine withdrawal symptoms in pediatric patients. Pediatr Crit Care Med. 2008;9(6):573-580.',
    specialties: ['nursing-picu', 'nursing-peds', 'nursing-general', 'pediatrics', 'anesthesiology', 'pain-medicine'],
    example: {
      fields: { 'w1-ls': '0', 'w1-vo': '0', 'w1-fe': '0', 'w1-sb': '0', 'w1-tr': '0', 'w1-sw': '0', 'w1-um': '0', 'w1-ys': '0', 'w1-st': '0', 'w1-mt': '0', 'w1-rm': '0' },
      expected: 'WAT-1 0 of 12: no significant withdrawal per Franck 2008.',
    },
    interpretation: {
      bands: [
        { range: '0-2', text: 'No significant withdrawal.' },
        { range: '>=3', text: 'Iatrogenic opioid/benzodiazepine withdrawal present (Franck 2008 sensitivity 0.87, specificity 0.88).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Franck LS, et al. Pediatr Crit Care Med. 2008;9(6):573-580 (11 items; total 0-12; cutoff >=3).',
    },
    derivation: {
      formula: 'WAT-1 = sum of 11 items, range 0-12. Cutoff >=3 = iatrogenic withdrawal per Franck 2008.\n  Prior-12-hour items (each 0/1):\n    Loose / watery stools, vomiting / retching / gagging, fever (T >37.8°C)\n  Pre-stimulus 2-min items (each 0/1):\n    SBS state ≥ +1 (or NRS ≥ 1 if SBS not used), tremor, sweating, uncoordinated / repetitive movement, yawning or sneezing\n  Stimulus 1-min items (each 0/1):\n    Startle to touch, increased muscle tone\n  Post-stimulus recovery (single item, 0-2):\n    Time to calm to SBS 0 / NRS 0: <2 min → 0; 2-5 min → 1; >5 min → 2',
      components: [
        { inputKey: 'looseStools',           label: 'Loose/watery stools (prior 12 h)',                            points: 1 },
        { inputKey: 'vomiting',              label: 'Vomiting / retching / gagging (prior 12 h)',                  points: 1 },
        { inputKey: 'fever',                 label: 'Fever (T >37.8°C, prior 12 h)',                                points: 1 },
        { inputKey: 'sbsStatePositive',      label: 'SBS state >= +1 (or NRS >= 1) at pre-stimulus',               points: 1 },
        { inputKey: 'tremor',                label: 'Tremor at pre-stimulus',                                       points: 1 },
        { inputKey: 'sweating',              label: 'Sweating at pre-stimulus',                                     points: 1 },
        { inputKey: 'uncoordinatedMovement', label: 'Uncoordinated / repetitive movement at pre-stimulus',          points: 1 },
        { inputKey: 'yawnSneeze',            label: 'Yawning or sneezing at pre-stimulus',                          points: 1 },
        { inputKey: 'startleToTouch',        label: 'Startle to touch (during 1-min stimulus)',                     points: 1 },
        { inputKey: 'increasedMuscleTone',   label: 'Increased muscle tone (during 1-min stimulus)',                 points: 1 },
        { inputKey: 'recoveryMinutes',       label: 'Post-stimulus recovery time to calm (0=<2 min / 1=2-5 / 2=>5)', points: (v) => { const m = Number(v); if (!Number.isFinite(m) || m < 2) return 0; if (m <= 5) return 1; return 2; } },
      ],
      bands: [
        { range: [0, 2],                 label: 'no significant withdrawal' },
        { range: { op: '>=', value: 3 }, label: 'iatrogenic opioid/benzodiazepine withdrawal present (Franck 2008 sensitivity 0.87 / specificity 0.88)' },
      ],
      population: 'Franck 2008: derivation in 83 pediatric ICU patients on opioids or benzodiazepines weaning. Reference standard: Sophia Observation withdrawal Symptoms-scale (SOS — a separate Sophie tile) and clinical withdrawal diagnosis.',
      units: {
        looseStools: 'boolean (prior 12 h)', vomiting: 'boolean (prior 12 h)',
        fever: 'boolean (prior 12 h)',
        sbsStatePositive: 'boolean (pre-stimulus 2-min)',
        tremor: 'boolean (pre-stimulus)', sweating: 'boolean (pre-stimulus)',
        uncoordinatedMovement: 'boolean (pre-stimulus)',
        yawnSneeze: 'boolean (pre-stimulus)',
        startleToTouch: 'boolean (during 1-min stimulus)',
        increasedMuscleTone: 'boolean (during 1-min stimulus)',
        recoveryMinutes: 'numeric minutes; 0 / <2 = 0 pts, 2-5 = 1 pt, >5 = 2 pts',
      },
      validity: 'Pediatric ICU patients on opioid / benzodiazepine wean. The WAT-1 has a structured observation protocol (12-h pre-period + 2-min pre-stimulus + 1-min stimulus + post-stimulus recovery) — point-in-time observations are NOT the intended use. The companion SOS (Ista 2009, a separate Sophie tile) uses a simpler observation window and may be preferred when the structured WAT-1 protocol is impractical. NOT validated in neonates.',
      source: 'Franck LS, Harris SK, Soetenga DJ, Amling JK, Curley MAQ. "The Withdrawal Assessment Tool-1 (WAT-1): an assessment instrument for monitoring opioid and benzodiazepine withdrawal symptoms in pediatric patients." Pediatr Crit Care Med. 2008;9(6):573-580.',
    },
  },
  sos: {
    citation: 'Ista E, van Dijk M, de Hoog M, Tibboel D, Duivenvoorden HJ. Construction of the Sophia Observation withdrawal Symptoms-scale (SOS) for critically ill children. Intensive Care Med. 2009;35(6):1075-1081.',
    specialties: ['nursing-picu', 'nursing-nicu', 'nursing-peds', 'nursing-general', 'pediatrics', 'anesthesiology', 'pain-medicine'],
    example: {
      fields: {
        'so-tac': '0', 'so-tap': '0', 'so-fev': '0', 'so-swe': '0', 'so-agi': '0',
        'so-anx': '0', 'so-gri': '0', 'so-sle': '0', 'so-hal': '0', 'so-mot': '0',
        'so-hyp': '0', 'so-tre': '0', 'so-vom': '0', 'so-dia': '0', 'so-cry': '0',
      },
      expected: 'SOS 0 of 15: no significant withdrawal per Ista 2009.',
    },
    interpretation: {
      bands: [
        { range: '0-3', text: 'No significant withdrawal.' },
        { range: '>=4', text: 'Iatrogenic withdrawal present per Ista 2009 (derivation Youden-optimal cutoff).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Ista E, et al. Intensive Care Med. 2009;35(6):1075-1081 (15 binary items over a 4-hour observation window; total 0-15; cutoff >=4).',
    },
    derivation: {
      formula: 'SOS = sum of 15 binary items observed over the prior 4-hour window (each 0 absent / 1 present), range 0-15. Cutoff >=4 indicates clinically relevant iatrogenic withdrawal per Ista 2009.',
      components: [
        { inputKey: 'tachycardia',        label: 'Tachycardia',                     points: 1 },
        { inputKey: 'tachypnea',          label: 'Tachypnea',                       points: 1 },
        { inputKey: 'fever',              label: 'Fever',                           points: 1 },
        { inputKey: 'sweating',           label: 'Sweating',                        points: 1 },
        { inputKey: 'agitation',          label: 'Agitation',                       points: 1 },
        { inputKey: 'anxiety',            label: 'Anxiety',                         points: 1 },
        { inputKey: 'grimacing',          label: 'Grimacing',                       points: 1 },
        { inputKey: 'sleeplessness',      label: 'Sleeplessness',                   points: 1 },
        { inputKey: 'hallucinations',     label: 'Hallucinations',                  points: 1 },
        { inputKey: 'motorDisturbance',   label: 'Motor disturbance',               points: 1 },
        { inputKey: 'hypertonia',         label: 'Hypertonia',                      points: 1 },
        { inputKey: 'tremor',             label: 'Tremor',                          points: 1 },
        { inputKey: 'vomiting',           label: 'Vomiting',                        points: 1 },
        { inputKey: 'diarrhea',           label: 'Diarrhea',                        points: 1 },
        { inputKey: 'inconsolableCrying', label: 'Inconsolable crying',             points: 1 },
      ],
      bands: [
        { range: [0, 3],                 label: 'no significant withdrawal' },
        { range: { op: '>=', value: 4 }, label: 'iatrogenic withdrawal present (Ista 2009 cutoff)' },
      ],
      population: 'Ista 2009: derivation in 79 pediatric ICU patients on opioids or benzodiazepines ≥5 days. Reference standard: clinical withdrawal diagnosis by attending intensivist. The ≥4 cutoff is the Youden-optimal threshold from the derivation cohort.',
      units: {
        tachycardia: 'boolean', tachypnea: 'boolean', fever: 'boolean',
        sweating: 'boolean', agitation: 'boolean', anxiety: 'boolean',
        grimacing: 'boolean', sleeplessness: 'boolean', hallucinations: 'boolean',
        motorDisturbance: 'boolean', hypertonia: 'boolean', tremor: 'boolean',
        vomiting: 'boolean', diarrhea: 'boolean', inconsolableCrying: 'boolean',
      },
      validity: 'Pediatric ICU patients on opioids / benzodiazepines for at least 5 days. SOS is observed over the 4-hour window preceding scoring; point-in-time observations are not the intended use. The companion WAT-1 (Withdrawal Assessment Tool) is a separate Sophie tile. NOT validated in neonates (use a neonate-specific tool such as Finnegan / NWAT).',
      source: 'Ista E, van Dijk M, de Hoog M, Tibboel D, Duivenvoorden HJ. "Construction of the Sophia Observation withdrawal Symptoms-scale (SOS) for critically ill children." Intensive Care Med. 2009;35(6):1075-1081.',
    },
  },
  cssrs: {
    citation: 'Posner K, Brown GK, Stanley B, et al. The Columbia-Suicide Severity Rating Scale: initial validity and internal consistency findings from three multisite studies with adolescents and adults. Am J Psychiatry. 2011;168(12):1266-1277.',
    specialties: ['nursing-ed', 'nursing-floor', 'nursing-general', 'psychiatry', 'emergency-medicine', 'family-medicine', 'social-work'],
    example: {
      fields: {
        'cs-q1': 'false', 'cs-q2': 'false', 'cs-q3': 'false',
        'cs-q4': 'false', 'cs-q5': 'false',
        'cs-q6': 'false', 'cs-q6a': 'false',
      },
      expected: 'C-SSRS Screener: no risk reported. No suicide risk reported on the C-SSRS Screener at this contact; rescreen per local protocol if status changes. Banding per Columbia Lighthouse Project ED Triage Screener of Posner 2011.',
    },
    interpretation: {
      bands: [
        { range: 'no risk reported', text: 'No suicide risk on the C-SSRS Screener at this contact; rescreen per local protocol.' },
        { range: 'low risk',         text: 'Wish to be dead or non-specific active ideation. Behavioral health follow-up; share 988 Suicide & Crisis Lifeline.' },
        { range: 'moderate risk',    text: 'Active ideation with methods (no plan/intent), OR lifetime behavior not in the past 3 months. Behavioral health evaluation; safety planning before discharge; restrict access to lethal means.' },
        { range: 'high risk',        text: 'Active ideation with intent or plan, OR suicidal behavior in the past 3 months. Behavioral health / psychiatry evaluation now; consider 1:1 observation; restrict access to lethal means.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Posner K, et al. Am J Psychiatry. 2011;168(12):1266-1277 (5 ideation items + 1 lifetime behavior + past-3-months follow-up). Risk bands per Columbia Lighthouse Project ED Triage Screener (Joint Commission and SAMHSA recommended).',
    },
    derivation: {
      formula: 'C-SSRS Screener risk-band is determined by LOGIC (not an additive sum) per the Columbia Lighthouse Project ED Triage Screener:\n  HIGH risk: someIntent OR planIntent OR (behaviorPast3Months)\n  MODERATE risk: thoughtsMethods OR (behaviorLifetime AND NOT behaviorPast3Months)\n  LOW risk: wishDead OR thoughtsKilling\n  NO RISK REPORTED: none of the above\nThe first matching condition (top-down) determines the band.',
      bands: [
        { range: [0, 0], label: 'no risk reported (rescreen per local protocol)' },
        { range: [1, 1], label: 'low risk (Q1 or Q2 positive only) — behavioral health follow-up; share 988' },
        { range: [2, 2], label: 'moderate risk (Q3 positive, OR lifetime behavior not in past 3 months) — BH evaluation; safety plan; restrict lethal means' },
        { range: [3, 3], label: 'high risk (Q4/Q5 positive, OR behavior in past 3 months) — immediate BH/psychiatry; consider 1:1; restrict lethal means' },
      ],
      population: 'Posner 2011: 124 adolescents and adults across three multisite studies. The C-SSRS family of instruments (Lifetime/Recent, Since Last Visit, Screener) is endorsed by FDA, Joint Commission, SAMHSA, and the Columbia Lighthouse Project for clinical and research use. The Sophie tile implements the **ED Triage Screener** form (5 ideation Qs + lifetime behavior + past-3-months follow-up).',
      units: {
        wishDead: 'boolean (Q1: past month, wish you were dead or could not wake up)',
        thoughtsKilling: 'boolean (Q2: past month, non-specific active ideation)',
        thoughtsMethods: 'boolean (Q3: past month, ideation with methods, no plan/intent)',
        someIntent: 'boolean (Q4: past month, some intent without specific plan)',
        planIntent: 'boolean (Q5: past month, intent with specific plan)',
        behaviorLifetime: 'boolean (Q6: lifetime suicidal behavior)',
        behaviorPast3Months: 'boolean (Q6a: behavior within the past 3 months)',
      },
      validity: 'Adolescents and adults across clinical settings (ED, inpatient, outpatient). The Sophie derivation block ships formula-only because the C-SSRS Screener band is determined by LOGIC, not an additive sum — the Sophie scoring function returns a band string, not a numeric score. The Sophie tile separately surfaces the band and the recommended action. The C-SSRS Screener is a TRIAGE instrument; a positive screen warrants formal suicide-risk evaluation per institutional protocol.',
      source: 'Posner K, Brown GK, Stanley B, et al. "The Columbia-Suicide Severity Rating Scale: initial validity and internal consistency findings from three multisite studies with adolescents and adults." Am J Psychiatry. 2011;168(12):1266-1277. Risk bands per the Columbia Lighthouse Project ED Triage Screener.',
    },
  },
  barthel: {
    citation: 'Mahoney FI, Barthel DW. Functional evaluation: the Barthel Index. Md State Med J. 1965;14:61-65. Bands: Shah S, Vanclay F, Cooper B. J Clin Epidemiol. 1989;42(8):703-709.',
    specialties: ['nursing-floor', 'nursing-rehab', 'nursing-general', 'physical-therapy', 'occupational-therapy', 'physical-medicine-rehabilitation', 'geriatrics', 'case-management'],
    example: {
      fields: {
        'bt-feed': '10', 'bt-bath': '5', 'bt-groom': '5', 'bt-dress': '10',
        'bt-bowel': '10', 'bt-bladder': '10', 'bt-toil': '10',
        'bt-trans': '15', 'bt-mob': '15', 'bt-stair': '10',
      },
      expected: 'Barthel Index 100 of 100: independent per Mahoney 1965 (Shah 1989 banding).',
    },
    interpretation: {
      bands: [
        { range: '100',   text: 'Independent.' },
        { range: '91-99', text: 'Slight dependency.' },
        { range: '61-90', text: 'Moderate dependency.' },
        { range: '21-60', text: 'Severe dependency.' },
        { range: '0-20',  text: 'Total dependency.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Mahoney FI, Barthel DW. Md State Med J. 1965;14:61-65 (10 weighted ADL items, 0-100). Shah S, et al. J Clin Epidemiol. 1989;42(8):703-709 (five-band severity scheme).',
    },
    derivation: {
      formula: 'Barthel Index = sum of 10 weighted ADL items. Total 0-100 in 5-point increments. Each item has a published allowed-value set (off-grid values reject in the underlying calculator).\n  Feeding: 0 unable / 5 needs help / 10 independent\n  Bathing: 0 dependent / 5 independent\n  Grooming: 0 needs help / 5 independent\n  Dressing: 0 dependent / 5 needs help / 10 independent\n  Bowel control: 0 incontinent / 5 occasional accident / 10 continent\n  Bladder control: 0 incontinent or catheter / 5 occasional accident / 10 continent\n  Toilet use: 0 dependent / 5 needs help / 10 independent\n  Transfers (bed to chair and back): 0 unable / 5 major help / 10 minor help / 15 independent\n  Mobility (on level): 0 immobile / 5 wheelchair / 10 walks with help / 15 walks independently\n  Stairs: 0 unable / 5 needs help / 10 independent',
      components: [
        { inputKey: 'feeding',   label: 'Feeding (0 / 5 / 10)',                       points: (v) => Math.max(0, Math.min(10, Number(v) || 0)) },
        { inputKey: 'bathing',   label: 'Bathing (0 / 5)',                             points: (v) => Math.max(0, Math.min(5,  Number(v) || 0)) },
        { inputKey: 'grooming',  label: 'Grooming (0 / 5)',                            points: (v) => Math.max(0, Math.min(5,  Number(v) || 0)) },
        { inputKey: 'dressing',  label: 'Dressing (0 / 5 / 10)',                       points: (v) => Math.max(0, Math.min(10, Number(v) || 0)) },
        { inputKey: 'bowel',     label: 'Bowel control (0 / 5 / 10)',                   points: (v) => Math.max(0, Math.min(10, Number(v) || 0)) },
        { inputKey: 'bladder',   label: 'Bladder control (0 / 5 / 10)',                 points: (v) => Math.max(0, Math.min(10, Number(v) || 0)) },
        { inputKey: 'toilet',    label: 'Toilet use (0 / 5 / 10)',                      points: (v) => Math.max(0, Math.min(10, Number(v) || 0)) },
        { inputKey: 'transfers', label: 'Transfers (bed to chair) (0 / 5 / 10 / 15)',  points: (v) => Math.max(0, Math.min(15, Number(v) || 0)) },
        { inputKey: 'mobility',  label: 'Mobility on level (0 / 5 / 10 / 15)',          points: (v) => Math.max(0, Math.min(15, Number(v) || 0)) },
        { inputKey: 'stairs',    label: 'Stairs (0 / 5 / 10)',                          points: (v) => Math.max(0, Math.min(10, Number(v) || 0)) },
      ],
      bands: [
        { range: [0, 20],   label: 'total dependency' },
        { range: [21, 60],  label: 'severe dependency' },
        { range: [61, 90],  label: 'moderate dependency' },
        { range: [91, 99],  label: 'slight dependency' },
        { range: [100, 100], label: 'independent' },
      ],
      population: 'Mahoney & Barthel 1965: chronic-disease inpatients at the Maryland State Chronic Diseases Hospital. The 5-band severity scheme is from Shah 1989 (n=258 stroke-rehab patients) and remains the most cited contemporary stratification.',
      units: {
        feeding: 'integer; allowed values 0/5/10',
        bathing: 'integer; allowed values 0/5',
        grooming: 'integer; allowed values 0/5',
        dressing: 'integer; allowed values 0/5/10',
        bowel: 'integer; allowed values 0/5/10',
        bladder: 'integer; allowed values 0/5/10',
        toilet: 'integer; allowed values 0/5/10',
        transfers: 'integer; allowed values 0/5/10/15',
        mobility: 'integer; allowed values 0/5/10/15',
        stairs: 'integer; allowed values 0/5/10',
      },
      validity: 'Adult rehabilitation and chronic-disease inpatients. The Barthel Index is widely used in stroke rehabilitation, geriatrics, and discharge planning. Each item has a published *closed set* of allowed values (e.g., feeding is 0, 5, or 10 — there is no 7); the underlying calculator throws on off-grid values to prevent silent rounding. The Shah 1989 5-band severity scheme is the contemporary stratification; the original 1965 paper did not specify bands. NOT designed for acute-illness severity scoring.',
      source: 'Mahoney FI, Barthel DW. "Functional evaluation: the Barthel Index." Md State Med J. 1965;14:61-65. Bands: Shah S, Vanclay F, Cooper B. "Improving the sensitivity of the Barthel Index for stroke rehabilitation." J Clin Epidemiol. 1989;42(8):703-709.',
    },
  },
  'lawton-iadl': {
    citation: 'Lawton MP, Brody EM. Assessment of older people: self-maintaining and instrumental activities of daily living. Gerontologist. 1969;9(3):179-186.',
    specialties: ['nursing-floor', 'nursing-ed', 'nursing-general', 'geriatrics', 'family-medicine', 'case-management', 'occupational-therapy', 'physical-therapy'],
    example: {
      fields: {
        'lw-tel': '1', 'lw-shop': '1', 'lw-food': '1', 'lw-house': '1',
        'lw-laund': '1', 'lw-trans': '1', 'lw-med': '1', 'lw-fin': '1',
      },
      expected: 'Lawton IADL 8 of 8: full independence per Lawton 1969.',
    },
    interpretation: {
      bands: [
        { range: '8',   text: 'Full independence across all eight IADLs.' },
        { range: '6-7', text: 'Mild IADL impairment.' },
        { range: '3-5', text: 'Moderate IADL impairment.' },
        { range: '0-2', text: 'Severe IADL impairment.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Lawton MP, Brody EM. Gerontologist. 1969;9(3):179-186 (eight binary IADL items: telephone, shopping, food prep, housekeeping, laundry, transportation, medications, finances; total 0-8 on the modern unisex form).',
    },
    derivation: {
      formula: 'Lawton IADL = sum of 8 binary items (0 = needs help; 1 = independent), range 0-8. Items: telephone use, shopping, food preparation, housekeeping, laundry, transportation, responsibility for own medications, ability to handle finances.',
      components: [
        { inputKey: 'telephone',      label: 'Ability to use telephone',        points: 1 },
        { inputKey: 'shopping',       label: 'Shopping',                         points: 1 },
        { inputKey: 'foodPrep',       label: 'Food preparation',                 points: 1 },
        { inputKey: 'housekeeping',   label: 'Housekeeping',                     points: 1 },
        { inputKey: 'laundry',        label: 'Laundry',                          points: 1 },
        { inputKey: 'transportation', label: 'Mode of transportation',           points: 1 },
        { inputKey: 'medications',    label: 'Responsibility for own medications', points: 1 },
        { inputKey: 'finances',       label: 'Ability to handle finances',       points: 1 },
      ],
      bands: [
        { range: [0, 2], label: 'severe IADL impairment' },
        { range: [3, 5], label: 'moderate IADL impairment' },
        { range: [6, 7], label: 'mild IADL impairment' },
        { range: [8, 8], label: 'full independence across all 8 IADLs' },
      ],
      population: 'Lawton & Brody 1969: 180 community-dwelling and institutionalized older adults. The original 1969 paper used sex-specific scoring (men were not scored on food prep, housekeeping, laundry); the modern unisex form (which Sophie implements) scores all 8 items for all patients.',
      units: {
        telephone: 'boolean (0 = needs help, 1 = independent)',
        shopping: 'boolean', foodPrep: 'boolean', housekeeping: 'boolean',
        laundry: 'boolean', transportation: 'boolean',
        medications: 'boolean', finances: 'boolean',
      },
      validity: 'Older adults (geriatric population). Lawton IADL measures higher-level instrumental ADLs (those required for community living); the companion Katz ADL covers basic ADLs (bathing, dressing, etc.). The Sophie tile uses the unisex modern form — the original 1969 sex-stratified scoring is NOT implemented. NOT validated in acutely-ill inpatients (their pre-illness baseline must be inferred from caregiver report).',
      source: 'Lawton MP, Brody EM. "Assessment of older people: self-maintaining and instrumental activities of daily living." Gerontologist. 1969;9(3):179-186.',
    },
  },
  'katz-adl': {
    citation: 'Katz S, Ford AB, Moskowitz RW, Jackson BA, Jaffe MW. Studies of illness in the aged. The index of ADL: a standardized measure of biological and psychosocial function. JAMA. 1963;185(12):914-919.',
    specialties: ['nursing-floor', 'nursing-ed', 'nursing-general', 'geriatrics', 'family-medicine', 'physical-therapy', 'occupational-therapy', 'case-management'],
    example: {
      fields: {
        'kz-bath': '1', 'kz-dress': '1', 'kz-toil': '1',
        'kz-trans': '1', 'kz-cont': '1', 'kz-feed': '1',
      },
      expected: 'Katz ADL 6 of 6: full independence per Katz 1963.',
    },
    interpretation: {
      bands: [
        { range: '6',   text: 'Full independence in all six ADLs.' },
        { range: '5',   text: 'Mild impairment - independent in five ADLs.' },
        { range: '3-4', text: 'Moderate impairment.' },
        { range: '0-2', text: 'Severe functional impairment.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Katz S, et al. JAMA. 1963;185(12):914-919 (six binary ADL items: bathing, dressing, toileting, transferring, continence, feeding; total 0-6).',
    },
    derivation: {
      formula: 'Katz ADL = sum of 6 binary items (0 = dependent; 1 = independent), range 0-6. Items: bathing, dressing, toileting, transferring (in/out of bed or chair), continence, feeding.',
      components: [
        { inputKey: 'bathing',      label: 'Bathing',                                points: 1 },
        { inputKey: 'dressing',     label: 'Dressing',                               points: 1 },
        { inputKey: 'toileting',    label: 'Toileting',                              points: 1 },
        { inputKey: 'transferring', label: 'Transferring (in/out of bed or chair)',  points: 1 },
        { inputKey: 'continence',   label: 'Continence',                             points: 1 },
        { inputKey: 'feeding',      label: 'Feeding',                                points: 1 },
      ],
      bands: [
        { range: [0, 2], label: 'severe functional impairment' },
        { range: [3, 4], label: 'moderate impairment' },
        { range: [5, 5], label: 'mild impairment (independent in 5 of 6 ADLs)' },
        { range: [6, 6], label: 'full independence in all 6 ADLs' },
      ],
      population: 'Katz 1963: 1001 patients across hip-fracture and stroke rehabilitation cohorts. Validated extensively in geriatric care, rehabilitation, and discharge planning.',
      units: {
        bathing: 'boolean (0 = dependent, 1 = independent)',
        dressing: 'boolean', toileting: 'boolean',
        transferring: 'boolean', continence: 'boolean', feeding: 'boolean',
      },
      validity: 'Older adults (geriatric population), discharge-planning and rehabilitation contexts. Katz ADL measures basic ADLs (the "self-maintenance" half of geriatric function); the companion Lawton IADL covers instrumental ADLs (the "community living" half). The bands above reflect the conventional discharge-planning stratification — the 1963 paper itself uses an A-G letter grading (A = independent in all; G = dependent in all). NOT designed for acute-illness severity scoring; baseline ADLs are typically assessed pre-illness via caregiver interview.',
      source: 'Katz S, Ford AB, Moskowitz RW, Jackson BA, Jaffe MW. "Studies of illness in the aged. The index of ADL: a standardized measure of biological and psychosocial function." JAMA. 1963;185(12):914-919.',
    },
  },
  'four-score': {
    citation: 'Wijdicks EFM, Bamlet WR, Maramattom BV, Manno EM, McClelland RL. Validation of a new coma scale: The FOUR score. Ann Neurol. 2005;58(4):585-593.',
    specialties: ['nursing-icu', 'nursing-general', 'neurology', 'critical-care', 'emergency-medicine', 'family-medicine'],
    example: {
      fields: { 'fs-eye': '4', 'fs-motor': '4', 'fs-brain': '4', 'fs-resp': '4' },
      expected: 'FOUR Score 16 of 16 per Wijdicks 2005. All four components maximal (E4 M4 B4 R4).',
    },
    interpretation: {
      bands: [
        { range: '16',   text: 'All four components maximal; no observed coma signs on FOUR.' },
        { range: '1-15', text: 'Intermediate pattern; report the per-component E/M/B/R values for the bedside hand-off.' },
        { range: '0',    text: 'All four components absent - consistent with very poor prognosis; the FOUR=0 pattern is part of the AAN 2010 brain-death determination workup as a screen for confounders.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Wijdicks EFM, et al. Ann Neurol. 2005;58(4):585-593 (four ordinal items each 0-4: eye, motor, brainstem reflexes, respiration; total 0-16).',
    },
    derivation: {
      formula: 'FOUR Score = E + M + B + R (range 0-16). Each component is an integer 0-4 scored per Wijdicks 2005 Table 1:\n  E (Eye): 4 tracking — 3 open not tracking — 2 to voice — 1 to pain — 0 closed even with pain\n  M (Motor): 4 to command — 3 localizes pain — 2 flexion to pain — 1 extensor posturing — 0 no response or generalized myoclonus status\n  B (Brainstem reflexes): 4 pupil + corneal — 3 one pupil wide and fixed — 2 pupil OR corneal absent — 1 pupil AND corneal absent — 0 pupil, corneal, and cough all absent\n  R (Respiration): 4 not intubated, regular — 3 not intubated, Cheyne-Stokes — 2 not intubated, irregular — 1 intubated, breathes above vent rate — 0 intubated, at vent rate or apnea',
      components: [
        { inputKey: 'eye',         label: 'E — Eye response (0-4)',          points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
        { inputKey: 'motor',       label: 'M — Motor response (0-4)',        points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
        { inputKey: 'brainstem',   label: 'B — Brainstem reflexes (0-4)',    points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
        { inputKey: 'respiration', label: 'R — Respiration (0-4)',           points: (v) => Math.max(0, Math.min(4, Number(v) || 0)) },
      ],
      bands: [
        { range: [0, 0],   label: 'all four components absent (E0 M0 B0 R0); very poor prognosis; AAN 2010 brain-death workup applies' },
        { range: [1, 15],  label: 'intermediate pattern; report per-component E/M/B/R for the bedside hand-off' },
        { range: [16, 16], label: 'no observed coma signs (E4 M4 B4 R4)' },
      ],
      population: 'Derivation/validation: 120 ICU patients at the Mayo Clinic with impaired consciousness (Wijdicks 2005). Subsequent multi-center validation including Iyer 2009 (Crit Care Med).',
      units: {
        eye:         'integer 0-4',
        motor:       'integer 0-4',
        brainstem:   'integer 0-4',
        respiration: 'integer 0-4',
      },
      validity: 'Adult ICU patients with impaired consciousness. The FOUR score was designed to overcome GCS limitations in intubated and brainstem-injured patients — the brainstem and respiration components fill the gap where GCS Verbal cannot be scored. NOT validated in pediatrics (separate pediatric FOUR validation is preliminary). The R component requires knowing the ventilator setting; the bedside RN may need to consult RT or check the vent display.',
      source: 'Wijdicks EFM, Bamlet WR, Maramattom BV, Manno EM, McClelland RL. "Validation of a new coma scale: The FOUR score." Ann Neurol. 2005;58(4):585-593.',
    },
  },
  guss: {
    citation: 'Trapl M, Enderle P, Nowotny M, Teuschl Y, Matz K, Dachenhausen A, Brainin M. Dysphagia bedside screening for acute-stroke patients: the Gugging Swallowing Screen. Stroke. 2007;38(11):2948-2952.',
    specialties: ['nursing-icu', 'nursing-ed', 'nursing-general', 'neurology', 'emergency-medicine', 'speech-language-pathology', 'family-medicine'],
    example: {
      fields: {
        'gu-vig': '1', 'gu-cgh': '1', 'gu-sw': '1', 'gu-dr': '1', 'gu-vc': '1',
        'gu-ssSw': '2', 'gu-ssCg': '1', 'gu-ssDr': '1', 'gu-ssVc': '1',
        'gu-liSw': '2', 'gu-liCg': '1', 'gu-liDr': '1', 'gu-liVc': '1',
        'gu-soSw': '2', 'gu-soCg': '1', 'gu-soDr': '1', 'gu-soVc': '1',
      },
      expected: 'GUSS 20 of 20 (slight / no dysphagia). Normal diet, normal liquids; no further investigation per Trapl 2007.',
    },
    interpretation: {
      bands: [
        { range: '20',    text: 'Slight or no dysphagia, minimal aspiration risk. Normal diet, normal liquids.' },
        { range: '15-19', text: 'Slight dysphagia, low aspiration risk. Dysphagia diet (purée + thickened liquids); SLP evaluation; consider FEES/VFSS.' },
        { range: '10-14', text: 'Moderate dysphagia, aspiration risk. Semisolid diet only, NPO liquids; further SLP evaluation; FEES/VFSS.' },
        { range: '0-9',   text: 'Severe dysphagia, high aspiration risk. NPO; consider NG/PEG; urgent SLP evaluation.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Trapl M, et al. Stroke. 2007;38(11):2948-2952 (two-stage: preliminary 0-5 gates direct swallowing; semisolid/liquid/solid 0-5 each gate the next consistency; total 0-20).',
    },
    derivation: {
      formula: 'GUSS is a STAGED screen, not a pure additive score. The stages gate each other:\n  Stage 1 — Preliminary investigation (max 5): vigilance (0/1), voluntary cough or throat clearing (0/1), saliva swallow successful (0/1), no drooling (0/1), no voice change (0/1).\n    If Stage 1 < 5: STOP. Total = Stage 1. Severe dysphagia; NPO.\n    If Stage 1 = 5: proceed to Stage 2 — Semisolid.\n  Stage 2 — Semisolid (max 5): deglutition (0 not possible / 1 delayed / 2 successful), no involuntary cough (0/1), no drooling (0/1), no voice change (0/1).\n    If semisolid < 5: STOP. Total = Stage 1 + semisolid. Choose diet by total band below.\n    If semisolid = 5: proceed to Stage 2 — Liquid.\n  Stage 2 — Liquid (max 5): same four items, same scoring.\n    If liquid < 5: STOP. If liquid = 5: proceed to solid.\n  Stage 2 — Solid (max 5): same four items, same scoring.\nTotal = Stage 1 + (each Stage 2 consistency that was reached). Range 0-20.',
      bands: [
        { range: [0, 9],   label: 'severe dysphagia (NPO; consider NG/PEG; urgent SLP)' },
        { range: [10, 14], label: 'moderate dysphagia (semisolid only, NPO liquids; SLP; FEES/VFSS)' },
        { range: [15, 19], label: 'slight dysphagia (dysphagia diet; SLP evaluation)' },
        { range: [20, 20], label: 'no dysphagia (normal diet, normal liquids)' },
      ],
      population: 'Trapl 2007 derivation: 50 acute-stroke patients at a Vienna stroke unit. Validation: 50 additional patients, sensitivity 100% for aspiration on VFSS at the <20 cutoff in this cohort.',
      units: {
        vigilance: 'binary 0/1', coughClear: 'binary 0/1', salivaSwallow: 'binary 0/1',
        salivaNoDrool: 'binary 0/1', salivaNoVoiceChange: 'binary 0/1',
        'semisolid/liquid/solid Sw': 'integer 0-2 (deglutition)',
        'semisolid/liquid/solid Cg/Dr/Vc': 'binary 0/1 each',
      },
      validity: 'Adult post-stroke bedside dysphagia screen. The staged gating IS the safety mechanism: a patient who fails Stage 1 should NOT be advanced to the swallowing trials. The Sophie computation respects the gating — even if the user enters values for liquid / solid after failing semisolid, those values do not contribute to the total. The screen is a SLP-pre-evaluation tool; FEES/VFSS remain the gold standard for definitive dysphagia diagnosis. NOT validated for non-stroke dysphagia etiologies (neurodegenerative, head-and-neck post-surgical, esophageal).',
      source: 'Trapl M, Enderle P, Nowotny M, Teuschl Y, Matz K, Dachenhausen A, Brainin M. "Dysphagia bedside screening for acute-stroke patients: the Gugging Swallowing Screen." Stroke. 2007;38(11):2948-2952.',
    },
  },
  rosier: {
    citation: 'Nor AM, Davis J, Sen B, Shipsey D, Louw SJ, Dyker AG, Davis M, Ford GA. The Recognition of Stroke in the Emergency Room (ROSIER) scale: development and validation of a stroke recognition instrument. Lancet Neurol. 2005;4(11):727-734.',
    specialties: ['nursing-ed', 'nursing-general', 'emergency-medicine', 'neurology', 'family-medicine'],
    example: {
      fields: {
        'ro-loc': 'false', 'ro-sez': 'false',
        'ro-face': 'false', 'ro-arm': 'false', 'ro-leg': 'false',
        'ro-speech': 'false', 'ro-vis': 'false',
      },
      expected: 'ROSIER 0: low probability of stroke on the ROSIER threshold (score <= 0 per Nor 2005). Investigate stroke mimics (seizure, syncope) but stroke is not fully excluded; use clinical judgment.',
    },
    interpretation: {
      bands: [
        { range: '<= 0', text: 'Low probability of stroke on the ROSIER threshold. Investigate stroke mimics; stroke is not fully excluded.' },
        { range: '> 0',  text: 'Stroke is likely (Nor 2005 sensitivity 93% / specificity 83%). Activate the stroke pathway per local protocol.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Nor AM, et al. Lancet Neurol. 2005;4(11):727-734 (LOC/syncope -1, seizure -1, facial/arm/leg weakness +1 each, speech +1, visual-field defect +1; total -2..+5; stroke likely if >0).',
    },
    derivation: {
      formula: 'ROSIER = sum of 7 binary items. Two stroke-mimic items each subtract 1; five focal-deficit items each add 1. Range -2 to +5. Stroke likely when score > 0.\n  Loss of consciousness or syncope: -1 if present\n  Seizure activity: -1 if present\n  Facial weakness: +1 if present\n  Arm weakness: +1 if present\n  Leg weakness: +1 if present\n  Speech disturbance: +1 if present\n  Visual-field defect: +1 if present',
      components: [
        { inputKey: 'locSyncope',         label: 'Loss of consciousness or syncope',  points: -1 },
        { inputKey: 'seizure',            label: 'Seizure activity',                   points: -1 },
        { inputKey: 'facialWeakness',     label: 'Facial weakness',                    points: 1 },
        { inputKey: 'armWeakness',        label: 'Arm weakness',                       points: 1 },
        { inputKey: 'legWeakness',        label: 'Leg weakness',                       points: 1 },
        { inputKey: 'speechDisturbance',  label: 'Speech disturbance',                  points: 1 },
        { inputKey: 'visualFieldDefect',  label: 'Visual-field defect',                 points: 1 },
      ],
      bands: [
        { range: { op: '<=', value: 0 }, label: 'low probability of stroke (investigate mimics; stroke not fully excluded)' },
        { range: { op: '>',  value: 0 }, label: 'stroke likely (Nor 2005 sensitivity 93% / specificity 83%)' },
      ],
      population: 'Nor 2005: derivation in 343 consecutive patients with suspected stroke at the Royal Victoria Infirmary, Newcastle. Reference standard: WHO stroke definition adjudicated by stroke physicians.',
      units: {
        locSyncope: 'boolean', seizure: 'boolean',
        facialWeakness: 'boolean', armWeakness: 'boolean', legWeakness: 'boolean',
        speechDisturbance: 'boolean', visualFieldDefect: 'boolean',
      },
      validity: 'Adults with suspected stroke in the ED. ROSIER is specifically designed to differentiate stroke from common mimics (syncope, seizure). NOT a prehospital scale — for prehospital use, CPSS or LAMS are the appropriate instruments. A score of 0 does not fully exclude stroke; clinical judgment governs.',
      source: 'Nor AM, Davis J, Sen B, Shipsey D, Louw SJ, Dyker AG, Davis M, Ford GA. "The Recognition of Stroke in the Emergency Room (ROSIER) scale: development and validation of a stroke recognition instrument." Lancet Neurol. 2005;4(11):727-734.',
    },
  },
  race: {
    citation: 'Pérez de la Ossa N, Carrera D, Gorchs M, et al. Design and validation of a prehospital stroke scale to predict large arterial occlusion: the rapid arterial occlusion evaluation scale. Stroke. 2014;45(1):87-91.',
    specialties: ['nursing-ed', 'nursing-icu', 'nursing-general', 'emergency-medicine', 'neurology', 'paramedicine'],
    example: {
      fields: { 'ra-face': '0', 'ra-arm': '0', 'ra-leg': '0', 'ra-gaze': '0', 'ra-lang': '0' },
      expected: 'RACE 0 of 9: LVO is less likely on the RACE threshold (<5 per Pérez de la Ossa 2014). Continue stroke workup per local protocol.',
    },
    interpretation: {
      bands: [
        { range: '0-4', text: 'LVO less likely on the RACE threshold; continue stroke workup per local protocol.' },
        { range: '5-9', text: 'LVO likely (Pérez de la Ossa 2014 sensitivity 85% / specificity 68%). Consider transport to a comprehensive / thrombectomy-capable stroke center per local protocol.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Pérez de la Ossa N, et al. Stroke. 2014;45(1):87-91 (5 items: facial palsy 0-2, arm 0-2, leg 0-2, gaze 0-1, aphasia/agnosia 0-2; total 0-9; LVO threshold >=5).',
    },
    derivation: {
      formula: 'RACE = sum of 5 NIHSS-derived items (range 0-9). LVO threshold >=5 per Pérez de la Ossa 2014.\n  Facial palsy: 0 absent / 1 mild / 2 moderate-severe\n  Arm motor: 0 normal-mild / 1 moderate / 2 severe\n  Leg motor: 0 normal-mild / 1 moderate / 2 severe\n  Head / gaze deviation: 0 absent / 1 present\n  Aphasia (R hemiparesis) OR agnosia (L hemiparesis): 0 normal / 1 mild / 2 severe',
      components: [
        { inputKey: 'facialPalsy',     label: 'Facial palsy (0-2)',                                    points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
        { inputKey: 'armMotor',        label: 'Arm motor function (0-2)',                              points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
        { inputKey: 'legMotor',        label: 'Leg motor function (0-2)',                              points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
        { inputKey: 'gaze',            label: 'Head / gaze deviation (0-1)',                            points: (v) => Math.max(0, Math.min(1, Number(v) || 0)) },
        { inputKey: 'languageAgnosia', label: 'Aphasia (R hemiparesis) or agnosia (L hemiparesis) (0-2)', points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
      ],
      bands: [
        { range: [0, 4], label: 'LVO less likely (continue stroke workup per local protocol)' },
        { range: [5, 9], label: 'LVO likely (Pérez de la Ossa 2014 sensitivity 85% / specificity 68%); consider thrombectomy-capable center' },
      ],
      population: 'Pérez de la Ossa 2014: derivation in 357 prehospital stroke patients in Catalonia, Spain. Reference standard: arterial occlusion on CTA / MRA / DSA within 24 hours.',
      units: {
        facialPalsy: 'integer 0-2', armMotor: 'integer 0-2', legMotor: 'integer 0-2',
        gaze: 'integer 0-1', languageAgnosia: 'integer 0-2',
      },
      validity: 'Adults with suspected stroke in the prehospital setting. RACE is one of several LVO-triage instruments (LAMS, FAST-ED, VAN); each has trade-offs in sensitivity / specificity. RACE includes a language/agnosia item that LAMS does not — yielding better specificity for posterior-circulation strokes at the cost of slightly more complex administration. The language/agnosia item is hemiparesis-side-dependent (aphasia in R hemiparesis, agnosia in L hemiparesis). NOT designed for stroke diagnosis (use CPSS or ROSIER).',
      source: 'Pérez de la Ossa N, Carrera D, Gorchs M, Querol M, Millán M, Gomis M, Dorado L, López-Cancio E, Hernández-Pérez M, Chicharro V, Escalada X, Jiménez X, Dávalos A. "Design and validation of a prehospital stroke scale to predict large arterial occlusion: the rapid arterial occlusion evaluation scale." Stroke. 2014;45(1):87-91.',
    },
  },
  cpss: {
    citation: 'Kothari RU, Pancioli A, Liu T, Brott T, Broderick J. Cincinnati Prehospital Stroke Scale: reproducibility and validity. Ann Emerg Med. 1999;33(4):373-378.',
    specialties: ['nursing-ed', 'nursing-general', 'emergency-medicine', 'neurology', 'paramedicine', 'family-medicine'],
    example: {
      fields: { 'cp-face': '0', 'cp-arm': '0', 'cp-speech': '0' },
      expected: 'CPSS: negative screen (0 of 3 abnormal). Stroke is less likely on the CPSS items; continue clinical judgment per Kothari 1999.',
    },
    interpretation: {
      bands: [
        { range: '0/3 abnormal', text: 'Negative screen. Stroke is less likely on these three items; continue clinical judgment.' },
        { range: '>=1/3 abnormal', text: 'Positive screen. Activate the stroke pathway per local protocol; CPSS is sensitive but not specific.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Kothari RU, et al. Ann Emerg Med. 1999;33(4):373-378 (three-item bedside screen: facial droop, arm drift, abnormal speech; positive if any one is abnormal).',
    },
    derivation: {
      formula: 'CPSS = count of abnormal items across 3 binary criteria. Positive screen if ANY item is abnormal.\n  Facial droop: 0 normal / 1 abnormal (one side does not move as well)\n  Arm drift: 0 normal (both arms hold steady) / 1 abnormal (one arm drifts)\n  Abnormal speech: 0 normal / 1 abnormal (slurred, wrong words, unable)',
      components: [
        { inputKey: 'facialDroop',     label: 'Facial droop (0 normal / 1 abnormal)',           points: 1 },
        { inputKey: 'armDrift',        label: 'Arm drift (0 normal / 1 abnormal)',               points: 1 },
        { inputKey: 'abnormalSpeech',  label: 'Abnormal speech (0 normal / 1 abnormal)',         points: 1 },
      ],
      bands: [
        { range: [0, 0],                 label: 'negative screen (stroke less likely on these 3 items; continue clinical judgment)' },
        { range: { op: '>=', value: 1 }, label: 'positive screen (activate stroke pathway per local protocol)' },
      ],
      population: 'Kothari 1999: derivation in 171 prehospital and ED patients with suspected stroke. The CPSS is the most widely-used prehospital stroke screen in the US (FAST mnemonic — Face / Arm / Speech / Time — is the public-education form).',
      units: {
        facialDroop: 'integer 0 or 1', armDrift: 'integer 0 or 1',
        abnormalSpeech: 'integer 0 or 1',
      },
      validity: 'Adults with suspected stroke in the prehospital or ED setting. CPSS is highly sensitive (~88% for anterior-circulation stroke) but less specific — many positives are stroke mimics. ROSIER (a separate Sophie tile) adds explicit mimic-discrimination items. For LVO triage to a thrombectomy-capable center, LAMS or RACE (separate Sophie tiles) supersede CPSS.',
      source: 'Kothari RU, Pancioli A, Liu T, Brott T, Broderick J. "Cincinnati Prehospital Stroke Scale: reproducibility and validity." Ann Emerg Med. 1999;33(4):373-378.',
    },
  },
  lams: {
    citation: 'Llanes JN, Kidwell CS, Starkman S, et al. The Los Angeles Motor Scale (LAMS). Prehosp Emerg Care. 2004;8(1):46-50. LVO threshold: Nazliel B, Starkman S, Liebeskind DS, et al. A brief prehospital stroke severity scale identifies LVO. Stroke. 2008;39(8):2264-2267.',
    specialties: ['nursing-ed', 'nursing-icu', 'nursing-general', 'emergency-medicine', 'neurology', 'paramedicine'],
    example: {
      fields: { 'lm-face': '0', 'lm-arm': '0', 'lm-grip': '0' },
      expected: 'LAMS 0 of 5: LVO is less likely on the LAMS threshold (<4 per Nazliel 2008). Continue stroke workup per local protocol.',
    },
    interpretation: {
      bands: [
        { range: '0-3', text: 'LVO less likely on the LAMS threshold; continue stroke workup per local protocol.' },
        { range: '4-5', text: 'LVO likely (Nazliel 2008 sensitivity 81% / specificity 89%). Consider transport to a comprehensive / thrombectomy-capable stroke center per local protocol.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Llanes JN, et al. Prehosp Emerg Care. 2004;8(1):46-50 (three-item motor scale; total 0-5). Nazliel B, et al. Stroke. 2008;39(8):2264-2267 (LAMS >=4 predicts persistent LVO).',
    },
    derivation: {
      formula: 'LAMS = sum of 3 motor items (range 0-5).\n  Facial droop: 0 absent / 1 present\n  Arm drift: 0 absent / 1 drifts down / 2 falls rapidly\n  Grip strength: 0 normal / 1 weak grip / 2 no grip',
      components: [
        { inputKey: 'facialDroop',  label: 'Facial droop (0 absent / 1 present)',                 points: (v) => Math.max(0, Math.min(1, Number(v) || 0)) },
        { inputKey: 'armDrift',     label: 'Arm drift (0 absent / 1 drifts down / 2 falls rapidly)', points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
        { inputKey: 'gripStrength', label: 'Grip strength (0 normal / 1 weak / 2 no grip)',        points: (v) => Math.max(0, Math.min(2, Number(v) || 0)) },
      ],
      bands: [
        { range: [0, 3], label: 'LVO less likely (continue stroke workup per local protocol)' },
        { range: [4, 5], label: 'LVO likely (Nazliel 2008 sensitivity 81% / specificity 89%); consider thrombectomy-capable center' },
      ],
      population: 'Llanes 2004: derivation in 119 prehospital stroke patients in Los Angeles. LVO threshold validated by Nazliel 2008 in 119 patients with confirmed acute stroke (LAMS ≥4 predicts persistent LVO with sensitivity 81% / specificity 89%).',
      units: {
        facialDroop: 'integer 0-1', armDrift: 'integer 0-2', gripStrength: 'integer 0-2',
      },
      validity: 'Adults with suspected stroke in the prehospital setting. LAMS is one of several LVO-triage instruments (RACE, FAST-ED, VAN); each has trade-offs in sensitivity / specificity. LAMS is the simplest (only 3 motor items, no language assessment). NOT designed for stroke diagnosis (use CPSS or ROSIER); LAMS assumes a stroke screen is already positive. Cutoff ≥4 is the published LVO threshold; institutional protocols may differ.',
      source: 'Llanes JN, Kidwell CS, Starkman S, Leary MC, Eckstein M, Saver JL. "The Los Angeles Motor Scale (LAMS): a new measure to characterize stroke severity in the field." Prehosp Emerg Care. 2004;8(1):46-50. LVO threshold: Nazliel B, Starkman S, Liebeskind DS, et al. "A brief prehospital stroke severity scale identifies ischemic stroke patients harboring persisting large arterial occlusions." Stroke. 2008;39(8):2264-2267.',
    },
  },
  meows: {
    citation: 'Singh A, McGlennan A, England A, Simons R. A validation study of the CEMACH recommended modified early obstetric warning system (MEOWS). Anaesthesia. 2012;67(1):12-18.',
    specialties: ['nursing-ob', 'nursing-general', 'obstetrics', 'anesthesiology', 'emergency-medicine', 'family-medicine'],
    example: {
      fields: {
        'mw-rr': '16', 'mw-spo2': '98', 'mw-temp': '37.0',
        'mw-sbp': '118', 'mw-dbp': '72', 'mw-hr': '82',
        'mw-neuro': 'A', 'mw-pain': '0',
      },
      expected: 'MEOWS: no trigger (0 red, 0 yellow). Continue routine monitoring per Singh 2012.',
    },
    interpretation: {
      bands: [
        { range: 'no trigger', text: 'All parameters normal or fewer than two yellows. Continue routine maternal observations per local protocol.' },
        { range: '>=1 red OR >=2 yellow', text: 'Activate the obstetric MEOWS response per Singh 2012 (escalation to the on-call obstetric / anaesthetic team and structured re-assessment).' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Singh A, et al. Anaesthesia. 2012;67(1):12-18 (per-parameter yellow/red thresholds; trigger = any one red or two or more yellow).',
    },
    derivation: {
      formula: 'MEOWS is a TRACK-AND-TRIGGER chart, NOT an aggregate-sum score. Each vital sign is classified as normal / yellow / red per Singh 2012 Table 1; the trigger fires on any single red OR on two or more yellows.\n  Respiratory rate (per min): red <10 or >30; yellow 21-30; otherwise normal\n  SpO2 (%): red <95; otherwise normal\n  Temperature (°C): red <35 or >38; yellow 35-35.9; otherwise normal\n  Systolic BP (mmHg): red <90 or >160; yellow 90-100 or 150-160; otherwise normal\n  Diastolic BP (mmHg): red >100; yellow 90-100; otherwise normal\n  Heart rate (per min): red <40 or >120; yellow 40-50 or 100-120; otherwise normal\n  Neuro response (ACVPU/AVPU): red P or U; yellow V; otherwise normal\n  Pain score (0-3): yellow >=2; otherwise normal\nTrigger: any one red, OR any two yellows.',
      bands: [
        { range: [0, 0], label: 'no trigger (continue routine maternal observations)' },
        { range: [1, 1], label: 'trigger (>=1 red or >=2 yellow): activate the obstetric MEOWS response per Singh 2012 — escalate to the on-call obstetric / anaesthetic team and re-assess' },
      ],
      population: 'Singh 2012: validation in 676 obstetric admissions to a UK tertiary obstetric unit. Reference standard: morbidity per CEMACH (UK) criteria. Sensitivity 89%, specificity 79% for obstetric morbidity at the published trigger threshold.',
      units: {
        rr: 'breaths/min', spo2: '% (room air)', temp: '°C',
        sbp: 'mmHg (systolic)', dbp: 'mmHg (diastolic)', hr: 'beats/min',
        neuro: '"A" alert / "C" confused / "V" voice / "P" pain / "U" unresponsive',
        pain: 'integer 0-3 (0 none, 3 severe)',
      },
      validity: 'Pregnant or postpartum (≤6 weeks) adults. MEOWS is a track-and-trigger chart, not an aggregate-sum score — the Sophie derivation block ships formula-only (no `components` array) because reducing the per-parameter classifications into a single additive sum would misrepresent the trigger logic. The Sophie tile separately surfaces per-parameter flags and the OR/AND trigger evaluation. NOT validated outside pregnancy / immediate postpartum (use NEWS2 for non-obstetric adults).',
      source: 'Singh A, McGlennan A, England A, Simons R. "A validation study of the CEMACH recommended modified early obstetric warning system (MEOWS)." Anaesthesia. 2012;67(1):12-18.',
    },
  },
  sbs: {
    citation: 'Curley MAQ, Harris SK, Fraser KA, Johnson RA, Arnold JH. State Behavioral Scale (SBS): a sedation assessment instrument for infants and young children supported on mechanical ventilation. Pediatr Crit Care Med. 2006;7(2):107-114.',
    specialties: ['nursing-picu', 'nursing-nicu', 'nursing-peds', 'nursing-general', 'pediatrics', 'anesthesiology'],
    example: {
      fields: { 'sb-lvl': '0' },
      expected: 'SBS 0 (awake and able to calm): target sedation per Curley 2006.',
    },
    interpretation: {
      bands: [
        { range: '-3 / -2', text: 'Deeper than target sedation - consider lightening.' },
        { range: '-1 / 0', text: 'Target sedation in most PICU protocols.' },
        { range: '+1 / +2', text: 'Inadequate sedation or active distress - assess pain and sedation needs.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Curley MAQ, et al. Pediatr Crit Care Med. 2006;7(2):107-114 (single 6-level ordinal -3..+2).',
    },
  },

  // ---- spec-v33 §2: opioid-sedation + neonatal-pain extensions ----
  npass: {
    citation: 'Hummel P, Puchalski M, Creech SD, Weiss MG. Clinical reliability and validity of the N-PASS: neonatal pain, agitation and sedation scale with prolonged pain. J Perinatol. 2008;28(1):55-60.',
    specialties: ['nursing-nicu', 'nursing-peds', 'nursing-general', 'pediatrics', 'neonatology'],
    example: {
      fields: { 'np-cry': '0', 'np-beh': '0', 'np-fac': '0', 'np-ext': '0', 'np-vit': '0', 'np-ga': '38' },
      expected: 'N-PASS pain 0 (no significant pain); sedation 0 (no sedation) per Hummel 2008.',
    },
    interpretation: {
      bands: [
        { range: 'pain >3', text: 'Pain/agitation present - intervention indicated (Hummel 2008).' },
        { range: 'preterm <30 wk', text: 'Add 1 point per week below 30 weeks gestational age (Hummel 2008 preterm adjustment).' },
        { range: 'sedation -1 to -2', text: 'Light sedation.' },
        { range: 'sedation -3 to -4', text: 'Deep sedation.' },
        { range: 'sedation <=-5', text: 'Over-sedation - reduce or hold opioid/sedative.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Hummel P, et al. J Perinatol. 2008;28(1):55-60 (five items each -2..+2; preterm +1/week below 30 wk).',
    },
  },
  cries: {
    citation: 'Krechel SW, Bildner J. CRIES: a new neonatal postoperative pain measurement score. Initial testing of validity and reliability. Paediatr Anaesth. 1995;5(1):53-61.',
    specialties: ['nursing-nicu', 'nursing-peds', 'nursing-general', 'pediatrics', 'neonatology', 'anesthesiology'],
    example: {
      fields: { 'cr-cry': '0', 'cr-o2': '0', 'cr-vit': '0', 'cr-exp': '0', 'cr-slp': '0' },
      expected: 'CRIES 0 of 10: no significant pain per Krechel 1995.',
    },
    interpretation: {
      bands: [
        { range: '0-3', text: 'No significant pain.' },
        { range: '4-6', text: 'Moderate pain - analgesia indicated.' },
        { range: '7-10', text: 'Severe pain.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Krechel SW, Bildner J. Paediatr Anaesth. 1995;5(1):53-61 (five items each 0-2; total 0-10).',
    },
  },
  poss: {
    citation: 'Pasero C. Assessment of sedation during opioid administration for pain management. J Perianesth Nurs. 2009;24(3):186-190.',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'anesthesiology', 'pain-medicine', 'palliative-care'],
    example: {
      fields: { 'po-lvl': '1' },
      expected: 'POSS 1: awake and alert. Acceptable; opioid dosing may proceed.',
    },
    interpretation: {
      bands: [
        { range: 'S / 1 / 2', text: 'Acceptable - opioid dosing may proceed.' },
        { range: '3', text: 'Unacceptable - decrease opioid 25-50%, add non-opioid, monitor closely.' },
        { range: '4', text: 'Unacceptable - stop opioid, consider naloxone, call rapid response.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'Pasero C. J Perianesth Nurs. 2009;24(3):186-190 (single 5-level ordinal scale).',
    },
  },

  // ---- spec-v31 §2: Beers deprescribing checker ----
  'beers-check': {
    citation: 'American Geriatrics Society 2023 updated AGS Beers Criteria for potentially inappropriate medication use in older adults. J Am Geriatr Soc. 2023;71(7):2052-2081 (Tables 2, 3, and 6 cross-referenced for PIM, drug-disease, and drug-drug flags).',
    specialties: ['nursing-floor', 'nursing-icu', 'nursing-general', 'geriatrics', 'internal-medicine', 'pharmacy', 'family-medicine'],
    example: {
      fields: { 'bc-age': '78', 'bc-m-benzodiazepine': '1', 'bc-m-opioid': '1', 'bc-c-history-of-falls': '1' },
      expected: '5 Beers flags identified per AGS 2023: benzodiazepine PIM, opioid PIM, benzo + falls, opioid + falls, opioid + benzo drug-drug.',
    },
    interpretation: {
      bands: [
        { range: 'PIM flag', text: 'AGS 2023 Table 2 - avoid or use with caution; deprescribe if possible.' },
        { range: 'Drug-disease', text: 'AGS 2023 Table 3 - specific medication + comorbidity interaction; strong recommendation to avoid.' },
        { range: 'Drug-drug', text: 'AGS 2023 Table 6 - high-severity respiratory-depression / CNS-depression risk; avoid concurrent use.' },
      ],
      sourceQuoted: true,
      sourceCitation: 'AGS Beers Criteria 2023 Update. J Am Geriatr Soc. 2023;71(7):2052-2081.',
    },
  },

  // ---- spec-v6 §3.3: lab result interpreter ----
  'lab-interpret': {
    citation: 'Reference ranges per MedlinePlus, ARUP, Harrison\'s Principles of Internal Medicine (21e), ADA 2024 Standards of Care, 2018 ACC/AHA Cholesterol Guideline, and ATA 2014. Plain-English narratives by the project author.',
    example: { fields: { 'lab-a1c': '5.4' },
               expected: 'A1C 5.4% within range (4.0-5.6%).' },
  },

  // ---- Group P: Revenue cycle & utilization (spec-v52) ----
  'pa-lint': {
    citation: 'spec-v52 §4 (Prior-Auth Packet Linter). Wave 52-1b ships the dropzone + SHA-256 audit-trail spine; the rule engine, PDF/DOCX parsers, payer overlays, and DOCX report follow in subsequent waves.',
    example: { fields: {},
               expected: 'Drop one or more files on the dropzone. Each file\'s SHA-256, size, and MIME render in the results list as a deterministic per-file audit trail. The rule engine arrives in the next wave; this stub satisfies the spec-v29 §3 scope test and is the audit-trail spine of every future finding.' },
  },
};
