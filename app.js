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
import { renderers as RV7 } from './views/group-v7.js';
import { renderers as RV8 } from './views/group-v8.js';
import { renderers as RV9 } from './views/group-v9.js';
import { renderers as RV10 } from './views/group-v10.js';
import { renderers as RV11 } from './views/group-v11.js';
import { renderers as RV63 } from './views/group-v63.js';
import { renderers as RB } from './views/group-b.js';
import { renderers as RPALINT } from './views/pa-lint.js';
import { META } from './lib/meta.js';
import { fetchJson } from './lib/data.js';
import { copyButton } from './lib/clipboard.js';
import {
  isRememberEnabled, setRememberEnabled, saveInputs, applySavedInputs, hasPersistableInputs,
} from './lib/input-persist.js';
import { installKeyboard } from './lib/keyboard.js';
import { parseHash, patchHash } from './lib/hash.js';
import { loadSynonyms } from './lib/synonyms.js';
import { resolvePrompt } from './lib/prompt.js';
// The patient-artifact dropzone UI (spec-v7 sec 3.1) was removed when
// Sophie pivoted to a clinical-staff-first wedge. The orphaned
// artifact-detect / artifact-route / artifact-handoff helpers were
// deleted in spec-v29 wave 29-2 (Group C/L).

const RENDERERS = { ...RA, ...RB, ...RC, ...RE, ...RF, ...RG, ...RH, ...RI, ...RJ, ...RKLMNO, ...RV5, ...RV6, ...RV7, ...RV8, ...RV9, ...RV10, ...RV11, ...RV63, ...RPALINT };

// ----- Utility registry ----------------------------------------------------
// Source of truth for routes, names, group, audiences, and clinical flag.
// Group letters: A Codes, B Pricing, C Patient Tools, D Provider Lookup,
// E Clinical Math, F Medication, G Scoring, H Workflow.

