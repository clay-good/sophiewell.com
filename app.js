// sophiewell.com - vanilla ES module application.
// All DOM updates use textContent or createElement. Raw HTML insertion is forbidden.

import { renderers as RA } from './views/group-a.js';
import { renderers as RC } from './views/group-c.js';
import { renderers as RE } from './views/group-e.js';
import { renderers as RF } from './views/group-f.js';
import { renderers as RG } from './views/group-g.js';
import { renderers as RH } from './views/group-h.js';
import { renderers as RI } from './views/group-i.js';
import { renderers as RJ } from './views/group-j.js';
import { renderers as RKLMNO } from './views/group-klmno.js';
import { renderers as RV5 } from './views/group-v5.js';
import { renderers as RV6 } from './views/group-v6.js';
import { META } from './lib/meta.js';
import { fetchJson } from './lib/data.js';
import { copyButton } from './lib/clipboard.js';
import { installKeyboard } from './lib/keyboard.js';
import { parseHash, buildHash, patchHash } from './lib/hash.js';
import { matchSynonym, loadSynonyms } from './lib/synonyms.js';
import { resolvePrompt } from './lib/prompt.js';
// The patient-artifact dropzone UI (spec-v7 §3.1) was removed when Sophie
// pivoted to a clinical-staff-first wedge. lib/artifact-detect.js,
// lib/artifact-route.js, and lib/artifact-handoff.js remain in the tree
// (still tested) in case the dropzone is reintroduced behind a future
// clinical-input surface; app.js no longer wires them.

const RENDERERS = { ...RA, ...RC, ...RE, ...RF, ...RG, ...RH, ...RI, ...RJ, ...RKLMNO, ...RV5, ...RV6 };

// ----- Utility registry ----------------------------------------------------
// Source of truth for routes, names, group, audiences, and clinical flag.
// Group letters: A Codes, B Pricing, C Patient Tools, D Provider Lookup,
// E Clinical Math, F Medication, G Scoring, H Workflow.

