// Per-utility metadata: inline citation (spec-v2 5.1), test-with-example
// values (spec-v2 5.3), and primary data source for the inline source stamp
// (spec-v2 5.2).
//
// The router renders these in a uniform block above each utility body, so
// the citation, example, and source stamp are present and styled the same
// way on every view without each renderer having to remember to add them.

export const META = {
  // ---- Group A: Code lookups (data source stamps only; no formula). ----
  icd10:           { source: { dataset: 'icd10cm', label: 'CMS / NCHS ICD-10-CM' },
                     citation: 'ICD-10-CM Tabular List of Diseases and Injuries; CMS / NCHS public-domain release. Annual fiscal-year update (October).',
                     example: { fields: { q: 'I10' }, expected: 'I10 - Essential (primary) hypertension.' } },
  hcpcs:           { source: { dataset: 'hcpcs', label: 'CMS HCPCS Level II' },
                     citation: 'HCPCS Level II Code Set; CMS public-domain release. Quarterly maintenance.',
                     example: { fields: { q: 'J3490' }, expected: 'J3490 - Unclassified drugs.' } },
  cpt:             { source: { dataset: 'mpfs',  label: 'CMS Medicare Physician Fee Schedule (structural rows; no AMA descriptors)' },
                     citation: 'CPT descriptors are owned by the American Medical Association and are not bundled. Structural rows shown are from the CMS Medicare Physician Fee Schedule (PFS) public file.',
                     example: { fields: { q: '99213' }, expected: '99213 - structural PFS row; descriptor available via the AMA free public CPT lookup.' } },
  ndc:             { source: { dataset: 'ndc',   label: 'FDA National Drug Code Directory' },
                     citation: 'FDA National Drug Code Directory; FDA public-domain release. Updated daily upstream.',
                     example: { fields: { q: 'aspirin' }, expected: 'List of aspirin-containing NDCs from the bundled subset.' } },
  'pos-codes':     { source: { dataset: 'crosswalks', label: 'CMS Place of Service codes' },
                     citation: 'CMS Place of Service Code Set for Professional Claims (HIPAA-mandated, 45 CFR 162.1002).',
                     example: { fields: { q: '11' }, expected: '11 - Office.' } },
  'modifier-codes':{ source: { dataset: 'crosswalks', label: 'CMS / X12 modifier codes' },
                     citation: 'CMS HCPCS Level II modifiers and X12 N 837P/I modifier code lists.',
                     example: { fields: { q: '25' }, expected: '25 - Significant, separately identifiable E/M service by the same physician on the same day.' } },
  'revenue-codes': { source: { dataset: 'crosswalks', label: 'CMS UB-04 revenue codes' },
                     citation: 'NUBC UB-04 Revenue Code structural digits (numeric only; NUBC narrative descriptors not bundled).',
                     example: { fields: { q: '450' }, expected: '450 - Emergency room (general).' } },
  carc:            { source: { dataset: 'crosswalks', label: 'X12 Claim Adjustment Reason Codes' },
                     citation: 'X12 Claim Adjustment Reason Codes (CARC), maintained by the Code Maintenance Committee under HIPAA 45 CFR 162.',
                     example: { fields: { q: '45' }, expected: '45 - Charge exceeds fee schedule / maximum allowable or contracted/legislated fee arrangement.' } },
  rarc:            { source: { dataset: 'crosswalks', label: 'X12 Remittance Advice Remark Codes' },
                     citation: 'X12 Remittance Advice Remark Codes (RARC), maintained by CMS under HIPAA 45 CFR 162.',
                     example: { fields: { q: 'N143' }, expected: 'N143 - remark text per the bundled X12 RARC list.' } },

  // ---- Group A: v4 extensions (utilities 82-93) ----
  'hcpcs-mod':      { source: { dataset: 'hcpcs-modifiers', label: 'CMS HCPCS Level II Modifier file' },
                      citation: 'CMS HCPCS Level II modifiers; public-domain release. Modifier semantics per CMS HCPCS coding guidelines.',
                      example: { fields: { q: '25' }, expected: '25 - Significant, separately identifiable E/M service.' } },
  'pos-lookup':     { source: { dataset: 'pos-codes', label: 'CMS Place of Service codes' },
                      citation: 'CMS Place of Service Code Set for Professional Claims (HIPAA-mandated, 45 CFR 162.1002).',
                      example: { fields: { q: '11' }, expected: '11 - Office.' } },
  'tob-decode':     { source: { dataset: 'tob-codes', label: 'NUBC Type of Bill structural digits (numeric only)' },
                      citation: 'NUBC UB-04 Type of Bill, structural digits per the NUBC Official UB-04 Data Specifications (numeric only; NUBC narrative descriptors not bundled).',
                      example: { fields: { q: '0111' }, expected: 'Hospital, Inpatient (Part A), Admit Through Discharge' } },
  'rev-table':      { source: { dataset: 'revenue-codes', label: 'NUBC Revenue Code summary (numeric only)' },
                      citation: 'NUBC UB-04 Revenue Codes, structural numeric reference per the NUBC Official UB-04 Data Specifications.',
                      example: { fields: { q: '450' }, expected: '450 - Emergency room (general).' } },
  'nubc-codes':     { source: { dataset: 'nubc-special-codes', label: 'NUBC Condition / Occurrence / Value codes (numeric only)' },
                      citation: 'NUBC Condition, Occurrence, and Value codes per the NUBC Official UB-04 Data Specifications (numeric only).',
                      example: { fields: { q: '02' }, expected: 'Condition / Occurrence / Value entries matching "02".' } },
  'drg-lookup':     { source: { dataset: 'drg', label: 'CMS IPPS MS-DRG (Final Rule)' },
                      citation: 'CMS Inpatient Prospective Payment System MS-DRG definitions, current Final Rule. Severity rules per the MS-DRG Definitions Manual.',
                      example: { fields: { q: '291' }, expected: '291 - Heart failure & shock with MCC.' } },
  'apc-lookup':     { source: { dataset: 'apc', label: 'CMS OPPS APC Addendum' },
                      citation: 'CMS Outpatient Prospective Payment System Ambulatory Payment Classifications, current Addendum A/B (CMS public release).',
                      example: { fields: { q: '5012' }, expected: '5012 - Level 2 Examinations and Related Services (per current OPPS Addendum A).' } },
  'pcs-lookup':     { source: { dataset: 'icd10-pcs', label: 'CMS ICD-10-PCS' },
                      citation: 'ICD-10-PCS Tables and Index; CMS public-domain release. Annual fiscal-year update.',
                      example: { fields: { q: '0DTJ4ZZ' }, expected: '0DTJ4ZZ - Resection of appendix, percutaneous endoscopic approach.' } },
  'rxnorm-lookup':  { source: { dataset: 'rxnorm', label: 'NLM RxNorm' },
                      citation: 'RxNorm normalized clinical drug nomenclature; NLM/NIH public-domain release. Updated monthly upstream.',
                      example: { fields: { q: 'aspirin' }, expected: 'RxNorm entries matching "aspirin" from the bundled subset.' } },
  'ndc-rxnorm':     { source: { dataset: 'rxnorm', label: 'FDA NDC + NLM RxNorm crosswalk' },
                      citation: 'NDC -> RxNorm CUI crosswalk derived from the NLM RxNorm release and the FDA National Drug Code Directory.',
                      example: { fields: { q: 'aspirin' }, expected: 'NDC + RxNorm crosswalk entries matching "aspirin".' } },

  // ---- Group B: Pricing ----

  // ---- Group B: v4 extensions (utilities 94-104) ----

  // ---- Group C: Patient tools ----
  decoder:        { citation: 'Code patterns per CMS billing-code conventions: ICD-10-CM (3-7 alphanumeric, dot after 3), CPT (5 numeric), HCPCS Level II (1 letter + 4 digits), NPI (10-digit Luhn-checksum, 45 CFR 162.406).',
                    example: { fields: { bill: 'Patient bill\nDOS 2026-04-12  Office visit 99213  $185.00\nDx I10  J3490 administered  $42.00\nNPI 1234567893  POS 11' },
                               expected: 'Decoder finds 99213 (possible CPT), J3490 (HCPCS), I10 (ICD-10), POS 11, Luhn-valid NPI; total $227.00.' } },
  insurance:      { citation: 'Field naming follows the NUBC UB-04 institutional claim form and CMS-1500 professional claim (OMB-approved 0938-1197 / 0938-1197). NPI per 45 CFR 162.406.',
                    example: { fields: { memberId: 'W123456789', groupId: '0001', planName: 'Gold PPO 1500', planType: 'PPO', bin: '003858', pcn: 'A4', rxGroup: 'RXANTHEM', phone: '1-800-555-0100', providerPhone: '1-800-555-0199' },
                               expected: 'Card fields populated; the worked-example panel below explains each field.' } },
  'eob-decoder':  { source: { dataset: 'crosswalks', label: 'X12 CARC and RARC code lists' },
                    citation: 'X12 Claim Adjustment Reason Codes and Remittance Advice Remark Codes, maintained under HIPAA 45 CFR 162. Plain-English summaries by the project author.',
                    example: { fields: { eob: 'Allowed: $185.00\nPlan paid: $148.00\nAdjustment: $37.00\nPatient responsibility: $37.00\nCARC 45  RARC N143' },
                               expected: 'EOB summary lists allowed, plan-paid, adjustment, patient responsibility, plus CARC 45 and RARC N143 with their definitions.' } },
  'no-surprises': { source: { dataset: 'no-surprises', label: 'CMS / HHS No Surprises Act regulatory text' },
                    citation: 'No Surprises Act, Public Health Service Act Section 2799 (added by Title I of Division BB of the Consolidated Appropriations Act, 2021); 45 CFR 149. Federal protections; state surprise-billing laws may add to (not displace) the federal floor.',
                    example: { fields: { 'nsa-sel': 'er-out-of-network' }, expected: 'Out-of-network emergency care: covered by the No Surprises Act per PHSA Section 2799A-1.' } },

  // ---- Group C: v4 extensions (utilities 105-114) ----
  'insurance-card':      { source: null,
                           citation: 'Original plain-English explanations by the project author. No external lookup is performed.',
                           example: { fields: { 'ic-member': 'W123456789', 'ic-group': '0001', 'ic-plan': 'Gold PPO 1500', 'ic-type': 'PPO', 'ic-bin': '003858', 'ic-pcn': 'A4', 'ic-rxgroup': 'RXANTHEM', 'ic-csphone': '1-800-555-0100', 'ic-provphone': '1-800-555-0199' },
                                      expected: 'Print-ready insurance reference card lists each field with its plain-English explanation.' } },
  'abn-explainer':       { source: null,
                           citation: 'CMS Form CMS-R-131 (Advance Beneficiary Notice). Plain-English summaries by the project author; CMS publishes the authoritative form and instructions.' },
  'msn-decoder':         { citation: 'CMS Medicare Summary Notice format. Reference parsing only.',
                           example: { fields: { msn: 'Medicare-approved amount: $185.00\nMedicare paid: $148.00\nProvider adjustment: $37.00\nMaximum you may be billed: $0.00' },
                                      expected: 'MSN summary shows approved $185.00, paid $148.00, adjustment $37.00, max billable $0.00.' } },
  'idr-eligibility':     { citation: 'No Surprises Act (Public Health Service Act Section 2799), 45 CFR 149. Federal IDR scope; does not displace state IDR processes.' },
  'appeal-letter':       { citation: 'Educational template. Plan-specific appeal procedures govern. Not legal advice.',
                           example: { fields: { 'al-pt': 'Jane Doe', 'al-id': 'W123456789', 'al-dos': '2026-04-12', 'al-prov': 'Acme Internal Medicine', 'al-svc': 'MRI lumbar spine without contrast', 'al-dx': 'M54.5', 'al-plan': 'Anthem Gold PPO', 'al-denial': '2026-04-25', 'al-reason': 'Not medically necessary' },
                                      expected: 'Click "Build printable letter" to render an appeal letter addressed to the plan with the denial reason quoted back.' } },
  'hipaa-roa':           { citation: 'HIPAA Privacy Rule, 45 CFR 164.524. Right of Access; 30-day response requirement with one 30-day extension; cost-based fee cap.',
                           example: { fields: { 'roa-pt': 'Jane Doe', 'roa-dob': '1985-03-12', 'roa-fac': 'Acme Internal Medicine', 'roa-range': '2024-01-01 to 2025-01-01', 'roa-recs': 'Office visit notes, lab results, imaging reports', 'roa-fmt': 'electronic (PDF)', 'roa-deliver': 'patient portal' },
                                      expected: 'Click "Build printable request" to render a 45 CFR 164.524 letter citing the 30-day response requirement and the cost-based fee cap.' } },
  'birthday-rule':       { citation: 'Standard insurance industry rule for two-parent dependent coverage; some self-funded ERISA plans interpret differently. Reference only.',
                           example: { fields: { 'br-a-dob': '1985-03-12', 'br-b-dob': '1986-08-21', 'br-cust': 'shared', 'br-court': '' },
                                      expected: 'Primary: Parent A. Reason: earlier birthday in the calendar year (March 12 < August 21).' } },
  'cobra-timeline':      { citation: 'Consolidated Omnibus Budget Reconciliation Act, 29 USC 1162: 18-month standard maximum; 29-month disability extension; 36 months for divorce, death, Medicare entitlement of covered employee.',
                           example: { fields: { 'cb-date': '2026-03-15', 'cb-type': 'job-loss-involuntary' },
                                      expected: '18-month max: election deadline 2026-05-14; first payment 45 days after election; coverage end 2027-09-15.' } },
  'medicare-enrollment': { citation: 'Medicare IEP (7 months around 65th birthday); GEP (Jan 1 - Mar 31 annually); Part B SEP for loss of employer coverage (8 months). Reference only.',
                           example: { fields: { 'me-dob': '1961-08-15', 'me-scenario': '' },
                                      expected: 'IEP 2026-05-01 through 2026-11-30 (covers 65th birthday in August 2026); GEP each Jan 1 - Mar 31; Part D LEP applies if Part D enrollment is delayed.' } },
  'aca-sep':             { citation: '45 CFR 155.420. SEP windows and qualifying life events under the ACA.',
                           example: { fields: { 'sep-evt': 'loss-of-coverage' },
                                      expected: 'Loss of qualifying coverage: 60-day window before AND after the event; coverage starts the first of the month after plan selection.' } },

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
                         example: { fields: { scr: '1.0', age: '60', sex: 'F' }, expected: 'eGFR ~91 mL/min/1.73m^2' } },
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
  'high-alert':        { citation: 'Identities are factual. ISMP maintains the authoritative high-alert medication list and formatting.' },

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
  'iv-to-po':       { source: { dataset: 'iv-to-po', label: 'FDA labels (subset)' },
                      citation: 'Bioavailability values per FDA labeling. Verify against current institutional formulary.' },

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
                 } },
  apgar:       { citation: 'Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.',
                 example: { fields: { appearance: '2', pulse: '2', grimace: '2', activity: '2', respiration: '2' }, expected: 'APGAR 10' } },
  'peds-vitals': { source: { dataset: 'clinical', label: 'PALS reference values; AHA' },
                   citation: 'AHA Pediatric Advanced Life Support (PALS) reference vital-sign ranges by age band. Numeric reference only.',
                   example: { fields: { pv: '1-3 yrs' }, expected: 'Toddler heart-rate, respiratory-rate, and SBP ranges from the PALS reference table.' } },
  'lab-ranges':  { source: { dataset: 'clinical', label: 'Common adult reference ranges; lab-specific ranges supersede.' },
                   citation: 'Common adult laboratory reference ranges per NIH MedlinePlus and Harrison\'s Principles of Internal Medicine (21e). Lab-specific reference ranges supersede.',
                   example: { fields: { q: 'sodium' }, expected: 'Sodium reference range (mEq/L) from the bundled adult lab table.' } },
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
                 } },
  asa:         { source: { dataset: 'clinical', label: 'ASA Physical Status Classification; original short summaries by project author.' },
                 citation: 'American Society of Anesthesiologists Physical Status Classification System; ASA House of Delegates approved 2014, last amended December 13, 2020. Class names are ASA-defined; short plain-English summaries are by the project author.' },
  mallampati:  { citation: 'Mallampati SR, et al. A clinical sign to predict difficult tracheal intubation. Can Anaesth Soc J. 1985;32(4):429-434.' },
  beers:       { citation: 'AGS Beers Criteria. Drug-condition pairs are clinical facts; original brief notes by project author. AGS publishes the authoritative formatted list.',
                 example: { fields: { q: 'benzodiazepine' }, expected: 'Beers Criteria entries matching "benzodiazepine" (avoid in older adults; risk of falls / cognitive impairment).' } },

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
                      } },
  psi:              { citation: 'Fine MJ, et al. Pneumonia Severity Index. NEJM. 1997;336(4):243-250. Reference points-only implementation; class V advisory.',
                      example: { fields: { 'ps-age': '70', 'ps-sex': 'M', 'ps-rr': '1' },
                                 expected: 'PSI ~90 - Class III (short observation typically considered).' } },
  'qsofa-sofa':     { citation: 'Singer M, et al. Sepsis-3 (qSOFA). JAMA. 2016;315(8):801-810. Vincent JL, et al. SOFA. Intensive Care Med. 1996;22(7):707-710.',
                      example: { fields: { 'q-rr': '1', 'q-am': '1', 's-resp': '1', 's-cv': '1' },
                                 expected: 'qSOFA 2 (high risk for poor outcome); SOFA 2.' } },
  'meld-childpugh': { citation: 'Kim WR, et al. MELD-3.0. Gastroenterology. 2021;161(6):1887-1895. Pugh RN, et al. Br J Surg. 1973;60(8):646-649 (Child-Pugh).',
                      example: { fields: { 'm-bili': '2.0', 'm-inr': '1.5', 'm-cr': '1.3', 'm-na': '135', 'm-alb': '3.0', 'm-sex': 'M', 'cp-asc': 'mild', 'cp-enc': 'none' },
                                 expected: 'MELD-3.0 ~17; Child-Pugh ~7 (Class B).' } },
  'ranson-bisap':   { citation: 'Ranson JH, et al. Surg Gynecol Obstet. 1974;139(1):69-81. Wu BU, et al. BISAP. Gut. 2008;57(12):1698-1703.',
                      example: { fields: { 'r-age': '1', 'r-wbc': '1', 'b-bun': '1', 'b-age': '1' },
                                 expected: 'Ranson 2; BISAP 2 (intermediate severity).' } },

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
                          } },
  'wells-dvt-caprini':  { citation: 'Wells PS, et al. Lancet. 1997;350(9094):1795-1798 (Wells DVT). Caprini JA. Dis Mon. 2005;51(2-3):70-78.',
                          example: { fields: { 'wd-tender': '1', 'wd-leg': '1', 'wd-calf': '1', 'cap-pts': '5' },
                                     expected: 'Wells DVT 3 (High); Caprini 5 (high VTE risk).' } },
  bishop:               { citation: 'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266-268.',
                          example: { fields: { 'bp-d': '3', 'bp-e': '60', 'bp-s': '-1', 'bp-c': 'medium', 'bp-p': 'anterior' },
                                     expected: 'Bishop 9 (favorable; induction success likely).' } },
  'alvarado-pas':       { citation: 'Alvarado A. Ann Emerg Med. 1986;15(5):557-564 (MANTRELS). Samuel M. J Pediatr Surg. 2002;37(6):877-881 (PAS).',
                          example: { fields: { 'a-mig': '1', 'a-anx': '1', 'a-rlq': '1', 'a-wbc': '1', 'p-rlq': '1', 'p-mig': '1', 'p-wbc': '1' },
                                     expected: 'Alvarado 6 (compatible with appendicitis); PAS 5 (intermediate).' } },
  mrs:                  { citation: 'Modified Rankin Scale; UK-TIA Study Group 1988. Reference instrument; not auto-computed.' },
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
                          } },
  auditc:               { citation: 'Bush K, et al. AUDIT-C. Arch Intern Med. 1998;158(16):1789-1795.' },
  cage:                 { citation: 'Ewing JA. CAGE Questionnaire. JAMA. 1984;252(14):1905-1907.' },
  epds:                 { citation: 'Cox JL, Holden JM, Sagovsky R. EPDS. Br J Psychiatry. 1987;150:782-786.' },
  'mini-cog':           { citation: 'Borson S, et al. Mini-Cog. Int J Geriatr Psychiatry. 2000;15(11):1021-1027.',
                          example: { fields: { 'mc-w': '2', 'mc-clock': '1' },
                                     expected: 'Mini-Cog 4/5 - Negative for cognitive impairment screen.' } },

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
  'adult-arrest-ref': { citation: 'AHA ECC 2020 guidelines. Numeric reference only; flowcharts not reproduced.',
                        source: { dataset: 'aha-reference', label: 'AHA ECC numeric reference (no flowcharts)' } },
  'peds-arrest-ref':  { citation: 'AHA ECC 2020 guidelines. Numeric reference only; flowcharts not reproduced.',
                        source: { dataset: 'aha-reference', label: 'AHA ECC numeric reference (no flowcharts)' } },
  defib:              { citation: 'AHA ECC 2020 guidelines defibrillation energy ranges (numeric only).',
                        source: { dataset: 'aha-reference', label: 'AHA ECC numeric reference (no flowcharts)' },
                        example: { fields: { 'df-pop': 'adult', 'df-scn': 'vf-pvt', 'df-wave': 'biphasic', 'df-n': '1' }, expected: 'Adult biphasic VF/pVT: 120-200 J' } },
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
  hypothermia:        { citation: 'Wilderness Medical Society guidelines and standard medical literature.',
                        source: { dataset: 'environmental', label: 'Environmental staging reference' } },
  'heat-illness':     { citation: 'Wilderness Medical Society guidelines and standard medical literature.',
                        source: { dataset: 'environmental', label: 'Environmental staging reference' } },
  'peds-ett':         { citation: 'Cuffed: age/4 + 3.5 mm. Uncuffed: age/4 + 4 mm. Depth at the lip = 3 x tube size in cm. Standard pediatric airway formulas; verify against bedside assessment.',
                        example: { fields: { 'pet-age': '4', 'pet-cuffed': 'uncuffed' }, expected: 'Tube 5.0 mm uncuffed, depth 15 cm.' } },
  toxidromes:         { citation: 'CDC ATSDR toxicological profiles and standard medical toxicology references; original brief notes by the project author.',
                        source: { dataset: 'toxidromes', label: 'ATSDR / CDC toxidrome reference' } },
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
  'dot-erg':        { source: { dataset: 'dot-erg', label: 'PHMSA Emergency Response Guidebook' },
                      citation: 'US DOT PHMSA Emergency Response Guidebook (current edition). UN/NA-number lookups; isolation and protective-action distances per ERG green pages.' },
  'niosh-pg':       { source: { dataset: 'niosh-pg', label: 'CDC NIOSH Pocket Guide' },
                      citation: 'CDC NIOSH Pocket Guide to Chemical Hazards (NIOSH Publication 2005-149, current online release). Exposure limits, IDLH values, and PPE class per NIOSH.' },
  'cpr-numeric':    { source: { dataset: 'cpr-aha-numeric', label: 'AHA CPR/ECC numeric reference (numeric facts only)' },
                      citation: 'AHA CPR/ECC guidelines, current edition. Numeric values only; flowcharts not reproduced.' },
  tccc:             { source: { dataset: 'tccc', label: 'CoTCCC public guidelines' },
                      citation: 'Committee on Tactical Combat Casualty Care, public guidelines.' },
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

  // ---- Group K (NEW): Lab Reference (utilities 181-184) ----
  'lab-adult':      { source: { dataset: 'lab-ranges-adult', label: 'NIH MedlinePlus adult lab reference ranges' },
                      citation: 'Reference ranges vary by lab; lab-specific ranges supersede.' },
  'lab-peds':       { source: { dataset: 'lab-ranges-peds', label: 'Pediatric lab reference ranges by age band' },
                      citation: 'Pediatric laboratory reference ranges by age band per Nelson Textbook of Pediatrics (current edition) and Harriet Lane Handbook (current edition). Lab-specific reference ranges supersede.' },
  'tdm-levels':     { source: { dataset: 'therapeutic-drug-levels', label: 'FDA labels via DailyMed - therapeutic drug levels' },
                      citation: 'Therapeutic drug monitoring target/peak/trough ranges per FDA-approved labeling (DailyMed) and standard pharmacology references. Institutional protocols and assay-specific ranges supersede.' },
  'tox-levels':     { source: { dataset: 'tox-levels', label: 'NLM WISER toxicology level reference' },
                      citation: 'Levels are stated as "associated with clinical toxicity per published references" - not treatment recommendations.' },

  // ---- Group L (NEW): Forms & Numbers Literacy (utilities 185-187) ----
  cms1500:          { source: { dataset: 'cms-1500-fields', label: 'CMS-1500 form (project-original plain-English summaries)' },
                      citation: 'CMS-1500 (02/12) Health Insurance Claim Form, OMB Control No. 0938-1197. The 02/12 revision is the current paper form in use since April 1, 2014; field labels are CMS-defined; plain-English summaries are by the project author.' },
  ub04:             { source: { dataset: 'ub04-fields', label: 'UB-04 form (project-original plain-English summaries)' },
                      citation: 'NUBC UB-04 (CMS-1450) institutional claim form, per the NUBC Official UB-04 Data Specifications. Field labels are NUBC-defined; plain-English summaries are by the project author.' },
  'eob-glossary':   { source: { dataset: 'eob-glossary', label: 'Project-original EOB jargon glossary' },
                      citation: 'Plain-English Explanation of Benefits glossary. Underlying terms map to X12 835 remittance fields and CMS / state EOB content requirements; original glossary entries by the project author.' },

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

  // ---- Group O (NEW): Patient Safety (utilities 195-197) ----
  'high-alert-card':   { citation: 'Identities are factual. ISMP maintains the authoritative formatted high-alert medication list.' },

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
  'rcri':               { citation: 'Lee TH et al. Revised Cardiac Risk Index. Circulation 1999;100:1043-1049.',
                          example: { fields: { highRiskSurgery: '1', ischemicHeartDisease: '1' },
                                     expected: 'RCRI 2 factors -> ~6.6% major cardiac event risk (Class III per Lee 1999).' } },
  'pews':               { citation: 'Monaghan A. Detecting and managing deterioration in children. Paediatr Nurs 2005;17:32-35.',
                          example: { fields: { Behavior: '2', Cardiovascular: '2', Respiratory: '1' },
                                     expected: 'Total 5 - Escalate: bedside provider review.' } },
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
    specialties: ['critical-care', 'nursing-general', 'anesthesiology', 'psychiatry'],
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
    specialties: ['critical-care', 'nursing-general', 'psychiatry'],
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
    specialties: ['critical-care', 'nursing-general'],
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
  },

  // ---- spec-v13 §3.3 wave 13-3: ICU pain bundle ----
  cpot: {
    citation: 'Gelinas C, Fillion L, Puntillo KA, Viens C, Fortier M. Validation of the Critical-Care Pain Observation Tool in adult patients. Am J Crit Care. 2006;15(4):420-427.',
    specialties: ['critical-care', 'nursing-general'],
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
  },
  bps: {
    citation: 'Payen JF, Bru O, Bosson JL, et al. Assessing pain in critically ill sedated patients by using a behavioral pain scale. Crit Care Med. 2001;29(12):2258-2263.',
    specialties: ['critical-care', 'nursing-general'],
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
      expected: 'HACOR 3: not in the Duan 2017 high-risk band (cutoff >5).',
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

  // ---- spec-v6 §3.3: lab result interpreter ----
  'lab-interpret': {
    citation: 'Reference ranges per MedlinePlus, ARUP, Harrison\'s Principles of Internal Medicine (21e), ADA 2024 Standards of Care, 2018 ACC/AHA Cholesterol Guideline, and ATA 2014. Plain-English narratives by the project author.',
    example: { fields: { 'lab-a1c': '5.4' },
               expected: 'A1C 5.4% within range (4.0-5.6%).' },
  },
};