const UTILITIES = [
  // Group A: Code Lookup
  // spec-v29 wave 29-2: 19 Group A code-reference lookups removed
  // (icd10, hcpcs, cpt, ndc, pos-codes, modifier-codes, revenue-codes,
  // carc, rarc, hcpcs-mod, pos-lookup, tob-decode, rev-table, nubc-codes,
  // drg-lookup, apc-lookup, pcs-lookup, rxnorm-lookup, ndc-rxnorm).
  // Their URL hashes route to the home view with a removed-note via
  // REMOVED_V29_IDS below. Surviving Group A calculators (em-time,
  // ndc-convert) live below in the v5 block.
  // Group B: Billing & Reimbursement (spec-v77 charter / spec-v78 program).
  // The MPFS reimbursement engine: what Medicare actually pays a professional
  // line after every reduction. Deterministic, cited, integer-cents money;
  // input-or-bundled-data (doctrine clause 2). views/group-b.js, lib/billing-v78.js.
  { id: 'rvu-payment', name: 'MPFS Allowed Amount (RVU x GPCI x CF)', group: 'B', audiences: ['billers'], clinical: false },
  { id: 'mppr', name: 'Multiple-Procedure Payment Reduction', group: 'B', audiences: ['billers'], clinical: false },
  { id: 'bilateral-pay', name: 'Bilateral (Modifier 50) Payment by Indicator', group: 'B', audiences: ['billers'], clinical: false },
  { id: 'multi-surgeon-pay', name: 'Assistant / Co- / Team-Surgeon Payment', group: 'B', audiences: ['billers'], clinical: false },
  { id: 'sequestration-adjust', name: 'Medicare 2% Sequestration Adjustment', group: 'B', audiences: ['billers'], clinical: false },
  // spec-v79: claim edits & modifier logic. v78 prices the line; these five
  // decide whether it survives. No NCCI PTP / MUE table ships (doctrine clause 2):
  // the indicator / MUE value is a user input, so the tool is never silently
  // stale. views/group-b.js, lib/billing-v79.js.
  { id: 'ncci-ptp', name: 'NCCI Edit & Modifier-Bypass Checker', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'mue-check', name: 'MUE Units Adjudication (MAI 1/2/3)', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'modifier-x-selector', name: 'Modifier 59 vs XE/XS/XP/XU Selector', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'global-period', name: 'Global Surgery Period & Required Modifier', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'modifier-order', name: 'Pricing vs Informational Modifier Order', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  // spec-v80: E/M & time-based coding, completed. The office em-time/em-mdm
  // tiles only do 99202-99215; these six extend MDM leveling to every setting
  // and add the time-unit codes (critical care, prolonged, therapy 8-minute,
  // anesthesia). Setting/payer forks are explicit; CPT descriptors and ASA base
  // units are user inputs (doctrine clause 2). views/group-b.js, lib/billing-v80.js.
  { id: 'em-mdm-2023', name: 'E/M MDM Level by Setting (2023, all places of service)', group: 'B', audiences: ['coders', 'billers', 'clinicians'], clinical: false },
  { id: 'critical-care-time', name: 'Critical Care Time (99291 + 99292 Units)', group: 'B', audiences: ['coders', 'billers', 'clinicians'], clinical: false },
  { id: 'split-shared', name: 'Split / Shared Visit & FS Modifier', group: 'B', audiences: ['coders', 'billers', 'clinicians'], clinical: false },
  { id: 'prolonged-services', name: 'Prolonged Services (99417 / G2212 Units)', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'therapy-units', name: 'Therapy Units (8-Minute Rule vs Rule of Eights)', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'anesthesia-units', name: 'Anesthesia Units (Base + Time + Modifying x CF)', group: 'B', audiences: ['billers', 'coders'], clinical: false },
  { id: 'ndc-hcpcs-units', name: 'HCPCS Drug Billing Units (Dose -> Units)', group: 'B', audiences: ['billers', 'coders'], clinical: false },
  { id: 'drug-wastage', name: 'Drug Wastage (JW / JZ Units, Single-Dose Vial)', group: 'B', audiences: ['billers', 'coders'], clinical: false },
  { id: 'infusion-hierarchy', name: 'Infusion Hierarchy (Initial Code Picker, 96360-96379)', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  // spec-v83: claim integrity & facility payment -- the program's sixth and
  // final feature spec. Four validators catch a bad NPI/MBI/ICD-10 or an
  // out-of-balance 835 before the clearinghouse rejects it; two pricers compute
  // the UB-04 (DRG/APC) facility side the v78 professional engine doesn't.
  // Validators verify format/structure only; pricers read bundled weights but
  // take rates as inputs (doctrine clause 2). views/group-b.js, lib/billing-v83.js.
  { id: 'npi-validate', name: 'NPI Luhn Check-Digit Validator / Generator', group: 'B', audiences: ['billers', 'coders', 'credentialing'], clinical: false },
  { id: 'mbi-validate', name: 'Medicare Beneficiary Identifier (MBI) Format Validator', group: 'B', audiences: ['billers', 'front-desk'], clinical: false },
  { id: 'icd10-validate', name: 'ICD-10-CM Structural & Specificity Checker', group: 'B', audiences: ['coders', 'billers'], clinical: false },
  { id: 'era-balance', name: '835 / EOB Remittance Balancing', group: 'B', audiences: ['billers', 'posting'], clinical: false },
  { id: 'drg-payment', name: 'IPPS DRG Payment Estimate', group: 'B', audiences: ['facility-billing', 'coders'], clinical: false },
  { id: 'apc-payment', name: 'OPPS APC Payment Estimate', group: 'B', audiences: ['facility-billing', 'coders'], clinical: false },
  // Group C: Patient Bill and Insurance Tools
  // spec-v29 wave 29-2: 12 Group C patient-literacy / eligibility tiles
  // removed (decoder, insurance, eob-decoder, no-surprises,
  // insurance-card, abn-explainer, msn-decoder, idr-eligibility,
  // birthday-rule, cobra-timeline, medicare-enrollment, aca-sep). Their
  // URL hashes route to the home view with a removed-note via
  // REMOVED_V29_IDS below. Survivors: appeal-letter, hipaa-roa
  // (workflow generators per spec-v29 sec 10 open question 1).
  { id: 'appeal-letter', name: 'Appeal Letter Generator', group: 'C', audiences: ['patients'], clinical: false },
  { id: 'hipaa-roa', name: 'HIPAA Right of Access Request Generator', group: 'C', audiences: ['patients'], clinical: false },
  // spec-v63 Part B: ops-deadline calculators (compute through lib/deadline.js).
  { id: 'appeal-deadline', name: 'Medicare Appeal-Level Deadline Calculator', group: 'C', audiences: ['billers', 'patients'], clinical: false },
  { id: 'timely-filing', name: 'Claim Timely-Filing Deadline', group: 'C', audiences: ['billers'], clinical: false },
  { id: 'pa-turnaround', name: 'Prior-Authorization Decision-Deadline Clock', group: 'C', audiences: ['billers', 'clinicians'], clinical: false },
  { id: 'overpayment-60day', name: '60-Day Overpayment Report-and-Return Clock', group: 'C', audiences: ['billers'], clinical: false },
  // spec-v82: patient responsibility & coordination of benefits. v78 computes
  // what the payer pays; these four compute what the PATIENT owes -- Medicare
  // cost-share, COB/MSP, the contractual write-off, and the No Surprises Act
  // cap. Money is integer cents; the protection/network gate is hard, not
  // advisory. views/group-c.js, lib/billing-v82.js.
  { id: 'medicare-cost-share', name: 'Medicare Patient Cost-Share (Part A / B / SNF)', group: 'C', audiences: ['patients', 'billers'], clinical: false },
  { id: 'cob-calc', name: 'Coordination of Benefits & Medicare Secondary Payer', group: 'C', audiences: ['billers', 'patients'], clinical: false },
  { id: 'allowed-amount', name: 'Contractual Write-Off vs Patient Balance', group: 'C', audiences: ['billers', 'patients'], clinical: false },
  { id: 'nsa-cost-share', name: 'No Surprises Act Cost-Share (QPA-Based)', group: 'C', audiences: ['patients', 'billers'], clinical: false },
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
  { id: 'peds-dose', name: 'Pediatric Quick-Dose Panel (by weight)', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'insulin-drip', name: 'Insulin Drip Math', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'anticoag-reversal', name: 'Anticoagulation Reversal Dose', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // spec-v62 §3 Part B (wave 1): ICU-infusion + med-surg bedside math.
  { id: 'infusion-time-remaining', name: 'Infusion Time Remaining & Rate-to-Last', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'enteral-free-water', name: 'Enteral Free-Water & Flush Target', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'apap-24h-max', name: 'Acetaminophen 24-Hour Total & Ceiling', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'icu-nutrition-target', name: 'ICU Energy & Protein Target', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vte-prophylaxis-dose', name: 'Enoxaparin Dose (weight & renal)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'norepi-equiv', name: 'Norepinephrine-Equivalent Vasopressor Dose', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v65 §2.1: oxygen-cylinder time-to-empty (respiratory-safety analog of infusion-time-remaining).
  { id: 'o2-cylinder-duration', name: 'Oxygen Cylinder Duration & Max Transport Flow', group: 'F', audiences: ['clinicians', 'field'], clinical: true },
  // spec-v29 wave 29-2 (Group K/O): high-alert removed (ISMP wallet
  // reference); iv-to-po removed (static equivalence table, audit
  // confirmed no numeric output per spec-v29 sec 7.2 deferral).
  // Group F: v4 extensions (utilities 129-135)
  { id: 'opioid-mme', name: 'Opioid MME Calculator (CDC 2022)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'steroid-equiv', name: 'Steroid Equivalence Converter', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'benzo-equiv', name: 'Benzodiazepine Equivalence (Ashton)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'abx-renal', name: 'Antibiotic Renal Dose Adjustment', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vasopressor', name: 'Vasopressor Dose to Rate Calculator', group: 'F', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'tpn-macro', name: 'TPN Macronutrient Calculator', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // Group G: Clinical Scoring and Reference
  { id: 'gcs', name: 'Glasgow Coma Scale', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'apgar', name: 'APGAR', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // peds-vitals removed in spec-v29 wave 29-2 (Group G non-scores): static reference table.
  // lab-ranges removed in spec-v29 wave 29-2 (Group K/O): static table.
  { id: 'abg', name: 'ABG Interpretation Walkthrough', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'wells-pe', name: 'Wells Score for PE', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'wells-dvt', name: 'Wells Score for DVT', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'chads', name: 'CHA2DS2-VASc', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hasbled', name: 'HAS-BLED', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nihss', name: 'NIH Stroke Scale', group: 'G', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // asa, mallampati, beers removed in spec-v29 wave 29-2 (Group G non-scores): static reference tables.
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
  // mrs removed in spec-v29 wave 29-2 (Group G non-scores): static reference table.
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
  // spec-v29 wave 29-2: 10 Group I field-medicine reference cards
  // removed (adult-arrest-ref, peds-arrest-ref, defib, toxidromes,
  // dot-erg, niosh-pg, cpr-numeric, tccc, hypothermia, heat-illness).
  // Their URL hashes route to the home view with a removed-note via
  // REMOVED_V29_IDS below. Surviving Group I calculators / decision
  // rules remain.
  { id: 'peds-weight-dose', name: 'Pediatric Weight-to-Dose Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'cincinnati',       name: 'Cincinnati Prehospital Stroke Scale', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'fast',             name: 'FAST and BE-FAST Stroke Assessment', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'field-triage',     name: 'Trauma Triage Decision Tool (CDC)', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'start-triage',     name: 'START Adult MCI Triage', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'jumpstart-triage', name: 'JumpSTART Pediatric MCI Triage', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'bsa_burn',         name: 'Burn Surface Area Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'burn-fluid',       name: 'Burn Fluid Resuscitation Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'peds-ett',         name: 'Pediatric ETT Size Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'naloxone',         name: 'Naloxone Dosing Calculator', group: 'I', audiences: ['clinicians', 'educators', 'field', 'patients'], clinical: true },
  { id: 'ems-doc',          name: 'EMS Documentation Helper', group: 'I', audiences: ['clinicians', 'field'], clinical: false },
  // Group I: v4 extensions (utilities 166-171)
  { id: 'nexus-cspine',     name: 'NEXUS + Canadian C-Spine', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'co-cn-antidote',   name: 'CO / Cyanide / Smoke-Inhalation Antidotes', group: 'I', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  // Group J (NEW): Public Health & Travel (utilities 172-180)
  { id: 'tetanus',      name: 'Tetanus Prophylaxis Decision Tree', group: 'J', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'rabies-pep',   name: 'Rabies PEP Decision Tree', group: 'J', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'bbp-exposure', name: 'Bloodborne Pathogen Exposure Decision Tree', group: 'J', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tb-testing',   name: 'TB Testing Interpretation (TST + IGRA)', group: 'J', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sti-screening',name: 'STI Screening Interval Reference (CDC)', group: 'J', audiences: ['clinicians', 'patients', 'educators'], clinical: true },
  // Group K (Lab Reference): removed in spec-v29 wave 29-2 (lab-adult,
  // lab-peds, tdm-levels, tox-levels are pure reference-range tables).
  // Group L: Forms & Numbers Literacy (removed in spec-v29 wave 29-2:
  // cms1500, ub04, eob-glossary are pure form / glossary references).
  // Group M (NEW): Eligibility & Benefits (utilities 188-191)
  // Group N (NEW): Literacy Helpers (utilities 192-194)
  { id: 'unit-converter-v4', name: 'Universal Unit Converter (lab + vitals + basics)', group: 'N', audiences: ['patients', 'clinicians', 'educators'], clinical: false },
  { id: 'time-to-dose',      name: 'Time-to-Dose Helper', group: 'N', audiences: ['patients'], clinical: false },
  { id: 'peds-weight-conv',  name: 'Pediatric Weight Converter (lb/oz <-> kg)', group: 'N', audiences: ['patients', 'clinicians', 'educators'], clinical: false },
  // Group O (Patient Safety): high-alert-card removed in spec-v29 wave
  // 29-2 (pure ISMP infographic).

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
  { id: 'em-mdm',             name: 'MDM-Based E/M Code Selector (2021)',               group: 'A', audiences: ['billers', 'clinicians', 'educators'], clinical: false },
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
  // spec-v15 §3.3 wave 15-3: pediatric respiratory + neurologic.
  { id: 'westley',             name: 'Westley Croup Score',                              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pram-asthma',         name: 'PRAM (pediatric asthma severity)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pass-asthma',         name: 'PASS (pediatric asthma severity)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'peds-gcs',            name: 'Pediatric Glasgow Coma Scale',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nigrovic',            name: 'Bacterial Meningitis Score (Nigrovic)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v15 §3.4 wave 15-4: pediatric imaging-decision companions.
  { id: 'pecarn-iai',          name: 'PECARN Intra-Abdominal Injury Rule',               group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pecarn-cspine',       name: 'PECARN Pediatric C-Spine Rule',                    group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v15 §3.5 wave 15-5 (partial): trauma scoring.
  { id: 'abc-mtp',             name: 'ABC Score for Massive Transfusion',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mgap',                name: 'MGAP Trauma Score',                                group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gap',                 name: 'GAP Trauma Score',                                 group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'big',                 name: 'BIG Score (pediatric trauma)',                     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3a: nurse-bedside scoring tiles (partial).
  { id: 'braden',              name: 'Braden Scale (pressure injury risk)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'morse-falls',         name: 'Morse Fall Scale',                                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hendrich-ii',         name: 'Hendrich II Fall Risk Model',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cam',                 name: 'Confusion Assessment Method (CAM, non-ICU)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ich-score',           name: 'ICH Score (Hemphill 2001)',                        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'hunt-hess-wfns',      name: 'Hunt-Hess + WFNS aneurysmal SAH grading',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mnihss',              name: 'modified NIHSS (mNIHSS, 11-item)',                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aldrete-padss',       name: 'modified Aldrete + PADSS (PACU discharge)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3b: nurse-bedside criteria bundles.
  { id: 'npiap-staging',       name: 'NPIAP pressure injury stage selector',             group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'norton-push',         name: 'Norton Scale + PUSH Tool',                         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vip-extravasation',   name: 'VIP + INS infiltration / extravasation grading',   group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'blood-compat',        name: 'ABO/Rh blood-product compatibility quick-check',   group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3c: nurse-bedside math.
  { id: 'insulin-correction',     name: 'Insulin correction (ADA 2024 ISF / ICR)',          group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'electrolyte-replacement',name: 'Electrolyte replacement ladder (K / Mg / Phos)',   group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'crrt-dose',              name: 'CRRT effluent dose + citrate-Ca ratio',            group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ecmo-titration',         name: 'ECMO sweep / flow titration helper',               group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3d: timer / workflow bedside tiles.
  { id: 'ews-escalation',         name: 'NEWS2 / MEWS escalation + re-assessment timer',    group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'restraint-timer',        name: 'Restraint reassessment timer (CMS 42 CFR 482.13)', group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sepsis-bundle-clock',    name: 'Surviving Sepsis bundle timer + lactate clearance', group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'code-blue-clock',        name: 'Code-blue documentation timer (AHA 2020)',         group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mtp-tracker',            name: 'Massive Transfusion 1:1:1 ratio tracker (PROPPR)',  group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'device-day-counter',     name: 'Foley / central-line device-day counter (CDC)',    group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bristol-girth',          name: 'Bristol stool type + abdominal-girth trend',       group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v29 §4 wave 29-3e: vent bundle (closes wave 29-3).
  { id: 'vent-sbt-peep',          name: 'SBT readiness + ARDSnet PEEP/FiO2 table',           group: 'H', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v30 §2: thermal-emergency decision tiles (re-admits the v29
  // wave 29-2 hypothermia / heat-illness reference cards as decisions).
  { id: 'hypothermia-rewarm',     name: 'Swiss hypothermia staging + rewarming algorithm',  group: 'I', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'heatstroke-decision',    name: 'Heat exhaustion vs heat stroke + cooling algorithm', group: 'I', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v31 §2.1: Beers deprescribing checker (resolves spec-v29 §10.4).
  { id: 'beers-check',            name: 'Beers Criteria deprescribing checker (AGS 2023)',  group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v32 §2: non-verbal pain scales for nurse-bedside use.
  { id: 'flacc',                  name: 'FLACC scale (pediatric non-verbal pain)',          group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'painad',                 name: 'PAINAD (Pain Assessment in Advanced Dementia)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nips',                   name: 'NIPS (Neonatal Infant Pain Scale)',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v33 §2: opioid-sedation + neonatal-pain extensions.
  { id: 'npass',                  name: 'N-PASS (Neonatal Pain, Agitation, Sedation Scale)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cries',                  name: 'CRIES neonatal postoperative pain scale',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'poss',                   name: 'POSS (Pasero Opioid-induced Sedation Scale)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v34 §2: pediatric ICU bedside extensions.
  { id: 'comfort-b',              name: 'COMFORT-B Behavioral Scale (pediatric sedation)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'wat-1',                  name: 'WAT-1 (pediatric iatrogenic withdrawal)',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sbs',                    name: 'SBS (State Behavioral Scale, pediatric ICU)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v35 §2: pediatric ICU iatrogenic-withdrawal companion to WAT-1.
  { id: 'sos',                    name: 'SOS (Sophia Observation withdrawal Symptoms)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v36 §2: maternal track-and-trigger (obstetric early warning).
  { id: 'meows',                  name: 'MEOWS (Modified Early Obstetric Warning System)',   group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v37 §2: prehospital / ED stroke triage scales (CPSS + LAMS).
  { id: 'cpss',                   name: 'CPSS (Cincinnati Prehospital Stroke Scale)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'lams',                   name: 'LAMS (Los Angeles Motor Scale, LVO prediction)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v38 §2: prehospital LVO predictor companion to LAMS (5-item Pérez de la Ossa 2014).
  { id: 'race',                   name: 'RACE (Rapid Arterial oCclusion Evaluation)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v39 §2: ED stroke recognition with stroke-mimic discrimination.
  { id: 'rosier',                 name: 'ROSIER (Recognition of Stroke in the Emergency Room)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v40 §2: post-stroke bedside dysphagia screen (aspiration risk before oral intake).
  { id: 'guss',                   name: 'GUSS (Gugging Swallowing Screen, post-stroke dysphagia)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v41 §2: ICU coma scale for intubated/sedated patients (GCS alternative with brainstem).
  { id: 'four-score',             name: 'FOUR Score (ICU coma scale for intubated patients)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v42 §2: geriatric / discharge-planning functional status (ADL independence).
  { id: 'katz-adl',               name: 'Katz ADL (Activities of Daily Living index)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v43 §2: instrumental ADL companion to Katz (medications, finances, transport, etc.).
  { id: 'lawton-iadl',            name: 'Lawton IADL (Instrumental Activities of Daily Living)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v44 §2: rehab-nursing weighted ADL (10 items, 0-100; serial tracking).
  { id: 'barthel',                name: 'Barthel Index (weighted ADL for rehab nursing)',    group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v45 §2: bedside suicide-risk screening (Joint Commission / SAMHSA recommended).
  { id: 'cssrs',                  name: 'C-SSRS Screener (Columbia Suicide Severity Rating Scale)', group: 'G', audiences: ['clinicians', 'educators'], clinical: true },

  // spec-v6 §3.3: lab result interpreter. Patient-decoder category.
  { id: 'lab-interpret',       name: 'Lab Result Interpreter',                           group: 'C', audiences: ['patients', 'clinicians', 'educators'], clinical: true },

  // spec-v52 §3.2 + §4: prior-auth packet linter. First tile with the
  // new document-linter shape (the existing 254 default to numeric).
  // Group 'P' is the new top-level "Revenue cycle & utilization" group
  // introduced for revenue-cycle / utilization-management tiles. Wave
  // 52-1b ships the dropzone + SHA-256 audit-trail stub; the 60-rule
  // core ruleset, the PDF/DOCX parsers, and the DOCX report follow in
  // subsequent waves.
  { id: 'pa-lint',                name: 'Prior-Auth Packet Linter',                         group: 'P', audiences: ['billers', 'case-managers'], clinical: false, shape: 'document-linter' },
  // spec-v55: bedside hematology, renal/acid-base, and oxygenation math (13 tiles).
  { id: 'anc',                 name: 'Absolute Neutrophil Count (ANC) + neutropenia grade', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'retic-index',         name: 'Reticulocyte Production Index (corrected retic)',  group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'tsat',                name: 'Transferrin Saturation + iron-studies interpreter', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cci-platelet',        name: 'Corrected Count Increment (platelet refractoriness)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ldl-calc',            name: 'Calculated LDL (Friedewald + NIH)',                group: 'E', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'eag-a1c',             name: 'Estimated Average Glucose from A1c (eAG)',         group: 'E', audiences: ['clinicians', 'educators', 'patients'], clinical: true },
  { id: 'cao2-do2',            name: 'Arterial O2 Content (CaO2) + O2 Delivery (DO2)',   group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'oxygenation-index',   name: 'Oxygenation Index (OI) + Oxygen Saturation Index (OSI)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'driving-pressure',    name: 'Driving Pressure + static/dynamic compliance',     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v65 §2.2-2.3: gas-exchange ventilation target and cerebral perfusion pressure.
  { id: 'minute-ventilation',  name: 'Minute Ventilation + Target-PaCO2 Rate',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'cerebral-perfusion-pressure', name: 'Cerebral Perfusion Pressure (CPP = MAP - ICP)', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ttkg',                name: 'Transtubular Potassium Gradient (TTKG)',           group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'urine-anion-gap',     name: 'Urine Anion Gap (non-gap acidosis)',               group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'acid-base-deficit',   name: 'Bicarbonate Deficit + Sodium Deficit',             group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'schwartz-egfr',       name: 'Bedside Schwartz eGFR (pediatric)',                group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v56: weight-based dosing, infusion titration, and bedside toxicology (13 tiles).
  { id: 'heparin-nomogram',     name: 'Weight-based heparin infusion nomogram',           group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'vanc-auc',             name: 'Vancomycin AUC24/MIC (first-order, two-level)',    group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'aminoglycoside',       name: 'Extended-interval aminoglycoside (Hartford)',      group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'acetaminophen-nomogram', name: 'Acetaminophen (Rumack-Matthew) nomogram',        group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'digoxin',              name: 'Digoxin maintenance dose + level interpretation',  group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'local-anesthetic-max', name: 'Local anesthetic maximum dose',                    group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'mgso4-preeclampsia',   name: 'Magnesium sulfate (preeclampsia / eclampsia)',     group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pca-pump',             name: 'PCA pump settings + hourly-maximum guardrail',     group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sugammadex',           name: 'Sugammadex reversal dose',                         group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ketamine-propofol',    name: 'Procedural sedation dosing (ketamine/propofol)',   group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'peds-fluid-deficit',   name: 'Pediatric dehydration deficit + maintenance',      group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'peds-resus',           name: 'Pediatric resuscitation bolus',                    group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'conc-percent',         name: 'Concentration / percent / ratio converter',        group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v57: brief screeners, decision rules, and triage scores (14 tiles).
  { id: 'phq2-gad2',            name: 'PHQ-2 / GAD-2 ultra-brief screeners',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'audit-full',           name: 'AUDIT (10-item alcohol use screen)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'dast10',               name: 'DAST-10 Drug Abuse Screening Test',                group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'gds15',                name: 'Geriatric Depression Scale (GDS-15)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ottawa-knee',          name: 'Ottawa Knee Rule',                                 group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'nexus-chest',          name: 'NEXUS Chest (blunt chest-trauma imaging)',         group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sfsr',                 name: 'San Francisco Syncope Rule (CHESS)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'canadian-syncope',     name: 'Canadian Syncope Risk Score',                      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'edacs',                name: 'EDACS chest-pain score (+ EDACS-ADP)',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'years-pe',             name: 'YEARS algorithm for pulmonary embolism',           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'feverpain',            name: 'FeverPAIN score (strep pharyngitis)',              group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'stone-score',          name: 'STONE score (ureteral stone)',                     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iss-rts',              name: 'Injury Severity Score + Revised Trauma Score',     group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'sipa',                 name: 'Shock Index, Pediatric Age-Adjusted (SIPA)',       group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v58: neonatal, maternal, and pediatric/adult ICU bedside scores (12 tiles).
  { id: 'ballard',              name: 'New Ballard Score (gestational age)',              group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'finnegan',             name: 'Finnegan Neonatal Abstinence Score (NAS)',         group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'silverman-andersen',   name: 'Silverman-Andersen respiratory severity',          group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'downes',               name: 'Downes score (neonatal respiratory distress)',     group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'bhutani-bilirubin',    name: 'Bhutani bilirubin nomogram + AAP phototherapy',    group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'qbl-pph',              name: 'Quantitative blood loss + PPH risk',               group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'pelod2',               name: 'PELOD-2 (pediatric organ dysfunction)',            group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'psofa',                name: 'Pediatric SOFA (pSOFA)',                           group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'burch-wartofsky',      name: 'Burch-Wartofsky point scale (thyroid storm)',      group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ariscat',              name: 'ARISCAT postoperative pulmonary risk',             group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'apache2',              name: 'APACHE II (ICU mortality estimate)',               group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'braden-q',             name: 'Braden Q (pediatric pressure-injury risk)',        group: 'G', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v61 §3: 12 bedside medication-safety, electrolyte/fluid, and OB/peds tiles.
  { id: 'urine-output',         name: 'Urine output rate + KDIGO oliguria flag',          group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'gir',                  name: 'Glucose Infusion Rate (mg/kg/min)',                group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'ebv-mabl',             name: 'Estimated blood volume + max allowable blood loss', group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'corrected-phenytoin',  name: 'Albumin-corrected phenytoin (Sheiner-Tozer)',      group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'potassium-deficit',    name: 'Potassium deficit + replacement guidance',         group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'magnesium-replacement', name: 'Magnesium repletion estimate',                    group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'calcium-replacement',  name: 'Calcium replacement (gluconate / chloride + elemental Ca)', group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'rhig-dose',            name: 'Rh immune globulin dose (fetomaternal hemorrhage)', group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'peds-transfusion-volume', name: 'Pediatric / neonatal PRBC transfusion volume',  group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'iv-osmolarity',        name: 'IV / PN osmolarity + central-line flag',           group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'burn-uop-target',      name: 'Burn-resuscitation urine-output target',           group: 'E', audiences: ['clinicians', 'educators', 'field'], clinical: true },
  { id: 'fluid-balance',        name: 'Shift net fluid balance (I&O)',                     group: 'E', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'carb-insulin-bolus',   name: 'Carb-counting mealtime insulin bolus',             group: 'F', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v62 §3 Part B (wave 1): OB/L&D & neonatal bedside math.
  { id: 'neonatal-feeding-volume', name: 'Neonatal Feeding Volume (mL/kg/day)',          group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  { id: 'oxytocin-titration',   name: 'Oxytocin mU/min <-> mL/hr',                        group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
  // spec-v62 §3.3 Part B (wave 2): AAP-2022 neonatal phototherapy threshold.
  { id: 'neo-phototherapy',     name: 'Neonatal Phototherapy Threshold (AAP 2022)',      group: 'N', audiences: ['clinicians', 'educators'], clinical: true },
];

const UTIL_BY_ID = new Map(UTILITIES.map((u) => [u.id, u]));

const CLINICAL_NOTICE_TEXT =
  'This is a math aid for verification. Institutional protocols and clinician judgment govern any clinical decision.';

// spec-v29 wave 29-2: tiles deleted from UTILITIES whose permalink
// hashes still resolve. The router sends them to the home view with a
// one-line removed-note (spec-v29 sec 2.7). The map carries the
// per-group note text so the explanation matches the deletion bucket.
const REMOVED_V29_IDS = new Map([
  // Group A (wave 29-2 Group A PR): 19 code-reference lookups.
  ...[
    'icd10', 'hcpcs', 'cpt', 'ndc', 'pos-codes', 'modifier-codes',
    'revenue-codes', 'carc', 'rarc', 'hcpcs-mod', 'pos-lookup',
    'tob-decode', 'rev-table', 'nubc-codes', 'drg-lookup', 'apc-lookup',
    'pcs-lookup', 'rxnorm-lookup', 'ndc-rxnorm',
  ].map((id) => [id, 'Removed in spec-v29 wave 29-2 (code-reference lookup): this tile is no longer hosted by Sophie. Use the upstream code source (CMS, FDA, NUBC, AMA, X12) or your EHR\'s lookup. See docs/spec-v29.md for the rationale.']),
  // Group C / L (wave 29-2 Group C/L PR): 15 patient-literacy and
  // form-locator / glossary tiles.
  ...[
    'decoder', 'insurance', 'eob-decoder', 'no-surprises',
    'insurance-card', 'abn-explainer', 'msn-decoder', 'idr-eligibility',
    'birthday-rule', 'cobra-timeline', 'medicare-enrollment', 'aca-sep',
    'cms1500', 'ub04', 'eob-glossary',
  ].map((id) => [id, 'Removed in spec-v29 wave 29-2 (patient-literacy / form-locator reference): this tile is no longer hosted by Sophie. The workflow generators (appeal letter, HIPAA Right of Access) remain; the static decoders and eligibility infographics are out. See docs/spec-v29.md for the rationale.']),
  // Group I (wave 29-2 Group I PR): 10 field-medicine reference cards.
  ...[
    'adult-arrest-ref', 'peds-arrest-ref', 'defib', 'toxidromes',
    'dot-erg', 'niosh-pg', 'cpr-numeric', 'tccc', 'hypothermia',
    'heat-illness',
  ].map((id) => [id, 'Removed in spec-v29 wave 29-2 (field-medicine reference card): this tile is no longer hosted by Sophie. Use the AHA wallet card, PHMSA ERG, NIOSH Pocket Guide, or your protocol app. The field-medicine calculators (peds-weight-dose, burn-fluid, naloxone, NEXUS, START triage, etc.) remain. See docs/spec-v29.md for the rationale.']),
  // Group K / O (wave 29-2 Group K/O PR): 8 reference-range and
  // wallet-card tiles.
  ...[
    'lab-ranges', 'lab-adult', 'lab-peds', 'tdm-levels', 'tox-levels',
    'high-alert', 'high-alert-card', 'iv-to-po',
  ].map((id) => [id, 'Removed in spec-v29 wave 29-2 (reference-range / wallet-card table): this tile is no longer hosted by Sophie. Use your institution\'s lab reference ranges, the ISMP high-alert list, or your formulary. The calculators that consume these thresholds inside their math (e.g. lab-interpret, NEWS2, abx-renal) remain. See docs/spec-v29.md for the rationale.']),
  // Group G non-scores (wave 29-2 Group G PR): 5 single-class clinical
  // reference tiles (Beers, peds-vitals, ASA, Mallampati, mRS). The
  // scoring tiles in Group G (NIHSS, CHA2DS2-VASc, Wells, etc.) remain.
  ...[
    'beers', 'peds-vitals', 'asa', 'mallampati', 'mrs',
  ].map((id) => [id, 'Removed in spec-v29 wave 29-2 (Group G single-class clinical reference): this tile is no longer hosted by Sophie. Use the upstream source (AGS Beers Criteria, PALS reference table, ASA Physical Status statement, the original Mallampati or Modified Rankin Scale publication) or your protocol. The Group G scoring calculators (NIHSS, CHA2DS2-VASc, Wells, GRACE, HEART, etc.) remain. See docs/spec-v29.md for the rationale.']),
]);

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

// spec-v29 §5.3: Nurse is the default-selected audience chip on first visit
// (nurse-first pivot). URL-hash persists divergence from this default.
const filterState = { audience: 'nurse' };


// spec-v29 §5.3: chips and back-end audience tokens are decoupled, but the
// prompt-ranker and synonym matcher still want a single audience hint per
// query. Map the active chip to its closest back-end audience tag.
const CHIP_TO_AUDIENCE_HINT = {
  all: 'all',
  nurse: 'clinicians',
  doctor: 'clinicians',
  pharmacist: 'clinicians',
  rt: 'clinicians',
  ems: 'field',
  'biller-coder': 'billers',
  educator: 'educators',
};




// spec-v11 §4.1: visible specialty / category labels. The letter is the
// legacy id retained inside UTILITIES entries so deep links keep working;
// the label is the visible name everywhere a user sees it.
const GROUP_LABELS = {
  A: 'Billing & Coding',
  // spec-v77 §3: the computational reimbursement/payment/edit group.
  B: 'Billing & Reimbursement',
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
  // spec-v52 §10.1: new top-level group for revenue-cycle / utilization
  // tiles. Ships with one tile (pa-lint) at v52-1b close.
  P: 'Revenue cycle & utilization',
};



// spec-v7 §3.2: in-memory cache of the loaded synonym table. Empty until
// loadSynonyms() resolves the curated synonym table at boot. Until it lands,
// SYNONYM_ENTRIES is empty and resolvePrompt() ranks on name/id tokens only, so
// the hero search degrades gracefully (synonyms are an accelerator, not a hard
// dependency).
let SYNONYM_ENTRIES = [];

// spec-v8 §4.3: assemble the tile corpus the synonym resolver reads.
// id / name / group / audiences come from UTILITIES; tags + specialties from
// META[id]. The per-tile description was scraped from the home tile-grid before
// spec-v51/v53 removed that grid, so desc is now empty -- the resolver ranks on
// name / id / tags / specialties, which is enough for synonym + token matching.
let TILE_CORPUS_CACHE = null;
function tileCorpus() {
  if (TILE_CORPUS_CACHE) return TILE_CORPUS_CACHE;
  TILE_CORPUS_CACHE = UTILITIES.map((u) => ({
    id: u.id,
    name: u.name,
    group: u.group,
    audiences: u.audiences || [],
    desc: '',
    tags: (META[u.id] && Array.isArray(META[u.id].tags)) ? META[u.id].tags : [],
    // spec-v11 §4.3: optional specialty tags, additive search tokens.
    specialties: (META[u.id] && Array.isArray(META[u.id].specialties)) ? META[u.id].specialties : [],
  }));
  return TILE_CORPUS_CACHE;
}

function audienceHint() {
  return CHIP_TO_AUDIENCE_HINT[filterState.audience] || 'all';
}




// ----- Routing -------------------------------------------------------------

const HOME_VIEW_HTML_ID = 'home-view-marker';

function getMain() {
  return document.getElementById('main');
}

// spec-v74: the "Skip to content" link targets #main, but this is a hash-routed
// SPA -- a bare href="#main" sets location.hash, the router reads route "main",
// finds no such tile, and calls restoreHome(). So on any tile the skip link
// ejected the user back to the home view (and focus landed on <body>, not the
// content) -- a WCAG 2.4.1 (Bypass Blocks) failure, worse than a no-op. Static
// pre-rendered pages don't load app.js, so their native #main anchor is fine;
// this handler scopes the fix to the SPA: move focus to the main landmark
// without touching the hash or the router.
function bindSkipLink() {
  const link = document.querySelector('.skip-link');
  if (!link) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const main = getMain();
    if (!main) return;
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
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
  // The home view is restored from a cloned snapshot, so the hero combobox
  // loses its event listeners -- re-bind them. The clone ships an empty input.
  bindHeroSearch();
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
  // Coalesce bursts of input/change events into a single replaceState call.
  // Restoration helpers (applyHashState, applyExample) dispatch one event per
  // field, which on a multi-field tile would otherwise produce N replaceState
  // calls back-to-back. WebKit caps replaceState at 100 calls per 10 seconds
  // across the page, so an unthrottled writer trips the limit when a test
  // walks every tool route in sequence. Also no-op when the produced hash
  // already matches the current one to avoid redundant history churn.
  let scheduled = false;
  const writeState = () => {
    if (scheduled) return;
    scheduled = true;
    const flush = () => {
      scheduled = false;
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
      const nextHash = patchHash({ state });
      if (nextHash !== window.location.hash) {
        window.history.replaceState(null, '', nextHash);
      }
    };
    if (typeof queueMicrotask === 'function') queueMicrotask(flush);
    else Promise.resolve().then(flush);
  };
  body.addEventListener('input', writeState);
  body.addEventListener('change', writeState);
}

// Append `str` to `parent`, turning any bare https:// URL it contains into
// a real clickable, privacy-safe anchor. The text is author-controlled
// (lib/meta.js citation strings), not user input, and every anchor is built
// with createElement + textContent (no raw-markup assignment) so the strict
// CSP and no-XSS posture hold. rel="noopener noreferrer" + the global
// no-referrer meta keep the outbound click from leaking where the reader
// came from.
function appendLinkified(parent, str) {
  const re = /https?:\/\/[^\s)]+/g;
  let last = 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > last) parent.appendChild(document.createTextNode(str.slice(last, m.index)));
    // Trailing sentence punctuation should stay as text, not part of the URL.
    let url = m[0];
    let trail = '';
    while (url && /[.,;]$/.test(url)) { trail = url.slice(-1) + trail; url = url.slice(0, -1); }
    parent.appendChild(el('a', {
      class: 'citation-inline-link', href: url, target: '_blank', rel: 'noopener noreferrer', text: url,
    }));
    if (trail) parent.appendChild(document.createTextNode(trail));
    last = m.index + m[0].length;
  }
  if (last < str.length) parent.appendChild(document.createTextNode(str.slice(last)));
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
    // Inline + detailed citation, with links where possible: bare URLs in
    // the citation text become clickable, and an optional structured
    // `citationUrl` (a permanent DOI or the publisher's canonical page)
    // renders as an explicit "Read the source" link after the reference.
    const p = el('p', { class: 'citation' });
    p.appendChild(document.createTextNode('Citation: '));
    appendLinkified(p, meta.citation);
    if (meta.citationUrl) {
      p.appendChild(document.createTextNode(' '));
      p.appendChild(el('a', {
        class: 'citation-link',
        href: meta.citationUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        text: 'Read the source ↗',
      }));
    }
    block.appendChild(p);
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

  // spec-v62 §2 A2: optional source-anchored "next step" (action) block. Renders
  // beneath interpretation under its own "Recommended next step (per source):"
  // header. Every line is the governing publication's verbatim recommendation
  // (never an order Sophie generates), with the source named below.
  if (meta.actions && Array.isArray(meta.actions.bands) && meta.actions.bands.length) {
    const actions = el('div', { class: 'actions', 'aria-label': 'Recommended next step per source' });
    actions.appendChild(el('p', { class: 'actions-header', text: 'Recommended next step (per source):' }));
    const alist = el('ul', { class: 'actions-bands' });
    for (const band of meta.actions.bands) {
      if (!band || !band.range || !band.step) continue;
      const item = el('li', { class: 'actions-band' });
      item.appendChild(el('span', { class: 'actions-range', text: String(band.range) }));
      item.appendChild(document.createTextNode(' - '));
      item.appendChild(el('span', { class: 'actions-text', text: String(band.step) }));
      alist.appendChild(item);
    }
    actions.appendChild(alist);
    if (meta.actions.source) actions.appendChild(el('p', { class: 'actions-source muted', text: `Source: ${meta.actions.source}` }));
    block.appendChild(actions);
  }

  if (meta.source) {
    const stamp = el('p', { class: 'source-stamp', text: `Source: ${meta.source.label} (loading version...)` });
    block.appendChild(stamp);
    fetchJson(`data/${meta.source.dataset}/manifest.json`).then((m) => {
      // When the dataset manifest carries a vetted sourceUrl (the agency's
      // canonical page, verified by the data pipeline), make the label a
      // clickable link so the citation points at its primary source.
      clear(stamp);
      stamp.appendChild(document.createTextNode('Source: '));
      if (m && m.sourceUrl) {
        stamp.appendChild(el('a', {
          class: 'source-link', href: m.sourceUrl, target: '_blank', rel: 'noopener noreferrer', text: meta.source.label,
        }));
      } else {
        stamp.appendChild(document.createTextNode(meta.source.label));
      }
      if (m && m.fetchDate) stamp.appendChild(document.createTextNode(`, fetched ${m.fetchDate}`));
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

  // spec-v61 §2 A2: related-tool linking. `META[id].related` lists sibling
  // tile ids; render each that resolves to a real, in-catalog tile as a hash
  // link so a nurse on `wells-pe` is one click from `perc` / `pesi`. Unknown
  // ids are silently skipped (the related-tools unit test pins that every
  // declared id resolves, so this is defensive, not a feature).
  if (Array.isArray(meta.related) && meta.related.length) {
    const seen = new Set();
    const links = [];
    for (const rid of meta.related) {
      if (rid === util.id || seen.has(rid)) continue;
      const target = UTILITIES.find((u) => u.id === rid);
      if (!target) continue;
      seen.add(rid);
      const a = el('a', { class: 'related-link', href: `#${rid}`, text: target.name });
      links.push(el('li', { class: 'related-item' }, [a]));
    }
    if (links.length) {
      const rel = el('nav', { class: 'related-tools', 'aria-label': 'Related tools' });
      rel.appendChild(el('p', { class: 'related-header', text: 'Related tools:' }));
      rel.appendChild(el('ul', { class: 'related-list' }, links));
      block.appendChild(rel);
    }
  }

  // spec-v2 section 3.2: a single "Copy all" button that grabs whatever the
  // results region currently shows. Per-result copy buttons live in the
  // utility renderers; this is the universal fallback. spec-v61 §2 A5: a
  // sibling "Copy link" button copies the deep link (hash-state already
  // encodes the inputs), so a populated calculation can be handed to a
  // colleague. No new persistence, no network.
  const copyLive = el('span', { class: 'copy-live visually-hidden', 'aria-live': 'polite', role: 'status' });
  const copyAllBtn = copyButton(() => {
    const res = document.getElementById('q-results') || document.getElementById('tool-body');
    return res ? (res.innerText || res.textContent || '') : '';
  }, { label: 'Copy all', live: copyLive });
  const copyLinkBtn = copyButton(() => location.href, { label: 'Copy link', live: copyLive });
  block.appendChild(el('p', { class: 'copy-row' }, [copyAllBtn, copyLinkBtn, copyLive]));

  // spec-v61 §2 A7: opt-in, client-only input persistence. Only shown on tiles
  // that actually have persistable (numeric/choice) inputs. Off by default;
  // checking it stores this tile's current values immediately, unchecking it
  // erases everything stored. No PHI free-text is ever persisted (see
  // lib/input-persist.js), and nothing leaves the device.
  const toolBody = document.getElementById('tool-body');
  if (toolBody && hasPersistableInputs(toolBody)) {
    const cb = el('input', { type: 'checkbox', class: 'remember-checkbox' });
    cb.checked = isRememberEnabled();
    cb.addEventListener('change', () => {
      setRememberEnabled(cb.checked);
      const tb = document.getElementById('tool-body');
      if (cb.checked && tb) saveInputs(util.id, tb);
    });
    const label = el('label', { class: 'remember-row' }, [
      cb,
      el('span', { class: 'remember-text', text: 'Remember my inputs on this device' }),
    ]);
    const note = el('span', {
      class: 'remember-note muted',
      text: 'Stored only in this browser. Numbers only, never free-text. Off by default; unchecking erases it.',
    });
    block.appendChild(el('p', { class: 'remember-line' }, [label, note]));
  }

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
        // spec-v61 §2 A7: opt-in remembered inputs fill fields the deep link
        // didn't set, and win over the example. The save listeners are always
        // attached; saveInputs() no-ops unless the toggle is on, so flipping
        // it on mid-session starts persisting from the next edit.
        const remembered = applySavedInputs(body, util.id, hashKeys);
        const save = () => saveInputs(util.id, body);
        body.addEventListener('input', save);
        body.addEventListener('change', save);
        const filled = applyExample(util, { skip: new Set([...hashKeys, ...remembered]) });
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
    // spec-v29 wave 29-2: removed-tile hashes show a one-line note above
    // the home view. The note is inserted on every navigation so that
    // following a removed-tile permalink always surfaces the explanation.
    if (REMOVED_V29_IDS.has(id)) {
      const main = getMain();
      if (main) {
        const note = el('p', {
          class: 'deprecation-notice',
          role: 'note',
          'aria-label': 'Removed tile',
          text: REMOVED_V29_IDS.get(id),
        });
        main.insertBefore(note, main.firstChild);
      }
    }
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


// spec-v53: the home-view search combobox. Mirrors the topbar search, with
// one difference: focusing the empty input lists the entire catalog A-Z so
// the bar doubles as the "browse all tools" affordance the retired
// tool-picker <select> used to provide. Typing narrows to the ranked top
// matches; click / Enter routes to the tile.
let heroSearchDocClickBound = false;
function bindHeroSearch() {
  const input = document.getElementById('hero-search');
  const list = document.getElementById('hero-search-results');
  if (!input || !list) return;

  let activeIndex = -1;
  let currentMatches = [];
  const ALL = UTILITIES.slice().sort((a, b) => a.name.localeCompare(b.name));

  function setExpanded(open) {
    input.setAttribute('aria-expanded', open ? 'true' : 'false');
    list.hidden = !open;
  }

  function setActive(idx) {
    const items = list.querySelectorAll('.hero-search-result');
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
    setActive(-1);
    input.blur();
    if (location.hash === '#' + util.id) {
      currentRouteId = null;
      route();
    } else {
      location.hash = '#' + util.id;
    }
  }

  // Empty query (e.g. on focus) lists the whole catalog A-Z; a typed query
  // returns the ranked top matches.
  function matchesFor(query) {
    const q = query.trim();
    if (!q) return ALL;
    const ranked = searchUtilities(q, 12);
    // spec-v7 §3.2: searchUtilities ranks on name/id only and is blind to the
    // curated synonym table and patient phrasing, so a query like "they denied
    // it" -> appeal-letter or "kidney function" -> egfr (which share no token
    // with the tile name) returned nothing useful or the wrong tile. Consult
    // resolvePrompt() (synonyms -> token ranker -> one-edit retry) and surface
    // its single best tile first so patient-mental-model queries resolve to the
    // right tool. resolvePrompt returns null below its threshold, so a
    // non-matching query simply falls back to the name/id ranking.
    const r = resolvePrompt(q, tileCorpus(), SYNONYM_ENTRIES, audienceHint());
    if (r && r.tileId && UTIL_BY_ID) {
      const u = UTIL_BY_ID.get(r.tileId);
      if (u) return [u, ...ranked.filter((x) => x.id !== u.id)].slice(0, 12);
    }
    return ranked;
  }

  function render(query) {
    clear(list);
    currentMatches = matchesFor(query);
    if (currentMatches.length === 0) {
      list.appendChild(el('li', { class: 'hero-search-empty', role: 'presentation', text: 'No tools match.' }));
      setExpanded(true);
      setActive(-1);
      return;
    }
    currentMatches.forEach((util, i) => {
      const item = el('li', {
        class: 'hero-search-result',
        role: 'option',
        id: `hero-search-result-${i}`,
        'data-tool': util.id,
        'aria-selected': 'false',
      }, [
        el('span', { class: 'hsr-name', text: util.name }),
        el('span', { class: 'hsr-group', text: GROUP_LABELS[util.group] || util.group }),
      ]);
      // mousedown so the route fires before the input-blur close handler.
      item.addEventListener('mousedown', (e) => { e.preventDefault(); navigateTo(util); });
      item.addEventListener('mouseenter', () => setActive(i));
      list.appendChild(item);
    });
    setExpanded(true);
    setActive(0);
  }

  input.addEventListener('focus', () => render(input.value));
  input.addEventListener('input', () => render(input.value));

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

  // Close on an outside click. Bound once at the document level (the hero
  // element itself is replaced on each restoreHome clone, so the handler
  // re-queries the live nodes by id rather than closing over them).
  if (!heroSearchDocClickBound) {
    heroSearchDocClickBound = true;
    document.addEventListener('click', (e) => {
      const inp = document.getElementById('hero-search');
      const lst = document.getElementById('hero-search-results');
      if (!inp || !lst) return;
      if (e.target === inp || lst.contains(e.target)) return;
      inp.setAttribute('aria-expanded', 'false');
      lst.hidden = true;
    });
  }
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
  // spec-v29 §5.3: a deep-linked #a=<audience> overrides the nurse-first
  // default and biases the synonym resolver's audience hint. The chip-filter
  // UI was removed in spec-v51/v53, so this only reads the hash now.
  const initial = parseHash(window.location.hash);
  if (initial.audience) filterState.audience = initial.audience;
  bindHeroSearch();
  bindSkipLink();
  installKeyboard();
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