const UTILITIES = [
  // Group A: Code Lookup
  { id: 'icd10', name: 'ICD-10-CM Code Lookup', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'hcpcs', name: 'HCPCS Level II Code Lookup', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'cpt', name: 'CPT Code Reference', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'ndc', name: 'NDC Drug Code Lookup', group: 'A', audiences: ['patients', 'billers', 'clinicians', 'educators'], clinical: false },
  { id: 'pos-codes', name: 'Place of Service Code Lookup', group: 'A', audiences: ['billers'], clinical: false },
  { id: 'modifier-codes', name: 'Modifier Code Lookup', group: 'A', audiences: ['billers'], clinical: false },
  { id: 'revenue-codes', name: 'Revenue Code Lookup', group: 'A', audiences: ['billers'], clinical: false },
  { id: 'carc', name: 'Claim Adjustment Reason Code Lookup', group: 'A', audiences: ['patients', 'billers'], clinical: false },
  { id: 'rarc', name: 'Remittance Advice Remark Code Lookup', group: 'A', audiences: ['patients', 'billers'], clinical: false },
  // Group A: v4 extensions (utilities 82-93)
  { id: 'hcpcs-mod', name: 'HCPCS Modifier Lookup', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'pos-lookup', name: 'Place of Service Code Lookup (CMS)', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'tob-decode', name: 'Type of Bill Decoder', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'rev-table', name: 'Revenue Code Table (NUBC summary)', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'nubc-codes', name: 'Condition / Occurrence / Value Code Reference', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'drg-lookup', name: 'MS-DRG Lookup', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'apc-lookup', name: 'APC / HOPPS Lookup', group: 'A', audiences: ['billers', 'educators'], clinical: false },
  { id: 'pcs-lookup', name: 'ICD-10-PCS Lookup', group: 'A', audiences: ['billers', 'clinicians', 'educators'], clinical: false },
  { id: 'rxnorm-lookup', name: 'RxNorm Lookup', group: 'A', audiences: ['clinicians', 'billers', 'educators'], clinical: false },
  { id: 'ndc-rxnorm', name: 'NDC to RxNorm Crosswalk', group: 'A', audiences: ['clinicians', 'billers', 'educators'], clinical: false },
  // Group B: Pricing and Cost Reference
  // Group B: v4 extensions (utilities 94-104)
  // Group C: Patient Bill and Insurance Tools
  { id: 'decoder', name: 'Medical Bill Decoder', group: 'C', audiences: ['patients', 'billers'], clinical: false },
  { id: 'insurance', name: 'Insurance Card Decoder', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'eob-decoder', name: 'Explanation of Benefits Decoder', group: 'C', audiences: ['patients', 'billers'], clinical: false },
  { id: 'no-surprises', name: 'No Surprises Act Eligibility Checker', group: 'C', audiences: ['patients'], clinical: false },
  // Group C: v4 extensions (utilities 105-114)
  { id: 'insurance-card', name: 'Insurance Card Decoder (printable)', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'abn-explainer', name: 'ABN (CMS-R-131) Explainer', group: 'C', audiences: ['patients', 'educators'], clinical: false },
  { id: 'msn-decoder', name: 'Medicare Summary Notice Decoder', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'idr-eligibility', name: 'IDR Eligibility Checker (NSA)', group: 'C', audiences: ['patients', 'billers'], clinical: false },
  { id: 'appeal-letter', name: 'Appeal Letter Generator', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'hipaa-roa', name: 'HIPAA Right of Access Request Generator', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'birthday-rule', name: 'Birthday Rule Resolver', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'cobra-timeline', name: 'COBRA Timeline', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'medicare-enrollment', name: 'Medicare Enrollment Period Checker', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'aca-sep', name: 'ACA SEP Eligibility Checker', group: 'C', audiences: ['patients'], clinical: false },
  // Group D: Provider and Plan Lookup
  // Group D: v4 extensions (utilities 115-116)
  // Group E: Clinical Math and Conversions
  { id: 'unit-converter', name: 'Unit Converter', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bmi', name: 'BMI Calculator', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  { id: 'bsa', name: 'Body Surface Area', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'map', name: 'Mean Arterial Pressure', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'anion-gap', name: 'Anion Gap', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'corrected-calcium', name: 'Corrected Calcium for Albumin', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corrected-sodium', name: 'Corrected Sodium for Hyperglycemia', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'aa-gradient', name: 'A-a Gradient', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'egfr', name: 'Estimated GFR (CKD-EPI 2021)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cockcroft-gault', name: 'Cockcroft-Gault Creatinine Clearance', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pack-years', name: 'Pack-Years', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  { id: 'due-date', name: 'Naegele Pregnancy Due Date', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  { id: 'qtc', name: 'QTc Correction', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pf-ratio', name: 'P/F Ratio', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // Group E: v4 extensions (utilities 117-128)
  { id: 'anion-gap-dd', name: 'Anion Gap & Delta-Delta', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corrected-ca-na', name: 'Corrected Calcium / Sodium Suite', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'osmolal-gap', name: 'Osmolal Gap', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aa-pf-suite', name: 'A-a Gradient & P/F Suite', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'winters', name: 'Winters Formula (expected PaCO2)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'shock-index', name: 'MAP / Pulse Pressure / Shock Index', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'bw-bsa-suite', name: 'Body Weight & BSA Suite (IBW / AdjBW / BSA)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'egfr-suite', name: 'eGFR Suite (CKD-EPI 2021 / MDRD / CG)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'fena-feurea', name: 'FENa / FEUrea', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'maint-fluids', name: 'Maintenance Fluids (4-2-1)', group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'qtc-suite', name: 'QTc Suite (Bazett / Fridericia / Framingham / Hodges)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'preg-dating', name: 'Pregnancy Dating (LMP / CRL / EDD)', group: 'E', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
  // Group F: Medication and Infusion
  { id: 'drip-rate', name: 'Drip Rate Calculator', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'weight-dose', name: 'Weight-Based Dose', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'conc-rate', name: 'Concentration-to-Rate', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-dose', name: 'Pediatric Dose Safety Bounds', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'insulin-drip', name: 'Insulin Drip Math', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'anticoag-reversal', name: 'Anticoagulation Reversal Reference', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'high-alert', name: 'High-Alert Medication Reference', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // Group F: v4 extensions (utilities 129-135)
  { id: 'opioid-mme', name: 'Opioid MME Calculator (CDC 2022)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'steroid-equiv', name: 'Steroid Equivalence Converter', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'benzo-equiv', name: 'Benzodiazepine Equivalence (Ashton)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'abx-renal', name: 'Antibiotic Renal Dose Adjustment', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vasopressor', name: 'Vasopressor Dose to Rate Calculator', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'tpn-macro', name: 'TPN Macronutrient Calculator', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iv-to-po', name: 'IV-to-PO Conversion Reference', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // Group G: Clinical Scoring and Reference
  { id: 'gcs', name: 'Glasgow Coma Scale', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'apgar', name: 'APGAR', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-vitals', name: 'Pediatric Vital Signs by Age', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'lab-ranges', name: 'Common Lab Reference Ranges', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'abg', name: 'ABG Interpretation Walkthrough', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'wells-pe', name: 'Wells Score for PE', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'wells-dvt', name: 'Wells Score for DVT', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'chads', name: 'CHA2DS2-VASc', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hasbled', name: 'HAS-BLED', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nihss', name: 'NIH Stroke Scale', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'asa', name: 'ASA Physical Status Reference', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mallampati', name: 'Mallampati Class Reference', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'beers', name: 'Beers Criteria Drug-Condition Lookup', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // Group G: v4 extensions waves 1-2 (utilities 136-145)
  { id: 'timi', name: 'TIMI Risk Score (UA / NSTEMI)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'grace', name: 'GRACE Score (in-hospital mortality)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'heart', name: 'HEART Score (chest pain)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'perc', name: 'PERC Rule (PE rule-out)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wells-pe-geneva', name: 'Wells PE & Revised Geneva (PE)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'curb-65', name: 'CURB-65', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'psi', name: 'PSI / PORT (pneumonia severity)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'qsofa-sofa', name: 'qSOFA / SOFA', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'meld-childpugh', name: 'MELD-3.0 / Child-Pugh', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ranson-bisap', name: 'Ranson / BISAP (acute pancreatitis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // Group G: v4 extensions waves 3-4 (utilities 146-156)
  { id: 'centor', name: 'Centor / McIsaac (strep pharyngitis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wells-dvt-caprini', name: 'Wells DVT and Caprini VTE Risk', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bishop', name: 'Bishop Score (cervical favorability)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'alvarado-pas', name: 'Alvarado / Pediatric Appendicitis Score', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mrs', name: 'Modified Rankin Scale Reference', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'phq9', name: 'PHQ-9 Depression Screener', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'gad7', name: 'GAD-7 Anxiety Screener', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'auditc', name: 'AUDIT-C Alcohol Screener', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'cage', name: 'CAGE Alcohol Screener', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'epds', name: 'Edinburgh Postnatal Depression Scale', group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'mini-cog', name: 'Mini-Cog Cognitive Screener', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // Group G: v4 extensions waves 5-6 (utilities 157-160)
  { id: 'ciwa', name: 'CIWA-Ar (alcohol withdrawal)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cows', name: 'COWS (opioid withdrawal)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ascvd', name: 'ASCVD 10-year Risk (PCE)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'prevent', name: 'PREVENT 2023 10-year CVD Risk (race-free)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // Group H: Preparation and Workflow
  { id: 'prep', name: 'Appointment Prep Question Generator', group: 'H', audiences: ['patients'], clinical: false },
  { id: 'prior-auth', name: 'Prior Authorization Checklist Generator', group: 'H', audiences: ['billers'], clinical: false },
  // Group H: v4 extensions (utilities 161-165)
  { id: 'hipaa-auth', name: 'HIPAA Authorization Form Generator', group: 'H', audiences: ['patients'], clinical: false },
  { id: 'roi', name: 'ROI Request Generator', group: 'H', audiences: ['patients'], clinical: false },
  { id: 'discharge-instr', name: 'Discharge Instruction Template', group: 'H', audiences: ['clinicians', 'patients'], clinical: false },
  { id: 'specialty-visit', name: 'Specialty-Visit Question Generator', group: 'H', audiences: ['patients'], clinical: false },
  { id: 'wallet-card', name: 'Medication Wallet Card Generator', group: 'H', audiences: ['patients'], clinical: false },
  // Group I: Field Medicine
  { id: 'peds-weight-dose', name: 'Pediatric Weight-to-Dose Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'adult-arrest-ref', name: 'Adult Cardiac Arrest Drug Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-arrest-ref',  name: 'Pediatric Cardiac Arrest Drug Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'defib',            name: 'Defibrillation Energy Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'cincinnati',       name: 'Cincinnati Prehospital Stroke Scale', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'fast',             name: 'FAST and BE-FAST Stroke Assessment', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'field-triage',     name: 'Trauma Triage Decision Tool (CDC)', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'start-triage',     name: 'START Adult MCI Triage', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'jumpstart-triage', name: 'JumpSTART Pediatric MCI Triage', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'bsa_burn',         name: 'Burn Surface Area Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'burn-fluid',       name: 'Burn Fluid Resuscitation Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'hypothermia',      name: 'Hypothermia Staging Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'heat-illness',     name: 'Heat Illness Staging Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-ett',         name: 'Pediatric ETT Size Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'toxidromes',       name: 'Toxidrome Reference', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'naloxone',         name: 'Naloxone Dosing Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field', 'patients'], clinical: true },
  { id: 'ems-doc',          name: 'EMS Documentation Helper', group: 'I', audiences: ['clinicians', 'field'], clinical: false },
  // Group I: v4 extensions (utilities 166-171)
  { id: 'nexus-cspine',     name: 'NEXUS + Canadian C-Spine', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'dot-erg',          name: 'DOT ERG Hazmat Lookup', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'niosh-pg',         name: 'NIOSH Pocket Guide Lookup', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'cpr-numeric',      name: 'CPR Numeric Reference (AHA)', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'tccc',             name: 'TCCC Tourniquet & Wound-Packing', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'co-cn-antidote',   name: 'CO / Cyanide / Smoke-Inhalation Antidotes', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // Group J (NEW): Public Health & Travel (utilities 172-180)
  { id: 'tetanus',      name: 'Tetanus Prophylaxis Decision Tree', group: 'J', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'rabies-pep',   name: 'Rabies PEP Decision Tree', group: 'J', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'bbp-exposure', name: 'Bloodborne Pathogen Exposure Decision Tree', group: 'J', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tb-testing',   name: 'TB Testing Interpretation (TST + IGRA)', group: 'J', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sti-screening',name: 'STI Screening Interval Reference (CDC)', group: 'J', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  // Group K (NEW): Lab Reference (utilities 181-184)
  { id: 'lab-adult',   name: 'Adult Lab Reference Ranges (NIH)', group: 'K', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lab-peds',    name: 'Pediatric Lab Reference Ranges by Age Band', group: 'K', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tdm-levels',  name: 'Therapeutic Drug Levels Reference', group: 'K', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tox-levels',  name: 'Toxicology Level Reference', group: 'K', audiences: ['clinicians', 'educators'], clinical: true },
  // Group L (NEW): Forms & Numbers Literacy (utilities 185-187)
  { id: 'cms1500',       name: 'CMS-1500 Field-by-Field Decoder', group: 'L', audiences: ['patients', 'billers', 'educators'], clinical: false },
  { id: 'ub04',          name: 'UB-04 Form-Locator Decoder', group: 'L', audiences: ['patients', 'billers', 'educators'], clinical: false },
  { id: 'eob-glossary',  name: 'EOB Jargon Glossary', group: 'L', audiences: ['patients', 'billers', 'educators'], clinical: false },
  // Group M (NEW): Eligibility & Benefits (utilities 188-191)
  // Group N (NEW): Literacy Helpers (utilities 192-194)
  { id: 'unit-converter-v4', name: 'Universal Unit Converter (lab + vitals + basics)', group: 'N', audiences: ['patients', 'clinicians', 'educators'], clinical: false },
  { id: 'time-to-dose',      name: 'Time-to-Dose Helper', group: 'N', audiences: ['patients'], clinical: false },
  { id: 'peds-weight-conv',  name: 'Pediatric Weight Converter (lb/oz <-> kg)', group: 'N', audiences: ['patients', 'clinicians', 'educators'], clinical: false },
  // Group O (NEW): Patient Safety (utilities 195-197)
  { id: 'high-alert-card', name: 'High-Alert Medication Wallet Card (ISMP)', group: 'O', audiences: ['patients', 'clinicians', 'educators'], clinical: false },

  // spec-v5 §4: deterministic additions for the floor (T1-T17). No live data.
  { id: 'sodium-correction',  name: 'Sodium Correction Rate Planner (Adrogue-Madias)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'free-water-deficit', name: 'Free Water Deficit Calculator',                    group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iron-ganzoni',       name: 'Iron Deficit Calculator (Ganzoni)',                group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pbw-ardsnet',        name: 'Predicted Body Weight + ARDSnet Tidal Volume',     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rsbi',               name: 'Rapid Shallow Breathing Index (RSBI)',             group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lights',             name: 'Light’s Criteria (Pleural Effusion)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mentzer',            name: 'Mentzer Index (Microcytic Anemia Screen)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'saag',               name: 'SAAG (Serum-Ascites Albumin Gradient)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'r-factor',           name: 'R-Factor (Drug-Induced Liver Injury Pattern)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'kdigo-aki',          name: 'KDIGO AKI Staging',                                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sgarbossa',          name: 'Modified Sgarbossa Criteria (Smith)',              group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'rcri',               name: 'Revised Cardiac Risk Index (Lee)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pews',               name: 'Pediatric Early Warning Score (PEWS)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'em-time',            name: 'Time-Based E/M Code Selector (2021)',              group: 'A', audiences: ['billers', 'clinicians', 'educators'], clinical: false },
  { id: 'ndc-convert',        name: 'NDC 10 ↔ 11 Digit Converter',                      group: 'A', audiences: ['billers', 'clinicians', 'educators'], clinical: false },
  { id: 'avpu-gcs',           name: 'AVPU ↔ GCS Quick Reference',                       group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'sbar-template',      name: 'SBAR Handoff Template Generator',                  group: 'H', audiences: ['clinicians', 'field', 'educators'], clinical: false },

  // spec-v6 §1: deterministic additions, citing 45 CFR (HIPAA) and Figge.
  { id: 'corrected-anion-gap', name: 'Albumin-Corrected Anion Gap (Figge)',             group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'breach-clock',        name: 'HIPAA Breach 60-Day Notification Clock',          group: 'H', audiences: ['billers', 'educators'], clinical: false },
  { id: 'abcd2',               name: 'ABCD2 Score (TIA stroke risk)',                    group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },

  // spec-v12 §3.1 wave 12-1: early-warning bundle.
  { id: 'news2',               name: 'NEWS2 (National Early Warning Score 2)',           group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'mews',                name: 'MEWS (Modified Early Warning Score)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.2 wave 12-2: VTE risk & severity bundle.
  { id: 'pesi',                name: 'PESI (Pulmonary Embolism Severity Index)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'spesi',               name: 'sPESI (Simplified PESI)',                          group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'padua',               name: 'Padua Prediction Score (VTE risk in medical inpatients)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.3 wave 12-3: upper & lower GI-bleeding bundle.
  { id: 'gbs',                 name: 'Glasgow-Blatchford Bleeding Score',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rockall',             name: 'Rockall Score (upper GI bleeding)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aims65',              name: 'AIMS65 Score (upper GI bleeding mortality)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'oakland',             name: 'Oakland Score (lower GI bleeding safe discharge)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.4 wave 12-4: hepatology & liver-fibrosis bundle.
  { id: 'fib4',                name: 'FIB-4 Index for Liver Fibrosis',                   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'apri',                name: 'APRI (AST to Platelet Ratio Index)',               group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'maddrey-lille',       name: 'Maddrey DF and Lille Model (alcoholic hepatitis)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.5 wave 12-5: imaging-decision bundle.
  { id: 'cthr',                name: 'Canadian CT Head Rule',                            group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'ccsr',                name: 'Canadian C-Spine Rule',                            group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'pecarn-head',         name: 'PECARN Pediatric Head Injury Rule',                group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ottawa-ankle',        name: 'Ottawa Ankle Rules',                               group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'ottawa-sah',          name: 'Ottawa Subarachnoid Hemorrhage Rule',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.6 wave 12-6: readmission & care-transition risk.
  { id: 'hospital-score',      name: 'HOSPITAL Score for 30-Day Readmission',            group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lace',                name: 'LACE Index for 30-Day Readmission / Death',        group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.7 wave 12-7: comorbidity, frailty & performance status.
  { id: 'charlson',            name: 'Charlson Comorbidity Index (age-adjusted)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cfs',                 name: 'Clinical Frailty Scale (Rockwood)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ecog-karnofsky',      name: 'ECOG and Karnofsky Performance Status',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v12 §3.8 wave 12-8: cardiology + §3.9: critical-care.
  { id: 'killip',              name: 'Killip Classification (acute MI)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sirs',                name: 'SIRS Criteria (with Sepsis-3 context)',            group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // spec-v13 §3.1 wave 13-1: ICU mortality scoring (partial).
  { id: 'mods',                name: 'Multiple Organ Dysfunction Score (MODS)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.2 wave 13-2: sedation & delirium bundle.
  { id: 'rass',                name: 'Richmond Agitation-Sedation Scale (RASS)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sas-riker',           name: 'Riker Sedation-Agitation Scale (SAS)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cam-icu',             name: 'CAM-ICU (Confusion Assessment Method, ICU)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'icdsc',               name: 'ICDSC (Intensive Care Delirium Screening Checklist)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: '4at',                 name: '4AT Delirium Screen',                              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.3 wave 13-3: ICU pain bundle.
  { id: 'cpot',                name: 'CPOT (Critical-Care Pain Observation Tool)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bps',                 name: 'BPS (Behavioral Pain Scale)',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.4 wave 13-4: nutrition risk bundle.
  { id: 'nutric',              name: 'NUTRIC Score (nutritional risk in critically ill)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mnutric',             name: 'modified NUTRIC (IL-6 omitted)',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nrs2002',             name: 'NRS-2002 (Nutrition Risk Screening 2002)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'must-nutrition',      name: 'MUST (Malnutrition Universal Screening Tool)',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.5 wave 13-5: ventilation & lung-injury bundle.
  { id: 'rox',                 name: 'ROX Index (HFNC failure prediction)',              group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'hacor',               name: 'HACOR Score (NIV failure)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'berlin-ards',         name: 'Berlin ARDS Criteria',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lis-murray',          name: 'Murray Lung Injury Score',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lips',                name: 'Lung Injury Prediction Score (LIPS)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.6 wave 13-6: vasoactive load.
  { id: 'vis',                 name: 'Vasoactive-Inotropic Score (VIS)',                 group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v13 §3.7 wave 13-7: severe CAP triage.
  { id: 'smart-cop',           name: 'SMART-COP (CAP severity)',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'crb65',               name: 'CRB-65 (CAP severity, no BUN)',                    group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'ats-idsa-cap',        name: 'ATS/IDSA Severe CAP Criteria (2019)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'drip',                name: 'DRIP Score (drug-resistant pneumonia)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.2 wave 14-2 (partial): sleep-disordered breathing.
  { id: 'stop-bang',           name: 'STOP-BANG OSA Screen',                             group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'epworth',             name: 'Epworth Sleepiness Scale',                         group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  { id: 'berlin-osa',          name: 'Berlin Questionnaire (OSA)',                       group: 'G', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  // spec-v14 §3.3 wave 14-3 (partial): airway, PONV, recovery.
  { id: 'apfel',               name: 'Apfel Simplified PONV Score',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aldrete',             name: 'modified Aldrete Recovery Score',                  group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lemon',               name: 'LEMON Difficult Airway Predictor',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'white-song',          name: 'White-Song Fast-Track Recovery',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.4 wave 14-4: AFib bleeding alternatives.
  { id: 'atria-bleeding',      name: 'ATRIA Bleeding Score',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'orbit-bleeding',      name: 'ORBIT Bleeding Score',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hemorr2hages',        name: 'HEMORR2HAGES Bleeding Score',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.5 wave 14-5: medical-inpatient bleeding & VTE prophylaxis.
  { id: 'improve-bleeding',    name: 'IMPROVE Bleeding Risk Score',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'improve-vte',         name: 'IMPROVE VTE Risk Score',                           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.6 wave 14-6 (partial): cancer-VTE & VTE-recurrence.
  { id: 'khorana',             name: 'Khorana Cancer-VTE Score',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dash-vte',            name: 'DASH VTE-Recurrence Score',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'herdoo2',             name: 'HERDOO2 (women with unprovoked VTE)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.7 wave 14-7 (partial): HIT / DIC.
  { id: 'four-ts',             name: '4Ts Score for HIT',                                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'isth-dic',            name: 'ISTH Overt DIC Score',                             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v14 §3.8 wave 14-8 (partial): DAPT duration.
  { id: 'dapt-score',          name: 'DAPT Score (continuation)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v15 §3.1 wave 15-1 (partial): obstetrics.
  { id: 'bpp',                 name: 'Biophysical Profile (BPP)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'acog-severe-pre',     name: 'ACOG Severe-feature Preeclampsia',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hellp',               name: 'HELLP Syndrome Criteria',                          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'carpenter-coustan',   name: 'Carpenter-Coustan GDM Criteria',                   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iadpsg',              name: 'IADPSG GDM Criteria',                              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v15 §3.2 wave 15-2: pediatric febrile-infant evaluation.
  { id: 'rochester',           name: 'Rochester Criteria (febrile infant)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'philadelphia',        name: 'Philadelphia Criteria (febrile infant)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'boston-febrile',      name: 'Boston Criteria (febrile infant)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'step-by-step',        name: 'Step-by-Step Approach (febrile infant)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'yos',                 name: 'Yale Observation Scale',                           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v6 §3.3: lab result interpreter. Patient-decoder category.
  { id: 'lab-interpret',       name: 'Lab Result Interpreter',                           group: 'C', audiences: ['patients', 'clinicians', 'educators'], clinical: true },
];

const UTIL_BY_ID = new Map(UTILITIES.map((u) => [u.id, u]));

const CLINICAL_NOTICE_TEXT =
  'This is a math aid for verification. Institutional protocols and clinician judgment govern any clinical decision.';

// ----- DOM helpers ---------------------------------------------------------

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const key of Object.keys(attrs)) {
      const value = attrs[key];
      if (value === false || value === null || value === undefined) continue;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('data-')) node.setAttribute(key, value);
      else if (key.startsWith('aria-')) node.setAttribute(key, value);
      else if (key === 'href' || key === 'type' || key === 'role' || key === 'id' || key === 'for') node.setAttribute(key, value);
      else node.setAttribute(key, value);
    }
  }
  if (children) {
    for (const child of children) {
      if (child === null || child === undefined) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }
  return node;
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// ----- Filter state --------------------------------------------------------

const filterState = {
  audience: 'all',
  group: 'all',
  query: '',
};

function tileMatches(tile) {
  const group = tile.getAttribute('data-group') || '';
  const audiences = (tile.getAttribute('data-audiences') || '').split(/\s+/).filter(Boolean);
  if (filterState.group !== 'all' && group !== filterState.group) return false;
  if (filterState.audience !== 'all' && !audiences.includes(filterState.audience)) return false;
  if (filterState.query) {
    const q = filterState.query.toLowerCase();
    const text = (tile.textContent || '').toLowerCase();
    if (!text.includes(q)) return false;
  }
  return true;
}

function applyFilters() {
  const tiles = document.querySelectorAll('#tile-grid .tool-card');
  let visible = 0;
  const sectionVisible = new Map();
  tiles.forEach((tile) => {
    const show = tileMatches(tile);
    tile.hidden = !show;
    if (show) visible += 1;
    const section = tile.closest('.home-section');
    if (section) {
      sectionVisible.set(section, (sectionVisible.get(section) || 0) + (show ? 1 : 0));
    }
  });
  // Hide entire section if no cards match.
  sectionVisible.forEach((count, section) => {
    section.hidden = count === 0;
  });
  const empty = document.getElementById('empty-state');
  if (empty) empty.hidden = visible !== 0;
}

// Delegated tile click. Targets `document` so it survives the
// captureHomeSnapshot / restoreHome cloneNode cycle (which would otherwise
// strip per-element listeners). Setting location.hash triggers route().
// Guarded so this module can still be imported under Node for unit tests.
if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (!event.target || typeof event.target.closest !== 'function') return;
    // Don't swallow clicks on nested action buttons. Their own handlers
    // call stopPropagation, but if any child carries data-no-route, skip.
    const ignore = event.target.closest('[data-no-route]');
    if (ignore) return;
    const card = event.target.closest('.tool-card');
    if (!card) return;
    const id = card.getAttribute('data-tool');
    if (!id) return;
    event.preventDefault();
    // Force a route refresh even if the user clicks the card matching the
    // currently-active route.
    if (location.hash === '#' + id) {
      currentRouteId = null;
      route();
    } else {
      location.hash = '#' + id;
    }
  });
}

// spec-v11 §4.1: visible specialty / category labels. The letter is the
// legacy id retained inside UTILITIES entries so deep links keep working;
// the label is the visible name everywhere a user sees it.
const GROUP_LABELS = {
  A: 'Billing & Coding',
  C: 'Insurance & Patient Literacy',
  E: 'Clinical Math & Conversions',
  F: 'Medication & Infusion',
  G: 'Clinical Scoring & Risk',
  H: 'Workflow & Documentation',
  I: 'EMS & Field Medicine',
  J: 'Immunization & Infectious Disease',
  K: 'Reference Ranges',
  L: 'Insurance Glossary',
  M: 'State & Coverage Reference',
  N: 'Pediatrics & Neonatal',
  O: 'High-Alert & Safety',
};

function syncToggleGroupState(group, value) {
  group.querySelectorAll('.toggle').forEach((b) => {
    const active = b.getAttribute('data-value') === value;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function wireFilters() {
  const groups = document.querySelectorAll('.toggle-group');
  groups.forEach((group) => {
    const filterName = group.getAttribute('data-filter');
    group.addEventListener('click', (event) => {
      const btn = event.target.closest('.toggle');
      if (!btn) return;
      const value = btn.getAttribute('data-value');
      syncToggleGroupState(group, value);
      filterState[filterName] = value;
      // spec-v6 §4.2.2: audience selection persists in URL hash.
      if (filterName === 'audience') {
        window.history.replaceState(null, '', patchHash({ audience: value }));
      }
      applyFilters();
    });
  });

  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', () => {
      filterState.query = search.value.trim();
      applyFilters();
    });
  }

  // spec-v6 §4.2.1 + spec-v7 §3.2: task hero search with synonym routing.
  // Synonym table match is checked first (deterministic phrase lookup against
  // data/synonyms.json); if it hits, a breadcrumb explains why and Enter
  // routes to that tile. Falls through to the existing fuzzy ranker otherwise.
  // Typing in the hero opens the disclosure so users can see filtered tiles.
  const hero = document.getElementById('hero-search');
  if (hero) {
    hero.addEventListener('input', () => {
      filterState.query = hero.value.trim();
      if (filterState.query) openDisclosure();
      applyFilters();
      updateSynonymHint(hero.value);
    });
    hero.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = hero.value.trim();
        if (!q) return;
        const target = resolveQueryToTileId(q);
        if (target) {
          e.preventDefault();
          hero.value = '';
          filterState.query = '';
          applyFilters();
          updateSynonymHint('');
          location.hash = '#' + target;
        }
      } else if (e.key === 'Escape') {
        if (hero.value) {
          hero.value = '';
          filterState.query = '';
          applyFilters();
          updateSynonymHint('');
          e.preventDefault();
        }
      }
    });
  }

  // spec-v7 §3.4 + spec-v8 §4.6: disclosure defaults closed in static
  // markup. Toggle persists in the URL hash as b=open when diverged;
  // collapsed is the default and emits no key.
  const disclosure = document.getElementById('browse-disclosure');
  if (disclosure) {
    disclosure.addEventListener('toggle', () => {
      const next = disclosure.open ? 'open' : '';
      window.history.replaceState(null, '', patchHash({ browse: next }));
    });
  }
}

// spec-v7 §3.2: in-memory cache of the loaded synonym table. Empty until
// loadSynonyms() resolves at boot; matchSynonym() against an empty list
// returns null so the hero falls back to fuzzy search safely.
let SYNONYM_ENTRIES = [];

// spec-v8 §4.3: assemble the tile corpus the prompt matcher reads.
// Description text lives in the home tile-grid markup (`.tc-desc` spans);
// audiences and group come from UTILITIES; tags from META[id].tags
// (optional, defaults to empty per spec-v8 §3.2 META extension).
let TILE_CORPUS_CACHE = null;
function tileCorpus() {
  if (TILE_CORPUS_CACHE) return TILE_CORPUS_CACHE;
  const grid = typeof document !== 'undefined' ? document.getElementById('tile-grid') : null;
  const descById = new Map();
  if (grid) {
    grid.querySelectorAll('.tool-card').forEach((card) => {
      const id = card.getAttribute('data-tool');
      const desc = card.querySelector('.tc-desc');
      if (id && desc) descById.set(id, desc.textContent || '');
    });
  }
  TILE_CORPUS_CACHE = UTILITIES.map((u) => ({
    id: u.id,
    name: u.name,
    group: u.group,
    audiences: u.audiences || [],
    desc: descById.get(u.id) || '',
    tags: (META[u.id] && Array.isArray(META[u.id].tags)) ? META[u.id].tags : [],
    // spec-v11 §4.3: optional specialty tags, additive search tokens.
    specialties: (META[u.id] && Array.isArray(META[u.id].specialties)) ? META[u.id].specialties : [],
  }));
  return TILE_CORPUS_CACHE;
}

function resolveQueryToTileId(query) {
  const r = resolvePrompt(query, tileCorpus(), SYNONYM_ENTRIES, filterState.audience);
  if (r && UTIL_BY_ID && UTIL_BY_ID.get(r.tileId)) return r.tileId;
  // Defensive fallback: the legacy fuzzy ranker covers cases the v8
  // resolver intentionally rejects (e.g., score below threshold but
  // the user still hit Enter).
  const fuzzy = searchUtilities(query, 1);
  return fuzzy[0] ? fuzzy[0].id : null;
}

function updateSynonymHint(rawQuery) {
  const hint = document.getElementById('hero-synonym-hint');
  if (!hint) return;
  const q = String(rawQuery || '').trim();
  if (!q) { hint.hidden = true; clear(hint); return; }
  const m = matchSynonym(q, SYNONYM_ENTRIES, filterState.audience);
  if (!m || !UTIL_BY_ID || !UTIL_BY_ID.get(m.tile)) {
    hint.hidden = true;
    clear(hint);
    return;
  }
  const util = UTIL_BY_ID.get(m.tile);
  clear(hint);
  hint.appendChild(document.createTextNode('Matched "' + m.phrase + '" to '));
  const link = el('a', { href: '#' + util.id, class: 'synonym-link', text: util.name });
  hint.appendChild(link);
  hint.appendChild(document.createTextNode('. Press Enter to open.'));
  hint.hidden = false;
}

function openDisclosure() {
  const d = document.getElementById('browse-disclosure');
  if (d && !d.open) d.open = true;
}

// ----- Routing -------------------------------------------------------------

const HOME_VIEW_HTML_ID = 'home-view-marker';

function getMain() {
  return document.getElementById('main');
}

let homeViewSnapshot = null;

function captureHomeSnapshot() {
  const main = getMain();
  if (!main || homeViewSnapshot) return;
  homeViewSnapshot = main.cloneNode(true);
  homeViewSnapshot.id = HOME_VIEW_HTML_ID;
}

function restoreHome() {
  const main = getMain();
  if (!main || !homeViewSnapshot) return;
  clear(main);
  const fresh = homeViewSnapshot.cloneNode(true);
  while (fresh.firstChild) main.appendChild(fresh.firstChild);
  // Re-wire filters and re-apply state to the restored DOM.
  wireFilters();
  // Restore filter UI state.
  document.querySelectorAll('.toggle-group').forEach((group) => {
    const filterName = group.getAttribute('data-filter');
    syncToggleGroupState(group, filterState[filterName]);
  });
  const search = document.getElementById('search');
  if (search) search.value = filterState.query;
  const hero = document.getElementById('hero-search');
  if (hero) hero.value = filterState.query;
  // spec-v7 §3.4: restore disclosure state from the current hash on home return.
  const disclosure = document.getElementById('browse-disclosure');
  if (disclosure) disclosure.open = parseHash(window.location.hash).browse === 'open';
  // spec-v7 §3.4: keep the visible tile count in sync after a clone restore.
  const countNode = document.getElementById('browse-tile-count');
  if (countNode) countNode.textContent = String(UTILITIES.length);
  applyFilters();
  updateSynonymHint(hero ? hero.value : '');
  document.title = 'Sophie Well';
}

// spec-v2 section 4.3: hash-based calculator input state. After a tool body
// is rendered, populate inputs from `q=...` and start writing changes back.
function applyHashState(body) {
  const { state } = parseHash(window.location.hash);
  if (!state || Object.keys(state).length === 0) return;
  for (const [k, v] of Object.entries(state)) {
    const node = body.querySelector(`#${CSS.escape(k)}`) || document.getElementById(k);
    if (!node) continue;
    if (node.tagName === 'SELECT') node.value = v;
    else if (node.type === 'checkbox') node.checked = v === '1' || v === 'true';
    else node.value = v;
    const evt = node.tagName === 'SELECT' ? 'change' : (node.type === 'checkbox' ? 'change' : 'input');
    node.dispatchEvent(new Event(evt, { bubbles: true }));
  }
}

function trackHashState(body) {
  const writeState = () => {
    const state = {};
    body.querySelectorAll('input, select, textarea').forEach((node) => {
      if (!node.id) return;
      // Skip ephemeral pieces (search boxes inside lookup tools, the bill
      // textarea, free-text fields with no semantic meaning).
      if (node.tagName === 'TEXTAREA') return;
      if (node.type === 'checkbox') {
        if (node.checked) state[node.id] = '1';
      } else if (node.value !== '' && node.value != null) {
        state[node.id] = String(node.value);
      }
    });
    window.history.replaceState(null, '', patchHash({ state }));
  };
  body.addEventListener('input', writeState);
  body.addEventListener('change', writeState);
}

// spec-v9 §3.2: the meta block now renders as the per-tile References
// region below the tool body. It carries the citation, the dataset stamp
// (when present), a "Reset to example" link (when an example is defined),
// and the universal "Copy all" affordance.
function renderMetaBlock(util) {
  const meta = META[util.id];
  if (!meta) return null;
  const block = el('section', { class: 'tool-meta', 'aria-label': 'References' });

  if (meta.citation) {
    block.appendChild(el('p', { class: 'citation', text: `Citation: ${meta.citation}` }));
  }

  // spec-v11 §5: optional per-band `interpretation` block. Renders below
  // the citation under a mandatory "Per source:" header so every word
  // shown is the source's, not Sophie's.
  if (meta.interpretation && Array.isArray(meta.interpretation.bands) && meta.interpretation.bands.length) {
    const interp = el('div', { class: 'interpretation', 'aria-label': 'Interpretation per source' });
    interp.appendChild(el('p', { class: 'interpretation-header', text: 'Per source:' }));
    const list = el('ul', { class: 'interpretation-bands' });
    for (const band of meta.interpretation.bands) {
      if (!band || !band.range || !band.text) continue;
      const item = el('li', { class: 'interpretation-band' });
      item.appendChild(el('span', { class: 'interpretation-range', text: String(band.range) }));
      item.appendChild(document.createTextNode(' - '));
      item.appendChild(el('span', { class: 'interpretation-text', text: String(band.text) }));
      list.appendChild(item);
    }
    interp.appendChild(list);
    block.appendChild(interp);
  }

  if (meta.source) {
    const stamp = el('p', { class: 'source-stamp', text: `Source: ${meta.source.label} (loading version...)` });
    block.appendChild(stamp);
    fetchJson(`data/${meta.source.dataset}/manifest.json`).then((m) => {
      stamp.textContent = `Source: ${meta.source.label}, fetched ${m.fetchDate}`;
    }).catch(() => {
      stamp.textContent = `Source: ${meta.source.label}`;
    });
  }

  if (meta.example) {
    const link = el('a', {
      href: '#',
      class: 'example-reset',
      text: 'Reset to example',
      'aria-label': 'Reset inputs to the example values',
    });
    const note = el('span', { class: 'example-expected muted' });
    link.addEventListener('click', (e) => {
      e.preventDefault();
      applyExample(util);
      note.textContent = ` Expected: ${meta.example.expected}`;
    });
    block.appendChild(el('p', { class: 'example-row' }, [link, note]));
  }

  // spec-v2 section 3.2: a single "Copy all" button that grabs whatever the
  // results region currently shows. Per-result copy buttons live in the
  // utility renderers; this is the universal fallback.
  const copyLive = el('span', { class: 'copy-live visually-hidden', 'aria-live': 'polite', role: 'status' });
  const copyAllBtn = copyButton(() => {
    const res = document.getElementById('q-results') || document.getElementById('tool-body');
    return res ? (res.innerText || res.textContent || '') : '';
  }, { label: 'Copy all', live: copyLive });
  block.appendChild(el('p', { class: 'copy-row' }, [copyAllBtn, copyLive]));

  return block.children.length ? block : null;
}

// spec-v9 §3.3: fill a tile's inputs from META[id].example. Returns the set
// of input IDs that were filled so callers can avoid clobbering values that
// hash-state already set.
function applyExample(util, { skip } = {}) {
  const meta = META[util.id];
  if (!meta || !meta.example || !meta.example.fields) return new Set();
  const filled = new Set();
  for (const [id, value] of Object.entries(meta.example.fields)) {
    if (skip && skip.has(id)) continue;
    const node = document.getElementById(id);
    if (!node) continue;
    if (node.tagName === 'SELECT') node.value = value;
    else if (node.type === 'checkbox') node.checked = value === '1' || value === true || value === 'true';
    else node.value = value;
    // Dispatch both 'input' and 'change' so renderers wired to either
    // event re-run. Several renderers listen only to one or the other.
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
    filled.add(id);
  }
  return filled;
}

// spec-v9 §3.3: append a muted "(example: <value>)" annotation next to the
// label of an input that was pre-filled from META[id].example. Renderers
// that pair each input with a <label for="id"> get the annotation
// automatically; ad-hoc renderers can call this helper from view code.
export function annotateExample(id, value) {
  const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
  if (!label) return;
  if (label.querySelector('.example-hint')) return;
  label.appendChild(
    el('span', { class: 'example-hint muted', text: ` (example: ${value})` })
  );
}

function renderToolView(util) {
  const main = getMain();
  if (!main) return;
  clear(main);

  // Breadcrumb (replaces the old "Back to tools" paragraph).
  const breadcrumbBack = el('button', {
    type: 'button',
    class: 'breadcrumb-back',
    'aria-label': 'Back to all tools',
    text: '← All tools',
  });
  breadcrumbBack.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = '#/';
  });
  const trail = el('span', { class: 'breadcrumb-trail' }, [
    el('span', { class: 'bc-group', text: GROUP_LABELS[util.group] || util.group }),
    el('span', { 'aria-hidden': 'true', text: ' / ' }),
    el('span', { class: 'bc-current', text: util.name }),
  ]);
  main.appendChild(el('div', { class: 'breadcrumb' }, [breadcrumbBack, trail]));

  // Use <section>, not <main>, so we don't nest a <main> inside <main id="main">
  // (HTML disallows multiple main landmarks; some screen readers also get
  // confused). The .content class still gets the encryptalotta panel chrome.
  const content = el('section', { class: 'content', 'aria-label': util.name });
  content.appendChild(el('h1', { text: util.name }));

  if (util.clinical && util.group !== 'I') {
    content.appendChild(
      el('p', { class: 'clinical-notice', role: 'note', text: CLINICAL_NOTICE_TEXT })
    );
  }

  // spec-v9 §3.2: tile regions render in the order title → description →
  // inputs → references. The meta block (References) is appended *after*
  // the tool body, not above it.
  const body = el('div', { id: 'tool-body', class: 'tool-body' });
  content.appendChild(body);

  // Attach to the live DOM before invoking the renderer. Several renderers
  // call document.getElementById on inputs they just appended, which only
  // works once `body` is part of the document.
  main.appendChild(content);

  const renderer = RENDERERS[util.id];
  if (renderer) {
    try {
      renderer(body);
      // spec-v9 §3.3: pre-fill META[id].example after the renderer mounts,
      // but let URL-hash state win (deep links keep their values).
      Promise.resolve().then(() => {
        applyHashState(body);
        trackHashState(body);
        const hashKeys = new Set(Object.keys(parseHash(window.location.hash).state || {}));
        const filled = applyExample(util, { skip: hashKeys });
        const meta = META[util.id];
        if (meta && meta.example && meta.example.fields) {
          for (const [id, value] of Object.entries(meta.example.fields)) {
            if (filled.has(id)) annotateExample(id, value);
          }
        }
      });
    } catch (err) {
      console.error(`[sophiewell] renderer threw for tool "${util.id}":`, err);
      body.appendChild(el('p', { class: 'muted', text: `Error rendering tool: ${err.message}` }));
    }
  } else {
    console.warn(`[sophiewell] no renderer registered for tool "${util.id}"  -  showing coming-soon placeholder`);
    body.appendChild(
      el('p', {
        class: 'tool-description',
        text: 'This tool is coming soon. The data and renderer for this calculator are still being prepared.',
      })
    );
  }

  const metaBlock = renderMetaBlock(util);
  if (metaBlock) content.appendChild(metaBlock);
  document.title = util.name + ' | Sophie Well';

  // Always reset scroll so the new view is visible.
  window.scrollTo({ top: 0, behavior: 'auto' });

  // Move focus to the heading for screen reader users.
  const h1 = content.querySelector('h1');
  if (h1) {
    h1.setAttribute('tabindex', '-1');
    h1.focus({ preventScroll: true });
  }
}

let currentRouteId = null;

function route() {
  const parsed = parseHash(window.location.hash);
  const id = parsed.route;
  if (!id) {
    currentRouteId = null;
    restoreHome();
    return;
  }
  if (id === 'changelog' || id === 'stability') {
    if (currentRouteId !== id) {
      currentRouteId = id;
      renderDocView(id);
    }
    return;
  }
  const util = UTIL_BY_ID.get(id);
  if (util) {
    if (currentRouteId !== id) {
      currentRouteId = id;
      renderToolView(util);
    }
  } else {
    currentRouteId = null;
    restoreHome();
  }
}

function renderDocView(id) {
  const main = getMain();
  if (!main) return;
  const path = id === 'changelog' ? 'CHANGELOG.md' : 'docs/stability.md';
  const title = id === 'changelog' ? 'Changelog' : 'Stability commitments';
  clear(main);
  const back = el('button', { type: 'button', class: 'breadcrumb-back', 'aria-label': 'Back to all tools', text: '← All tools' });
  back.addEventListener('click', (e) => { e.preventDefault(); location.hash = '#/'; });
  main.appendChild(el('div', { class: 'breadcrumb' }, [
    back,
    el('span', { class: 'breadcrumb-trail' }, [
      el('span', { class: 'bc-current', text: title }),
    ]),
  ]));
  const content = el('section', { class: 'content', 'aria-label': title });
  content.appendChild(el('h1', { text: title }));
  const body = el('article', { class: 'doc-body' });
  content.appendChild(body);
  main.appendChild(content);
  document.title = `${title} | Sophie Well`;
  window.scrollTo({ top: 0, behavior: 'auto' });

  fetch(path).then((r) => r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))).then((md) => {
    // Minimal markdown rendering: split paragraphs on blank lines; render
    // headings (# / ## / ###) as h2 / h3 / h4; bullet lines as <ul><li>.
    const blocks = md.replace(/\r\n/g, '\n').split(/\n\n+/);
    for (const blk of blocks) {
      const trimmed = blk.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('### ')) body.appendChild(el('h4', { text: trimmed.slice(4) }));
      else if (trimmed.startsWith('## ')) body.appendChild(el('h3', { text: trimmed.slice(3) }));
      else if (trimmed.startsWith('# ')) body.appendChild(el('h2', { text: trimmed.slice(2) }));
      else if (/^[-*] /.test(trimmed)) {
        const ul = el('ul');
        for (const line of trimmed.split('\n')) {
          if (/^[-*] /.test(line.trim())) ul.appendChild(el('li', { text: line.trim().slice(2) }));
        }
        body.appendChild(ul);
      } else {
        body.appendChild(el('p', { text: trimmed }));
      }
    }
  }).catch((err) => {
    body.appendChild(el('p', { class: 'muted', text: `Could not load: ${err.message}` }));
  });
}

// ----- Topbar search (typeahead → direct navigation) ---------------------

function scoreUtility(util, tokens) {
  const name = util.name.toLowerCase();
  const id = util.id.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    const inName = name.indexOf(t);
    const inId = id.indexOf(t);
    if (inName === -1 && inId === -1) return -1;
    if (name === t || id === t) score += 1000;
    if (inName === 0) score += 200;
    else if (inName > 0) score += Math.max(40 - inName, 5);
    if (inId === 0) score += 120;
    else if (inId > 0) score += 30;
    if (new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(util.name)) score += 60;
  }
  return score;
}

function searchUtilities(query, limit) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const ranked = [];
  for (const util of UTILITIES) {
    const s = scoreUtility(util, tokens);
    if (s >= 0) ranked.push({ util, score: s });
  }
  ranked.sort((a, b) => b.score - a.score || a.util.name.localeCompare(b.util.name));
  return ranked.slice(0, limit).map((r) => r.util);
}

function installTopbarSearch() {
  const input = document.getElementById('topbar-search');
  const list = document.getElementById('topbar-search-results');
  if (!input || !list) return;

  let activeIndex = -1;
  let currentMatches = [];

  function setExpanded(open) {
    input.setAttribute('aria-expanded', open ? 'true' : 'false');
    list.hidden = !open;
  }

  function setActive(idx) {
    const items = list.querySelectorAll('.topbar-search-result');
    items.forEach((node, i) => {
      const on = i === idx;
      node.classList.toggle('is-active', on);
      node.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) {
        input.setAttribute('aria-activedescendant', node.id);
        node.scrollIntoView({ block: 'nearest' });
      }
    });
    if (idx === -1) input.removeAttribute('aria-activedescendant');
    activeIndex = idx;
  }

  function navigateTo(util) {
    if (!util) return;
    input.value = '';
    currentMatches = [];
    clear(list);
    setExpanded(false);
    input.blur();
    if (location.hash === '#' + util.id) {
      currentRouteId = null;
      route();
    } else {
      location.hash = '#' + util.id;
    }
  }

  function render(matches, query) {
    clear(list);
    currentMatches = matches;
    if (!query) { setExpanded(false); setActive(-1); return; }
    if (matches.length === 0) {
      const empty = el('li', { class: 'topbar-search-empty', role: 'presentation', text: 'No tools match.' });
      list.appendChild(empty);
      setExpanded(true);
      setActive(-1);
      return;
    }
    matches.forEach((util, i) => {
      const item = el('li', {
        class: 'topbar-search-result',
        role: 'option',
        id: `topbar-search-result-${i}`,
        'data-tool': util.id,
        'aria-selected': 'false',
      }, [
        el('span', { class: 'tsr-name', text: util.name }),
        el('span', { class: 'tsr-group', text: GROUP_LABELS[util.group] || util.group }),
      ]);
      item.addEventListener('mousedown', (e) => {
        // mousedown so it fires before the input blur clears state.
        e.preventDefault();
        navigateTo(util);
      });
      item.addEventListener('mouseenter', () => setActive(i));
      list.appendChild(item);
    });
    setExpanded(true);
    setActive(0);
  }

  input.addEventListener('input', () => {
    const matches = searchUtilities(input.value, 8);
    render(matches, input.value.trim());
  });

  input.addEventListener('focus', () => {
    if (input.value.trim()) {
      const matches = searchUtilities(input.value, 8);
      render(matches, input.value.trim());
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      if (!currentMatches.length) return;
      setActive((activeIndex + 1) % currentMatches.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      if (!currentMatches.length) return;
      setActive((activeIndex - 1 + currentMatches.length) % currentMatches.length);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && currentMatches[activeIndex]) {
        e.preventDefault();
        navigateTo(currentMatches[activeIndex]);
      } else if (currentMatches[0]) {
        e.preventDefault();
        navigateTo(currentMatches[0]);
      }
    } else if (e.key === 'Escape') {
      if (input.value || !list.hidden) {
        input.value = '';
        clear(list);
        currentMatches = [];
        setExpanded(false);
        setActive(-1);
        e.preventDefault();
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target === input) return;
    if (list.contains(e.target)) return;
    setExpanded(false);
    setActive(-1);
  });
}

// ----- Service worker registration ----------------------------------------

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const isHttps = window.location.protocol === 'https:';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isHttps && !isLocal) return;
  // The service worker file is added in step 6.
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Silent: offline support is best-effort.
  });
}

// ----- Boot ----------------------------------------------------------------

function boot() {
  captureHomeSnapshot();
  // spec-v6 §4.2.2: initial audience chip from URL hash.
  const initial = parseHash(window.location.hash);
  if (initial.audience && initial.audience !== 'all') {
    filterState.audience = initial.audience;
    const group = document.querySelector('.toggle-group[data-filter="audience"]');
    if (group) syncToggleGroupState(group, initial.audience);
  }
  // spec-v7 §3.4 + spec-v8 §4.6: initial disclosure state from URL
  // hash. The static markup ships **closed** (committed in spec-v8);
  // an explicit b=open in the hash expands the catalog so deep links
  // and clinician bookmarks that previously relied on the open
  // default continue to land on the grid.
  const disclosure = document.getElementById('browse-disclosure');
  if (disclosure) {
    if (initial.browse === 'open') disclosure.open = true;
    else if (initial.browse === 'closed') disclosure.open = false;
  }
  // spec-v7 §3.4: visible tile count next to "Browse all". Pulled from the
  // utility registry so it stays correct as tiles land.
  const countNode = document.getElementById('browse-tile-count');
  if (countNode) countNode.textContent = String(UTILITIES.length);
  wireFilters();
  applyFilters();
  installKeyboard();
  installTopbarSearch();
  // spec-v7 §3.2: load the synonym table once at boot. Hero search degrades
  // to fuzzy-only if the fetch fails (e.g., file:// load); synonyms are an
  // optional accelerator, not a hard dependency.
  loadSynonyms().then((entries) => { SYNONYM_ENTRIES = entries; }).catch(() => {});
  window.addEventListener('hashchange', route);
  route();
  registerServiceWorker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export { UTILITIES, UTIL_BY_ID };
