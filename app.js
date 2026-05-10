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
import { META } from './lib/meta.js';
import { fetchJson } from './lib/data.js';
import { copyButton } from './lib/clipboard.js';
import { installKeyboard } from './lib/keyboard.js';
import { parseHash, buildHash, patchHash } from './lib/hash.js';

const RENDERERS = { ...RA, ...RC, ...RE, ...RF, ...RG, ...RH, ...RI, ...RJ, ...RKLMNO, ...RV5 };

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
    // Don't swallow clicks on nested action buttons (e.g., the Pin button
    // inside a tool-card). Their own handlers call stopPropagation, but if
    // any child carries data-no-route, skip.
    const ignore = event.target.closest('[data-no-route]');
    if (ignore) return;
    const card = event.target.closest('.tool-card');
    if (!card) return;
    const id = card.getAttribute('data-tool');
    if (!id) return;
    event.preventDefault();
    // Force a route refresh even if the user clicks the card matching the
    // currently-active route (e.g., from the Pinned section).
    if (location.hash === '#' + id) {
      currentRouteId = null;
      route();
    } else {
      location.hash = '#' + id;
    }
  });
}

// Group letter → breadcrumb label.
const GROUP_LABELS = {
  A: 'Code Reference',
  C: 'Patient Bill & Insurance Literacy',
  E: 'Clinical Math & Conversions',
  F: 'Medication & Infusion',
  G: 'Clinical Scoring & Reference',
  H: 'Workflow & Templates',
  I: 'Field Medicine',
  J: 'Public Health Decision Trees',
  K: 'Lab Reference',
  L: 'Forms & Numbers Literacy',
  N: 'Literacy Helpers',
  O: 'Patient Safety',
};

function wireFilters() {
  const groups = document.querySelectorAll('.toggle-group');
  groups.forEach((group) => {
    const filterName = group.getAttribute('data-filter');
    const buttons = group.querySelectorAll('.toggle');
    group.addEventListener('click', (event) => {
      const btn = event.target.closest('.toggle');
      if (!btn) return;
      const value = btn.getAttribute('data-value');
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      filterState[filterName] = value;
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
    const value = filterState[filterName];
    group.querySelectorAll('.toggle').forEach((b) => {
      const active = b.getAttribute('data-value') === value;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  });
  const search = document.getElementById('search');
  if (search) search.value = filterState.query;
  applyFilters();
  document.title = 'Sophie Well';
}

// spec-v2 section 4.1: hash-based pinning. Render the Pinned section above
// the tile grid on the home view, with Unpin affordances. Tiles in the main
// grid get a Pin affordance.
function renderPinnedSection() {
  const grid = document.getElementById('tile-grid');
  if (!grid) return;
  // Wire Pin button on every tool-card (idempotent).
  grid.querySelectorAll('.tool-card').forEach((tile) => {
    if (tile.querySelector('.pin-btn')) return;
    const id = tile.getAttribute('data-tool');
    if (!id) return;
    const btn = el('button', { type: 'button', class: 'pin-btn', text: 'Pin', 'aria-label': `Pin ${id}` });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePin(id);
    });
    tile.appendChild(btn);
  });

  const { pinned } = parseHash(window.location.hash);
  let section = document.getElementById('pinned-section');
  const homeView = document.getElementById('home-view');
  if (!section && homeView) {
    section = el('section', { id: 'pinned-section', 'aria-labelledby': 'pinned-heading' });
    section.appendChild(el('h2', { id: 'pinned-heading', text: 'Pinned' }));
    section.appendChild(el('div', { id: 'pinned-grid', class: 'home-grid' }));
    homeView.insertBefore(section, homeView.firstChild);
  }
  if (!section) return;
  const pinnedGrid = section.querySelector('#pinned-grid');
  clear(pinnedGrid);
  if (!pinned.length) { section.hidden = true; return; }
  section.hidden = false;
  for (const id of pinned) {
    const original = grid.querySelector(`.tool-card[data-tool="${id}"]`);
    if (!original) continue;
    const tile = original.cloneNode(true);
    const oldPin = tile.querySelector('.pin-btn');
    if (oldPin) oldPin.remove();
    const unpin = el('button', { type: 'button', class: 'pin-btn', text: 'Unpin', 'aria-label': `Unpin ${id}` });
    unpin.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePin(id);
    });
    tile.appendChild(unpin);
    pinnedGrid.appendChild(tile);
  }
}

function togglePin(id) {
  const cur = parseHash(window.location.hash);
  const has = cur.pinned.includes(id);
  const next = has ? cur.pinned.filter((x) => x !== id) : [...cur.pinned, id];
  const newHash = buildHash({ ...cur, pinned: next });
  window.history.replaceState(null, '', newHash);
  renderPinnedSection();
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

// spec-v2 sections 5.1, 5.2, 5.3: inline citation, source stamp, and
// "Test with example" button rendered uniformly above every utility body.
function renderMetaBlock(util) {
  const meta = META[util.id];
  if (!meta) return null;
  const block = el('div', { class: 'tool-meta' });

  if (meta.citation) {
    block.appendChild(el('p', { class: 'citation', text: `Citation: ${meta.citation}` }));
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
    const btn = el('button', { type: 'button', class: 'example-btn', text: 'Test with example' });
    const note = el('span', { class: 'example-expected muted' });
    btn.addEventListener('click', () => {
      for (const [id, value] of Object.entries(meta.example.fields)) {
        const elInput = document.getElementById(id);
        if (!elInput) continue;
        if (elInput.tagName === 'SELECT') elInput.value = value;
        else if (elInput.type === 'checkbox') elInput.checked = value === '1' || value === true || value === 'true';
        else elInput.value = value;
        // Dispatch both 'input' and 'change' so renderers wired to either
        // event re-run. Several v1 renderers listen only to one or the
        // other; firing both is benign and keeps example-fill consistent.
        elInput.dispatchEvent(new Event('input', { bubbles: true }));
        elInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      note.textContent = ` Expected: ${meta.example.expected}`;
    });
    block.appendChild(el('p', { class: 'example-row' }, [btn, note]));
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

  const metaBlock = renderMetaBlock(util);
  if (metaBlock) content.appendChild(metaBlock);

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
      Promise.resolve().then(() => { applyHashState(body); trackHashState(body); });
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

  content.appendChild(
    el('section', { class: 'tool-sources', 'aria-labelledby': 'sources-heading' }, [
      el('h2', { id: 'sources-heading', text: 'Data sources' }),
      el('p', { class: 'muted', text: 'See docs/data-sources.md and docs/clinical-citations.md for the full source catalog and citations.' }),
    ])
  );
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
    renderPinnedSection();
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
  wireFilters();
  applyFilters();
  renderPinnedSection();
  installKeyboard();
  installTopbarSearch();
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
